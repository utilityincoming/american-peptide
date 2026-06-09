// Research-grade sequence property math for the Design Lab.
//
// Pure, client-safe functions over single-letter codes. Built on the residue
// data in amino-acids.ts; this module adds pH-dependent charge, isoelectric
// point, and the 280 nm extinction coefficient.
//
// pKa values: classic Lehninger side-chain + terminus set — widely used and
// defensible for an educational/research reference. Results are estimates.

export const PKA = {
  nTerm: 9.69,
  cTerm: 2.34,
  C: 8.33, // Cys
  D: 3.65, // Asp
  E: 4.25, // Glu
  H: 6.0, // His
  K: 10.53, // Lys
  R: 12.48, // Arg
  Y: 10.07, // Tyr
} as const

function countOf(codes: string[], code: string): number {
  let n = 0
  for (const c of codes) if (c === code) n++
  return n
}

/** Net charge of the peptide at a given pH (Henderson–Hasselbalch). */
export function chargeAtPH(codes: string[], pH: number): number {
  if (codes.length === 0) return 0
  // Fraction protonated (positive groups) / deprotonated (negative groups).
  const pos = (pka: number) => 1 / (1 + Math.pow(10, pH - pka))
  const neg = (pka: number) => -1 / (1 + Math.pow(10, pka - pH))

  let charge = pos(PKA.nTerm) + neg(PKA.cTerm)
  charge += countOf(codes, 'K') * pos(PKA.K)
  charge += countOf(codes, 'R') * pos(PKA.R)
  charge += countOf(codes, 'H') * pos(PKA.H)
  charge += countOf(codes, 'D') * neg(PKA.D)
  charge += countOf(codes, 'E') * neg(PKA.E)
  charge += countOf(codes, 'C') * neg(PKA.C)
  charge += countOf(codes, 'Y') * neg(PKA.Y)
  return charge
}

/** Isoelectric point — pH where net charge ≈ 0 (bisection). */
export function isoelectricPoint(codes: string[]): number {
  if (codes.length === 0) return 0
  let lo = 0
  let hi = 14
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const c = chargeAtPH(codes, mid)
    // Charge decreases as pH rises; move toward the zero crossing.
    if (c > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export interface Extinction {
  /** ε (M⁻¹·cm⁻¹) assuming all cysteines reduced. */
  reduced: number
  /** ε assuming all cysteine pairs form cystines (disulfides). */
  cystine: number
}

/** Molar extinction coefficient at 280 nm (Pace/Gill–von Hippel constants). */
export function extinctionCoefficient(codes: string[]): Extinction {
  const nW = countOf(codes, 'W')
  const nY = countOf(codes, 'Y')
  const nC = countOf(codes, 'C')
  const reduced = nW * 5500 + nY * 1490
  const cystine = reduced + Math.floor(nC / 2) * 125
  return { reduced, cystine }
}

/** A280 of a 1 g/L (0.1%) solution = ε / molecular weight. */
export function a280Point1pct(epsilon: number, massDa: number): number {
  return massDa > 0 ? epsilon / massDa : 0
}

/** Valid single-letter codes for the 20 standard amino acids. */
export const STANDARD_AA = 'ACDEFGHIKLMNPQRSTVWY'

/** Strip a raw string down to valid uppercase single-letter codes. */
export function sanitizeSequence(raw: string): string {
  return raw
    .toUpperCase()
    .split('')
    .filter((c) => STANDARD_AA.includes(c))
    .join('')
}
