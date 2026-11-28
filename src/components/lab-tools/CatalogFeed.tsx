'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { ATTRIBUTION, rowsToCsv } from '@/lib/research-workspace/sequence'
import MethodsPanel from '@/components/research-workspace/MethodsPanel'

const KEY = 'amp-lab-api-key'
const VIEWS = 'amp-lab-feed-views'

interface Row {
  slug: string
  name: string
  molecularWeight: number | null
  molecularFormula: string | null
  pubchemCid: number | null
  fdaApproved: boolean
  url: string
}

interface SavedView {
  name: string
  query: string
  category: string
  area: string
  fda: string
}

export default function CatalogFeed() {
  const [apiKey, setApiKey] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [area, setArea] = useState('')
  const [fda, setFda] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<string | null>(null)
  const [views, setViews] = useState<SavedView[]>([])
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    setApiKey(localStorage.getItem(KEY) ?? '')
    try {
      const raw = localStorage.getItem(VIEWS)
      setViews(raw ? JSON.parse(raw) : [])
    } catch {
      setViews([])
    }
  }, [])

  async function run(event?: React.FormEvent) {
    event?.preventDefault()
    setState('loading')
    setError('')
    const params = new URLSearchParams({ limit: '50' })
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('category', category)
    if (area) params.set('area', area)
    if (fda) params.set('fda', fda)
    const headers: HeadersInit = {}
    if (apiKey.trim()) headers.Authorization = `Bearer ${apiKey.trim()}`
    try {
      const response = await fetch(`/api/v2/catalog?${params}`, { headers })
      setRemaining(response.headers.get('ratelimit-remaining') ?? response.headers.get('x-quota-remaining'))
      const json = await response.json()
      if (!response.ok) throw new Error(json.error?.issues?.[0]?.message || json.error || `Catalog responded ${response.status}`)
      setRows(json.peptides ?? [])
      setState('ready')
      if (apiKey.trim()) localStorage.setItem(KEY, apiKey.trim())
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Catalog request failed')
    }
  }

  function saveView() {
    if (!viewName.trim()) return
    const next = [{ name: viewName.trim(), query, category, area, fda }, ...views.filter((view) => view.name !== viewName.trim())].slice(0, 12)
    setViews(next)
    localStorage.setItem(VIEWS, JSON.stringify(next))
    setViewName('')
  }

  const fetchedAt = new Date().toISOString()

  return (
    <form className="space-y-4" onSubmit={run}>
      <label className="block text-sm" htmlFor="lab-key">
        Free API key (optional). A key raises the catalog limit. It stays in this browser.
        <input id="lab-key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} autoComplete="off" className="mt-1 w-full rounded-lg border border-hairline bg-fill px-3 py-2 font-mono text-xs" placeholder="Bearer token from POST /api/keys" />
      </label>
      <div className="grid gap-3 md:grid-cols-4">
        <input aria-label="Query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or alias" className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm" />
        <select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm">
          <option value="">Any category</option>
          {CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <select aria-label="Research area" value={area} onChange={(event) => setArea(event.target.value)} className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm">
          <option value="">Any research area</option>
          {RESEARCH_AREAS.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
        </select>
        <select aria-label="FDA flag" value={fda} onChange={(event) => setFda(event.target.value)} className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm">
          <option value="">Any FDA flag</option>
          <option value="true">Flagged FDA-approved</option>
          <option value="false">Not flagged</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="rounded-lg bg-[#7EE0B5] px-3 py-1.5 text-sm font-semibold text-[#0E1512]">Query catalog</button>
        <input aria-label="Saved filter name" value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="Name this filter" className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm" />
        <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={saveView}>Save on this browser</button>
      </div>
      {views.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {views.map((view) => (
            <button key={view.name} type="button" className="rounded-full border border-hairline px-3 py-1 text-xs" onClick={() => { setQuery(view.query); setCategory(view.category); setArea(view.area); setFda(view.fda) }}>
              {view.name}
            </button>
          ))}
        </div>
      )}
      {remaining != null && <p className="text-xs text-ink/50">Rate-limit or quota remaining on the last response: {remaining}. A low number means the next calls may be refused until the window resets.</p>}
      {state === 'loading' && <p role="status" className="text-sm text-ink/55">Querying the catalog…</p>}
      {state === 'error' && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {state === 'ready' && rows.length === 0 && <p className="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-ink/55">No catalog rows for this filter.</p>}
      {rows.length > 0 && (
        <>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={() => download('catalog-feed.json', JSON.stringify({ fetchedAt, attribution: ATTRIBUTION, peptides: rows }, null, 2), 'application/json')}>Download JSON</button>
            <button type="button" className="rounded-lg border border-hairline px-3 py-1.5 text-sm" onClick={() => download('catalog-feed.csv', rowsToCsv(['slug', 'name', 'mw', 'formula', 'pubchem', 'fda', 'url', 'fetched_at'], rows.map((row) => [row.slug, row.name, row.molecularWeight == null ? '' : String(row.molecularWeight), row.molecularFormula ?? '', row.pubchemCid == null ? '' : String(row.pubchemCid), row.fdaApproved ? 'yes' : 'no', row.url, fetchedAt])), 'text/csv')}>Download CSV</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-fill text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-3 py-2">Peptide</th>
                  <th className="px-3 py-2">Mass</th>
                  <th className="px-3 py-2">Formula</th>
                  <th className="px-3 py-2">PubChem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.slug} className="border-t border-hairline">
                    <td className="px-3 py-2"><Link className="text-accent hover:underline" href={`/catalog/${row.slug}`}>{row.name}</Link></td>
                    <td className="px-3 py-2">{row.molecularWeight ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.molecularFormula ?? '—'}</td>
                    <td className="px-3 py-2">{row.pubchemCid ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <MethodsPanel items={[
        { term: 'Endpoint', text: 'GET /api/v2/catalog with the same filters as the public API. An optional Bearer key from POST /api/keys is sent only if you paste one. The key is stored in localStorage on a successful call.' },
        { term: 'Limits', text: 'The page shows RateLimit-Remaining or X-Quota-Remaining from the response. It does not bypass the limit.' },
      ]} />
    </form>
  )
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}
