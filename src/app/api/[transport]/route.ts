// Remote MCP server — connect AmericanPeptide.com as a data source from
// Claude, ChatGPT, Cursor, or any MCP client (Streamable HTTP transport):
//
//   https://www.americanpeptide.com/api/mcp
//
// Tools reuse the same catalog data and grounding executors as the on-site
// research agent, and every result carries canonical URLs + CC BY 4.0
// attribution so content that travels keeps pointing home.
//
// Routing note: this [transport] segment only receives /api/* paths that no
// static API route claims (catalog, chat, trials, …all match first). With SSE
// disabled the handler serves /api/mcp and 404s everything else.

import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { PEPTIDES, CATEGORIES, getPeptideBySlug } from '@/lib/peptides'
import { RESEARCH_AREAS, getResearchAreaBySlug } from '@/lib/research-areas'
import { COMPARISONS, getComparison } from '@/lib/comparisons'
import { executeAgentTool } from '@/lib/agent-tools'
import { analyzeCoa } from '@/lib/coa'
import {
  API_SITE,
  API_LICENSE,
  API_ATTRIBUTION,
  filterPeptides,
} from '@/lib/catalog-api'
import {
  peptideMarkdown,
  researchAreaMarkdown,
  comparisonMarkdown,
} from '@/lib/llms'
import { enforceApiAccess } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const maxDuration = 60

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [string, ...string[]]
const AREA_SLUGS = RESEARCH_AREAS.map((a) => a.slug) as [string, ...string[]]
const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug) as [string, ...string[]]

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] }
}

