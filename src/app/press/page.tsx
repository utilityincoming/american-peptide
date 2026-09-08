import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BadgeCheck,
  Check,
  Code2,
  Mail,
  Newspaper,
  Quote,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { LISTED_PEPTIDES, CATEGORIES } from '@/lib/peptides'
import { COMPARISONS } from '@/lib/comparisons'
import { GLOSSARY } from '@/lib/glossary'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { TRUST_WEIGHTS } from '@/lib/vendors'
import { CopyButton, HexSwatch } from './PressCopy'

const SITE = 'https://americanpeptide.com'

// Every headline number is read from the data layer so the kit can't drift out
// of sync with the live catalog — the same discipline the rest of the site uses.
const catalogCount = LISTED_PEPTIDES.length
const categoryCount = CATEGORIES.length
const comparisonCount = COMPARISONS.length
const glossaryCount = GLOSSARY.length
const areaCount = RESEARCH_AREAS.length

export const metadata: Metadata = {
  title: 'Press & Media Kit — AmericanPeptide.com',
  description:
    'Press-ready boilerplate, a fact sheet, the trust Standard, and brand assets for AmericanPeptide.com — the independent, research-grade reference and AI agent for peptide science.',
  alternates: { canonical: `${SITE}/press` },
  openGraph: {
    title: 'Press & Media Kit — AmericanPeptide.com',
    description:
      'Boilerplate, fact sheet, brand assets, and positioning for the trust layer for peptide research.',
    url: `${SITE}/press`,
    type: 'website',
  },
}

// ── Copy-ready boilerplate, three lengths ──────────────────────────────────
const BP_ONE =
  'AmericanPeptide.com is an independent, research-grade reference for peptide science - every claim traced to its source, not asserted.'

const BP_SHORT =
  'AmericanPeptide.com is the trust layer for peptide research: an open, research-grade reference that pulls the scattered public record - PubChem structures, UniProt entries, PubMed literature, and ClinicalTrials.gov studies - into one place people and AI agents can read, cite, and reason over. Free to use, credit-free to start, research-grade not medical.'

const BP_FULL = `AmericanPeptide.com is an independent, AI-assisted research platform and open reference for peptide science. It layers a cited, chemistry-grade catalog of ${catalogCount} peptides - mechanisms, sequences, identifiers, and manufacturing context - over the free public datasets researchers already trust, and adds a citation-backed research agent, hands-on tools (a reconstitution calculator, a COA decoder, a sequence design lab), and a published standard for grading how transparent a source is. The whole catalog is open under CC BY 4.0, with a JSON API and an MCP server so AI agents can cite it directly. Research-grade, not medical: it publishes mechanisms and evidence, never dosing. Every source, in the open.`

// ── The Standard: derived from the live TRUST_WEIGHTS so the bar always sums
//    to whatever the rubric actually is. ─────────────────────────────────────
const STANDARD = [
  { key: 'reshipPolicy', label: 'Reship policy', color: '#2DD4A8', note: 'stands behind a lost or seized order.' },
  { key: 'refundPolicy', label: 'Refund policy', color: '#5EEBC8', note: 'a stated, honored return path.' },
  { key: 'thirdPartyTested', label: 'Third-party tested', color: '#60A5FA', note: 'an outside lab, not the seller.' },
  { key: 'coaOnFile', label: 'COA on file', color: '#818CF8', note: 'a certificate the buyer can actually see.' },
  { key: 'perBatchTesting', label: 'Per-batch testing', color: '#A78BFA', note: 'every lot, not one sample once.' },
] as const

const standardTotal = STANDARD.reduce((sum, s) => sum + TRUST_WEIGHTS[s.key], 0)

const QUOTES = [
  'Every sequence traced to its source - not asserted, cited.',
  "In the AI era, the scarce asset isn't more content. It's a source you can trust and cite.",
  'Research-grade, not medical. We publish mechanisms and evidence, never dosing.',
  'We rank sources on what they show, not what they pay.',
]

const VOICE_NOTES = [
  'Confident and peer-level. It assumes an informed reader and respects their time.',
  'Plain nouns over hype. Specific beats clever, and the claim carries its citation.',
  'Bullish on the science. It frames the unknown as a frontier, never fear to sell against.',
  'The compliance line holds. Meaning and value are implied; health outcomes are never asserted.',
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
      <span className="h-px w-5 bg-accent/50" />
      {children}
    </span>
  )
}

function PeptideMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="AmericanPeptide chain mark">
      <polyline points="6,27 13,19 21,27 29,18 35,25" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="19" x2="13" y2="11" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.7" />
      <line x1="29" y1="18" x2="29" y2="10" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.7" />
      <circle cx="6" cy="27" r="2.6" fill="currentColor" />
      <circle cx="13" cy="19" r="3.4" fill="currentColor" />
      <circle cx="21" cy="27" r="3.4" fill="currentColor" />
      <circle cx="29" cy="18" r="3.4" fill="currentColor" />
      <circle cx="35" cy="25" r="2.6" fill="currentColor" />
      <circle cx="13" cy="11" r="2.2" fill="currentColor" opacity="0.7" />
      <circle cx="29" cy="10" r="2.2" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

const stats = [
  { value: catalogCount, label: 'Cited peptide monographs' },
  { value: categoryCount, label: 'Research categories' },
  { value: comparisonCount, label: 'Head-to-head comparisons' },
  { value: glossaryCount, label: 'Glossary terms' },
  { value: areaCount, label: 'Indication clusters' },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 text-sm md:px-6">
        <span className="flex items-center gap-1.5 font-medium">
          <Newspaper className="h-4 w-4 text-accent" />
          Press &amp; Media Kit
        </span>
      </header>

      {/* ── Masthead / hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#2DD4A8] opacity-[0.08] blur-[120px]"
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-3">
            <PeptideMark className="h-8 w-8 text-accent" />
            <span className="font-display text-lg font-bold tracking-tight">
              AmericanPeptide<span className="font-medium text-ink/40">.com</span>
            </span>
          </div>

          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4A8] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4A8]" />
            </span>
            Media kit · Updated September 2026
          </div>

          <h1 className="max-w-[16ch] text-4xl font-bold leading-[1.03] tracking-tight md:text-6xl">
            The trust layer for{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              peptide research.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/60">
            AmericanPeptide.com pulls the scattered public record of peptide science into one place a
            person <span className="text-ink">or an AI agent</span> can read, cite, and reason over.
            Research-grade, not medical. <span className="text-ink">Every source, in the open.</span>
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-ink/40">
            <span>Independent reference &amp; AI agent</span>
            <span>
              <span className="text-accent">{catalogCount}</span> peptides ·{' '}
              <span className="text-accent">{categoryCount}</span> categories
            </span>
            <span>
              Open data · <span className="text-accent">CC&nbsp;BY&nbsp;4.0</span>
            </span>
            <span>americanpeptide.com</span>
          </div>
        </div>
      </section>

      {/* ── Positioning ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Positioning</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight md:text-3xl">
            Peptide science, made legible and honest.
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink/65">
            <p>
              Most peptide information online sits at one of two extremes: dense primary literature
              written for specialists, or marketing copy written to sell. The accurate, sourced,
              plainly-explained middle barely exists. AmericanPeptide.com is building the middle - a
              cited reference layered over the free public datasets, an AI agent that answers from
              those sources instead of inventing them, and tooling that turns a certificate of
              analysis or a reconstitution problem from a guessing game into a checklist.
            </p>
            <p>
              In the AI era the scarce asset is a source you can trust and cite. The name is a
              promise, and the domain is treated as an authority asset - not a storefront.
            </p>
          </div>
        </div>
      </section>

      {/* ── Boilerplate ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Boilerplate</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Copy-ready descriptions.</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/55">
            Three lengths for press, partner decks, and directory listings. Lift them verbatim.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { len: 'One line · ~20 words', text: BP_ONE, muted: false },
              { len: 'Short · ~55 words', text: BP_SHORT, muted: false },
              { len: 'Full · ~110 words', text: BP_FULL, muted: true },
            ].map((bp) => (
              <div key={bp.len} className="rounded-2xl border border-ink/[0.07] bg-panel p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
                    {bp.len}
                  </span>
                  <CopyButton text={bp.text} />
                </div>
                <p className={`text-[15px] leading-relaxed ${bp.muted ? 'text-ink/70' : 'text-ink'}`}>
                  {bp.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fact sheet ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>At a glance</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">The fact sheet.</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/55">
            Every figure below is verifiable on the live site - the catalog, comparisons, and glossary
            are all public.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-ink/[0.07] bg-panel p-5">
                <div className="font-display text-3xl font-bold leading-none tracking-tight text-accent md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2.5 text-xs leading-snug text-ink/60">{s.label}</div>
              </div>
            ))}
          </div>

          <dl className="mt-4 overflow-hidden rounded-2xl border border-ink/[0.07] bg-panel">
            {[
              {
                t: 'Type',
                d: (
                  <>
                    Independent research reference, citation-backed AI agent, and bench tools.{' '}
                    <span className="text-ink/55">Not a vendor, pharmacy, or clinic.</span>
                  </>
                ),
              },
              { t: 'Coverage', d: CATEGORIES.map((c) => c.label).join(' · ') },
              {
                t: 'Sources',
                d: (
                  <span className="font-mono text-[13.5px]">
                    PubChem · UniProt · PubMed · ClinicalTrials.gov{' '}
                    <span className="text-ink/55">— free public datasets, cited per claim</span>
                  </span>
                ),
              },
              {
                t: 'Open data',
                d: (
                  <>
                    Public JSON API · MCP server · <span className="font-mono">llms.txt</span> +
                    per-peptide markdown twins · live trial &amp; literature freshness
                  </>
                ),
              },
              {
                t: 'License',
                d: (
                  <span className="font-mono text-[13.5px]">
                    CC BY 4.0{' '}
                    <span className="text-ink/55">— free to read, query, and redistribute with attribution</span>
                  </span>
                ),
              },
              {
                t: 'Availability',
                d: 'Web + installable app (PWA). Catalog, calculators, and trial data work offline, at the bench.',
              },
              {
                t: 'Cost',
                d: 'Core tools - the agent, catalog, calculators, COA decoder - are free, no account required.',
              },
              {
                t: 'Underlying record',
                d: (
                  <span className="tabular-nums">
                    37M+ biomedical citations · 400K+ searchable compounds · 500K+ indexed clinical
                    trials <span className="text-ink/55">(via the public datasets it cites)</span>
                  </span>
                ),
              },
            ].map((f) => (
              <div
                key={f.t}
                className="grid gap-1 border-t border-ink/[0.06] px-5 py-4 first:border-t-0 sm:grid-cols-[170px_1fr] sm:gap-4"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/40 sm:pt-0.5">
                  {f.t}
                </dt>
                <dd className="text-sm text-ink">{f.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Remit ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>The remit</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            What it is, and what it isn&apos;t.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/55">
            The clearest way to avoid mischaracterization. The line is bright and deliberate.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-ink/[0.07] bg-panel p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.9} />
                What it is
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  'An open, cited reference catalog of research peptides - mechanism, sequence, chemistry, and manufacturing context.',
                  'A citation-backed AI research agent that answers from primary sources and flags computational output as hypothesis.',
                  'Hands-on bench tools: reconstitution and blend calculators, a COA decoder, a sequence design lab.',
                  'A published transparency standard for grading how openly a source shows its work.',
                ].map((li) => (
                  <li key={li} className="flex gap-2.5 text-sm leading-relaxed text-ink/65">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
                    {li}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-ink/[0.12] p-6">
              <h3 className="text-base font-semibold">What it isn&apos;t</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Not a pharmacy, clinic, or source of medical advice.',
                  'Not a place that publishes dosing protocols.',
                  'Not a black box - outputs are hypotheses, with sources shown.',
                  'Not affiliated with the NIH, NLM, NCBI, or any government agency - those are public databases it cites.',
                ].map((li) => (
                  <li key={li} className="flex gap-3 text-sm leading-relaxed text-ink/60">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Differentiators ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Why it&apos;s different</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight md:text-3xl">
            Four things a competitor can&apos;t clone by writing more content.
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                Icon: BadgeCheck,
                title: 'Cited, not asserted',
                body: (
                  <>
                    Every catalog entry and agent answer traces back to PubChem, UniProt, PubMed, and
                    ClinicalTrials.gov. Chemistry is PubChem-verified; the sequence{' '}
                    <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">
                      GEPPPGKPADDAGLV
                    </code>{' '}
                    resolves to a real record, not a claim.
                  </>
                ),
              },
              {
                Icon: Code2,
                title: 'Built to be cited by machines',
                body: (
                  <>
                    A public JSON API, an MCP server exposing the catalog as agent tools,{' '}
                    <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">
                      llms.txt
                    </code>
                    , and a markdown twin of every page - all CC BY 4.0. When an AI answers a peptide
                    question, it can answer from here, with attribution.
                  </>
                ),
              },
              {
                Icon: ShieldCheck,
                title: 'A standard, not opinions',
                body: (
                  <>
                    Sources are graded on a published {standardTotal}-point rubric built from
                    transparency signals a lab either shows or doesn&apos;t. Commission counts for zero -
                    the ranking can&apos;t be bought.
                  </>
                ),
              },
              {
                Icon: Sparkles,
                title: 'Credit-free to start',
                body: (
                  <>
                    The agent, the catalog, the calculators, and the COA decoder are usable with no
                    account and no paywall. The platform earns trust before it asks for anything.
                  </>
                ),
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-ink/[0.07] bg-panel p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] text-accent">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </div>
                <h3 className="text-[1.05rem] font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Standard ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>The Standard</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            How a source earns its score.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/55">
            A transparent, weighted rubric - the same one applied to every source in the directory.
            Points come from what a lab publishes, never from what it pays.
          </p>

          <div className="mt-8 rounded-2xl border border-ink/[0.07] bg-panel p-6 md:p-7">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink/40">
                Trust score composition
              </span>
              <span className="font-display text-lg font-bold">
                out of <span className="text-accent tabular-nums">{standardTotal}</span> points
              </span>
            </div>

            <div
              className="flex h-12 w-full overflow-hidden rounded-lg border border-ink/10"
              role="img"
              aria-label={`Trust score composition: ${STANDARD.map((s) => `${s.label} ${TRUST_WEIGHTS[s.key]}`).join(', ')}`}
            >
              {STANDARD.map((s) => (
                <div
                  key={s.key}
                  className="grid place-items-center font-mono text-[13px] font-medium text-[#06120E]"
                  style={{ width: `${(TRUST_WEIGHTS[s.key] / standardTotal) * 100}%`, background: s.color }}
                >
                  {TRUST_WEIGHTS[s.key]}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {STANDARD.map((s) => (
                <div key={s.key} className="flex items-baseline gap-2.5 text-[13.5px]">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                  <span className="w-8 shrink-0 font-mono text-ink tabular-nums">{TRUST_WEIGHTS[s.key]}</span>
                  <span className="text-ink/60">
                    <b className="font-medium text-ink">{s.label}</b> — {s.note}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 border-t border-ink/[0.06] pt-5">
              <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/[0.08] px-2.5 py-1 font-mono text-[11px] tracking-wide text-accent-amber">
                Commission +0
              </span>
              <p className="text-[13.5px] leading-relaxed text-ink/60">
                An affiliate relationship adds nothing to a score and is always disclosed. Accurate
                pages rank the most transparent source first because it earned it - no thumb on the
                scale.{' '}
                <Link href="/methodology" className="text-accent hover:underline">
                  Read the full Standard →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Audience</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Who it&apos;s for.</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                h: 'Researchers & the research-adjacent',
                b: 'People who want a sourced, chemistry-grade answer faster than digging through PubMed - with the citations attached.',
              },
              {
                h: 'Experienced self-experimenters',
                b: 'An informed, peer-level audience that reads certificates of analysis and wants literacy and transparency, not hand-holding.',
              },
              {
                h: 'Developers & AI builders',
                b: 'Teams that need structured, citable peptide data - via the JSON API, the MCP server, or the markdown twins.',
              },
              {
                h: 'Journalists & analysts',
                b: 'Writers covering the GLP-1 era and the fast-moving peptide market who need an honest, non-promotional reference to cite.',
              },
            ].map((a) => (
              <div key={a.h} className="rounded-2xl border border-ink/[0.07] bg-panel p-5">
                <h3 className="text-[0.98rem] font-semibold">{a.h}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{a.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand assets ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Brand assets</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            Palette, type, and the mark.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink/55">
            The live design system. Click any swatch to copy its hex. This page renders in the same
            tokens.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {/* Mark + wordmark */}
            <div className="rounded-2xl border border-ink/[0.07] bg-panel p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">
                Mark &amp; wordmark
              </span>
              <div className="mt-4 flex items-center gap-4 border-b border-ink/[0.06] pb-5">
                <PeptideMark className="h-10 w-10 text-accent" />
                <span className="font-display text-xl font-bold tracking-tight">
                  AmericanPeptide<span className="font-medium text-ink/40">.com</span>
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-ink/60">
                A peptide backbone with two side chains - the residue-and-bond motif that runs through
                the site&apos;s hero and figures. Set the wordmark in Space Grotesk; keep the mark in
                teal on a dark ground, or in ink on light. Give it clear space equal to one node.
              </p>
            </div>

            {/* Palette */}
            <div className="rounded-2xl border border-ink/[0.07] bg-panel p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">
                Color · click to copy
              </span>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <HexSwatch name="Navy surface" hex="#0B1220" />
                <HexSwatch name="Deep well" hex="#040810" />
                <HexSwatch name="Teal accent" hex="#2DD4A8" />
                <HexSwatch name="Teal light" hex="#5EEBC8" />
                <HexSwatch name="Indigo" hex="#818CF8" />
                <HexSwatch name="Blue" hex="#60A5FA" />
                <HexSwatch name="Purple" hex="#A78BFA" />
                <HexSwatch name="Amber" hex="#F5B544" />
              </div>
            </div>

            {/* Type */}
            <div className="rounded-2xl border border-ink/[0.07] bg-panel p-6 lg:col-span-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">
                Typography
              </span>
              <div className="mt-4 space-y-5">
                <div>
                  <div className="flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/40">
                    <span>Display — Space Grotesk</span>
                    <span>600 / 700 · -0.02em</span>
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold tracking-tight">
                    Made legible and honest.
                  </div>
                </div>
                <div className="border-t border-ink/[0.06] pt-5">
                  <div className="flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/40">
                    <span>Body — Geist</span>
                    <span>400 / 500</span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-ink/70">
                    Accurate, sourced, and plainly explained. The middle ground between primary
                    literature and marketing copy, written for an audience that already knows the field.
                  </p>
                </div>
                <div className="border-t border-ink/[0.06] pt-5">
                  <div className="flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/40">
                    <span>Data — Geist Mono</span>
                    <span>sequences · identifiers · figures</span>
                  </div>
                  <p className="mt-2 font-mono text-[15px] text-accent">
                    BPC-157 · GEPPPGKPADDAGLV · 15 residues · MW 1419.5 · C62H98N16O22 · CID 9941957
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Voice ── */}
      <section className="border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Voice &amp; messaging</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            Lines you can quote, and how it speaks.
          </h2>

          <div className="mt-8 grid gap-3">
            {QUOTES.map((q) => (
              <blockquote
                key={q}
                className="flex gap-3 border-l-2 border-accent py-1.5 pl-5 pr-2"
              >
                <Quote className="mt-1 h-4 w-4 shrink-0 text-accent/50" strokeWidth={2} />
                <p className="font-display text-lg font-medium leading-snug tracking-tight text-ink">
                  {q}
                </p>
              </blockquote>
            ))}
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {VOICE_NOTES.map((n) => (
              <div key={n} className="flex gap-2.5 text-sm leading-relaxed text-ink/60">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-panel p-8 md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#2DD4A8] opacity-[0.08] blur-[110px]"
            />
            <div className="relative">
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-4 flex items-center gap-2.5 text-2xl font-bold tracking-tight md:text-3xl">
                <Mail className="h-5 w-5 text-accent" />
                For interviews, data access, and partnership.
              </h2>

              <div className="mt-7 grid gap-x-10 gap-y-1 sm:grid-cols-2">
                {[
                  { k: 'Website', href: 'https://americanpeptide.com', label: 'americanpeptide.com', ext: true },
                  { k: 'Press', href: '/about/contact', label: '/about/contact', ext: false },
                  { k: 'Developers', href: '/developers', label: '/developers — API & MCP', ext: false },
                  { k: 'The Standard', href: '/methodology', label: '/methodology', ext: false },
                  { k: 'X', href: 'https://x.com/USPeptide', label: '@USPeptide', ext: true },
                  { k: 'Catalog', href: '/catalog', label: `/catalog — browse all ${catalogCount}`, ext: false },
                ].map((c) => (
                  <div
                    key={c.k}
                    className="grid items-baseline gap-1 border-t border-ink/[0.06] py-3 sm:grid-cols-[130px_1fr]"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/40">
                      {c.k}
                    </span>
                    {c.ext ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-accent hover:underline"
                      >
                        {c.label}
                      </a>
                    ) : (
                      <Link href={c.href} className="text-[15px] text-accent hover:underline">
                        {c.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Research-use echo */}
          <div className="mt-6 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
            <p className="text-xs leading-relaxed text-amber-400/60">
              <span className="font-semibold text-amber-400/80">Research use only: </span>
              AmericanPeptide.com is an AI-assisted computational research platform, not a medical
              device or clinical decision-support system. All outputs are computational hypotheses
              requiring independent experimental validation, and nothing here is medical advice or an
              offer for sale. American Peptide is independent and is not affiliated with, endorsed by,
              or representing the National Institutes of Health (NIH), the National Library of Medicine
              (NLM), the National Center for Biotechnology Information (NCBI), or any government agency;
              ClinicalTrials.gov, PubChem, PubMed, and UniProt are public databases cited as sources.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
