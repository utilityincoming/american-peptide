import { BrandGlyph } from './BrandMark'

// ── Branded loading skeletons ───────────────────────────────────────────────
// Placeholder blocks with an accent-tinted shimmer (see `.skeleton` in
// globals.css), plus a molecule "pulse" for image/structure wells — so the
// waits that matter (PubChem / trial fetches, agent answers) read as the brand
// instead of a bare spinner. All decorative → aria-hidden; a `label` sets the
// accessible status for the surrounding live region.

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />
}

// A row of shimmer lines; the last line is shortened like real text.
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

// A pulsing brand molecule, for the structure/image well of a loading card.
export function SkeletonMolecule({ className = 'h-10 w-10' }: { className?: string }) {
  return <BrandGlyph className={`animate-pulse text-accent/25 ${className}`} />
}
