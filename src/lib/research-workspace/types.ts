// Shared shapes for the Research Workspace (compare, ClinicalPulse, PeptideForge).
// Property numbers are computational estimates — see peptide-properties.ts.

export type WorkspaceTool = 'compare' | 'pulse' | 'forge'

export interface CompareRow {
  slug: string
  name: string
  categories: string[]
  sequence: string
  /** Standard residues parsed from the catalog sequence. Empty when unparseable. */
  codes: string[]
  length: number | null
  molecularWeight: number | null
  /** Catalog mass when present; otherwise the calculated average mass. */
  massSource: 'catalog' | 'calculated' | 'unavailable'
  formula: string | null
  /** Henderson–Hasselbalch net charge at pH 7.4. */
  netCharge74: number | null
  gravy: number | null
  pi: number | null
  extinction280: number | null
  fdaApproved: boolean
  evidenceNote: string
  pubchemCid: number | null
  uniprotId: string | null
  researchAreas: string[]
  /** PubChem verification date from the monograph manifest, when present. */
  verifiedOn: string | null
}

export interface TrialRecord {
  nctId: string
  title: string
  status: string
  phases: string[]
  sponsor: string | null
  enrollment: number | null
  conditions: string[]
  /** YYYY-MM-DD when ClinicalTrials.gov provided one. */
  lastUpdate: string | null
  startDate: string | null
}

export interface PulseFilters {
  query: string
  phase: string
  status: string
  condition: string
  sponsor: string
  from: string
  to: string
}

export interface SavedPulseView {
  name: string
  filters: PulseFilters
  savedAt: number
}

export interface DiffCell {
  a: string
  b: string
  kind: 'match' | 'sub' | 'gap' | 'nonstandard'
}

export interface MutationDelta {
  code: string
  name: string
  dMass: number
  dGravy: number
  dCharge74: number
}
