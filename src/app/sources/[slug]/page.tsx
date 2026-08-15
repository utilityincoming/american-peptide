import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, Layers } from 'lucide-react'
import { getPeptideBySlug, PEPTIDES } from '@/lib/peptides'
import { PUBCHEM_VERIFIED } from '@/lib/verification'
import { molecularFormulaClaim, molecularWeightClaim } from '@/lib/evidence'
import { vendorPurityClaim } from '@/lib/evidence/from-vendors'
import { computeEvidenceFloor, type Claim } from '@/lib/evidence/types'
import { getVendorsForPeptide, hasSourcingPage } from '@/lib/vendors'
import { TierBadge, EvidenceFloor } from '@/components/evidence'
import SourceComparison from '@/components/SourceComparison'

const SITE = 'https://americanpeptide.com'

// A sourcing page earns its place only where there's a real field to rank — a
// compound at least two vendors carry. amino-club (peptides: 'all') covers every
// compound, so the threshold selects those a second vendor also stocks (today,
// the ABSIM catalog). Single-vendor compounds would render a one-row "ranking",
// so they 404 (dynamicParams=false) rather than ship thin sourcing pages. The
// /sources index, the sitemap, and the monograph's "Sources by evidence tier"
// link all gate on the same hasSourcingPage(), so no link points at a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return PEPTIDES.filter((p) => hasSourcingPage(p.slug)).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = getPeptideBySlug(slug)
  if (!p) return {}
  return {
    title: `${p.name} — Sources by Evidence Tier | AmericanPeptide.com`,
    description: `Where to source ${p.name}, ranked by the provenance tier of each vendor's purity claim — a third-party COA outranks a vendor-reported number — with PubChem-verified chemistry and COA freshness. A trust layer, not a store.`,
    alternates: { canonical: `${SITE}/sources/${slug}` },
    openGraph: {
      title: `${p.name} — Sources by Evidence Tier`,
      description: `Vendors for ${p.name}, ranked by the provenance tier of each purity claim, never by commission.`,
      url: `${SITE}/sources/${slug}`,
      type: 'article',
    },
  }
}

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)
  if (!peptide) notFound()

  const verification = PUBCHEM_VERIFIED[slug]
  const identityClaims: Claim[] = []
  if (verification) {
    const mw = molecularWeightClaim(verification)
    const mf = molecularFormulaClaim(verification)
    if (mw) identityClaims.push(mw)
    if (mf) identityClaims.push(mf)
  }

  const vendors = getVendorsForPeptide(slug)
  // The sourcing floor is the weakest LOAD-BEARING claim — the vendor purities,
  // not the reference-grade chemistry above them.
  const floor = computeEvidenceFloor(vendors.map(vendorPurityClaim))

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: peptide.name, item: `${SITE}/catalog/${slug}` },
      { '@type': 'ListItem', position: 3, name: 'Sources', item: `${SITE}/sources/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
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
        <Link
          href={`/catalog/${slug}`}
          className="text-sm text-ink/35 transition-colors hover:text-ink"
        >
          {peptide.name}
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
            Where to source · ranked by evidence tier
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {peptide.name} sources,
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              tiered by what backs the claim
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            AmericanPeptide doesn&rsquo;t sell {peptide.name}. It ranks where to
            get it by one thing: the provenance tier of each vendor&rsquo;s purity
            claim. A vendor that publishes an independent, per-batch COA backs a{' '}
            <em>third-party</em> claim; one that only states its own number backs a{' '}
            <em>vendor-reported</em> one. Same scale as the rest of the site —{' '}
            <Link href="/methodology" className="text-accent hover:underline">
              the Standard
            </Link>
            .
          </p>
          {floor && (
            <div className="mt-6">
              <EvidenceFloor floor={floor} />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-10">
        {/* Verified chemistry — reference tier (real data) */}
        {verification && identityClaims.length > 0 && (
          <section className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
            <div className="mb-4 flex items-center gap-2">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Verified chemistry · reference tier
              </h2>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {identityClaims.map((c) => (
                <div key={c.field}>
                  <p className="text-[11px] uppercase tracking-wide text-ink/40">
                    {c.field === 'molecular_weight' ? 'Molecular weight' : 'Molecular formula'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-ink/85">
                      {c.value}
                      {c.unit ? ` ${c.unit}` : ''}
                    </span>
                    <TierBadge claim={c} showDate />
                  </div>
                </div>
              ))}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink/40">PubChem</p>
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${verification.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-accent hover:underline"
                >
                  CID {verification.cid}
                </a>
              </div>
            </div>
          </section>
        )}

        {/* The ranked comparison */}
        <section>
          <div className="mb-5">
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              <Layers className="h-3.5 w-3.5 text-accent" />
              Every source, in tier order
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-ink/55">
              Ranked by the tier of each vendor&rsquo;s purity claim, strongest
              first; within a tier, by transparency score. We show every source and
              do not average purities across vendors — a median across a
              third-party COA and a self-reported number is a figure belonging to
              neither. The paid partner, where present, is disclosed at its honest
              tier, not pinned above it.
            </p>
          </div>
          <SourceComparison slug={slug} />
        </section>

        {/* Disclaimer */}
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
            { href: `/catalog/${slug}`, label: `${peptide.name} in the catalog` },
            { href: '/sources', label: 'Every ranked source' },
            { href: '/methodology', label: 'How the tiers work — the Standard' },
            { href: '/tools/coa-decoder', label: 'Decode a COA' },
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
