import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Ban,
  BadgeCheck,
  FlaskConical,
  Microscope,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { PEPTIDES } from '@/lib/peptides'
import { PUBCHEM_VERIFIED } from '@/lib/verification'
import { VENDORS, VENDOR_TIERS, TRUST_WEIGHTS } from '@/lib/vendors'

const SITE = 'https://americanpeptide.com'

const VERIFIED_COUNT = Object.keys(PUBCHEM_VERIFIED).length
const CATALOG_COUNT = PEPTIDES.length
const ACTIVE_VENDOR_COUNT = VENDORS.filter((v) => v.affiliate?.active).length
// Most recent PubChem cross-check date across the manifest.
const LAST_CHECKED = Object.values(PUBCHEM_VERIFIED)
  .map((v) => v.checkedAt)
  .sort()
  .at(-1)

// Trust-score weights, highest first — mirrors lib/vendors.ts (single source of truth).
const WEIGHT_LABELS: Record<keyof typeof TRUST_WEIGHTS, string> = {
  coaOnFile: 'Per-lot COA available to customers',
  thirdPartyTested: 'Independent third-party HPLC/MS testing',
  perBatchTesting: 'Per-batch (lot-level) testing, not one reference COA',
  reshipPolicy: 'Reship on carrier loss',
  refundPolicy: 'Published refund policy',
}
const WEIGHTS = (
  Object.entries(TRUST_WEIGHTS) as [keyof typeof TRUST_WEIGHTS, number][]
).sort((a, b) => b[1] - a[1])

export const metadata: Metadata = {
  title: 'The Standard — How AmericanPeptide Verifies | AmericanPeptide.com',
  description:
    'The trust methodology behind AmericanPeptide.com: how catalog chemistry is cross-referenced against PubChem, how sources are ranked by transparency signals (never commission), and why every page stays research-grade rather than medical.',
  alternates: { canonical: `${SITE}/methodology` },
  keywords: [
    'peptide verification methodology',
    'research peptide trust standard',
    'peptide COA verification',
    'how peptide vendors are ranked',
    'PubChem verified peptides',
    'research-grade peptide reference',
  ],
  openGraph: {
    title: 'The Standard — How AmericanPeptide Verifies',
    description:
      'How catalog chemistry is verified against PubChem, how sources are ranked by transparency (never commission), and why we stay research-grade.',
    url: `${SITE}/methodology`,
    type: 'article',
  },
}

const PILLARS = [
  {
    icon: <Microscope className="h-4 w-4" />,
    color: '#2DD4A8',
    label: 'Chemistry, cross-referenced',
    desc: `Every catalog entry's formula and molecular weight is checked against its PubChem reference record. Only confident matches carry a "verified" badge.`,
    stat: `${VERIFIED_COUNT} / ${CATALOG_COUNT} entries confirmed`,
  },
  {
    icon: <Scale className="h-4 w-4" />,
    color: '#818CF8',
    label: 'Sources ranked by trust',
    desc: 'Where-to-source listings are ordered by verifiable transparency signals — third-party COAs, per-batch testing, published policies — never by commission.',
    stat: 'Commission never affects ranking',
  },
  {
    icon: <FlaskConical className="h-4 w-4" />,
    color: '#FB923C',
    label: 'Research-grade, not medical',
    desc: 'This is a computational research reference for scientists and educators. Nothing here is medical advice, dosing guidance, or an offer for sale.',
    stat: 'No fabricated data, ever',
  },
]

