import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, ArrowUpRight, Star, FlaskConical, Truck } from 'lucide-react'
import {
  vendorsRanked,
  trustScore,
  vendorTier,
  canSpotlight,
  shipsToLabel,
  VENDOR_TIERS,
} from '@/lib/vendors'

const SITE = 'https://americanpeptide.com'
const PATH = '/vendors'

export const metadata: Metadata = {
  title: 'Peptide Vendor Reviews — Scored on the Standard | AmericanPeptide.com',
  description:
    'Independent reviews of research-peptide vendors, each scored 0–100 on published transparency signals — third-party COAs, per-batch testing, purity, and policies. Ranked on evidence, never on commission.',
  alternates: { canonical: `${SITE}${PATH}` },
  keywords: [
    'peptide vendor reviews',
    'research peptide supplier reviews',
    'best peptide company reviews',
    'is it legit peptide vendor',
    'peptide company trust score',
    'american peptide company reviews',
  ],
  openGraph: {
    title: 'Peptide Vendor Reviews — Scored on the Standard',
    description:
      'Independent, evidence-based reviews of research-peptide vendors — scored on published COAs and testing, never on commission.',
    url: `${SITE}${PATH}`,
    type: 'website',
  },
}

export default function VendorsIndexPage() {
  const vendors = vendorsRanked() // [] on the reference-only Play (TWA) build

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Peptide Vendor Reviews',
    url: `${SITE}${PATH}`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: vendors.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${v.name} review`,
        url: `${SITE}/vendors/${v.id}`,
      })),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Vendor reviews', item: `${SITE}${PATH}` },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">Vendor reviews</span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <ShieldCheck className="h-3 w-3" />
            Independent reviews{vendors.length > 0 ? ` · ${vendors.length} scored` : ''}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Peptide vendor{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              reviews
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            An independent review of each research-peptide vendor we list — scored
            on the same 100-point Standard as the rest of the site, from the lab
            evidence and policies they actually publish. Never ranked by commission.
          </p>
          <p className="mt-3 text-xs text-ink/30">
            Research reference only. AmericanPeptide does not sell peptides.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        {vendors.length === 0 ? (
          <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-6">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
              <FlaskConical className="h-4 w-4 text-accent" />
            </div>
            <p className="mb-1 text-sm font-semibold text-accent">Reference edition</p>
            <p className="mb-4 text-sm leading-relaxed text-ink/50">
              This edition is a research reference only — no vendor listings.
              AmericanPeptide never sells peptides; the scored vendor reviews are
              available on the web.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-relaxed text-ink/55">
              Ranked by transparency score, strongest first. Each review breaks down
              exactly how the score is earned — and what to watch for. Reviews score
              vendors on evidence, not marketing; a supplier can never buy a better
              number.
            </p>
            <div className="space-y-4">
              {vendors.map((v) => {
                const score = trustScore(v)
                const tier = vendorTier(v)
                const tierMeta = VENDOR_TIERS.find((t) => t.id === tier)!
                const featured = canSpotlight(v) && (v.spotlight?.length ?? 0) > 0
                return (
                  <Link
                    key={v.id}
                    href={`/vendors/${v.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-ink/[0.08] bg-ink/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04] sm:flex-row sm:items-center"
                  >
                    <div
                      className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(45,212,168,0.10)' }}
                    >
                      <span className="text-2xl font-bold text-accent">{score}</span>
                      <span className="text-[8px] uppercase tracking-wide text-ink/35">/100</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-ink/90 transition-colors group-hover:text-ink">
                          {v.name}
                        </p>
                        <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[10px] font-medium text-accent">
                          {tierMeta.label}
                        </span>
                        {featured && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-amber-300">
                            <Star className="h-2.5 w-2.5" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="mb-2 line-clamp-2 text-[13px] leading-relaxed text-ink/55">
                        {v.blurb}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-ink/40">
                        <span className="inline-flex items-center gap-1">
                          <Truck className="h-2.5 w-2.5" /> {shipsToLabel(v)}
                        </span>
                        {v.trust.purityPct && (
                          <span className="inline-flex items-center gap-1">
                            <FlaskConical className="h-2.5 w-2.5" /> ≥{v.trust.purityPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent/70 transition-colors group-hover:text-accent">
                      Read review
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { href: '/us-peptides', label: 'The scored directory', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                { href: '/methodology', label: 'How the score works', icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
                { href: '/tools/coa-decoder', label: 'Decode a COA', icon: <FlaskConical className="h-3.5 w-3.5" /> },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                >
                  {l.icon}
                  {l.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
