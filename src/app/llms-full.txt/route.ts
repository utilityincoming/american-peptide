import { llmsFullMarkdown, markdownHeaders } from '@/lib/llms'
import { API_SITE } from '@/lib/catalog-api'

export const dynamic = 'force-static'

// GET /llms-full.txt — the entire peptide catalog as one markdown document.
export function GET() {
  return new Response(llmsFullMarkdown(), {
    headers: markdownHeaders({
      contentType: 'text/plain',
      canonical: `${API_SITE}/llms-full.txt`,
    }),
  })
}
