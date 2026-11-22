import { llmsIndexMarkdown, markdownHeaders } from '@/lib/llms'
import { API_SITE } from '@/lib/catalog-api'

// Statically generated: content derives entirely from catalog data, so it can
// only change with a deploy.
export const dynamic = 'force-static'

// Markdown representation of the home page, served by content negotiation:
// middleware rewrites `GET / ` with `Accept: text/markdown` here. The body is
// the same curated site index published at /llms.txt, but returned as
// text/markdown and canonicalized to the apex rather than to /llms.txt.
export function GET() {
  return new Response(llmsIndexMarkdown(), {
    headers: markdownHeaders({
      contentType: 'text/markdown',
      canonical: API_SITE,
    }),
  })
}
