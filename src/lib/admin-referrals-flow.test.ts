import { describe, it, expect } from 'vitest'
import {
  reducer,
  initialState,
  toVendorRow,
  toDashboardView,
  formatCents,
  formatPct,
} from './admin-referrals-flow'
import type { ReferralStats, VendorReferralStats } from './referrals'

function vendor(p: Partial<VendorReferralStats> & { id: string }): VendorReferralStats {
  return {
    id: p.id,
    name: p.name ?? p.id,
    active: p.active ?? true,
    allTime: p.allTime ?? 0,
    months: p.months ?? [],
    byProduct: p.byProduct ?? [],
    conversions: p.conversions ?? 0,
    conversionMonths: p.conversionMonths ?? [],
    revenueCents: p.revenueCents ?? 0,
    revenueMonths: p.revenueMonths ?? [],
    conversionRate: p.conversionRate ?? 0,
    epcCents: p.epcCents ?? 0,
    botClicks: p.botClicks ?? 0,
    botMonths: p.botMonths ?? [],
  }
}

const stats: ReferralStats = {
  generated: '2026-11-22T00:00:00.000Z',
  persistent: true,
  months: ['2026-11'],
  totalAllTime: 12,
  totalConversions: 1,
  totalRevenueCents: 4999,
  totalBotClicks: 88,
  community: { allTime: 5, months: [] },
  vendors: [
    vendor({ id: 'a', allTime: 2, botClicks: 8 }),
    vendor({ id: 'b', allTime: 10, botClicks: 80, conversions: 1, revenueCents: 4999, conversionRate: 0.1, epcCents: 499 }),
  ],
}

describe('reducer', () => {
  it('idle → loading → loaded', () => {
    const loading = reducer(initialState, { type: 'load_started' })
    expect(loading.status).toBe('loading')
    const loaded = reducer(loading, { type: 'load_succeeded', stats })
    expect(loaded).toEqual({ status: 'loaded', stats })
  })

  it('records an error with its code and allows a retry', () => {
    const err = reducer({ status: 'loading' }, { type: 'load_failed', code: 'unauthorized', message: 'bad' })
    expect(err).toEqual({ status: 'error', code: 'unauthorized', message: 'bad' })
    expect(reducer(err, { type: 'load_started' }).status).toBe('loading')
  })
})

describe('view model', () => {
  it('computes bot share from human + bot total', () => {
    const row = toVendorRow(vendor({ id: 'x', allTime: 3, botClicks: 37 }))
    expect(row.clicks).toBe(3)
    expect(row.botClicks).toBe(37)
    expect(row.botShare).toBeCloseTo(37 / 40)
  })

  it('bot share is 0 when there is no traffic at all', () => {
    expect(toVendorRow(vendor({ id: 'z' })).botShare).toBe(0)
  })

  it('sorts rows by human clicks and rolls up totals', () => {
    const view = toDashboardView(stats)
    expect(view.rows.map((r) => r.id)).toEqual(['b', 'a']) // 10 before 2
    expect(view.totals.clicks).toBe(12)
    expect(view.totals.botClicks).toBe(88)
    expect(view.totals.botShare).toBeCloseTo(88 / 100)
    expect(view.community.clicks).toBe(5)
  })
})

describe('formatters', () => {
  it('formats cents as dollars', () => {
    expect(formatCents(4999)).toBe('$49.99')
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(123456)).toBe('$1,234.56')
  })
  it('formats a ratio as a percent', () => {
    expect(formatPct(0.1234)).toBe('12%')
    expect(formatPct(0)).toBe('0%')
    expect(formatPct(1)).toBe('100%')
  })
})
