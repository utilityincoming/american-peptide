// Pharmacokinetics reference + pure calculators.
//
// RESEARCH REFERENCE ONLY. These figures are published, approximate elimination
// half-lives for the parent compound in humans (or, where noted, the best
// available reference). They are not a dosing recommendation and carry the usual
// uncertainty of the peptide literature — ranges, route dependence, and assay
// variation. Where no reliable human half-life exists we store `null` and the
// UI draws no curve, the same honest default a good tracker uses.
//
// Everything here is pure and provider-neutral so it can be shared by the bench
// calculators (steady-state / clearance) and the local-first tracker's
// interaction check without pulling in any UI.

const LN2 = Math.LN2

/** Half-life expressed as an approximate low–high range, in hours. */
export interface HalfLifeHours {
  low: number
  high: number
}

/**
 * Coarse pharmacological class used only for the conservative, research-framed
 * interaction check — overlapping mechanisms that are worth a second look when
 * run together, not a clinical contraindication engine.
 */
export type PkClass =
  | 'glp1'
  | 'gip'
  | 'glucagon'
  | 'amylin'
  | 'gh-secretagogue'
  | 'ghrh'
  | 'igf'
  | 'melanocortin'
  | 'healing-repair'
  | 'hpg-axis'
  | 'thyroid-calcium'

export interface PkRecord {
  /** Catalog slug this record describes. */
  slug: string
  label: string
  /** Approximate human elimination half-life, or null where none is established. */
  halfLifeHours: HalfLifeHours | null
  /** Short provenance note — the reference the figure is drawn from. */
  sourceNote: string
  /** Pharmacological classes for the interaction check. */
  classes: PkClass[]
}

const h = (low: number, high: number): HalfLifeHours => ({ low, high })

