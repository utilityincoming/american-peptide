import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Cpu,
  Droplets,
  Factory,
  FileCheck2,
  Filter,
  Flag,
  FlaskConical,
  PencilRuler,
  Replace,
  Scissors,
  ShieldCheck,
  Snowflake,
  TestTubes,
  Thermometer,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { STAGES, ECONOMICS, COLD_CHAIN } from '@/lib/synthesis'
import SynthesisWalk from '@/components/SynthesisWalk'

const SITE = 'https://americanpeptide.com'

const ICONS: Record<string, LucideIcon> = {
  PencilRuler,
  Cpu,
  Scissors,
  Filter,
  Replace,
  Snowflake,
  TestTubes,
  FileCheck2,
  Truck,
  FlaskConical,
  ShieldCheck,
  Users,
  Droplets,
  Thermometer,
}

export const metadata: Metadata = {
  title: 'How Peptides Are Made — Synthesis, Cost & Cold Chain | AmericanPeptide.com',
  description:
    'The real manufacturing pipeline behind a pure research peptide: solid-phase synthesis, HPLC purification, lyophilization, QC and the certificate of analysis — what the equipment and operations actually cost, and what it takes to hold purity from the reactor to your bench.',
  alternates: { canonical: `${SITE}/synthesis` },
  openGraph: {
    title: 'How Peptides Are Made — Synthesis, Cost & Cold Chain',
    description:
      'The real pipeline behind a pure research peptide — synthesis, purification, lyophilization, QC — what it costs, and how purity is kept across distribution.',
    url: `${SITE}/synthesis`,
    type: 'article',
  },
}

export default function SynthesisPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'How Research Peptides Are Actually Made',
    description:
      'The end-to-end manufacturing pipeline behind a pure research peptide — synthesis, purification, lyophilization, and quality control — the cost of the equipment and operations, and the logistics of holding purity across distribution.',
    url: `${SITE}/synthesis`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: STAGES.map((s) => ({ '@type': 'Thing', name: s.title })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Synthesis',
        item: `${SITE}/synthesis`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Factory className="h-4 w-4 text-accent" />
          Synthesis
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
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
            How a pure peptide is{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              actually made
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Behind every vial is a chain of expensive, exacting operations — from
            an automated synthesizer to preparative HPLC, freeze-drying, and a
            certificate of analysis. Walk the real pipeline, see what it costs,
            and learn why purity is won in the lab and lost in the supply chain.
            The more you understand the process, the harder you are to fool.
          </p>
        </div>
      </section>

      {/* ── Pipeline rail (visual) ── */}
      <section className="border-b border-ink/[0.06] px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-ink/35">
            The pipeline, end to end
          </p>
          <ol className="flex gap-2 overflow-x-auto pb-2">
            {STAGES.map((s) => {
              const Icon = ICONS[s.icon] ?? FlaskConical
              return (
                <li key={s.slug} className="flex items-center gap-2">
                  <a
                    href={`#${s.slug}`}
                    className="group flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl border border-ink/[0.07] bg-ink/[0.025] px-2 py-3 text-center transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-accent">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-[10px] font-medium leading-tight text-ink/60 group-hover:text-ink/85">
                      {s.title.split(' (')[0]}
                    </span>
                  </a>
                  {s.num < STAGES.length && (
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink/20" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── Stage walk (scrollytelling) ── */}
      <SynthesisWalk stages={STAGES} />

      {/* ── Economics ── */}
      <section className="border-t border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            What it actually costs
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink/50">
            A genuine, well-characterized peptide can&apos;t be a commodity —
            and once you see the capital and coordination behind it, the
            suspiciously cheap vial starts telling on itself. Here is the wall a
            real operation pays to stand behind every batch.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ECONOMICS.map((item) => {
              const Icon = ICONS[item.icon] ?? FlaskConical
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5"
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mb-1 text-sm font-semibold tracking-tight">
                    {item.label}
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-ink/50">
                    {item.note}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Cold chain ── */}
      <section className="border-t border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            The cold chain
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink/50">
            Purity is won in the lab and lost in transit. Every hand-off between
            synthesis and your bench is a chance to spend the material&apos;s
            stability budget — which is exactly why a short, cold, accountable
            domestic supply chain is worth demanding.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLD_CHAIN.map((item) => {
              const Icon = ICONS[item.icon] ?? Snowflake
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5"
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A8]/12 text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mb-1 text-sm font-semibold tracking-tight">
                    {item.label}
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-ink/50">
                    {item.note}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Provenance / American standard ── */}
      <section className="border-t border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#2DD4A8]/15 bg-gradient-to-br from-[#2DD4A8]/[0.06] to-transparent p-7 md:p-9">
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-accent">
              <Flag className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h2 className="mb-3 max-w-2xl text-2xl font-bold tracking-tight md:text-3xl">
              What &ldquo;Made in America&rdquo; should mean
            </h2>
            <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-ink/65">
              <p>
                American researchers deserve the real thing — peptides{' '}
                <span className="text-ink/90">synthesized</span> here, purified
                here, and documented here, by people who put their name on the
                batch record. We have the chemists, the instruments, and the
                standards to do every step on this page on home soil.
              </p>
              <p>
                Be precise about the claim. Finishing or vialing an imported
                intermediate is real work, but it is not the same as making the
                peptide. The strongest provenance is full-stack: synthesis
                through certificate of analysis under one accountable, domestic
                roof — with a short, cold supply chain between the lab and your
                bench.
              </p>
              <p className="text-ink/80">
                Don&apos;t settle for a flag on a label. Ask where the peptide
                was synthesized, ask for the batch-specific COA, and reward the
                operations that can answer. That&apos;s how the American Peptide
                standard gets built — by demanding it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-ink/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row">
          <Link
            href="/catalog"
            className="group flex flex-1 items-center justify-between rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
          >
            <div>
              <h3 className="text-sm font-semibold">Browse the catalog</h3>
              <p className="mt-0.5 text-[12.5px] text-ink/45">
                Apply what you&apos;ve learned to specific research peptides.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/glossary"
            className="group flex flex-1 items-center justify-between rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
          >
            <div>
              <h3 className="text-sm font-semibold">Read the glossary</h3>
              <p className="mt-0.5 text-[12.5px] text-ink/45">
                COA, HPLC, lyophilization, endotoxin — the terms in plain
                English.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-amber-400/65">
            <span className="font-semibold text-amber-400/85">
              Research use only.
            </span>{' '}
            This page is an educational reference on manufacturing and quality,
            not medical advice, a dosing protocol, or an offer for sale. Cost
            figures are general industry ranges for context, not quotes.
            Independent validation required for any experimental use.
          </p>
        </div>
      </section>
    </div>
  )
}
