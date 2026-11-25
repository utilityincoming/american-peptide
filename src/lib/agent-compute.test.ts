import { describe, expect, it } from 'vitest'
import { getPeptideBySlug } from './peptides'
import {
  CANONICAL_CALC_SCOPE_NOTE,
  computeBlend,
  computeCoaGrade,
  computePharmacokinetics,
  computeReconstitution,
  computeVendorRank,
} from './agent-compute'
import { AGENT_TOOLS, executeAgentTool } from './agent-tools'
import { MCP_TOOLS } from './mcp-manifest'

// Offline pins for the golden eval cases. A provider-ladder change is not done
// until `npm run eval` still quotes these, and a catalog edit that moves the
// number fails here before that.

describe('compute tools', () => {
  it('reconstitutes a 5 mg vial to 10 U-100 units and attaches the canonical /methods scope note', () => {
    const body = JSON.parse(computeReconstitution({ vial_mg: 5, dose_mcg: 250, water_ml: 2 }))
    expect(body.concentrationMcgPerMl).toBe(2500)
    expect(body.concentrationMgPerMl).toBe(2.5)
    expect(body.drawMl).toBe(0.1)
    expect(body.drawUnitsU100).toBe(10)
    expect(body.wholeDosesPerVial).toBe(20)
    expect(body.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
    expect(body.scope_note).toBe(
      'Unit arithmetic or a registry lookup from the stated inputs. This is a value, not a dosing recommendation.',
    )
  })

  it('reverse-solves water_ml from target_draw_units and computes molarity from catalog MW', () => {
    const body = JSON.parse(
      computeReconstitution({
        vial_mg: 5,
        dose_mcg: 250,
        target_draw_units: 10,
        peptide: 'bpc-157',
      }),
    )
    expect(body.solvedWaterMl).toBe(2)
    expect(body.waterMl).toBe(2)
    expect(body.drawUnitsU100).toBe(10)
    expect(body.molecularWeightDa).toBe(1419.5)
    // 2500 mcg/mL / 1419.5 g/mol * 1000 = 1761.184 µM
    expect(body.molarConcentrationUmolPerL).toBeCloseTo(1761.184, 2)
    expect(body.doseNmol).toBeCloseTo(176.118, 2)
    expect(body.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
  })

  it('handles missing molecular weight cleanly without inventing a value', () => {
    // Unknown peptide name
    const unknownMw = JSON.parse(
      computeReconstitution({
        vial_mg: 5,
        dose_mcg: 250,
        water_ml: 2,
        peptide: 'Zentaril-9',
      }),
    )
    expect(unknownMw.code).toBe('missing_molecular_weight')
    expect(unknownMw.error).toMatch(/Do not invent a molecular weight/)
    expect(unknownMw.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)

    // Catalog extract/mixture with no single molecularWeight (e.g. thymalin)
    const extractMw = JSON.parse(
      computeReconstitution({
        vial_mg: 10,
        dose_mcg: 1000,
        water_ml: 2,
        peptide: 'thymalin',
      }),
    )
    expect(extractMw.code).toBe('missing_molecular_weight')
    expect(extractMw.error).toMatch(/no stored molecularWeight/)
    expect(extractMw.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)

    // require_molar with neither peptide nor molecular_weight_da
    const requiredOnly = JSON.parse(
      computeReconstitution({
        vial_mg: 5,
        dose_mcg: 250,
        water_ml: 2,
        require_molar: true,
      }),
    )
    expect(requiredOnly.code).toBe('missing_molecular_weight')
    expect(requiredOnly.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
  })

  it('refuses a non-numeric or zero/negative reconstitution input', () => {
    expect(computeReconstitution({ vial_mg: 'nope' })).toMatch(/Need vial_mg/)
    expect(computeReconstitution({ vial_mg: 0, dose_mcg: 250, water_ml: 2 })).toMatch(/Values out of range/)
    expect(computeReconstitution({ vial_mg: 5, dose_mcg: -10, water_ml: 2 })).toMatch(/Values out of range/)
    expect(computeReconstitution({ vial_mg: 5, dose_mcg: 250, water_ml: 0 })).toMatch(/Values out of range/)
  })

  it('screens blend compatibility and shared-vial draw math with the canonical scope note', () => {
    const body = JSON.parse(
      computeBlend({
        peptides: [
          { slug: 'bpc-157', mass_mg: 5, dose_mcg: 250 },
          { slug: 'ghk-cu', mass_mg: 10, dose_mcg: 500 },
        ],
        buffer_ph: 7.4,
        water_ml: 2,
      }),
    )
    expect(body.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
    expect(body.pH).toBe(7.4)
    expect(body.peptides).toHaveLength(2)
    expect(body.flags.some((f: { code: string }) => f.code === 'opposite-charge')).toBe(true)
    expect(body.sharedVialDraw.wholeDoses).toBe(20)
    expect(body.sharedVialDraw.drawMl).toBe(0.1)
    expect(body.sharedVialDraw.drawUnitsU100).toBe(10)
  })

  it('rejects invalid/zero inputs in screen_blend', () => {
    const empty = JSON.parse(computeBlend({ peptides: [] }))
    expect(empty.code).toBe('invalid_input')
    expect(empty.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)

    const badPh = JSON.parse(
      computeBlend({
        peptides: [{ slug: 'bpc-157' }, { slug: 'tb-500' }],
        buffer_ph: 19,
      }),
    )
    expect(badPh.code).toBe('invalid_input')

    const zeroMass = JSON.parse(
      computeBlend({
        peptides: [
          { slug: 'bpc-157', mass_mg: 0, dose_mcg: 250 },
          { slug: 'tb-500', mass_mg: 5, dose_mcg: 250 },
        ],
        water_ml: 2,
      }),
    )
    expect(zeroMass.code).toBe('invalid_input')
  })

  it('pins semaglutide formula and half-life range and supports hypothetical half-life PK math', () => {
    expect(getPeptideBySlug('semaglutide')?.molecularFormula).toBe('C187H291N45O59')
    const body = JSON.parse(
      computePharmacokinetics({ name: 'semaglutide', interval_hours: 168, elapsed_hours: 167 }),
    )
    expect(body.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
    expect(body.halfLifeHours).toEqual({ low: 150, high: 184 })
    expect(body.halfLifeMidpointHours).toBe(167)
    expect(body.accumulationRatio).toBeCloseTo(1.99, 1)
    expect(body.peakTroughRatio).toBeCloseTo(2.01, 1)
    expect(body.fractionRemaining).toBeCloseTo(0.5, 2)
    expect(body.percentRemaining).toBeCloseTo(50, 1)

    // Explicit hypothetical half-life input without a catalog lookup
    const hyp = JSON.parse(
      computePharmacokinetics({ half_life_hours: 12, interval_hours: 12, elapsed_hours: 24 }),
    )
    expect(hyp.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
    expect(hyp.halfLifeMidpointHours).toBe(12)
    expect(hyp.accumulationRatio).toBe(2)
    expect(hyp.fractionRemaining).toBe(0.25)
  })

  it('does not invent a half-life for an unknown name or unestablished human PK', () => {
    expect(computePharmacokinetics({ name: 'Zentaril-9' })).toMatch(/Do not invent/)
    expect(computePharmacokinetics({ half_life_hours: 0 })).toMatch(/Invalid half_life_hours/)
    const bpc = JSON.parse(computePharmacokinetics({ name: 'bpc-157' }))
    expect(bpc.halfLifeHours).toBeNull()
    expect(bpc.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
  })

  it('refuses personal dosing / prescribing advice requests across calculator tools', () => {
    const reconRefusal = JSON.parse(
      computeReconstitution({
        vial_mg: 5,
        dose_mcg: 250,
        water_ml: 2,
        peptide: 'What dose should I take for my knee?',
      }),
    )
    expect(reconRefusal.code).toBe('personal_dosing_refused')
    expect(reconRefusal.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)

    const pkRefusal = JSON.parse(
      computePharmacokinetics({
        name: 'Please prescribe a personal protocol for me',
      }),
    )
    expect(pkRefusal.code).toBe('personal_dosing_refused')
    expect(pkRefusal.scope_note).toBe(CANONICAL_CALC_SCOPE_NOTE)
  })

  it('ranks semaglutide vendors with Amino Club first', () => {
    const body = JSON.parse(computeVendorRank({ name: 'Wegovy' }))
    expect(body.vendors[0].name).toBe('Amino Club')
    expect(body.vendors[0].trustScore).toBeGreaterThan(0)
    // Paramount is re-listed on the incretins (an aligned, deep-linked source) and
    // ranks below Amino Club on its honest documented-tier score, never above it.
    const paramount = body.vendors.find((v: { name: string }) => v.name === 'Paramount Peptides')
    expect(paramount).toBeDefined()
    expect(paramount.trustScore).toBeLessThan(body.vendors[0].trustScore)
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

  it('exposes reconstitute_vial, screen_blend, and peptide_half_life in both AGENT_TOOLS and MCP_TOOLS', async () => {
    const agentNames = AGENT_TOOLS.map((t) => t.name)
    const mcpNames = MCP_TOOLS.map((t) => t.name)
    for (const calcTool of ['reconstitute_vial', 'screen_blend', 'peptide_half_life']) {
      expect(agentNames).toContain(calcTool)
      expect(mcpNames).toContain(calcTool)
    }

    const resPk = await executeAgentTool('peptide_half_life', { name: 'semaglutide' })
    expect(resPk.isError).toBe(false)
    expect(resPk.content).toContain('150')
    expect(resPk.content).toContain('184')
    expect(resPk.content).toContain(CANONICAL_CALC_SCOPE_NOTE)

    const resBlend = await executeAgentTool('screen_blend', {
      peptides: [{ slug: 'pramlintide' }, { slug: 'insulin' }],
    })
    expect(resBlend.isError).toBe(false)
    expect(resBlend.content).toContain('labeled-incompatibility')
    expect(resBlend.content).toContain(CANONICAL_CALC_SCOPE_NOTE)
  })
})
