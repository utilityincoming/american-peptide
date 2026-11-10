// Free weekly allowance, paid pass, spend ceiling, and metering for the model-backed routes
// (/api/chat, /api/analyze-peptide).
//
// Layers:
//   1. Visitor allowance — AGENT_FREE_WEEKLY (default 5) uses per visitor per
//      UTC week (resets Monday 00:00 UTC). A visitor is an anonymous first-party
//      cookie (ap_vid); no account needed.
//   2. Per-IP cap — AGENT_IP_WEEKLY_MAX (default 3x the allowance). Cookies are
//      trivially cleared, so this is the bound that actually holds against a
//      client that discards them; it is looser than the allowance so several
//      people behind one shared address (office, mobile carrier NAT) each still
//      get their own allowance.
//   3. Global ceiling — AGENT_DAILY_CEILING free model runs per UTC DAY across
//      all visitors and both routes. The owner's hard stop on unpaid spend:
//      once hit, routes serve model-free content instead of spending.
//   4. Research Pass (src/lib/agent-pass.ts) — a paying visitor skips 1-3 and
//      is bounded only by a per-pass daily fair-use guard.
//
// Counters are reserved up front (INCR, then compare) so concurrent requests
// can't overshoot, and the visitor/IP reservation is refunded when no model
// answer was produced. If the store errors, reservation FAILS CLOSED — callers
// degrade to model-free content rather than spend unmetered.
//
// Metering rides alongside: per-day counters by outcome/provider/tokens plus a
// per-caller tally keyed by a salted IP hash (never the raw address), surfaced
// at GET /api/admin/usage.

import crypto from 'node:crypto'
import { kv } from './kv'
import { utcDate } from './api-keys'
import { passFromRequest, PASS_DAILY_MAX } from './agent-pass'

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name])
  return Number.isFinite(n) && n >= 0 && process.env[name]?.trim() ? Math.floor(n) : fallback
}

export const FREE_WEEKLY = envInt('AGENT_FREE_WEEKLY', 5)
export const IP_WEEKLY_MAX = Math.max(FREE_WEEKLY, envInt('AGENT_IP_WEEKLY_MAX', FREE_WEEKLY * 3))
export const GLOBAL_DAILY_CEILING = envInt('AGENT_DAILY_CEILING', 300)
/** AGENT_QUOTA=off disables the weekly visitor/IP allowance (the ceiling still applies). */
const ALLOWANCE_ENABLED = process.env.AGENT_QUOTA !== 'off'

export type QuotaScope = 'chat' | 'analyze'

const COUNTER_TTL_SEC = 60 * 60 * 48 // daily counters live ~2 days
const WEEK_TTL_SEC = 60 * 60 * 24 * 8 // weekly counters outlive their week by a day
const METER_TTL_SEC = 60 * 60 * 24 * 60 // 60 days of metering history
const COOKIE = 'ap_vid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

// ── Caller identity ───────────────────────────────────────────────────────────

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip'))?.trim() || 'unknown'
}

/**
 * Collapse an address to the unit one subscriber controls: IPv4 as-is, IPv6 to
 * its /64 (a single customer can rotate freely through the low 64 bits).
 */
export function ipBucket(ip: string): string {
  if (!ip.includes(':')) return ip
  const [head, tail = ''] = ip.toLowerCase().split('::')
  const groups = head.split(':').filter(Boolean)
  if (ip.includes('::')) {
    const tailGroups = tail.split(':').filter(Boolean)
    while (groups.length + tailGroups.length < 8) groups.push('0')
    groups.push(...tailGroups)
  }
  return groups.slice(0, 4).join(':') + '::/64'
}

/** Salted, truncated hash — stable enough to spot a heavy caller, not reversible. */
export function hashIp(ip: string): string {
  const salt = process.env.ADMIN_SECRET || process.env.CRON_SECRET || 'ap-ip-salt'
  return crypto.createHash('sha256').update(`${salt}:${ipBucket(ip)}`).digest('hex').slice(0, 12)
}

function readVisitorId(req: Request): string | null {
  const m = /(?:^|;\s*)ap_vid=([a-f0-9]{32})(?:;|$)/.exec(req.headers.get('cookie') ?? '')
  return m ? m[1] : null
}

