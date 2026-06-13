import Link from 'next/link'
import {
  ArrowUpRight,
  Beaker,
  Calculator,
  Dna,
  FileSearch,
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
  {
    href: '/research',
    name: 'Peptide Agent',
    desc: 'Ask in plain language — citation-backed answers from PubMed, PubChem & trials.',
    Icon: Sparkles,
    badge: 'AI',
  },
  {
    href: '/compounds/builder',
    name: 'PeptideForge',
    desc: 'Build a peptide residue by residue with live chemistry, challenges & XP.',
    Icon: Dna,
    badge: 'New',
  },
  {
    href: '/tools/design-lab',
    name: 'Design Lab',
    desc: 'Sequence properties — pI, ε280, net charge & synthesis-difficulty flags.',
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
    href: '/tools/reconstitution-calculator',
    name: 'Reconstitution Calculator',
    desc: 'Dose, dilution and syringe-unit math for reconstituting a vial.',
    Icon: Calculator,
  },
  {
    href: '/compounds',
    name: 'Compound Search',
    desc: 'Search PubChem for structures, molecular formulae and weights.',
    Icon: Search,
  },
]

export default function Toolkit({
  title = 'Hands-on tools',
  subtitle = 'Put the science to work — interactive utilities that run right here.',
  exclude = [],
  className = '',
}: {
  title?: string
  subtitle?: string
  exclude?: string[]
  className?: string
}) {
  const tools = TOOLS.filter((t) => !exclude.includes(t.href))
  if (tools.length === 0) return null

  return (
    <section className={className}>
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#2DD4A8]/[0.06] to-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/30 hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.18)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-[#2DD4A8]">
                <t.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {t.badge && (
                <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                  {t.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-white/90">{t.name}</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#2DD4A8]" />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-white/50">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
