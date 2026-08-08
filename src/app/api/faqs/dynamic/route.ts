import { getPopularQuestions } from '@/lib/agent-faqs'

// Reads live KV, so it can't be statically prerendered.
export const dynamic = 'force-dynamic'

// Popular Peptide Agent questions for the homepage's dynamic FAQ group.
// Edge-cached briefly so the widget doesn't hit KV on every page load.
export async function GET() {
  const questions = await getPopularQuestions(6)
  return Response.json(
    { questions },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    },
  )
}
