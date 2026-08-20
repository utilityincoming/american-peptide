import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Check,
  Info,
  Building2,
  ArrowRight,
  ArrowUpRight,
  FlaskConical,
  AlertCircle,
  ChevronRight,
  Scale,
  Activity,
  Send,
} from 'lucide-react'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import {
  vendorsRanked,
  vendorsByTier,
  trustScore,
  vendorTier,
  vendorHref,
  TRUST_WEIGHTS,
  VENDOR_TIERS,
} from '@/lib/vendors'
import { IS_APP_BUILD } from '@/lib/platform'
import { COMMUNITY_PATH } from '@/lib/community'

const SITE = 'https://americanpeptide.com'
const PATH = '/us-peptides'

export const metadata: Metadata = {
  title:
    'US-Made Research Peptides — The Sourcing Standard & Scored Vendor Directory | AmericanPeptide.com',
  description:
    'Are research peptides made in the USA? AmericanPeptide does not sell peptides — we built a transparent 100-point standard for sourcing and scored every US supplier against it on published third-party COAs and independent HPLC/MS testing, never on commission.',
  alternates: { canonical: `${SITE}${PATH}` },
  keywords: [
    'USA peptide manufacturer',
    'made in USA peptides',
    'US research peptides',
    'American peptide company',
    'peptide vendor reviews',
    'best US peptide source',
    'third-party COA peptides',
    'independently tested peptides',
    'top peptide companies USA',
    'where to buy research peptides USA',
    'American research peptides',
  ],
  openGraph: {
    title: 'US-Made Research Peptides — The Sourcing Standard',
    description:
      'A transparent 100-point standard for where research peptides come from — every US supplier scored on published lab evidence, never on commission.',
    url: `${SITE}${PATH}`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The US Peptide Sourcing Standard | AmericanPeptide.com',
    description:
      'Every US supplier scored on published third-party COAs and independent testing — never on commission.',
  },
}

// ─── The Standard ─────────────────────────────────────────────────────────────
// The scoring rubric IS the standard. Points come straight from TRUST_WEIGHTS so
// the explainer here can never drift from the score a vendor actually earns.
const STANDARD = [
  {
    key: 'coa',
    pts: TRUST_WEIGHTS.coaOnFile,
    label: 'COA on file',
    body: 'A certificate of analysis you can actually pull for the product — the paperwork, not a promise.',
    color: '#2DD4A8',
  },
  {
    key: 'independent',
    pts: TRUST_WEIGHTS.thirdPartyTested,
    label: 'Independent testing',
    body: 'HPLC and mass spec run by an outside lab (Janoshik, MZ Biolabs) — not an in-house bench grading its own homework.',
    color: '#38BDF8',
  },
  {
    key: 'perbatch',
    pts: TRUST_WEIGHTS.perBatchTesting,
    label: 'Per-batch, lot-matched',
    body: 'Every batch tested and the certificate matched to your specific lot — not one reference batch reused forever.',
    color: '#818CF8',
  },
  {
    key: 'reship',
    pts: TRUST_WEIGHTS.reshipPolicy,
    label: 'Reship on loss',
    body: 'A published policy for a package that arrives damaged or never arrives at all.',
    color: '#FB923C',
  },
  {
    key: 'refund',
    pts: TRUST_WEIGHTS.refundPolicy,
    label: 'Refund policy',
    body: 'A stated money-back or returns policy you can hold them to.',
    color: '#F472B6',
  },
]

const FAQS = [
  {
    q: 'Are research peptides made in the USA?',
    a: 'Yes. A number of suppliers synthesize, fill, or lyophilize research-grade peptides domestically, and several of the strongest now publish lot-matched third-party certificates of analysis by default. "Made in the USA" is only worth as much as the paperwork behind it, though — this page scores US suppliers on the lab evidence they actually publish, not on where a label says the vial was packed.',
  },
  {
    q: 'Does AmericanPeptide sell peptides?',
    a: 'No. AmericanPeptide is an independent research reference — not a store and not a manufacturer. We rank external US suppliers by the transparency signals that protect a researcher (third-party COAs, independent per-batch testing, published policies), and we may earn an affiliate commission on some outbound links. That relationship is disclosed on the page, and it never moves a vendor up the ranking — the score is derived only from published evidence.',
  },
  {
    q: 'How do I verify a US peptide supplier is legitimate?',
    a: 'Ask for the certificate of analysis matched to your specific lot, not a generic sample. Check for HPLC purity (ideally ≥99%) and a mass-spec identity confirmation, and confirm the third-party lab report number (Janoshik or MZ Biolabs certificates are independently verifiable). Then look for per-batch testing and a published refund or reship policy. Our COA decoder walks through exactly what each number on a certificate means.',
  },
  {
    q: 'What makes a peptide vendor "top" or trustworthy?',
    a: 'Not marketing — evidence. Our 100-point standard weights the two signals that actually protect you highest: a certificate of analysis on file (30 points) and independent third-party testing (30 points), followed by per-batch lot matching (20). Reship and refund policies round it out. A vendor cannot buy a better score; the only way up is more published transparency.',
  },
  {
    q: 'What is a per-batch COA and why does it matter?',
    a: 'A per-batch, lot-matched certificate of analysis tests every production batch and ties the result to the exact lot you receive. The weaker alternative is a single "golden batch" certificate produced once and reused across every future order — which tells you nothing about the vial in your hand. Per-batch testing is the line between a reference document and real, ongoing quality control.',
  },
  {
    q: 'Is it legal to buy research peptides?',
    a: 'The compounds referenced here are framed for laboratory research, not human use — several are investigational, regulated, or prohibited in sport, and legality varies by jurisdiction. This page is a research reference for evaluating suppliers, not legal advice or an offer for sale. Follow the law that applies to you.',
  },
]

