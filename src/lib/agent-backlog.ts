// Usage → catalog work queue.
//
// Popular questions already surface as FAQ links (lib/agent-faqs.ts). This is
// the other half: the same question text, counted only when the turn exposed a
// gap the catalog or the tools did not cover. Nothing here trains a model and
// nothing identifies a person — a row appears only after MIN_COUNT repeats of
// the cleaned question, same privacy bar as the dynamic FAQ.
//
// Three signals, recorded best-effort from /api/chat after the reply is sent:
//   catalog_miss    — the question names a compound-like token that is not in
//                     the catalog, so the next reply cannot be pre-grounded.
//   reference_floor — no model answered; the visitor got published reference
//                     text (or a capacity/unavailable path that still logged).
//   no_grounding    — a model answered with neither injected catalog facts nor
//                     any grounding-tool output.

import { kv } from '@/lib/kv'
import { matchPeptides } from '@/lib/agent-context'
import { logAgentQuestion } from '@/lib/agent-faqs'

const KEYS = 'backlog:agent:keys'
const TEXT = 'backlog:agent:text'
const COUNT = (h: string) => `backlog:agent:count:${h}`
const KIND = (h: string) => `backlog:agent:kind:${h}`

const WINDOW_SEC = 60 * 60 * 24 * 45
const MIN_COUNT = 3
const MAX_KEYS_SCAN = 400

export type BacklogKind = 'catalog_miss' | 'reference_floor' | 'no_grounding'

export interface BacklogItem {
  text: string
  count: number
  /** Which gap fired most often for this question. */
  kind: BacklogKind
  kinds: Partial<Record<BacklogKind, number>>
  /** Compound-like token that missed the catalog, when we could name one. */
  hint: string | null
}

const STOP = new Set([
  'peptide',
  'peptides',
  'compound',
  'compounds',
  'this',
  'that',
  'what',
  'which',
  'best',
  'dose',
  'dosing',
])

function hashKey(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

function normalizeKey(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * A compound-like token in the question that the catalog does not cover, or
 * null when the question already matches a catalog peptide (or names nothing
 * we can point at). Digit-bearing tokens (BPC-157, Zentaril-9) and
 * "peptide/compound X" phrases are the only shapes we treat as names.
 */
export function unmatchedCompoundHint(userText: string): string | null {
  if (matchPeptides(userText).length > 0) return null
  const coded = userText.match(/\b[A-Za-z][A-Za-z]*[- ]?\d+[A-Za-z0-9-]*\b/)
  if (coded) return coded[0]
  const named = userText.match(/\b(?:peptide|compound)\s+([A-Za-z][A-Za-z0-9-]{2,})\b/i)
  if (named && !STOP.has(named[1].toLowerCase())) return named[1]
  return null
}

export interface AgentTurnRecord {
  question: string
  /** Also write the dynamic FAQ row. Refusals pass false. */
  logFaq: boolean
  catalogMatched: boolean
  provider: 'venice' | 'grok' | 'anthropic' | 'reference'
  /** True when catalog facts or a tool result were in the grounding set. */
  grounded: boolean
}

/** Record FAQ + gap signals. Best-effort; never throws. */
export async function recordAgentTurn(turn: AgentTurnRecord): Promise<void> {
  const q = turn.question.replace(/\s+/g, ' ').trim()
  if (!q) return
  if (turn.logFaq) await logAgentQuestion(q)

  const kinds: BacklogKind[] = []
  const hint = unmatchedCompoundHint(q)
  if (hint) kinds.push('catalog_miss')
  if (turn.provider === 'reference') kinds.push('reference_floor')
  else if (!turn.grounded && !turn.catalogMatched) kinds.push('no_grounding')
  if (kinds.length === 0) return

  try {
    const key = normalizeKey(q).slice(0, 180)
    if (key.length < 12) return
    const h = hashKey(key)
    await kv.incrWithExpiry(COUNT(h), WINDOW_SEC)
    await kv.sadd(KEYS, h)
    const label = hint ? `${q.slice(0, 200)} [${hint}]` : q.slice(0, 200)
    await kv.hset(TEXT, { [h]: label })
    for (const kind of kinds) {
      await kv.hincrby(KIND(h), kind, 1, WINDOW_SEC)
    }
  } catch {
    /* logging must never affect the chat path */
  }
}

/** Gaps that have been asked enough times to be a real backlog, most-asked first. */
export async function getAgentBacklog(limit = 20): Promise<BacklogItem[]> {
  try {
    const hashes = (await kv.smembers(KEYS)).slice(0, MAX_KEYS_SCAN)
    if (hashes.length === 0) return []
    const textMap = (await kv.hgetall(TEXT)) ?? {}
    const rows = await Promise.all(
      hashes.map(async (h) => ({
        h,
        count: Number(await kv.get(COUNT(h))) || 0,
        kinds: (await kv.hgetall(KIND(h))) ?? {},
      })),
    )
    const items: BacklogItem[] = []
    for (const row of rows) {
      if (row.count < MIN_COUNT || !textMap[row.h]) continue
      const kinds: Partial<Record<BacklogKind, number>> = {}
      let top: BacklogKind = 'catalog_miss'
      let topN = 0
      for (const k of ['catalog_miss', 'reference_floor', 'no_grounding'] as const) {
        const n = Number(row.kinds[k]) || 0
        if (n > 0) kinds[k] = n
        if (n > topN) {
          top = k
          topN = n
        }
      }
      const text = textMap[row.h]
      const hintMatch = text.match(/\[([^\]]+)\]$/)
      items.push({
        text: hintMatch ? text.slice(0, hintMatch.index).trim() : text,
        count: row.count,
        kind: top,
        kinds,
        hint: hintMatch ? hintMatch[1] : null,
      })
    }
    return items.sort((a, b) => b.count - a.count).slice(0, limit)
  } catch {
    return []
  }
}
