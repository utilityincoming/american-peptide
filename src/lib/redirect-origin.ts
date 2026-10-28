// The dedicated outbound-redirect origin for affiliate / community links.
//
// The goal: commercial outbound leaves through americanpeptide.net, not the
// editorial americanpeptide.com domain, so the trust domain's outbound link
// profile stays clean. Every affiliate and community anchor renders as an
// absolute URL on this origin; the /go/<id> route handler that actually 302s to
// the vendor is served on EVERY attached domain (one Vercel project), so this
// only chooses which host the rendered anchors point at. middleware.ts keeps
// americanpeptide.net serving nothing but /go.
//
// DECOUPLED ACTIVATION: the default is '' — links render as same-origin
// /go/<id> paths, exactly as before — so this is safe to ship and merge BEFORE
// americanpeptide.net resolves. To flip every affiliate/community link onto the
// .net host, set in the production Vercel environment:
//
//     NEXT_PUBLIC_REDIRECT_ORIGIN=https://americanpeptide.net
//
// and redeploy. NEXT_PUBLIC_* is inlined at build time, so this stays a static
// constant — no runtime cost, no effect on static prerendering. Leave it unset
// on preview/local deploys so links stay same-origin where .net isn't attached.
export const REDIRECT_ORIGIN = (
  process.env.NEXT_PUBLIC_REDIRECT_ORIGIN ?? ''
).replace(/\/+$/, '')

/**
 * Absolutize a root-relative /go path onto the redirect host. Returns the path
 * unchanged (same-origin) when no redirect origin is configured, so callers can
 * use it unconditionally.
 */
export function goUrl(path: string): string {
  return REDIRECT_ORIGIN ? `${REDIRECT_ORIGIN}${path}` : path
}
