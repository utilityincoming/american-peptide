// Grounding tools for the research agent. Each tool queries a free public
// database (no API key) so the model can verify factual claims instead of
// recalling them. Every executor has a hard timeout and truncates its output
// so a slow or oversized upstream response cannot stall the request or blow up
// model context / cost.

import {
  computeBlend,
  computeCoaGrade,
  computeCostPerDose,
  computePharmacokinetics,
  computeReconstitution,
  computeVendorRank,
} from '@/lib/agent-compute'
import { pubchemFetch } from '@/lib/pubchem-fetch'

export interface AgentTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

// Descriptions are prescriptive about WHEN to call — Fable 5 reaches for tools
// conservatively, so the trigger condition lives in each description.
export const AGENT_TOOLS: AgentTool[] = [
  {
    name: 'search_pubchem',
    description:
      'Look up a chemical compound or peptide in PubChem to confirm its identity and physicochemical properties (PubChem CID, molecular formula, molecular weight, IUPAC name, SMILES). Call this whenever the user asks about a specific named compound and you are about to state its formula, weight, or chemical identity — verify with this tool rather than recalling values from memory.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Compound or peptide name to search, e.g. "setmelanotide" or "melanotan II".',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_clinical_trials',
    description:
      'Search ClinicalTrials.gov for registered human clinical trials by compound name or condition. Call this whenever the user asks about trial status, phase, or whether trials exist for a compound or indication, before stating any clinical-trial facts.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term: compound name, condition, or intervention.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_pubmed',
    description:
      'Search PubMed for published peer-reviewed literature. Call this when the user asks what published research or evidence exists for a compound or claim, or before asserting that specific studies were published.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Literature search query.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_uniprot',
    description:
      'Look up a PROTEIN or biologic in UniProt to confirm its identity, function, gene, organism, and amino-acid sequence/length. Use this for entities that have a protein record rather than a small-molecule PubChem CID: growth factors (EGF, bFGF/FGF2, IGF-1), endogenous peptide hormones, antibody *targets* (e.g. myostatin/GDF8, activin A), and gene products. Prefer this over search_pubchem when the subject is a gene/protein/growth-factor/biologic, and prefer it over recalling a sequence, length, or molecular function from memory.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Protein, gene, or biologic name, e.g. "myostatin", "GDF8", "EGF", "IGF-1".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'reconstitute_vial',
    description:
      'Compute reconstitution dilution for a peptide vial, an IU-standardized biologic, or a pre-filled GLP-1 pen: concentration (mcg/mL, mg/mL, and optional µM molar concentration if molecular weight or a catalog peptide is supplied, or IU/mL for biologics), U-100 syringe units, whole doses, and optional reverse-solve for water volume from target_draw_units. Call this whenever the user gives a vial mass/strength, a dose, and a volume of bacteriostatic water (or a target draw, or a pen fill volume) and wants the draw or concentration. Pass numbers only — do not calculate unit or concentration math yourself.',
    input_schema: {
      type: 'object',
      properties: {
        unit: {
          type: 'string',
          enum: ['mcg', 'iu'],
          description: 'Dose measurement: "mcg" for mg-vial peptides (default, supports molar), "iu" for IU-standardized biologics (HGH, HCG).',
        },
        form: {
          type: 'string',
          enum: ['vial', 'pen'],
          description: 'Container: "vial" for a reconstituted lyophilized vial (default), "pen" for a pre-filled GLP-1 pen already in solution (uses fill_ml, no water added). Pen is mcg only.',
        },
        vial_mg: { type: 'number', description: 'Peptide mass in the vial (or pen strength), in milligrams. Use for unit="mcg".' },
        dose_mcg: { type: 'number', description: 'Target amount per draw, in micrograms. Use for unit="mcg".' },
        vial_iu: { type: 'number', description: 'Biologic content of the vial, in international units. Use for unit="iu".' },
        dose_iu: { type: 'number', description: 'Target amount per draw, in international units. Use for unit="iu".' },
        water_ml: { type: 'number', description: 'Bacteriostatic water added, in milliliters (optional if target_draw_units is given; not used for pens).' },
        fill_ml: { type: 'number', description: 'Pre-filled pen solution volume in milliliters (form="pen" only).' },
        target_draw_units: {
          type: 'number',
          description: 'Optional target U-100 syringe units per draw to reverse-solve the required water_ml (vial form only).',
        },
        peptide: {
          type: 'string',
          description: 'Optional catalog peptide slug or name to resolve verified molecular weight for molar concentration (µM / nmol).',
        },
        molecular_weight_da: {
          type: 'number',
          description: 'Optional explicit molecular weight in Daltons (g/mol) for molar concentration.',
        },
        require_molar: {
          type: 'boolean',
          description: 'Set true when molarity (µM) or nmol is specifically requested, so missing molecular weight is reported cleanly.',
        },
      },
      required: ['dose_mcg'],
    },
  },
  {
    name: 'cost_per_dose',
    description:
      'Deterministic cost-per-dose and doses-per-vial from a vial mass (mg), a dose (mcg), and an optional vial price. Call this whenever the user asks how many doses a vial yields or what each dose costs. Never divide the vial price or dose count yourself.',
    input_schema: {
      type: 'object',
      properties: {
        vial_mg: { type: 'number', description: 'Peptide mass in the vial, in milligrams.' },
        dose_mcg: { type: 'number', description: 'Amount per dose, in micrograms.' },
        vial_cost: { type: 'number', description: 'Optional vial price to divide across the doses.' },
      },
      required: ['vial_mg', 'dose_mcg'],
    },
  },
  {
    name: 'screen_blend',
    description:
      'Deterministic post-reconstitution blend compatibility screen and shared-vial draw calculator. Screens 2–10 catalog peptides at a buffer pH (default 5.7) for opposite net charge, isoelectric point proximity, hydrophobicity (GRAVY), free cysteines, copper–thiol oxidation, fibril formation, and labeled syringe incompatibilities. When mass_mg, dose_mcg, and water_ml are provided, also computes the shared-vial draw volume, limiting dose count, and over-delivery percentages. Never compute blend ratios or compatibility yourself — call this tool.',
    input_schema: {
      type: 'object',
      properties: {
        peptides: {
          type: 'array',
          description: 'Peptides in the blend (each with a catalog slug or name, plus optional mass_mg and dose_mcg for shared-vial math).',
          items: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'Catalog peptide slug, e.g. "bpc-157" or "ghk-cu".' },
              name: { type: 'string', description: 'Peptide name if slug is not known.' },
              mass_mg: { type: 'number', description: 'Optional vial mass in mg transferred into the shared blend.' },
              dose_mcg: { type: 'number', description: 'Optional intended dose in mcg per draw for this component.' },
            },
          },
        },
        buffer_ph: {
          type: 'number',
          description: 'Optional buffer pH (0–14, defaults to 5.7 for bacteriostatic water).',
        },
        water_ml: {
          type: 'number',
          description: 'Optional total bacteriostatic water volume in mL when computing shared-vial blend draws.',
        },
      },
      required: ['peptides'],
    },
  },
  {
    name: 'peptide_half_life',
    description:
      'Look up the site half-life table for a catalog peptide (or pass an explicit hypothetical half_life_hours) and compute single-compartment pharmacokinetic estimates: time to steady state (97%), clearance time (97%), repeat-dose accumulation ratio, peak-to-trough ratio, and fraction remaining at elapsed_hours. Call this before stating a half-life, dosing interval, accumulation, decay, or time-to-steady-state. Never compute exponential decay or accumulation math yourself.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Catalog peptide name or slug, e.g. "semaglutide".' },
        half_life_hours: {
          type: 'number',
          description: 'Optional explicit hypothetical half-life in hours for single-compartment PK math.',
        },
        interval_hours: {
          type: 'number',
          description: 'Optional repeat-dose interval in hours, to compute accumulation and peak-to-trough ratio.',
        },
        elapsed_hours: {
          type: 'number',
          description: 'Optional hours elapsed since a single dose, to compute fraction and percent remaining.',
        },
      },
    },
  },
  {
    name: 'rank_vendors',
    description:
      'Rank directory vendors for a catalog peptide by the site trust score (COA, third-party testing, reship, refund). Call this when the user asks where to source a compound or which vendor ranks higher. Quote only vendors and scores this tool returns.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Catalog peptide name.' },
      },
      required: ['name'],
    },
  },
  {
    name: 'grade_coa',
    description:
      'Grade a pasted certificate of analysis against the site transparency checklist and cross-check claimed chemistry with the catalog. Call this when the user pastes COA text and asks if it is complete, what is missing, or whether the mass matches.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The certificate text the user pasted.' },
      },
      required: ['text'],
    },
  },
]

