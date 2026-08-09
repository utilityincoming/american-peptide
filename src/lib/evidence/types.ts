// lib/evidence — the Validation Tier Schema, v0.1.0
// ---------------------------------------------------------------------------
// A shared evidence-tiering standard for AmericanPeptide.com and
// peptidehormone.com. Every factual claim rendered on either property carries a
// tier, a scope note, and a provenance record. Nothing ships as a bare number.
//
// This module MIRRORS peptidehormone's src/lib/evidence/types.ts — same schema,
// same weights, same helpers. Keep the two in sync (like lib/network.ts's
// slug-mirrors). Only the comments below and the presentational token mapping in
// components/evidence/tierStyles.ts are property-specific.
//
// CORE PRINCIPLE — tier the CLAIM, not the compound. A molecule is never
// "tier 3": its molecular weight is `reference`, its rodent half-life is
// `preclinical`, a vendor's stated purity is `vendor_reported`. The tier
// describes PROVENANCE, not confidence. Downgrade is free; upgrade needs a source.
//
// HOW IT RECONCILES AmericanPeptide's existing trust surfaces:
//   • lib/verification.ts (PUBCHEM_VERIFIED) — deterministic PubChem identity
//     lookups. These are `reference`-tier claims; see provenanceFromPubchemVerification
//     in ./index.ts.
//   • lib/vendors.ts (VendorTier: documented | claimed | unvetted) — a
//     VENDOR-level trust band. It maps onto CLAIM tiers: a `documented` vendor
//     backs a `third_party` purity claim, a `claimed` vendor a `vendor_reported`
//     one, an `unvetted` one only `community` signal. Wiring that bridge is the
//     GHK-Cu aggregator step; this scaffold does not touch vendors.ts.
//   • /learn/evidence-hierarchy — a study-DESIGN ladder (in vitro → Phase 3 →
//     approval). That is a DIFFERENT axis from provenance tier; don't conflate.
//     A `clinical`-tier claim can rest on any human-trial phase; the phase is the
//     study's strength, the tier is where this specific number came from.

export const SCHEMA_VERSION = '0.1.0' as const
export type SchemaVersion = typeof SCHEMA_VERSION

// ── Tiers ──────────────────────────────────────────────────────────────────
// Weight orders claims in comparison tables (§6): a `third_party` purity figure
// always outranks a `vendor_reported` one regardless of the number.

export const TIERS = {
  reference: { weight: 60, label: 'Reference', short: 'REF' },
  clinical: { weight: 50, label: 'Clinical', short: 'CLIN' },
  preclinical: { weight: 40, label: 'Preclinical', short: 'PRE' },
  third_party: { weight: 30, label: 'Third-party', short: '3P' },
  vendor_reported: { weight: 20, label: 'Vendor-reported', short: 'VEN' },
  community: { weight: 10, label: 'Community', short: 'COMM' },
} as const

export type Tier = keyof typeof TIERS

/** Tiers strongest → weakest. Comparison tables sort by this. */
export const TIER_ORDER: Tier[] = (Object.keys(TIERS) as Tier[]).sort(
  (a, b) => TIERS[b].weight - TIERS[a].weight,
)

export function tierWeight(tier: Tier): number {
  return TIERS[tier].weight
}

// ── Freshness (orthogonal to tier) ───────────────────────────────────────────
export type Freshness = 'current' | 'stale' | 'superseded' | 'retracted'

// ── Estimate kind — what KIND of quantity a claim is. Drives units + freshness.
export type EstimateKind =
  | 'identity' // MW, formula, sequence, CID
  | 'computed' // pI, molar equivalence, reconstitution volume
  | 'pharmacokinetic' // t½, Tmax, Cmax, bioavailability, clearance
  | 'pharmacodynamic' // Ki, EC50, IC50, receptor selectivity
  | 'purity' // assay %, peptide content %
  | 'dose_convention' // reported protocol ranges — never a recommendation
  | 'commercial' // price, availability, MOQ

// ── Records ──────────────────────────────────────────────────────────────────

export interface Provenance {
  source_type: 'registry' | 'publication' | 'trial' | 'assay' | 'vendor' | 'aggregate'
  source_name: string // "PubChem", "ClinicalTrials.gov", "Janoshik"
  source_id?: string // CID 9941957 | NCT04166786 | DOI | report no.
  source_url?: string
  retrieved_at: string // ISO 8601 — required
  method?: string // "RP-HPLC 214nm" | "computed: Henderson–Hasselbalch"
  n?: number // subjects / replicates / reports aggregated
  schema_version: SchemaVersion
}

