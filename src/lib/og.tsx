import type { ReactElement } from 'react'

// Shared Open Graph image layout (1200×630) for AmericanPeptide.com. Satori-safe:
// flexbox + inline styles only, no Tailwind, no external fonts. Used by the
// opengraph-image route segments (site default + per-molecule catalog pages).
// Next also serves this as the twitter:image when no twitter-image is present.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const DOTS = ['#2DD4A8', '#818CF8', '#60A5FA', '#A78BFA']

export function ogImage({
  eyebrow,
  title,
  subtitle,
  accent = '#2DD4A8',
}: {
  eyebrow: string
  title: string
  subtitle?: string
  accent?: string
}): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        backgroundColor: '#0B1220',
        backgroundImage:
          'radial-gradient(900px 500px at 85% -10%, rgba(45,212,168,0.20), transparent), radial-gradient(700px 500px at 0% 120%, rgba(129,140,248,0.12), transparent)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {DOTS.slice(0, 3).map((c, i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
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
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 1010,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.62)',
              marginTop: 26,
              maxWidth: 940,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.5)' }}>
          americanpeptide.com
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {DOTS.map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}
