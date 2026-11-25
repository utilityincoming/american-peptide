/**
 * Shared-vial blend math.
 *
 * Published reference implementation for
 * https://americanpeptide.com/tools/blend-calculator
 *
 * Mass is in milligrams. Intended dose is in micrograms.
 * The conversion 1 mg = 1000 mcg is applied here and only here.
 *
 * The blend's dose count is the floor of the scarcest peptide's standalone
 * dose count. Draw volume is total diluent divided by that count, so every
 * peptide is drawn in the same volume. A peptide whose mass is not
 * proportioned to that count delivers more than its intended dose.
 *
 * MIT License. Copyright American Peptide.
 */

export interface BlendComponent {
  name?: string
  /** Milligrams of this peptide transferred into the blend vial. */
  massMg: number
  /** Intended micrograms of this peptide per draw. */
  doseMcg: number
}

export interface BlendComponentResult extends BlendComponent {
  valid: boolean
  standaloneDoses: number
  deliveredMcg: number
  /** (delivered − intended) / intended. 0 when the masses are proportioned. */
  overFraction: number
}

export interface BlendResult {
  waterMl: number
  /** Whole draws the scarcest valid component can support. */
  doses: number
  drawMl: number
  /** U-100 units for `drawMl` (100 units = 1 mL). */
  units: number
  components: BlendComponentResult[]
}

/** The website highlights an over fraction above this. It does not change the dose count. */
export const OVER_FRACTION_HIGHLIGHT = 0.02

export const OVER_DELIVERY_NOTE =
  'The shared draw delivers more than the intended dose of a non-limiting peptide because the dose count follows the scarcest component.'

export function overDeliveryNote(overFraction: number): string | null {
  return overFraction > OVER_FRACTION_HIGHLIGHT ? OVER_DELIVERY_NOTE : null
}

export function blend(waterMl: number, rows: BlendComponent[]): BlendResult {
  const water = waterMl > 0 ? waterMl : 0
  const components: BlendComponentResult[] = rows.map((row) => {
    const valid = row.massMg > 0 && row.doseMcg > 0
    const standaloneDoses = valid ? (row.massMg * 1000) / row.doseMcg : 0
    return {
      ...row,
      valid,
      standaloneDoses,
      deliveredMcg: 0,
      overFraction: 0,
    }
  })
  const validRows = components.filter((c) => c.valid)
  const doses = validRows.length
    ? Math.floor(Math.min(...validRows.map((c) => c.standaloneDoses)))
    : 0
  const drawMl = doses > 0 && water > 0 ? water / doses : 0
  for (const c of components) {
    if (!c.valid || doses <= 0) continue
    c.deliveredMcg = (c.massMg * 1000) / doses
    c.overFraction = (c.deliveredMcg - c.doseMcg) / c.doseMcg
  }
  return { waterMl: water, doses, drawMl, units: drawMl * 100, components }
}
