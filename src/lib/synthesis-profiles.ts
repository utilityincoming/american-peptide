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
  liraglutide: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation'],
    notes:
      'Liraglutide is a GLP-1(7-37) analog carrying a C16 palmitoyl chain attached through a γ-glutamate spacer to a lysine, made by solid-phase synthesis. The single fatty-acid acylation is the defining step; over a 31-residue backbone, coupling efficiency and deletion-sequence removal set the purity.',
  },
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
  survodutide: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation', 'Unnatural residue'],
    notes:
      'A ~29-residue glucagon/GLP-1 dual agonist with Aib substitutions and a fatty-acid chain for albumin binding and weekly dosing, built by solid-phase synthesis. The acylation and the sterically hindered Aib couplings are the hard steps, and the length makes deletion-sequence control the dominant purity task.',
  },
  mazdutide: {
    difficulty: 'demanding',
    features: ['Fatty-acid acylation', 'Unnatural residue'],
    notes:
      'An oxyntomodulin-based glucagon/GLP-1 dual agonist, acylated for once-weekly dosing and stabilized with unnatural residues, made by solid-phase synthesis. As with the other long acylated incretins, the fatty-acid step and deletion-sequence control over a long backbone define the quality picture.',
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
  adipotide: {
    difficulty: 'demanding',
    features: ['Disulfide bridge', 'D-amino acid', 'C-terminal amide'],
    notes:
      'Adipotide is a chimeric peptide: a disulfide-cyclized CKGGRAKDC targeting domain joined to an all-D-amino-acid D(KLAKLAK)2 proapoptotic sequence with a C-terminal amide. Assembling two chemically distinct domains, forming the disulfide correctly, and handling the D-residues make it demanding to synthesize and purify cleanly.',
  },
  'hgh-fragment-176-191': {
    difficulty: 'moderate',
    features: ['Disulfide bridge'],
    notes:
      'The C-terminal hGH fragment (residues 176–191), made by solid-phase synthesis as a 16-residue peptide with a single disulfide loop between its two cysteines. The short chain assembles readily; forming and verifying that one disulfide correctly is the defining quality attribute — the same challenge as its analog AOD-9604.',
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
  'b7-33': {
    difficulty: 'moderate',
    features: [],
    notes:
      'B7-33 is a 27-residue single-chain analog of the relaxin-2 B-chain — a deliberate simplification of native relaxin’s two-chain, disulfide-linked structure that makes it a practical linear solid-phase peptide. Coupling efficiency and deletion-sequence removal over its length are the main quality considerations.',
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
  'ara-290': {
    difficulty: 'moderate',
    features: [],
    notes:
      'ARA-290 (cibinetide) is an 11-residue linear peptide with an N-terminal pyroglutamate and a free C-terminus, taken from the helix-B surface of erythropoietin. It is made by routine solid-phase synthesis; forming the pyroglutamate terminus correctly and ordinary deletion-sequence removal are the main quality steps.',
  },
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
  'igf-1-des': {
    difficulty: 'demanding',
    features: ['Recombinant protein', 'Multiple disulfides'],
    notes:
      'DES(1-3)IGF-1 is a 67-residue analog of IGF-1 lacking the N-terminal Gly-Pro-Glu, produced recombinantly and folded to set IGF-1’s three disulfide bonds. As with IGF-1, correct disulfide pairing and refolding are the hard part, verified by peptide mapping and bioassay — biologic manufacturing, not solid-phase synthesis.',
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
  'ghrp-2': {
    difficulty: 'moderate',
    features: ['Unnatural residue', 'D-amino acid', 'C-terminal amide'],
    notes:
      'A hexapeptide amide with two D-amino acids and an unnatural D-2-naphthylalanine at position 2. The chain is short and assembles cleanly by solid-phase synthesis; the quality-defining steps are sourcing and coupling the specialty D-2-Nal building block, controlling racemization at the D-residues, and achieving clean C-terminal amidation.',
  },
  'ghrp-6': {
    difficulty: 'moderate',
    features: ['D-amino acid', 'C-terminal amide'],
    notes:
      'A hexapeptide amide built from standard Fmoc building blocks, including D-Trp and D-Phe. A short, straightforward solid-phase assembly; the main concerns are C-terminal amidation and protecting the oxidation- and light-sensitive tryptophan residues during synthesis and storage.',
  },
  'mk-677': {
    difficulty: 'standard',
    features: ['Small molecule'],
    notes:
      'MK-677 (ibutamoren) is a non-peptide small molecule made by conventional organic synthesis, not solid-phase peptide chemistry, and usually supplied as the mesylate salt. Its quality control is small-molecule-style — identity, related substances, residual solvents — rather than a peptide purity number.',
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
  humanin: {
    difficulty: 'demanding',
    features: [],
    notes:
      'Humanin is a 24-residue mitochondrial-derived peptide with a hydrophobic, aggregation-prone core and both a methionine and a cysteine that are oxidation-sensitive. It is made by solid-phase synthesis, where the length, the difficult hydrophobic stretch, and protecting Met / Cys from oxidation make clean assembly and purification the demanding part.',
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
  glutathione: {
    difficulty: 'standard',
    features: [],
    notes:
      'Glutathione (γ-Glu-Cys-Gly) is a tripeptide with an unusual side-chain (γ-glutamyl) bond and a free, oxidation-prone cysteine thiol; it is produced mainly by fermentation or enzymatic synthesis rather than solid-phase chemistry. Keeping the cysteine reduced — it readily oxidizes to the disulfide GSSG — is the dominant quality and stability concern.',
  },

  // ── Bioregulators (Khavinson short peptides) ──
  epitalon: {
    difficulty: 'standard',
    features: [],
    notes:
      'Epitalon (Ala-Glu-Asp-Gly) is a tetrapeptide made by routine solid-phase synthesis with no disulfides or modifications — among the simplest sequences in the catalog to assemble. Purity is governed by ordinary deletion-sequence and counterion control.',
  },
  endoluten: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Endoluten is a natural pineal peptide complex — an extracted, fractionated polypeptide preparation rather than a synthesized molecule, and the natural counterpart to the synthetic tetrapeptide Epitalon. As with Thymalin and the other Cytomax extracts, consistency and characterization of the polypeptide fraction, not coupling chemistry, are the quality challenge.',
  },
  'foxo4-dri': {
    difficulty: 'demanding',
    features: ['D-amino acid'],
    notes:
      'FOXO4-DRI is a long D-retro-inverso peptide — the sequence reversed and built entirely from D-amino acids for protease resistance. Every residue is a specialty D-building block over a long chain, making it a demanding specialty solid-phase synthesis where all-D coupling efficiency and deletion-sequence control dominate.',
  },
  thymalin: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Thymalin is not a defined synthetic peptide but a polypeptide fraction extracted from thymus tissue, so its "synthesis" is really an extraction-and-fractionation process. That makes batch-to-batch consistency and characterization — rather than coupling chemistry — the central quality challenge.',
  },
  thymogen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Thymogen (glutamyl-tryptophan) is a dipeptide — one of the simplest defined immunopeptides — made trivially by solution or solid-phase synthesis. Protecting the oxidation-sensitive tryptophan and controlling the counterion are the only real considerations; there is essentially no synthetic difficulty.',
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
  testagen: {
    difficulty: 'standard',
    features: [],
    notes:
      'Testagen (Lys-Glu-Asp-Gly) is a tetrapeptide made by routine solid-phase synthesis with no disulfides or modifications, like the other Khavinson short peptides. Purity is governed by ordinary deletion-sequence and counterion control.',
  },
  prostamax: {
    difficulty: 'standard',
    features: [],
    notes:
      'Prostamax (Lys-Glu-Asp-Pro) is a tetrapeptide made by routine solid-phase synthesis; the proline residue is a standard building block, so assembly is straightforward and quality hinges on deletion-sequence and counterion control.',
  },
  vladonix: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Vladonix is a natural thymus peptide extract (complex A-6), not a synthesized molecule — a fractionated polypeptide preparation like Thymalin, where batch-to-batch consistency and characterization, not coupling chemistry, are the quality challenge.',
  },
  ventfort: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Ventfort is a natural blood-vessel peptide extract (complex A-3), a fractionated polypeptide preparation rather than a synthesized peptide. As with the other Cytomax extracts, consistency and characterization of the fraction are the quality challenge.',
  },
  chelohart: {
    difficulty: 'moderate',
    features: ['Tissue extract'],
    notes:
      'Chelohart is a natural cardiac-muscle peptide extract (complex A-14), a fractionated polypeptide preparation rather than a synthesized peptide. Consistency and characterization of the extract, not coupling chemistry, determine its quality.',
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
  cerebrolysin: { difficulty: 'demanding', features: ['Tissue extract'] },
  dihexa: {
    difficulty: 'moderate',
    features: ['Unnatural residue'],
    notes:
      'Dihexa is a peptidomimetic — a modified dipeptide core (Tyr-Ile) capped with an N-terminal hexanoyl group and a C-terminal 6-aminohexanoic amide — rather than a standard peptide. It is assembled by short solid-phase / solution steps, but the non-amino-acid caps mean its identity and related-substance control resemble small-molecule QC as much as peptide purity.',
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
  argireline: {
    difficulty: 'moderate',
    features: ['N-terminal acetylation', 'C-terminal amide'],
    notes:
      'Argireline (acetyl hexapeptide-8) is a short N-acetylated, C-terminally amidated hexapeptide made by routine solid-phase synthesis. The two end modifications are the defining steps; the sequence is otherwise straightforward, and the acetate counterion and residual solvents dominate cosmetic-grade QC.',
  },
  'snap-8': {
    difficulty: 'moderate',
    features: ['N-terminal acetylation', 'C-terminal amide'],
    notes:
      'SNAP-8 (acetyl octapeptide-3) is the eight-residue analog of Argireline, N-acetylated and C-terminally amidated, made by solid-phase synthesis. The two extra residues add little difficulty; as with Argireline the terminal modifications and counterion control are the quality-defining features.',
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
  gonadorelin: {
    difficulty: 'moderate',
    features: ['C-terminal amide'],
    notes:
      'Gonadorelin is the native GnRH decapeptide: an N-terminal pyroglutamate, a C-terminal glycinamide, and otherwise standard residues. Solid-phase assembly is routine, but the pyroglutamate terminus and the C-terminal amide are the two features that must be formed correctly, and the internal Ser/Tyr residues make byproduct control the main purity task.',
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
  vip: {
    difficulty: 'demanding',
    features: ['C-terminal amide'],
    notes:
      'VIP is a 28-residue C-terminally amidated neuropeptide of the secretin/glucagon family, made by solid-phase synthesis. The length drives deletion-sequence accumulation and the sequence is aggregation-prone, so coupling efficiency, the C-terminal amidation, and preparative-HPLC purification together define the quality picture.',
  },
  ghrelin: { difficulty: 'demanding', features: ['Fatty-acid acylation'] },
}
