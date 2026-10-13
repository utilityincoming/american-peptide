import Link from 'next/link'

// ── Canonical brand mark ───────────────────────────────────────────────────
// ONE glyph for the whole brand: a three-residue peptide molecule, echoing the
// hero molecule. This is the same geometry baked into /public/favicon.svg and
// the PWA icons, so header, tab, home-screen, and footer all show the same
// mark. If the glyph changes here, mirror it in favicon.svg and regenerate the
// raster icons: node scripts/generate-icons.mjs
//
// The glyph is palette-agnostic (uses currentColor) so callers set the color
// via text-*; the default lockup is dark-glyph-on-teal-chip, matching the
// header chip and inverting the dark-chip favicon.

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <polyline
        points="9,21 16,11 23,21"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="21" r="4.1" />
      <circle cx="16" cy="11" r="4.6" />
      <circle cx="23" cy="21" r="4.1" />
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
