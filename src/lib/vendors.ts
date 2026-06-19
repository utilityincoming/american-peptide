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

// ── Trust tiers ─────────────────────────────────────────────────────────────────
// A legible HIERARCHY derived from the same transparency signals as trustScore —
// so a growing affiliate list groups into meaningful bands instead of one flat
// ranking. Tiers are presentational; trustScore remains the within-tier sort key.
// NEVER commission-based — placement is earned only by verifiable transparency.
//
//   documented → publishes third-party, per-batch COA (COA + 3rd-party + per-batch)
//   claimed    → states third-party testing OR COAs, not yet independently confirmed
//   unvetted   → insufficient public transparency signals to place higher
export type VendorTier = 'documented' | 'claimed' | 'unvetted'

export interface VendorTierMeta {
  id: VendorTier
  label: string
  blurb: string
}

/** Ordered best → least; drives grouping order in the UI. */
export const VENDOR_TIERS: VendorTierMeta[] = [
  {
    id: 'documented',
    label: 'Independently documented',
    blurb: 'Publishes a third-party, per-batch COA you can match to your specific lot.',
  },
  {
    id: 'claimed',
    label: 'Vendor-claimed testing',
    blurb: 'States third-party testing or COAs — not yet independently confirmed here.',
  },
  {
    id: 'unvetted',
    label: 'Unvetted',
    blurb: 'Insufficient public transparency signals to place higher.',
  },
]

