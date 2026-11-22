import { NextRequest } from 'next/server'
import { COMPARISONS, getComparison } from '@/lib/comparisons'
import { comparisonMarkdown, markdownHeaders } from '@/lib/llms'
import { API_SITE } from '@/lib/catalog-api'

export const runtime = 'nodejs'

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ pair: c.slug }))
}

interface RouteContext {
  params: Promise<{ pair: string }>
}

// Markdown twin of /compare/{pair}, reached either directly or by content
// negotiation (middleware rewrites the HTML URL here when the request carries
// `Accept: text/markdown`).
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { pair } = await params
  const comparison = getComparison(pair)

  if (!comparison) {
    return new Response(
      `No comparison with slug '${pair}'. Index: ${API_SITE}/llms.txt`,
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    )
  }

  return new Response(comparisonMarkdown(comparison), {
    headers: markdownHeaders({
      contentType: 'text/markdown',
      canonical: `${API_SITE}/compare/${comparison.slug}`,
    }),
  })
}
