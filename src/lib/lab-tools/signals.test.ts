import { describe, expect, it } from 'vitest'
import { TRUST_WEIGHTS } from '@/lib/vendors'
import { signalsForText, signalsFromFlags } from './signals'

const SAMPLE = `
Certificate of Analysis
Compound: BPC-157
Lot: BPC-2401
Purity (HPLC): 99.1%
Mass spec: [M+H]+ confirmed
Tested by Janoshik, third-party laboratory
Method: HPLC, LC-MS
`

describe('signalsForText', () => {
  it('uses the published weights and does not invent policy points', () => {
    const scored = signalsForText(SAMPLE, { reshipPolicy: false, refundPolicy: false })
    expect(scored.unrecognized).toBe(false)
    expect(scored.trust.coaOnFile).toBe(true)
    expect(scored.trust.thirdPartyTested).toBe(true)
    expect(scored.trust.perBatchTesting).toBe(true)
    expect(scored.sourcingScore).toBe(
      TRUST_WEIGHTS.coaOnFile + TRUST_WEIGHTS.thirdPartyTested + TRUST_WEIGHTS.perBatchTesting,
    )
    expect(scored.missing).toContain('Reship on loss')
  })

  it('refuses a scan-length paste', () => {
    const scored = signalsForText('image only', { reshipPolicy: true, refundPolicy: true })
    expect(scored.unrecognized).toBe(true)
    expect(scored.trust.coaOnFile).toBe(false)
    expect(scored.sourcingScore).toBe(TRUST_WEIGHTS.reshipPolicy + TRUST_WEIGHTS.refundPolicy)
  })
})

describe('signalsFromFlags', () => {
  it('scores a full intake at 100', () => {
    const result = signalsFromFlags({
      coaOnFile: true,
      thirdPartyTested: true,
      perBatchTesting: true,
      reshipPolicy: true,
      refundPolicy: true,
    })
    expect(result.score).toBe(100)
    expect(result.missing).toEqual([])
  })
})