// Curated, sourced half-lives for the most-studied compounds in the catalog.
// Figures are rounded reference values; the sourceNote names the basis. Omitting
// a compound (or setting null) is deliberate — better no curve than a fabricated
// one.
export const PK_RECORDS: PkRecord[] = [
  // --- Incretin / metabolic ---------------------------------------------------
  { slug: 'semaglutide', label: 'Semaglutide', halfLifeHours: h(150, 184), sourceNote: 'FDA label (Ozempic/Wegovy): ~1 week', classes: ['glp1'] },
  { slug: 'liraglutide', label: 'Liraglutide', halfLifeHours: h(12, 14), sourceNote: 'FDA label (Victoza/Saxenda): ~13 h', classes: ['glp1'] },
  { slug: 'tirzepatide', label: 'Tirzepatide', halfLifeHours: h(115, 125), sourceNote: 'FDA label (Mounjaro): ~5 days', classes: ['glp1', 'gip'] },
  { slug: 'retatrutide', label: 'Retatrutide', halfLifeHours: h(144, 168), sourceNote: 'Phase-II PK reports: ~6 days (once-weekly)', classes: ['glp1', 'gip', 'glucagon'] },
  { slug: 'cagrilintide', label: 'Cagrilintide', halfLifeHours: h(159, 195), sourceNote: 'Phase-I PK: ~7–8 days (once-weekly)', classes: ['amylin'] },
  { slug: 'cagrisema', label: 'CagriSema', halfLifeHours: h(150, 184), sourceNote: 'Semaglutide + cagrilintide co-formulation, once-weekly', classes: ['glp1', 'amylin'] },
  { slug: 'mazdutide', label: 'Mazdutide', halfLifeHours: h(120, 168), sourceNote: 'GLP-1/glucagon dual agonist, once-weekly PK reports', classes: ['glp1', 'glucagon'] },
  { slug: 'survodutide', label: 'Survodutide', halfLifeHours: h(120, 168), sourceNote: 'GLP-1/glucagon dual agonist, once-weekly PK reports', classes: ['glp1', 'glucagon'] },
  { slug: 'pramlintide', label: 'Pramlintide', halfLifeHours: h(0.8, 0.8), sourceNote: 'FDA label (Symlin): ~48 min', classes: ['amylin'] },
  { slug: 'amylin', label: 'Amylin', halfLifeHours: h(0.2, 0.22), sourceNote: 'Native amylin: ~13 min', classes: ['amylin'] },
  { slug: 'glucagon', label: 'Glucagon', halfLifeHours: h(0.1, 0.3), sourceNote: 'Native glucagon: 8–18 min', classes: ['glucagon'] },
  { slug: 'aod-9604', label: 'AOD-9604', halfLifeHours: h(0.5, 1), sourceNote: 'hGH-fragment analog, short reference half-life', classes: [] },
  { slug: 'hgh-fragment-176-191', label: 'HGH Fragment 176-191', halfLifeHours: h(0.3, 0.6), sourceNote: 'Short fragment, reference estimate', classes: [] },

  // --- Growth-hormone axis ----------------------------------------------------
  { slug: 'somatropin', label: 'Somatropin (rhGH)', halfLifeHours: h(2.5, 3.5), sourceNote: 'Subcutaneous rhGH: ~2–4 h', classes: [] },
  { slug: 'sermorelin', label: 'Sermorelin', halfLifeHours: h(0.17, 0.2), sourceNote: 'GHRH(1-29): ~10–12 min', classes: ['ghrh'] },
  { slug: 'tesamorelin', label: 'Tesamorelin', halfLifeHours: h(0.4, 0.6), sourceNote: 'FDA label (Egrifta): ~26–38 min', classes: ['ghrh'] },
  { slug: 'cjc-1295-no-dac', label: 'CJC-1295 (no DAC)', halfLifeHours: h(0.4, 0.6), sourceNote: 'Mod-GRF(1-29): ~30 min', classes: ['ghrh'] },
  { slug: 'cjc-1295-with-dac', label: 'CJC-1295 (DAC)', halfLifeHours: h(144, 192), sourceNote: 'Albumin-binding DAC: ~6–8 days', classes: ['ghrh'] },
  { slug: 'ipamorelin', label: 'Ipamorelin', halfLifeHours: h(2, 2), sourceNote: 'GHRP: ~2 h reference', classes: ['gh-secretagogue'] },
  { slug: 'ghrp-2', label: 'GHRP-2', halfLifeHours: h(0.25, 0.5), sourceNote: 'GHRP: ~15–30 min', classes: ['gh-secretagogue'] },
  { slug: 'ghrp-6', label: 'GHRP-6', halfLifeHours: h(0.25, 0.5), sourceNote: 'GHRP: ~15–30 min', classes: ['gh-secretagogue'] },
  { slug: 'hexarelin', label: 'Hexarelin', halfLifeHours: h(0.5, 1), sourceNote: 'GHRP: ~30–60 min', classes: ['gh-secretagogue'] },
  { slug: 'mk-677', label: 'MK-677 (Ibutamoren)', halfLifeHours: h(20, 24), sourceNote: 'Oral secretagogue: ~24 h (once-daily)', classes: ['gh-secretagogue'] },
  { slug: 'ghrelin', label: 'Ghrelin', halfLifeHours: h(0.25, 0.5), sourceNote: 'Native ghrelin: ~15–30 min', classes: ['gh-secretagogue'] },

  // --- IGF --------------------------------------------------------------------
  { slug: 'igf-1', label: 'IGF-1', halfLifeHours: h(0.1, 0.2), sourceNote: 'Free IGF-1 ~10 min; bound fraction much longer', classes: ['igf'] },
  { slug: 'igf-1-lr3', label: 'IGF-1 LR3', halfLifeHours: h(20, 30), sourceNote: 'Reduced IGFBP binding extends reference half-life', classes: ['igf'] },
  { slug: 'igf-1-des', label: 'IGF-1 DES', halfLifeHours: h(0.3, 0.5), sourceNote: 'Short-acting analog, reference estimate', classes: ['igf'] },
  { slug: 'mgf', label: 'MGF', halfLifeHours: h(0.1, 0.15), sourceNote: 'Mechano-growth factor: very short reference', classes: ['igf'] },

  // --- Healing & repair -------------------------------------------------------
  { slug: 'bpc-157', label: 'BPC-157', halfLifeHours: null, sourceNote: 'No established human half-life — reference figures are preclinical only', classes: ['healing-repair'] },
  { slug: 'tb-500', label: 'TB-500', halfLifeHours: null, sourceNote: 'No established human half-life for the synthetic fragment', classes: ['healing-repair'] },
  { slug: 'ghk-cu', label: 'GHK-Cu', halfLifeHours: null, sourceNote: 'No established systemic human half-life', classes: ['healing-repair'] },

  // --- Melanocortin -----------------------------------------------------------
  { slug: 'melanotan-2', label: 'Melanotan II', halfLifeHours: h(1, 2.6), sourceNote: 'Reference PK: ~1–2.6 h', classes: ['melanocortin'] },
  { slug: 'melanotan-1', label: 'Melanotan I (afamelanotide)', halfLifeHours: h(0.5, 1), sourceNote: 'Afamelanotide parent peptide reference', classes: ['melanocortin'] },
  { slug: 'pt-141', label: 'PT-141 (Bremelanotide)', halfLifeHours: h(2.7, 2.7), sourceNote: 'FDA label (Vyleesi): ~2.7 h', classes: ['melanocortin'] },

  // --- HPG axis ---------------------------------------------------------------
  { slug: 'gonadorelin', label: 'Gonadorelin', halfLifeHours: h(0.03, 0.07), sourceNote: 'Native GnRH: ~2–4 min', classes: ['hpg-axis'] },
  { slug: 'kisspeptin-10', label: 'Kisspeptin-10', halfLifeHours: h(0.03, 0.07), sourceNote: 'Reference: ~minutes', classes: ['hpg-axis'] },
  { slug: 'hcg', label: 'hCG', halfLifeHours: h(24, 36), sourceNote: 'Biphasic; terminal ~33 h reference', classes: ['hpg-axis'] },
  { slug: 'oxytocin', label: 'Oxytocin', halfLifeHours: h(0.03, 0.1), sourceNote: 'Native oxytocin: ~1–6 min', classes: [] },

  // --- Calcium / thyroid-adjacent ---------------------------------------------
  { slug: 'teriparatide', label: 'Teriparatide', halfLifeHours: h(1, 1), sourceNote: 'FDA label (Forteo): ~1 h subcutaneous', classes: ['thyroid-calcium'] },
  { slug: 'calcitonin', label: 'Calcitonin', halfLifeHours: h(0.75, 1.5), sourceNote: 'Salmon calcitonin reference', classes: ['thyroid-calcium'] },
]

