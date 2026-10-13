// ── Ambient backdrop primitives ─────────────────────────────────────────────
// The teal dot-grid and blurred "glow" blobs were hand-redeclared on the home
// page and most spotlight sections, each with slightly different dot size,
// opacity, and blur. These two components make the backdrop one decision:
// a fixed dot cadence and a small set of glow intensities, themeable in one
// place. Both are decorative, so they are always aria-hidden and
// pointer-events-none.

type DotFieldProps = {
  /** Dot grid cadence in px. 28 = hero/section default, 24 = inside cards. */
  size?: 24 | 28
  /** Dot alpha (teal). ~0.1 reads on the page surface; 0.12 for the hero. */
  intensity?: number
  /** Extra classes — e.g. `opacity-40` when layered inside a tinted card. */
  className?: string
}

export function DotField({ size = 28, intensity = 0.1, className = '' }: DotFieldProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(45,212,168,${intensity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  )
}

type GlowProps = {
  /** Position + size utilities (e.g. `-top-32 left-1/3 h-[500px] w-[500px]`). */
  className?: string
  /**
   * Glow alpha. Keep low — these sit behind content. Omit it to drive opacity
   * from `className` instead (e.g. an `opacity-[0.08] group-hover:opacity-[0.14]`
   * transition), since an inline opacity would override the hover class.
   */
  intensity?: number
  /** Blur radius in px. */
  blur?: number
}

export function Glow({ className = '', intensity, blur = 120 }: GlowProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-[#2DD4A8] ${className}`}
      style={{ ...(intensity !== undefined && { opacity: intensity }), filter: `blur(${blur}px)` }}
    />
  )
}
