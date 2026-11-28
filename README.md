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
| Catalog comparisons and guides | `/catalog/compare`, `/compare/[pair]` |
| Research Workspace | `/research-workspace` — sequence alignment and exports, trial monitoring, residue substitutions |
| Tools directory | `/tools` |
| Peptide Agent | `/research`, `/research/pass` |
| Developers | `/developers`, `GET /api/v2/catalog`, `POST /api/mcp` |

Open **Tools** from the header for the tools directory, or **Catalog** for compound search, categories, comparisons, and Saved Workspace. **PeptideForge** (`/compounds/builder`) is the amino-acid builder with challenges. **Design Lab** (`/tools/design-lab`) calculates properties from pasted or catalog sequences. The Research Workspace retains its shared compare, trial, and substitution views.

**Compare Catalog Peptides** (`/catalog/compare`) now includes the Comparison Guides index. The former `/compare` index redirects there. Individual guides keep their `/compare/[pair]` URLs.

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

Successful lookup responses are cached for one hour for ClinicalTrials.gov, six hours for PubMed, and 24 hours for PubChem and UniProt. Upstash shares the cache across instances. A bounded local cache covers development and Redis outages. Upstream calls have timeouts and retry transient failures.

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

Browsing, the catalog, and the bench tools run with no keys. The Peptide Agent requires at least one provider key. Redis, Stripe, and GA can be left blank for local browsing.

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` for Next.js. Standalone scripts read exported environment variables. The example lists all overrides and defaults.

| Variables | Use |
|---|---|
| `VENICE_API_KEY`, `XAI_API_KEY`, `ANTHROPIC_API_KEY` | Chat tries Venice, then xAI Grok, then Anthropic. It skips unconfigured providers and falls back to published references if configured providers fail. Anthropic also powers structured analysis, optional LLM fact QA, and the eval judge. |
| `VENICE_BASE_URL`, `VENICE_MODEL`, `VENICE_TOOLS`, `VENICE_DISABLE_THINKING` | Optional Venice settings. Default model is `qwen-3-6-plus`, with grounding tools enabled. |
| `GROK_BASE_URL`, `GROK_MODELS`, `GROK_TOOLS` | Optional xAI settings. Defaults try `grok-4.3` then `grok-4.7`, with grounding tools enabled. |
| `AGENT_MODEL`, `AGENT_EFFORT`, `AGENT_DEBUG` | Anthropic defaults to `claude-opus-4-8` then `claude-sonnet-4-6`. Chat effort defaults to `medium`. Debug logging is off. |
| `AGENT_FREE_DAILY`, `AGENT_IP_DAILY_MAX`, `AGENT_DAILY_CEILING`, `AGENT_QUOTA`, `AGENT_BYPASS_KEY` | Optional quota and eval settings. Defaults are 5 requests per visitor, 3× the visitor allowance per IP, and 1,200 free model runs across both routes per UTC day. The bypass key falls back to `ADMIN_SECRET`. |
| `STRIPE_SECRET_KEY`, `STRIPE_API_BASE`, `AGENT_PASS_PRICE_CENTS`, `AGENT_PASS_DAYS`, `AGENT_PASS_DAILY_MAX` | Stripe key enables paid checkout. Defaults are 1,500 cents ($15), 30 days, and 200 runs per pass per UTC day. The Stripe base URL defaults to `https://api.stripe.com`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Set both for production-wide limits, quotas, metering, API keys, and lookup caching. Local fallback is per instance. Production logs a warning if either is missing. |
| `ADMIN_SECRET`, `CRON_SECRET` | Required for the respective production admin and scheduled job endpoints. Admin endpoints can use `CRON_SECRET` when `ADMIN_SECRET` is unset. |
| `NEXT_PUBLIC_PLATFORM`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_REDIRECT_ORIGIN`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL` | Optional build-time settings for the Android TWA, GA4, affiliate redirect origin, and public contact details. Set `NEXT_PUBLIC_PLATFORM=android` for the affiliate-free Play build. |
| `ANDROID_PACKAGE_NAME`, `ANDROID_SHA256_FINGERPRINTS` | Digital Asset Links for the TWA. The default package is `com.americanpeptide.calculator`. Supply comma-separated signing certificate fingerprints to verify app links. |
| `REFERRAL_POSTBACK_SECRET_<VENDOR_ID>` | Required only for a partner's signed conversion postbacks. |
| `ORG_DIR`, `GSC_SITE_URL`, `GSC_SA_KEY_FILE`, `CATALOG_SMOKE_ORIGIN`, `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, `CATALOG_REPORT_COMPLETENESS` | CLI and test settings. The drift check defaults to the sibling `american-peptide-org` checkout. Search Console reporting requires a service-account file and a property URL. |
| `NODE_ENV`, `VITEST`, `GITHUB_STEP_SUMMARY`, `PORT` | Supplied by the framework, test runner, CI, or screenshot script. |

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
│   ├── compare/                 # Editorial comparison guide detail pages
│   ├── research-workspace/      # Alignment, exports, trial monitor, substitutions
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
- **Code** is all rights reserved except where a file or accompanying notice grants a separate license. See [LICENSE](LICENSE) for scope and attribution.

## Disclaimer

This project is a research and educational reference. It is **not** medical advice, **not** a medical device, and **not** an offer to sell any substance. Peptides referenced here may be regulated, investigational, or prohibited in sport. Several are not approved for human use. Follow applicable law.
