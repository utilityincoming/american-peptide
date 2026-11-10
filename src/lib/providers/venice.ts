// Venice AI runner — the uncensored, OpenAI-compatible primary agent path.
//
// Venice is the primary because its uncensored models answer the dosing/protocol
// research questions Claude's policy layer refuses; the route falls through to
// the next provider only when this runner errors or comes back empty. The wire
// translation and agent loop live in ./openai-compat (shared with Grok).

import { runOpenAiCompatAgent, type OaiAgentResult, type OaiAgentOpts } from './openai-compat'

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

export type VeniceResult = OaiAgentResult

export async function runVeniceAgent(
  systemText: string,
  userMessages: { role: 'user' | 'assistant'; content: unknown }[],
  opts: OaiAgentOpts = {},
): Promise<VeniceResult> {
  const apiKey = process.env.VENICE_API_KEY
  if (!apiKey) {
    return { ok: false, status: 500, errorText: 'VENICE_API_KEY not configured', usage: { input: 0, output: 0 } }
  }
  return runOpenAiCompatAgent(
    {
      url: VENICE_URL,
      apiKey,
      model: MODEL,
      tools: TOOLS_ENABLED,
      extraBody: {
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
      },
    },
    systemText,
    userMessages,
    opts,
  )
}
