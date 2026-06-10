import { NextRequest, NextResponse } from 'next/server'
import { CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import {
  apiHeaders,
  apiMeta,
  filterPeptides,
  serializePeptide,
  isBrowserDocumentRequest,
  CORS_HEADERS,
} from '@/lib/catalog-api'

export const runtime = 'nodejs'

// GET /api/catalog
//   ?category=<id>   filter by catalog category
//   ?area=<slug>     filter by research-area
//   ?fda=true        only FDA-approved
//   ?q=<text>        search name / aliases / description
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  // A human typing this URL in the address bar would otherwise see a raw JSON
  // dump (which reads as a broken page). Send bare browser navigations to the
  // documented /developers page; API clients and the service worker get JSON.
  if (isBrowserDocumentRequest(req) && [...sp.keys()].length === 0) {
    const url = req.nextUrl.clone()
    url.pathname = '/developers'
    url.search = ''
    return NextResponse.redirect(url, 307)
  }
  const category = sp.get('category')?.trim().toLowerCase() || null
  const area = sp.get('area')?.trim().toLowerCase() || null
  const fdaOnly = sp.get('fda') === 'true'
  const q = sp.get('q')?.trim().toLowerCase() || null

  const result = filterPeptides({ category, area, fdaOnly, q })
  if ('error' in result) {
    return NextResponse.json(
      { ...apiMeta(), error: result.error },
      { status: 400, headers: CORS_HEADERS },
    )
  }
  const items = result.items

  return NextResponse.json(
    {
      ...apiMeta(),
      generated: new Date().toISOString(),
      filters: { category, area, fda: fdaOnly, q },
      categories: CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
      researchAreas: RESEARCH_AREAS.map((a) => ({
        slug: a.slug,
        label: a.label,
      })),
      count: items.length,
      peptides: items.map(serializePeptide),
    },
    { headers: apiHeaders() },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
