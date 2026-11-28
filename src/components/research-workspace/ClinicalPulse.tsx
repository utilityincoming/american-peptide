'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  applyTrialFilters,
  filtersToSearchParams,
  phaseDistribution,
  rapidUpdates,
  readSavedViews,
  whitespacePhases,
  writeSavedView,
} from '@/lib/research-workspace/pulse'
import type { PulseFilters, SavedPulseView, TrialRecord } from '@/lib/research-workspace/types'

const cache = new Map<string, { trials: TrialRecord[]; total: number }>()

export default function ClinicalPulse({
  filters,
  onChange,
}: {
  filters: PulseFilters
  onChange: (next: PulseFilters) => void
}) {
  const [draftQuery, setDraftQuery] = useState(filters.query)
  const [trials, setTrials] = useState<TrialRecord[]>([])
  const [total, setTotal] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [views, setViews] = useState<SavedPulseView[]>([])
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    setViews(readSavedViews())
  }, [])

  useEffect(() => {
    setDraftQuery(filters.query)
  }, [filters.query])

  useEffect(() => {
    const q = filters.query.trim() || 'peptide'
    const hit = cache.get(q)
    if (hit) {
      setTrials(hit.trials)
      setTotal(hit.total)
      setState('ready')
      return
    }
    const ctrl = new AbortController()
    setState('loading')
    setError('')
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/trials?query=${encodeURIComponent(q)}&pageSize=40`, { signal: ctrl.signal })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'ClinicalTrials.gov request failed')
        const next = (json.trials ?? []) as TrialRecord[]
        cache.set(q, { trials: next, total: json.totalCount ?? next.length })
        setTrials(next)
        setTotal(json.totalCount ?? next.length)
        setState('ready')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setState('error')
        setError(err instanceof Error ? err.message : 'Could not load trials')
      }
    }, 250)
    return () => {
      ctrl.abort()
      window.clearTimeout(timer)
    }
  }, [filters.query])

  const shown = useMemo(() => applyTrialFilters(trials, filters), [trials, filters])
  const phases = useMemo(() => phaseDistribution(shown), [shown])
  const gaps = useMemo(() => whitespacePhases(trials, shown), [trials, shown])
  const recent = useMemo(() => rapidUpdates(shown, new Date().toISOString().slice(0, 10)), [shown])
  const flow = useMemo(() => indicationFlow(shown), [shown])
  const phaseOptions = useMemo(() => phaseDistribution(trials).map((d) => d.phase), [trials])

  const share = typeof window === 'undefined' ? '' : `${window.location.origin}/research-workspace?${filtersToSearchParams(filters, 'pulse')}`

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-hairline bg-fill p-4 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          onChange({ ...filters, query: draftQuery.trim() || 'peptide' })
        }}
      >
        <Field label="Registry query" id="pulse-q">
          <input id="pulse-q" value={draftQuery} onChange={(e) => setDraftQuery(e.target.value)} className={input} />
        </Field>
        <Field label="Phase" id="pulse-phase">
          <select id="pulse-phase" className={input} value={filters.phase} onChange={(e) => onChange({ ...filters, phase: e.target.value })}>
            <option value="">Any phase</option>
            {phaseOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Status contains" id="pulse-status">
          <input id="pulse-status" className={input} value={filters.status} placeholder="RECRUITING" onChange={(e) => onChange({ ...filters, status: e.target.value })} />
        </Field>
        <Field label="Condition or title" id="pulse-cond">
          <input id="pulse-cond" className={input} value={filters.condition} onChange={(e) => onChange({ ...filters, condition: e.target.value })} />
        </Field>
        <Field label="Sponsor" id="pulse-sponsor">
          <input id="pulse-sponsor" className={input} value={filters.sponsor} onChange={(e) => onChange({ ...filters, sponsor: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Updated from" id="pulse-from">
            <input id="pulse-from" type="date" className={input} value={filters.from} onChange={(e) => onChange({ ...filters, from: e.target.value })} />
          </Field>
          <Field label="Updated to" id="pulse-to">
            <input id="pulse-to" type="date" className={input} value={filters.to} onChange={(e) => onChange({ ...filters, to: e.target.value })} />
          </Field>
        </div>
        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
          <button type="submit" className="rounded-lg bg-[#7EE0B5] px-3 py-1.5 text-sm font-semibold text-[#0E1512]">
            Search registry
          </button>
          <button
            type="button"
            className="rounded-lg border border-hairline px-3 py-1.5 text-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(share)
              } catch {
                /* ignore */
              }
            }}
          >
            Copy filter URL
          </button>
          <input
            aria-label="Saved view name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Name this view"
            className={`${input} max-w-[180px]`}
          />
          <button
            type="button"
            className="rounded-lg border border-hairline px-3 py-1.5 text-sm"
            onClick={() => {
              if (!viewName.trim()) return
              writeSavedView(viewName.trim(), filters)
              setViews(readSavedViews())
              setViewName('')
            }}
          >
            Save on this browser
          </button>
        </div>
        {views.length > 0 && (
          <div className="md:col-span-3 flex flex-wrap gap-2" aria-label="Saved views">
            {views.map((v) => (
              <button key={v.name} type="button" className="rounded-full border border-hairline px-3 py-1 text-xs" onClick={() => onChange(v.filters)}>
                {v.name}
              </button>
            ))}
          </div>
        )}
      </form>

      {state === 'loading' && <p className="text-sm text-ink/55" role="status">Loading ClinicalTrials.gov…</p>}
      {state === 'error' && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm" role="alert">
          <p>{error}</p>
          <p className="mt-2">
            Open the same query on{' '}
            <a className="text-accent underline" href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(filters.query)}`}>
              ClinicalTrials.gov
            </a>
            .
          </p>
        </div>
      )}
      {state === 'ready' && shown.length === 0 && (
        <p className="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-ink/55">
          No studies in this page of results match the filters. The registry reports {total} hits for the query; this view loads the first 40.
        </p>
      )}

      {state === 'ready' && shown.length > 0 && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Signal title="In this page" body={`${shown.length} of ${trials.length} loaded studies. Registry total about ${total}.`} />
            <Signal
              title="Whitespace"
              body={gaps.length ? `Filters removed every study in: ${gaps.join(', ')}.` : 'Every phase in the loaded set still has at least one study.'}
            />
            <Signal
              title="Rapid change"
              body={recent.length ? `${recent.length} loaded studies updated in the last 90 days.` : 'No loaded study lists an update in the last 90 days.'}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <figure className="rounded-2xl border border-hairline bg-fill p-4">
              <figcaption className="mb-2 text-sm font-medium">Phase distribution</figcaption>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={phases}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="phase" stroke="rgba(255,255,255,0.35)" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.35)" fontSize={11} width={28} />
                  <Tooltip contentStyle={{ background: '#121816', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#7EE0B5" />
                </BarChart>
              </ResponsiveContainer>
            </figure>
            <figure className="rounded-2xl border border-hairline bg-fill p-4">
              <figcaption className="mb-2 text-sm font-medium">Indication → phase</figcaption>
              <p className="mb-3 text-xs text-ink/50">Top conditions in this page, split by the study’s first listed phase.</p>
              <ul className="space-y-2">
                {flow.map((row) => (
                  <li key={row.condition}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{row.condition}</span>
                      <span className="text-ink/45">{row.total}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-surface">
                      {row.parts.map((part) => (
                        <div key={part.phase} style={{ width: `${(part.count / row.total) * 100}%`, background: part.color }} title={`${part.phase}: ${part.count}`} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-fill text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-3 py-2">Study</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Phase</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.nctId} className="border-t border-hairline">
                    <td className="px-3 py-2">
                      <a className="font-medium text-accent hover:underline" href={`https://clinicaltrials.gov/study/${t.nctId}`}>
                        {t.title}
                      </a>
                      <p className="text-xs text-ink/45">{t.nctId} · {t.sponsor ?? 'Sponsor not listed'} · {t.conditions.slice(0, 2).join(', ') || 'Condition not listed'}</p>
                    </td>
                    <td className="px-3 py-2">{t.status.replaceAll('_', ' ')}</td>
                    <td className="px-3 py-2">{t.phases.join(', ') || '—'}</td>
                    <td className="px-3 py-2">{t.lastUpdate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function indicationFlow(trials: TrialRecord[]): { condition: string; total: number; parts: { phase: string; count: number; color: string }[] }[] {
  const colors = ['#7EE0B5', '#7DD3FC', '#C4B5FD', '#F9A8D4', '#FDE68A']
  const map = new Map<string, Map<string, number>>()
  for (const t of trials) {
    const condition = t.conditions[0] ?? 'Unspecified'
    const phase = t.phases[0] ?? 'N/A'
    const inner = map.get(condition) ?? new Map()
    inner.set(phase, (inner.get(phase) ?? 0) + 1)
    map.set(condition, inner)
  }
  return [...map.entries()]
    .map(([condition, phases]) => {
      const parts = [...phases.entries()].map(([phase, count], i) => ({ phase, count, color: colors[i % colors.length] }))
      const total = parts.reduce((n, p) => n + p.count, 0)
      return { condition, total, parts }
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block text-xs text-ink/55">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Signal({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-fill p-4">
      <p className="text-xs uppercase tracking-wide text-ink/40">{title}</p>
      <p className="mt-1 text-sm text-ink/80">{body}</p>
    </div>
  )
}

const input = 'w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent'
