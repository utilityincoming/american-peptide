import Link from 'next/link'
import { ArrowUpRight, Beaker, BookOpen, Factory, type LucideIcon } from 'lucide-react'

// The education/reference surfaces that used to live in the "Learn" menu —
// surfaced as content so they stay discoverable while browsing the research
// section instead of being buried in a dropdown.

interface LearnCard {
  href: string
  name: string
  desc: string
  Icon: LucideIcon
}

const CARDS: LearnCard[] = [
  {
    href: '/synthesis',
    name: 'How peptides are made',
    desc: 'The synthesis pipeline — cost, where purity is won or lost, and the cold chain.',
    Icon: Factory,
  },
  {
    href: '/learn/compatibility',
    name: 'Compatibility & stability',
    desc: 'What can be combined, and what degrades peptides in solution.',
    Icon: Beaker,
  },
  {
    href: '/glossary',
    name: 'Glossary',
    desc: 'Key peptide-research terms — dosing, chemistry, identifiers — in plain English.',
    Icon: BookOpen,
  },
]

export default function LearnMore({
  title = 'Learn the science',
  className = '',
}: {
  title?: string
  className?: string
}) {
  return (
    <section className={className}>
      <h2 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.12)]"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-ink/[0.08] bg-ink/[0.03] text-accent">
              <c.Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-ink/90">{c.name}</h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-ink/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/50">{c.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
