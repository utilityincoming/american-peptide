// Deterministic tools for the research agent and remote MCP server. Each one
// calls a pure TypeScript calculator function (reconstitution, blend math,
// blend compatibility screening, single-compartment pharmacokinetics, vendor
// trust ranking, COA grading) and returns a JSON payload stamped with the
// canonical scope note from /methods (SCOPE_NOTES.reference:
// "Unit arithmetic or a registry lookup from the stated inputs. This is a
// value, not a dosing recommendation.").
//
// The LLM never computes unit, concentration, molar, or PK arithmetic natively —
// all arithmetic routes through our deterministic TypeScript modules. Personal
// dosing/protocol recommendation requests are refused while explicit
// hypothetical numeric inputs return deterministic arithmetic.

import { matchPeptides } from '@/lib/agent-context'
import { blend, overDeliveryNote, type BlendComponent } from '@/lib/blend'
import { DEFAULT_BUFFER_PH, screenBlend, type BlendMember } from '@/lib/blend-screen'
import { analyzeCoa } from '@/lib/coa'
import { SCOPE_NOTES } from '@/lib/evidence/types'
import { getPeptideBySlug, PEPTIDES, type Peptide } from '@/lib/peptides'
import {
  accumulationRatio,
  clearanceTime,
  fractionRemaining,
  getPk,
  halfLifeMidpoint,
  interactionCheck,
  peakTroughRatio,
  timeToSteadyState,
} from '@/lib/pharmacokinetics'
import { reconstitute, solveWaterForDraw } from '@/lib/reconstitution'
import { getVendorsForPeptide, hasSourcingPage, trustScore, vendorTier } from '@/lib/vendors'
import { API_SITE } from '@/lib/catalog-api'

/** Canonical /methods scope note required on every calculator tool output. */
export const CANONICAL_CALC_SCOPE_NOTE = SCOPE_NOTES.reference

const PERSONAL_ADVICE_RE =
  /\b(prescribe|prescription|what\s+dose\s+should\s+i\s+take|how\s+much\s+should\s+i\s+(?:take|inject|pin)|my\s+personal\s+(?:dose|protocol|regimen)|diagnose\s+me|medical\s+advice\s+for\s+me|treat\s+my)\b/i

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

function round(n: number, digits = 3): number {
  if (!Number.isFinite(n)) return n
  const f = 10 ** digits
  return Math.round(n * f) / f
}

function checkPersonalAdviceRefusal(input: Record<string, unknown>): string | null {
  for (const val of Object.values(input)) {
    if (typeof val === 'string' && PERSONAL_ADVICE_RE.test(val)) {
      return JSON.stringify({
        error:
          'Refused: calculator tools perform deterministic unit arithmetic from explicit hypothetical inputs only and cannot provide personal dosing, prescribing, or medical protocol advice.',
        code: 'personal_dosing_refused',
        scope_note: CANONICAL_CALC_SCOPE_NOTE,
      })
    }
  }
  return null
}

function resolveCatalogPeptide(query: string): Peptide | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return (
    getPeptideBySlug(q) ??
    PEPTIDES.find(
      (p) =>
        p.name.toLowerCase() === q ||
        (p.aliases ?? []).some((a) => a.toLowerCase() === q),
    ) ??
    matchPeptides(query, 1)[0]
  )
}

/**
 * Resolve molecular weight (g/mol = Da) from explicit `molecular_weight_da` or
 * from a catalog `peptide` slug/name. Returns `{ mw, peptide, error }` so
 * callers can cleanly report missing MW when molar concentration is requested.
 */
