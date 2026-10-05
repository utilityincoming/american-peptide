import type { Peptide } from '@/lib/peptides'
import { RECON_PRESETS, RECON_PRESETS_CURATED_AT, type ReconPreset } from '@/lib/reconstitution-presets'
import { getPubchemVerification } from '@/lib/verification'
import { molecularFormulaClaim, molecularWeightClaim } from './index'
import { SCHEMA_VERSION, SCOPE_NOTES, type Claim, type Provenance } from './types'

// Bridge: the peptide catalog → claim tiers (Validation Tier Schema §7).
//
// A monograph carries two kinds of numbers. Its IDENTITY (molecular weight,
// formula) is cross-checked against PubChem and lifts to `reference` through the
// registry bridge in ./index.ts. Its REFERENCE FIGURES — the vial strength,
// reconstitution volume, and per-administration amount the calculator seeds
// from lib/reconstitution-presets.ts — are curated from what is commonly
// supplied and commonly cited, with no per-figure citation behind them. Per §9
// an unsourced number defaults to `community`: it is the honest home for "what
// is commonly done", and the dose_convention scope note says exactly what that
// does and does not license. Upgrading a figure to `clinical` or `preclinical`
// is a data change (add the source), never a presentational one.

/** Provenance shared by every preset-derived figure: dated to the presets'
 *  last curation pass so the badge shows when the convention was last reviewed. */
export function provenanceFromReconPresets(): Provenance {
  return {
    source_type: 'aggregate',
    source_name: 'AmericanPeptide reconstitution presets',
    source_url: '/tools/reconstitution-calculator',
    retrieved_at: RECON_PRESETS_CURATED_AT,
    method: 'curated from common supply formats and cited research amounts',
    schema_version: SCHEMA_VERSION,
  }
}

/** The preset for a catalog slug, if the compound is dosed by mass. */
export function reconPresetFor(slug: string): ReconPreset | undefined {
  return RECON_PRESETS.find((p) => p.slug === slug)
}

/**
 * Claims derived from a reconstitution preset. The amount is a
 * `dose_convention`; vial strength and volume describe how the compound is
 * supplied, so they are `commercial` quantities (and therefore revalidate on
 * the 30-day commercial window, §4).
 */
export function reconPresetClaims(preset: ReconPreset): Claim<number>[] {
  const provenance = provenanceFromReconPresets()
  return [
    {
      field: 'reference_amount',
      value: preset.doseMcg,
      unit: 'mcg',
      tier: 'community',
      freshness: 'current',
      estimate_kind: 'dose_convention',
      scope_note: SCOPE_NOTES.dose_convention,
      provenance,
    },
    {
      field: 'common_vial_strength',
      value: preset.vialMg,
      unit: 'mg',
      tier: 'community',
      freshness: 'current',
      estimate_kind: 'commercial',
      scope_note: SCOPE_NOTES.community,
      provenance,
    },
    {
      field: 'typical_reconstitution_volume',
      value: preset.waterMl,
      unit: 'mL',
      tier: 'community',
      freshness: 'current',
      estimate_kind: 'commercial',
      scope_note: SCOPE_NOTES.community,
      provenance,
    },
  ]
}

/** Identity claims (molecular weight, formula) for a verified compound. */
export function identityClaims(peptide: Pick<Peptide, 'slug'>): Claim[] {
  const rec = getPubchemVerification(peptide.slug)
  const out: Claim[] = []
  const mw = molecularWeightClaim(rec)
  const mf = molecularFormulaClaim(rec)
  if (mw) out.push(mw)
  if (mf) out.push(mf)
  return out
}

/** Every tiered claim a monograph renders, identity first. */
export function catalogClaims(peptide: Pick<Peptide, 'slug'>): Claim[] {
  const preset = reconPresetFor(peptide.slug)
  return [...identityClaims(peptide), ...(preset ? reconPresetClaims(preset) : [])]
}

/**
 * Which claims count toward a monograph's evidence floor (§3). Identity is
 * excluded: a page's floor should reflect its empirical figures, not that its
 * molecular weight matches PubChem. With nothing empirical on the page the
 * floor is null and the chip stays hidden — no floor is claimed for a page that
 * carries no load-bearing number.
 */
export function isLoadBearing(claim: Claim): boolean {
  return claim.estimate_kind !== 'identity'
}
