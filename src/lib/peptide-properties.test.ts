import { describe, it, expect } from 'vitest'
import {
  chargeAtPH,
  isoelectricPoint,
  extinctionCoefficient,
  a280Point1pct,
  parseCatalogChain,
  catalogCodes,
  sanitizeSequence,
  type ChargeMods,
} from '@/lib/peptide-properties'

describe('chargeAtPH', () => {
  it('returns 0 for an empty chain', () => {
    expect(chargeAtPH([], 7.4)).toBe(0)
  })

  it('decreases monotonically as pH rises', () => {
    const seq = 'KRHDEYC'.split('')
    let prev = Infinity
    for (let pH = 0; pH <= 14; pH += 0.5) {
      const c = chargeAtPH(seq, pH)
      expect(c).toBeLessThan(prev)
      prev = c
    }
  })

  it('is strongly positive in strong acid and strongly negative in strong base', () => {
    const seq = 'KRHDEYC'.split('')
    // Three basic groups + two termini: positive side dominates at low pH.
    expect(chargeAtPH(seq, 0)).toBeGreaterThan(2.5)
    // Acidic side chains + C-terminus dominate at high pH.
    expect(chargeAtPH(seq, 14)).toBeLessThan(-2.5)
  })

  it('treats a lone glycine as a near-neutral zwitterion at physiological pH', () => {
    // Only the two termini titrate; at pH 7.4 both are essentially ionized.
    expect(chargeAtPH(['G'], 7.4)).toBeCloseTo(0, 1)
  })

  it('carries ~+1 on a single lysine near neutral pH', () => {
    // N-term and Lys side chain protonated, C-term deprotonated → ~+1.
    expect(chargeAtPH(['K'], 7.4)).toBeCloseTo(1, 1)
  })
})

describe('chargeAtPH with ChargeMods', () => {
  const seq = 'KKCCDE'.split('')
  const pH = 7.4

  it('a C-terminal amide raises the charge by removing a negative terminus', () => {
    const free = chargeAtPH(seq, pH)
    const amidated = chargeAtPH(seq, pH, { amideC: true })
    expect(amidated).toBeGreaterThan(free)
    // At pH 7.4 the C-terminus is fully deprotonated, so it is a near-full unit.
    expect(amidated - free).toBeCloseTo(1, 1)
  })

  it('an N-terminal acyl block lowers the charge by removing a positive terminus', () => {
    const free = chargeAtPH(seq, pH)
    const acetylated = chargeAtPH(seq, pH, { acetylN: true })
    expect(acetylated).toBeLessThan(free)
    expect(free - acetylated).toBeCloseTo(1, 1)
  })

  it('pyroglutamate blocks the N-terminus just like an acyl block', () => {
    expect(chargeAtPH(seq, pH, { pyroGluN: true })).toBeCloseTo(
      chargeAtPH(seq, pH, { acetylN: true }),
      5,
    )
  })

  it('acylated lysines each remove one cationic side chain', () => {
    const free = chargeAtPH(seq, pH)
    const oneBlocked = chargeAtPH(seq, pH, { blockedLysines: 1 })
    // A lysine side chain is essentially fully protonated at pH 7.4.
    expect(free - oneBlocked).toBeCloseTo(1, 1)
    // Blocking more lysines than exist never pushes below zero blocked.
    const allBlocked = chargeAtPH(seq, pH, { blockedLysines: 9 })
    expect(allBlocked).toBeCloseTo(chargeAtPH(seq, pH, { blockedLysines: 2 }), 5)
  })

  it('disulfide-paired cysteines drop their (partly negative) thiol contribution', () => {
    const free = chargeAtPH(seq, pH)
    const paired = chargeAtPH(seq, pH, { disulfideCysteines: 2 })
    // Removing negative thiol character makes the net charge less negative.
    expect(paired).toBeGreaterThan(free)
  })
})

