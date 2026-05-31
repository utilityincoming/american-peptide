import { NextRequest, NextResponse } from 'next/server'
import { PEPTIDES, CATEGORIES, type Peptide } from '@/lib/peptides'
import {
  RESEARCH_AREAS,
  getResearchAreaBySlug,
  getPeptidesForArea,
} from '@/lib/research-areas'
import {
  apiHeaders,
  apiMeta,
  serializePeptide,
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
  const category = sp.get('category')?.trim().toLowerCase() || null
  const area = sp.get('area')?.trim().toLowerCase() || null
  const fdaOnly = sp.get('fda') === 'true'
  const q = sp.get('q')?.trim().toLowerCase() || null

  let items: Peptide[] = PEPTIDES

  if (area) {
    const meta = getResearchAreaBySlug(area)
    if (!meta) {
      return NextResponse.json(
        {
          ...apiMeta(),
          error: `Unknown research area '${area}'. See documentation for valid slugs.`,
        },
        { status: 400, headers: CORS_HEADERS },
      )
    }
    items = getPeptidesForArea(meta)
  }

  if (category) {
    items = items.filter((p) =>
      p.categories.some((c) => c.toLowerCase() === category),
    )
  }

  if (fdaOnly) {
    items = items.filter((p) => p.fdaApproved)
  }

  if (q) {
    items = items.filter((p) => {
      const hay = [p.name, p.shortDescription, p.description, ...(p.aliases ?? [])]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

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
