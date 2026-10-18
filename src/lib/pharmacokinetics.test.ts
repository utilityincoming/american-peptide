import { describe, it, expect } from 'vitest'
import {
  fractionRemaining,
  timeToFraction,
  timeToSteadyState,
  accumulationRatio,
  peakTroughRatio,
  clearanceTime,
  interactionCheck,
  getPk,
  pkWithHalfLife,
} from '@/lib/pharmacokinetics'

// Single-compartment first-order elimination. Values below are derived from
// first principles:
//   fraction remaining = 0.5 ^ (t / t½)
//   time to a fraction  = t½ · log2(1/fraction)
//   accumulation ratio  = 1 / (1 - 0.5 ^ (τ / t½))
//   peak:trough         = 2 ^ (τ / t½)

describe('fractionRemaining', () => {
  it('is 0.5 after exactly one half-life', () => {
    expect(fractionRemaining(10, 10)).toBeCloseTo(0.5, 10)
  })
  it('is 0.25 after two half-lives', () => {
    expect(fractionRemaining(10, 20)).toBeCloseTo(0.25, 10)
  })
  it('is 1 at t=0', () => {
    expect(fractionRemaining(10, 0)).toBeCloseTo(1, 10)
  })
})

describe('timeToFraction', () => {
  it('returns one half-life to reach 50%', () => {
    expect(timeToFraction(10, 0.5)).toBeCloseTo(10, 10)
  })
  it('returns ~5 half-lives to reach 3% remaining', () => {
    expect(timeToFraction(10, 0.03) / 10).toBeCloseTo(5.06, 1)
  })
  it('rejects out-of-range fractions', () => {
    expect(timeToFraction(10, 0)).toBeNaN()
    expect(timeToFraction(10, 1)).toBeNaN()
  })
})

describe('timeToSteadyState', () => {
  it('reaches 97% of steady state in ~5 half-lives', () => {
    expect(timeToSteadyState(24, 0.97) / 24).toBeCloseTo(5.06, 1)
  })
  it('is independent of dose interval (depends only on half-life)', () => {
    // 50% of steady state is reached in exactly one half-life.
    expect(timeToSteadyState(24, 0.5)).toBeCloseTo(24, 10)
  })
})

describe('accumulationRatio', () => {
  it('is ~2 when dosing once per half-life', () => {
    expect(accumulationRatio(24, 24)).toBeCloseTo(2, 10)
  })
  it('approaches 1 when the interval is long vs the half-life', () => {
    expect(accumulationRatio(1, 24)).toBeCloseTo(1, 5)
  })
  it('is large when dosing far more often than the half-life (weekly drug, daily dose)', () => {
    expect(accumulationRatio(168, 24)).toBeGreaterThan(5)
  })
})

describe('peakTroughRatio', () => {
  it('is 2 when dosing once per half-life', () => {
    expect(peakTroughRatio(24, 24)).toBeCloseTo(2, 10)
  })
  it('is near 1 for a long half-life dosed frequently (flat profile)', () => {
    expect(peakTroughRatio(168, 24)).toBeLessThan(1.2)
  })
})

describe('clearanceTime', () => {
  it('semaglutide (~1 week half-life) clears in roughly 5 weeks', () => {
    const weeks = clearanceTime(168, 0.03) / 168
    expect(weeks).toBeCloseTo(5.06, 1)
  })
})

describe('interactionCheck', () => {
  it('flags two GLP-1 agonists as an overlap', () => {
    const notes = interactionCheck(['semaglutide', 'liraglutide'])
    expect(notes.some((n) => n.severity === 'overlap' && n.message.includes('GLP-1'))).toBe(true)
  })
  it('flags multiple GH secretagogues', () => {
    const notes = interactionCheck(['ipamorelin', 'ghrp-2'])
    expect(notes.some((n) => n.message.includes('GH-release'))).toBe(true)
  })
  it('returns nothing for unrelated single compounds', () => {
    expect(interactionCheck(['bpc-157'])).toHaveLength(0)
  })
  it('ignores unknown slugs', () => {
    expect(interactionCheck(['not-a-real-peptide'])).toHaveLength(0)
  })
})

describe('data integrity', () => {
  it('every record with a half-life has low <= high and positive values', () => {
    for (const r of pkWithHalfLife()) {
      expect(r.halfLifeHours).not.toBeNull()
      expect(r.halfLifeHours!.low).toBeGreaterThan(0)
      expect(r.halfLifeHours!.high).toBeGreaterThanOrEqual(r.halfLifeHours!.low)
    }
  })
  it('keeps BPC-157 half-life null (no established human figure)', () => {
    expect(getPk('bpc-157')?.halfLifeHours).toBeNull()
  })
})
