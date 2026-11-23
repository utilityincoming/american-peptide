import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { getReferralStats } from '@/lib/referrals'

// No ADMIN_SECRET/CRON_SECRET in the test env and NODE_ENV !== 'production', so
// the route is open here (dev mode) — mirrors GET /api/admin/referrals.

function post(conversions: unknown) {
  return new NextRequest('https://americanpeptide.com/api/admin/referrals/import', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ conversions }),
  })
}

const uniq = () => `imp-${Math.random().toString(36).slice(2)}`

describe('POST /api/admin/referrals/import', () => {
  it('records valid rows, dedupes re-imports, and reflects in stats', async () => {
    const vendorId = 'amino-club'
    const orderId = uniq()

    const before = await getReferralStats(1)
    const baseRev = before.vendors.find((v) => v.id === vendorId)!.revenueCents

    const res1 = await POST(post([{ vendor: vendorId, orderId, amount: '49.99', product: 'semaglutide' }]))
    const body1 = await res1.json()
    expect(res1.status).toBe(200)
    expect(body1.summary).toMatchObject({ total: 1, recorded: 1, duplicate: 0, invalid: 0 })

    // Re-import the same order → duplicate, no double count.
    const res2 = await POST(post([{ vendor: vendorId, orderId, amount: '49.99' }]))
    const body2 = await res2.json()
    expect(body2.summary).toMatchObject({ recorded: 0, duplicate: 1 })

    const after = await getReferralStats(1)
    expect(after.vendors.find((v) => v.id === vendorId)!.revenueCents).toBe(baseRev + 4999)
  })

  it('reports invalid rows without aborting the batch', async () => {
    const good = uniq()
    const res = await POST(
      post([
        { vendor: 'amino-club', orderId: good, amount: '10' },
        { vendor: 'amino-club', orderId: uniq(), amount: 'free' }, // bad amount
        { vendor: 'no-such-vendor', orderId: uniq(), amount: '5' }, // unknown vendor
      ]),
    )
    const body = await res.json()
    expect(body.summary).toMatchObject({ total: 3, recorded: 1, invalid: 2 })
  })

  it('rejects a non-array body', async () => {
    const res = await POST(post('nope' as unknown))
    expect(res.status).toBe(400)
  })

  it('rejects an empty batch', async () => {
    const res = await POST(post([]))
    expect(res.status).toBe(400)
  })
})
