import { agentSkillsIndex } from '@/lib/agent-skills'

// GET /.well-known/agent-skills/index.json — Agent Skills Discovery index
// (RFC v0.2.0). Lists the site's published SKILL.md bundles with sha256 digests.
// Digests are computed from the same strings the SKILL.md routes serve.
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(agentSkillsIndex(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
