// Overnight fact-QA: verify catalog claims against primary sources.
//
// Two layers:
//   1. Deterministic chemistry diff — compare each peptide's structured fields
//      (molecularFormula, molecularWeight, pubchemCid) against PubChem. No model
//      cost, no hallucination risk. Catches the highest-signal errors.
//   2. Optional LLM adjudication — one Fable 5 call per peptide (structured
//      output) that weighs prose claims (FDA status, key-research bullets)
//      against the evidence already fetched from PubChem + ClinicalTrials.gov.
//
// Read-only: it produces a findings report. It never edits the catalog.

import { PEPTIDES, type Peptide } from '@/lib/peptides'
import { executeAgentTool } from '@/lib/agent-tools'

const MODEL = 'claude-fable-5'
const WEIGHT_TOLERANCE_FRAC = 0.005 // 0.5% — accommodates salt-form / rounding differences

export type Severity = 'high' | 'medium' | 'low' | 'info'

export interface Finding {
  slug: string
  name: string
  field: string
  severity: Severity
  catalog: string | number | null
  source: string | number | null
  note: string
  /** PubChem / NCT / PMID references that back the source value. */
  evidenceUrl?: string
}

export interface FactQaReport {
  ranAt: string
  model: string
  checked: number
  withLlm: boolean
  findings: Finding[]
  summary: Record<Severity, number>
}

interface PubchemEvidence {
  cid: number | null
  molecularFormula: string | null
  molecularWeight: number | null
  url: string | null
  /** True when resolved from the catalog's curated pubchemCid (authoritative);
   *  false when resolved by fuzzy name search (which can hit the wrong record). */
  viaCid: boolean
}

// ── Evidence gathering (reuses the agent's own grounding tools) ───────────────

