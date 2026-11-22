import { NextRequest } from 'next/server'
import { RESEARCH_AREAS, getResearchAreaBySlug } from '@/lib/research-areas'
import { researchAreaMarkdown, markdownHeaders } from '@/lib/llms'
import { API_SITE } from '@/lib/catalog-api'

export const runtime = 'nodejs'

export function generateStaticParams() {
  return RESEARCH_AREAS.map((a) => ({ slug: a.slug }))
}

interface RouteContext {
  params: Promise<{ slug: string }>
}

// Markdown twin of /research-areas/{slug}, reached either directly or by
// content negotiation (middleware rewrites the HTML URL here when the request
// carries `Accept: text/markdown`).
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params
  const area = getResearchAreaBySlug(slug)

  if (!area) {
    return new Response(
      `No research area with slug '${slug}'. Index: ${API_SITE}/llms.txt`,
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    )
  }

  return new Response(researchAreaMarkdown(area), {
    headers: markdownHeaders({
      contentType: 'text/markdown',
      canonical: `${API_SITE}/research-areas/${area.slug}`,
    }),
  })
}
