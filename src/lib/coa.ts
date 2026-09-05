// COA decoder + transparency grader.
//
// A Certificate of Analysis (COA) is the document that should let you trust a
// powder you cannot see into. This engine reads pasted COA text, explains every
// field in plain English, grades the COA against a transparency checklist (the
// seed of "the American Peptide Standard"), flags the gaps that gray-market
// COAs hide, and — when it recognizes the peptide — cross-checks the claimed
// chemistry against our verified catalog data.
//
// Pure functions, rule-based: no LLM, no network, no credits. The explanations
// ARE the product — COA literacy for researchers who reconstitute and inject.

import { PEPTIDES, type Peptide, type SyntheticFeature } from './peptides'
import { getPubchemVerification } from './verification'

export type FieldStatus = 'good' | 'warn' | 'missing' | 'info'

export interface CoaField {
  key: string
  label: string
  found: boolean
  value: string | null
  /** What this field means / why a researcher should care. */
  explanation: string
  /** Specific read on the extracted value, when notable. */
  note?: string
  status: FieldStatus
  /** Contribution to the transparency score when present. */
  weight: number
  /** Concrete next step when this item is missing or weak (what to ask for). */
  action?: string
}

export interface CatalogCheck {
  field: 'molecularWeight' | 'molecularFormula' | 'sequence' | 'cas'
  label: string
  claimed: string
  reference: string
  verdict: 'match' | 'mismatch' | 'unverified'
  note: string
}

/**
 * A peptide-specific analytical check implied by a synthetic feature. Mass spec
 * confirms the target mass but not, say, correct disulfide pairing or the
 * acyl:des-acyl ratio — so these are the tests that actually matter for THIS
 * molecule. Advisory and educational: they do not change the transparency score.
 */
export interface FeatureCheck {
  feature: SyntheticFeature
  label: string
  /** Why this test matters for this peptide, in plain English. */
  whatToCheck: string
  /** Whether the COA text appears to mention the relevant test. */
  mentioned: boolean
  status: 'good' | 'warn'
  /** Concrete ask when not mentioned. */
  action: string
}

export interface CoaReport {
  detectedPeptide: { slug: string; name: string; verifiedInCatalog: boolean } | null
  fields: CoaField[]
  catalogChecks: CatalogCheck[]
  /** Peptide-specific tests implied by the molecule's synthetic features. */
  featureChecks: FeatureCheck[]
  redFlags: string[]
  missing: string[]
  /** A ready-to-send sentence asking the supplier for what's missing. */
  supplierRequest: string
  score: {
    points: number
    max: number
    percent: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
  }
}

// ── Small extraction helpers ──────────────────────────────────────────────────

function firstMatch(text: string, re: RegExp): RegExpMatchArray | null {
  return text.match(re)
}

