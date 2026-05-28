// Amino-acid reference data for the PeptideForge builder.
//
// Masses are average residue masses (Da) — i.e. the mass each residue
// contributes to a polypeptide chain (free amino acid minus one water).
// Peptide mass = Σ residue masses + one water (18.01528) for the termini.

export type AACategory = 'nonpolar' | 'polar' | 'acidic' | 'basic'

export interface AminoAcid {
  code: string // single-letter
  three: string // three-letter
  name: string
  category: AACategory
  /** Average residue mass in Daltons. */
  residueMass: number
  /** Kyte–Doolittle hydropathy index (higher = more hydrophobic). */
  hydropathy: number
  /** Formal charge contribution at physiological pH (~7.4). */
  charge: -1 | 0 | 1
  /** Aromatic side chain (Phe/Trp/Tyr/His). */
  aromatic: boolean
}

export const WATER_MASS = 18.01528

export const AMINO_ACIDS: AminoAcid[] = [
  { code: 'A', three: 'Ala', name: 'Alanine',       category: 'nonpolar', residueMass: 71.0788,  hydropathy: 1.8,  charge: 0,  aromatic: false },
  { code: 'R', three: 'Arg', name: 'Arginine',      category: 'basic',    residueMass: 156.1875, hydropathy: -4.5, charge: 1,  aromatic: false },
  { code: 'N', three: 'Asn', name: 'Asparagine',    category: 'polar',    residueMass: 114.1038, hydropathy: -3.5, charge: 0,  aromatic: false },
  { code: 'D', three: 'Asp', name: 'Aspartate',     category: 'acidic',   residueMass: 115.0886, hydropathy: -3.5, charge: -1, aromatic: false },
  { code: 'C', three: 'Cys', name: 'Cysteine',      category: 'polar',    residueMass: 103.1388, hydropathy: 2.5,  charge: 0,  aromatic: false },
  { code: 'E', three: 'Glu', name: 'Glutamate',     category: 'acidic',   residueMass: 129.1155, hydropathy: -3.5, charge: -1, aromatic: false },
  { code: 'Q', three: 'Gln', name: 'Glutamine',     category: 'polar',    residueMass: 128.1307, hydropathy: -3.5, charge: 0,  aromatic: false },
  { code: 'G', three: 'Gly', name: 'Glycine',       category: 'nonpolar', residueMass: 57.0519,  hydropathy: -0.4, charge: 0,  aromatic: false },
  { code: 'H', three: 'His', name: 'Histidine',     category: 'basic',    residueMass: 137.1411, hydropathy: -3.2, charge: 1,  aromatic: true  },
  { code: 'I', three: 'Ile', name: 'Isoleucine',    category: 'nonpolar', residueMass: 113.1594, hydropathy: 4.5,  charge: 0,  aromatic: false },
  { code: 'L', three: 'Leu', name: 'Leucine',       category: 'nonpolar', residueMass: 113.1594, hydropathy: 3.8,  charge: 0,  aromatic: false },
  { code: 'K', three: 'Lys', name: 'Lysine',        category: 'basic',    residueMass: 128.1741, hydropathy: -3.9, charge: 1,  aromatic: false },
  { code: 'M', three: 'Met', name: 'Methionine',    category: 'nonpolar', residueMass: 131.1926, hydropathy: 1.9,  charge: 0,  aromatic: false },
  { code: 'F', three: 'Phe', name: 'Phenylalanine', category: 'nonpolar', residueMass: 147.1766, hydropathy: 2.8,  charge: 0,  aromatic: true  },
  { code: 'P', three: 'Pro', name: 'Proline',       category: 'nonpolar', residueMass: 97.1167,  hydropathy: -1.6, charge: 0,  aromatic: false },
  { code: 'S', three: 'Ser', name: 'Serine',        category: 'polar',    residueMass: 87.0782,  hydropathy: -0.8, charge: 0,  aromatic: false },
  { code: 'T', three: 'Thr', name: 'Threonine',     category: 'polar',    residueMass: 101.1051, hydropathy: -0.7, charge: 0,  aromatic: false },
  { code: 'W', three: 'Trp', name: 'Tryptophan',    category: 'nonpolar', residueMass: 186.2132, hydropathy: -0.9, charge: 0,  aromatic: true  },
  { code: 'Y', three: 'Tyr', name: 'Tyrosine',      category: 'polar',    residueMass: 163.1760, hydropathy: -1.3, charge: 0,  aromatic: true  },
  { code: 'V', three: 'Val', name: 'Valine',        category: 'nonpolar', residueMass: 99.1326,  hydropathy: 4.2,  charge: 0,  aromatic: false },
]

