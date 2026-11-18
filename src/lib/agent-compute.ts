// Deterministic tools for the research agent. Each one calls a pure function
// the site already trusts (reconstitution, half-life, vendor trust, COA grade)
// and returns a short JSON string. The model decides when to call them; it
// does not invent the number.

import { matchPeptides } from '@/lib/agent-context'
import { analyzeCoa } from '@/lib/coa'
import {
  accumulationRatio,
  clearanceTime,
  getPk,
  halfLifeMidpoint,
  timeToSteadyState,
} from '@/lib/pharmacokinetics'
import { reconstitute } from '@/lib/reconstitution'
import { getVendorsForPeptide, hasSourcingPage, trustScore, vendorTier } from '@/lib/vendors'
import { API_SITE } from '@/lib/catalog-api'

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

function round(n: number, digits = 3): number {
  if (!Number.isFinite(n)) return n
  const f = 10 ** digits
  return Math.round(n * f) / f
}

export function computeReconstitution(input: Record<string, unknown>): string {
  const vialMg = num(input.vial_mg)
  const doseMcg = num(input.dose_mcg)
  const waterMl = num(input.water_ml)
  if (vialMg == null || doseMcg == null || waterMl == null) {
    return 'Need vial_mg, dose_mcg, and water_ml as numbers.'
  }
  if (vialMg <= 0 || vialMg > 10000 || doseMcg <= 0 || doseMcg > 1_000_000 || waterMl <= 0 || waterMl > 100) {
    return 'Values out of range. vial_mg and dose_mcg must be positive; water_ml must be between 0 and 100.'
  }
  const r = reconstitute({ vialAmount: vialMg * 1000, dose: doseMcg, waterMl })
  return JSON.stringify({
    source: 'reconstitution',
    note: 'Dilution math only. Not a dosing recommendation. U-100 syringe: 100 units = 1 mL.',
    vialMg,
    doseMcg,
    waterMl,
    concentrationMcgPerMl: round(r.concentrationPerMl, 2),
    drawMl: round(r.volumePerInjectionMl, 4),
    drawUnitsU100: round(r.unitsPerInjection, 2),
    wholeDosesPerVial: r.dosesPerVial,
  })
}

export function computePharmacokinetics(input: Record<string, unknown>): string {
  const name = String(input.name ?? '').trim()
  if (!name) return 'Need a compound name.'
  const peptide = matchPeptides(name, 1)[0]
  if (!peptide) return `No catalog peptide matched "${name.slice(0, 80)}". Do not invent a half-life.`
  const pk = getPk(peptide.slug)
  if (!pk?.halfLifeHours) {
    return JSON.stringify({
      source: 'pharmacokinetics',
      name: peptide.name,
      slug: peptide.slug,
      halfLifeHours: null,
      note: 'No published human half-life is stored for this compound. Do not invent one.',
    })
  }
  const mid = halfLifeMidpoint(pk.halfLifeHours)
  const interval = num(input.interval_hours)
  const body: Record<string, unknown> = {
    source: 'pharmacokinetics',
    note: 'Single-compartment approximation from the site half-life table. Research reference, not a regimen.',
    name: peptide.name,
    slug: peptide.slug,
    halfLifeHours: pk.halfLifeHours,
    halfLifeMidpointHours: round(mid, 2),
    hoursToSteadyState: round(timeToSteadyState(mid), 1),
    hoursToClear: round(clearanceTime(mid), 1),
    sourceNote: pk.sourceNote,
    page: `${API_SITE}/catalog/${peptide.slug}`,
  }
  if (interval != null && interval > 0 && interval <= 24 * 60) {
    body.intervalHours = interval
    body.accumulationRatio = round(accumulationRatio(mid, interval), 2)
  }
  return JSON.stringify(body)
}

export function computeVendorRank(input: Record<string, unknown>): string {
  const name = String(input.name ?? '').trim()
  if (!name) return 'Need a compound name.'
  const peptide = matchPeptides(name, 1)[0]
  if (!peptide) return `No catalog peptide matched "${name.slice(0, 80)}".`
  const vendors = getVendorsForPeptide(peptide.slug).slice(0, 5).map((v) => ({
    name: v.name,
    trustScore: trustScore(v),
    tier: vendorTier(v),
    purityPct: v.trust.purityPct ?? null,
    coaOnFile: v.trust.coaOnFile,
    thirdPartyTested: v.trust.thirdPartyTested,
    perBatchTesting: v.trust.perBatchTesting,
    shipsTo: v.shipsTo,
  }))
  return JSON.stringify({
    source: 'vendor-trust',
    note: 'Ranked by published transparency signals only. Not a quality guarantee and not ordered by commission.',
    name: peptide.name,
    slug: peptide.slug,
    sourcesPage: hasSourcingPage(peptide.slug) ? `${API_SITE}/sources/${peptide.slug}` : null,
    vendors,
  })
}

export function computeCoaGrade(input: Record<string, unknown>): string {
  const text = String(input.text ?? '').trim()
  if (text.length < 20) return 'Paste the certificate text (at least a few lines).'
  const report = analyzeCoa(text.slice(0, 8000))
  return JSON.stringify({
    source: 'coa-grade',
    note: 'Rule-based read of the pasted text against the site transparency checklist. Not a lab verification.',
    detected: report.detectedPeptide,
    grade: report.score.grade,
    percent: report.score.percent,
    summary: report.score.summary,
    redFlags: report.redFlags.slice(0, 8),
    missing: report.missing.slice(0, 8),
    catalogChecks: report.catalogChecks.slice(0, 6),
    supplierRequest: report.supplierRequest,
  })
}
