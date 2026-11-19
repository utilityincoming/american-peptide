// Mechanism figure for thymosin β4.
// Left: one G-actin monomer held by Tβ4 (the sequestered pool).
// Right: a short F-actin filament that assembles when that pool is released.
// Bottom: the 43-residue chain with the two fragments readers actually meet —
// Ac-SDKP (residues 1–4) and the LKKTETQ actin motif (residues 17–23, TB-500).

const SEQ = 'SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES'

export default function ThymosinBeta4Figure({ className = '' }: { className?: string }) {
  const residues = SEQ.split('')
  return (
    <svg
      viewBox="0 0 760 460"
      className={className}
      width="100%"
      role="img"
      aria-label="Thymosin beta-4 sequesters a G-actin monomer, keeping it out of the filament until the cell needs to move. The 43-residue chain is marked at Ac-SDKP, residues 1 to 4, and at LKKTETQ, residues 17 to 23."
    >
      <defs>
        <radialGradient id="tb4-actin" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#d7fff1" />
          <stop offset="55%" stopColor="#7EE0B5" />
          <stop offset="100%" stopColor="#0c6f59" />
        </radialGradient>
        <linearGradient id="tb4-ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A6F0CC" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      <text x="24" y="28" fill="currentColor" fillOpacity="0.45" fontSize="11" fontWeight="600" letterSpacing="1.4">
        ACTIN POOL
      </text>
      <text x="400" y="28" fill="currentColor" fillOpacity="0.45" fontSize="11" fontWeight="600" letterSpacing="1.4">
        FILAMENT
      </text>

      {/* Sequestered monomer */}
      <g>
        <ellipse cx="168" cy="150" rx="118" ry="78" fill="none" stroke="#A6F0CC" strokeOpacity="0.35" strokeWidth="10" />
        <ellipse cx="168" cy="150" rx="96" ry="60" fill="none" stroke="url(#tb4-ribbon)" strokeWidth="3.5" strokeDasharray="10 7" />
        <circle cx="168" cy="150" r="36" fill="url(#tb4-actin)" />
        <text x="168" y="146" textAnchor="middle" fontSize="11" fontWeight="700" fill="#06201a">G</text>
        <text x="168" y="160" textAnchor="middle" fontSize="9" fill="#06201a">actin</text>
        <text x="168" y="248" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
          Held by Tβ4
        </text>
        <text x="168" y="266" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="11">
          monomer stays out of the filament
        </text>
      </g>

      <path d="M310 150 H360" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" markerEnd="url(#tb4-arrow)" />
      <defs>
        <marker id="tb4-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" fillOpacity="0.45" />
        </marker>
      </defs>
      <text x="336" y="140" textAnchor="middle" fill="currentColor" fillOpacity="0.45" fontSize="10">
        release
      </text>

      {/* Short filament */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 430 + i * 52
          const y = i % 2 === 0 ? 128 : 172
          return <circle key={i} cx={x} cy={y} r="22" fill="url(#tb4-actin)" opacity={0.95} />
        })}
        <text x="534" y="248" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
          F-actin
        </text>
        <text x="534" y="266" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="11">
          the polymer cells use to crawl
        </text>
      </g>

      {/* Sequence map */}
      <text x="24" y="310" fill="currentColor" fillOpacity="0.45" fontSize="11" fontWeight="600" letterSpacing="1.4">
        43 RESIDUES — TWO FRAGMENTS
      </text>
      {residues.map((letter, i) => {
        const x = 24 + (i % 22) * 32
        const y = i < 22 ? 338 : 378
        const sdkp = i < 4
        const motif = i >= 16 && i <= 22
        const fill = sdkp ? '#93C5FD' : motif ? '#A6F0CC' : 'currentColor'
        return (
          <g key={i}>
            <rect x={x} y={y} width="26" height="26" rx="6" fill={fill} fillOpacity={sdkp || motif ? 0.18 : 0.06} stroke={fill} strokeOpacity={sdkp || motif ? 0.7 : 0.15} />
            <text x={x + 13} y={y + 17} textAnchor="middle" fontSize="11" fontWeight="700" fill={sdkp || motif ? fill : 'currentColor'} fillOpacity={sdkp || motif ? 1 : 0.55} style={{ fontFamily: 'ui-monospace, monospace' }}>
              {letter}
            </text>
          </g>
        )
      })}
      <text x="24" y="448" fill="#93C5FD" fontSize="11" fontWeight="600">Ac-SDKP · 1–4 · anti-fibrotic fragment</text>
      <text x="320" y="448" fill="#A6F0CC" fontSize="11" fontWeight="600">LKKTETQ · 17–23 · actin motif (TB-500)</text>
    </svg>
  )
}
