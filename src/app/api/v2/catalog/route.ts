import { NextRequest, NextResponse } from 'next/server'
import { enforceApiAccess } from '@/lib/api-auth'
import { apiHeaders, catalogAccessError, apiMeta, catalogEtag, filterPeptides, serializePeptide } from '@/lib/catalog-api'
import { CATALOG_PAGE_DEFAULT, parseCatalogV2 } from '@/lib/catalog-v2'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // Share the existing catalog quota across both HTTP versions.
  const access = await enforceApiAccess(req, 'catalog')
  if (!access.ok) return catalogAccessError(access.response)
  const headers = apiHeaders(access.headers)
  const etag = catalogEtag()
  headers.ETag = etag
  if (req.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers })
  }
  const parsed = parseCatalogV2(req.nextUrl.searchParams)
  if ('errors' in parsed) {
    return NextResponse.json(
      { error: { code: 'INVALID_QUERY', issues: parsed.errors } },
      { status: 400, headers },
    )
  }

  const { category, area, fda, q, limit = CATALOG_PAGE_DEFAULT, offset = 0 } = parsed.filters
  const result = filterPeptides({ category, area, q, fdaOnly: fda })
  if ('error' in result) {
    return NextResponse.json(
      { error: { code: 'INVALID_QUERY', issues: [{ field: 'area', message: result.error }] } },
      { status: 400, headers },
    )
  }

  const ordered = result.items.toSorted((a, b) => a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  const total = ordered.length
  const peptides = ordered.slice(offset, offset + limit).map(serializePeptide)
  const end = offset + peptides.length

  return NextResponse.json(
    {
      ...apiMeta(),
      version: '2.0',
      pagination: { limit, offset, total, nextOffset: end < total ? end : null },
      peptides,
    },
    { headers },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: apiHeaders() })
}
