# Provider ladder
> How /api/chat picks an AI provider, cheapest-capable first.
Updated: 2026-11-18
Source: `src/app/api/chat/route.ts:432-565`

The chat agent tries providers in cost order and falls through on failure:

1. **Venice AI** — uncensored, primary. OpenAI wire format.
2. **xAI Grok** — `GROK_MODELS`, cheapest model first. OpenAI wire format.
3. **Anthropic Claude** — `claude-opus-4-8`, reasoning backup. Adaptive
   thinking + cached system blocks.
4. **Published reference floor** — static content when all providers fail or
   free capacity is exhausted.

Shared translation + agent loop: `src/lib/providers/openai-compat.ts` (thin
wrappers `venice.ts`, `grok.ts`). Grounding tools are provider-neutral
(`src/lib/agent-tools.ts`): PubChem, ClinicalTrials, PubMed, UniProt.

Venice and Grok get the system content as one uncached string (`SYSTEM_PROMPT +
SITE_INDEX + per-request suffix`); the Anthropic path uses cached blocks.
Structured routes (`/api/analyze-peptide`, `/api/jobs/fact-qa`) stay on Claude,
not the ladder.

Each rung runs only if the previous one errored or returned nothing
(`!finalText`). The whole ladder is gated by `modelsAllowed` (free allowance
reserved + site-wide daily ceiling not hit); otherwise it skips to the floor.
The reference floor **refunds the visitor's free use** — a request no model
answered doesn't cost a search (details: `reference-floor-refund.md`).

## Resolved
- 2026-11-18 — #187 ("close the agent gap between usage, tools, and model
  changes") does **not** change fallthrough ordering. The chain is still the
  straightforward "run next rung only if `!finalText`". #187 was about keeping
  quota/metering and tool wiring consistent *across* the rungs, not reordering
  them. Verified against `route.ts:432-565`.
