import { getPeptideBySlug, type Peptide } from '@/lib/peptides'
import { getPk, halfLifeMidpoint } from '@/lib/pharmacokinetics'
import { RECON_PRESETS, RECON_PRESETS_CURATED_AT, type ReconPreset } from '@/lib/reconstitution-presets'
import { getPubchemVerification } from '@/lib/verification'
import { molecularFormulaClaim, molecularWeightClaim } from './index'
import {
  SCHEMA_VERSION,
  SCOPE_NOTES,
  computeEvidenceFloor,
  type Claim,
  type EvidenceFloor,
  type Provenance,
  type Tier,
} from './types'

// Bridge: the peptide catalog → claim tiers (Validation Tier Schema §7).
//
// A monograph carries two distinct categories of claims:
//   1. PRIMARY RESEARCH & IDENTITY CLAIMS:
//        • Identity (`reference`, REF): molecular weight and formula confirmed
//          against PubChem via ./index.ts.
//        • Primary Research Evidence (`clinical` CLIN or `preclinical` PRE):
//          the compound's highest verified empirical research tier (human trial /
//          PK / FDA evidence vs non-human preclinical literature).
//   2. OPTIONAL COMMUNITY / PROTOCOL NOTES (`community`, COMM):
//        • The calculator's reconstitution preset conventions (vial strength,
//          reconstitution volume, reference amount) from lib/reconstitution-presets.ts.
//        • Per §9 an unsourced convention defaults to `community` with its
//          dose_convention / community scope note.
//
// Separating primary load-bearing research claims from optional community preset
// conventions ensures Phase 3 / clinical compounds (e.g., Cagrilintide) surface
// `CLIN` as their primary load-bearing evidence floor alongside `REF` chemistry,
// rather than collapsing to `Evidence floor: Community (COMM 3)` while still
// displaying the `COMM 3` count cleanly in its own badge/tooltip.

/** Date of the catalog primary-evidence tier curation pass. */
export const CATALOG_RESEARCH_CURATED_AT = '2026-11-23'

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

const EXPLICIT_PRECLINICAL_RE =
  /\b(no\s+controlled\s+human|no\s+completed\s+human|evidence\s+base\s+is\s+preclinical|essentially\s+all\s+of\s+the\s+evidence\s+is\s+preclinical|preclinical\s+only|almost\s+entirely\s+preclinical|overwhelmingly\s+preclinical|remain[s]?\s+preclinical\s*\/\s*cosmetic)\b/i

const HUMAN_CLINICAL_SIGNAL_RE =
  /\b(Phase\s*[1234I]{1,3}\b|split-face\s+RCT|randomized\s+controlled\s+trial|REDEFINE|SURMOUNT|TRIUMPH|STEP[-\s]\d|COURAGE|EMBRAZE|NCT\d{8}|approved\s+in\s+(Russia|Japan|China|Europe|many\s+countries|several\s+countries)|used\s+clinically\s+in\s+Russia|early\s+human\s+study|human\s+studies|human\s+PK|historical[ly]?\s+(the\s+first\s+.*)?approved|approved\s+uses\s+\(historical\)|reached\s+late-stage\s+trials|clinical-trial\s+contexts|sarcoidosis-associated\s+small-fiber\s+neuropathy|hypothalamic\s+amenorrhea)\b/i

/**
 * Determine whether a catalog compound's highest verified primary research
 * evidence is `clinical` (human trial / PK / approved label) or `preclinical`
 * (in vitro / animal models), derived strictly from verified catalog and PK records.
 */
export function resolvePrimaryResearchTier(
  peptideOrSlug: Pick<Peptide, 'slug'> | Peptide,
): { tier: 'clinical' | 'preclinical'; method: string } {
  const full =
    'shortDescription' in peptideOrSlug
      ? peptideOrSlug
      : getPeptideBySlug(peptideOrSlug.slug)

  if (full?.fdaApproved) {
    return {
      tier: 'clinical',
      method: 'FDA-approved clinical indication and human registration trials',
    }
  }

  const allText = full
    ? [
        full.shortDescription ?? '',
        full.description ?? '',
        ...(full.background ?? []),
        ...(full.keyResearch ?? []),
        ...(full.faqs ?? []).map((f) => `${f.q} ${f.a}`),
      ].join(' ')
    : ''

  const explicitPreclinical = EXPLICIT_PRECLINICAL_RE.test(allText)
  if (!explicitPreclinical && HUMAN_CLINICAL_SIGNAL_RE.test(allText)) {
    return {
      tier: 'clinical',
      method: 'Peer-reviewed human clinical trial or human PK/PD literature',
    }
  }

  const pk = getPk(peptideOrSlug.slug)
  if (
    pk &&
    pk.halfLifeHours !== null &&
    !explicitPreclinical &&
    /\b(FDA\s+label|Phase-[I123]|human)\b/i.test(pk.sourceNote)
  ) {
    return {
      tier: 'clinical',
      method: pk.sourceNote,
    }
  }

  return {
    tier: 'preclinical',
    method: 'Preclinical (in vitro and animal model) research literature',
  }
}

/**
 * Primary empirical research claims for a catalog monograph (`CLIN` or `PRE`).
 * Includes the compound's primary pharmacodynamic research evidence claim and,
 * when a verified human half-life record exists in `lib/pharmacokinetics.ts`,
 * the pharmacokinetic elimination half-life claim.
 */
