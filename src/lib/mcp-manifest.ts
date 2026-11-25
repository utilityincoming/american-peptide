// Single source of truth for the public MCP Server Card served at
// /.well-known/mcp/server-card.json (see src/app/.well-known/mcp/server-card.json).
//
// The live server itself is src/app/api/mcp/route.ts. This manifest MIRRORS its
// identity and tool set for discovery; a drift-guard test (mcp-manifest.test.ts)
// fails if the two fall out of sync — the tool-name set here must equal the set
// registered in the route, and the name/version must match its `serverInfo`.
//
// Keep these in lockstep: when a tool is added, removed, or renamed in the
// route, update MCP_TOOLS here too.

import { API_SITE, API_LICENSE, API_ATTRIBUTION } from './catalog-api'

export interface McpToolManifest {
  name: string
  description: string
}

// Identity — must match `serverInfo` in src/app/api/mcp/route.ts.
export const MCP_SERVER = {
  name: 'american-peptide',
  version: '1.0.0',
  title: 'AmericanPeptide.com MCP Server',
  description: `Peptide research reference from ${API_ATTRIBUTION}: a PubChem-enriched catalog of research peptides, research-area guides, head-to-head comparisons, and grounded clinical-trial / PubMed / PubChem lookups, exposed as MCP tools. Catalog data is ${API_LICENSE}; results carry canonical URLs and attribution. Research and educational content, not medical advice.`,
  /** Streamable HTTP transport endpoint. */
  endpoint: `${API_SITE}/api/mcp`,
  transport: 'streamable-http' as const,
  websiteUrl: API_SITE,
  documentationUrl: `${API_SITE}/developers`,
} as const

// Tool set — the `name`s must equal the tools registered in the route.
export const MCP_TOOLS: McpToolManifest[] = [
  {
    name: 'search_peptides',
    description:
      'Search the peptide catalog by free-text query, category, research area, or FDA approval. Returns compact summaries with slugs.',
  },
  {
    name: 'get_peptide',
    description:
      'Full markdown reference for one peptide: overview, mechanism, chemistry (formula, MW, CAS, PubChem CID), sequence, research, storage, and FAQs.',
  },
  {
    name: 'get_research_area',
    description:
      'Editorial guide for a research area (what peptides are studied FOR, e.g. weight loss, wound healing), as markdown.',
  },
  {
    name: 'compare_peptides',
    description:
      'Head-to-head comparison of two peptides: at-a-glance table, key trials, and analysis, as markdown.',
  },
  {
    name: 'search_clinical_trials',
    description:
      'Search ClinicalTrials.gov for registered human trials by compound name or condition. Returns NCT IDs, titles, status, and phases.',
  },
  {
    name: 'search_pubmed',
    description:
      'Search PubMed for peer-reviewed literature. Returns PMIDs, titles, journals, and dates.',
  },
  {
    name: 'analyze_coa',
    description:
      'Decode and grade a peptide Certificate of Analysis (COA): transparency fields explained, a 0-100 score + letter grade, red flags, and a catalog cross-check. Rule-based, no storage.',
  },
  {
    name: 'search_pubchem',
    description:
      'Look up a compound in PubChem to confirm identity and physicochemical properties (CID, formula, weight, IUPAC name, SMILES).',
  },
  {
    name: 'reconstitute_vial',
    description:
      'Deterministic reconstitution dilution calculator for a peptide vial, IU-standardized biologic, or pre-filled GLP-1 pen: concentration (mcg/mL, mg/mL, optional µM molarity, or IU/mL), U-100 syringe draw units, whole doses, and reverse-solve for water volume.',
  },
  {
    name: 'cost_per_dose',
    description:
      'Deterministic cost-per-dose and doses-per-vial calculator from a vial mass (mg), a dose (mcg), and an optional vial price.',
  },
  {
    name: 'screen_blend',
    description:
      'Deterministic post-reconstitution blend compatibility screen (charge, pI, GRAVY, cysteines, labeled incompatibilities) and shared-vial blend draw calculator.',
  },
  {
    name: 'peptide_half_life',
    description:
      'Deterministic single-compartment pharmacokinetic calculator (steady-state, clearance, accumulation ratio, peak-to-trough, fraction remaining) backed by the catalog half-life table.',
  },
]
