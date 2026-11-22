import { describe, it, expect } from 'vitest'
import {
  parseConversion,
  sign,
  verifySignature,
  secretEnvName,
  vendorSecret,
  isStale,
} from './referral-postback'
import { recordConversion, getReferralStats } from './referrals'

describe('parseConversion', () => {
  it('accepts a well-formed postback and derives cents', () => {
    const r = parseConversion({ vendor: 'amino-club', order: 'A1', amount: '49.99' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value).toMatchObject({
      vendor: 'amino-club',
      orderId: 'A1',
      amountCents: 4999,
      currency: 'USD',
    })
  })

  it('signs "49.9" and "49.90" identically (cents are canonical)', () => {
    const a = parseConversion({ vendor: 'v', order: 'o', amount: '49.9' })
    const b = parseConversion({ vendor: 'v', order: 'o', amount: '49.90' })
    expect(a.ok && b.ok && a.signatureBase === b.signatureBase).toBe(true)
  })

  it('accepts orderId as an alias for order', () => {
    const r = parseConversion({ vendor: 'v', orderId: 'X', amount: '10' })
    expect(r.ok && r.value.orderId).toBe('X')
  })

  const badCases: [string, Record<string, string>][] = [
    ['vendor missing', { order: 'o', amount: '1' }],
    ['vendor malformed', { vendor: 'BAD CAPS', order: 'o', amount: '1' }],
    ['order missing', { vendor: 'v', amount: '1' }],
    ['amount missing', { vendor: 'v', order: 'o' }],
    ['amount non-numeric', { vendor: 'v', order: 'o', amount: 'free' }],
    ['amount negative', { vendor: 'v', order: 'o', amount: '-5' }],
    ['currency bad', { vendor: 'v', order: 'o', amount: '1', currency: 'dollars' }],
    ['product bad', { vendor: 'v', order: 'o', amount: '1', product: 'Bad Slug!' }],
  ]
  it.each(badCases)('rejects: %s', (_label, raw) => {
    expect(parseConversion(raw).ok).toBe(false)
  })

  it('rejects an absurd amount above the ceiling', () => {
    expect(parseConversion({ vendor: 'v', order: 'o', amount: '100001' }).ok).toBe(false)
  })
})

describe('signatures', () => {
  const secret = 's3cr3t'
  const base = 'amino-club|A1|4999|USD|'

  it('round-trips a valid signature', () => {
    expect(verifySignature(base, secret, sign(base, secret))).toBe(true)
  })
  it('rejects a wrong secret', () => {
    expect(verifySignature(base, secret, sign(base, 'other'))).toBe(false)
  })
  it('rejects a tampered base (amount bumped)', () => {
    const forged = 'amino-club|A1|999999|USD|'
    expect(verifySignature(forged, secret, sign(base, secret))).toBe(false)
  })
  it('rejects a missing or malformed signature without throwing', () => {
    expect(verifySignature(base, secret, undefined)).toBe(false)
    expect(verifySignature(base, secret, 'xyz')).toBe(false)
  })
})

describe('secret env resolution', () => {
  it('maps a vendor id to an env var name', () => {
    expect(secretEnvName('absim-peptides')).toBe('REFERRAL_POSTBACK_SECRET_ABSIM_PEPTIDES')
  })
  it('reads the secret from a provided env, undefined when absent/empty', () => {
    const env = { REFERRAL_POSTBACK_SECRET_AMINO_CLUB: 'k' } as unknown as NodeJS.ProcessEnv
    expect(vendorSecret('amino-club', env)).toBe('k')
    expect(vendorSecret('absim-peptides', env)).toBeUndefined()
    expect(
      vendorSecret('x', { REFERRAL_POSTBACK_SECRET_X: '' } as unknown as NodeJS.ProcessEnv),
    ).toBeUndefined()
  })
})

describe('isStale', () => {
  const now = 1_000_000_000_000 // fixed ms
  it('passes when no ts supplied', () => expect(isStale(undefined, 3600, now)).toBe(false))
  it('passes inside the window', () => expect(isStale(now / 1000 - 10, 3600, now)).toBe(false))
  it('fails outside the window', () => expect(isStale(now / 1000 - 7200, 3600, now)).toBe(true))
})

describe('recordConversion (idempotency + stats)', () => {
  it('records once and dedupes a repeated order id', async () => {
    const vendorId = 'amino-club'
    const orderId = `test-${Math.random().toString(36).slice(2)}`

    const before = await getReferralStats(1)
    const v0 = before.vendors.find((v) => v.id === vendorId)!
    const baseCnv = v0.conversions
    const baseRev = v0.revenueCents

    expect(await recordConversion({ vendorId, orderId, amountCents: 4999 })).toBe('recorded')
    expect(await recordConversion({ vendorId, orderId, amountCents: 4999 })).toBe('duplicate')

    const after = await getReferralStats(1)
    const v1 = after.vendors.find((v) => v.id === vendorId)!
    expect(v1.conversions).toBe(baseCnv + 1) // counted exactly once
    expect(v1.revenueCents).toBe(baseRev + 4999)
  })

  it('exposes derived conversionRate and epcCents, and totals', async () => {
    const stats = await getReferralStats(1)
    expect(typeof stats.totalConversions).toBe('number')
    expect(typeof stats.totalRevenueCents).toBe('number')
    for (const v of stats.vendors) {
      // No clicks ⇒ rate/EPC are 0, never NaN/Infinity.
      if (v.allTime === 0) {
        expect(v.conversionRate).toBe(0)
        expect(v.epcCents).toBe(0)
      } else {
        expect(Number.isFinite(v.conversionRate)).toBe(true)
        expect(Number.isFinite(v.epcCents)).toBe(true)
      }
    }
  })
})