function visitorCookie(id: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`
}

// ── Request screening ─────────────────────────────────────────────────────────

/**
 * Owner/automation bypass: `x-agent-key` matching AGENT_BYPASS_KEY (falls back
 * to ADMIN_SECRET). Lets the eval script and the owner call the agent without
 * the browser-origin requirement or the visitor allowance. Never set client-side.
 */
export function isOwnerBypass(req: Request): boolean {
  const secret = process.env.AGENT_BYPASS_KEY || process.env.ADMIN_SECRET
  const given = req.headers.get('x-agent-key')
  if (!secret || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * True only for a browser request from this site's own pages. Browsers always
 * attach Origin to a POST fetch, so a missing Origin means a non-browser client
 * (script, crawler) — those are refused rather than left to spend the budget.
 * A script can forge the header; this is friction, the counters are the bound.
 */
export function isSameOriginBrowser(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

const BOT_UA =
  /bot\b|bot[/;) ]|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|scrap|python-requests|python-urllib|aiohttp|httpx|curl\/|wget\/|go-http-client|node-fetch|axios\/|okhttp|libwww|facebookexternalhit|gptbot|claudebot|ccbot|bytespider|perplexity|ahrefs|semrush|mj12|dotbot|petalbot|yandex|baiduspider|duckduck|bingpreview/i

/** Self-identified crawlers and HTTP libraries. An empty UA counts as a bot. */
export function isLikelyBot(userAgent: string | null): boolean {
  return !userAgent || BOT_UA.test(userAgent)
}

// ── Quota ─────────────────────────────────────────────────────────────────────

export interface QuotaStatus {
  /** Free uses per visitor per UTC week. */
  limit: number
  remaining: number
  period: 'week'
  /** ISO time the allowance resets (next Monday 00:00 UTC). */
  resetsAt: string
}

/** Monday (UTC) of the week containing `now`, as a Date at 00:00 UTC. */
function weekStart(now = new Date()): Date {
  const sinceMonday = (now.getUTCDay() + 6) % 7
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - sinceMonday))
}

/** Stable id for the current allowance window, e.g. "2026-11-09" (its Monday). */
export function weekId(now = new Date()): string {
  return weekStart(now).toISOString().slice(0, 10)
}

export function weekResetsAt(now = new Date()): string {
  return new Date(weekStart(now).getTime() + 7 * 86_400_000).toISOString()
}

function status(visitorCount: number, ipCount: number): QuotaStatus {
  const remaining = Math.max(0, Math.min(FREE_WEEKLY - visitorCount, IP_WEEKLY_MAX - ipCount))
  return { limit: FREE_WEEKLY, remaining, period: 'week', resetsAt: weekResetsAt() }
}

const visitorKey = (scope: QuotaScope, id: string, week: string) => `quota:${scope}:v:${id}:w${week}`
const ipKey = (scope: QuotaScope, ipHash: string, week: string) => `quota:${scope}:ip:${ipHash}:w${week}`
const passDayKey = (passId: string, date: string) => `quota:pass:${passId}:${date}`
const globalKey = (date: string) => `quota:global:${date}`

export type Reservation =
  | {
      allowed: true
      quota: QuotaStatus | null // null when no allowance applies (owner bypass, pass)
      /** Set when the run is covered by a paid Research Pass. */
      pass: { expiresAt: string } | null
      /** Give the visitor their use back (no model answer was produced). */
      refund: () => Promise<void>
      /** Set-Cookie value when a new visitor id was issued, else null. */
      setCookie: string | null
    }
  | {
      allowed: false
      /** quota = visitor/IP allowance spent; ceiling = site-wide daily stop;
       *  unavailable = the counter store errored (fail closed). */
      reason: 'quota' | 'ceiling' | 'unavailable'
      quota: QuotaStatus | null
      pass: { expiresAt: string } | null
      setCookie: string | null
    }

/**
 * Reserve one model run for this caller. Must be called before any model work;
 * call `refund()` if the request ends without a model answer.
 */
export async function reserveRun(req: Request, scope: QuotaScope): Promise<Reservation> {
  const date = utcDate()
  const ipHash = hashIp(clientIp(req))
  const bypass = isOwnerBypass(req)

  const existing = readVisitorId(req)
  const visitor = existing ?? crypto.randomBytes(16).toString('hex')
  const setCookie = existing || bypass ? null : visitorCookie(visitor)

  try {
    void meter(scope, { requests: 1, ...(bypass ? { bypass: 1 } : {}) }, ipHash)

    if (bypass) {
      await kv.incrBy(globalKey(date), 1, COUNTER_TTL_SEC)
      return { allowed: true, quota: null, pass: null, refund: async () => {}, setCookie: null }
    }

    // Paid Research Pass: no weekly allowance and not counted against the free
    // ceiling — only a per-pass daily fair-use guard against a shared code.
    const pass = await passFromRequest(req)
    if (pass) {
      const used = await kv.incrBy(passDayKey(pass.id, date), 1, COUNTER_TTL_SEC)
      const passInfo = { expiresAt: pass.expiresAt }
      if (used > PASS_DAILY_MAX) {
        void meter(scope, { 'denied:pass_fair_use': 1 })
        return { allowed: false, reason: 'ceiling', quota: null, pass: passInfo, setCookie: null }
      }
      void meter(scope, { pass: 1 })
      return { allowed: true, quota: null, pass: passInfo, refund: async () => {}, setCookie: null }
    }

    const week = weekId()
    const vKey = visitorKey(scope, visitor, week)
    const iKey = ipKey(scope, ipHash, week)
    const counted = ALLOWANCE_ENABLED
    const [vCount, iCount, gCount] = await Promise.all([
      counted ? kv.incrBy(vKey, 1, WEEK_TTL_SEC) : 0,
      counted ? kv.incrBy(iKey, 1, WEEK_TTL_SEC) : 0,
      kv.incrBy(globalKey(date), 1, COUNTER_TTL_SEC),
    ])

    const refundVisitor = async () => {
      if (!counted) return
      try {
        await Promise.all([kv.incrBy(vKey, -1, WEEK_TTL_SEC), kv.incrBy(iKey, -1, WEEK_TTL_SEC)])
      } catch {
        /* a lost refund costs the visitor one use; never fail the request on it */
      }
    }

    const overAllowance = counted && (vCount > FREE_WEEKLY || iCount > IP_WEEKLY_MAX)
    const overCeiling = gCount > GLOBAL_DAILY_CEILING
    if (overAllowance || overCeiling) {
      // Nothing was spent: release every counter this attempt took.
      await refundVisitor()
      try {
        await kv.incrBy(globalKey(date), -1, COUNTER_TTL_SEC)
      } catch {
        /* over-counting the ceiling only makes it stricter */
      }
      const reason = overAllowance ? 'quota' : 'ceiling'
      void meter(scope, { [`denied:${reason}`]: 1 })
      return {
        allowed: false,
        reason,
        quota: counted ? status(vCount - 1, iCount - 1) : null,
        pass: null,
        setCookie,
      }
    }

    return {
      allowed: true,
      quota: counted ? status(vCount, iCount) : null,
      pass: null,
      refund: async () => {
        await refundVisitor()
        void meter(scope, { refunded: 1 })
      },
      setCookie,
    }
  } catch (err) {
    console.error(`[quota] counter store unavailable; failing closed: ${err instanceof Error ? err.message : err}`)
    return { allowed: false, reason: 'unavailable', quota: null, pass: null, setCookie: null }
  }
}

/** Read the caller's remaining free allowance without consuming any. */
export async function peekQuota(req: Request, scope: QuotaScope): Promise<QuotaStatus | null> {
  if (!ALLOWANCE_ENABLED) return null
  const week = weekId()
  const visitor = readVisitorId(req)
  try {
    const [v, i] = await Promise.all([
      visitor ? kv.get(visitorKey(scope, visitor, week)) : null,
      kv.get(ipKey(scope, hashIp(clientIp(req)), week)),
    ])
    return status(Number(v) || 0, Number(i) || 0)
  } catch {
    return null
  }
}

// ── Metering ──────────────────────────────────────────────────────────────────

const meterKey = (scope: QuotaScope, date: string) => `meter:${scope}:${date}`
const callersKey = (scope: QuotaScope, date: string) => `meter:${scope}:${date}:callers`

/**
 * Add to today's counters for a route. Best-effort and never throws — metering
 * must not affect the request. `ipHash` additionally tallies the caller.
 */
export async function meter(
  scope: QuotaScope,
  fields: Record<string, number>,
  ipHash?: string,
): Promise<void> {
  const date = utcDate()
  try {
    await Promise.all([
      ...Object.entries(fields)
        .filter(([, n]) => n)
        .map(([f, n]) => kv.hincrby(meterKey(scope, date), f, Math.round(n), METER_TTL_SEC)),
      ...(ipHash ? [kv.hincrby(callersKey(scope, date), ipHash, 1, METER_TTL_SEC)] : []),
    ])
  } catch {
    /* best-effort */
  }
}

export interface MeterDay {
  date: string
  /** Free model runs counted against the site-wide daily ceiling (both routes). */
  ceilingUsed: number
  routes: Record<QuotaScope, { counters: Record<string, number>; distinctCallers: number; topCallers: { ipHash: string; requests: number }[] }>
}

function toNumbers(h: Record<string, string> | null): Record<string, number> {
  return Object.fromEntries(Object.entries(h ?? {}).map(([k, v]) => [k, Number(v) || 0]))
}

/** Metering for the last `days` UTC days, newest first (for the admin view). */
export async function readMetering(days: number): Promise<MeterDay[]> {
  const out: MeterDay[] = []
  const now = Date.now()
  for (let i = 0; i < days; i++) {
    const date = new Date(now - i * 86_400_000).toISOString().slice(0, 10)
    const scopes: QuotaScope[] = ['chat', 'analyze']
    const [ceiling, ...hashes] = await Promise.all([
      kv.get(globalKey(date)),
      ...scopes.flatMap((s) => [kv.hgetall(meterKey(s, date)), kv.hgetall(callersKey(s, date))]),
    ])
    const routes = {} as MeterDay['routes']
    scopes.forEach((s, idx) => {
      const callers = Object.entries(toNumbers(hashes[idx * 2 + 1] as Record<string, string> | null))
        .map(([ipHash, requests]) => ({ ipHash, requests }))
        .sort((a, b) => b.requests - a.requests)
      routes[s] = {
        counters: toNumbers(hashes[idx * 2] as Record<string, string> | null),
        distinctCallers: callers.length,
        topCallers: callers.slice(0, 10),
      }
    })
    out.push({ date, ceilingUsed: Math.max(0, Number(ceiling) || 0), routes })
  }
  return out
}
