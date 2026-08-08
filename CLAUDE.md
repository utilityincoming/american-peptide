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
- AI: Anthropic Claude API (claude-opus-4-8; raw fetch, no SDK). Research agent at
  /api/chat uses adaptive thinking + grounding tools (PubChem/ClinicalTrials/PubMed)
  via src/lib/agent-tools.ts. Static system prompts are sent as cached blocks.

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
