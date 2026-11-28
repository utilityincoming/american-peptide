'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { toCompareRow } from '@/lib/research-workspace/catalog'
import { loadCatalog, type CatalogRecord } from '@/lib/research-workspace/catalog-client'
import { alignSequences, residueTokens, rowsToCsv, sequenceCardMarkdown } from '@/lib/research-workspace/sequence'
import type { CompareRow } from '@/lib/research-workspace/types'
import { ChargeChart, HydropathyChart, PropertyBars, seriesColor } from './PropertyCharts'
import MethodsPanel from './MethodsPanel'

const MAX = 4

export default function CompareDashboard({
  ids,
  onIds,
}: {
  ids: string[]
  onIds: (ids: string[]) => void
}) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [area, setArea] = useState('')
  const [notice, setNotice] = useState('')
  const [catalog, setCatalog] = useState<CatalogRecord[]>([])
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [catalogNote, setCatalogNote] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState('')

  useEffect(() => {
    let cancelled = false
    loadCatalog()
      .then((loaded) => {
        if (cancelled) return
        setCatalog(loaded.records)
        setFetchedAt(loaded.fetchedAt)
        setCatalogNote(loaded.notice)
        setCatalogState('ready')
      })
      .catch(() => {
        if (!cancelled) setCatalogState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    return ids
      .map((slug) => catalog.find((p) => p.slug === slug))
      .filter((p): p is CatalogRecord => Boolean(p))
      .map((record) =>
        toCompareRow({
          slug: record.slug,
          name: record.name,
          categories: record.categories as never,
          shortDescription: '',
          description: '',
          sequence: record.sequence ?? undefined,
          molecularWeight: record.molecularWeight ?? undefined,
          molecularFormula: record.molecularFormula ?? undefined,
          pubchemCid: record.pubchemCid ?? undefined,
          uniprotId: record.uniprotId ?? undefined,
          fdaApproved: record.fdaApproved,
          researchAreas: record.researchAreas,
        }),
      )
  }, [ids, catalog])

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase()
    return catalog.filter((p) => {
      if (category && !p.categories.includes(category)) return false
      if (area && !p.areaSlugs.includes(area)) return false
      if (!query) return true
      return (
        p.name.toLowerCase().includes(query) ||
        p.slug.includes(query) ||
        (p.aliases ?? []).some((a) => a.toLowerCase().includes(query))
      )
    }).slice(0, 80)
  }, [q, category, area, catalog])

  function toggle(slug: string) {
    if (ids.includes(slug)) {
      onIds(ids.filter((s) => s !== slug))
      return
    }
    if (ids.length >= MAX) {
      setNotice(`Choose at most ${MAX} peptides.`)
      return
    }
    setNotice('')
    onIds([...ids, slug])
  }

  const pair = rows.length >= 2 ? rows.slice(0, 2) : null

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(`${label} copied.`)
    } catch {
      setNotice('Clipboard is blocked in this browser. Use the download instead.')
    }
  }

  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const calculatedAt = new Date().toISOString()
  const markdown = sequenceCardMarkdown({
    title: `Peptide comparison: ${rows.map((r) => r.name).join(' vs ') || 'none selected'}`,
    sequence: rows.map((r) => `${r.name}: ${r.sequence || 'sequence not in catalog'}`).join('\n'),
    lines: [
      { label: 'Calculated at', value: calculatedAt },
      { label: 'Catalog fetched at', value: fetchedAt || 'not loaded' },
      ...rows.flatMap((r) => [
      { label: `${r.name} slug`, value: r.slug },
      { label: `${r.name} monograph`, value: `https://americanpeptide.com/catalog/${r.slug}` },
      { label: `${r.name} length`, value: fmt(r.length) },
      { label: `${r.name} MW (Da)`, value: `${fmtNum(r.molecularWeight)} (${r.massSource})` },
      { label: `${r.name} formula`, value: r.formula ?? 'not in catalog' },
      { label: `${r.name} charge at pH 7.4`, value: fmtNum(r.netCharge74) },
      { label: `${r.name} GRAVY`, value: fmtNum(r.gravy) },
      { label: `${r.name} FDA flag`, value: r.fdaApproved ? 'approved drug' : 'not flagged approved' },
      { label: `${r.name} PubChem`, value: r.pubchemCid ? String(r.pubchemCid) : 'none' },
      { label: `${r.name} PubChem checked`, value: r.verifiedOn ?? 'not in the verification manifest' },
    ]),
    ],
  })

  const csv = rowsToCsv(
    ['slug', 'url', 'name', 'length', 'mw', 'mass_source', 'formula', 'charge_pH7.4', 'gravy', 'pi', 'fda', 'pubchem', 'verified_on', 'calculated_at', 'areas'],
    rows.map((r) => [
      r.slug,
      `https://americanpeptide.com/catalog/${r.slug}`,
      r.name,
      fmt(r.length),
      fmtNum(r.molecularWeight),
      r.massSource,
      r.formula ?? '',
      fmtNum(r.netCharge74),
      fmtNum(r.gravy),
      fmtNum(r.pi),
      r.fdaApproved ? 'yes' : 'no',
      r.pubchemCid ? String(r.pubchemCid) : '',
      r.verifiedOn ?? '',
      calculatedAt,
      r.researchAreas.join('; '),
    ]),
  )

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <section aria-label="Peptide picker" className="rounded-2xl border border-hairline bg-fill p-4">
          <h2 className="text-sm font-medium">Select 2–4 peptides</h2>
          <label className="mt-3 block text-xs text-ink/55" htmlFor="cmp-search">
            Search the catalog
          </label>
          <input
            id="cmp-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or alias"
            className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <label className="mt-3 block text-xs text-ink/55" htmlFor="cmp-cat">
            Category
          </label>
          <select
            id="cmp-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs text-ink/55" htmlFor="cmp-area">
            Research area
          </label>
          <select
            id="cmp-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          >
            <option value="">All research areas</option>
            {RESEARCH_AREAS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
          {catalogState === 'loading' && <p className="mt-3 text-sm text-ink/55" role="status">Loading the catalog…</p>}
          {catalogState === 'error' && <p className="mt-3 text-sm text-rose-300" role="alert">The catalog request failed.</p>}
          {catalogNote && <p className="mt-3 text-xs text-amber-200/90">{catalogNote}</p>}
          <ul className="mt-3 max-h-72 overflow-auto" role="listbox" aria-label="Catalog matches" aria-multiselectable="true">
            {catalogState === 'ready' && matches.length === 0 && <li className="px-1 py-6 text-sm text-ink/50">No catalog matches.</li>}
            {matches.map((p) => {
              const on = ids.includes(p.slug)
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(p.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface ${on ? 'text-accent' : 'text-ink/80'}`}
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-ink/40">{on ? 'selected' : 'add'}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-xs text-ink/45">{matches.length === 80 ? 'Showing the first 80 matches. Refine the search.' : `${ids.length} selected.`}</p>
        </section>

        <div className="space-y-4">
          {rows.length < 2 ? (
            <div className="rounded-2xl border border-dashed border-hairline px-6 py-16 text-center text-sm text-ink/55">
              Pick at least two peptides. The link updates as you select, so you can share the comparison.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => copy(markdown, 'Markdown')}>
                  Copy markdown
                </button>
                <button type="button" className={btn} onClick={() => download('comparison.md', markdown, 'text/markdown')}>
                  Download markdown
                </button>
                <button type="button" className={btn} onClick={() => download('comparison.csv', csv, 'text/csv')}>
                  Download CSV
                </button>
              </div>
              {notice && <p className="text-xs text-accent" role="status">{notice}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                {rows.map((r, i) => (
                  <article key={r.slug} className="rounded-2xl border border-hairline bg-fill p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: seriesColor(i) }} aria-hidden />
                      <h3 className="font-medium">
                        <Link href={`/catalog/${r.slug}`} className="hover:text-accent">{r.name}</Link>
                      </h3>
                    </div>
                    <p className="font-mono text-xs leading-relaxed break-all text-ink/70">{r.sequence || 'Sequence not listed.'}</p>
                    <p className="mt-2 text-xs text-ink/50">{r.evidenceNote}</p>
                    <p className="mt-2 text-xs">
                      <a className="text-accent hover:underline" href={trialSearch(r.name)}>
                        ClinicalTrials.gov search
                      </a>
                      {r.pubchemCid ? (
                        <>
                          {' · '}
                          <a className="text-accent hover:underline" href={`https://pubchem.ncbi.nlm.nih.gov/compound/${r.pubchemCid}`}>
                            PubChem {r.pubchemCid}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </article>
                ))}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-hairline">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-fill text-xs uppercase tracking-wide text-ink/45">
                    <tr>
                      <th className="px-3 py-2 font-medium">Property</th>
                      {rows.map((r) => (
                        <th key={r.slug} className="px-3 py-2 font-medium">{r.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Length" values={rows.map((r) => fmt(r.length))} />
                    <Row label="Molecular weight (Da)" values={rows.map((r) => `${fmtNum(r.molecularWeight)} · ${r.massSource}`)} />
                    <Row label="Formula" values={rows.map((r) => r.formula ?? '—')} />
                    <Row label="Net charge, pH 7.4" values={rows.map((r) => fmtNum(r.netCharge74))} />
                    <Row label="GRAVY" values={rows.map((r) => fmtNum(r.gravy))} />
                    <Row label="pI (estimate)" values={rows.map((r) => fmtNum(r.pi))} />
                    <Row label="ε280 reduced" values={rows.map((r) => fmt(r.extinction280))} />
                    <Row label="FDA status" values={rows.map((r) => (r.fdaApproved ? 'Approved drug' : 'Not flagged'))} />
                    <Row label="Evidence note" values={rows.map((r) => r.evidenceNote)} />
                    <Row label="PubChem CID" values={rows.map((r) => (r.pubchemCid ? String(r.pubchemCid) : '—'))} />
                    <Row label="Research areas" values={rows.map((r) => r.researchAreas.join(', ') || '—')} />
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {rows.length >= 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <HydropathyChart chains={rows.map((r) => ({ name: r.name, codes: r.codes }))} />
          <ChargeChart chains={rows.map((r) => ({ name: r.name, codes: r.codes }))} />
          <div className="lg:col-span-2">
            <PropertyBars rows={rows.map((r) => ({ name: r.name, gravy: r.gravy, charge: r.netCharge74, length: r.length }))} />
          </div>
        </div>
      )}

      {pair && residueTokens(pair[0].sequence).length > 0 && residueTokens(pair[1].sequence).length > 0 && (
        <SequenceDiff a={pair[0]} b={pair[1]} />
      )}
      <MethodsPanel items={COMPARE_METHODS} />
    </div>
  )
}

function SequenceDiff({ a, b }: { a: CompareRow; b: CompareRow }) {
  const left = residueTokens(a.sequence)
  const right = residueTokens(b.sequence)
  const cells = alignSequences(left.map((token) => token.label), right.map((token) => token.label))
  const subs = cells.filter((c) => c.kind !== 'match').length
  return (
    <section aria-label="Sequence difference" className="rounded-2xl border border-hairline bg-fill p-4">
      <h2 className="text-sm font-medium">Sequence diff — {a.name} vs {b.name}</h2>
      <p className="mt-1 text-xs text-ink/50">
        Global alignment of standard residues. {subs} position{subs === 1 ? '' : 's'} differ or gap. Parenthetical catalog notes are not aligned.
      </p>
      <div className="mt-3 space-y-1 overflow-x-auto font-mono text-xs leading-6">
        <p className="whitespace-nowrap">
          {cells.map((c, i) => (
            <span key={`a${i}`} className={c.kind === 'match' ? 'text-ink/70' : c.kind === 'nonstandard' ? 'bg-amber-400/20 text-amber-100' : 'bg-rose-400/20 text-rose-200'}>{c.a}</span>
          ))}
        </p>
        <p className="whitespace-nowrap">
          {cells.map((c, i) => (
            <span key={`b${i}`} className={c.kind === 'match' ? 'text-ink/70' : c.kind === 'nonstandard' ? 'bg-amber-400/20 text-amber-100' : 'bg-rose-400/20 text-rose-200'}>{c.b}</span>
          ))}
        </p>
      </div>
    </section>
  )
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-hairline">
      <th scope="row" className="px-3 py-2 text-left font-normal text-ink/55">{label}</th>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2 align-top text-ink/85">{v}</td>
      ))}
    </tr>
  )
}

