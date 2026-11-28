import { COMPARE, DESIGN_LAB, PEPTIDE_FORGE, RESEARCH_WORKSPACE } from '@/lib/page-meta'
import Link from 'next/link'
import {
  ArrowUpRight,
  Beaker,
  Calculator,
  Dna,
  FileSearch,
  NotebookPen,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

// Prominent, utility-forward promotion of the interactive tools — the theme the
// /compounds page leads with (PeptideForge). Reusable across pages so the
// "here's something hands-on you can do" feeling is consistent site-wide.

interface Tool {
  href: string
  name: string
  desc: string
  Icon: LucideIcon
  badge?: string
}

const TOOLS: Tool[] = [
  { href: COMPARE.href, name: COMPARE.label, desc: COMPARE.description, Icon: Search },
  { href: '/trials', name: 'Clinical Trials', desc: 'Search the ClinicalTrials.gov registry.', Icon: Search },
  { href: '/tools/blend-calculator', name: 'Blend Calculator', desc: 'Calculate the volumes for a multi-peptide blend.', Icon: Calculator },
  { href: '/tools/calculator-beta', name: 'Peptide Calculator (Beta)', desc: 'Experimental calculator modes and unit conversions.', Icon: Calculator },
  { href: '/tools/lab', name: 'Lab Tools', desc: 'Review batch COAs, access the catalog feed, and submit sourcing information.', Icon: Beaker },
  {
    href: '/research',
    name: 'Peptide Agent',
    desc: 'Ask in plain language — citation-backed answers from PubMed, PubChem & trials.',
    Icon: Sparkles,
    badge: 'AI',
  },
  {
    href: PEPTIDE_FORGE.href,
    name: PEPTIDE_FORGE.label,
    desc: PEPTIDE_FORGE.description,
    Icon: Dna,
    badge: 'New',
  },
  {
    href: RESEARCH_WORKSPACE.href,
    name: RESEARCH_WORKSPACE.label,
    desc: RESEARCH_WORKSPACE.description,
    Icon: Beaker,
  },
  {
    href: DESIGN_LAB.href,
    name: DESIGN_LAB.label,
    desc: DESIGN_LAB.description,
    Icon: Beaker,
    badge: 'Beta',
  },
  {
    href: '/tools/coa-decoder',
    name: 'COA Decoder',
    desc: 'Paste a certificate of analysis; grade its transparency and spot red flags.',
    Icon: FileSearch,
  },
  {
    href: '/tools/tracker',
    name: 'Protocol Tracker',
    desc: 'Private, local-first logbook — log, plan & track vials with live cost-per-dose.',
    Icon: NotebookPen,
    badge: 'Beta',
  },
  {
    href: '/tools/reconstitution-calculator',
    name: 'Reconstitution Calculator',
    desc: 'Dose, dilution and syringe-unit math for reconstituting a vial.',
    Icon: Calculator,
  },
  {
    href: '/compounds',
    name: 'Compound Search',
    desc: 'Verified peptide monographs plus a live PubChem compound lookup.',
    Icon: Search,
  },
]

export default function Toolkit({
  title = 'Hands-on tools',
  subtitle = 'Put the science to work — interactive utilities that run right here.',
  heading: Heading = 'h2',
  exclude = [],
  className = '',
}: {
  heading?: 'h1' | 'h2'
  title?: string
  subtitle?: string
  exclude?: string[]
  className?: string
}) {
  const tools = TOOLS.filter((t) => !exclude.includes(t.href))
  if (tools.length === 0) return null

  const CardHeading = Heading === 'h1' ? 'h2' : 'h3'
  return (
    <section className={className}>
      <Heading className="text-lg font-semibold tracking-tight md:text-xl">{title}</Heading>
      {subtitle && <p className="mt-1 text-sm text-ink/50">{subtitle}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl border border-hairline bg-gradient-to-br from-[#7EE0B5]/[0.06] to-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_18px_50px_-12px_rgba(126,224,181,0.18)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <t.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {t.badge && (
                <span className="rounded-full border border-accent/25 bg-accent/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                  {t.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <CardHeading className="text-sm font-semibold text-ink/90">{t.name}</CardHeading>
              <ArrowUpRight className="h-3.5 w-3.5 text-ink/55 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/50">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
