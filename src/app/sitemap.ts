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
    // /workspace is intentionally omitted — it's a private, per-browser page
    // marked noindex, so it must not be advertised for crawling.
    // ── Specialized hubs ──────────────────────────────────
    { path: '/melanocortin', priority: 0.7 },
    { path: '/developers', priority: 0.7 },
  ].map(({ path, priority }) => ({
    url: `${SITE}${path}`,
    changeFrequency: 'weekly' as const,
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
