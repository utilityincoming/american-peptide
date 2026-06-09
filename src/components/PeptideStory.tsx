import Link from 'next/link'
import {
  ArrowRight,
  Cpu,
  FileCheck2,
  Filter,
  PencilRuler,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { Peptide } from '@/lib/peptides'
import { buildPeptideStory } from '@/lib/peptide-story'

const ICONS: Record<string, LucideIcon> = {
  PencilRuler,
  Cpu,
  Filter,
  FileCheck2,
}

export default function PeptideStory({ peptide }: { peptide: Peptide }) {
  const story = buildPeptideStory(peptide)

  return (
    <div className="rounded-2xl border border-[#2DD4A8]/15 bg-gradient-to-br from-[#2DD4A8]/[0.05] to-transparent p-6 md:p-7">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-[#2DD4A8]">
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-sm font-semibold tracking-tight">
          How {peptide.name} is made
        </h2>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-white/65">{story.intro}</p>

      <ol className="relative space-y-5 border-l border-white/[0.08] pl-6">
        {story.beats.map((beat, i) => {
          const Icon = ICONS[beat.icon] ?? Cpu
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[2.05rem] flex h-7 w-7 items-center justify-center rounded-lg border border-[#2DD4A8]/25 bg-[#0B1220] text-[#2DD4A8]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <Link
                href={`/synthesis#${beat.stage}`}
                className="group inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-white/85 transition-colors hover:text-[#2DD4A8]"
              >
                {beat.title}
                <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
              <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                {beat.body}
              </p>
            </li>
          )
        })}
      </ol>

      <Link
        href="/synthesis"
        className="group mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#2DD4A8]"
      >
        Walk the full synthesis pipeline
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
