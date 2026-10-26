// Peptide-aware reconstitution presets for the Reconstitution Calculator.
//
// Each entry seeds the calculator's three inputs when a peptide is selected:
//   • vialMg  — a vial strength the lyophilized compound is *commonly supplied in*
//   • waterMl — a typical reconstitution volume for that vial
//   • doseMcg — a reference amount commonly cited in the research literature
//
// IMPORTANT — research-reference framing, not medical guidance:
// Vial sizes and volumes describe how these compounds are typically supplied and
// dissolved for laboratory research. The `doseMcg` values are calculation
// reference points only — NOT dosing recommendations, medical advice, or an
// endorsement of human use. The UI must surface this caveat wherever presets load.
//
// `slug` matches the catalog entry in peptides.ts so the UI can deep-link to
// /catalog/[slug]. Only compounds that are reconstituted from lyophilized powder
// and dosed by mass (mcg/mg) are included. Intentionally omitted because the
// mcg-on-a-U100-syringe model does not apply to them:
//   • IU / unit-dosed biologics — insulin, HCG, FSH, somatropin, EPO,
//     calcitonin, vasopressin.
//   • Monoclonal antibodies — apitegromab, trevogrumab, emugrobart, garetosmab,
//     bimagrumab (and the large recombinant targets myostatin, follistatin).
//   • Oral small molecules — MK-677, 5-Amino-1MQ, dihexa, NAD+, glutathione —
//     which are not reconstituted-and-injected by mass.
//   • Tissue-extract bioregulators (the Cytogen oral-extract line: endoluten,
//     cerluten, vladonix, suprefort, …) and solution-form extracts like
//     cerebrolysin, which ship ready-dosed rather than as lyophilized powder.
// The synthetic short-peptide bioregulators (thymogen, pinealon, cardiogen, …)
// ARE included — they are supplied as lyophilized powder and dosed by mass.

export interface ReconPreset {
  /** Catalog slug — matches peptides.ts for deep-linking to /catalog/[slug]. */
  slug: string
  /** Short display name for the picker (may differ from the full catalog name). */
  name: string
  /** Dropdown group label. */
  group: string
  /** Common supplied vial strength, in mg. */
  vialMg: number
  /** Typical reconstitution volume, in mL. */
  waterMl: number
  /** Reference research amount per administration, in mcg (NOT a dose recommendation). */
  doseMcg: number
  /** Optional caveat shown on the loaded chip (e.g. non-injectable routes). */
  note?: string
}

/**
 * Date of the last curation pass over RECON_PRESETS. Evidence-tier badges on the
 * catalog stamp preset-derived figures with this date (Validation Tier Schema
 * §3 requires a retrieval date on every claim). Bump it whenever the figures
 * below are reviewed or changed.
 */
export const RECON_PRESETS_CURATED_AT = '2026-10-26'

