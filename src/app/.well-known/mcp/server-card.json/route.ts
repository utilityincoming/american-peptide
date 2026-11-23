import { MCP_SERVER, MCP_TOOLS } from '@/lib/mcp-manifest'
import { API_LICENSE, API_ATTRIBUTION } from '@/lib/catalog-api'

// GET /.well-known/mcp/server-card.json — MCP Server Card for agent discovery
// (SEP-2127, "MCP Server Cards"; also the surface isitagentready.com probes).
//
// An agent that lands on the site can discover the remote MCP server and its
// tools from this card alone, without connecting first. The card MIRRORS the
// live server at /api/mcp (src/app/api/mcp/route.ts); src/lib/mcp-manifest.ts is
// the shared source of truth, with a drift-guard test keeping the two in sync.
//
// The body is a superset: SEP-2127 top-level identity (name/version/description/
// title/websiteUrl) plus the discovery fields a scanner expects — a `serverInfo`
// object, a transport `endpoint`, and `capabilities` listing the tools (this
// server exposes no resources or prompts).

export const dynamic = 'force-static'

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

export function GET() {
  const card = {
    // SEP-2127 top-level identity.
    name: MCP_SERVER.name,
    title: MCP_SERVER.title,
    description: MCP_SERVER.description,
    version: MCP_SERVER.version,
    websiteUrl: MCP_SERVER.websiteUrl,
    documentationUrl: MCP_SERVER.documentationUrl,

    // Discovery fields (serverInfo + transport endpoint).
    serverInfo: { name: MCP_SERVER.name, version: MCP_SERVER.version },
    endpoint: MCP_SERVER.endpoint,
    transport: MCP_SERVER.transport,
    remotes: [{ type: MCP_SERVER.transport, url: MCP_SERVER.endpoint }],

    // Advertised capabilities. This server is tools-only.
    capabilities: {
      tools: MCP_TOOLS,
      resources: [],
      prompts: [],
    },

    license: { name: API_LICENSE, url: LICENSE_URL, attribution: API_ATTRIBUTION },
  }

  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      // Discoverable, but refreshes within minutes of a deploy so a changed tool
      // set doesn't sit a day behind a stale edge copy.
      'Cache-Control': 'public, max-age=300',
    },
  })
}
