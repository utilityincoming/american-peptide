import { describe, it, expect } from 'vitest'
import { analyzeCoa, SAMPLE_COA } from '@/lib/coa'

// The COA decoder is rule-based and pure (no LLM/network), which makes it the
// ideal unit-test target: it grades a certificate against a transparency
// checklist and cross-checks claimed chemistry against the verified catalog.
// These tests pin the published sample, the empty-COA floor, and the purity
// threshold so a detector regression can't silently pass a bad certificate.

describe('analyzeCoa — the published sample COA', () => {
  const r = analyzeCoa(SAMPLE_COA)

  it('detects the peptide', () => {
    expect(r.detectedPeptide?.slug).toBe('bpc-157')
  })

  it('extracts purity, mass spec, and net content', () => {
    const purity = r.fields.find((f) => f.key === 'purity')!
    const ms = r.fields.find((f) => f.key === 'massSpec')!
    const content = r.fields.find((f) => f.key === 'peptideContent')!
    expect(purity.found).toBe(true)
    expect(purity.value).toBe('98.7')
    expect(ms.found).toBe(true)
    expect(ms.value).toBe('1419.5')
    expect(content.found).toBe(true)
    expect(content.value).toBe('82.3')
  })

  it('scores an A (91) — 10 of 11 weighted points earned', () => {
    expect(r.score.points).toBe(10)
    expect(r.score.max).toBe(11)
    expect(r.score.percent).toBe(91)
    expect(r.score.grade).toBe('A')
  })

  it('cross-checks the observed mass against the catalog and finds a match', () => {
    expect(
      r.catalogChecks.some((c) => c.field === 'molecularWeight' && c.verdict === 'match'),
    ).toBe(true)
  })

  it('raises no red flags for a complete, high-purity COA', () => {
    expect(r.redFlags).toEqual([])
  })
})

describe('analyzeCoa — the empty/incomplete floor', () => {
  const r = analyzeCoa('')

  it('detects nothing and grades an F', () => {
    expect(r.detectedPeptide).toBeNull()
    expect(r.score.grade).toBe('F')
    expect(r.score.points).toBe(0)
  })

  it('flags the missing core fields as red flags', () => {
    const messages = r.redFlags.join(' ')
    expect(messages).toContain('purity')
    expect(messages).toContain('mass-spec')
    expect(messages).toContain('peptide/net content')
  })
})

describe('analyzeCoa — purity threshold', () => {
  it('warns on purity below 95% and flags it', () => {
    const r = analyzeCoa('BPC-157\nPurity (RP-HPLC): 92%')
    const purity = r.fields.find((f) => f.key === 'purity')!
    expect(purity.status).toBe('warn')
    expect(r.redFlags.some((f) => f.includes('below ~95%'))).toBe(true)
  })
})
