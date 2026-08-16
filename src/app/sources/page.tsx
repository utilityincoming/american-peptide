import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Layers, ShieldCheck } from 'lucide-react'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'
import { getVendorsForPeptide, hasSourcingPage, SOURCING_PAGE_MIN_VENDORS } from '@/lib/vendors'
import { vendorPurityClaim } from '@/lib/evidence/from-vendors'
import { computeEvidenceFloor } from '@/lib/evidence/types'
import { EvidenceFloor } from '@/components/evidence'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Sources by Evidence Tier | AmericanPeptide.com',
  description:
    'Every compound with a ranked sourcing page, ordered by the provenance tier of each vendor purity claim — a third-party COA outranks a vendor-reported number. A trust layer over the sourcing market, not a store.',
  alternates: { canonical: `${SITE}/sources` },
  openGraph: {
    title: 'Peptide Sources by Evidence Tier',
    description:
      'Where to source, ranked by what backs each purity claim — never by commission.',
    url: `${SITE}/sources`,
    type: 'website',
  },
}

/**
 * The sourcing index. Its job is discovery: /sources/<slug> pages are otherwise
 * reachable only from the matching monograph, so the aggregator's whole surface
 * sat unlinked and unindexed. Membership is derived from the same
 * `hasSourcingPage` gate the slug pages generate from, so this list can never
 * advertise a page that 404s.
 */
export default function SourcesIndexPage() {
  const sourced = PEPTIDES.filter((p) => hasSourcingPage(p.slug))

  // Empty only on the Play (TWA) build, where getVendorsForPeptide returns [] —
  // matching the slug pages, which generate no static params there.
  if (sourced.length === 0) notFound()

  const entries = sourced.map((p) => {
    const vendors = getVendorsForPeptide(p.slug)
    return {
      peptide: p,
      vendorCount: vendors.length,
      // Same floor the slug page shows: the weakest LOAD-BEARING claim, which
      // for sourcing is the vendor purities — not reference-grade chemistry.
      floor: computeEvidenceFloor(vendors.map(vendorPurityClaim)),
    }
  })

  // Each compound files under its primary category so nothing lists twice.
  const grouped: { id: string; label: string; blurb: string; items: typeof entries }[] =
    CATEGORIES.map((c) => ({
      id: c.id as string,
      label: c.label,
      blurb: c.blurb,
      items: entries.filter((e) => e.peptide.categories[0] === c.id),
    })).filter((g) => g.items.length > 0)

  // Anything whose primary category isn't in CATEGORIES still gets a home.
  const placed = new Set(grouped.flatMap((g) => g.items.map((i) => i.peptide.slug)))
  const ungrouped = entries.filter((e) => !placed.has(e.peptide.slug))

  const sections = [
    ...grouped,
    ...(ungrouped.length > 0
      ? [{ id: 'other', label: 'Other', blurb: '', items: ungrouped }]
      : []),
  ]

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Peptide sources by evidence tier',
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${e.peptide.name} sources`,
      url: `${SITE}/sources/${e.peptide.slug}`,
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Sources', item: `${SITE}/sources` },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <header className="flex flex-wrap items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">Sources</span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <Layers className="h-3 w-3" />
            The sourcing index · ranked by evidence tier
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Every source we rank,
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              and what stands behind it
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            AmericanPeptide sells nothing. It reads what each vendor actually
            publishes and ranks them by one thing: the provenance tier of the
            purity claim. An independent, per-batch COA backs a{' '}
            <em>third-party</em> claim; a vendor&rsquo;s own number backs a{' '}
            <em>vendor-reported</em> one. Same scale as the chemistry, the
            monographs, and everything else here —{' '}
            <Link href="/methodology" className="text-accent hover:underline">
              the Standard
            </Link>
            .
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/[0.08] bg-ink/[0.03] px-3 py-1 text-[11px] text-ink/50">
            <ShieldCheck className="h-3 w-3 text-accent" />
            {entries.length} compound{entries.length === 1 ? '' : 's'} with a
            ranked field of sources
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-10">
        {sections.map(({ id, label, blurb, items }) => (
          <section key={id}>
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                {label}
              </h2>
              {blurb && (
                <p className="mt-1 text-xs leading-relaxed text-ink/35">{blurb}</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(({ peptide, vendorCount, floor }) => (
                <Link
                  key={peptide.slug}
                  href={`/sources/${peptide.slug}`}
                  className="group flex flex-col justify-between gap-3 rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-4 transition-colors hover:border-[#2DD4A8]/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-ink/85 transition-colors group-hover:text-accent">
                        {peptide.name}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-ink/35">
                        {vendorCount} sources
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/45">
                      {peptide.shortDescription}
                    </p>
                  </div>
                  {floor && <EvidenceFloor floor={floor} showDistribution={false} />}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Why the list is this length — the gate, stated rather than hidden */}
        <section className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5 text-xs leading-relaxed text-ink/45">
          <strong className="text-ink/65">Why some compounds aren&rsquo;t here.</strong>{' '}
          A sourcing page earns its place only where there is a real field to
          rank — a compound at least {SOURCING_PAGE_MIN_VENDORS} tracked vendors
          carry. Below that, a &ldquo;ranking&rdquo; is one row wearing a
          leaderboard&rsquo;s clothes, so we publish nothing rather than dress up
          a single listing. The list grows as the vendor directory does, and a
          compound joins it the moment a second source is documented — never
          because a vendor paid to appear.
        </section>

        {/* Disclaimer — mirrors the slug pages */}
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-xs leading-relaxed text-ink/45">
          <strong className="text-ink/60">Research reference only.</strong> Purity
          tiers reflect each vendor&rsquo;s own published transparency signals unless
          an independent COA is on file, and are not certification. Always request
          and match the third-party COA for your specific lot before any use. This
          is not medical advice, dosing guidance, or an offer for sale.
        </section>

        {/* Related */}
        <section className="flex flex-wrap gap-3">
          {[
            { href: '/methodology', label: 'How the tiers work — the Standard' },
            { href: '/us-peptides', label: 'The vendor directory' },
            { href: '/tools/coa-decoder', label: 'Decode a COA' },
            { href: '/catalog', label: 'The full catalog' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
            >
              {l.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
