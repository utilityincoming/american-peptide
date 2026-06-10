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
  /** Storage guidance — lyophilized + reconstituted stability, temperature. */
  storage?: string
  /** Handling notes — reconstitution, light/heat/moisture sensitivity. */
  handling?: string
  /** Synthesis context — sequence length, difficult couplings, why purity is hard for this peptide. */
  synthesisNotes?: string
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
    synthesisNotes:
      'Beyond its 31-residue chain, semaglutide carries a fatty-diacid side chain on a linker — extra synthetic steps that each add cost and another opportunity for impurities to form. Genuine material is purified to a defined spec and documented on a certificate of analysis, never judged by appearance.',
    storage:
      'Lyophilized: store frozen and protected from light; stable for extended periods. Reconstituted: refrigerate at 2–8 °C and use within weeks, not months.',
    handling:
      'Reconstitute gently — swirl rather than shake, since agitation can shear the peptide. Protect from heat and minimize freeze–thaw cycles.',
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
    synthesisNotes:
      'At 39 residues with a fatty-acid chain and a dual-receptor design, tirzepatide is a long, demanding synthesis — more coupling cycles mean more deletion and truncation impurities for purification to remove. Its length is exactly why a credible purity figure and an actual chromatogram matter here.',
    storage:
      'Lyophilized: keep frozen and shielded from light. Reconstituted: store at 2–8 °C and use within weeks.',
    handling:
      'Swirl to dissolve rather than shaking; keep away from heat and minimize repeated freeze–thaw.',
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
    background: [
      'Cagrilintide is a long-acting, acylated analog of amylin — the pancreatic hormone co-secreted with insulin that signals satiety and slows gastric emptying. It binds across the amylin and calcitonin receptor subtypes and carries a fatty-acid chain that supports once-weekly dosing.',
      'Developed by Novo Nordisk, it is investigational and studied both on its own and in a fixed combination with semaglutide known as CagriSema, where the amylin and GLP-1 pathways are paired for additive weight effect.',
    ],
    keyResearch: [
      'Satiety signaling — amylin-receptor agonism studied for appetite suppression and slowed gastric emptying.',
      'Combination therapy — investigated with semaglutide (CagriSema) for additive weight reduction.',
      'Obesity endpoints — Phase 2 trials reported meaningful mean weight loss alone and in combination.',
      'Half-life engineering — acylation supports a once-weekly profile.',
      'Investigational status — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is cagrilintide?',
        a: 'Cagrilintide is an investigational long-acting amylin analog studied for weight management, both alone and combined with semaglutide (CagriSema).',
      },
      {
        q: 'What is CagriSema?',
        a: 'CagriSema is the investigational fixed combination of cagrilintide (amylin) and semaglutide (GLP-1), pairing two appetite pathways for additive effect.',
      },
      {
        q: 'How does amylin differ from GLP-1?',
        a: 'Both promote satiety, but amylin acts through amylin and calcitonin receptors while GLP-1 acts through the GLP-1 receptor; combining them is studied for complementary effects.',
      },
      {
        q: 'Is cagrilintide approved?',
        a: 'No — it is investigational. This page is a research and educational reference.',
      },
    ],
    molecularWeight: 4409.2,
    molecularFormula: 'C194H312N54O59S2',
    cas: '1415456-99-3',
    pubchemCid: 171397054,
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
    synthesisNotes:
      'At 15 residues BPC-157 is a comparatively short synthesis, which makes it cheap to produce — and cheap to fake. The short, low-cost sequence is exactly why the market is flooded with under-characterized material; a batch-specific certificate of analysis is the only way to tell real from filler.',
    storage:
      'Lyophilized: store frozen and protected from light for long-term stability. Reconstituted: refrigerate at 2–8 °C and use within weeks.',
    handling:
      'Reconstitute gently and avoid shaking; protect from heat, light, and repeated freeze–thaw.',
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
    // GHK-Cu is the copper(II) complex C14H22CuN6O4 (~401.9 Da). The bare GHK
    // tripeptide is ~340.4 Da — do not use that here; this entry is the complex.
    molecularWeight: 401.9,
    molecularFormula: 'C14H22CuN6O4',
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
    background: [
      'CJC-1295 without DAC — also called Modified GRF(1-29) — is a 30-amino-acid analog of the first 29 residues of growth-hormone-releasing hormone (GHRH). Four amino-acid substitutions improve stability against the enzyme DPP-4 while preserving GHRH-receptor activity.',
      'Without the Drug Affinity Complex (DAC), its plasma half-life is short — on the order of 30 minutes — so it produces a brief GH pulse. It is commonly studied alongside a GHRP such as ipamorelin, where the two receptor classes act synergistically. It is not FDA-approved.',
    ],
    keyResearch: [
      'Pulsatile GH release — GHRH-receptor agonism studied for short, physiologic GH pulses.',
      'DPP-4 resistance — substitutions extend stability versus native GHRH(1-29).',
      'GHRP synergy — frequently paired with ghrelin-receptor agonists for amplified release.',
      'Body composition — examined in models for lean-mass and fat endpoints.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is CJC-1295 (no DAC)?',
        a: 'It is a stabilized GHRH(1-29) analog (Modified GRF 1-29) studied for short, pulsatile growth-hormone release.',
      },
      {
        q: 'What does "no DAC" mean?',
        a: 'DAC (Drug Affinity Complex) is an albumin-binding addition that greatly extends half-life. Without it, the peptide acts briefly, producing a short GH pulse.',
      },
      {
        q: 'Why is it studied with GHRPs?',
        a: 'GHRH analogs and ghrelin-receptor agonists (GHRPs) act on different receptors; combining them is studied for synergistic GH release.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound, not FDA-approved. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'CJC-1295 with DAC adds a Drug Affinity Complex — a maleimidopropionic acid group — to Modified GRF(1-29), allowing the peptide to bind covalently to serum albumin. This extends its half-life to roughly 6–8 days, replacing the brief pulse of the no-DAC form with prolonged elevation.',
      'The trade-off studied in the literature is physiologic: sustained GHRH-receptor exposure raises baseline GH and IGF-1 but blunts the natural pulsatility of the GH axis. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Sustained exposure — albumin binding extends half-life to about a week.',
      'IGF-1 elevation — prolonged GHRH signaling studied for raised baseline IGF-1.',
      'Pulsatility trade-off — continuous exposure differs from the body’s pulsatile GH pattern.',
      'Body composition — examined for lean-mass and fat endpoints in models.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is CJC-1295 with DAC?',
        a: 'A long-acting GHRH analog whose Drug Affinity Complex binds albumin, extending its half-life to roughly a week for sustained GH and IGF-1 elevation.',
      },
      {
        q: 'How does it differ from the no-DAC version?',
        a: 'The no-DAC form produces a brief GH pulse; the DAC form gives prolonged elevation by binding albumin, at the cost of natural pulsatility.',
      },
      {
        q: 'What is a Drug Affinity Complex?',
        a: 'A chemical group that lets the peptide covalently attach to serum albumin, dramatically slowing its clearance.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Ipamorelin is a pentapeptide growth-hormone-releasing peptide (GHRP) that selectively activates the ghrelin receptor (GHS-R1a) on pituitary somatotrophs. Its defining feature is selectivity: it releases GH with minimal effect on ACTH, cortisol, or prolactin compared with earlier GHRPs.',
      'Because of that clean profile, it is one of the most studied GHRPs in the research literature and is frequently paired with a GHRH analog such as CJC-1295. It is not FDA-approved.',
    ],
    keyResearch: [
      'Selective GH release — GHS-R1a agonism with minimal cortisol/prolactin impact.',
      'GHRH synergy — commonly studied alongside GHRH analogs for amplified pulses.',
      'Pituitary function — used in GH-secretion research.',
      'Tolerability profile — selectivity is a recurring theme versus earlier GHRPs.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is ipamorelin?',
        a: 'Ipamorelin is a selective ghrelin-receptor agonist (a GHRP) studied for growth-hormone release with minimal effect on cortisol or prolactin.',
      },
      {
        q: 'How is it different from other GHRPs?',
        a: 'Its selectivity — releasing GH without significantly raising ACTH, cortisol, or prolactin — distinguishes it from earlier, less selective GHRPs.',
      },
      {
        q: 'Why is it paired with CJC-1295?',
        a: 'GHRPs and GHRH analogs act on separate receptors; combining them is studied for synergistic GH release.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Tesamorelin is a stabilized 44-amino-acid analog of growth-hormone-releasing hormone (GHRH). By stimulating the pituitary to release endogenous GH, it preserves more of the body’s natural feedback than exogenous GH would.',
      'It is FDA-approved (Egrifta, 2010) specifically to reduce excess visceral abdominal fat in people with HIV-associated lipodystrophy. Beyond that indication it has been studied for visceral adiposity more broadly and, in research settings, for effects on cognition.',
    ],
    keyResearch: [
      'Visceral fat reduction — the approved use, lowering excess abdominal fat in HIV-associated lipodystrophy.',
      'GH axis — GHRH-receptor agonism raising endogenous GH and IGF-1.',
      'Cognition — examined in research for effects related to GH signaling.',
      'Hepatic fat — studied as a metabolic endpoint.',
      'FDA-approved (Egrifta) — for a specific HIV-related indication.',
    ],
    faqs: [
      {
        q: 'What is tesamorelin?',
        a: 'Tesamorelin is a GHRH analog FDA-approved (Egrifta) to reduce excess abdominal fat in people with HIV-associated lipodystrophy.',
      },
      {
        q: 'How does it work?',
        a: 'It stimulates the pituitary to release the body’s own growth hormone, rather than supplying GH directly.',
      },
      {
        q: 'What is it approved for?',
        a: 'Reduction of excess visceral abdominal fat in HIV-associated lipodystrophy. Other uses described here are research contexts, not approved indications.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this page is a research and educational reference, not medical advice or a dosing protocol.',
      },
    ],
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
    background: [
      'Sermorelin is the first 29 amino acids of endogenous GHRH — the shortest fragment that retains full GH-releasing activity. As a GHRH-receptor agonist it prompts the pituitary to release the body’s own growth hormone.',
      'It was FDA-approved in 1990 (Geref) for diagnostic evaluation of pituitary GH reserve and for pediatric GH deficiency, but was later discontinued commercially. It remains a widely referenced GHRH analog in research.',
    ],
    keyResearch: [
      'GH-axis evaluation — historically used to test pituitary GH reserve.',
      'Pediatric GH deficiency — a historical approved use, since discontinued.',
      'GHRH-receptor agonism — the minimal active GHRH fragment.',
      'Short half-life — brief, pulsatile GH release.',
      'Discontinued commercially — referenced as a research compound.',
    ],
    faqs: [
      {
        q: 'What is sermorelin?',
        a: 'Sermorelin is GHRH(1-29), the shortest active fragment of growth-hormone-releasing hormone, historically approved to assess and treat GH deficiency.',
      },
      {
        q: 'Is sermorelin still FDA-approved?',
        a: 'It was approved in 1990 (Geref) but later discontinued commercially. It is referenced today largely as a research compound.',
      },
      {
        q: 'How does it differ from CJC-1295?',
        a: 'CJC-1295 is a stabilized, longer-acting modification of the same GHRH(1-29) backbone; sermorelin is the unmodified fragment with a short half-life.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this page is a research and educational reference.',
      },
    ],
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
    background: [
      'Hexarelin is a synthetic hexapeptide in the GHRP family — a close analog of GHRP-6 — and one of the more potent growth-hormone secretagogues studied. It activates the ghrelin receptor (GHS-R1a) on pituitary somatotrophs.',
      'A distinctive research thread is its action at the CD36 receptor, through which preclinical studies report cardioprotective effects independent of GH release. It is not FDA-approved.',
    ],
    keyResearch: [
      'Potent GH release — GHS-R1a agonism among the stronger GHRP secretagogues.',
      'Cardioprotection — CD36-mediated effects studied in preclinical cardiac models.',
      'GHRH synergy — combinable with GHRH analogs.',
      'Receptor desensitization — sustained exposure studied for tolerance effects.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is hexarelin?',
        a: 'Hexarelin is a potent synthetic GHRP (a GHRP-6 analog) studied for growth-hormone release and, separately, cardioprotective effects.',
      },
      {
        q: 'What is the CD36 connection?',
        a: 'Beyond GH release, hexarelin binds the CD36 receptor, through which preclinical studies report cardioprotective activity.',
      },
      {
        q: 'How does it compare with ipamorelin?',
        a: 'Both are GHRPs, but hexarelin is more potent and less selective; ipamorelin is valued for releasing GH with minimal cortisol or prolactin effect.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'MOTS-c is a mitochondria-derived peptide: a 16-amino-acid sequence encoded within the mitochondrial 12S rRNA gene rather than the nuclear genome. It is one of a small family of peptides that the mitochondrion itself produces as signaling molecules.',
      'Preclinical research reports that MOTS-c activates the cellular energy sensor AMPK and influences the folate–methionine cycle, with downstream effects on insulin sensitivity and exercise capacity. Its expression declines with age, fueling interest in metabolic and aging research.',
    ],
    keyResearch: [
      'AMPK activation — studied as a regulator of cellular energy metabolism.',
      'Insulin sensitivity — reported improvements in metabolic models.',
      'Exercise physiology — examined for exercise capacity and metabolic flexibility.',
      'Aging biology — expression declines with age, a focus of longevity research.',
      'Preclinical — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is MOTS-c?',
        a: 'MOTS-c is a mitochondria-derived peptide encoded in mitochondrial DNA, studied for effects on energy metabolism, insulin sensitivity, and exercise capacity.',
      },
      {
        q: 'What does "mitochondria-derived" mean?',
        a: 'Unlike most peptides, which are encoded by the nuclear genome, MOTS-c is encoded within the mitochondrial genome and acts as a signaling molecule.',
      },
      {
        q: 'What is it studied for?',
        a: 'Research focuses on AMPK activation, insulin sensitivity, exercise physiology, and aging biology, largely in preclinical models.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'SS-31 (elamipretide, formerly Bendavia) is a synthetic tetrapeptide engineered to concentrate in the inner mitochondrial membrane, where it binds the phospholipid cardiolipin. Cardiolipin is essential to the organization of the electron-transport chain, and stabilizing it is the peptide’s proposed mechanism.',
      'Unlike many catalogued peptides, SS-31 has advanced into clinical trials — for primary mitochondrial myopathy, Barth syndrome, and heart failure — though it has not received FDA approval. It is among the most clinically studied mitochondria-targeted compounds.',
    ],
    keyResearch: [
      'Cardiolipin binding — concentrates in the inner mitochondrial membrane to stabilize cristae.',
      'ETC efficiency — studied for preserved electron-transport-chain function.',
      'Mitochondrial myopathy & Barth syndrome — clinical-trial contexts.',
      'Heart failure — examined for cardiac energetics.',
      'Investigational — in clinical trials, not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is SS-31?',
        a: 'SS-31 (elamipretide) is a mitochondria-targeted tetrapeptide that binds cardiolipin to stabilize the inner mitochondrial membrane, studied in mitochondrial disease and heart failure.',
      },
      {
        q: 'What is elamipretide?',
        a: 'Elamipretide is the development name for SS-31; both refer to the same cardiolipin-binding peptide.',
      },
      {
        q: 'What is it studied for?',
        a: 'Clinical research contexts include primary mitochondrial myopathy, Barth syndrome, and heart failure.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it remains investigational despite clinical trials. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Epitalon (epithalon) is a synthetic four-amino-acid peptide modeled on epithalamin, a peptide extract of the pineal gland. It emerged from Russian gerontology research, where the pineal axis is studied as a regulator of aging and circadian rhythm.',
      'Russian-led studies have reported effects on melatonin secretion, telomerase activity, and lifespan endpoints in animal models. The evidence base is concentrated in that research tradition, independent replication is limited, and Epitalon is not FDA-approved.',
    ],
    keyResearch: [
      'Telomerase activity — reported upregulation in cell and animal studies.',
      'Circadian / pineal function — examined for effects on melatonin secretion.',
      'Aging endpoints — lifespan effects reported in rodent models.',
      'Research concentration — evidence largely from a single research tradition.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is Epitalon?',
        a: 'Epitalon is a synthetic tetrapeptide derived from a pineal extract (epithalamin), studied in aging and circadian research, largely in animal models.',
      },
      {
        q: 'What is it studied for?',
        a: 'Reported effects include telomerase activity, melatonin regulation, and lifespan endpoints, primarily in Russian-led preclinical work.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a specific research tradition with limited independent replication, so findings should be treated as preliminary.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Semax is a synthetic heptapeptide based on a fragment of adrenocorticotropic hormone, ACTH(4-10), modified for stability. It was developed in Russia, where it is used clinically for stroke and cognitive disorders.',
      'Unlike full ACTH, Semax does not activate the stress (HPA) axis; instead, preclinical research focuses on its reported induction of neurotrophic factors such as BDNF and NGF. Outside Russia it is not FDA-approved and the controlled-trial base is limited.',
    ],
    keyResearch: [
      'Neurotrophic induction — reported BDNF and NGF upregulation in preclinical work.',
      'Ischemic stroke — used clinically in Russia for stroke recovery.',
      'Cognition — studied for attention and memory effects.',
      'No HPA activation — melanocortin signaling without raising cortisol.',
      'Not FDA-approved — research compound outside Russia.',
    ],
    faqs: [
      {
        q: 'What is Semax?',
        a: 'Semax is a synthetic ACTH(4-10) analog studied for nootropic and neuroprotective effects, used clinically in Russia for stroke and cognitive disorders.',
      },
      {
        q: 'How does it work?',
        a: 'Research points to induction of neurotrophic factors (BDNF, NGF) and melanocortin signaling, without activating the stress axis.',
      },
      {
        q: 'Is Semax FDA-approved?',
        a: 'No — it is approved and used in Russia but is a research compound elsewhere. This page is a research and educational reference.',
      },
      {
        q: 'What is it studied for?',
        a: 'Ischemic stroke recovery, cognition, and neuroprotection, with most controlled data from Russian clinical use.',
      },
    ],
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
    background: [
      'Selank is a synthetic heptapeptide based on tuftsin, an immunomodulatory peptide fragment. Like Semax, it was developed in Russia, where it is used clinically as an anxiolytic.',
      'Research interest centers on achieving anxiolytic and mild cognitive effects without the sedation, dependence, or withdrawal associated with benzodiazepines. Proposed mechanisms include modulation of GABAergic and serotonergic signaling and inhibition of enkephalin breakdown. It is not FDA-approved.',
    ],
    keyResearch: [
      'Anxiolytic activity — studied for calm without sedation or dependence.',
      'Neurotransmitter modulation — GABAergic and serotonergic effects investigated.',
      'Enkephalinase inhibition — proposed to extend endogenous enkephalin activity.',
      'Cognitive performance — examined alongside anxiolytic effects.',
      'Not FDA-approved — research compound outside Russia.',
    ],
    faqs: [
      {
        q: 'What is Selank?',
        a: 'Selank is a synthetic tuftsin analog studied as an anxiolytic, used clinically in Russia, with reported calming effects without sedation or dependence.',
      },
      {
        q: 'How does it differ from benzodiazepines?',
        a: 'Research interest is in anxiolytic effects without the sedation, tolerance, and withdrawal characteristic of benzodiazepines, via different proposed mechanisms.',
      },
      {
        q: 'Is Selank approved?',
        a: 'It is approved and used in Russia but is a research compound elsewhere; it is not FDA-approved. This page is a research and educational reference.',
      },
      {
        q: 'What is it studied for?',
        a: 'Generalized anxiety and cognitive performance.',
      },
    ],
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
    background: [
      'DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring nine-amino-acid neuropeptide, first isolated in the 1970s from the blood of rabbits during induced sleep. Its name reflects the early observation that it promoted slow-wave (delta) sleep.',
      'Decades of research have linked DSIP to sleep architecture, stress-response regulation, and circadian rhythm, but its precise mechanism and receptor remain incompletely characterized. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Sleep architecture — studied for effects on slow-wave (delta) sleep.',
      'Stress physiology — examined for interactions with the stress axis.',
      'Circadian rhythm — investigated as a modulator of biological timing.',
      'Uncharacterized mechanism — receptor and pathway not fully established.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is DSIP?',
        a: 'DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring neuropeptide first isolated for its sleep-promoting properties, studied in sleep and stress research.',
      },
      {
        q: 'How does DSIP work?',
        a: 'Its mechanism is not fully characterized; it is thought to act through multiple central nervous system pathways rather than a single identified receptor.',
      },
      {
        q: 'What is it studied for?',
        a: 'Sleep architecture, stress physiology, and circadian rhythm modulation.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Melanotan II is a synthetic cyclic analog of α-melanocyte-stimulating hormone (α-MSH), developed at the University of Arizona. It is a non-selective agonist across the melanocortin receptors MC1R through MC5R.',
      'Through MC1R it stimulates melanin production (pigmentation); through MC4R it influences central sexual-response pathways. Both effects are documented in research, but its non-selectivity also drives side effects, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Pigmentation — MC1R agonism studied for melanin production and tanning response.',
      'Sexual response — MC4R activity studied for effects on arousal.',
      'Photoprotection — examined in the context of UV response.',
      'Non-selectivity — broad MC1–5R activity underlies both effects and side effects.',
      'Not FDA-approved — research compound.',
    ],
    faqs: [
      {
        q: 'What is Melanotan II?',
        a: 'Melanotan II is a synthetic, non-selective melanocortin-receptor agonist (an α-MSH analog) studied for pigmentation and sexual-response effects.',
      },
      {
        q: 'How is it related to PT-141?',
        a: 'PT-141 (bremelanotide) is a melanocortin agonist with preferential MC4R activity studied for sexual function; Melanotan II is non-selective and also drives pigmentation.',
      },
      {
        q: 'Is it approved?',
        a: 'No — Melanotan II is not FDA-approved. This page is a research and educational reference, not a usage recommendation.',
      },
      {
        q: 'What receptors does it act on?',
        a: 'It activates melanocortin receptors MC1R through MC5R without selectivity.',
      },
    ],
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
    background: [
      'PT-141 (bremelanotide) is a cyclic heptapeptide melanocortin agonist with preferential activity at the MC4R receptor. It is a metabolite of Melanotan II, refined away from pigmentation toward central sexual-response pathways.',
      'Unlike vascular treatments for sexual dysfunction, PT-141 acts in the central nervous system on the circuits that govern desire and arousal. It is FDA-approved (Vyleesi, 2019) for hypoactive sexual desire disorder (HSDD) in premenopausal women.',
    ],
    keyResearch: [
      'HSDD — the approved indication, in premenopausal women.',
      'Central mechanism — MC4R-preferential action on CNS sexual-response circuits.',
      'Distinct from vascular agents — acts centrally rather than on blood flow.',
      'Ischemia models — examined in separate preclinical research.',
      'FDA-approved (Vyleesi) — for a specific indication.',
    ],
    faqs: [
      {
        q: 'What is PT-141?',
        a: 'PT-141 (bremelanotide) is a melanocortin MC4R agonist FDA-approved (Vyleesi) for hypoactive sexual desire disorder in premenopausal women.',
      },
      {
        q: 'How does it differ from erectile-dysfunction medications?',
        a: 'Those act on blood flow; PT-141 acts centrally, on the brain circuits that govern sexual desire and arousal.',
      },
      {
        q: 'How is it related to Melanotan II?',
        a: 'PT-141 is a metabolite of Melanotan II, refined toward MC4R and sexual-response activity and away from pigmentation.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this page is a research and educational reference, not medical advice.',
      },
    ],
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
    background: [
      'Kisspeptin-10 is the shortest fully active fragment of kisspeptin, the neuropeptide encoded by the KISS1 gene that sits at the top of the reproductive hormone cascade. It signals through the KISS1R (GPR54) receptor on hypothalamic GnRH neurons.',
      'By stimulating GnRH release, kisspeptin drives downstream secretion of LH and FSH — making it a research tool for probing and potentially restoring reproductive-axis function. It is investigational and not FDA-approved.',
    ],
    keyResearch: [
      'GnRH stimulation — KISS1R agonism triggers the reproductive hormone cascade.',
      'Hypothalamic amenorrhea — studied for restoring axis signaling.',
      'Puberty — kisspeptin is a key regulator of pubertal onset.',
      'Fertility research — examined as a physiologic trigger of LH and FSH.',
      'Investigational — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Kisspeptin-10?',
        a: 'Kisspeptin-10 is the active fragment of kisspeptin, a neuropeptide that triggers GnRH release at the top of the reproductive hormone axis.',
      },
      {
        q: 'What is the HPG-axis connection?',
        a: 'Kisspeptin is the upstream regulator of the hypothalamic-pituitary-gonadal axis, stimulating GnRH and downstream LH and FSH.',
      },
      {
        q: 'What is it studied for?',
        a: 'Reproductive endocrinology, hypothalamic amenorrhea, puberty, and fertility research.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is investigational. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'Thymosin alpha-1 (Tα1, thymalfasin) is a 28-amino-acid peptide originally isolated from the thymus, the organ where T cells mature. It acts as an immune modulator, helping to restore and direct T-cell responses.',
      'Unlike most catalogued peptides, Tα1 is approved in many countries (marketed as Zadaxin) as an adjunct in chronic hepatitis B and C and in other immune contexts, though it is not FDA-approved in the United States. It is among the most clinically studied immunomodulatory peptides.',
    ],
    keyResearch: [
      'T-cell modulation — TLR9-mediated dendritic-cell activation and Th1 polarization.',
      'Chronic viral hepatitis — adjunctive use studied and approved in many countries.',
      'Sepsis — examined as an immune-restoring adjunct.',
      'Oncology — studied as an adjunct to support immune response.',
      'Approved abroad — marketed as Zadaxin; not FDA-approved in the US.',
    ],
    faqs: [
      {
        q: 'What is Thymosin alpha-1?',
        a: 'Thymosin alpha-1 is a thymus-derived immunomodulatory peptide (Zadaxin) used in many countries as an adjunct in chronic hepatitis and other immune conditions.',
      },
      {
        q: 'How does it work?',
        a: 'It supports and directs T-cell responses, in part through TLR9-mediated dendritic-cell activation and a shift toward Th1 immunity.',
      },
      {
        q: 'Is it FDA-approved?',
        a: 'It is approved in numerous countries but not by the US FDA. This page is a research and educational reference.',
      },
      {
        q: 'What is it studied for?',
        a: 'Chronic viral hepatitis, and as an immune-supporting adjunct in sepsis and oncology research.',
      },
    ],
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
    background: [
      'LL-37 is the only cathelicidin antimicrobial peptide expressed in humans — a 37-residue fragment released from the precursor protein hCAP-18. It is a frontline component of innate immunity, found in neutrophils, epithelial cells, and skin.',
      'Beyond directly disrupting the membranes of bacteria, fungi, and some viruses, LL-37 also acts as a signaling molecule that recruits immune cells and supports wound healing. Interest has grown as antibiotic resistance renews attention on host-defense peptides. It is studied as a research compound.',
    ],
    keyResearch: [
      'Broad antimicrobial activity — membrane disruption across bacteria, fungi, and viruses.',
      'Antimicrobial resistance — host-defense peptides studied as an alternative strategy.',
      'Wound healing — chemotaxis and tissue-repair signaling.',
      'Immunomodulation — signaling via the FPRL1 receptor.',
      'Research compound — not an approved medicine.',
    ],
    faqs: [
      {
        q: 'What is LL-37?',
        a: 'LL-37 is the only human cathelicidin antimicrobial peptide, part of innate immunity, with direct antimicrobial and wound-healing roles.',
      },
      {
        q: 'Why is it of interest for antibiotic resistance?',
        a: 'As a host-defense peptide that disrupts microbial membranes, it represents a mechanism distinct from conventional antibiotics, of growing interest as resistance spreads.',
      },
      {
        q: 'What is it studied for?',
        a: 'Antimicrobial-resistance research, chronic wound healing, and innate immunity.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'KPV is the C-terminal tripeptide (lysine-proline-valine) of α-melanocyte-stimulating hormone (α-MSH). It retains much of the parent hormone’s anti-inflammatory activity while shedding its pigmentary effects, making it a focused research tool for inflammation.',
      'Preclinical studies report that KPV reduces pro-inflammatory signaling — in part by interfering with the NF-κB pathway — in models of colitis, skin inflammation, and oral inflammation. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Anti-inflammatory signaling — NF-κB pathway inhibition reducing cytokine output.',
      'Inflammatory bowel disease — studied in colitis models.',
      'Skin inflammation — examined in atopic-dermatitis models.',
      'No pigmentary effect — retains α-MSH anti-inflammation without tanning.',
      'Preclinical — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is KPV?',
        a: 'KPV is the anti-inflammatory C-terminal tripeptide of α-MSH, studied in preclinical models of colitis and skin inflammation.',
      },
      {
        q: 'How is it related to α-MSH?',
        a: 'KPV is the final three residues of α-MSH and keeps much of its anti-inflammatory activity without the pigmentation effect.',
      },
      {
        q: 'What is it studied for?',
        a: 'Inflammatory bowel disease, atopic dermatitis, and oral inflammation, primarily in preclinical models.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'AOD-9604 is a 16-amino-acid synthetic peptide corresponding to the lipolytic C-terminal region (residues 177–191) of human growth hormone. It was designed to reproduce GH’s fat-metabolizing effect without the growth-promoting or glucose effects of the full hormone.',
      'It advanced into Phase IIb obesity trials but did not meet its weight-loss endpoints, after which research interest shifted toward cartilage and joint applications. It is not FDA-approved as a therapeutic.',
    ],
    keyResearch: [
      'Lipolysis — the GH fragment studied for fat metabolism without GH-receptor binding.',
      'Obesity trials — reached Phase IIb but did not meet weight-loss endpoints.',
      'Cartilage repair — repositioned toward joint research.',
      'Mechanism — proposed β3-adrenergic-mediated lipolysis.',
      'Not FDA-approved — did not meet clinical endpoints for obesity.',
    ],
    faqs: [
      {
        q: 'What is AOD-9604?',
        a: 'AOD-9604 is a fragment of human growth hormone (residues 177–191) studied for fat metabolism (lipolysis) without GH’s other effects.',
      },
      {
        q: 'Did it work for weight loss?',
        a: 'It reached Phase IIb obesity trials but did not meet its weight-loss endpoints; research later shifted toward cartilage and joint applications.',
      },
      {
        q: 'How does it differ from full GH?',
        a: 'It is designed to reproduce GH’s lipolytic effect without binding the GH receptor or driving growth and glucose effects.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is not FDA-approved as a therapeutic. This page is a research and educational reference.',
      },
    ],
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
    background: [
      '5-Amino-1MQ is a small molecule — not a peptide — that is frequently catalogued alongside research peptides because of its metabolic focus. It selectively inhibits the enzyme nicotinamide N-methyltransferase (NNMT).',
      'NNMT consumes methyl groups and influences cellular NAD+ and SAM pools; inhibiting it is studied in preclinical work for improved adipose-tissue metabolism and muscle aging. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'NNMT inhibition — selectively blocks nicotinamide N-methyltransferase.',
      'Adipose metabolism — studied for effects on fat-tissue energy handling.',
      'Sarcopenia — examined for skeletal-muscle aging.',
      'NAD+ / SAM pools — NNMT inhibition linked to preserved methyl-donor and NAD+ metabolism.',
      'Small molecule — not a peptide; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is 5-Amino-1MQ?',
        a: '5-Amino-1MQ is a small-molecule inhibitor of the enzyme NNMT, studied in metabolic and aging research; it is catalogued here alongside peptides for its metabolic relevance.',
      },
      {
        q: 'Is it a peptide?',
        a: 'No — it is a small molecule, not a peptide, but it is grouped with metabolic research compounds.',
      },
      {
        q: 'What is it studied for?',
        a: 'Obesity, sarcopenia (muscle aging), and NAD+ biology, primarily in preclinical models.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
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
    background: [
      'NAD+ (nicotinamide adenine dinucleotide) is not a peptide but a universal coenzyme, included here for its central place in metabolic and longevity research. Every cell uses it to carry electrons through energy metabolism and to power signaling enzymes.',
      'Two enzyme families make NAD+ a focus of aging research: sirtuins, which depend on it to regulate gene expression and stress resistance, and PARPs, which use it for DNA repair. Cellular NAD+ declines with age, and restoring it — directly or via precursors — is widely studied.',
    ],
    keyResearch: [
      'Energy metabolism — essential electron carrier in the mitochondrial electron-transport chain.',
      'Sirtuin activity — required cofactor for sirtuin-mediated longevity signaling.',
      'DNA repair — consumed by PARP enzymes during repair.',
      'Age-related decline — NAD+ falls with age, a central theme in longevity research.',
      'Cofactor / reagent — supplied as a research reagent and investigational therapeutic.',
    ],
    faqs: [
      {
        q: 'What is NAD+?',
        a: 'NAD+ (nicotinamide adenine dinucleotide) is an essential coenzyme central to energy metabolism, sirtuin activity, and DNA repair — a major focus of aging research.',
      },
      {
        q: 'Is NAD+ a peptide?',
        a: 'No — it is a coenzyme (a dinucleotide), included in the catalog for its central role in mitochondrial and longevity research.',
      },
      {
        q: 'Why does NAD+ matter for aging?',
        a: 'Cellular NAD+ declines with age, and the sirtuin and PARP enzymes that depend on it govern stress resistance and DNA repair, so restoring NAD+ is widely studied.',
      },
      {
        q: 'Is it approved?',
        a: 'NAD+ is used as a research reagent and studied as an investigational therapeutic. This page is a research and educational reference.',
      },
    ],
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
