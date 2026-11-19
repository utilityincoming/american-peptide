// Post-reconstitution blend screen for the Blend Calculator.
//
// Pure and catalog-backed. It does not invent a mixing procedure. It estimates
// whether peptides that have already been reconstituted are likely to associate
// when they share one solution, and it repeats the few incompatibilities that
// are written on a product label.
//
// Charge and pI use the Design Lab Henderson–Hasselbalch model, with the end
// groups, one acylated lysine, and disulfide cysteines taken out of the count
// when the catalog says so. A fatty diacid's extra carboxyls are still not in
// the number. GRAVY is Kyte–Doolittle on the backbone. A clear flag is a
// hypothesis, not a formulation study.

import { PEPTIDES, getComponents, type Peptide } from '@/lib/peptides'
import { gravy } from '@/lib/amino-acids'
import {
  chargeAtPH,
  isoelectricPoint,
  parseCatalogChain,
  type ChargeMods,
  type ParsedChain,
} from '@/lib/peptide-properties'

/** Typical bacteriostatic-water pH. The screen is an estimate at whatever pH the caller passes. */
export const DEFAULT_BUFFER_PH = 5.7

/** |pI − buffer pH| at or below this is flagged. Solubility is lowest near the pI. */
export const PI_WINDOW = 1

/** Both peptides must be at least this far from zero, and opposite in sign. */
export const OPPOSITE_CHARGE_MIN = 0.5

/** Kyte–Doolittle GRAVY at or above this is treated as strongly hydrophobic. */
export const GRAVY_HYDROPHOBIC = 0.5

/** Catalog slugs documented to gel or fibrillate in aqueous solution. */
const FIBRIL_SLUGS = new Set(['glucagon', 'amylin', 'insulin'])

const LABELED_PAIRS: { a: string; b: string; detail: string }[] = [
  {
    a: 'pramlintide',
    b: 'insulin',
    detail:
      'The pramlintide (Symlin) prescribing information says not to mix it with insulin in the same syringe. The solutions sit at different pH and the mixture precipitates.',
  },
]

export type ScreenLevel = 'info' | 'caution' | 'warn'

export interface ScreenFlag {
  level: ScreenLevel
  code: string
  title: string
  detail: string
}

export interface ScreenedPeptide {
  slug: string | null
  name: string
  /** False when the catalog has no usable single-letter sequence. */
  hasSequence: boolean
  charge: number | null
  pi: number | null
  gravy: number | null
  cysteines: number
}

export interface BlendScreen {
  pH: number
  peptides: ScreenedPeptide[]
  flags: ScreenFlag[]
  /** Rows that did not match a catalog entry, so no chemistry was computed. */
  unresolved: string[]
  /** Standing handling notes. These are cautions, not a procedure. */
  notes: ScreenFlag[]
}

export interface BlendMember {
  slug?: string
  name?: string
}

const NOTES: ScreenFlag[] = [
  {
    level: 'info',
    code: 'no-costore',
    title: 'Do not co-store a blend',
    detail:
      'A shared vial is only as stable as its least-stable peptide, and the mixture can no longer be checked against each certificate of analysis.',
  },
  {
    level: 'info',
    code: 'no-shake',
    title: 'Gentle inversion, not shaking',
    detail:
      'Agitation and an air–water interface drive aggregation. Swirl to dissolve. Do not shake.',
  },
  {
    level: 'info',
    code: 'separate-syringes',
    title: 'Separate syringes when a warning fires',
    detail:
      'A warning is a known or predicted physical incompatibility. Keep those peptides in their own syringes. This screen is not a mixing procedure.',
  },
]

