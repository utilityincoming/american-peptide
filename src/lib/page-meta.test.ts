import { describe, expect, it } from 'vitest'
import { monographDescription, monographTitle } from './page-meta'

describe('featured monograph metadata', () => {
  it('leads with the peptide and stays within a search snippet', () => {
    const title = monographTitle('Semaglutide', 'semaglutide')
    const description = monographDescription('semaglutide', 'unused')
    expect(title).toContain('Semaglutide')
    expect(title.length).toBeLessThan(60)
    expect(description).toMatch(/Not a store/)
    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(165)
  })
})
