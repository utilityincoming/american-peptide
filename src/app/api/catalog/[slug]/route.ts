import { NextResponse } from 'next/server'
import { getPeptideBySlug } from '@/lib/peptides'
import {
  apiHeaders,
  apiMeta,
  serializePeptide,
  CORS_HEADERS,
} from '@/lib/catalog-api'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

// GET /api/catalog/{slug} — a single peptide by slug.
export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)

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