const TOOL_TIMEOUT_MS = 8000
const MAX_TOOL_RESULT_CHARS = 6000

function truncate(s: string, max = MAX_TOOL_RESULT_CHARS): string {
  return s.length > max ? s.slice(0, max) + '\n…[truncated]' : s
}

async function fetchJson(url: string): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TOOL_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// PubChem gets its own door: shared rate limiting + retry on throttling, which
// the other upstreams (ClinicalTrials, PubMed) neither need nor should share a
// budget with. See lib/pubchem-fetch.ts.
async function fetchPubchemJson(url: string): Promise<unknown> {
  const res = await pubchemFetch(url, { timeoutMs: TOOL_TIMEOUT_MS })
  if (!res?.ok) throw new Error(`HTTP ${res?.status ?? 'throttled'}`)
  return await res.json()
}

// Narrow helper: read a nested path defensively from an unknown JSON value.
function pick(obj: unknown, ...keys: (string | number)[]): unknown {
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string | number, unknown>)[k]
  }
  return cur
}

async function searchPubchem(name: string): Promise<string> {
  const enc = encodeURIComponent(name)
  // Two calls per lookup — this pair is why pacing had to move to the request
  // level: they fire back-to-back, so a per-peptide sleep never saw them.
  const cidData = await fetchPubchemJson(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/cids/JSON`,
  )
  const cid = pick(cidData, 'IdentifierList', 'CID', 0)
  if (cid == null) return `No PubChem compound found for "${name}".`
  const props = await fetchPubchemJson(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`,
  )
  const p = pick(props, 'PropertyTable', 'Properties', 0) as Record<string, unknown> | undefined
  return JSON.stringify({
    source: 'PubChem',
    cid,
    molecularFormula: p?.MolecularFormula ?? null,
    molecularWeight: p?.MolecularWeight ?? null,
    iupacName: p?.IUPACName ?? null,
    smiles: p?.CanonicalSMILES ?? null,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
  })
}

