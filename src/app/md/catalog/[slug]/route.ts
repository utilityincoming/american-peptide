import { NextRequest } from 'next/server'
import { getPeptideBySlug, PEPTIDES } from '@/lib/peptides'
import { peptideMarkdown, markdownHeaders } from '@/lib/llms'
import { getLatestResearch } from '@/lib/freshness'
import { API_SITE } from '@/lib/catalog-api'

export const runtime = 'nodejs'

export function generateStaticParams() {
  return PEPTIDES.map((p) => ({ slug: p.slug }))
}

interface RouteContext {
  params: Promise<{ slug: string }>
}

// GET /catalog/{slug}.md (rewritten here from next.config.ts) — one peptide
// as clean markdown for token-efficient agent consumption.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)

  if (!peptide) {
    return new Response(
      `No peptide with slug '${slug}'. Index: ${API_SITE}/llms.txt`,
      { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    )
  }

  const latest = await getLatestResearch(peptide)
  return new Response(peptideMarkdown(peptide, latest), {
    headers: markdownHeaders({
      contentType: 'text/markdown',
      canonical: `${API_SITE}/catalog/${peptide.slug}`,
    }),
  })
}
