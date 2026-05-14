'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, FlaskConical, ShieldCheck, Sparkles, X } from 'lucide-react'
import {
  PEPTIDES,
  CATEGORIES,
  type Peptide,
  type PeptideCategory,
} from '@/lib/peptides'

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<PeptideCategory | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PEPTIDES.filter((p) => {
      if (active && !p.categories.includes(active)) return false
      if (!q) return true
      const hay = [p.name, p.shortDescription, ...(p.aliases ?? [])]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, active])

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
        <span className="text-white/20">/</span>
        <span className="text-sm font-medium">Catalog</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
            <Sparkles className="h-3 w-3" />
            Catalog preview · Marketplace launching soon
          </div>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            The peptide reference catalog,
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              built for research transparency.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Browse a curated reference of {PEPTIDES.length}+ research peptides. Each entry
            captures mechanism, sequence, and research areas — and is structured to plug
            into supplier listings, certificates of analysis, and transparent pricing as
            the marketplace comes online.
          </p>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TrustItem
              Icon={ShieldCheck}
              title="Supplier vetting"
              body="Future suppliers undergo identity, COA, and dispute-resolution checks before listing."
            />
            <TrustItem
              Icon={FlaskConical}
              title="COA repository"
              body="Each variant will link to third-party certificates of analysis on file."
            />
            <TrustItem
              Icon={Sparkles}
              title="Transparent pricing"
              body="Per-mg pricing across suppliers, refreshed continuously — no DMs required."
            />
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B1220]/85 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto max-w-6xl space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search peptides, aliases, or research areas…"
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus:border-[#2DD4A8]/40 focus:outline-none focus:ring-1 focus:ring-[#2DD4A8]/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

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
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-center justify-between text-xs text-white/40">
            <span>
              {filtered.length} result{filtered.length === 1 ? '' : 's'}
              {active ? ` in ${CATEGORIES.find((c) => c.id === active)?.label}` : ''}
            </span>
            {(query || active) && (
              <button
                onClick={() => {
                  setQuery('')
                  setActive(null)
                }}
                className="text-[#2DD4A8]/80 transition-colors hover:text-[#2DD4A8]"
              >
                Reset filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PeptideCard key={p.slug} peptide={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function PeptideCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:border-[#2DD4A8]/25 hover:bg-white/[0.04] hover:shadow-[0_8px_40px_rgba(45,212,168,0.06)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2DD4A8]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {peptide.name}
          </h3>
          {peptide.aliases?.[0] && (
            <p className="mt-0.5 truncate text-xs text-white/35">
              aka {peptide.aliases.join(', ')}
            </p>
          )}
        </div>
        {peptide.fdaApproved && (
          <span className="shrink-0 rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
            FDA
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-white/55">
        {peptide.shortDescription}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {peptide.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/50"
          >
            {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-white/30">
        <span>
          {peptide.molecularWeight
            ? `${peptide.molecularWeight.toLocaleString()} Da`
            : 'Reference entry'}
        </span>
        <span className="flex items-center gap-1 text-[#2DD4A8]/70 transition-colors group-hover:text-[#2DD4A8]">
          View
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
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
          ? 'rounded-full border border-[#2DD4A8]/40 bg-[#2DD4A8]/15 px-3 py-1 text-xs font-medium text-[#2DD4A8] transition-colors'
          : 'rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/55 transition-colors hover:border-white/15 hover:text-white'
      }
    >
      {children}
    </button>
  )
}

function TrustItem({
  Icon,
  title,
  body,
}: {
  Icon: typeof ShieldCheck
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.08] text-[#2DD4A8]">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-white/45">{body}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-16 text-center">
      <p className="text-sm text-white/50">No peptides match those filters.</p>
      <p className="mt-1 text-xs text-white/30">
        Try a broader search or reset the category filter.
      </p>
    </div>
  )
}
