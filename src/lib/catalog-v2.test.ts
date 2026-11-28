import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import { GET, OPTIONS } from '@/app/api/v2/catalog/route'
import { GET as getLegacyCatalog } from '@/app/api/catalog/route'
import { enforceApiAccess } from './api-auth'
import { catalogEtag, filterPeptides } from './catalog-api'

vi.mock('./api-auth', () => ({
  enforceApiAccess: vi.fn().mockResolvedValue({
    ok: true,
    tier: 'anonymous',
    headers: { 'X-Quota-Remaining': '42' },
  }),
}))

function request(query: string) {
  return new NextRequest(`https://americanpeptide.com/api/v2/catalog?${query}`)
}

describe('catalog HTTP contracts', () => {
  it('paginates stably with the same matching records as the existing MCP filter', async () => {
    const query = 'category=METABOLIC&fda=true&limit=2'
    const first = await GET(request(query))
    const firstPage = await first.json()
    const secondPage = await (await GET(request(`${query}&offset=2`))).json()
    const mcp = filterPeptides({ category: 'metabolic', fdaOnly: true })
    if ('error' in mcp) throw new Error(mcp.error)
    const slugs = mcp.items.map(({ slug }) => slug).sort()

    expect(first.status).toBe(200)
    expect(first.headers.get('cache-control')).toBe('private, no-store')
    expect(first.headers.get('x-quota-remaining')).toBe('42')
    expect(firstPage.version).toBe('2.0')
    expect(firstPage.pagination).toEqual({ limit: 2, offset: 0, total: slugs.length, nextOffset: 2 })
    expect(firstPage.peptides.map(({ slug }: { slug: string }) => slug)).toEqual(slugs.slice(0, 2))
    expect(secondPage.peptides.map(({ slug }: { slug: string }) => slug)).toEqual(slugs.slice(2, 4))
    const exhausted = await (await GET(request(`${query}&offset=${slugs.length}`))).json()
    expect(exhausted.pagination.nextOffset).toBeNull()
    expect(exhausted.peptides).toEqual([])
  })

  it.each([
    ['limit=0', 'limit'],
    ['limit=101', 'limit'],
    ['offset=-1', 'offset'],
    ['offset=9007199254740992', 'offset'],
    ['q=a&q=b', 'q'],
    [`q=${'a'.repeat(201)}`, 'q'],
    ['q=Ozempic&extra=1', 'extra'],
    ['fda=yes', 'fda'],
    ['category=unknown', 'category'],
    ['area=unknown', 'area'],
  ])('returns a field error for %s', async (query, field) => {
    const response = await GET(request(query))
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: { code: 'INVALID_QUERY', issues: [{ field }] },
    })
  })

  it('preserves metering errors and allows browser clients to send API keys', async () => {
    vi.mocked(enforceApiAccess).mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: 'Rate limit exceeded' }, {
        status: 429,
        headers: { 'Retry-After': '30' },
      }),
    })
    const response = await GET(request(''))
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('30')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(OPTIONS().headers.get('access-control-allow-headers')).toContain('Authorization')
  })

  it('returns 304 when the catalog ETag matches', async () => {
    const etag = catalogEtag()
    const response = await GET(new NextRequest('https://americanpeptide.com/api/v2/catalog?limit=1', {
      headers: { 'if-none-match': etag },
    }))
    expect(response.status).toBe(304)
    expect(response.headers.get('etag')).toBe(etag)
  })

  it('keeps the v1 response shape and query handling', async () => {
    const response = await getLegacyCatalog(new NextRequest('https://americanpeptide.com/api/catalog?q=Ozempic&limit=0'))
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toMatchObject({
      version: '1.0',
      count: expect.any(Number),
      peptides: expect.arrayContaining([expect.objectContaining({ slug: 'semaglutide' })]),
    })
  })
})
