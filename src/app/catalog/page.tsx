'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { sendGAEvent } from '@next/third-parties/google'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FlaskConical,
  GitCompareArrows,
  LayoutGrid,
  Search,
  X,
} from 'lucide-react'
import {
  PEPTIDES,
  LISTED_PEPTIDES,
  BROWSE_SPOTLIGHT,
  CATEGORIES,
  SYNTHESIS_DIFFICULTY_LABEL,
  type Peptide,
  type PeptideCategory,
  type SyntheticFeature,
  type SynthesisDifficulty,
} from '@/lib/peptides'
import CatalogMotif from '@/components/CatalogMotif'
import OfflineReference from '@/components/OfflineReference'
import { getVendor, isAffiliate, vendorHref } from '@/lib/vendors'

const MAX_COMPARE = 4
const STORAGE_KEY = 'amp-catalog-compare-selected'
const ABSIM = getVendor('absim-peptides')

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

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<PeptideCategory | null>(null)
  const [feature, setFeature] = useState<SyntheticFeature | null>(null)
  const [difficulty, setDifficulty] = useState<SynthesisDifficulty | null>(null)
  const [synthesisOpen, setSynthesisOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    try {
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

  // Deep-link support: arrive from a chip via ?synthesis=<feature> and/or
  // ?difficulty=<grade> (synthesis page counts, compare badges, detail chips).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const f = params.get('synthesis')
      if (f && FEATURES.includes(f as SyntheticFeature)) {
        setFeature(f as SyntheticFeature)
        setSynthesisOpen(true)
      }
      const d = params.get('difficulty')
      if (d && DIFFICULTIES.includes(d as SynthesisDifficulty)) {
        setDifficulty(d as SynthesisDifficulty)
        setSynthesisOpen(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Keep the URL in sync so the active facets are shareable and survive reload.
  const selectFeature = useCallback((f: SyntheticFeature | null) => {
    setFeature(f)
    try {
      const url = new URL(window.location.href)
      if (f) url.searchParams.set('synthesis', f)
      else url.searchParams.delete('synthesis')
      window.history.replaceState(null, '', url)
    } catch {
      /* ignore */
    }
  }, [])

  const selectDifficulty = useCallback((d: SynthesisDifficulty | null) => {
    setDifficulty(d)
    try {
      const url = new URL(window.location.href)
      if (d) url.searchParams.set('difficulty', d)
      else url.searchParams.delete('difficulty')
      window.history.replaceState(null, '', url)
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
    const q = query.trim().toLowerCase()
    // Browse (no query) shows the curated, listed set. A text query searches
    // the full catalog so unlisted entries stay findable by name/alias.
    const source = q ? PEPTIDES : LISTED_PEPTIDES
    return source.filter((p) => {
      if (active && !p.categories.includes(active)) return false
      if (feature && !(p.syntheticFeatures ?? []).includes(feature)) return false
      if (difficulty && p.synthesisDifficulty !== difficulty) return false
      if (!q) return true
      const hay = [p.name, p.shortDescription, ...(p.aliases ?? [])]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, active, feature, difficulty])

  function clearFilters() {
    setQuery('')
    setActive(null)
    selectFeature(null)
    selectDifficulty(null)
  }

  const hasFilters = Boolean(query.trim() || active || feature || difficulty)
  const atCap = selected.length >= MAX_COMPARE

  return (
    <div className="min-h-screen bg-surface text-ink">
      <section className="border-b border-hairline px-6 py-7 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Research peptide catalog
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65 md:text-base">
            Search by name, alias, or words in a short description. Compare sequences, molecular weights, and research evidence.
          </p>
          <div className="relative mt-4 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
            <input
              type="search"
              aria-label="Search name or alias"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or alias"
              className="w-full rounded-xl border border-hairline bg-fill py-3 pl-10 pr-10 text-sm text-ink placeholder:text-ink/55 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-[#7EE0B5]/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* In-section features, surfaced on the page instead of a sub-nav.
              Compare also works inline — tick peptides below to stack the bar. */}
          <div className="mt-4 flex flex-wrap gap-2">
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
          {ABSIM && isAffiliate(ABSIM) && (
            <div className="mt-4 flex flex-col items-start gap-1">
              <a
                href={vendorHref(ABSIM)}
                rel="sponsored nofollow noopener"
                target="_blank"
                aria-describedby="absim-catalog-disclosure"
                onClick={() => sendGAEvent('event', 'affiliate_click', {
                  vendor: 'absim-peptides',
                  placement: 'catalog_intro',
                })}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.08] px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Browse research compounds at ABSIM
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
              <p id="absim-catalog-disclosure" className="text-xs leading-relaxed text-ink/65">
                We may earn a commission if you purchase through this link.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="border-b border-hairline bg-surface/95 px-6 py-4 md:sticky md:top-0 md:z-30 md:px-10">
        <div className="mx-auto max-w-6xl space-y-3">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <Chip active={active === null} onClick={() => setActive(null)}>
              All
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={active === c.id}
                onClick={() => setActive(c.id)}
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
              onClick={() => setSynthesisOpen((open) => !open)}
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
                    onClick={() => selectDifficulty(difficulty === d ? null : d)}
                  >
                    {SYNTHESIS_DIFFICULTY_LABEL[d]}
                  </Chip>
                ))}
                <span
                  aria-hidden
                  className="mx-1 h-4 w-px shrink-0 self-center bg-ink/10"
                />
                <Chip active={feature === null} onClick={() => selectFeature(null)}>
                  Any feature
                </Chip>
                {FEATURES.map((f) => (
                  <Chip
                    key={f}
                    active={feature === f}
                    onClick={() => selectFeature(feature === f ? null : f)}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
            <span role="status">
              {hasFilters
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
            {hasFilters && filtered.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-accent/80 transition-colors hover:text-accent"
              >
                Clear filters
              </button>
            )}
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
              {groupBrowse(filtered).map((group) => (
                <div key={group.label}>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                    {group.label}
                  </h2>
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
                </div>
              ))}
            </div>
          )}
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
            'relative z-10 inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
            (selected
              ? 'border-accent/45 bg-accent/15 text-accent'
              : disableAdd
              ? 'cursor-not-allowed border-hairline bg-fill text-ink/40'
              : 'border-hairline-strong bg-fill-strong text-ink/75 hover:border-accent/40 hover:text-accent')
          }
        >
          {selected && <Check className="h-3 w-3" aria-hidden="true" />}
          Compare
        </button>
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
        Clear filters
      </button>
    </div>
  )
}
