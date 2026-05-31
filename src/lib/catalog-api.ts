// Shared serialization + headers for the open catalog API (/api/catalog).
//
// Exposes a clean, public reference shape of each peptide. Deliberately omits
// the internal `market` stub (forward-looking, not real data) so the open
// dataset never ships placeholder values.

import { getCategoryLabel, type Peptide } from './peptides'
import { getAreasForPeptide } from './research-areas'

export const API_SITE = 'https://www.americanpeptide.com'
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

export function apiHeaders(): Record<string, string> {
  return { ...CORS_HEADERS, ...CACHE_HEADERS }
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

export function serializePeptide(p: Peptide): ApiPeptide {
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

export function apiMeta() {
  return {
    version: API_VERSION,
    license: API_LICENSE,
    attribution: API_ATTRIBUTION,
    documentation: `${API_SITE}/developers`,
  }
}
