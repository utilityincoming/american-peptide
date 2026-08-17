// Vendor / affiliate directory for AmericanPeptide.com
//
// Forward-compatible scaffold for an affiliate-backed "where to source" layer.
// The platform does not sell peptides; this models EXTERNAL vendors so the site
// can point researchers to sources and — critically — rank them by the same
// trust signals the rest of the site champions (third-party COAs, independent
// testing, purity, policies) rather than by commission.
//
// Discipline, same as the catalog (see lib/peptides.ts): NO fabricated vendor,
// affiliate, or pricing data. Every trust flag below is set from a claim the
// vendor actually publishes, with the source noted inline; anything unconfirmed
// goes in `notes` rather than into a flag.
//
// COMPLIANCE (live — monetization is active): a rendered affiliate link carries
// (a) a clear FTC affiliate disclosure on every surface that shows it, and
// (b) rel="sponsored nofollow" on the outbound anchor. `affiliate.active` is the
// gate for both; leave it false for a plain editorial reference. Paid prominence
// is a separate lever with its own rules — see Vendor.spotlight.

import { IS_APP_BUILD } from '@/lib/platform'
import { getPeptideBySlug, type SyntheticFeature } from '@/lib/peptides'

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
  /**
   * ISO date of the published COA this purity rests on, when the vendor dates it.
   * Feeds the purity claim's `retrieved_at` (Validation Tier Schema §4/§6) — the
   * freshness a sourcing forum never shows. Left unset until a real, dated COA is
   * on file; NEVER fabricated. Its absence is surfaced, not hidden.
   *
   * Both current vendors legitimately leave this unset, for OPPOSITE reasons, and
   * neither is a gap to be filled in later:
   *   - amino-club tests per batch, so the only meaningful date is the one on the
   *     buyer's own lot certificate. A single site-wide date would misdescribe it.
   *   - absim-peptides publishes one static COA image per product and states no
   *     purity figure at all, so there is no dated claim for a date to qualify.
   * A CMS upload timestamp is not a COA issue date — don't substitute one.
   */
  coaDate?: string
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
  /**
   * Per-compound referral links, keyed by catalog slug — a reader who clicks
   * from the GHK-Cu monograph lands on the vendor's GHK-Cu product page rather
   * than its homepage, with the referral intact.
   *
   * Resolved through the same /go/<id> chokepoint (with ?p=<slug>), never
   * emitted raw, so the redirect stays server-side and the destination is only
   * ever a value from this map — a slug we don't recognize falls back to `url`
   * rather than redirecting anywhere a caller names.
   *
   * Only add a slug whose deep link the partner actually supplied. A guessed
   * product URL is a broken landing page and an unpaid referral.
   */
  productUrls?: Record<string, string>
  /** Coupon / referral code, if any. */
  code?: string
  /**
   * Reader-facing offer this link carries, if any (e.g. a negotiated discount).
   * Keep it to the benefit — `code` renders directly beneath it, so the
   * mechanics do not need spelling out. Only promise what actually lands at
   * checkout: a reader who doesn't get this is a reader we spent the standard on.
   */
  offer?: string
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
  /**
   * Surface this vendor in the catalog "where to source" directory listings.
   * Defaults true. Set false for ONBOARDING partners that are surfaced only via
   * curated placements (e.g. the GLP-1 hub) and resolved through /go/<id> — they
   * should not also appear as a trust-ranked product tile in the catalog, where
   * a registration flow reads as just another "buy a vial" link.
   */
  directoryListed?: boolean
  /**
   * Catalog slugs where this vendor gets a PAID, PROMINENT placement — pinned
   * above the trust tiers and labeled "Featured partner".
   *
   * This is the one place commercial priority is allowed to move placement, and
   * the deal is that it is always disclosed:
   *   - it NEVER touches trustScore() or vendorTier() — the vendor's honest tier
   *     and score render on the featured card exactly as they do anywhere else;
   *   - the card is explicitly badged as a paid placement, not "best trust";
   *   - it is gated by canSpotlight() — a vendor in the 'unvetted' tier cannot
   *     buy prominence, no matter what.
   * Ranking below the pin stays purely transparency-derived.
   */
  spotlight?: string[]
  /**
   * Why this vendor holds the featured slot — the diligence a checkbox column
   * can't carry: who we know there, what their payment rails imply. Rendered on
   * the featured card next to the score, never in place of it. State the
   * finding, not the reasoning behind it: a sentence or two, specific and true.
   */
  spotlightNote?: string
  /** Editorial caveats — what to watch for, what's unverified. */
  notes?: string
}