function num(s: string | undefined | null): number | null {
  if (!s) return null
  const n = Number(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

// ── Peptide detection (longest name/alias/slug hit wins) ──────────────────────

function detectPeptide(text: string): Peptide | null {
  const lower = text.toLowerCase()
  let best: Peptide | null = null
  let bestLen = 0
  for (const p of PEPTIDES) {
    const candidates = [p.name.replace(/\s*\(.*?\)\s*/g, ' ').trim(), ...(p.aliases ?? []), p.slug.replace(/-/g, ' ')]
    for (const cand of candidates) {
      const c = cand.toLowerCase().trim()
      if (c.length >= 4 && lower.includes(c) && c.length > bestLen) {
        best = p
        bestLen = c.length
      }
    }
  }
  return best
}

// ── Field detectors ───────────────────────────────────────────────────────────
// Each returns the raw extracted value (or null) and a status read.

function detectPurity(text: string): { value: string | null; pct: number | null } {
  // Prefer a percentage explicitly tied to purity or HPLC.
  const m =
    firstMatch(text, /purity[^%\d]{0,20}([><≥=]?\s*\d{1,3}(?:\.\d+)?)\s*%/i) ||
    firstMatch(text, /([><≥=]?\s*\d{2,3}(?:\.\d+)?)\s*%[^%]{0,18}(?:by\s*)?(?:rp[-\s]?)?hplc/i)
  if (!m) return { value: null, pct: null }
  return { value: m[1].replace(/\s+/g, ''), pct: num(m[1].replace(/[><≥=]/g, '')) }
}

function hasMassSpec(text: string): { found: boolean; value: string | null } {
  if (!/\b(mass\s*spec|ms\b|esi|maldi|lc[-\s]?ms|\[m\s*\+\s*h\]|m\/z|exact mass|observed mass|found mass)/i.test(text)) {
    return { found: false, value: null }
  }
  const m = firstMatch(text, /(?:observed|found|measured|exact)[^\d]{0,20}(\d{3,6}(?:\.\d+)?)/i)
  return { found: true, value: m ? m[1] : null }
}

function detectPeptideContent(text: string): { value: string | null; pct: number | null } {
  const m = firstMatch(text, /(?:net\s*)?peptide\s*content[^%\d]{0,20}([><≥=]?\s*\d{1,3}(?:\.\d+)?)\s*%/i)
  if (!m) return { value: null, pct: null }
  return { value: m[1].replace(/\s+/g, ''), pct: num(m[1].replace(/[><≥=]/g, '')) }
}

function detectWater(text: string): string | null {
  const m = firstMatch(text, /(?:water\s*content|karl\s*fischer|moisture)[^%\d]{0,20}(\d{1,2}(?:\.\d+)?)\s*%/i)
  return m ? `${m[1]}%` : null
}

function detectCounterion(text: string): string | null {
  const m = firstMatch(text, /(acetate|tfa|trifluoroacetate|trifluoroacetic|counter[-\s]?ion)\b[^%\d]{0,20}(\d{1,2}(?:\.\d+)?\s*%)?/i)
  if (!m) return null
  return m[2] ? `${m[1]} ${m[2].trim()}` : (m[1] as string)
}

function detectEndotoxin(text: string): string | null {
  const m = firstMatch(text, /(?:endotoxin|bacterial\s*endotoxin|lal)[^\d<]{0,20}([<]?\s*\d+(?:\.\d+)?)\s*(eu)/i)
  if (m) return `${m[1].replace(/\s+/g, '')} ${m[2].toUpperCase()}`
  return /steril(e|ity)/i.test(text) ? 'sterility stated' : null
}

function detectLotAndDates(text: string): string | null {
  const lot = firstMatch(text, /(?:lot|batch)\s*(?:no\.?|number|#)?[:\s]*([A-Za-z0-9][A-Za-z0-9\-]{2,})/i)
  const date = /(manufactur|production|date of analysis|test\s*date|re-?test|expir|valid\s*until|valid\s*through)/i.test(text)
  if (lot && date) return `lot ${lot[1]} + dated`
  if (lot) return `lot ${lot[1]}`
  if (date) return 'dated'
  return null
}

function hasMethods(text: string): boolean {
  // Evidence the COA names HOW it tested, not just numbers.
  return /(rp[-\s]?hplc|hplc|karl\s*fischer|maldi|esi[-\s]?ms|lc[-\s]?ms|method[:\s])/i.test(text)
}

function detectClaimedMW(text: string): { value: number; source: string } | null {
  // A labeled molecular weight is the cleanest signal…
  const mw = firstMatch(
    text,
    /(?:molecular\s*weight|mol(?:\.|ecular)?\s*wt\.?|\bm\.?w\.?\b)[:\s~=]*([\d,]+(?:\.\d+)?)\s*(?:g\/mol|da|dalton)?/i,
  )
  if (mw && num(mw[1]) != null) return { value: num(mw[1]) as number, source: 'molecular weight' }
  // …but most COAs state an MS observed/exact mass instead, which is just as
  // good for an identity cross-check (±1 Da for an [M+H]+ adduct).
  const mass = firstMatch(
    text,
    /(?:observed|found|measured|exact|monoisotopic)\s*mass[:\s~=]*\[?m?\+?h?\]?\+?\s*([\d,]+(?:\.\d+)?)/i,
  )
  if (mass && num(mass[1]) != null) return { value: num(mass[1]) as number, source: 'observed mass (MS)' }
  return null
}

function detectClaimedFormula(text: string): string | null {
  const m = firstMatch(text, /\bC\d{1,4}H\d{1,4}(?:[A-Z][a-z]?\d{0,4})*\b/)
  return m ? m[0] : null
}

function detectClaimedSequence(text: string): string | null {
  const m = firstMatch(text, /sequence[:\s]*([A-Za-z][A-Za-z0-9\-()]{4,})/i)
  return m ? m[1] : null
}

// ── Catalog cross-check ───────────────────────────────────────────────────────

function buildCatalogChecks(text: string, peptide: Peptide): CatalogCheck[] {
  const checks: CatalogCheck[] = []
  const verified = getPubchemVerification(peptide.slug)
  const refMW = verified?.molecularWeight ?? peptide.molecularWeight ?? null
  const refFormula = verified?.molecularFormula ?? peptide.molecularFormula ?? null

  const claimedMW = detectClaimedMW(text)
  if (claimedMW != null && refMW != null) {
    const tol = Math.max(2, refMW * 0.01)
    const match = Math.abs(claimedMW.value - refMW) <= tol
    checks.push({
      field: 'molecularWeight',
      label: 'Molecular weight',
      claimed: `${claimedMW.value} (${claimedMW.source})`,
      reference: `${refMW} Da${verified ? ' (verified)' : ''}`,
      verdict: match ? 'match' : 'mismatch',
      note: match
        ? 'Matches the reference value for this peptide — the stated mass is consistent with the right molecule.'
        : 'Does not match the reference — verify the product identity or that the right reference was used.',
    })
  }

  const claimedFormula = detectClaimedFormula(text)
  if (claimedFormula && refFormula) {
    const norm = (s: string) => s.replace(/\s+/g, '').toUpperCase()
    const match = norm(claimedFormula) === norm(refFormula)
    checks.push({
      field: 'molecularFormula',
      label: 'Molecular formula',
      claimed: claimedFormula,
      reference: `${refFormula}${verified ? ' (verified)' : ''}`,
      verdict: match ? 'match' : 'mismatch',
      note: match
        ? 'Matches the reference formula.'
        : 'Differs from the reference — can be a salt/counterion form, but confirm it is the intended compound.',
    })
  }

  const claimedSeq = detectClaimedSequence(text)
  if (claimedSeq && peptide.sequence) {
    const norm = (s: string) => s.replace(/[\s-]/g, '').toUpperCase()
    const match = norm(claimedSeq).includes(norm(peptide.sequence).slice(0, 8))
    checks.push({
      field: 'sequence',
      label: 'Sequence',
      claimed: claimedSeq.slice(0, 40),
      reference: peptide.sequence.slice(0, 40),
      verdict: match ? 'match' : 'unverified',
      note: match
        ? 'Consistent with the reference sequence.'
        : 'Could not confirm against the reference sequence — check manually.',
    })
  }

  return checks
}

// ── Peptide-specific checks from synthetic features ───────────────────────────
// Each mapped feature implies an analytical test a mass number alone can't cover.
// `keywords` are lowercase substrings that suggest the COA addresses the test.

interface FeatureGuidance {
  label: string
  whatToCheck: string
  keywords: string[]
  action: string
}

const FEATURE_COA_GUIDANCE: Partial<Record<SyntheticFeature, FeatureGuidance>> = {
  'Disulfide bridge': {
    label: 'Disulfide bond verification',
    whatToCheck:
      'This peptide has a disulfide bond, so mass spec confirms the mass but not that the bond formed correctly — a scrambled or open (reduced) form shares the same mass. A thorough COA shows the disulfide is set (reduced vs non-reduced HPLC, an Ellman/free-thiol result, or peptide mapping).',
    keywords: ['disulfide', 'reduced', 'non-reduced', 'nonreduced', 'peptide map', 'ellman', 'free thiol'],
    action: 'confirmation the disulfide bond is correctly formed (e.g. reduced/non-reduced HPLC or a free-thiol result)',
  },
  'Multiple disulfides': {
    label: 'Disulfide connectivity',
    whatToCheck:
      'With more than one disulfide, the mass is identical whether the bonds pair correctly or mis-pair (scramble). Only peptide mapping or reduced/non-reduced analysis shows the connectivity is right — a plain mass and purity number cannot.',
    keywords: ['disulfide', 'reduced', 'non-reduced', 'nonreduced', 'peptide map', 'connectivity', 'free thiol'],
    action: 'disulfide-connectivity evidence (peptide mapping or reduced/non-reduced analysis)',
  },
  'Fatty-acid acylation': {
    label: 'Acylation (acyl vs des-acyl)',
    whatToCheck:
      'The fatty-acid chain is essential to activity, and the des-acyl form is a common, inactive impurity. A good COA reports the acyl-to-des-acyl ratio or a des-acyl limit — not just the total mass.',
    keywords: ['acyl', 'des-acyl', 'desacyl', 'free fatty acid', 'palmitoyl', 'octanoyl', 'myristoyl'],
    action: 'the acyl-to-des-acyl ratio (or a des-acyl impurity limit)',
  },
  'C-terminal amide': {
    label: 'C-terminal amidation',
    whatToCheck:
      'The active form is amidated at the C-terminus; the des-amido impurity is only ~1 Da heavier and easy to miss. Look for explicit confirmation of the amide or a des-amido limit.',
    keywords: ['amide', 'amidation', 'amidated', 'des-amido', 'desamido', 'des-amide'],
    action: 'confirmation of C-terminal amidation (or a des-amido impurity limit)',
  },
  'N-terminal acetylation': {
    label: 'N-terminal acetylation',
    whatToCheck:
      'The active form is N-acetylated; a des-acetyl impurity changes activity. Confirm the acetyl group is present.',
    keywords: ['acetyl', 'acetylation', 'acetylated', 'des-acetyl'],
    action: 'confirmation of N-terminal acetylation',
  },
  'Cyclic / lactam': {
    label: 'Cyclization / ring closure',
    whatToCheck:
      'This is a cyclic (lactam) peptide; the linear, uncyclized precursor is an impurity with only a small mass difference. A thorough COA confirms ring closure.',
    keywords: ['cyclic', 'cyclization', 'cyclisation', 'lactam', 'linear', 'ring clos'],
    action: 'confirmation of cyclization / ring closure (and a linear-precursor limit)',
  },
  'D-amino acid': {
    label: 'Chiral / diastereomer purity',
    whatToCheck:
      'This peptide contains D-amino acids; epimerization to the L-form gives a diastereomer with the same mass. A thorough COA addresses chiral purity or diastereomer content, which mass spec cannot resolve.',
    keywords: ['chiral', 'epimer', 'diastereomer', 'd-amino', 'optical rotation', 'stereo'],
    action: 'chiral/diastereomer purity (D-amino-acid epimers share the same mass)',
  },
  'Copper complex': {
    label: 'Copper content / stoichiometry',
    whatToCheck:
      'The active species is a copper complex, so copper content and the 1:1 stoichiometry are identity-defining tests beyond the peptide itself. Look for a copper assay (e.g. ICP).',
    keywords: ['copper', 'cu(ii)', 'cu2+', 'cu ii', 'icp', 'metal content', 'copper content'],
    action: 'the copper content and stoichiometry (e.g. by ICP)',
  },
  Glycosylated: {
    label: 'Glycosylation & potency',
    whatToCheck:
      'As a glycoprotein, the glycan profile affects identity and activity. A meaningful COA goes beyond peptide purity to glycan analysis and a potency/bioassay.',
    keywords: ['glyco', 'glycan', 'sialic', 'potency', 'bioassay', 'sec', 'aggregat'],
    action: 'glycan-profile and potency/bioassay data',
  },
  'Recombinant protein': {
    label: 'Biologic release testing',
    whatToCheck:
      'This is a recombinant protein, not a synthetic peptide — expect host-cell-protein, residual DNA, aggregation (SEC), and potency/bioassay data rather than solid-phase-synthesis metrics.',
    keywords: ['host cell', 'hcp', 'residual dna', 'sec', 'aggregat', 'bioassay', 'potency', 'endotoxin'],
    action: 'biologic release data (host-cell protein, residual DNA, SEC aggregation, potency)',
  },
  'Monoclonal antibody': {
    label: 'Antibody release testing',
    whatToCheck:
      'This is a monoclonal antibody — a COA should cover aggregation (SEC), charge variants, glycosylation, host-cell protein, and potency, not peptide-synthesis fields.',
    keywords: ['sec', 'aggregat', 'charge variant', 'cief', 'icief', 'host cell', 'hcp', 'potency', 'glyco'],
    action: 'antibody release data (SEC aggregation, charge variants, glycosylation, potency)',
  },
}

function buildFeatureChecks(text: string, peptide: Peptide): FeatureCheck[] {
  const lower = text.toLowerCase()
  const out: FeatureCheck[] = []
  for (const feature of peptide.syntheticFeatures ?? []) {
    const g = FEATURE_COA_GUIDANCE[feature]
    if (!g) continue
    const mentioned = g.keywords.some((k) => lower.includes(k))
    out.push({
      feature,
      label: g.label,
      whatToCheck: g.whatToCheck,
      mentioned,
      status: mentioned ? 'good' : 'warn',
      action: g.action,
    })
  }
  return out
}

// ── The transparency checklist ────────────────────────────────────────────────

export function analyzeCoa(rawText: string): CoaReport {
  const text = rawText.slice(0, 20000) // bound work
  const peptide = detectPeptide(text)

  const purity = detectPurity(text)
  const ms = hasMassSpec(text)
  const content = detectPeptideContent(text)
  const water = detectWater(text)
  const counterion = detectCounterion(text)
  const endotoxin = detectEndotoxin(text)
  const lotDates = detectLotAndDates(text)
  const methods = hasMethods(text)

  const fields: CoaField[] = [
    {
      key: 'purity',
      label: 'Purity (HPLC)',
      found: purity.value != null,
      value: purity.value,
      weight: 2,
      status:
        purity.pct == null
          ? 'missing'
          : purity.pct < 95
            ? 'warn'
            : 'good',
      explanation:
        'The percentage of the material that is the target peptide, measured by HPLC (the area of the main chromatographic peak). The single most-quoted purity number.',
      note:
        purity.pct == null
          ? undefined
          : purity.pct < 95
            ? `${purity.value} is below the ~95–98% researchers typically expect — more impurities/truncated sequences.`
            : `${purity.value} by HPLC. Note: HPLC purity reflects the peak area, not identity — pair it with mass spec.`,
    },
    {
      key: 'massSpec',
      label: 'Identity — mass spectrometry',
      found: ms.found,
      value: ms.value,
      weight: 2,
      status: ms.found ? 'good' : 'missing',
      explanation:
        'Mass spec (ESI/MALDI) confirms the powder actually IS the molecule claimed by matching its measured mass to the theoretical mass. Purity without identity tells you the peak is clean, not that it is the right compound.',
      note: ms.found
        ? ms.value
          ? `Reported observed mass ${ms.value}.`
          : 'Mass-spec identity testing referenced.'
        : 'No mass-spec identity confirmation found — you cannot be sure it is the correct peptide.',
    },
    {
      key: 'peptideContent',
      label: 'Peptide / net content',
      found: content.value != null,
      value: content.value,
      weight: 2,
      status: content.value != null ? 'good' : 'missing',
      explanation:
        'How much of the gross powder weight is actually peptide, versus bound water, counterions (acetate/TFA), and salts. A vial can be 99% pure yet only ~80% peptide by weight — net content tells you what you are really getting per milligram.',
      note:
        content.value != null
          ? `Net peptide content ${content.value} — this is the honest "how much peptide am I paying for" number.`
          : 'No peptide/net content — the classic omission. Without it, the labeled milligrams may include salt and water you are paying for.',
    },
    {
      key: 'water',
      label: 'Water content (Karl Fischer)',
      found: water != null,
      value: water,
      weight: 1,
      status: water != null ? 'good' : 'missing',
      explanation:
        'Residual moisture, measured by Karl Fischer titration. High water content reduces the peptide fraction and can shorten stability.',
      note: water ? `Water content ${water}.` : undefined,
    },
    {
      key: 'counterion',
      label: 'Counterion (acetate / TFA)',
      found: counterion != null,
      value: counterion,
      weight: 1,
      status: counterion != null ? 'good' : 'missing',
      explanation:
        'Synthetic peptides carry a counterion from purification — usually acetate (preferred) or TFA (trifluoroacetate, more toxic and ideally exchanged out). Knowing which, and how much, matters for both content and safety.',
      note: counterion ? `Reported: ${counterion}.` : undefined,
    },
    {
      key: 'endotoxin',
      label: 'Endotoxin / sterility',
      found: endotoxin != null,
      value: endotoxin,
      weight: 1,
      status: endotoxin != null ? 'good' : 'warn',
      explanation:
        'Bacterial endotoxin (measured by LAL, in EU/mg) and sterility matter the moment material is reconstituted and introduced in vivo. Research-grade powders often omit it — which is exactly why it is worth checking before any injectable use.',
      note: endotoxin
        ? `Reported: ${endotoxin}.`
        : 'Not reported. Critical for any in-vivo/injectable research; a powder without it is not validated as sterile or low-endotoxin.',
    },
    {
      key: 'lotDates',
      label: 'Lot, dates & traceability',
      found: lotDates != null,
      value: lotDates,
      weight: 1,
      status: lotDates != null ? 'good' : 'missing',
      explanation:
        'A lot/batch number plus manufacture and retest/expiry dates make the COA traceable to a specific production run. A COA with no lot or dates is not auditable.',
      note: lotDates ? `Found: ${lotDates}.` : undefined,
    },
    {
      key: 'methods',
      label: 'Test methods named',
      found: methods,
      value: methods ? 'methods referenced' : null,
      weight: 1,
      status: methods ? 'good' : 'missing',
      explanation:
        'A credible COA names HOW each value was measured (RP-HPLC, Karl Fischer, ESI-MS…), not just the numbers. Named methods are the difference between a report and a marketing graphic.',
      note: methods ? undefined : 'No analytical methods named — treat the numbers with caution.',
    },
  ]

  // Concrete "ask the supplier" step for anything missing or weak.
  const ACTIONS: Record<string, string> = {
    purity: 'the HPLC purity value with the actual chromatogram',
    massSpec: 'mass-spec (ESI/MALDI) identity confirmation with the observed mass',
    peptideContent: 'the net peptide content (% peptide by weight)',
    water: 'the water content by Karl Fischer titration',
    counterion: 'the counterion identity (acetate vs TFA) and its percentage',
    endotoxin: 'endotoxin (LAL, EU/mg) and sterility data, for any in-vivo use',
    lotDates: 'the lot/batch number and manufacture + retest dates',
    methods: 'the analytical method used for each reported value',
  }
  for (const f of fields) if (f.status !== 'good') f.action = ACTIONS[f.key]

  const catalogChecks = peptide ? buildCatalogChecks(text, peptide) : []
  const featureChecks = peptide ? buildFeatureChecks(text, peptide) : []

  // ── Score ──
  const max = fields.reduce((n, f) => n + f.weight, 0)
  const points = fields.reduce((n, f) => n + (f.status === 'good' ? f.weight : 0), 0)
  const percent = Math.round((points / max) * 100)
  const grade: CoaReport['score']['grade'] =
    percent >= 85 ? 'A' : percent >= 70 ? 'B' : percent >= 55 ? 'C' : percent >= 40 ? 'D' : 'F'

  // ── Red flags ──
  const redFlags: string[] = []
  if (purity.value == null) redFlags.push('No purity value found — a COA without a stated HPLC purity is incomplete.')
  else if (purity.pct != null && purity.pct < 95)
    redFlags.push(`Purity ${purity.value} is below ~95% — expect meaningful impurities or truncated sequences.`)
  if (!ms.found) redFlags.push('No mass-spec identity — purity alone does not prove the molecule is what was ordered.')
  if (content.value == null)
    redFlags.push('No peptide/net content — labeled milligrams may include salt and water, not just peptide.')
  for (const c of catalogChecks)
    if (c.verdict === 'mismatch')
      redFlags.push(`${c.label} on the COA (${c.claimed}) does not match the reference (${c.reference}).`)

  const missing = fields.filter((f) => !f.found).map((f) => f.label)

  const asks = fields.filter((f) => f.status === 'missing' || f.status === 'warn')
  const featureAsks = featureChecks.filter((f) => f.status === 'warn')
  let supplierRequest = asks.length
    ? `Your certificate of analysis${peptide ? ` for ${peptide.name}` : ''} is missing or incomplete on: ${asks
        .map((f) => f.label)
        .join(', ')}. To complete it, please provide ${asks.map((f) => f.action).join('; ')}.`
    : `This COA covers the core transparency fields${peptide ? ` for ${peptide.name}` : ''} — no additional generic items needed.`
  if (featureAsks.length) {
    supplierRequest += ` Because ${peptide?.name ?? 'this peptide'} is ${featureAsks
      .map((f) => f.label.toLowerCase())
      .join(', ')}-relevant, also request ${featureAsks.map((f) => f.action).join('; ')}.`
  }

  const summary =
    grade === 'A'
      ? 'Thorough, transparent COA — covers identity, purity, content, and traceability.'
      : grade === 'B'
        ? 'Solid COA with minor gaps — fill the missing items below for full confidence.'
        : grade === 'C'
          ? 'Partial COA — several transparency items are missing. Ask the supplier for them.'
          : grade === 'D'
            ? 'Thin COA — major fields absent. Treat claims cautiously and request a complete certificate.'
            : 'Not a meaningful certificate of analysis — the core transparency fields are absent.'

  return {
    detectedPeptide: peptide
      ? {
          slug: peptide.slug,
          name: peptide.name,
          verifiedInCatalog: Boolean(getPubchemVerification(peptide.slug)),
        }
      : null,
    fields,
    catalogChecks,
    featureChecks,
    redFlags,
    missing,
    supplierRequest,
    score: { points, max, percent, grade, summary },
  }
}

// A deliberately imperfect sample so the tool demonstrates both reads and flags.
export const SAMPLE_COA = `CERTIFICATE OF ANALYSIS

Product: BPC-157
Lot No.: AP-240517
Date of Manufacture: 2026-05-17
Retest Date: 2028-05-17
Appearance: White lyophilized powder

Purity (RP-HPLC): 98.7 %
Identity (ESI-MS): Observed mass 1419.5; conforms
Net Peptide Content: 82.3 %
Water Content (Karl Fischer): 5.1 %
Acetate Content: 7.4 %

Storage: -20 C, protected from light
Test Methods: RP-HPLC, ESI-MS, Karl Fischer titration`
