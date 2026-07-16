import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd } from '@/lib/schema'
import { ArrowLeft, ArrowRight, BookText, FlaskConical } from 'lucide-react'
import { getPeptideBySlug } from '@/lib/peptides'
import { getResearchAreaBySlug } from '@/lib/research-areas'
import {
  GLOSSARY,
  GLOSSARY_CATEGORY_BY_ID,
  getGlossaryTerm,
  resolveRelatedTerms,
} from '@/lib/glossary'

const SITE = 'https://americanpeptide.com'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const term = getGlossaryTerm(slug)
  if (!term) return { title: 'Not Found' }

  const title = `${term.term} — Peptide Glossary | AmericanPeptide.com`
  const url = `${SITE}/glossary/${term.slug}`
  return {
    title,
    description: term.short,
    alternates: { canonical: url },
    openGraph: { title, description: term.short, url, type: 'article' },
  }
}

export default async function GlossaryTermPage({ params }: RouteParams) {
  const { slug } = await params
  const term = getGlossaryTerm(slug)
  if (!term) notFound()

  const url = `${SITE}/glossary/${term.slug}`
  const categoryMeta = GLOSSARY_CATEGORY_BY_ID[term.category]
  const relatedTerms = resolveRelatedTerms(term)

  // Resolve cross-links defensively — unknown slugs simply drop out.
  const relatedPeptides = (term.relatedPeptides ?? [])
    .map((s) => getPeptideBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const relatedAreas = (term.relatedAreas ?? [])
    .map((s) => getResearchAreaBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  const definedTermLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    url,
    ...(term.aliases?.length ? { alternateName: term.aliases } : {}),
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Peptide Research Glossary',
      url: `${SITE}/glossary`,
    },
  }

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Glossary', path: '/glossary' },
    { name: term.term, path: `/glossary/${term.slug}` },
  ])

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/glossary"
          className="flex items-center gap-1.5 text-sm text-ink/35 transition-colors hover:text-ink"
        >
          <BookText className="h-4 w-4" />
          Glossary
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">{term.term}</span>
      </header>

      {/* ── Definition ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/glossary"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink/40 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All terms
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-ink/[0.07] bg-ink/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/50">
              {categoryMeta.label}
            </span>
            {term.abbr && term.abbr !== term.term && (
              <span className="rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
                {term.abbr}
              </span>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {term.term}
          </h1>

          {term.aliases && term.aliases.length > 0 && (
            <p className="mb-5 text-sm text-ink/45">
              Also called {term.aliases.join(' · ')}
            </p>
          )}

          <p className="text-lg leading-relaxed text-ink/75">
            {term.definition}
          </p>

          {/* Related glossary terms */}
          {relatedTerms.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Related terms
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {relatedTerms.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/glossary/${r.slug}`}
                    className="rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1 text-xs text-ink/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                  >
                    {r.term}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cross-links into research areas */}
          {relatedAreas.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Research guides
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {relatedAreas.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/research-areas/${a.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1 text-xs text-ink/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                  >
                    <FlaskConical className="h-3 w-3 text-accent/70" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cross-links into catalog peptides */}
          {relatedPeptides.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Related peptides
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedPeptides.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/catalog/${p.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-ink/[0.07] bg-ink/[0.025] p-3 transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
                  >
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent/70 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
            <p className="text-[11px] leading-relaxed text-amber-400/65">
              <span className="font-semibold text-amber-400/85">
                Research use only.
              </span>{' '}
              This definition is an educational reference, not medical advice or
              dosing guidance.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
