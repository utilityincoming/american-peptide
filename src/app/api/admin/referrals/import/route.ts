// Admin conversion import: POST /api/admin/referrals/import
//
// Our active affiliate partners (ABSIM, Paramount, Amino Club) report sales in
// their own dashboards, not via the signed S2S postback (/api/referral/postback).
// This endpoint lets an admin feed those sales into the same conversion +
// revenue counters by hand or from a dashboard export, so the referral dashboard
// shows real conversions/revenue/EPC for them.
//
// Auth: ADMIN_SECRET (falls back to CRON_SECRET) as a Bearer token — the same
// gate as GET /api/admin/referrals. Unlike the public postback, there is no
// per-row signature: the admin secret is the authority.
//
// Body (JSON): { conversions: [{ vendor, order|orderId, amount, currency?, product? }] }
//   amount is in MAJOR units (e.g. "49.99"). Idempotent per (vendor, orderId)
//   via recordConversion, so re-importing the same export is safe.

import { NextResponse, type NextRequest } from 'next/server'
import { VENDORS } from '@/lib/vendors'
import { recordConversion } from '@/lib/referrals'
import { parseConversion } from '@/lib/referral-postback'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ROWS = 1000

interface RowResult {
  index: number
  orderId?: string
  outcome?: 'recorded' | 'duplicate'
  error?: string
}

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET
  if (secret) {
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized', code: 'unauthorized' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'ADMIN_SECRET (or CRON_SECRET) is not set; refusing to import unauthenticated in production.',
        code: 'unavailable',
      },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON', code: 'invalid' }, { status: 400 })
  }

  const rows = (body as { conversions?: unknown })?.conversions
  if (!Array.isArray(rows)) {
    return NextResponse.json(
      { error: 'Expected { conversions: [...] }', code: 'invalid' },
      { status: 400 },
    )
  }
  if (rows.length === 0 || rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `conversions must hold 1..${MAX_ROWS} rows`, code: 'invalid' },
      { status: 400 },
    )
  }

  const results: RowResult[] = []
  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i] as Record<string, unknown>
    const stringified: Record<string, string | undefined> = {}
    for (const k of ['vendor', 'order', 'orderId', 'amount', 'currency', 'product']) {
      const v = raw?.[k]
      if (v != null) stringified[k] = String(v)
    }

    const parsed = parseConversion(stringified)
    if (!parsed.ok) {
      results.push({ index: i, error: parsed.error })
      continue
    }
    const { value } = parsed

    const vendor = VENDORS.find((v) => v.id === value.vendor)
    if (!vendor?.affiliate?.active) {
      results.push({ index: i, orderId: value.orderId, error: 'unknown or inactive vendor' })
      continue
    }
    // Only attribute a per-product counter for a slug the vendor actually deep-links.
    const slug =
      value.product && vendor.affiliate.productUrls?.[value.product] ? value.product : undefined

    try {
      const outcome = await recordConversion({
        vendorId: value.vendor,
        orderId: value.orderId,
        amountCents: value.amountCents,
        slug,
      })
      results.push({ index: i, orderId: value.orderId, outcome })
    } catch {
      results.push({ index: i, orderId: value.orderId, error: 'store write failed' })
    }
  }

  const summary = {
    total: results.length,
    recorded: results.filter((r) => r.outcome === 'recorded').length,
    duplicate: results.filter((r) => r.outcome === 'duplicate').length,
    invalid: results.filter((r) => r.error).length,
  }
  return NextResponse.json({ ok: true, summary, results })
}
