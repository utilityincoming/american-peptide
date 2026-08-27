# AmericanPeptide.com

## Project Overview
AI-powered peptide drug discovery research platform.
Next.js 15 + TypeScript + Tailwind CSS + App Router.

## Tech Stack
- Framework: Next.js 15 with App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Charts: Recharts
- Icons: Lucide React
- AI: two-tier provider ladder on /api/chat — Venice AI (uncensored, primary) →
  Anthropic Claude (claude-opus-4-8, reasoning backup) → published reference floor.
  Both are raw fetch (no SDK). Venice speaks OpenAI's wire format; the translation
  lives in src/lib/providers/venice.ts. Grounding tools (PubChem/ClinicalTrials/
  PubMed/UniProt, src/lib/agent-tools.ts) are provider-neutral and shared by both.
  The Anthropic path uses adaptive thinking + cached system blocks; Venice sends
  the same system content as one uncached string. Structured routes
  (/api/analyze-peptide, /api/jobs/fact-qa) stay on Claude.

## Architecture
- src/app/ — pages and API routes
- src/components/ — reusable React components
- src/lib/ — utility functions and API helpers

## Coding Conventions
- Functional React components with hooks
- Server components by default, 'use client' only when needed
- async/await, never .then() chains
- Environment variables in .env.local, never hardcoded

## External APIs (all free, no keys required)
- PubChem: https://pubchem.ncbi.nlm.nih.gov/rest/pug/
- UniProt: https://rest.uniprot.org/
- ClinicalTrials.gov: https://clinicaltrials.gov/api/v2/
- PubMed E-utilities: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/

## Key Constraint
This is a research platform, NOT a medical device. All AI outputs are computational hypotheses requiring validation. Include disclaimers on user-facing pages.