function resolveMolecularWeight(input: Record<string, unknown>): {
  mw: number | null
  peptide?: Peptide
  missingMwError?: string
} {
  const explicitMw = num(input.molecular_weight_da)
  const peptideName = typeof input.peptide === 'string' ? input.peptide.trim() : ''
  const peptide = peptideName ? resolveCatalogPeptide(peptideName) : undefined

  if (explicitMw !== null) {
    if (explicitMw <= 0 || explicitMw > 1_000_000) {
      return {
        mw: null,
        peptide,
        missingMwError: 'Invalid molecular_weight_da: molecular weight must be a positive number (Da / g/mol).',
      }
    }
    return { mw: explicitMw, peptide }
  }

  if (peptideName) {
    if (!peptide) {
      return {
        mw: null,
        missingMwError: `Missing molecular weight: no catalog compound matched "${peptideName.slice(0, 80)}" and no explicit molecular_weight_da was provided. Do not invent a molecular weight.`,
      }
    }
    if (peptide.molecularWeight == null || peptide.molecularWeight <= 0) {
      return {
        mw: null,
        peptide,
        missingMwError: `Missing molecular weight: catalog entry "${peptide.name}" (${peptide.slug}) has no stored molecularWeight (e.g. mixture/extract or uncharacterized biologic) and no explicit molecular_weight_da was provided. Do not invent a molecular weight.`,
      }
    }
    return { mw: peptide.molecularWeight, peptide }
  }

  if (input.require_molar === true) {
    return {
      mw: null,
      missingMwError:
        'Missing molecular weight: provide `molecular_weight_da` or a catalog `peptide` with a verified molecular weight to compute molar concentration.',
    }
  }

  return { mw: null }
}

