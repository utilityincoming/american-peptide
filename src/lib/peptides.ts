// Catalog data for AmericanPeptide.com
//
// Schema is intentionally forward-compatible with a future marketplace
// (suppliers, COAs, transparent pricing). Marketplace fields are scaffolded
// but the catalog ships as a research reference only — no live supplier or
// price data is fabricated.

export type PeptideCategory =
  | 'metabolic'
  | 'growth-hormone'
  | 'healing-repair'
  | 'cognitive'
  | 'longevity'
  | 'cosmetic'
  | 'reproductive'
  | 'immune'
  | 'mitochondrial'

export interface CategoryMeta {
  id: PeptideCategory
  label: string
  blurb: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'metabolic',       label: 'Metabolic',        blurb: 'GLP-1 / GIP / glucagon agonists and adipose-targeting peptides.' },
  { id: 'growth-hormone',  label: 'Growth Hormone',   blurb: 'GHRH analogs, GHRPs, and growth hormone secretagogues.' },
  { id: 'healing-repair',  label: 'Healing & Repair', blurb: 'Tissue repair, angiogenesis, and regenerative peptides.' },
  { id: 'cognitive',       label: 'Cognitive',        blurb: 'Nootropics, neurotrophics, and synaptic modulators.' },
  { id: 'longevity',       label: 'Longevity',        blurb: 'Senolytics, telomere, and aging-axis peptides.' },
  { id: 'cosmetic',        label: 'Cosmetic',         blurb: 'Pigmentation, hair, and skin-targeting peptides.' },
  { id: 'reproductive',    label: 'Reproductive',     blurb: 'HPG-axis, kisspeptin, and reproductive hormones.' },
  { id: 'immune',          label: 'Immune',           blurb: 'Thymic peptides and immunomodulators.' },
  { id: 'mitochondrial',   label: 'Mitochondrial',    blurb: 'Mitochondrial bioenergetics and NAD+ axis.' },
]

export interface MarketStub {
  // Forward-looking marketplace fields. All values represent intent only —
  // no live supplier listings exist yet. Surfaced in UI as "coming soon".
  trackedSuppliers: number
  trackedVariants: number
  certificatesOnFile: number
}

export interface Peptide {
  slug: string
  name: string
  aliases?: string[]
  categories: PeptideCategory[]
  shortDescription: string
  description: string
  mechanism?: string
  researchAreas?: string[]
  molecularWeight?: number // Daltons
  molecularFormula?: string
  sequence?: string
  cas?: string
  pubchemCid?: number
  uniprotId?: string
  fdaApproved?: boolean
  market?: MarketStub
}

import pubchemCache from './peptides.pubchem.json'

interface PubChemEntry {
  cid: number
  matchedName: string
  molecularWeight: number | null
  molecularFormula: string | null
  iupacName: string | null
}

const PUBCHEM: Record<string, PubChemEntry> = pubchemCache as Record<
  string,
  PubChemEntry
>

function enrich(seed: Peptide): Peptide {
  const hit = PUBCHEM[seed.slug]
  if (!hit) return seed
  return {
    ...seed,
    // Hand-edited seed values win over PubChem; only fill gaps.
    pubchemCid: seed.pubchemCid ?? hit.cid,
    molecularWeight: seed.molecularWeight ?? hit.molecularWeight ?? undefined,
    molecularFormula:
      seed.molecularFormula ?? hit.molecularFormula ?? undefined,
  }
}

