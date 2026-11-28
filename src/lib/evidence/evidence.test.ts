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
  isCommunityContextClaim,
  isLoadBearing,
  monographEvidenceSummary,
  reconPresetClaims,
  reconPresetFor,
} from '@/lib/evidence/from-catalog'
import { reconcileCompoundSources } from '@/lib/evidence/from-vendors'
import {
  RESEARCH_AREAS,
  computeAreaRelevanceScore,
  getPeptidesForArea,
  getResearchAreaBySlug,
} from '@/lib/research-areas'
import type { Vendor } from '@/lib/vendors'
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

  it('floors a monograph on its load-bearing primary research evidence (CLIN/PRE), separating optional community preset conventions (COMM)', () => {
    // Cagrilintide: REF chemistry (2) + CLIN research/PK (2) + optional COMM presets (3)
    const cagriClaims = catalogClaims({ slug: 'cagrilintide' })
    const cagriFloor = computeEvidenceFloor(cagriClaims, isLoadBearing)
    expect(cagriFloor?.floor).toBe('clinical')
    expect(cagriFloor?.distribution).toEqual({
      clinical: 2,
    })
    const cagriSummary = monographEvidenceSummary({ slug: 'cagrilintide' })
    expect(cagriSummary.primaryFloor?.floor).toBe('clinical')
    expect(cagriSummary.primaryFloor?.distribution).toEqual({
      clinical: 2,
    })
    expect(cagriSummary.referenceCount).toBe(2)
    expect(cagriSummary.communityCount).toBe(3)
    expect(cagriClaims.filter(isCommunityContextClaim)).toHaveLength(3)

    // BPC-157: REF chemistry (2) + PRE research (1) + optional COMM presets (3)
    const bpcClaims = catalogClaims({ slug: 'bpc-157' })
    expect(bpcClaims.some((c) => c.estimate_kind === 'identity')).toBe(true)
    const bpcFloor = computeEvidenceFloor(bpcClaims, isLoadBearing)
    expect(bpcFloor?.floor).toBe('preclinical')
    expect(bpcFloor?.distribution).toEqual({
      preclinical: 1,
    })
    const bpcSummary = monographEvidenceSummary({ slug: 'bpc-157' })
    expect(bpcSummary.referenceCount).toBe(2)
    expect(bpcSummary.communityCount).toBe(3)

    // GHK-Cu & AHK-Cu: REF chemistry (2) + PRE research (1) + optional COMM presets (3)
    const ghkFloor = computeEvidenceFloor(catalogClaims({ slug: 'ghk-cu' }), isLoadBearing)
    expect(ghkFloor?.floor).toBe('preclinical')
    const ahkFloor = computeEvidenceFloor(catalogClaims({ slug: 'ahk-cu' }), isLoadBearing)
    expect(ahkFloor?.floor).toBe('preclinical')

    // Glutathione: no preset (0 COMM), verified REF chemistry (2) + PRE research (1)
    expect(reconPresetFor('glutathione')).toBeUndefined()
    const glutFloor = computeEvidenceFloor(catalogClaims({ slug: 'glutathione' }), isLoadBearing)
    expect(glutFloor?.floor).toBe('preclinical')
    expect(glutFloor?.distribution).toEqual({
      preclinical: 1,
    })
  })

  it('compares mixed-tier evidence floors: monograph (REF + CLIN + COMM) vs sourcing (REF + 3P + VEN + COMM)', () => {
    // Monograph mixed tiers (REF + CLIN + optional COMM): floor is CLIN when using monograph isLoadBearing
    const mixedMonograph: Claim[] = [
      mkClaim({ field: 'molecular_weight', tier: 'reference', estimate_kind: 'identity' }),
      mkClaim({ field: 'primary_research_evidence', tier: 'clinical', estimate_kind: 'pharmacodynamic', scope_note: '' }),
      mkClaim({ field: 'reference_amount', tier: 'community', estimate_kind: 'dose_convention', scope_note: SCOPE_NOTES.dose_convention }),
    ]
    expect(computeEvidenceFloor(mixedMonograph, isLoadBearing)?.floor).toBe('clinical')

    // Sourcing mixed tiers (REF + 3P + VEN): identity is excluded from sourcing floor, so VEN is the floor
    const mixedSourcing: Claim[] = [
      mkClaim({ field: 'molecular_weight', tier: 'reference', estimate_kind: 'identity' }),
      mkClaim({ field: 'listed_purity', tier: 'third_party', estimate_kind: 'purity', scope_note: SCOPE_NOTES.third_party }),
      mkClaim({ field: 'listed_purity', tier: 'vendor_reported', estimate_kind: 'purity', scope_note: SCOPE_NOTES.vendor_reported }),
    ]
    expect(
      computeEvidenceFloor(mixedSourcing, (c) => c.estimate_kind !== 'identity')?.floor,
    ).toBe('vendor_reported')

    // Sourcing mixed tiers with an unvetted community source (REF + VEN + COMM purity): floor drops to COMM
    const mixedSourcingWithComm: Claim[] = [
      ...mixedSourcing,
      mkClaim({ field: 'listed_purity', tier: 'community', estimate_kind: 'purity', scope_note: SCOPE_NOTES.community }),
    ]
    expect(
      computeEvidenceFloor(mixedSourcingWithComm, (c) => c.estimate_kind !== 'identity')?.floor,
    ).toBe('community')
  })
})

