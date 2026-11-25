import { describe, it, expect } from 'vitest'
import {
  SCHEMA_VERSION,
  SCOPE_NOTES,
  TIER_ORDER,
  canSupersede,
  computeEvidenceFloor,
  freshnessFor,
  revalidationWindowMs,
  validateClaim,
  type Claim,
} from '@/lib/evidence/types'
import {
  catalogClaims,
  isLoadBearing,
  reconPresetClaims,
  reconPresetFor,
} from '@/lib/evidence/from-catalog'
import { RECON_PRESETS, RECON_PRESETS_CURATED_AT } from '@/lib/reconstitution-presets'
import {
  checkNormativeClaimRules,
  runEvidenceAudit,
  validateAgainstJsonSchema,
  verifyFloorNeverExceedsWeakest,
} from '../../../scripts/audit-evidence'

// The Standard is the trust layer under every number on the site. These tests
// pin the schema rules (§3–§9) and the catalog bridge so a data or logic edit
// can't silently promote a claim or hide a floor.

const DAY = 86_400_000

function mkClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    field: 'half_life',
    value: 4,
    unit: 'h',
    tier: 'preclinical',
    freshness: 'current',
    estimate_kind: 'pharmacokinetic',
    scope_note: SCOPE_NOTES.preclinical,
    provenance: {
      source_type: 'publication',
      source_name: 'PubMed',
      retrieved_at: '2026-01-01',
      schema_version: SCHEMA_VERSION,
    },
    ...overrides,
  }
}

describe('TIER_ORDER', () => {
  it('runs strongest → weakest', () => {
    expect(TIER_ORDER).toEqual([
      'reference',
      'clinical',
      'preclinical',
      'third_party',
      'vendor_reported',
      'community',
    ])
  })
})

describe('freshness (§4)', () => {
  it('lets the commercial kind override the tier window', () => {
    expect(revalidationWindowMs({ tier: 'vendor_reported', estimate_kind: 'commercial' })).toBe(
      30 * DAY,
    )
    expect(revalidationWindowMs({ tier: 'vendor_reported', estimate_kind: 'purity' })).toBe(
      180 * DAY,
    )
    expect(revalidationWindowMs({ tier: 'reference', estimate_kind: 'identity' })).toBeNull()
  })

  it('stales a claim past its window and never stales reference', () => {
    const retrieved = Date.parse('2026-01-01')
    const c = mkClaim({ tier: 'third_party', estimate_kind: 'purity' })
    expect(freshnessFor(c, retrieved + 100 * DAY)).toBe('current')
    expect(freshnessFor(c, retrieved + 400 * DAY)).toBe('stale')
    expect(freshnessFor(mkClaim({ tier: 'reference' }), retrieved + 10_000 * DAY)).toBe('current')
  })

  it('keeps superseded / retracted over recomputed staleness', () => {
    expect(freshnessFor(mkClaim({ freshness: 'superseded' }))).toBe('superseded')
    expect(freshnessFor(mkClaim({ freshness: 'retracted' }))).toBe('retracted')
  })
})

describe('canSupersede (§8)', () => {
  const rat = mkClaim({ tier: 'preclinical', scope: 'rat.im' })
  it('requires same field and a strictly higher tier', () => {
    expect(canSupersede(rat, mkClaim({ tier: 'clinical', field: 'tmax' }))).toBe(false)
    expect(canSupersede(rat, mkClaim({ tier: 'preclinical' }))).toBe(false)
    expect(canSupersede(rat, mkClaim({ tier: 'community' }))).toBe(false)
    expect(canSupersede(rat, mkClaim({ tier: 'clinical' }))).toBe(true)
  })
  it('refuses a human value over a rodent one when both carry a scope', () => {
    expect(canSupersede(rat, mkClaim({ tier: 'clinical', scope: 'human.sc' }))).toBe(false)
    expect(canSupersede(rat, mkClaim({ tier: 'clinical', scope: 'rat.im' }))).toBe(true)
  })
})

describe('validateClaim (§5, §9)', () => {
  it('demands a scope note below clinical and a retrieval date everywhere', () => {
    expect(validateClaim(mkClaim())).toEqual([])
    expect(validateClaim(mkClaim({ scope_note: '  ' }))).toHaveLength(1)
    expect(validateClaim(mkClaim({ tier: 'clinical', scope_note: '' }))).toEqual([])
    const undated = mkClaim()
    undated.provenance = { ...undated.provenance, retrieved_at: '' }
    expect(validateClaim(undated)).toHaveLength(1)
  })
})

