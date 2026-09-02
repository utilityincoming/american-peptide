import Link from 'next/link'
import { ArrowUpRight, Scale } from 'lucide-react'
import LastUpdated from '@/components/LastUpdated'
import {
  regulatoryForAll,
  REGULATORY_REVIEWED,
  STATUS_STYLES,
  type RegulatoryEntry,
} from '@/lib/regulatory-503a'

// Tone → theme-aware classes. Kept as whole class strings so Tailwind's
// scanner can see them; a template-built class name would be purged.
const TONE: Record<string, { dot: string; pill: string }> = {
  red: {
    dot: 'bg-accent-red',
    pill: 'border-accent-red/25 bg-accent-red/[0.08] text-accent-red',
  },
  amber: {
    dot: 'bg-accent-amber',
    pill: 'border-accent-amber/25 bg-accent-amber/[0.08] text-accent-amber',
  },
  green: {
    dot: 'bg-accent',
    pill: 'border-accent/25 bg-accent/[0.08] text-accent',
  },
  neutral: {
    dot: 'bg-ink/25',
    pill: 'border-ink/[0.08] bg-ink/[0.03] text-ink/50',
  },
}

/**
 * Compounding status under section 503A — the regulatory layer the cluster
 * hubs were missing.
 *
 * The editorial point of this block is the distinction almost every other page
 * on this topic collapses: removal from Category 2 is not permission, an
 * advisory-committee recommendation is not permission, and neither is FDA
 * approval of a drug. Each row carries its own source so a reader can check
 * the claim rather than take it.
 */
export default function CompoundingStatus({
  slugs,
  intro,
  className = '',
}: {
  slugs: readonly string[]
  /** One or two sentences framing what this class's status actually is. */
  intro: string
  className?: string
}) {
  const entries: RegulatoryEntry[] = regulatoryForAll(slugs)
  if (entries.length === 0) return null

  return (
    <section className={className}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
        Compounding status under 503A
      </h2>
      <p className="mb-5 text-xs text-ink/30">
        Whether a licensed compounding pharmacy may legally prepare these
        substances — a separate question from FDA drug approval
      </p>

      <p className="mb-6 text-sm leading-relaxed text-ink/65">{intro}</p>

      <div className="divide-y divide-ink/[0.05] rounded-xl border border-ink/[0.07] bg-ink/[0.02]">
        {entries.map((e) => {
          const style = STATUS_STYLES[e.status]
          const tone = TONE[style.tone]
          return (
            <div key={e.slug} className="p-4 md:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Link
                  href={`/catalog/${e.slug}`}
                  className="text-sm font-semibold text-ink/85 transition-colors hover:text-accent"
                >
                  {e.name}
                </Link>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {style.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink/60">{e.detail}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <a
                  href={e.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-[11px] text-ink/35 transition-colors hover:text-accent"
                >
                  {e.source.label}
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-ink/[0.07] bg-ink/[0.02] px-4 py-3">
        <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/30" />
        <p className="text-xs leading-relaxed text-ink/45">
          None of these statuses is FDA approval, and none establishes efficacy,
          dosing, or a benefit-risk profile. Legal 503A compounding requires FDA
          to place a substance on the bulks list through notice-and-comment
          rulemaking. That step had not been completed for any peptide on this
          page as of the review date.
        </p>
      </div>

      <LastUpdated
        date={REGULATORY_REVIEWED}
        label="Regulatory status reviewed"
        className="mt-3 text-[11px] text-ink/30"
      />
    </section>
  )
}
