// Strategic internal linking — the single source of truth for site-wide links.
//
// Rule: a *content* link may point only at a sitemap page. The sitemap is the
// indexable, crawl-worthy set; linking to anything outside it (a noindex game,
// a private page, an unsanctioned beta URL) wastes PageRank and advertises a
// page we don't want ranked. internal-links.test.ts enforces this by asserting
// every content link below resolves to a path the sitemap actually emits.
//
// Legal/utility pages (Privacy, Contact) are the one deliberate exception:
// compliance requires them reachable from every page, but they are not ranking
// targets and stay out of the sitemap.

export interface NavLink {
  href: string
  label: string
}

/**
 * Site-wide content links. Every target must be a sitemap path — the test will
 * fail the build if one of these points at a noindex/orphan page or a URL the
 * sitemap dropped.
 */
export const FOOTER_CONTENT_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  // Web build only — the Play/TWA build ships no affiliate layer; Footer filters it.
  { href: '/us-peptides', label: 'Buy Peptides' },
  { href: '/compounds', label: 'Compounds' },
  { href: '/tools/reconstitution-calculator', label: 'Reconstitution Calculator' },
  { href: '/developers', label: 'Developers / API' },
  { href: '/about', label: 'About' },
  { href: '/methodology', label: 'Methodology' },
]

/**
 * Legal / utility links — reachable from every page for compliance, but not
 * ranking targets: they are intentionally absent from the sitemap and excluded
 * from the sitemap-membership check.
 */
export const FOOTER_COMPLIANCE_LINKS: NavLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/about/contact', label: 'Contact' },
]