function fmt(n: number | null): string {
  return n == null ? '—' : String(n)
}

function fmtNum(n: number | null): string {
  if (n == null || Number.isNaN(n)) return '—'
  return n.toFixed(2)
}

function trialSearch(name: string): string {
  return `https://clinicaltrials.gov/search?term=${encodeURIComponent(name)}`
}

const COMPARE_METHODS = [
  { term: 'Mass', text: 'Catalog molecular weight when the monograph has one. Otherwise the average residue mass from the Design Lab table, plus one water. Missing sequence and missing mass both stay blank.' },
  { term: 'Charge and pI', text: 'Henderson–Hasselbalch with the Design Lab pKa set. A hypothesis, not a measured titration.' },
  { term: 'GRAVY and hydropathy', text: 'Kyte–Doolittle. The plot uses a 7-residue window and one shared vertical scale.' },
  { term: 'Sequence diff', text: 'Standard residues align as one-letter codes. Names the catalog does not map (linkers, unusual residues) stay visible and are marked instead of being dropped.' },
  { term: 'Verification date', text: 'The date this site last checked that slug against PubChem. It is not a ClinicalTrials.gov date and it is absent when the slug is not in the verification manifest.' },
]

const btn =
  'rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink/80 hover:border-accent hover:text-accent'
