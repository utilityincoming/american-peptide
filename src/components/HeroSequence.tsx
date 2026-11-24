const residues = [
  [94, 263],
  [151, 225],
  [209, 259],
  [269, 181],
  [329, 201],
  [382, 126],
] as const

/** Decorative sequence schematic. The surrounding hero copy carries the meaning. */
export default function HeroSequence() {
  return (
    <svg
      viewBox="0 0 480 360"
      width="480"
      height="360"
      className="block h-auto w-full text-[color:color-mix(in_srgb,var(--accent)_65%,var(--ink))]"
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <g stroke="currentColor" opacity=".19">
        <path d="M48 83h384M48 130h384M48 177h384M48 224h384M48 271h384M48 318h384M48 83v235m64-235v235m64-235v235m64-235v235m64-235v235m64-235v235m64-235v235" />
        <path d="M48 83h12m-12 0v12m384-12h-12m12 0v12M48 318h12m-12 0v-12m384 12h-12m12 0v-12" strokeWidth="2" />
      </g>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M139 101h71l34 34 25 46m113-55v-25h35M94 263v37h55" strokeDasharray="3 5" opacity=".52" />
        <path d="m94 263 57-38 58 34 60-78 60 20 53-75" strokeWidth="2" />
        <g fill="var(--surface)">
          {residues.map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="8" />
          ))}
        </g>
        <circle cx="269" cy="181" r="19" fill="currentColor" fillOpacity=".08" strokeOpacity=".48" />
        <circle cx="269" cy="181" r="4" fill="currentColor" stroke="none" />
      </g>
      <g className="font-mono" fill="currentColor" fontSize="10" letterSpacing="1">
        <text x="48" y="64">SEQUENCE SCHEMATIC</text>
        <text x="139" y="94">RESIDUE</text>
        <text x="48" y="339">N-TERMINUS</text>
        <text x="432" y="339" textAnchor="end">C-TERMINUS</text>
      </g>
    </svg>
  )
}
