import { describe, expect, it } from 'vitest'
import { blend, OVER_DELIVERY_NOTE, OVER_FRACTION_HIGHLIGHT, overDeliveryNote } from '@/lib/blend'

describe('blend calculator math', () => {
  it('computes shared-vial doses from the scarcest peptide', () => {
    const res = blend(3, [
      { name: 'BPC-157', massMg: 5, doseMcg: 250 },
      { name: 'TB-500', massMg: 10, doseMcg: 500 },
    ])
    expect(res.doses).toBe(20)
    expect(res.drawMl).toBeCloseTo(0.15)
    expect(res.units).toBeCloseTo(15)
    expect(res.components[0].deliveredMcg).toBe(250)
    expect(res.components[0].overFraction).toBe(0)
    expect(res.components[1].deliveredMcg).toBe(500)
    expect(res.components[1].overFraction).toBe(0)
  })

  it('flags over-delivery when component masses are not proportioned', () => {
    const res = blend(2, [
      { name: 'A', massMg: 5, doseMcg: 500 }, // 10 standalone doses (limiting)
      { name: 'B', massMg: 5, doseMcg: 250 }, // 20 standalone doses -> delivers 500 mcg (+100%)
    ])
    expect(res.doses).toBe(10)
    expect(res.components[1].deliveredMcg).toBe(500)
    expect(res.components[1].overFraction).toBe(1)
    expect(res.components[1].overFraction).toBeGreaterThan(OVER_FRACTION_HIGHLIGHT)
    expect(overDeliveryNote(res.components[1].overFraction)).toBe(OVER_DELIVERY_NOTE)
    expect(overDeliveryNote(0)).toBeNull()
  })

  it('handles zero or invalid inputs cleanly without NaN', () => {
    const res = blend(0, [{ massMg: 0, doseMcg: 250 }])
    expect(res.doses).toBe(0)
    expect(res.drawMl).toBe(0)
    expect(res.units).toBe(0)
    expect(res.components[0].valid).toBe(false)
  })
})
