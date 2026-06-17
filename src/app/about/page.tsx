import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Beaker,
  BookOpen,
  Bot,
  FlaskConical,
  Info,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { PEPTIDES } from '@/lib/peptides'

const SITE = 'https://www.americanpeptide.com'

// Community channel. Telegram is the first live channel — a feedback loop for
// the Peptide Agent. Private group invite link.
const TELEGRAM_URL = 'https://t.me/+17FKLWux_OQyOGEx'

export const metadata: Metadata = {
  title: 'About — Building the Trust Layer for Peptide Research | AmericanPeptide.com',
  description:
    'AmericanPeptide.com is an AI-assisted research platform and open reference for peptide science. Learn who we are, the principles behind the Peptide Agent and open catalog, and how to reach us.',
  alternates: { canonical: `${SITE}/about` },
  openGraph: {
    title: 'About AmericanPeptide.com — The Trust Layer for Peptide Research',
    description:
      'An AI-assisted research platform and open reference for peptide science. Research-grade, credit-free, and built in the open.',
    url: `${SITE}/about`,
    type: 'website',
  },
}

const principles = [
  {
    Icon: ShieldCheck,
    title: 'Research-grade, not medical',
    body: 'Everything here is for computational research and education. We publish mechanisms, chemistry, and evidence — never dosing protocols, diagnoses, or treatment advice.',
  },
  {
    Icon: BookOpen,
    title: 'Open by default',
    body: `The full ${PEPTIDES.length}-peptide catalog is free to read, query, and redistribute under CC BY 4.0 — with a markdown twin and MCP server so agents can cite it directly.`,
  },
  {
    Icon: BadgeCheck,
    title: 'Grounded in sources',
    body: 'Agent answers and reference pages trace back to PubChem, UniProt, PubMed, and ClinicalTrials.gov. Claims carry citations; computational outputs are flagged as hypotheses.',
  },
  {
    Icon: Sparkles,
    title: 'Credit-free to start',
    body: 'The core tools — the Agent, the catalog, the calculators, the COA decoder — are usable without an account or a paywall. We earn trust before we ask for anything.',
  },
]

const pillars = [
  {
    Icon: Bot,
    label: 'Peptide Agent',
    body: 'A citation-backed research assistant for mechanisms, synthesis, and clinical evidence — with live grounding tools.',
    href: '/research',
  },
  {
    Icon: FlaskConical,
    label: 'Open catalog',
    body: `${PEPTIDES.length} peptides with PubChem-enriched chemistry, sequences, identifiers, and editorial background.`,
    href: '/catalog',
  },
  {
    Icon: Beaker,
    label: 'Hands-on tools',
    body: 'Reconstitution and blend calculators, a COA decoder, a compound builder, and synthesis walkthroughs.',
    href: '/tools/reconstitution-calculator',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Info className="h-4 w-4 text-accent" />
          About
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <ShieldCheck className="h-3 w-3" />
            The trust layer for peptide research
          </div>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Peptide science, made{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              legible and honest
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Peptide research is moving fast and the public record is messy —
            scattered across PubChem entries, trial registries, vendor PDFs, and
            forum lore. AmericanPeptide.com pulls that record into one place an
            AI agent can read, cite, and reason over — so researchers can see how
            a peptide is designed, synthesized, purified, and proven, with the
            sources attached.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl space-y-14">
          {/* ── Story / mission ── */}
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Why we exist
              </h2>
              <p className="text-sm leading-relaxed text-ink/65 md:text-[15px]">
                Most peptide information online sits at one of two extremes:
                dense primary literature written for specialists, or marketing
                copy written to sell. The middle — accurate, sourced, plainly
                explained — barely exists. That gap is where bad decisions get
                made.
              </p>
              <p className="text-sm leading-relaxed text-ink/65 md:text-[15px]">
                We&apos;re building the middle. A research-grade reference layered
                over the free public datasets, an AI agent that answers from
                those sources instead of inventing them, and tooling that turns
                a certificate of analysis or a reconstitution math problem from a
                guessing game into a checklist. The goal is simple: when someone
                asks a question about a peptide, the honest, cited answer should
                be the easiest one to find.
              </p>
              <p className="text-sm leading-relaxed text-ink/65 md:text-[15px]">
                AmericanPeptide.com is the name on that effort because the domain
                should be an authority asset, not a storefront. We treat it that
                way.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-6">
              <h3 className="mb-4 text-sm font-semibold text-ink">
                What we&apos;re not
              </h3>
              <ul className="space-y-3 text-sm leading-relaxed text-ink/55">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  Not a pharmacy, clinic, or source of medical advice.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  Not a place that publishes dosing protocols.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  Not a black box — outputs are hypotheses, with sources shown.
                </li>
              </ul>
            </div>
          </div>

          {/* ── What we build (pillars) ── */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
              What we build
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {pillars.map(({ Icon, label, body, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-1.5 flex items-center gap-1 text-sm font-semibold">
                    {label}
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-accent opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </h3>
                  <p className="text-xs leading-relaxed text-ink/50">{body}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Principles ── */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
              Our principles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {principles.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
                  <p className="text-xs leading-relaxed text-ink/50">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Community & feedback ── */}
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              Community &amp; feedback
            </h2>
            <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink/55">
              The Peptide Agent gets better when researchers tell us where it&apos;s
              right, where it&apos;s wrong, and what&apos;s missing. We run an open
              channel for exactly that — flag an answer, suggest a catalog
              addition, or compare notes with other researchers.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Telegram — the live channel */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-6 transition-colors hover:border-[#2DD4A8]/40"
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DD4A8] text-[#0B1220]">
                      <Send className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Telegram group</h3>
                        <span className="rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-ink/45">
                        Peptide Agent feedback · invite-only
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/60">
                    The Peptide Agent feedback loop. Drop a question the Agent got
                    wrong, a study it should know about, or a peptide we&apos;re
                    missing — corrections feed straight back into the catalog and
                    the Agent&apos;s grounding.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Accept invite &amp; join
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>

              {/* X — live channel */}
              <a
                href="https://x.com/USPeptide"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-6 transition-colors hover:border-[#2DD4A8]/40"
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DD4A8] text-[#0B1220]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">X</h3>
                        <span className="rounded-full border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-ink/45">@USPeptide</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/60">
                    Release notes, new catalog entries, and notable peptide
                    research as we publish it.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Follow on X
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            </div>
          </div>

          {/* ── Contact (nested subsection → /about/contact) ── */}
          <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold">Contact us</h2>
                </div>
                <p className="text-sm leading-relaxed text-ink/55">
                  Corrections, data questions, partnership and supplier
                  inquiries, or press — reach the team directly. We read
                  everything and reply to research and correction notes first.
                </p>
              </div>
              <Link
                href="/about/contact"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0]"
              >
                Get in touch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── Research disclaimer echo ── */}
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
            <p className="text-xs leading-relaxed text-amber-400/60">
              <span className="font-semibold text-amber-400/80">
                Research use only:{' '}
              </span>
              AmericanPeptide.com is an AI-assisted computational research
              platform, not a medical device or clinical decision-support
              system. All outputs are computational hypotheses requiring
              independent experimental validation, and nothing here is medical
              advice or an offer for sale.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
