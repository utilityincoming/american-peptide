import type { MetadataRoute } from 'next'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { GLOSSARY } from '@/lib/glossary'
import { COMPARISONS } from '@/lib/comparisons'
import { hasSourcingPage, vendorsRanked } from '@/lib/vendors'

const SITE = 'https://americanpeptide.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    // ── Core ──────────────────────────────────────────────
    { path: '', priority: 1.0 },
    // ── Sourcing / trust standard ─────────────────────────
    { path: '/us-peptides', priority: 0.9 },
    { path: '/sources', priority: 0.9 },
    { path: '/vendors', priority: 0.8 },
    { path: '/methodology', priority: 0.9 },
    // ── GLP-1 / Metabolic cluster ─────────────────────────
    { path: '/glp-1', priority: 0.9 },
    // ── Healing & Repair cluster ──────────────────────────
    { path: '/bpc-157', priority: 0.9 },
    // ── GH Axis cluster ───────────────────────────────────
    { path: '/gh-peptides', priority: 0.9 },
    // ── Muscle preservation / body-composition cluster ────
    { path: '/muscle-preservation', priority: 0.9 },
    // ── Comparisons index ─────────────────────────────────
    { path: '/compare', priority: 0.8 },
    // ── Longevity cluster ─────────────────────────────────
    { path: '/longevity-peptides', priority: 0.8 },
    // ── Cognitive cluster ─────────────────────────────────
    { path: '/cognitive-peptides', priority: 0.8 },
    // ── Immune cluster ────────────────────────────────────
    { path: '/immune-peptides', priority: 0.8 },
    // ── Catalog & Learning ────────────────────────────────
    { path: '/catalog', priority: 0.8 },
    // The side-by-side comparator (no `?ids=`) is a real landing surface with a
    // self-canonical; it was indexable but undeclared, so search found it before
    // the sitemap did. Declared here so discovery and the sitemap agree.
    { path: '/catalog/compare', priority: 0.5 },
    { path: '/learn', priority: 0.8 },
    { path: '/learn/compatibility', priority: 0.8 },
    { path: '/learn/evidence-hierarchy', priority: 0.8 },
    { path: '/synthesis', priority: 0.8 },
    { path: '/research-areas', priority: 0.8 },
    { path: '/glossary', priority: 0.8 },
    // ── Tools & Research ──────────────────────────────────
    { path: '/research', priority: 0.8 },
    { path: '/compounds', priority: 0.8 },
    // /compounds/builder is intentionally omitted — it's a noindex learning game.
    { path: '/trials', priority: 0.8 },
    { path: '/tools/reconstitution-calculator', priority: 0.8 },
    { path: '/tools/coa-decoder', priority: 0.8 },
    // /tools/tracker is intentionally omitted — a private, local-first beta
    // logbook marked noindex (same reasoning as /workspace), so it must not be
    // advertised for crawling.
    // /workspace is intentionally omitted — it's a private, per-browser page
    // marked noindex, so it must not be advertised for crawling.
    // ── Specialized hubs ──────────────────────────────────
    { path: '/melanocortin', priority: 0.7 },
    { path: '/developers', priority: 0.7 },
    // ── Company / info ────────────────────────────────────
    // Trust pages carried by the brand itself, not by the research clusters.
    // They were indexable from day one but only loosely linked (contact ← about
    // alone, privacy orphaned entirely), so search picked them up ahead of the
    // sitemap. Declared here — and now linked site-wide from the footer — so the
    // index stops running ahead of what the site actually advertises. They
    // change rarely, so they carry an honest changeFrequency rather than the
    // cluster default.
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/about/contact', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    // /press is discoverable here (sitemap only, no footer link) rather than
    // through many internal links — an informational media kit that doesn't
    // need PageRank funneled to it, just to be crawlable.
    { path: '/press', priority: 0.5 },
  ].map(({ path, priority, changeFrequency = 'weekly' }) => ({
    url: `${SITE}${path}`,
    changeFrequency: changeFrequency as
      | 'weekly'
      | 'monthly'
      | 'yearly',
    priority,
  }))

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE}/catalog/category/${c.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const researchAreaRoutes = RESEARCH_AREAS.map((a) => ({
    url: `${SITE}/research-areas/${a.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    // Same editorial-review date that drives the page's visible stamp + JSON-LD
    // dateModified, so the sitemap's lastmod never claims a freshness the page
    // can't back up. Omitted when unreviewed rather than faked to build time.
    ...(a.updated ? { lastModified: new Date(a.updated) } : {}),
  }))

  const glossaryRoutes = GLOSSARY.map((t) => ({
    url: `${SITE}/glossary/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const peptideRoutes = PEPTIDES.map((p) => ({
    url: `${SITE}/catalog/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Sourcing pages exist only for compounds with a real field to rank, so the
  // sitemap derives from the same gate the pages generate from — a compound
  // gaining or losing a second vendor updates both at once, never just one.
  const sourceRoutes = PEPTIDES.filter((p) => hasSourcingPage(p.slug)).map((p) => ({
    url: `${SITE}/sources/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const comparisonRoutes = COMPARISONS.map((c) => ({
    url: `${SITE}/compare/${c.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    // lastmod mirrors the comparison's editorial-review date (the same `updated`
    // that feeds freshnessProps + the LastUpdated stamp on the page). A reviewed
    // comparison advertises a trustworthy recrawl signal; an unreviewed one
    // simply omits it instead of inventing one.
    ...(c.updated ? { lastModified: new Date(c.updated) } : {}),
  }))

  // One review page per directory-listed vendor. vendorsRanked() returns [] on
  // the reference-only Play (TWA) build, so these are naturally absent there —
  // matching the /vendors/[id] route, which 404s on that build.
  const vendorRoutes = vendorsRanked().map((v) => ({
    url: `${SITE}/vendors/${v.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...researchAreaRoutes,
    ...glossaryRoutes,
    ...peptideRoutes,
    ...sourceRoutes,
    ...comparisonRoutes,
    ...vendorRoutes,
  ]
}
