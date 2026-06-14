// Vendor / affiliate directory for AmericanPeptide.com
//
// Forward-compatible scaffold for an affiliate-backed "where to source" layer.
// The platform does not sell peptides; this models EXTERNAL vendors so the site
// can point researchers to sources and — critically — rank them by the same
// trust signals the rest of the site champions (third-party COAs, independent
// testing, purity, policies) rather than by commission.
//
// Discipline, same as the catalog (see lib/peptides.ts): NO fabricated vendor,
// affiliate, or pricing data. VENDORS ships empty until real, verified entries
// are compiled.
//
// COMPLIANCE (not built yet — deferred until monetization is live): once an
// affiliate link is rendered, it requires (a) a clear FTC affiliate disclosure
// on every page that surfaces it, and (b) rel="sponsored nofollow" on the
// outbound link. The `affiliate.active` flag below is the intended gate for
// both. Until then, links are plain editorial references.

/** Region codes a vendor ships to (ISO-ish, plus 'global'). */
export type ShipRegion = 'us' | 'eu' | 'uk' | 'ca' | 'au' | 'asia' | 'global'

export interface VendorTrust {
  /** A third-party certificate of analysis is published / available on request. */
  coaOnFile: boolean
  /** Independent (not in-house) HPLC/MS purity testing. */
  thirdPartyTested: boolean
  /** Testing is per-batch, not a single reference COA reused across lots. */
  perBatchTesting: boolean
  /** Stated / verified purity, percent (e.g. 99). Omit if undisclosed. */
  purityPct?: number
  /** Reship-on-failure / lost-package policy exists. */
  reshipPolicy: boolean
  /** Refund / money-back policy exists. */
  refundPolicy: boolean
}

export interface VendorAffiliate {
  /** Internal tracked redirect path, e.g. "/go/<id>". Built later. */
  trackedPath?: string
  /** Coupon / referral code, if any. */
  code?: string
  /** True once a paid affiliate relationship is active — the disclosure gate. */
  active: boolean
}

export interface Vendor {
  id: string
  name: string
  /** Public homepage (NOT the affiliate link). */
  url: string
  /** One-line positioning. */
  blurb: string
  /** Peptide slugs this vendor is known to carry; 'all' for broad catalogs. */
  peptides: string[] | 'all'
  shipsTo: ShipRegion[]
  trust: VendorTrust
  affiliate?: VendorAffiliate
  /** Editorial caveats — what to watch for, what's unverified. */
  notes?: string
}

// ── Trust score ───────────────────────────────────────────────────────────────
// Transparent, tunable 0–100 score derived ONLY from verifiable transparency
// signals — never from commission. COA + independent testing dominate because
// they're the signals that actually protect a researcher. Weights sum to 100.
const TRUST_WEIGHTS = {
  coaOnFile: 30,
  thirdPartyTested: 30,
  perBatchTesting: 20,
  reshipPolicy: 10,
  refundPolicy: 10,
} as const

/** 0–100 trust score from a vendor's transparency signals. */
export function trustScore(v: Vendor): number {
  const t = v.trust
  let score = 0
  if (t.coaOnFile) score += TRUST_WEIGHTS.coaOnFile
  if (t.thirdPartyTested) score += TRUST_WEIGHTS.thirdPartyTested
  if (t.perBatchTesting) score += TRUST_WEIGHTS.perBatchTesting
  if (t.reshipPolicy) score += TRUST_WEIGHTS.reshipPolicy
  if (t.refundPolicy) score += TRUST_WEIGHTS.refundPolicy
  return score
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Empty until real entries are compiled and verified. Template for a new entry:
//
//   {
//     id: 'example-labs',
//     name: 'Example Labs',
//     url: 'https://example.com',
//     blurb: 'Research peptides with per-batch third-party COAs.',
//     peptides: ['bpc-157', 'tb-500'],          // or 'all'
//     shipsTo: ['us', 'global'],
//     trust: {
//       coaOnFile: true, thirdPartyTested: true, perBatchTesting: true,
//       purityPct: 99, reshipPolicy: true, refundPolicy: false,
//     },
//     affiliate: { trackedPath: '/go/example-labs', code: 'AMPEP', active: false },
//     notes: 'Verify the COA lot matches your vial before use.',
//   }
//
export const VENDORS: Vendor[] = []

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Vendors known to carry a given peptide, best-trust first. */
export function getVendorsForPeptide(slug: string): Vendor[] {
  return VENDORS.filter(
    (v) => v.peptides === 'all' || v.peptides.includes(slug),
  ).sort((a, b) => trustScore(b) - trustScore(a))
}

/** All vendors, best-trust first. */
export function vendorsRanked(): Vendor[] {
  return [...VENDORS].sort((a, b) => trustScore(b) - trustScore(a))
}