function clampPh(pH: number): number {
  if (!Number.isFinite(pH)) return DEFAULT_BUFFER_PH
  return Math.min(14, Math.max(0, pH))
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function findPeptide(member: BlendMember): Peptide | undefined {
  const slug = member.slug?.trim()
  if (slug) {
    const bySlug = PEPTIDES.find((p) => p.slug === slug)
    if (bySlug) return bySlug
  }
  const name = member.name ? norm(member.name) : ''
  if (!name) return undefined
  return PEPTIDES.find(
    (p) =>
      p.slug === name ||
      norm(p.name) === name ||
      (p.aliases ?? []).some((a) => norm(a) === name),
  )
}

function modsFor(peptide: Peptide, parsed: ParsedChain): ChargeMods {
  const features = peptide.syntheticFeatures ?? []
  const cys = parsed.codes.filter((c) => c === 'C').length
  let disulfideCysteines = parsed.disulfideCysteines
  if (
    disulfideCysteines === 0 &&
    cys >= 2 &&
    (features.includes('Disulfide bridge') ||
      features.includes('Multiple disulfides'))
  ) {
    disulfideCysteines = cys - (cys % 2)
  }
  const lys = parsed.codes.filter((c) => c === 'K').length
  const blockedLysines = features.includes('Fatty-acid acylation')
    ? Math.min(1, lys)
    : 0
  return {
    acetylN: parsed.acetylN,
    amideC: parsed.amideC,
    pyroGluN: parsed.pyroGluN,
    blockedLysines,
    disulfideCysteines,
  }
}

function hasCopper(peptide: Peptide): boolean {
  return (
    peptide.slug === 'ghk-cu' ||
    (peptide.syntheticFeatures ?? []).includes('Copper complex')
  )
}

interface Resolved {
  peptide: Peptide | null
  label: string
  codes: string[]
  charge: number | null
  pi: number | null
  gravy: number | null
  cysteines: number
  /** Cysteines not named as a disulfide. Copper and thiol flags use this. */
  freeCysteines: number
}

function resolve(member: BlendMember, pH: number): Resolved {
  const peptide = findPeptide(member) ?? null
  const label = member.name?.trim() || peptide?.name || 'Unnamed peptide'
  const parsed = peptide ? parseCatalogChain(peptide.sequence ?? '') : null
  const codes = parsed?.codes ?? []
  const cysteines = codes.filter((c) => c === 'C').length
  if (!peptide || !parsed || codes.length === 0) {
    return {
      peptide,
      label,
      codes,
      charge: null,
      pi: null,
      gravy: null,
      cysteines: 0,
      freeCysteines: 0,
    }
  }
  const mods = modsFor(peptide, parsed)
  const freeCysteines = Math.max(0, cysteines - (mods.disulfideCysteines ?? 0))
  return {
    peptide,
    label,
    codes,
    charge: chargeAtPH(codes, pH, mods),
    pi: isoelectricPoint(codes, mods),
    gravy: gravy(codes),
    cysteines,
    freeCysteines,
  }
}

// A blend has no single sequence to score, so screen the chemistry of each
// component it mixes instead of leaving one unresolved "no sequence" row. Any
// catalog entry with a `components` list expands here; CagriSema is kept as an
// explicit case because its monograph deliberately stays out of the components
// cross-link graph (see peptides.test.ts) yet still names its two peptides.
function expandMembers(members: BlendMember[]): BlendMember[] {
  const out: BlendMember[] = []
  for (const member of members) {
    const peptide = findPeptide(member)
    if (peptide?.slug === 'cagrisema') {
      out.push({ slug: 'cagrilintide', name: 'Cagrilintide (in CagriSema)' })
      out.push({ slug: 'semaglutide', name: 'Semaglutide (in CagriSema)' })
      continue
    }
    const components = peptide ? getComponents(peptide) : []
    if (peptide && components.length > 0) {
      for (const c of components) {
        out.push({ slug: c.slug, name: `${c.name} (in ${peptide.name})` })
      }
      continue
    }
    out.push(member)
  }
  return out
}

export function screenBlend(members: BlendMember[], pH: number): BlendScreen {
  const buffer = clampPh(pH)
  const expanded = expandMembers(members)
  const rows = expanded.map((m) => resolve(m, buffer))
  const flags: ScreenFlag[] = []
  const unresolved: string[] = []

  rows.forEach((row, i) => {
    if (!row.peptide) {
      const typed = expanded[i]?.name?.trim()
      if (typed) unresolved.push(typed)
      return
    }
    const features = row.peptide.syntheticFeatures ?? []
    const extract = features.includes('Tissue extract')
    if (extract) {
      flags.push({
        level: 'info',
        code: 'mixture',
        title: `${row.label} is a mixture, not one sequence`,
        detail:
          'A tissue extract has no single chain to score. Charge, pI, and GRAVY do not apply, and a blend cannot be checked against one certificate of analysis.',
      })
    } else if (row.codes.length === 0) {
      flags.push({
        level: 'info',
        code: 'no-sequence',
        title: `${row.label}: no sequence on file`,
        detail:
          'Charge, isoelectric point, and GRAVY were skipped. Labeled incompatibilities still apply when the catalog slug matches.',
      })
    }
    if (row.codes.length > 0 && features.includes('Fatty-acid acylation')) {
      flags.push({
        level: 'info',
        code: 'acylation',
        title: `${row.label}: the fatty-acid lysine is not a free amine`,
        detail:
          'This charge already treats one lysine as neutral. The fatty-acid carboxyls are still not subtracted, so the real charge can be one or two units more negative.',
      })
    }
    if (
      row.codes.length > 0 &&
      /Aib|Nle|as Ala|as Leu|as Met/i.test(row.peptide.sequence ?? '')
    ) {
      flags.push({
        level: 'info',
        code: 'unnatural',
        title: `${row.label}: a nonstandard residue is scored as alanine`,
        detail:
          'Aib and similar residues are written as Ala so the charge model can run. That position stays neutral. Mass and shape are not in this estimate.',
      })
    }
    if (FIBRIL_SLUGS.has(row.peptide.slug)) {
      flags.push({
        level: 'warn',
        code: 'fibril',
        title: `${row.label} gels or fibrillates in water`,
        detail:
          'Published physical instability: this peptide aggregates in aqueous solution. It is a poor candidate for a shared, stored blend.',
      })
    }
    if (row.pi !== null && Math.abs(row.pi - buffer) <= PI_WINDOW) {
      flags.push({
        level: 'caution',
        code: 'near-pi',
        title: `${row.label} is near its isoelectric point`,
        detail: `Estimated pI ${row.pi.toFixed(1)} is within ${PI_WINDOW} pH unit of the buffer (pH ${buffer.toFixed(1)}). Solubility is lowest there, so haze or a gel is more likely.`,
      })
    }
    if (row.gravy !== null && row.gravy >= GRAVY_HYDROPHOBIC) {
      flags.push({
        level: 'caution',
        code: 'hydrophobic',
        title: `${row.label} is strongly hydrophobic`,
        detail: `GRAVY ${row.gravy.toFixed(2)} (Kyte–Doolittle). Hydrophobic sequences self-associate as concentration rises.`,
      })
    }
    if (row.freeCysteines > 0) {
      flags.push({
        level: 'caution',
        code: 'cysteine',
        title: `${row.label} has ${row.freeCysteines} free cysteine${row.freeCysteines === 1 ? '' : 's'}`,
        detail:
          'A free thiol oxidizes, and it can re-pair with a cysteine on another peptide in the same solution.',
      })
    } else if (row.cysteines >= 2) {
      flags.push({
        level: 'info',
        code: 'disulfide',
        title: `${row.label} has ${row.cysteines} cysteines in disulfides`,
        detail:
          'Those cysteines are paired, so they are not counted as titratable thiols. A closed bridge does not scramble until it is reduced.',
      })
    }
  })

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]
      const b = rows[j]
      if (
        a.charge !== null &&
        b.charge !== null &&
        Math.abs(a.charge) >= OPPOSITE_CHARGE_MIN &&
        Math.abs(b.charge) >= OPPOSITE_CHARGE_MIN &&
        Math.sign(a.charge) !== Math.sign(b.charge)
      ) {
        flags.push({
          level: 'warn',
          code: 'opposite-charge',
          title: `${a.label} and ${b.label} carry opposite charge`,
          detail: `At pH ${buffer.toFixed(1)} the estimated net charges are ${a.charge.toFixed(1)} and ${b.charge.toFixed(1)}. Opposite charge can coacervate into a visible gel even when each solution was clear alone.`,
        })
      }
      if (a.peptide && b.peptide) {
        const slugs = new Set([a.peptide.slug, b.peptide.slug])
        for (const pair of LABELED_PAIRS) {
          if (slugs.has(pair.a) && slugs.has(pair.b)) {
            flags.push({
              level: 'warn',
              code: 'labeled-incompatibility',
              title: `${a.label} + ${b.label}: labeled syringe incompatibility`,
              detail: pair.detail,
            })
          }
        }
        const copper = hasCopper(a.peptide)
          ? a
          : hasCopper(b.peptide)
            ? b
            : null
        const other = copper === a ? b : copper === b ? a : null
        if (copper && other && other.freeCysteines > 0) {
          flags.push({
            level: 'caution',
            code: 'copper-thiol',
            title: `${copper.label} can oxidize thiols on ${other.label}`,
            detail:
              'Copper complexes catalyze oxidation of cysteine. That is a chemical interaction, not a labeled incompatibility.',
          })
        }
      }
    }
  }

  const rank: Record<ScreenLevel, number> = { warn: 0, caution: 1, info: 2 }
  flags.sort((x, y) => rank[x.level] - rank[y.level])

  return {
    pH: buffer,
    peptides: rows.map((row) => ({
      slug: row.peptide?.slug ?? null,
      name: row.label,
      hasSequence: row.codes.length > 0,
      charge: row.charge,
      pi: row.pi,
      gravy: row.gravy,
      cysteines: row.cysteines,
    })),
    flags,
    unresolved,
    notes: NOTES,
  }
}
