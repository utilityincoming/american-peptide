import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FlaskConical, Search, Sparkles, Syringe, Telescope } from 'lucide-react'
import { ClinicalPulseIcon, CompoundSearchIcon, PeptideAgentIcon, PeptideForgeIcon } from '@/components/ResearchToolIcons'
import {
  PEPTIDES,
  CATEGORIES,
  BROWSE_SPOTLIGHT,
  CATALOG_COUNT,
  CATEGORY_COUNT,
  CATALOG_FDA_APPROVED_COUNT,
  CATALOG_FULL_SEQUENCE_COUNT,
  CATALOG_MORE_BEYOND_SPOTLIGHT_COUNT,
  getPeptideBySlug,
} from '@/lib/peptides'
import { STATIC_FAQS, faqPageJsonLd } from '@/lib/faqs'
import FaqAccordion from '@/components/FaqAccordion'
import DynamicFaqs from '@/components/DynamicFaqs'
import { DotField, Glow } from '@/components/Backdrop'
import ContourDivider from '@/components/ContourDivider'
import CatalogMotif from '@/components/CatalogMotif'
import HeroSequence from '@/components/HeroSequence'

// Home-page metadata. The root layout's title is a generic "AI-Powered Peptide
// Research"; here we override it with an intent-matched title/description that
// front-loads the brand and the US-made angle the domain already earns
// impressions for (brand + "american peptide company" + "made in the USA"
// queries), so the home page competes for the click on those, not just on a
// generic phrase.
//
// Note: Next does NOT deep-merge openGraph — a route that sets `openGraph`
// replaces the layout's object wholesale (verified: pages with a custom
// openGraph drop the layout's og:site_name / og:type). So we repeat type and
// siteName here to keep the home page's social card complete and self-contained.
export const metadata: Metadata = {
  // Standalone title: the home page keeps its own brand treatment rather than
  // the "<page> | AmericanPeptide.com" template from the root layout.
  title: { absolute: 'American Peptide — Cited Research Reference, Not a Store' },
  description:
    'Cited peptide research reference: sequences, trial evidence, and lab tools for semaglutide, tirzepatide, BPC-157, and the open catalog. Not a store.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'AmericanPeptide.com',
    url: '/',
    title: 'American Peptide — Cited Research Reference, Not a Store',
    description:
      'Cited peptide research reference: sequences, trial evidence, and lab tools for semaglutide, tirzepatide, BPC-157, and the open catalog. Not a store.',
  },
}

const SPOTLIGHT_SLUGS = BROWSE_SPOTLIGHT
const HERO_PEPTIDE = getPeptideBySlug('bpc-157')

const features = [
  {
    Icon: PeptideAgentIcon,
    name: 'Peptide Agent',
    badge: 'AI Assistant',
    href: '/research',
    description:
      'Ask in plain language and get citation-backed answers — the agent cross-references PubChem structures, ClinicalTrials.gov studies, and mechanisms into structured evidence.',
  },
  {
    Icon: PeptideForgeIcon,
    name: 'PeptideForge',
    badge: 'Interactive Builder',
    href: '/compounds/builder',
    description:
      'Build a peptide residue by residue and watch mass, hydropathy, and net charge update live. Clear chemistry challenges to earn XP — a hands-on way to learn sequence design.',
  },
  {
    Icon: ClinicalPulseIcon,
    name: 'ClinicalPulse',
    badge: 'Trial Intelligence',
    href: '/trials',
    description:
      'Real-time surveillance of peptide-based clinical trials across ClinicalTrials.gov and WHO ICTRP. Surface recruitment trends, endpoint shifts, and competitive pipeline movements.',
  },
  {
    Icon: CompoundSearchIcon,
    name: 'Compound Search',
    badge: 'PubChem Explorer',
    href: '/compounds',
    description:
      'Search PubChem for peptides and small molecules. Inspect 2D structures, molecular formulae, and weights, then jump straight to the underlying NIH compound record for deeper review.',
  },
]

