import { NextRequest } from 'next/server'
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit'
import { peekQuota, isSameOriginBrowser, meter } from '@/lib/agent-quota'
import {
  passFromRequest,
  lookupPass,
  normalizeCode,
  passCookie,
  passSalesEnabled,
  PASS_PRICE_LABEL,
  PASS_DAYS,
} from '@/lib/agent-pass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

// GET /api/pass — what the research UI needs to render the offer: the caller's
// remaining free weekly searches, whether a Research Pass is active, and the
// paid option's price/term. Consumes nothing.
export async function GET(request: NextRequest) {
  let pass = null
  try {
    pass = await passFromRequest(request)
  } catch {
    // store unavailable — report no pass; the chat route fails closed on its own
  }
  const quota = await peekQuota(request, 'chat')
  return Response.json(
    {
      enabled: quota !== null,
      pass: pass ? { expiresAt: pass.expiresAt } : null,
      ...(quota ?? {}),
      offer: {
        available: passSalesEnabled,
        price: PASS_PRICE_LABEL,
        days: PASS_DAYS,
        checkoutUrl: '/research/pass',
      },
    },
    { headers: NO_STORE },
  )
}

// POST /api/pass { code } — redeem an access code on this device. Sets the pass
// cookie when the code is valid and unexpired.
export async function POST(request: NextRequest) {
  if (!isSameOriginBrowser(request)) {
    return Response.json({ error: 'This endpoint is only available from the site itself.' }, { status: 403 })
  }
  // Tight limit: this is the only place a code can be guessed (80-bit codes).
  const rl = await rateLimit(clientKey(request, 'pass-redeem'), { limit: 8, windowSec: 600 })
  if (!rl.ok) return tooManyRequests(rl, 'Too many attempts. Please wait a few minutes and try again.')

  let code: string | null = null
  try {
    code = normalizeCode((await request.json())?.code)
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!code) return Response.json({ error: "That code isn't valid." }, { status: 400 })

  let pass
  try {
    pass = await lookupPass(code)
  } catch {
    return Response.json({ error: 'Could not check the code right now. Please try again.' }, { status: 503 })
  }
  if (!pass) return Response.json({ error: "That code isn't valid or has expired." }, { status: 404 })

  void meter('chat', { 'pass:redeemed': 1 })
  return Response.json(
    { ok: true, pass: { expiresAt: pass.expiresAt } },
    { headers: { ...NO_STORE, 'Set-Cookie': passCookie(code, pass.expiresAt) } },
  )
}
