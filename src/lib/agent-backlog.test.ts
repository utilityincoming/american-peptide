import { describe, expect, it } from 'vitest'
import { getAgentBacklog, recordAgentTurn, unmatchedCompoundHint } from './agent-backlog'

describe('unmatchedCompoundHint', () => {
  it('names a token the catalog does not have', () => {
    expect(unmatchedCompoundHint('What is the molecular formula of Zentaril-9?')).toBe('Zentaril-9')
  })

  it('stays quiet when the compound is already in the catalog', () => {
    expect(unmatchedCompoundHint('What is the half-life of semaglutide?')).toBeNull()
  })
})

describe('recordAgentTurn', () => {
  it('surfaces a repeated catalog miss and ignores a grounded catalog hit', async () => {
    const q = 'What is the molecular formula of Zentaril-9 exactly?'
    for (let i = 0; i < 3; i++) {
      await recordAgentTurn({
        question: q,
        logFaq: true,
        catalogMatched: false,
        provider: 'venice',
        grounded: false,
      })
    }
    await recordAgentTurn({
      question: 'What is the half-life of semaglutide today?',
      logFaq: false,
      catalogMatched: true,
      provider: 'grok',
      grounded: true,
    })

    const backlog = await getAgentBacklog(50)
    const row = backlog.find((item) => item.text.includes('Zentaril-9'))
    expect(row?.kind).toBe('catalog_miss')
    expect(row?.hint).toBe('Zentaril-9')
    expect(row?.count).toBeGreaterThanOrEqual(3)
    expect(backlog.some((item) => item.text.includes('semaglutide today'))).toBe(false)
  })

  it('records a reference-floor answer', async () => {
    const q = 'Where can I read the published entry for this stack?'
    for (let i = 0; i < 3; i++) {
      await recordAgentTurn({
        question: q,
        logFaq: true,
        catalogMatched: false,
        provider: 'reference',
        grounded: false,
      })
    }
    const backlog = await getAgentBacklog(50)
    const row = backlog.find((item) => item.text.includes('published entry'))
    expect(row?.kinds.reference_floor).toBeGreaterThanOrEqual(3)
  })
})
