// Weekly ClinicalTrials.gov v2 & NCBI E-utilities (PubMed) Diff Script
//
// Queries ClinicalTrials.gov v2 API and PubMed E-utilities for catalog compounds,
// respecting upstream rate limits and caching responses locally in
// `.cache/literature-sync/` (24h TTL by default).
//
// Diffs newly returned NCT statuses, phase transitions, and newly indexed PMIDs
// against the committed snapshot (`data/literature-snapshot.json`) and emits a
// Markdown + JSON digest suitable for release notes or a `/trials/updates` feed.
//
// NEVER auto-overwrites editorial summaries, catalog records (`src/lib/peptides.ts`),
// or evidence tiers — outputs staged candidate updates for human review only.
//
// Usage:
//   node --experimental-strip-types scripts/sync-trial-diffs.ts
//   node --experimental-strip-types scripts/sync-trial-diffs.ts --compound=ghk-cu
//   node --experimental-strip-types scripts/sync-trial-diffs.ts --compound=semaglutide --dry-run
//   node --experimental-strip-types scripts/sync-trial-diffs.ts --write-snapshot

import fs from 'node:fs'
import path from 'node:path'
import Module from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src')

// Register synchronous resolution hook so `@/*` and extensionless TS imports resolve
Module.registerHooks({
  resolve(specifier, context, nextResolve) {
    let targetPath: string | null = null

    if (specifier.startsWith('@/')) {
      targetPath = path.join(SRC_DIR, specifier.slice(2))
    } else if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      context.parentURL?.startsWith('file:')
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL))
      targetPath = path.resolve(parentDir, specifier)
    }

    if (targetPath) {
      const candidates = [
        targetPath,
        `${targetPath}.ts`,
        `${targetPath}.tsx`,
        `${targetPath}.js`,
        `${targetPath}.json`,
        path.join(targetPath, 'index.ts'),
        path.join(targetPath, 'index.tsx'),
        path.join(targetPath, 'index.js'),
      ]
      for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) {
          const isJson = c.endsWith('.json')
          return {
            url: pathToFileURL(c).href,
            shortCircuit: true,
            ...(isJson ? { importAttributes: { type: 'json' } } : {}),
          }
        }
      }
    }

    return nextResolve(specifier, context)
  },
})

const { LISTED_PEPTIDES, getPeptideBySlug } = await import('../src/lib/peptides')
const { researchQuery } = await import('../src/lib/freshness')
const { diffCompoundSnapshot, formatDigestMarkdown } = await import('../src/lib/literature-diff')

import type {
  TrialSnapshotRecord,
  ArticleSnapshotRecord,
  CompoundLiteratureSnapshot,
  LiteratureSnapshotFile,
  CompoundDiffDigest,
  LiteratureDiffReport,
} from '../src/lib/literature-diff'

const SNAPSHOT_PATH = path.join(ROOT, 'data', 'literature-snapshot.json')
const DIGEST_JSON_PATH = path.join(ROOT, 'data', 'literature-diff-digest.json')
const DIGEST_MD_PATH = path.join(ROOT, 'data', 'literature-diff-digest.md')
const CACHE_DIR = path.join(ROOT, '.cache', 'literature-sync')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const RATE_LIMIT_DELAY_MS = 380 // <= 3 requests/sec for NCBI E-utilities without API key
const TIMEOUT_MS = 10_000
const MAX_ITEMS = 6

const args = process.argv.slice(2)
const compoundArg = args.find((a) => a.startsWith('--compound='))?.split('=')[1]?.trim()
const isDryRun = args.includes('--dry-run') || Boolean(compoundArg && !args.includes('--write'))
const writeSnapshot = args.includes('--write-snapshot')
const noCache = args.includes('--no-cache')
const jsonOnly = args.includes('--json')

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pick(obj: unknown, ...keys: (string | number)[]): unknown {
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string | number, unknown>)[k]
  }
  return cur
}

function readCache<T>(key: string): T | null {
  if (noCache) return null
  try {
    const file = path.join(CACHE_DIR, `${key}.json`)
    if (!fs.existsSync(file)) return null
    const stat = fs.statSync(file)
    if (Date.now() - stat.mtimeMs > CACHE_TTL_MS) return null
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}

function writeCache(key: string, data: unknown): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    const file = path.join(CACHE_DIR, `${key}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch {
    // Cache writes are best-effort
  }
}

let lastRequestTime = 0
async function rateLimitedFetchJson(url: string): Promise<unknown> {
  const elapsed = Date.now() - lastRequestTime
  if (elapsed < RATE_LIMIT_DELAY_MS) {
    await sleep(RATE_LIMIT_DELAY_MS - elapsed)
  }
  lastRequestTime = Date.now()
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AmericanPeptide-LiteratureDiff/1.0 (+https://americanpeptide.com)',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function fetchTrialsForCompound(slug: string, query: string): Promise<TrialSnapshotRecord[]> {
  const cacheKey = `ctgov-${slug}`
  const cached = readCache<TrialSnapshotRecord[]>(cacheKey)
  if (cached) return cached

  try {
    const enc = encodeURIComponent(query)
    const data = await rateLimitedFetchJson(
      `https://clinicaltrials.gov/api/v2/studies?query.term=${enc}&pageSize=${MAX_ITEMS}&sort=LastUpdatePostDate:desc`,
    )
    const studies = pick(data, 'studies')
    if (!Array.isArray(studies)) return []
    const trials = studies
      .map((s): TrialSnapshotRecord | null => {
        const nctId = pick(s, 'protocolSection', 'identificationModule', 'nctId')
        if (typeof nctId !== 'string') return null
        const phases = pick(s, 'protocolSection', 'designModule', 'phases')
        return {
          nctId,
          title: String(
            pick(s, 'protocolSection', 'identificationModule', 'briefTitle') ?? 'Untitled study',
          ),
          status: (pick(s, 'protocolSection', 'statusModule', 'overallStatus') as string) ?? null,
          phase: Array.isArray(phases) && phases.length > 0 ? phases.join(', ') : null,
          lastUpdate:
            (pick(
              s,
              'protocolSection',
              'statusModule',
              'lastUpdatePostDateStruct',
              'date',
            ) as string) ?? null,
          url: `https://clinicaltrials.gov/study/${nctId}`,
        }
      })
      .filter((x): x is TrialSnapshotRecord => x !== null)
    writeCache(cacheKey, trials)
    return trials
  } catch (err) {
    if (!jsonOnly) {
      console.warn(`  [warn] ClinicalTrials.gov fetch failed for ${slug}: ${(err as Error).message}`)
    }
    return []
  }
}

