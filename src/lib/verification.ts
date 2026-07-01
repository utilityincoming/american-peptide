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
  '5-amino-1mq': { cid: 950107, molecularFormula: 'C10H11N2+', molecularWeight: 159.21, checkedAt: '2026-06-22' },
  'aod-9604': { cid: 71300630, molecularFormula: 'C78H123N23O23S2', molecularWeight: 1815.1, checkedAt: '2026-06-22' },
  'bpc-157': { cid: 9941957, molecularFormula: 'C62H98N16O22', molecularWeight: 1419.5, checkedAt: '2026-06-22' },
  'cagrilintide': { cid: 171397054, molecularFormula: 'C194H312N54O59S2', molecularWeight: 4409, checkedAt: '2026-06-22' },
  'cjc-1295-no-dac': { cid: 91971820, molecularFormula: 'C165H269N47O46', molecularWeight: 3647.2, checkedAt: '2026-06-22' },
  'dsip': { cid: 68816, molecularFormula: 'C35H48N10O15', molecularWeight: 848.8, checkedAt: '2026-06-22' },
  'epitalon': { cid: 219042, molecularFormula: 'C14H22N4O9', molecularWeight: 390.35, checkedAt: '2026-06-22' },
  'ghk-cu': { cid: 139035031, molecularFormula: 'C14H21CuN6O4-', molecularWeight: 400.9, checkedAt: '2026-06-22' },
  'glucagon': { cid: 16132283, molecularFormula: 'C153H225N43O49S', molecularWeight: 3482.7, checkedAt: '2026-06-22' },
  'hexarelin': { cid: 6918297, molecularFormula: 'C47H58N12O6', molecularWeight: 887, checkedAt: '2026-06-22' },
  'insulin': { cid: 118984375, molecularFormula: 'C257H383N65O77S6', molecularWeight: 5808, checkedAt: '2026-06-22' },
  'ipamorelin': { cid: 9831659, molecularFormula: 'C38H49N9O5', molecularWeight: 711.9, checkedAt: '2026-06-22' },
  'kisspeptin-10': { cid: 25240297, molecularFormula: 'C63H83N17O14', molecularWeight: 1302.4, checkedAt: '2026-06-22' },
  'kpv': { cid: 125672, molecularFormula: 'C16H30N4O4', molecularWeight: 342.43, checkedAt: '2026-06-22' },
  'll-37': { cid: 16198951, molecularFormula: 'C205H340N60O53', molecularWeight: 4493, checkedAt: '2026-06-22' },
  'matrixyl': { cid: 9897237, molecularFormula: 'C39H75N7O10', molecularWeight: 802.1, checkedAt: '2026-06-22' },
  'melanotan-1': { cid: 16197727, molecularFormula: 'C78H111N21O19', molecularWeight: 1646.8, checkedAt: '2026-06-22' },
  'melanotan-2': { cid: 92432, molecularFormula: 'C50H69N15O9', molecularWeight: 1024.2, checkedAt: '2026-06-22' },
  'mots-c': { cid: 146675088, molecularFormula: 'C101H152N28O22S2', molecularWeight: 2174.6, checkedAt: '2026-06-22' },
  'nad-plus': { cid: 5893, molecularFormula: 'C21H28N7O14P2+', molecularWeight: 664.4, checkedAt: '2026-06-22' },
  'oxytocin': { cid: 439302, molecularFormula: 'C43H66N12O12S2', molecularWeight: 1007.2, checkedAt: '2026-06-22' },
  'pt-141': { cid: 9941379, molecularFormula: 'C50H68N14O10', molecularWeight: 1025.2, checkedAt: '2026-06-22' },
  'retatrutide': { cid: 171390338, molecularFormula: 'C221H342N46O68', molecularWeight: 4731, checkedAt: '2026-06-22' },
  'selank': { cid: 11765600, molecularFormula: 'C33H57N11O9', molecularWeight: 751.9, checkedAt: '2026-06-22' },
  'semaglutide': { cid: 56843331, molecularFormula: 'C187H291N45O59', molecularWeight: 4114, checkedAt: '2026-06-22' },
  'semax': { cid: 9811102, molecularFormula: 'C37H51N9O10S', molecularWeight: 813.9, checkedAt: '2026-06-22' },
  'sermorelin': { cid: 16132413, molecularFormula: 'C149H246N44O42S', molecularWeight: 3357.9, checkedAt: '2026-06-22' },
  'ss-31': { cid: 11764719, molecularFormula: 'C32H49N9O5', molecularWeight: 639.8, checkedAt: '2026-06-22' },
  'tb-500': { cid: 62707662, molecularFormula: 'C38H68N10O14', molecularWeight: 889, checkedAt: '2026-06-22' },
  'teriparatide': { cid: 129631922, molecularFormula: 'C181H291N55O51S2', molecularWeight: 4118, checkedAt: '2026-06-22' },
  'tesamorelin': { cid: 16137828, molecularFormula: 'C221H366N72O67S', molecularWeight: 5136, checkedAt: '2026-06-22' },
  'thymosin-alpha-1': { cid: 16130571, molecularFormula: 'C129H215N33O55', molecularWeight: 3108.3, checkedAt: '2026-06-22' },
  'tirzepatide': { cid: 166567236, molecularFormula: 'C225H348N48O68', molecularWeight: 4813, checkedAt: '2026-06-22' },
}

export function getPubchemVerification(slug: string): VerificationRecord | undefined {
  return PUBCHEM_VERIFIED[slug]
}
