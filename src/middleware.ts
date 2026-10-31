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
const REDIRECT_HOST = 'americanpeptide.net'
const CANONICAL_ORIGIN = 'https://americanpeptide.com'

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0]
  const onRedirectHost = host === REDIRECT_HOST || host === `www.${REDIRECT_HOST}`
  if (!onRedirectHost) return NextResponse.next()

  const { pathname, search } = req.nextUrl

  // The one thing .net exists to serve: let the /go chokepoint run (it 302s out
  // to the vendor and records the no-PII referral click, same as on .com).
  if (pathname === '/go' || pathname.startsWith('/go/')) return NextResponse.next()

  // Everything else consolidates to the canonical domain, preserving the path
  // and query so a stray deep link still lands where it should on .com.
  return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308)
}

export const config = {
  // Run on everything except Next internals and common static files; the host
  // check inside makes it a no-op on the canonical domain regardless.
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)'],
}
