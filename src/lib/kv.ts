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
const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

export interface Kv {
  readonly persistent: boolean
  get(key: string): Promise<string | null>
  set(key: string, value: string, exSec?: number): Promise<void>
  /** INCR then set/refresh a TTL — used for windowed usage counters. */
  incrWithExpiry(key: string, exSec: number): Promise<number>
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
  const data = (await res.json()) as { result: unknown }
  return data.result
}

async function upstashPipeline(commands: (string | number)[][]): Promise<unknown[]> {
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
  const data = (await res.json()) as { result: unknown }[]
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
    const e = strings.get(key)
    if (!live(e)) {
      strings.delete(key)
      return null
    }
    return e!.value
  },
  async set(key, value, exSec) {
    strings.set(key, { value, exp: exSec ? Date.now() + exSec * 1000 : null })
  },
  async incrWithExpiry(key, exSec) {
    const e = strings.get(key)
    const current = live(e) ? Number(e!.value) || 0 : 0
    const next = current + 1
    const exp = live(e) ? e!.exp : Date.now() + exSec * 1000
    strings.set(key, { value: String(next), exp })
    return next
  },
  async hset(key, obj) {
    const h = hashes.get(key) ?? new Map<string, string>()
    for (const [k, v] of Object.entries(obj)) h.set(k, v)
    hashes.set(key, h)
  },
  async hgetall(key) {
    const h = hashes.get(key)
    if (!h || h.size === 0) return null
    return Object.fromEntries(h)
  },
  async sadd(key, member) {
    const s = sets.get(key) ?? new Set<string>()
    s.add(member)
    sets.set(key, s)
  },
  async smembers(key) {
    return [...(sets.get(key) ?? [])]
  },
  async del(key) {
    strings.delete(key)
    hashes.delete(key)
    sets.delete(key)
  },
}

export const kv: Kv = upstashEnabled ? upstashKv : memoryKv
