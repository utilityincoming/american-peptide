import type { NextConfig } from 'next'
import path from 'node:path'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig: NextConfig = {
  compress: true,
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
