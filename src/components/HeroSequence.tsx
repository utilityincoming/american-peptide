import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSequence({
  href,
  name,
  sequence,
}: {
  href: string
  name: string
  sequence: string
}) {
  const residues = Array.from(sequence)

  return (
    <figure
      aria-labelledby="hero-sequence-title"
      className="min-w-0 border border-hairline bg-panel"
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline px-4 py-3 sm:px-6">
        <span id="hero-sequence-title" className="font-semibold">{name} primary sequence</span>
        <span className="font-scientific text-xs text-ink-muted">{residues.length} residues</span>
      </figcaption>

      <div className="px-4 py-4 sm:px-6">
        <ol
          aria-hidden="true"
          className="grid grid-cols-5 gap-px border border-hairline bg-hairline font-scientific"
        >
          {residues.map((letter, index) => (
            <li key={index} className="flex flex-col items-center gap-1 bg-panel py-2">
              <span className="text-xs text-ink-muted">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-base font-semibold text-accent">{letter}</span>
            </li>
          ))}
        </ol>
        <code className="mt-3 block break-all font-scientific text-sm text-ink">{sequence}</code>
      </div>

      <div className="border-t border-hairline px-4 py-3 sm:px-6">
        <Link
          href={href}
          className="inline-flex min-h-8 items-center gap-2 text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Read the {name} monograph
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </figure>
  )
}
