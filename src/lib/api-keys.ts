// API keys, tiers, and usage metering for the open catalog API + MCP server.
//
// Keys are issued self-serve (free tier) and are the substrate for: usage
// analytics ("who pulls what"), tiered rate/quota limits, and a future paid
// tier. Keys are stored HASHED (SHA-256) — the plaintext is shown to the user
// exactly once at creation and is never recoverable from storage.

import crypto from 'node:crypto'
import { kv } from './kv'

export type Tier = 'anonymous' | 'free' | 'pro'

export interface TierLimits {
  label: string
  /** Burst limit: requests per 60s window. */
  perMinute: number
  /** Daily quota: requests per calendar day (UTC). */
  perDay: number
}

// Anonymous (no key) is deliberately usable but modest — enough to evaluate the
// API, with a clear upgrade path to a free key. Pro is scaffolded for a future
// paid tier; nothing issues it yet except an admin.
export const TIERS: Record<Tier, TierLimits> = {
  anonymous: { label: 'Anonymous', perMinute: 30, perDay: 1000 },
  free: { label: 'Free', perMinute: 120, perDay: 10000 },
  pro: { label: 'Pro', perMinute: 600, perDay: 200000 },
}

const KEY_PREFIX = 'amp_sk_'

export interface KeyRecord {
  tier: Tier
  label: string
  email: string
  createdAt: string
  /** Non-secret leading slice, for admin display (e.g. "amp_sk_a1b2c3"). */
  prefix: string
}

export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateKey(): { key: string; hash: string; prefix: string } {
  const key = KEY_PREFIX + crypto.randomBytes(24).toString('hex')
  return { key, hash: hashKey(key), prefix: key.slice(0, 14) }
}

/** Create and persist a new key. Returns the plaintext key ONCE. */
export async function createKey(opts: {
  tier?: Tier
  label?: string
  email?: string
}): Promise<{ key: string; hash: string; record: KeyRecord }> {
  const { key, hash, prefix } = generateKey()
  const record: KeyRecord = {
    tier: opts.tier ?? 'free',
    label: (opts.label ?? '').slice(0, 80),
    email: (opts.email ?? '').slice(0, 200),
    createdAt: new Date().toISOString(),
    prefix,
  }
  await kv.hset(`apikey:${hash}`, {
    tier: record.tier,
    label: record.label,
    email: record.email,
    createdAt: record.createdAt,
    prefix: record.prefix,
  })
  await kv.sadd('apikey:all', hash)
  return { key, hash, record }
}

/** Resolve a plaintext key to its record, or null if unknown/malformed. */
export async function lookupKey(key: string): Promise<{ hash: string; record: KeyRecord } | null> {
  if (!key.startsWith(KEY_PREFIX)) return null
  const hash = hashKey(key)
  const rec = await kv.hgetall(`apikey:${hash}`)
  if (!rec || !rec.tier) return null
  return {
    hash,
    record: {
      tier: (rec.tier as Tier) ?? 'free',
      label: rec.label ?? '',
      email: rec.email ?? '',
      createdAt: rec.createdAt ?? '',
      prefix: rec.prefix ?? '',
    },
  }
}

// ── Usage metering ────────────────────────────────────────────────────────────

const USAGE_TTL_SEC = 60 * 60 * 24 * 60 // 60 days of daily counters
const TOTAL_TTL_SEC = 60 * 60 * 24 * 400 // ~lifetime running total

export function utcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Record one billable call against a subject (a key or the anonymous bucket).
 * Best-effort: callers should not await on the request's critical path.
 */
export async function recordUsage(subject: string, scope: string, date: string): Promise<void> {
  await Promise.all([
    kv.incrWithExpiry(`usage:${subject}:${date}`, USAGE_TTL_SEC),
    kv.incrWithExpiry(`usage:${subject}:${date}:${scope}`, USAGE_TTL_SEC),
    kv.incrWithExpiry(`usage:${subject}:total`, TOTAL_TTL_SEC),
  ])
}

export interface UsageSnapshot {
  today: number
  total: number
  date: string
}

export async function getUsage(subject: string): Promise<UsageSnapshot> {
  const date = utcDate()
  const [today, total] = await Promise.all([
    kv.get(`usage:${subject}:${date}`),
    kv.get(`usage:${subject}:total`),
  ])
  return { today: Number(today) || 0, total: Number(total) || 0, date }
}