export interface Claim<T = number | string> {
  field: string // "half_life_subcutaneous"
  value: T
  unit?: string // "h" | "mg/mL" | "%" | "nM"
  range?: [number, number] // reported spread, not a CI unless stated
  tier: Tier
  freshness: Freshness
  estimate_kind: EstimateKind
  /** REQUIRED below `clinical` (§5). See SCOPE_NOTES for the canonical set. */
  scope_note: string
  provenance: Provenance
  /** Claim id of the successor, when this claim has been superseded. */
  superseded_by?: string
  /** Stable id, so a claim can be a supersession target. */
  id?: string
  /**
   * Proposed v0.1.1, backward-compatible optional. A coarse scope key —
   * species / route / matrix, e.g. "human.sc" | "rat.im" — used to GUARD
   * automatic supersession. A human `clinical` t½ must not silently supersede a
   * rodent `preclinical` t½: the scope_note itself warns interspecies scaling is
   * unreliable, so they are not the same claim. See canSupersede().
   */
  scope?: string
}

/** Page-level rollup (§3). Displayed once, near the title. */
export interface EvidenceFloor {
  floor: Tier // lowest tier among load-bearing claims
  distribution: Partial<Record<Tier, number>>
  load_bearing_fields: string[]
}

// ── Scope notes (§5) ─────────────────────────────────────────────────────────
// Mandatory for every tier below `clinical`. Pattern: <what the data is> +
// <what it does not license>. Reuse these rather than re-writing the disclaimer.

export const SCOPE_NOTES = {
  reference:
    'Unit arithmetic or a registry lookup from the stated inputs. This is a value, not a dosing recommendation.',
  preclinical:
    'Non-human data. Interspecies scaling of this parameter is unreliable and no human equivalent has been published.',
  third_party:
    'Single independent assay of a single lot. Purity of one lot does not characterize a vendor.',
  vendor_reported:
    "Supplier's own claim, not independently verified. Reproduced here as reported.",
  community:
    'Aggregated from user reports. Reflects what is commonly done, not what has been shown to be safe or effective.',
  dose_convention:
    'Reported ranges from the literature or community practice. Research use; not a protocol and not medical advice.',
} as const

/**
 * Is a scope note mandatory for this tier? Required for every tier BELOW
 * `clinical` (§3, §5): preclinical, third_party, vendor_reported, community.
 * `reference` and `clinical` are exempt — `reference` still SHOULD carry the
 * unit-arithmetic note (SCOPE_NOTES.reference), but it is not enforced.
 */
export function scopeNoteRequired(tier: Tier): boolean {
  return TIERS[tier].weight < TIERS.clinical.weight
}

// ── Palette grouping (§6) ────────────────────────────────────────────────────
// Hue is DATA (shared across both properties); the Tailwind classes that render
// each hue live in components/evidence/tierStyles.ts. Never red — a low tier is a
// disclosure, not an error. On AmericanPeptide the "teal" hue maps to the brand
// --accent; "amber" to a theme-aware --accent-amber added for this scale.
export type TierHue = 'teal' | 'slate' | 'amber'
export const TIER_HUE: Record<Tier, TierHue> = {
  reference: 'teal',
  clinical: 'teal',
  preclinical: 'slate',
  third_party: 'slate',
  vendor_reported: 'amber',
  community: 'amber',
}

// ── Revalidation windows (§4) ────────────────────────────────────────────────
// CORRECTION vs the v0.1.0 spec table: §4 listed a `commercial` row inside a
// column headed "Tier", but `commercial` is an EstimateKind, not a Tier — the
// two axes are orthogonal (§3), and as written a vendor's price matched BOTH the
// `vendor_reported` row (6 mo) and the `commercial` row (30 d) with no rule for
// which wins. Here freshness is modeled on both axes: the tier sets a default
// window, and an estimate_kind override (KIND_WINDOW_MS) wins when present. A
// vendor price is tier `vendor_reported` + kind `commercial` → 30-day window.

const DAY = 86_400_000
const MONTH = 30 * DAY

