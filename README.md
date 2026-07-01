<div align="center">

# AmericanPeptide.com

**An AI-grounded research reference for peptides — a trust layer, not a store.**

Browse a curated catalog of 56 research peptides, ask a Claude-powered agent that
grounds every answer in PubChem, ClinicalTrials.gov, PubMed & UniProt, decode a
Certificate of Analysis, and run bench calculators offline. All content is
research-framed and openly licensed (CC BY 4.0) so it stays useful wherever it travels.

[Live site](https://www.americanpeptide.com) · [Research agent](https://www.americanpeptide.com/research) · [Remote MCP](https://www.americanpeptide.com/api/mcp) · [Developers](https://www.americanpeptide.com/developers)

![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=next.js) ![React](https://img.shields.io/badge/React-19-149eca?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss) ![License: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)

</div>

> [!IMPORTANT]
> **Research and educational reference only — not a medical device, not medical advice, and not a store.**
> Every AI output is a computational hypothesis requiring validation. Peptide profiles,
> dosing reference figures, and mechanisms are framed for laboratory research, not human
> use. User-facing pages carry this disclaimer and a research-use gate.

---

## What it is

AmericanPeptide.com treats the domain as a **trust and authority asset** and builds a
research layer on top of a structured data layer:

- **Peptide catalog** — 56 compounds with mechanisms, key research, storage/handling,
  synthesis notes, molecular data, and per-compound FAQs. The schema is forward-compatible
  with a future marketplace (suppliers, COAs, transparent pricing) but ships as a reference,
  with no fabricated supplier or price data.
- **Peptide Agent** — a Claude research agent that thinks adaptively and grounds claims in
  live scientific sources rather than model memory.
- **Remote MCP server** — connect the whole catalog + grounding tools into Claude, ChatGPT,
  Cursor, or any MCP client.
- **Bench tools** — reconstitution & blend calculators, a COA decoder, and a design lab,
  installable as an offline PWA for use at the bench.

## Feature tour

| Area | Highlights |
|---|---|
| **Catalog** | `/catalog` with category & comparison views, `/catalog/[slug]` profiles, side-by-side `/compare/[pair]`, glossary, research areas, and synthesis walkthroughs. |
| **Peptide Agent** (`/research`) | Anthropic Claude with adaptive extended thinking, a grounding toolset, streamed responses, and multi-model failover. Cited answers with canonical links. |
| **Reconstitution calculator** | Vial/dose/water solver on a U-100 syringe with a live diagram, doses-per-vial, a reference matrix, **peptide-aware autofill presets**, mg-scale presets, and shareable URLs. Works offline. |
| **COA decoder** (`/tools/coa-decoder`) | Parses a Certificate of Analysis (incl. PDF via `pdfjs-dist`) and explains what the numbers mean. |
| **Design lab & blend calculator** | Compound/blend builders under `/tools` and `/compounds`. |
| **Developer surface** | Public catalog API, issued API keys with usage metering, and a Streamable-HTTP MCP endpoint — all sharing one data + grounding core. |
| **Offline / PWA** | Service worker + offline reference so the bench tools keep working with no network. |

## How the Peptide Agent is grounded

The agent (`src/lib/agent-tools.ts`, served at `/api/chat`) can call free, key-less
scientific APIs and cite them — so answers are anchored to primary data:

| Tool | Source |
|---|---|
| `search_pubchem` | [PubChem](https://pubchem.ncbi.nlm.nih.gov/) — chemical identity, mass, formula |
| `search_uniprot` | [UniProt](https://www.uniprot.org/) — protein/sequence data |
| `search_clinical_trials` | [ClinicalTrials.gov v2](https://clinicaltrials.gov/) — trial status & endpoints |
| `search_pubmed` | [PubMed E-utilities](https://www.ncbi.nlm.nih.gov/pmc/tools/developers/) — literature |

Model selection and an ordered multi-model failover chain live in `src/lib/models.ts`, so a
single upstream outage doesn't take the agent down. The active model is configurable at
runtime via the `AGENT_MODEL` environment variable.

## Remote MCP server

Connect the catalog as a live data source from any MCP client (Streamable HTTP transport):

```
https://www.americanpeptide.com/api/mcp
```

Its tools reuse the same catalog data and grounding executors as the on-site agent, and
every result carries canonical URLs + CC BY 4.0 attribution so content that travels keeps
pointing home.

## Tech stack

- **Framework:** Next.js 15.5 (App Router, Turbopack) · React 19 · TypeScript (strict)
- **Styling:** Tailwind CSS v4 · Lucide icons · Recharts
- **AI:** Anthropic Claude via raw `fetch` (no SDK); grounding tools; static system prompts sent as cached blocks
- **MCP:** `mcp-handler` (Streamable HTTP)
- **Storage:** Upstash Redis (REST) for rate limiting, API keys & usage metering — with in-memory fallback for local dev
- **Email:** Resend (waitlist) · **Analytics:** Vercel Analytics + Speed Insights, optional GA4
- **Docs/PDF:** `react-markdown` + `remark-gfm` · `pdfjs-dist`

## Quick start

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/utilityincoming/american-peptide.git
cd american-peptide
npm install

# Configure environment
cp .env.example .env.local   # then fill in values (see below)

# Run the dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The site runs with **zero config** for browsing and the bench tools. The Peptide Agent
> needs `ANTHROPIC_API_KEY`; everything else (Redis, Resend, GA) is optional and degrades
> gracefully in local dev.

## Environment variables

Full documentation lives in [`.env.example`](.env.example). Summary:

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | For the agent | Powers `/api/chat` and `/api/analyze-peptide` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Prod-recommended | Durable rate limiting, API keys & usage metering |
| `ADMIN_SECRET` | Prod (admin) | Protects `GET /api/admin/usage`; falls back to `CRON_SECRET` |
| `CRON_SECRET` | Prod (jobs) | Authorizes scheduled jobs, e.g. `/api/jobs/fact-qa` |
| `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_FROM`, … | Optional | Waitlist email; without it, signups are logged and still succeed |
| `NEXT_PUBLIC_GA_ID` | Optional | GA4 measurement ID (production only) |
| `AGENT_MODEL` / `AGENT_EFFORT` / `AGENT_DEBUG` | Optional | Override agent model, reasoning effort, and debug logging |
| `NEXT_PUBLIC_PLATFORM`, `ANDROID_PACKAGE_NAME`, `ANDROID_SHA` | Optional | Android TWA / Play Store build (`=android` gates affiliate links) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run enrich` | Enrich the catalog from PubChem (`scripts/enrich-peptides.mjs`) |
| `npm run eval` | Run the Peptide Agent eval suite (`scripts/eval-agent.mjs`) |

## Project structure

```
src/
├── app/                  # App Router pages + API routes
│   ├── catalog/          # Catalog, category, compare, [slug] profiles
│   ├── tools/            # reconstitution / blend / calculator-beta / coa-decoder / design-lab
│   ├── research/         # Peptide Agent surface
│   ├── developers/       # Public API + MCP docs
│   └── api/              # chat, catalog, coa, pubchem, trials, keys, mcp ([transport]), jobs …
├── components/           # SiteHeader, ResearchUseGate, CommandPalette, calculators, forms …
└── lib/                  # Data + logic
    ├── peptides.ts       # The 56-compound catalog (+ peptides.pubchem.json cache)
    ├── agent-tools.ts    # Grounding tool definitions + executors
    ├── models.ts         # Claude model selection & failover
    ├── reconstitution-presets.ts
    ├── research-areas.ts · comparisons.ts · glossary.ts · synthesis.ts
    └── kv.ts · rate-limit.ts · api-keys.ts · api-auth.ts   # infra
scripts/                  # enrich-peptides, eval-agent, gen-verification, migrate-theme-tokens
```

## Deployment

Optimized for **Vercel** (Analytics, Speed Insights, and Cron are wired in). Set the
environment variables above in the project settings; Upstash and Resend both offer free
tiers. An Android **TWA** (Trusted Web Activity) build targets the Play Store from a gated
deploy — set `NEXT_PUBLIC_PLATFORM=android` to drop affiliate links for store compliance.

## License & attribution

- **Content** (catalog copy, research summaries, glossary) is licensed **CC BY 4.0** — reuse
  it with attribution back to AmericanPeptide.com. API and MCP responses embed this
  attribution automatically.
- **Code** is currently unlicensed / all rights reserved unless a `LICENSE` file states
  otherwise. Open an issue if you'd like to use it.

## Disclaimer

This project is a research and educational reference. It is **not** medical advice, **not** a
medical device, and **not** an offer to sell any substance. Peptides referenced here may be
regulated, investigational, or prohibited in sport; several are not approved for human use.
Always consult qualified professionals and follow applicable law.
