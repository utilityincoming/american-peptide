// Pure diffing + Markdown/JSON digest formatting for ClinicalTrials.gov v2
// and PubMed E-utilities snapshots (`scripts/sync-trial-diffs.ts`).
//
// Staged candidate updates only — never mutates editorial summaries, catalog
// records, or evidence tiers.

export interface TrialSnapshotRecord {
  nctId: string
  title: string
  status: string | null
  phase: string | null
  lastUpdate: string | null
  url: string
}

export interface ArticleSnapshotRecord {
  pmid: string
  title: string
  journal: string | null
  date: string | null
  url: string
}

export interface CompoundLiteratureSnapshot {
  slug: string
  name: string
  query: string
  fetchedAt: string
  trials: TrialSnapshotRecord[]
  articles: ArticleSnapshotRecord[]
}

export interface LiteratureSnapshotFile {
  schemaVersion: '1.0.0'
  updatedAt: string
  note: string
  compounds: Record<string, CompoundLiteratureSnapshot>
}

export interface TrialStatusChange {
  nctId: string
  title: string
  previousStatus: string | null
  currentStatus: string | null
  lastUpdate: string | null
  url: string
}

export interface TrialPhaseTransition {
  nctId: string
  title: string
  previousPhase: string | null
  currentPhase: string | null
  status: string | null
  lastUpdate: string | null
  url: string
}

export interface CompoundDiffDigest {
  slug: string
  name: string
  query: string
  isNewBaseline: boolean
  newTrials: TrialSnapshotRecord[]
  statusChanges: TrialStatusChange[]
  phaseTransitions: TrialPhaseTransition[]
  newArticles: ArticleSnapshotRecord[]
}

export interface LiteratureDiffReport {
  generatedAt: string
  baselineUpdatedAt: string
  dryRun: boolean
  compoundsChecked: number
  summary: {
    newTrials: number
    statusChanges: number
    phaseTransitions: number
    newArticles: number
  }
  digests: CompoundDiffDigest[]
}

/**
 * Compute deterministic diffs between a committed compound snapshot (`previous`)
 * and a freshly fetched compound snapshot (`current`).
 */
export function diffCompoundSnapshot(
  previous: CompoundLiteratureSnapshot | null | undefined,
  current: CompoundLiteratureSnapshot,
): CompoundDiffDigest {
  if (!previous) {
    return {
      slug: current.slug,
      name: current.name,
      query: current.query,
      isNewBaseline: true,
      newTrials: current.trials,
      statusChanges: [],
      phaseTransitions: [],
      newArticles: current.articles,
    }
  }

  const prevTrialsByNct = new Map(previous.trials.map((t) => [t.nctId, t]))
  const prevArticlesByPmid = new Map(previous.articles.map((a) => [a.pmid, a]))

  const newTrials: TrialSnapshotRecord[] = []
  const statusChanges: TrialStatusChange[] = []
  const phaseTransitions: TrialPhaseTransition[] = []

  for (const trial of current.trials) {
    const prev = prevTrialsByNct.get(trial.nctId)
    if (!prev) {
      newTrials.push(trial)
      continue
    }
    if ((prev.status ?? '') !== (trial.status ?? '')) {
      statusChanges.push({
        nctId: trial.nctId,
        title: trial.title,
        previousStatus: prev.status,
        currentStatus: trial.status,
        lastUpdate: trial.lastUpdate,
        url: trial.url,
      })
    }
    if ((prev.phase ?? '') !== (trial.phase ?? '')) {
      phaseTransitions.push({
        nctId: trial.nctId,
        title: trial.title,
        previousPhase: prev.phase,
        currentPhase: trial.phase,
        status: trial.status,
        lastUpdate: trial.lastUpdate,
        url: trial.url,
      })
    }
  }

  const newArticles: ArticleSnapshotRecord[] = []
  for (const article of current.articles) {
    if (!prevArticlesByPmid.has(article.pmid)) {
      newArticles.push(article)
    }
  }

  return {
    slug: current.slug,
    name: current.name,
    query: current.query,
    isNewBaseline: false,
    newTrials,
    statusChanges,
    phaseTransitions,
    newArticles,
  }
}

/**
 * Format a `LiteratureDiffReport` into a clean Markdown digest suitable for
 * release notes, `/trials/updates`, @USPeptide, or Telegram review.
 */
export function formatDigestMarkdown(report: LiteratureDiffReport): string {
  const lines: string[] = [
    '# ClinicalTrials.gov & PubMed Weekly Diff Digest',
    '',
    `- **Generated:** ${report.generatedAt}`,
    `- **Baseline snapshot:** ${report.baselineUpdatedAt}`,
    `- **Compounds checked:** ${report.compoundsChecked}${report.dryRun ? ' (dry-run)' : ''}`,
    `- **Staged changes:** ${report.summary.newTrials} new NCT trial(s) · ${report.summary.statusChanges} status change(s) · ${report.summary.phaseTransitions} phase transition(s) · ${report.summary.newArticles} newly indexed PMID(s)`,
    '',
    '> **Editorial safeguard:** Candidate updates only. Editorial summaries, catalog records, and evidence tiers are never auto-overwritten.',
    '',
  ]

  const active = report.digests.filter(
    (d) =>
      d.newTrials.length > 0 ||
      d.statusChanges.length > 0 ||
      d.phaseTransitions.length > 0 ||
      d.newArticles.length > 0,
  )

  if (active.length === 0) {
    lines.push('No NCT status changes, phase transitions, or newly indexed PMIDs detected against the committed baseline.')
    return lines.join('\n')
  }

  for (const d of active) {
    lines.push(`## ${d.name} (\`${d.slug}\`) — query: \`${d.query}\``)
    lines.push('')

    if (d.statusChanges.length > 0) {
      lines.push('### NCT Status Changes')
      for (const s of d.statusChanges) {
        lines.push(
          `- **[${s.nctId}](${s.url})**: \`${s.previousStatus ?? 'NONE'}\` → \`${s.currentStatus ?? 'NONE'}\` — ${s.title}${s.lastUpdate ? ` *(updated ${s.lastUpdate})*` : ''}`,
        )
      }
      lines.push('')
    }

    if (d.phaseTransitions.length > 0) {
      lines.push('### NCT Phase Transitions')
      for (const p of d.phaseTransitions) {
        lines.push(
          `- **[${p.nctId}](${p.url})**: \`${p.previousPhase ?? 'N/A'}\` → \`${p.currentPhase ?? 'N/A'}\` (${p.status ?? 'status unstated'}) — ${p.title}`,
        )
      }
      lines.push('')
    }

    if (d.newTrials.length > 0) {
      lines.push('### Newly Indexed ClinicalTrials.gov Studies')
      for (const t of d.newTrials) {
        const meta = [t.status, t.phase, t.lastUpdate ? `updated ${t.lastUpdate}` : null]
          .filter(Boolean)
          .join(' · ')
        lines.push(`- **[${t.nctId}](${t.url})** (${meta || 'no status'}) — ${t.title}`)
      }
      lines.push('')
    }

    if (d.newArticles.length > 0) {
      lines.push('### Newly Indexed PubMed Articles')
      for (const a of d.newArticles) {
        const meta = [a.journal, a.date].filter(Boolean).join(' · ')
        lines.push(`- **[PMID ${a.pmid}](${a.url})**${meta ? ` (${meta})` : ''} — ${a.title}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}