describe('computeEvidenceFloor (§3)', () => {
  it('takes the lowest load-bearing tier and counts the distribution', () => {
    const floor = computeEvidenceFloor([
      mkClaim({ tier: 'reference', estimate_kind: 'identity' }),
      mkClaim({ tier: 'clinical' }),
      mkClaim({ tier: 'community' }),
    ])
    expect(floor?.floor).toBe('community')
    expect(floor?.distribution).toEqual({ reference: 1, clinical: 1, community: 1 })
  })
  it('returns null when nothing qualifies', () => {
    expect(computeEvidenceFloor([mkClaim({ estimate_kind: 'identity' })], isLoadBearing)).toBeNull()
  })
})

describe('catalog bridge', () => {
  it('derives three community-tier figures from a preset, all valid', () => {
    const preset = reconPresetFor('bpc-157')!
    const claims = reconPresetClaims(preset)
    expect(claims.map((c) => c.field)).toEqual([
      'reference_amount',
      'common_vial_strength',
      'typical_reconstitution_volume',
    ])
    expect(claims.every((c) => c.tier === 'community')).toBe(true)
    expect(claims[0].estimate_kind).toBe('dose_convention')
    expect(claims[0].value).toBe(preset.doseMcg)
    for (const c of claims) {
      expect(validateClaim(c)).toEqual([])
      expect(c.provenance.retrieved_at).toBe(RECON_PRESETS_CURATED_AT)
    }
  })

  it('every preset yields valid claims', () => {
    for (const p of RECON_PRESETS) {
      for (const c of reconPresetClaims(p)) expect(validateClaim(c)).toEqual([])
    }
  })

  it('floors a monograph on its figures, not its chemistry', () => {
    const bpc = catalogClaims({ slug: 'bpc-157' })
    expect(bpc.some((c) => c.estimate_kind === 'identity')).toBe(true)
    expect(computeEvidenceFloor(bpc, isLoadBearing)?.floor).toBe('community')
    // A verified compound with no preset has no load-bearing figure → no floor.
    expect(reconPresetFor('glutathione')).toBeUndefined()
    expect(computeEvidenceFloor(catalogClaims({ slug: 'glutathione' }), isLoadBearing)).toBeNull()
  })
})

describe('audit-evidence CLI & schema-0.1.1 validation', () => {
  it('validates compliant claims against schema-0.1.1.json and rejects invalid ones', () => {
    expect(validateAgainstJsonSchema(mkClaim(), 'test:ok')).toEqual([])

    const badSchemaVersion = mkClaim({
      provenance: {
        source_type: 'publication',
        source_name: 'PubMed',
        retrieved_at: '2026-01-01',
        schema_version: '0.1.0' as typeof SCHEMA_VERSION,
      },
    })
    expect(
      validateAgainstJsonSchema(badSchemaVersion, 'test:ver').some((i) =>
        i.message.includes('schema_version'),
      ),
    ).toBe(true)
  })

  it('enforces normative scope-note, verification-window, and floor rules', () => {
    const missingScope = mkClaim({ tier: 'third_party', scope_note: '' })
    expect(
      checkNormativeClaimRules(missingScope, 'test:scope').some((i) => i.rule === 'scope-note'),
    ).toBe(true)

    const staleCommercial = mkClaim({
      tier: 'vendor_reported',
      estimate_kind: 'commercial',
      provenance: {
        source_type: 'vendor',
        source_name: 'Vendor',
        retrieved_at: '2026-01-01',
        schema_version: SCHEMA_VERSION,
      },
    })
    const staleIssues = checkNormativeClaimRules(
      staleCommercial,
      'test:stale',
      Date.parse('2026-03-01'),
    )
    expect(staleIssues.some((i) => i.rule === 'verification-window')).toBe(true)

    const floorCheck = verifyFloorNeverExceedsWeakest(
      'sources:ghk-cu',
      [
        mkClaim({ tier: 'third_party', estimate_kind: 'purity' }),
        mkClaim({ tier: 'vendor_reported', estimate_kind: 'purity' }),
      ],
      () => true,
    )
    expect(floorCheck.passed).toBe(true)
    expect(floorCheck.floor).toBe('vendor_reported')
  })

  it('produces a deterministic read-only audit report with GHK-Cu reconciliation and compound gaps', () => {
    const report = runEvidenceAudit(Date.parse('2026-11-01'))
    expect(report.schemaVersion).toBe('0.1.1')
    expect(report.summary.floorChecksFailed).toBe(0)
    expect(report.summary.normativeViolations).toBe(0)
    expect(report.ghkCuReconciliation.slug).toBe('ghk-cu')
    expect(report.ghkCuReconciliation.identityTier).toBe('reference')
    expect(report.ghkCuReconciliation.computedFloor).toBe('vendor_reported')
    expect(report.ghkCuReconciliation.floorMatchesWeakestLoadBearing).toBe(true)
    expect(report.compoundGaps.length).toBe(report.summary.totalCatalogCompounds)
    // Top gap compound must be missing REF and 3P coverage
    expect(report.compoundGaps[0].refComplete).toBe(false)
    expect(report.compoundGaps[0].missing3p).toBe(true)
  })
})
