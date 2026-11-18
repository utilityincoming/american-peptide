# Provider ladder
> How /api/chat picks an AI provider, cheapest-capable first.
Updated: 2026-11-18

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

Venice and Grok get the system content as one uncached string; the Anthropic
path caches it. Structured routes (`/api/analyze-peptide`, `/api/jobs/fact-qa`)
stay on Claude, not the ladder.

## Open question
- Does the #187 usage/tools/model rework change fallthrough behavior? Verify.
