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

  {
    slug: 'vegf',
    term: 'VEGF',
    abbr: 'VEGF',
    category: 'biology',
    short: 'Vascular endothelial growth factor — the primary driver of new blood vessel formation.',
    definition:
      'VEGF (vascular endothelial growth factor) is a signaling protein that stimulates angiogenesis — the growth of new blood vessels from existing ones. It acts through VEGF receptors (notably VEGFR2) on endothelial cells. Upregulation of the VEGFR2 pathway is one of the proposed mechanisms of BPC-157 in tissue-repair models.',
    aliases: ['vascular endothelial growth factor', 'VEGFR2'],
    relatedTerms: ['angiogenesis'],
    relatedAreas: ['wound-healing'],
    relatedPeptides: ['bpc-157', 'ghk-cu', 'tb-500'],
  },
  {
    slug: 'alpha-msh',
    term: 'α-MSH',
    abbr: 'α-MSH',
    category: 'biology',
    short: 'Alpha-melanocyte-stimulating hormone — the master endogenous melanocortin peptide.',
    definition:
      'α-MSH (alpha-melanocyte-stimulating hormone) is a 13-amino-acid peptide cleaved from POMC (pro-opiomelanocortin). It is the primary endogenous agonist of melanocortin receptors, activating MC1R (pigmentation), MC3R (energy balance), MC4R (sexual response, appetite), and MC5R (exocrine secretion). Synthetic analogs of α-MSH include melanotan-2 and PT-141, and fragments include KPV.',
    aliases: ['alpha-melanocyte-stimulating hormone', 'alpha-MSH', 'melanocyte stimulating hormone'],
    relatedTerms: ['melanocortin', 'kisspeptin'],
    relatedAreas: ['sexual-reproductive', 'skin-hair', 'immune-inflammation'],
    relatedPeptides: ['melanotan-2', 'pt-141', 'kpv'],
  },
  {
    slug: 'ampk',
    term: 'AMPK',
    abbr: 'AMPK',
    category: 'biology',
    short: 'AMP-activated protein kinase — the cell\'s central energy-sensing enzyme.',
    definition:
      'AMPK (AMP-activated protein kinase) is an enzyme that acts as a master energy sensor, activated when cellular AMP:ATP ratio rises (indicating low energy). It promotes catabolic pathways (fatty-acid oxidation, glucose uptake) and suppresses anabolic ones. MOTS-c, the mitochondrially-encoded peptide, is proposed to activate AMPK as part of its signaling mechanism.',
    aliases: ['AMP-activated protein kinase', 'AMP kinase'],
    relatedTerms: ['nad', 'cardiolipin'],
    relatedAreas: ['longevity-aging', 'mitochondrial', 'weight-loss'],
    relatedPeptides: ['mots-c', '5-amino-1mq'],
  },
  {
    slug: 'blood-brain-barrier',
    term: 'Blood–Brain Barrier',
    abbr: 'BBB',
    category: 'biology',
    short: 'The selective barrier between blood and brain tissue that restricts most peptides from entering the CNS.',
    definition:
      'The blood–brain barrier (BBB) is formed by tight junctions between the endothelial cells lining cerebral capillaries. It restricts the passage of most large molecules — including most peptides — from blood into brain tissue. BBB permeability is a key determinant of whether a cognitive or neuroprotective peptide can act centrally. Semax and selank are studied in part because of reported CNS activity despite the barrier.',
    aliases: ['BBB', 'blood brain barrier'],
    relatedTerms: ['bioavailability'],
    relatedAreas: ['cognition-neuroprotection', 'anxiety-mood'],
    relatedPeptides: ['semax', 'selank', 'dsip'],
  },
  {
    slug: 'spps',
    term: 'SPPS',
    abbr: 'SPPS',
    category: 'chemistry',
    short: 'Solid-phase peptide synthesis — the primary method for manufacturing research peptides.',
    definition:
      'SPPS (solid-phase peptide synthesis) is the standard technique for manufacturing peptides in research and pharmaceutical production. Amino acids are added one at a time to a growing chain anchored to a resin bead, with protecting groups removed after each coupling step. The method enables the synthesis of any defined sequence but introduces deletion and truncation impurities that must be removed by HPLC purification. Virtually all research peptides — including BPC-157, semaglutide, and BPC-157 — are produced by SPPS.',
    aliases: ['solid-phase peptide synthesis', 'solid phase synthesis'],
    relatedTerms: ['peptide-bond', 'sequence', 'coa'],
    relatedAreas: ['wound-healing', 'weight-loss'],
  },
  {
    slug: 'binding-affinity',
    term: 'Binding Affinity',
    abbr: 'Ki / EC₅₀',
    category: 'research',
    short: 'A measure of how tightly a compound binds to or activates its receptor target.',
    definition:
      'Binding affinity describes the strength of the interaction between a compound and its receptor. Ki (inhibition constant) measures binding strength in displacement assays — lower Ki means tighter binding. EC₅₀ (half-maximal effective concentration) is the concentration that produces 50% of maximum receptor activation. These metrics appear in pharmacology papers and are central to comparing selectivity across receptor subtypes — for example, tirzepatide\'s GIP-R affinity relative to its GLP-1R affinity.',
    aliases: ['Ki', 'EC50', 'IC50', 'receptor affinity', 'binding constant'],
    relatedTerms: ['agonist', 'incretin', 'melanocortin'],
    relatedAreas: ['weight-loss', 'sexual-reproductive'],
    relatedPeptides: ['tirzepatide', 'retatrutide', 'pt-141'],
  },

  // ── Dosing & Preparation (additions) ─────────────────────────────────────
  {
    slug: 'intranasal',
    term: 'Intranasal',
    category: 'dosing',
    short: 'Administration via the nasal mucosa — a route studied for CNS-active peptides.',
    definition:
      'Intranasal administration delivers a compound through the nasal mucosa, which is richly vascularised and sits close to the olfactory bulb. For peptides that must reach the CNS, intranasal delivery is studied as a way to reduce first-pass metabolism and exploit olfactory-nerve transport pathways. Semax and selank are commonly studied by this route in Russian clinical literature.',
    aliases: ['intranasal administration', 'nasal spray', 'intranasal route'],
    relatedTerms: ['bioavailability', 'blood-brain-barrier', 'subcutaneous'],
    relatedAreas: ['cognition-neuroprotection', 'anxiety-mood'],
    relatedPeptides: ['semax', 'selank'],
  },
  {
    slug: 'intramuscular',
    term: 'Intramuscular',
    abbr: 'IM',
    category: 'dosing',
    short: 'Injection into muscle tissue — faster absorption than subcutaneous.',
    definition:
      'Intramuscular (IM) injection delivers a compound directly into muscle tissue. Absorption is generally faster than subcutaneous because muscle has a higher blood flow. Some research peptides are studied via IM route when rapid onset or higher bioavailability is desired.',
    aliases: ['IM injection', 'intramuscular injection'],
    relatedTerms: ['subcutaneous', 'bioavailability'],
  },
  {
    slug: 'water-for-injection',
    term: 'Water for Injection',
    abbr: 'WFI',
    category: 'dosing',
    short: 'Sterile, preservative-free water — used when single-dose vials are planned.',
    definition:
      'Water for Injection (WFI) is pharmaceutical-grade sterile water without benzyl alcohol or other preservatives. Unlike bacteriostatic water, WFI does not inhibit microbial growth after opening, making it appropriate only for single-use reconstitutions. It is used when the researcher wants to avoid any preservative exposure.',
    aliases: ['WFI', 'sterile water'],
    relatedTerms: ['bacteriostatic-water', 'reconstitution'],
  },
  {
    slug: 'peptide-stability',
    term: 'Peptide Stability',
    category: 'dosing',
    short: 'How resistant a peptide is to degradation under storage or handling conditions.',
    definition:
      'Peptide stability refers to resistance to chemical and enzymatic degradation. Key factors include temperature, pH, freeze-thaw cycling, light exposure, and the presence of proteases. Lyophilized peptides are generally stable for months to years frozen; reconstituted solutions degrade faster and typically must be used within weeks.',
    aliases: ['stability', 'shelf life'],
    relatedTerms: ['lyophilization', 'freeze-thaw', 'half-life'],
  },
  {
    slug: 'freeze-thaw',
    term: 'Freeze-Thaw',
    category: 'dosing',
    short: 'Repeated freezing and thawing that degrades peptide solutions.',
    definition:
      'A freeze-thaw cycle is one round of freezing a reconstituted peptide solution and then thawing it. Repeated cycling creates ice crystals that can shear the peptide chain, promote aggregation, and reduce potency. Most protocols recommend preparing single-use aliquots to minimize cycles.',
    aliases: ['freeze thaw cycling'],
    relatedTerms: ['peptide-stability', 'lyophilization', 'reconstitution'],
  },
  {
    slug: 'insulin-syringe',
    term: 'Insulin Syringe',
    category: 'dosing',
    short: 'A U-100 calibrated syringe commonly used for research peptide volumes.',
    definition:
      'Insulin syringes are calibrated in "units" on the U-100 scale (100 units = 1 mL). Because research peptide volumes are typically small, insulin syringes provide fine-grained volume measurement. Converting from units to volume depends on the reconstitution concentration and must be calculated before use.',
    aliases: ['insulin needle', 'U-100 syringe'],
    relatedTerms: ['reconstitution', 'concentration'],
  },
  {
    slug: 'diluent',
    term: 'Diluent',
    category: 'dosing',
    short: 'The solvent added to a lyophilized peptide vial to reconstitute it.',
    definition:
      'A diluent is any sterile liquid used to dissolve a lyophilized peptide and bring it to a usable solution. Common choices include bacteriostatic water (multi-use vials) and water for injection (single-use). The diluent choice affects microbial safety, peptide compatibility, and handling protocol.',
    aliases: ['solvent', 'reconstitution solvent'],
    relatedTerms: ['reconstitution', 'bacteriostatic-water', 'water-for-injection'],
  },

  // ── Peptide Chemistry (additions) ────────────────────────────────────────
  {
    slug: 'hplc',
    term: 'HPLC',
    abbr: 'HPLC',
    category: 'chemistry',
    short: 'High-performance liquid chromatography — the standard purity test for peptides.',
    definition:
      'HPLC (high-performance liquid chromatography) separates compounds by their affinity for a stationary phase as a mobile phase carries them through. For peptides it is the standard method for measuring purity — the area of the target peak as a percentage of total peak area gives the purity figure (e.g. ≥98%). A chromatogram trace on a COA is the primary evidence of purity.',
    aliases: ['high-performance liquid chromatography', 'reverse-phase HPLC', 'RP-HPLC'],
    relatedTerms: ['mass-spectrometry', 'coa', 'deletion-sequence'],
  },
  {
    slug: 'mass-spectrometry',
    term: 'Mass Spectrometry',
    abbr: 'MS',
    category: 'chemistry',
    short: 'An analytical technique that confirms molecular identity by measuring mass.',
    definition:
      'Mass spectrometry (MS) ionizes molecules and separates them by mass-to-charge ratio, producing a spectrum used to determine molecular mass. For peptides it is the gold-standard identity test: a measured mass matching the theoretical molecular weight (within ~0.02%) confirms the correct sequence was synthesized. HPLC-MS combines purity and identity in one run.',
    aliases: ['MS', 'mass spec', 'LCMS', 'LC-MS/MS'],
    relatedTerms: ['hplc', 'molecular-weight', 'coa'],
  },
  {
    slug: 'cyclic-peptide',
    term: 'Cyclic Peptide',
    category: 'chemistry',
    short: 'A peptide whose chain forms a ring, increasing stability and receptor selectivity.',
    definition:
      'A cyclic peptide has its N- and C-termini joined (or another internal cyclization), forming a ring. The constraint reduces conformational flexibility, which can improve receptor selectivity, proteolytic resistance, and binding affinity. Bremelanotide (PT-141) is a notable example — a cyclic heptapeptide.',
    aliases: ['cyclized peptide', 'head-to-tail cyclization'],
    relatedTerms: ['disulfide-bond', 'peptide-bond', 'binding-affinity'],
    relatedPeptides: ['pt-141'],
  },
  {
    slug: 'acetylation',
    term: 'N-Terminal Acetylation',
    category: 'chemistry',
    short: 'Capping the N-terminus with an acetyl group to improve stability.',
    definition:
      'N-terminal acetylation replaces the free amino group at the N-terminus with an acetyl group (Ac-). This modification protects the peptide from N-terminal exopeptidase degradation and can shift charge and membrane affinity. Many endogenous bioactive peptides are naturally acetylated; it is also used to stabilize synthetic peptides.',
    aliases: ['N-acetylation', 'acetyl group', 'Ac-'],
    relatedTerms: ['n-terminus', 'peptide-stability'],
  },
  {
    slug: 'amidation',
    term: 'C-Terminal Amidation',
    category: 'chemistry',
    short: 'Replacing the C-terminal carboxyl with an amide — a common bioactivity-preserving modification.',
    definition:
      'C-terminal amidation converts the free carboxyl group at the C-terminus to an amide (-NH₂). Many endogenous neuropeptides are naturally amidated; the modification mimics this biology, improves resistance to carboxypeptidase degradation, and can affect receptor binding. It is a frequent modification in research peptide synthesis.',
    aliases: ['C-terminal amide', 'amide terminus', '-NH2'],
    relatedTerms: ['c-terminus', 'peptide-stability', 'spps'],
  },
  {
    slug: 'protecting-group',
    term: 'Protecting Group',
    category: 'chemistry',
    short: 'A temporary chemical block used in SPPS to prevent unwanted side reactions.',
    definition:
      'A protecting group is a temporary chemical modification applied to a reactive functional group to prevent it from reacting during synthesis steps it is not intended for. In SPPS, side-chain protecting groups shield amino acid residues during chain elongation; they are removed en masse at final cleavage. Incomplete deprotection leaves impurities.',
    aliases: ['side-chain protection', 'Fmoc', 'Boc'],
    relatedTerms: ['spps', 'deletion-sequence'],
  },
  {
    slug: 'resin',
    term: 'Resin',
    category: 'chemistry',
    short: 'The solid support to which the growing peptide chain is anchored during SPPS.',
    definition:
      'In solid-phase peptide synthesis, the resin is the insoluble polymeric bead to which the first amino acid of the chain is attached. Subsequent residues are coupled one at a time; the completed peptide is then cleaved from the resin and purified. Rink amide resin yields a C-terminal amide; Wang resin yields a free carboxyl.',
    aliases: ['solid support', 'rink amide resin', 'Wang resin'],
    relatedTerms: ['spps', 'amidation', 'c-terminus'],
  },
  {
    slug: 'tfa',
    term: 'TFA Salt',
    abbr: 'TFA',
    category: 'chemistry',
    short: 'Trifluoroacetate counterion — a common byproduct of SPPS that appears in the final peptide.',
    definition:
      'Trifluoroacetic acid (TFA) is the cleavage reagent used in Fmoc SPPS; it remains as a counterion (trifluoroacetate) in the lyophilized product unless actively removed. Most research peptides are TFA salts by default. The TFA content is not biologically active but affects the net peptide mass and purity calculations.',
    aliases: ['trifluoroacetic acid', 'trifluoroacetate', 'TFA counterion'],
    relatedTerms: ['spps', 'molecular-weight', 'coa'],
  },
  {
    slug: 'deletion-sequence',
    term: 'Deletion Sequence',
    category: 'chemistry',
    short: 'A synthesis impurity missing one or more residues from the target sequence.',
    definition:
      'A deletion sequence is a truncated impurity produced when a coupling step in SPPS fails to add the intended residue, and the chain continues elongating one residue shorter. Longer peptides accumulate more deletions because there are more coupling steps where failure can occur. HPLC purification removes deletion sequences.',
    aliases: ['deletion impurity', 'truncation impurity', 'missed coupling'],
    relatedTerms: ['spps', 'hplc', 'coa'],
  },
  {
    slug: 'isoelectric-point',
    term: 'Isoelectric Point',
    abbr: 'pI',
    category: 'chemistry',
    short: 'The pH at which a peptide carries no net charge.',
    definition:
      'The isoelectric point (pI) is the pH at which a peptide has equal positive and negative charges — a net charge of zero. At its pI a peptide has minimal solubility in water and is most prone to aggregation. It is calculated from the sequence and influences formulation, solubility, and HPLC separation behaviour.',
    aliases: ['pI', 'isoelectric pH'],
    relatedTerms: ['amino-acid', 'hydropathy', 'sequence'],
  },
  {
    slug: 'd-amino-acid',
    term: 'D-Amino Acid',
    category: 'chemistry',
    short: 'The mirror-image chirality of a standard amino acid — used to resist enzymatic degradation.',
    definition:
      'Standard amino acids in biology are L-configured (left-handed). D-amino acids are the mirror-image (right-handed) form. Substituting D-residues at vulnerable positions in a peptide resists proteolytic cleavage because enzymes evolved to cut L-peptide bonds cannot recognize the D-chirality. The modification extends half-life at the cost of altered receptor geometry.',
    aliases: ['D-residue', 'D-configuration', 'retro-inverso'],
    relatedTerms: ['peptide-stability', 'half-life', 'protease'],
  },
  {
    slug: 'pegylation',
    term: 'PEGylation',
    category: 'chemistry',
    short: 'Attaching polyethylene glycol chains to extend half-life and reduce immunogenicity.',
    definition:
      'PEGylation is the covalent attachment of polyethylene glycol (PEG) chains to a peptide or protein. The large, water-binding PEG coat increases hydrodynamic radius (slowing renal clearance), reduces immunogenicity by shielding epitopes, and extends circulation half-life. It is used in several approved biologics though less commonly in short research peptides.',
    aliases: ['PEG', 'polyethylene glycol modification'],
    relatedTerms: ['half-life', 'acylation'],
  },

  // ── Mechanisms & Biology (additions) ─────────────────────────────────────
  {
    slug: 'receptor',
    term: 'Receptor',
    category: 'biology',
    short: 'A protein that binds a signaling molecule and initiates a cellular response.',
    definition:
      'A receptor is a protein — usually on the cell surface or inside the cell — that specifically binds a signaling molecule (ligand) and transduces that binding into a downstream biological response. Peptide receptors are typically G protein-coupled receptors (GPCRs) or receptor tyrosine kinases.',
    relatedTerms: ['agonist', 'binding-affinity', 'camp'],
  },
  {
    slug: 'camp',
    term: 'cAMP',
    abbr: 'cAMP',
    category: 'biology',
    short: 'Cyclic AMP — the second messenger downstream of many GPCR-linked peptide receptors.',
    definition:
      'cAMP (cyclic adenosine monophosphate) is a second messenger generated when Gs-coupled GPCRs activate adenylyl cyclase. It activates protein kinase A (PKA), which phosphorylates downstream effectors. The GHRH receptor signals through cAMP/PKA to stimulate GH release from pituitary somatotrophs.',
    aliases: ['cyclic AMP', 'cyclic adenosine monophosphate', 'PKA pathway'],
    relatedTerms: ['receptor', 'ghrh', 'secretagogue'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['sermorelin', 'cjc-1295-no-dac', 'tesamorelin'],
  },
  {
    slug: 'ghrelin',
    term: 'Ghrelin',
    category: 'biology',
    short: 'The endogenous "hunger hormone" and natural ligand for the GHS-R1a receptor.',
    definition:
      'Ghrelin is a 28-amino-acid peptide secreted primarily by the stomach. It is the endogenous ligand for GHS-R1a (the ghrelin receptor) and stimulates GH release, appetite, and gut motility. Synthetic GHRPs mimic ghrelin at GHS-R1a to elevate endogenous GH.',
    aliases: ['hunger hormone', 'acylated ghrelin'],
    relatedTerms: ['ghs-r1a', 'ghrp', 'secretagogue'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'hexarelin'],
  },
  {
    slug: 'ghs-r1a',
    term: 'GHS-R1a',
    abbr: 'GHS-R1a',
    category: 'biology',
    short: 'Growth hormone secretagogue receptor 1a — the target of GHRPs and ghrelin.',
    definition:
      'GHS-R1a is the G protein-coupled receptor activated by ghrelin and synthetic GHRPs (ipamorelin, hexarelin, MK-677). It is distinct from the GHRH receptor; GHS-R1a signals through Gq/IP₃/Ca²⁺, whereas GHRH-R signals through Gs/cAMP/PKA. Co-activating both pathways produces synergistic GH release.',
    aliases: ['ghrelin receptor', 'growth hormone secretagogue receptor'],
    relatedTerms: ['ghrelin', 'ghrp', 'camp'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'hexarelin'],
  },
  {
    slug: 'nitric-oxide',
    term: 'Nitric Oxide',
    abbr: 'NO',
    category: 'biology',
    short: 'A gaseous signaling molecule mediating vasodilation and tissue repair.',
    definition:
      'Nitric oxide (NO) is a short-lived gaseous signaling molecule produced by nitric oxide synthase (NOS). It relaxes vascular smooth muscle, promotes angiogenesis, and modulates inflammation. Upregulation of eNOS and the NO pathway is proposed as one mechanism of BPC-157 in preclinical healing models.',
    aliases: ['NO', 'nitric oxide synthase', 'eNOS'],
    relatedTerms: ['angiogenesis', 'vegf'],
    relatedAreas: ['wound-healing'],
    relatedPeptides: ['bpc-157'],
  },
  {
    slug: 'nf-kb',
    term: 'NF-κB',
    abbr: 'NF-κB',
    category: 'biology',
    short: 'A master transcription factor controlling inflammatory gene expression.',
    definition:
      'NF-κB (nuclear factor kappa-light-chain-enhancer of activated B cells) is a transcription factor that regulates genes encoding cytokines, chemokines, and pro-inflammatory mediators. Its activation is central to acute and chronic inflammation. Several peptides — including thymosin β4 (via its Ac-SDKP fragment) — are studied for their ability to modulate NF-κB activity.',
    aliases: ['nuclear factor kappa B', 'NF-kB'],
    relatedTerms: ['tlr', 'immune-modulation'],
    relatedAreas: ['immune-inflammation', 'wound-healing'],
    relatedPeptides: ['bpc-157', 'thymosin-beta-4', 'kpv'],
  },
  {
    slug: 'collagen',
    term: 'Collagen',
    category: 'biology',
    short: 'The most abundant structural protein — a primary target in wound healing research.',
    definition:
      'Collagen is the most abundant protein in the extracellular matrix, providing tensile strength to skin, tendons, bones, and connective tissue. In wound healing research, stimulation of collagen synthesis by fibroblasts is a key endpoint. Peptides such as GHK-Cu are studied for their ability to promote collagen gene expression.',
    relatedTerms: ['fibroblast', 'angiogenesis'],
    relatedAreas: ['wound-healing'],
    relatedPeptides: ['ghk-cu', 'bpc-157', 'tb-500'],
  },
  {
    slug: 'fibroblast',
    term: 'Fibroblast',
    category: 'biology',
    short: 'The cell type responsible for synthesizing collagen and extracellular matrix.',
    definition:
      'Fibroblasts are the primary cell type responsible for synthesizing collagen, elastin, and other extracellular matrix components. They are central to wound repair — migrating to injury sites, depositing matrix, and remodeling tissue. Peptide studies often measure fibroblast proliferation and collagen output as healing endpoints.',
    relatedTerms: ['collagen', 'angiogenesis'],
    relatedAreas: ['wound-healing'],
    relatedPeptides: ['ghk-cu', 'bpc-157'],
  },
  {
    slug: 'mtor',
    term: 'mTOR',
    abbr: 'mTOR',
    category: 'biology',
    short: 'A kinase that integrates nutrient signals and regulates cell growth and aging.',
    definition:
      'mTOR (mechanistic target of rapamycin) is a serine/threonine kinase that integrates signals from nutrients, energy, and growth factors to regulate protein synthesis, cell growth, and autophagy. Chronic mTOR hyperactivation is linked to aging-related pathology; inhibition is studied as a longevity intervention.',
    aliases: ['mechanistic target of rapamycin', 'mammalian target of rapamycin'],
    relatedTerms: ['autophagy', 'ampk'],
    relatedAreas: ['longevity-aging'],
    relatedPeptides: ['mots-c'],
  },
  {
    slug: 'telomere',
    term: 'Telomere',
    category: 'biology',
    short: 'Protective caps on chromosomes that shorten with each cell division — a marker of biological aging.',
    definition:
      'Telomeres are repetitive DNA sequences capping chromosome ends that protect them from degradation and fusion. They shorten with each cell division; critically short telomeres trigger senescence or apoptosis. Epitalon is studied in longevity research for reported effects on telomerase activity, though evidence is concentrated in a limited body of literature.',
    relatedTerms: ['senolytic', 'epigenetic'],
    relatedAreas: ['longevity-aging'],
    relatedPeptides: ['epitalon'],
  },
  {
    slug: 'autophagy',
    term: 'Autophagy',
    category: 'biology',
    short: "The cell's recycling system — disposing of damaged proteins and organelles.",
    definition:
      'Autophagy ("self-eating") is the cellular process of sequestering damaged proteins, organelles, and pathogens in autophagosomes and degrading them in lysosomes. It is upregulated by caloric restriction and AMPK activation; impaired autophagy is associated with age-related accumulation of cellular debris. It is a focus of longevity and mitochondrial research.',
    aliases: ['mitophagy', 'selective autophagy'],
    relatedTerms: ['mtor', 'ampk', 'senolytic'],
    relatedAreas: ['longevity-aging', 'mitochondrial'],
  },
  {
    slug: 'tlr',
    term: 'Toll-Like Receptor',
    abbr: 'TLR',
    category: 'biology',
    short: 'Pattern-recognition receptors of innate immunity that detect microbial motifs.',
    definition:
      'Toll-like receptors (TLRs) are pattern-recognition receptors on innate immune cells that detect conserved microbial molecules (PAMPs). TLR activation triggers NF-κB and interferon pathways, initiating the innate inflammatory response. Thymosin α1 activates dendritic cells via TLR2 and TLR9; LL-37 can both activate and modulate TLR4 signaling depending on context.',
    aliases: ['TLR signaling', 'pattern recognition receptor'],
    relatedTerms: ['nf-kb', 'immune-modulation'],
    relatedAreas: ['immune-inflammation'],
    relatedPeptides: ['thymosin-alpha-1'],
  },
  {
    slug: 'cortisol',
    term: 'Cortisol',
    category: 'biology',
    short: 'The primary stress glucocorticoid — relevant to GH-axis peptide research.',
    definition:
      'Cortisol is the main glucocorticoid hormone secreted by the adrenal cortex in response to stress and ACTH. It is closely monitored in GH-axis research because certain GH secretagogues — particularly hexarelin — elevate cortisol alongside GH. Ipamorelin is specifically studied for its selective GH release with minimal cortisol elevation.',
    aliases: ['glucocorticoid', 'stress hormone', 'hydrocortisone'],
    relatedTerms: ['ghrp', 'igf-1'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'hexarelin'],
  },
  {
    slug: 'prolactin',
    term: 'Prolactin',
    category: 'biology',
    short: 'A pituitary hormone that some GH secretagogues elevate as a side effect.',
    definition:
      'Prolactin is a pituitary hormone best known for its role in lactation. Some GH-releasing peptides — particularly GHRP-6 and hexarelin — elevate prolactin alongside GH, which is considered an undesirable effect in research contexts. Ipamorelin is distinguished by its minimal effect on prolactin at research doses.',
    aliases: ['PRL'],
    relatedTerms: ['ghrp', 'cortisol', 'igf-1'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['ipamorelin', 'hexarelin'],
  },
  {
    slug: 'epigenetic',
    term: 'Epigenetic',
    category: 'biology',
    short: "Gene expression changes that don't alter the DNA sequence — methylation, acetylation, etc.",
    definition:
      'Epigenetic modifications change gene expression without altering the underlying DNA sequence. Key mechanisms include DNA methylation, histone acetylation, and non-coding RNA. Age-related drift in epigenetic marks is studied as a cause — and potential biomarker — of biological aging.',
    aliases: ['epigenetics', 'epigenome', 'DNA methylation'],
    relatedTerms: ['telomere', 'senolytic', 'autophagy'],
    relatedAreas: ['longevity-aging'],
    relatedPeptides: ['epitalon'],
  },
  {
    slug: 'insulin-resistance',
    term: 'Insulin Resistance',
    category: 'biology',
    short: 'Reduced cellular response to insulin — a driver of type 2 diabetes and metabolic syndrome.',
    definition:
      'Insulin resistance is the state in which cells fail to respond normally to insulin, leading to elevated blood glucose and compensatory hyperinsulinemia. It is the underlying pathophysiology of type 2 diabetes and a major driver of metabolic syndrome. GLP-1 receptor agonists are extensively studied in the context of insulin resistance reversal.',
    aliases: ['IR', 'metabolic syndrome'],
    relatedTerms: ['incretin', 'glp-1'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'tirzepatide'],
  },
  {
    slug: 'gastric-emptying',
    term: 'Gastric Emptying',
    category: 'biology',
    short: 'The rate at which the stomach empties its contents into the small intestine.',
    definition:
      'Gastric emptying is the process by which the stomach moves its contents into the duodenum. GLP-1 receptor agonists slow gastric emptying, which prolongs satiety, reduces post-meal glucose excursions, and is one of the three pillars of their anti-obesity mechanism alongside central appetite suppression and insulin secretion enhancement.',
    relatedTerms: ['glp-1', 'incretin'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'tirzepatide'],
  },
  {
    slug: 'pulsatile-release',
    term: 'Pulsatile Release',
    category: 'biology',
    short: 'The natural pattern of growth hormone secretion — bursts followed by troughs.',
    definition:
      'Pulsatile release describes hormones secreted in discrete pulses rather than continuously. GH is released in bursts — primarily at night — driven by alternating GHRH and somatostatin signals. GHRH analogs and GHRPs amplify pulse amplitude while preserving this pattern, which is considered more physiological than continuous exogenous GH administration.',
    aliases: ['GH pulse', 'pulsatility'],
    relatedTerms: ['ghrh', 'ghrp', 'secretagogue'],
    relatedAreas: ['growth-hormone-axis'],
    relatedPeptides: ['sermorelin', 'ipamorelin'],
  },
  {
    slug: 'oxidative-stress',
    term: 'Oxidative Stress',
    category: 'biology',
    short: 'Cellular damage from excess reactive oxygen species — a driver of aging.',
    definition:
      'Oxidative stress occurs when reactive oxygen species (ROS) overwhelm cellular antioxidant defenses, damaging DNA, proteins, and lipids. Mitochondria are the primary source of ROS; peptides studied in longevity research such as SS-31 and MOTS-c are proposed to reduce mitochondrial ROS production and improve antioxidant capacity.',
    aliases: ['ROS', 'reactive oxygen species', 'free radical damage'],
    relatedTerms: ['cardiolipin', 'nad', 'autophagy'],
    relatedAreas: ['longevity-aging', 'mitochondrial'],
    relatedPeptides: ['ss-31', 'mots-c'],
  },
  {
    slug: 'neuropeptide',
    term: 'Neuropeptide',
    category: 'biology',
    short: 'A peptide that acts as a signaling molecule in the nervous system.',
    definition:
      'Neuropeptides are peptides that function as neuromodulators or neurotransmitters in the central or peripheral nervous system. They regulate a wide range of functions including mood, pain, appetite, and cognition. Semax and selank are studied as synthetic neuropeptides with proposed effects on anxiety, cognition, and BDNF expression.',
    aliases: ['neuromodulator', 'neuropeptide signaling'],
    relatedTerms: ['bdnf', 'blood-brain-barrier'],
    relatedAreas: ['cognition-neuroprotection', 'anxiety-mood'],
    relatedPeptides: ['semax', 'selank', 'dsip'],
  },
  {
    slug: 'synaptic-plasticity',
    term: 'Synaptic Plasticity',
    category: 'biology',
    short: 'The ability of synapses to strengthen or weaken in response to activity — the basis of learning.',
    definition:
      'Synaptic plasticity is the strengthening or weakening of synaptic connections in response to neural activity. Long-term potentiation (LTP) and long-term depression (LTD) are key mechanisms; they are the cellular basis of learning and memory. BDNF is a central mediator of synaptic plasticity, making it a target for cognitive peptide research.',
    aliases: ['LTP', 'long-term potentiation', 'neuroplasticity'],
    relatedTerms: ['bdnf', 'neuropeptide'],
    relatedAreas: ['cognition-neuroprotection'],
    relatedPeptides: ['semax'],
  },
  {
    slug: 'immune-modulation',
    term: 'Immune Modulation',
    category: 'biology',
    short: 'Adjusting immune activity up or down — not wholesale suppression.',
    definition:
      'Immune modulation refers to the targeted adjustment of immune activity, contrasted with broad immunosuppression or uncontrolled immunostimulation. Immunomodulatory peptides such as thymosin α1 can restore appropriate immune responses in immunocompromised states, while anti-inflammatory peptides like KPV can dampen excess inflammation without global immune suppression.',
    aliases: ['immunomodulation', 'immunomodulatory'],
    relatedTerms: ['tlr', 'nf-kb'],
    relatedAreas: ['immune-inflammation'],
    relatedPeptides: ['thymosin-alpha-1', 'kpv'],
  },
  {
    slug: 'antimicrobial-peptide',
    term: 'Antimicrobial Peptide',
    abbr: 'AMP',
    category: 'biology',
    short: 'A class of innate-immunity peptides that directly kill or disable pathogens.',
    definition:
      'Antimicrobial peptides (AMPs) are a class of host-defense peptides produced by innate immune cells and epithelial tissues. They typically carry a net positive charge and fold into amphipathic structures that disrupt bacterial and fungal membranes. LL-37 (cathelicidin) is the only AMP of its family found in humans.',
    aliases: ['AMP', 'host defense peptide', 'cathelicidin', 'defensin'],
    relatedTerms: ['immune-modulation', 'tlr'],
    relatedAreas: ['immune-inflammation'],
  },
  {
    slug: 'glucagon',
    term: 'Glucagon',
    category: 'biology',
    short: 'The counter-regulatory hormone to insulin — raises blood glucose; targeted by triple agonists.',
    definition:
      'Glucagon is a hormone secreted by pancreatic alpha cells that raises blood glucose by promoting glycogenolysis and gluconeogenesis. It is the physiological counter to insulin. Retatrutide is a triple agonist at GLP-1, GIP, and glucagon receptors, with the glucagon component proposed to drive additional fat mobilization beyond what dual agonists achieve.',
    aliases: ['GcgR', 'glucagon receptor'],
    relatedTerms: ['glp-1', 'gip', 'incretin'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['retatrutide'],
  },
  {
    slug: 'ac-sdkp',
    term: 'Ac-SDKP',
    abbr: 'Ac-SDKP',
    category: 'biology',
    short: 'A tetrapeptide fragment of thymosin β4 with anti-inflammatory and anti-fibrotic activity.',
    definition:
      'Ac-SDKP (N-acetyl-seryl-aspartyl-lysyl-proline) is a naturally occurring tetrapeptide cleaved from the N-terminus of thymosin β4 by prolyl oligopeptidase. It inhibits NF-κB signaling, suppresses TGF-β-driven fibrosis, and may protect against cardiac and renal fibrotic remodeling. Its activity is mechanistically distinct from the actin-sequestering function of the full-length Tβ4 molecule.',
    aliases: ['N-acetyl-seryl-aspartyl-lysyl-proline'],
    relatedTerms: ['nf-kb', 'immune-modulation'],
    relatedAreas: ['immune-inflammation', 'wound-healing'],
    relatedPeptides: ['thymosin-beta-4'],
  },
  {
    slug: 'ketogenesis',
    term: 'Ketogenesis',
    category: 'biology',
    short: "The liver's production of ketone bodies from fatty acids during carbohydrate restriction.",
    definition:
      'Ketogenesis is the hepatic process of converting fatty acids into ketone bodies (acetoacetate, beta-hydroxybutyrate) when carbohydrate availability is low. GLP-1 agonists and metabolic peptides studied for weight loss indirectly affect ketogenic flux by altering insulin levels, lipolysis rates, and hepatic fat oxidation.',
    aliases: ['ketone body synthesis', 'ketosis'],
    relatedTerms: ['lipid-metabolism', 'ampk'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'tirzepatide'],
  },
  {
    slug: 'lipid-metabolism',
    term: 'Lipid Metabolism',
    category: 'biology',
    short: 'The biochemical processes by which fats are synthesized, stored, and broken down.',
    definition:
      'Lipid metabolism encompasses fatty-acid synthesis, beta-oxidation, lipolysis, and lipoprotein trafficking. GLP-1 and GIP receptor agonists influence lipid metabolism through multiple mechanisms including reduced hepatic lipid production, increased fatty-acid oxidation, and changes in adipokine signaling. Visceral and hepatic fat reduction are common trial endpoints.',
    relatedTerms: ['incretin', 'ampk', 'gastric-emptying'],
    relatedAreas: ['weight-loss'],
    relatedPeptides: ['semaglutide', 'tirzepatide', 'tesamorelin'],
  },

  // ── Identifiers & Standards (additions) ──────────────────────────────────
  {
    slug: 'wada-prohibited',
    term: 'WADA Prohibited',
    abbr: 'WADA',
    category: 'identifiers',
    short: "Listed on the World Anti-Doping Agency's prohibited substance list for competitive sports.",
    definition:
      'The World Anti-Doping Agency (WADA) publishes an annual Prohibited List of substances banned in competitive sport. GH secretagogues (CJC-1295, ipamorelin, hexarelin), TB-500, and several longevity-associated peptides are prohibited under the "Peptide Hormones, Growth Factors, Related Substances" category. Research-use compounds remain unaffected, but athletes must check WADA status independently.',
    aliases: ['WADA list', 'anti-doping', 'prohibited list'],
    relatedTerms: ['fda-approved', 'research-use-only'],
    relatedAreas: ['growth-hormone-axis'],
  },
  {
    slug: 'orphan-drug',
    term: 'Orphan Drug Designation',
    abbr: 'ODD',
    category: 'identifiers',
    short: 'An FDA designation that incentivises development for rare diseases (< 200,000 US patients).',
    definition:
      'Orphan Drug Designation (ODD) is granted by the FDA to drugs intended to treat rare diseases affecting fewer than 200,000 people in the US. It provides development incentives including 7-year market exclusivity, tax credits, and accelerated review. Thymosin α1 holds orphan designation in the US for certain indications.',
    aliases: ['ODD', 'orphan designation'],
    relatedTerms: ['fda-approved', 'clinical-phase'],
  },
  {
    slug: 'inn',
    term: 'INN',
    abbr: 'INN',
    category: 'identifiers',
    short: 'International Nonproprietary Name — the WHO-assigned generic name for a drug substance.',
    definition:
      'An International Nonproprietary Name (INN) is the unique, globally recognized name assigned to a pharmaceutical active substance by the World Health Organization. It is the generic name used across scientific literature, regulatory submissions, and dispensing — distinct from proprietary brand names. Semaglutide, tirzepatide, and bremelanotide are all INNs.',
    aliases: ['generic name', 'nonproprietary name', 'WHO INN'],
    relatedTerms: ['cas-number', 'fda-approved'],
  },
  {
    slug: 'research-use-only',
    term: 'Research Use Only',
    abbr: 'RUO',
    category: 'identifiers',
    short: 'A designation indicating a compound is sold for in vitro or non-clinical research, not human use.',
    definition:
      'Research Use Only (RUO) is a label indicating that a product is intended solely for in vitro or non-clinical research and has not been assessed for safety or efficacy in humans. Most research peptides are sold RUO; they are not FDA-cleared for human use and are not intended for administration to people.',
    aliases: ['RUO', 'not for human use', 'laboratory use only'],
    relatedTerms: ['fda-approved', 'clinical-phase'],
  },
  {
    slug: 'smiles',
    term: 'SMILES',
    abbr: 'SMILES',
    category: 'identifiers',
    short: 'A line notation for encoding molecular structure as a text string.',
    definition:
      'SMILES (Simplified Molecular Input Line Entry System) is a specification for encoding the structure of a chemical molecule as a text string, using letters for atoms and symbols for bonds and branches. It is compact, machine-readable, and widely used in cheminformatics databases including PubChem.',
    aliases: ['simplified molecular input line entry system', 'canonical SMILES'],
    relatedTerms: ['pubchem-cid', 'molecular-formula'],
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
    slug: "fda-approved",
    term: "FDA Approved",
    category: "research",
    short: "Cleared by the U.S. FDA as safe and effective for a specific use.",
    definition:
      "FDA Approved means a compound has met the U.S. Food and Drug Administration's standards for safety and efficacy for a specific indication. It is distinct from \"investigational,\" which denotes a compound still under study and not approved for clinical use.",
    aliases: ["fda approval"],
    relatedTerms: ["clinical-phase"],
  },
  {
    slug: "randomized-controlled-trial",
    term: "Randomized Controlled Trial",
    abbr: "RCT",
    category: "research",
    short: "The gold-standard trial design — participants randomly assigned to treatment or control.",
    definition:
      "A randomized controlled trial (RCT) assigns participants by chance to treatment or control groups, controlling for confounders and enabling causal inferences about efficacy. Phase 3 trials are typically large, multicenter RCTs. The STEP, SURMOUNT, and SURPASS series for GLP-1 agonists are examples of large Phase 3 RCTs.",
    aliases: ["RCT", "randomized trial"],
    relatedTerms: ["clinical-phase", "double-blind", "placebo", "endpoint"],
  },
  {
    slug: "placebo",
    term: "Placebo",
    category: "research",
    short: "An inert comparator used in controlled trials to isolate treatment effects.",
    definition:
      "A placebo is an inactive comparator — typically saline injection or sugar pill — administered to the control arm of a trial. Comparing outcomes between the treatment and placebo arms isolates the effect of the drug from expectation, regression to the mean, and other confounders. Placebo-adjusted weight loss is the standard reporting metric in GLP-1 trials.",
    aliases: ["placebo-controlled", "control arm"],
    relatedTerms: ["randomized-controlled-trial", "double-blind"],
  },
  {
    slug: "double-blind",
    term: "Double-Blind",
    category: "research",
    short: "Neither participants nor investigators know who received treatment — the strongest bias control.",
    definition:
      "In a double-blind trial, neither the participants nor the investigators assessing outcomes know which group received the active treatment. This design prevents performance bias (participants behaving differently if they know their treatment) and detection bias (investigators scoring outcomes differently). Most Phase 3 trials are double-blind, placebo-controlled.",
    aliases: ["double-blinded", "masked"],
    relatedTerms: ["randomized-controlled-trial", "placebo"],
  },
  {
    slug: "endpoint",
    term: "Endpoint",
    category: "research",
    short: "The outcome measured in a clinical trial to assess treatment effect.",
    definition:
      "An endpoint is a specific, pre-defined outcome measured in a trial to determine whether the intervention is effective. A primary endpoint is the main question the trial is powered to answer (e.g. % body-weight reduction at 68 weeks). Secondary endpoints examine additional outcomes. Surrogate endpoints (e.g. HbA1c) proxy for harder-to-measure clinical outcomes.",
    aliases: ["primary endpoint", "secondary endpoint", "surrogate endpoint"],
    relatedTerms: ["randomized-controlled-trial", "biomarker"],
  },
  {
    slug: "adverse-event",
    term: "Adverse Event",
    abbr: "AE",
    category: "research",
    short: "Any undesirable experience occurring in a trial participant — reported and graded.",
    definition:
      "An adverse event (AE) is any undesirable experience in a trial participant, whether or not related to the study drug. AEs are graded by severity (Grade 1–5) and causality. Serious adverse events (SAEs) include death, hospitalization, or permanent harm. Gastrointestinal AEs (nausea, vomiting, diarrhea) are the most commonly reported for GLP-1 agonists.",
    aliases: ["AE", "SAE", "serious adverse event", "side effect"],
    relatedTerms: ["clinical-phase", "randomized-controlled-trial"],
  },
  {
    slug: "off-label",
    term: "Off-Label Use",
    category: "research",
    short: "Prescribing an approved drug outside its approved indication.",
    definition:
      "Off-label use refers to prescribing an FDA-approved drug for an indication, population, dose, or route not in its approved label. It is legal for licensed clinicians but not FDA-sanctioned. For example, semaglutide for weight loss in people without diabetes was off-label before Wegovy was approved.",
    aliases: ["off label", "unapproved use"],
    relatedTerms: ["fda-approved", "clinical-phase"],
  },
  {
    slug: "pharmacokinetics",
    term: "Pharmacokinetics",
    abbr: "PK",
    category: "research",
    short: "How the body absorbs, distributes, metabolizes, and excretes a drug — ADME.",
    definition:
      "Pharmacokinetics (PK) describes what the body does to a drug, summarized as ADME: Absorption, Distribution, Metabolism, and Excretion. Key PK parameters for peptides include bioavailability, volume of distribution, Cmax, Tmax, and elimination half-life. PK shapes dosing frequency and route decisions.",
    aliases: ["PK", "ADME", "pharmacokinetic profile"],
    relatedTerms: ["half-life", "bioavailability", "pharmacodynamics"],
  },
  {
    slug: "pharmacodynamics",
    term: "Pharmacodynamics",
    abbr: "PD",
    category: "research",
    short: "What a drug does to the body — receptor binding, downstream effects, dose-response.",
    definition:
      "Pharmacodynamics (PD) describes what a drug does to the body at the molecular and systems level, including receptor binding, downstream signaling, and the relationship between concentration and effect. PD is paired with PK in drug development: PK tells you exposure, PD tells you what that exposure achieves.",
    aliases: ["PD", "pharmacodynamic profile"],
    relatedTerms: ["pharmacokinetics", "dose-response", "binding-affinity"],
  },
  {
    slug: "dose-response",
    term: "Dose-Response Relationship",
    category: "research",
    short: "How the magnitude of an effect changes with increasing dose.",
    definition:
      "The dose-response relationship describes how the magnitude (and sometimes character) of a biological effect changes with increasing dose. A monotonic positive relationship — more dose, more effect — is expected for most agonists. Plateau (maximum effect) and U-shaped curves (high dose less effective than low dose) are also observed. Establishing dose-response is a primary goal of Phase 2 trials.",
    aliases: ["dose response", "exposure-response"],
    relatedTerms: ["pharmacodynamics", "binding-affinity", "clinical-phase"],
  },
  {
    slug: "in-vitro",
    term: "In Vitro",
    abbr: "in vitro",
    category: "research",
    short: "Research performed in cell cultures or isolated tissues outside a living organism.",
    definition:
      "In vitro (Latin: \"in glass\") refers to experiments performed in cell cultures, tissue slices, or biochemical systems outside a living organism. In vitro results demonstrate biological plausibility but do not establish that an effect will occur in a living system at physiologically relevant concentrations.",
    aliases: ["cell culture", "in-vitro", "bench research"],
    relatedTerms: ["in-vivo", "preclinical", "clinical-phase"],
  },
  {
    slug: "in-vivo",
    term: "In Vivo",
    abbr: "in vivo",
    category: "research",
    short: "Research performed in living organisms — animal models or humans.",
    definition:
      "In vivo (Latin: \"within the living\") refers to experiments performed in whole living organisms. Animal (rodent) models come first; human clinical trials follow. In vivo data are considered stronger than in vitro because they reflect whole-system complexity — absorption, distribution, immune response, and off-target effects.",
    aliases: ["animal study", "in-vivo", "preclinical animal model"],
    relatedTerms: ["in-vitro", "preclinical", "clinical-phase"],
  },
  {
    slug: "preclinical",
    term: "Preclinical",
    category: "research",
    short: "Studies conducted before human trials — cell, tissue, and animal models.",
    definition:
      "Preclinical research encompasses all studies — in vitro and animal in vivo — conducted before a compound enters human trials. Preclinical data inform safety and efficacy hypotheses for Phase 1 design. Many research peptides (BPC-157, LL-37, most GHRPs) remain at the preclinical stage with no human trial data.",
    aliases: ["preclinical stage", "non-clinical research"],
    relatedTerms: ["in-vitro", "in-vivo", "clinical-phase"],
  },
  {
    slug: "biomarker",
    term: "Biomarker",
    category: "research",
    short: "A measurable biological indicator used to track disease or treatment response.",
    definition:
      "A biomarker is a measurable biological characteristic used as an indicator of normal or pathological processes, or of response to treatment. Examples: HbA1c for diabetes management, IGF-1 for GH-axis activity, VEGF levels for angiogenic activity. Biomarkers may serve as surrogate endpoints in trials when the true clinical endpoint would take too long to measure.",
    aliases: ["surrogate biomarker", "biological marker"],
    relatedTerms: ["endpoint", "pharmacodynamics"],
  },
  {
    slug: "peer-reviewed",
    term: "Peer-Reviewed",
    category: "research",
    short: "Research evaluated by independent scientific experts before publication.",
    definition:
      "Peer review is the process by which submitted research is evaluated by independent experts in the field before publication in a scientific journal. It screens for methodological errors, unsupported claims, and misrepresentation of data. Peer-reviewed publication is a necessary but not sufficient condition for a finding to be reliable.",
    aliases: ["peer review", "refereed journal"],
    relatedTerms: ["systematic-review", "in-vitro", "randomized-controlled-trial"],
  },
  {
    slug: "systematic-review",
    term: "Systematic Review",
    category: "research",
    short: "A structured synthesis of all eligible studies on a research question.",
    definition:
      "A systematic review applies pre-specified inclusion criteria to identify and synthesize all available studies on a defined research question. A meta-analysis quantitatively pools results from multiple studies to produce an aggregate effect estimate. Together they represent the highest level of evidence above individual RCTs in the evidence hierarchy.",
    aliases: ["meta-analysis", "evidence synthesis", "Cochrane review"],
    relatedTerms: ["randomized-controlled-trial", "peer-reviewed"],
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

/** Glossary terms relevant to one or more research areas (via relatedAreas),
 *  ranked by how many of the given areas each term touches. For scoped
 *  "key terms" modules on research-area and comparison pages. */
export function getGlossaryForAreas(areaSlugs: string[], limit = 6): GlossaryTerm[] {
  const set = new Set(areaSlugs)
  return GLOSSARY.filter((t) => (t.relatedAreas ?? []).some((a) => set.has(a)))
    .sort(
      (a, b) =>
        (b.relatedAreas ?? []).filter((x) => set.has(x)).length -
        (a.relatedAreas ?? []).filter((x) => set.has(x)).length,
    )
    .slice(0, limit)
}

/** Glossary terms relevant to one or more catalog peptides (via relatedPeptides). */
export function getGlossaryForPeptides(peptideSlugs: string[], limit = 6): GlossaryTerm[] {
  const set = new Set(peptideSlugs)
  return GLOSSARY.filter((t) => (t.relatedPeptides ?? []).some((p) => set.has(p))).slice(0, limit)
}
