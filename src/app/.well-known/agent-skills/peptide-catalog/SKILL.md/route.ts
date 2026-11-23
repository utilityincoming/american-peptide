import { getAgentSkill } from '@/lib/agent-skills'

// GET /.well-known/agent-skills/peptide-catalog/SKILL.md — the skill body. The
// bytes served here are the exact string hashed for the index digest, so the
// published digest always matches the artifact.
export const dynamic = 'force-static'

export function GET() {
  const skill = getAgentSkill('peptide-catalog')
  if (!skill) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  return new Response(skill.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