async function searchTrials(query: string): Promise<string> {
  const enc = encodeURIComponent(query)
  const data = await fetchJson(
    `https://clinicaltrials.gov/api/v2/studies?query.term=${enc}&pageSize=5`,
  )
  const raw = pick(data, 'studies')
  const studies = Array.isArray(raw)
    ? raw.map((s) => {
        const nctId = (pick(s, 'protocolSection', 'identificationModule', 'nctId') as string) ?? null
        return {
          nctId,
          title: pick(s, 'protocolSection', 'identificationModule', 'briefTitle') ?? null,
          status: pick(s, 'protocolSection', 'statusModule', 'overallStatus') ?? null,
          phases: pick(s, 'protocolSection', 'designModule', 'phases') ?? null,
          conditions: pick(s, 'protocolSection', 'conditionsModule', 'conditions') ?? null,
          // Canonical link, for parity with the PubChem/PubMed tools — gives the
          // model a verifiable URL to cite so it surfaces the NCT id, not just a title.
          url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : null,
        }
      })
    : []
  if (studies.length === 0) return `No ClinicalTrials.gov studies found for "${query}".`
  return JSON.stringify({ source: 'ClinicalTrials.gov', count: studies.length, studies })
}

async function searchPubmed(query: string): Promise<string> {
  const enc = encodeURIComponent(query)
  const search = await fetchJson(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${enc}&retmax=5&retmode=json`,
  )
  const idsRaw = pick(search, 'esearchresult', 'idlist')
  const ids = Array.isArray(idsRaw) ? (idsRaw as string[]) : []
  if (ids.length === 0) return `No PubMed results for "${query}".`
  const sum = await fetchJson(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
  )
  const articles = ids.map((id) => {
    const r = pick(sum, 'result', id) as Record<string, unknown> | undefined
    const authors = pick(r, 'authors')
    return {
      pmid: id,
      title: r?.title ?? null,
      source: r?.source ?? null,
      pubdate: r?.pubdate ?? null,
      authors: Array.isArray(authors)
        ? authors.slice(0, 4).map((a) => (a as Record<string, unknown>).name)
        : null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    }
  })
  return JSON.stringify({ source: 'PubMed', count: articles.length, articles })
}

// UniProt grounding for proteins/biologics — the identity layer PubChem can't
// provide (growth factors, antibody targets, endogenous peptides). Restricted to
// reviewed (Swiss-Prot) entries to avoid unreviewed TrEMBL noise.
async function searchUniprot(query: string): Promise<string> {
  const enc = encodeURIComponent(`${query} AND reviewed:true`)
  const data = await fetchJson(
    `https://rest.uniprot.org/uniprotkb/search?query=${enc}&format=json&size=3&fields=accession,id,protein_name,gene_primary,organism_name,length,cc_function,sequence`,
  )
  const results = pick(data, 'results')
  const entries = Array.isArray(results)
    ? results.slice(0, 3).map((r) => {
        const acc = pick(r, 'primaryAccession') as string | undefined
        let functionText: string | null = null
        const comments = pick(r, 'comments')
        if (Array.isArray(comments)) {
          const fn = comments.find((c) => pick(c, 'commentType') === 'FUNCTION')
          const t = pick(fn, 'texts', 0, 'value')
          if (typeof t === 'string') functionText = t.slice(0, 400)
        }
        const seq = pick(r, 'sequence', 'value')
        return {
          accession: acc ?? null,
          name:
            (pick(r, 'proteinDescription', 'recommendedName', 'fullName', 'value') as string) ??
            (pick(r, 'uniProtkbId') as string) ??
            null,
          gene: pick(r, 'genes', 0, 'geneName', 'value') ?? null,
          organism: pick(r, 'organism', 'scientificName') ?? null,
          length: pick(r, 'sequence', 'length') ?? null,
          function: functionText,
          sequence: typeof seq === 'string' ? (seq.length > 120 ? seq.slice(0, 120) + '…' : seq) : null,
          url: acc ? `https://www.uniprot.org/uniprotkb/${acc}` : null,
        }
      })
    : []
  if (entries.length === 0) return `No reviewed UniProt entry found for "${query}".`
  return JSON.stringify({ source: 'UniProt', count: entries.length, entries })
}

export async function executeAgentTool(
  name: string,
  input: Record<string, unknown>,
): Promise<{ content: string; isError: boolean }> {
  try {
    let out: string
    switch (name) {
      case 'search_pubchem':
        out = await searchPubchem(String(input.name ?? ''))
        break
      case 'search_clinical_trials':
        out = await searchTrials(String(input.query ?? ''))
        break
      case 'search_pubmed':
        out = await searchPubmed(String(input.query ?? ''))
        break
      case 'search_uniprot':
        out = await searchUniprot(String(input.query ?? ''))
        break
      case 'reconstitute_vial':
        out = computeReconstitution(input)
        break
      case 'cost_per_dose':
        out = computeCostPerDose(input)
        break
      case 'screen_blend':
        out = computeBlend(input)
        break
      case 'peptide_half_life':
        out = computePharmacokinetics(input)
        break
      case 'rank_vendors':
        out = computeVendorRank(input)
        break
      case 'grade_coa':
        out = computeCoaGrade(input)
        break
      default:
        return { content: `Unknown tool: ${name}`, isError: true }
    }
    return { content: truncate(out), isError: false }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'tool execution failed'
    return { content: `Tool "${name}" failed: ${msg}`, isError: true }
  }
}
