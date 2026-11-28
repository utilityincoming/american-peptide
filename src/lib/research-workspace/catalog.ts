import {
  chargeAtPH,
  catalogCodes,
  extinctionCoefficient,
  isoelectricPoint,
  parseCatalogChain,
} from '@/lib/peptide-properties'
import { gravy, peptideMass } from '@/lib/amino-acids'
import { CATEGORIES, type Peptide } from '@/lib/peptides'
import { getPubchemVerification } from '@/lib/verification'
import type { CompareRow } from './types'

const CATEGORY_LABEL = new Map(CATEGORIES.map((c) => [c.id, c.label]))

export function evidenceNote(peptide: Peptide): string {
  if (peptide.fdaApproved) {
    return 'FDA-approved drug (catalog flag). Confirm the current label before citing.'
  }
  if (peptide.researchAreas && peptide.researchAreas.length > 0) {
    return 'Catalog research areas only — not an evidence-tier score.'
  }
  return 'Catalog identity record. No research-area links on this entry.'
}

export function toCompareRow(peptide: Peptide): CompareRow {
  const parsed = peptide.sequence ? parseCatalogChain(peptide.sequence) : null
  const codes = parsed?.codes ?? []
  const mods = parsed
    ? {
        acetylN: parsed.acetylN,
        amideC: parsed.amideC,
        pyroGluN: parsed.pyroGluN,
        disulfideCysteines: parsed.disulfideCysteines,
      }
    : {}
  const hasChain = codes.length > 0
  const catalogMw = peptide.molecularWeight
  return {
    slug: peptide.slug,
    name: peptide.name,
    categories: peptide.categories.map((id) => CATEGORY_LABEL.get(id) ?? id),
    sequence: peptide.sequence ?? '',
    codes,
    length: hasChain ? codes.length : null,
    molecularWeight: catalogMw ?? (hasChain ? peptideMass(codes) : null),
    massSource: catalogMw != null ? 'catalog' : hasChain ? 'calculated' : 'unavailable',
    formula: peptide.molecularFormula ?? null,
    netCharge74: hasChain ? chargeAtPH(codes, 7.4, mods) : null,
    gravy: hasChain ? gravy(codes) : null,
    pi: hasChain ? isoelectricPoint(codes, mods) : null,
    extinction280: hasChain ? extinctionCoefficient(codes).reduced : null,
    fdaApproved: Boolean(peptide.fdaApproved),
    evidenceNote: evidenceNote(peptide),
    pubchemCid: peptide.pubchemCid ?? null,
    uniprotId: peptide.uniprotId ?? null,
    researchAreas: peptide.researchAreas ?? [],
    verifiedOn: getPubchemVerification(peptide.slug)?.checkedAt ?? null,
  }
}

/** Codes-only helper re-exported for callers that already sanitized a string. */
export function codesOf(raw: string): string[] {
  return catalogCodes(raw)
}
