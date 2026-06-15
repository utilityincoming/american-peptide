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
  /** Internal tracked redirect path, e.g. "/go/<id>". */
  trackedPath?: string
  /** The destination referral/affiliate URL that trackedPath redirects to. */
  url?: string
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
export const VENDORS: Vendor[] = [
  {
    id: 'alpha-bio-med',
    name: 'Alpha Bio Med Labs',
    url: 'https://alphabiomedlabs.com',
    blurb:
      'US research-supply lab advertising 100% lot-level third-party HPLC/MS testing and >99% purity.',
    // Scoped to the GLP-1 / amylin set only: the affiliate link is a provider
    // ONBOARDING (/register) flow, not a general product link.
    peptides: ['tirzepatide', 'retatrutide', 'cagrilintide', 'semaglutide'],
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's own public claims (alphabiomedlabs.com),
      // NOT independently confirmed. Only flags they explicitly state are set.
      coaOnFile: false, // they tout lot-level testing, but customer COA access is unconfirmed
      thirdPartyTested: true, // "100% Lots Third-Party Tested" — HPLC + MS
      perBatchTesting: true, // "100% Lots" / lot-level traceability
      purityPct: 99, // ">99% Purity by HPLC"
      reshipPolicy: false, // not stated
      refundPolicy: true, // published "Refund and Order Resolution Policy"
    },
    affiliate: {
      trackedPath: '/go/alpha-bio-med',
      url: 'https://alphabiomedlabs.com/pages/register?ref=AmericanPeptides',
      code: 'AmericanPeptides',
      active: true,
    },
    notes:
      'Trust signals reflect the vendor’s own published claims, not independent verification. Request the third-party COA for your specific lot before any use.',
  },
  {
    id: 'modern-aminos',
    name: 'Modern Aminos',
    url: 'https://modernaminos.com',
    blurb:
      'US-made research compounds; every product third-party HPLC tested with a per-batch COA matched to each lot.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's own public claims (modernaminos.com),
      // NOT independently confirmed. Only flags they explicitly state are set.
      coaOnFile: true, // per-batch COA, customer-matchable to each lot
      thirdPartyTested: true, // "third-party testing with full HPLC documentation"
      perBatchTesting: true, // "Batch testing… match each peptide to its corresponding COA"
      purityPct: 99, // "99% Purity (HPLC)"
      reshipPolicy: true, // carrier-lost / non-delivered packages reshipped free
      refundPolicy: true, // published refund policy (restrictive — see notes)
    },
    affiliate: {
      trackedPath: '/go/modern-aminos',
      url: 'https://modernaminos.com?wlr_ref=REF-7E3-F9T',
      code: 'REF-7E3-F9T',
      active: true,
    },
    notes:
      'Refunds are restrictive: peptides are non-returnable, accepted returns carry a 15% restocking fee, and only carrier-lost (non-delivered) packages are reshipped free. Trust signals reflect the vendor’s published claims; verify the COA for your specific lot.',
  },
  {
    id: 'amino-club',
    name: 'Amino Club',
    url: 'https://aminoclub.com',
    blurb:
      'US research-peptide distributor; every batch ships a lot-matched third-party COA (MZ Biolabs / Janoshik) at ≥99% HPLC purity.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's public claims + third-party COAs (MZ Biolabs /
      // Janoshik report numbers are independently verifiable). Not personally
      // confirmed, but COAs are externally checkable — stronger than self-report.
      coaOnFile: true, // batch-specific, lot-matched COA available before purchase
      thirdPartyTested: true, // independent labs (MZ Biolabs / Janoshik), HPLC + MS
      perBatchTesting: true, // tests every new batch, not a single "golden batch"
      purityPct: 99, // "≥99% baseline" HPLC
      reshipPolicy: true, // lost/damaged/stolen packages reshipped free
      refundPolicy: true, // 60-day money-back guarantee
    },
    affiliate: {
      trackedPath: '/go/amino-club',
      url: 'https://aminoclub.com?utm_source=affiliate_marketing&code=AMERICANPEPTIDE',
      code: 'AMERICANPEPTIDE',
      active: true,
    },
    notes:
      'COAs are independently verifiable via the Janoshik / MZ Biolabs report number on each certificate — confirm the report for your specific lot. 60-day money-back guarantee; change-of-mind returns are excluded.',
  },
  {
    id: 'midwest-peptide',
    name: 'Midwest Peptide',
    url: 'https://midwestpeptide.com',
    blurb:
      'US research-peptide supplier; every batch ships a third-party COA (US lab Chromate / Janoshik) at ≥99% HPLC purity, free shipping.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's public claims + third-party COAs. Not
      // personally confirmed; Janoshik COAs are queryable by batch ID.
      coaOnFile: true, // every batch ships a traceable third-party COA
      thirdPartyTested: true, // independent US lab (Chromate); some via Janoshik
      perBatchTesting: true, // "every batch is third-party tested"
      purityPct: 99, // ">=99%", often >99.9%
      reshipPolicy: false, // damaged/defective replaced, but no stated carrier-lost reship
      refundPolicy: true, // 30-day return on unopened; refunds/replacements for defects
    },
    affiliate: {
      trackedPath: '/go/midwest-peptide',
      url: 'https://midwestpeptide.com/?ref=AMERICANPEPTIDE',
      code: 'AMERICANPEPTIDE',
      active: true,
    },
    notes:
      'COAs are batch-traceable (Janoshik certificates are publicly queryable by batch ID) — confirm the report for your specific lot. 30-day returns on unopened items; replacements for damaged/defective.',
  },
]

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

/**
 * The href to use when linking to a vendor.
 * Prefer the internal tracked redirect when an affiliate relationship is active
 * (keeps the referral param server-side and lets us attach disclosure +
 * rel="sponsored nofollow" at the link); otherwise the plain public homepage.
 */
export function vendorHref(v: Vendor): string {
  if (v.affiliate?.active && v.affiliate.trackedPath) return v.affiliate.trackedPath
  return v.url
}

/** Whether a vendor link is a disclosed affiliate link (needs FTC disclosure). */
export function isAffiliate(v: Vendor): boolean {
  return Boolean(v.affiliate?.active)
}
