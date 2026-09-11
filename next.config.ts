import type { NextConfig } from 'next'
import path from 'node:path'

// Content Security Policy.
// - Next.js hydration + JSON-LD blocks are inline scripts, so 'unsafe-inline' is
//   required for script-src without a nonce (a nonce would force dynamic rendering
//   and defeat static prerendering). 'unsafe-eval' is deliberately NOT allowed.
// - Fonts are self-hosted via next/font, so no external font origins.
// - Vercel Analytics + Speed Insights load from va.vercel-scripts.com and post to
//   vitals.vercel-insights.com.
// - The AI agent + grounding tools (Venice/Anthropic, PubChem/UniProt/etc.) all run
//   server-side in /api/*; the client only calls same-origin routes (connect-src 'self').
// - Google Analytics (@next/third-parties) loads gtag.js from www.googletagmanager.com
//   and beacons to *.google-analytics.com / *.analytics.google.com.
// - No iframes, remote images, blobs, or workers are used.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value:
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()',
  },
]

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent directory otherwise makes Next infer the wrong root, which can
  // mis-trace files for serverless/standalone bundling on deploy.
  outputFileTracingRoot: path.join(__dirname),
  // Markdown twins for agents: /catalog/{slug}.md serves the same peptide as
  // clean markdown via the handler at /md/catalog/{slug}.
  async rewrites() {
    return [
      {
        source: '/catalog/:slug.md',
        destination: '/md/catalog/:slug',
      },
    ]
  },
  // Legacy bespoke comparison URLs → programmatic /compare/[pair]. 301 to
  // preserve any accrued link equity.
  async redirects() {
    return [
      {
        source: '/semaglutide-vs-tirzepatide',
        destination: '/compare/semaglutide-vs-tirzepatide',
        permanent: true,
      },
      {
        source: '/cjc-1295-vs-ipamorelin',
        destination: '/compare/cjc-1295-vs-ipamorelin',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
