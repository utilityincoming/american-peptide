import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookText } from 'lucide-react'
import { GLOSSARY, glossaryByCategory } from '@/lib/glossary'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Glossary — Terms & Definitions | AmericanPeptide.com',
  description:
    'Plain-language definitions of peptide research terms — reconstitution, GLP-1, GRAVY, half-life, GHRH, COA, and more. A reference glossary covering dosing, chemistry, mechanisms, identifiers, and regulatory concepts.',
  alternates: { canonical: `${SITE}/glossary` },
  openGraph: {
    title: 'Peptide Glossary — Terms & Definitions',
    description:
      'Plain-language definitions of peptide research terms across dosing, chemistry, mechanisms, identifiers, and regulatory concepts.',
    url: `${SITE}/glossary`,
    type: 'website',
  },
}

export default function GlossaryPage() {
  const groups = glossaryByCategory()

  const termSetLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Peptide Research Glossary',
    description: 'Definitions of peptide research terms.',
    url: `${SITE}/glossary`,
    hasDefinedTerm: GLOSSARY.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      url: `${SITE}/glossary/${t.slug}`,
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Glossary',
        item: `${SITE}/glossary`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termSetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <BookText className="h-4 w-4 text-accent" />
          Glossary
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
            Peptide research{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              glossary
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Plain-language definitions for the terms that come up across the
            catalog, calculator, and research guides — from reconstitution and
            GRAVY to GLP-1, GHRH, and Certificates of Analysis. {GLOSSARY.length}{' '}
            terms across {groups.length} categories.
          </p>
        </div>
      </section>

      {/* ── Category sections ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl space-y-12">
          {groups.map(({ meta, terms }) => (
            <div key={meta.id}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                {meta.label}
                <span className="ml-2 text-ink/25">{terms.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {terms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="group flex flex-col rounded-xl border border-ink/[0.07] bg-ink/[0.025] p-4 transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{t.term}</h3>
                      {t.abbr && t.abbr !== t.term && (
                        <span className="rounded border border-ink/[0.08] bg-ink/[0.03] px-1.5 py-px font-mono text-[9px] text-ink/45">
                          {t.abbr}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-ink/50">
                      {t.short}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
            <p className="text-[11px] leading-relaxed text-amber-400/65">
              <span className="font-semibold text-amber-400/85">
                Research use only.
              </span>{' '}
              Definitions are educational references, not medical advice or
              dosing guidance. Independent validation required for any
              experimental use.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/[0.06] px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/45">
            Looking for compounds instead of definitions?
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/20"
          >
            Browse the catalog
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
