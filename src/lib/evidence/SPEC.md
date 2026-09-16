# The Validation Tier Schema — "the Standard"

**Version 0.1.1** · Status: draft (proposed) · Supersedes 0.1.0
Canonical spec for the claim-level evidence tiering shared by **AmericanPeptide.com**
and **peptidehormone.com**.

This is the document the `§`-numbered references in `src/lib/evidence/types.ts`
(both repos) point at. The code is the source of truth for behaviour; this doc is
the source of truth for *intent*. Where they disagree, the code has a bug or this
doc is stale — file it either way.

---

## §0. Why this exists

Both properties publish numbers — a molecular weight, a rodent half-life, a
vendor's stated purity, a dose people report using. Left bare, those numbers all
*look* equally authoritative. They are not. The Standard attaches, to **every
factual claim on the page**, a record of where the number came from and what it
does not license. Nothing ships as a bare number.

The unit of tiering is the **claim**, never the compound. A molecule is never
"tier 3." Its molecular weight is `reference`; its rodent half-life is
`preclinical`; a supplier's assay figure is `vendor_reported`. The tier describes
**provenance**, not confidence. **Downgrade is free; upgrade needs a source.**

This is deliberately *not* a study-design hierarchy (in vitro → Phase 3 →
approval). That ladder lives at `/learn/evidence-hierarchy` and answers a
different question — how strong the *study* is. The tier answers *where this
specific number came from*. A `clinical`-tier claim can rest on any trial phase;
keep the two axes separate (§3).

---

## §1. The two orthogonal axes

Everything in the Standard decomposes onto two axes that must never be conflated:

1. **Tier** — provenance. One of six values (§2). Ordered by weight.
2. **Estimate kind** — what *kind* of quantity the number is (`identity`,
   `pharmacokinetic`, `purity`, `commercial`, …). Drives units and revalidation
   cadence (§4).

A vendor's price is `tier: vendor_reported` **and** `estimate_kind: commercial`
simultaneously. The v0.1.0 spec table collapsed these into one column and created
an ambiguity (§4); v0.1.1 fixes it by modelling freshness on both axes.

---

## §2. The tiers

Six tiers, strongest to weakest. The **weight** is load-bearing: it orders claims
in comparison tables (§6) and defines the page floor (§3). A `third_party` purity
figure always outranks a `vendor_reported` one *regardless of the number*.

| Tier              | Weight | Short | What it means                                                        |
|-------------------|-------:|-------|----------------------------------------------------------------------|
| `reference`       |     60 | REF   | Registry lookup or unit arithmetic from stated inputs.               |
| `clinical`        |     50 | CLIN  | Human trial data.                                                    |
| `preclinical`     |     40 | PRE   | Non-human (in vitro / animal) data.                                  |
| `third_party`     |     30 | 3P    | One independent assay of one lot.                                    |
| `vendor_reported` |     20 | VEN   | A supplier's own claim, not independently verified.                  |
| `community`       |     10 | COMM  | Aggregated user reports.                                             |

Tiers are grouped into three hues for display (§6): `reference`/`clinical` →
**teal** (brand accent), `preclinical`/`third_party` → **slate**,
`vendor_reported`/`community` → **amber**. **Never red** — a low tier is a
*disclosure*, not an error.

---

## §3. The claim record

Every claim is a `Claim<T>` (`types.ts`). Required fields:

- `field` — stable machine name, e.g. `half_life_subcutaneous`.
- `value` (+ optional `unit`, `range`) — the number, as reported.
- `tier` — §2.
- `estimate_kind` — §1.
- `freshness` — `current | stale | superseded | retracted` (§4).
- `scope_note` — **mandatory below `clinical`** (§5).
- `provenance` — a `Provenance` record whose **`retrieved_at` (ISO 8601) is
  required on every claim**. A claim with no retrieval date is invalid and must
  be rejected at ingest (§9). Provenance also carries `source_type`,
  `source_name`, and optionally `source_id`, `source_url`, `method`, `n`, and the
  stamped `schema_version`.

### Page rollup — the Evidence Floor

Each page displays one `EvidenceFloor` near its title (`computeEvidenceFloor`).
The floor is the **lowest tier among the claims the reader actually relies on**.
Pass a `loadBearing` predicate to exclude identity/`reference` scaffolding so the
floor reflects a page's *empirical* claims, not its molecular weight. The floor is
a promise: "nothing on this page rests on anything weaker than X."

---

## §4. Freshness & revalidation *(corrected in v0.1.1)*

Freshness is derived, not asserted, except for `superseded`/`retracted` which are
set by action and always win. A claim stales when
`now − retrieved_at > window`.

**The v0.1.0 defect.** The 0.1.0 spec gave a single "Tier → window" table that
*also* contained a `commercial` row. But `commercial` is an `estimate_kind`, not a
tier (§1). A vendor price matched **both** the `vendor_reported` row (6 mo) and
the `commercial` row (30 d) with no rule for which wins.

**The v0.1.1 rule.** Windows are defined on **both** axes, and the
`estimate_kind` override wins when present:

- **Tier default** (`TIER_WINDOW_MS`):
  `reference` = never · `clinical` = 24 mo · `preclinical` = 24 mo ·
  `third_party` = 12 mo · `vendor_reported` = 6 mo · `community` = never
  (community signal is *dated*, not auto-staled).
- **Kind override** (`KIND_WINDOW_MS`): `commercial` = **30 days**, and it wins.

So a vendor price (`vendor_reported` + `commercial`) revalidates every 30 days,
unambiguously. `revalidationWindowMs()` implements the precedence; `freshnessFor()`
applies it. Both are pure — pass `now` for deterministic tests.

---

## §5. Scope notes

