import { describe, it, expect } from 'vitest'
import {
  PEPTIDES,
  getPeptideBySlug,
  getComponents,
  getBlendsContaining,
} from './peptides'

describe('catalog integrity', () => {
  it('has unique slugs', () => {
    const slugs = PEPTIDES.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('resolves every blend component slug to a catalog entry', () => {
    for (const p of PEPTIDES) {
      if (!p.components) continue
      for (const slug of p.components) {
        expect(
          getPeptideBySlug(slug),
          `${p.slug} lists unknown component "${slug}"`,
        ).toBeDefined()
      }
    }
  })

  it('does not list a blend as its own component', () => {
    for (const p of PEPTIDES) {
      expect(p.components ?? []).not.toContain(p.slug)
    }
  })

  it('getComponents preserves order and resolves all entries', () => {
    const klow = getPeptideBySlug('klow')
    expect(klow?.components).toEqual(['ghk-cu', 'bpc-157', 'tb-500', 'kpv'])
    const resolved = klow ? getComponents(klow) : []
    expect(resolved.map((c) => c.slug)).toEqual([
      'ghk-cu',
      'bpc-157',
      'tb-500',
      'kpv',
    ])
  })

  it('reverse lookup finds the blends a component appears in', () => {
    const blends = getBlendsContaining('bpc-157').map((b) => b.slug)
    expect(blends).toEqual(
      expect.arrayContaining(['bpc-157-tb-500', 'glow', 'klow', 'klow-2']),
    )
    // A non-component single should appear in no blends.
    expect(getBlendsContaining('semaglutide')).toEqual([])
  })
})