/** Default revalidation window by tier, in ms. `null` = never stales. */
export const TIER_WINDOW_MS: Record<Tier, number | null> = {
  reference: null,
  clinical: 24 * MONTH,
  preclinical: 24 * MONTH,
  third_party: 12 * MONTH,
  vendor_reported: 6 * MONTH,
  community: null, // §4 defines no window; community signal is dated, not auto-staled
}

/** EstimateKind overrides. `commercial` (prices) rots fastest and wins. */
export const KIND_WINDOW_MS: Partial<Record<EstimateKind, number>> = {
  commercial: 30 * DAY,
}

/** Effective window for a claim: estimate_kind override beats the tier default. */
export function revalidationWindowMs(
  claim: Pick<Claim, 'tier' | 'estimate_kind'>,
): number | null {
  const override = KIND_WINDOW_MS[claim.estimate_kind]
  return override ?? TIER_WINDOW_MS[claim.tier]
}

/**
 * Display freshness derived from `retrieved_at` + the window. `superseded` and
 * `retracted` are set by promotion/manual action and always win over recomputed
 * staleness. Pure — pass `now` for deterministic tests.
 */
export function freshnessFor(claim: Claim, now: number = Date.now()): Freshness {
  if (claim.freshness === 'superseded' || claim.freshness === 'retracted') {
    return claim.freshness
  }
  const window = revalidationWindowMs(claim)
  if (window == null) return 'current'
  const retrieved = Date.parse(claim.provenance.retrieved_at)
  if (!Number.isFinite(retrieved)) return claim.freshness
  return now - retrieved > window ? 'stale' : 'current'
}

// ── Supersession ─────────────────────────────────────────────────────────────

/**
 * May `next` supersede `prev`? Requires (1) the same `field`, (2) a strictly
 * higher tier weight, and (3) a compatible scope. The scope guard prevents a
 * human `clinical` value from silently overwriting a rodent `preclinical` value:
 * the scope_note explicitly warns interspecies scaling is unreliable, so they
 * are not the same claim. Claims with no `scope` set are treated as compatible.
 */
export function canSupersede(prev: Claim, next: Claim): boolean {
  if (prev.field !== next.field) return false
  if (TIERS[next.tier].weight <= TIERS[prev.tier].weight) return false
  if (prev.scope && next.scope && prev.scope !== next.scope) return false
  return true
}

// ── Comparison + rollup ──────────────────────────────────────────────────────

/** Sort comparator (§6): tier weight first, value (numeric, descending) second. */
export function compareClaims(a: Claim, b: Claim): number {
  const byTier = TIERS[b.tier].weight - TIERS[a.tier].weight
  if (byTier !== 0) return byTier
  const av = typeof a.value === 'number' ? a.value : Number(a.value)
  const bv = typeof b.value === 'number' ? b.value : Number(b.value)
  if (Number.isFinite(av) && Number.isFinite(bv) && av !== bv) return bv - av
  return 0
}

/**
 * Page-level rollup (§3). The floor is the LOWEST tier among the claims the
 * reader actually relies on. Pass `loadBearing` to exclude identity/reference
 * fields, so a page's floor reflects its empirical claims, not its molecular
 * weight. Returns null when nothing qualifies.
 */
export function computeEvidenceFloor(
  claims: Claim[],
  loadBearing: (c: Claim) => boolean = () => true,
): EvidenceFloor | null {
  const relevant = claims.filter(loadBearing)
  if (relevant.length === 0) return null
  const distribution: Partial<Record<Tier, number>> = {}
  let floor: Tier = relevant[0].tier
  for (const c of relevant) {
    distribution[c.tier] = (distribution[c.tier] ?? 0) + 1
    if (TIERS[c.tier].weight < TIERS[floor].weight) floor = c.tier
  }
  return { floor, distribution, load_bearing_fields: relevant.map((c) => c.field) }
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Returns a list of schema violations for a claim (empty = valid). Enforces the
 * two hard rules a pipeline needs: scope_note present below `clinical` (§5), and
 * a retrieval date on every record (§3). Use to gate ingest; default any
 * unsourced record to `community` before it reaches here.
 */
export function validateClaim(claim: Claim): string[] {
  const problems: string[] = []
  if (scopeNoteRequired(claim.tier) && !claim.scope_note?.trim()) {
    problems.push(`Claim "${claim.field}" (${claim.tier}) requires a scope_note (§5).`)
  }
  if (!claim.provenance?.retrieved_at) {
    problems.push(`Claim "${claim.field}" is missing provenance.retrieved_at (§3).`)
  }
  return problems
}
