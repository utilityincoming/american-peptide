import { afterEach, describe, expect, it, vi } from 'vitest'
import { executeAgentTool } from './agent-tools'
import { cachedLookup } from './kv'

afterEach(() => vi.unstubAllGlobals())

describe('agent lookups', () => {
  it('retries a transient response and reuses the successful result', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 503, headers: { 'Retry-After': '0' } }))
      .mockResolvedValueOnce(Response.json({ studies: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const input = { query: 'lookup cache test' }
    const first = await executeAgentTool('search_clinical_trials', input)
    expect(first.isError).toBe(false)
    expect(await executeAgentTool('search_clinical_trials', input)).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry or cache a permanent HTTP failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
      .mockResolvedValueOnce(Response.json({ results: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const input = { query: 'failed lookup cache test' }
    expect((await executeAgentTool('search_uniprot', input)).isError).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect((await executeAgentTool('search_uniprot', input)).isError).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('coalesces simultaneous requests and expires the in-memory response', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000)
    try {
      const load = vi.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 })
      expect(await Promise.all([
        cachedLookup('expiry-test', 1, load),
        cachedLookup('expiry-test', 1, load),
      ])).toEqual([{ id: 1 }, { id: 1 }])
      expect(load).toHaveBeenCalledTimes(1)
      now.mockReturnValue(2000)
      expect(await cachedLookup('expiry-test', 1, load)).toEqual({ id: 2 })
    } finally {
      now.mockRestore()
    }
  })
})
