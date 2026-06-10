// Lightweight, dependency-free rate limiter for the AI API routes.
//
// Goal: protect the Anthropic budget from abuse/runaway clients ("maximize
// yield") while keeping legitimate users flowing. Fixed-window counter keyed
// by client IP.
//
// Storage tiers (auto-selected):
//   1. Upstash Redis REST  — durable + correct across serverless instances.
//      Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable.
//   2. In-memory Map       — fallback for local dev / single instance.
//      NOTE: per-instance only; on multi-instance serverless this under-counts.
//      Configure Upstash in production.

export interface RateLimitResult {
  ok: boolean
  limit: number
  remaining: number
  /** Unix seconds when the current window resets. */
  reset: number
  /** Seconds the client should wait before retrying (0 when ok). */
  retryAfter: number
}

interface RateLimitOptions {
  /** Max requests permitted per window. */
  limit: number
  /** Window length in seconds. */
  windowSec: number
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

// ── In-memory store ──────────────────────────────────────────────────────────
const memory = new Map<string, { count: number; reset: number }>()

function memoryLimit(key: string, { limit, windowSec }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = memory.get(key)

  if (!entry || entry.reset <= now) {
    const reset = now + windowSec * 1000
    memory.set(key, { count: 1, reset })
    return { ok: true, limit, remaining: limit - 1, reset: Math.ceil(reset / 1000), retryAfter: 0 }
  }

  entry.count += 1
  const resetSec = Math.ceil(entry.reset / 1000)
  if (entry.count > limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      reset: resetSec,
      retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)),
    }
  }
  return { ok: true, limit, remaining: limit - entry.count, reset: resetSec, retryAfter: 0 }
}

// Opportunistic cleanup so the Map can't grow without bound on a long-lived
// instance. Runs at most once per minute, on access.
let lastSweep = 0
function sweepMemory() {
  const now = Date.now()
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [k, v] of memory) if (v.reset <= now) memory.delete(k)
}

// ── Upstash store (fixed window via INCR + EXPIRE NX) ─────────────────────────
async function upstashLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions,
): Promise<RateLimitResult> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSec), 'NX'],
      ['PTTL', key],
    ]),
    // Don't let a slow Redis stall the user-facing request.
    signal: AbortSignal.timeout(2000),
  })

  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as Array<{ result: number }>
  const count = data[0]?.result ?? 1
  const pttl = data[2]?.result ?? windowSec * 1000
  const reset = Math.ceil((Date.now() + (pttl > 0 ? pttl : windowSec * 1000)) / 1000)

  if (count > limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      reset,
      retryAfter: Math.max(1, pttl > 0 ? Math.ceil(pttl / 1000) : windowSec),
    }
  }
  return { ok: true, limit, remaining: Math.max(0, limit - count), reset, retryAfter: 0 }
}

/**
 * Check and consume one unit against the rate limit for `key`.
 * Fails open (allows the request) if the durable store errors — availability
 * over strictness for a user-facing endpoint.
 */
export async function rateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  if (upstashEnabled) {
    try {
      return await upstashLimit(key, opts)
    } catch {
      // Fall through to in-memory rather than 500 the request.
    }
  }
  sweepMemory()
  return memoryLimit(key, opts)
}

/** Best-effort client identifier from proxy headers (Vercel sets these). */
export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get('x-forwarded-for')
  const ip = (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip'))?.trim() || 'unknown'
  return `rl:${scope}:${ip}`
}

/** Standard 429 response with Retry-After + RateLimit headers. */
export function tooManyRequests(result: RateLimitResult, message: string): Response {
  return Response.json(
    { error: message, retryAfter: result.retryAfter },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter),
        'RateLimit-Limit': String(result.limit),
        'RateLimit-Remaining': String(result.remaining),
        'RateLimit-Reset': String(result.reset),
      },
    },
  )
}
