// Live catalog for the comparison workspace.
//
// Pages come from /api/v2/catalog. The first page sends If-None-Match. A 304
// reuses the session cache. A 429 or network failure falls back to that cache,
// then to the catalog bundled in this build.

import { LISTED_PEPTIDES } from '@/lib/peptides'
import { getAreasForPeptide } from '@/lib/research-areas'

const CACHE_KEY = 'amp-catalog-v2-cache'
const PAGE = 100
const MAX_PAGES = 8

export interface CatalogRecord {
  slug: string
  name: string
  aliases: string[]
  categories: string[]
  categoryLabels: string[]
  researchAreas: string[]
  areaSlugs: string[]
  sequence: string | null
  molecularWeight: number | null
  molecularFormula: string | null
  pubchemCid: number | null
  uniprotId: string | null
  fdaApproved: boolean
}

export interface CatalogLoad {
  records: CatalogRecord[]
  source: 'live' | 'cache' | 'bundled'
  fetchedAt: string
  notice: string | null
}

interface CacheBody {
  etag: string
  fetchedAt: string
  records: CatalogRecord[]
}

function readCache(): CacheBody | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheBody
    return parsed?.records?.length ? parsed : null
  } catch {
    return null
  }
}

function writeCache(body: CacheBody): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(body))
  } catch {
    /* quota */
  }
}

function bundled(): CatalogRecord[] {
  return LISTED_PEPTIDES.map((peptide) => ({
    slug: peptide.slug,
    name: peptide.name,
    aliases: peptide.aliases ?? [],
    categories: peptide.categories,
    categoryLabels: peptide.categories,
    researchAreas: peptide.researchAreas ?? [],
    areaSlugs: getAreasForPeptide(peptide).map((area) => area.slug),
    sequence: peptide.sequence ?? null,
    molecularWeight: peptide.molecularWeight ?? null,
    molecularFormula: peptide.molecularFormula ?? null,
    pubchemCid: peptide.pubchemCid ?? null,
    uniprotId: peptide.uniprotId ?? null,
    fdaApproved: Boolean(peptide.fdaApproved),
  }))
}

function fromApi(peptide: {
  slug: string
  name: string
  aliases?: string[]
  categories?: string[]
  categoryLabels?: string[]
  researchAreas?: string[]
  researchAreaGuides?: { slug: string }[]
  sequence?: string | null
  molecularWeight?: number | null
  molecularFormula?: string | null
  pubchemCid?: number | null
  uniprotId?: string | null
  fdaApproved?: boolean
}): CatalogRecord {
  return {
    slug: peptide.slug,
    name: peptide.name,
    aliases: peptide.aliases ?? [],
    categories: peptide.categories ?? [],
    categoryLabels: peptide.categoryLabels ?? peptide.categories ?? [],
    researchAreas: peptide.researchAreas ?? [],
    areaSlugs: (peptide.researchAreaGuides ?? []).map((area) => area.slug),
    sequence: peptide.sequence ?? null,
    molecularWeight: peptide.molecularWeight ?? null,
    molecularFormula: peptide.molecularFormula ?? null,
    pubchemCid: peptide.pubchemCid ?? null,
    uniprotId: peptide.uniprotId ?? null,
    fdaApproved: Boolean(peptide.fdaApproved),
  }
}

export async function loadCatalog(): Promise<CatalogLoad> {
  const cached = readCache()
  const collected: CatalogRecord[] = []
  let etag = cached?.etag ?? ''
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const offset = page * PAGE
      const headers: HeadersInit = page === 0 && etag ? { 'if-none-match': etag } : {}
      const response = await fetch(`/api/v2/catalog?limit=${PAGE}&offset=${offset}`, { headers })
      if (page === 0 && response.status === 304 && cached) {
        return { records: cached.records, source: 'cache', fetchedAt: cached.fetchedAt, notice: null }
      }
      if (response.status === 429) {
        throw new Error('rate')
      }
      if (!response.ok) throw new Error(`catalog ${response.status}`)
      etag = response.headers.get('etag') ?? etag
      const json = await response.json()
      collected.push(...(json.peptides ?? []).map(fromApi))
      if (json.pagination?.nextOffset == null) break
    }
    const fetchedAt = new Date().toISOString()
    if (etag) writeCache({ etag, fetchedAt, records: collected })
    return { records: collected, source: 'live', fetchedAt, notice: null }
  } catch {
    if (cached) {
      return {
        records: cached.records,
        source: 'cache',
        fetchedAt: cached.fetchedAt,
        notice: `Live catalog unavailable. Showing the cached catalog from ${cached.fetchedAt}.`,
      }
    }
    return {
      records: bundled(),
      source: 'bundled',
      fetchedAt: new Date().toISOString(),
      notice: 'Live catalog unavailable. Showing the catalog bundled with this page.',
    }
  }
}
