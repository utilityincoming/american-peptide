import { NextRequest, NextResponse } from 'next/server'
import { CATEGORIES } from '@/lib/peptides'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import {
  apiHeaders,
  catalogAccessError,
  apiMeta,
  filterPeptides,
  serializePeptide,
  isBrowserDocumentRequest,
} from '@/lib/catalog-api'
import { normalizeCatalogQuery } from '@/lib/catalog-query'
import { enforceApiAccess } from '@/lib/api-auth'

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

  // API clients (not browser navigations): apply tiered access + metering.
  const access = await enforceApiAccess(req, 'catalog')
  if (!access.ok) return catalogAccessError(access.response)

  const category = normalizeCatalogQuery(sp.get('category'))
  const area = normalizeCatalogQuery(sp.get('area'))
  const fdaOnly = sp.get('fda') === 'true'
  const q = normalizeCatalogQuery(sp.get('q'))

  const result = filterPeptides({ category, area, fdaOnly, q })
  if ('error' in result) {
    return NextResponse.json(
      { ...apiMeta(), error: result.error },
      { status: 400, headers: apiHeaders(access.headers) },
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
    { headers: apiHeaders(access.headers) },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiHeaders() })
}