const PK_BY_SLUG = new Map(PK_RECORDS.map((r) => [r.slug, r]))

export function getPk(slug: string): PkRecord | undefined {
  return PK_BY_SLUG.get(slug)
}

/** Records with a usable numeric half-life, for calculator pickers. */
export function pkWithHalfLife(): PkRecord[] {
  return PK_RECORDS.filter((r) => r.halfLifeHours !== null).sort((a, b) => a.label.localeCompare(b.label))
}

/** Midpoint of a half-life range — the value the curves are drawn against. */
export function halfLifeMidpoint(hl: HalfLifeHours): number {
  return (hl.low + hl.high) / 2
}

// --- Pure PK math -----------------------------------------------------------
// All times in hours. Single-compartment first-order elimination, the standard
// teaching model; good enough for the "roughly when" questions these answer and
// honest about being an approximation.

/** Fraction of a single dose remaining after `hours`, given a half-life. */
export function fractionRemaining(halfLife: number, hours: number): number {
  if (halfLife <= 0 || hours < 0) return NaN
  return Math.pow(0.5, hours / halfLife)
}

/** Hours for a single dose to decay to `fraction` (0–1) of its starting amount. */
export function timeToFraction(halfLife: number, fraction: number): number {
  if (halfLife <= 0 || fraction <= 0 || fraction >= 1) return NaN
  return halfLife * (Math.log(1 / fraction) / LN2)
}

