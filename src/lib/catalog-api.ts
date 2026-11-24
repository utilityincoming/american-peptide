// Shared serialization + headers for the open catalog API (/api/catalog).
//
// Exposes a clean, public reference shape of each peptide.

import { createCatalogMatcher } from './catalog-query'
import { PEPTIDES, getCategoryLabel, type Peptide } from './peptides'
import {
  getAreasForPeptide,
  getResearchAreaBySlug,
  getPeptidesForArea,
} from './research-areas'

export const API_SITE = 'https://americanpeptide.com'
export const API_VERSION = '1.0'
export const API_LICENSE = 'CC BY 4.0'
export const API_ATTRIBUTION = 'AmericanPeptide.com'

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Cache at the edge: peptide data changes rarely, so a long s-maxage with
// stale-while-revalidate keeps the open API fast and cheap to serve.
export const CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}

// Metered responses contain request-specific usage headers. Only their
// underlying catalog data may be reused across callers.
export function apiHeaders(usageHeaders?: Record<string, string>): Record<string, string> {
  return {
    ...CORS_HEADERS,
    ...usageHeaders,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Expose-Headers':
      'X-API-Tier, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-Quota-Limit, X-Quota-Remaining, Retry-After',
    'Cache-Control': 'private, no-store',
  }
}

export function catalogAccessError(response: Response): Response {
  for (const [name, value] of Object.entries(apiHeaders())) {
    response.headers.set(name, value)
  }
  return response
}

export interface ApiPeptide {
  slug: string
  name: string
  aliases: string[]
  categories: string[]
  categoryLabels: string[]
  researchAreas: string[]
  researchAreaGuides: { slug: string; label: string; url: string }[]
  shortDescription: string
  description: string
  background: string[]
  keyResearch: string[]
  faqs: { q: string; a: string }[]
  mechanism: string | null
  molecularWeight: number | null
  molecularFormula: string | null
  sequence: string | null
  cas: string | null
  pubchemCid: number | null
  uniprotId: string | null
  fdaApproved: boolean
  url: string
}

// The deployed dataset is immutable and each deploy creates a new cache.
const serializedPeptides = new WeakMap<Peptide, ApiPeptide>()

export function serializePeptide(p: Peptide): ApiPeptide {
  const cached = serializedPeptides.get(p)
  if (cached) return cached
  const serialized = buildPeptideResponse(p)
  serializedPeptides.set(p, serialized)
  return serialized
}

function buildPeptideResponse(p: Peptide): ApiPeptide {
  return {
    slug: p.slug,
    name: p.name,
    aliases: p.aliases ?? [],
    categories: p.categories,
    categoryLabels: p.categories.map((c) => getCategoryLabel(c)),
    researchAreas: p.researchAreas ?? [],
    researchAreaGuides: getAreasForPeptide(p).map((a) => ({
      slug: a.slug,
      label: a.label,
      url: `${API_SITE}/research-areas/${a.slug}`,
    })),
    shortDescription: p.shortDescription,
    description: p.description,
    background: p.background ?? [],
    keyResearch: p.keyResearch ?? [],
    faqs: p.faqs ?? [],
    mechanism: p.mechanism ?? null,
    molecularWeight: p.molecularWeight ?? null,
    molecularFormula: p.molecularFormula ?? null,
    sequence: p.sequence ?? null,
    cas: p.cas ?? null,
    pubchemCid: p.pubchemCid ?? null,
    uniprotId: p.uniprotId ?? null,
    fdaApproved: Boolean(p.fdaApproved),
    url: `${API_SITE}/catalog/${p.slug}`,
  }
}

const matchesApiQuery = createCatalogMatcher(true)
const MAX_FILTER_CACHE_ENTRIES = 64
const filterResults = new Map<string, readonly Peptide[]>()

export interface PeptideFilter {
  category?: string | null
  area?: string | null
  fdaOnly?: boolean
  q?: string | null
}

/**
 * Shared catalog filtering — one definition of the query semantics used by
 * both the JSON API (/api/catalog) and the MCP server (/api/mcp).
 * Returns an error string (instead of items) for an unknown research area.
 */
export function filterPeptides(
  f: PeptideFilter,
): { items: readonly Peptide[] } | { error: string } {
  const area = f.area?.toLowerCase() || null
  const category = f.category?.toLowerCase() || null
  const q = f.q?.toLowerCase() || null
  const key =
    [area, category, q].every((value) => !value || value.length <= 200)
      ? JSON.stringify([area, category, q, Boolean(f.fdaOnly)])
      : null

  if (key !== null) {
    const cached = filterResults.get(key)
    if (cached) {
      filterResults.delete(key)
      filterResults.set(key, cached)
      return { items: cached }
    }
  }

  let items = PEPTIDES

  if (area) {
    const meta = getResearchAreaBySlug(area)
    if (!meta) {
      return {
        error: `Unknown research area '${f.area}'. See documentation for valid slugs.`,
      }
    }
    items = getPeptidesForArea(meta)
  }

  if (category) {
    items = items.filter((p) => p.categories.some((c) => c.toLowerCase() === category))
  }

  if (f.fdaOnly) items = items.filter((p) => p.fdaApproved)

  if (q) items = items.filter((p) => matchesApiQuery(p, q))

  if (key !== null) {
    if (filterResults.size >= MAX_FILTER_CACHE_ENTRIES) {
      const oldest = filterResults.keys().next()
      if (!oldest.done) filterResults.delete(oldest.value)
    }
    filterResults.set(key, items)
  }

  return { items }
}

// True when the request is a top-level browser navigation (address bar, link,
// new tab) rather than a programmatic API call. Used to redirect humans to the
// docs page instead of showing them a raw JSON dump. The service worker and
// fetch()/XHR clients send Sec-Fetch-Dest other than "document", so they still
// receive JSON.
export function isBrowserDocumentRequest(req: Request): boolean {
  const dest = req.headers.get('sec-fetch-dest')
  if (dest) return dest === 'document'
  // Fallback for clients that don't send Sec-Fetch-* (older browsers/crawlers).
  const accept = req.headers.get('accept') || ''
  return accept.includes('text/html') && !accept.includes('application/json')
}

export function apiMeta() {
  return {
    version: API_VERSION,
    license: API_LICENSE,
    attribution: API_ATTRIBUTION,
    documentation: `${API_SITE}/developers`,
  }
}
