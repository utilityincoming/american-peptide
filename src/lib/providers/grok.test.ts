import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runGrokAgent, grokModels } from './grok'

// Stubs global fetch — no network, no real key.

const ok = (content: string) =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content } }],
      usage: { prompt_tokens: 100, completion_tokens: 10 },
    }),
    { status: 200 },
  )
const fail = (status: number) => new Response('{"error":"x"}', { status })

const msgs = [{ role: 'user' as const, content: 'What is BPC-157?' }]
const modelOf = (call: unknown[]) => JSON.parse((call[1] as { body: string }).body).model as string

describe('grokModels', () => {
  it('defaults to a cheapest-first chain and honours an override', () => {
    expect(grokModels(undefined)).toEqual(['grok-4.3', 'grok-4.7'])
    expect(grokModels(' a , b ,a,, ')).toEqual(['a', 'b'])
    expect(grokModels('')).toEqual(['grok-4.3', 'grok-4.7'])
  })
})

describe('runGrokAgent', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('XAI_API_KEY', 'xai-test')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('answers from the cheapest model without touching the next', async () => {
    fetchMock.mockResolvedValueOnce(ok('cheap answer'))
    const r = await runGrokAgent('sys', msgs, { disableTools: true })
    expect(r).toMatchObject({ ok: true, text: 'cheap answer', model: 'grok-4.3' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.x.ai/v1/chat/completions')
    expect((fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers.Authorization).toBe(
      'Bearer xai-test',
    )
  })

  it('fails over to the next model on an error, summing usage', async () => {
    fetchMock.mockResolvedValueOnce(fail(404)).mockResolvedValueOnce(ok('second answer'))
    const r = await runGrokAgent('sys', msgs, { disableTools: true })
    expect(r).toMatchObject({ ok: true, text: 'second answer', model: 'grok-4.7' })
    expect(fetchMock.mock.calls.map(modelOf)).toEqual(['grok-4.3', 'grok-4.7'])
    expect(r.usage).toEqual({ input: 100, output: 10 })
  })

  it('fails over when a model returns an empty answer', async () => {
    fetchMock.mockResolvedValueOnce(ok('')).mockResolvedValueOnce(ok('real answer'))
    const r = await runGrokAgent('sys', msgs, { disableTools: true })
    expect(r.text).toBe('real answer')
    expect(r.usage).toEqual({ input: 200, output: 20 })
  })

  it('stops at an auth failure instead of repeating it on every model', async () => {
    fetchMock.mockResolvedValueOnce(fail(401))
    const r = await runGrokAgent('sys', msgs, { disableTools: true })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports failure when every model fails', async () => {
    fetchMock.mockImplementation(async () => fail(503)) // fresh Response per call
    const r = await runGrokAgent('sys', msgs, { disableTools: true })
    expect(r.ok).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('is skipped cleanly without a key', async () => {
    vi.stubEnv('XAI_API_KEY', '')
    const r = await runGrokAgent('sys', msgs)
    expect(r.ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
