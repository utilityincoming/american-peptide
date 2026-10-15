// "Survey" section break: faint topographic contour lines, optionally carrying a
// benchmark marker — a surveyor's coordinate/section label — so long reference
// pages read as mapped terrain with legible waypoints between sections. Pure SVG
// in the accent hue at low opacity, theme-aware via `currentColor` (text-accent
// flips light/dark). Decorative by default (aria-hidden); when a `label` is
// given it becomes a labelled separator for assistive tech.

type ContourDividerProps = {
  /** Benchmark text shown centered on the line, e.g. a section name or a
   *  coordinate like "38.9°N · 77.0°W". Omit for a plain divider. */
  label?: string
  className?: string
}

// A fixed set of gently drifting contour paths across a 1200×48 field. Stretched
// to the container width with preserveAspectRatio="none"; the stroke width is
// vector-effect non-scaling so the lines stay hairline at any width.
const CONTOURS = [
  { d: 'M0 30 Q150 14 300 22 T600 18 T900 26 T1200 16', o: 0.9 },
  { d: 'M0 36 Q150 22 300 30 T600 26 T900 33 T1200 24', o: 0.6 },
  { d: 'M0 24 Q150 8 300 15 T600 11 T900 19 T1200 9', o: 0.35 },
]

export default function ContourDivider({ label, className = '' }: ContourDividerProps) {
  return (
    <div
      className={`relative w-full text-accent ${className}`}
      role={label ? 'separator' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="block h-8 w-full"
        fill="none"
        stroke="currentColor"
      >
        {CONTOURS.map((c, i) => (
          <path
            key={i}
            d={c.d}
            strokeWidth={1}
            strokeOpacity={c.o * 0.5}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {label && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/55">
          {label}
        </span>
      )}
    </div>
  )
}
