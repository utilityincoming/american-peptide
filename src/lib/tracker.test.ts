import { describe, it, expect } from 'vitest'
import { costPerDose, nextDue, type Protocol } from '@/lib/tracker'

describe('costPerDose', () => {
  it('splits a 10 mg vial into 40 × 250 mcg doses', () => {
    const r = costPerDose(10, 250)
    expect(r.dosesPerVial).toBe(40)
    expect(r.costPerDose).toBeNull()
  })
  it('divides cost across doses when a price is given', () => {
    const r = costPerDose(10, 250, 80)
    expect(r.dosesPerVial).toBe(40)
    expect(r.costPerDose).toBeCloseTo(2, 10)
  })
  it('handles sub-mg doses (5 mg vial, 100 mcg)', () => {
    const r = costPerDose(5, 100, 50)
    expect(r.dosesPerVial).toBe(50)
    expect(r.costPerDose).toBeCloseTo(1, 10)
  })
  it('returns no cost for invalid inputs', () => {
    expect(costPerDose(0, 250, 80).costPerDose).toBeNull()
    expect(costPerDose(10, 0, 80).costPerDose).toBeNull()
  })
  it('treats a zero price as unknown', () => {
    expect(costPerDose(10, 250, 0).costPerDose).toBeNull()
  })
})

describe('nextDue', () => {
  const base: Protocol = {
    id: 'p1',
    label: 'Test',
    doseMcg: 250,
    intervalHours: 24,
    startTs: 1_000_000_000_000,
    active: true,
  }

  it('returns the start time before the protocol has begun', () => {
    expect(nextDue(base, base.startTs - 1000)).toBe(base.startTs)
  })
  it('returns the next interval boundary mid-protocol', () => {
    const oneDay = 24 * 3_600_000
    // 1.5 days in → next due is at the 2-day boundary.
    const now = base.startTs + Math.floor(1.5 * oneDay)
    expect(nextDue(base, now)).toBe(base.startTs + 2 * oneDay)
  })
  it('returns null for an inactive protocol', () => {
    expect(nextDue({ ...base, active: false })).toBeNull()
  })
  it('returns null for a zero interval', () => {
    expect(nextDue({ ...base, intervalHours: 0 })).toBeNull()
  })
})
