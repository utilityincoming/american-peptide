import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, HelpCircle, Layers } from 'lucide-react'
import { CATEGORIES, type Peptide } from '@/lib/peptides'
import {
  RESEARCH_AREAS,
  getResearchAreaBySlug,
  getPeptidesForArea,
} from '@/lib/research-areas'
import EvidenceContext from '@/components/EvidenceContext'
import Toolkit from '@/components/Toolkit'

const SITE = 'https://www.americanpeptide.com'

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
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: area.label,
        item: `${SITE}/research-areas/${area.slug}`,
      },
    ],
  }

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
    <div className="min-h-screen bg-[#0B1220] text-white">
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
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/research-areas"
          className="text-sm text-white/35 transition-colors hover:text-white"
        >
          Research areas
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">{area.label}</span>
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
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
            <Layers className="h-3 w-3" />
            Research area · {peptides.length} peptide
            {peptides.length === 1 ? '' : 's'}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {area.label}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            {area.tagline}
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Overview
              </h2>
              <div className="space-y-4">
                {area.intro.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-white/65">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Peptides */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Peptides studied in {area.label.toLowerCase()}
              </h2>
              {peptides.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {peptides.map((p) => (
                    <AreaPeptideCard key={p.slug} peptide={p} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">
                  No catalog entries mapped yet.
                </p>
              )}
            </div>

            {/* FAQ */}
            {area.faqs.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {area.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-white/85">
                        {f.q}
                        <span className="text-white/30 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-white/55">
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
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Related catalog categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {area.relatedCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/catalog/category/${cat}`}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                    >
                      {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other research areas */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Other research areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {others.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/research-areas/${a.slug}`}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/research-areas"
              className="flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white"
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

      <section className="border-t border-white/[0.06] px-6 py-12 md:px-10">
        <Toolkit className="mx-auto max-w-5xl" />
      </section>
    </div>
  )
}

function AreaPeptideCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all hover:border-[#2DD4A8]/25 hover:bg-white/[0.04]"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold">{peptide.name}</h3>
        {peptide.fdaApproved && (
          <span className="shrink-0 rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
            FDA
          </span>
        )}
      </div>
      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-white/50">
        {peptide.shortDescription}
      </p>
      <span className="flex items-center gap-1 text-[11px] text-[#2DD4A8]/70 transition-colors group-hover:text-[#2DD4A8]">
        View profile
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
