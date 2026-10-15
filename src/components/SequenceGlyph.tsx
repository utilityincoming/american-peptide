// ── Primary-structure visual ────────────────────────────────────────────────
// Draws a peptide's single-letter sequence as a serpentine backbone of residue
// nodes, echoing the hero molecule and the share-image signature. Pure SVG,
// server-renderable, theme-aware (uses currentColor/token accents), and
// aria-labelled with the full sequence for screen readers.

const VB_W = 760 // intrinsic viewBox width; the SVG scales to its container
const PER_ROW = 18 // residues per row before wrapping (serpentine)

export default function SequenceGlyph({
  sequence,
  className = '',
}: {
  sequence: string
  className?: string
}) {
  const residues = sequence.replace(/[^A-Za-z]/g, '').toUpperCase().split('')
  const n = residues.length
  if (n === 0) return null

  const cols = Math.min(n, PER_ROW)
  const rows = Math.ceil(n / cols)
  const stepX = VB_W / (cols + 1)
  const rowH = Math.min(96, Math.max(58, stepX * 1.1))
  const amp = rowH * 0.22
  const r = Math.min(20, Math.max(9, stepX * 0.3))
  const pad = r + 10
  const vbH = Math.round(rows * rowH + pad)

  // Serpentine layout: even rows run left→right, odd rows right→left, so the
  // backbone reads as one continuous chain across wraps.
  const pts = residues.map((letter, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const ltr = row % 2 === 0 ? col : cols - 1 - col
    const x = Math.round(stepX * (ltr + 1))
    const y = Math.round(pad / 2 + row * rowH + rowH / 2 + (i % 2 === 0 ? -amp : amp))
    return { x, y, letter }
  })

  const fontSize = Math.round(r * 1.05)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${vbH}`}
      className={className}
      width="100%"
      role="img"
      aria-label={`Primary structure: ${sequence} (${n} residues)`}
    >
      <defs>
        <radialGradient id="sg-node" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#b6f8e9" />
          <stop offset="45%" stopColor="#5BA88C" />
          <stop offset="100%" stopColor="#0c6f59" />
        </radialGradient>
      </defs>

      {/* Backbone bonds */}
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#5BA88C"
        strokeOpacity={0.5}
        strokeWidth={Math.max(2, r * 0.3)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Residue nodes + single-letter labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={r} fill="url(#sg-node)" />
          <text
            x={p.x}
            y={p.y + fontSize * 0.34}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={700}
            fill="#06201a"
            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            {p.letter}
          </text>
        </g>
      ))}
    </svg>
  )
}
