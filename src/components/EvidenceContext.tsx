import Link from 'next/link'
import { GraduationCap, Scale, ArrowUpRight, ArrowRight } from 'lucide-react'
import {
  getGlossaryForAreas,
  getGlossaryForPeptides,
  type GlossaryTerm,
} from '@/lib/glossary'

interface EvidenceContextProps {
  /** Research-area slugs to scope key terms + cross-links to. */
  areaSlugs?: string[]
  /** Catalog peptide slugs to scope key terms to (takes precedence). */
  peptideSlugs?: string[]
  /** Extra contextual links rendered under "Keep exploring". */
  moreLinks?: { href: string; label: string }[]
}

/**
 * Contextual education module — drops the relevant slice of /learn into a
 * comparison or research-area page: an evidence-hierarchy primer (how to weigh
 * the studies), the glossary terms that matter here, and cross-links back into
 * the learn cluster. Reused across page types so education lives at the point
 * of intent without duplicating content or merging IA nodes.
 */
export default function EvidenceContext({
  areaSlugs = [],
  peptideSlugs = [],
  moreLinks = [],
}: EvidenceContextProps) {
  // Prefer peptide-specific terms, then fill with area terms; dedupe; cap at 6.
  const seen = new Set<string>()
  const terms: GlossaryTerm[] = [
    ...(peptideSlugs.length ? getGlossaryForPeptides(peptideSlugs, 6) : []),
    ...(areaSlugs.length ? getGlossaryForAreas(areaSlugs, 6) : []),
  ]
    .filter((t) => (seen.has(t.slug) ? false : seen.add(t.slug)))
    .slice(0, 6)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-[#2DD4A8]" strokeWidth={1.75} />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Understand the evidence
        </h2>
      </div>

      {/* Evidence-hierarchy primer */}
      <Link
        href="/learn/evidence-hierarchy"
        className="group flex items-start gap-3 rounded-xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-4 transition-colors hover:border-[#2DD4A8]/30 hover:bg-[#2DD4A8]/[0.07]"
      >
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4A8]" strokeWidth={1.75} />
        <div className="flex-1">
          <p className="mb-0.5 text-sm font-medium text-white/85">
            How to weigh this evidence
          </p>
          <p className="text-[13px] leading-relaxed text-white/55">
            Preclinical, observational, and randomized findings carry very
            different weight. The evidence hierarchy shows how to rank what you
            read before drawing conclusions.
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#2DD4A8]/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      {/* Scoped key terms */}
      {terms.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Key terms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {terms.map((t) => (
              <Link
                key={t.slug}
                href={`/glossary/${t.slug}`}
                title={t.short}
                className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-white/65 transition-colors hover:border-[#2DD4A8]/25 hover:text-[#2DD4A8]"
              >
                {t.abbr ?? t.term}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cross-links back into the learn cluster */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-4 text-[13px]">
        {[
          { href: '/learn', label: 'Learn hub' },
          { href: '/glossary', label: 'Glossary' },
          ...moreLinks,
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1 text-[#2DD4A8]/80 transition-colors hover:text-[#2DD4A8]"
          >
            {l.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </section>
  )
}
