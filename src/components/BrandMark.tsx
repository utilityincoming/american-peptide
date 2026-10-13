import Link from 'next/link'

// ── Canonical brand mark ───────────────────────────────────────────────────
// ONE glyph for the whole brand. The two interlocking arcs read as a peptide
// double-strand; this is the same geometry baked into /public/favicon.svg and
// the PWA icons, so header, tab, home-screen, and share surfaces all show the
// same mark. If the glyph path changes here, regenerate the raster icons:
//   node scripts/generate-icons.mjs
//
// The glyph is palette-agnostic (uses currentColor) so callers set the color
// via text-*; the default lockup is dark-glyph-on-teal-chip, matching the
// header chip and inverting the dark-chip favicon.

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 5c4.5 0 7.5 4 7.5 7S15.5 19 20 19" />
      <path d="M20 5c-4.5 0-7.5 4-7.5 7S8.5 19 4 19" />
    </svg>
  )
}

// The teal chip + glyph, no wordmark. Use where space is tight.
export function BrandChip({ className }: { className?: string }) {
  return (
    <div
      className={
        'flex items-center justify-center rounded-lg bg-[#2DD4A8] ' + (className ?? 'h-8 w-8')
      }
    >
      <BrandGlyph className="h-1/2 w-1/2 text-[#0B1220]" />
    </div>
  )
}

// Full lockup: chip + wordmark, optionally wrapped in a home link.
// Wordmark is one word, two-tone (`American` solid, `Peptide` dimmed) — the
// single canonical treatment, shared by header and footer.
export function BrandMark({
  href = '/',
  className,
  chipClassName,
  showWordmark = true,
}: {
  href?: string | null
  className?: string
  chipClassName?: string
  showWordmark?: boolean
}) {
  const inner = (
    <>
      <BrandChip className={chipClassName} />
      {showWordmark && (
        <span className="text-[14px] font-semibold tracking-tight">
          American<span className="text-ink/45">Peptide</span>
        </span>
      )}
    </>
  )

  const classes = 'flex items-center gap-2.5 text-ink ' + (className ?? '')

  if (href === null) {
    return <div className={classes}>{inner}</div>
  }

  return (
    <Link href={href} className={classes + ' transition-opacity hover:opacity-90'}>
      {inner}
    </Link>
  )
}
