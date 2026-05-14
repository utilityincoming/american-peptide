import Link from 'next/link'
import { ArrowRight, Dna, BarChart3, FlaskConical, Search, Sparkles, Telescope } from 'lucide-react'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'

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
    Icon: Dna,
    name: 'PeptideForge',
    badge: 'AI Sequence Design',
    href: '/research',
    description:
      'Generate novel peptide sequences optimized for target binding affinity, metabolic stability, and membrane permeability — powered by models trained on structural biology and proteomics databases.',
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
  { value: '3', label: 'FDA-Approved Melanocortin Agonists' },
  { value: '400K+', label: 'Compounds Searchable via PubChem' },
  { value: '500K+', label: 'Clinical Trials Indexed' },
]

const steps = [
  {
    Icon: Search,
    name: 'Search',
    description:
      'Query PubChem for compounds, ClinicalTrials.gov for studies, or ask the research agent in natural language.',
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
    <div className="relative min-h-screen overflow-hidden bg-[#0B1220] text-white">

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1220]/60" />
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A8]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-5 w-5 text-[#0B1220]"
            >
              <path d="M4 5c4.5 0 7.5 4 7.5 7S15.5 19 20 19" />
              <path d="M20 5c-4.5 0-7.5 4-7.5 7S8.5 19 4 19" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">AmericanPeptide</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/research"
            className="hidden text-sm text-white/50 transition-colors hover:text-white md:block"
          >
            Research
          </Link>
          <Link
            href="/research"
            className="rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-4 py-1.5 text-sm font-medium text-[#2DD4A8] transition-all hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/20"
          >
            Launch App →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 text-center md:px-10 md:pt-24">

        {/* Status badge */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-4 py-1.5 text-xs font-medium text-[#2DD4A8]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4A8] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4A8]" />
          </span>
          AI Research Platform · Peptide Drug Discovery
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-[72px]">
          <span className="text-white">AI&#8209;Powered</span>
          <br />
          <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
            Peptide Drug Discovery
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
          From sequence hypothesis to clinical candidate — accelerate every phase of peptide
          research with AI tools built for computational biologists and medicinal chemists.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/research"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-8 py-3.5 text-[15px] font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all hover:bg-[#34ddb0] hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]"
          >
            Start Research
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-[15px] font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            Explore Features
          </Link>
        </div>

        {/* Peptide sequence decoration */}
        <div className="mx-auto mt-12 max-w-xl rounded-xl border border-white/[0.06] bg-white/[0.025] px-5 py-3.5 font-mono text-xs md:text-sm">
          <span className="text-white/25">sequence · </span>
          <span className="text-[#2DD4A8]/80">HKIGAQKYFLNHSGECGFHKIGAQK</span>
          <span className="text-white/25"> · target: ACE2 · score: </span>
          <span className="text-[#2DD4A8]">0.94</span>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold tracking-tight text-[#2DD4A8] md:text-4xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-white/40 md:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catalog Spotlight ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <Link
          href="/catalog"
          className="group relative block overflow-hidden rounded-3xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] via-[#2DD4A8]/[0.03] to-transparent p-8 transition-all duration-300 hover:border-[#2DD4A8]/35 hover:shadow-[0_20px_80px_rgba(45,212,168,0.10)] md:p-12"
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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2DD4A8]">
                <Sparkles className="h-3 w-3" />
                New · Now live
              </div>

              <h2 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight md:text-[40px]">
                The peptide reference
                <br />
                <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
                  catalog is live.
                </span>
              </h2>

              <p className="mb-6 max-w-md text-[15px] leading-relaxed text-white/55">
                Browse {PEPTIDES.length} research peptides across {CATEGORIES.length} categories — each
                entry carries mechanism, sequence, and PubChem-enriched chemistry. Built to evolve
                into a transparent supplier marketplace.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-6 py-3 text-sm font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all group-hover:bg-[#34ddb0] group-hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]">
                  Open Catalog
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-xs text-white/35">
                  {PEPTIDES.filter((p) => p.fdaApproved).length} FDA-approved · {PEPTIDES.filter((p) => p.sequence).length} with full sequence
                </span>
              </div>
            </div>

            {/* Right column — peptide preview chips */}
            <div className="relative">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Featured entries
              </p>
              <div className="flex flex-wrap gap-2">
                {SPOTLIGHT_SLUGS.map((slug) => {
                  const p = PEPTIDES.find((x) => x.slug === slug)
                  if (!p) return null
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/70 transition-colors group-hover:border-[#2DD4A8]/20 group-hover:bg-white/[0.05]"
                    >
                      {p.name}
                      {p.fdaApproved && (
                        <span className="rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                          FDA
                        </span>
                      )}
                    </span>
                  )
                })}
                <span className="inline-flex items-center rounded-lg border border-dashed border-white/[0.12] bg-transparent px-2.5 py-1.5 text-xs text-white/40">
                  +{PEPTIDES.length - SPOTLIGHT_SLUGS.length} more
                </span>
              </div>

              <div className="mt-5 border-t border-white/[0.06] pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/50"
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
          <p className="text-sm text-white/40 md:text-base">
            Three integrated tools. One unified research environment.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ Icon, name, badge, href, description }) => (
            <Link
              key={name}
              href={href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 transition-all duration-300 hover:border-[#2DD4A8]/25 hover:bg-white/[0.04] hover:shadow-[0_8px_40px_rgba(45,212,168,0.06)]"
            >
              {/* Top accent line revealed on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2DD4A8]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon */}
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-[#2DD4A8]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              {/* Module type */}
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2DD4A8]/60">
                {badge}
              </p>

              {/* Name */}
              <h3 className="mb-3 text-xl font-semibold tracking-tight">{name}</h3>

              {/* Description */}
              <p className="flex-1 text-sm leading-relaxed text-white/45">{description}</p>

              {/* Explore link */}
              <div className="mt-6 flex translate-x-0 items-center gap-1.5 text-sm font-medium text-[#2DD4A8] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                Explore module
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
          <p className="text-sm text-white/40 md:text-base">
            Search → Analyze → Discover
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ Icon, name, description }, idx) => (
            <div
              key={name}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.08] text-[#2DD4A8]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] text-white/30">
                  Step {idx + 1}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold">{name}</h3>
              <p className="text-sm leading-relaxed text-white/45">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
