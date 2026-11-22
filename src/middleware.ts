import { NextResponse, type NextRequest } from 'next/server'

// americanpeptide.net is the dedicated OUTBOUND-REDIRECT host. It serves only
// the /go/<id> affiliate chokepoint, so commercial outbound leaves through .net
// rather than the editorial americanpeptide.com domain — keeping the trust
// domain's outbound link profile clean. Every other path on .net is a permanent
// (308) redirect to the canonical .com equivalent, so the .net domain never
// accrues a duplicate-content index of the main site.
//
// SAFE TO SHIP BEFORE DNS: the host check never matches on americanpeptide.com
// or on Vercel preview hosts, so this is a no-op everywhere until .net is
// attached to this project and its links are activated (see lib/redirect-origin).
//
// app.americanpeptide.com is RETIRED: it was the original Vercel project's
// domain and still serves a stale build there. It is treated identically to
// .net's redirect behavior (but without the /go carve-out, which it never
// served) so any old link 308s to the canonical page on americanpeptide.com.
//
// americanpeptide.org is NOT in this list on purpose. It is a SEPARATE live
// site with its own repository (utilityincoming/american-peptide-org) and its
// own Vercel deployment — the public methods/standards home (evidence-tier
// schema, calculator methodology, CC BY datasets). Its spec URLs are frozen and
// citable, so it must never be 308'd onto .com. Do not add .org here: that would
// only ever fire if .org's domain were mis-attached to THIS project, and the
// result would silently destroy the standards site and break every citation.
//
// The .app, .bio, and .store variants are owned and parked (no DNS pointed
// anywhere yet). They are NOT auto-consolidation hosts: each one's treatment is
// a deliberate per-domain decision (redirect to .com, point at .org, or stand
// up something new). Add a parked domain here only once that decision is made
// AND its DNS resolves to this .com project.
//
// Stays middleware, not proxy. Next 16 proxy is Node-only; this host split
// wants the Edge runtime, which middleware still provides.
const REDIRECT_HOSTS = ['americanpeptide.net', 'app.americanpeptide.com']
const CANONICAL_ORIGIN = 'https://americanpeptide.com'
const CANONICAL_HOST = 'americanpeptide.com'

// ── Markdown content negotiation ─────────────────────────────────────────────
//
// Agents can ask for a page as clean markdown instead of scraping the HTML by
// sending `Accept: text/markdown` (see Cloudflare's "Markdown for Agents" and
// llmstxt.org). For the content routes that already have a markdown twin under
// /md/*, we rewrite the SAME canonical URL to that twin when — and only when —
// the markdown media type is explicitly requested. Browsers and ordinary
// crawlers (which send text/html or */*) keep getting HTML, the default.
//
// Because both representations live at one URL, every negotiable response is
// tagged `Vary: Accept` so a shared cache never serves markdown to a browser or
// vice-versa.

// True only when `Accept` lists `text/markdown` as an explicit, non-wildcard
// type. A bare `*/*` or `text/*` does NOT count — those are what browsers and
// generic crawlers send, and they must receive HTML.
function wantsMarkdown(accept: string): boolean {
  return accept
    .toLowerCase()
    .split(',')
    .some((part) => part.trim().split(';')[0].trim() === 'text/markdown')
}

// Map a canonical page path to its /md/* markdown twin, or null if the path has
// no markdown representation (then HTML is served as usual). Pure string work so
// it stays cheap on the Edge runtime — no catalog data is imported here.
function markdownTwin(pathname: string): string | null {
  if (pathname === '/') return '/md/index'

  // Single-segment dynamic pages: /catalog/<slug>, /research-areas/<slug>,
  // /compare/<pair>. Multi-segment siblings (/catalog/category/<id>,
  // /catalog/compare) and already-markdown URLs (/catalog/<slug>.md) are left
  // on their own handlers.
  const dynamic: Record<string, string> = {
    catalog: '/md/catalog',
    'research-areas': '/md/research-areas',
    compare: '/md/compare',
  }
  // Reserved single-segment children that are their own pages, not dynamic
  // slugs — they must not be mistaken for a catalog/compare entry.
  const reserved: Record<string, Set<string>> = {
    catalog: new Set(['compare', 'category']),
  }
  const segs = pathname.replace(/^\/+|\/+$/g, '').split('/')
  if (segs.length === 2 && dynamic[segs[0]]) {
    const slug = segs[1]
    if (slug && !slug.endsWith('.md') && !reserved[segs[0]]?.has(slug)) {
      return `${dynamic[segs[0]]}/${slug}`
    }
  }
  return null
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0]
  const { pathname, search } = req.nextUrl

  // www → apex. The site canonicalizes on the bare apex (every canonical tag,
  // metadataBase, and the sitemap all use https://americanpeptide.com with no
  // www), but www.americanpeptide.com otherwise serves the full site byte-for-
  // byte. Google was indexing the www variant and picking it as canonical over
  // our declared apex ("Duplicate, Google chose different canonical than user"
  // in Search Console). A 308 collapses the two hostnames into one, preserving
  // path + query and the request method.
  if (host === `www.${CANONICAL_HOST}`) {
    return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308)
  }

  const onRedirectHost = REDIRECT_HOSTS.some(
    (h) => host === h || host === `www.${h}`,
  )
  if (!onRedirectHost) {
    // Canonical host (and previews / localhost): serve markdown twins to agents
    // that ask for them, HTML to everyone else.
    const twin = markdownTwin(pathname)
    if (twin) {
      if (wantsMarkdown(req.headers.get('accept') ?? '')) {
        const url = req.nextUrl.clone()
        url.pathname = twin
        const res = NextResponse.rewrite(url)
        res.headers.set('Vary', 'Accept')
        return res
      }
      // Same URL can also yield markdown, so mark the HTML variant cacheable
      // per Accept.
      const res = NextResponse.next()
      res.headers.set('Vary', 'Accept')
      return res
    }
    return NextResponse.next()
  }

  // The one thing .net exists to serve: let the /go chokepoint run (it 302s out
  // to the vendor and records the no-PII referral click, same as on .com).
  // app.americanpeptide.com never served /go, so it redirects there too.
  if (
    (host === REDIRECT_HOSTS[0] || host === `www.${REDIRECT_HOSTS[0]}`) &&
    (pathname === '/go' || pathname.startsWith('/go/'))
  ) {
    return NextResponse.next()
  }

  // Everything else consolidates to the canonical domain, preserving the path
  // and query so a stray deep link still lands where it should on .com.
  return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308)
}

export const config = {
  // Run on everything except Next internals and common static files; the host
  // check inside makes it a no-op on the canonical domain regardless.
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)'],
}
