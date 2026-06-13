import { llmsIndexMarkdown, markdownHeaders } from '@/lib/llms'
import { API_SITE } from '@/lib/catalog-api'

// Statically generated at build time — content derives entirely from catalog
// data, so it can only change with a deploy.
export const dynamic = 'force-static'

// GET /llms.txt — curated markdown index of the site for AI agents.
export function GET() {
  return new Response(llmsIndexMarkdown(), {
    headers: markdownHeaders({
      contentType: 'text/plain',
      canonical: `${API_SITE}/llms.txt`,
    }),
  })
}
