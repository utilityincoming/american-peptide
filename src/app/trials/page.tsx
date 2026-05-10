'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, ExternalLink, Activity, Users } from 'lucide-react'

interface Trial {
  nctId: string
  title: string
  status: string
  phases: string[]
  sponsor: string | null
  enrollment: number | null
}

type Filter = 'all' | 'recruiting' | 'completed' | 'phase1' | 'phase2' | 'phase3'
type Status = 'idle' | 'loading' | 'success' | 'error'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'completed', label: 'Completed' },
  { id: 'phase1', label: 'Phase 1' },
  { id: 'phase2', label: 'Phase 2' },
  { id: 'phase3', label: 'Phase 3' },
]

export default function TrialsPage() {
  const [query, setQuery] = useState('peptide therapeutics')
  const [submitted, setSubmitted] = useState('peptide therapeutics')
  const [trials, setTrials] = useState<Trial[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!submitted) return

    const controller = new AbortController()
    setStatus('loading')

    ;(async () => {
      try {
        const res = await fetch(
          `/api/trials?query=${encodeURIComponent(submitted)}`,
          { signal: controller.signal },
        )
        const data = await res.json()
        if (!res.ok) {
          setErrorMsg(data.error || 'Search failed')
          setStatus('error')
          return
        }
        setTrials(data.trials ?? [])
        setTotalCount(data.totalCount ?? 0)
        setStatus('success')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setErrorMsg(err instanceof Error ? err.message : 'Network error')
        setStatus('error')
      }
    })()

    return () => controller.abort()
  }, [submitted])

  const filtered = useMemo(() => {
    if (filter === 'all') return trials
    if (filter === 'recruiting') return trials.filter((t) => t.status === 'RECRUITING')
    if (filter === 'completed') return trials.filter((t) => t.status === 'COMPLETED')
    if (filter === 'phase1') return trials.filter((t) => t.phases.includes('Phase 1'))
    if (filter === 'phase2') return trials.filter((t) => t.phases.includes('Phase 2'))
    if (filter === 'phase3') return trials.filter((t) => t.phases.includes('Phase 3'))
    return trials
  }, [trials, filter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) setSubmitted(trimmed)
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-white/35 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">AmericanPeptide</span>
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
            <Activity className="h-4 w-4 text-[#2DD4A8]" strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-sm font-medium">Clinical Trials</span>
            <span className="ml-2 hidden text-xs text-white/30 sm:inline">
              ClinicalTrials.gov
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* ── Search bar ── */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-[#2DD4A8]/25">
            <Search className="h-4 w-4 flex-shrink-0 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clinical trials…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
            {status === 'loading' && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2DD4A8]/30 border-t-[#2DD4A8]" />
            )}
            <button
              type="submit"
              className="rounded-lg bg-[#2DD4A8] px-3 py-1 text-xs font-medium text-[#0B1220] transition-colors hover:bg-[#34ddb0]"
            >
              Search
            </button>
          </div>
        </form>

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                filter === f.id
                  ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] text-[#2DD4A8]'
                  : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/[0.15] hover:text-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Counts ── */}
        {status === 'success' && (
          <p className="mb-5 text-xs text-white/40">
            Showing {filtered.length} of {trials.length} loaded
            {totalCount > trials.length && ` · ${totalCount.toLocaleString()} total matches on ClinicalTrials.gov`}
          </p>
        )}

        {/* ── States ── */}
        {status === 'loading' && trials.length === 0 && (
          <div className="py-16 text-center text-sm text-white/30">Loading trials…</div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4">
            <p className="text-sm text-red-300/90">Search error</p>
            <p className="mt-1 text-xs text-red-300/60">{errorMsg}</p>
          </div>
        )}

        {status === 'success' && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
            <p className="text-sm text-white/55">No trials match this filter</p>
            <p className="mt-1 text-xs text-white/30">
              Try a different filter or search term.
            </p>
          </div>
        )}

        {status === 'success' && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((t) => (
              <TrialCard key={t.nctId} trial={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PhaseBadge({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    'Phase 1': 'border-blue-400/25 bg-blue-400/[0.08] text-blue-300',
    'Phase 2': 'border-amber-400/25 bg-amber-400/[0.08] text-amber-300',
    'Phase 3': 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300',
  }
  const cls =
    styles[phase] ?? 'border-white/[0.08] bg-white/[0.04] text-white/55'
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {phase}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    RECRUITING: 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300',
    COMPLETED: 'border-white/[0.1] bg-white/[0.05] text-white/55',
    ACTIVE_NOT_RECRUITING: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-300',
  }
  const cls = styles[status] ?? 'border-white/[0.08] bg-white/[0.03] text-white/45'
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  )
}

function TrialCard({ trial }: { trial: Trial }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition-colors hover:border-[#2DD4A8]/20">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <a
          href={`https://clinicaltrials.gov/study/${trial.nctId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-mono text-xs text-[#2DD4A8] hover:underline"
        >
          {trial.nctId}
          <ExternalLink className="h-3 w-3" />
        </a>
        <StatusBadge status={trial.status} />
        {trial.phases.map((p) => (
          <PhaseBadge key={p} phase={p} />
        ))}
      </div>

      <h3 className="mb-3 text-sm leading-snug text-white/85">{trial.title}</h3>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-white/45">
        {trial.sponsor && (
          <span>
            <span className="text-white/30">Sponsor:</span>{' '}
            <span className="text-white/65">{trial.sponsor}</span>
          </span>
        )}
        {trial.enrollment !== null && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-white/30" />
            <span className="text-white/65">{trial.enrollment.toLocaleString()}</span>
            <span className="text-white/30">enrolled</span>
          </span>
        )}
      </div>
    </div>
  )
}