describe('generalized GHK-Cu compound source reconciliation', () => {
  it('reconciles GHK-Cu across 3P and VEN vendor tiers with REF chemistry and VEN sourcing floor', () => {
    const ghk = reconcileCompoundSources('ghk-cu')
    expect(ghk.isReconciled).toBe(true)
    expect(ghk.hasSourcingPage).toBe(true)
    expect(ghk.identityTier).toBe('reference')
    expect(ghk.identityClaims.length).toBeGreaterThanOrEqual(2)
    expect(ghk.topSourceTier).toBe('third_party')
    expect(ghk.sourcingFloor?.floor).toBe('vendor_reported')
    expect(ghk.tierCounts).toEqual({
      third_party: 2,
      vendor_reported: 1,
    })
  })

  it('lets any compound opt into 3P / VEN / COMM badges via verified vendor records while keeping unreconciled compounds cleanly unpopulated', () => {
    // Cagrilintide has 2 documented (3P) vendors and 0 VEN vendors → floor is third_party (3P)
    const cagri = reconcileCompoundSources('cagrilintide')
    expect(cagri.isReconciled).toBe(true)
    expect(cagri.sourcingFloor?.floor).toBe('third_party')
    expect(cagri.tierCounts).toEqual({ third_party: 2 })

    // Unreconciled reference-only compound (e.g. insulin / secretin) stays cleanly unpopulated
    const secretin = reconcileCompoundSources('secretin')
    expect(secretin.isReconciled).toBe(false)
    expect(secretin.hasSourcingPage).toBe(false)
    expect(secretin.sources).toEqual([])
    expect(secretin.groups).toEqual([])
    expect(secretin.sourcingFloor).toBeNull()
    expect(secretin.topSourceTier).toBeNull()

    // Custom vendor injection with 3P + VEN + COMM tiers reconciles and orders strictly by tier weight then trustScore
    const mockVendors: Vendor[] = [
      {
        id: 'unvetted-source',
        name: 'Unvetted Source',
        url: 'https://unvetted.example',
        blurb: 'No COA on file',
        peptides: ['ghk-cu'],
        shipsTo: ['us'],
        trust: {
          coaOnFile: false,
          thirdPartyTested: false,
          perBatchTesting: false,
          reshipPolicy: false,
          refundPolicy: false,
        },
      },
      {
        id: 'claimed-source',
        name: 'Claimed Source',
        url: 'https://claimed.example',
        blurb: 'Static COA on file',
        peptides: ['ghk-cu'],
        shipsTo: ['us'],
        trust: {
          coaOnFile: true,
          thirdPartyTested: false,
          perBatchTesting: false,
          purityPct: 98,
          reshipPolicy: false,
          refundPolicy: true,
        },
      },
      {
        id: 'documented-source',
        name: 'Documented Source',
        url: 'https://documented.example',
        blurb: 'Per-batch 3P COA',
        peptides: ['ghk-cu'],
        shipsTo: ['us'],
        trust: {
          coaOnFile: true,
          thirdPartyTested: true,
          perBatchTesting: true,
          purityPct: 99,
          coaDate: '2026-11-01',
          reshipPolicy: true,
          refundPolicy: true,
        },
      },
    ]
    const custom = reconcileCompoundSources('ghk-cu', { vendors: mockVendors })
    expect(custom.sources.map((s) => s.tier)).toEqual([
      'third_party',
      'vendor_reported',
      'community',
    ])
    expect(custom.sourcingFloor?.floor).toBe('community')
    expect(custom.tierCounts).toEqual({
      third_party: 1,
      vendor_reported: 1,
      community: 1,
    })
    for (const c of custom.purityClaims) {
      expect(validateClaim({ ...c, provenance: { ...c.provenance, retrieved_at: '2026-11-01' } })).toEqual([])
    }
  })
})

