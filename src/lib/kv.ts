// Minimal key-value store for API keys + usage metering.
//
// Backed by Upstash Redis (REST, no extra dependency) when configured — the
// same UPSTASH_REDIS_REST_* vars the rate limiter already uses. Falls back to
// an in-memory store for local dev so the whole key/metering flow is testable
// with no setup.
//
// IMPORTANT: the in-memory store is per-instance and non-durable — API keys
// created there vanish on cold start and don't sync across serverless
// instances. Production MUST set Upstash. `kv.persistent` reflects which
// backend is active so endpoints can warn honestly.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
export const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

const runtime = globalThis as typeof globalThis & { __ampWarnedMissingRedis?: boolean }

export function warnIfRedisMissing(): void {
  if (upstashEnabled || process.env.NODE_ENV !== 'production' || runtime.__ampWarnedMissingRedis) return
  runtime.__ampWarnedMissingRedis = true
  console.warn('[redis] Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production. Limiting, metering, keys, and lookup caching are currently per instance.')
}

export interface Kv {
  readonly persistent: boolean
  get(key: string): Promise<string | null>
  set(key: string, value: string, exSec?: number): Promise<void>
  /** INCR then set/refresh a TTL — used for windowed usage counters. */
  incrWithExpiry(key: string, exSec: number): Promise<number>
  /** INCR with no expiry — a durable, all-time counter. */
  incr(key: string): Promise<number>
  /** INCRBY (may be negative, e.g. to refund a reservation); sets a TTL on
   * first write when `exSec` is given, else leaves the key without expiry
   * (an all-time counter, like `incr`). */
  incrBy(key: string, by: number, exSec?: number): Promise<number>
  /** HINCRBY one field of a hash; sets a TTL on the hash on first write. */
  hincrby(key: string, field: string, by: number, exSec: number): Promise<number>
  hset(key: string, obj: Record<string, string>): Promise<void>
  hgetall(key: string): Promise<Record<string, string> | null>
  sadd(key: string, member: string): Promise<void>
  smembers(key: string): Promise<string[]>
  del(key: string): Promise<void>
}

// ── Upstash REST backend ──────────────────────────────────────────────────────
// Each command is a JSON array POSTed to the base URL; pipelines go to /pipeline.

async function upstash(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(UPSTASH_URL as string, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(2500),
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (data.error || !('result' in data)) throw new Error('Upstash command failed')
  return data.result
}

export async function upstashPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2500),
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as { result?: unknown; error?: string }[]
  if (!Array.isArray(data) || data.length !== commands.length || data.some((d) => d.error || !('result' in d))) {
    throw new Error('Upstash pipeline failed')
  }
  return data.map((d) => d.result)
}

const upstashKv: Kv = {
  persistent: true,
  async get(key) {
    return ((await upstash(['GET', key])) as string | null) ?? null
  },
  async set(key, value, exSec) {
    await upstash(exSec ? ['SET', key, value, 'EX', exSec] : ['SET', key, value])
  },
  async incrWithExpiry(key, exSec) {
    const [count] = await upstashPipeline([
      ['INCR', key],
      ['EXPIRE', key, exSec, 'NX'],
    ])
    return Number(count) || 0
  },
  async incr(key) {
    return Number(await upstash(['INCR', key])) || 0
  },
  async incrBy(key, by, exSec) {
    if (exSec == null) {
      return Number(await upstash(['INCRBY', key, by])) || 0
    }
    const [count] = await upstashPipeline([
      ['INCRBY', key, by],
      ['EXPIRE', key, exSec, 'NX'],
    ])
    return Number(count) || 0
  },
  async hincrby(key, field, by, exSec) {
    const [count] = await upstashPipeline([
      ['HINCRBY', key, field, by],
      ['EXPIRE', key, exSec, 'NX'],
    ])
    return Number(count) || 0
  },
  async hset(key, obj) {
    const flat: (string | number)[] = ['HSET', key]
    for (const [k, v] of Object.entries(obj)) flat.push(k, v)
    await upstash(flat)
  },
  async hgetall(key) {
    const flat = (await upstash(['HGETALL', key])) as unknown[]
    if (!Array.isArray(flat) || flat.length === 0) return null
    const out: Record<string, string> = {}
    for (let i = 0; i < flat.length; i += 2) out[String(flat[i])] = String(flat[i + 1])
    return out
  },
  async sadd(key, member) {
    await upstash(['SADD', key, member])
  },
  async smembers(key) {
    const members = (await upstash(['SMEMBERS', key])) as unknown[]
    return Array.isArray(members) ? members.map(String) : []
  },
  async del(key) {
    await upstash(['DEL', key])
  },
}

// ── In-memory backend (dev only) ──────────────────────────────────────────────
// Stored on globalThis so the maps survive Next dev's HMR module re-evaluation
// and are shared across per-route module instances within one process. (In
// serverless production there are still many processes — hence Upstash.)

