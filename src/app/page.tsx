import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Dna, BarChart3, FlaskConical, Search, Sparkles, Syringe, Telescope } from 'lucide-react'
import { PEPTIDES, LISTED_PEPTIDES, CATEGORIES } from '@/lib/peptides'
import { STATIC_FAQS, faqPageJsonLd } from '@/lib/faqs'
import FaqAccordion from '@/components/FaqAccordion'
import DynamicFaqs from '@/components/DynamicFaqs'

// Self-referencing canonical for the home page. Title, description, and the
// OpenGraph/Twitter cards are inherited from the root layout's metadata; this
// only pins the canonical URL (and its og:url), which the layout can't set
// per-route.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

const SPOTLIGHT_SLUGS = [
  'semaglutide',
  'tirzepatide',
  'retatrutide',
  'bpc-157',
  'pt-141',
  'ghk-cu',
  'mots-c',
  'epitalon',
] as const

const features = [
  {
    Icon: Sparkles,
    name: 'Peptide Agent',
    badge: 'AI Assistant',
    href: '/research',
    description:
      'Ask in plain language and get citation-backed answers — the agent cross-references PubChem structures, ClinicalTrials.gov studies, and mechanisms into structured evidence.',
  },
  {
    Icon: Dna,
    name: 'PeptideForge',
    badge: 'Interactive Builder',
    href: '/compounds/builder',
    description:
      'Build a peptide residue by residue and watch mass, hydropathy, and net charge update live. Clear chemistry challenges to earn XP — a hands-on way to learn sequence design.',
  },
  {
    Icon: BarChart3,
    name: 'ClinicalPulse',
    badge: 'Trial Intelligence',
    href: '/trials',
    description:
      'Real-time surveillance of peptide-based clinical trials across ClinicalTrials.gov and WHO ICTRP. Surface recruitment trends, endpoint shifts, and competitive pipeline movements.',
  },
  {
    Icon: FlaskConical,
    name: 'Compound Search',
    badge: 'PubChem Explorer',
    href: '/compounds',
    description:
      'Search PubChem for peptides and small molecules. Inspect 2D structures, molecular formulae, and weights, then jump straight to the underlying NIH compound record for deeper review.',
  },
]

