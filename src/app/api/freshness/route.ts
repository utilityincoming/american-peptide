import { NextRequest, NextResponse } from 'next/server'
import { getPeptideBySlug } from '@/lib/peptides'
import { getLatestResearch } from '@/lib/freshness'
import { enforceApiAccess } from '@/lib/api-auth'
import { CORS_HEADERS } from '@/lib/catalog-api'

export const runtime = 'nodejs'

const MAX_SLUGS = 20

// GET /api/freshness?slugs=a,b,c — recent trials + publications for several
// peptides at once. Powers the personal workspace's research feed. Each
// peptide's data is ISR-cached and fail-soft (see freshness.ts), so repeated
// workspace loads are cheap. Credit-free (free public APIs only).
export async function GET(req: NextRequest) {
  const access = await enforceApiAccess(req, 'freshness')
  if (!access.ok) return access.response

  const slugs = (req.nextUrl.searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_SLUGS)

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const peptide = getPeptideBySlug(slug)
      if (!peptide) return null
      const latest = await getLatestResearch(peptide)
      return { slug: peptide.slug, name: peptide.name, ...latest }
    }),
  )

  return NextResponse.json(
    { count: results.filter(Boolean).length, results: results.filter(Boolean) },
    { headers: { ...CORS_HEADERS, ...access.headers } },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
