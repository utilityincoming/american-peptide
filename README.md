<div align="center">

# AmericanPeptide.com

**An AI-grounded research reference for peptides — a trust layer, not a store.**

Browse a cited catalog, compare peptides, read a Certificate of Analysis, and ask
an agent that grounds answers in PubChem, ClinicalTrials.gov, PubMed, and UniProt.
Catalog copy is research-framed and licensed CC BY 4.0.

[Live site](https://americanpeptide.com) · [Research agent](https://americanpeptide.com/research) · [Research Workspace](https://americanpeptide.com/research-workspace) · [Developers](https://americanpeptide.com/developers)

![Next.js](https://img.shields.io/badge/Next.js-16.4-000?logo=next.js) ![React](https://img.shields.io/badge/React-19.3-149eca?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss) ![License: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)

</div>

> [!IMPORTANT]
> **Research and educational reference only — not a medical device, not medical advice, and not a store.**
> Every AI output is a computational hypothesis requiring validation. Peptide profiles,
> reference figures, and mechanisms are framed for laboratory research, not human
> use. User-facing pages carry this disclaimer and a research-use gate. The sourcing
> score is a transparency checklist. The site does not sell placement.

---

## Where to go

| Area | Open |
|---|---|
| Catalog | `/catalog`, `/catalog/[slug]`, `/research-areas`, `/glossary`, `/synthesis`, `/methodology` |
| Editorial comparisons | `/compare`, `/compare/[pair]` |
| Research Workspace | `/research-workspace` — live compare of 2–4 peptides, ClinicalPulse, PeptideForge |
| Bench tools | `/tools/reconstitution-calculator`, `/tools/coa-decoder`, `/tools/design-lab`, `/tools/lab` |
| Peptide Agent | `/research`, `/research/pass` |
| Developers | `/developers`, `GET /api/v2/catalog`, `POST /api/mcp` |

PeptideForge, the residue-by-residue builder, is `/compounds/builder`. Design Lab at `/tools/design-lab` is the sequence property bench. They are different pages. `/catalog/compare` remains as an older side-by-side view; new editorial pairs live under `/compare`.

## What it is

- **Catalog** — mechanisms, sequences, storage and synthesis notes, and per-compound FAQs. No fabricated supplier or price data. Sourcing lives in the trust-ranked directory.
- **Peptide Agent** — Venice AI, then xAI Grok, then Anthropic Claude, ordered by cost, with live grounding. Free visitors get 5 searches per UTC day. A Research Pass defaults to $15 for 30 days (`AGENT_PASS_PRICE_CENTS`, overridable).
- **Tools** — reconstitution and blend calculators, COA decoder, Design Lab, lab tools (batch COA, keyed catalog feed, sourcing intake), and the Research Workspace. Bench calculators install as an offline PWA.

## How the Peptide Agent is grounded

The agent (`src/lib/agent-tools.ts`, served at `/api/chat`) calls free, key-less scientific APIs and cites them:

| Tool | Source |
|---|---|
| `search_pubchem` | [PubChem](https://pubchem.ncbi.nlm.nih.gov/) — chemical identity, mass, formula |
| `search_uniprot` | [UniProt](https://www.uniprot.org/) — protein and sequence data |
| `search_clinical_trials` | [ClinicalTrials.gov v2](https://clinicaltrials.gov/) — trial status and endpoints |
| `search_pubmed` | [PubMed E-utilities](https://www.ncbi.nlm.nih.gov/pmc/tools/developers/) — literature |

Provider order and failover live in `src/app/api/chat`. Claude's model chain is in `src/lib/models.ts`. `AGENT_MODEL` overrides the Anthropic primary. `/api/analyze-peptide` and `/api/jobs/fact-qa` stay on Claude.

## Remote MCP server

```
https://americanpeptide.com/api/mcp
```

Streamable HTTP. The tools reuse the catalog and the same grounding executors as the on-site agent. Results include canonical URLs and CC BY 4.0 attribution.

## Data and schema

Monographs emit Schema.org `MolecularEntity`, `Dataset`, `BreadcrumbList`, and `FAQPage` built only from questions already on the page. Interactive tools emit `WebApplication`. The Dataset license is CC BY 4.0 and the creator is AmericanPeptide.com. The markup describes a research reference. It does not describe a product for sale. Builders live in `src/lib/schema.ts`.

## Tech stack

- **Framework:** Next.js 16.4 (App Router, Turbopack) · React 19.3 · TypeScript (strict)
- **Styling:** Tailwind CSS v4 · Lucide icons · Recharts
- **AI:** Venice, xAI Grok, and Anthropic Claude via raw `fetch` (no SDK)
- **MCP:** `mcp-handler` (Streamable HTTP)
- **Storage:** Upstash Redis (REST) for rate limiting, API keys, and usage, with an in-memory fallback for local dev
- **Analytics:** Vercel Analytics, Speed Insights, optional GA4
- **Docs/PDF:** `react-markdown` + `remark-gfm` · `pdfjs-dist`

## Quick start

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/utilityincoming/american-peptide.git
cd american-peptide
npm install
cp .env.example .env.local   # only needed for the agent, Stripe, Redis, or analytics
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Browsing, the catalog, and the bench tools run with no keys. The Peptide Agent needs the provider keys named in [`.env.example`](.env.example) (Venice, xAI, and Anthropic). Redis, Stripe, and GA are optional and degrade in local dev.

## Environment variables

Full notes are in [`.env.example`](.env.example).

| Variable | Required | Purpose |
|---|---|---|
| `VENICE_API_KEY`, `XAI_API_KEY`, Anthropic key | For the agent | `/api/chat` provider ladder. Structured routes use the Anthropic key |
| `AGENT_PASS_PRICE_CENTS` | Optional | Research Pass price in cents. Code default is `1500` ($15). The example file shows another value |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Prod-recommended | Durable rate limiting, API keys, and usage |
| `ADMIN_SECRET` | Prod (admin) | Protects `GET /api/admin/usage`. Falls back to `CRON_SECRET` |
| `CRON_SECRET` | Prod (jobs) | Authorizes scheduled jobs such as `/api/jobs/fact-qa` |
| `NEXT_PUBLIC_GA_ID` | Optional | GA4 measurement ID (production only) |
| `AGENT_MODEL` / `AGENT_EFFORT` / `AGENT_DEBUG` | Optional | Anthropic model, reasoning effort, debug logging |
| `NEXT_PUBLIC_PLATFORM`, `ANDROID_PACKAGE_NAME`, `ANDROID_SHA` | Optional | Android TWA. `NEXT_PUBLIC_PLATFORM=android` drops affiliate links |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run enrich` | Pull PubChem fields into the catalog cache |
| `npm run eval` | Peptide Agent eval suite |
| `npm run audit:evidence` | Check evidence claims against the catalog |
| `npm run check:org-drift` | Check organization copy for drift |
| `npm run gsc` | Search Console report helper |

## Project structure

```
src/
├── app/
│   ├── catalog/                 # Catalog, categories, [slug] monographs
│   ├── compare/                 # Editorial head-to-head pairs
│   ├── research-workspace/      # Compare, ClinicalPulse, PeptideForge
│   ├── research/                # Peptide Agent and Research Pass
│   ├── tools/                   # Calculator, COA decoder, Design Lab, lab tools
│   ├── compounds/builder/       # PeptideForge
│   ├── developers/              # Public API and MCP docs
│   └── api/                     # chat, catalog v2, trials, keys, mcp, jobs
├── components/
└── lib/
    ├── peptides.ts              # Catalog
    ├── schema.ts · page-meta.ts # JSON-LD and featured titles
    ├── agent-tools.ts · models.ts
    ├── agent-pass.ts · agent-quota.ts
    ├── research-areas.ts · comparisons.ts · glossary.ts
    └── kv.ts · rate-limit.ts · api-keys.ts
scripts/                         # enrich, eval, evidence audit, org-drift check
```

## Deployment

Optimized for **Vercel** (Analytics, Speed Insights, and Cron). Set the variables above in project settings. An Android TWA build targets the Play Store. Set `NEXT_PUBLIC_PLATFORM=android` so affiliate links stay off that build.

## License and attribution

- **Content** (catalog copy, research summaries, glossary) is **CC BY 4.0**. Reuse it with attribution to AmericanPeptide.com. API and MCP responses include that attribution.
- **Code** is unlicensed / all rights reserved unless a `LICENSE` file says otherwise.

## Disclaimer

This project is a research and educational reference. It is **not** medical advice, **not** a medical device, and **not** an offer to sell any substance. Peptides referenced here may be regulated, investigational, or prohibited in sport. Several are not approved for human use. Follow applicable law.
