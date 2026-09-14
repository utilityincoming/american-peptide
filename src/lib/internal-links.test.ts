import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { FOOTER_CONTENT_LINKS, FOOTER_COMPLIANCE_LINKS } from '@/lib/internal-links'

// Strategic internal linking is limited to sitemap pages: a content link may
// only target a path the sitemap emits. This pins that invariant so a future
// edit can't quietly link a noindex/orphan page (or an old beta URL) site-wide.

const sitemapPaths = new Set(
  sitemap().map((e) => new URL(e.url).pathname),
)

describe('internal linking is limited to the sitemap', () => {
  it('every footer content link targets a sitemap page', () => {
    for (const link of FOOTER_CONTENT_LINKS) {
      expect(
        sitemapPaths.has(link.href),
        `"${link.href}" is linked site-wide but missing from the sitemap`,
      ).toBe(true)
    }
  })

  it('compliance links stay out of the sitemap (legal-only, not ranking targets)', () => {
    for (const link of FOOTER_COMPLIANCE_LINKS) {
      expect(sitemapPaths.has(link.href)).toBe(false)
    }
  })
})
