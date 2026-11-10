import { NextRequest, NextResponse } from 'next/server'
import { getUsage, TIERS } from '@/lib/api-keys'
import { kv } from '@/lib/kv'
import { readMetering, FREE_WEEKLY, IP_WEEKLY_MAX, GLOBAL_DAILY_CEILING } from '@/lib/agent-quota'
import { passSalesEnabled, PASS_PRICE_CENTS, PASS_DAYS, PASS_DAILY_MAX } from '@/lib/agent-pass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/usage — the "who uses what" view. Lists every issued key with
// its tier, label, and usage (today + lifetime total), plus the anonymous
// aggregate. This is the data that informs pricing/tier decisions.
//
// Auth: ADMIN_SECRET (falls back to CRON_SECRET) as a Bearer token. If neither
// is set, it refuses to run in production and is open only in local dev.
export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET
  if (secret) {
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'ADMIN_SECRET (or CRON_SECRET) is not set; refusing to expose usage unauthenticated in production.' },
      { status: 503 },
    )
  }

  const hashes = await kv.smembers('apikey:all')
  const keys = await Promise.all(
    hashes.map(async (hash) => {
      const rec = await kv.hgetall(`apikey:${hash}`)
      const usage = await getUsage(`key:${hash}`)
      return {
        prefix: rec?.prefix ?? null,
        tier: rec?.tier ?? null,
        label: rec?.label ?? '',
        email: rec?.email ?? '',
        created: rec?.createdAt ?? null,
        usage,
      }
    }),
  )
  keys.sort((a, b) => b.usage.total - a.usage.total)

  const anonymous = await getUsage('anonymous')

  // Model-backed routes (/api/chat, /api/analyze-peptide): per-day outcomes,
  // provider mix, tokens, and heaviest callers. ?days=N (default 7, max 30).
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days')) || 7, 1), 30)
  const agent = {
    limits: {
      freePerVisitorPerWeek: FREE_WEEKLY,
      maxPerIpPerWeek: IP_WEEKLY_MAX,
      siteWideFreeRunsPerDay: GLOBAL_DAILY_CEILING,
    },
    pass: {
      salesEnabled: passSalesEnabled,
      priceCents: PASS_PRICE_CENTS,
      days: PASS_DAYS,
      fairUsePerDay: PASS_DAILY_MAX,
    },
    days: await readMetering(days),
  }

  return NextResponse.json({
    generated: new Date().toISOString(),
    persistent: kv.persistent,
    tiers: TIERS,
    keyCount: keys.length,
    anonymous,
    keys,
    agent,
  })
}
