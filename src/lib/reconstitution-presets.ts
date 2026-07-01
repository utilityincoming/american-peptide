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
// and dosed by mass (mcg/mg) are included; IU-dosed biologics (insulin, HCG, FSH,
// somatropin, EPO) and monoclonal antibodies are intentionally omitted because the
// mcg-on-a-U100-syringe model does not apply to them.

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

export const RECON_PRESETS: ReconPreset[] = [
  // ── Metabolic ─────────────────────────────────────────────
  { slug: 'semaglutide',  name: 'Semaglutide',  group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 250 },
  { slug: 'tirzepatide',  name: 'Tirzepatide',  group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 2500 },
  { slug: 'retatrutide',  name: 'Retatrutide',  group: 'Metabolic', vialMg: 10, waterMl: 2, doseMcg: 2000 },
  { slug: 'cagrilintide', name: 'Cagrilintide', group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 300 },
  { slug: 'aod-9604',     name: 'AOD-9604',     group: 'Metabolic', vialMg: 5,  waterMl: 2, doseMcg: 300 },

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

  // ── Healing & Repair ──────────────────────────────────────
  { slug: 'bpc-157', name: 'BPC-157', group: 'Healing & Repair', vialMg: 5, waterMl: 2, doseMcg: 250 },
  { slug: 'tb-500',  name: 'TB-500',  group: 'Healing & Repair', vialMg: 5, waterMl: 2, doseMcg: 2500 },
  { slug: 'kpv',     name: 'KPV',     group: 'Healing & Repair', vialMg: 5, waterMl: 2, doseMcg: 500 },

  // ── Cosmetic ──────────────────────────────────────────────
  { slug: 'ghk-cu',      name: 'GHK-Cu',      group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000 },
  { slug: 'ahk-cu',      name: 'AHK-Cu',      group: 'Cosmetic', vialMg: 50, waterMl: 5, doseMcg: 2000 },
  { slug: 'melanotan-2', name: 'Melanotan II', group: 'Cosmetic', vialMg: 10, waterMl: 2, doseMcg: 250 },
  { slug: 'melanotan-1', name: 'Afamelanotide', group: 'Cosmetic', vialMg: 10, waterMl: 2, doseMcg: 500 },

  // ── Cognitive ─────────────────────────────────────────────
  { slug: 'semax',  name: 'Semax',  group: 'Cognitive', vialMg: 10, waterMl: 2, doseMcg: 300, note: 'Often prepared for intranasal use.' },
  { slug: 'selank', name: 'Selank', group: 'Cognitive', vialMg: 10, waterMl: 2, doseMcg: 300, note: 'Often prepared for intranasal use.' },
  { slug: 'dsip',   name: 'DSIP',   group: 'Cognitive', vialMg: 5,  waterMl: 2, doseMcg: 100 },

  // ── Longevity & Mitochondrial ─────────────────────────────
  { slug: 'epitalon', name: 'Epitalon', group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },
  { slug: 'mots-c',   name: 'MOTS-c',   group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },
  { slug: 'ss-31',    name: 'SS-31',    group: 'Longevity & Mitochondrial', vialMg: 10, waterMl: 2, doseMcg: 5000 },

  // ── Reproductive ──────────────────────────────────────────
  { slug: 'pt-141',        name: 'PT-141',        group: 'Reproductive', vialMg: 10, waterMl: 2, doseMcg: 1000 },
  { slug: 'kisspeptin-10', name: 'Kisspeptin-10', group: 'Reproductive', vialMg: 5,  waterMl: 2, doseMcg: 100 },

  // ── Immune ────────────────────────────────────────────────
  { slug: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', group: 'Immune', vialMg: 5, waterMl: 2, doseMcg: 1600 },
  { slug: 'thymalin',         name: 'Thymalin',         group: 'Immune', vialMg: 10, waterMl: 2, doseMcg: 10000 },
  { slug: 'll-37',            name: 'LL-37',            group: 'Immune', vialMg: 5, waterMl: 2, doseMcg: 100 },
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