export const RECON_PRESETS: ReconPreset[] = [
  // ── Metabolic ─────────────────────────────────────────────
  { slug: 'semaglutide',  name: 'Semaglutide',  group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 250 },
  { slug: 'tirzepatide',  name: 'Tirzepatide',  group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 2500 },
  { slug: 'retatrutide',  name: 'Retatrutide',  group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 2000 },
  { slug: 'cagrilintide', name: 'Cagrilintide', group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 300 },
  { slug: 'aod-9604',     name: 'AOD-9604',     group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 300 },
  { slug: 'liraglutide',  name: 'Liraglutide',  group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 600 },
  { slug: 'survodutide',  name: 'Survodutide',  group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 600 },
  { slug: 'mazdutide',    name: 'Mazdutide',    group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 3000 },
  { slug: 'cagrisema',    name: 'CagriSema',    group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 500, note: 'Fixed-dose cagrilintide + semaglutide combination.' },
  { slug: 'glucagon',     name: 'Glucagon',     group: 'Metabolic', vialMg: 1,  waterMl: 1, doseMcg: 1000 },
  { slug: 'hgh-fragment-176-191', name: 'HGH Frag 176-191', group: 'Metabolic', vialMg: 5, waterMl: 2, doseMcg: 250 },
  { slug: 'adipotide',    name: 'Adipotide',    group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 500 },
  { slug: 'amylin',       name: 'Amylin',       group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'pramlintide',  name: 'Pramlintide',  group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 120 },

  // ── Growth Hormone ────────────────────────────────────────
  { slug: 'ipamorelin',        name: 'Ipamorelin',        group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 300 },
  { slug: 'cjc-1295-no-dac',   name: 'CJC-1295 (no DAC)', group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'cjc-1295-with-dac', name: 'CJC-1295 (DAC)',    group: 'Growth Hormone', vialMg: 2,  waterMl: 2, doseMcg: 1000 },
  { slug: 'tesamorelin',       name: 'Tesamorelin',       group: 'Growth Hormone', vialMg: 10, waterMl: 2, doseMcg: 2000 },
  { slug: 'sermorelin',        name: 'Sermorelin',        group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 300 },
  { slug: 'hexarelin',         name: 'Hexarelin',         group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'mgf',               name: 'MGF',               group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 200 },
  { slug: 'igf-1-lr3',         name: 'IGF-1 LR3',         group: 'Growth Hormone', vialMg: 1,  waterMl: 1, doseMcg: 50 },
  { slug: 'igf-1',             name: 'IGF-1',             group: 'Growth Hormone', vialMg: 1,  waterMl: 1, doseMcg: 50 },
  { slug: 'igf-1-des',         name: 'IGF-1 DES',         group: 'Growth Hormone', vialMg: 1,  waterMl: 1, doseMcg: 50 },
  { slug: 'ghrp-2',            name: 'GHRP-2',            group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'ghrp-6',            name: 'GHRP-6',            group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'somatostatin',      name: 'Somatostatin',      group: 'Growth Hormone', vialMg: 5,  waterMl: 2, doseMcg: 250 },

  // ── Healing & Repair ──────────────────────────────────────
  { slug: 'bpc-157', name: 'BPC-157', group: 'Healing & Repair', vialMg: 5, waterMl: 2, doseMcg: 250 },
  { slug: 'tb-500',  name: 'TB-500',  group: 'Healing & Repair', vialMg: 5, waterMl: 2, doseMcg: 2500 },
  { slug: 'kpv',     name: 'KPV',     group: 'Healing & Repair', vialMg: 5,  waterMl: 2, doseMcg: 500 },
  { slug: 'b7-33',   name: 'B7-33',   group: 'Healing & Repair', vialMg: 5,  waterMl: 2, doseMcg: 500 },
  { slug: 'ara-290', name: 'ARA-290', group: 'Healing & Repair', vialMg: 10, waterMl: 2, doseMcg: 2000 },
  { slug: 'teriparatide', name: 'Teriparatide', group: 'Healing & Repair', vialMg: 1, waterMl: 1, doseMcg: 20 },

  // ── Cosmetic ──────────────────────────────────────────────
  { slug: 'ghk-cu',      name: 'GHK-Cu',      group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000 },
  { slug: 'ahk-cu',      name: 'AHK-Cu',      group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000 },
  { slug: 'melanotan-2', name: 'Melanotan II', group: 'Cosmetic', vialMg: 10, waterMl: 2, doseMcg: 250 },
  { slug: 'melanotan-1', name: 'Afamelanotide', group: 'Cosmetic', vialMg: 10, waterMl: 2, doseMcg: 500 },
  { slug: 'matrixyl',   name: 'Matrixyl',   group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000, note: 'Typically prepared for topical formulation, not injection.' },
  { slug: 'argireline', name: 'Argireline', group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000, note: 'Typically prepared for topical formulation, not injection.' },
  { slug: 'snap-8',     name: 'SNAP-8',     group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000, note: 'Typically prepared for topical formulation, not injection.' },

  // ── Cognitive ─────────────────────────────────────────────
  { slug: 'semax',  name: 'Semax',  group: 'Cognitive', vialMg: 10, waterMl: 2, doseMcg: 300, note: 'Often prepared for intranasal use.' },
  { slug: 'selank', name: 'Selank', group: 'Cognitive', vialMg: 10, waterMl: 2, doseMcg: 300, note: 'Often prepared for intranasal use.' },
  { slug: 'dsip',   name: 'DSIP',   group: 'Cognitive', vialMg: 5,  waterMl: 2, doseMcg: 100 },

  // ── Longevity & Mitochondrial ─────────────────────────────
  { slug: 'epitalon', name: 'Epitalon', group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },
  { slug: 'mots-c',   name: 'MOTS-c',   group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },
  { slug: 'ss-31',    name: 'SS-31',    group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },
  { slug: 'humanin',  name: 'Humanin',  group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 1000 },
  { slug: 'foxo4-dri', name: 'FOXO4-DRI', group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },

  // ── Reproductive ──────────────────────────────────────────
  { slug: 'pt-141',        name: 'PT-141',        group: 'Reproductive', vialMg: 10, waterMl: 2, doseMcg: 1000 },
  { slug: 'kisspeptin-10', name: 'Kisspeptin-10', group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'gonadorelin',   name: 'Gonadorelin',   group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'leuprolide',    name: 'Leuprolide',    group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 500 },
  { slug: 'triptorelin',   name: 'Triptorelin',   group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 100 },
  { slug: 'oxytocin',      name: 'Oxytocin',      group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 100, note: 'Often prepared for intranasal use.' },

  // ── Immune ────────────────────────────────────────────────
  { slug: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', group: 'Immune', vialMg: 5, waterMl: 2, doseMcg: 1600 },
  { slug: 'thymalin',         name: 'Thymalin',         group: 'Immune', vialMg: 10, waterMl: 2, doseMcg: 10000 },
  { slug: 'll-37',            name: 'LL-37',            group: 'Immune', vialMg: 5, waterMl: 2, doseMcg: 100 },

  // ── Bioregulators (synthetic short peptides) ──────────────
  // The Cytogen tissue-extract line (endoluten, cerluten, vladonix, …) is an
  // oral capsule product and is intentionally excluded (see header). These are
  // the synthesized Khavinson peptides supplied as lyophilized powder.
  { slug: 'thymogen',  name: 'Thymogen',  group: 'Bioregulators', vialMg: 10, waterMl: 2, doseMcg: 100 },
  { slug: 'vilon',     name: 'Vilon',     group: 'Bioregulators', vialMg: 10, waterMl: 2, doseMcg: 100 },
  { slug: 'vesugen',   name: 'Vesugen',   group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'pinealon',  name: 'Pinealon',  group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'bronchogen', name: 'Bronchogen', group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'cardiogen', name: 'Cardiogen', group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'pancragen', name: 'Pancragen', group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'testagen',  name: 'Testagen',  group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },
  { slug: 'prostamax', name: 'Prostamax', group: 'Bioregulators', vialMg: 20, waterMl: 2, doseMcg: 200 },

  // ── Peptide Hormones ──────────────────────────────────────
  { slug: 'acth',     name: 'ACTH',     group: 'Peptide Hormones', vialMg: 5, waterMl: 2, doseMcg: 250 },
  { slug: 'secretin', name: 'Secretin', group: 'Peptide Hormones', vialMg: 5, waterMl: 2, doseMcg: 200 },
  { slug: 'vip',      name: 'VIP',      group: 'Peptide Hormones', vialMg: 5, waterMl: 2, doseMcg: 100 },
  { slug: 'ghrelin',  name: 'Ghrelin',  group: 'Peptide Hormones', vialMg: 5, waterMl: 2, doseMcg: 100 },
]

/** Preset groups in display order, each with its peptides. */
export const RECON_PRESET_GROUPS: { group: string; items: ReconPreset[] }[] = (() => {
  const order: string[] = []
  const byGroup = new Map<string, ReconPreset[]>()
  for (const p of RECON_PRESETS) {
    if (!byGroup.has(p.group)) {
      byGroup.set(p.group, [])
      order.push(p.group)
    }
    byGroup.get(p.group)!.push(p)
  }
  return order.map((group) => ({ group, items: byGroup.get(group)! }))
})()
