import { NextRequest } from 'next/server'
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit'
import { isSameOriginBrowser, meter } from '@/lib/agent-quota'
import { claimSession, passCookie } from '@/lib/agent-pass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MESSAGES = {
  unpaid: 'That payment has not completed. If you were charged, wait a moment and reload this page.',
  invalid: "We couldn't find that purchase.",
  expired: 'That pass has expired.',
  unavailable: 'Could not confirm the payment right now. Please reload this page in a moment.',
} as const
const STATUS = { unpaid: 402, invalid: 404, expired: 410, unavailable: 503 } as const

// POST /api/pass/claim { sessionId } — called by the checkout success page.
// Verifies the Checkout Session with Stripe, then activates the pass on this
// device and returns the access code (shown once on screen for other devices).
export async function POST(request: NextRequest) {
  if (!isSameOriginBrowser(request)) {
    return Response.json({ error: 'This endpoint is only available from the site itself.' }, { status: 403 })
  }
  const rl = await rateLimit(clientKey(request, 'pass-claim'), { limit: 10, windowSec: 600 })
  if (!rl.ok) return tooManyRequests(rl, 'Too many attempts. Please wait a few minutes and try again.')

  let sessionId = ''
  try {
    const body = await request.json()
    if (typeof body?.sessionId === 'string') sessionId = body.sessionId
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = await claimSession(sessionId)
  if (!result.ok) {
    return Response.json({ error: MESSAGES[result.reason] }, { status: STATUS[result.reason] })
  }
  void meter('chat', { 'pass:claimed': 1 })
  return Response.json(
    { ok: true, code: result.code, pass: { expiresAt: result.expiresAt } },
    {
      headers: {
        'Cache-Control': 'private, no-store',
        'Set-Cookie': passCookie(result.code, result.expiresAt),
      },
    },
  )
}
