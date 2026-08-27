// Venice AI runner — the uncensored, OpenAI-compatible primary agent path.
//
// Venice speaks OpenAI's wire format, not Anthropic's, so this module owns the
// translation and nothing else in the app has to care:
//   • system prompt  → a leading { role:'system' } message (no ephemeral cache)
//   • tool defs      → OpenAI { type:'function', function:{…} } (from AGENT_TOOLS)
//   • tool calls     → message.tool_calls[] with a JSON-STRING `arguments`
//   • tool results   → { role:'tool', tool_call_id, content } turns
//   • stop signal    → choices[0].finish_reason === 'tool_calls'
//
// The grounding tools themselves (executeAgentTool) are provider-neutral — a
// name + input object in, a string out — so they are reused verbatim. Venice is
// the primary because its uncensored models answer the dosing/protocol research
// questions Claude's policy layer refuses; the route falls through to the
// Anthropic chain only when this runner errors or comes back empty.

import { AGENT_TOOLS, executeAgentTool } from '@/lib/agent-tools'

// Base URL is configurable (VENICE_BASE_URL) so a proxy / gateway can be dropped
// in without a code change; default to Venice's public v1 endpoint.
const BASE_URL = (process.env.VENICE_BASE_URL?.trim() || 'https://api.venice.ai/api/v1').replace(/\/$/, '')
const VENICE_URL = `${BASE_URL}/chat/completions`
// Override with VENICE_MODEL. venice-uncensored-1-2 supports function calling;
// if you switch to a model that does not, set VENICE_TOOLS=off (see below).
const MODEL = process.env.VENICE_MODEL?.trim() || 'qwen-3-8-27b'
const TOOLS_ENABLED = process.env.VENICE_TOOLS !== 'off'
// Reasoning ("thinking") models emit a separate reasoning stream that shares the
// max_tokens budget — a verbose chain can starve the visible answer to empty
// (finish_reason=length, content=''). Set VENICE_DISABLE_THINKING=1 to turn that
// off for faster/cheaper turns with no starvation risk. Harmless on non-reasoning
// models (Venice ignores the flag).
const DISABLE_THINKING = process.env.VENICE_DISABLE_THINKING === '1'

const MAX_TOKENS = 8000 // parity with the Anthropic path
const MAX_TOOL_ROUNDS = 5 // cap the agentic loop
const TIMEOUT_MS = 60000 // abort a hung upstream so the route can fail over

// AGENT_TOOLS is Anthropic-shaped ({ name, description, input_schema }); Venice
// wants OpenAI's ({ type:'function', function:{ name, description, parameters } }).
const VENICE_TOOLS = AGENT_TOOLS.map((t) => ({
  type: 'function' as const,
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}))

type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }

type OaiMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string }

interface OaiResponse {
  choices?: { finish_reason?: string; message?: { content?: string | null; tool_calls?: ToolCall[] } }[]
}

export interface VeniceResult {
  ok: boolean
  status: number
  text?: string
  stop?: string
  errorText?: string
  /** Concatenated grounding-tool outputs from this turn, so the route's
   *  identifier guardrail knows which NCT/CID/PMID/accession were actually
   *  looked up (vs confabulated by the model). */
  toolText?: string
}

interface VeniceOpts {
  /** Omit the grounding tools so the model must answer from its own knowledge
   *  + the injected system context. Mirrors the Anthropic path's disableTools;
   *  used by the eval's grounding-off A/B arm. */
  disableTools?: boolean
}

/**
 * Run the agentic loop against Venice. `systemText` is the full, already-composed
 * system prompt (instruction prompt + site index + any per-request suffix blocks,
 * concatenated by the caller — Venice has no cached-block concept). `userMessages`
 * is the cleaned user/assistant history.
 */
export async function runVeniceAgent(
  systemText: string,
  // Accept the route's cleaned message shape (content is typed `unknown` there,
  // though cleaning guarantees a string); coerce to string when we build the wire
  // messages so an odd content value can never break the request.
  userMessages: { role: 'user' | 'assistant'; content: unknown }[],
  opts: VeniceOpts = {},
): Promise<VeniceResult> {
  const apiKey = process.env.VENICE_API_KEY
  if (!apiKey) return { ok: false, status: 500, errorText: 'VENICE_API_KEY not configured' }

  const useTools = TOOLS_ENABLED && !opts.disableTools
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
      res = await fetch(VENICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages,
          ...(useTools ? { tools: VENICE_TOOLS, tool_choice: forceText ? 'none' : 'auto' } : {}),
          venice_parameters: {
            // Our tuned prompt is authoritative — don't let Venice prepend its
            // own persona/system prompt on top of it.
            include_venice_system_prompt: false,
            // We ground through our own tools + injected facts; keep Venice's
            // native web search out of it so citations stay verifiable.
            enable_web_search: 'off',
            // Optionally suppress reasoning so it can't starve the answer.
            ...(DISABLE_THINKING ? { disable_thinking: true } : {}),
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (err) {
      // Network error / client-side timeout — no HTTP response. status 0 tells
      // the route this was a transport failure so it can fall over to Anthropic.
      return { ok: false, status: 0, errorText: err instanceof Error ? err.message : 'network error' }
    }

    const raw = await res.text()
    if (!res.ok) return { ok: false, status: res.status, errorText: raw }

    let data: OaiResponse
    try {
      data = JSON.parse(raw) as OaiResponse
    } catch {
      return { ok: false, status: 502, errorText: 'Malformed upstream response' }
    }

    const choice = data.choices?.[0]
    const msg = choice?.message
    const finish = choice?.finish_reason

    if (finish === 'tool_calls' && Array.isArray(msg?.tool_calls) && msg.tool_calls.length) {
      // Echo the assistant turn (with its tool_calls) back into history, then
      // answer each call with a role:"tool" message keyed by tool_call_id. Venice
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
    return { ok: true, status: res.status, text, stop: finish, toolText: toolTexts.join('\n') }
  }

  // Ran out of tool rounds without a text answer.
  return { ok: false, status: 504, errorText: 'exhausted tool rounds' }
}
