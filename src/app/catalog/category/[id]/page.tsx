import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  FlaskConical,
  HelpCircle,
  Layers,
} from 'lucide-react'
import {
  CATEGORIES,
  getCategoryLabel,
  getPeptidesByCategory,
  type Peptide,
  type PeptideCategory,
} from '@/lib/peptides'
import { getCategoryContent } from '@/lib/category-content'
import WaitlistForm from '@/components/WaitlistForm'

const SITE = 'https://americanpeptide.com'

interface RouteParams {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }))
}

function resolve(id: string) {
  const meta = CATEGORIES.find((c) => c.id === id)
  if (!meta) return null
  const cat = meta.id as PeptideCategory
  return {
    meta,
    content: getCategoryContent(cat),
    peptides: getPeptidesByCategory(cat),
  }
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params
  const r = resolve(id)
  if (!r) return { title: 'Not Found' }

  const title =
    r.content?.metaTitle ??
    `${r.meta.label} Peptides — Catalog | AmericanPeptide.com`
  const description = r.content?.metaDescription ?? r.meta.blurb

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/catalog/category/${r.meta.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/catalog/category/${r.meta.id}`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: RouteParams) {
  const { id } = await params
  const r = resolve(id)
  if (!r) notFound()

  const { meta, content, peptides } = r

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content?.heading ?? `${meta.label} Peptides`,
    description: content?.metaDescription ?? meta.blurb,
    url: `${SITE}/catalog/category/${meta.id}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'AmericanPeptide.com',
      url: SITE,
    },
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

  const faqLd = content?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faqs.map((f) => ({
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
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/catalog"
          className="text-sm text-white/35 transition-colors hover:text-white"
        >
          Catalog
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">{meta.label}</span>
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
            Catalog category · {peptides.length} entr
            {peptides.length === 1 ? 'y' : 'ies'}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {content?.heading ?? `${meta.label} Peptides`}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            {content?.tagline ?? meta.blurb}
          </p>
          {content?.intro && (
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/60">
              {content.intro}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-12">
            {/* How this class works */}
            {content?.howItWorks && content.howItWorks.length > 0 && (
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                  How this class works
                </h2>
                <div className="space-y-4">
                  {content.howItWorks.map((para, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-white/65"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Peptides in this category */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                {meta.label} peptides in the catalog
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {peptides.map((p) => (
                  <CategoryPeptideCard key={p.slug} peptide={p} />
                ))}
              </div>
            </div>

            {/* Waitlist */}
            <WaitlistForm
              source={`category:${meta.id}`}
              variant="compact"
              heading={`Track new ${meta.label.toLowerCase()} listings`}
              description="One email when the first vetted suppliers list in this category. No other mail."
            />

            {/* FAQ */}
            {content?.faqs && content.faqs.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {content.faqs.map((f) => (
                    <div
                      key={f.q}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                    >
                      <h3 className="mb-2 text-sm font-semibold text-white/85">
                        {f.q}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/55">
                        {f.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {content?.researchThemes &&
              content.researchThemes.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Research themes
                  </h3>
                  <ul className="space-y-2.5">
                    {content.researchThemes.map((t) => (
                      <li
                        key={t}
                        className="flex gap-2 text-[13px] leading-snug text-white/65"
                      >
                        <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2DD4A8]/70" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Other categories */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Browse other categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter((c) => c.id !== meta.id).map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalog/category/${c.id}`}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-amber-400/65">
                <span className="font-semibold text-amber-400/85">
                  Research use only.
                </span>{' '}
                Educational reference, not medical advice, a dosing protocol,
                or an offer for sale. Independent validation required for any
                experimental use.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

function CategoryPeptideCard({ peptide }: { peptide: Peptide }) {
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
