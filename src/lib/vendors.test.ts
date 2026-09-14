import { describe, it, expect } from 'vitest'
import {
  VENDORS,
  TRUST_WEIGHTS,
  trustScore,
  vendorTier,
  canSpotlight,
  vendorHref,
  isAffiliate,
  shipsToLabel,
  vendorsByTier,
  coveredByBroadCatalog,
  type Vendor,
} from '@/lib/vendors'

// The trust score drives the affiliate ranking on /us-peptides — the single
// monetization-critical number on the site. These tests pin the weights, the
// two live vendor scores, and the tier/spotlight fences so a future data or
// logic edit can't silently move a vendor's ranking.

function mkVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: 'test-vendor',
    name: 'Test Vendor',
    url: 'https://example.com',
    blurb: 'test',
    peptides: ['bpc-157'],
    shipsTo: ['us'],
    trust: {
      coaOnFile: false,
      thirdPartyTested: false,
      perBatchTesting: false,
      reshipPolicy: false,
      refundPolicy: false,
    },
    ...overrides,
  }
}

describe('TRUST_WEIGHTS', () => {
  it('sums to 100 — the "100-point standard" invariant', () => {
    const sum = Object.values(TRUST_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBe(100)
  })
})

describe('trustScore', () => {
  it('scores the two live vendors to their published values', () => {
    const amino = VENDORS.find((v) => v.id === 'amino-club')!
    const absim = VENDORS.find((v) => v.id === 'absim-peptides')!
    expect(trustScore(amino)).toBe(100)
    expect(trustScore(absim)).toBe(40)
  })

  it('returns 0 with no transparency signals and 100 with all', () => {
    expect(trustScore(mkVendor())).toBe(0)
    expect(
      trustScore(
        mkVendor({
          trust: {
            coaOnFile: true,
            thirdPartyTested: true,
            perBatchTesting: true,
            reshipPolicy: true,
            refundPolicy: true,
          },
        }),
      ),
    ).toBe(100)
  })

  it('weights a COA alone at 15 points', () => {
    expect(trustScore(mkVendor({ trust: { ...mkVendor().trust, coaOnFile: true } }))).toBe(15)
  })
})

describe('vendorTier', () => {
  it('classifies documented / claimed / unvetted from the same signals', () => {
    const all = { coaOnFile: true, thirdPartyTested: true, perBatchTesting: true, reshipPolicy: true, refundPolicy: true }
    expect(vendorTier(mkVendor({ trust: all }))).toBe('documented')
    expect(vendorTier(mkVendor({ trust: { ...mkVendor().trust, coaOnFile: true } }))).toBe('claimed')
    expect(vendorTier(mkVendor())).toBe('unvetted')
  })
})

describe('canSpotlight', () => {
  it('requires an active affiliate AND a non-unvetted tier', () => {
    const claimed = { ...mkVendor().trust, coaOnFile: true }
    expect(canSpotlight(mkVendor({ affiliate: { active: true }, trust: claimed }))).toBe(true)
    expect(canSpotlight(mkVendor({ affiliate: { active: true }, trust: { ...mkVendor().trust } }))).toBe(false) // unvetted
    expect(canSpotlight(mkVendor({ trust: claimed }))).toBe(false) // not active
  })
})

describe('vendorHref', () => {
  it('uses the tracked redirect for active affiliates, homepage otherwise', () => {
    const active = mkVendor({
      affiliate: { active: true, trackedPath: '/go/test-vendor', url: 'https://example.com?ref=x' },
    })
    expect(vendorHref(active)).toBe('/go/test-vendor')

    const inactive = mkVendor()
    expect(vendorHref(inactive)).toBe('https://example.com')
  })

  it('deep-links a slug through the tracked chokepoint when a product URL exists', () => {
    const v = mkVendor({
      affiliate: {
        active: true,
        trackedPath: '/go/test-vendor',
        productUrls: { 'bpc-157': 'https://example.com/bpc-157' },
      },
    })
    expect(vendorHref(v, 'bpc-157')).toBe('/go/test-vendor?p=bpc-157')
    expect(vendorHref(v, 'ghk-cu')).toBe('/go/test-vendor') // no deep link → fallback
  })
})

describe('isAffiliate', () => {
  it('reflects the active flag only', () => {
    expect(isAffiliate(mkVendor({ affiliate: { active: true } }))).toBe(true)
    expect(isAffiliate(mkVendor())).toBe(false)
  })
})

describe('shipsToLabel', () => {
  it('renders worldwide, a region list, or empty', () => {
    expect(shipsToLabel(mkVendor({ shipsTo: ['global'] }))).toBe('Ships worldwide')
    expect(shipsToLabel(mkVendor({ shipsTo: ['us', 'ca'] }))).toBe('Ships to US, Canada')
    expect(shipsToLabel(mkVendor({ shipsTo: [] }))).toBe('')
  })
})

describe('vendorsByTier', () => {
  it('groups best-first and drops empty tiers', () => {
    const documented = mkVendor({ id: 'doc', trust: { coaOnFile: true, thirdPartyTested: true, perBatchTesting: true, reshipPolicy: false, refundPolicy: false } })
    const claimed = mkVendor({ id: 'clm', trust: { coaOnFile: true, thirdPartyTested: false, perBatchTesting: false, reshipPolicy: false, refundPolicy: false } })
    const groups = vendorsByTier([documented, claimed])
    expect(groups.map((g) => g.tier.id)).toEqual(['documented', 'claimed'])
    expect(groups[0].vendors.map((v) => v.id)).toEqual(['doc'])
  })
})

describe('coveredByBroadCatalog', () => {
  it('covers ordinary peptides and unknown slugs, but not peptide-hormone entries', () => {
    expect(coveredByBroadCatalog('bpc-157')).toBe(true)
    expect(coveredByBroadCatalog('teriparatide')).toBe(false) // peptide-hormone class
    expect(coveredByBroadCatalog('this-slug-does-not-exist')).toBe(true)
  })
})
