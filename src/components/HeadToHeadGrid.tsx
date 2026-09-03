import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { comparisonsFor } from '@/lib/comparisons'

/**
 * Every head-to-head page that touches this hub's compounds.
 *
 * The hubs used to hard-code two or three comparison links, so the comparison
 * layer grew from 12 pages to 34 without the hubs noticing. Driving the grid
 * off comparisonsFor() means appending a Comparison entry surfaces it on the
 * relevant hub automatically — the same "data, not files" contract the
 * /compare route already uses.
 */
export default function HeadToHeadGrid({
  slugs,
  title = 'Head-to-head comparisons',
  blurb,
  className = '',
}: {
  slugs: readonly string[]
  title?: string
  blurb?: string
  className?: string
}) {
  const comparisons = comparisonsFor(slugs)
  if (comparisons.length === 0) return null

  return (
    <section className={className}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
        {title}
      </h2>
      {blurb ? <p className="mb-5 text-xs text-ink/30">{blurb}</p> : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {comparisons.map((c) => (
          <Link
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="group flex items-start justify-between gap-3 rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-4 py-3.5 transition-colors hover:border-accent/30 hover:bg-ink/[0.04]"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink/80 transition-colors group-hover:text-accent">
                {c.aName} vs {c.bName}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/40">
                {c.headline}
              </p>
            </div>
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/20 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>

      <Link
        href="/compare"
        className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent"
      >
        All comparisons
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  )
}
