import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Beaker,
  Droplets,
  FlaskConical,
  Scale,
  ShieldAlert,
  Snowflake,
} from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Compatibility & Stability — Mixing, Degradation & Handling | AmericanPeptide.com',
  description:
    'The chemistry of peptide compatibility and stability: how peptides degrade, the factors that decide whether they can be combined, reconstitution and storage handling, and why blending un-characterized peptides multiplies risk.',
  alternates: { canonical: `${SITE}/learn/compatibility` },
  openGraph: {
    title: 'Peptide Compatibility & Stability',
    description:
      'How peptides degrade, what decides whether they can be combined, and how to handle and store them — the research-use chemistry.',
    url: `${SITE}/learn/compatibility`,
    type: 'article',
  },
}

const FACTORS = [
  {
    Icon: Droplets,
    title: 'Solvent & pH overlap',
    body: 'Each peptide has a reconstitution solvent and pH it’s stable in. Combining peptides that want different solvents or pH ranges pushes at least one outside its comfort zone and speeds its breakdown.',
  },
  {
    Icon: Beaker,
    title: 'Chemical interaction',
    body: 'Some residues react. Oxidation-prone or disulfide-bearing peptides can degrade faster — or scramble — in the presence of others, especially over time in solution.',
  },
  {
    Icon: Scale,
    title: 'Stability timelines',
    body: 'Peptides degrade at different rates once in solution. A blend is only as stable as its least-stable component, and you can no longer test any single one against its certificate of analysis.',
  },
]

const DEGRADATION = [
  ['Oxidation', 'Methionine, cysteine, and tryptophan residues react with oxygen — accelerated by light, heat, and time in solution.'],
  ['Hydrolysis', 'Water cleaves peptide bonds; faster at unfavorable pH and temperature.'],
  ['Deamidation', 'Asparagine and glutamine slowly convert, changing the molecule’s identity and charge.'],
  ['Aggregation', 'Peptides clump and fall out of solution — sometimes visibly, often not.'],
  ['Disulfide scrambling', 'Cysteine bridges re-pair incorrectly, producing inactive or altered species.'],
  ['Adsorption', 'Peptide sticks to glass and plastic surfaces, quietly lowering the delivered amount.'],
]

export default function CompatibilityGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Peptide Compatibility & Stability',
    description:
      'The chemistry of peptide compatibility, degradation, and handling — and why blending un-characterized peptides multiplies risk.',
    url: `${SITE}/learn/compatibility`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE}/learn` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Compatibility & stability',
        item: `${SITE}/learn/compatibility`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link href="/learn" className="text-sm text-white/35 transition-colors hover:text-white">
          Learn
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm font-medium">Compatibility &amp; stability</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Peptide compatibility{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              &amp; stability
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Whether two peptides can be combined — and how long any peptide
            stays intact — is chemistry, not folklore. Here&apos;s what actually
            degrades peptides, what decides compatibility, and why careless
            mixing or storage quietly throws away the purity you paid for.
          </p>
        </div>
      </section>

      {/* ── Three factors ── */}
      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            What decides compatibility
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white/50">
            Three physicochemical factors govern whether peptides can share a
            solution without degrading each other faster.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {FACTORS.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-[#2DD4A8]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h3 className="mb-1 text-sm font-semibold tracking-tight">{title}</h3>
                <p className="text-[12.5px] leading-relaxed text-white/50">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Degradation pathways ── */}
      <section className="border-t border-white/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            How peptides degrade
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white/50">
            Degradation is invisible to the eye — a clear solution can be well
            on its way to breaking down. The common pathways:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEGRADATION.map(([term, desc]) => (
              <div
                key={term}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <p className="mb-0.5 text-sm font-semibold text-white/85">{term}</p>
                <p className="text-[12.5px] leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Handling principles ── */}
      <section className="border-t border-white/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
            Handling principles
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed text-white/65">
            <li className="flex gap-3">
              <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4A8]/70" />
              <span>
                <span className="font-medium text-white/85">Reconstitute each peptide in its own vial.</span>{' '}
                It&apos;s the standard for a reason — it keeps every component in
                a known solvent and preserves your ability to verify each one.
              </span>
            </li>
            <li className="flex gap-3">
              <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4A8]/70" />
              <span>
                <span className="font-medium text-white/85">Don&apos;t co-store a blend.</span>{' '}
                Combining lyophilized or reconstituted peptides into one vial for
                storage accelerates degradation of the least-stable member.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4A8]/70" />
              <span>
                <span className="font-medium text-white/85">Protect from heat, light, freeze–thaw.</span>{' '}
                Refrigerate reconstituted material, minimize time in solution,
                and never freeze–thaw repeatedly.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Why blending multiplies risk ── */}
      <section className="border-t border-white/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#2DD4A8]/15 bg-gradient-to-br from-[#2DD4A8]/[0.06] to-transparent p-7 md:p-9">
            <h2 className="mb-3 max-w-2xl text-2xl font-bold tracking-tight md:text-3xl">
              Why combining un-characterized peptides multiplies risk
            </h2>
            <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-white/65">
              <p>
                The moment you blend peptides, you lose the one thing that lets
                you trust a powder you can&apos;t see into: the ability to test
                each component against its own certificate of analysis. A mixed
                solution can&apos;t be checked the way a single peptide can.
              </p>
              <p>
                Real co-formulation — combining drugs into one product — is
                formulation science: stability studies, sterility, controlled
                fill-finish. DIY syringe blending is the opposite of that, and
                the honest caveat is that{' '}
                <span className="text-white/85">
                  very little formal research has studied multi-peptide
                  combinations as they&apos;re actually used
                </span>
                . Each added peptide is another variable nobody has
                characterized for that mixture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section className="border-t border-white/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-lg font-semibold tracking-tight">
            Related tools{' '}
            <span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
              Beta
            </span>
          </h2>
          <p className="mb-5 text-xs text-white/40">
            Experimental, research-use tools. Considerations only — not
            administration or dosing guidance.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/tools/blend-calculator"
              className="group flex flex-1 items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all hover:border-[#2DD4A8]/25 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-[#2DD4A8]" strokeWidth={1.75} />
                <div>
                  <h3 className="text-sm font-semibold">Blend calculator</h3>
                  <p className="mt-0.5 text-[12.5px] text-white/45">
                    Doses, draw volume, and per-dose delivery for a blend.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#2DD4A8] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
            <p className="text-[11px] leading-relaxed text-amber-400/65">
              <span className="font-semibold text-amber-400/85">
                Research use only.
              </span>{' '}
              This guide is educational and does not constitute medical advice,
              dosing protocols, administration guidance, or an offer for sale.
              Independent validation required for any experimental use.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
