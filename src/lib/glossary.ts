// Peptide-research glossary for AmericanPeptide.com.
//
// Definitional reference content — targets long-tail "what is X" queries and
// reinforces the education positioning. Each term cross-links into the catalog
// and research-area pages, extending the internal-link graph.
//
// Cross-link slugs (relatedPeptides / relatedAreas) are resolved + filtered at
// render time, so a stale reference simply doesn't render — never a broken link.

export type GlossaryCategory =
  | 'dosing'
  | 'chemistry'
  | 'biology'
  | 'identifiers'
  | 'research'

export interface GlossaryCategoryMeta {
  id: GlossaryCategory
  label: string
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryMeta[] = [
  { id: 'dosing', label: 'Dosing & Preparation' },
  { id: 'chemistry', label: 'Peptide Chemistry' },
  { id: 'biology', label: 'Mechanisms & Biology' },
  { id: 'identifiers', label: 'Identifiers & Standards' },
  { id: 'research', label: 'Research & Regulatory' },
]

export const GLOSSARY_CATEGORY_BY_ID: Record<
  GlossaryCategory,
  GlossaryCategoryMeta
> = Object.fromEntries(
  GLOSSARY_CATEGORIES.map((c) => [c.id, c]),
) as Record<GlossaryCategory, GlossaryCategoryMeta>

export interface GlossaryTerm {
  slug: string
  term: string
  /** Short form rendered as a badge (e.g. "GLP-1", "Da"). */
  abbr?: string
  category: GlossaryCategory
  /** One-line summary — used for cards and meta description. */
  short: string
  /** Full definition (1–3 sentences). */
  definition: string
  /** Alternate names — feeds search + DefinedTerm alternateName. */
  aliases?: string[]
  /** Related glossary slugs. */
  relatedTerms?: string[]
  /** Related research-area slugs. */
  relatedAreas?: string[]
  /** Related catalog peptide slugs. */
  relatedPeptides?: string[]
}

export const GLOSSARY: GlossaryTerm[] = [
  // ── Dosing & Preparation ──────────────────────────────────────────────────
  {
    slug: 'reconstitution',
    term: 'Reconstitution',
    category: 'dosing',
    short: 'Dissolving a freeze-dried peptide in a sterile diluent to a known concentration.',
    definition:
      'Reconstitution is the process of dissolving a lyophilized (freeze-dried) peptide in a sterile diluent — typically bacteriostatic water — to produce a solution of known concentration for research handling. The diluent volume added to a given vial mass sets the resulting concentration.',
    aliases: ['reconstitute', 'mixing'],
    relatedTerms: ['bacteriostatic-water', 'lyophilization', 'concentration'],
  },
  {
    slug: 'bacteriostatic-water',
    term: 'Bacteriostatic Water',
    abbr: 'BAC',
    category: 'dosing',
    short: 'Sterile water with benzyl alcohol that inhibits bacterial growth in multi-use vials.',
    definition:
      'Bacteriostatic water is sterile water containing roughly 0.9% benzyl alcohol, which inhibits bacterial growth and allows a reconstituted vial to be stored and accessed multiple times. It is the most common diluent used when reconstituting research peptides.',
    aliases: ['bac water', 'benzyl alcohol water'],
    relatedTerms: ['reconstitution', 'concentration'],
  },
  {
    slug: 'lyophilization',
    term: 'Lyophilization',
    category: 'dosing',
    short: 'Freeze-drying a peptide into a stable powder for storage.',
    definition:
      'Lyophilization, or freeze-drying, removes water from a frozen peptide under vacuum to yield a stable dry powder. Most research peptides ship lyophilized and are reconstituted before use to maximize shelf life.',
    aliases: ['freeze-drying', 'lyophilized'],
    relatedTerms: ['reconstitution'],
  },
  {
    slug: 'half-life',
    term: 'Half-Life',
    category: 'dosing',
    short: 'The time for a peptide’s circulating concentration to fall by half.',
    definition:
      'Half-life is the time required for the concentration of a compound in circulation to fall by half. It is a key determinant of dosing frequency — engineering strategies such as fatty-acid acylation extend half-life to enable less frequent administration.',
    aliases: ['elimination half-life', 't1/2'],
    relatedTerms: ['acylation', 'dpp-4', 'bioavailability'],
  },
  {
    slug: 'bioavailability',
    term: 'Bioavailability',
    category: 'dosing',
    short: 'The fraction of a dose that reaches circulation intact.',
    definition:
      'Bioavailability is the fraction of an administered dose that reaches systemic circulation in active form. Peptides generally have low oral bioavailability because they are degraded in the gut, which is why most are studied via injectable routes.',
    relatedTerms: ['subcutaneous', 'half-life'],
  },
  {
    slug: 'subcutaneous',
    term: 'Subcutaneous',
    abbr: 'SubQ',
    category: 'dosing',
    short: 'Administration into the fat layer beneath the skin.',
    definition:
      'Subcutaneous means beneath the skin. It is a common route for peptide administration in research because the fat layer allows slow, sustained absorption into circulation.',
    aliases: ['subq', 'sub-q', 'subcutaneous injection'],
    relatedTerms: ['bioavailability'],
  },
  {
    slug: 'concentration',
    term: 'Concentration',
    category: 'dosing',
    short: 'Amount of peptide per unit volume of reconstituted solution.',
    definition:
      'Concentration is the amount of peptide per unit volume of solution, usually expressed in mg/mL. It is set at reconstitution by the ratio of the vial’s peptide mass to the diluent volume added, and determines how much volume corresponds to a given amount.',
    relatedTerms: ['reconstitution', 'bacteriostatic-water'],
  },

  // ── Peptide Chemistry ─────────────────────────────────────────────────────
  {
    slug: 'peptide',
    term: 'Peptide',
    category: 'chemistry',
    short: 'A short chain of amino acids linked by peptide bonds.',
    definition:
      'A peptide is a short chain of amino acids joined by peptide bonds. Chains longer than roughly 50 residues are generally classified as proteins; peptides occupy the smaller end of the spectrum and often act as signaling molecules.',
    relatedTerms: ['amino-acid', 'peptide-bond', 'residue', 'sequence'],
  },
  {
    slug: 'amino-acid',
    term: 'Amino Acid',
    category: 'chemistry',
    short: 'The building-block molecules of peptides and proteins.',
    definition:
      'Amino acids are the building blocks of peptides and proteins. The 20 standard amino acids share a common backbone but differ in their side chains, which determine charge, polarity, and hydrophobicity.',
    relatedTerms: ['peptide', 'residue', 'hydropathy'],
  },
  {
    slug: 'residue',
    term: 'Residue',
    category: 'chemistry',
    short: 'A single amino acid unit within a peptide chain.',
    definition:
      'A residue is a single amino acid unit within a peptide chain. The name reflects that each unit is what remains after a water molecule is lost when the peptide bond forms.',
    relatedTerms: ['amino-acid', 'peptide-bond', 'molecular-weight'],
  },
  {
    slug: 'peptide-bond',
    term: 'Peptide Bond',
    category: 'chemistry',
    short: 'The amide bond linking one amino acid to the next.',
    definition:
      'A peptide bond is the covalent amide bond linking the carboxyl group of one amino acid to the amino group of the next. Forming it releases a water molecule, which is why chain mass is the sum of residue masses plus one water.',
    relatedTerms: ['residue', 'molecular-weight', 'n-terminus', 'c-terminus'],
  },
  {
    slug: 'sequence',
    term: 'Sequence',
    category: 'chemistry',
    short: 'The ordered list of amino acids in a peptide.',
    definition:
      'The sequence is the ordered list of amino acids in a peptide, conventionally written from the N-terminus to the C-terminus using one- or three-letter codes. It determines the molecule’s structure and biological function.',
    relatedTerms: ['amino-acid', 'n-terminus', 'c-terminus'],
  },
  {
    slug: 'molecular-weight',
    term: 'Molecular Weight',
    abbr: 'MW',
    category: 'chemistry',
    short: 'The mass of a molecule, expressed in daltons.',
    definition:
      'Molecular weight is the mass of a molecule, expressed in daltons (Da). For a peptide it is the sum of its residue masses plus one water molecule for the free termini.',
    aliases: ['molar mass', 'mw'],
    relatedTerms: ['dalton', 'residue', 'molecular-formula'],
  },
  {
    slug: 'dalton',
    term: 'Dalton',
    abbr: 'Da',
    category: 'chemistry',
    short: 'The unit of molecular mass.',
    definition:
      'A dalton (Da) is the unified atomic mass unit, a measure of molecular mass approximately equal to the mass of a single hydrogen atom. Peptide masses are commonly reported in daltons or kilodaltons (kDa).',
    relatedTerms: ['molecular-weight'],
  },
  {
    slug: 'gravy',
    term: 'GRAVY',
    category: 'chemistry',
    short: 'Grand Average of Hydropathy — a sequence’s mean hydrophobicity.',
    definition:
      'GRAVY (Grand Average of Hydropathy) is the mean hydropathy value of all residues in a sequence. A positive value indicates an overall hydrophobic peptide, a negative value an overall hydrophilic one.',
    aliases: ['grand average of hydropathy'],
    relatedTerms: ['hydropathy', 'amino-acid'],
  },
  {
    slug: 'hydropathy',
    term: 'Hydropathy',
    category: 'chemistry',
    short: 'How water-attracting or water-repelling an amino acid is.',
    definition:
      'Hydropathy is a scale describing how hydrophobic (water-repelling) or hydrophilic (water-attracting) an amino acid is. The Kyte–Doolittle scale is widely used; hydropathy influences folding, solubility, and membrane interaction.',
    aliases: ['hydrophobicity', 'kyte-doolittle'],
    relatedTerms: ['gravy', 'amino-acid'],
  },
  {
    slug: 'disulfide-bond',
    term: 'Disulfide Bond',
    category: 'chemistry',
    short: 'A covalent bond between two cysteine residues that stabilizes structure.',
    definition:
      'A disulfide bond is a covalent linkage between the sulfur atoms of two cysteine residues. These bonds stabilize the three-dimensional structure of many peptides and proteins, and their formation is a common consideration in synthesis.',
    aliases: ['disulfide bridge', 'cystine bridge'],
    relatedTerms: ['residue', 'sequence'],
  },
  {
    slug: 'n-terminus',
    term: 'N-Terminus',
    category: 'chemistry',
    short: 'The free-amino end of a peptide chain.',
    definition:
      'The N-terminus is the end of a peptide chain bearing a free amino group. By convention it is the start of a written sequence and the first residue synthesized in many chemical methods.',
    aliases: ['amino terminus', 'n-term'],
    relatedTerms: ['c-terminus', 'sequence', 'peptide-bond'],
  },
  {
    slug: 'c-terminus',
    term: 'C-Terminus',
    category: 'chemistry',
    short: 'The free-carboxyl end of a peptide chain.',
    definition:
      'The C-terminus is the end of a peptide chain bearing a free carboxyl group. By convention it is the end of a written sequence; C-terminal amidation is a common modification that affects stability and activity.',
    aliases: ['carboxyl terminus', 'c-term'],
    relatedTerms: ['n-terminus', 'sequence', 'peptide-bond'],
  },
  {
    slug: 'acylation',
    term: 'Acylation',
    category: 'chemistry',
    short: 'Attaching a fatty-acid chain to extend half-life via albumin binding.',
    definition:
      'Acylation is the attachment of a fatty-acid chain to a peptide. It is an engineering strategy that extends half-life by promoting reversible binding to serum albumin — the mechanism behind once-weekly agents such as semaglutide.',
    aliases: ['fatty-acid acylation', 'lipidation'],
    relatedTerms: ['half-life', 'dpp-4'],
    relatedPeptides: ['semaglutide', 'tirzepatide'],
    relatedAreas: ['weight-loss'],
  },

  // ── Mechanisms & Biology ──────────────────────────────────────────────────
  {
    slug: 'agonist',
    term: 'Agonist',
    category: 'biology',
    short: 'A molecule that binds and activates a receptor.',
    definition:
      'An agonist is a molecule that binds a receptor and activates it, producing a biological response. Most therapeutic peptides act as receptor agonists; an antagonist, by contrast, binds without activating.',
    relatedTerms: ['glp-1', 'melanocortin'],
  },
  {
    slug: 'incretin',
    term: 'Incretin',
    category: 'biology',
    short: 'Gut hormones that boost insulin release after eating.',
    definition:
      'Incretins are gut-derived hormones — principally GLP-1 and GIP — that enhance glucose-dependent insulin secretion after a meal. They are the central target of the metabolic peptide class used in diabetes and weight management.',
    relatedTerms: ['glp-1', 'gip', 'dpp-4'],
    relatedAreas: ['weight-loss'],
  },
  {
    slug: 'glp-1',
    term: 'GLP-1',
    abbr: 'GLP-1',
    category: 'biology',
    short: 'Glucagon-like peptide-1, an incretin targeted for diabetes and weight loss.',
    definition:
      'GLP-1 (glucagon-like peptide-1) is an incretin hormone that stimulates insulin, suppresses glucagon, slows gastric emptying, and promotes satiety. GLP-1 receptor agonists are among the most clinically validated metabolic peptides.',
    aliases: ['glucagon-like peptide-1'],
    relatedTerms: ['incretin', 'gip', 'agonist', 'dpp-4'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'retatrutide'],
  },
  {
    slug: 'gip',
    term: 'GIP',
    abbr: 'GIP',
    category: 'biology',
    short: 'Glucose-dependent insulinotropic polypeptide, a second incretin.',
    definition:
      'GIP (glucose-dependent insulinotropic polypeptide) is an incretin that, alongside GLP-1, enhances insulin secretion. Dual GLP-1/GIP agonists such as tirzepatide engage both pathways for greater metabolic effect.',
    aliases: ['glucose-dependent insulinotropic polypeptide'],
    relatedTerms: ['incretin', 'glp-1'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['tirzepatide'],
  },
  {
    slug: 'secretagogue',
    term: 'Secretagogue',
    category: 'biology',
    short: 'A substance that triggers secretion of a hormone.',
    definition:
      'A secretagogue is a substance that triggers the secretion of another substance. Growth-hormone secretagogues prompt the pituitary to release the body’s own GH rather than supplying exogenous hormone.',
    relatedTerms: ['ghrh', 'ghrp', 'igf-1'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'sermorelin'],
  },
  {
    slug: 'ghrh',
    term: 'GHRH',
    abbr: 'GHRH',
    category: 'biology',
    short: 'Growth hormone-releasing hormone — the hypothalamic GH signal.',
    definition:
      'GHRH (growth hormone-releasing hormone) is the hypothalamic signal that stimulates the pituitary to release growth hormone. GHRH-analog peptides mimic this signal to raise GH while preserving its natural pulsatility.',
    aliases: ['growth hormone-releasing hormone'],
    relatedTerms: ['ghrp', 'secretagogue', 'igf-1'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['sermorelin', 'tesamorelin', 'cjc-1295-no-dac'],
  },
  {
    slug: 'ghrp',
    term: 'GHRP',
    abbr: 'GHRP',
    category: 'biology',
    short: 'Growth hormone-releasing peptides acting on the ghrelin receptor.',
    definition:
      'GHRPs (growth hormone-releasing peptides) stimulate GH release by acting on the ghrelin receptor, a pathway distinct from GHRH. The two classes are often studied together for synergistic GH release.',
    aliases: ['growth hormone-releasing peptide'],
    relatedTerms: ['ghrh', 'secretagogue'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'hexarelin'],
  },
  {
    slug: 'igf-1',
    term: 'IGF-1',
    abbr: 'IGF-1',
    category: 'biology',
    short: 'Insulin-like growth factor 1, the downstream mediator of GH.',
    definition:
      'IGF-1 (insulin-like growth factor 1) is a hormone produced largely in the liver in response to growth hormone. It mediates many of GH’s anabolic effects and is a common downstream endpoint in GH-axis research.',
    aliases: ['insulin-like growth factor 1'],
    relatedTerms: ['ghrh', 'secretagogue'],
    relatedAreas: ['growth-hormone-axis'],
  },
  {
    slug: 'melanocortin',
    term: 'Melanocortin',
    category: 'biology',
    short: 'A receptor/peptide family regulating pigmentation, energy, and sexual function.',
    definition:
      'The melanocortin system is a family of receptors (MC1R–MC5R) and peptides such as α-MSH that regulate pigmentation, energy balance, and sexual function. It is the target of peptides like PT-141 and melanotan-2.',
    aliases: ['melanocortin system', 'msh'],
    relatedTerms: ['agonist', 'hsdd'],
    relatedAreas: ['sexual-reproductive', 'skin-hair'],
    relatedPeptides: ['pt-141', 'melanotan-2'],
  },
  {
    slug: 'kisspeptin',
    term: 'Kisspeptin',
    category: 'biology',
    short: 'The master upstream regulator of the reproductive hormone axis.',
    definition:
      'Kisspeptin is a neuropeptide that sits at the top of the hypothalamic-pituitary-gonadal axis, triggering the release of GnRH. It is studied as a regulator of puberty, fertility, and reproductive endocrine function.',
    relatedTerms: ['hpg-axis'],
    relatedAreas: ['sexual-reproductive'],
    relatedPeptides: ['kisspeptin-10'],
  },
  {
    slug: 'hpg-axis',
    term: 'HPG Axis',
    abbr: 'HPG',
    category: 'biology',
    short: 'The hypothalamic-pituitary-gonadal hormone feedback system.',
    definition:
      'The HPG axis (hypothalamic-pituitary-gonadal axis) is the hormonal feedback system governing reproductive function, running from hypothalamic GnRH through pituitary LH/FSH to the gonads. Kisspeptin is its key upstream regulator.',
    aliases: ['hypothalamic-pituitary-gonadal axis'],
    relatedTerms: ['kisspeptin'],
    relatedAreas: ['sexual-reproductive'],
  },
  {
    slug: 'bdnf',
    term: 'BDNF',
    abbr: 'BDNF',
    category: 'biology',
    short: 'Brain-derived neurotrophic factor, a target of cognition research.',
    definition:
      'BDNF (brain-derived neurotrophic factor) is a protein that supports neuron survival, growth, and synaptic plasticity. Modulation of BDNF is a frequently proposed mechanism for nootropic and neuroprotective peptides.',
    aliases: ['brain-derived neurotrophic factor', 'neurotrophin'],
    relatedAreas: ['cognition-neuroprotection'],
    relatedPeptides: ['semax'],
  },
  {
    slug: 'angiogenesis',
    term: 'Angiogenesis',
    category: 'biology',
    short: 'The formation of new blood vessels from existing ones.',
    definition:
      'Angiogenesis is the formation of new blood vessels from pre-existing vasculature. It is central to wound healing and tissue repair, and several regenerative peptides are studied for pro-angiogenic activity.',
    relatedAreas: ['wound-healing'],
    relatedPeptides: ['bpc-157', 'ghk-cu'],
  },
  {
    slug: 'senolytic',
    term: 'Senolytic',
    category: 'biology',
    short: 'An agent that clears senescent “zombie” cells.',
    definition:
      'A senolytic is an agent that selectively clears senescent cells — non-dividing “zombie” cells that accumulate with age and secrete inflammatory signals. Senolytic strategies are studied as a way to extend healthspan.',
    aliases: ['senescence', 'cellular senescence'],
    relatedTerms: ['nad'],
    relatedAreas: ['longevity-aging'],
  },
  {
    slug: 'nad',
    term: 'NAD+',
    abbr: 'NAD+',
    category: 'biology',
    short: 'A coenzyme central to energy metabolism that declines with age.',
    definition:
      'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme essential to cellular energy metabolism and DNA repair. Its decline with age is a recurring theme in longevity and mitochondrial research.',
    aliases: ['nicotinamide adenine dinucleotide'],
    relatedTerms: ['cardiolipin', 'senolytic'],
    relatedAreas: ['longevity-aging', 'mitochondrial'],
    relatedPeptides: ['nad-plus', 'mots-c'],
  },
  {
    slug: 'cardiolipin',
    term: 'Cardiolipin',
    category: 'biology',
    short: 'An inner-mitochondrial-membrane lipid essential for energy production.',
    definition:
      'Cardiolipin is a phospholipid unique to the inner mitochondrial membrane, essential for the efficiency of the electron-transport chain. Stabilizing cardiolipin is the proposed mechanism of mitochondria-targeted peptides such as SS-31.',
    relatedTerms: ['nad'],
    relatedAreas: ['mitochondrial'],
    relatedPeptides: ['ss-31'],
  },
  {
    slug: 'dpp-4',
    term: 'DPP-4',
    abbr: 'DPP-4',
    category: 'biology',
    short: 'The enzyme that rapidly degrades incretins like GLP-1.',
    definition:
      'DPP-4 (dipeptidyl peptidase-4) is an enzyme that rapidly degrades incretin hormones such as GLP-1. Resistance to DPP-4 cleavage is engineered into long-acting incretin analogs to extend their half-life.',
    aliases: ['dipeptidyl peptidase-4'],
    relatedTerms: ['incretin', 'glp-1', 'half-life', 'acylation'],
    relatedAreas: ['weight-loss'],
  },

  // ── Identifiers & Standards ───────────────────────────────────────────────
  {
    slug: 'cas-number',
    term: 'CAS Number',
    abbr: 'CAS',
    category: 'identifiers',
    short: 'A unique registry identifier for a chemical substance.',
    definition:
      'A CAS number is a unique identifier assigned by the Chemical Abstracts Service to every chemical substance described in the literature. It provides an unambiguous way to reference a compound across databases.',
    aliases: ['cas registry number'],
    relatedTerms: ['pubchem-cid', 'uniprot'],
  },
  {
    slug: 'pubchem-cid',
    term: 'PubChem CID',
    abbr: 'CID',
    category: 'identifiers',
    short: 'A unique compound identifier in NIH’s PubChem database.',
    definition:
      'A PubChem CID (Compound Identifier) is a unique number assigned to a chemical structure in the NIH PubChem database. AmericanPeptide links catalog entries to their PubChem records by CID for verified chemistry.',
    aliases: ['compound identifier', 'pubchem id'],
    relatedTerms: ['cas-number', 'uniprot', 'molecular-formula'],
  },
  {
    slug: 'uniprot',
    term: 'UniProt',
    category: 'identifiers',
    short: 'A reference database of protein sequence and function.',
    definition:
      'UniProt is a comprehensive, freely accessible database of protein sequence and functional information. Entries are referenced by stable accession IDs and are widely used to cross-reference peptide and protein targets.',
    aliases: ['uniprotkb', 'uniprot accession'],
    relatedTerms: ['pubchem-cid', 'sequence'],
  },
  {
    slug: 'coa',
    term: 'Certificate of Analysis',
    abbr: 'COA',
    category: 'identifiers',
    short: 'A supplier document reporting a compound’s identity and purity.',
    definition:
      'A Certificate of Analysis (COA) is a document from a supplier reporting the results of analytical testing — typically identity (e.g. mass spectrometry) and purity (e.g. HPLC) — for a specific batch. COAs are central to the transparency goals of a research-peptide marketplace.',
    aliases: ['certificate of analysis'],
    relatedTerms: ['pubchem-cid'],
  },
  {
    slug: 'molecular-formula',
    term: 'Molecular Formula',
    category: 'identifiers',
    short: 'The count of each atom type in a molecule.',
    definition:
      'A molecular formula lists the number of each type of atom in a molecule — for example, the formula of semaglutide is C₁₅₇H₂₃₅N₄₁O₄₇. It is a compact identifier complementary to molecular weight and sequence.',
    relatedTerms: ['molecular-weight', 'pubchem-cid'],
  },

  // ── Research & Regulatory ─────────────────────────────────────────────────
  {
    slug: 'mash',
    term: 'MASH',
    abbr: 'MASH',
    category: 'research',
    short: 'A liver disease studied as a metabolic-peptide endpoint.',
    definition:
      'MASH (metabolic dysfunction-associated steatohepatitis), formerly called NASH, is a progressive liver disease driven by fat accumulation and inflammation. It is a frequent endpoint in trials of metabolic peptides.',
    aliases: ['nash', 'metabolic dysfunction-associated steatohepatitis'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'retatrutide'],
  },
  {
    slug: 'hsdd',
    term: 'HSDD',
    abbr: 'HSDD',
    category: 'research',
    short: 'Hypoactive sexual desire disorder, a melanocortin-peptide endpoint.',
    definition:
      'HSDD (hypoactive sexual desire disorder) is a persistent lack of sexual desire causing distress. It is the endpoint for which the melanocortin agonist PT-141 (bremelanotide) was studied and approved.',
    aliases: ['hypoactive sexual desire disorder'],
    relatedTerms: ['melanocortin'],
    relatedAreas: ['sexual-reproductive'],
    relatedPeptides: ['pt-141'],
  },
  {
    slug: 'clinical-phase',
    term: 'Clinical Phase',
    category: 'research',
    short: 'The staged structure of human clinical trials (Phase 1–4).',
    definition:
      'Clinical phases describe the staged structure of human trials: Phase 1 assesses safety and dosing, Phase 2 efficacy and side effects, Phase 3 confirmatory efficacy at scale, and Phase 4 post-approval surveillance. AmericanPeptide surfaces trial phases from ClinicalTrials.gov.',
    aliases: ['phase 1', 'phase 2', 'phase 3', 'trial phase'],
    relatedTerms: ['fda-approved'],
  },
  {
    slug: 'fda-approved',
    term: 'FDA Approved',
    category: 'research',
    short: 'Cleared by the U.S. FDA as safe and effective for a specific use.',
    definition:
      'FDA Approved means a compound has met the U.S. Food and Drug Administration’s standards for safety and efficacy for a specific indication. It is distinct from “investigational,” which denotes a compound still under study and not approved for clinical use.',
    aliases: ['fda approval'],
    relatedTerms: ['clinical-phase'],
  },
]

export const GLOSSARY_BY_SLUG: Record<string, GlossaryTerm> =
  Object.fromEntries(GLOSSARY.map((t) => [t.slug, t]))

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_BY_SLUG[slug]
}

/** Terms grouped by category, each sorted alphabetically by term. */
export function glossaryByCategory(): {
  meta: GlossaryCategoryMeta
  terms: GlossaryTerm[]
}[] {
  return GLOSSARY_CATEGORIES.map((meta) => ({
    meta,
    terms: GLOSSARY.filter((t) => t.category === meta.id).sort((a, b) =>
      a.term.localeCompare(b.term),
    ),
  })).filter((g) => g.terms.length > 0)
}

/** Resolve related glossary slugs to terms (filters out any unknown slugs). */
export function resolveRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  return (term.relatedTerms ?? [])
    .map((s) => GLOSSARY_BY_SLUG[s])
    .filter((t): t is GlossaryTerm => Boolean(t))
}
