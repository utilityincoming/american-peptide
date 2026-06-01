import { NextRequest, NextResponse } from 'next/server'
import { getPeptideBySlug } from '@/lib/peptides'
import {
  apiHeaders,
  apiMeta,
  serializePeptide,
  isBrowserDocumentRequest,
  CORS_HEADERS,
} from '@/lib/catalog-api'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

// GET /api/catalog/{slug} — a single peptide by slug.
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)

  // Browser navigations go to a real page (the peptide's catalog entry, or the
  // docs if the slug is unknown) instead of a raw JSON dump. API clients + the
  // service worker still get JSON.
  if (isBrowserDocumentRequest(req)) {
    const url = req.nextUrl.clone()
    url.pathname = peptide ? `/catalog/${peptide.slug}` : '/developers'
    url.search = ''
    return NextResponse.redirect(url, 307)
  }

  if (!peptide) {
    return NextResponse.json(
      { ...apiMeta(), error: `No peptide with slug '${slug}'.` },
      { status: 404, headers: CORS_HEADERS },
    )
  }

  return NextResponse.json(
    {
      ...apiMeta(),
      generated: new Date().toISOString(),
      peptide: serializePeptide(peptide),
    },
    { headers: apiHeaders() },
  )
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
