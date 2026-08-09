import type { Vendor, VendorTier } from '@/lib/vendors'
import { vendorTier } from '@/lib/vendors'
import { SCHEMA_VERSION, SCOPE_NOTES, type Claim, type Tier } from './types'

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
  return {
    field: 'listed_purity',
    value: pct ?? 'not stated',
    unit: pct != null ? '%' : undefined,
    tier,
    freshness: 'current',
    estimate_kind: 'purity',
    scope_note: documented ? SCOPE_NOTES.third_party : SCOPE_NOTES.vendor_reported,
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