A **scope note is mandatory for every tier below `clinical`** (`preclinical`,
`third_party`, `vendor_reported`, `community`). `reference` and `clinical` are
exempt (`reference` still *should* carry its unit-arithmetic note, but it is not
enforced). `scopeNoteRequired(tier)` is the predicate; `validateClaim()` enforces
it at ingest (§9).

The pattern is **`<what the data is>` + `<what it does not license>`.** Reuse the
canonical set in `SCOPE_NOTES` rather than re-writing disclaimers:

- **preclinical** — "Non-human data. Interspecies scaling of this parameter is
  unreliable and no human equivalent has been published."
- **third_party** — "Single independent assay of a single lot. Purity of one lot
  does not characterize a vendor."
- **vendor_reported** — "Supplier's own claim, not independently verified.
  Reproduced here as reported."
- **community** — "Aggregated from user reports. Reflects what is commonly done,
  not what has been shown to be safe or effective."
- **dose_convention** — "Reported ranges from the literature or community
  practice. Research use; not a protocol and not medical advice."

---

## §6. Comparison & ranking

Comparison tables sort by **tier weight first, then value** (numeric, descending):
`compareClaims()`. This is why weight is load-bearing — a stronger-provenance
number sits above a weaker one even when the weaker number is larger. Where a
finer within-tier order is needed (e.g. a vendor `trustScore`), that score is the
**secondary** sort key, never a competing top-level ranking.

Render hue by `TIER_HUE` (§2); the hue is *data* shared across both properties,
while the Tailwind classes that paint each hue are property-specific
(`components/evidence/tierStyles.ts`).

---

## §7. Bridges — mapping existing trust surfaces onto claim tiers

The Standard does not invent parallel scores; it **re-expresses** the trust
signals each property already computes as claim tiers.

**Sourcing bridge** (`from-vendors.ts`). A vendor's transparency band
(`lib/vendors.ts` → `documented | claimed | unvetted`) is a *vendor-level* trust
signal. It maps onto the *claim* tier of the purity figure that vendor can back:

| Vendor band  | Purity claim tier | Because                                        |
|--------------|-------------------|------------------------------------------------|
| `documented` | `third_party`     | publishes an independent, per-batch COA        |
| `claimed`    | `vendor_reported` | states its own testing, not independently confirmed |
| `unvetted`   | `community`       | no verifiable transparency signal to place higher   |

The trust indicator **is** the tier badge — there is no separate invented number.
`trustScore` survives as the within-tier sort key (§6). An undated COA yields an
empty `retrieved_at`, which the aggregator *surfaces* (a weaker claim) rather than
papering over with a fabricated date.

**Registry bridge** (`index.ts`). A PubChem verification record
(`lib/verification.ts`) lifts into a `reference`-tier `Provenance` via
`provenanceFromPubchemVerification()`; the manifest's cross-check date becomes the
claim's `retrieved_at`, so a MW badge shows exactly when its chemistry was last
confirmed.

---

## §8. Supersession — the scope guard *(new in v0.1.1)*

When a stronger claim arrives for the same `field`, it may **supersede** the
weaker one (setting the old claim's `freshness: superseded` and `superseded_by`).
`canSupersede(prev, next)` requires all three of:

1. the **same `field`**,
2. a **strictly higher tier weight**, and
3. a **compatible `scope`**.

Condition 3 is the v0.1.1 addition. `scope` is a new **backward-compatible
optional** field: a coarse species/route/matrix key such as `"human.sc"` or
`"rat.im"`. It exists to stop a human `clinical` half-life from silently
overwriting a rodent `preclinical` half-life — the `preclinical` scope note
explicitly warns that interspecies scaling is unreliable, so **they are not the
same claim** and must coexist. Claims that leave `scope` unset are treated as
compatible, so existing v0.1.0 data keeps working unchanged.

---

## §9. Ingest validation

`validateClaim()` is the gate. It enforces the two hard rules a pipeline cannot
skip:

1. `scope_note` present for any tier below `clinical` (§5).
2. `provenance.retrieved_at` present on every claim (§3).

Default any unsourced record to `community` **before** it reaches the validator —
`community` is the floor, the honest home for a number you cannot yet source, not
a thing to be ashamed of.

---

## §10. Changelog

### 0.1.1 — this version
- **§4 correction.** Revalidation windows are modelled on both axes (tier default
  + `estimate_kind` override); `commercial` = 30 days wins over the
  `vendor_reported` tier default. Removes the 0.1.0 price-freshness ambiguity.
- **§8 scope guard.** New optional `Claim.scope` (species/route/matrix); a scope
  mismatch blocks supersession so interspecies/route-different claims coexist.
  Backward compatible — unset `scope` behaves as 0.1.0 did.
- **This document.** First written statement of the spec the code already
  referenced by section number.

### 0.1.0 — initial
- Six tiers with weights; claim/provenance records; mandatory `retrieved_at`;
  scope notes below `clinical`; page-level evidence floor; comparison sort by tier
  then value; three-hue palette; vendor and PubChem bridges.

---

## Adoption

The v0.1.1 behaviours (§4 two-axis windows, §8 `scope` field + guard) are
**already implemented** in `src/lib/evidence/`. Ratifying this doc means bumping
the stamped constant and mirroring it to peptidehormone:

- `src/lib/evidence/types.ts` — `SCHEMA_VERSION = '0.1.1'` (this repo).
- `peptidehormone/src/lib/evidence/types.ts` — same bump, and port the §4/§8
  changes if not yet mirrored (keep the two schemas byte-identical except for
  property-specific comments and `tierStyles.ts`).

Because `scope` is optional and unset behaves as before, no existing claim data
needs migration. The bump only changes the `schema_version` stamped on **new**
provenance records.