export default function MethodologyPage() {
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'The Standard — How AmericanPeptide Verifies',
    description:
      'The trust methodology behind AmericanPeptide.com: PubChem chemistry verification, transparency-based source ranking, and a research-grade (non-medical) stance.',
    url: `${SITE}/methodology`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'The Standard', item: `${SITE}/methodology` },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">The Standard</span>
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
            The AmericanPeptide Standard
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            How we verify,
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              and what we refuse to fake
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            AmericanPeptide is built as a trust layer for research peptides — not a
            storefront. Three commitments hold the whole thing together: catalog
            chemistry is cross-referenced against public records, sources are
            ranked only by verifiable transparency, and every claim stays
            research-grade. Here is exactly how each one works.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        {/* ── Pillars ── */}
        <section className="mb-16 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5"
              style={{ borderTopColor: p.color, borderTopWidth: 2 }}
            >
              <div
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${p.color}18`, color: p.color }}
              >
                {p.icon}
              </div>
              <p className="mb-1.5 text-sm font-semibold" style={{ color: p.color }}>
                {p.label}
              </p>
              <p className="mb-3 text-xs leading-relaxed text-ink/55">{p.desc}</p>
              <p className="text-[11px] font-medium text-ink/40">{p.stat}</p>
            </div>
          ))}
        </section>

        <div className="space-y-16">
          {/* ── 1. Chemistry verification ── */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" />
              Chemistry, cross-referenced against PubChem
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                A catalog is only as trustworthy as its worst entry. So rather
                than restate a molecular formula and hope it&rsquo;s right, an
                automated fact-QA pass checks each compound against its reference
                record in{' '}
                <a
                  href="https://pubchem.ncbi.nlm.nih.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  PubChem
                </a>
                , the NIH&rsquo;s open chemistry database.
              </p>
              <p>
                A match only counts when it is unambiguous. A curated PubChem CID
                is authoritative; name-resolved entries additionally have to
                contain nitrogen and match the catalog molecular weight within
                tolerance. Anything short of a confident match gets no badge —
                so the on-page &ldquo;Chemistry verified&rdquo; claim stays
                honest by construction, and the compound&rsquo;s CID and check
                date are shown so you can confirm it yourself.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat value={`${VERIFIED_COUNT}`} label="Entries PubChem-confirmed" />
              <Stat value={`${CATALOG_COUNT}`} label="Total catalog entries" />
              <Stat value={LAST_CHECKED ?? '—'} label="Most recent cross-check" />
            </div>
            <Link
              href="/catalog"
              className="group mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent"
            >
              See the verified badges in the catalog
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>

          {/* ── 2. Source ranking ── */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              <Scale className="h-3.5 w-3.5 text-accent-indigo" />
              Sources ranked by transparency, never commission
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                AmericanPeptide does not sell peptides. It points researchers to
                external vendors — and the ranking is the whole product. Every
                vendor earns a transparent 0&ndash;100 trust score derived{' '}
                <em>only</em> from verifiable transparency signals. Certificate of
                analysis and independent testing dominate the weighting because
                they are the signals that actually protect a researcher.
              </p>
            </div>

            {/* Weight table */}
            <div className="mt-6 overflow-hidden rounded-xl border border-ink/[0.07]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/[0.06] bg-ink/[0.02] text-left text-xs text-ink/40">
                    <th className="px-4 py-2.5 font-medium">Transparency signal</th>
                    <th className="px-4 py-2.5 text-right font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.04]">
                  {WEIGHTS.map(([key, weight]) => (
                    <tr key={key} className="hover:bg-ink/[0.02]">
                      <td className="px-4 py-2.5 text-ink/70">{WEIGHT_LABELS[key]}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-ink/80">
                        +{weight}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-ink/[0.02] text-ink/50">
                    <td className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider">
                      Commission / payment
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-accent">
                      +0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tiers */}
            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
              The three tiers a score files into
            </p>
            <div className="space-y-3">
              {VENDOR_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4"
                >
                  <p className="mb-1 text-sm font-semibold text-ink/85">{tier.label}</p>
                  <p className="text-xs leading-relaxed text-ink/50">{tier.blurb}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-ink/65">
              Add a vendor and it self-files into the right band from its own
              signals — there is no manual ordering, and no way to buy a higher
              placement. {ACTIVE_VENDOR_COUNT} vendor
              {ACTIVE_VENDOR_COUNT === 1 ? '' : 's'} currently carry a disclosed
              affiliate relationship; each is marked, each outbound link uses{' '}
              <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-[11px] text-ink/70">
                rel=&quot;sponsored nofollow&quot;
              </code>
              , and the score is computed the same way whether we earn a
              commission or not.
            </p>
            <AffiliateDisclosure className="mt-4" />
          </section>

          {/* ── 3. What we don't do ── */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              <Ban className="h-3.5 w-3.5 text-ink/50" />
              What we refuse to do
            </h2>
            <ul className="space-y-3">
              {[
                {
                  h: 'No fabricated data',
                  b: 'Catalog, vendor, and pricing datasets ship empty rather than invented. If a trust signal isn’t published by the source, the flag stays off and the caveat goes in writing.',
                },
                {
                  h: 'Not a store',
                  b: 'We hold no inventory and process no orders. Sourcing links are external editorial references, disclosed as affiliate where applicable.',
                },
                {
                  h: 'Not medical advice',
                  b: 'Every compound page is a research and educational reference. Nothing here is diagnosis, treatment, dosing guidance, or an offer for sale.',
                },
                {
                  h: 'AI outputs are hypotheses',
                  b: 'The research agent and computational tools produce hypotheses to be independently validated — never clinical conclusions.',
                },
              ].map((item) => (
                <li
                  key={item.h}
                  className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4"
                >
                  <p className="mb-1 text-sm font-semibold text-ink/85">{item.h}</p>
                  <p className="text-xs leading-relaxed text-ink/55">{item.b}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Disclaimer ── */}
          <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
            <div className="text-xs leading-relaxed text-ink/45">
              <strong className="text-ink/60">Research reference only.</strong>{' '}
              AmericanPeptide.com is an AI-assisted computational research
              platform, not a medical device or clinical decision-support system.
              Trust scores reflect vendors&rsquo; own published claims unless
              stated otherwise and are not independent certification. Always
              request and match the third-party COA for your specific lot before
              any use.
            </div>
          </section>

          {/* ── Related ── */}
          <section className="flex flex-wrap gap-3">
            {[
              { href: '/catalog', label: 'Browse the verified catalog' },
              { href: '/synthesis', label: 'How peptides are synthesized' },
              { href: '/about', label: 'About AmericanPeptide' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
              >
                {l.label}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-4">
      <p className="text-2xl font-bold tracking-tight text-ink/90">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-ink/40">{label}</p>
    </div>
  )
}
