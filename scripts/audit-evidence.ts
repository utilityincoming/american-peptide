#!/usr/bin/env node
// Read-only CLI audit of the AmericanPeptide.com evidence-tier trust layer.
//
// Validates all existing reconciliation and claim records (catalog identity,
// reconstitution presets, vendor purity claims, and per-compound sourcing
// reconciliations such as GHK-Cu) against:
//   1. JSON Schema 0.1.1 (src/lib/evidence/schema-0.1.1.json)
//   2. Normative rules in /standards/evidence-tier (SPEC.md §3–§9) that JSON
//      Schema alone does not enforce:
//        • mandatory non-empty scope_note for every tier below `clinical` (§5)
//        • displayed EvidenceFloor never exceeding the weakest load-bearing
//          claim (§3)
//        • missing or expired revalidation windows (§4: tier default +
//          commercial 30-day estimate_kind override)
//   3. Catalog coverage gap analysis: top catalog compounds sorted by missing
//      REF (PubChem identity) and 3P (third-party vendor COA) coverage.
//
// Constraints:
//   • Read-only: never makes external HTTP requests, never invents placeholder
//     vendor data, and never modifies dataset files.
//
// Usage:
//   npm run audit:evidence
//   npm run audit:evidence -- --json
//   npm run audit:evidence -- --top=25

import { readFileSync, existsSync, statSync } from 'node:fs'
import Module from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Peptide } from '../src/lib/peptides'
import type { Claim, Tier } from '../src/lib/evidence/types'

const ROOT_DIR = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const SRC_DIR = path.join(ROOT_DIR, 'src')
const SCHEMA_PATH = path.join(SRC_DIR, 'lib', 'evidence', 'schema-0.1.1.json')