/**
 * Hours to reach `fraction` (default 0.97) of steady state on repeated dosing.
 * Approach to steady state mirrors single-dose decay, so this is independent of
 * the dosing interval — ~5 half-lives for 97%.
 */
export function timeToSteadyState(halfLife: number, fraction = 0.97): number {
  return timeToFraction(halfLife, 1 - fraction)
}

/**
 * Steady-state accumulation ratio for a fixed dose every `intervalHours`:
 * Css,avg / single-dose-avg = 1 / (1 - e^(-k·τ)). 1.0 means no accumulation.
 */
export function accumulationRatio(halfLife: number, intervalHours: number): number {
  if (halfLife <= 0 || intervalHours <= 0) return NaN
  return 1 / (1 - Math.pow(0.5, intervalHours / halfLife))
}

/**
 * Peak-to-trough ratio at steady state = 2^(τ / t½). A ratio near 1 means a
 * near-flat profile; a large ratio means big swings between doses.
 */
export function peakTroughRatio(halfLife: number, intervalHours: number): number {
  if (halfLife <= 0 || intervalHours <= 0) return NaN
  return Math.pow(2, intervalHours / halfLife)
}

/**
 * Hours for a compound to effectively clear after the last dose — time to decay
 * to `fraction` remaining (default 0.03, i.e. ~97% cleared ≈ 5 half-lives).
 */
export function clearanceTime(halfLife: number, fraction = 0.03): number {
  return timeToFraction(halfLife, fraction)
}

// --- Interaction check ------------------------------------------------------

export interface InteractionNote {
  /** Slugs involved in the note. */
  slugs: string[]
  severity: 'overlap' | 'caution'
  message: string
}

const CLASS_OVERLAP: Partial<Record<PkClass, string>> = {
  glp1: 'Overlapping GLP-1 receptor activity — combined incretin effect studied as a stack, worth noting together.',
  gip: 'Overlapping GIP receptor activity.',
  glucagon: 'Overlapping glucagon-receptor activity.',
  amylin: 'Overlapping amylin / satiety signaling.',
  'gh-secretagogue': 'Multiple GH secretagogues — overlapping GH-release pathway.',
  ghrh: 'Multiple GHRH-pathway agents — overlapping GH-release pathway.',
  igf: 'Overlapping IGF-axis activity.',
  melanocortin: 'Overlapping melanocortin-receptor activity.',
  'hpg-axis': 'Overlapping HPG-axis (GnRH / gonadotropin) activity.',
  'thyroid-calcium': 'Overlapping calcium-regulation activity.',
}

/**
 * Conservative, research-framed interaction scan over a set of catalog slugs.
 * Flags pairs that share a pharmacological class (overlapping mechanism) plus a
 * couple of well-known combined-pathway cautions. Not a clinical interaction
 * database — a prompt to look closer, nothing more.
 */
export function interactionCheck(slugs: string[]): InteractionNote[] {
  const recs = slugs.map((s) => PK_BY_SLUG.get(s)).filter((r): r is PkRecord => Boolean(r))
  const notes: InteractionNote[] = []

  // Shared-class overlaps.
  const byClass = new Map<PkClass, PkRecord[]>()
  for (const r of recs) {
    for (const c of r.classes) {
      const arr = byClass.get(c) ?? []
      arr.push(r)
      byClass.set(c, arr)
    }
  }
  for (const [cls, members] of byClass) {
    if (members.length < 2) continue
    const msg = CLASS_OVERLAP[cls]
    if (!msg) continue
    notes.push({
      slugs: members.map((m) => m.slug),
      severity: 'overlap',
      message: `${members.map((m) => m.label).join(' + ')}: ${msg}`,
    })
  }

  // A few named combined-pathway cautions.
  const has = (c: PkClass) => recs.some((r) => r.classes.includes(c))
  if (has('glucagon') && recs.length > 1) {
    notes.push({
      slugs: recs.filter((r) => r.classes.includes('glucagon')).map((r) => r.slug),
      severity: 'caution',
      message:
        'Glucagon-receptor activity in a stack can shift glucose handling — a combined-pathway effect worth tracking in any protocol record.',
    })
  }

  return notes
}