/** Derive a vendor's trust tier from its transparency signals (never commission). */
export function vendorTier(v: Vendor): VendorTier {
  const t = v.trust
  if (t.coaOnFile && t.thirdPartyTested && t.perBatchTesting) return 'documented'
  if (t.thirdPartyTested || t.coaOnFile) return 'claimed'
  return 'unvetted'
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Adding an affiliate program (keep the discipline — this is the trust standard):
//   1. Capture the public homepage (`url`) AND the referral link separately.
//   2. Read the vendor's OWN published claims for each trust signal; set only the
//      flags they explicitly state. Never infer or fabricate. Note the source.
//   3. Put unverified / unconfirmed items in `notes` (e.g. lab unnamed, COA not
//      confirmed per-lot, refund terms unread).
//   4. Set affiliate.active = true to arm the /go/<id> redirect + FTC disclosure +
//      rel="sponsored nofollow". Leave false for a plain editorial reference.
//   5. trustScore() + vendorTier() rank and band it automatically — no manual
//      ordering. Verify with `npx tsc --noEmit`.
//
// Template for a new entry:
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
  {
    id: 'dynamic-peptide',
    name: 'Dynamic Peptide',
    url: 'https://dynamicpeptide.com',
    blurb:
      'US-made research peptides advertising per-batch independent HPLC/MS testing at >99% purity, with a COA on each product.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's published claims (surfaced via search; the
      // site blocks direct fetch). NOT independently confirmed. Only flags they
      // explicitly state are set.
      coaOnFile: true, // "Each product includes a Certificate of Analysis"
      thirdPartyTested: true, // "independent third-party testing using HPLC and MS"
      perBatchTesting: true, // "Every batch undergoes independent third-party testing"
      purityPct: 99, // "purity levels above 99%"
      reshipPolicy: false, // not stated
      refundPolicy: false, // not confirmed on the published material reviewed
    },
    affiliate: {
      trackedPath: '/go/dynamic-peptide',
      url: 'https://dynamicpeptide.com/aff/27/',
      active: true,
    },
    notes:
      'Trust signals reflect the vendor’s published claims (surfaced via search; the site blocks direct review), not independent verification. Testing lab is not named and refund/reship terms were not confirmed — request the third-party COA for your specific lot before any use.',
  },
  {
    id: 'apollo-peptide-sciences',
    name: 'Apollo Peptide Sciences',
    // Canonical homepage; the affiliate link below uses the apollopeptidescience.com
    // (singular) domain the referral was issued on, which 301s here with the param.
    url: 'https://apollopeptidesciences.com',
    blurb:
      'US research-peptide vendor that publishes COAs and states products are routinely third-party lab tested; ships USPS Priority/Express.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's own public claims (apollopeptidesciences.com),
      // NOT independently confirmed. Only flags they explicitly state are set.
      coaOnFile: true, // "You can see our COA's here"
      thirdPartyTested: true, // "routinely tested by the most trusted labs"
      perBatchTesting: false, // not stated as per-batch / lot-matched
      // purityPct omitted — no HPLC purity figure stated
      reshipPolicy: false, // not stated
      refundPolicy: true, // "complete satisfaction guarantee" + Refund and Returns Policy page
    },
    affiliate: {
      trackedPath: '/go/apollo-peptide-sciences',
      url: 'https://apollopeptidescience.com/?rfsn=9172552.14e196',
      active: true,
    },
    notes:
      'Trust signals reflect the vendor’s published claims, not independent verification. COAs are published but not confirmed as per-lot, no HPLC purity figure or testing lab is named — request and match the COA for your specific lot before any use.',
  },
  {
    id: 'swiss-chems',
    name: 'Swiss Chems',
    url: 'https://swisschems.is',
    blurb:
      'US-based broad research vendor (peptides, SARMs, PCT) advertising ISO/IEC-17025 third-party COAs (HPLC / LC-MS/MS / NMR) at >99% purity, with a test-it-yourself full-refund guarantee.',
    // Scoped to Swiss Chems' best-selling peptides that exist in our catalog.
    // They notably do NOT carry semaglutide or tirzepatide.
    peptides: [
      'bpc-157', 'tb-500', 'pt-141', 'ipamorelin', 'selank',
      'epitalon', 'mots-c', 'ghk-cu', 'retatrutide', 'melanotan-2',
    ],
    shipsTo: ['us', 'global'],
    trust: {
      // Sourced from the vendor's own public claims (swisschems.is), NOT
      // independently confirmed. Only flags they explicitly state are set.
      coaOnFile: true, // full COA ships per product (identity, purity, heavy metals, residual solvent)
      thirdPartyTested: true, // ISO/IEC-17025-accredited third-party labs; HPLC, LC-MS/MS, NMR
      perBatchTesting: false, // COA published per product but not stated as per-lot/batch-matched
      purityPct: 99, // ">99% purity"
      reshipPolicy: true, // "dissatisfied for any reason — reship or refund"
      refundPolicy: true, // test at any HPLC lab; full refund + shipping if it fails
    },
    affiliate: {
      trackedPath: '/go/swiss-chems',
      url: 'https://swisschems.is/ref/6835/',
      active: true,
    },
    notes:
      'Scoped to Swiss Chems’ best-selling peptides — they don’t carry semaglutide or tirzepatide. Standout policy: independently HPLC-test any product and they refund in full plus shipping if it fails. Caveat: independent peptide-testing reputation is mixed (Finnrick ~3.6/10 for peptides vs ~4.2/5 Trustpilot overall) despite the ISO-17025 COA claims — request and match the COA for your specific lot.',
  },
  {
    id: 'spartan-peptides',
    name: 'Spartan Peptides',
    url: 'https://spartanpeptides.com',
    blurb:
      'US research-peptide vendor publishing a per-batch third-party COA (HPLC + mass spec, signed by the analytical chemist) at ≥98% verified purity; same-day US dispatch.',
    peptides: 'all',
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's own public claims (spartanpeptides.com), NOT
      // independently confirmed. Only flags they explicitly state are set.
      coaOnFile: true, // "third-party Certificates of Analysis… view the original lab reports" for every compound
      thirdPartyTested: true, // "independently verified via HPLC and mass spectrometry"
      perBatchTesting: true, // "Every batch independently verified"
      purityPct: 98, // "≥98% HPLC-Verified Purity"
      reshipPolicy: false, // not stated
      refundPolicy: false, // not stated
    },
    affiliate: {
      trackedPath: '/go/spartan-peptides',
      url: 'https://spartanpeptides.com/?a_aid=AMERICANPEPTIDE',
      code: 'AMERICANPEPTIDE',
      active: true,
    },
    notes:
      'Trust signals reflect the vendor’s own published claims, not independent verification. Testing lab is unnamed; reship and refund terms are not stated; the stated purity bar is ≥98% (below the ≥99% several peers claim). Request and match the third-party COA for your specific lot before any use.',
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

/**
 * Vendors grouped into trust tiers (documented → claimed → unvetted), best-trust
 * first WITHIN each tier. Empty tiers are dropped. This is the dynamic hierarchy:
 * add a vendor and it self-files into the right band from its own signals — no
 * manual ordering. Pass a pre-filtered list (e.g. getVendorsForPeptide(slug)) to
 * tier a peptide-specific set.
 */
export function vendorsByTier(
  list: Vendor[] = vendorsRanked(),
): { tier: VendorTierMeta; vendors: Vendor[] }[] {
  return VENDOR_TIERS.map((tier) => ({
    tier,
    vendors: list.filter((v) => vendorTier(v) === tier.id),
  })).filter((group) => group.vendors.length > 0)
}
