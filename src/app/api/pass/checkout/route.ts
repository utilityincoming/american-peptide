import { NextRequest } from 'next/server'
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit'
import { isSameOriginBrowser, isLikelyBot, meter } from '@/lib/agent-quota'
import { createCheckout, passSalesEnabled } from '@/lib/agent-pass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/pass/checkout — start a Stripe Checkout Session for the Research
// Pass and return its hosted payment URL. Payment happens on Stripe; the card
// never touches this site.
export async function POST(request: NextRequest) {
  if (!passSalesEnabled) {
    return Response.json({ error: 'The Research Pass is not available yet.' }, { status: 503 })
  }
  if (!isSameOriginBrowser(request) || isLikelyBot(request.headers.get('user-agent'))) {
    return Response.json({ error: 'This endpoint is only available from the site itself.' }, { status: 403 })
  }
  const rl = await rateLimit(clientKey(request, 'pass-checkout'), { limit: 6, windowSec: 600 })
  if (!rl.ok) return tooManyRequests(rl, 'Too many attempts. Please wait a few minutes and try again.')

  // Same-origin was just verified, so the Origin header is this site's origin.
  const origin = new URL(request.headers.get('origin') as string).origin
  let url: string | null = null
  try {
    url = await createCheckout(origin)
  } catch {
    url = null
  }
  if (!url) {
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
  void meter('chat', { 'pass:checkout_started': 1 })
  return Response.json({ url })
}
