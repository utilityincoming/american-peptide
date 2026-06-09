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

// ── Synthesis difficulty (research-use heuristics) ──────────────────────────
//
// Flags well-known synthesis/stability liabilities from sequence alone. These
// are educational heuristics, not a manufacturability guarantee — they tie the
// Design Lab to the /synthesis "what it costs / where purity is lost" thesis.

export type FlagLevel = 'info' | 'caution' | 'warn'
export interface SynthesisFlag {
  level: FlagLevel
  label: string
  detail: string
}
export type DifficultyScore = 'straightforward' | 'moderate' | 'challenging'

export function synthesisDifficulty(codes: string[]): {
  score: DifficultyScore
  flags: SynthesisFlag[]
} {
  const flags: SynthesisFlag[] = []
  const n = codes.length
  if (n === 0) return { score: 'straightforward', flags: [] }

  const seq = codes.join('')
  const count = (set: string) => codes.filter((c) => set.includes(c)).length

  // Length
  if (n > 30)
    flags.push({
      level: 'warn',
      label: 'Long sequence',
      detail: `${n} residues — long chains accumulate deletion/truncation impurities and are harder, costlier to purify.`,
    })
  else if (n >= 15)
    flags.push({
      level: 'caution',
      label: 'Moderate length',
      detail: `${n} residues — more coupling cycles than a short peptide; per-cycle losses compound.`,
    })

  // Cysteines / disulfides
  const cys = count('C')
  if (cys >= 2)
    flags.push({
      level: 'caution',
      label: `${cys} cysteines`,
      detail: 'Disulfide formation and scrambling must be controlled; thiols are oxidation-prone.',
    })
  else if (cys === 1)
    flags.push({
      level: 'info',
      label: 'Free cysteine',
      detail: 'A single thiol is oxidation-prone and can dimerize.',
    })

  // Oxidation-prone residues (Met, Trp)
  const met = count('M')
  const trp = count('W')
  if (met + trp > 0)
    flags.push({
      level: met + trp >= 2 ? 'caution' : 'info',
      label: 'Oxidation-prone residues',
      detail: `${met} Met, ${trp} Trp — sensitive to oxidation; protect from air and light.`,
    })

  // Aspartimide-prone motifs (Fmoc SPPS): Asp-X (G/S/N/P/T) and Asn-Gly
  const aspMotifs = seq.match(/D[GSNPT]|NG/g)
  if (aspMotifs && aspMotifs.length)
    flags.push({
      level: 'caution',
      label: 'Aspartimide-prone motif',
      detail: `${[...new Set(aspMotifs)].join(', ')} — Asp/Asn-X sequences risk aspartimide side products in Fmoc synthesis.`,
    })

  // Hydrophobic aggregation ("difficult sequences")
  const hyd = 'VILFAM'
  let run = 0
  let maxRun = 0
  for (const c of codes) {
    if (hyd.includes(c)) {
      run++
      maxRun = Math.max(maxRun, run)
    } else run = 0
  }
  if (maxRun >= 4)
    flags.push({
      level: 'warn',
      label: 'Hydrophobic run',
      detail: `${maxRun} consecutive hydrophobic residues — strong on-resin aggregation / "difficult sequence" risk.`,
    })
  else if (maxRun === 3)
    flags.push({
      level: 'caution',
      label: 'Hydrophobic stretch',
      detail: 'Three consecutive hydrophobic residues — mild aggregation risk during synthesis.',
    })

  // Proline-rich / repeats
  if (n >= 6 && count('P') / n > 0.25)
    flags.push({
      level: 'info',
      label: 'Proline-rich',
      detail: 'High proline content can slow couplings and complicate folding.',
    })
  if (/(.)\1\1/.test(seq))
    flags.push({
      level: 'info',
      label: 'Repeat run',
      detail: 'Three or more identical residues in a row can be harder to couple cleanly.',
    })

  // Overall score
  const warns = flags.filter((f) => f.level === 'warn').length
  const cautions = flags.filter((f) => f.level === 'caution').length
  let score: DifficultyScore = 'straightforward'
  if (warns >= 1 || cautions >= 3 || n > 30) score = 'challenging'
  else if (cautions >= 1 || n >= 15) score = 'moderate'

  return { score, flags }
}
