import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MCP_SERVER, MCP_TOOLS } from './mcp-manifest'

// The card manifest mirrors the live MCP server (src/app/api/mcp/route.ts).
// These tests fail if the two drift apart, so the published /.well-known/mcp/
// server-card.json can never advertise a stale tool set or identity.

const routeSource = readFileSync(
  fileURLToPath(new URL('../app/api/mcp/route.ts', import.meta.url)),
  'utf8',
)

function registeredToolNames(src: string): string[] {
  const names: string[] = []
  const re = /registerTool\(\s*['"]([a-z_]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) names.push(m[1])
  return names
}

describe('MCP manifest ↔ live server', () => {
  it('advertises exactly the tools the server registers', () => {
    const registered = registeredToolNames(routeSource).sort()
    const manifest = MCP_TOOLS.map((t) => t.name).sort()
    expect(manifest).toEqual(registered)
  })

  it('matches the server identity (serverInfo name/version)', () => {
    expect(routeSource).toContain(`name: '${MCP_SERVER.name}'`)
    expect(routeSource).toContain(`version: '${MCP_SERVER.version}'`)
  })

  it('points its transport endpoint at the /api/mcp route', () => {
    expect(MCP_SERVER.endpoint).toMatch(/\/api\/mcp$/)
  })

  it('gives every advertised tool a non-empty description', () => {
    for (const t of MCP_TOOLS) {
      expect(t.name).toMatch(/^[a-z_]+$/)
      expect(t.description.trim().length).toBeGreaterThan(10)
    }
  })
})