const SEED_PEPTIDES: Peptide[] = [
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    aliases: ['Ozempic', 'Wegovy', 'Rybelsus'],
    categories: ['metabolic'],
    shortDescription: 'Long-acting GLP-1 receptor agonist for glycemic control and weight management.',
    description:
      'Semaglutide is a 31-amino-acid GLP-1 receptor agonist engineered for once-weekly dosing via fatty-acid acylation and amino-acid substitutions that resist DPP-4 degradation. Approved by the FDA for type 2 diabetes (2017) and chronic weight management (2021).',
    mechanism: 'GLP-1 receptor agonism → glucose-dependent insulin secretion, slowed gastric emptying, central appetite suppression.',
    researchAreas: ['Type 2 diabetes', 'Obesity', 'MASH', 'Cardiovascular risk reduction'],
    molecularWeight: 4113.6,
    cas: '910463-68-2',
    fdaApproved: true,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    aliases: ['Mounjaro', 'Zepbound'],
    categories: ['metabolic'],
    shortDescription: 'Dual GIP / GLP-1 receptor agonist with industry-leading weight-loss endpoints.',
    description:
      'Tirzepatide is a 39-amino-acid synthetic peptide acting as a dual agonist at GIP and GLP-1 receptors. Approved by the FDA for type 2 diabetes (2022) and chronic weight management (2023).',
    mechanism: 'Co-activation of GIP + GLP-1 receptors; complementary insulinotropic and satiety effects.',
    researchAreas: ['Type 2 diabetes', 'Obesity', 'Obstructive sleep apnea'],
    molecularWeight: 4813.5,
    cas: '2023788-19-2',
    fdaApproved: true,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    aliases: ['LY3437943'],
    categories: ['metabolic'],
    shortDescription: 'Investigational triple agonist (GIP / GLP-1 / glucagon) in late-stage trials.',
    description:
      'Retatrutide is an Eli Lilly–developed triple agonist targeting GIP, GLP-1, and glucagon receptors. Phase 2 trials reported ~24% mean weight reduction at 48 weeks at the highest dose.',
    mechanism: 'GIP + GLP-1 (insulinotropic, satiety) plus glucagon (energy expenditure, lipolysis).',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'MASH'],
    molecularWeight: 4731.5,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'cagrilintide',
    name: 'Cagrilintide',
    categories: ['metabolic'],
    shortDescription: 'Long-acting amylin analog studied alongside semaglutide as CagriSema.',
    description:
      'Cagrilintide is a 37-amino-acid acylated amylin analog with affinity at all five amylin receptor subtypes. Investigated by Novo Nordisk both as monotherapy and in combination with semaglutide (CagriSema).',
    mechanism: 'Amylin and calcitonin receptor agonism → satiety, slowed gastric emptying.',
    researchAreas: ['Obesity', 'Combination metabolic therapy'],
    molecularWeight: 3858.3,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    aliases: ['Body Protective Compound 157', 'PL 14736'],
    categories: ['healing-repair'],
    shortDescription: 'Synthetic gastric pentadecapeptide investigated for tendon, ligament, and GI repair.',
    description:
      'BPC-157 is a 15-amino-acid sequence derived from a protective protein found in human gastric juice. Preclinical work suggests pro-angiogenic and cytoprotective activity across tendon, ligament, muscle, and GI tissue.',
    mechanism: 'Putative upregulation of VEGFR2 and modulation of nitric oxide / growth factor pathways.',
    researchAreas: ['Tendinopathy', 'Wound healing', 'IBD models'],
    molecularWeight: 1419.5,
    sequence: 'GEPPPGKPADDAGLV',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    aliases: ['Thymosin Beta-4 fragment'],
    categories: ['healing-repair'],
    shortDescription: 'Synthetic fragment of thymosin β4 studied for cell migration and tissue repair.',
    description:
      'TB-500 corresponds to the active actin-binding region of thymosin β4. Preclinical studies report effects on endothelial cell migration, angiogenesis, and wound healing.',
    mechanism: 'G-actin sequestration; modulation of cell migration and angiogenesis.',
    researchAreas: ['Wound healing', 'Cardiac repair models', 'Hair growth'],
    sequence: 'LKKTETQ',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    aliases: ['Copper Peptide', 'Tripeptide-1 Copper'],
    categories: ['cosmetic', 'healing-repair'],
    shortDescription: 'Endogenous copper-binding tripeptide widely studied in skin and hair biology.',
    description:
      'GHK-Cu is the copper complex of the tripeptide glycyl-L-histidyl-L-lysine, an endogenous fragment first isolated from human plasma. Reported to modulate ECM remodeling, fibroblast activity, and antioxidant defense.',
    mechanism: 'Copper delivery, ECM gene modulation, antioxidant pathway activation.',
    researchAreas: ['Skin aging', 'Hair follicle biology', 'Wound healing'],
    sequence: 'GHK',
    molecularWeight: 340.8,
    cas: '49557-75-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (no DAC)',
    aliases: ['Modified GRF (1-29)', 'Mod GRF 1-29'],
    categories: ['growth-hormone'],
    shortDescription: 'Modified GHRH(1-29) analog with short plasma half-life.',
    description:
      'CJC-1295 without DAC is a 30-amino-acid analog of GHRH(1-29) with four substitutions that improve stability against DPP-4. Half-life ~30 minutes; commonly studied alongside GHRPs for pulsatile GH release.',
    mechanism: 'GHRH receptor agonism on pituitary somatotrophs.',
    researchAreas: ['GH pulsatility', 'Body composition models'],
    sequence: 'YADAIFTQSYRKVLAQLSARKLLQDIMSR',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'cjc-1295-with-dac',
    name: 'CJC-1295 (with DAC)',
    aliases: ['CJC-1295 DAC'],
    categories: ['growth-hormone'],
    shortDescription: 'Long-acting GHRH analog with a Drug Affinity Complex for albumin binding.',
    description:
      'Adds a maleimidopropionic acid (DAC) moiety to modified GRF(1-29), enabling covalent binding to serum albumin and extending half-life to roughly 6–8 days.',
    mechanism: 'GHRH receptor agonism with albumin-mediated extended exposure.',
    researchAreas: ['Sustained GH release', 'IGF-1 elevation'],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    categories: ['growth-hormone'],
    shortDescription: 'Selective ghrelin receptor agonist (GHRP) with minimal cortisol / prolactin release.',
    description:
      'Ipamorelin is a pentapeptide GHRP that selectively activates the GHS-R1a (ghrelin) receptor, releasing growth hormone with minimal impact on ACTH, cortisol, or prolactin.',
    mechanism: 'Selective GHS-R1a agonism.',
    researchAreas: ['GH secretion studies', 'Pituitary function'],
    sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
    molecularWeight: 711.9,
    cas: '170851-70-4',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    aliases: ['Egrifta'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription: 'GHRH analog FDA-approved for HIV-associated lipodystrophy.',
    description:
      'Tesamorelin is a stabilized 44-amino-acid GHRH analog approved by the FDA in 2010 for reduction of excess abdominal fat in HIV-infected patients with lipodystrophy.',
    mechanism: 'GHRH receptor agonism → endogenous GH release.',
    researchAreas: ['Visceral adiposity', 'HIV-associated lipodystrophy', 'Cognition'],
    molecularWeight: 5135.9,
    cas: '218949-48-5',
    fdaApproved: true,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'sermorelin',
    name: 'Sermorelin',
    aliases: ['GRF 1-29', 'Geref'],
    categories: ['growth-hormone'],
    shortDescription: 'Truncated GHRH(1-29) — historically the first GHRH analog approved by the FDA.',
    description:
      'Sermorelin is the first 29 amino acids of endogenous GHRH and was approved by the FDA in 1990 (subsequently discontinued commercially) for diagnostic and pediatric GH deficiency use.',
    mechanism: 'GHRH receptor agonism.',
    researchAreas: ['GH axis evaluation', 'Pediatric GH deficiency (historical)'],
    sequence: 'YADAIFTNSYRKVLGQLSARKLLQDIMSR',
    molecularWeight: 3358,
    cas: '86168-78-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'hexarelin',
    name: 'Hexarelin',
    categories: ['growth-hormone'],
    shortDescription: 'Synthetic hexapeptide GHRP with potent GH-releasing activity.',
    description:
      'Hexarelin is a synthetic GHRP-6 analog and a potent GH secretagogue with documented cardioprotective effects in preclinical models, mediated in part via CD36.',
    mechanism: 'GHS-R1a and CD36 agonism.',
    researchAreas: ['GH release', 'Cardioprotection models'],
    sequence: 'His-D-2-MeTrp-Ala-Trp-D-Phe-Lys-NH2',
    cas: '140703-51-1',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'mots-c',
    name: 'MOTS-c',
    categories: ['mitochondrial', 'longevity', 'metabolic'],
    shortDescription: 'Mitochondrially-encoded peptide with reported insulin-sensitizing activity.',
    description:
      'MOTS-c is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA region. Preclinical studies report improved insulin sensitivity, AMPK activation, and exercise capacity.',
    mechanism: 'AMPK activation; modulation of folate / methionine cycle.',
    researchAreas: ['Metabolic disease', 'Exercise physiology', 'Aging biology'],
    sequence: 'MRWQEMGYIFYPRKLR',
    molecularWeight: 2174.6,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ss-31',
    name: 'SS-31',
    aliases: ['Elamipretide', 'Bendavia'],
    categories: ['mitochondrial', 'longevity'],
    shortDescription: 'Mitochondria-targeted cardiolipin-binding tetrapeptide.',
    description:
      'SS-31 (elamipretide) is a synthetic tetrapeptide that concentrates in the inner mitochondrial membrane and binds cardiolipin, stabilizing electron transport chain organization in clinical trials for primary mitochondrial myopathy and Barth syndrome.',
    mechanism: 'Cardiolipin binding; preservation of cristae architecture and ETC efficiency.',
    researchAreas: ['Mitochondrial myopathy', 'Barth syndrome', 'Heart failure'],
    sequence: 'D-Arg-Dmt-Lys-Phe-NH2',
    cas: '736992-21-5',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'epitalon',
    name: 'Epitalon',
    aliases: ['Epithalon', 'Epithalamin fragment'],
    categories: ['longevity'],
    shortDescription: 'Synthetic tetrapeptide investigated for telomerase activity and circadian effects.',
    description:
      'Epitalon is a synthetic four-amino-acid peptide derived from the pineal peptide epithalamin. Russian-led clinical work has reported effects on melatonin secretion and lifespan endpoints in rodent models.',
    mechanism: 'Reported telomerase upregulation; pineal-axis modulation.',
    researchAreas: ['Aging biology', 'Circadian biology', 'Pineal function'],
    sequence: 'AEDG',
    molecularWeight: 390.4,
    cas: '307297-39-8',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'semax',
    name: 'Semax',
    categories: ['cognitive'],
    shortDescription: 'Russian synthetic ACTH(4-10) analog studied for nootropic and neuroprotective effects.',
    description:
      'Semax is a heptapeptide analog of ACTH(4-10) developed in Russia, used clinically there for stroke and cognitive disorders. Preclinical studies report BDNF / NGF upregulation.',
    mechanism: 'BDNF / NGF induction; melanocortin signaling without HPA activation.',
    researchAreas: ['Ischemic stroke recovery', 'Cognition', 'Neuroprotection'],
    sequence: 'MEHFPGP',
    cas: '80714-61-0',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'selank',
    name: 'Selank',
    categories: ['cognitive'],
    shortDescription: 'Synthetic heptapeptide analog of tuftsin investigated as an anxiolytic.',
    description:
      'Selank is a synthetic analog of the immunomodulatory peptide tuftsin, developed in Russia. Reported activity includes anxiolytic effects without sedation or dependence in clinical and preclinical work.',
    mechanism: 'Modulation of GABAergic and serotonergic systems; enkephalinase inhibition.',
    researchAreas: ['Generalized anxiety', 'Cognitive performance'],
    sequence: 'TKPRPGP',
    cas: '129954-34-3',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    aliases: ['Delta Sleep-Inducing Peptide'],
    categories: ['cognitive'],
    shortDescription: 'Endogenous nonapeptide first isolated for its sleep-promoting properties.',
    description:
      'DSIP is a nine-amino-acid neuropeptide first isolated from rabbit cerebral venous blood. Reported effects span sleep architecture, stress response, and circadian rhythm modulation.',
    mechanism: 'Mechanism remains incompletely characterized; likely multimodal CNS modulation.',
    researchAreas: ['Sleep biology', 'Stress physiology'],
    sequence: 'WAGGDASGE',
    molecularWeight: 848.8,
    cas: '62568-57-4',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'melanotan-2',
    name: 'Melanotan II',
    aliases: ['MT-2', 'MT-II'],
    categories: ['cosmetic', 'reproductive'],
    shortDescription: 'Synthetic cyclic analog of α-MSH; non-selective melanocortin receptor agonist.',
    description:
      'Melanotan II is a cyclic heptapeptide α-MSH analog developed at the University of Arizona. Acts as a non-selective agonist across MC1R, MC3R, MC4R, and MC5R — pigmentation and sexual-response effects have both been documented.',
    mechanism: 'Non-selective melanocortin receptor (MC1-5R) agonism.',
    researchAreas: ['Pigmentation biology', 'Sexual dysfunction', 'Photoprotection'],
    cas: '121062-08-6',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'pt-141',
    name: 'PT-141',
    aliases: ['Bremelanotide', 'Vyleesi'],
    categories: ['reproductive'],
    shortDescription: 'Melanocortin-4 receptor agonist FDA-approved for HSDD in premenopausal women.',
    description:
      'Bremelanotide (PT-141) is a cyclic heptapeptide melanocortin agonist with preferential activity at MC4R. Approved by the FDA in 2019 for hypoactive sexual desire disorder in premenopausal women.',
    mechanism: 'MC4R-preferential melanocortin agonism in CNS sexual-response circuits.',
    researchAreas: ['HSDD', 'CNS sexual response', 'Ischemia models'],
    cas: '189691-06-3',
    fdaApproved: true,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    categories: ['reproductive'],
    shortDescription: 'C-terminal decapeptide fragment of kisspeptin; potent GnRH secretagogue.',
    description:
      'Kisspeptin-10 (KP-10) is the minimum bioactive fragment of kisspeptin, encoded by KISS1. Administration stimulates hypothalamic GnRH release and downstream LH / FSH secretion.',
    mechanism: 'KISS1R (GPR54) agonism on hypothalamic GnRH neurons.',
    researchAreas: ['Reproductive endocrinology', 'Hypothalamic amenorrhea', 'Puberty'],
    sequence: 'YNWNSFGLRF-NH2',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    aliases: ['Tα1', 'Thymalfasin', 'Zadaxin'],
    categories: ['immune'],
    shortDescription: 'Thymus-derived 28-amino-acid peptide approved in many countries as an immunomodulator.',
    description:
      'Thymosin α1 is a 28-amino-acid peptide originally isolated from thymic tissue. Approved in numerous countries as adjunctive therapy in chronic hepatitis B / C and as an immune-system modulator.',
    mechanism: 'TLR9-mediated DC activation; Th1 immune polarization.',
    researchAreas: ['Chronic viral hepatitis', 'Sepsis adjunct', 'Oncology adjunct'],
    sequence: 'SDAAVDTSSEITTKDLKEKKEVVEEAEN',
    molecularWeight: 3108.3,
    cas: '62304-98-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'll-37',
    name: 'LL-37',
    aliases: ['Cathelicidin', 'hCAP-18 fragment'],
    categories: ['immune', 'healing-repair'],
    shortDescription: 'Human cathelicidin antimicrobial peptide active across bacteria, fungi, and viruses.',
    description:
      'LL-37 is the C-terminal 37-residue fragment of human cathelicidin hCAP-18 and the only cathelicidin expressed in humans. Roles span direct antimicrobial activity, chemotaxis, and wound healing.',
    mechanism: 'Membrane disruption of pathogens; immunomodulatory signaling via FPRL1.',
    researchAreas: ['Antimicrobial resistance', 'Chronic wound healing', 'Innate immunity'],
    molecularWeight: 4493.3,
    cas: '154947-66-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'kpv',
    name: 'KPV',
    categories: ['immune', 'healing-repair'],
    shortDescription: 'Anti-inflammatory C-terminal tripeptide of α-MSH.',
    description:
      'KPV (Lys-Pro-Val) is the C-terminal tripeptide of α-MSH and retains much of α-MSH\'s anti-inflammatory activity without pigmentary effects. Preclinical work in colitis and skin inflammation models.',
    mechanism: 'NF-κB pathway inhibition; reduction of pro-inflammatory cytokines.',
    researchAreas: ['IBD models', 'Atopic dermatitis', 'Oral inflammation'],
    sequence: 'KPV',
    molecularWeight: 342.4,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    categories: ['metabolic'],
    shortDescription: 'C-terminal hGH fragment (177–191) historically investigated for lipolysis.',
    description:
      'AOD-9604 is a 16-amino-acid synthetic peptide derived from the lipolytic C-terminal domain of human growth hormone. Reached Phase IIb obesity trials without meeting weight-loss endpoints; later repositioned to cartilage / joint research.',
    mechanism: 'Putative β3-adrenergic mediated lipolysis without GH receptor binding.',
    researchAreas: ['Obesity (historical)', 'Cartilage repair'],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: '5-amino-1mq',
    name: '5-Amino-1MQ',
    categories: ['metabolic', 'longevity'],
    shortDescription: 'Small-molecule NNMT inhibitor (often catalogued alongside peptides).',
    description:
      '5-Amino-1MQ is a selective inhibitor of nicotinamide N-methyltransferase (NNMT). Preclinical work links NNMT inhibition to improvements in adipose tissue metabolism and skeletal muscle aging.',
    mechanism: 'NNMT inhibition → preserved cellular NAD+ / SAM pools.',
    researchAreas: ['Obesity', 'Sarcopenia', 'NAD+ biology'],
    cas: '209783-80-2',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'nad-plus',
    name: 'NAD+',
    aliases: ['Nicotinamide Adenine Dinucleotide'],
    categories: ['mitochondrial', 'longevity'],
    shortDescription: 'Essential redox cofactor central to mitochondrial bioenergetics and sirtuin activity.',
    description:
      'NAD+ is a ubiquitous coenzyme required for electron transport, sirtuin activity, and PARP-mediated DNA repair. Often supplied as a research reagent and increasingly as an investigational therapeutic.',
    mechanism: 'Cofactor for hundreds of redox and signaling enzymes including sirtuins and PARPs.',
    researchAreas: ['Aging biology', 'Mitochondrial dysfunction', 'Neurodegeneration'],
    molecularWeight: 663.4,
    cas: '53-84-9',
    pubchemCid: 5893,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
]

export const PEPTIDES: Peptide[] = SEED_PEPTIDES.map(enrich)

export function getPeptideBySlug(slug: string): Peptide | undefined {
  return PEPTIDES.find((p) => p.slug === slug)
}

export function getPeptidesByCategory(category: PeptideCategory): Peptide[] {
  return PEPTIDES.filter((p) => p.categories.includes(category))
}

export function getCategoryLabel(id: PeptideCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
