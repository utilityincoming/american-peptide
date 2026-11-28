import type { Vendor, VendorTier } from '@/lib/vendors'
import {
  VENDOR_TIERS,
  getSpotlightVendor,
  getVendorsForPeptide,
  hasSourcingPage,
  trustScore,
  vendorTier,
  type VendorTierMeta,
} from '@/lib/vendors'
import { getPubchemVerification } from '@/lib/verification'
import { molecularFormulaClaim, molecularWeightClaim } from './index'
import {
  SCHEMA_VERSION,
  SCOPE_NOTES,
  TIERS,
  computeEvidenceFloor,
  freshnessFor,
  type Claim,
  type EvidenceFloor,
  type Freshness,
  type Tier,
} from './types'

// Bridge: AmericanPeptide's vendor trust bands (lib/vendors.ts) → claim tiers.
// This is the Validation Tier Schema §7 principle applied to sourcing — a
// vendor's verifiable transparency signals decide the TIER of the purity claim
// it can back, so the trust indicator IS the tier badge rather than a separate
// invented score. `trustScore` is not discarded: it remains the WITHIN-tier sort
// key (§6 — rank by tier weight first, value/score second).

const VENDOR_TIER_TO_CLAIM: Record<VendorTier, Tier> = {
  documented: 'third_party', // publishes an independent, per-batch COA
  claimed: 'vendor_reported', // states its own testing, not independently confirmed
  unvetted: 'community', // no verifiable transparency signal to place higher
}

/** The claim tier a vendor's purity figure earns from its transparency band. */
export function vendorClaimTier(v: Vendor): Tier {
  return VENDOR_TIER_TO_CLAIM[vendorTier(v)]
}

/**
 * The purity claim a vendor backs, tiered by its transparency band. `value` is
 * the stated purity percent, or 'not stated' when the vendor publishes none.
 * `retrieved_at` carries the COA date when the vendor dates it — usually absent,
 * which the aggregator surfaces (an undated COA is a weaker claim) rather than
 * papering over with a fabricated date.
 */
export function vendorPurityClaim(v: Vendor): Claim {
  const tier = vendorClaimTier(v)
  const documented = tier === 'third_party'
  const pct = v.trust.purityPct
  const scopeNote =
    tier === 'third_party'
      ? SCOPE_NOTES.third_party
      : tier === 'vendor_reported'
        ? SCOPE_NOTES.vendor_reported
        : SCOPE_NOTES.community
  return {
    field: 'listed_purity',
    value: pct ?? 'not stated',
    unit: pct != null ? '%' : undefined,
    tier,
    freshness: 'current',
    estimate_kind: 'purity',
    scope_note: scopeNote,
    provenance: {
      source_type: documented ? 'assay' : 'vendor',
      source_name: v.name,
      method: documented
        ? 'independent HPLC/MS (vendor-published COA)'
        : 'vendor-stated purity',
      retrieved_at: v.trust.coaDate ?? '',
      schema_version: SCHEMA_VERSION,
    },
  }
}

export interface ReconciledVendorSource {
  vendor: Vendor
  band: VendorTier
  claim: Claim
  tier: Tier
  shortTier: string
  trustScore: number
  explicitCoverage: boolean
  featured: boolean
  freshness: Freshness
}

export interface ReconciledTierBand {
  band: VendorTierMeta
  claimTier: Tier
  sources: ReconciledVendorSource[]
}

