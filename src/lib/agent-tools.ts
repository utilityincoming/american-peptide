// Grounding tools for the research agent. Each tool queries a free public
// database (no API key) so the model can verify factual claims instead of
// recalling them. Every executor has a hard timeout and truncates its output
// so a slow or oversized upstream response cannot stall the request or blow up
// model context / cost.

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
  const cidData = await fetchJson(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/cids/JSON`,
  )
  const cid = pick(cidData, 'IdentifierList', 'CID', 0)
  if (cid == null) return `No PubChem compound found for "${name}".`
  const props = await fetchJson(
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
    ? raw.map((s) => ({
        nctId: pick(s, 'protocolSection', 'identificationModule', 'nctId') ?? null,
        title: pick(s, 'protocolSection', 'identificationModule', 'briefTitle') ?? null,
        status: pick(s, 'protocolSection', 'statusModule', 'overallStatus') ?? null,
        phases: pick(s, 'protocolSection', 'designModule', 'phases') ?? null,
        conditions: pick(s, 'protocolSection', 'conditionsModule', 'conditions') ?? null,
      }))
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
      default:
        return { content: `Unknown tool: ${name}`, isError: true }
    }
    return { content: truncate(out), isError: false }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'tool execution failed'
    return { content: `Tool "${name}" failed: ${msg}`, isError: true }
  }
}
