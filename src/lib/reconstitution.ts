// Reconstitution dilution math — the single source of truth shared by the
// reconstitution calculator and the beta (GLP-1 pen / reverse-solve) calculator.
//
// Pure and unit-agnostic: the caller passes the vial mass and target dose in the
// SAME unit (mcg for mg-vials, or IU for IU-dosed biologics). The function
// derives the concentration, the draw volume, and the U-100 syringe units.
//
// U-100 scale: 100 units = 1 mL, so one unit is 0.01 mL. `concentrationPerTick`
// is the amount per 0.1 mL (ten units), which is the granularity the syringe
// barrel is labeled with.

export interface ReconInput {
  /** Peptide mass in the vial, in the dose unit (mcg or IU). */
  vialAmount: number
  /** Target amount per administration, in the same unit as `vialAmount`. */
  dose: number
  /** Reconstitution (bacteriostatic water) volume, in mL. */
  waterMl: number
}

export interface ReconResult {
  /** Concentration of the reconstituted solution, amount per mL. */
  concentrationPerMl: number
  /** Concentration per 0.1 mL (ten U-100 units) — the barrel's tick scale. */
  concentrationPerTick: number
  /** Volume to draw for one dose, in mL. */
  volumePerInjectionMl: number
  /** Volume to draw expressed as U-100 syringe units (100 units = 1 mL). */
  unitsPerInjection: number
  /** Whole doses obtainable from the vial (rounded down). */
  dosesPerVial: number
}

export function reconstitute(input: ReconInput): ReconResult {
  const { vialAmount, dose, waterMl } = input
  const concentrationPerMl = waterMl > 0 ? vialAmount / waterMl : 0
  const concentrationPerTick = concentrationPerMl / 10
  const volumePerInjectionMl =
    concentrationPerMl > 0 ? dose / concentrationPerMl : 0
  const unitsPerInjection = volumePerInjectionMl * 100
  const dosesPerVial = dose > 0 ? Math.floor(vialAmount / dose) : 0
  return {
    concentrationPerMl,
    concentrationPerTick,
    volumePerInjectionMl,
    unitsPerInjection,
    dosesPerVial,
  }
}

/**
 * Reverse-solve the reconstitution volume (mL) needed so that `dose` draws
 * exactly `drawUnits` on a U-100 syringe. From:
 *   units = (dose / (vialAmount / water)) × 100
 *   water = vialAmount × (drawUnits × 0.01) / dose
 */
export function solveWaterForDraw(
  vialAmount: number,
  dose: number,
  drawUnits: number,
): number {
  return dose > 0 ? (vialAmount * (drawUnits * 0.01)) / dose : 0
}
