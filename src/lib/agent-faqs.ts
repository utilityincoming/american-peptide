// ── Dynamic, usage-sourced FAQs ──────────────────────────────────────────────
//
// "What researchers actually ask the Peptide Agent," surfaced beneath the
// curated static FAQ. Sourced from real /api/chat traffic and ranked by
// frequency — the dynamic counterpart to the hand-curated STATIC_FAQS in
// lib/faqs.ts.
//
// Deliberately NOT pre-answered here: each popular question links into the Agent
// (/research?q=…) for a live, cited, grounded answer, so nothing stale or
// ungrounded is ever shown on a trust-positioned page. The list is rendered
// client-side and kept out of the FAQPage JSON-LD, so the indexed structured
// data stays stable no matter what trends in usage.
//
// Privacy: only questions asked by enough distinct sessions to clear MIN_COUNT
// ever surface, and we store nothing but the (cleaned) question text — no user,
// IP, or session identifiers.

import { kv } from '@/lib/kv'

const KEYS = 'faq:agent:keys' // SET of question hashes ever seen
const TEXT = 'faq:agent:text' // HASH: hash -> display text
const COUNT = (h: string) => `faq:agent:count:${h}`

const WINDOW_SEC = 60 * 60 * 24 * 45 // ~45-day popularity window
const MIN_LEN = 12
const MAX_LEN = 140
const MIN_COUNT = 3 // signal + privacy: only repeat questions surface
const MAX_KEYS_SCAN = 400 // bound the ranking fan-out

export interface PopularQuestion {
  text: string
  count: number
}

// Collapse to a stable key so "What is BPC-157?" and "what is bpc 157" count as
// the same question.
function normalizeKey(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Cheap, dependency-free 32-bit FNV-1a hash for the KV field name.
function hashKey(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

// Light display cleanup. Returns null if the text isn't FAQ-worthy (too short or
// long, or it doesn't read like a question) — keeps stray chatter out of the list.
function cleanForDisplay(q: string): string | null {
  const t = q.replace(/\s+/g, ' ').trim()
  if (t.length < MIN_LEN || t.length > MAX_LEN) return null
  const looksLikeQuestion =
    /\?\s*$/.test(t) ||
    /^(what|how|why|which|is|are|can|does|do|should|when|where|who|will|could|would)\b/i.test(t)
  return looksLikeQuestion ? t : null
}

/** Record a question asked of the Agent. Best-effort; never throws. */
export async function logAgentQuestion(raw: string): Promise<void> {
  try {
    const display = cleanForDisplay(raw)
    if (!display) return
    const key = normalizeKey(display)
    if (!key) return
    const h = hashKey(key)
    await kv.incrWithExpiry(COUNT(h), WINDOW_SEC)
    await kv.sadd(KEYS, h)
    // Store the cleaned display form (latest wins — fine for an FAQ label).
    await kv.hset(TEXT, { [h]: display })
  } catch {
    /* logging is best-effort; it must never affect the chat path */
  }
}

/** Top questions above the visibility threshold, most-asked first. */
export async function getPopularQuestions(limit = 6): Promise<PopularQuestion[]> {
  try {
    const hashes = (await kv.smembers(KEYS)).slice(0, MAX_KEYS_SCAN)
    if (hashes.length === 0) return []
    const textMap = (await kv.hgetall(TEXT)) ?? {}
    const counts = await Promise.all(
      hashes.map(async (h) => ({ h, count: Number(await kv.get(COUNT(h))) || 0 })),
    )
    return counts
      .filter((c) => c.count >= MIN_COUNT && textMap[c.h]) // skip expired (count 0) + missing text
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((c) => ({ text: textMap[c.h], count: c.count }))
  } catch {
    return []
  }
}
