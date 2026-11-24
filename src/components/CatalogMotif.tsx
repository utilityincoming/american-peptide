import type { PeptideCategory } from '@/lib/peptides'

// Abstract editorial motifs. The ordinates distinguish categories without
// suggesting that any one chemical structure represents a whole category.
const heights = {
  metabolic: [100, 62, 86, 44, 76],
  'growth-hormone': [103, 92, 61, 65, 43],
  'healing-repair': [59, 86, 101, 82, 54],
  cognitive: [94, 54, 86, 54, 94],
  longevity: [77, 49, 59, 90, 77],
  cosmetic: [104, 77, 49, 75, 102],
  reproductive: [49, 76, 76, 100, 100],
  immune: [73, 99, 47, 97, 73],
  mitochondrial: [95, 74, 56, 74, 95],
  bioregulator: [59, 59, 83, 83, 105],
  'peptide-hormone': [48, 70, 54, 98, 110],
} satisfies Record<PeptideCategory, number[]>

export default function CatalogMotif({
  category,
  className,
}: {
  category: PeptideCategory
  className?: string
}) {
  const nodes = heights[category].map((y, i) => ({ x: 48 + i * 56, y }))

  return (
    <svg
      className={className}
      viewBox="0 0 320 160"
      width="320"
      height="160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="20" y="20" width="280" height="120" rx="12" fill="var(--surface)" strokeOpacity=".24" />
      <path d="M36 80h248M160 32v96" opacity=".25" strokeDasharray="2 4" />
      <polyline points={nodes.map(({ x, y }) => `${x},${y}`).join(' ')} />
      {nodes.map(({ x, y }) => <circle key={x} cx={x} cy={y} r="6" fill="var(--surface)" />)}
      <circle cx="160" cy={nodes[2].y} r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
