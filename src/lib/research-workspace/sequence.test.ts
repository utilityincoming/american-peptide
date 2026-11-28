import { describe, expect, it } from 'vitest'
import { alignSequences, chargeCurve, hydropathyWindow, mutationDeltas, rowsToCsv } from './sequence'
import { applyTrialFilters, phaseDistribution, rapidUpdates, whitespacePhases } from './pulse'
import type { TrialRecord } from './types'

describe('alignSequences', () => {
  it('marks substitutions and keeps equal residues', () => {
    const cells = alignSequences('ACDE', 'ACFE')
    expect(cells.map((c) => c.kind).join('')).toBe('matchmatchsubmatch')
    expect(cells[2]).toEqual({ a: 'D', b: 'F', kind: 'sub' })
  })

  it('inserts a gap when lengths differ', () => {
    const cells = alignSequences('AAA', 'AAAA')
    expect(cells.filter((c) => c.kind === 'gap')).toHaveLength(1)
    expect(cells.filter((c) => c.a === 'A' && c.b === 'A')).toHaveLength(3)
  })
})

describe('hydropathy and charge', () => {
  it('averages a window and covers every residue', () => {
    const series = hydropathyWindow(['I', 'I', 'D', 'D'], 3)
    expect(series).toHaveLength(4)
    expect(series[0].kd).toBeGreaterThan(series[3].kd)
  })

  it('drops charge as pH rises for a basic peptide', () => {
    const curve = chargeCurve(['K', 'K'])
    expect(curve[0].charge).toBeGreaterThan(curve[curve.length - 1].charge)
    expect(curve.some((p) => p.ph === 7.4 || p.ph === 7.5)).toBe(true)
  })
})

describe('mutationDeltas', () => {
  it('reports a mass change when alanine replaces tryptophan', () => {
    const deltas = mutationDeltas(['W'], 0)
    const ala = deltas.find((d) => d.code === 'A')
    expect(ala).toBeTruthy()
    expect(ala!.dMass).toBeLessThan(0)
  })
})

describe('rowsToCsv', () => {
  it('quotes commas and appends attribution', () => {
    const csv = rowsToCsv(['name'], [['A, B']])
    expect(csv).toContain('"A, B"')
    expect(csv).toContain('AmericanPeptide.com')
  })
})

const TRIALS: TrialRecord[] = [
  {
    nctId: 'NCT1',
    title: 'Obesity study',
    status: 'RECRUITING',
    phases: ['Phase 2'],
    sponsor: 'Acme',
    enrollment: 10,
    conditions: ['Obesity'],
    lastUpdate: '2026-11-01',
    startDate: '2024-01-01',
  },
  {
    nctId: 'NCT2',
    title: 'Wound study',
    status: 'COMPLETED',
    phases: ['Phase 1'],
    sponsor: 'Other Lab',
    enrollment: 4,
    conditions: ['Wound healing'],
    lastUpdate: '2020-01-01',
    startDate: '2019-01-01',
  },
]

describe('pulse filters', () => {
  it('filters by phase, status, and condition', () => {
    const shown = applyTrialFilters(TRIALS, {
      query: 'peptide',
      phase: 'Phase 2',
      status: 'recruit',
      condition: 'obes',
      sponsor: 'acme',
      from: '',
      to: '',
    })
    expect(shown.map((t) => t.nctId)).toEqual(['NCT1'])
  })

  it('counts phases and names phases the filter removed', () => {
    expect(phaseDistribution(TRIALS).map((d) => d.phase)).toEqual(['Phase 1', 'Phase 2'])
    const shown = applyTrialFilters(TRIALS, {
      query: '',
      phase: 'Phase 2',
      status: '',
      condition: '',
      sponsor: '',
      from: '',
      to: '',
    })
    expect(whitespacePhases(TRIALS, shown)).toEqual(['Phase 1'])
  })

  it('flags recent registry updates', () => {
    expect(rapidUpdates(TRIALS, '2026-11-27', 90).map((t) => t.nctId)).toEqual(['NCT1'])
  })
})