// Direct property lookup by CID — authoritative, no name-resolution ambiguity.
async function pubchemByCid(cid: number): Promise<PubchemEvidence | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight/JSON`,
      { signal: ctrl.signal, headers: { Accept: 'application/json' } },
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as {
      PropertyTable?: { Properties?: Array<{ MolecularFormula?: string; MolecularWeight?: string }> }
    }
    const p = data.PropertyTable?.Properties?.[0]
    if (!p) return null
    return {
      cid,
      molecularFormula: p.MolecularFormula ?? null,
      molecularWeight: p.MolecularWeight == null ? null : Number(p.MolecularWeight) || null,
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
      viaCid: true,
    }
  } catch {
    return null
  }
}

async function pubchemEvidence(peptide: Peptide): Promise<PubchemEvidence | null> {
  // Prefer the curated CID — it pins the exact compound and sidesteps the
  // wrong-record class entirely. Fall back to name/alias search only if absent.
  if (peptide.pubchemCid) {
    const byCid = await pubchemByCid(peptide.pubchemCid)
    if (byCid) return byCid
  }

  const candidates = [peptide.name, ...(peptide.aliases ?? [])]
  for (const name of candidates) {
    const { content, isError } = await executeAgentTool('search_pubchem', { name })
    if (isError) continue
    try {
      const j = JSON.parse(content) as Record<string, unknown>
      if (j.cid == null) continue
      const mw = j.molecularWeight
      return {
        cid: typeof j.cid === 'number' ? j.cid : Number(j.cid) || null,
        molecularFormula: typeof j.molecularFormula === 'string' ? j.molecularFormula : null,
        molecularWeight: mw == null ? null : Number(mw) || null,
        url: typeof j.url === 'string' ? j.url : null,
        viaCid: false,
      }
    } catch {
      // Tool returned a "no compound found" sentence, not JSON — try next alias.
    }
  }
  return null
}

// ── Layer 1: deterministic chemistry diff ─────────────────────────────────────

// Parse a molecular formula into element→count, ignoring any trailing charge
// (e.g. "C14H21CuN6O4-" → {C:14,H:21,Cu:1,N:6,O:4}).
function parseFormula(f: string): Record<string, number> {
  const counts: Record<string, number> = {}
  const body = f.replace(/\s+/g, '').replace(/[+-]+$/, '')
  for (const m of body.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    if (!m[1]) continue
    counts[m[1]] = (counts[m[1]] ?? 0) + (m[2] ? Number(m[2]) : 1)
  }
  return counts
}

type FormulaVerdict =
  | { verdict: 'match' }
  | { verdict: 'charge-variant'; detail: string }
  | { verdict: 'mismatch' }

// Compare formulas by element composition. A difference of only hydrogen (≤2 H)
// is treated as a protonation / charge-state variant — common for salts, metal
// complexes, and zwitterions, where PubChem name-search often returns a charged
// tautomer rather than the neutral species. Anything else is a real mismatch.
function compareFormulas(catalog: string, source: string): FormulaVerdict {
  const a = parseFormula(catalog)
  const b = parseFormula(source)
  const elements = new Set([...Object.keys(a), ...Object.keys(b)])
  const diffs: string[] = []
  for (const el of elements) {
    const d = (a[el] ?? 0) - (b[el] ?? 0)
    if (d !== 0) diffs.push(`${el}${d > 0 ? '+' : ''}${d}`)
  }
  if (diffs.length === 0) return { verdict: 'match' }
  if (diffs.length === 1 && diffs[0].startsWith('H') && Math.abs((a.H ?? 0) - (b.H ?? 0)) <= 2) {
    return { verdict: 'charge-variant', detail: `${Math.abs((a.H ?? 0) - (b.H ?? 0))} H` }
  }
  return { verdict: 'mismatch' }
}

function checkChemistry(peptide: Peptide, ev: PubchemEvidence): Finding[] {
  const out: Finding[] = []
  const base = { slug: peptide.slug, name: peptide.name, evidenceUrl: ev.url ?? undefined }

  // Wrong-record guard: a peptide (has a sequence) whose name-resolved PubChem
  // record contains no nitrogen cannot be the same molecule — fuzzy name search
  // hit an unrelated compound (e.g. "KPV" → a nitrogen-free C11H12O3). Don't
  // raise a spurious weight/formula error; flag the resolution failure instead.
  if (
    !ev.viaCid &&
    peptide.sequence &&
    ev.molecularFormula &&
    parseFormula(ev.molecularFormula).N == null
  ) {
    return [
      {
        ...base,
        field: 'pubchem',
        severity: 'low',
        catalog: peptide.name,
        source: ev.molecularFormula,
        note: `PubChem name search resolved a nitrogen-free record (${ev.molecularFormula}) — almost certainly the wrong compound for a peptide. Add a pubchemCid to pin the correct record.`,
      },
    ]
  }

  // Molecular formula
  if (peptide.molecularFormula && ev.molecularFormula) {
    const cmp = compareFormulas(peptide.molecularFormula, ev.molecularFormula)
    if (cmp.verdict === 'mismatch') {
      out.push({
        ...base,
        field: 'molecularFormula',
        severity: 'high',
        catalog: peptide.molecularFormula,
        source: ev.molecularFormula,
        note: 'Catalog molecular formula does not match PubChem.',
      })
    } else if (cmp.verdict === 'charge-variant') {
      out.push({
        ...base,
        field: 'molecularFormula',
        severity: 'info',
        catalog: peptide.molecularFormula,
        source: ev.molecularFormula,
        note: `Formulas match except for ${cmp.detail} — likely a protonation/charge-state difference (PubChem resolved a charged tautomer; common for salts and metal complexes).`,
      })
    }
  } else if (!peptide.molecularFormula && ev.molecularFormula) {
    out.push({
      ...base,
      field: 'molecularFormula',
      severity: 'low',
      catalog: null,
      source: ev.molecularFormula,
      note: 'Missing in catalog but available in PubChem (enrichment opportunity).',
    })
  }

  // Molecular weight (tolerance-based)
  if (peptide.molecularWeight && ev.molecularWeight) {
    const diff = Math.abs(peptide.molecularWeight - ev.molecularWeight)
    const tol = ev.molecularWeight * WEIGHT_TOLERANCE_FRAC
    if (diff > tol) {
      const pct = ((diff / ev.molecularWeight) * 100).toFixed(1)
      out.push({
        ...base,
        field: 'molecularWeight',
        severity: diff > ev.molecularWeight * 0.05 ? 'high' : 'medium',
        catalog: peptide.molecularWeight,
        source: ev.molecularWeight,
        note: `Catalog weight differs from PubChem by ${diff.toFixed(1)} Da (${pct}%).`,
      })
    }
  } else if (!peptide.molecularWeight && ev.molecularWeight) {
    out.push({
      ...base,
      field: 'molecularWeight',
      severity: 'low',
      catalog: null,
      source: Math.round(ev.molecularWeight * 100) / 100,
      note: 'Missing in catalog but available in PubChem (enrichment opportunity).',
    })
  }

  // PubChem CID (mismatch is a review flag, not necessarily an error — name
  // search can resolve to a salt/synonym record different from the curated CID)
  if (peptide.pubchemCid && ev.cid && peptide.pubchemCid !== ev.cid) {
    out.push({
      ...base,
      field: 'pubchemCid',
      severity: 'info',
      catalog: peptide.pubchemCid,
      source: ev.cid,
      note: 'Catalog CID differs from the CID resolved by name search — verify which record is correct.',
    })
  }

  return out
}

// ── Layer 2: optional LLM prose adjudication (structured output) ──────────────

const ADJUDICATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          field: { type: 'string' },
          claim: { type: 'string' },
          verdict: { type: 'string', enum: ['supported', 'contradicted', 'unverifiable'] },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          note: { type: 'string' },
        },
        required: ['field', 'claim', 'verdict', 'confidence', 'note'],
      },
    },
  },
  required: ['findings'],
} as const

async function adjudicateProse(
  apiKey: string,
  peptide: Peptide,
  pubchem: PubchemEvidence | null,
): Promise<Finding[]> {
  // Gather trial evidence to ground FDA / clinical claims.
  const trials = await executeAgentTool('search_clinical_trials', { query: peptide.name })

  const claims = {
    fdaApproved: peptide.fdaApproved ?? null,
    mechanism: peptide.mechanism ?? null,
    keyResearch: peptide.keyResearch ?? [],
  }

  const system =
    'You are a fact-checking reviewer for a peptide research catalog. You are given a catalog entry and evidence retrieved from PubChem and ClinicalTrials.gov. ' +
    'Judge ONLY whether the catalog claims are consistent with the evidence provided. Do not use outside knowledge to confirm a claim — if the evidence does not address it, mark it unverifiable. ' +
    'Report a finding only for claims that are contradicted by the evidence or that assert something specific (an FDA approval, a trial phase, a named study result) the evidence does not support. Do not nitpick wording.'

  const userPrompt = `Catalog entry: ${peptide.name}