// ── Trust score ───────────────────────────────────────────────────────────────
// Transparent, tunable 0–100 score derived ONLY from verifiable transparency
// signals — never from commission. Weighted toward what actually protects a
// buyer: fulfillment and recourse (reship on loss, a refund policy) count for
// more than lab paperwork. A published COA is by now a market-standard marketing
// signal, and per-lot matching is not the fraud shield it's sold as — real fraud
// in the established US market is low. Independent testing still counts; a static
// COA checkbox is not the whole of trust. Keys ordered high → low. Sum to 100.
export const TRUST_WEIGHTS = {
  reshipPolicy: 30,
  refundPolicy: 25,
  thirdPartyTested: 20,
  coaOnFile: 15,
  perBatchTesting: 10,
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
//   6. ONLY for a paid prominence deal: list the slugs it covers in `spotlight`.
//      That pins a labeled "Featured partner" card above the tiers and changes
//      nothing about the vendor's score, tier, or the ranking beneath it.
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
    id: 'biolongevity-labs',
    name: 'BioLongevity Labs',
    url: 'https://biolongevitylabs.com',
    blurb:
      'US-manufactured research peptides with a public, per-lot COA database — every product searchable by its own report number, tested by independent labs at 99% stated purity.',
    // Read off their public COA database (/all-coas/), which lists the exact
    // products they stock — a stronger source than marketing copy, since each
    // entry is backed by a report. Only single-compound vials that map to a
    // catalog entry are listed. DELIBERATELY EXCLUDED: their blends (GLOW,
    // KLOW, Regeno), BioStrips (a different delivery format), and the modified
    // analogs N-Acetyl Semax/Selank Amidate and PEG-MGF — a reader clicking
    // "Semax" should not land on a different molecule. Their catalog also runs
    // well beyond ours (Klotho, FLGR242, ARA-290, PNC-27, VIP, FOXO4-DRI and
    // most of the Khavinson bioregulator range); those simply have no monograph
    // here yet.
    peptides: [
      'bpc-157', 'tb-500', 'ghk-cu', 'kpv', 'ipamorelin', 'tesamorelin',
      'thymosin-alpha-1', 'mots-c', 'nad-plus', '5-amino-1mq', 'epitalon',
      'pt-141', 'dsip', 'll-37', 'melanotan-1', 'kisspeptin-10', 'oxytocin',
      'cagrilintide', 'pinealon', 'bronchogen', 'cardiogen', 'pancragen',
      'vesugen', 'vilon',
    ],
    shipsTo: ['us'],
    trust: {
      // Every flag below is a claim they publish themselves (homepage + the
      // /all-coas/ database + /shipping-and-payments/). Not independently
      // confirmed by us — but the COA database is externally checkable, which
      // is what separates this from self-report.
      coaOnFile: true, // public COA database, searchable per product
      thirdPartyTested: true, // "three independent, certified laboratories", HPLC + LC-MS
      perBatchTesting: true, // "Every batch undergoes independent testing… No exceptions" — the DB shows multiple distinct report numbers per product
      purityPct: 99, // "99% purity research peptides" via solid-phase synthesis
      // reshipPolicy FALSE: /shipping-and-payments/ promises a replacement only
      // when an order "is shipped incorrectly or the items received are not the
      // items ordered". That is a fulfillment-error remedy, not the lost- or
      // stolen-package guarantee this flag means. They state no such policy.
      reshipPolicy: false,
      // refundPolicy FALSE, and stated plainly by them: "Due to regulations
      // regarding the sale of our products, returns are prohibited." The 10-day
      // return window on their site covers SUPPLEMENTS, a separate product line
      // on a separate storefront — it does not apply to research peptides.
      refundPolicy: false,
    },
    affiliate: {
      trackedPath: '/go/biolongevity-labs',
      url: 'https://go.biolongevitylabs.com/aff_c?offer_id=1&aff_id=2788',
      // Partner-supplied deep links only. Everything else in `peptides` routes
      // to the homepage link above until they provide a url_id for it.
      productUrls: {
        'bpc-157': 'https://go.biolongevitylabs.com/aff_c?offer_id=1&aff_id=2788&url_id=85',
        'ghk-cu': 'https://go.biolongevitylabs.com/aff_c?offer_id=1&aff_id=2788&url_id=112',
        'tb-500': 'https://go.biolongevitylabs.com/aff_c?offer_id=1&aff_id=2788&url_id=100',
      },
      active: true,
    },
    notes:
      'Returns are prohibited on research peptides and no lost-package guarantee is published, so the recourse if an order goes wrong is thinner than the lab documentation suggests — pay by a method that gives you a chargeback. Match the COA report number in their public database to the lot on your vial before use.',
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
    id: 'absim-peptides',
    name: 'ABSIM Peptides',
    url: 'https://absimpeptides.com',
    blurb:
      'US research-peptide supplier publishing a certificate of analysis on every product listing; cGMP-compliant manufacturing, free US shipping over $200.',
    // Scoped to the products ABSIM actually lists (25 SKUs) that exist in our
    // catalog. They notably do NOT carry semaglutide, tirzepatide, or
    // retatrutide.
    peptides: [
      'bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295-no-dac',
      'tesamorelin', 'sermorelin', 'mots-c', 'ss-31', 'nad-plus',
      'aod-9604', 'epitalon', 'semax', 'selank', 'dsip', 'pt-141', 'kpv',
    ],
    shipsTo: ['us'],
    trust: {
      // Sourced from the vendor's own published pages (homepage, /about, /faq,
      // /shipping-policy, /refunds-returns) and the "Certificate of Analysis"
      // tab on each product page. NOT independently confirmed. Only flags they
      // explicitly state are set.
      coaOnFile: true, // every product page publishes a COA under a dedicated tab
      thirdPartyTested: false, // "tested to meet strict quality standards" — no independent lab claimed or named
      perBatchTesting: false, // one static COA image per product (e.g. BPC-157-1.jpg), not lot-matched
      // purityPct omitted — no HPLC purity figure stated anywhere in site copy
      reshipPolicy: false, // no reship guarantee; carrier-claim process only, and porch theft explicitly disclaimed
      refundPolicy: true, // published Refunds and Returns policy (wrong item / defect / damage, within 7 days)
    },
    affiliate: {
      trackedPath: '/go/absim-peptides',
      url: 'https://absimpeptides.com/?ref=americanpeptide',
      // Works both ways per the partner: the link carries the discount, and the
      // same string is a live coupon at checkout. Publishing the code as well as
      // the link means a reader still gets the 20% if the referral doesn't stick.
      code: 'AMERICANPEPTIDE',
      offer: '20% off your order.',
      active: true,
    },
    spotlightNote:
      'Vetted by relationship as well as paperwork. We know the US-based operators directly, and they ship stateside and accept major credit cards — a card processor underwrote this business, so your chargeback protection rides along with every order.',
    // PAID placement, gated + labeled — see Vendor.spotlight. Covers every
    // compound they actually stock: the bodybuilding / recovery / GH-axis and
    // top sellers first, plus the nootropic and longevity SKUs, so the featured
    // card follows them across the catalog and the class-landing sidebars.
    spotlight: [
      'bpc-157', 'tb-500', 'ipamorelin', 'cjc-1295-no-dac', 'tesamorelin',
      'sermorelin', 'ghk-cu', 'mots-c', 'aod-9604', 'nad-plus', 'pt-141',
      'ss-31', 'epitalon', 'semax', 'selank', 'dsip', 'kpv',
    ],
    notes:
      'Checkout requires an account; returns are accepted within 7 days with photos.',
  },
]

