// Pure helpers for the affiliate conversion postback (/api/referral/postback).
//
// Kept free of any store/IO so the signature + payload rules are unit-testable
// on their own. The route (src/app/api/referral/postback/route.ts) wires these
// to kv via recordConversion() in lib/referrals.
//
// THREAT MODEL: the postback endpoint is public — a partner's server calls it on
// each sale, so it can't carry ADMIN_SECRET. Instead each partner signs the
// payload with a per-vendor shared secret (HMAC-SHA256). Without a valid
// signature nothing is recorded, so a stranger can't inflate our revenue. The
// secret lives only in the environment, one per vendor:
//
//     REFERRAL_POSTBACK_SECRET_<VENDOR_ID>   (vendor id upper-cased, - and . → _)
//
// A vendor with no secret set is simply "not wired for postback" (404), so this
// ships inert and is armed one partner at a time once they confirm the scheme.

import { createHmac, timingSafeEqual } from 'node:crypto'

/** Env var name holding a vendor's postback secret, e.g. absim-peptides → REFERRAL_POSTBACK_SECRET_ABSIM_PEPTIDES. */
export function secretEnvName(vendorId: string): string {
  return `REFERRAL_POSTBACK_SECRET_${vendorId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`
}

export function vendorSecret(
  vendorId: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const v = env[secretEnvName(vendorId)]
  return v && v.length > 0 ? v : undefined
}

export interface ConversionInput {
  vendor: string
  /** Partner's order/transaction id — the idempotency key. Required. */
  orderId: string
  /** Order value in integer minor units (cents). */
  amountCents: number
  /** ISO-4217, upper-cased. Defaults to USD. */
  currency: string
  /** Catalog slug, only when the partner reports a per-product sale. */
  product?: string
  /** Epoch seconds the partner stamped the event, when supplied. */
  ts?: number
}

export type ParseResult =
  | { ok: true; value: ConversionInput; signatureBase: string }
  | { ok: false; code: 'invalid'; error: string }

const MAX_AMOUNT_CENTS = 100_000_00 // $100k/order sanity ceiling — reject fat-finger / abuse

/**
 * Validate and normalize the raw postback params (query or body, both strings).
 * Does NOT check the signature — call verifySignature with the returned
 * `signatureBase` and the vendor secret. Money is parsed from a major-unit
 * `amount` (e.g. "49.99") into integer cents to avoid float drift downstream.
 */
export function parseConversion(raw: Record<string, string | undefined>): ParseResult {
  const vendor = (raw.vendor ?? '').trim()
  if (!/^[a-z0-9-]{1,64}$/.test(vendor)) {
    return { ok: false, code: 'invalid', error: 'vendor missing or malformed' }
  }
  const orderId = (raw.order ?? raw.orderId ?? '').trim()
  if (!orderId || orderId.length > 128) {
    return { ok: false, code: 'invalid', error: 'order id missing or too long' }
  }
  const amountStr = (raw.amount ?? '').trim()
  // Accept "49", "49.9", "49.99"; reject anything else so we never store NaN.
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(amountStr)) {
    return { ok: false, code: 'invalid', error: 'amount missing or malformed' }
  }
  const amountCents = Math.round(Number(amountStr) * 100)
  if (!Number.isFinite(amountCents) || amountCents < 0 || amountCents > MAX_AMOUNT_CENTS) {
    return { ok: false, code: 'invalid', error: 'amount out of range' }
  }
  const currency = (raw.currency ?? 'USD').trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { ok: false, code: 'invalid', error: 'currency must be a 3-letter code' }
  }
  const product = raw.product?.trim() || undefined
  if (product && !/^[a-z0-9-]{1,80}$/.test(product)) {
    return { ok: false, code: 'invalid', error: 'product slug malformed' }
  }
  let ts: number | undefined
  if (raw.ts != null && raw.ts !== '') {
    const n = Number(raw.ts)
    if (!Number.isFinite(n)) return { ok: false, code: 'invalid', error: 'ts not a number' }
    ts = Math.floor(n)
  }

  // Canonical signature base: pipe-joined, fixed field order. Stable across
  // query vs body and independent of param ordering. amount uses the cents
  // integer so "49.9" and "49.90" sign identically.
  const signatureBase = [vendor, orderId, amountCents, currency, product ?? ''].join('|')

  return {
    ok: true,
    value: { vendor, orderId, amountCents, currency, product, ts },
    signatureBase,
  }
}

/** Lower-case hex HMAC-SHA256 of `base` under `secret`. */
export function sign(base: string, secret: string): string {
  return createHmac('sha256', secret).update(base).digest('hex')
}

/** Constant-time compare of a provided hex signature against the expected one. */
export function verifySignature(base: string, secret: string, provided: string | undefined): boolean {
  if (!provided) return false
  const expected = sign(base, secret)
  // Both are hex of a 32-byte digest; bail unless lengths match so timingSafeEqual
  // doesn't throw on unequal buffers.
  if (provided.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
  } catch {
    return false
  }
}

/** True when a timestamp (epoch seconds) is outside the replay window. */
export function isStale(ts: number | undefined, windowSec = 3600, now = Date.now()): boolean {
  if (ts == null) return false // partners that don't stamp ts are not rejected
  return Math.abs(now / 1000 - ts) > windowSec
}
