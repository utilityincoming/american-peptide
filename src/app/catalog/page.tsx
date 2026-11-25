'use client'

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  FlaskConical,
  GitCompareArrows,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  PEPTIDES,
  LISTED_PEPTIDES,
  BROWSE_SPOTLIGHT,
  CATEGORIES,
  CATALOG_COUNT,
  CATEGORY_COUNT,
  CATALOG_FDA_APPROVED_COUNT,
  SYNTHESIS_DIFFICULTY_LABEL,
  type Peptide,
  type SyntheticFeature,
  type SynthesisDifficulty,
} from '@/lib/peptides'
import { createCatalogMatcher, normalizeCatalogQuery } from '@/lib/catalog-query'
import CatalogMotif from '@/components/CatalogMotif'
import OfflineReference from '@/components/OfflineReference'

const MAX_COMPARE = 4
const STORAGE_KEY = 'amp-catalog-compare-selected'
const VIEW_MODE_KEY = 'amp-catalog-view-mode'

// Synthetic-feature facet — derived once from the catalog so the chip row stays
// in sync with the data. Ordered by how many peptides carry each feature.
const FEATURES: SyntheticFeature[] = (() => {
  const counts = new Map<SyntheticFeature, number>()
  for (const p of PEPTIDES)
    for (const f of p.syntheticFeatures ?? [])
      counts.set(f, (counts.get(f) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f)
})()

const DIFFICULTIES: SynthesisDifficulty[] = ['standard', 'moderate', 'demanding']

const matchesBrowseQuery = createCatalogMatcher(false)

const FILTER_CHANGE = 'amp-catalog-filter-change'

function subscribeToFilters(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(FILTER_CHANGE, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(FILTER_CHANGE, onChange)
  }
}

function getFilterSearch() {
  return window.location.search
}

function getServerFilterSearch() {
  return ''
}

function updateFilters(
  changes: Partial<Record<'q' | 'category' | 'synthesis' | 'difficulty', string | null>>,
  history: 'push' | 'replace' = 'push',
) {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(changes)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  if (url.href === window.location.href) return

  if (history === 'push') window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
  window.dispatchEvent(new Event(FILTER_CHANGE))
}

export default function CatalogPage() {
  const search = useSyncExternalStore(
    subscribeToFilters,
    getFilterSearch,
    getServerFilterSearch,
  )
  const params = new URLSearchParams(search)
  const query = params.get('q') ?? ''
  const category = normalizeCatalogQuery(params.get('category'))
  const active = CATEGORIES.find((c) => c.id === category)?.id ?? null
  const feature = FEATURES.find((f) => f === params.get('synthesis')) ?? null
  const difficulty = DIFFICULTIES.find((d) => d === params.get('difficulty')) ?? null
  const [synthesisOverride, setSynthesisOverride] = useState<boolean | null>(null)
  const synthesisOpen = synthesisOverride ?? Boolean(feature || difficulty)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string[]>([])

  const updateViewMode = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      const savedMode = window.localStorage.getItem(VIEW_MODE_KEY)
      if (savedMode === 'grid' || savedMode === 'list') {
        setViewMode(savedMode)
      }
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const valid = parsed
          .filter((s): s is string => typeof s === 'string')
          .filter((s) => PEPTIDES.some((p) => p.slug === s))
          .slice(0, MAX_COMPARE)
        setSelected(valid)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    } catch {
      /* ignore */
    }
  }, [selected])

  const toggleSelected = useCallback((slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, slug]
    })
  }, [])

  const clearSelected = useCallback(() => setSelected([]), [])

  const filtered = useMemo(() => {
    const q = normalizeCatalogQuery(query)
    // Browse (no query) shows the curated, listed set. A text query searches
    // the full catalog so unlisted entries stay findable by name/alias.
    const source = q ? PEPTIDES : LISTED_PEPTIDES
    return source.filter((p) => {
      if (active && !p.categories.includes(active)) return false
      if (feature && !(p.syntheticFeatures ?? []).includes(feature)) return false
      if (difficulty && p.synthesisDifficulty !== difficulty) return false
      if (!q) return true
      return matchesBrowseQuery(p, q)
    })
  }, [query, active, feature, difficulty])

  function clearFilters() {
    updateFilters({ q: null, category: null, synthesis: null, difficulty: null })
  }

  const hasFilters = Boolean(normalizeCatalogQuery(query) || active || feature || difficulty)
  const atCap = selected.length >= MAX_COMPARE

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-hairline px-6 py-8 md:px-10 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(126,224,181,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
              <Sparkles className="h-3 w-3" />
              Peptide research reference
            </div>
            <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              Research peptide catalog
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
              Browse a curated reference of {CATALOG_COUNT} research peptides. Each entry
              captures mechanism, sequence, structure, and the research areas it’s
              studied for — with manufacturing and quality context from the synthesis guide.
            </p>

            {/* In-section features, surfaced on the page instead of a sub-nav.
                Compare also works inline — tick peptides below to stack the bar. */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalog/compare"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline-strong px-5 py-2.5 text-sm font-medium text-ink/65 transition-colors hover:border-accent/30 hover:text-ink"
              >
                <GitCompareArrows className="h-4 w-4 text-accent" />
                Compare side-by-side
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline-strong px-5 py-2.5 text-sm font-medium text-ink/65 transition-colors hover:border-accent/30 hover:text-ink"
              >
                <LayoutGrid className="h-4 w-4 text-accent" />
                Research Workspace
              </Link>
            </div>
          </div>

          {/* Decorative molecular-chain graphic + catalog snapshot */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-fill/80 p-5 backdrop-blur">
              <svg
                aria-hidden
                viewBox="0 0 360 180"
                className="h-40 w-full"
                fill="none"
              >
                <defs>
                  <linearGradient id="amp-bond" x1="0" y1="0" x2="360" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7EE0B5" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#7EE0B5" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#D2FBE6" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Backbone wave */}
                <path
                  d="M24 120 C 64 40, 110 40, 150 96 C 190 152, 236 152, 276 80 C 300 38, 326 42, 340 64"
                  stroke="url(#amp-bond)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Secondary hydrogen-bond / disulfide arcs */}
                <path
                  d="M68 68 Q 150 18 232 122"
                  stroke="#7EE0B5"
                  strokeOpacity="0.22"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                />
                <path
                  d="M110 56 Q 180 140 276 80"
                  stroke="#D2FBE6"
                  strokeOpacity="0.18"
                  strokeWidth="1.25"
                  strokeDasharray="3 4"
                />
                {/* Residue nodes */}
                {[
                  { cx: 24, cy: 120, r: 5, accent: false },
                  { cx: 68, cy: 68, r: 7, accent: true },
                  { cx: 110, cy: 56, r: 5, accent: false },
                  { cx: 150, cy: 96, r: 8, accent: true },
                  { cx: 192, cy: 136, r: 5, accent: false },
                  { cx: 232, cy: 122, r: 7, accent: true },
                  { cx: 276, cy: 80, r: 8, accent: true },
                  { cx: 316, cy: 48, r: 5, accent: false },
                  { cx: 340, cy: 64, r: 4, accent: false },
                ].map((n, i) => (
                  <g key={i}>
                    {n.accent && (
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r={n.r + 6}
                        fill="#7EE0B5"
                        fillOpacity="0.10"
                      />
                    )}
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r={n.r}
                      fill={n.accent ? '#7EE0B5' : '#0E1512'}
                      stroke="#7EE0B5"
                      strokeOpacity={n.accent ? 0.9 : 0.45}
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-hairline pt-3 text-center">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-ink">
                    {CATALOG_COUNT}
                  </div>
                  <div className="text-[11px] text-ink/50">Entries</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-ink">
                    {CATEGORY_COUNT}
                  </div>
                  <div className="text-[11px] text-ink/50">Categories</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-accent">
                    {CATALOG_FDA_APPROVED_COUNT}
                  </div>
                  <div className="text-[11px] text-ink/50">FDA-approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="border-b border-hairline bg-surface/95 px-6 py-4 md:sticky md:top-0 md:z-30 md:px-10">
        <div className="mx-auto max-w-6xl space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
            <input
              type="search"
              value={query}
              onChange={(e) => updateFilters({ q: e.target.value || null })}
              aria-label="Search name or alias"
              placeholder="Search name or alias"
              className="w-full rounded-xl border border-hairline bg-fill py-3 pl-10 pr-10 text-sm text-ink placeholder:text-ink/55 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-[#7EE0B5]/40"
            />
            {query && (
              <button
                onClick={() => updateFilters({ q: null })}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <Chip active={active === null} onClick={() => updateFilters({ category: null })}>
              All
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={active === c.id}
                onClick={() => updateFilters({ category: c.id })}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          {/* Synthesis facet stays closed until asked. A deep link that
              already names a grade or feature opens it. */}
          <div>
            <button
              type="button"
              aria-expanded={synthesisOpen}
              onClick={() => setSynthesisOverride(!synthesisOpen)}
              className={
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ' +
                (synthesisOpen || difficulty || feature
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-hairline bg-fill text-ink/55 hover:border-hairline-strong hover:text-ink')
              }
            >
              <FlaskConical className="h-3 w-3" />
              Synthesis
              {difficulty ? ` · ${SYNTHESIS_DIFFICULTY_LABEL[difficulty]}` : ''}
              {feature ? ` · ${feature}` : ''}
            </button>
            {synthesisOpen && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <Chip
                    key={d}
                    active={difficulty === d}
                    onClick={() => updateFilters({ difficulty: difficulty === d ? null : d })}
                  >
                    {SYNTHESIS_DIFFICULTY_LABEL[d]}
                  </Chip>
                ))}
                <span
                  aria-hidden
                  className="mx-1 h-4 w-px shrink-0 self-center bg-ink/10"
                />
                <Chip active={feature === null} onClick={() => updateFilters({ synthesis: null })}>
                  Any feature
                </Chip>
                {FEATURES.map((f) => (
                  <Chip
                    key={f}
                    active={feature === f}
                    onClick={() => updateFilters({ synthesis: feature === f ? null : f })}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section
        className={
          selected.length > 0
            ? 'px-6 pb-28 pt-12 md:px-10'
            : 'px-6 py-12 md:px-10'
        }
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/55">
            <span>
              {query || active || feature || difficulty
                ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}${
                    active
                      ? ` in ${CATEGORIES.find((c) => c.id === active)?.label}`
                      : ''
                  }${
                    difficulty
                      ? ` · ${SYNTHESIS_DIFFICULTY_LABEL[difficulty]} synthesis`
                      : ''
                  }${feature ? ` with ${feature}` : ''}`
                : `${filtered.length} peptide${filtered.length === 1 ? '' : 's'}`}
            </span>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <button
                  onClick={() =>
                    updateFilters({
                      q: null,
                      category: null,
                      synthesis: null,
                      difficulty: null,
                    })
                  }
                  className="text-accent/80 transition-colors hover:text-accent"
                >
                  Clear filters
                </button>
              )}
              <div
                role="group"
                aria-label="View mode"
                className="inline-flex items-center rounded-lg border border-hairline bg-fill p-0.5"
              >
                <button
                  type="button"
                  onClick={() => updateViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Grid view"
                  className={
                    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ' +
                    (viewMode === 'grid'
                      ? 'bg-accent/15 text-accent'
                      : 'text-ink/50 hover:text-ink')
                  }
                >
                  <LayoutGrid className="h-3 w-3" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => updateViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="Compact list view"
                  className={
                    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ' +
                    (viewMode === 'list'
                      ? 'bg-accent/15 text-accent'
                      : 'text-ink/50 hover:text-ink')
                  }
                >
                  <List className="h-3 w-3" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section
        className={
          selected.length > 0
            ? 'px-6 pb-28 pt-6 md:px-10'
            : 'px-6 py-6 md:px-10'
        }
      >
        <div className="mx-auto max-w-6xl">
          <OfflineReference />

          {active && (
            <Link
              href={`/catalog/category/${active}`}
              className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/15 bg-accent/[0.04] px-4 py-3 transition-colors hover:border-accent/30 hover:bg-accent/[0.07]"
            >
              <span className="text-sm text-ink/65">
                Read the full{' '}
                <span className="font-semibold text-accent">
                  {CATEGORIES.find((c) => c.id === active)?.label}
                </span>{' '}
                research guide — mechanisms, themes & FAQ
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-accent" />
            </Link>
          )}

          {filtered.length === 0 ? (
            <EmptyState query={query.trim()} onClear={clearFilters} />
          ) : (
            <div className="space-y-10">
              {groupBrowse(filtered).map((group) => {
                const cat = CATEGORIES.find((c) => c.label === group.label)
                return (
                  <div key={group.label}>
                    <div className="mb-4 flex items-center gap-3">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
                        {group.label}
                      </h2>
                      <span className="rounded-full border border-hairline bg-fill px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink/50">
                        {group.items.length}
                      </span>
                      <div className="h-px flex-1 bg-hairline" />
                      {cat && (
                        <Link
                          href={`/catalog/category/${cat.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent/75 transition-colors hover:text-accent"
                        >
                          Guide
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    {viewMode === 'grid' ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((p) => {
                          const isSelected = selected.includes(p.slug)
                          return (
                            <PeptideCard
                              key={p.slug}
                              peptide={p}
                              selected={isSelected}
                              disableAdd={atCap && !isSelected}
                              onToggle={() => toggleSelected(p.slug)}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-fill">
                        {group.items.map((p) => {
                          const isSelected = selected.includes(p.slug)
                          return (
                            <PeptideListRow
                              key={p.slug}
                              peptide={p}
                              selected={isSelected}
                              disableAdd={atCap && !isSelected}
                              onToggle={() => toggleSelected(p.slug)}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-14 border-t border-hairline pt-10">
            <OfflineReference />
          </div>
        </div>
      </section>

      <CompareBar
        selected={selected}
        onRemove={toggleSelected}
        onClear={clearSelected}
      />
    </div>
  )
}

const SPOTLIGHT = new Set<string>(BROWSE_SPOTLIGHT)

function groupBrowse(list: Peptide[]): { label: string; items: Peptide[] }[] {
  const groups: { label: string; items: Peptide[] }[] = []
  for (const peptide of list) {
    const label = SPOTLIGHT.has(peptide.slug)
      ? 'Commonly studied'
      : (CATEGORIES.find((c) => c.id === peptide.categories[0])?.label ?? 'Other')
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(peptide)
    else groups.push({ label, items: [peptide] })
  }
  return groups
}

function PeptideCard({
  peptide,
  selected,
  disableAdd,
  onToggle,
}: {
  peptide: Peptide
  selected: boolean
  disableAdd: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={
        'relative flex h-full flex-col gap-3 rounded-2xl border bg-fill p-5 transition-colors ' +
        (selected
          ? 'border-accent/55 bg-accent/[0.05]'
          : 'border-hairline hover:border-accent/25 hover:bg-fill-strong')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            <Link
              href={`/catalog/${peptide.slug}`}
              aria-label={`View ${peptide.name}`}
              className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-current after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
            >
              {peptide.name}
            </Link>
          </h3>
          {peptide.aliases?.[0] && (
            <p className="mt-0.5 text-xs text-ink/70">aka {peptide.aliases[0]}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disableAdd}
          aria-pressed={selected}
          aria-label={
            selected
              ? `Remove ${peptide.name} from comparison`
              : disableAdd
              ? `Comparison full (max ${MAX_COMPARE})`
              : `Add ${peptide.name} to comparison`
          }
          className={
            'relative z-20 inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors ' +
            (selected
              ? 'border-accent/45 bg-accent/15 text-accent'
              : disableAdd
              ? 'cursor-not-allowed border-hairline bg-fill text-ink/25'
              : 'border-hairline-strong bg-fill-strong text-ink/55 hover:border-accent/40 hover:text-accent')
          }
        >
          {selected ? (
            <>
              <Check className="h-3 w-3" />
              Compare
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              Compare
            </>
          )}
        </button>
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink/55">
          {peptide.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {peptide.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-md border border-hairline bg-fill px-2 py-0.5 text-[10px] text-ink/50"
            >
              {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline pt-3 text-[11px] text-ink/55">
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="truncate">
              {peptide.molecularWeight
                ? `${peptide.molecularWeight.toLocaleString()} Da`
                : 'Reference entry'}
            </span>
            {peptide.fdaApproved && (
              <span className="shrink-0 rounded-md border border-accent/25 bg-accent/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                FDA
              </span>
            )}
            {peptide.synthesisDifficulty && (
              <span className="shrink-0 rounded-md border border-hairline bg-fill px-1.5 py-0.5 text-[9px] font-medium text-ink/50">
                {SYNTHESIS_DIFFICULTY_LABEL[peptide.synthesisDifficulty]}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-accent/70 transition-colors group-hover:text-accent">
            View
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

      {BROWSE_SPOTLIGHT.some((slug) => slug === peptide.slug) && peptide.categories[0] && (
        <CatalogMotif category={peptide.categories[0]} className="block h-auto w-32 text-accent" />
      )}

      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-hairline pb-3 text-xs text-ink/75">
        {peptide.categories.slice(0, 3).map((cat) => (
          <li key={cat}>{CATEGORIES.find((c) => c.id === cat)?.label ?? cat}</li>
        ))}
        <li className="font-mono tabular-nums">
          {peptide.molecularWeight
            ? `${peptide.molecularWeight.toLocaleString()} Da`
            : 'Reference entry'}
        </li>
        {peptide.fdaApproved && (
          <li className="rounded-md border border-accent/25 bg-accent/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-accent">
            FDA approved
          </li>
        )}
      </ul>

      <p className="line-clamp-3 text-[13px] leading-relaxed text-ink/75">
        {peptide.shortDescription}
      </p>
    </div>
  )
}

function PeptideListRow({
  peptide,
  selected,
  disableAdd,
  onToggle,
}: {
  peptide: Peptide
  selected: boolean
  disableAdd: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={
        'group relative flex items-center gap-4 px-4 py-3 transition-colors hover:bg-fill-strong ' +
        (selected ? 'bg-accent/[0.05]' : '')
      }
    >
      <Link
        href={`/catalog/${peptide.slug}`}
        aria-label={`View ${peptide.name}`}
        className="absolute inset-0 z-0"
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-tight text-ink">
              {peptide.name}
            </span>
            {peptide.fdaApproved && (
              <span className="shrink-0 rounded-md border border-accent/25 bg-accent/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                FDA
              </span>
            )}
            {peptide.synthesisDifficulty && (
              <span className="hidden shrink-0 rounded-md border border-hairline bg-fill px-1.5 py-0.5 text-[9px] font-medium text-ink/50 sm:inline-block">
                {SYNTHESIS_DIFFICULTY_LABEL[peptide.synthesisDifficulty]}
              </span>
            )}
          </div>
          {peptide.aliases?.[0] && (
            <p className="truncate text-[11px] text-ink/50">
              aka {peptide.aliases[0]}
            </p>
          )}
        </div>

        <span className="hidden shrink-0 text-xs tabular-nums text-ink/55 md:inline-block">
          {peptide.molecularWeight
            ? `${peptide.molecularWeight.toLocaleString()} Da`
            : 'Reference'}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={disableAdd}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Remove ${peptide.name} from comparison`
            : disableAdd
            ? `Comparison full (max ${MAX_COMPARE})`
            : `Add ${peptide.name} to comparison`
        }
        className={
          'relative z-20 inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors ' +
          (selected
            ? 'border-accent/45 bg-accent/15 text-accent'
            : disableAdd
            ? 'cursor-not-allowed border-hairline bg-fill text-ink/25'
            : 'border-hairline-strong bg-fill-strong text-ink/55 hover:border-accent/40 hover:text-accent')
        }
      >
        {selected ? (
          <>
            <Check className="h-3 w-3" />
            Compare
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" />
            Compare
          </>
        )}
      </button>
    </div>
  )
}

function CompareBar({
  selected,
  onRemove,
  onClear,
}: {
  selected: string[]
  onRemove: (slug: string) => void
  onClear: () => void
}) {
  if (selected.length === 0) return null
  const canCompare = selected.length >= 2
  const peptides = selected
    .map((s) => PEPTIDES.find((p) => p.slug === s))
    .filter((p): p is Peptide => Boolean(p))

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 md:px-10">
        <div className="flex items-center gap-2 text-xs text-ink/55">
          <GitCompareArrows className="h-4 w-4 text-accent" />
          <span className="font-medium text-ink/80">
            Compare ({selected.length}/{MAX_COMPARE})
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {peptides.map((p) => (
            <span
              key={p.slug}
              className="inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-fill-strong py-0.5 pl-2 pr-1 text-[11px] text-ink/75"
            >
              {p.name}
              <button
                type="button"
                onClick={() => onRemove(p.slug)}
                aria-label={`Remove ${p.name}`}
                className="rounded p-0.5 text-ink/55 transition-colors hover:bg-fill-strong hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-1.5 text-xs text-ink/50 transition-colors hover:bg-fill-strong hover:text-ink"
          >
            Clear
          </button>
          {canCompare ? (
            <Link
              href={`/catalog/compare?ids=${selected.join(',')}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7EE0B5] px-4 py-1.5 text-xs font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
            >
              Compare
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span
              aria-disabled
              className="cursor-not-allowed rounded-lg border border-hairline bg-fill px-4 py-1.5 text-xs font-medium text-ink/55"
              title="Select at least 2 peptides to compare"
            >
              Compare
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-medium text-accent transition-colors'
          : 'rounded-full border border-hairline bg-fill px-3 py-1 text-xs text-ink/55 transition-colors hover:border-hairline-strong hover:text-ink'
      }
    >
      {children}
    </button>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-fill px-6 py-12 text-center">
      <p className="break-words text-sm font-medium text-ink">
        {query ? `No results for “${query}”` : 'No peptides match these filters.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 rounded-lg border border-hairline-strong px-4 py-2 text-sm text-accent hover:bg-fill-strong"
        >
        Reset all filters
        </button>
    </div>
  )
}
