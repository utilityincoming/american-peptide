// Remote MCP server — connect AmericanPeptide.com as a data source from
// Claude, ChatGPT, Cursor, or any MCP client (Streamable HTTP transport):
//
//   https://americanpeptide.com/api/mcp
//
// Tools reuse the same catalog data and grounding executors as the on-site
// research agent, and every result carries canonical URLs + CC BY 4.0
// attribution so content that travels keeps pointing home.
//
// mcp-handler 2 serves this route only. The 2024 HTTP+SSE transport is gone,
// so there is no Redis-backed SSE endpoint to disable.

import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { PEPTIDES, CATALOG_COUNT, CATEGORIES, getPeptideBySlug } from '@/lib/peptides'
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
    server.registerTool(
      'search_peptides',
      {
        description: `Search the AmericanPeptide.com catalog of ${CATALOG_COUNT} research peptides. Filter by free-text query (name, alias, description), catalog category, research area, or FDA approval. Returns compact summaries with slugs — call get_peptide with a slug for the full reference. Data is ${API_LICENSE}, attribution ${API_ATTRIBUTION}.`,
        inputSchema: z.object({
          query: z.string().optional().describe('Free-text search over name, aliases, and description, e.g. "GLP-1" or "Ozempic".'),
          category: z.enum(CATEGORY_IDS).optional().describe('Catalog category id.'),
          research_area: z.enum(AREA_SLUGS).optional().describe('Research-area slug (what the peptide is studied FOR).'),
          fda_approved_only: z.boolean().optional().describe('Only return FDA-approved peptides.'),
        }),
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

    server.registerTool(
      'get_peptide',
      {
        description: 'Full reference for one peptide from the AmericanPeptide.com catalog as markdown: overview, mechanism, chemistry (formula, MW, CAS, PubChem CID), sequence, research areas, key research, storage/handling, and FAQs. Use the slug from search_peptides.',
        inputSchema: z.object({
          slug: z.string().describe('Peptide slug, e.g. "semaglutide" or "bpc-157".'),
        }),
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

    server.registerTool(
      'get_research_area',
      {
        description: 'Editorial guide for a research area (what peptides are studied FOR — e.g. weight loss, wound healing): overview, the peptides studied in that area, and indication-level FAQs, as markdown.',
        inputSchema: z.object({
          slug: z.enum(AREA_SLUGS).describe('Research-area slug.'),
        }),
      },
      async ({ slug }) => {
        const a = getResearchAreaBySlug(slug)
        if (!a) return errorText(`Unknown research area '${slug}'.`)
        return text(researchAreaMarkdown(a))
      },
    )

    server.registerTool(
      'compare_peptides',
      {
        description: `Head-to-head comparison of two peptides — at-a-glance table, key trials, and analysis, as markdown. Available comparisons: ${COMPARISON_SLUGS.join(', ')}.`,
        inputSchema: z.object({
          slug: z.enum(COMPARISON_SLUGS).describe('Comparison slug, e.g. "semaglutide-vs-tirzepatide".'),
        }),
      },
      async ({ slug }) => {
        const c = getComparison(slug)
        if (!c) return errorText(`Unknown comparison '${slug}'.`)
        return text(comparisonMarkdown(c))
      },
    )

    server.registerTool(
      'search_clinical_trials',
      {
        description: 'Search ClinicalTrials.gov for registered human trials by compound name or condition. Returns NCT IDs, titles, status, and phases. Use before stating trial facts.',
        inputSchema: z.object({
          query: z.string().describe('Compound name, condition, or intervention.'),
        }),
      },
      async ({ query }) => {
        const r = await executeAgentTool('search_clinical_trials', { query })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )

    server.registerTool(
      'search_pubmed',
      {
        description: 'Search PubMed for peer-reviewed literature. Returns PMIDs, titles, journals, and dates. Use before asserting that specific studies exist.',
        inputSchema: z.object({
          query: z.string().describe('Literature search query.'),
        }),
      },
      async ({ query }) => {
        const r = await executeAgentTool('search_pubmed', { query })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )

    server.registerTool(
      'analyze_coa',
      {
        description: 'Decode and grade a peptide Certificate of Analysis (COA). Pass the COA text; returns each transparency field explained (HPLC purity, mass-spec identity, net peptide content, water, counterion, endotoxin), a 0-100 transparency score + letter grade, red flags, and — when the peptide is recognized — a cross-check of the claimed molecular weight/formula/sequence against verified catalog data. Rule-based, no storage.',
        inputSchema: z.object({
          text: z.string().describe('The full text of the Certificate of Analysis to analyze.'),
        }),
      },
      async ({ text: coaText }) => {
        if (!coaText || coaText.trim().length < 20) {
          return errorText('Provide the full COA text (at least a few lines).')
        }
        return text(JSON.stringify(analyzeCoa(coaText), null, 1))
      },
    )

    server.registerTool(
      'search_pubchem',
      {
        description: 'Look up a compound in PubChem to confirm identity and physicochemical properties (CID, formula, weight, IUPAC name, SMILES). Use before stating chemical facts.',
        inputSchema: z.object({
          name: z.string().describe('Compound or peptide name, e.g. "setmelanotide".'),
        }),
      },
      async ({ name }) => {
        const r = await executeAgentTool('search_pubchem', { name })
        return r.isError ? errorText(r.content) : text(r.content)
      },
    )

    server.registerTool(
      'reconstitute_vial',
      {
        description:
          'Deterministic reconstitution dilution calculator for a peptide vial, an IU-standardized biologic, or a pre-filled GLP-1 pen: concentration (mcg/mL, mg/mL, optional µM molarity, or IU/mL), U-100 syringe draw units, whole doses per vial/pen, and optional reverse-solve for water volume from target_draw_units. Always attaches the canonical /methods scope note. Refuses personal dosing/prescribing advice.',
        inputSchema: z.object({
          unit: z
            .enum(['mcg', 'iu'])
            .optional()
            .describe('Dose measurement: "mcg" for mg-vial peptides (default), "iu" for IU-standardized biologics.'),
          form: z
            .enum(['vial', 'pen'])
            .optional()
            .describe('Container: "vial" (default) or "pen" for a pre-filled GLP-1 pen (uses fill_ml, no water). Pen is mcg only.'),
          vial_mg: z.number().optional().describe('Peptide mass in the vial or pen strength, in milligrams (unit="mcg").'),
          dose_mcg: z.number().optional().describe('Target amount per draw, in micrograms (unit="mcg").'),
          vial_iu: z.number().optional().describe('Biologic content of the vial, in international units (unit="iu").'),
          dose_iu: z.number().optional().describe('Target amount per draw, in international units (unit="iu").'),
          water_ml: z
            .number()
            .optional()
            .describe('Bacteriostatic water added, in milliliters (optional if target_draw_units is given; not used for pens).'),
          fill_ml: z.number().optional().describe('Pre-filled pen solution volume in milliliters (form="pen" only).'),
          target_draw_units: z
            .number()
            .optional()
            .describe('Optional target U-100 syringe units per draw to reverse-solve required water_ml (vial form only).'),
          peptide: z
            .string()
            .optional()
            .describe('Optional catalog peptide slug or name to resolve verified molecular weight for molar concentration.'),
          molecular_weight_da: z
            .number()
            .optional()
            .describe('Optional explicit molecular weight in Daltons (g/mol) for molar concentration.'),
          require_molar: z
            .boolean()
            .optional()
            .describe('Set true when molarity (µM) or nmol is required so missing molecular weight is reported cleanly.'),
        }),
      },
      async (args) => {
        const r = await executeAgentTool('reconstitute_vial', args as Record<string, unknown>)
        if (r.isError) return errorText(r.content)
        if (!r.content.trim().startsWith('{')) return errorText(r.content)
        const parsed = JSON.parse(r.content) as Record<string, unknown>
        if (typeof parsed.error === 'string') return errorText(r.content)
        return text(r.content)
      },
    )

    server.registerTool(
      'cost_per_dose',
      {
        description:
          'Deterministic cost-per-dose and doses-per-vial calculator from a vial mass (mg), a dose (mcg), and an optional vial price. Always attaches the canonical /methods scope note.',
        inputSchema: z.object({
          vial_mg: z.number().describe('Peptide mass in the vial, in milligrams.'),
          dose_mcg: z.number().describe('Amount per dose, in micrograms.'),
          vial_cost: z.number().optional().describe('Optional vial price to divide across the doses.'),
        }),
      },
      async (args) => {
        const r = await executeAgentTool('cost_per_dose', args as Record<string, unknown>)
        if (r.isError) return errorText(r.content)
        const parsed = JSON.parse(r.content) as Record<string, unknown>
        if (typeof parsed.error === 'string') return errorText(r.content)
        return text(r.content)
      },
    )

    server.registerTool(
      'screen_blend',
      {
        description:
          'Deterministic post-reconstitution blend compatibility screen and shared-vial draw calculator. Screens 2–10 catalog peptides at a buffer pH (default 5.7) for opposite net charge, isoelectric point proximity, hydrophobicity (GRAVY), free cysteines, copper–thiol oxidation, fibril formation, and labeled syringe incompatibilities. When mass_mg, dose_mcg, and water_ml are provided, also computes shared-vial draw volume, limiting dose count, and over-delivery percentages. Always attaches the canonical /methods scope note.',
        inputSchema: z.object({
          peptides: z
            .array(
              z.object({
                slug: z.string().optional().describe('Catalog peptide slug, e.g. "bpc-157" or "ghk-cu".'),
                name: z.string().optional().describe('Peptide name if slug is not known.'),
                mass_mg: z
                  .number()
                  .optional()
                  .describe('Optional vial mass in mg transferred into the shared blend.'),
                dose_mcg: z
                  .number()
                  .optional()
                  .describe('Optional intended dose in mcg per draw for this component.'),
              }),
            )
            .describe('Peptides in the blend.'),
          buffer_ph: z
            .number()
            .optional()
            .describe('Optional buffer pH (0–14, defaults to 5.7 for bacteriostatic water).'),
          water_ml: z
            .number()
            .optional()
            .describe('Optional total bacteriostatic water volume in mL for shared-vial draw math.'),
        }),
      },
      async (args) => {
        const r = await executeAgentTool('screen_blend', args as Record<string, unknown>)
        if (r.isError) return errorText(r.content)
        const parsed = JSON.parse(r.content) as Record<string, unknown>
        if (typeof parsed.error === 'string') return errorText(r.content)
        return text(r.content)
      },
    )

    server.registerTool(
      'peptide_half_life',
      {
        description:
          'Deterministic single-compartment pharmacokinetic calculator and catalog half-life lookup. Computes time to steady state (97%), clearance time (97%), repeat-dose accumulation ratio, peak-to-trough ratio, and fraction remaining at elapsed_hours from the catalog half-life table or an explicit hypothetical half_life_hours input. Always attaches the canonical /methods scope note.',
        inputSchema: z.object({
          name: z.string().optional().describe('Catalog peptide name or slug, e.g. "semaglutide".'),
          half_life_hours: z
            .number()
            .optional()
            .describe('Optional explicit hypothetical half-life in hours for single-compartment PK math.'),
          interval_hours: z
            .number()
            .optional()
            .describe('Optional repeat-dose interval in hours to compute accumulation and peak-to-trough ratio.'),
          elapsed_hours: z
            .number()
            .optional()
            .describe('Optional hours elapsed since a single dose to compute fraction and percent remaining.'),
        }),
      },
      async (args) => {
        const r = await executeAgentTool('peptide_half_life', args as Record<string, unknown>)
        if (r.isError) return errorText(r.content)
        if (!r.content.trim().startsWith('{')) return errorText(r.content)
        const parsed = JSON.parse(r.content) as Record<string, unknown>
        if (typeof parsed.error === 'string') return errorText(r.content)
        return text(r.content)
      },
    )
  },
  {
    serverInfo: { name: 'american-peptide', version: '1.0.0' },
    instructions: `Peptide research reference from ${API_ATTRIBUTION} (${API_SITE}). Catalog data is ${API_LICENSE} — when you use it, cite ${API_ATTRIBUTION} and link the canonical URL included in each result. Research/educational content, not medical advice.`,
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
