import { RESEARCH_AREAS } from '@/lib/research-areas'
import type { PulseFilters, TrialRecord } from './types'

export const EMPTY_FILTERS: PulseFilters = {
  query: 'peptide therapeutics',
  phase: '',
  status: '',
  condition: '',
  sponsor: '',
  from: '',
  to: '',
}

const PHASE_ORDER = [
  'Early Phase 1',
  'Phase 1',
  'Phase 2',
  'Phase 3',
  'Phase 4',
  'N/A',
]

/** Append a registry page, dropping duplicate NCT IDs. */
export function mergeTrials(existing: TrialRecord[], incoming: TrialRecord[]): TrialRecord[] {
  const seen = new Set(existing.map((t) => t.nctId))
  const extra = incoming.filter((t) => t.nctId && !seen.has(t.nctId))
  return extra.length ? [...existing, ...extra] : existing
}

export function applyTrialFilters(trials: TrialRecord[], filters: PulseFilters): TrialRecord[] {
  const condition = filters.condition.trim().toLowerCase()
  const sponsor = filters.sponsor.trim().toLowerCase()
  const status = filters.status.trim().toLowerCase()
  return trials.filter((t) => {
    if (filters.phase && !t.phases.includes(filters.phase)) return false
    if (status && !t.status.toLowerCase().includes(status)) return false
    if (condition && !t.conditions.some((c) => c.toLowerCase().includes(condition)) && !t.title.toLowerCase().includes(condition)) {
      return false
    }
    if (sponsor && !(t.sponsor ?? '').toLowerCase().includes(sponsor)) return false
    const stamp = t.lastUpdate ?? t.startDate
    if (filters.from && stamp && stamp < filters.from) return false
    if (filters.from && !stamp) return false
    if (filters.to && stamp && stamp > filters.to) return false
    if (filters.to && !stamp) return false
    return true
  })
}

export type StatusClass = 'recruiting' | 'active' | 'completed' | 'stopped' | 'other'

const STATUS_CLASS: Record<string, StatusClass> = {
  RECRUITING: 'recruiting',
  ENROLLING_BY_INVITATION: 'recruiting',
  ACTIVE_NOT_RECRUITING: 'active',
  NOT_YET_RECRUITING: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'stopped',
  WITHDRAWN: 'stopped',
  SUSPENDED: 'stopped',
}

const PHASE_KEY: Record<string, string> = {
  'Early Phase 1': 'early1',
  'Phase 1': '1',
  'Phase 2': '2',
  'Phase 3': '3',
  'Phase 4': '4',
  'N/A': 'na',
}

export interface IndexedTrial extends TrialRecord {
  phaseKeys: string[]
  statusClass: StatusClass
  /** Research-area slugs whose matchers hit a listed condition. Computed once. */
  areaSlugs: string[]
}

export function indexTrial(trial: TrialRecord): IndexedTrial {
  const conditions = trial.conditions.join(' | ').toLowerCase()
  const areaSlugs = RESEARCH_AREAS.filter((area) =>
    area.matchers.some((matcher) => conditions.includes(matcher)),
  ).map((area) => area.slug)
  return {
    ...trial,
    phaseKeys: (trial.phases.length ? trial.phases : ['N/A']).map((phase) => PHASE_KEY[phase] ?? 'na'),
    statusClass: STATUS_CLASS[trial.status] ?? 'other',
    areaSlugs,
  }
}

export function filterIndexed(
  trials: IndexedTrial[],
  filters: PulseFilters,
): IndexedTrial[] {
  return trials.filter((trial) => {
    if (filters.phase && !trial.phaseKeys.includes(filters.phase) && !trial.phases.includes(filters.phase)) {
      return false
    }
    if (filters.status && trial.statusClass !== filters.status) return false
    if (filters.condition && !trial.areaSlugs.includes(filters.condition)) return false
    if (filters.sponsor && trial.sponsor !== filters.sponsor) return false
    const stamp = trial.lastUpdate
    if (filters.from && (!stamp || stamp < filters.from)) return false
    if (filters.to && (!stamp || stamp > filters.to)) return false
    return true
  })
}

export interface TrialDelta {
  nctId: string
  title: string
  field: 'status' | 'enrollment' | 'lastUpdate'
  before: string
  after: string
}

