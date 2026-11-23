// Agent Skills published for discovery (Agent Skills Discovery RFC v0.2.0).
//
// Each skill's SKILL.md body lives here as the single source of truth: the
// SKILL.md route serves the exact bytes, and the index route hashes those same
// bytes for the `digest`, so the published digest always matches what is served.
//
// Index:  /.well-known/agent-skills/index.json
// Skills: /.well-known/agent-skills/<name>/SKILL.md

import { createHash } from 'node:crypto'
import { API_SITE } from './catalog-api'

export const AGENT_SKILLS_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json'

export interface AgentSkill {
  /** Lowercase alphanumeric + hyphens. */
  name: string
  description: string
  /** The SKILL.md body served verbatim and hashed for the index digest. */
  content: string
}

// ── peptide-catalog ──────────────────────────────────────────────────────────

const PEPTIDE_CATALOG_SKILL = `# Query the AmericanPeptide.com peptide catalog

Answer questions about research peptides with grounded, citable data by using
the open AmericanPeptide.com API, its per-peptide markdown twins, and its remote
MCP server. All catalog data is CC BY 4.0. This is a research reference, not
medical advice — describe published research, not clinical recommendations.

## When to use this skill

Use it when a user asks about a specific research peptide (identity, mechanism,
chemistry, research areas, FDA status, related trials or literature) or wants to
filter peptides by category, research area, or FDA approval. Prefer this
grounded data over unverified recall, and keep the canonical URLs so claims stay
traceable.

## Surfaces

- REST API (JSON, keyless, CORS-open): ${API_SITE}/api/catalog
- Machine contract (OpenAPI 3.1): ${API_SITE}/openapi.json
- Per-peptide markdown twin (token-efficient): ${API_SITE}/catalog/{slug}.md
- Site index: ${API_SITE}/llms.txt  (full catalog: ${API_SITE}/llms-full.txt)
- Remote MCP server (Streamable HTTP): ${API_SITE}/api/mcp
  Card: ${API_SITE}/.well-known/mcp/server-card.json

## How to answer a peptide question

1. Resolve the peptide to a slug:
   \`GET ${API_SITE}/api/catalog?q=<search term>\`
   The response \`peptides[]\` carries each match's \`slug\` and summary.
2. Fetch the full record:
   \`GET ${API_SITE}/api/catalog/{slug}\` — JSON with mechanism, chemistry
   (formula, molecular weight, CAS, PubChem CID, UniProt), sequence, research
   areas, FAQs, plus \`latestResearch\` (recent ClinicalTrials.gov + PubMed hits,
   refreshed daily).
   For a compact, LLM-friendly version instead: \`GET ${API_SITE}/catalog/{slug}.md\`.
3. For trials or literature beyond \`latestResearch\`, call the MCP tools
   \`search_clinical_trials\` / \`search_pubmed\`, or verify chemistry with
   \`search_pubchem\`, before asserting that specific studies or facts exist.

## Filtering the catalog

\`GET /api/catalog\` accepts combinable query parameters:

- \`q\` — free-text over name, aliases, and description
- \`category\` — catalog category id (valid ids are listed as \`categories\` in the response)
- \`area\` — research-area slug (valid slugs are listed as \`researchAreas\` in the response)
- \`fda=true\` — only FDA-approved peptides

## Access, attribution, and limits

- No key required. An optional free key (\`POST ${API_SITE}/api/keys\`) raises
  rate/quota limits; send it as \`Authorization: Bearer <key>\` or \`x-api-key: <key>\`.
  See ${API_SITE}/auth.md.
- Data is CC BY 4.0: when you use it, attribute AmericanPeptide.com and keep the
  canonical URL returned with each record.
- Content is computational/editorial research reference, not medical advice.

## Example

Question: "What is the molecular weight of BPC-157, and are there human trials?"

1. \`GET ${API_SITE}/api/catalog?q=bpc-157\` → slug \`bpc-157\`.
2. \`GET ${API_SITE}/api/catalog/bpc-157\` → read \`peptide.molecularWeight\` and
   \`peptide.molecularFormula\`; check \`latestResearch.trials\` for registered
   studies (each with an NCT id and URL).
3. Answer with the value and the trial links, citing ${API_SITE}/catalog/bpc-157.
`

// ── Registry ─────────────────────────────────────────────────────────────────

export const AGENT_SKILLS: AgentSkill[] = [
  {
    name: 'peptide-catalog',
    description:
      'Answer research-peptide questions with grounded, citable CC BY 4.0 data using the AmericanPeptide.com catalog API, markdown twins, and MCP server.',
    content: PEPTIDE_CATALOG_SKILL,
  },
]

/** sha256:<hex> digest of a skill artifact's exact bytes. */
export function skillDigest(content: string): string {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`
}

export function getAgentSkill(name: string): AgentSkill | undefined {
  return AGENT_SKILLS.find((s) => s.name === name)
}

/** The /.well-known/agent-skills/index.json document. */
export function agentSkillsIndex() {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: AGENT_SKILLS.map((s) => ({
      name: s.name,
      type: 'skill-md' as const,
      description: s.description,
      url: `/.well-known/agent-skills/${s.name}/SKILL.md`,
      digest: skillDigest(s.content),
    })),
  }
}