export const AA_BY_CODE: Record<string, AminoAcid> = Object.fromEntries(
  AMINO_ACIDS.map((aa) => [aa.code, aa]),
)

export interface CategoryMeta {
  id: AACategory
  label: string
  /** Tailwind text colour class for chips/labels. */
  text: string
  /** Tailwind border colour class. */
  border: string
  /** Faint background (chips). */
  bg: string
  /** Solid background (composition bars, legend dots). */
  solid: string
  /** Hover background (palette buttons). */
  hoverBg: string
}

// NOTE: every class string below is written as a complete literal so the
// Tailwind v4 scanner can see it. Do not build these via string
// concatenation/replacement in components — generated classes won't exist.
export const AA_CATEGORIES: CategoryMeta[] = [
  {
    id: 'nonpolar',
    label: 'Nonpolar',
    text: 'text-[#2DD4A8]',
    border: 'border-[#2DD4A8]/35',
    bg: 'bg-[#2DD4A8]/[0.10]',
    solid: 'bg-[#2DD4A8]/70',
    hoverBg: 'hover:bg-[#2DD4A8]/[0.10]',
  },
  {
    id: 'polar',
    label: 'Polar',
    text: 'text-sky-300',
    border: 'border-sky-400/35',
    bg: 'bg-sky-400/[0.10]',
    solid: 'bg-sky-400/70',
    hoverBg: 'hover:bg-sky-400/[0.10]',
  },
  {
    id: 'acidic',
    label: 'Acidic (−)',
    text: 'text-rose-300',
    border: 'border-rose-400/35',
    bg: 'bg-rose-400/[0.10]',
    solid: 'bg-rose-400/70',
    hoverBg: 'hover:bg-rose-400/[0.10]',
  },
  {
    id: 'basic',
    label: 'Basic (+)',
    text: 'text-violet-300',
    border: 'border-violet-400/35',
    bg: 'bg-violet-400/[0.10]',
    solid: 'bg-violet-400/70',
    hoverBg: 'hover:bg-violet-400/[0.10]',
  },
]

export const CATEGORY_BY_ID: Record<AACategory, CategoryMeta> =
  Object.fromEntries(AA_CATEGORIES.map((c) => [c.id, c])) as Record<
    AACategory,
    CategoryMeta
  >

// ─── Derived metrics ────────────────────────────────────────────────────────

export interface SequenceStats {
  length: number
  mass: number // Da
  gravy: number // grand average of hydropathy
  netCharge: number
  counts: Record<AACategory, number>
  aromatic: number
  cysteines: number
  distinctCategories: number
}

/** Average molecular mass of a peptide built from single-letter codes. */
export function peptideMass(codes: string[]): number {
  if (codes.length === 0) return 0
  const sum = codes.reduce(
    (acc, c) => acc + (AA_BY_CODE[c]?.residueMass ?? 0),
    0,
  )
  return sum + WATER_MASS
}

/** Grand average of hydropathy (GRAVY). */
export function gravy(codes: string[]): number {
  if (codes.length === 0) return 0
  const sum = codes.reduce(
    (acc, c) => acc + (AA_BY_CODE[c]?.hydropathy ?? 0),
    0,
  )
  return sum / codes.length
}

/** Net formal charge at physiological pH (simplified count of K/R/H vs D/E). */
export function netCharge(codes: string[]): number {
  return codes.reduce((acc, c) => acc + (AA_BY_CODE[c]?.charge ?? 0), 0)
}

export function sequenceStats(codes: string[]): SequenceStats {
  const counts: Record<AACategory, number> = {
    nonpolar: 0,
    polar: 0,
    acidic: 0,
    basic: 0,
  }
  let aromatic = 0
  let cysteines = 0
  for (const c of codes) {
    const aa = AA_BY_CODE[c]
    if (!aa) continue
    counts[aa.category] += 1
    if (aa.aromatic) aromatic += 1
    if (aa.code === 'C') cysteines += 1
  }
  const distinctCategories = (Object.values(counts) as number[]).filter(
    (n) => n > 0,
  ).length

  return {
    length: codes.length,
    mass: peptideMass(codes),
    gravy: gravy(codes),
    netCharge: netCharge(codes),
    counts,
    aromatic,
    cysteines,
    distinctCategories,
  }
}

/** Convert single-letter codes to a hyphenated three-letter string. */
export function toThreeLetter(codes: string[]): string {
  return codes
    .map((c) => AA_BY_CODE[c]?.three ?? 'Xaa')
    .join('-')
}