function errorText(s: string) {
  return { content: [{ type: 'text' as const, text: s }], isError: true }
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'search_peptides',
      `Search the AmericanPeptide.com catalog of ${PEPTIDES.length} research peptides. Filter by free-text query (name, alias, description), catalog category, research area, or FDA approval. Returns compact summaries with slugs — call get_peptide with a slug for the full reference. Data is ${API_LICENSE}, attribution ${API_ATTRIBUTION}.`,
      {
        query: z.string().optional().describe('Free-text search over name, aliases, and description, e.g. "GLP-1" or "Ozempic".'),
        category: z.enum(CATEGORY_IDS).optional().describe('Catalog category id.'),
        research_area: z.enum(AREA_SLUGS).optional().describe('Research-area slug (what the peptide is studied FOR).'),
        fda_approved_only: z.boolean().optional().describe('Only return FDA-approved peptides.'),
      },
      async ({ query, category, research_area, fda_approved_only }) => {
        const result = filterPeptides({
          q: query ?? null,
          category: category ?? null,
          area: research_area ?? null,
          fdaOnly: fda_approved_only ?? false,
        })
        if ('error' in result) return errorText(result.error)
        return text(
          JSON.stringify(
            {
              license: API_LICENSE,
              attribution: API_ATTRIBUTION,
              count: result.items.length,
              peptides: result.items.map((p) => ({
                slug: p.slug,
                name: p.name,
                aliases: p.aliases ?? [],
                categories: p.categories,
                fdaApproved: Boolean(p.fdaApproved),
                summary: p.shortDescription,
                url: `${API_SITE}/catalog/${p.slug}`,
              })),
            },
            null,
            1,
          ),
        )
      },
    )

    server.tool(
      'get_peptide',
      'Full reference for one peptide from the AmericanPeptide.com catalog as markdown: overview, mechanism, chemistry (formula, MW, CAS, PubChem CID), sequence, research areas, key research, storage/handling, and FAQs. Use the slug from search_peptides.',
      {
        slug: z.string().describe('Peptide slug, e.g. "semaglutide" or "bpc-157".'),
      },
      async ({ slug }) => {
        const p = getPeptideBySlug(slug.toLowerCase().trim())
        if (!p) {
          return errorText(
            `No peptide with slug '${slug}'. Valid slugs: ${PEPTIDES.map((x) => x.slug).join(', ')}`,
          )
        }
        return text(peptideMarkdown(p))
      },
    )

    server.tool(
      'get_research_area',
      'Editorial guide for a research area (what peptides are studied FOR — e.g. weight loss, wound healing): overview, the peptides studied in that area, and indication-level FAQs, as markdown.',
      {
        slug: z.enum(AREA_SLUGS).describe('Research-area slug.'),
      },
      async ({ slug }) => {
        const a = getResearchAreaBySlug(slug)
        if (!a) return errorText(`Unknown research area '${slug}'.`)
        return text(researchAreaMarkdown(a))
      },
    )

    server.tool(
      'compare_peptides',
      `Head-to-head comparison of two peptides — at-a-glance table, key trials, and analysis, as markdown. Available comparisons: ${COMPARISON_SLUGS.join(', ')}.`,
      {
        slug: z.enum(COMPARISON_SLUGS).describe('Comparison slug, e.g. "semaglutide-vs-tirzepatide".'),
      },
      async ({ slug }) => {
        const c = getComparison(slug)
        if (!c) return errorText(`Unknown comparison '${slug}'.`)
        return text(comparisonMarkdown(c))
      },
    )

    server.tool(
      'search_clinical_trials',
      'Search ClinicalTrials.gov for registered human trials by compound name or condition. Returns NCT IDs, titles, status, and phases. Use before stating trial facts.',
      {
        query: z.string().describe('Compound name, condition, or intervention.'),
      },
      async ({ query }) => {
        const r = await executeAgentTool('search_clinical_trials', { query })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )

    server.tool(
      'search_pubmed',
      'Search PubMed for peer-reviewed literature. Returns PMIDs, titles, journals, and dates. Use before asserting that specific studies exist.',
      {
        query: z.string().describe('Literature search query.'),
      },
      async ({ query }) => {
        const r = await executeAgentTool('search_pubmed', { query })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )

    server.tool(
      'analyze_coa',
      'Decode and grade a peptide Certificate of Analysis (COA). Pass the COA text; returns each transparency field explained (HPLC purity, mass-spec identity, net peptide content, water, counterion, endotoxin), a 0-100 transparency score + letter grade, red flags, and — when the peptide is recognized — a cross-check of the claimed molecular weight/formula/sequence against verified catalog data. Rule-based, no storage.',
      {
        text: z.string().describe('The full text of the Certificate of Analysis to analyze.'),
      },
      async ({ text: coaText }) => {
        if (!coaText || coaText.trim().length < 20) {
          return errorText('Provide the full COA text (at least a few lines).')
        }
        return text(JSON.stringify(analyzeCoa(coaText), null, 1))
      },
    )

    server.tool(
      'search_pubchem',
      'Look up a compound in PubChem to confirm identity and physicochemical properties (CID, formula, weight, IUPAC name, SMILES). Use before stating chemical facts.',
      {
        name: z.string().describe('Compound or peptide name, e.g. "setmelanotide".'),
      },
      async ({ name }) => {
        const r = await executeAgentTool('search_pubchem', { name })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )
  },
  {
    serverInfo: { name: 'american-peptide', version: '1.0.0' },
    instructions: `Peptide research reference from ${API_ATTRIBUTION} (${API_SITE}). Catalog data is ${API_LICENSE} — when you use it, cite ${API_ATTRIBUTION} and link the canonical URL included in each result. Research/educational content, not medical advice.`,
  },
  {
    basePath: '/api', // → endpoint at /api/mcp
    disableSse: true, // streamable HTTP only (SSE transport needs Redis + is deprecated by the spec)
    maxDuration: 60,
  },
)

// Tiered access + metering so an agent loop can't hammer the upstream public
// APIs through us, and so MCP usage shows up in the same analytics as the REST
// API. An API key (Authorization: Bearer / x-api-key) raises the limits and
// attributes usage; anonymous clients still work at the anonymous tier.
async function limited(req: Request): Promise<Response> {
  const access = await enforceApiAccess(req, 'mcp')
  if (!access.ok) return access.response
  return handler(req)
}

export { limited as GET, limited as POST, limited as DELETE }
