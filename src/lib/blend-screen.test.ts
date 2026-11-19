import { describe, it, expect } from 'vitest'
import { screenBlend } from '@/lib/blend-screen'

describe('screenBlend', () => {
  it('flags the labeled pramlintide–insulin syringe incompatibility', () => {
    const screen = screenBlend(
      [{ slug: 'pramlintide' }, { slug: 'insulin' }],
      5.7,
    )
    const labeled = screen.flags.filter(
      (f) => f.code === 'labeled-incompatibility',
    )
    expect(labeled).toHaveLength(1)
    expect(labeled[0].level).toBe('warn')
    expect(labeled[0].detail).toMatch(/Symlin/)
  })

  it('flags glucagon as a known fibril-former and pramlintide cysteines', () => {
    const screen = screenBlend(
      [{ slug: 'glucagon' }, { slug: 'pramlintide' }],
      5.7,
    )
    expect(screen.flags.some((f) => f.code === 'fibril' && f.level === 'warn')).toBe(
      true,
    )
    const pram = screen.peptides.find((p) => p.slug === 'pramlintide')
    expect(pram?.hasSequence).toBe(true)
    expect(pram?.cysteines).toBeGreaterThan(0)
    expect(screen.flags.some((f) => f.code === 'cysteine')).toBe(true)
  })

  it('flags opposite net charge and a buffer sitting on the isoelectric point', () => {
    const atNeutral = screenBlend(
      [{ slug: 'ghk-cu' }, { slug: 'bpc-157' }],
      7.4,
    )
    const ghk = atNeutral.peptides.find((p) => p.slug === 'ghk-cu')!
    const bpc = atNeutral.peptides.find((p) => p.slug === 'bpc-157')!
    expect(ghk.charge).not.toBeNull()
    expect(bpc.charge).not.toBeNull()
    expect(Math.sign(ghk.charge!)).not.toBe(Math.sign(bpc.charge!))
    expect(atNeutral.flags.some((f) => f.code === 'opposite-charge')).toBe(true)
    expect(atNeutral.flags.some((f) => f.code === 'copper-thiol')).toBe(false)

    const onPi = screenBlend([{ slug: 'bpc-157' }], bpc.pi!)
    expect(onPi.flags.some((f) => f.code === 'near-pi')).toBe(true)
  })

  it('flags copper plus a cysteine peptide, and skips unknown names', () => {
    const screen = screenBlend(
      [{ slug: 'ghk-cu' }, { name: 'Pramlintide' }, { name: 'not a peptide' }],
      5.7,
    )
    expect(screen.flags.some((f) => f.code === 'copper-thiol')).toBe(true)
    expect(screen.unresolved).toEqual(['not a peptide'])
    expect(screen.notes.map((n) => n.code)).toEqual([
      'no-costore',
      'no-shake',
      'separate-syringes',
    ])
  })

  it('does not invent an opposite-charge flag for two copies of one basic peptide', () => {
    const screen = screenBlend(
      [{ slug: 'glucagon' }, { slug: 'glucagon' }],
      5.7,
    )
    expect(screen.flags.some((f) => f.code === 'opposite-charge')).toBe(false)
  })
})
