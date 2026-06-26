// Synthesis profile dimension for the catalog.
//
// One reviewable table of the *synthetic* facts about each peptide — the
// structural features that shape how it is made, a relative difficulty grade,
// and (for entries that don't already carry an inline synthesisNotes in
// peptides.ts) a backfilled note. This is merged into each Peptide by enrich()
// in peptides.ts; inline seed values always win, so a per-entry override in
// peptides.ts takes precedence over anything here.
//
// `features` uses the controlled SyntheticFeature vocabulary so the catalog can
// be browsed by what actually makes a sequence hard to make. `difficulty` is a
// coarse, honest grade (standard / moderate / demanding) of synthesizing and
// purifying to a genuine spec — not a quality or efficacy judgement.

import type { SyntheticFeature, SynthesisDifficulty } from './peptides'

export interface SynthesisProfile {
  difficulty: SynthesisDifficulty
  features: SyntheticFeature[]
  /** Backfilled only for entries without an inline synthesisNotes in peptides.ts. */
  notes?: string
}

export const SYNTHESIS_PROFILES: Record<string, SynthesisProfile> = {
  // ── Metabolic ──
  semaglutide: { difficulty: 'demanding', features: ['Fatty-acid acylation', 'Unnatural residue'] },
  tirzepatide: { difficulty: 'demanding', features: ['Fatty-acid acylation', 'Unnatural residue'] },
  retatrutide: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation', 'Albumin-binding linker', 'Unnatural residue'],
    notes:
      'A ~39-residue triple (GIP/GLP-1/glucagon) agonist built by solid-phase synthesis with Aib substitutions and a fatty-diacid chain on a side-chain lysine that binds albumin for once-weekly dosing. The acylation step and the sterically hindered Aib couplings are the hard parts, and the long sequence makes deletion-sequence control the dominant purity problem.',
  },
  cagrilintide: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation', 'Disulfide bridge', 'C-terminal amide'],
    notes:
      'A long-acting amylin analog: a disulfide-bridged, C-terminally amidated peptide carrying a fatty-diacid acylation for albumin binding. Synthesis combines a regioselective disulfide formation with the acylation over an aggregation-prone backbone, so oxidation control and separating closely related isomers dominate the quality picture.',
  },
  insulin: { difficulty: 'demanding', features: ['Recombinant protein', 'Multiple disulfides'] },
  glucagon: { difficulty: 'moderate', features: [] },
  tesamorelin: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation'],
    notes:
      'A GRF(1–44) analog carrying an N-terminal trans-3-hexenoyl group, made by solid-phase synthesis. The 44-residue length drives deletion-sequence accumulation and the N-terminal acylation is an added step — together making it one of the more demanding secretagogue syntheses.',
  },
  'aod-9604': {
    difficulty: 'moderate',
    features: ['Disulfide bridge'],
    notes:
      'AOD-9604 is the hGH(177–191) fragment with an added N-terminal tyrosine and a single disulfide loop (Cys182–Cys189). The short chain is straightforward to assemble, but that disulfide must be formed and verified correctly — its connectivity is the defining quality attribute.',
  },
  '5-amino-1mq': {
    difficulty: 'standard',
    features: ['Small molecule'],
    notes:
      '5-Amino-1MQ is a small organic molecule (a 1-methylquinolinium), not a peptide — it is produced by conventional organic synthesis, not solid-phase peptide chemistry. Its quality control is small-molecule-style (identity, related substances, residual solvents) rather than peptide purity.',
  },

  // ── Healing & repair ──
  'bpc-157': { difficulty: 'standard', features: [] },
  'tb-500': {
    difficulty: 'moderate',
    features: ['N-terminal acetylation'],
    notes:
      'TB-500 is the synthesized active fragment of thymosin β4, typically N-terminally acetylated. It is a linear sequence by solid-phase synthesis with no disulfides, so the main challenges are coupling efficiency over its length and removing deletion sequences during preparative HPLC.',
  },
  'ghk-cu': {
    difficulty: 'moderate',
    features: ['Copper complex'],
    notes:
      'GHK is a simple tripeptide (Gly-His-Lys) made readily by solid-phase synthesis; the defining step is complexation with copper(II) to form the active GHK-Cu coordination complex. Controlling copper stoichiometry and the 1:1 complex — rather than the peptide synthesis itself — is what determines identity and consistency.',
  },
  'ahk-cu': {
    difficulty: 'moderate',
    features: ['Copper complex'],
    notes:
      'AHK (Ala-His-Lys) is a short tripeptide synthesized conventionally and then complexed with copper(II). As with GHK-Cu, the quality-defining step is the copper coordination — stoichiometry and complex purity — not the peptide assembly.',
  },
  matrixyl: {
    difficulty: 'moderate',
    features: ['Fatty-acid acylation'],
    notes:
      'Matrixyl is palmitoyl pentapeptide-4 — a five-residue sequence with a C16 palmitoyl group on the N-terminus to make it lipophilic enough to penetrate skin. The fatty-acid acylation is the characteristic step; the short peptide core is otherwise straightforward solid-phase chemistry.',
  },
  epo: { difficulty: 'demanding', features: ['Recombinant protein', 'Glycosylated', 'Multiple disulfides'] },
  'll-37': {
    difficulty: 'demanding',
    features: [],
    notes:
      'LL-37 is a 37-residue cationic cathelicidin — long, highly charged, and prone to aggregation and on-resin difficulties, making it one of the more demanding linear peptides to synthesize and purify cleanly. Membrane-active sequences like this also require careful endotoxin and counterion control.',
  },
  kpv: {
    difficulty: 'standard',
    features: [],
    notes:
      'KPV (Lys-Pro-Val) is the C-terminal tripeptide of α-MSH, made trivially by solid-phase synthesis. With no modifications, quality is a matter of identity and counterion control rather than synthetic difficulty.',
  },

  // ── Growth hormone axis ──
  teriparatide: { difficulty: 'moderate', features: ['Recombinant protein'] },
  somatropin: { difficulty: 'demanding', features: ['Recombinant protein', 'Multiple disulfides'] },
  'igf-1': { difficulty: 'demanding', features: ['Recombinant protein', 'Multiple disulfides'] },
  'igf-1-lr3': {
    difficulty: 'demanding',
    features: ['Recombinant protein', 'Multiple disulfides'],
    notes:
      'IGF-1 LR3 is an 83-residue recombinant analog of IGF-1 (Arg3 substitution plus a 13-residue N-terminal extension) expressed in E. coli, then folded to set its three disulfide bonds. As a folded multi-disulfide protein the hard part is correct disulfide pairing and refolding, verified by peptide mapping and bioassay — biologic manufacturing, not solid-phase synthesis.',
  },
  mgf: {
    difficulty: 'moderate',
    features: [],
    notes:
      'MGF (mechano growth factor) is the C-terminal peptide of an IGF-1 splice variant, usually made by solid-phase synthesis as a ~24-residue peptide (a PEGylated, stabilized variant also exists). Its length and a basic, aggregation-prone sequence make coupling and purification the limiting steps.',
  },
  'cjc-1295-no-dac': {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'C-terminal amide'],
    notes:
      'Also called modified GRF(1–29): a 29-residue GHRH analog with four substitutions (including Aib) that resist DPP-4 cleavage, made by solid-phase synthesis with a C-terminal amide. The hindered Aib couplings and the amidation are the notable steps.',
  },
  'cjc-1295-with-dac': {
    difficulty: 'demanding',
    features: ['Unnatural residue', 'Albumin-binding linker', 'C-terminal amide'],
    notes:
      'The DAC ("drug affinity complex") version adds a maleimidopropionyl-lysine to the modified GRF(1–29) backbone that binds covalently to circulating albumin, stretching the half-life to days. Installing and preserving the reactive maleimide linker is the distinctive challenge on top of the Aib-substituted backbone.',
  },
  ipamorelin: {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'D-amino acid', 'C-terminal amide'],
    notes:
      'A pentapeptide growth-hormone secretagogue with a C-terminal amide and several unnatural residues (Aib, D-2-naphthylalanine, D-phenylalanine). Despite its short length, the D-amino-acid and Aib couplings and the final amidation make it more demanding than a plain pentapeptide.',
  },
  sermorelin: {
    difficulty: 'moderate',
    features: ['C-terminal amide'],
    notes:
      'Sermorelin is GRF(1–29), the shortest fully active fragment of growth-hormone-releasing hormone, made by solid-phase synthesis with a C-terminal amide. It is a clean truncation-to-active-core design; coupling efficiency over 29 residues and the amidation are the main considerations.',
  },
  hexarelin: {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'D-amino acid', 'C-terminal amide'],
    notes:
      'A hexapeptide GHRP with a C-terminal amide and unnatural residues (2-methyl-D-tryptophan, D-2-naphthylalanine). The short chain is offset by difficult D-amino-acid couplings, making purity of the correct diastereomer the key concern.',
  },
  myostatin: { difficulty: 'demanding', features: ['Recombinant protein', 'Multiple disulfides'] },
  follistatin: { difficulty: 'demanding', features: ['Recombinant protein', 'Glycosylated'] },
  apitegromab: { difficulty: 'demanding', features: ['Monoclonal antibody'] },
  trevogrumab: { difficulty: 'demanding', features: ['Monoclonal antibody'] },
  emugrobart: { difficulty: 'demanding', features: ['Monoclonal antibody'] },
  garetosmab: { difficulty: 'demanding', features: ['Monoclonal antibody'] },
  bimagrumab: { difficulty: 'demanding', features: ['Monoclonal antibody'] },

  // ── Mitochondrial ──
  'mots-c': {
    difficulty: 'moderate',
    features: [],
    notes:
      'MOTS-c is a 16-residue mitochondrial-derived peptide made by straightforward solid-phase synthesis with no disulfides or special modifications. Coupling efficiency and HPLC removal of deletion sequences are the limiting factors.',
  },
  'ss-31': {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'D-amino acid', 'C-terminal amide'],
    notes:
      'SS-31 (elamipretide) is a tetrapeptide built around alternating aromatic and basic residues including 2,6-dimethyltyrosine (Dmt) and a D-arginine, with a C-terminal amide. The unnatural Dmt residue and the D-amino acid are the defining synthetic features of an otherwise short peptide.',
  },
  'nad-plus': {
    difficulty: 'standard',
    features: ['Small molecule'],
    notes:
      'NAD+ is a dinucleotide coenzyme, not a peptide; it is produced by enzymatic/fermentation routes and chemical finishing rather than solid-phase synthesis. Stability is the dominant issue — it is hygroscopic and degrades in solution — so handling and assay matter more than synthetic difficulty.',
  },

  // ── Bioregulators (Khavinson short peptides) ──
  epitalon: {
    difficulty: 'standard',
    features: [],
    notes:
      'Epitalon (Ala-Glu-Asp-Gly) is a tetrapeptide made by routine solid-phase synthesis with no disulfides or modifications — among the simplest sequences in the catalog to assemble. Purity is governed by ordinary deletion-sequence and counterion control.',
  },
  thymalin: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Thymalin is not a defined synthetic peptide but a polypeptide fraction extracted from thymus tissue, so its "synthesis" is really an extraction-and-fractionation process. That makes batch-to-batch consistency and characterization — rather than coupling chemistry — the central quality challenge.',
  },
  vilon: {
    difficulty: 'standard',
    features: [],
    notes:
      'Vilon (Lys-Glu) is a dipeptide, the simplest possible defined bioregulator, made trivially by solid-phase or even solution synthesis. Quality is essentially a matter of counterion and residual-solvent control rather than synthetic difficulty.',
  },
  vesugen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Vesugen (Lys-Glu-Asp) is a tripeptide assembled by routine solid-phase synthesis with no modifications. Like the other short Khavinson peptides, purification is straightforward and quality hinges on identity and counterion content.',
  },
  pinealon: {
    difficulty: 'standard',
    features: [],
    notes:
      'Pinealon (Glu-Asp-Arg) is a tripeptide made by standard solid-phase synthesis. With no disulfides or modifications, the limiting quality factors are simple deletion-sequence and salt-form control.',
  },
  bronchogen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Bronchogen (Ala-Glu-Asp-Leu) is a tetrapeptide assembled conventionally by solid-phase synthesis. It carries no special modifications, so synthesis is straightforward and characterization is the main task.',
  },
  cardiogen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Cardiogen (Ala-Glu-Asp-Arg) is a tetrapeptide made by routine solid-phase synthesis with no disulfides or modifications. Quality control is identity- and counterion-focused rather than synthesis-limited.',
  },
  pancragen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Pancragen (Lys-Glu-Asp-Trp) is a tetrapeptide synthesized conventionally; the tryptophan residue calls for care against oxidation during cleavage and storage, but the assembly is otherwise simple.',
  },

  // ── Cognitive ──
  semax: {
    difficulty: 'moderate',
    features: [],
    notes:
      'Semax is a heptapeptide — the ACTH(4–7) fragment extended with a C-terminal Pro-Gly-Pro that confers resistance to enzymatic degradation. It is made by solid-phase synthesis; the proline-rich C-terminus and the oxidation-sensitive methionine are the points to watch.',
  },
  selank: {
    difficulty: 'moderate',
    features: [],
    notes:
      'Selank is a heptapeptide based on the immunopeptide tuftsin, extended with a Pro-Gly-Pro tail for stability and made by solid-phase synthesis. The basic, proline-containing sequence makes coupling and purification the main considerations.',
  },
  dsip: {
    difficulty: 'moderate',
    features: [],
    notes:
      'Delta sleep-inducing peptide is a nonapeptide made by routine solid-phase synthesis with no disulfides or modifications. Its acidic sequence is well-behaved; deletion-sequence removal during HPLC is the principal quality step.',
  },

  // ── Cosmetic / pigmentation ──
  'melanotan-2': {
    difficulty: 'demanding',
    features: ['Cyclic / lactam', 'D-amino acid', 'C-terminal amide'],
    notes:
      'Melanotan II is a cyclic lactam heptapeptide — a side-chain Asp-to-Lys amide bridge closes the ring — incorporating a D-phenylalanine and a C-terminal amide. The lactam cyclization plus the D-residue make it markedly more demanding than a linear peptide of the same length.',
  },
  'melanotan-1': {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'D-amino acid', 'C-terminal amide'],
    notes:
      'Afamelanotide (melanotan-1) is a 13-residue linear α-MSH analog with norleucine and D-phenylalanine substitutions and a C-terminal amide, made by solid-phase synthesis. The unnatural residues and amidation are the defining steps; it avoids the cyclization of melanotan II.',
  },

  // ── Reproductive ──
  'pt-141': {
    difficulty: 'demanding',
    features: ['Cyclic / lactam', 'D-amino acid'],
    notes:
      'Bremelanotide (PT-141) is a cyclic lactam heptapeptide closely related to melanotan II, with a side-chain amide bridge and a D-amino acid but a free C-terminal acid. The lactam cyclization is the key synthetic step and the main determinant of purity.',
  },
  'kisspeptin-10': {
    difficulty: 'moderate',
    features: ['C-terminal amide'],
    notes:
      'Kisspeptin-10 is the 10-residue C-terminal fragment that retains full receptor activity, carrying a C-terminal amide and made by solid-phase synthesis. The C-terminal Phe-amide is essential for activity, so amidation fidelity matters; the sequence is otherwise standard.',
  },
  hcg: { difficulty: 'demanding', features: ['Recombinant protein', 'Glycosylated', 'Multiple disulfides'] },
  oxytocin: { difficulty: 'moderate', features: ['Disulfide bridge', 'C-terminal amide'] },
  fsh: { difficulty: 'demanding', features: ['Recombinant protein', 'Glycosylated', 'Multiple disulfides'] },

  // ── Immune ──
  'thymosin-alpha-1': {
    difficulty: 'moderate',
    features: ['N-terminal acetylation'],
    notes:
      'Thymosin α1 is a 28-residue, N-terminally acetylated peptide made by solid-phase synthesis (or fragment condensation). The N-acetylation is required for activity, and the length makes coupling efficiency and deletion-sequence removal the limiting factors.',
  },

  // ── Peptide hormones (synthesis-framed; inline notes in peptides.ts) ──
  vasopressin: { difficulty: 'moderate', features: ['Disulfide bridge', 'C-terminal amide'] },
  somatostatin: { difficulty: 'moderate', features: ['Disulfide bridge'] },
  calcitonin: { difficulty: 'demanding', features: ['Disulfide bridge', 'C-terminal amide'] },
  amylin: { difficulty: 'demanding', features: ['Disulfide bridge', 'C-terminal amide'] },
  acth: { difficulty: 'demanding', features: [] },
  secretin: { difficulty: 'moderate', features: ['C-terminal amide'] },
  ghrelin: { difficulty: 'demanding', features: ['Fatty-acid acylation'] },
}
