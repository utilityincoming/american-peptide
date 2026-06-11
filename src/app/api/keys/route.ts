import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit'
import { CORS_HEADERS, API_SITE } from '@/lib/catalog-api'
import { createKey, lookupKey, getUsage, TIERS } from '@/lib/api-keys'
import { extractKey } from '@/lib/api-auth'
import { kv } from '@/lib/kv'

export const runtime = 'nodejs'

// POST /api/keys — self-serve a free API key.
//
// IP-rate-limited to deter mass key creation. The plaintext key is returned
// ONCE and stored only as a hash; clients must save it. Optional { email,
// label } in the body for attribution.
export async function POST(req: NextRequest) {
  const rl = await rateLimit(clientKey(req, 'keyissue'), { limit: 5, windowSec: 86400 })
  if (!rl.ok) {
    return tooManyRequests(rl, 'Too many keys requested from this address today. Try again tomorrow.')
  }

  let body: { email?: unknown; label?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    // No body is fine — email/label are optional.
  }
  const email = typeof body.email === 'string' ? body.email : ''
  const label = typeof body.label === 'string' ? body.label : ''

  const { key, record } = await createKey({ tier: 'free', label, email })

  return NextResponse.json(
    {
      key,
      tier: record.tier,
      label: record.label,
      created: record.createdAt,
      limits: TIERS[record.tier],
      persistent: kv.persistent,
      note:
        'Store this key now — it is shown only once and cannot be recovered. Send it with each request as "Authorization: Bearer <key>" or the "x-api-key" header.',
      ...(kv.persistent
        ? {}
        : {
            warning:
              'This server has no durable key store configured (UPSTASH_REDIS_REST_*), so this key is in-memory only and will not persist. For local testing only.',
          }),
      documentation: `${API_SITE}/developers`,
    },
    { status: 201, headers: CORS_HEADERS },
  )
}

// GET /api/keys — a key's own tier, limits, and usage. Authenticate with the
// key itself (Authorization: Bearer <key> or x-api-key).
export async function GET(req: NextRequest) {
  const provided = extractKey(req)
  if (!provided) {
    return NextResponse.json(
      { error: 'Provide your API key via "Authorization: Bearer <key>" or the "x-api-key" header.' },
      { status: 401, headers: CORS_HEADERS },
    )
  }
  const found = await lookupKey(provided)
  if (!found) {
    return NextResponse.json({ error: 'Invalid API key.' }, { status: 401, headers: CORS_HEADERS })
  }
  const usage = await getUsage(`key:${found.hash}`)
  return NextResponse.json(
    {
      tier: found.record.tier,
      label: found.record.label,
      created: found.record.createdAt,
      limits: TIERS[found.record.tier],
      usage,
    },
    { headers: CORS_HEADERS },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
