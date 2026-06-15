// ── Anthropic model selection + failover ─────────────────────────────────────
//
// Every Anthropic call in this app goes through the same ordered failover chain:
// the first model that responds wins; on a *retryable* upstream failure (model
// unavailable, overload, rate limit, timeout, 5xx) the caller advances to the
// next model. This is what keeps the Peptide Agent up if a single model is
// temporarily unavailable — which is exactly how it went down when the account
// lost access to claude-fable-5.
//
// Chain is verified against the live API to accept the full param surface this
// app uses — adaptive thinking, output_config.effort, tools, and json_schema
// structured output — so any link can serve any route. claude-haiku-4-5 is
// intentionally excluded: it rejects adaptive thinking + effort (400). Override
// the primary at runtime with AGENT_MODEL without touching the fallbacks.

const PRIMARY = process.env.AGENT_MODEL?.trim() || 'claude-opus-4-8'

// Ordered: primary first, then fallbacks. De-duped so an AGENT_MODEL override
// that matches a fallback doesn't try the same model twice.
export const MODELS: string[] = [
  ...new Set([PRIMARY, 'claude-opus-4-8', 'claude-sonnet-4-6']),
]

/**
 * Whether an upstream HTTP status warrants trying the next model in the chain.
 * Retry "the model is gone / busy / the server hiccuped" (404, 408, 409, 425,
 * 429, 529, 5xx) and transport-level failures (status 0 = network error or
 * client-side timeout, which the caller maps to 0). Do NOT retry "this exact
 * request is wrong" (400 invalid body, 401/403 auth) — the next model would
 * reject it identically.
 */
export function shouldFailover(status: number): boolean {
  return (
    status === 0 || // network error / client timeout (no HTTP response)
    status === 404 || // unknown / unavailable model
    status === 408 || // request timeout
    status === 409 || // conflict
    status === 425 || // too early
    status === 429 || // rate limited
    status === 529 || // overloaded
    status >= 500 // upstream server error
  )
}
