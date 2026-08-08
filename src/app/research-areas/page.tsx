import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Activity, Compass, FlaskConical } from 'lucide-react'
import { RESEARCH_AREAS, getPeptidesForArea } from '@/lib/research-areas'
import Toolkit from '@/components/Toolkit'
import LearnMore from '@/components/LearnMore'
import AgentPrompt from '@/components/AgentPrompt'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Research Areas — Indication Guide | AmericanPeptide.com',
  description:
    'Browse research peptides by what they’re studied for — weight loss, wound healing, cognition, longevity, growth hormone, immune modulation, and more. Mechanism, references, and catalog entries for each indication.',
  alternates: { canonical: `${SITE}/research-areas` },
  openGraph: {
    title: 'Peptide Research Areas — Indication Guide',
    description:
      'Browse research peptides by indication: weight loss, wound healing, cognition, longevity, growth hormone, immune modulation, and more.',
    url: `${SITE}/research-areas`,
    type: 'website',
  },
}

export default function ResearchAreasPage() {
  const areas = RESEARCH_AREAS.map((a) => ({
    area: a,
    count: getPeptidesForArea(a).length,
  }))

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Peptide Research Areas',
    description:
      'Research peptides organized by indication and use case.',
    url: `${SITE}/research-areas`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: areas.map(({ area }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: area.label,
        url: `${SITE}/research-areas/${area.slug}`,
      })),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Research areas',
        item: `${SITE}/research-areas`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Compass className="h-4 w-4 text-accent" />
          Research areas
        </span>
      </header>

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
        <div className="relative mx-auto max-w-5xl">
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Browse peptides by{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              research area
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Where the catalog organizes peptides by mechanism, these guides
            organize them by what they’re studied for — the indication or
            use case. Each area covers the underlying biology, the peptide
            classes involved, and links to every matching catalog entry.
          </p>
        </div>
      </section>

      {/* ── Lead feature: Peptide Agent ── */}
      <section className="px-6 pt-12 md:px-10">
        <AgentPrompt className="mx-auto max-w-5xl" />
      </section>

      {/* ── Grid ── */}
      <section className="px-6 py-12 md:px-10">
        <h2 className="mx-auto mb-5 max-w-5xl text-lg font-semibold tracking-tight md:text-xl">
          Browse by indication
        </h2>
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map(({ area, count }) => (
            <Link
              key={area.slug}
              href={`/research-areas/${area.slug}`}
              className="group flex flex-col rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.12)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-ink/40">
                  <FlaskConical className="h-3.5 w-3.5 text-accent/70" />
                  {count} peptide{count === 1 ? '' : 's'}
                </span>
              </div>
              <h2 className="mb-1.5 text-base font-semibold tracking-tight">
                {area.label}
              </h2>
              <p className="mb-4 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink/50">
                {area.tagline}
              </p>
              <span className="flex items-center gap-1 text-[11px] text-accent/70 transition-colors group-hover:text-accent">
                Read guide
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <LearnMore className="mx-auto mt-14 max-w-5xl" />

        <Toolkit className="mx-auto mt-14 max-w-5xl" />

        {/* Clinical trials — the pipeline behind the research areas */}
        <Link
          href="/trials"
          className="group mx-auto mt-14 flex max-w-5xl items-center gap-4 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-accent">
            <Activity className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-ink/90">Track the clinical pipeline</h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink/50">
              See which peptides are in active human trials — live intelligence from ClinicalTrials.gov.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
            Clinical Trials
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <div className="mx-auto mt-14 max-w-5xl rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-amber-400/65">
            <span className="font-semibold text-amber-400/85">
              Research use only.
            </span>{' '}
            These guides are educational references, not medical advice, dosing
            protocols, or offers for sale. Independent validation required for
            any experimental use.
          </p>
        </div>
      </section>
    </div>
  )
}
