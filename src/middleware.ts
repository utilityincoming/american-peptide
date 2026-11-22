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
  if (!onRedirectHost) return NextResponse.next()

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
