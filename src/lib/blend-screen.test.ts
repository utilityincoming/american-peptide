import { describe, it, expect } from 'vitest'
import { screenBlend } from '@/lib/blend-screen'
import { getPeptideBySlug } from '@/lib/peptides'
import { catalogCodes } from '@/lib/peptide-properties'

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
    expect(pram?.cysteines).toBe(2)
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

  it('scores published backbones and splits CagriSema into its two peptides', () => {
    const sema = screenBlend([{ slug: 'semaglutide' }], 5.7)
    const row = sema.peptides[0]
    expect(row.hasSequence).toBe(true)
    expect(row.gravy).not.toBeNull()
    expect(row.charge).not.toBeNull()
    expect(sema.flags.some((f) => f.code === 'acylation')).toBe(true)
    expect(sema.flags.some((f) => f.code === 'unnatural')).toBe(true)

    const lengths = screenBlend(
      [
        { slug: 'tirzepatide' },
        { slug: 'tesamorelin' },
        { slug: 'igf-1-lr3' },
        { slug: 'll-37' },
        { slug: 'aod-9604' },
        { slug: 'melanotan-1' },
        { slug: 'pt-141' },
      ],
      5.7,
    )
    const bySlug = Object.fromEntries(
      lengths.peptides.map((p) => [p.slug, p]),
    )
    expect(bySlug['aod-9604'].cysteines).toBe(2)
    expect(bySlug['igf-1-lr3'].cysteines).toBe(6)
    expect(bySlug['ll-37'].hasSequence).toBe(true)
    expect(bySlug['tesamorelin'].hasSequence).toBe(true)
    expect(bySlug['melanotan-1'].hasSequence).toBe(true)
    expect(bySlug['pt-141'].hasSequence).toBe(true)
    expect(bySlug['tirzepatide'].hasSequence).toBe(true)
    const len = (slug: string) =>
      catalogCodes(getPeptideBySlug(slug)?.sequence ?? '').length
    expect(len('semaglutide')).toBe(31)
    expect(len('tirzepatide')).toBe(39)
    expect(len('tesamorelin')).toBe(44)
    expect(len('igf-1-lr3')).toBe(83)
    expect(len('ll-37')).toBe(37)
    expect(len('aod-9604')).toBe(16)
    expect(len('melanotan-1')).toBe(13)
    expect(len('pt-141')).toBe(7)
    expect(len('cjc-1295-with-dac')).toBe(29)

    const combo = screenBlend([{ slug: 'cagrisema' }], 5.7)
    expect(combo.peptides.map((p) => p.slug)).toEqual([
      'cagrilintide',
      'semaglutide',
    ])
    expect(combo.flags.some((f) => f.code === 'no-sequence' && f.title.startsWith('Cagrilintide'))).toBe(
      true,
    )

    const extract = screenBlend([{ slug: 'thymalin' }], 5.7)
    expect(extract.flags.some((f) => f.code === 'mixture')).toBe(true)
    expect(extract.flags.some((f) => f.code === 'no-sequence')).toBe(false)
  })

  it('expands any catalog blend into its components and screens each one', () => {
    const glow = screenBlend([{ slug: 'glow' }], 5.7)
    // GLOW is ghk-cu + bpc-157 + tb-500: three scored rows, no leftover blend.
    expect(glow.peptides.map((p) => p.slug)).toEqual([
      'ghk-cu',
      'bpc-157',
      'tb-500',
    ])
    expect(glow.peptides.every((p) => p.hasSequence)).toBe(true)
    expect(glow.peptides[0].name).toBe('GHK-Cu (in GLOW)')
    // No "no sequence on file" flag for the blend itself.
    expect(glow.flags.some((f) => f.code === 'no-sequence')).toBe(false)

    // A blend resolved by name expands the same way.
    const byName = screenBlend([{ name: 'bpc-157-tb-500' }], 5.7)
    expect(byName.peptides.map((p) => p.slug)).toEqual(['bpc-157', 'tb-500'])

    // The copper component still drives the copper–thiol pairing when a
    // cysteine-bearing peptide shares the blend.
    const cjc = screenBlend([{ slug: 'cjc-1295-ipamorelin' }], 5.7)
    expect(cjc.peptides.map((p) => p.slug)).toEqual([
      'cjc-1295-no-dac',
      'ipamorelin',
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
