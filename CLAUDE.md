# AmericanPeptide.com

## Project Overview
AI-powered peptide drug discovery research platform.
Next.js 16 + TypeScript + Tailwind CSS + App Router.

## Tech Stack
- Framework: Next.js 16 with App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Charts: Recharts
- Icons: Lucide React
- AI: provider ladder on /api/chat, ordered by cost per search — Venice AI
  (uncensored, primary) → xAI Grok (GROK_MODELS, cheapest model first) →
  Anthropic Claude (claude-opus-4-8, reasoning backup) → published reference
  floor. All raw fetch (no SDK). Venice and Grok speak OpenAI's wire format; the
  shared translation + agent loop is src/lib/providers/openai-compat.ts, with thin
  wrappers in venice.ts and grok.ts. Grounding tools (PubChem/ClinicalTrials/
  PubMed/UniProt, src/lib/agent-tools.ts) are provider-neutral and shared by all.
  The Anthropic path uses adaptive thinking + cached system blocks; Venice and
  Grok get the same system content as one uncached string. Structured routes
  (/api/analyze-peptide, /api/jobs/fact-qa) stay on Claude.

- Spend safeguards: /api/chat and /api/analyze-peptide only serve same-origin
  browsers and go through src/lib/agent-quota.ts — 5 free uses per visitor per
  UTC day (HTTP 402 when spent), a per-IP cap, and a site-wide daily ceiling on
  free runs that degrades to reference content. The paid Research Pass ($15
  for 30 days, no daily limit) lives in src/lib/agent-pass.ts: Stripe Checkout
  by raw fetch, no accounts — a verified payment becomes an access code held in
  the ap_pass cookie (/research/pass, /api/pass/*). Usage is metered there and exposed at
  GET /api/admin/usage. Automation (npm run eval) sends `x-agent-key`.

## Architecture
- src/app/ — pages and API routes
- src/components/ — reusable React components
- src/lib/ — utility functions and API helpers

## Coding Conventions
- Functional React components with hooks
- Server components by default, 'use client' only when needed
- async/await, never .then() chains
- Environment variables in .env.local, never hardcoded
- State machines are explicit. A flow with more than two interdependent flags
  (loading/error/result, multi-step, anything involving payment) is a pure
  reducer over a discriminated union in src/lib/*-flow.ts, with the transition
  diagram in the file header, selectors for what the page renders, and a
  *.test.ts. Components hold it in useReducer and only dispatch events; fetches
  live in a sibling *-client.ts and never throw. Reference: src/lib/pass-flow.ts
  (Research Pass + agent access, used by /research and /research/pass).
- API errors carry a machine-readable `code` next to the human `error`
  (e.g. quota_exhausted, capacity, unpaid, invalid, expired, unavailable).

## External APIs (all free, no keys required)
- PubChem: https://pubchem.ncbi.nlm.nih.gov/rest/pug/
- UniProt: https://rest.uniprot.org/
- ClinicalTrials.gov: https://clinicaltrials.gov/api/v2/
- PubMed E-utilities: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/

## Key Constraint
This is a research platform, NOT a medical device. All AI outputs are computational hypotheses requiring validation. Include disclaimers on user-facing pages.
