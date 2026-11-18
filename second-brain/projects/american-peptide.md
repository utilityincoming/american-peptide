# American Peptide (americanpeptide.com)
> AI-powered peptide drug discovery research platform (Next.js 16 + TS).
Status: active
Updated: 2026-11-18

## Goal
A research platform where visitors run AI-grounded peptide analyses, backed by a
cost-tiered provider ladder and spend safeguards, monetized via a $15 Research
Pass. Not a medical device — all outputs are computational hypotheses.

## Where I paused
Core platform is live and iterating. Recent merged work:
- #189 — added this second-brain knowledge base.
- #188 — Ahrefs Web Analytics in the site head.
- #187 — closed the agent gap across usage, tools, and model changes.
- #185 — removed Paramount Peptides from the user-facing sourcing layer.
- #184 — explicit state-machine refactor for the Research Pass / agent-access flow.

## Next step
_(Decide the next priority — candidates below are placeholders, not commitments.)_
- Confirm the provider ladder (Venice → Grok → Claude → reference floor) is
  behaving under the new usage/tools/model wiring from #187.
- Keep monographs filling (cf. #181 eloralintide).

## Architecture quick-ref
- Provider ladder + agent loop: `src/lib/providers/openai-compat.ts`
  (wrappers `venice.ts`, `grok.ts`); grounding tools `src/lib/agent-tools.ts`.
- Spend safeguards: `src/lib/agent-quota.ts`; Research Pass: `src/lib/agent-pass.ts`,
  flow `src/lib/pass-flow.ts`.
- Structured routes stay on Claude: `/api/analyze-peptide`, `/api/jobs/fact-qa`.

## Log
- 2026-11-18 — seeded this file from repo history while setting up the second brain.