/** Field changes against a prior snapshot. New studies are not called changes. */
export function trialDeltas(previous: TrialRecord[], next: TrialRecord[]): TrialDelta[] {
  const prior = new Map(previous.map((trial) => [trial.nctId, trial]))
  const deltas: TrialDelta[] = []
  for (const trial of next) {
    const old = prior.get(trial.nctId)
    if (!old) continue
    if (old.status !== trial.status) {
      deltas.push({ nctId: trial.nctId, title: trial.title, field: 'status', before: old.status, after: trial.status })
    }
    if (old.enrollment !== trial.enrollment) {
      deltas.push({
        nctId: trial.nctId,
        title: trial.title,
        field: 'enrollment',
        before: old.enrollment == null ? 'not listed' : String(old.enrollment),
        after: trial.enrollment == null ? 'not listed' : String(trial.enrollment),
      })
    }
    if ((old.lastUpdate ?? '') !== (trial.lastUpdate ?? '')) {
      deltas.push({
        nctId: trial.nctId,
        title: trial.title,
        field: 'lastUpdate',
        before: old.lastUpdate ?? 'not listed',
        after: trial.lastUpdate ?? 'not listed',
      })
    }
  }
  return deltas
}

const SNAPSHOT_KEY = 'amp-pulse-snapshot-v1'

export interface PulseSnapshot {
  savedAt: string
  query: string
  trials: TrialRecord[]
}

export function readPulseSnapshot(query: string): PulseSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PulseSnapshot
    if (!parsed || parsed.query !== query || !Array.isArray(parsed.trials)) return null
    return parsed
  } catch {
    return null
  }
}

export function writePulseSnapshot(snapshot: PulseSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  } catch {
    /* private mode */
  }
}

export function phaseDistribution(trials: TrialRecord[]): { phase: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of trials) {
    const phases = t.phases.length ? t.phases : ['N/A']
    for (const p of phases) counts.set(p, (counts.get(p) ?? 0) + 1)
  }
  const known = PHASE_ORDER.filter((p) => counts.has(p)).map((phase) => ({
    phase,
    count: counts.get(phase) ?? 0,
  }))
  const extra = [...counts.keys()]
    .filter((p) => !PHASE_ORDER.includes(p))
    .sort()
    .map((phase) => ({ phase, count: counts.get(phase) ?? 0 }))
  return [...known, ...extra]
}

/** Phases present in the unfiltered pull that the current filters removed entirely. */
export function whitespacePhases(all: TrialRecord[], shown: TrialRecord[]): string[] {
  const before = new Set(phaseDistribution(all).map((d) => d.phase))
  const after = new Set(phaseDistribution(shown).map((d) => d.phase))
  return [...before].filter((p) => !after.has(p))
}

/** Studies whose last update falls inside `days` of `today` (YYYY-MM-DD). */
export function rapidUpdates(trials: TrialRecord[], today: string, days = 90): TrialRecord[] {
  const cutoff = shiftDate(today, -days)
  if (!cutoff) return []
  return trials
    .filter((t) => t.lastUpdate && t.lastUpdate >= cutoff)
    .sort((a, b) => (b.lastUpdate ?? '').localeCompare(a.lastUpdate ?? ''))
}

function shiftDate(iso: string, deltaDays: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

export function filtersToSearchParams(filters: PulseFilters, tool: string): string {
  const p = new URLSearchParams()
  p.set('tool', tool)
  if (filters.query) p.set('q', filters.query)
  if (filters.phase) p.set('phase', filters.phase)
  if (filters.status) p.set('status', filters.status)
  if (filters.condition) p.set('condition', filters.condition)
  if (filters.sponsor) p.set('sponsor', filters.sponsor)
  if (filters.from) p.set('from', filters.from)
  if (filters.to) p.set('to', filters.to)
  return p.toString()
}

export function filtersFromSearchParams(sp: URLSearchParams): PulseFilters {
  return {
    query: sp.get('q') || EMPTY_FILTERS.query,
    phase: sp.get('phase') ?? '',
    status: sp.get('status') ?? '',
    condition: sp.get('condition') ?? '',
    sponsor: sp.get('sponsor') ?? '',
    from: sp.get('from') ?? '',
    to: sp.get('to') ?? '',
  }
}

const VIEW_KEY = 'amp-clinical-pulse-views'

export function readSavedViews(): { name: string; filters: PulseFilters; savedAt: number }[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(VIEW_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeSavedView(name: string, filters: PulseFilters): void {
  if (typeof window === 'undefined') return
  const next = [
    { name: name.slice(0, 80), filters, savedAt: Date.now() },
    ...readSavedViews().filter((v) => v.name !== name),
  ].slice(0, 12)
  try {
    localStorage.setItem(VIEW_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
}
