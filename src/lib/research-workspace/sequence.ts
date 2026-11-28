// Sequence views shared by the comparison dashboard and PeptideForge.
// Hydropathy is Kyte–Doolittle (amino-acids.ts). Charge uses chargeAtPH.

import { AA_BY_CODE, AMINO_ACIDS, gravy, peptideMass } from '@/lib/amino-acids'
import { chargeAtPH, STANDARD_AA, type ChargeMods } from '@/lib/peptide-properties'
import type { DiffCell, MutationDelta } from './types'

export const ATTRIBUTION =
  'Catalog and calculated properties from AmericanPeptide.com (CC BY 4.0). https://americanpeptide.com — computational hypotheses, not medical advice.'

/** Per-residue Kyte–Doolittle values. Index is 1-based sequence position. */
export function hydropathySeries(codes: string[]): { pos: number; kd: number }[] {
  const out: { pos: number; kd: number }[] = []
  codes.forEach((c, i) => {
    const aa = AA_BY_CODE[c]
    if (!aa) return
    out.push({ pos: i + 1, kd: aa.hydropathy })
  })
  return out
}

/**
 * Classic Kyte–Doolittle sliding window. Edge residues use a shorter window
 * so the plot still covers the whole chain.
 */
export function hydropathyWindow(
  codes: string[],
  window = 7,
): { pos: number; kd: number }[] {
  const raw = codes.map((c) => AA_BY_CODE[c]?.hydropathy ?? 0)
  const w = Math.max(1, window)
  return raw.map((_, i) => {
    const half = Math.floor(w / 2)
    const lo = Math.max(0, i - half)
    const hi = Math.min(raw.length, i + half + 1)
    const slice = raw.slice(lo, hi)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    return { pos: i + 1, kd: mean }
  })
}

/** Charge from pH 0 to 14. Step 0.5 keeps the curve smooth without a dense loop. */
export function chargeCurve(
  codes: string[],
  mods: ChargeMods = {},
  step = 0.5,
): { ph: number; charge: number }[] {
  const pts: { ph: number; charge: number }[] = []
  for (let ph = 0; ph <= 14 + 1e-9; ph += step) {
    const rounded = Math.round(ph * 10) / 10
    pts.push({ ph: rounded, charge: chargeAtPH(codes, rounded, mods) })
  }
  return pts
}

/**
 * Global alignment (Needleman–Wunsch, match +1 / mismatch −1 / gap −1).
 * Catalog sequences are short, so the O(n·m) table is fine on the client.
 */
const NAMED: Record<string, string> = {
  ala: 'A', arg: 'R', asn: 'N', asp: 'D', cys: 'C', glu: 'E', gln: 'Q', gly: 'G',
  his: 'H', ile: 'I', leu: 'L', lys: 'K', met: 'M', phe: 'F', pro: 'P', ser: 'S',
  thr: 'T', trp: 'W', tyr: 'Y', val: 'V',
}

/**
 * Residue tokens in catalog order. Standard residues keep a one-letter label.
 * Anything else (D-amino acids written out, linkers, unknown names) stays as
 * written and is marked non-standard so the diff does not pretend it is a
 * substitution of a coded amino acid.
 */
export function residueTokens(raw: string): { label: string; standard: boolean }[] {
  const head = raw.split(' (')[0]?.trim().replace(/-NH2$/i, '').replace(/-NHEt$/i, '') ?? ''
  if (!head) return []
  const parts = head.split('-').map((part) => part.trim()).filter(Boolean)
  const named = parts.some((part) => /[a-z]/.test(part) && part.length > 1)
  if (named) {
    const tokens: { label: string; standard: boolean }[] = []
    for (const part of parts) {
      const key = part.replace(/^D-/i, '').replace(/^L-/i, '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (key === 'ac' || key === 'nh2' || key === 'nhet') continue
      const code = NAMED[key]
      tokens.push(code ? { label: code, standard: true } : { label: part, standard: false })
    }
    return tokens
  }
  const runs = head.match(/[A-Za-z]+/g) ?? []
  return runs.join('').split('').map((letter) => {
    const label = letter.toUpperCase()
    return { label, standard: STANDARD_AA.includes(label) }
  })
}

export function alignSequences(a: string[], b: string[]): DiffCell[] {
  const n = a.length
  const m = b.length
  const score = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 0; i <= n; i++) score[i][0] = -i
  for (let j = 0; j <= m; j++) score[0][j] = -j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = score[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 1 : -1)
      const up = score[i - 1][j] - 1
      const left = score[i][j - 1] - 1
      score[i][j] = Math.max(diag, up, left)
    }
  }
  const cells: DiffCell[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const diag = score[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 1 : -1)
      if (score[i][j] === diag) {
        const left = a[i - 1]
        const right = b[j - 1]
        const standard = left.length === 1 && right.length === 1 && STANDARD_AA.includes(left) && STANDARD_AA.includes(right)
        cells.push({
          a: left,
          b: right,
          kind: left === right ? 'match' : standard ? 'sub' : 'nonstandard',
        })
        i--
        j--
        continue
      }
    }
    if (i > 0 && score[i][j] === score[i - 1][j] - 1) {
      cells.push({ a: a[i - 1], b: '·', kind: 'gap' })
      i--
    } else {
      cells.push({ a: '·', b: b[j - 1], kind: 'gap' })
      j--
    }
  }
  return cells.reverse()
}

const EXPLORER_CODES = ['A', 'G', 'S', 'L', 'F', 'K', 'E', 'C', 'W', 'P']

/** Property deltas for a handful of common substitutions at one index. */
export function mutationDeltas(codes: string[], index: number): MutationDelta[] {
  if (index < 0 || index >= codes.length) return []
  const baseMass = peptideMass(codes)
  const baseGravy = gravy(codes)
  const baseCharge = chargeAtPH(codes, 7.4)
  const out: MutationDelta[] = []
  for (const code of EXPLORER_CODES) {
    if (code === codes[index]) continue
    const next = codes.slice()
    next[index] = code
    const aa = AA_BY_CODE[code]
    out.push({
      code,
      name: aa?.name ?? code,
      dMass: peptideMass(next) - baseMass,
      dGravy: gravy(next) - baseGravy,
      dCharge74: chargeAtPH(next, 7.4) - baseCharge,
    })
  }
  return out
}

export function sequenceCardMarkdown(input: {
  title: string
  sequence: string
  lines: { label: string; value: string }[]
  flags?: string[]
}): string {
  const body = [
    `# ${input.title}`,
    '',
    'Research hypothesis only. Not medical advice. Values are computational estimates and need experimental validation.',
    '',
    '```',
    input.sequence || '(empty)',
    '```',
    '',
    ...input.lines.map((l) => `- **${l.label}:** ${l.value}`),
  ]
  if (input.flags?.length) {
    body.push('', '### Synthesis flags', ...input.flags.map((f) => `- ${f}`))
  }
  body.push('', ATTRIBUTION)
  return body.join('\n')
}

export function rowsToCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`
  const lines = [headers, ...rows].map((r) => r.map(esc).join(','))
  lines.push(`"${ATTRIBUTION.replaceAll('"', '""')}"`)
  return lines.join('\n')
}

export function knownAminoAcids(): typeof AMINO_ACIDS {
  return AMINO_ACIDS
}
