// Per-peptide "born here" story.
//
// A deterministic narrative that connects the general synthesis pipeline
// (see /synthesis) to the specific molecule a visitor is looking at. Every
// claim is derived from that peptide's own catalog fields (sequence, formula,
// molecular weight, and its own descriptive text) plus well-established peptide
// chemistry — nothing about a specific manufacturer or batch is invented.
//
// Where data is missing or a sequence can't be parsed reliably (modified or
// three-letter notation), the story degrades gracefully and never asserts a
// number it can't stand behind.

import type { Peptide } from './peptides'

export interface StoryBeat {
  /** Slug of the matching /synthesis stage, for a deep-link anchor. */
  stage: string
  /** Lucide icon name, resolved in the component. */
  icon: string
  title: string
  body: string
}

export interface PeptideStory {
  intro: string
  beats: StoryBeat[]
}

const STANDARD_AA = 'ACDEFGHIKLMNPQRSTVWY'

interface SequenceInfo {
  /** Exact residue count — only set when the sequence is clean one-letter code. */
  residueCount?: number
  /** True when the sequence is a clean run of standard one-letter residues. */
  clean: boolean
  amidated: boolean
  cys: number
  /** Oxidation-prone residues (Met + Trp), counted only for clean sequences. */
  oxidationProne: number
  hasDAmino: boolean
  hasNonNatural: boolean
}

function analyzeSequence(seq?: string): SequenceInfo | null {
  if (!seq) return null
  const raw = seq.trim()
  if (!raw) return null

  const amidated = /-?NH2$/i.test(raw)
  // Strip C-terminal group annotations before parsing the residue body.
  const core = raw.replace(/-?NH2$/i, '').replace(/-?OH$/i, '')

  if (!core.includes('-')) {
    const up = core.toUpperCase()
    const clean = up.length > 0 && [...up].every((ch) => STANDARD_AA.includes(ch))
    if (clean) {
      const count = (ch: string) => [...up].filter((c) => c === ch).length
      return {
        residueCount: up.length,
        clean: true,
        amidated,
        cys: count('C'),
        oxidationProne: count('M') + count('W'),
        hasDAmino: false,
        hasNonNatural: false,
      }
    }
  }

  // Modified / three-letter notation — don't assert an exact count.
  return {
    residueCount: undefined,
    clean: false,
    amidated,
    cys: 0,
    oxidationProne: 0,
    hasDAmino: /(^|-)D-/.test(core),
    hasNonNatural: /(Aib|Nal|MeTrp|Dmt|Cit|Orn|hArg|Sar|Cha|MeLys|MeArg)/i.test(core),
  }
}