// ── What "all" actually means ─────────────────────────────────────────────────
//
// `peptides: 'all'` is a claim WE make on a broad-catalog vendor's behalf — a
// shorthand for "stocks the research-peptide market", not a per-SKU list they
// published. Taken literally it credits a research-peptide distributor with
// carrying every entry in the catalog, including compounds nobody sells that
// way: recombinant biologics grown in bioreactors, monoclonal antibodies, and
// the endogenous hormones the catalog documents for reference. Rendering
// "where to source" on those pages asserts availability we never verified,
// which is precisely the unearned claim the rest of this file exists to refuse.
//
// So 'all' is bounded by what the CATALOG DATA already knows, rather than by a
// hand-maintained list that would silently rot as entries are added:
//
//   1. The `peptide-hormone` class — native hormones carried for synthesis and
//      medicinal-chemistry education. That class page says in its own words that
//      it is not purchasing guidance; this makes the sourcing layer agree.
//   2. Compounds whose synthetic route is not peptide synthesis at all —
//      `Recombinant protein` and `Monoclonal antibody`. A peptide distributor
//      does not run a mammalian-cell expression line.
//
// Deliberately still covered: `Small molecule` (NAD+ and 5-amino-1MQ are staples
// of exactly these catalogs) and `Tissue extract` (the bioregulator market).
// Excluding those would under-claim, which is its own kind of wrong.
//
// This bounds ONLY the 'all' shorthand. An explicit `peptides: [...]` list is
// the vendor's own published claim and is always honored verbatim — if a vendor
// states it carries insulin, that is their statement to make, not ours.