let hooksRegistered = false
function ensureNodeBundlerHooks() {
  if (hooksRegistered) return
  hooksRegistered = true
  if (process.env.VITEST) return

  const modWithHooks = Module as unknown as {
    registerHooks?: (hooks: {
      resolve?: (
        specifier: string,
        context: { parentURL?: string; importAttributes?: Record<string, string> },
        nextResolve: (
          specifier: string,
          context: { parentURL?: string; importAttributes?: Record<string, string> },
        ) => { url: string; importAttributes?: Record<string, string>; shortCircuit?: boolean },
      ) => { url: string; importAttributes?: Record<string, string>; shortCircuit?: boolean }
    }) => void
  }
  if (typeof modWithHooks.registerHooks !== 'function') return

  const resolveCandidate = (basePath: string): string | null => {
    for (const candidate of [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.json`,
      path.join(basePath, 'index.ts'),
      path.join(basePath, 'index.tsx'),
    ]) {
      try {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
          return candidate
        }
      } catch {
        // continue
      }
    }
    return null
  }

  modWithHooks.registerHooks({
    resolve(specifier, context, nextResolve) {
      let resolvedFile: string | null = null
      if (specifier.startsWith('@/')) {
        resolvedFile = resolveCandidate(path.join(SRC_DIR, specifier.slice(2)))
      } else if (
        (specifier.startsWith('./') || specifier.startsWith('../')) &&
        context.parentURL?.startsWith('file:')
      ) {
        const parentDir = path.dirname(fileURLToPath(context.parentURL))
        resolvedFile = resolveCandidate(path.resolve(parentDir, specifier))
      }
      if (resolvedFile) {
        const url = pathToFileURL(resolvedFile).href
        const importAttributes = resolvedFile.endsWith('.json')
          ? { ...context.importAttributes, type: 'json' }
          : context.importAttributes
        return { url, importAttributes, shortCircuit: true }
      }
      return nextResolve(specifier, context)
    },
  })
}

ensureNodeBundlerHooks()

const { PEPTIDES, LISTED_PEPTIDES } = await import('../src/lib/peptides')
const { PUBCHEM_VERIFIED } = await import('../src/lib/verification')
const {
  VENDORS,
  getVendorsForPeptide,
  hasSourcingPage,
  coveredByBroadCatalog,
} = await import('../src/lib/vendors')
const { RECON_PRESETS } = await import('../src/lib/reconstitution-presets')
const {
  TIERS,
  TIER_ORDER,
  computeEvidenceFloor,
  freshnessFor,
  revalidationWindowMs,
  scopeNoteRequired,
  validateClaim,
} = await import('../src/lib/evidence/types')
const {
  catalogClaims,
  identityClaims,
  isLoadBearing,
  primaryResearchClaims,
  reconPresetClaims,
} = await import('../src/lib/evidence/from-catalog')
const { reconcileCompoundSources, vendorPurityClaim } = await import(
  '../src/lib/evidence/from-vendors'
)

interface JsonSchema {
  required: string[]
  properties: Record<string, unknown>
  $defs: {
    tier: { enum: string[] }
    estimateKind: { enum: string[] }
    provenance: {
      required: string[]
      properties: Record<string, unknown>
    }
  }
}

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')) as JsonSchema

const VALID_TIERS = new Set(schema.$defs.tier.enum)
const VALID_KINDS = new Set(schema.$defs.estimateKind.enum)
const VALID_FRESHNESS = new Set(
  (schema.properties.freshness as { enum: string[] }).enum,
)
const VALID_SOURCE_TYPES = new Set(
  (schema.$defs.provenance.properties.source_type as { enum: string[] }).enum,
)
const EXPECTED_SCHEMA_VERSION = (
  schema.$defs.provenance.properties.schema_version as { const: string }
).const

// ISO 8601 date or date-time check (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...)
const ISO_8601_RE =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/

export interface SchemaIssue {
  sourceId: string
  field: string
  rule: 'json-schema' | 'scope-note' | 'verification-window' | 'evidence-floor'
  severity: 'error' | 'warning'
  message: string
}

export interface AuditedClaimRecord {
  sourceId: string
  surface: 'catalog-identity' | 'recon-preset' | 'vendor-purity' | 'sourcing-reconciliation'
  claim: Claim
}

export interface CompoundGapEntry {
  slug: string
  name: string
  listed: boolean
  fdaApproved: boolean
  categories: string[]
  hasRefMw: boolean
  hasRefFormula: boolean
  refComplete: boolean
  thirdPartyVendorCount: number
  explicitThirdPartyCount: number
  vendorReportedCount: number
  hasSourcingPage: boolean
  missingRefCount: number
  missing3p: boolean
  missingExplicit3p: boolean
  monographFloor: Tier | null
  sourcingFloor: Tier | null
  priorityScore: number
}

export interface AuditReport {
  schemaVersion: string
  schemaPath: string
  auditedAt: string
  summary: {
    totalCatalogCompounds: number
    listedCatalogCompounds: number
    totalClaimsAudited: number
    schemaValidClaims: number
    schemaInvalidClaims: number
    normativeViolations: number
    staleWindowWarnings: number
    missingTimestampCount: number
    floorChecksPassed: number
    floorChecksFailed: number
    refCompleteCount: number
    refMissingCount: number
    sourcingPagesCount: number
    explicit3pCoveredCount: number
    broad3pCoveredCount: number
    no3pCoverageCount: number
  }
  ghkCuReconciliation: {
    slug: string
    identityTier: Tier | null
    vendorClaims: {
      vendorId: string
      vendorName: string
      tier: Tier
      shortTier: string
      value: number | string
      retrievedAt: string | null
      perBatchTesting: boolean
      freshness: string
    }[]
    computedFloor: Tier | null
    floorMatchesWeakestLoadBearing: boolean
  }
  issues: SchemaIssue[]
  compoundGaps: CompoundGapEntry[]
}

/** Validate one Claim against schema-0.1.1.json structural rules. */
export function validateAgainstJsonSchema(
  claim: Claim,
  sourceId: string,
): SchemaIssue[] {
  const issues: SchemaIssue[] = []
  const rec = claim as unknown as Record<string, unknown>

  for (const req of schema.required) {
    if (!(req in rec) || rec[req] === undefined) {
      issues.push({
        sourceId,
        field: claim.field ?? 'unknown',
        rule: 'json-schema',
        severity: 'error',
        message: `Missing required property "${req}" in claim.`,
      })
    }
  }

  for (const key of Object.keys(rec)) {
    if (!(key in schema.properties)) {
      issues.push({
        sourceId,
        field: claim.field ?? 'unknown',
        rule: 'json-schema',
        severity: 'error',
        message: `Additional property "${key}" is not allowed by schema-0.1.1.json.`,
      })
    }
  }

  if (typeof claim.field !== 'string' || claim.field.trim().length < 1) {
    issues.push({
      sourceId,
      field: String(claim.field),
      rule: 'json-schema',
      severity: 'error',
      message: 'Property "field" must be a non-empty string.',
    })
  }

  if (typeof claim.value !== 'number' && typeof claim.value !== 'string') {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: 'Property "value" must be a number or string.',
    })
  }

  if (!VALID_TIERS.has(claim.tier)) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `Invalid tier "${String(claim.tier)}".`,
    })
  }

  if (!VALID_KINDS.has(claim.estimate_kind)) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `Invalid estimate_kind "${String(claim.estimate_kind)}".`,
    })
  }

  if (!VALID_FRESHNESS.has(claim.freshness)) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `Invalid freshness "${String(claim.freshness)}".`,
    })
  }

  if (claim.range !== undefined) {
    if (
      !Array.isArray(claim.range) ||
      claim.range.length !== 2 ||
      typeof claim.range[0] !== 'number' ||
      typeof claim.range[1] !== 'number'
    ) {
      issues.push({
        sourceId,
        field: claim.field,
        rule: 'json-schema',
        severity: 'error',
        message: 'Property "range" must be a 2-number tuple.',
      })
    }
  }

  const prov = (claim.provenance ?? {}) as unknown as Record<string, unknown>
  for (const req of schema.$defs.provenance.required) {
    if (!(req in prov) || prov[req] === undefined) {
      issues.push({
        sourceId,
        field: claim.field,
        rule: 'json-schema',
        severity: 'error',
        message: `Missing required provenance property "provenance.${req}".`,
      })
    }
  }

  for (const key of Object.keys(prov)) {
    if (!(key in schema.$defs.provenance.properties)) {
      issues.push({
        sourceId,
        field: claim.field,
        rule: 'json-schema',
        severity: 'error',
        message: `Additional property "provenance.${key}" is not allowed by schema-0.1.1.json.`,
      })
    }
  }

  if (!VALID_SOURCE_TYPES.has(String(prov.source_type))) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `Invalid provenance.source_type "${String(prov.source_type)}".`,
    })
  }

  if (typeof prov.source_name !== 'string' || prov.source_name.trim().length < 1) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: 'provenance.source_name must be a non-empty string.',
    })
  }

  if (prov.schema_version !== EXPECTED_SCHEMA_VERSION) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `provenance.schema_version is "${String(prov.schema_version)}", expected "${EXPECTED_SCHEMA_VERSION}".`,
    })
  }

  const retrievedAt = String(prov.retrieved_at ?? '')
  if (!retrievedAt || !ISO_8601_RE.test(retrievedAt) || Number.isNaN(Date.parse(retrievedAt))) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'json-schema',
      severity: 'error',
      message: `provenance.retrieved_at "${retrievedAt}" is missing or not a valid ISO 8601 date/date-time (§3).`,
    })
  }

  return issues
}

/**
 * Check normative rules from /standards/evidence-tier (§3, §4, §5, §9) that
 * go beyond JSON Schema structural checks.
 */
export function checkNormativeClaimRules(
  claim: Claim,
  sourceId: string,
  now: number = Date.now(),
): SchemaIssue[] {
  const issues: SchemaIssue[] = []

  // §5: Scope note mandatory for every tier below `clinical`
  if (scopeNoteRequired(claim.tier) && (!claim.scope_note || !claim.scope_note.trim())) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'scope-note',
      severity: 'error',
      message: `Tier "${claim.tier}" (< clinical) requires a non-empty scope_note (§5).`,
    })
  }

  // Also cross-check validateClaim() from lib/evidence/types.ts for scope_note
  const builtinErrors = validateClaim(claim)
  for (const err of builtinErrors) {
    if (err.includes('scope_note') && !issues.some((i) => i.rule === 'scope-note')) {
      issues.push({
        sourceId,
        field: claim.field,
        rule: 'scope-note',
        severity: 'error',
        message: err,
      })
    }
  }

  // §4: Verification / revalidation windows
  const retrievedAt = claim.provenance?.retrieved_at
  const windowMs = revalidationWindowMs(claim)
  if (!retrievedAt || !retrievedAt.trim()) {
    issues.push({
      sourceId,
      field: claim.field,
      rule: 'verification-window',
      severity: 'warning',
      message: `Missing provenance.retrieved_at on "${claim.field}" (${claim.tier}/${claim.estimate_kind}) — undated COA or unverified timestamp (§4/§7).`,
    })
  } else if (windowMs !== null) {
    const derivedFreshness = freshnessFor(claim, now)
    if (derivedFreshness === 'stale') {
      const ageDays = Math.floor((now - Date.parse(retrievedAt)) / 86_400_000)
      const windowDays = Math.floor(windowMs / 86_400_000)
      issues.push({
        sourceId,
        field: claim.field,
        rule: 'verification-window',
        severity: 'warning',
        message: `Expired revalidation window on "${claim.field}" (${claim.tier}/${claim.estimate_kind}): retrieved ${retrievedAt} (${ageDays}d old > ${windowDays}d window, §4).`,
      })
    }
  }

  return issues
}

/**
 * §3 Normative rule: displayed EvidenceFloor must never exceed the weakest
 * load-bearing claim on the surface.
 */
export function verifyFloorNeverExceedsWeakest(
  surfaceId: string,
  claims: Claim[],
  loadBearingPredicate: (c: Claim) => boolean,
): { passed: boolean; issue?: SchemaIssue; floor: Tier | null } {
  const floorObj = computeEvidenceFloor(claims, loadBearingPredicate)
  const loadBearingClaims = claims.filter(loadBearingPredicate)
  if (loadBearingClaims.length === 0) {
    if (floorObj !== null) {
      return {
        passed: false,
        floor: floorObj.floor,
        issue: {
          sourceId: surfaceId,
          field: 'evidence_floor',
          rule: 'evidence-floor',
          severity: 'error',
          message: `Surface "${surfaceId}" displays floor "${floorObj.floor}" with zero load-bearing claims (§3).`,
        },
      }
    }
    return { passed: true, floor: null }
  }

  const weakestWeight = Math.min(...loadBearingClaims.map((c) => TIERS[c.tier].weight))
  const floorWeight = floorObj ? TIERS[floorObj.floor].weight : Infinity

  if (!floorObj || floorWeight > weakestWeight) {
    return {
      passed: false,
      floor: floorObj?.floor ?? null,
      issue: {
        sourceId: surfaceId,
        field: 'evidence_floor',
        rule: 'evidence-floor',
        severity: 'error',
        message: `Displayed floor "${floorObj?.floor ?? 'null'}" (weight ${floorWeight}) exceeds weakest load-bearing claim weight (${weakestWeight}) on "${surfaceId}" (§3).`,
      },
    }
  }

  return { passed: true, floor: floorObj.floor }
}

/** Run the complete read-only evidence audit across the repository. */
export function runEvidenceAudit(now: number = Date.now()): AuditReport {
  const auditedClaims: AuditedClaimRecord[] = []
  const issues: SchemaIssue[] = []

  // 1. Collect all catalog identity and primary research claims
  for (const peptide of PEPTIDES) {
    for (const c of identityClaims(peptide)) {
      auditedClaims.push({
        sourceId: `catalog:${peptide.slug}`,
        surface: 'catalog-identity',
        claim: c,
      })
    }
    for (const c of primaryResearchClaims(peptide)) {
      auditedClaims.push({
        sourceId: `research:${peptide.slug}`,
        surface: 'catalog-identity',
        claim: c,
      })
    }
  }

  // 2. Collect all reconstitution preset claims
  for (const preset of RECON_PRESETS) {
    for (const c of reconPresetClaims(preset)) {
      auditedClaims.push({
        sourceId: `preset:${preset.slug}`,
        surface: 'recon-preset',
        claim: c,
      })
    }
  }

  // 3. Collect all vendor purity claims
  for (const vendor of VENDORS) {
    auditedClaims.push({
      sourceId: `vendor:${vendor.id}`,
      surface: 'vendor-purity',
      claim: vendorPurityClaim(vendor),
    })
  }

  // Validate every collected claim against schema-0.1.1.json and normative rules
  let schemaValidClaims = 0
  let schemaInvalidClaims = 0
  let normativeViolations = 0
  let staleWindowWarnings = 0
  let missingTimestampCount = 0

  for (const item of auditedClaims) {
    const schemaErrs = validateAgainstJsonSchema(item.claim, item.sourceId)
    const normErrs = checkNormativeClaimRules(item.claim, item.sourceId, now)

    // Deduplicate missing retrieved_at between schema error and normative warning
    if (schemaErrs.length === 0) {
      schemaValidClaims++
    } else {
      schemaInvalidClaims++
      issues.push(...schemaErrs)
    }

    for (const ne of normErrs) {
      if (ne.severity === 'error') {
        normativeViolations++
        issues.push(ne)
      } else if (ne.rule === 'verification-window') {
        if (ne.message.startsWith('Missing provenance.retrieved_at')) {
          missingTimestampCount++
        } else {
          staleWindowWarnings++
        }
        issues.push(ne)
      }
    }
  }

  // 4. Verify EvidenceFloor invariants across all catalog monographs and /sources/[slug] pages
  let floorChecksPassed = 0
  let floorChecksFailed = 0

  for (const peptide of PEPTIDES) {
    const mClaims = catalogClaims(peptide)
    const mCheck = verifyFloorNeverExceedsWeakest(
      `monograph:${peptide.slug}`,
      mClaims,
      isLoadBearing,
    )
    if (mCheck.passed) floorChecksPassed++
    else {
      floorChecksFailed++
      if (mCheck.issue) issues.push(mCheck.issue)
    }

    if (hasSourcingPage(peptide.slug)) {
      const sVendors = getVendorsForPeptide(peptide.slug)
      const sClaims = sVendors.map(vendorPurityClaim)
      const sCheck = verifyFloorNeverExceedsWeakest(
        `sources:${peptide.slug}`,
        sClaims,
        () => true,
      )
      if (sCheck.passed) floorChecksPassed++
      else {
        floorChecksFailed++
        if (sCheck.issue) issues.push(sCheck.issue)
      }
    }
  }

  // 5. GHK-Cu source reconciliation snapshot via generalized reconcileCompoundSources helper
  const ghkRec = reconcileCompoundSources('ghk-cu', { now })
  const ghkVendorClaims = ghkRec.sources.map((s) => {
    return {
      vendorId: s.vendor.id,
      vendorName: s.vendor.name,
      tier: s.tier,
      shortTier: s.shortTier,
      value: s.claim.value,
      retrievedAt: s.claim.provenance.retrieved_at || null,
      perBatchTesting: s.vendor.trust.perBatchTesting,
      freshness: s.freshness,
    }
  })
  const ghkFloorCheck = verifyFloorNeverExceedsWeakest(
    'sources:ghk-cu',
    ghkRec.purityClaims,
    () => true,
  )

  // 6. Compound gap analysis across catalog peptides
  const listedSet = new Set(LISTED_PEPTIDES.map((p) => p.slug))

  function analyzeCompound(p: Peptide): CompoundGapEntry {
    const ver = PUBCHEM_VERIFIED[p.slug]
    const hasRefMw = Boolean(ver && ver.molecularWeight != null)
    const hasRefFormula = Boolean(ver && ver.molecularFormula != null)
    const refComplete = hasRefMw && hasRefFormula
    const missingRefCount = (hasRefMw ? 0 : 1) + (hasRefFormula ? 0 : 1)

    const vendors = getVendorsForPeptide(p.slug)
    const thirdPartyVendors = vendors.filter((v) => vendorPurityClaim(v).tier === 'third_party')
    const explicitThirdPartyVendors = thirdPartyVendors.filter(
      (v) =>
        (Array.isArray(v.peptides) && v.peptides.includes(p.slug)) ||
        Boolean(v.affiliate?.productUrls?.[p.slug]),
    )
    const vendorReportedVendors = vendors.filter(
      (v) => vendorPurityClaim(v).tier === 'vendor_reported',
    )

    const mClaims = catalogClaims(p)
    const monographFloor = computeEvidenceFloor(mClaims, isLoadBearing)?.floor ?? null
    const sourcingFloor =
      vendors.length > 0
        ? (computeEvidenceFloor(vendors.map(vendorPurityClaim))?.floor ?? null)
        : null

    const listed = listedSet.has(p.slug)
    const missing3p = thirdPartyVendors.length === 0
    const missingExplicit3p = explicitThirdPartyVendors.length === 0

    // Priority score sorts compounds with the largest REF/3P gaps first,
    // prioritizing listed/FDA-approved/high-utility compounds.
    const priorityScore =
      missingRefCount * 100 +
      (missing3p ? 60 : 0) +
      (missingExplicit3p ? 30 : 0) +
      (listed ? 15 : 0) +
      (p.fdaApproved ? 10 : 0) +
      (coveredByBroadCatalog(p.slug) ? 5 : 0)

    return {
      slug: p.slug,
      name: p.name,
      listed,
      fdaApproved: Boolean(p.fdaApproved),
      categories: p.categories,
      hasRefMw,
      hasRefFormula,
      refComplete,
      thirdPartyVendorCount: thirdPartyVendors.length,
      explicitThirdPartyCount: explicitThirdPartyVendors.length,
      vendorReportedCount: vendorReportedVendors.length,
      hasSourcingPage: hasSourcingPage(p.slug),
      missingRefCount,
      missing3p,
      missingExplicit3p,
      monographFloor,
      sourcingFloor,
      priorityScore,
    }
  }

  const compoundGaps = PEPTIDES.map(analyzeCompound).sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore
    return a.slug.localeCompare(b.slug)
  })

  const refCompleteCount = compoundGaps.filter((c) => c.refComplete).length
  const refMissingCount = compoundGaps.length - refCompleteCount
  const sourcingPagesCount = compoundGaps.filter((c) => c.hasSourcingPage).length
  const explicit3pCoveredCount = compoundGaps.filter((c) => !c.missingExplicit3p).length
  const broad3pCoveredCount = compoundGaps.filter((c) => !c.missing3p).length
  const no3pCoverageCount = compoundGaps.filter((c) => c.missing3p).length

  return {
    schemaVersion: EXPECTED_SCHEMA_VERSION,
    schemaPath: 'src/lib/evidence/schema-0.1.1.json',
    auditedAt: new Date(now).toISOString(),
    summary: {
      totalCatalogCompounds: PEPTIDES.length,
      listedCatalogCompounds: LISTED_PEPTIDES.length,
      totalClaimsAudited: auditedClaims.length,
      schemaValidClaims,
      schemaInvalidClaims,
      normativeViolations,
      staleWindowWarnings,
      missingTimestampCount,
      floorChecksPassed,
      floorChecksFailed,
      refCompleteCount,
      refMissingCount,
      sourcingPagesCount,
      explicit3pCoveredCount,
      broad3pCoveredCount,
      no3pCoverageCount,
    },
    ghkCuReconciliation: {
      slug: 'ghk-cu',
      identityTier: ghkRec.identityTier,
      vendorClaims: ghkVendorClaims,
      computedFloor: ghkFloorCheck.floor,
      floorMatchesWeakestLoadBearing: ghkFloorCheck.passed,
    },
    issues,
    compoundGaps,
  }
}

function formatTerminalReport(report: AuditReport, topN: number): string {
  const s = report.summary
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push(`  AmericanPeptide.com — Evidence Tier Audit (Schema v${report.schemaVersion})`)
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push(`  Schema:             ${report.schemaPath}`)
  lines.push(`  Catalog compounds:  ${s.totalCatalogCompounds} total (${s.listedCatalogCompounds} listed)`)
  lines.push(`  Claims audited:     ${s.totalClaimsAudited} (${s.schemaValidClaims} schema-valid, ${s.schemaInvalidClaims} schema-invalid)`)
  lines.push(`  Floor invariants:   ${s.floorChecksPassed} passed, ${s.floorChecksFailed} failed`)
  lines.push(`  Normative errors:   ${s.normativeViolations} scope-note / floor violations`)
  lines.push(`  Window findings:    ${s.staleWindowWarnings} expired window(s), ${s.missingTimestampCount} undated vendor COA record(s)`)
  lines.push('')
  lines.push('── Coverage Summary (REF & 3P) ────────────────────────────────────────────')
  lines.push(`  REF (PubChem MW + Formula): ${s.refCompleteCount}/${s.totalCatalogCompounds} complete (${s.refMissingCount} missing REF)`)
  lines.push(`  3P (explicit/deep-linked):  ${s.explicit3pCoveredCount}/${s.totalCatalogCompounds} compounds`)
  lines.push(`  3P (incl. broad catalog):   ${s.broad3pCoveredCount}/${s.totalCatalogCompounds} compounds (${s.no3pCoverageCount} with zero 3P)`)
  lines.push(`  Ranked /sources/[slug]:     ${s.sourcingPagesCount} compounds (≥2 vendors)`)
  lines.push('')
  lines.push('── GHK-Cu Source Reconciliation Baseline (/sources/ghk-cu) ────────────────')
  lines.push(`  Identity tier:      ${report.ghkCuReconciliation.identityTier ? TIERS[report.ghkCuReconciliation.identityTier].short : 'NONE'} (excluded from sourcing floor per §3)`)
  for (const vc of report.ghkCuReconciliation.vendorClaims) {
    const val = typeof vc.value === 'number' ? `${vc.value}%` : vc.value
    const dt = vc.retrievedAt
      ? vc.retrievedAt
      : vc.perBatchTesting
        ? 'per-lot COA (no static site date)'
        : 'UNDATED static COA'
    lines.push(`  • ${vc.vendorName.padEnd(20)} [${vc.shortTier.padEnd(4)}] purity=${String(val).padEnd(11)} date=${dt}`)
  }
  lines.push(
    `  Displayed floor:    ${report.ghkCuReconciliation.computedFloor} (${
      report.ghkCuReconciliation.floorMatchesWeakestLoadBearing ? '✓ matches weakest load-bearing claim' : '✗ VIOLATION'
    })`,
  )

  if (report.issues.length > 0) {
    lines.push('')
    lines.push('── Schema & Normative Findings ────────────────────────────────────────────')
    const errors = report.issues.filter((i) => i.severity === 'error')
    const warnings = report.issues.filter((i) => i.severity === 'warning')
    for (const issue of errors) {
      lines.push(`  ✗ [${issue.rule}] ${issue.sourceId} (${issue.field}): ${issue.message}`)
    }
    const cappedWarnings = warnings.slice(0, 12)
    for (const issue of cappedWarnings) {
      lines.push(`  ⚠ [${issue.rule}] ${issue.sourceId} (${issue.field}): ${issue.message}`)
    }
    if (warnings.length > cappedWarnings.length) {
      lines.push(
        `  …and ${warnings.length - cappedWarnings.length} more window warning(s) (pass --json for full list)`,
      )
    }
  }

  lines.push('')
  lines.push(`── Top ${topN} Catalog Compounds by Missing REF / 3P Coverage ──────────────────`)
  lines.push(
    '  ' +
      'SLUG'.padEnd(24) +
      'REF'.padEnd(10) +
      '3P (EXPL/ALL)'.padEnd(15) +
      'VEN'.padEnd(6) +
      'FLOOR (MONO/SRC)'.padEnd(18) +
      'STATUS',
  )
  lines.push('  ' + '─'.repeat(85))

  for (const g of report.compoundGaps.slice(0, topN)) {
    const refStatus = g.refComplete
      ? 'REF ✓'
      : g.hasRefMw || g.hasRefFormula
        ? 'REF ½'
        : 'MISSING'
    const tpStatus = `${g.explicitThirdPartyCount}/${g.thirdPartyVendorCount}`
    const venStatus = String(g.vendorReportedCount)
    const mFloor = g.monographFloor ? TIERS[g.monographFloor].short : '—'
    const sFloor = g.sourcingFloor ? TIERS[g.sourcingFloor].short : '—'
    const floors = `${mFloor} / ${sFloor}`
    const gaps: string[] = []
    if (!g.refComplete) gaps.push('no-REF')
    if (g.missing3p) gaps.push('no-3P')
    else if (g.missingExplicit3p) gaps.push('broad-3P-only')
    if (!g.listed) gaps.push('unlisted')

    lines.push(
      '  ' +
        g.slug.slice(0, 23).padEnd(24) +
        refStatus.padEnd(10) +
        tpStatus.padEnd(15) +
        venStatus.padEnd(6) +
        floors.padEnd(18) +
        (gaps.join(', ') || 'covered'),
    )
  }

  lines.push('')
  lines.push(`   Tier order: ${TIER_ORDER.map((t) => `${TIERS[t].short}(${TIERS[t].weight})`).join(' > ')}`)
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  return lines.join('\n')
}

// CLI entrypoint guard
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const args = process.argv.slice(2)
  const jsonFlag = args.includes('--json')
  const topArg = args.find((a) => a.startsWith('--top='))
  const topN = topArg ? Math.max(1, parseInt(topArg.split('=')[1], 10) || 35) : 35

  const report = runEvidenceAudit()
  if (jsonFlag) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(formatTerminalReport(report, topN))
  }
}
