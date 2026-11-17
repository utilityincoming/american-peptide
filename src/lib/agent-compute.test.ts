import { describe, expect, it } from 'vitest'
import { getPeptideBySlug } from './peptides'
import { computePharmacokinetics, computeReconstitution, computeVendorRank, computeCoaGrade } from './agent-compute'
import { executeAgentTool } from './agent-tools'

// Offline pins for the golden eval cases. A provider-ladder change is not done
// until `npm run eval` still quotes these, and a catalog edit that moves the
// number fails here before that.

describe('compute tools', () => {
  it('reconstitutes a 5 mg vial to 10 U-100 units', () => {
    const body = JSON.parse(computeReconstitution({ vial_mg: 5, dose_mcg: 250, water_ml: 2 }))
    expect(body.concentrationMcgPerMl).toBe(2500)
    expect(body.drawMl).toBe(0.1)
    expect(body.drawUnitsU100).toBe(10)
    expect(body.wholeDosesPerVial).toBe(20)
  })

  it('refuses a non-numeric reconstitution', () => {
    expect(computeReconstitution({ vial_mg: 'nope' })).toMatch(/Need vial_mg/)
  })

  it('pins semaglutide formula and half-life range', () => {
    expect(getPeptideBySlug('semaglutide')?.molecularFormula).toBe('C187H291N45O59')
    const body = JSON.parse(computePharmacokinetics({ name: 'semaglutide', interval_hours: 168 }))
    expect(body.halfLifeHours).toEqual({ low: 150, high: 184 })
    expect(body.halfLifeMidpointHours).toBe(167)
    expect(body.accumulationRatio).toBeCloseTo(1.99, 1)
  })

  it('does not invent a half-life for an unknown name', () => {
    expect(computePharmacokinetics({ name: 'Zentaril-9' })).toMatch(/Do not invent/)
  })

  it('ranks semaglutide vendors with Amino Club first', () => {
    const body = JSON.parse(computeVendorRank({ name: 'Wegovy' }))
    expect(body.vendors[0].name).toBe('Amino Club')
    expect(body.vendors[0].trustScore).toBeGreaterThan(0)
    expect(body.vendors.every((v: { name: string }) => v.name !== 'Paramount Peptides')).toBe(true)
  })

  it('grades a pasted COA without calling a model', () => {
    const body = JSON.parse(
      computeCoaGrade({
        text: 'Semaglutide Certificate of Analysis\nPurity (HPLC): 99.2%\nMass spec: confirmed\nLot: ABC123\nEndotoxin: <1 EU/mg',
      }),
    )
    expect(body.grade).toMatch(/^[ABCDF]$/)
    expect(body.percent).toBeGreaterThan(0)
  })

  it('is reachable through the agent tool dispatcher', async () => {
    const res = await executeAgentTool('peptide_half_life', { name: 'semaglutide' })
    expect(res.isError).toBe(false)
    expect(res.content).toContain('150')
    expect(res.content).toContain('184')
  })
})