const REGION_LABEL: Record<string, string> = {
  us: 'US',
  eu: 'EU',
  uk: 'UK',
  ca: 'Canada',
  au: 'Australia',
  asia: 'Asia',
  global: 'Global',
}

export default function MadeInUsaPage() {
  const vendors = vendorsRanked() // [] on the reference-only Play (TWA) build
  const grouped = vendorsByTier(vendors)
  const count = vendors.length

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'US-Made Research Peptides: The Sourcing Standard & Vendor Directory',
    description:
      'A transparent 100-point standard for where research peptides come from — every US supplier scored on published third-party COAs and independent testing, never on commission.',
    url: `${SITE}${PATH}`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    audience: {
      '@type': 'Audience',
      audienceType: 'Researchers, Formulators, Educators',
    },
    about: { '@type': 'Thing', name: 'Research peptide sourcing and quality verification' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Made in USA', item: `${SITE}${PATH}` },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">Made in USA</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <ShieldCheck className="h-3 w-3" />
            The sourcing standard{count > 0 ? ` · ${count} US suppliers scored` : ''}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            American-Made,
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              Independently Verified
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            AmericanPeptide does not sell peptides. We built a transparent
            100-point standard for where research-grade peptides come from — and
            scored every US supplier we list against it, on the lab evidence they
            publish, never on commission.
          </p>
          <p className="mt-3 text-xs text-ink/30">
            Research reference only. Not medical advice, dosing guidance, or an
            offer for sale.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* ── Main column ── */}
          <div className="space-y-16">
            {/* Why domestic */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Why domestic sourcing
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: <Building2 className="h-4 w-4" />,
                    color: '#2DD4A8',
                    title: 'One jurisdiction',
                    body: 'A domestic parcel stays inside a single set of rules — no customs interception lottery, no ambiguous re-import status on the way to your bench.',
                  },
                  {
                    icon: <ShieldCheck className="h-4 w-4" />,
                    color: '#818CF8',
                    title: 'Accountability',
                    body: 'A US operator with a real card processor behind it means your chargeback protection rides along with the order — recourse a crypto-only overseas checkout cannot offer.',
                  },
                  {
                    icon: <Activity className="h-4 w-4" />,
                    color: '#38BDF8',
                    title: 'Faster, colder',
                    body: 'Days, not weeks in transit — which matters for material that ships lyophilized and is happiest spending less time in a mail truck.',
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5"
                    style={{ borderTopColor: c.color, borderTopWidth: 2 }}
                  >
                    <div
                      className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${c.color}18`, color: c.color }}
                    >
                      {c.icon}
                    </div>
                    <p className="mb-1 text-sm font-semibold" style={{ color: c.color }}>
                      {c.title}
                    </p>
                    <p className="text-xs leading-relaxed text-ink/55">{c.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/30">
                Practical sourcing considerations for researchers — not legal
                advice. Follow the regulations that apply where you are.
              </p>
            </section>

            {/* The Standard */}
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/40">
                The Standard
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-ink/55">
                One transparent 100-point scale, built from the signals that
                actually protect a researcher. Every point is earned from
                published evidence — a supplier can never buy a better score.
              </p>

              {/* Segmented rubric bar — widths are the point weights */}
              <div className="mb-2 flex h-3.5 w-full overflow-hidden rounded-full border border-ink/10">
                {STANDARD.map((s) => (
                  <div
                    key={s.key}
                    style={{ width: `${s.pts}%`, backgroundColor: s.color }}
                    title={`${s.label} — ${s.pts} pts`}
                  />
                ))}
              </div>
              <div className="mb-6 flex justify-between text-[10px] font-medium text-ink/30">
                <span>0</span>
                <span>100 points</span>
              </div>

              <div className="space-y-3">
                {STANDARD.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-start gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4"
                  >
                    <div
                      className="mt-0.5 flex h-7 w-11 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                      style={{ backgroundColor: `${s.color}1A`, color: s.color }}
                    >
                      {s.pts}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink/90">{s.label}</p>
                      <p className="text-xs leading-relaxed text-ink/55">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tiers */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {VENDOR_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-4"
                  >
                    <p className="mb-1 text-sm font-semibold text-ink/85">{tier.label}</p>
                    <p className="text-xs leading-relaxed text-ink/50">{tier.blurb}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/tools/coa-decoder"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                >
                  Decode a COA
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                >
                  How we build the reference
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>

            {/* The Directory */}
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/40">
                The directory — {count > 0 ? `${count} US suppliers, scored` : 'US suppliers'}
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-ink/55">
                Grouped into tiers, best evidence first. Each supplier self-files
                into a band from its own published signals — we do not hand-rank,
                and we do not sell placement in this list.
              </p>

              {count === 0 ? (
                <ReferenceEdition />
              ) : (
                <>
                  <AffiliateDisclosure className="mb-6 rounded-lg border border-ink/[0.06] bg-ink/[0.02] p-3 !text-[11px]" />
                  <div className="space-y-10">
                    {grouped.map(({ tier, vendors: tierVendors }) => (
                      <div key={tier.id}>
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                          <p className="text-sm font-semibold text-ink/85">{tier.label}</p>
                          <span className="text-xs text-ink/35">· {tier.blurb}</span>
                        </div>
                        <div className="space-y-4">
                          {tierVendors.map((v) => {
                            const t = v.trust
                            const signals: string[] = []
                            if (t.coaOnFile) signals.push('COA on file')
                            if (t.thirdPartyTested) signals.push('Independent HPLC/MS')
                            if (t.perBatchTesting) signals.push('Per-batch, lot-matched')
                            if (t.purityPct) signals.push(`Stated purity ≥ ${t.purityPct}%`)
                            if (t.reshipPolicy) signals.push('Reship on loss')
                            if (t.refundPolicy) signals.push('Refund policy')
                            return (
                              <div
                                key={v.id}
                                className="rounded-xl border border-ink/[0.08] bg-ink/[0.02] p-5"
                              >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-base font-semibold text-ink/90">
                                      {v.name}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                      {v.shipsTo.map((r) => (
                                        <span
                                          key={r}
                                          className="rounded-full border border-ink/10 px-2 py-0.5 text-[10px] font-medium text-ink/45"
                                        >
                                          Ships {REGION_LABEL[r] ?? r}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="shrink-0 rounded-full border border-ink/15 px-2.5 py-0.5 text-xs font-semibold text-ink/70">
                                    {trustScore(v)}/100
                                  </span>
                                </div>

                                <p className="mb-3 text-sm leading-relaxed text-ink/60">
                                  {v.blurb}
                                </p>

                                {v.affiliate?.offer && (
                                  <p className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.08] px-3 py-2 text-sm font-semibold text-amber-300">
                                    {v.affiliate.offer}
                                    {v.affiliate.code ? (
                                      <span className="ml-1 font-normal text-amber-300/80">
                                        Code{' '}
                                        <span className="font-mono font-semibold">
                                          {v.affiliate.code}
                                        </span>
                                        .
                                      </span>
                                    ) : null}
                                  </p>
                                )}

                                {signals.length > 0 && (
                                  <ul className="mb-4 grid gap-1.5 text-xs sm:grid-cols-2">
                                    {signals.map((s) => (
                                      <li
                                        key={s}
                                        className="flex items-start gap-1.5 text-ink/65"
                                      >
                                        <Check
                                          className="mt-0.5 h-3 w-3 shrink-0 text-accent"
                                          strokeWidth={2.5}
                                        />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <a
                                  href={vendorHref(v)}
                                  target="_blank"
                                  rel="sponsored nofollow noopener"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2DD4A8] px-4 py-2 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
                                >
                                  Visit {v.name}
                                  <ArrowUpRight className="h-4 w-4" />
                                </a>

                                {v.notes && (
                                  <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-400/70">
                                    <Info
                                      className="mt-0.5 h-3 w-3 shrink-0"
                                      strokeWidth={2}
                                    />
                                    <span>{v.notes}</span>
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 flex items-start gap-2 rounded-lg border border-ink/[0.06] bg-ink/[0.02] p-3 text-[11px] leading-relaxed text-ink/45">
                    <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/35" />
                    <span>
                      Trust flags are set only from a supplier&rsquo;s own published
                      claims and independently verifiable third-party report
                      numbers — not from personal inspection. Always request and
                      match the COA for your specific lot before any use.
                    </span>
                  </p>

                  {/* The American Peptide community - an open door, not a vendor
                      endorsement. Inside count > 0, so it never renders on the
                      reference-only Play build. */}
                  <div className="mt-8 overflow-hidden rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4">
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2DD4A8] text-[#0B1220]">
                          <Send className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-semibold text-ink/90">
                            The part that doesn&rsquo;t fit on a page.
                          </p>
                          <p className="max-w-xl text-xs leading-relaxed text-ink/55">
                            A page holds what can be written down. The room holds the
                            rest - people comparing notes, sharing what they&rsquo;ve
                            found, looking out for whoever comes next. The door&rsquo;s
                            open.
                          </p>
                        </div>
                      </div>
                      <a
                        href={COMMUNITY_PATH}
                        target="_blank"
                        rel="nofollow noopener"
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
                      >
                        Join the community
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5"
                  >
                    <p className="mb-2 text-sm font-semibold text-ink/90">{faq.q}</p>
                    <p className="text-sm leading-relaxed text-ink/55">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <div className="text-xs leading-relaxed text-ink/45">
                <strong className="text-ink/60">Research reference only.</strong>{' '}
                AmericanPeptide.com is not a store, a manufacturer, or a medical
                provider. Supplier listings are independent third parties scored
                on published transparency signals; some outbound links are
                affiliate links, disclosed above, that never affect ranking. This
                page does not constitute medical, legal, or purchasing advice, or
                an offer for sale of any compound. Compounds referenced are framed
                for laboratory research; several are not approved for human use.
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Scoring summary */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                How the score works
              </p>
              <div className="space-y-2.5">
                {STANDARD.map((s) => (
                  <div key={s.key} className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="flex-1 text-xs text-ink/60">{s.label}</span>
                    <span className="text-xs font-semibold text-ink/45">{s.pts}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2.5 border-t border-ink/[0.06] pt-2.5">
                  <span className="h-2.5 w-2.5 shrink-0" />
                  <span className="flex-1 text-xs font-semibold text-ink/70">Total</span>
                  <span className="text-xs font-bold text-accent">100</span>
                </div>
              </div>
            </div>

            {/* The American Peptide community - a place to help and be helped, not
                a vendor endorsement. Gated off the Play build with the buying layer. */}
            {!IS_APP_BUILD && (
              <div className="rounded-xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.07] to-transparent p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4A8] text-[#0B1220]">
                    <Send className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink/85">The community</p>
                      <span className="rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                        Open
                      </span>
                    </div>
                    <p className="text-xs text-ink/40">Telegram · researchers</p>
                  </div>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-ink/55">
                  Some things don&rsquo;t fit on a page. There&rsquo;s a room for the
                  rest - researchers looking out for each other, comparing notes,
                  passing on what they know. Come to help, or to be helped.
                </p>
                <a
                  href={COMMUNITY_PATH}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
                >
                  Join the community
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Related */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Verify before you source
              </p>
              <div className="space-y-2">
                {[
                  {
                    href: '/tools/coa-decoder',
                    label: 'COA Decoder',
                    sub: 'What every number means',
                  },
                  {
                    href: '/synthesis',
                    label: 'How peptides are made',
                    sub: 'Synthesis, purity & QC',
                  },
                  {
                    href: '/methodology',
                    label: 'Our methodology',
                    sub: 'How this reference is built',
                  },
                  {
                    href: '/catalog',
                    label: 'Peptide catalog',
                    sub: 'Per-compound sources',
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">
                        {link.label}
                      </p>
                      <p className="text-xs text-ink/30">{link.sub}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-ink/20 transition-colors group-hover:text-ink/50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Agent CTA */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5">
              <p className="mb-1 text-sm font-semibold text-ink/80">Ask the Peptide Agent</p>
              <p className="mb-4 text-xs leading-relaxed text-ink/40">
                Citation-backed answers on purity, COAs, and how to read a
                supplier&rsquo;s testing — grounded in PubChem, PubMed, and
                ClinicalTrials.gov.
              </p>
              <Link
                href="/research"
                className="flex items-center justify-center gap-2 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/20 hover:text-ink"
              >
                Open Peptide Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// Reference-only fallback for the Play (TWA) build, where vendorsRanked() returns
// [] and no outbound vendor/affiliate links may render. The Standard above is
// pure education and stays; only the directory swaps to this.
function ReferenceEdition() {
  return (
    <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
        <FlaskConical className="h-4 w-4 text-accent" />
      </div>
      <p className="mb-1 text-sm font-semibold text-accent">Reference edition</p>
      <p className="mb-4 text-xs leading-relaxed text-ink/45">
        This edition is a research reference only — no supplier listings or
        pricing. AmericanPeptide never sells peptides; the trust-ranked directory
        is available on the web.
      </p>
      <Link
        href="/catalog"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
      >
        Browse catalog
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
