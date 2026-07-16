import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, GitCompare } from 'lucide-react'
import { COMPARISONS } from '@/lib/comparisons'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Comparisons — Head-to-Head Research Guides | AmericanPeptide.com',
  description:
    'Side-by-side research comparisons of peptides — mechanism, clinical-trial evidence, and key differences, each cross-referenced to verified PubChem chemistry.',
  alternates: { canonical: `${SITE}/compare` },
  openGraph: {
    title: 'Peptide Comparisons — Head-to-Head Research Guides',
    description:
      'Side-by-side research comparisons of peptides — mechanism, trial evidence, and key differences.',
    url: `${SITE}/compare`,
    type: 'website',
  },
}

export default function CompareIndexPage() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Peptide Comparisons',
    url: `${SITE}/compare`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: COMPARISONS.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${c.aName} vs ${c.bName}`,
        url: `${SITE}/compare/${c.slug}`,
      })),
    },
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <GitCompare className="h-4 w-4 text-accent" />
          Comparisons
        </span>
      </header>

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
            Head-to-head{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              peptide comparisons
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Mechanism, clinical-trial evidence, and the differences that actually
            matter — each comparison cross-referenced to verified PubChem chemistry
            and the science behind how to read the evidence.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.12)]"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span style={{ color: '#2DD4A8' }}>{c.aName}</span>
                <span className="text-ink/25">vs</span>
                <span style={{ color: '#818CF8' }}>{c.bName}</span>
              </div>
              <p className="mb-5 flex-1 text-[13px] leading-relaxed text-ink/50">
                {c.headline.charAt(0).toUpperCase() + c.headline.slice(1)}.
              </p>
              <span className="flex items-center gap-1 text-[11px] text-accent/70 transition-colors group-hover:text-accent">
                Read comparison
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
