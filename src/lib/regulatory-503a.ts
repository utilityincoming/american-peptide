// Compounding status under section 503A of the Federal Food, Drug, and Cosmetic Act.
//
// WHY THIS EXISTS
// The single most consequential thing that changed for research peptides in
// 2024–2026 is not a trial readout — it is whether a licensed compounding
// pharmacy may legally prepare the substance at all. That status moved in
// opposite directions for the healing peptides (BPC-157, TB-500) and the
// GH-axis peptides (ipamorelin, CJC-1295), and almost nothing on the open web
// states it correctly. Reference pages that get it right are genuinely useful.
//
// WHAT THE CATEGORIES MEAN
//   Category 1 — nominated bulk substances FDA may allow in 503A compounding
//                while it evaluates them.
//   Category 2 — substances FDA identified as presenting significant safety
//                risks. In practice, not compoundable.
//   Neither    — removed from Category 2 but not yet placed on the 503A bulks
//                list. This is a genuine limbo, and it is where several of the
//                best-known research peptides sit right now.
//
// THE HARD PART, STATED PLAINLY
// Removal from Category 2 is NOT permission. The Pharmacy Compounding Advisory
// Committee (PCAC) recommendation is NOT permission, and is not binding on FDA.
// Legal 503A compounding requires FDA to place the substance on the bulks list
// through notice-and-comment rulemaking, which had not happened for any of
// these peptides as of the review date below. None of this is FDA APPROVAL of
// a drug, and none of it establishes efficacy, dosing, or a benefit-risk
// profile. Copy that blurs those steps is the failure mode to avoid.
//
// SOURCES are carried per entry so the claim and its provenance travel
// together — the same discipline as lib/evidence and the verification manifest.

/** Editorial review date for everything in this file. Drives the visible stamp. */
export const REGULATORY_REVIEWED = '2026-09-02'

export type CompoundingStatus =
  | 'copy-of-approved'
  | 'category-2'
  | 'removed-pending-rulemaking'
  | 'pcac-recommended'
  | 'pcac-declined'
  | 'approved-drug'
  | 'not-nominated'

export interface StatusStyle {
  label: string
  /** One line a reader can act on — what the status does and does not permit. */
  meaning: string
  tone: 'red' | 'amber' | 'green' | 'neutral'
}

export const STATUS_STYLES: Record<CompoundingStatus, StatusStyle> = {
  'copy-of-approved': {
    label: 'Approved drug — shortage compounding ended',
    meaning:
      'An approved product whose shortage has been resolved, so compounding an essentially-identical copy is no longer permitted.',
    tone: 'green',
  },
  'category-2': {
    label: 'Category 2',
    meaning:
      'FDA has identified significant safety risks. Not available through 503A compounding.',
    tone: 'red',
  },
  'removed-pending-rulemaking': {
    label: 'Removed from Category 2 — not yet permitted',
    meaning:
      'Off the safety-risk list, but not on the 503A bulks list. Compounding still requires rulemaking that has not occurred.',
    tone: 'amber',
  },
  'pcac-recommended': {
    label: 'Advisory committee recommended — rulemaking pending',
    meaning:
      'A non-binding PCAC majority favored 503A inclusion. FDA has not completed the rulemaking that would make compounding lawful.',
    tone: 'amber',
  },
  'pcac-declined': {
    label: 'Advisory committee voted against inclusion',
    meaning:
      'PCAC recommended against adding the substance to the 503A bulks list.',
    tone: 'red',
  },
  'approved-drug': {
    label: 'FDA-approved drug',
    meaning:
      'An approved product with a label, an indication, and an established benefit-risk profile.',
    tone: 'green',
  },
  'not-nominated': {
    label: 'Not on the 503A bulks docket',
    meaning:
      'Not among the substances nominated and reviewed for 503A compounding.',
    tone: 'neutral',
  },
}

export interface RegulatoryEntry {
  /** Catalog slug. */
  slug: string
  name: string
  status: CompoundingStatus
  /** The specific, checkable fact behind the status. */
  detail: string
  /** ISO date of the action that set the current status. */
  since?: string
  source: { label: string; url: string }
}