/** Plain-English modifications detected from the peptide's own catalog text. */
function detectModifications(p: Peptide): string[] {
  const text = [
    p.description,
    p.mechanism ?? '',
    ...(p.background ?? []),
    p.synthesisNotes ?? '',
  ]
    .join(' ')
    .toLowerCase()

  const mods: string[] = []
  if (/acylat|fatty[- ]?acid|palmit|lipidat|c18|c16/.test(text)) mods.push('fatty-acid acylation')
  if (/cyclic|cyclized|cyclization|lactam/.test(text)) mods.push('cyclization')
  if (/disulfide/.test(text)) mods.push('a disulfide bridge')
  if (/pegylat|peg-/.test(text)) mods.push('PEGylation')
  return mods
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function buildPeptideStory(p: Peptide): PeptideStory {
  const seq = analyzeSequence(p.sequence)
  const mods = detectModifications(p)
  const mw = p.molecularWeight

  // ── Intro ──
  const intro = `Behind every vial of ${p.name} is the same exacting pipeline every research peptide runs — but the chemistry plays out differently for this molecule. Here is how ${p.name}, specifically, is brought into being.`

  const beats: StoryBeat[] = []

  // ── Beat 1 · On paper (design) ──
  {
    const parts: string[] = []
    if (p.molecularFormula && mw) {
      parts.push(
        `On paper, ${p.name} is ${p.molecularFormula} — about ${mw.toLocaleString()} daltons of precisely arranged atoms.`,
      )
    } else if (mw) {
      parts.push(`On paper, ${p.name} weighs in at roughly ${mw.toLocaleString()} daltons.`)
    } else {
      parts.push(`${p.name} begins not as a powder but as a specification.`)
    }
    parts.push(
      'Before a single bond is made, the target sequence, salt form, and purity threshold are written down as the contract the finished material must meet.',
    )
    beats.push({
      stage: 'design',
      icon: 'PencilRuler',
      title: 'On paper first',
      body: parts.join(' '),
    })
  }

  // ── Beat 2 · Assembly (SPPS) ──
  {
    const parts: string[] = []
    if (seq?.residueCount) {
      const n = seq.residueCount
      parts.push(
        `Assembling ${p.name} means roughly ${n} coupling cycles on the synthesizer — one protected residue added at a time, which is also ${n} chances for an incomplete coupling to seed a deletion impurity.`,
      )
      if (n > 30) {
        parts.push(
          'At this length the growing chain is prone to aggregation on the resin, making every later cycle harder — long sequences are where small per-cycle losses compound into a messy crude.',
        )
      } else if (n <= 10) {
        parts.push(
          'It is a short sequence, which makes the build comparatively tractable — but short does not mean trivial, and purity is still won or lost downstream.',
        )
      }
    } else if (seq && !seq.clean) {
      const traits: string[] = []
      if (seq.hasDAmino) traits.push('D-amino acids')
      if (seq.hasNonNatural) traits.push('non-natural residues')
      if (traits.length) {
        parts.push(
          `${p.name}'s chain is short but unusual — it carries ${listJoin(traits)} that help it resist enzymatic breakdown, but demand specialized, costlier building blocks and careful coupling on the synthesizer.`,
        )
      } else {
        parts.push(
          `${p.name} is built one protected residue at a time by solid-phase synthesis, each cycle a deprotection, a coupling, and a wash.`,
        )
      }
    } else {
      parts.push(
        `${p.name} is assembled by solid-phase peptide synthesis — the chain grows one protected residue at a time on resin, and what you fail to build cleanly here you pay to remove later.`,
      )
    }
    if (seq?.amidated) {
      parts.push("Its C-terminus is amidated rather than left as a free acid — a defined modification the synthesis has to deliver, not an afterthought.")
    }
    if (mods.length) {
      parts.push(
        `It also carries ${listJoin(mods)}, ${mods.length > 1 ? 'extra steps' : 'an extra step'} beyond a plain chain that ${mods.length > 1 ? 'add' : 'adds'} both capability and cost.`,
      )
    }
    beats.push({
      stage: 'spps',
      icon: 'Cpu',
      title: 'Built residue by residue',
      body: parts.join(' '),
    })
  }

  // ── Beat 3 · Purification ──
  {
    const parts: string[] = [
      `The crude mixture — ${p.name} plus its deletions and side products — is then separated on preparative HPLC, and where the cut is taken decides the difference between a genuinely pure peptide and a barely-passable one.`,
    ]
    if (seq?.cys) {
      parts.push(
        `${p.name} carries ${seq.cys} cysteine${seq.cys > 1 ? 's' : ''}, whose thiol${seq.cys > 1 ? 's are' : ' is'} oxidation-sensitive and can form disulfide links — reactive chemistry that purification has to control rather than ignore.`,
      )
    }
    if (seq?.oxidationProne) {
      parts.push(
        'It also contains oxidation-prone methionine or tryptophan residues, another family of impurities the chromatography has to resolve away.',
      )
    }
    beats.push({
      stage: 'purification',
      icon: 'Filter',
      title: 'Purity is won here',
      body: parts.join(' '),
    })
  }

  // ── Beat 4 · Proof (QC / COA) ──
  {
    const parts: string[] = []
    if (mw) {
      parts.push(
        `A real batch of ${p.name} proves itself: identity confirmed by mass spectrometry against its ~${mw.toLocaleString()} Da, purity read directly off an analytical HPLC trace, water and counterion content measured.`,
      )
    } else {
      parts.push(
        `A real batch of ${p.name} proves itself: identity confirmed by mass spectrometry, purity read directly off an analytical HPLC trace, water and counterion content measured.`,
      )
    }
    parts.push(
      `That batch-specific certificate of analysis is the only honest way to know what is actually in a vial of ${p.name} — and a short, cold, accountable chain of custody is how that purity survives the trip to your bench.`,
    )
    beats.push({
      stage: 'qc',
      icon: 'FileCheck2',
      title: 'Proven, then protected',
      body: parts.join(' '),
    })
  }

  return { intro, beats }
}
