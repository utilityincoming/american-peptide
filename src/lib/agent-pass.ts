// Research Pass — the paid tier for the Peptide Agent.
//
// One payment (AGENT_PASS_PRICE_CENTS, default $29.99) buys AGENT_PASS_DAYS
// (default 30) of use without the weekly free allowance. No accounts: a paid
// Stripe Checkout Session is exchanged for an ACCESS CODE, held in an HttpOnly
// cookie on the buying device and redeemable on any other device.
//
// Stripe is called with raw fetch (no SDK), matching the provider code. There
// is no webhook: the success page hands back the Checkout Session id and the
// server verifies it directly with Stripe before granting anything, so nothing
// is unlocked on the client's say-so.
//
// The code is derived deterministically from the session id (HMAC under the
// Stripe secret), so reloading the success page re-issues the SAME code and the
// plaintext is never stored — only its SHA-256, mapped to the expiry.
//
// The pass is not auto-renewing; there is nothing to cancel. Refund/chargeback
// revocation is manual (delete the `pass:<hash>` key) until a webhook is added.

import crypto from 'node:crypto'
import { kv } from './kv'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY?.trim() || ''
const STRIPE_BASE = (process.env.STRIPE_API_BASE?.trim() || 'https://api.stripe.com').replace(/\/$/, '')

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  const n = Number(raw)
  return raw && Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export const PASS_PRICE_CENTS = envInt('AGENT_PASS_PRICE_CENTS', 2999)
export const PASS_DAYS = envInt('AGENT_PASS_DAYS', 30)
/** Fair-use guard per pass per UTC day, so one shared/leaked code can't run up
 *  an unbounded bill. Far above any individual's real use. */
export const PASS_DAILY_MAX = envInt('AGENT_PASS_DAILY_MAX', 200)

/** The paid option is offered only once Stripe is configured. */
export const passSalesEnabled = Boolean(STRIPE_KEY)

export const PASS_PRICE_LABEL = `$${(PASS_PRICE_CENTS / 100).toFixed(2)}`
export const PASS_PRODUCT_TAG = 'agent_pass'

const COOKIE = 'ap_pass'
const CODE_RE = /^APP-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}$/

const hashCode = (code: string) => crypto.createHash('sha256').update(code).digest('hex')
const passKey = (code: string) => `pass:${hashCode(code)}`

// ── Codes ─────────────────────────────────────────────────────────────────────

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Deterministic 80-bit code for a paid Checkout Session: APP-XXXX-XXXX-XXXX-XXXX. */
export function codeForSession(sessionId: string, secret = STRIPE_KEY): string {
  const mac = crypto.createHmac('sha256', `agent-pass:${secret}`).update(sessionId).digest()
  let out = ''
  // 16 chars x 5 bits = 80 bits, read from the first 10 bytes of the MAC.
  let bits = 0
  let acc = 0
  for (let i = 0; out.length < 16; i++) {
    acc = (acc << 8) | mac[i]
    bits += 8
    while (bits >= 5 && out.length < 16) {
      out += B32[(acc >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  return `APP-${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}-${out.slice(12, 16)}`
}

/** Normalize user input ("app xxxx…", stray spaces, lowercase) to canonical form, or null. */
export function normalizeCode(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const raw = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const body = raw.startsWith('APP') ? raw.slice(3) : raw
  if (body.length !== 16) return null
  const code = `APP-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`
  return CODE_RE.test(code) ? code : null
}

// ── Pass records ──────────────────────────────────────────────────────────────

export interface ActivePass {
  /** SHA-256 of the code — a stable, non-secret id for counters and metering. */
  id: string
  /** ISO expiry. */
  expiresAt: string
}

/** Look a code up; null if unknown or expired. Throws only if the store errors. */
export async function lookupPass(code: string): Promise<ActivePass | null> {
  const raw = await kv.get(passKey(code))
  if (!raw) return null
  try {
    const rec = JSON.parse(raw) as { exp?: number }
    if (!rec.exp || rec.exp <= Date.now()) return null
    return { id: hashCode(code), expiresAt: new Date(rec.exp).toISOString() }
  } catch {
    return null
  }
}

/** Create the pass for `code` if it doesn't exist yet (idempotent — never extends). */
export async function grantPass(code: string, expMs: number, sessionId: string): Promise<void> {
  if (await kv.get(passKey(code))) return
  const ttl = Math.max(60, Math.ceil((expMs - Date.now()) / 1000))
  await kv.set(passKey(code), JSON.stringify({ exp: expMs, sid: sessionId }), ttl)
}

export function readPassCode(req: Request): string | null {
  const m = /(?:^|;\s*)ap_pass=([A-Za-z0-9-]{1,40})(?:;|$)/.exec(req.headers.get('cookie') ?? '')
  return m ? normalizeCode(m[1]) : null
}

/** The caller's active pass, from their cookie; null if none/expired. */
export async function passFromRequest(req: Request): Promise<ActivePass | null> {
  const code = readPassCode(req)
  return code ? lookupPass(code) : null
}

export function passCookie(code: string, expiresAt: string): string {
  const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${code}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
}

// ── Stripe (raw fetch) ────────────────────────────────────────────────────────

async function stripe(path: string, form?: Record<string, string>): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: form ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(form ? { body: new URLSearchParams(form).toString() } : {}),
    signal: AbortSignal.timeout(15000),
  })
  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    /* non-JSON error body */
  }
  return { ok: res.ok, status: res.status, data }
}

