import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runOpenAiCompatAgent } from './openai-compat'

// A model response that asks for one grounding tool call.
const toolCallResponse = (name: string) =>
  new Response(
    JSON.stringify({
      choices: [
        {
          finish_reason: 'tool_calls',
          message: {
            content: '',
            tool_calls: [{ id: 'call_1', type: 'function', function: { name, arguments: '{}' } }],
          },
        },
      ],
      usage: { prompt_tokens: 50, completion_tokens: 5 },
    }),
    { status: 200 },
  )

const finalResponse = (content: string) =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content } }],
      usage: { prompt_tokens: 60, completion_tokens: 20 },
    }),
    { status: 200 },
  )

const PROVIDER_URL = 'https://example.test/v1/chat/completions'
const provider = { url: PROVIDER_URL, apiKey: 'k', model: 'm', tools: true }
const msgs = [{ role: 'user' as const, content: 'Does NCT12345678 exist?' }]

// Route model-provider calls to a scripted queue of model responses; any other
// fetch (a real grounding tool reaching out to PubMed/etc.) gets a benign stub so
// it never consumes a scripted model response.
function wireFetch(fetchMock: ReturnType<typeof vi.fn>, modelResponses: Response[]) {
  let i = 0
  fetchMock.mockImplementation(async (url: unknown) => {
    if (String(url).startsWith('https://example.test')) {
      return modelResponses[i++] ?? finalResponse('(exhausted)')
    }
    return new Response(JSON.stringify({ result: 'stub tool output' }), { status: 200 })
  })
}

describe('runOpenAiCompatAgent onTool progress', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('invokes onTool with each tool name before resolving the answer', async () => {
    wireFetch(fetchMock, [toolCallResponse('search_clinical_trials'), finalResponse('NCT12345678 is a real trial.')])
    const seen: string[] = []

    const r = await runOpenAiCompatAgent(provider, 'sys', msgs, { onTool: (n) => seen.push(n) })

    expect(r.ok).toBe(true)
    expect(r.text).toBe('NCT12345678 is a real trial.')
    expect(seen).toEqual(['search_clinical_trials'])
  })

  it('does not fire onTool when grounding tools are disabled', async () => {
    wireFetch(fetchMock, [finalResponse('Direct answer.')])
    const seen: string[] = []

    const r = await runOpenAiCompatAgent(provider, 'sys', msgs, { disableTools: true, onTool: (n) => seen.push(n) })

    expect(r.text).toBe('Direct answer.')
    expect(seen).toEqual([])
  })

  it('a throwing onTool never breaks the loop', async () => {
    wireFetch(fetchMock, [toolCallResponse('search_pubmed'), finalResponse('Answer despite a bad callback.')])

    const r = await runOpenAiCompatAgent(provider, 'sys', msgs, {
      onTool: () => {
        throw new Error('boom')
      },
    })

    expect(r.ok).toBe(true)
    expect(r.text).toBe('Answer despite a bad callback.')
  })
})
