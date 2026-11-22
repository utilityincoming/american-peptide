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
