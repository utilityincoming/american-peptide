// Browser-side calls for the Research Pass flow. Each returns a plain result the
// pages turn into a pass-flow.ts event — no call here throws.

import { parsePassSummary, type PassSummary } from './pass-flow'

const NETWORK_ERROR = 'Network error. Please check your connection and try again.'

interface Posted {
  /** HTTP status, or 0 when the request never got a response. */
  status: number
  ok: boolean
  data: Record<string, unknown>
}

async function postJson(url: string, body: unknown): Promise<Posted> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    let data: Record<string, unknown> = {}
    try {
      data = await res.json()
    } catch {
      // non-JSON body (e.g. a gateway error page)
    }
    return { status: res.status, ok: res.ok, data }
  } catch {
    return { status: 0, ok: false, data: { error: NETWORK_ERROR } }
  }
}

const errorText = (data: Record<string, unknown>, fallback: string) =>
  typeof data.error === 'string' ? data.error : fallback

/** GET /api/pass — null when it could not be read. */
export async function fetchPassSummary(): Promise<PassSummary | null> {
  try {
    const res = await fetch('/api/pass')
    return res.ok ? parsePassSummary(await res.json()) : null
  } catch {
    return null
  }
}

/** POST /api/pass/checkout — the hosted Stripe Checkout URL to navigate to. */
export async function requestCheckoutUrl(): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { ok, data } = await postJson('/api/pass/checkout', {})
  if (ok && typeof data.url === 'string') return { ok: true, url: data.url }
  return { ok: false, error: errorText(data, 'Could not start checkout. Please try again.') }
}

/**
 * POST /api/pass/claim — exchange a Checkout Session id for the access code.
 * `retryable` is false only when the server is sure there is nothing to claim
 * (unknown or expired purchase, malformed request).
 */
export async function claimPass(
  sessionId: string,
): Promise<{ ok: true; code: string } | { ok: false; error: string; retryable: boolean }> {
  const { status, ok, data } = await postJson('/api/pass/claim', { sessionId })
  if (ok && typeof data.code === 'string') return { ok: true, code: data.code }
  const final = data.code === 'invalid' || data.code === 'expired' || status === 400 || status === 403
  return { ok: false, error: errorText(data, 'Could not confirm the payment.'), retryable: !final }
}

/** POST /api/pass { code } — unlock an existing pass on this device. */
export async function redeemCode(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { ok, data } = await postJson('/api/pass', { code })
  return ok ? { ok: true } : { ok: false, error: errorText(data, "That code isn't valid.") }
}
