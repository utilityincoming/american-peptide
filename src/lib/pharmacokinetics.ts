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

// Curated, sourced half-lives covering the whole catalog. Figures are rounded
// reference values and the sourceNote names the basis. Where no reliable human
// half-life exists — short peptide bioregulators, topical cosmetics, and
// experimental research peptides — the value is null and the UI draws no curve.
// Better no curve than a fabricated one.
export const PK_RECORDS: PkRecord[] = [
  // --- Incretin / metabolic ---------------------------------------------------
  { slug: 'semaglutide', label: 'Semaglutide', halfLifeHours: h(150, 184), sourceNote: 'FDA label (Ozempic/Wegovy): ~1 week', classes: ['glp1'] },
  { slug: 'liraglutide', label: 'Liraglutide', halfLifeHours: h(12, 14), sourceNote: 'FDA label (Victoza/Saxenda): ~13 h', classes: ['glp1'] },
  { slug: 'tirzepatide', label: 'Tirzepatide', halfLifeHours: h(115, 125), sourceNote: 'FDA label (Mounjaro): ~5 days', classes: ['glp1', 'gip'] },
  { slug: 'retatrutide', label: 'Retatrutide', halfLifeHours: h(144, 168), sourceNote: 'Phase-II PK reports: ~6 days (once-weekly)', classes: ['glp1', 'gip', 'glucagon'] },
  { slug: 'survodutide', label: 'Survodutide', halfLifeHours: h(120, 168), sourceNote: 'GLP-1/glucagon dual agonist, once-weekly PK reports', classes: ['glp1', 'glucagon'] },
  { slug: 'mazdutide', label: 'Mazdutide', halfLifeHours: h(120, 168), sourceNote: 'GLP-1/glucagon dual agonist, once-weekly PK reports', classes: ['glp1', 'glucagon'] },
  { slug: 'cagrilintide', label: 'Cagrilintide', halfLifeHours: h(159, 195), sourceNote: 'Phase-I PK: ~7–8 days (once-weekly)', classes: ['amylin'] },
  { slug: 'cagrisema', label: 'CagriSema', halfLifeHours: h(150, 184), sourceNote: 'Semaglutide + cagrilintide co-formulation, once-weekly', classes: ['glp1', 'amylin'] },
  { slug: 'insulin', label: 'Insulin (human)', halfLifeHours: h(0.07, 0.1), sourceNote: 'Regular human insulin: ~4–6 min IV (subcutaneous action is longer)', classes: [] },
  { slug: 'glucagon', label: 'Glucagon', halfLifeHours: h(0.1, 0.3), sourceNote: 'Native glucagon: 8–18 min', classes: ['glucagon'] },
  { slug: 'amylin', label: 'Amylin', halfLifeHours: h(0.2, 0.22), sourceNote: 'Native amylin: ~13 min', classes: ['amylin'] },
  { slug: 'pramlintide', label: 'Pramlintide', halfLifeHours: h(0.8, 0.8), sourceNote: 'FDA label (Symlin): ~48 min', classes: ['amylin'] },
  { slug: 'hgh-fragment-176-191', label: 'HGH Fragment 176-191', halfLifeHours: h(0.3, 0.6), sourceNote: 'Short fragment, reference estimate', classes: [] },
  { slug: 'aod-9604', label: 'AOD-9604', halfLifeHours: h(0.5, 1), sourceNote: 'hGH-fragment analog, short reference half-life', classes: [] },
  { slug: 'adipotide', label: 'Adipotide', halfLifeHours: null, sourceNote: 'Experimental proapoptotic peptide — no established human half-life', classes: [] },
  { slug: '5-amino-1mq', label: '5-Amino-1MQ', halfLifeHours: null, sourceNote: 'NNMT-inhibitor small molecule — no established human half-life', classes: [] },

  // --- Growth-hormone axis ----------------------------------------------------
  { slug: 'somatropin', label: 'Somatropin (rhGH)', halfLifeHours: h(2.5, 3.5), sourceNote: 'Subcutaneous rhGH: ~2–4 h', classes: [] },
  { slug: 'igf-1', label: 'IGF-1 (Mecasermin)', halfLifeHours: h(0.1, 0.2), sourceNote: 'Free IGF-1 ~10 min; bound fraction much longer', classes: ['igf'] },
  { slug: 'igf-1-lr3', label: 'IGF-1 LR3', halfLifeHours: h(20, 30), sourceNote: 'Reduced IGFBP binding extends reference half-life', classes: ['igf'] },
  { slug: 'igf-1-des', label: 'IGF-1 DES', halfLifeHours: h(0.3, 0.5), sourceNote: 'Short-acting analog, reference estimate', classes: ['igf'] },
  { slug: 'mgf', label: 'MGF', halfLifeHours: h(0.1, 0.15), sourceNote: 'Mechano-growth factor: very short reference', classes: ['igf'] },
  { slug: 'cjc-1295-no-dac', label: 'CJC-1295 (no DAC)', halfLifeHours: h(0.4, 0.6), sourceNote: 'Mod-GRF(1-29): ~30 min', classes: ['ghrh'] },
  { slug: 'cjc-1295-with-dac', label: 'CJC-1295 (DAC)', halfLifeHours: h(144, 192), sourceNote: 'Albumin-binding DAC: ~6–8 days', classes: ['ghrh'] },
  { slug: 'ipamorelin', label: 'Ipamorelin', halfLifeHours: h(2, 2), sourceNote: 'GHRP: ~2 h reference', classes: ['gh-secretagogue'] },
  { slug: 'tesamorelin', label: 'Tesamorelin', halfLifeHours: h(0.4, 0.6), sourceNote: 'FDA label (Egrifta): ~26–38 min', classes: ['ghrh'] },
  { slug: 'sermorelin', label: 'Sermorelin', halfLifeHours: h(0.17, 0.2), sourceNote: 'GHRH(1-29): ~10–12 min', classes: ['ghrh'] },
  { slug: 'hexarelin', label: 'Hexarelin', halfLifeHours: h(0.5, 1), sourceNote: 'GHRP: ~30–60 min', classes: ['gh-secretagogue'] },
  { slug: 'ghrp-2', label: 'GHRP-2', halfLifeHours: h(0.25, 0.5), sourceNote: 'GHRP: ~15–30 min', classes: ['gh-secretagogue'] },
  { slug: 'ghrp-6', label: 'GHRP-6', halfLifeHours: h(0.25, 0.5), sourceNote: 'GHRP: ~15–30 min', classes: ['gh-secretagogue'] },
  { slug: 'mk-677', label: 'MK-677 (Ibutamoren)', halfLifeHours: h(20, 24), sourceNote: 'Oral secretagogue: ~24 h (once-daily)', classes: ['gh-secretagogue'] },
  { slug: 'ghrelin', label: 'Ghrelin', halfLifeHours: h(0.25, 0.5), sourceNote: 'Native ghrelin: ~15–30 min', classes: ['gh-secretagogue'] },
  { slug: 'somatostatin', label: 'Somatostatin', halfLifeHours: h(0.03, 0.05), sourceNote: 'Native somatostatin: ~1–3 min', classes: [] },
  { slug: 'myostatin', label: 'Myostatin (GDF-8)', halfLifeHours: null, sourceNote: 'Endogenous growth-factor target, not an administered drug', classes: [] },
  { slug: 'follistatin', label: 'Follistatin', halfLifeHours: null, sourceNote: 'No established human half-life for therapeutic use', classes: [] },
  { slug: 'apitegromab', label: 'Apitegromab', halfLifeHours: h(504, 672), sourceNote: 'Anti-pro/latent-myostatin monoclonal antibody: ~3–4 weeks (IgG)', classes: [] },
  { slug: 'trevogrumab', label: 'Trevogrumab', halfLifeHours: h(336, 504), sourceNote: 'Anti-myostatin monoclonal antibody: ~2–3 weeks (IgG)', classes: [] },
  { slug: 'emugrobart', label: 'Emugrobart', halfLifeHours: null, sourceNote: 'Investigational antibody — no published human half-life', classes: [] },
  { slug: 'garetosmab', label: 'Garetosmab', halfLifeHours: h(504, 672), sourceNote: 'Anti-activin-A monoclonal antibody: ~3–4 weeks (IgG)', classes: [] },
  { slug: 'bimagrumab', label: 'Bimagrumab', halfLifeHours: h(480, 672), sourceNote: 'Anti-ActRII monoclonal antibody: ~2–4 weeks', classes: [] },

  // --- Mitochondrial / longevity ----------------------------------------------
  { slug: 'mots-c', label: 'MOTS-c', halfLifeHours: null, sourceNote: 'Mitochondrial-derived peptide — no established human half-life', classes: [] },
  { slug: 'humanin', label: 'Humanin', halfLifeHours: null, sourceNote: 'Mitochondrial-derived peptide — no established human half-life', classes: [] },
  { slug: 'ss-31', label: 'SS-31 (Elamipretide)', halfLifeHours: h(2, 3), sourceNote: 'Elamipretide subcutaneous reference: ~2–3 h', classes: [] },
  { slug: 'nad-plus', label: 'NAD+', halfLifeHours: null, sourceNote: 'NAD+ pharmacokinetics are complex and route-dependent — no simple half-life', classes: [] },
  { slug: 'glutathione', label: 'Glutathione', halfLifeHours: h(0.1, 0.2), sourceNote: 'Plasma glutathione turnover ~10–15 min', classes: [] },
  { slug: 'foxo4-dri', label: 'FOXO4-DRI', halfLifeHours: null, sourceNote: 'Experimental senolytic peptide — no established human half-life', classes: [] },

  // --- Khavinson short-peptide bioregulators (no established human half-life) --
  { slug: 'epitalon', label: 'Epitalon', halfLifeHours: null, sourceNote: 'Short peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'endoluten', label: 'Endoluten', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'thymalin', label: 'Thymalin', halfLifeHours: null, sourceNote: 'Thymic peptide extract — no established human half-life', classes: [] },
  { slug: 'thymogen', label: 'Thymogen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'vilon', label: 'Vilon', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'vesugen', label: 'Vesugen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'pinealon', label: 'Pinealon', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'bronchogen', label: 'Bronchogen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'cardiogen', label: 'Cardiogen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'pancragen', label: 'Pancragen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'testagen', label: 'Testagen', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'prostamax', label: 'Prostamax', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'vladonix', label: 'Vladonix', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'ventfort', label: 'Ventfort', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'chelohart', label: 'Chelohart', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'cerluten', label: 'Cerluten', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'suprefort', label: 'Suprefort', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'taxorest', label: 'Taxorest', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'testoluten', label: 'Testoluten', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'sigumir', label: 'Sigumir', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'gotratix', label: 'Gotratix', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'svetinorm', label: 'Svetinorm', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },
  { slug: 'visoluten', label: 'Visoluten', halfLifeHours: null, sourceNote: 'Peptide bioregulator — no established human half-life', classes: [] },

  // --- Cognitive --------------------------------------------------------------
  { slug: 'semax', label: 'Semax', halfLifeHours: h(0.03, 0.08), sourceNote: 'Intranasal; rapid plasma clearance (~minutes)', classes: [] },
  { slug: 'selank', label: 'Selank', halfLifeHours: h(0.1, 0.3), sourceNote: 'Rapid clearance — minutes reference', classes: [] },
  { slug: 'dsip', label: 'DSIP', halfLifeHours: h(0.1, 0.13), sourceNote: 'Delta-sleep-inducing peptide: ~7 min reference', classes: [] },
  { slug: 'cerebrolysin', label: 'Cerebrolysin', halfLifeHours: null, sourceNote: 'Peptide mixture — no single half-life', classes: [] },
  { slug: 'dihexa', label: 'Dihexa', halfLifeHours: null, sourceNote: 'Experimental angiotensin-derived peptide — no established human half-life', classes: [] },

  // --- Healing & repair -------------------------------------------------------
  { slug: 'bpc-157', label: 'BPC-157', halfLifeHours: null, sourceNote: 'No established human half-life — reference figures are preclinical only', classes: ['healing-repair'] },
  { slug: 'tb-500', label: 'TB-500', halfLifeHours: null, sourceNote: 'No established human half-life for the synthetic fragment', classes: ['healing-repair'] },
  { slug: 'b7-33', label: 'B7-33', halfLifeHours: null, sourceNote: 'Experimental relaxin analog — no established human half-life', classes: ['healing-repair'] },
  { slug: 'epo', label: 'EPO (Erythropoietin)', halfLifeHours: h(4, 13), sourceNote: 'Recombinant EPO: ~4–13 h depending on route', classes: [] },
  { slug: 'ara-290', label: 'ARA-290 (Cibinetide)', halfLifeHours: h(0.03, 0.05), sourceNote: 'Cibinetide: ~2 min reference', classes: [] },
  { slug: 'll-37', label: 'LL-37', halfLifeHours: null, sourceNote: 'Endogenous antimicrobial peptide — no established therapeutic half-life', classes: ['healing-repair'] },
  { slug: 'kpv', label: 'KPV', halfLifeHours: null, sourceNote: 'Research tripeptide — no established human half-life', classes: ['healing-repair'] },

  // --- Cosmetic (topical — no systemic half-life) -----------------------------
  { slug: 'ghk-cu', label: 'GHK-Cu', halfLifeHours: null, sourceNote: 'Topical copper peptide — no established systemic half-life', classes: ['healing-repair'] },
  { slug: 'ahk-cu', label: 'AHK-Cu', halfLifeHours: null, sourceNote: 'Topical copper peptide — no systemic half-life', classes: [] },
  { slug: 'matrixyl', label: 'Matrixyl', halfLifeHours: null, sourceNote: 'Topical cosmetic peptide — no systemic half-life', classes: [] },
  { slug: 'argireline', label: 'Argireline', halfLifeHours: null, sourceNote: 'Topical cosmetic peptide — no systemic half-life', classes: [] },
  { slug: 'snap-8', label: 'SNAP-8', halfLifeHours: null, sourceNote: 'Topical cosmetic peptide — no systemic half-life', classes: [] },

  // --- Melanocortin -----------------------------------------------------------
  { slug: 'melanotan-2', label: 'Melanotan II', halfLifeHours: h(1, 2.6), sourceNote: 'Reference PK: ~1–2.6 h', classes: ['melanocortin'] },
  { slug: 'melanotan-1', label: 'Afamelanotide (Melanotan I)', halfLifeHours: h(0.5, 1), sourceNote: 'Afamelanotide parent peptide reference', classes: ['melanocortin'] },
  { slug: 'pt-141', label: 'PT-141 (Bremelanotide)', halfLifeHours: h(2.7, 2.7), sourceNote: 'FDA label (Vyleesi): ~2.7 h', classes: ['melanocortin'] },

  // --- Reproductive / HPG axis ------------------------------------------------
  { slug: 'kisspeptin-10', label: 'Kisspeptin-10', halfLifeHours: h(0.03, 0.07), sourceNote: 'Reference: ~minutes', classes: ['hpg-axis'] },
  { slug: 'gonadorelin', label: 'Gonadorelin', halfLifeHours: h(0.03, 0.07), sourceNote: 'Native GnRH: ~2–4 min', classes: ['hpg-axis'] },
  { slug: 'leuprolide', label: 'Leuprolide', halfLifeHours: h(2.9, 3.6), sourceNote: 'Immediate-release: ~3 h (depot forms extend release)', classes: ['hpg-axis'] },
  { slug: 'triptorelin', label: 'Triptorelin', halfLifeHours: h(2.8, 3.9), sourceNote: 'Immediate-release: ~3 h (depot forms extend release)', classes: ['hpg-axis'] },
  { slug: 'hcg', label: 'hCG', halfLifeHours: h(24, 36), sourceNote: 'Biphasic; terminal ~33 h reference', classes: ['hpg-axis'] },
  { slug: 'fsh', label: 'FSH (Follitropin)', halfLifeHours: h(24, 35), sourceNote: 'Follitropin: ~24–35 h', classes: ['hpg-axis'] },
  { slug: 'oxytocin', label: 'Oxytocin', halfLifeHours: h(0.03, 0.1), sourceNote: 'Native oxytocin: ~1–6 min', classes: [] },

  // --- Immune -----------------------------------------------------------------
  { slug: 'thymosin-alpha-1', label: 'Thymosin Alpha-1', halfLifeHours: h(2, 2), sourceNote: 'Thymosin α1: ~2 h reference', classes: [] },

  // --- Other peptide hormones -------------------------------------------------
  { slug: 'vasopressin', label: 'Vasopressin', halfLifeHours: h(0.17, 0.58), sourceNote: 'Native vasopressin: ~10–35 min', classes: [] },
  { slug: 'acth', label: 'ACTH (Corticotropin)', halfLifeHours: h(0.1, 0.25), sourceNote: 'ACTH: ~15 min reference', classes: [] },
  { slug: 'secretin', label: 'Secretin', halfLifeHours: h(0.03, 0.07), sourceNote: 'Secretin: ~4 min reference', classes: [] },
  { slug: 'vip', label: 'VIP', halfLifeHours: h(0.01, 0.03), sourceNote: 'Vasoactive intestinal peptide: ~1 min reference', classes: [] },

  // --- Calcium / bone ---------------------------------------------------------
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
