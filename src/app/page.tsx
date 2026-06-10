import Link from 'next/link'
import { ArrowRight, Dna, BarChart3, FlaskConical, Search, Sparkles, Telescope } from 'lucide-react'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'
import WaitlistForm from '@/components/WaitlistForm'

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
    badge: 'Interactive Builder',
    href: '/compounds/builder',
    description:
      'Build a peptide residue by residue and watch mass, hydropathy, and net charge update live. Clear chemistry challenges to earn XP — a hands-on way to learn sequence design.',
  },
  {
    Icon: Sparkles,
    name: 'Research Agent',
    badge: 'AI Assistant',
    href: '/research',
    description:
      'Ask in plain language and get citation-backed answers — the agent cross-references PubChem structures, ClinicalTrials.gov studies, and mechanisms into structured evidence.',
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
    <div className="home relative min-h-screen overflow-hidden bg-[#0B1220] text-white">

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

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-12 md:px-10 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Status badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-4 py-1.5 text-xs font-medium text-[#2DD4A8]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4A8] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4A8]" />
              </span>
              AI Research Platform · Peptide Science
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl">
              <span className="text-white">From Sequence</span>
              <br />
              <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
                to Evidence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl lg:mx-0">
              Design peptides residue by residue, trace every mechanism to the receptor, and
              verify claims against cross-referenced PubChem structures and live
              ClinicalTrials.gov data — built for researchers who think at the molecular level.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/compounds/builder"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-8 py-3.5 text-[15px] font-semibold text-[#0B1220] shadow-[0_0_0px_rgba(45,212,168,0)] transition-all hover:bg-[#34ddb0] hover:shadow-[0_0_40px_rgba(45,212,168,0.35)]"
              >
                Open PeptideForge
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-[15px] font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                Explore the research
              </Link>
            </div>
          </div>

          {/* Right — molecular visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroMolecule />
          </div>
        </div>

        {/* Peptide sequence decoration */}
        <div className="mx-auto mt-14 max-w-xl overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025] px-5 py-3.5 text-center font-mono text-xs md:text-sm">
          <span className="text-white/30">sequence · </span>
          <span className="text-[#2DD4A8]/80">HKIGAQKYFLNHSGECGFHKIGAQK</span>
          <span className="text-white/30"> · residues: 25 · purity </span>
          <span className="text-[#2DD4A8]">≥ 98%</span>
        </div>

        {/* Synthesis patience line */}
        <p className="mt-4 text-center text-xs tracking-wide text-white/25 italic">
          Purity is what happens while you wait.
        </p>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold tracking-tight text-[#2DD4A8] md:text-4xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-white/50 md:text-sm">{label}</div>
            </div>
          ))}
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
                entry carries mechanism, sequence, and PubChem-enriched chemistry, with
                manufacturing and quality context from the synthesis guide.
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
          <p className="text-sm text-white/55 md:text-base">
            Four integrated tools. One unified research environment.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, name, badge, href, description }) => (
            <Link
              key={name}
              href={href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/30 hover:bg-white/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.14)]"
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
              <p className="flex-1 text-sm leading-relaxed text-white/55">{description}</p>

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
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
          <p className="text-sm text-white/55 md:text-base">
            Search → Analyze → Discover
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ Icon, name, description }, idx) => (
            <div
              key={name}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.03]"
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

      {/* ── Marketplace Waitlist ── */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-32 md:px-10">
        <div className="mb-5 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/45">
            <Sparkles className="h-3 w-3 text-[#2DD4A8]/70" />
            Marketplace · In development
          </div>
          <h2 className="mb-2 text-xl font-semibold tracking-tight md:text-2xl">
            Good peptides make you wait.
            <br />
            <span className="text-white/50">So does the marketplace.</span>
          </h2>
          <p className="mx-auto max-w-md text-[13px] leading-relaxed text-white/40">
            Each coupling step is 30–60 minutes. A 40-residue chain takes days
            on the synthesizer, then HPLC, then lyophilization. The wait is the
            COA. Vetted suppliers, third-party certificates, per-mg pricing —
            worth it when it arrives.
          </p>
        </div>
        <WaitlistForm
          source="home"
          variant="full"
          heading="Join the waitlist"
          description="Researchers get early access. Suppliers can request onboarding."
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
