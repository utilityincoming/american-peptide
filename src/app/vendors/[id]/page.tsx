import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ShieldCheck,
  Check,
  Minus,
  Info,
  ArrowUpRight,
  ArrowRight,
  Truck,
  FlaskConical,
  Star,
  Package,
} from 'lucide-react'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import {
  getVendor,
  vendorsRanked,
  trustScore,
  vendorTier,
  trustSignals,
  vendorHref,
  isAffiliate,
  canSpotlight,
  shipsToLabel,
  hasSourcingPage,
  VENDOR_TIERS,
  type Vendor,
} from '@/lib/vendors'
import { getPeptideBySlug } from '@/lib/peptides'

const SITE = 'https://americanpeptide.com'

// Only vendors in the directory resolve; anything else 404s. vendorsRanked()
// returns [] on the reference-only Play (TWA) build, so the whole /vendors/[id]
// space simply does not exist there — matching the directory's behavior.
export const dynamicParams = false

export function generateStaticParams() {
  return vendorsRanked().map((v) => ({ id: v.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const v = getVendor(id)
  if (!v) return {}
  const score = trustScore(v)
  const path = `/vendors/${v.id}`
  return {
    title: `${v.name} Review — Trust Score ${score}/100, COAs & Shipping | AmericanPeptide.com`,
    description: `An independent review of ${v.name}, scored ${score}/100 on our transparency Standard — third-party COAs, per-batch testing, purity, and shipping and refund policies. Ranked on published evidence, never on commission.`,
    alternates: { canonical: `${SITE}${path}` },
    keywords: [
      `${v.name} review`,
      `${v.name} reviews`,
      `is ${v.name} legit`,
      `${v.name} COA`,
      `${v.name} peptides`,
      'peptide vendor review',
      'research peptide supplier',
    ],
    openGraph: {
      title: `${v.name} Review — Scored ${score}/100 on the Standard`,
      description: `Independent, evidence-based review of ${v.name}: COAs, testing, purity, and policies — never ranked by commission.`,
      url: `${SITE}${path}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${v.name} Review | AmericanPeptide.com`,
      description: `${v.name} scored ${score}/100 on our published transparency Standard.`,
    },
  }
}

const A = '#2DD4A8'

export default async function VendorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const v = getVendor(id)
  if (!v) notFound()

  const score = trustScore(v)
  const tier = vendorTier(v)
  const tierMeta = VENDOR_TIERS.find((t) => t.id === tier)!
  const signals = trustSignals(v)
  const affiliate = isAffiliate(v)
  const featured = canSpotlight(v) && (v.spotlight?.length ?? 0) > 0
  const href = vendorHref(v)

  // Data-driven verdict — composed from what the vendor actually earns, so a new
  // vendor gets an honest summary without hand-written prose. The per-vendor
  // nuance lives in v.notes, which is authored from their own published terms.
  const verdictLead = `${v.name} scores ${score} of 100 on our Standard, placing it in the ${tierMeta.label} tier. ${v.blurb}`

  // Compounds it carries: broad-catalog vendors ('all') get a framing + catalog
  // link; explicit lists render as monograph chips, sourcing pages flagged.
  const carried =
    v.peptides === 'all'
      ? null
      : v.peptides
          .map((slug) => ({ slug, p: getPeptideBySlug(slug) }))
          .filter((x): x is { slug: string; p: NonNullable<typeof x.p> } => Boolean(x.p))

  const others = vendorsRanked().filter((o) => o.id !== v.id)

  const reviewLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Organization',
      name: v.name,
      url: v.url,
    },
    author: {
      '@type': 'Organization',
      name: 'AmericanPeptide.com',
      url: SITE,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: score,
      bestRating: 100,
      worstRating: 0,
      alternateName: tierMeta.label,
    },
    reviewBody: verdictLead,
    url: `${SITE}/vendors/${v.id}`,
    publisher: { '@type': 'Organization', name: 'AmericanPeptide.com', url: SITE },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Vendor reviews', item: `${SITE}/vendors` },
      { '@type': 'ListItem', position: 3, name: v.name, item: `${SITE}/vendors/${v.id}` },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <header className="flex flex-wrap items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <Link href="/vendors" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Vendor reviews
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">{v.name}</span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
                <ShieldCheck className="h-3 w-3" />
                Independent review
              </span>
              {featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-3 py-1 text-[11px] font-medium text-amber-300">
                  <Star className="h-3 w-3" /> Featured partner · paid placement
                </span>
              )}
            </div>
            <h1 className="mb-3 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              {v.name} review
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-ink/55 md:text-base">
              {v.blurb}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-ink/45">
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-2.5 py-0.5">
                <Truck className="h-3 w-3" /> {shipsToLabel(v)}
              </span>
              {v.trust.purityPct && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-2.5 py-0.5">
                  <FlaskConical className="h-3 w-3" /> ≥{v.trust.purityPct}% stated purity
                </span>
              )}
            </div>
          </div>

          {/* Score badge */}
          <div className="flex shrink-0 flex-col items-center rounded-2xl border border-ink/[0.08] bg-ink/[0.03] px-8 py-6">
            <div className="flex items-baseline gap-0.5">
              <span className="text-5xl font-bold text-accent">{score}</span>
              <span className="text-lg font-medium text-ink/40">/100</span>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-ink/40">The Standard</p>
            <span className="mt-3 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-medium text-accent">
              {tierMeta.label}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-10">
        {/* Verdict */}
        <section className="rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent/80">
            The verdict
          </h2>
          <p className="text-sm leading-relaxed text-ink/70">{verdictLead}</p>
          {v.notes && (
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink/55">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" strokeWidth={2} />
              <span>{v.notes}</span>
            </p>
          )}
        </section>

        {/* Featured (paid) disclosure — labeled, honest tier still shown above */}
        {featured && v.spotlightNote && (
          <section className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-5">
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-amber-300" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                Why they hold the featured slot
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-ink/65">{v.spotlightNote}</p>
            <p className="mt-3 text-[11px] leading-relaxed text-ink/40">
              This is a paid placement. It buys position, not a better score — the{' '}
              {score}/100 above is earned from published evidence exactly like every
              other vendor&rsquo;s, and it never moves the ranking on{' '}
              <Link href="/us-peptides" className="text-accent hover:underline">
                the directory
              </Link>
              .
            </p>
          </section>
        )}

        {/* Scorecard */}
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/40">
            How the {score}/100 breaks down
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-ink/55">
            Every point is earned from a transparency signal {v.name} publishes —
            weighted by what actually protects a researcher. A vendor cannot buy a
            better score;{' '}
            <Link href="/methodology" className="text-accent hover:underline">
              the Standard
            </Link>{' '}
            is the same for everyone.
          </p>

          {/* Segmented bar: earned segments colored, missing ones faint */}
          <div className="mb-6 flex h-3.5 w-full overflow-hidden rounded-full border border-ink/10">
            {signals.map((s) => (
              <div
                key={s.key}
                style={{
                  width: `${s.pts}%`,
                  backgroundColor: s.earned ? s.color : 'transparent',
                  opacity: s.earned ? 1 : 0.12,
                  boxShadow: s.earned ? 'none' : 'inset 0 0 0 999px rgba(148,163,184,0.25)',
                }}
                title={`${s.label} — ${s.pts} pts ${s.earned ? '(earned)' : '(not published)'}`}
              />
            ))}
          </div>

          <div className="space-y-3">
            {signals.map((s) => (
              <div
                key={s.key}
                className="flex items-start gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4"
                style={s.earned ? undefined : { opacity: 0.6 }}
              >
                <div
                  className="mt-0.5 flex h-7 w-11 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: s.earned ? `${s.color}1A` : 'rgba(148,163,184,0.10)',
                    color: s.earned ? s.color : '#94A3B8',
                  }}
                >
                  {s.pts}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink/90">
                    {s.earned ? (
                      <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-ink/30" strokeWidth={2.5} />
                    )}
                    {s.label}
                    {!s.earned && (
                      <span className="text-[10px] font-normal uppercase tracking-wide text-ink/35">
                        · not published
                      </span>
                    )}
                  </p>
                  <p className="text-xs leading-relaxed text-ink/55">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Offer */}
        {affiliate && v.affiliate?.offer && (
          <section className="rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-5">
            <p className="text-sm font-semibold text-amber-300">
              {v.affiliate.offer}
              {v.affiliate.code && (
                <span className="ml-1 font-normal text-amber-300/80">
                  Code <span className="font-mono font-semibold">{v.affiliate.code}</span> at
                  checkout.
                </span>
              )}
            </p>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-2xl border border-ink/[0.08] bg-ink/[0.03] p-6 text-center">
          <p className="mb-1 text-sm font-semibold text-ink/85">Visit {v.name}</p>
          <p className="mx-auto mb-4 max-w-md text-xs leading-relaxed text-ink/45">
            You leave AmericanPeptide for the vendor&rsquo;s own site. Always request
            and match the third-party COA for your specific lot before any use.
          </p>
          <a
            href={href}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
          >
            Go to {v.name}
            <ArrowUpRight className="h-4 w-4" />
          </a>
          {affiliate && (
            <AffiliateDisclosure className="mx-auto mt-4 max-w-lg !text-[11px]" />
          )}
        </section>

        {/* What they carry */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
            <Package className="h-3.5 w-3.5 text-accent" />
            What {v.name} carries
          </h2>
          {v.peptides === 'all' || !carried ? (
            <p className="text-sm leading-relaxed text-ink/55">
              A broad research-peptide catalog — {v.name} stocks the mainstream
              research-peptide market rather than a short list.{' '}
              <Link href="/catalog" className="text-accent hover:underline">
                Browse the catalog
              </Link>{' '}
              to look up any compound, or see it ranked against other suppliers on{' '}
              <Link href="/us-peptides" className="text-accent hover:underline">
                the directory
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm leading-relaxed text-ink/55">
                {carried.length} compounds from our catalog. Compounds with a{' '}
                <span className="text-accent">·</span> have a multi-vendor sourcing
                comparison.
              </p>
              <div className="flex flex-wrap gap-2">
                {carried.map(({ slug, p }) => (
                  <Link
                    key={slug}
                    href={`/catalog/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                  >
                    {hasSourcingPage(slug) && <span className="text-accent">·</span>}
                    {p.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Compare / other reviews */}
        {others.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
              Compare with other vendors
            </h2>
            <div className="space-y-3">
              {others.map((o) => (
                <VendorRow key={o.id} v={o} />
              ))}
            </div>
            <Link
              href="/us-peptides"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              See the full scored directory
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        )}

        {/* Related */}
        <section className="flex flex-wrap gap-3">
          {[
            { href: '/vendors', label: 'All vendor reviews' },
            { href: '/us-peptides', label: 'The scored directory' },
            { href: '/methodology', label: 'How the score works — the Standard' },
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

        {/* Disclaimer */}
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-xs leading-relaxed text-ink/45">
          <strong className="text-ink/60">Research reference only.</strong>{' '}
          AmericanPeptide.com is not a store, a manufacturer, or a medical provider.
          This review scores an independent third-party vendor on the transparency
          signals it publishes; the score is never affected by commission
          {affiliate ? ', and some outbound links are affiliate links, disclosed above' : ''}.
          Trust flags are set only from the vendor&rsquo;s own published claims and
          independently verifiable third-party report numbers, not from personal
          inspection. Nothing here is medical, legal, or purchasing advice, or an
          offer for sale. Compounds referenced are framed for laboratory research;
          several are not approved for human use.
        </section>
      </div>
    </div>
  )
}

// A compact vendor row for the "compare with other vendors" list — score, tier,
// blurb, and a link to that vendor's own review.
function VendorRow({ v }: { v: Vendor }) {
  const score = trustScore(v)
  const tier = vendorTier(v)
  const tierMeta = VENDOR_TIERS.find((t) => t.id === tier)!
  return (
    <Link
      href={`/vendors/${v.id}`}
      className="group flex items-center gap-4 rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-4 transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
    >
      <div
        className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-lg"
        style={{ backgroundColor: `${A}12` }}
      >
        <span className="text-lg font-bold text-accent">{score}</span>
        <span className="text-[8px] uppercase tracking-wide text-ink/35">/100</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink/85 transition-colors group-hover:text-ink">
          {v.name}
        </p>
        <p className="truncate text-xs text-ink/45">{tierMeta.label}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  )
}
