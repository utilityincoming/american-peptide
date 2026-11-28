// Map a COA (or a sourcing intake) onto the published 100-point trust score.
// The points come only from trustScore() in vendors.ts. This file decides
// which signals the text supports. Policy flags are never inferred.

import { analyzeCoa, type CoaReport } from '@/lib/coa'
import { trustScore, TRUST_RUBRIC, type Vendor, type VendorTrust } from '@/lib/vendors'

const INDEPENDENT = /janoshik|mz biolabs|eurofins|third[ -]?party|independent (lab|testing)|iso\s*\/?\s*iec\s*17025/i

export interface PolicyFlags {
  reshipPolicy: boolean
  refundPolicy: boolean
}

export interface ScoredReport {
  report: CoaReport
  trust: VendorTrust
  /** 0–100 from trustScore. Not a product ranking. */
  sourcingScore: number
  /** Too little text to treat as a readable certificate. */
  unrecognized: boolean
  missing: string[]
}

export function signalsForText(text: string, policies: PolicyFlags): ScoredReport {
  const trimmed = text.trim()
  const unrecognized = trimmed.replace(/\s+/g, '').length < 40
  const report = analyzeCoa(trimmed)
  const lot = report.fields.find((field) => field.key === 'lotDates')?.found ?? false
  const trust: VendorTrust = {
    coaOnFile: !unrecognized && report.fields.some((field) => field.found),
    thirdPartyTested: !unrecognized && INDEPENDENT.test(trimmed),
    perBatchTesting: !unrecognized && lot,
    reshipPolicy: policies.reshipPolicy,
    refundPolicy: policies.refundPolicy,
  }
  const missing = TRUST_RUBRIC.filter((row) => !trust[row.key]).map((row) => row.label)
  return {
    report,
    trust,
    sourcingScore: trustScore({ trust } as Vendor),
    unrecognized,
    missing,
  }
}

export function signalsFromFlags(trust: VendorTrust): { score: number; missing: string[] } {
  return {
    score: trustScore({ trust } as Vendor),
    missing: TRUST_RUBRIC.filter((row) => !trust[row.key]).map((row) => row.label),
  }
}
