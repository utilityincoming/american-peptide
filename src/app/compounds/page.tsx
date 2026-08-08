import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Database,
  Dna,
  FlaskConical,
  Layers,
} from 'lucide-react'
import { PEPTIDES, LISTED_PEPTIDES, CATEGORIES, type Peptide } from '@/lib/peptides'
import CompoundSearch from './CompoundSearch'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title:
    'Peptides & Compounds — Verified Monographs + PubChem Lookup | AmericanPeptide.com',
  description:
    'Look up any peptide or compound. Browse verified research monographs — mechanism, sequence, structure, molecular weight, and research context — or search PubChem’s full chemical database by name, formula, or synonym.',
  alternates: { canonical: `${SITE}/compounds` },
  openGraph: {
    title: 'Peptides & Compounds — Verified Monographs + PubChem Lookup',
    description:
      'Browse verified peptide monographs — mechanism, sequence, structure — or search PubChem for any compound. Free open reference.',
    url: `${SITE}/compounds`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptides & Compounds — Verified Monographs + PubChem Lookup',
    description:
      'Verified peptide monographs plus a live PubChem compound lookup. Free open reference from AmericanPeptide.com.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Peptides & Compounds',
  url: `${SITE}/compounds`,
  description:
    'A verified reference of research peptides plus a live lookup into the PubChem chemical database.',
  isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
  about: { '@type': 'Thing', name: 'Research peptides and chemical compounds' },
}

// ── Featured monographs: recognizable compounds first, topped up to a full row ──
const BY_SLUG = new Map(PEPTIDES.map((p) => [p.slug, p]))
const PREFERRED_FEATURED = [
  'semaglutide',
  'tirzepatide',
  'retatrutide',
  'bpc-157',
  'tesamorelin',
  'cagrilintide',
  'ipamorelin',
  'mots-c',
  'pt-141',
  'cjc-1295-no-dac',
  'melanotan-2',
  'tb-500',
]
const featured: Peptide[] = []
const featuredSeen = new Set<string>()
for (const slug of PREFERRED_FEATURED) {
  const p = BY_SLUG.get(slug)
  if (p && !featuredSeen.has(p.slug)) {
    featured.push(p)
    featuredSeen.add(p.slug)
  }
  if (featured.length >= 8) break
}
for (const p of LISTED_PEPTIDES) {
  if (featured.length >= 8) break
  if (!featuredSeen.has(p.slug)) {
    featured.push(p)
    featuredSeen.add(p.slug)
  }
}

// ── Full directory: every listed peptide once, grouped under its primary category ──
const grouped = CATEGORIES.map((c) => ({
  cat: c,
  items: LISTED_PEPTIDES.filter((p) => p.categories[0] === c.id).sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
})).filter((g) => g.items.length > 0)

export default function CompoundsPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <FlaskConical className="h-3 w-3" />
            Peptide reference &amp; compound lookup
          </div>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Every peptide, one lookup —{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              verified first.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Start with our verified monographs — {LISTED_PEPTIDES.length}{' '}
            research peptides with mechanism, sequence, structure, and the
            research
            context our team has reviewed. Need something beyond the catalog?
            Search PubChem&apos;s full chemical database further down the page.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/[0.12]"
            >
              <Layers className="h-4 w-4" />
              Browse the full catalog
            </Link>
            <a
              href="#pubchem-search"
              className="inline-flex items-center gap-2 rounded-xl border border-ink/10 px-5 py-2.5 text-sm font-medium text-ink/65 transition-colors hover:border-[#2DD4A8]/30 hover:text-ink"
            >
              <Database className="h-4 w-4 text-accent" />
              Search PubChem
            </a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        {/* ── Interactive tools ── */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/compounds/builder"
            className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-5 transition-all hover:border-[#2DD4A8]/35 hover:shadow-[0_8px_40px_rgba(45,212,168,0.08)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-accent">
              <Dna className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">PeptideForge</h2>
                <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                  Builder
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink/55">
                Build a peptide residue by residue — live chemistry, challenges,
                and XP.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/tools/design-lab"
            className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-ink/[0.08] bg-ink/[0.02] p-5 transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/[0.10] bg-ink/[0.04] text-accent">
              <FlaskConical className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">Design Lab</h2>
                <span className="rounded-full border border-ink/[0.12] bg-ink/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink/50">
                  Beta
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink/55">
                Sequence properties — pI, &epsilon;280, net charge, and
                synthesis-difficulty flags.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Featured monographs ── */}
        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                Featured monographs
              </h2>
              <p className="mt-1 text-sm text-ink/50">
                Verified reference entries — reviewed, sourced, and cross-checked
                against known chemistry.
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-[#5EEBC8] sm:inline-flex"
            >
              All {LISTED_PEPTIDES.length}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <MonographCard key={p.slug} peptide={p} />
            ))}
          </div>
        </section>

        {/* ── Full directory by category ── */}
        <section className="mb-16">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              Every compound, by category
            </h2>
            <p className="mt-1 text-sm text-ink/50">
              The complete verified index — {LISTED_PEPTIDES.length} entries
              across {grouped.length} research categories.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {grouped.map(({ cat, items }) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-5"
              >
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <Link
                    href={`/catalog/category/${cat.id}`}
                    className="text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    {cat.label}
                  </Link>
                  <span className="text-[11px] text-ink/30">
                    {items.length}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {items.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/catalog/${p.slug}`}
                        className="text-[13px] text-ink/55 transition-colors hover:text-accent hover:underline"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── PubChem live search ── */}
        <section id="pubchem-search" className="scroll-mt-6">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-ink/[0.10] bg-ink/[0.03] px-3 py-1 text-[11px] font-medium text-ink/45">
              <Database className="h-3 w-3 text-accent/70" />
              Beyond the catalog
            </div>
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              Search any compound in PubChem
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/50">
              For anything not yet in our reference, look it up directly in
              PubChem — the NIH open chemistry database — and pull its structure,
              molecular formula, and weight.
            </p>
          </div>

          <CompoundSearch />
        </section>

        {/* ── Research-use note ── */}
        <p className="mt-14 border-t border-ink/[0.06] pt-6 text-xs leading-relaxed text-ink/30">
          For research and educational reference only. Entries describe the
          scientific literature and are not medical advice, dosing guidance, or
          an offer to sell any compound.
        </p>
      </main>
    </div>
  )
}

function MonographCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.14)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2DD4A8]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {peptide.name}
          </h3>
          {peptide.aliases?.[0] && (
            <p className="mt-0.5 truncate text-xs text-ink/35">
              aka {peptide.aliases.join(', ')}
            </p>
          )}
        </div>
        {peptide.fdaApproved && (
          <span className="shrink-0 rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
            FDA
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink/55">
        {peptide.shortDescription}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {peptide.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="rounded-md border border-ink/[0.07] bg-ink/[0.03] px-2 py-0.5 text-[10px] text-ink/50"
          >
            {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-3 text-[11px] text-ink/30">
        <span>
          {peptide.molecularWeight
            ? `${peptide.molecularWeight.toLocaleString()} Da`
            : 'Reference entry'}
        </span>
        <span className="flex items-center gap-1 text-accent/70 transition-colors group-hover:text-accent">
          View
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