export interface CompoundSourceReconciliation {
  slug: string
  /** True when at least one verified vendor record is reconciled for this compound. */
  isReconciled: boolean
  /** True when the compound meets the threshold for a dedicated `/sources/[slug]` comparison page. */
  hasSourcingPage: boolean
  /** Reference-tier PubChem identity claims (`REF`), kept orthogonal to the sourcing floor. */
  identityClaims: Claim[]
  /** Highest identity tier (`reference`) when PubChem-verified, else null. */
  identityTier: Tier | null
  /** Reconciled vendor purity claims sorted by tier weight then trustScore. */
  sources: ReconciledVendorSource[]
  /** Reconciled sources grouped by vendor transparency band (`3P` → `VEN` → `COMM`). */
  groups: ReconciledTierBand[]
  /** Load-bearing sourcing purity claims (`3P` / `VEN` / `COMM`). Empty when unreconciled. */
  purityClaims: Claim[]
  /** Highest sourcing tier available for this compound, or null when unreconciled. */
  topSourceTier: Tier | null
  /** Weakest load-bearing sourcing floor (`computeEvidenceFloor(purityClaims)`), or null when unreconciled. */
  sourcingFloor: EvidenceFloor | null
  /** Count of reconciled sources per claim tier (`third_party`, `vendor_reported`, `community`). */
  tierCounts: Partial<Record<Tier, number>>
}

/**
 * Generalized GHK-Cu vendor/tier reconciliation helper.
 *
 * Reconciles a catalog compound's reference-tier chemistry (`REF`) with any
 * verified vendor source records (`3P` / `VEN` / `COMM`) in `lib/vendors.ts`.
 * Additional compounds automatically opt into `3P` / `VEN` / `COMM` tier badges
 * as verified vendor records are added, while compounds without vendor coverage
 * remain cleanly unpopulated (`isReconciled: false`, `sources: []`,
 * `sourcingFloor: null`) with zero fabricated vendor data.
 */
export function reconcileCompoundSources(
  slug: string,
  options?: { vendors?: Vendor[]; now?: number },
): CompoundSourceReconciliation {
  const now = options?.now ?? Date.now()
  const verification = getPubchemVerification(slug)
  const idClaims: Claim[] = []
  if (verification) {
    const mw = molecularWeightClaim(verification)
    const mf = molecularFormulaClaim(verification)
    if (mw) idClaims.push(mw)
    if (mf) idClaims.push(mf)
  }

  const rawVendors = options?.vendors ?? getVendorsForPeptide(slug)
  const spotlight = getSpotlightVendor(slug)

  // Sort by claim tier weight descending, then trustScore descending (§6)
  const sortedVendors = [...rawVendors].sort((a, b) => {
    const wDiff = TIERS[vendorClaimTier(b)].weight - TIERS[vendorClaimTier(a)].weight
    if (wDiff !== 0) return wDiff
    return trustScore(b) - trustScore(a)
  })

  const sources: ReconciledVendorSource[] = sortedVendors.map((vendor) => {
    const claim = vendorPurityClaim(vendor)
    const explicitCoverage =
      (Array.isArray(vendor.peptides) && vendor.peptides.includes(slug)) ||
      Boolean(vendor.affiliate?.productUrls?.[slug])
    return {
      vendor,
      band: vendorTier(vendor),
      claim,
      tier: claim.tier,
      shortTier: TIERS[claim.tier].short,
      trustScore: trustScore(vendor),
      explicitCoverage,
      featured: spotlight?.id === vendor.id,
      freshness: freshnessFor(claim, now),
    }
  })

  const groups: ReconciledTierBand[] = VENDOR_TIERS.map((band) => {
    const bandSources = sources.filter((s) => s.band === band.id)
    return {
      band,
      claimTier: VENDOR_TIER_TO_CLAIM[band.id],
      sources: bandSources,
    }
  }).filter((g) => g.sources.length > 0)

  const purityClaims = sources.map((s) => s.claim)
  const sourcingFloor = computeEvidenceFloor(purityClaims)
  const topSourceTier = sources.length > 0 ? sources[0].tier : null

  const tierCounts: Partial<Record<Tier, number>> = {}
  for (const s of sources) {
    tierCounts[s.tier] = (tierCounts[s.tier] ?? 0) + 1
  }

  return {
    slug,
    isReconciled: sources.length > 0,
    hasSourcingPage: options?.vendors
      ? sources.length >= 2
      : hasSourcingPage(slug),
    identityClaims: idClaims,
    identityTier: idClaims[0]?.tier ?? null,
    sources,
    groups,
    purityClaims,
    topSourceTier,
    sourcingFloor,
    tierCounts,
  }
}
