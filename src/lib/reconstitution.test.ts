import { describe, it, expect } from 'vitest'
import { reconstitute, solveWaterForDraw } from '@/lib/reconstitution'

// Reconstitution is a dilution calculation:
//   concentration (mcg/mL) = vial mass (mcg) / reconstitution volume (mL)
//   draw volume (mL) = target dose / concentration
//   U-100 syringe units = draw volume (mL) × 100   (100 units = 1 mL)
// Expected values below are computed independently from first principles, and
// match the worked example the site publishes (5 mg · 2 mL · 250 mcg → 10 units).

describe('reconstitute', () => {
  it('computes the documented worked example (5 mg vial, 2 mL, 250 mcg dose)', () => {
    const r = reconstitute({ vialAmount: 5000, dose: 250, waterMl: 2 })
    expect(r.concentrationPerMl).toBe(2500)
    expect(r.concentrationPerTick).toBe(250) // mcg per 0.1 mL
    expect(r.volumePerInjectionMl).toBeCloseTo(0.1, 10)
    expect(r.unitsPerInjection).toBeCloseTo(10, 10)
    expect(r.dosesPerVial).toBe(20)
  })

  it('handles a 10 mg vial at a 2.5 mg dose (tirzepatide-style preset)', () => {
    const r = reconstitute({ vialAmount: 10000, dose: 2500, waterMl: 2 })
    expect(r.concentrationPerMl).toBe(5000)
    expect(r.volumePerInjectionMl).toBeCloseTo(0.5, 10)
    expect(r.unitsPerInjection).toBeCloseTo(50, 10)
    expect(r.dosesPerVial).toBe(4)
  })

  it('rounds doses-per-vial down to whole doses', () => {
    // 5000 mcg / 300 mcg = 16.66… → 16 whole doses, not 17.
    const r = reconstitute({ vialAmount: 5000, dose: 300, waterMl: 2 })
    expect(r.dosesPerVial).toBe(16)
    expect(r.unitsPerInjection).toBeCloseTo(12, 10)
  })

  it('returns zero concentration and draw when no water is added', () => {
    const r = reconstitute({ vialAmount: 5000, dose: 250, waterMl: 0 })
    expect(r.concentrationPerMl).toBe(0)
    expect(r.concentrationPerTick).toBe(0)
    expect(r.volumePerInjectionMl).toBe(0)
    expect(r.unitsPerInjection).toBe(0)
  })

  it('returns zero draw and zero doses when no dose is entered', () => {
    const r = reconstitute({ vialAmount: 5000, dose: 0, waterMl: 2 })
    expect(r.concentrationPerMl).toBe(2500)
    expect(r.volumePerInjectionMl).toBe(0)
    expect(r.unitsPerInjection).toBe(0)
    expect(r.dosesPerVial).toBe(0)
  })
})

describe('solveWaterForDraw', () => {
  it('solves the water volume for a target U-100 draw', () => {
    // 5 mg vial, 250 mcg dose, want 10 units → 2.0 mL.
    expect(solveWaterForDraw(5000, 250, 10)).toBeCloseTo(2.0, 10)
  })

  it('returns zero when dose is zero (undefined division)', () => {
    expect(solveWaterForDraw(5000, 0, 10)).toBe(0)
  })
})
