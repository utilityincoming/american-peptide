// xAI Grok runner — the second rung of the agent's provider ladder.
//
// The ladder is ordered by cost per search: Venice (cheapest) → Grok → the
// Anthropic chain (most expensive) → the model-free reference floor. Grok sits
// between them so a Venice outage degrades to a mid-priced model instead of
// jumping straight to Opus.
//
// xAI's API is OpenAI-compatible, so the wire translation and agent loop are
// shared with Venice (./openai-compat). Within Grok there is a model chain too,
// also cheapest-first: GROK_MODELS is tried in order and the first model that
// returns an answer wins.

import { runOpenAiCompatAgent, type OaiAgentResult, type OaiAgentOpts } from './openai-compat'

const BASE_URL = (process.env.GROK_BASE_URL?.trim() || 'https://api.x.ai/v1').replace(/\/$/, '')
const GROK_URL = `${BASE_URL}/chat/completions`
const TOOLS_ENABLED = process.env.GROK_TOOLS !== 'off'

// Cheapest first. Override with GROK_MODELS (comma-separated) — model ids and
// prices change; check https://docs.x.ai/docs/models and keep the cheaper id
// first. A wrong/retired id is harmless: it fails and the chain moves on.
const DEFAULT_MODELS = ['grok-4.3', 'grok-4.7']

export function grokModels(raw = process.env.GROK_MODELS): string[] {
  const list = (raw ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
  return [...new Set(list.length ? list : DEFAULT_MODELS)]
}

export interface GrokResult extends OaiAgentResult {
  /** The model that produced the answer (or the last one tried). */
  model?: string
}

/**
 * Try each Grok model in cost order. Advance on any failure or empty answer
 * except an auth failure (401/403), which every model would repeat. Token usage
 * is summed across attempts so metering reflects what was actually billed.
 */
export async function runGrokAgent(
  systemText: string,
  userMessages: { role: 'user' | 'assistant'; content: unknown }[],
  opts: OaiAgentOpts = {},
): Promise<GrokResult> {
  const usage = { input: 0, output: 0 }
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) return { ok: false, status: 500, errorText: 'XAI_API_KEY not configured', usage }

  let last: GrokResult = { ok: false, status: 502, errorText: 'No Grok model responded', usage }
  for (const model of grokModels()) {
    const r = await runOpenAiCompatAgent(
      { url: GROK_URL, apiKey, model, tools: TOOLS_ENABLED },
      systemText,
      userMessages,
      opts,
    )
    usage.input += r.usage.input
    usage.output += r.usage.output
    last = { ...r, usage, model }
    if (r.ok && r.text) return last
    if (r.status === 401 || r.status === 403) break
    console.warn(`[chat] grok model ${model} gave no answer (${r.status}); trying next in chain`)
  }
  return last
}
