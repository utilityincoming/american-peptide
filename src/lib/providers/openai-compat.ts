// Shared agent loop for OpenAI-compatible chat-completions providers (Venice,
// xAI Grok). These speak OpenAI's wire format, not Anthropic's, so this module
// owns the translation and nothing else in the app has to care:
//   • system prompt  → a leading { role:'system' } message (no ephemeral cache)
//   • tool defs      → OpenAI { type:'function', function:{…} } (from AGENT_TOOLS)
//   • tool calls     → message.tool_calls[] with a JSON-STRING `arguments`
//   • tool results   → { role:'tool', tool_call_id, content } turns
//   • stop signal    → choices[0].finish_reason === 'tool_calls'
//
// The grounding tools themselves (executeAgentTool) are provider-neutral — a
// name + input object in, a string out — so they are reused verbatim.

import { AGENT_TOOLS, executeAgentTool } from '@/lib/agent-tools'

const MAX_TOKENS = 8000 // parity with the Anthropic path
const MAX_TOOL_ROUNDS = 5 // cap the agentic loop
const TIMEOUT_MS = 60000 // abort a hung upstream so the route can fail over

// AGENT_TOOLS is Anthropic-shaped ({ name, description, input_schema }); these
// providers want OpenAI's ({ type:'function', function:{ name, description, parameters } }).
const OAI_TOOLS = AGENT_TOOLS.map((t) => ({
  type: 'function' as const,
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}))

type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }

type OaiMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string }

interface OaiResponse {
  usage?: { prompt_tokens?: number; completion_tokens?: number }
  choices?: { finish_reason?: string; message?: { content?: string | null; tool_calls?: ToolCall[] } }[]
}

export interface OaiAgentResult {
  ok: boolean
  status: number
  text?: string
  stop?: string
  errorText?: string
  /** Concatenated grounding-tool outputs from this turn, so the route's
   *  identifier guardrail knows which NCT/CID/PMID/accession were actually
   *  looked up (vs confabulated by the model). */
  toolText?: string
  /** Tokens billed across every round of this run (for spend metering). */
  usage: { input: number; output: number }
}

export interface OaiProvider {
  /** Full chat-completions URL. */
  url: string
  apiKey: string
  model: string
  /** Send the grounding tools (false for a model without function calling). */
  tools: boolean
  /** Provider-specific fields merged into every request body. */
  extraBody?: Record<string, unknown>
}

export interface OaiAgentOpts {
  /** Omit the grounding tools so the model must answer from its own knowledge
   *  + the injected system context. Mirrors the Anthropic path's disableTools;
   *  used by the eval's grounding-off A/B arm. */
  disableTools?: boolean
}

/**
 * Run the agentic loop against one OpenAI-compatible model. `systemText` is the
 * full, already-composed system prompt (instruction prompt + site index + any
 * per-request suffix blocks, concatenated by the caller — these providers have
 * no cached-block concept). `userMessages` is the cleaned user/assistant history.
 */
export async function runOpenAiCompatAgent(
  provider: OaiProvider,
  systemText: string,
  // Accept the route's cleaned message shape (content is typed `unknown` there,
  // though cleaning guarantees a string); coerce to string when we build the wire
  // messages so an odd content value can never break the request.
  userMessages: { role: 'user' | 'assistant'; content: unknown }[],
  opts: OaiAgentOpts = {},
): Promise<OaiAgentResult> {
  const usage = { input: 0, output: 0 }
  const useTools = provider.tools && !opts.disableTools
  const messages: OaiMessage[] = [
    { role: 'system', content: systemText },
    ...userMessages.map((m) => ({ role: m.role, content: String(m.content ?? '') })),
  ]
  // Accumulate tool outputs across rounds — the grounded-identifier allow-set.
  const toolTexts: string[] = []

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    // On the final round forbid tools so the model must commit to prose instead
    // of opening a tool call it will never get to answer.
    const forceText = round === MAX_TOOL_ROUNDS - 1

    let res: Response
    try {
      res = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
        body: JSON.stringify({
          model: provider.model,
          max_tokens: MAX_TOKENS,
          messages,
          ...(useTools ? { tools: OAI_TOOLS, tool_choice: forceText ? 'none' : 'auto' } : {}),
          ...(provider.extraBody ?? {}),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (err) {
      // Network error / client-side timeout — no HTTP response. status 0 tells
      // the caller this was a transport failure so it can fail over.
      return { ok: false, status: 0, errorText: err instanceof Error ? err.message : 'network error', usage }
    }

    const raw = await res.text()
    if (!res.ok) return { ok: false, status: res.status, errorText: raw, usage }

    let data: OaiResponse
    try {
      data = JSON.parse(raw) as OaiResponse
    } catch {
      return { ok: false, status: 502, errorText: 'Malformed upstream response', usage }
    }
    usage.input += data.usage?.prompt_tokens ?? 0
    usage.output += data.usage?.completion_tokens ?? 0

    const choice = data.choices?.[0]
    const msg = choice?.message
    const finish = choice?.finish_reason

    if (finish === 'tool_calls' && Array.isArray(msg?.tool_calls) && msg.tool_calls.length) {
      // Echo the assistant turn (with its tool_calls) back into history, then
      // answer each call with a role:"tool" message keyed by tool_call_id. Providers
      // can return several tool calls at once, so resolve them all before looping.
      messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: msg.tool_calls })
      for (const tc of msg.tool_calls) {
        let input: Record<string, unknown> = {}
        try {
          input = JSON.parse(tc.function?.arguments || '{}') as Record<string, unknown>
        } catch {
          // Malformed arguments — hand the tool an empty input; its executor
          // returns a "no result" string rather than throwing.
        }
        const { content } = await executeAgentTool(tc.function?.name, input)
        toolTexts.push(content)
        messages.push({ role: 'tool', tool_call_id: tc.id, content })
      }
      continue
    }

    const text = typeof msg?.content === 'string' ? msg.content.trim() : ''
    return { ok: true, status: res.status, text, stop: finish, toolText: toolTexts.join('\n'), usage }
  }

  // Ran out of tool rounds without a text answer.
  return { ok: false, status: 504, errorText: 'exhausted tool rounds', usage }
}