const FDA_CAT2 = {
  label: 'FDA — Certain Bulk Drug Substances That May Present Significant Safety Risks',
  url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
}

const PCAC_JULY_2026 = {
  label: 'FDA — Pharmacy Compounding Advisory Committee, July 23–24, 2026',
  url: 'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026',
}

const FDA_GLP1_COMPOUNDING = {
  label: 'FDA — Clarifying policies for compounders as GLP-1 supply stabilizes',
  url: 'https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize',
}

const PCAC_DEC_2024 = {
  label: 'FDA — Pharmacy Compounding Advisory Committee, December 4, 2024',
  url: 'https://www.fda.gov/media/184043/download',
}

export const REGULATORY: RegulatoryEntry[] = [
  // ── Healing / repair ──────────────────────────────────────────────────────
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    status: 'pcac-recommended',
    detail:
      'Added to Category 2 in September 2023 and removed on April 22, 2026. PCAC then voted 8–6, with one abstention, to recommend it for the 503A bulks list. The vote does not authorize compounding.',
    since: '2026-07-23',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    status: 'pcac-recommended',
    detail:
      'Nominated as the thymosin β4 fragment LKKTETQ. Removed from Category 2 on April 22, 2026; recommended by PCAC on the same 8–6 vote as BPC-157 and KPV.',
    since: '2026-07-23',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'kpv',
    name: 'KPV',
    status: 'pcac-recommended',
    detail:
      'Removed from Category 2 on April 22, 2026 and recommended by PCAC 8–6, with one abstention, on July 23, 2026.',
    since: '2026-07-23',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    status: 'removed-pending-rulemaking',
    detail:
      'Injectable GHK-Cu was placed in Category 2 in September 2023 and removed on April 22, 2026. It was not among the peptides reviewed at the July 2026 PCAC meeting. Topical cosmetic use is a separate regulatory question entirely.',
    since: '2026-04-22',
    source: FDA_CAT2,
  },
  {
    slug: 'mots-c',
    name: 'MOTS-c',
    status: 'pcac-recommended',
    detail:
      'Removed from Category 2 on April 22, 2026; PCAC recommended inclusion 7–5, with two abstentions, on July 23, 2026.',
    since: '2026-07-23',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'semax',
    name: 'Semax',
    status: 'pcac-recommended',
    detail:
      'The heptapeptide form was removed from Category 2 on April 22, 2026 and reviewed on the second day of the July 2026 PCAC meeting, which favored inclusion.',
    since: '2026-07-24',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'epitalon',
    name: 'Epitalon',
    status: 'pcac-recommended',
    detail:
      'Removed from Category 2 on April 22, 2026 and reviewed on July 24, 2026, where the committee favored inclusion.',
    since: '2026-07-24',
    source: PCAC_JULY_2026,
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    status: 'pcac-declined',
    detail:
      'Nominated as emideltide. Removed from Category 2 in April 2026, but on July 24, 2026 PCAC voted 7–6, with one abstention, against 503A inclusion — the only rejection of the meeting.',
    since: '2026-07-24',
    source: PCAC_JULY_2026,
  },

  // ── GH axis — the class that moved the other way ──────────────────────────
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    status: 'pcac-declined',
    detail:
      'Reviewed on October 29, 2024. FDA recommended against inclusion and PCAC voted against adding ipamorelin to the 503A bulks list. Ipamorelin acetate remains in Category 2 for 503B outsourcing facilities.',
    since: '2024-10-29',
    source: FDA_CAT2,
  },
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (no DAC)',
    status: 'pcac-declined',
    detail:
      'FDA proposed that the CJC-1295 salts and free bases, with and without DAC, not be included on the 503A bulks list. PCAC voted against inclusion on December 4, 2024.',
    since: '2024-12-04',
    source: PCAC_DEC_2024,
  },
  {
    slug: 'cjc-1295-with-dac',
    name: 'CJC-1295 (DAC)',
    status: 'pcac-declined',
    detail:
      'Covered by the same December 4, 2024 review and vote as the no-DAC form.',
    since: '2024-12-04',
    source: PCAC_DEC_2024,
  },
  {
    slug: 'mk-677',
    name: 'MK-677',
    status: 'category-2',
    detail:
      'Listed as ibutamoren mesylate, and one of the few substances flagged for both 503A and 503B. It remains on the Category 2 list.',
    since: '2026-04-22',
    source: FDA_CAT2,
  },
  {
    slug: 'ghrp-2',
    name: 'GHRP-2',
    status: 'category-2',
    detail:
      'Remains in Category 2 for 503B outsourcing facilities on the current list.',
    since: '2026-04-22',
    source: FDA_CAT2,
  },
  {
    slug: 'ghrp-6',
    name: 'GHRP-6',
    status: 'category-2',
    detail:
      'Remains in Category 2 for 503B outsourcing facilities on the current list.',
    since: '2026-04-22',
    source: FDA_CAT2,
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    status: 'pcac-declined',
    detail:
      'Removed from Category 2 in September 2024 after the nomination was withdrawn, then reviewed on December 4, 2024, where PCAC voted against 503A inclusion.',
    since: '2024-12-04',
    source: PCAC_DEC_2024,
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    status: 'approved-drug',
    detail:
      'Approved as Egrifta in 2010 for HIV-associated lipodystrophy. The compounding question does not arise in the same way for an approved product.',
    since: '2010-11-10',
    source: {
      label: 'FDA — Egrifta approval',
      url: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022505',
    },
  },
  {
    slug: 'sermorelin',
    name: 'Sermorelin',
    status: 'not-nominated',
    detail:
      'Approved as Geref in 1990 and later withdrawn from the market for commercial reasons. It does not appear on the current Category 2 list.',
    source: FDA_CAT2,
  },

  // ── Metabolic — a different legal route entirely ──────────────────────────
  // These are approved drugs, so the bulks list never applied. What governed
  // them is the rule against compounding an essentially-identical copy of a
  // commercially available product, which is suspended while a drug is in
  // shortage and resumes when the shortage is resolved.
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    status: 'copy-of-approved',
    detail:
      'FDA declared the shortage resolved on February 21, 2025. Enforcement discretion for compounded copies ended April 22, 2025 for 503A pharmacies and May 22, 2025 for 503B outsourcing facilities. In April 2026 FDA proposed excluding semaglutide from the 503B bulks list, finding no clinical need for bulk compounding.',
    since: '2025-04-22',
    source: FDA_GLP1_COMPOUNDING,
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    status: 'copy-of-approved',
    detail:
      'FDA declared the shortage resolved on December 19, 2024 — the first of the class. Enforcement discretion ended February 18, 2025 for 503A pharmacies and March 19, 2025 for 503B outsourcing facilities.',
    since: '2025-02-18',
    source: FDA_GLP1_COMPOUNDING,
  },
  {
    slug: 'liraglutide',
    name: 'Liraglutide',
    status: 'copy-of-approved',
    detail:
      'An approved drug covered by the same copy rule. FDA included it in the April 2026 proposal to exclude the GLP-1 drugs from the 503B bulks list.',
    since: '2026-04-30',
    source: FDA_GLP1_COMPOUNDING,
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    status: 'not-nominated',
    detail:
      'Investigational and not approved anywhere. There is no lawful compounding route for an investigational compound, and it is not on the 503A bulks docket.',
    source: FDA_GLP1_COMPOUNDING,
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  {
    slug: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    status: 'category-2',
    detail: 'Remains on the Category 2 list for 503A compounding.',
    since: '2026-04-22',
    source: FDA_CAT2,
  },
]

const BY_SLUG = new Map(REGULATORY.map((r) => [r.slug, r]))

export function regulatoryFor(slug: string): RegulatoryEntry | undefined {
  return BY_SLUG.get(slug)
}

/** Entries for a hub's compounds, in the order the hub lists them. */
export function regulatoryForAll(slugs: readonly string[]): RegulatoryEntry[] {
  return slugs.map((s) => BY_SLUG.get(s)).filter((r): r is RegulatoryEntry => r !== undefined)
}
