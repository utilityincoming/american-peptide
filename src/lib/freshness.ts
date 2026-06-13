// Live "Latest research" — recent clinical trials + literature per peptide.
//
// Sources are the free public APIs (ClinicalTrials.gov v2, PubMed E-utilities):
// no key, no LLM, no credits. Fetches are ISR-cached (revalidate daily) so
// pages stay fresh while upstream calls stay minimal — the catalog page, JSON
// API, and markdown twin for one peptide share a single cached result per URL.
//
// Every fetcher FAILS SOFT (returns []). A slow or down upstream must never
// break a page render or a production build; the section simply renders empty
// and refills on the next revalidation.

import type { Peptide } from './peptides'

const REVALIDATE_SEC = 86400 // refresh at most once per day
const TIMEOUT_MS = 6000
const MAX_ITEMS = 6

export interface RecentTrial {
  nctId: string
  title: string
  status: string | null
  phase: string | null
  lastUpdate: string | null
  url: string
}

export interface RecentArticle {
  pmid: string
  title: string
  journal: string | null
  date: string | null
  url: string
}

export interface LatestResearch {
  query: string
  trials: RecentTrial[]
  articles: RecentArticle[]
  fetchedAt: string
}

// A clean search term: drop parenthetical qualifiers from the name
// ("Somatropin (rHGH)" → "Somatropin"); if that leaves something too short to
// be specific (e.g. "EPO"), prefer a longer, more distinctive alias.
export function researchQuery(p: Peptide): string {
  const base = p.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  if (base.length >= 5) return base
  const alias = (p.aliases ?? []).find((a) => a.length > base.length && /^[A-Za-z]/.test(a))
  return alias ?? base
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SEC },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function pick(obj: unknown, ...keys: (string | number)[]): unknown {
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string | number, unknown>)[k]
  }
  return cur
}

async function recentTrials(query: string): Promise<RecentTrial[]> {
  try {
    const enc = encodeURIComponent(query)
    const data = await fetchJson(
      `https://clinicaltrials.gov/api/v2/studies?query.term=${enc}&pageSize=${MAX_ITEMS}&sort=LastUpdatePostDate:desc`,
    )
    const studies = pick(data, 'studies')
    if (!Array.isArray(studies)) return []
    return studies
      .map((s): RecentTrial | null => {
        const nctId = pick(s, 'protocolSection', 'identificationModule', 'nctId')
        if (typeof nctId !== 'string') return null
        const phases = pick(s, 'protocolSection', 'designModule', 'phases')
        return {
          nctId,
          title: String(pick(s, 'protocolSection', 'identificationModule', 'briefTitle') ?? 'Untitled study'),
          status: (pick(s, 'protocolSection', 'statusModule', 'overallStatus') as string) ?? null,
          phase: Array.isArray(phases) ? phases.join(', ') : null,
          lastUpdate:
            (pick(s, 'protocolSection', 'statusModule', 'lastUpdatePostDateStruct', 'date') as string) ?? null,
          url: `https://clinicaltrials.gov/study/${nctId}`,
        }
      })
      .filter((x): x is RecentTrial => x !== null)
  } catch {
    return []
  }
}

async function recentArticles(query: string): Promise<RecentArticle[]> {
  try {
    const enc = encodeURIComponent(query)
    const search = await fetchJson(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${enc}&retmax=${MAX_ITEMS}&retmode=json&sort=date`,
    )
    const idsRaw = pick(search, 'esearchresult', 'idlist')
    const ids = Array.isArray(idsRaw) ? (idsRaw as string[]) : []
    if (ids.length === 0) return []
    const sum = await fetchJson(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
    )
    return ids
      .map((id): RecentArticle | null => {
        const r = pick(sum, 'result', id) as Record<string, unknown> | undefined
        if (!r || typeof r.title !== 'string') return null
        return {
          pmid: id,
          title: r.title,
          journal: (r.source as string) ?? null,
          date: (r.pubdate as string) ?? null,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        }
      })
      .filter((x): x is RecentArticle => x !== null)
  } catch {
    return []
  }
}

export async function getLatestResearch(peptide: Peptide): Promise<LatestResearch> {
  const query = researchQuery(peptide)
  const [trials, articles] = await Promise.all([recentTrials(query), recentArticles(query)])
  return { query, trials, articles, fetchedAt: new Date().toISOString() }
}