export function computeReconstitution(input: Record<string, unknown>): string {
  const refused = checkPersonalAdviceRefusal(input)
  if (refused) return refused

  // Measurement + container form select which deterministic path runs — the same
  // branches the on-site reconstitution calculator exposes:
  //   unit 'mcg' (default): mg-vial peptides dosed in micrograms (supports molar).
  //   unit 'iu':            IU-standardized biologics (e.g. HGH/HCG) in international units.
  //   form 'pen':           a pre-filled GLP-1 pen already in solution (fill_ml, no water, no reverse-solve).
  const unit = String(input.unit ?? 'mcg').trim().toLowerCase()
  if (unit !== 'mcg' && unit !== 'iu') {
    return 'Invalid unit: use "mcg" (mg-vial peptides) or "iu" (IU-standardized biologics).'
  }
  const form = String(input.form ?? 'vial').trim().toLowerCase()
  if (form !== 'vial' && form !== 'pen') {
    return 'Invalid form: use "vial" (reconstituted lyophilized vial) or "pen" (pre-filled GLP-1 pen).'
  }
  const isIu = unit === 'iu'
  const isPen = form === 'pen'
  if (isPen && isIu) {
    return 'Pen form is a peptide (mcg) format only — IU-standardized biologics are not supplied as pre-filled pens.'
  }

  // ── IU-standardized biologics ──────────────────────────────────────────────
  // Vial content and dose are both in international units; the dilution math is
  // unit-agnostic (reconstitute() works in whatever unit the vial is expressed).
  // Molar concentration is not computed for IU biologics (no fixed Da-per-IU).
  if (isIu) {
    const vialIu = num(input.vial_iu)
    const doseIu = num(input.dose_iu)
    const waterMl = num(input.water_ml)
    const targetDrawUnits = num(input.target_draw_units)
    if (vialIu == null || doseIu == null || (waterMl == null && targetDrawUnits == null)) {
      return 'Need vial_iu, dose_iu, and water_ml (or target_draw_units) as numbers for an IU biologic.'
    }
    if (vialIu <= 0 || vialIu > 100000 || doseIu <= 0 || doseIu > 100000) {
      return 'Values out of range. vial_iu and dose_iu must be positive (0–100000 IU).'
    }
    let effectiveWaterMl = waterMl
    let solvedWaterMl: number | undefined
    if (targetDrawUnits !== null) {
      if (targetDrawUnits <= 0 || targetDrawUnits > 1000) {
        return 'Values out of range. target_draw_units must be between 0 and 1000.'
      }
      solvedWaterMl = solveWaterForDraw(vialIu, doseIu, targetDrawUnits)
      if (effectiveWaterMl == null) effectiveWaterMl = solvedWaterMl
    }
    if (effectiveWaterMl == null || effectiveWaterMl <= 0 || effectiveWaterMl > 100) {
      return 'Values out of range. water_ml must be between 0 and 100.'
    }
    const r = reconstitute({ vialAmount: vialIu, dose: doseIu, waterMl: effectiveWaterMl })
    const payload: Record<string, unknown> = {
      source: 'reconstitution',
      unit: 'iu',
      form: 'vial',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
      note: `${CANONICAL_CALC_SCOPE_NOTE} U-100 syringe: 100 units = 1 mL. IU biologic — no molar concentration.`,
      vialIu,
      doseIu,
      waterMl: round(effectiveWaterMl, 4),
      concentrationIuPerMl: round(r.concentrationPerMl, 3),
      concentrationIuPerTick: round(r.concentrationPerTick, 3),
      drawMl: round(r.volumePerInjectionMl, 4),
      drawUnitsU100: round(r.unitsPerInjection, 2),
      wholeDosesPerVial: r.dosesPerVial,
    }
    if (solvedWaterMl !== undefined) {
      payload.targetDrawUnits = targetDrawUnits
      payload.solvedWaterMl = round(solvedWaterMl, 4)
    }
    return JSON.stringify(payload)
  }

  // ── Peptide (mcg) paths: reconstituted vial or pre-filled pen ───────────────
  const vialMg = num(input.vial_mg)
  const doseMcg = num(input.dose_mcg)
  // A pen arrives in solution: its liquid volume is the factory fill (fill_ml),
  // there is no bacteriostatic water to add, and nothing to reverse-solve.
  const waterMl = num(input.water_ml)
  const fillMl = num(input.fill_ml)
  const targetDrawUnits = isPen ? null : num(input.target_draw_units)

  if (isPen) {
    const penVol = fillMl ?? waterMl
    if (vialMg == null || doseMcg == null || penVol == null) {
      return 'Need vial_mg (pen strength), dose_mcg, and fill_ml (pre-filled pen volume) as numbers for a pen.'
    }
    if (vialMg <= 0 || vialMg > 10000 || doseMcg <= 0 || doseMcg > 1_000_000) {
      return 'Values out of range. vial_mg and dose_mcg must be positive.'
    }
    if (penVol <= 0 || penVol > 100) {
      return 'Values out of range. fill_ml must be between 0 and 100.'
    }
    const mwInfo = resolveMolecularWeight(input)
    if (mwInfo.missingMwError) {
      return JSON.stringify({
        source: 'reconstitution',
        error: mwInfo.missingMwError,
        code: 'missing_molecular_weight',
        scope_note: CANONICAL_CALC_SCOPE_NOTE,
      })
    }
    const r = reconstitute({ vialAmount: vialMg * 1000, dose: doseMcg, waterMl: penVol })
    const payload: Record<string, unknown> = {
      source: 'reconstitution',
      unit: 'mcg',
      form: 'pen',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
      note: `${CANONICAL_CALC_SCOPE_NOTE} Pre-filled pen already in solution — no bacteriostatic water added. U-100 syringe: 100 units = 1 mL.`,
      penStrengthMg: vialMg,
      doseMcg,
      fillMl: round(penVol, 4),
      concentrationMcgPerMl: round(r.concentrationPerMl, 2),
      concentrationMgPerMl: round(r.concentrationPerMl / 1000, 4),
      concentrationPerTickMcg: round(r.concentrationPerTick, 2),
      drawMl: round(r.volumePerInjectionMl, 4),
      drawUnitsU100: round(r.unitsPerInjection, 2),
      wholeDosesPerPen: r.dosesPerVial,
    }
    if (mwInfo.peptide) {
      payload.peptide = {
        slug: mwInfo.peptide.slug,
        name: mwInfo.peptide.name,
        molecularWeightDa: mwInfo.peptide.molecularWeight ?? null,
      }
    }
    if (mwInfo.mw !== null && mwInfo.mw > 0) {
      payload.molecularWeightDa = mwInfo.mw
      payload.molarConcentrationUmolPerL = round((r.concentrationPerMl / mwInfo.mw) * 1000, 3)
      payload.doseNmol = round((doseMcg / mwInfo.mw) * 1000, 3)
    }
    return JSON.stringify(payload)
  }

  if (vialMg == null || doseMcg == null || (waterMl == null && targetDrawUnits == null)) {
    return 'Need vial_mg, dose_mcg, and water_ml (or target_draw_units) as numbers.'
  }

  if (vialMg <= 0 || vialMg > 10000 || doseMcg <= 0 || doseMcg > 1_000_000) {
    return 'Values out of range. vial_mg and dose_mcg must be positive; water_ml must be between 0 and 100.'
  }

  // Optional reverse-solve: when target_draw_units is provided without water_ml
  // (or alongside it), solve for the water volume needed on a U-100 syringe.
  let effectiveWaterMl = waterMl
  let solvedWaterMl: number | undefined
  if (targetDrawUnits !== null) {
    if (targetDrawUnits <= 0 || targetDrawUnits > 1000) {
      return 'Values out of range. target_draw_units must be between 0 and 1000.'
    }
    solvedWaterMl = solveWaterForDraw(vialMg * 1000, doseMcg, targetDrawUnits)
    if (effectiveWaterMl == null) effectiveWaterMl = solvedWaterMl
  }

  if (effectiveWaterMl == null || effectiveWaterMl <= 0 || effectiveWaterMl > 100) {
    return 'Values out of range. vial_mg and dose_mcg must be positive; water_ml must be between 0 and 100.'
  }

  const mwInfo = resolveMolecularWeight(input)
  if (mwInfo.missingMwError) {
    return JSON.stringify({
      source: 'reconstitution',
      error: mwInfo.missingMwError,
      code: 'missing_molecular_weight',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }

  const r = reconstitute({ vialAmount: vialMg * 1000, dose: doseMcg, waterMl: effectiveWaterMl })

  const payload: Record<string, unknown> = {
    source: 'reconstitution',
    unit: 'mcg',
    form: 'vial',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: `${CANONICAL_CALC_SCOPE_NOTE} U-100 syringe: 100 units = 1 mL.`,
    vialMg,
    doseMcg,
    waterMl: round(effectiveWaterMl, 4),
    concentrationMcgPerMl: round(r.concentrationPerMl, 2),
    concentrationMgPerMl: round(r.concentrationPerMl / 1000, 4),
    concentrationPerTickMcg: round(r.concentrationPerTick, 2),
    drawMl: round(r.volumePerInjectionMl, 4),
    drawUnitsU100: round(r.unitsPerInjection, 2),
    wholeDosesPerVial: r.dosesPerVial,
  }

  if (solvedWaterMl !== undefined) {
    payload.targetDrawUnits = targetDrawUnits
    payload.solvedWaterMl = round(solvedWaterMl, 4)
  }

  if (mwInfo.peptide) {
    payload.peptide = {
      slug: mwInfo.peptide.slug,
      name: mwInfo.peptide.name,
      molecularWeightDa: mwInfo.peptide.molecularWeight ?? null,
    }
  }

  if (mwInfo.mw !== null && mwInfo.mw > 0) {
    // concentrationPerMl is mcg/mL = mg/L. Dividing by MW (g/mol) gives mmol/L (mM);
    // multiplying by 1000 gives µmol/L (µM). doseMcg / MW gives nmol per draw.
    const molarityUmolPerL = (r.concentrationPerMl / mwInfo.mw) * 1000
    const doseNmol = (doseMcg / mwInfo.mw) * 1000
    payload.molecularWeightDa = mwInfo.mw
    payload.molarConcentrationUmolPerL = round(molarityUmolPerL, 3)
    payload.doseNmol = round(doseNmol, 3)
  }

  return JSON.stringify(payload)
}

/**
 * Deterministic cost-per-dose and doses-per-vial from a vial mass (mg), a dose
 * (mcg), and an optional vial cost. Mirrors the on-site tracker calculator so
 * the agent never does this division natively.
 */
export function computeCostPerDose(input: Record<string, unknown>): string {
  const refused = checkPersonalAdviceRefusal(input)
  if (refused) return refused

  const vialMg = num(input.vial_mg)
  const doseMcg = num(input.dose_mcg)
  const cost = num(input.vial_cost)

  if (vialMg == null || doseMcg == null) {
    return JSON.stringify({
      source: 'cost-per-dose',
      error: 'Need vial_mg and dose_mcg as numbers (vial_cost optional).',
      code: 'invalid_input',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }
  if (vialMg <= 0 || vialMg > 10000 || doseMcg <= 0 || doseMcg > 1_000_000) {
    return JSON.stringify({
      source: 'cost-per-dose',
      error: 'Values out of range. vial_mg and dose_mcg must be positive.',
      code: 'invalid_input',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }
  if (cost !== null && (cost < 0 || cost > 1_000_000)) {
    return JSON.stringify({
      source: 'cost-per-dose',
      error: 'Invalid vial_cost: must be a non-negative number.',
      code: 'invalid_input',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }

  // Doses per vial = vial mass ÷ dose; cost per dose divides the vial price
  // across them. Identical math to lib/tracker.costPerDose, inlined here so the
  // server route stays decoupled from the localStorage-backed tracker module.
  const dosesPerVial = (vialMg * 1000) / doseMcg
  const perDose = cost !== null && cost > 0 ? cost / dosesPerVial : null

  return JSON.stringify({
    source: 'cost-per-dose',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: `${CANONICAL_CALC_SCOPE_NOTE} Doses per vial = vial mass ÷ dose.`,
    vialMg,
    doseMcg,
    vialCost: cost !== null && cost > 0 ? cost : null,
    dosesPerVial: round(dosesPerVial, 2),
    wholeDosesPerVial: Math.floor(dosesPerVial),
    costPerDose: perDose != null ? round(perDose, 2) : null,
  })
}

export function computeBlend(input: Record<string, unknown>): string {
  const refused = checkPersonalAdviceRefusal(input)
  if (refused) return refused

  const rawPeptides = input.peptides ?? input.components
  if (!Array.isArray(rawPeptides) || rawPeptides.length === 0) {
    return JSON.stringify({
      source: 'blend-screen',
      error: 'Provide a non-empty `peptides` array (e.g. [{ slug: "bpc-157", mass_mg: 5, dose_mcg: 250 }, { slug: "tb-500", mass_mg: 5, dose_mcg: 250 }]).',
      code: 'invalid_input',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }

  if (rawPeptides.length > 10) {
    return JSON.stringify({
      source: 'blend-screen',
      error: 'A blend calculation supports at most 10 peptides at once.',
      code: 'invalid_input',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
    })
  }

  const members: BlendMember[] = []
  const mathRows: BlendComponent[] = []
  let hasAnyMathInput = false

  for (const item of rawPeptides) {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (!trimmed) {
        return JSON.stringify({
          source: 'blend-screen',
          error: 'Each peptide entry must have a non-empty name or slug.',
          code: 'invalid_input',
          scope_note: CANONICAL_CALC_SCOPE_NOTE,
        })
      }
      members.push({ slug: trimmed.toLowerCase(), name: trimmed })
      continue
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      const slug = typeof obj.slug === 'string' ? obj.slug.trim() : undefined
      const name = typeof obj.name === 'string' ? obj.name.trim() : slug
      if (!slug && !name) {
        return JSON.stringify({
          source: 'blend-screen',
          error: 'Each peptide entry must specify a `slug` or `name`.',
          code: 'invalid_input',
          scope_note: CANONICAL_CALC_SCOPE_NOTE,
        })
      }
      members.push({ slug, name })

      const massMg = num(obj.mass_mg ?? obj.massMg)
      const doseMcg = num(obj.dose_mcg ?? obj.doseMcg)
      if (massMg !== null || doseMcg !== null) {
        hasAnyMathInput = true
        if (massMg === null || doseMcg === null || massMg <= 0 || massMg > 10000 || doseMcg <= 0 || doseMcg > 1_000_000) {
          return JSON.stringify({
            source: 'blend-screen',
            error: `Invalid mass_mg or dose_mcg for "${name ?? slug}". Both mass_mg and dose_mcg must be positive numbers when computing shared-vial blend draws.`,
            code: 'invalid_input',
            scope_note: CANONICAL_CALC_SCOPE_NOTE,
          })
        }
        mathRows.push({ name: name ?? slug, massMg, doseMcg })
      }
    }
  }

  const rawPh = input.buffer_ph ?? input.pH
  let pH = DEFAULT_BUFFER_PH
  if (rawPh !== undefined && rawPh !== null && rawPh !== '') {
    const parsedPh = num(rawPh)
    if (parsedPh === null || parsedPh < 0 || parsedPh > 14) {
      return JSON.stringify({
        source: 'blend-screen',
        error: 'Invalid buffer_ph: pH must be a number between 0 and 14.',
        code: 'invalid_input',
        scope_note: CANONICAL_CALC_SCOPE_NOTE,
      })
    }
    pH = parsedPh
  }

  const screen = screenBlend(members, pH)

  let blendMath: Record<string, unknown> | null = null
  const rawWater = input.water_ml ?? input.waterMl
  if (hasAnyMathInput || (rawWater !== undefined && rawWater !== null && rawWater !== '')) {
    const waterMl = num(rawWater)
    if (waterMl === null || waterMl <= 0 || waterMl > 100) {
      return JSON.stringify({
        source: 'blend-screen',
        error: 'Invalid water_ml: provide a positive water_ml (0 < water_ml <= 100) when computing shared-vial blend draws.',
        code: 'invalid_input',
        scope_note: CANONICAL_CALC_SCOPE_NOTE,
      })
    }
    if (mathRows.length === 0) {
      return JSON.stringify({
        source: 'blend-screen',
        error: 'Provide positive mass_mg and dose_mcg on each peptide component to compute shared-vial draw volume.',
        code: 'invalid_input',
        scope_note: CANONICAL_CALC_SCOPE_NOTE,
      })
    }
    const b = blend(waterMl, mathRows)
    blendMath = {
      waterMl: b.waterMl,
      wholeDoses: b.doses,
      drawMl: round(b.drawMl, 4),
      drawUnitsU100: round(b.units, 2),
      components: b.components.map((c) => ({
        name: c.name ?? null,
        massMg: c.massMg,
        intendedDoseMcg: c.doseMcg,
        standaloneDoses: round(c.standaloneDoses, 2),
        deliveredMcg: round(c.deliveredMcg, 2),
        overPercent: round(c.overFraction * 100, 2),
        overDeliveryWarning: overDeliveryNote(c.overFraction),
      })),
    }
  }

  return JSON.stringify({
    source: 'blend-screen',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: `${CANONICAL_CALC_SCOPE_NOTE} Physical compatibility screen is a Henderson–Hasselbalch charge/pI and Kyte–Doolittle GRAVY estimate, not a formulation study.`,
    pH: screen.pH,
    peptides: screen.peptides.map((p) => ({
      slug: p.slug,
      name: p.name,
      hasSequence: p.hasSequence,
      charge: p.charge !== null ? round(p.charge, 2) : null,
      pi: p.pi !== null ? round(p.pi, 2) : null,
      gravy: p.gravy !== null ? round(p.gravy, 2) : null,
      cysteines: p.cysteines,
    })),
    flags: screen.flags,
    unresolved: screen.unresolved,
    handlingNotes: screen.notes,
    ...(blendMath ? { sharedVialDraw: blendMath } : {}),
  })
}

export function computePharmacokinetics(input: Record<string, unknown>): string {
  const refused = checkPersonalAdviceRefusal(input)
  if (refused) return refused

  const name = String(input.name ?? '').trim()
  const explicitHalfLife = num(input.half_life_hours)

  if (!name && explicitHalfLife === null) {
    return 'Need a compound name or an explicit half_life_hours.'
  }

  if (explicitHalfLife !== null && (explicitHalfLife <= 0 || explicitHalfLife > 24 * 365)) {
    return 'Invalid half_life_hours: must be a positive number of hours.'
  }

  const interval = num(input.interval_hours)
  if (input.interval_hours !== undefined && input.interval_hours !== null && input.interval_hours !== '') {
    if (interval === null || interval <= 0 || interval > 24 * 60) {
      return 'Invalid interval_hours: must be a positive number between 0 and 1440 hours.'
    }
  }

  const elapsed = num(input.elapsed_hours)
  if (input.elapsed_hours !== undefined && input.elapsed_hours !== null && input.elapsed_hours !== '') {
    if (elapsed === null || elapsed < 0 || elapsed > 24 * 365) {
      return 'Invalid elapsed_hours: must be a non-negative number of hours.'
    }
  }

  let peptide: Peptide | undefined
  if (name) {
    peptide = resolveCatalogPeptide(name)
    if (!peptide && explicitHalfLife === null) {
      return `No catalog peptide matched "${name.slice(0, 80)}". Do not invent a half-life.`
    }
  }

  const pk = peptide ? getPk(peptide.slug) : undefined
  if (!pk?.halfLifeHours && explicitHalfLife === null) {
    return JSON.stringify({
      source: 'pharmacokinetics',
      scope_note: CANONICAL_CALC_SCOPE_NOTE,
      name: peptide?.name ?? name,
      slug: peptide?.slug ?? null,
      halfLifeHours: null,
      note: `${CANONICAL_CALC_SCOPE_NOTE} No published human half-life is stored for this compound. Do not invent one.`,
    })
  }

  const mid = explicitHalfLife !== null ? explicitHalfLife : halfLifeMidpoint(pk!.halfLifeHours!)
  const body: Record<string, unknown> = {
    source: 'pharmacokinetics',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: `${CANONICAL_CALC_SCOPE_NOTE} Single-compartment approximation from the site half-life table.`,
    name: peptide?.name ?? (name || 'Hypothetical input'),
    slug: peptide?.slug ?? null,
    halfLifeHours: pk?.halfLifeHours ?? { low: mid, high: mid },
    halfLifeMidpointHours: round(mid, 2),
    hoursToSteadyState: round(timeToSteadyState(mid), 1),
    hoursToClear: round(clearanceTime(mid), 1),
    sourceNote:
      explicitHalfLife !== null
        ? 'Explicit hypothetical half_life_hours input'
        : pk?.sourceNote ?? null,
    page: peptide ? `${API_SITE}/catalog/${peptide.slug}` : null,
  }

  if (interval != null && interval > 0 && interval <= 24 * 60) {
    body.intervalHours = interval
    body.accumulationRatio = round(accumulationRatio(mid, interval), 2)
    body.peakTroughRatio = round(peakTroughRatio(mid, interval), 2)
  }

  if (elapsed != null && elapsed >= 0) {
    body.elapsedHours = elapsed
    body.fractionRemaining = round(fractionRemaining(mid, elapsed), 4)
    body.percentRemaining = round(fractionRemaining(mid, elapsed) * 100, 2)
  }

  if (Array.isArray(input.compare_slugs) && peptide) {
    const slugs = [
      peptide.slug,
      ...input.compare_slugs.map((s) => String(s).trim().toLowerCase()).filter(Boolean),
    ]
    body.interactions = interactionCheck(slugs)
  }

  return JSON.stringify(body)
}

export function computeVendorRank(input: Record<string, unknown>): string {
  const name = String(input.name ?? '').trim()
  if (!name) return 'Need a compound name.'
  const peptide = resolveCatalogPeptide(name)
  if (!peptide) return `No catalog peptide matched "${name.slice(0, 80)}".`
  const vendors = getVendorsForPeptide(peptide.slug).slice(0, 5).map((v) => ({
    name: v.name,
    trustScore: trustScore(v),
    tier: vendorTier(v),
    purityPct: v.trust.purityPct ?? null,
    coaOnFile: v.trust.coaOnFile,
    thirdPartyTested: v.trust.thirdPartyTested,
    perBatchTesting: v.trust.perBatchTesting,
    shipsTo: v.shipsTo,
  }))
  return JSON.stringify({
    source: 'vendor-trust',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: 'Ranked by published transparency signals only. Not a quality guarantee and not ordered by commission.',
    name: peptide.name,
    slug: peptide.slug,
    sourcesPage: hasSourcingPage(peptide.slug) ? `${API_SITE}/sources/${peptide.slug}` : null,
    vendors,
  })
}

export function computeCoaGrade(input: Record<string, unknown>): string {
  const text = String(input.text ?? '').trim()
  if (text.length < 20) return 'Paste the certificate text (at least a few lines).'
  const report = analyzeCoa(text.slice(0, 8000))
  return JSON.stringify({
    source: 'coa-grade',
    scope_note: CANONICAL_CALC_SCOPE_NOTE,
    note: 'Rule-based read of the pasted text against the site transparency checklist. Not a lab verification.',
    detected: report.detectedPeptide,
    grade: report.score.grade,
    percent: report.score.percent,
    summary: report.score.summary,
    redFlags: report.redFlags.slice(0, 8),
    missing: report.missing.slice(0, 8),
    catalogChecks: report.catalogChecks.slice(0, 6),
    supplierRequest: report.supplierRequest,
  })
}
