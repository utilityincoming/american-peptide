import { openApiSpec } from '@/lib/openapi'

// GET /openapi.json — OpenAPI 3.1 description of the public HTTP API, advertised
// as the `service-desc` of /.well-known/api-catalog. Built from catalog
// constants, so it can only change with a deploy.
export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(openApiSpec(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