interface MemStore {
  strings: Map<string, { value: string; exp: number | null }>
  hashes: Map<string, Map<string, string>>
  sets: Map<string, Set<string>>
}
const g = globalThis as typeof globalThis & { __ampKvStore?: MemStore }
const store: MemStore = (g.__ampKvStore ??= {
  strings: new Map(),
  hashes: new Map(),
  sets: new Map(),
})
const { strings, hashes, sets } = store

function live(entry: { exp: number | null } | undefined): boolean {
  if (!entry) return false
  if (entry.exp != null && entry.exp <= Date.now()) return false
  return true
}

const memoryKv: Kv = {
  persistent: false,
  async get(key) {
    warnIfRedisMissing()
    const e = strings.get(key)
    if (!live(e)) {
      strings.delete(key)
      return null
    }
    return e!.value
  },
  async set(key, value, exSec) {
    warnIfRedisMissing()
    strings.set(key, { value, exp: exSec ? Date.now() + exSec * 1000 : null })
  },
  async incrWithExpiry(key, exSec) {
    warnIfRedisMissing()
    const e = strings.get(key)
    const current = live(e) ? Number(e!.value) || 0 : 0
    const next = current + 1
    const exp = live(e) ? e!.exp : Date.now() + exSec * 1000
    strings.set(key, { value: String(next), exp })
    return next
  },
  async incr(key) {
    warnIfRedisMissing()
    const e = strings.get(key)
    const current = live(e) ? Number(e!.value) || 0 : 0
    const next = current + 1
    strings.set(key, { value: String(next), exp: live(e) ? e!.exp : null })
    return next
  },
  async incrBy(key, by, exSec) {
    warnIfRedisMissing()
    const e = strings.get(key)
    const next = (live(e) ? Number(e!.value) || 0 : 0) + by
    const exp = live(e) ? e!.exp : exSec == null ? null : Date.now() + exSec * 1000
    strings.set(key, { value: String(next), exp })
    return next
  },
  async hincrby(key, field, by) {
    warnIfRedisMissing()
    const h = hashes.get(key) ?? new Map<string, string>()
    const next = (Number(h.get(field)) || 0) + by
    h.set(field, String(next))
    hashes.set(key, h)
    return next
  },
  async hset(key, obj) {
    warnIfRedisMissing()
    const h = hashes.get(key) ?? new Map<string, string>()
    for (const [k, v] of Object.entries(obj)) h.set(k, v)
    hashes.set(key, h)
  },
  async hgetall(key) {
    warnIfRedisMissing()
    const h = hashes.get(key)
    if (!h || h.size === 0) return null
    return Object.fromEntries(h)
  },
  async sadd(key, member) {
    warnIfRedisMissing()
    const s = sets.get(key) ?? new Set<string>()
    s.add(member)
    sets.set(key, s)
  },
  async smembers(key) {
    warnIfRedisMissing()
    return [...(sets.get(key) ?? [])]
  },
  async del(key) {
    warnIfRedisMissing()
    strings.delete(key)
    hashes.delete(key)
    sets.delete(key)
  },
}

export const kv: Kv = upstashEnabled ? upstashKv : memoryKv

// A separate bounded store keeps expendable response data away from keys and counters.
const responses = new Map<string, { value: string; expiresAt: number }>()
const pendingResponses = new Map<string, Promise<unknown>>()
const MAX_CACHED_RESPONSES = 256
const MAX_RESPONSE_CHARS = 256 * 1024

export async function cachedLookup(
  key: string,
  ttlSeconds: number,
  load: () => Promise<unknown>,
): Promise<unknown> {
  warnIfRedisMissing()
  const cacheKey = `agent-lookup:v1:${key}`
  const pending = pendingResponses.get(cacheKey)
  if (pending) return pending

  const task = (async () => {
    const local = responses.get(cacheKey)
    if (local && local.expiresAt > Date.now()) return JSON.parse(local.value) as unknown
    responses.delete(cacheKey)

    if (upstashEnabled) {
      try {
        const hit = await kv.get(cacheKey)
        if (hit !== null) return JSON.parse(hit) as unknown
      } catch {
        // A cache outage can still serve a fresh upstream lookup.
      }
    }

    const result = await load()
    const value = JSON.stringify(result)
    if (value === undefined || value.length > MAX_RESPONSE_CHARS) return result

    if (responses.size >= MAX_CACHED_RESPONSES) {
      const oldest = responses.keys().next()
      if (!oldest.done) responses.delete(oldest.value)
    }
    responses.set(cacheKey, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
    if (upstashEnabled) {
      try {
        await kv.set(cacheKey, value, ttlSeconds)
      } catch {
        // The process-local copy is still available.
      }
    }
    return result
  })()
  pendingResponses.set(cacheKey, task)
  try {
    return await task
  } finally {
    pendingResponses.delete(cacheKey)
  }
}