// Lead with an owned metric (our cited catalog) so the row isn't three
// borrowed public-database counts — the first number should be ours, the
// scale of the sources we search backs it up.
const stats = [
  { value: `${CATALOG_COUNT}`, label: 'Entries listed in the catalog' },
  { value: '400K+', label: 'Compounds searchable via PubChem' },
  { value: '500K+', label: 'Clinical trials indexed' },
]

const steps = [
  {
    Icon: Search,
    name: 'Search',
    description:
      'Query PubChem for compounds, ClinicalTrials.gov for studies, or ask the Peptide Agent in natural language.',
  },
  {
    Icon: Sparkles,
    name: 'Analyze',
    description:
      'Cross-reference structures, sponsors, phases, and mechanisms — surfaced as structured evidence with primary-source links.',
  },
  {
    Icon: Telescope,
    name: 'Discover',
    description:
      'Identify whitespace, candidate analogs, and emerging trial signals to guide your next experimental hypothesis.',
  },
]

// Section vertical rhythm: content sections use `pb-24` as the standard beat.
// The hero uses a shorter opening interval on mobile; the
// paired promo cards sit tight (`pb-12` then `pb-24`), and the last section
// before the footer takes one larger `pb-32` break. Keep new sections on `pb-24`.
export default function HomePage() {
  return (
    <div className="home relative min-h-screen overflow-hidden bg-surface text-ink">

      {/* ── Background layer ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <DotField size={28} intensity={0.12} />
        <Glow className="-top-32 left-1/3 h-[500px] w-[500px] -translate-x-1/2" intensity={0.08} blur={140} />
        <Glow className="top-2/3 right-1/4 h-96 w-96" intensity={0.04} blur={100} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/60" />
      </div>

      <section aria-labelledby="home-title" className="relative z-10 bg-surface">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 md:px-6 md:pb-20 md:pt-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h1 id="home-title" className="mb-4 max-w-xl text-balance text-4xl font-medium leading-[1.05] md:text-6xl">
                A cited peptide reference
              </h1>
              <p className="mb-6 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
                Look up peptide sequences and their sources, explore clinical trials, and use
                research calculators. The Peptide Agent cites the sources behind its answers.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href="/catalog"
                  className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Browse the catalog
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Link>
                <Link
                  href="/tools/reconstitution-calculator"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Open the calculator
                </Link>
                <Link
                  href="/research"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ask the Peptide Agent
                </Link>
              </div>
            </div>

            {HERO_PEPTIDE?.sequence && (
              <HeroSequence
                href={`/catalog/${HERO_PEPTIDE.slug}`}
                name={HERO_PEPTIDE.name}
                sequence={HERO_PEPTIDE.sequence}
              />
            )}
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-hairline pt-5 sm:gap-6 md:mt-12">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <dt className="text-xs text-ink-muted md:text-sm">{label}</dt>
                <dd className="order-first font-scientific text-xl font-semibold text-ink md:text-3xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ContourDivider className="mx-auto max-w-6xl px-6 py-2 md:px-10" />

      {/* ── Reconstitution Calculator Spotlight ──
          The bench tool people reach for daily. It gets its own real estate
          right below the hero, with a live worked example that deep-links into
          the exact configuration it shows. */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-[#7EE0B5]/[0.08] via-[#7EE0B5]/[0.03] to-transparent p-8 md:p-12">
          <DotField size={24} className="opacity-40" />
          <Glow className="-bottom-32 -left-32 h-80 w-80" intensity={0.08} />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            {/* Left — copy + CTA */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                <Syringe className="h-3 w-3" />
                Bench tool · Works offline
              </div>

              <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
                Every dose, down to the
                <br />
                <span className="text-accent">
                  tick mark.
                </span>
              </h2>

              <p className="mb-6 max-w-md text-[15px] leading-relaxed text-ink/55">
                Enter the vial size, your target dose, and the bacteriostatic water
                you&apos;re adding. Concentration, syringe units, and doses per vial
                update as you type — then it draws the fill on a U-100 barrel so you
                read it straight off the syringe.
              </p>

              {/* What you get */}
              <div className="mb-7 flex flex-wrap gap-2">
                {['Live U-100 syringe', 'Doses per vial', 'Shareable link', 'Installs offline'].map(
                  (f) => (
                    <span
                      key={f}
                      className="rounded-lg border border-hairline bg-fill px-2.5 py-1 text-[11px] text-ink/60"
                    >
                      {f}
                    </span>
                  ),
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/tools/reconstitution-calculator"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#7EE0B5] px-6 py-3 text-sm font-semibold text-[#0E1512] shadow-[0_0_0px_rgba(126,224,181,0)] transition-all hover:bg-[#A6F0CC] hover:shadow-[0_0_40px_rgba(126,224,181,0.35)]"
                >
                  <Syringe className="h-4 w-4" />
                  Open the calculator
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/tools/calculator-beta"
                  className="text-xs text-ink/55 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/50"
                >
                  or try the beta — GLP-1 pen mode &amp; reverse-dose solver
                </Link>
              </div>
            </div>

            {/* Right — live worked example, deep-linked into the tool */}
            <Link
              href="/tools/reconstitution-calculator?vial=5&dose=250&water=2"
              aria-label="Open this worked example in the reconstitution calculator: 5 mg vial, 2 mL bacteriostatic water, 250 mcg dose"
              className="group relative block rounded-2xl border border-hairline bg-panel p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:border-accent/30 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55">
                  Worked example
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <p className="mb-4 font-mono text-[11px] text-ink/50">
                5&thinsp;mg vial · 2&thinsp;mL BAC water · 250&thinsp;mcg dose
              </p>

              <ReconPreviewSyringe />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <PreviewTile value="10" unit="syringe units" />
                <PreviewTile value="20" unit="doses / vial" />
                <PreviewTile value="250" unit="mcg / 0.1 mL" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Catalog Spotlight ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <Link
          href="/catalog"
          className="group relative block overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-[#7EE0B5]/[0.08] via-[#7EE0B5]/[0.03] to-transparent p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_24px_80px_-16px_rgba(126,224,181,0.14)] md:p-12"
        >
          <DotField size={24} className="opacity-40" />
          <Glow className="-right-32 -top-32 h-80 w-80 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.14]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            {/* Left column */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                <Sparkles className="h-3 w-3" />
                Now live
              </div>

              <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
                The peptide reference
                <br />
                <span className="text-accent">
                  catalog is live.
                </span>
              </h2>

              <p className="mb-6 max-w-md text-[15px] leading-relaxed text-ink/55">
                Browse {CATALOG_COUNT} research peptides across {CATEGORY_COUNT} categories — each
                entry carries mechanism, sequence, and PubChem-enriched chemistry, with
                manufacturing and quality context from the synthesis guide.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#7EE0B5] px-6 py-3 text-sm font-semibold text-[#0E1512] shadow-[0_0_0px_rgba(126,224,181,0)] transition-all group-hover:bg-[#A6F0CC] group-hover:shadow-[0_0_40px_rgba(126,224,181,0.35)]">
                  Open Catalog
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-xs text-ink/55">
                  {CATALOG_FDA_APPROVED_COUNT} FDA-approved · {CATALOG_FULL_SEQUENCE_COUNT} with full sequence
                </span>
              </div>
            </div>

            {/* Right column — peptide preview chips */}
            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/75">
                  Featured entries
                </p>
                <CatalogMotif category="metabolic" className="block h-auto w-32 text-accent" />
              </div>
              <div className="flex flex-wrap gap-2">
                {SPOTLIGHT_SLUGS.map((slug) => {
                  const p = PEPTIDES.find((x) => x.slug === slug)
                  if (!p) return null
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-fill px-2.5 py-1.5 text-xs text-ink/70 transition-colors group-hover:border-accent/20 group-hover:bg-fill-strong"
                    >
                      {p.name}
                      {p.fdaApproved && (
                        <span className="rounded border border-accent/25 bg-accent/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-accent">
                          FDA
                        </span>
                      )}
                    </span>
                  )
                })}
                <span className="inline-flex items-center rounded-lg border border-dashed border-hairline-strong bg-transparent px-2.5 py-1.5 text-xs text-ink/55">
                  +{CATALOG_MORE_BEYOND_SPOTLIGHT_COUNT} more
                </span>
              </div>

              <div className="mt-5 border-t border-hairline pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md border border-hairline bg-fill px-2 py-0.5 text-[10px] text-ink/50"
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Feature Cards ── */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Research Modules
          </h2>
          <p className="text-sm text-ink/55 md:text-base">
            Four integrated tools. One unified research environment.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, name, badge, href, description }) => (
            <Link
              key={name}
              href={href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-fill p-8 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-fill-strong hover:shadow-[0_18px_50px_-12px_rgba(126,224,181,0.14)]"
            >
              {/* Top accent line revealed on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7EE0B5]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon */}
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>

              {/* Module type */}
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent/60">
                {badge}
              </p>

              {/* Name */}
              <h3 className="mb-3 text-xl font-semibold tracking-tight">{name}</h3>

              {/* Description */}
              <p className="flex-1 text-sm leading-relaxed text-ink/55">{description}</p>

              {/* Explore link */}
              <div className="mt-6 flex translate-x-0 items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                Explore module
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
          <p className="text-sm text-ink/55 md:text-base">
            Search → Analyze → Discover
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ Icon, name, description }, idx) => (
            <div
              key={name}
              className="relative rounded-2xl border border-hairline bg-fill p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-fill"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.08] text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] text-ink/55">
                  Step {idx + 1}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold">{name}</h3>
              <p className="text-sm leading-relaxed text-ink/55">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sourcing Standard ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-[#7EE0B5]/[0.06] via-transparent to-transparent p-8 md:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            <FlaskConical className="h-3 w-3" />
            The US sourcing standard
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
            Every source,{' '}
            <span className="text-accent">
              in the open.
            </span>
          </h2>
          <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink/55 md:text-base">
            The American labs worth knowing show their work — sequences traced,
            testing published, out in the open. The US sourcing standard brings
            them together and ranks them on exactly that, so the community built
            on this science finds its sources by signal alone.
          </p>
          <Link
            href="/us-peptides"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-[#D2FBE6]"
          >
            Explore the US sourcing standard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 mx-auto max-w-3xl px-6 pb-32 md:px-10">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-sm text-ink/55 md:text-base">
            The essentials — and the Peptide Agent for everything else.
          </p>
        </div>

        <FaqAccordion items={STATIC_FAQS} />

        {/* Dynamic, usage-sourced group — popular Agent questions; self-hides
            when empty and stays out of the JSON-LD above. */}
        <DynamicFaqs />

        {/* The "dynamic" path: anything not curated above routes to the Agent. */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-gradient-to-br from-[#7EE0B5]/[0.08] to-transparent px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-ink/65">
            Have a question that isn&apos;t here? Ask the Peptide Agent for a
            citation-backed answer.
          </p>
          <Link
            href="/research"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#7EE0B5] px-5 py-2.5 text-sm font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
          >
            <PeptideAgentIcon className="h-4 w-4" />
            Ask the Agent
          </Link>
        </div>

        {/* FAQPage structured data — curated/static questions only, so the
            indexed schema stays stable. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd()) }}
        />
      </section>
    </div>
  )
}

// ── Calculator spotlight preview ──────────────────────────────────────────
// A static mirror of the tool's result cards, using the worked example
// 5 mg vial · 2 mL BAC water · 250 mcg dose → 10 units, 20 doses, 250 mcg/0.1 mL.
function PreviewTile({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-fill px-2 py-2.5 text-center">
      <p className="font-mono text-xl font-semibold leading-none tabular-nums text-accent">
        {value}
      </p>
      <p className="mt-1 text-[9px] leading-tight text-ink/55">{unit}</p>
    </div>
  )
}

// Compact U-100 syringe drawn on a 0–20 unit scale (a zoomed view of the tool's
// full 0–100 barrel) filled to 10 units — the payoff of the worked example.
function ReconPreviewSyringe() {
  const MAX = 20
  const units = 10
  const BX = 44 // barrel origin x
  const BW = 250 // barrel width
  const BY = 22 // barrel origin y
  const BH = 24 // barrel height
  const fillW = (units / MAX) * BW
  const majors = [0, 5, 10, 15, 20]
  const minors = Array.from({ length: MAX + 1 }, (_, i) => i).filter((i) => i % 5 !== 0)
  const grey = 'rgba(120,130,150,'

  return (
    <svg
      viewBox="0 0 350 74"
      className="h-auto w-full"
      role="img"
      aria-label={`U-100 insulin syringe filled to ${units} units`}
    >
      {/* Plunger */}
      <rect x="6" y="26" width="14" height="16" rx="2" fill={`${grey}0.55)`} />
      <rect x="20" y="29" width="24" height="10" rx="1.5" fill={`${grey}0.4)`} />

      {/* Barrel */}
      <rect
        x={BX}
        y={BY}
        width={BW}
        height={BH}
        rx="2"
        fill="var(--panel)"
        stroke={`${grey}0.35)`}
        strokeWidth="1"
      />

      {/* Fill + caliper line */}
      <rect x={BX} y={BY} width={fillW} height={BH} rx="2" fill="#7EE0B5" fillOpacity="0.28" />
      <line
        x1={BX + fillW}
        y1={BY - 3}
        x2={BX + fillW}
        y2={BY + BH + 3}
        stroke="#7EE0B5"
        strokeWidth="1.5"
      />

      {/* Minor ticks */}
      {minors.map((t) => {
        const x = BX + (t / MAX) * BW
        return (
          <line key={`min-${t}`} x1={x} y1={BY} x2={x} y2={BY + 4} stroke={`${grey}0.35)`} strokeWidth="0.5" />
        )
      })}

      {/* Major ticks + labels */}
      {majors.map((t) => {
        const x = BX + (t / MAX) * BW
        return (
          <g key={`maj-${t}`}>
            <line x1={x} y1={BY} x2={x} y2={BY + 7} stroke={`${grey}0.6)`} strokeWidth="1" />
            <text
              x={x}
              y={BY - 4}
              textAnchor="middle"
              className="fill-ink/40"
              style={{ fontSize: '8px', fontFamily: 'monospace' }}
            >
              {t}
            </text>
          </g>
        )
      })}

      {/* Needle hub + needle */}
      <polygon
        points={`${BX + BW},${BY} ${BX + BW + 12},${BY + 5} ${BX + BW + 12},${BY + BH - 5} ${BX + BW},${BY + BH}`}
        fill={`${grey}0.5)`}
      />
      <line
        x1={BX + BW + 12}
        y1={BY + BH / 2}
        x2={BX + BW + 52}
        y2={BY + BH / 2}
        stroke={`${grey}0.5)`}
        strokeWidth="1.5"
      />

      {/* Dose label */}
      <rect
        x={BX + fillW - 20}
        y={BY + BH + 6}
        width="40"
        height="15"
        rx="3"
        fill="#7EE0B5"
        fillOpacity="0.15"
        stroke="#7EE0B5"
        strokeOpacity="0.4"
        strokeWidth="0.75"
      />
      <text
        x={BX + fillW}
        y={BY + BH + 16}
        textAnchor="middle"
        className="fill-[#7EE0B5]"
        style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 600 }}
      >
        10 u
      </text>
    </svg>
  )
}