const stats = [
  { value: '37M+', label: 'Biomedical Citations (PubMed)' },
  { value: '400K+', label: 'Compounds Searchable via PubChem' },
  { value: '500K+', label: 'Clinical Trials Indexed' },
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

export default function HomePage() {
  return (
    <div className="home relative min-h-screen overflow-hidden bg-surface text-ink">

      {/* ── Background layer ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-32 left-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#2DD4A8] opacity-[0.08] blur-[140px]" />
        <div className="absolute top-2/3 right-1/4 h-96 w-96 rounded-full bg-[#2DD4A8] opacity-[0.04] blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/60" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-12 md:px-10 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Status badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-4 py-1.5 text-xs font-medium text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4A8] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4A8]" />
              </span>
              Cited reference · Chemistry-grade · Works offline
            </div>

            {/* Headline — the USP: the only peptide app you can trust */}
            <h1 className="mb-6 text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl">
              <span className="text-ink">The only peptide app</span>
              <br />
              <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
                you can actually trust
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-ink/60 md:text-xl lg:mx-0">
              Cited, chemistry-grade reference plus AI answers that show their sources —
              catalog, calculators, and trial data ready at the bench, even with no signal.
            </p>

            {/* Capability strip — three tools, named */}
            <div className="mx-auto mb-10 grid grid-cols-3 gap-2 lg:mx-0 lg:max-w-lg">
              {[
                {
                  Icon: Dna,
                  label: 'PeptideForge',
                  desc: 'Build residue by residue',
                  href: '/compounds/builder',
                },
                {
                  Icon: Sparkles,
                  label: 'Research Agent',
                  desc: 'Citations included',
                  href: '/research',
                },
                {
                  Icon: BarChart3,
                  label: 'Trial Intelligence',
                  desc: 'Live ClinicalTrials data',
                  href: '/trials',
                },
              ].map(({ Icon, label, desc, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-ink/[0.08] bg-ink/[0.02] px-2 py-3 text-center transition-all hover:border-[#2DD4A8]/30 hover:bg-ink/[0.04]"
                >
                  <Icon className="h-4 w-4 text-[#2DD4A8]/70 transition-colors group-hover:text-[#2DD4A8]" strokeWidth={1.75} />
                  <span className="text-[11px] font-semibold text-ink/80">{label}</span>
                  <span className="text-[10px] leading-tight text-ink/40">{desc}</span>
                </Link>
              ))}
            </div>

            {/* CTAs — the Agent leads; the calculator is the bench tool people
                come back to, so it sits right beside it as a prominent secondary. */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link
                href="/research"
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#2DD4A8] px-6 py-3.5 text-[15px] font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all hover:bg-[#34ddb0] hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]"
              >
                <Sparkles className="h-4 w-4" />
                Ask the Peptide Agent
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/tools/reconstitution-calculator"
                className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.07] px-6 py-3.5 text-[15px] font-semibold text-accent transition-all hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/[0.12]"
              >
                <Syringe className="h-4 w-4" />
                Open the calculator
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/catalog"
                className="group inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2 py-3.5 text-[15px] font-medium text-ink/55 transition-colors hover:text-ink"
              >
                Browse the catalog
                <ArrowRight className="h-4 w-4 text-ink/30 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </div>

            {/* Starter prompt — deep-links into the Agent and auto-asks on load */}
            <p className="mt-5 text-center text-xs text-ink/40 lg:text-left">
              Try:{' '}
              <Link
                href={`/research?q=${encodeURIComponent('What GLP-1 analogs are in Phase 3 trials?')}`}
                className="text-accent/80 underline decoration-accent/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
              >
                &ldquo;What GLP-1 analogs are in Phase 3 trials?&rdquo;
              </Link>
            </p>
          </div>

          {/* Right — molecular visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroMolecule />
          </div>
        </div>

        {/* Real catalog example — links to the entry so the spec is verifiable */}
        <Link
          href="/catalog/bpc-157"
          className="group mx-auto mt-14 flex max-w-xl items-center justify-center gap-x-2 gap-y-1 overflow-hidden rounded-xl border border-ink/[0.06] bg-ink/[0.025] px-5 py-3.5 text-center font-mono text-xs transition-colors hover:border-[#2DD4A8]/25 md:text-sm"
        >
          <span className="text-ink/30">BPC-157 · </span>
          <span className="text-accent/80">GEPPPGKPADDAGLV</span>
          <span className="text-ink/30"> · 15 residues</span>
          <ArrowRight className="h-3.5 w-3.5 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
        </Link>

        {/* Sourcing line — every catalog entry is cited, not asserted */}
        <p className="mt-4 text-center text-xs tracking-wide text-ink/25 italic">
          Every sequence traced to its source — not asserted, cited.
        </p>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-ink/[0.07] pt-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold tracking-tight text-accent md:text-4xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-ink/50 md:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reconstitution Calculator Spotlight ──
          The bench tool people reach for daily. It gets its own real estate
          right below the hero, with a live worked example that deep-links into
          the exact configuration it shows. */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] via-[#2DD4A8]/[0.03] to-transparent p-8 md:p-12">
          {/* Subtle dot pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#2DD4A8] opacity-[0.08] blur-[120px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            {/* Left — copy + CTA */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                <Syringe className="h-3 w-3" />
                Bench tool · Works offline
              </div>

              <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
                Every dose, down to the
                <br />
                <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
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
                      className="rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-2.5 py-1 text-[11px] text-ink/60"
                    >
                      {f}
                    </span>
                  ),
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/tools/reconstitution-calculator"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-6 py-3 text-sm font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all hover:bg-[#34ddb0] hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]"
                >
                  <Syringe className="h-4 w-4" />
                  Open the calculator
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/tools/calculator-beta"
                  className="text-xs text-ink/45 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/50"
                >
                  or try the beta — GLP-1 pen mode &amp; reverse-dose solver
                </Link>
              </div>
            </div>

            {/* Right — live worked example, deep-linked into the tool */}
            <Link
              href="/tools/reconstitution-calculator?vial=5&dose=250&water=2"
              aria-label="Open this worked example in the reconstitution calculator: 5 mg vial, 2 mL bacteriostatic water, 250 mcg dose"
              className="group relative block rounded-2xl border border-ink/[0.08] bg-panel p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:border-[#2DD4A8]/30 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
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
          className="group relative block overflow-hidden rounded-3xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] via-[#2DD4A8]/[0.03] to-transparent p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2DD4A8]/35 hover:shadow-[0_24px_80px_-16px_rgba(45,212,168,0.14)] md:p-12"
        >
          {/* Subtle dot pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#2DD4A8] opacity-[0.08] blur-[120px] transition-opacity duration-500 group-hover:opacity-[0.14]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            {/* Left column */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                <Sparkles className="h-3 w-3" />
                Now live
              </div>

              <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
                The peptide reference
                <br />
                <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
                  catalog is live.
                </span>
              </h2>

              <p className="mb-6 max-w-md text-[15px] leading-relaxed text-ink/55">
                Browse {LISTED_PEPTIDES.length} research peptides across {CATEGORIES.length} categories — each
                entry carries mechanism, sequence, and PubChem-enriched chemistry, with
                manufacturing and quality context from the synthesis guide.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-6 py-3 text-sm font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all group-hover:bg-[#34ddb0] group-hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]">
                  Open Catalog
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-xs text-ink/35">
                  {LISTED_PEPTIDES.filter((p) => p.fdaApproved).length} FDA-approved · {LISTED_PEPTIDES.filter((p) => p.sequence).length} with full sequence
                </span>
              </div>
            </div>

            {/* Right column — peptide preview chips */}
            <div className="relative">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/35">
                Featured entries
              </p>
              <div className="flex flex-wrap gap-2">
                {SPOTLIGHT_SLUGS.map((slug) => {
                  const p = PEPTIDES.find((x) => x.slug === slug)
                  if (!p) return null
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-2.5 py-1.5 text-xs text-ink/70 transition-colors group-hover:border-[#2DD4A8]/20 group-hover:bg-ink/[0.05]"
                    >
                      {p.name}
                      {p.fdaApproved && (
                        <span className="rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-accent">
                          FDA
                        </span>
                      )}
                    </span>
                  )
                })}
                <span className="inline-flex items-center rounded-lg border border-dashed border-ink/[0.12] bg-transparent px-2.5 py-1.5 text-xs text-ink/40">
                  +{LISTED_PEPTIDES.length - SPOTLIGHT_SLUGS.length} more
                </span>
              </div>

              <div className="mt-5 border-t border-ink/[0.06] pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/35">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md border border-ink/[0.06] bg-ink/[0.02] px-2 py-0.5 text-[10px] text-ink/50"
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
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-32 md:px-10">
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
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-8 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/30 hover:bg-ink/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.14)]"
            >
              {/* Top accent line revealed on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2DD4A8]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon */}
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-accent">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
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
              className="relative rounded-2xl border border-ink/[0.06] bg-ink/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/[0.12] hover:bg-ink/[0.03]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.08] text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] text-ink/30">
                  Step {idx + 1}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold">{name}</h3>
              <p className="text-sm leading-relaxed text-ink/45">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sourcing Standard ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 md:px-10">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#2DD4A8]/15 bg-gradient-to-br from-[#2DD4A8]/[0.06] via-transparent to-transparent p-8 md:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            <FlaskConical className="h-3 w-3" />
            The sourcing standard
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
            Every source,{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              in the open.
            </span>
          </h2>
          <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink/55 md:text-base">
            The labs worth knowing show their work - sequences traced, testing
            published, put in the open. The sourcing standard brings them together
            and ranks them on exactly that, so the community built on this science
            finds its sources by signal alone.
          </p>
          <Link
            href="/us-peptides"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-[#5EEBC8]"
          >
            Explore the sourcing standard
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
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-ink/65">
            Have a question that isn&apos;t here? Ask the Peptide Agent for a
            citation-backed answer.
          </p>
          <Link
            href="/research"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0]"
          >
            <Sparkles className="h-4 w-4" />
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

// ── Animated peptide-chain hero visual (CSS-only motion, respects reduced motion) ──
function HeroMolecule() {
  const nodes = [
    { x: 70, y: 285 },
    { x: 130, y: 225 },
    { x: 195, y: 290 },
    { x: 258, y: 222 },
    { x: 320, y: 288 },
    { x: 360, y: 228 },
  ]
  const sideChains = [
    { x1: 130, y1: 225, x2: 130, y2: 180 },
    { x1: 195, y1: 290, x2: 195, y2: 332 },
    { x1: 258, y1: 222, x2: 258, y2: 176 },
    { x1: 320, y1: 288, x2: 320, y2: 330 },
  ]

  return (
    <div className="relative aspect-square w-full">
      <svg
        viewBox="0 0 420 420"
        className="h-full w-full"
        role="img"
        aria-label="Stylized peptide chain"
      >
        <defs>
          <radialGradient id="hm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#2DD4A8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2DD4A8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hm-node" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#8ef3da" />
            <stop offset="55%" stopColor="#2DD4A8" />
            <stop offset="100%" stopColor="#0f7a63" />
          </radialGradient>
        </defs>

        {/* Soft glow */}
        <circle cx="210" cy="252" r="180" fill="url(#hm-glow)" />

        {/* Slow orbital ring */}
        <g className="hero-orbit" style={{ transformOrigin: '210px 248px' }}>
          <circle
            cx="210"
            cy="248"
            r="158"
            fill="none"
            stroke="rgba(45,212,168,0.16)"
            strokeWidth="1"
            strokeDasharray="3 9"
          />
          <circle cx="210" cy="90" r="4" fill="#2DD4A8" fillOpacity="0.6" />
          <circle cx="368" cy="248" r="3" fill="#5EEBC8" fillOpacity="0.5" />
          <circle cx="120" cy="372" r="3.5" fill="#2DD4A8" fillOpacity="0.45" />
        </g>

        {/* Peptide chain */}
        <g className="hero-float">
          {/* Side chains */}
          {sideChains.map((s, i) => (
            <g key={`sc-${i}`}>
              <line
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="rgba(45,212,168,0.35)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx={s.x2} cy={s.y2} r="6" fill="#2DD4A8" fillOpacity="0.55" />
            </g>
          ))}

          {/* Backbone bonds */}
          <polyline
            points={nodes.map((n) => `${n.x},${n.y}`).join(' ')}
            fill="none"
            stroke="rgba(45,212,168,0.55)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Residue nodes */}
          {nodes.map((n, i) => (
            <g key={`n-${i}`} className="hero-node" style={{ animationDelay: `${i * 0.4}s` }}>
              <circle
                cx={n.x}
                cy={n.y}
                r={i === 0 || i === nodes.length - 1 ? 13 : 16}
                fill="url(#hm-node)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <circle cx={n.x - 5} cy={n.y - 5} r="3" fill="#ffffff" fillOpacity="0.5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ── Calculator spotlight preview ──────────────────────────────────────────
// A static mirror of the tool's result cards, using the worked example
// 5 mg vial · 2 mL BAC water · 250 mcg dose → 10 units, 20 doses, 250 mcg/0.1 mL.
function PreviewTile({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-2 py-2.5 text-center">
      <p className="font-mono text-xl font-semibold leading-none tabular-nums text-accent">
        {value}
      </p>
      <p className="mt-1 text-[9px] leading-tight text-ink/45">{unit}</p>
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
      <rect x={BX} y={BY} width={fillW} height={BH} rx="2" fill="#2DD4A8" fillOpacity="0.28" />
      <line
        x1={BX + fillW}
        y1={BY - 3}
        x2={BX + fillW}
        y2={BY + BH + 3}
        stroke="#2DD4A8"
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
        fill="#2DD4A8"
        fillOpacity="0.15"
        stroke="#2DD4A8"
        strokeOpacity="0.4"
        strokeWidth="0.75"
      />
      <text
        x={BX + fillW}
        y={BY + BH + 16}
        textAnchor="middle"
        className="fill-[#2DD4A8]"
        style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 600 }}
      >
        10 u
      </text>
    </svg>
  )
}
