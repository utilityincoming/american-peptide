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
  /** Longer-form discovery/context paragraphs rendered on the detail page. */
  background?: string[]
  /** Notable research findings — research-framed bullets. */
  keyResearch?: string[]
  /** Per-peptide FAQs — rendered as an accordion and emitted as FAQPage schema. */
  faqs?: { q: string; a: string }[]
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
    background: [
      'Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist built on the backbone of human GLP-1. Two engineering changes define it: a C18 fatty-diacid chain attached through a linker that promotes reversible binding to albumin, and amino-acid substitutions that resist degradation by the enzyme DPP-4. Together these extend its half-life to roughly a week, enabling once-weekly administration.',
      'It reached the market first for type 2 diabetes (Ozempic, 2017; oral Rybelsus, 2019) and then for chronic weight management (Wegovy, 2021). Large cardiovascular-outcome and weight-management trials have made it one of the most studied metabolic peptides of the past decade, and its template — acylation plus DPP-4 resistance — now informs the broader incretin class.',
    ],
    keyResearch: [
      'Glycemic control — studied for glucose-dependent insulin secretion and glucagon suppression in type 2 diabetes.',
      'Weight management — chronic-weight-management trials reported substantial mean body-weight reduction versus placebo.',
      'Cardiovascular outcomes — investigated for reduction of major adverse cardiovascular events in at-risk populations.',
      'MASH / hepatic fat — examined as an endpoint in metabolic liver-disease research.',
      'Half-life engineering — fatty-acid acylation and DPP-4-resistant substitutions are the basis of its once-weekly profile.',
    ],
    faqs: [
      {
        q: 'What is semaglutide?',
        a: 'Semaglutide is a long-acting GLP-1 receptor agonist approved for type 2 diabetes and chronic weight management. It is marketed as Ozempic, Wegovy, and Rybelsus.',
      },
      {
        q: 'How does semaglutide promote weight loss?',
        a: 'In studies it slows gastric emptying and acts on appetite centers in the brain while enhancing glucose-dependent insulin release, which together reduce caloric intake.',
      },
      {
        q: 'Why is it dosed once weekly?',
        a: 'Fatty-acid acylation promotes reversible binding to albumin and amino-acid substitutions resist DPP-4 breakdown, extending its half-life to about a week.',
      },
      {
        q: 'What is the difference between Ozempic, Wegovy, and Rybelsus?',
        a: 'All three are semaglutide. Ozempic and oral Rybelsus are approved for type 2 diabetes; Wegovy is approved for chronic weight management. This page is a research reference, not medical advice.',
      },
    ],
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
    background: [
      'Tirzepatide is a synthetic 39-amino-acid peptide that activates two incretin receptors at once — GIP (glucose-dependent insulinotropic polypeptide) and GLP-1. It carries a fatty-acid chain for albumin binding and once-weekly dosing, and is sometimes described as a "twincretin" for its dual mechanism.',
      'Developed by Eli Lilly, it was approved for type 2 diabetes (Mounjaro, 2022) and chronic weight management (Zepbound, 2023). In placebo-controlled and head-to-head trials it produced some of the largest weight reductions reported for a pharmacologic agent, which has driven intense research interest in multi-receptor incretin design.',
    ],
    keyResearch: [
      'Glycemic control — dual GIP/GLP-1 activation studied for insulin secretion and HbA1c reduction.',
      'Weight management — trials reported weight reductions exceeding those of single GLP-1 agonists.',
      'Obstructive sleep apnea — investigated as an endpoint in people with obesity.',
      'Cardiometabolic markers — examined for effects on lipids, blood pressure, and hepatic fat.',
      'Dual-agonism rationale — GIP is studied as complementary to GLP-1 for insulinotropic and satiety effects.',
    ],
    faqs: [
      {
        q: 'What is tirzepatide?',
        a: 'Tirzepatide is a dual GIP/GLP-1 receptor agonist approved for type 2 diabetes (Mounjaro) and chronic weight management (Zepbound).',
      },
      {
        q: 'How is tirzepatide different from semaglutide?',
        a: 'Semaglutide activates the GLP-1 receptor alone; tirzepatide activates both GIP and GLP-1 receptors, a dual mechanism studied for greater metabolic effect.',
      },
      {
        q: 'What does "twincretin" mean?',
        a: 'It is an informal term for a peptide that engages two incretin pathways — here GIP and GLP-1 — within a single molecule.',
      },
      {
        q: 'Is tirzepatide FDA approved?',
        a: 'Yes, for type 2 diabetes and chronic weight management under the brand names Mounjaro and Zepbound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Retatrutide (development code LY3437943) is an investigational single peptide that activates three receptors — GIP, GLP-1, and glucagon. Adding glucagon-receptor agonism to the incretin pair is studied as a way to increase energy expenditure and lipolysis on top of the insulinotropic and satiety effects of GIP and GLP-1.',
      'Developed by Eli Lilly, it remains investigational and has not been approved. Phase 2 results reported notably large mean weight reductions at the highest doses over roughly a year, placing it among the most closely watched "triple agonist" candidates in late-stage metabolic research.',
    ],
    keyResearch: [
      'Triple agonism — combines GIP/GLP-1 (insulin, satiety) with glucagon (energy expenditure, lipolysis).',
      'Weight reduction — Phase 2 trials reported among the largest mean reductions seen for an investigational agent.',
      'Type 2 diabetes — studied for glycemic endpoints alongside weight.',
      'MASH / hepatic fat — examined as a metabolic-liver-disease endpoint.',
      'Investigational status — not approved; under continued clinical evaluation.',
    ],
    faqs: [
      {
        q: 'What is retatrutide?',
        a: 'Retatrutide is an investigational triple agonist targeting the GIP, GLP-1, and glucagon receptors, studied in late-stage trials for obesity and type 2 diabetes.',
      },
      {
        q: 'How does a triple agonist differ from dual or single agonists?',
        a: 'It adds glucagon-receptor activation — studied for increased energy expenditure and fat breakdown — to the insulinotropic and satiety effects of GIP and GLP-1.',
      },
      {
        q: 'Is retatrutide approved?',
        a: 'No. It is investigational and has not received FDA approval; all data comes from clinical research.',
      },
      {
        q: 'Who develops retatrutide?',
        a: 'Eli Lilly. This page is a research and educational reference, not medical advice or an offer for sale.',
      },
    ],
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
    background: [
      'BPC-157 (Body Protective Compound-157) is a synthetic 15-amino-acid sequence derived from a protective protein identified in human gastric juice. It is studied as a cytoprotective and pro-angiogenic agent, with most of the interest centered on connective-tissue and gastrointestinal repair.',
      'Essentially all of the evidence is preclinical — cell cultures and rodent models — and BPC-157 is not approved by the FDA for any use. It is widely discussed in the tissue-repair literature but lacks the controlled human trials that characterize approved peptides, so model choice and endpoint definition are central caveats.',
    ],
    keyResearch: [
      'Tendon & ligament repair — rodent models studied for healing of tendon, ligament, and muscle injury.',
      'Gastrointestinal protection — examined in models of ulcer and inflammatory bowel disease.',
      'Angiogenesis — proposed to upregulate the VEGFR2 receptor and promote new-vessel formation.',
      'Nitric-oxide & growth-factor pathways — investigated as part of its cytoprotective mechanism.',
      'Preclinical only — no controlled human trials; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is BPC-157?',
        a: 'BPC-157 is a synthetic 15-amino-acid peptide derived from a protein in gastric juice, studied in preclinical models for tissue repair and cytoprotection.',
      },
      {
        q: 'What is BPC-157 studied for?',
        a: 'Research contexts include tendon, ligament, and muscle repair, gastrointestinal protection, and angiogenesis — almost entirely in cell and animal models.',
      },
      {
        q: 'Is BPC-157 FDA approved?',
        a: 'No. BPC-157 is not approved for any medical use and the evidence base is preclinical. This page is a research and educational reference only.',
      },
      {
        q: 'What is the proposed mechanism?',
        a: 'Studies point to upregulation of the VEGFR2 receptor and modulation of nitric-oxide and growth-factor pathways, though the mechanism is not fully established.',
      },
    ],
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
    background: [
      'TB-500 is a synthetic peptide corresponding to the actin-binding region of thymosin β4, a naturally occurring protein involved in cell migration and tissue repair. By sequestering G-actin, thymosin β4 influences cytoskeletal dynamics, and TB-500 is studied as a fragment that reproduces part of this activity.',
      'As with BPC-157, the evidence for TB-500 is largely preclinical and it is not FDA-approved; it is also a prohibited substance in regulated sport. Research interest centers on endothelial cell migration, angiogenesis, and wound healing, with cardiac and dermal repair among the contexts studied.',
    ],
    keyResearch: [
      'Cell migration — derived from the actin-binding domain of thymosin β4, studied for endothelial and keratinocyte migration.',
      'Angiogenesis & wound healing — examined in dermal and vascular repair models.',
      'Cardiac repair — investigated in models of myocardial injury.',
      'Hair growth — explored for effects on the follicle in preclinical work.',
      'Preclinical / prohibited in sport — not FDA-approved; banned by WADA.',
    ],
    faqs: [
      {
        q: 'What is TB-500?',
        a: 'TB-500 is a synthetic peptide based on the actin-binding region of thymosin β4, studied in preclinical models for cell migration and tissue repair.',
      },
      {
        q: 'How is TB-500 related to thymosin β4?',
        a: 'TB-500 corresponds to the active actin-binding fragment of the larger thymosin β4 protein, reproducing part of its cytoskeletal activity.',
      },
      {
        q: 'Is TB-500 approved or allowed in sport?',
        a: 'No — it is not FDA-approved and is prohibited by the World Anti-Doping Agency. This page is a research and educational reference.',
      },
      {
        q: 'What is TB-500 studied for?',
        a: 'Research contexts include wound healing, angiogenesis, cardiac repair, and hair-follicle biology, primarily in animal and cell models.',
      },
    ],
    sequence: 'LKKTETQ',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    aliases: ['Copper Peptide', 'Tripeptide-1 Copper', 'Copper Tripeptide-1'],
    categories: ['cosmetic', 'healing-repair'],
    shortDescription: 'Endogenous copper-binding tripeptide widely studied in skin and hair biology.',
    description:
      'GHK-Cu is the copper complex of the tripeptide glycyl-L-histidyl-L-lysine, an endogenous fragment first isolated from human plasma. Reported to modulate ECM remodeling, fibroblast activity, and antioxidant defense.',
    mechanism: 'Copper delivery, ECM gene modulation, antioxidant pathway activation.',
    researchAreas: ['Skin aging', 'Hair follicle biology', 'Wound healing'],
    background: [
      'GHK-Cu is the copper(II) complex of glycyl-L-histidyl-L-lysine (GHK), a tripeptide first isolated from human plasma in 1973. The free GHK sequence binds copper with high affinity, and the resulting complex is generally regarded as the biologically active species. Plasma GHK is highest in early adulthood and declines with age, which has motivated long-standing interest in its role in tissue maintenance and repair.',
      'Because copper is a cofactor for enzymes involved in extracellular-matrix (ECM) remodeling and antioxidant defense, much of the research framing treats GHK-Cu as a signaling and copper-delivery molecule rather than a simple nutrient source. It is one of the most extensively studied "copper peptides" in the dermatologic and wound-healing literature and is widely used as a topical cosmetic ingredient under the INCI name Copper Tripeptide-1.',
    ],
    keyResearch: [
      'Extracellular-matrix remodeling — studied for effects on collagen, elastin, glycosaminoglycan, and decorin synthesis in dermal fibroblast models.',
      'Wound healing & angiogenesis — investigated for fibroblast activation and new-vessel formation in tissue-repair models.',
      'Antioxidant & anti-inflammatory signaling — reported to modulate oxidative-stress and inflammatory pathways.',
      'Hair-follicle biology — examined for effects on follicle size and the growth (anagen) phase.',
      'Gene expression — a widely cited transcriptomic analysis reported GHK can shift the expression of a large set of human genes, often framed as a move toward a more youthful profile.',
    ],
    faqs: [
      {
        q: 'What is GHK-Cu?',
        a: 'GHK-Cu is the copper complex of the naturally occurring tripeptide glycyl-L-histidyl-L-lysine (GHK), first isolated from human plasma. The copper-bound form is considered the active species in most research.',
      },
      {
        q: 'What is GHK-Cu studied for?',
        a: 'Research focuses on skin remodeling (collagen and elastin), wound healing and angiogenesis, antioxidant and anti-inflammatory signaling, and hair-follicle biology. It is a reference compound in the "copper peptide" literature.',
      },
      {
        q: 'Why does it contain copper?',
        a: 'The GHK tripeptide binds copper(II) with high affinity, and copper is a cofactor for matrix-remodeling and antioxidant enzymes — so the complex is studied as both a signaling molecule and a copper-delivery vehicle.',
      },
      {
        q: 'Is GHK-Cu the same as the copper peptides used in skincare?',
        a: 'Yes — cosmetic "copper peptide" ingredients are typically GHK-Cu (INCI name Copper Tripeptide-1), applied topically. This page is a research and educational reference, not a product or usage recommendation.',
      },
    ],
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
