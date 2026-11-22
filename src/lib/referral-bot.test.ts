import { describe, it, expect } from 'vitest'
import { recordBotClick, recordReferralClick, getReferralStats } from './referrals'
import { clientIp } from './agent-quota'

describe('recordBotClick keeps bots out of human referral counts', () => {
  it('increments botClicks, not allTime, and shows in totals', async () => {
    const vendorId = 'amino-club'
    const before = await getReferralStats(1)
    const v0 = before.vendors.find((v) => v.id === vendorId)!
    const baseHuman = v0.allTime
    const baseBot = v0.botClicks
    const baseTotalBot = before.totalBotClicks

    await recordBotClick(vendorId)
    await recordBotClick(vendorId)
    await recordReferralClick(vendorId) // one real human for contrast

    const after = await getReferralStats(1)
    const v1 = after.vendors.find((v) => v.id === vendorId)!
    expect(v1.botClicks).toBe(baseBot + 2)
    expect(v1.allTime).toBe(baseHuman + 1) // bots did NOT inflate this
    expect(after.totalBotClicks).toBe(baseTotalBot + 2)
  })
})

describe('clientIp prefers CF-Connecting-IP behind Cloudflare', () => {
  const make = (headers: Record<string, string>) => new Request('https://x', { headers })

  it('uses cf-connecting-ip when present', () => {
    expect(
      clientIp(
        make({
          'cf-connecting-ip': '203.0.113.9',
          'x-forwarded-for': '203.0.113.9, 172.16.0.1, 10.0.0.1',
          'x-real-ip': '172.16.0.1',
        }),
      ),
    ).toBe('203.0.113.9')
  })

  it('falls back to the first x-forwarded-for hop without CF', () => {
    expect(clientIp(make({ 'x-forwarded-for': '198.51.100.7, 10.0.0.1' }))).toBe('198.51.100.7')
  })

  it('falls back to x-real-ip, then unknown', () => {
    expect(clientIp(make({ 'x-real-ip': '198.51.100.22' }))).toBe('198.51.100.22')
    expect(clientIp(make({}))).toBe('unknown')
  })
})
