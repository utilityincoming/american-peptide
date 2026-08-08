// Access enforcement for the open API + MCP: resolves an optional API key,
// applies per-tier burst + daily limits, records usage, and returns the headers
// to surface those limits to clients.
//
// Layering: the per-minute burst window reuses the proven rate-limit.ts store;
// the daily quota + analytics ride on kv.ts. A request with no key is treated
// as the anonymous tier (still usable, lower ceilings). A request with a
// malformed/unknown key is rejected (401) rather than silently downgraded.

import { rateLimit } from './rate-limit'
import { CORS_HEADERS } from './catalog-api'
import { lookupKey, recordUsage, utcDate, TIERS, type Tier } from './api-keys'
import { kv } from './kv'

const QUOTA_TTL_SEC = 60 * 60 * 48 // daily quota counters live ~2 days

/** Extract a key from `Authorization: Bearer <key>` or `x-api-key`. */
export function extractKey(req: Request): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  return req.headers.get('x-api-key')?.trim() || null
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip'))?.trim() || 'unknown'
}

export type AccessResult =
  | { ok: true; tier: Tier; headers: Record<string, string> }
  | { ok: false; response: Response }

function quotaError(tier: Tier): Response {
  const t = TIERS[tier]
  const upgrade =
    tier === 'anonymous'
      ? ' Get a free API key at https://americanpeptide.com/developers for a higher daily limit.'
      : ' Contact us to raise your limit.'
  return Response.json(
    { error: `Daily quota exceeded for the ${t.label} tier (${t.perDay}/day).${upgrade}` },
    {
      status: 429,
      headers: {
        ...CORS_HEADERS,
        'RateLimit-Limit': String(t.perDay),
        'RateLimit-Remaining': '0',
      },
    },
  )
}

/**
 * Gate an API call. `scope` namespaces limits + analytics per surface
 * (e.g. "catalog", "mcp"). On success, merge the returned headers into the
 * response so clients can see their remaining burst + daily budget.
 */
export async function enforceApiAccess(req: Request, scope: string): Promise<AccessResult> {
  const provided = extractKey(req)
  let tier: Tier = 'anonymous'
  let subject: string

  if (provided) {
    const found = await lookupKey(provided)
    if (!found) {
      return {
        ok: false,
        response: Response.json(
          { error: 'Invalid API key.' },
          { status: 401, headers: CORS_HEADERS },
        ),
      }
    }
    tier = found.record.tier
    subject = `key:${found.hash}`
  } else {
    subject = `ip:${clientIp(req)}`
  }

  const limits = TIERS[tier]

  // 1. Burst window (reuses the durable rate-limit store).
  const rl = await rateLimit(`api:${scope}:${subject}`, {
    limit: limits.perMinute,
    windowSec: 60,
  })
  if (!rl.ok) {
    return {
      ok: false,
      response: Response.json(
        { error: 'Rate limit exceeded — slow down and retry shortly.', retryAfter: rl.retryAfter },
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            'Retry-After': String(rl.retryAfter),
            'RateLimit-Limit': String(limits.perMinute),
            'RateLimit-Remaining': '0',
            'RateLimit-Reset': String(rl.reset),
          },
        },
      ),
    }
  }

  // 2. Daily quota. Fail open if the store errors — availability over strictness.
  const date = utcDate()
  let used = 0
  try {
    used = await kv.incrWithExpiry(`quota:${subject}:${date}`, QUOTA_TTL_SEC)
  } catch {
    used = 0
  }
  if (used > limits.perDay) {
    return { ok: false, response: quotaError(tier) }
  }

  // 3. Analytics — best-effort, never blocks the response.
  const analyticsSubject = subject.startsWith('key:') ? subject : 'anonymous'
  void recordUsage(analyticsSubject, scope, date).catch(() => {})

  return {
    ok: true,
    tier,
    headers: {
      'X-API-Tier': tier,
      'RateLimit-Limit': String(limits.perMinute),
      'RateLimit-Remaining': String(rl.remaining),
      'RateLimit-Reset': String(rl.reset),
      'X-Quota-Limit': String(limits.perDay),
      'X-Quota-Remaining': String(Math.max(0, limits.perDay - used)),
    },
  }
}