describe('isoelectricPoint', () => {
  it('returns 0 for an empty chain', () => {
    expect(isoelectricPoint([])).toBe(0)
  })

  it('sits where the net charge crosses zero', () => {
    const seq = 'KRHDEYC'.split('')
    const pi = isoelectricPoint(seq)
    expect(chargeAtPH(seq, pi)).toBeCloseTo(0, 2)
  })

  it('matches the textbook pI of free glycine (~6.0)', () => {
    // Mean of the α-amino and α-carboxyl pKa: (9.69 + 2.34) / 2 ≈ 6.0.
    expect(isoelectricPoint(['G'])).toBeCloseTo(6.0, 1)
  })

  it('is basic for lysine and acidic for aspartate', () => {
    // Lys pI ≈ (9.69 + 10.53) / 2 ≈ 10.1; Asp pI ≈ (2.34 + 3.65) / 2 ≈ 3.0.
    expect(isoelectricPoint(['K'])).toBeCloseTo(10.1, 1)
    expect(isoelectricPoint(['D'])).toBeCloseTo(3.0, 1)
    expect(isoelectricPoint(['K'])).toBeGreaterThan(isoelectricPoint(['D']))
  })

  it('shifts upward when acidic termini are capped', () => {
    const seq = 'GG'.split('')
    expect(isoelectricPoint(seq, { amideC: true })).toBeGreaterThan(
      isoelectricPoint(seq),
    )
  })
})

describe('extinctionCoefficient and A280', () => {
  it('sums Trp and Tyr contributions with no cystine credit when reduced', () => {
    const e = extinctionCoefficient('WWYYC'.split(''))
    expect(e.reduced).toBe(2 * 5500 + 2 * 1490)
    // One cysteine pair is not possible from a single Cys → no cystine credit.
    expect(e.cystine).toBe(e.reduced)
  })

  it('adds 125 per disulfide pair in the cystine form', () => {
    const e = extinctionCoefficient('WYCCCC'.split(''))
    expect(e.cystine - e.reduced).toBe(2 * 125)
  })

  it('A280 of a 0.1% solution is epsilon over mass, and 0 for massless input', () => {
    expect(a280Point1pct(6970, 1000)).toBeCloseTo(6.97, 5)
    expect(a280Point1pct(6970, 0)).toBe(0)
  })
})

describe('parseCatalogChain', () => {
  it('reads an N-acetyl / C-amide pair and drops the amide suffix from the body', () => {
    const parsed = parseCatalogChain('Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2')
    expect(parsed.acetylN).toBe(true)
    expect(parsed.amideC).toBe(true)
    expect(parsed.codes.join('')).toBe('EEMQRR')
  })

  it('maps three-letter names rather than harvesting stray capitals', () => {
    expect(catalogCodes('γ-Glu-Cys-Gly').join('')).toBe('ECG')
  })

  it('flags pyroglutamate written as a pGlu- prefix', () => {
    const parsed = parseCatalogChain('pGlu-His-Pro-NH2')
    expect(parsed.pyroGluN).toBe(true)
    expect(parsed.amideC).toBe(true)
  })

  it('counts an even disulfide pool only when the note says disulfide', () => {
    const withNote = parseCatalogChain('ACDEFCGH (two disulfide-paired Cys)')
    expect(withNote.disulfideCysteines).toBe(2)
    const withoutNote = parseCatalogChain('ACDEFCGH')
    expect(withoutNote.disulfideCysteines).toBe(0)
  })

  it('ignores parenthetical notes and single-letter chain labels as residues', () => {
    const parsed = parseCatalogChain('A chain: GIVEQCCTSICSLYQLENYCN')
    // The "A" label is a lone capital and is dropped; the run is the chain.
    expect(parsed.codes.join('')).toBe('GIVEQCCTSICSLYQLENYCN')
  })

  it('returns no codes for an empty string', () => {
    expect(parseCatalogChain('').codes).toEqual([])
  })
})

describe('sanitizeSequence', () => {
  it('upper-cases and keeps only standard single-letter codes', () => {
    // Punctuation, digits and spaces drop; every remaining letter is a real
    // code (the "c" of "-cu" is cysteine, the "u" is not a standard residue).
    expect(sanitizeSequence('ghk-cu 1x')).toBe('GHKC')
    expect(sanitizeSequence('B J O U X Z')).toBe('')
  })
})

// Compile-time guard: ChargeMods is the shape the functions accept.
const _mods: ChargeMods = { amideC: true, blockedLysines: 1 }
void _mods
