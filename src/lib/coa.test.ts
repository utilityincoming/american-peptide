import { describe, it, expect } from 'vitest'
import {
  ACETATE_OFFSET_DA,
  analyzeCoa,
  buildCoaTextFromQuickEntry,
  GHK_CU_COMPLEX_MW_DA,
  GHK_FREE_LIGAND_MW_DA,
  matchObservedMass,
  SAMPLE_COA,
  TFA_OFFSET_DA,
} from '@/lib/coa'

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

describe('matchObservedMass — salt-aware and adduct-aware MS cross-check', () => {
  // BPC-157 verified reference MW = 1419.5 Da
  const bpcRef = 1419.5

  it('matches free-base MW and [M+H]+ single-charged peak', () => {
    const free = matchObservedMass(1419.5, bpcRef, { slug: 'bpc-157' })
    expect(free.matched).toBe(true)
    expect(free.kind).toBe('free_base')
    expect(free.note).toMatch(/free-base reference mass/)

    const mh = matchObservedMass(1420.6, bpcRef, { slug: 'bpc-157' })
    expect(mh.matched).toBe(true)
    // Within 1.8 Da tolerance, 1419.5 vs 1420.51; tightest match is m_plus_h (delta ~0.09 Da)
    expect(mh.kind).toBe('m_plus_h')
    expect(mh.note).toMatch(/\[M\+H\]\+/)
  })

  it('matches doubly charged [M+2H]2+ m/z peak', () => {
    // (1419.5 + 2.0156) / 2 = 710.76
    const m2h = matchObservedMass(710.8, bpcRef, { slug: 'bpc-157' })
    expect(m2h.matched).toBe(true)
    expect(m2h.kind).toBe('m_plus_2h')
    expect(m2h.speciesLabel).toContain('[M+2H]2+')
    expect(m2h.note).toMatch(/doubly charged \[M\+2H\]2\+/)
  })

  it('matches acetate (+60.05 Da) and TFA (+114.02 Da) salt offsets', () => {
    const acetate = matchObservedMass(bpcRef + ACETATE_OFFSET_DA, bpcRef, { slug: 'bpc-157' })
    expect(acetate.matched).toBe(true)
    expect(acetate.kind).toBe('acetate_salt')
    expect(acetate.note).toMatch(/\+ 60\.05 Da acetate/)

    const tfa = matchObservedMass(bpcRef + TFA_OFFSET_DA, bpcRef, { slug: 'bpc-157' })
    expect(tfa.matched).toBe(true)
    expect(tfa.kind).toBe('tfa_salt')
    expect(tfa.note).toMatch(/\+ 114\.02 Da TFA/)
  })

  it('matches GHK-Cu Cu2+ coordination complex and dissociated apo GHK tripeptide', () => {
    // GHK-Cu complex (~400.9–401.9 Da)
    const complex = matchObservedMass(401.9, GHK_CU_COMPLEX_MW_DA, {
      slug: 'ghk-cu',
      syntheticFeatures: ['Copper complex'],
    })
    expect(complex.matched).toBe(true)
    expect(complex.kind).toBe('cu_complex')
    expect(complex.note).toMatch(/Cu2\+-coordinated/)

    // Bare GHK ligand (~340.38 Da) when Cu2+ dissociates in acidic ESI mobile phase
    const apo = matchObservedMass(GHK_FREE_LIGAND_MW_DA, GHK_CU_COMPLEX_MW_DA, {
      slug: 'ghk-cu',
      syntheticFeatures: ['Copper complex'],
    })
    expect(apo.matched).toBe(true)
    expect(apo.kind).toBe('cu_apo_ligand')
    expect(apo.note).toMatch(/uncomplexed free tripeptide ligand/)
  })

  it('flags a true mass mismatch and surfaces the delta and tested offsets', () => {
    const mismatch = matchObservedMass(1850.0, bpcRef, { slug: 'bpc-157' })
    expect(mismatch.matched).toBe(false)
    expect(mismatch.kind).toBe('mismatch')
    expect(mismatch.note).toMatch(/Does not match the verified reference mass/)
    expect(mismatch.note).toMatch(/TFA \+114\.02 Da/)
  })

  it('wires salt-aware MS cross-check into analyzeCoa and quick-entry drawer', () => {
    // BPC-157 COA reporting [M+2H]2+ = 710.8
    const m2hReport = analyzeCoa('Product: BPC-157\nPurity (HPLC): 99.1%\nIdentity (ESI-MS): Observed mass 710.8')
    const mwCheck = m2hReport.catalogChecks.find((c) => c.field === 'molecularWeight')!
    expect(mwCheck.verdict).toBe('match')
    expect(mwCheck.msMatch?.kind).toBe('m_plus_2h')

    // Quick-entry drawer synthesis -> analyzeCoa
    const quickText = buildCoaTextFromQuickEntry({
      peptideName: 'GHK-Cu',
      purityPct: '99.4',
      observedMassDa: '340.4',
      counterion: 'Acetate',
      waterPct: '4.2',
      netContentPct: '86.5',
      endotoxinEu: '<0.5',
      labName: 'Janoshik',
      batchOrTaskId: 'TASK-55102',
    })
    const quickReport = analyzeCoa(quickText)
    expect(quickReport.detectedPeptide?.slug).toBe('ghk-cu')
    expect(quickReport.score.grade).toBe('A')
    const ghkMwCheck = quickReport.catalogChecks.find((c) => c.field === 'molecularWeight')!
    expect(ghkMwCheck.verdict).toBe('match')
    expect(ghkMwCheck.msMatch?.kind).toBe('cu_apo_ligand')
  })
})
