import { NextRequest, NextResponse } from 'next/server'
import { getReferralStats } from '@/lib/referrals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/referrals — aggregate referral-click counts from the /go/<id>
// affiliate redirect: per vendor (all-time + the last N monthly buckets) and per
// vendor×product deep link. Aggregate only — no IP, user agent, or per-click
// identifier is stored, so there is no personal data here.
//
// Query: ?months=<1..13> to widen the monthly window (default 6).
//
// Auth: ADMIN_SECRET (falls back to CRON_SECRET) as a Bearer token — the same
// gate as /api/admin/usage. If neither is set, it refuses to run in production
// and is open only in local dev.
export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET
  if (secret) {
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error:
          'ADMIN_SECRET (or CRON_SECRET) is not set; refusing to expose referral data unauthenticated in production.',
      },
      { status: 503 },
    )
  }

  const requested = Number(req.nextUrl.searchParams.get('months'))
  const monthsBack =
    Number.isFinite(requested) && requested > 0 ? Math.min(Math.floor(requested), 13) : 6

  const stats = await getReferralStats(monthsBack)
  return NextResponse.json(stats)
}