/** Create a one-time Checkout Session for the pass; returns the hosted payment URL. */
export async function createCheckout(origin: string): Promise<string | null> {
  if (!passSalesEnabled) return null
  const { ok, status, data } = await stripe('/v1/checkout/sessions', {
    mode: 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(PASS_PRICE_CENTS),
    'line_items[0][price_data][product_data][name]': `AmericanPeptide.com Research Pass — ${PASS_DAYS} days`,
    'line_items[0][price_data][product_data][description]': `${PASS_DAYS} days of Peptide Agent research searches without the weekly limit. One-time payment, does not renew. Research and educational use only — not medical advice.`,
    'metadata[product]': PASS_PRODUCT_TAG,
    success_url: `${origin}/research/pass?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/research/pass`,
  })
  if (!ok || typeof data.url !== 'string') {
    console.error(`[pass] stripe checkout create failed (${status})`)
    return null
  }
  return data.url
}

export type ClaimResult =
  | { ok: true; code: string; expiresAt: string }
  | { ok: false; reason: 'unpaid' | 'invalid' | 'expired' | 'unavailable' }

/**
 * Exchange a Checkout Session id for the pass it paid for. Verifies with Stripe
 * that the session is ours, is for the pass, and is paid. Idempotent.
 */
export async function claimSession(sessionId: string): Promise<ClaimResult> {
  if (!passSalesEnabled) return { ok: false, reason: 'unavailable' }
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return { ok: false, reason: 'invalid' }

  let res: Awaited<ReturnType<typeof stripe>>
  try {
    res = await stripe(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`)
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
  if (res.status === 404) return { ok: false, reason: 'invalid' }
  if (!res.ok) return { ok: false, reason: 'unavailable' }

  const s = res.data as {
    id?: string
    payment_status?: string
    created?: number
    amount_total?: number
    metadata?: { product?: string }
  }
  if (s.id !== sessionId || s.metadata?.product !== PASS_PRODUCT_TAG) return { ok: false, reason: 'invalid' }
  if (s.payment_status !== 'paid') return { ok: false, reason: 'unpaid' }

  // The term runs from the purchase, not from whenever the page is (re)loaded.
  const expMs = (s.created ?? Math.floor(Date.now() / 1000)) * 1000 + PASS_DAYS * 86_400_000
  if (expMs <= Date.now()) return { ok: false, reason: 'expired' }

  const code = codeForSession(sessionId)
  try {
    await grantPass(code, expMs, sessionId)
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
  return { ok: true, code, expiresAt: new Date(expMs).toISOString() }
}
