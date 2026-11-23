import { describe, it, expect } from 'vitest'
import { GET } from './route'

async function body() {
  const res = GET()
  return { res, text: await res.text() }
}

describe('/auth.md', () => {
  it('serves markdown with the auth.md H1', async () => {
    const { res, text } = await body()
    expect(res.headers.get('content-type')).toMatch(/text\/markdown/)
    expect(text.startsWith('# auth.md')).toBe(true)
  })

  it('declares a complete self-contained anonymous registration flow', async () => {
    const { text } = await body()
    // The markers the auth.md convention needs to recognize a standalone flow.
    expect(text).toContain('"identity_types_supported": ["anonymous"]')
    expect(text).toContain('"credential_types_supported": ["api_key"]')
    expect(text).toContain('"claim_uri"')
    expect(text).toContain('"register_uri"')
    expect(text).toContain('/api/keys')
  })

  it('documents the credential methods', async () => {
    const { text } = await body()
    expect(text).toContain('Authorization: Bearer')
    expect(text).toContain('x-api-key')
  })
})