describe('research-areas primary-indication ranking', () => {
  it('ranks canonical primary-indication compounds ahead of secondary matches on Sleep & Circadian and Cognition & Neuroprotection', () => {
    const sleepArea = getResearchAreaBySlug('sleep-circadian')!
    const sleepPeptides = getPeptidesForArea(sleepArea)
    expect(sleepPeptides.slice(0, 2).map((p) => p.slug)).toEqual(['dsip', 'epitalon'])
    // Secondary metabolic/GH matches (Tirzepatide for OSA, MK-677) sort after primary sleep/circadian peptides
    expect(
      computeAreaRelevanceScore(sleepPeptides[0], sleepArea),
    ).toBeGreaterThan(
      computeAreaRelevanceScore(
        sleepPeptides.find((p) => p.slug === 'tirzepatide')!,
        sleepArea,
      ),
    )

    const cogArea = getResearchAreaBySlug('cognition-neuroprotection')!
    const cogPeptides = getPeptidesForArea(cogArea)
    expect(cogPeptides.slice(0, 3).map((p) => p.slug)).toEqual([
      'semax',
      'selank',
      'cerebrolysin',
    ])
    // Secondary matches (EPO, Tesamorelin) sort after canonical cognitive peptides
    const semaxScore = computeAreaRelevanceScore(
      cogPeptides.find((p) => p.slug === 'semax')!,
      cogArea,
    )
    const epoScore = computeAreaRelevanceScore(
      cogPeptides.find((p) => p.slug === 'epo')!,
      cogArea,
    )
    const tesaScore = computeAreaRelevanceScore(
      cogPeptides.find((p) => p.slug === 'tesamorelin')!,
      cogArea,
    )
    expect(semaxScore).toBeGreaterThan(epoScore)
    expect(semaxScore).toBeGreaterThan(tesaScore)
  })

  it('orders featured canonical compounds first across every research area', () => {
    for (const area of RESEARCH_AREAS) {
      const peptides = getPeptidesForArea(area)
      expect(peptides.length).toBeGreaterThan(0)
      if (area.featuredSlugs && area.featuredSlugs.length > 0) {
        const presentFeatured = area.featuredSlugs.filter((slug) =>
          peptides.some((p) => p.slug === slug),
        )
        expect(peptides.slice(0, presentFeatured.length).map((p) => p.slug)).toEqual(
          presentFeatured,
        )
      }
    }
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
