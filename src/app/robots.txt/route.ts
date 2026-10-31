// Host-aware /robots.txt.
//
// americanpeptide.net is the dedicated outbound-redirect host (see
// middleware.ts): it serves only the /go chokepoint and 308s every other path
// to the canonical .com domain, so it must never be crawled or indexed as a
// duplicate of the main site. The 308s already keep it out of the index, but a
// crawler that fetches robots.txt directly on .net should be told plainly to
// stay out — and must NOT be handed the .com sitemap from the .net host.
//
// On the canonical .com domain (and anywhere else: previews, localhost) this
// serves the normal allow-all policy that points at the .com sitemap.
//
// This replaces the former static public/robots.txt. The middleware matcher
// excludes robots.txt, so this route is reached unredirected on every host.

const CANONICAL_ORIGIN = 'https://americanpeptide.com'
const REDIRECT_HOST = 'americanpeptide.net'

// Served per-request: the body depends on the Host header.
export const dynamic = 'force-dynamic'

const CANONICAL_ROBOTS = `User-agent: *
Allow: /

Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml

# AI agents: curated markdown index at /llms.txt, full catalog at /llms-full.txt,
# and per-peptide markdown at /catalog/{slug}.md. Data CC BY 4.0.
`

// The outbound-redirect host advertises no sitemap and disallows everything:
// it exists only to route /go clicks, and every indexable path 308s to .com.
const REDIRECT_HOST_ROBOTS = `User-agent: *
Disallow: /
`

// GET /robots.txt
export function GET(req: Request): Response {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0]
  const onRedirectHost = host === REDIRECT_HOST || host === `www.${REDIRECT_HOST}`

  return new Response(onRedirectHost ? REDIRECT_HOST_ROBOTS : CANONICAL_ROBOTS, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
