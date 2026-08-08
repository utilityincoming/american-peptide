import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, freshnessProps, WEBSITE_ID } from '@/lib/schema'
import { ArrowRight, ArrowLeft, HelpCircle, Layers } from 'lucide-react'
import { CATEGORIES, type Peptide } from '@/lib/peptides'
import {
  RESEARCH_AREAS,
  getResearchAreaBySlug,
  getPeptidesForArea,
} from '@/lib/research-areas'
import AgentPrompt from '@/components/AgentPrompt'
import EvidenceContext from '@/components/EvidenceContext'
import Toolkit from '@/components/Toolkit'
import LastUpdated from '@/components/LastUpdated'

const SITE = 'https://americanpeptide.com'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return RESEARCH_AREAS.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const area = getResearchAreaBySlug(slug)
  if (!area) return { title: 'Not Found' }
  return {
    title: area.metaTitle,
    description: area.metaDescription,
    alternates: { canonical: `${SITE}/research-areas/${area.slug}` },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      url: `${SITE}/research-areas/${area.slug}`,
      type: 'article',
    },
  }
}

export default async function ResearchAreaPage({ params }: RouteParams) {
  const { slug } = await params
  const area = getResearchAreaBySlug(slug)
  if (!area) notFound()

  const peptides = getPeptidesForArea(area)
  const others = RESEARCH_AREAS.filter((a) => a.slug !== area.slug)

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${area.label} Peptides`,
    description: area.metaDescription,
    url: `${SITE}/research-areas/${area.slug}`,
    isPartOf: { '@id': WEBSITE_ID },
    ...freshnessProps(area.updated),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: peptides.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `${SITE}/catalog/${p.slug}`,
      })),
    },
  }

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Research areas', path: '/research-areas' },
    { name: area.label, path: `/research-areas/${area.slug}` },
  ])

  const faqLd = area.faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: area.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

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
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/research-areas"
          className="text-sm text-ink/35 transition-colors hover:text-ink"
        >
          Research areas
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">{area.label}</span>
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
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <Layers className="h-3 w-3" />
            Research area · {peptides.length} peptide
            {peptides.length === 1 ? '' : 's'}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {area.label}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            {area.tagline}
          </p>
          <LastUpdated date={area.updated} className="mt-4 text-[11px] text-ink/35" />
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Overview
              </h2>
              <div className="space-y-4">
                {area.intro.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink/65">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Peptides */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Peptides studied in {area.label.toLowerCase()}
              </h2>
              {peptides.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {peptides.map((p) => (
                    <AreaPeptideCard key={p.slug} peptide={p} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink/40">
                  No catalog entries mapped yet.
                </p>
              )}
            </div>

            {/* FAQ */}
            {area.faqs.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {area.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink/85">
                        {f.q}
                        <span className="text-ink/30 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-ink/55">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual education — evidence primer + area-scoped key terms */}
            <EvidenceContext
              areaSlugs={[area.slug]}
              moreLinks={[{ href: '/research-areas', label: 'All research areas' }]}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related categories */}
            {area.relatedCategories.length > 0 && (
              <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Related catalog categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {area.relatedCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/catalog/category/${cat}`}
                      className="rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1 text-xs text-ink/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                    >
                      {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other research areas */}
            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Other research areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {others.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/research-areas/${a.slug}`}
                    className="rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1 text-xs text-ink/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/research-areas"
              className="flex items-center gap-1.5 text-xs text-ink/45 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All research areas
            </Link>

            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-amber-400/65">
                <span className="font-semibold text-amber-400/85">
                  Research use only.
                </span>{' '}
                Educational reference, not medical advice, a dosing protocol, or
                an offer for sale. Independent validation required for any
                experimental use.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-ink/[0.06] px-6 py-12 md:px-10">
        <Toolkit className="mx-auto max-w-5xl" />
      </section>

      <section className="border-t border-ink/[0.06] px-6 py-12 md:px-10">
        <AgentPrompt
          className="mx-auto max-w-5xl"
          context={{ kind: 'research-area', slug: area.slug }}
          heading={`Ask the Agent about ${area.label}`}
          subhead={`Which peptides are best studied for ${area.label.toLowerCase()}, how they compare, and what the clinical evidence shows — citation-backed answers grounded in PubMed, PubChem, and ClinicalTrials.gov.`}
          examples={[
            `Which peptides are best studied for ${area.label.toLowerCase()}?`,
            `What does the clinical evidence show for ${area.label.toLowerCase()}?`,
            `Compare the leading options for ${area.label.toLowerCase()}.`,
          ]}
        />
      </section>
    </div>
  )
}

function AreaPeptideCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group flex flex-col rounded-xl border border-ink/[0.07] bg-ink/[0.025] p-4 transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold">{peptide.name}</h3>
        {peptide.fdaApproved && (
          <span className="shrink-0 rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-accent">
            FDA
          </span>
        )}
      </div>
      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-ink/50">
        {peptide.shortDescription}
      </p>
      <span className="flex items-center gap-1 text-[11px] text-accent/70 transition-colors group-hover:text-accent">
        View profile
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
