// Network for the admin referrals dashboard. Never throws — returns a
// discriminated result the page turns into a flow event. See admin-referrals-flow.ts.

import type { ReferralStats } from './referrals'
import type { ErrorCode } from './admin-referrals-flow'

export type FetchResult =
  | { ok: true; stats: ReferralStats }
  | { ok: false; code: ErrorCode; message: string }

/**
 * GET /api/admin/referrals with the admin key as a Bearer token. The key is
 * sent in the Authorization header (never in the URL), so it stays out of logs
 * and referrers. Maps transport + status to a stable ErrorCode.
 */
export async function fetchReferralStats(key: string, months: number): Promise<FetchResult> {
  let res: Response
  try {
    res = await fetch(`/api/admin/referrals?months=${encodeURIComponent(String(months))}`, {
      headers: key ? { authorization: `Bearer ${key}` } : {},
      cache: 'no-store',
    })
  } catch {
    return { ok: false, code: 'network', message: 'Could not reach the server.' }
  }

  if (res.status === 401) {
    return { ok: false, code: 'unauthorized', message: 'Invalid admin key.' }
  }
  if (res.status === 503) {
    return {
      ok: false,
      code: 'unavailable',
      message: 'ADMIN_SECRET is not set on the server, so referral data is disabled.',
    }
  }
  if (!res.ok) {
    return { ok: false, code: 'network', message: `Unexpected response (${res.status}).` }
  }

  try {
    const stats = (await res.json()) as ReferralStats
    return { ok: true, stats }
  } catch {
    return { ok: false, code: 'network', message: 'Malformed response from the server.' }
  }
}

export interface ConversionRow {
  vendor: string
  orderId: string
  /** Major units, e.g. "49.99". */
  amount: string
  product?: string
}

export interface ImportSummary {
  total: number
  recorded: number
  duplicate: number
  invalid: number
}

export type ImportResult =
  | { ok: true; summary: ImportSummary; firstError?: string }
  | { ok: false; code: ErrorCode; message: string }

/**
 * POST a batch of manually-entered / exported conversions to the admin import
 * endpoint. Never throws. The admin key rides in the Authorization header.
 */
export async function importConversions(key: string, rows: ConversionRow[]): Promise<ImportResult> {
  let res: Response
  try {
    res = await fetch('/api/admin/referrals/import', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(key ? { authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({ conversions: rows }),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, code: 'network', message: 'Could not reach the server.' }
  }

  if (res.status === 401) return { ok: false, code: 'unauthorized', message: 'Invalid admin key.' }
  if (res.status === 503)
    return { ok: false, code: 'unavailable', message: 'Import is disabled (no ADMIN_SECRET set).' }

  let json: { summary?: ImportSummary; results?: { error?: string }[]; error?: string }
  try {
    json = await res.json()
  } catch {
    return { ok: false, code: 'network', message: 'Malformed response from the server.' }
  }
  if (!res.ok || !json.summary) {
    return { ok: false, code: 'network', message: json.error ?? `Unexpected response (${res.status}).` }
  }
  const firstError = json.results?.find((r) => r.error)?.error
  return { ok: true, summary: json.summary, firstError }
}
