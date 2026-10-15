import type { ReactElement } from 'react'
import { readFile } from 'node:fs/promises'

// Shared Open Graph image layout (1200×630) for AmericanPeptide.com. Satori-safe:
// flexbox + inline styles + simple inline SVG. Used by the opengraph-image route
// segments (site default + per-molecule catalog pages). Next also serves this as
// the twitter:image when no twitter-image is present.
//
// Every card carries the brand molecule mark and a peptide-chain "signature"
// drawn from the subject, so catalog entries are visually distinct in a feed
// (node count tracks residue count) rather than identical text templates.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const BRAND = '#5BA88C'

// Satori's gradient/color parser is strict — use rgba(), never 8-digit hex.
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// Category → accent, so a feed of cards is visually sortable. Mirrors the
// token accents (teal / indigo / blue / purple / amber) used in the UI.
const CATEGORY_ACCENT: Record<string, string> = {
  metabolic: '#5BA88C',
  'growth-hormone': '#93D4BA',
  'healing-repair': '#60A5FA',
  cognitive: '#818CF8',
  longevity: '#A78BFA',
  cosmetic: '#F0ABFC',
  reproductive: '#F472B6',
  immune: '#6FBF9A',
  mitochondrial: '#E0A23D',
  bioregulator: '#38BDF8',
  'peptide-hormone': '#5BA88C',
}

export function categoryAccent(category?: string): string {
  return (category && CATEGORY_ACCENT[category]) || BRAND
}

// ── Embedded display font ───────────────────────────────────────────────────
// Space Grotesk (the site's display face), so share cards match the site type
// instead of Satori's generic sans. Loaded once and cached; on any failure we
// return [] and ImageResponse falls back to its built-in font.
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]> | null =
  null

export function loadOgFonts() {
  if (!fontsPromise) {
    // `new URL(..., import.meta.url)` so webpack traces and bundles the font
    // files into the route's serverless output (a runtime cwd path would not be
    // traced and would 404 on deploy).
    fontsPromise = Promise.all([
      readFile(new URL('./fonts/SpaceGrotesk-400.woff', import.meta.url)),
      readFile(new URL('./fonts/SpaceGrotesk-700.woff', import.meta.url)),
    ])
      .then(
        ([r, b]) =>
          [
            { name: 'Space Grotesk', data: r, weight: 400 as const, style: 'normal' as const },
            { name: 'Space Grotesk', data: b, weight: 700 as const, style: 'normal' as const },
          ],
      )
      .catch(() => [])
  }
  return fontsPromise
}

// A peptide chain drawn as an SVG zig-zag. Node count tracks `residues` (capped),
// so each molecule gets a recognizable silhouette. Solid fills only (no SVG
// gradients) to stay inside Satori's reliable subset.
function Molecule({
  residues,
  accent,
  width,
  height,
}: {
  residues: number
  accent: string
  width: number
  height: number
}) {
  const count = Math.max(3, Math.min(residues, 13))
  const stepX = width / count
  const amp = height * 0.17
  const nodes = Array.from({ length: count }, (_, i) => ({
    x: Math.round(stepX * (i + 0.5)),
    y: Math.round(height / 2 + (i % 2 === 0 ? -amp : amp)),
  }))
  const r = Math.max(6, Math.round(stepX * 0.26))
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <polyline
        points={nodes.map((n) => `${n.x},${n.y}`).join(' ')}
        fill="none"
        stroke={accent}
        strokeWidth={Math.max(4, Math.round(r * 0.5))}
        strokeOpacity={0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={r} fill={accent} fillOpacity={0.92} />
      ))}
    </svg>
  )
}

// The small brand chip: teal rounded square + a dark 3-residue molecule. Matches
// src/components/BrandMark.tsx and the favicon.
function BrandChip() {
  return (
    <div
      style={{
        display: 'flex',
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: BRAND,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={34} height={34} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="9,21 16,11 23,21"
          fill="none"
          stroke="#0E1512"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="21" r="4.1" fill="#0E1512" />
        <circle cx="16" cy="11" r="4.6" fill="#0E1512" />
        <circle cx="23" cy="21" r="4.1" fill="#0E1512" />
      </svg>
    </div>
  )
}

function Chip({ children, accent }: { children: string; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: 10,
        border: `1px solid ${rgba(accent, 0.33)}`,
        backgroundColor: rgba(accent, 0.1),
        color: 'rgba(255,255,255,0.82)',
        fontSize: 24,
      }}
    >
      {children}
    </div>
  )
}

export function ogImage({
  eyebrow,
  title,
  subtitle,
  accent = BRAND,
  sequence,
  residues,
  chips = [],
}: {
  eyebrow: string
  title: string
  subtitle?: string
  accent?: string
  /** Catalog: single-letter sequence, shown as a structural fingerprint. */
  sequence?: string
  /** Catalog: residue count — drives the molecule silhouette. */
  residues?: number
  /** Catalog: short fact chips (residues, weight, FDA). */
  chips?: string[]
}): ReactElement {
  const nodeCount = residues ?? 6
  const seqShown =
    sequence && sequence.length > 44 ? `${sequence.slice(0, 44)}…` : sequence

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        backgroundColor: '#0E1512',
        backgroundImage: `radial-gradient(900px 520px at 88% -12%, ${rgba(accent, 0.2)}, transparent), radial-gradient(760px 520px at -8% 118%, ${rgba(accent, 0.12)}, transparent)`,
        color: '#ffffff',
        fontFamily: '"Space Grotesk", sans-serif',
      }}
    >
      {/* Molecular signature — faint peptide chain anchored bottom-right. */}
      <div style={{ position: 'absolute', right: 40, bottom: 92, display: 'flex', opacity: 0.22 }}>
        <Molecule residues={nodeCount} accent={accent} width={560} height={300} />
      </div>

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BrandChip />
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span>American</span>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Peptide</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: accent,
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        {seqShown && (
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 30,
              letterSpacing: '0.14em',
              color: accent,
            }}
          >
            {seqShown}
          </div>
        )}

        {subtitle && !seqShown && (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.62)',
              marginTop: 26,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        )}

        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
            {chips.map((c) => (
              <Chip key={c} accent={accent}>
                {c}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.5)' }}>
          americanpeptide.com
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.35)' }}>
          Cited · chemistry-grade
        </div>
      </div>
    </div>
  )
}
