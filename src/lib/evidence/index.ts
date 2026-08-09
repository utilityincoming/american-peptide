export * from './types'

import type { VerificationRecord } from '@/lib/verification'
import { SCHEMA_VERSION, SCOPE_NOTES, type Claim, type Provenance } from './types'

/**
 * Lift a PubChem verification record (lib/verification.ts) into a Provenance —
 * the deterministic, registry-backed source behind every `reference`-tier
 * identity claim on the catalog. `checkedAt` is the manifest's cross-check date,
 * so a MW badge can show exactly when its chemistry was last confirmed.
 */
export function provenanceFromPubchemVerification(rec: VerificationRecord): Provenance {
  return {
    source_type: 'registry',
    source_name: 'PubChem',
    source_id: `CID ${rec.cid}`,
    source_url: `https://pubchem.ncbi.nlm.nih.gov/compound/${rec.cid}`,
    retrieved_at: rec.checkedAt,
    method: 'registry lookup',
    schema_version: SCHEMA_VERSION,
  }
}

/** The molecular-weight identity claim for a verified compound (null if the
 *  slug isn't in the manifest, or its record carries no weight). */
export function molecularWeightClaim(rec: VerificationRecord | undefined): Claim<number> | null {
  if (!rec || rec.molecularWeight == null) return null
  return {
    field: 'molecular_weight',
    value: rec.molecularWeight,
    unit: 'g/mol',
    tier: 'reference',
    freshness: 'current',
    estimate_kind: 'identity',
    scope_note: SCOPE_NOTES.reference,
    provenance: provenanceFromPubchemVerification(rec),
  }
}

/** The molecular-formula identity claim for a verified compound (null if the
 *  slug isn't in the manifest, or its record carries no formula). */
export function molecularFormulaClaim(rec: VerificationRecord | undefined): Claim<string> | null {
  if (!rec || rec.molecularFormula == null) return null
  return {
    field: 'molecular_formula',
    value: rec.molecularFormula,
    tier: 'reference',
    freshness: 'current',
    estimate_kind: 'identity',
    scope_note: SCOPE_NOTES.reference,
    provenance: provenanceFromPubchemVerification(rec),
  }
}