const NON_PEPTIDE_ROUTES: SyntheticFeature[] = [
  'Recombinant protein',
  'Monoclonal antibody',
]

/**
 * Whether a broad-catalog ('all') vendor can be credited with carrying `slug`.
 * Unknown slugs stay covered — absence from the catalog is not evidence about
 * how a compound is made, and every real caller passes a catalog slug.
 */
export function coveredByBroadCatalog(slug: string): boolean {
  const p = getPeptideBySlug(slug)
  if (!p) return true
  if (p.categories.includes('peptide-hormone')) return false
  return !p.syntheticFeatures?.some((f) => NON_PEPTIDE_ROUTES.includes(f))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Vendors known to carry a given peptide, best-trust first. */
export function getVendorsForPeptide(slug: string): Vendor[] {
  // Reference-only on the Play (TWA) build: no outbound vendor/affiliate links.
  if (IS_APP_BUILD) return []
  return VENDORS.filter(
    (v) =>
      v.directoryListed !== false &&
      (v.peptides === 'all'
        ? coveredByBroadCatalog(slug)
        : v.peptides.includes(slug)),
  ).sort((a, b) => trustScore(b) - trustScore(a))
}

/**
 * Minimum vendors a compound needs before a /sources page earns its place. A
 * one-row "ranking" isn't a comparison, so single-vendor compounds get no page.
 */
export const SOURCING_PAGE_MIN_VENDORS = 2

/**
 * Whether a compound has a real field to rank — the single gate behind the
 * /sources index, its static params, the sitemap, and the monograph's deep link.
 * Keeping one definition is what stops a link from pointing at a 404.
 */
export function hasSourcingPage(slug: string): boolean {
  return getVendorsForPeptide(slug).length >= SOURCING_PAGE_MIN_VENDORS
}

/** All directory-listed vendors, best-trust first. */
export function vendorsRanked(): Vendor[] {
  // Reference-only on the Play (TWA) build: no outbound vendor/affiliate links.
  if (IS_APP_BUILD) return []
  return VENDORS.filter((v) => v.directoryListed !== false).sort(
    (a, b) => trustScore(b) - trustScore(a),
  )
}

/**
 * A single vendor by id, for curated ONBOARDING placements outside the catalog
 * directory (e.g. the GLP-1 hub). Returns undefined on the Play (TWA) build so
 * onboarding callers fall back to a non-affiliate placeholder — matching the
 * directory's reference-only behavior there.
 */
export function getVendor(id: string): Vendor | undefined {
  if (IS_APP_BUILD) return undefined
  return VENDORS.find((v) => v.id === id)
}

/**
 * The href to use when linking to a vendor.
 * Prefer the internal tracked redirect when an affiliate relationship is active
 * (keeps the referral param server-side and lets us attach disclosure +
 * rel="sponsored nofollow" at the link); otherwise the plain public homepage.
 *
 * Pass the compound the reader is looking at and, where the partner supplied a
 * deep link for it, the redirect lands on that product page instead of the
 * homepage — the difference between "here's a store that has it" and "here's
 * the thing you were reading about". Slugs without a deep link fall through to
 * the vendor's normal destination, so passing one is always safe.
 */
export function vendorHref(v: Vendor, slug?: string): string {
  if (v.affiliate?.active && v.affiliate.trackedPath) {
    return slug && v.affiliate.productUrls?.[slug]
      ? `${v.affiliate.trackedPath}?p=${encodeURIComponent(slug)}`
      : v.affiliate.trackedPath
  }
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

// ── Featured (paid) placement ─────────────────────────────────────────────────
// The single commercial lever on placement, and it is fenced in:
//   1. eligibility is earned, not bought — an 'unvetted' vendor can never be
//      featured, so the floor is "publishes COAs or states third-party testing";
//   2. the placement is labeled as paid wherever it renders, never as "best trust";
//   3. trustScore() and vendorTier() are untouched, so the ranking underneath —
//      and the vendor's own score on the featured card — stay honest.

/** Whether a vendor is eligible to hold a paid featured placement at all. */
export function canSpotlight(v: Vendor): boolean {
  return Boolean(v.affiliate?.active) && vendorTier(v) !== 'unvetted'
}

/**
 * The featured partner for a catalog slug, if one is both booked and eligible.
 * Returns undefined on the Play (TWA) build — no outbound vendor links there.
 */
export function getSpotlightVendor(slug: string): Vendor | undefined {
  if (IS_APP_BUILD) return undefined
  return VENDORS.find((v) => v.spotlight?.includes(slug) && canSpotlight(v))
}