export function primaryResearchClaims(
  peptideOrSlug: Pick<Peptide, 'slug'> | Peptide,
): Claim[] {
  const full =
    'shortDescription' in peptideOrSlug
      ? peptideOrSlug
      : getPeptideBySlug(peptideOrSlug.slug)
  const slug = peptideOrSlug.slug
  const ver = getPubchemVerification(slug)
  const retrievedAt = ver?.checkedAt ?? CATALOG_RESEARCH_CURATED_AT
  const { tier, method } = resolvePrimaryResearchTier(full ?? peptideOrSlug)

  const claims: Claim[] = [
    {
      field: 'primary_research_evidence',
      value:
        tier === 'clinical'
          ? 'Human clinical trial / PK literature'
          : 'Preclinical model literature',
      tier,
      freshness: 'current',
      estimate_kind: 'pharmacodynamic',
      scope_note:
        tier === 'clinical'
          ? 'Peer-reviewed human clinical trial or clinical pharmacokinetic evidence. Educational reference, not medical advice.'
          : SCOPE_NOTES.preclinical,
      provenance: {
        source_type: tier === 'clinical' ? 'trial' : 'publication',
        source_name: full?.fdaApproved
          ? 'FDA label & peer-reviewed clinical trials'
          : tier === 'clinical'
            ? 'ClinicalTrials.gov / peer-reviewed human literature'
            : 'PubMed preclinical literature',
        source_url: `/catalog/${slug}`,
        retrieved_at: retrievedAt,
        method,
        schema_version: SCHEMA_VERSION,
      },
    },
  ]

  const pk = getPk(slug)
  if (pk && pk.halfLifeHours !== null) {
    const mid = halfLifeMidpoint(pk.halfLifeHours)
    claims.push({
      field: 'elimination_half_life',
      value: mid,
      unit: 'h',
      range: [pk.halfLifeHours.low, pk.halfLifeHours.high],
      tier,
      freshness: 'current',
      estimate_kind: 'pharmacokinetic',
      scope_note:
        tier === 'clinical'
          ? `${pk.sourceNote}. Educational reference estimate, not dosing guidance.`
          : SCOPE_NOTES.preclinical,
      provenance: {
        source_type: tier === 'clinical' ? 'trial' : 'publication',
        source_name: pk.sourceNote,
        source_url: `/catalog/${slug}`,
        retrieved_at: retrievedAt,
        method: 'Published elimination half-life range',
        schema_version: SCHEMA_VERSION,
      },
    })
  }

  return claims
}

/**
 * Every tiered claim a monograph renders:
 *   1. PubChem-verified identity claims (`REF`)
 *   2. Primary research claims (`CLIN` / `PRE`)
 *   3. Optional calculator preset community conventions (`COMM`), when present
 */
export function catalogClaims(peptide: Pick<Peptide, 'slug'> | Peptide): Claim[] {
  const preset = reconPresetFor(peptide.slug)
  return [
    ...identityClaims(peptide),
    ...primaryResearchClaims(peptide),
    ...(preset ? reconPresetClaims(preset) : []),
  ]
}

/**
 * Which claims count toward a monograph's primary evidence floor (§3):
 *   • Excludes `identity` (`REF`) scaffolding so the floor reflects empirical
 *     research evidence rather than molecular weight (§3).
 *   • Excludes optional calculator preset conventions (`community` tier with
 *     `dose_convention` or `commercial` estimate_kind) so optional sidebar
 *     calculator presets do not drag clinical/Phase 3 monographs down to
 *     `Evidence floor: Community`.
 */
export function isLoadBearing(claim: Claim): boolean {
  if (claim.estimate_kind === 'identity') return false
  if (
    claim.tier === 'community' &&
    (claim.estimate_kind === 'dose_convention' || claim.estimate_kind === 'commercial')
  ) {
    return false
  }
  return true
}

/** Predicate selecting optional community/protocol convention notes (`COMM`). */
export function isCommunityContextClaim(claim: Claim): boolean {
  return (
    claim.tier === 'community' &&
    (claim.estimate_kind === 'dose_convention' || claim.estimate_kind === 'commercial')
  )
}

export interface MonographEvidenceSummary {
  /** All claims on the monograph (identity + primary research + community presets). */
  allClaims: Claim[]
  /** Identity + primary research claims (`REF` + `CLIN`/`PRE`). */
  primaryClaims: Claim[]
  /** Optional community calculator preset claims (`COMM`). */
  communityClaims: Claim[]
  /** Load-bearing primary evidence floor (`CLIN` or `PRE`). */
  primaryFloor: EvidenceFloor | null
  /** Count of verified PubChem identity claims (`REF`). */
  referenceCount: number
  /** Count of optional community preset notes (`COMM`). */
  communityCount: number
  /** Highest verified primary research tier (`clinical` or `preclinical`). */
  researchTier: Tier
}

/**
 * Structured monograph evidence summary separating the load-bearing primary
 * research tier (`REF` chemistry + `CLIN`/`PRE` evidence) from optional
 * community/protocol preset conventions (`COMM`).
 */
export function monographEvidenceSummary(
  peptide: Pick<Peptide, 'slug'> | Peptide,
): MonographEvidenceSummary {
  const idClaims = identityClaims(peptide)
  const resClaims = primaryResearchClaims(peptide)
  const preset = reconPresetFor(peptide.slug)
  const commClaims = preset ? reconPresetClaims(preset) : []
  const primaryClaims = [...idClaims, ...resClaims]
  const allClaims = [...primaryClaims, ...commClaims]

  return {
    allClaims,
    primaryClaims,
    communityClaims: commClaims,
    primaryFloor: computeEvidenceFloor(primaryClaims, isLoadBearing),
    referenceCount: idClaims.length,
    communityCount: commClaims.length,
    researchTier: resClaims[0]?.tier ?? 'preclinical',
  }
}
