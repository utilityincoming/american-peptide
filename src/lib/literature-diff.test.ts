import { describe, it, expect } from 'vitest'
import {
  diffCompoundSnapshot,
  formatDigestMarkdown,
  type CompoundLiteratureSnapshot,
  type LiteratureDiffReport,
} from '@/lib/literature-diff'

describe('diffCompoundSnapshot', () => {
  const prev: CompoundLiteratureSnapshot = {
    slug: 'semaglutide',
    name: 'Semaglutide',
    query: 'Semaglutide',
    fetchedAt: '2026-11-17T00:00:00.000Z',
    trials: [
      {
        nctId: 'NCT05567796',
        title: 'Semaglutide Weight Outcomes Study',
        status: 'RECRUITING',
        phase: 'PHASE2',
        lastUpdate: '2026-10-01',
        url: 'https://clinicaltrials.gov/study/NCT05567796',
      },
    ],
    articles: [
      {
        pmid: '38000001',
        title: 'Baseline Semaglutide Paper',
        journal: 'NEJM',
        date: '2026 Jan',
        url: 'https://pubmed.ncbi.nlm.nih.gov/38000001/',
      },
    ],
  }

  it('detects NCT status changes, phase transitions, new NCT IDs, and newly indexed PMIDs', () => {
    const current: CompoundLiteratureSnapshot = {
      ...prev,
      fetchedAt: '2026-11-24T00:00:00.000Z',
      trials: [
        {
          nctId: 'NCT05567796',
          title: 'Semaglutide Weight Outcomes Study',
          status: 'ACTIVE_NOT_RECRUITING',
          phase: 'PHASE3',
          lastUpdate: '2026-11-20',
          url: 'https://clinicaltrials.gov/study/NCT05567796',
        },
        {
          nctId: 'NCT06999999',
          title: 'New Semaglutide Cardiorenal Trial',
          status: 'NOT_YET_RECRUITING',
          phase: 'PHASE2',
          lastUpdate: '2026-11-22',
          url: 'https://clinicaltrials.gov/study/NCT06999999',
        },
      ],
      articles: [
        ...prev.articles,
        {
          pmid: '39123456',
          title: 'Newly Indexed Semaglutide Mechanism Study',
          journal: 'Cell Metab',
          date: '2026 Nov',
          url: 'https://pubmed.ncbi.nlm.nih.gov/39123456/',
        },
      ],
    }

    const diff = diffCompoundSnapshot(prev, current)
    expect(diff.isNewBaseline).toBe(false)
    expect(diff.newTrials).toHaveLength(1)
    expect(diff.newTrials[0].nctId).toBe('NCT06999999')

    expect(diff.statusChanges).toHaveLength(1)
    expect(diff.statusChanges[0]).toMatchObject({
      nctId: 'NCT05567796',
      previousStatus: 'RECRUITING',
      currentStatus: 'ACTIVE_NOT_RECRUITING',
    })

    expect(diff.phaseTransitions).toHaveLength(1)
    expect(diff.phaseTransitions[0]).toMatchObject({
      nctId: 'NCT05567796',
      previousPhase: 'PHASE2',
      currentPhase: 'PHASE3',
    })

    expect(diff.newArticles).toHaveLength(1)
    expect(diff.newArticles[0].pmid).toBe('39123456')

    const report: LiteratureDiffReport = {
      generatedAt: '2026-11-24T00:00:00.000Z',
      baselineUpdatedAt: '2026-11-17T00:00:00.000Z',
      dryRun: true,
      compoundsChecked: 1,
      summary: {
        newTrials: 1,
        statusChanges: 1,
        phaseTransitions: 1,
        newArticles: 1,
      },
      digests: [diff],
    }
    const md = formatDigestMarkdown(report)
    expect(md).toContain('NCT05567796')
    expect(md).toContain('NCT06999999')
    expect(md).toContain('PMID 39123456')
    expect(md).toContain('Editorial safeguard:')
  })
})
