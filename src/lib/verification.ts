// AUTO-GENERATED — do not edit by hand.
// Source: GET /api/jobs/fact-qa?format=manifest  (regenerate via scripts/gen-verification.mjs)
//
// Each entry was confirmed against its PubChem record on `checkedAt`. A curated
// pubchemCid is authoritative; name-resolved entries additionally had to contain
// nitrogen and match the catalog molecular weight within tolerance. Only
// confident matches appear here, so the on-page "verified" claim stays honest.

export interface VerificationRecord {
  cid: number
  molecularFormula: string | null
  molecularWeight: number | null
  checkedAt: string
}

export const PUBCHEM_VERIFIED: Record<string, VerificationRecord> = {

}

export function getPubchemVerification(slug: string): VerificationRecord | undefined {
  return PUBCHEM_VERIFIED[slug]
}