async function fetchArticlesForCompound(
  slug: string,
  query: string,
): Promise<ArticleSnapshotRecord[]> {
  const cacheKey = `pubmed-${slug}`
  const cached = readCache<ArticleSnapshotRecord[]>(cacheKey)
  if (cached) return cached

  try {
    const enc = encodeURIComponent(query)
    const search = await rateLimitedFetchJson(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${enc}&retmax=${MAX_ITEMS}&retmode=json&sort=date`,
    )
    const idsRaw = pick(search, 'esearchresult', 'idlist')
    const ids = Array.isArray(idsRaw) ? (idsRaw as string[]) : []
    if (ids.length === 0) {
      writeCache(cacheKey, [])
      return []
    }
    const sum = await rateLimitedFetchJson(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
    )
    const articles = ids
      .map((id): ArticleSnapshotRecord | null => {
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
      .filter((x): x is ArticleSnapshotRecord => x !== null)
    writeCache(cacheKey, articles)
    return articles
  } catch (err) {
    if (!jsonOnly) {
      console.warn(`  [warn] PubMed fetch failed for ${slug}: ${(err as Error).message}`)
    }
    return []
  }
}

function loadCommittedSnapshot(): LiteratureSnapshotFile {
  if (fs.existsSync(SNAPSHOT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8')) as LiteratureSnapshotFile
    } catch {
      // fall through to empty baseline
    }
  }
  return {
    schemaVersion: '1.0.0',
    updatedAt: new Date(0).toISOString(),
    note: 'Committed baseline snapshot for scripts/sync-trial-diffs.ts. Staged diffs never auto-edit catalog monographs.',
    compounds: {},
  }
}

// Resolve target compounds
const targetPeptides = (() => {
  if (compoundArg) {
    const p = getPeptideBySlug(compoundArg)
    if (!p) {
      console.error(`Unknown compound slug: "${compoundArg}"`)
      process.exit(1)
    }
    return [p]
  }
  return LISTED_PEPTIDES
})()

const committed = loadCommittedSnapshot()
const nowIso = new Date().toISOString()
const compoundDigests: CompoundDiffDigest[] = []
const updatedCompounds: Record<string, CompoundLiteratureSnapshot> = {
  ...committed.compounds,
}

for (const peptide of targetPeptides) {
  const query = researchQuery(peptide)
  const [trials, articles] = await Promise.all([
    fetchTrialsForCompound(peptide.slug, query),
    fetchArticlesForCompound(peptide.slug, query),
  ])

  const currentSnap: CompoundLiteratureSnapshot = {
    slug: peptide.slug,
    name: peptide.name,
    query,
    fetchedAt: nowIso,
    trials,
    articles,
  }

  const prevSnap = committed.compounds[peptide.slug] ?? null
  const digest = diffCompoundSnapshot(prevSnap, currentSnap)
  compoundDigests.push(digest)
  updatedCompounds[peptide.slug] = currentSnap
}

const report: LiteratureDiffReport = {
  generatedAt: nowIso,
  baselineUpdatedAt: committed.updatedAt,
  dryRun: isDryRun,
  compoundsChecked: targetPeptides.length,
  summary: {
    newTrials: compoundDigests.reduce((acc, d) => acc + d.newTrials.length, 0),
    statusChanges: compoundDigests.reduce((acc, d) => acc + d.statusChanges.length, 0),
    phaseTransitions: compoundDigests.reduce((acc, d) => acc + d.phaseTransitions.length, 0),
    newArticles: compoundDigests.reduce((acc, d) => acc + d.newArticles.length, 0),
  },
  digests: compoundDigests,
}

const markdownDigest = formatDigestMarkdown(report)

if (!isDryRun) {
  fs.mkdirSync(path.dirname(DIGEST_JSON_PATH), { recursive: true })
  fs.writeFileSync(DIGEST_JSON_PATH, JSON.stringify(report, null, 2) + '\n')
  fs.writeFileSync(DIGEST_MD_PATH, markdownDigest)
  if (writeSnapshot) {
    const nextSnapshot: LiteratureSnapshotFile = {
      schemaVersion: '1.0.0',
      updatedAt: nowIso,
      note: committed.note,
      compounds: updatedCompounds,
    }
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(nextSnapshot, null, 2) + '\n')
  }
}

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(markdownDigest)
}
