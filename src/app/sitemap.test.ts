import { describe, it, expect } from 'vitest'
import sitemap from './sitemap'
import { COMPARISONS } from '@/lib/comparisons'
import { RESEARCH_AREAS } from '@/lib/research-areas'

// SEO-critical invariants for the XML sitemap. The failure mode these guard
// against is quiet: a page ships indexable but undeclared, search finds it on
// its own, and the sitemap never catches up. Each assertion below is one route
// class that must stay in lockstep with what the app actually serves.

const SITE = 'https://americanpeptide.com'
const routes = sitemap()
const urls = routes.map((r) => r.url)
const urlSet = new Set(urls)

describe('sitemap', () => {
  it('declares the brand trust pages (loosely-linked but indexable)', () => {
    for (const path of ['/about', '/about/contact', '/privacy']) {
      expect(urlSet.has(`${SITE}${path}`)).toBe(true)
    }
  })

  it('declares the catalog comparator landing surface', () => {
    expect(urlSet.has(`${SITE}/catalog/compare`)).toBe(true)
  })

  it('uses the bare origin for the homepage — no trailing slash', () => {
    expect(urlSet.has(SITE)).toBe(true)
    expect(urlSet.has(`${SITE}/`)).toBe(false)
  })

  it('never advertises a noindex / private route for crawling', () => {
    const forbidden = [
      '/workspace',
      '/offline',
      '/compounds/builder',
      '/tools/blend-calculator',
      '/tools/design-lab',
      '/tools/calculator-beta',
      '/tools/tracker',
    ]
    for (const path of forbidden) {
      expect(urlSet.has(`${SITE}${path}`)).toBe(false)
    }
  })

  it('emits lastModified only where an editorial-review date backs it', () => {
    const withLastMod = (prefix: string) =>
      routes.filter((r) => r.url.startsWith(`${SITE}${prefix}`) && r.lastModified)

    const reviewedComparisons = COMPARISONS.filter((c) => c.updated).length
    expect(withLastMod('/compare/').length).toBe(reviewedComparisons)

    const reviewedAreas = RESEARCH_AREAS.filter((a) => a.updated).length
    expect(withLastMod('/research-areas/').length).toBe(reviewedAreas)

    // Every lastModified that is present must be a real, valid date — never a
    // string that silently fails to serialize to <lastmod>.
    for (const r of routes) {
      if (r.lastModified) {
        expect(Number.isNaN(new Date(r.lastModified).getTime())).toBe(false)
      }
    }
  })

  it('contains no duplicate URLs and only absolute, on-origin URLs', () => {
    expect(urlSet.size).toBe(urls.length)
    for (const url of urls) {
      expect(url.startsWith(`${SITE}/`) || url === SITE).toBe(true)
    }
  })
})