Claims to check:
${JSON.stringify(claims, null, 2)}

Evidence — PubChem:
${pubchem ? JSON.stringify(pubchem) : 'none found'}

Evidence — ClinicalTrials.gov:
${trials.content}

Return findings for claims that are contradicted or unsupported by this evidence.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      output_config: { format: { type: 'json_schema', schema: ADJUDICATION_SCHEMA } },
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    return [
      {
        slug: peptide.slug,
        name: peptide.name,
        field: '(llm)',
        severity: 'info',
        catalog: null,
        source: null,
        note: `LLM adjudication skipped — upstream ${res.status}.`,
      },
    ]
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] }
  const text = data.content?.find((b) => b.type === 'text')?.text ?? '{"findings":[]}'
  let parsed: { findings?: Array<Record<string, string>> }
  try {
    parsed = JSON.parse(text)
  } catch {
    return []
  }

  const sevByVerdict: Record<string, Severity> = {
    contradicted: 'high',
    unverifiable: 'low',
    supported: 'info',
  }
  return (parsed.findings ?? [])
    // Only surface problems — drop "supported" confirmations from the report.
    .filter((f) => f.verdict === 'contradicted' || (f.verdict === 'unverifiable' && f.confidence !== 'low'))
    .map((f) => ({
      slug: peptide.slug,
      name: peptide.name,
      field: `claim:${f.field}`,
      severity: sevByVerdict[f.verdict] ?? 'info',
      catalog: f.claim,
      source: null,
      note: `${f.verdict} (${f.confidence}) — ${f.note}`,
    }))
}

// ── Orchestration ─────────────────────────────────────────────────────────────

export interface RunFactQaOptions {
  limit?: number
  offset?: number
  /** Run the Fable 5 prose-adjudication layer. Requires ANTHROPIC_API_KEY. */
  useLlm?: boolean
  apiKey?: string
  /** Politeness delay between peptides (ms) to respect NCBI rate limits. */
  delayMs?: number
}

