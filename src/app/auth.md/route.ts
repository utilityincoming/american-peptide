import { API_SITE } from '@/lib/catalog-api'
import { TIERS } from '@/lib/api-keys'

// GET /auth.md — agent authentication & registration discovery (the auth.md
// convention; the surface isitagentready.com probes for `authMd`).
//
// This API is OPEN and keyless by default, so there is no OAuth authorization
// server and we deliberately publish NO /.well-known/oauth-protected-resource
// or /.well-known/oauth-authorization-server — advertising OAuth metadata the
// site doesn't have would be false. Instead this is the self-contained variant:
// it names the agent audience, the self-serve registration endpoint, the
// supported credential methods, and how credentials are used.

export const dynamic = 'force-static'

const anon = TIERS.anonymous
const free = TIERS.free

const BODY = `# auth.md

Agent authentication and registration for **${API_SITE.replace('https://', '')}**.

## Audience

Autonomous agents and automated clients using the open peptide catalog API
(\`/api/catalog\`), the markdown surfaces (\`/llms.txt\`, \`/catalog/{slug}.md\`),
and the remote MCP server (\`/api/mcp\`).

## Authentication model

**Open by default — no authentication required.** The public read-only API and
the MCP server are callable anonymously; access is rate-limited per client.
An optional, free, self-serve API key raises the limits and attributes usage.
There are **no user accounts, no OAuth/OIDC, and no paywall on the base data**
(all catalog data is CC BY 4.0).

Because there is no authorization server, this site publishes no OAuth Protected
Resource Metadata (\`/.well-known/oauth-protected-resource\`) and no Authorization
Server Metadata. Credentials are plain bearer API keys.

## Access tiers

| Tier | Credential | Burst | Daily |
| --- | --- | --- | --- |
| Anonymous | none | ${anon.perMinute}/min | ${anon.perDay.toLocaleString('en-US')}/day |
| Free | API key | ${free.perMinute}/min | ${free.perDay.toLocaleString('en-US')}/day |

## Registration (provisioning a key)

Self-serve, instant, no human approval and no account:

\`\`\`
POST ${API_SITE}/api/keys
Content-Type: application/json

{ "email": "optional@example.com", "label": "optional attribution label" }
\`\`\`

Both body fields are optional. The response (HTTP 201) returns the key **once** —
it is stored only as a hash and cannot be recovered, so save it. Key creation is
rate-limited to 5 keys per day per IP.

A machine-readable summary of the registration method:

\`\`\`json
{
  "audience": "autonomous-agents",
  "auth_required": false,
  "register_uri": "${API_SITE}/api/keys",
  "registration_methods": [
    {
      "type": "self_serve_api_key",
      "method": "POST",
      "uri": "${API_SITE}/api/keys",
      "approval": "automatic",
      "credential": "bearer_api_key"
    }
  ],
  "bearer_methods_supported": ["header"],
  "credential_headers": ["Authorization: Bearer <key>", "x-api-key: <key>"],
  "documentation": "${API_SITE}/developers"
}
\`\`\`

## Using a credential

Send the key on every request with **either** header:

\`\`\`
Authorization: Bearer <key>
x-api-key: <key>
\`\`\`

Inspect your key's tier, limits, and usage (authenticate with the key itself):

\`\`\`
GET ${API_SITE}/api/keys
Authorization: Bearer <key>
\`\`\`

## Scope of credentials

A key only raises rate/quota limits on the same open, read-only endpoints — it
unlocks no private data. When you use the data, attribute **${API_SITE.replace('https://', '')}**
(CC BY 4.0) and keep the canonical URLs returned with each record.

## Related discovery documents

- API documentation: ${API_SITE}/developers
- API catalog (RFC 9727): ${API_SITE}/.well-known/api-catalog
- MCP Server Card (SEP-2127): ${API_SITE}/.well-known/mcp/server-card.json
- LLM index: ${API_SITE}/llms.txt
`

export function GET() {
  return new Response(BODY, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
