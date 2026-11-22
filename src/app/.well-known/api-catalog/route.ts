import {
  API_SITE,
  API_LICENSE,
  API_ATTRIBUTION,
} from '@/lib/catalog-api'

// GET /.well-known/api-catalog — machine-readable catalog of this site's APIs,
// per RFC 9727 (https://www.rfc-editor.org/rfc/rfc9727). The body is an
// RFC 9264 "link set" (application/linkset+json): a single context (this
// well-known URL) whose `item` links point at each API entry point, with
// `service-doc` for the human docs and `license` for the data terms.
//
// An agent that lands anywhere on the site can discover every programmatic
// surface from here — the JSON catalog, the markdown/LLM index, and the remote
// MCP server — without scraping the developers page.

export const dynamic = 'force-static'

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

export function GET() {
  const linkset = {
    linkset: [
      {
        anchor: `${API_SITE}/.well-known/api-catalog`,
        item: [
          {
            href: `${API_SITE}/api/catalog`,
            title: 'Peptide Catalog API — list and filter the open peptide catalog',
            type: 'application/json',
          },
          {
            href: `${API_SITE}/api/catalog/{slug}`,
            title: 'Peptide Catalog API — a single peptide by slug',
            type: 'application/json',
          },
          {
            href: `${API_SITE}/llms.txt`,
            title: 'LLM markdown index (llmstxt.org) — curated site index for agents',
            type: 'text/markdown',
          },
          {
            href: `${API_SITE}/api/mcp`,
            title: 'Remote MCP server (Streamable HTTP) — connect from Claude, ChatGPT, or Cursor',
          },
        ],
        'service-doc': [
          {
            href: `${API_SITE}/developers`,
            title: `${API_ATTRIBUTION} API documentation`,
            type: 'text/html',
          },
        ],
        license: [
          {
            href: LICENSE_URL,
            title: `Catalog data is licensed ${API_LICENSE}; attribution to ${API_ATTRIBUTION}`,
          },
        ],
      },
    ],
  }

  return new Response(JSON.stringify(linkset, null, 2), {
    headers: {
      // RFC 9727 §3: an api-catalog document SHOULD be served as a link set.
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      // Discoverable but refreshes within minutes of a deploy (the surface
      // changes rarely, but a stale catalog shouldn't outlive a change by a day).
      'Cache-Control': 'public, max-age=300',
    },
  })
}