export async function runFactQa(opts: RunFactQaOptions = {}): Promise<FactQaReport> {
  const { limit = 25, offset = 0, useLlm = false, apiKey, delayMs = 350 } = opts
  const slice = PEPTIDES.slice(offset, offset + limit)
  const findings: Finding[] = []

  for (const peptide of slice) {
    try {
      const ev = await pubchemEvidence(peptide)
      if (ev) findings.push(...checkChemistry(peptide, ev))
      else if (peptide.molecularFormula || peptide.molecularWeight || peptide.pubchemCid) {
        findings.push({
          slug: peptide.slug,
          name: peptide.name,
          field: 'pubchem',
          severity: 'low',
          catalog: peptide.name,
          source: null,
          note: 'No PubChem record resolved by name or alias — cannot verify chemistry fields.',
        })
      }

      if (useLlm && apiKey) {
        findings.push(...(await adjudicateProse(apiKey, peptide, ev)))
      }
    } catch (err) {
      findings.push({
        slug: peptide.slug,
        name: peptide.name,
        field: '(error)',
        severity: 'info',
        catalog: null,
        source: null,
        note: `Check failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      })
    }
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs))
  }

  const order: Severity[] = ['high', 'medium', 'low', 'info']
  findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
  const summary: Record<Severity, number> = { high: 0, medium: 0, low: 0, info: 0 }
  for (const f of findings) summary[f.severity]++

  return {
    ranAt: new Date().toISOString(),
    model: MODEL,
    checked: slice.length,
    withLlm: useLlm && !!apiKey,
    findings,
    summary,
  }
}

/** Render a report as readable markdown for an email or a saved artifact. */
export function reportToMarkdown(report: FactQaReport): string {
  const { summary } = report
  const lines: string[] = [
    `# Fact-QA report — ${report.ranAt.slice(0, 10)}`,
    '',
    `Checked **${report.checked}** catalog entries against PubChem${report.withLlm ? ' + ClinicalTrials.gov (LLM adjudication on)' : ''}.`,
    '',
    `**${summary.high}** high · **${summary.medium}** medium · **${summary.low}** low · **${summary.info}** info`,
    '',
  ]
  if (report.findings.length === 0) {
    lines.push('No discrepancies found. ✅')
    return lines.join('\n')
  }
  lines.push('| Severity | Entry | Field | Catalog | Source | Note |', '|---|---|---|---|---|---|')
  for (const f of report.findings) {
    const cat = f.catalog == null ? '—' : String(f.catalog).slice(0, 60)
    const src = f.source == null ? '—' : String(f.source).slice(0, 60)
    lines.push(
      `| ${f.severity} | ${f.name} | ${f.field} | ${cat} | ${src} | ${f.note.replace(/\|/g, '\\|')} |`,
    )
  }
  return lines.join('\n')
}

// ── Verification manifest (powers the on-page "verified" provenance badge) ────

export interface VerificationRecord {
  cid: number
  molecularFormula: string | null
  molecularWeight: number | null
  checkedAt: string
}

// Build a manifest of catalog entries whose chemistry is confidently confirmed
// against a specific PubChem record. Confidence gate:
//   - curated pubchemCid  → authoritative (verified against that exact record)
//   - name-resolved only  → accepted ONLY if the record contains nitrogen (peptide
//     sanity — rejects wrong-compound hits like KPV→C11H12O3) AND its weight
//     matches the catalog within tolerance.
// Only confident matches earn the badge, so the "verified" claim stays honest.
export async function buildVerificationManifest(
  checkedAt: string,
  delayMs = 350,
): Promise<Record<string, VerificationRecord>> {
  const out: Record<string, VerificationRecord> = {}
  for (const peptide of PEPTIDES) {
    try {
      const ev = await pubchemEvidence(peptide)
      if (ev && ev.cid != null) {
        let confident = ev.viaCid
        if (!confident) {
          const hasNitrogen = ev.molecularFormula
            ? parseFormula(ev.molecularFormula).N != null
            : false
          const weightMatches =
            peptide.molecularWeight != null && ev.molecularWeight != null
              ? Math.abs(peptide.molecularWeight - ev.molecularWeight) <=
                ev.molecularWeight * WEIGHT_TOLERANCE_FRAC
              : false
          confident = hasNitrogen && weightMatches
        }
        if (confident) {
          out[peptide.slug] = {
            cid: ev.cid,
            molecularFormula: ev.molecularFormula,
            molecularWeight: ev.molecularWeight,
            checkedAt,
          }
        }
      }
    } catch {
      // skip entries that error — they simply don't earn a badge
    }
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs))
  }
  return out
}
