// Affiliate conversion postback: the inbound counterpart to /go/<id>.
//
// A partner's server calls this on each sale so we can see conversions +
// revenue, not just clicks. Public endpoint (no ADMIN_SECRET), so every write is
// gated by a per-vendor HMAC signature — see lib/referral-postback for the
// threat model and the REFERRAL_POSTBACK_SECRET_<VENDOR_ID> env scheme.
//
// A vendor with no secret configured is "not wired for postback" → 404, so this
// ships inert and is armed one partner at a time once they confirm the scheme.
// Accepts GET (pixel) and POST (form or query) with the same params:
//   vendor, order (or orderId), amount (major units), currency?, product?, ts?, sig
//
// Responses: 200 {ok,outcome} on a verified sale (outcome 'recorded'|'duplicate'),
// 400 invalid, 401 bad signature, 404 vendor not enabled, 408 stale.

import { NextResponse, after, type NextRequest } from 'next/server'
import { VENDORS } from '@/lib/vendors'
import { recordConversion } from '@/lib/referrals'
import {
  parseConversion,
  verifySignature,
  vendorSecret,
  isStale,
} from '@/lib/referral-postback'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function readParams(req: NextRequest): Promise<Record<string, string | undefined>> {
  const q = req.nextUrl.searchParams
  const out: Record<string, string | undefined> = {}
  for (const k of ['vendor', 'order', 'orderId', 'amount', 'currency', 'product', 'ts', 'sig']) {
    const v = q.get(k)
    if (v != null) out[k] = v
  }
  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') ?? ''
    try {
      if (ct.includes('application/json')) {
        const body = (await req.json()) as Record<string, unknown>
        for (const [k, v] of Object.entries(body)) {
          if (v != null && out[k] == null) out[k] = String(v)
        }
      } else if (
        ct.includes('application/x-www-form-urlencoded') ||
        ct.includes('multipart/form-data')
      ) {
        const form = await req.formData()
        for (const [k, v] of form.entries()) {
          if (typeof v === 'string' && out[k] == null) out[k] = v
        }
      }
    } catch {
      /* malformed body → fall through; parseConversion will reject on missing fields */
    }
  }
  return out
}

async function handle(req: NextRequest) {
  const raw = await readParams(req)

  const parsed = parseConversion(raw)
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: 'invalid', error: parsed.error }, { status: 400 })
  }
  const { value, signatureBase } = parsed

  // Vendor must exist and be an active affiliate — a postback for an unknown or
  // inactive vendor is never recorded.
  const vendor = VENDORS.find((v) => v.id === value.vendor)
  if (!vendor?.affiliate?.active) {
    return NextResponse.json({ ok: false, code: 'unknown_vendor' }, { status: 404 })
  }

  // No secret → this vendor isn't wired for postback yet. 404 (not 401) so we
  // don't confirm vendor existence to an unsigned prober.
  const secret = vendorSecret(value.vendor)
  if (!secret) {
    return NextResponse.json({ ok: false, code: 'not_enabled' }, { status: 404 })
  }

  if (!verifySignature(signatureBase, secret, raw.sig)) {
    return NextResponse.json({ ok: false, code: 'bad_signature' }, { status: 401 })
  }

  if (isStale(value.ts)) {
    return NextResponse.json({ ok: false, code: 'stale' }, { status: 408 })
  }

  // Only record a product counter for a slug the vendor actually deep-links, so
  // a bogus ?product= can't seed arbitrary keys (mirrors the /go ?p= rule).
  const slug =
    value.product && vendor.affiliate.productUrls?.[value.product] ? value.product : undefined

  // The 200 is the product; the write is a courtesy. Schedule it via after() so
  // a slow store never delays the partner's postback ack.
  let outcome: 'recorded' | 'duplicate' = 'recorded'
  try {
    outcome = await recordConversion({
      vendorId: value.vendor,
      orderId: value.orderId,
      amountCents: value.amountCents,
      slug,
    })
  } catch {
    // Never surface a store error to the partner; ack and move on.
    after(async () => {
      try {
        await recordConversion({
          vendorId: value.vendor,
          orderId: value.orderId,
          amountCents: value.amountCents,
          slug,
        })
      } catch {
        /* best-effort */
      }
    })
  }

  return NextResponse.json({ ok: true, outcome })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
