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
  | 'bioregulator'
  | 'peptide-hormone'

export interface CategoryMeta {
  id: PeptideCategory
  label: string
  blurb: string
}

/**
 * Controlled vocabulary of synthetic structural features — the things about a
 * sequence that actually shape how it is made and purified. Powers the catalog
 * "what makes it hard to make" facet and the detail-page chips.
 */
export type SyntheticFeature =
  | 'Disulfide bridge'
  | 'Multiple disulfides'
  | 'C-terminal amide'
  | 'N-terminal acetylation'
  | 'Fatty-acid acylation'
  | 'Albumin-binding linker'
  | 'Cyclic / lactam'
  | 'D-amino acid'
  | 'Unnatural residue'
  | 'Copper complex'
  | 'Glycosylated'
  | 'Recombinant protein'
  | 'Monoclonal antibody'
  | 'Tissue extract'
  | 'Small molecule'

/** Relative difficulty of synthesizing and purifying a peptide to a genuine spec. */
export type SynthesisDifficulty = 'standard' | 'moderate' | 'demanding'

export const SYNTHESIS_DIFFICULTY_LABEL: Record<SynthesisDifficulty, string> = {
  standard: 'Standard',
  moderate: 'Moderate',
  demanding: 'Demanding',
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
  { id: 'bioregulator',    label: 'Bioregulators',    blurb: 'Short peptide bioregulators (Khavinson peptides) — tissue-specific gene-regulatory peptides.' },
  { id: 'peptide-hormone', label: 'Peptide Hormones',  blurb: 'How hormone sequences become manufacturable synthetic drugs — analog engineering, disulfides, acylation, and why purity is hard.' },
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
  /**
   * Omit from forward-facing catalog browse (catalog grid, category pages,
   * compounds hub, homepage catalog counts). The entry stays fully present
   * everywhere else: its monograph page, the sitemap, catalog text search,
   * the command palette, the API, and llms.txt. Use for compounds that are
   * off-brand for the product catalog but worth keeping for reference/SEO.
   */
  unlisted?: boolean
  /** Controlled-vocabulary synthetic structural features — drive the catalog "made by" facet and detail-page chips. */
  syntheticFeatures?: SyntheticFeature[]
  /** Relative difficulty of synthesizing and purifying to a genuine spec. */
  synthesisDifficulty?: SynthesisDifficulty
}

import pubchemCache from './peptides.pubchem.json'
import { SYNTHESIS_PROFILES } from './synthesis-profiles'

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
  const profile = SYNTHESIS_PROFILES[seed.slug]
  return {
    ...seed,
    // Hand-edited seed values win over PubChem; only fill gaps.
    pubchemCid: seed.pubchemCid ?? hit?.cid,
    molecularWeight: seed.molecularWeight ?? hit?.molecularWeight ?? undefined,
    molecularFormula:
      seed.molecularFormula ?? hit?.molecularFormula ?? undefined,
    // Synthetic-feature dimension lives in synthesis-profiles.ts (one reviewable
    // table); inline seed values still win so per-entry overrides are possible.
    syntheticFeatures: seed.syntheticFeatures ?? profile?.features,
    synthesisDifficulty: seed.synthesisDifficulty ?? profile?.difficulty,
    synthesisNotes: seed.synthesisNotes ?? profile?.notes,
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
    slug: 'liraglutide',
    name: 'Liraglutide',
    aliases: ['Victoza', 'Saxenda', 'NN2211'],
    categories: ['metabolic'],
    shortDescription:
      'The once-daily GLP-1 agonist that preceded semaglutide — FDA-approved for diabetes (Victoza) and obesity (Saxenda).',
    description:
      'Liraglutide is a GLP-1 receptor agonist and the direct predecessor of semaglutide — the drug that proved the once-daily, acylated GLP-1 template before Novo Nordisk stretched it to once-weekly dosing. A fatty-acid chain on the GLP-1 backbone extends its half-life to about 13 hours, enough for daily injection. It was FDA-approved for type 2 diabetes (Victoza, 2010) and later, at higher dose, for chronic weight management (Saxenda, 2014).',
    mechanism:
      'GLP-1 receptor agonism → glucose-dependent insulin secretion, glucagon suppression, slowed gastric emptying, and central appetite reduction.',
    researchAreas: ['Type 2 diabetes', 'Obesity', 'Cardiovascular risk reduction'],
    background: [
      'Liraglutide is where the modern GLP-1 story really begins for daily therapy. It is a GLP-1(7-37) analog carrying a single amino-acid substitution and, crucially, a C16 palmitic-acid chain attached through a glutamate spacer to a lysine — an acylation that lets the peptide bind reversibly to albumin and resist rapid clearance. That change pushed GLP-1’s natural half-life of minutes out to roughly half a day, making once-daily injection practical.',
      'Novo Nordisk brought it to market for type 2 diabetes as Victoza (2010) and then, at a higher dose, for chronic weight management as Saxenda (2014), backed by a cardiovascular-outcomes trial (LEADER) showing benefit in high-risk patients. Semaglutide is its direct successor — the same acylation strategy taken further to reach once-weekly dosing and larger weight effects — which makes liraglutide both a still-used medicine and the historical bridge to the drugs that followed it.',
    ],
    keyResearch: [
      'Glycemic control — the original approved use (Victoza) for type 2 diabetes via GLP-1 receptor agonism.',
      'Weight management — approved at higher dose as Saxenda for chronic weight management.',
      'Cardiovascular outcomes — the LEADER trial reported reduced major adverse cardiovascular events in high-risk type 2 diabetes.',
      'Once-daily acylation — a C16 fatty-acid chain and albumin binding extend its half-life to ~13 hours, the template semaglutide later extended to weekly.',
      'FDA-approved — Victoza (2010) and Saxenda (2014).',
    ],
    faqs: [
      {
        q: 'What is liraglutide?',
        a: 'Liraglutide is a once-daily GLP-1 receptor agonist approved for type 2 diabetes (Victoza) and chronic weight management (Saxenda); it is the direct predecessor of semaglutide.',
      },
      {
        q: 'How is it different from semaglutide?',
        a: 'Both are acylated GLP-1 agonists, but liraglutide is dosed once daily (~13-hour half-life) while semaglutide was engineered for once-weekly dosing and larger average weight loss.',
      },
      {
        q: 'What is the difference between Victoza and Saxenda?',
        a: 'Both are liraglutide. Victoza is approved for type 2 diabetes; Saxenda is the higher-dose version approved for chronic weight management.',
      },
      {
        q: 'Is liraglutide FDA-approved?',
        a: 'Yes — for type 2 diabetes (Victoza) and chronic weight management (Saxenda). This page is a research and educational reference, not medical advice.',
      },
    ],
    molecularWeight: 3751.2,
    molecularFormula: 'C172H265N43O51',
    cas: '204656-20-2',
    pubchemCid: 16134956,
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
    slug: 'survodutide',
    name: 'Survodutide',
    aliases: ['BI 456906'],
    categories: ['metabolic'],
    shortDescription:
      'Investigational glucagon / GLP-1 dual agonist from Boehringer Ingelheim — Phase 3 for obesity and MASH.',
    description:
      'Survodutide (BI 456906) is an investigational once-weekly peptide that activates both the glucagon and GLP-1 receptors. Adding glucagon-receptor agonism to GLP-1 is studied as a way to raise energy expenditure and target liver fat on top of GLP-1’s appetite and glycemic effects. Developed by Boehringer Ingelheim with Zealand Pharma, it is in Phase 3 for obesity and holds FDA Breakthrough Therapy designation for metabolic dysfunction-associated steatohepatitis (MASH).',
    mechanism:
      'Dual agonism at the glucagon and GLP-1 receptors — GLP-1 for insulinotropic and satiety effects, glucagon for increased energy expenditure and hepatic-fat reduction.',
    researchAreas: ['Obesity', 'MASH', 'Type 2 diabetes'],
    background: [
      'Survodutide belongs to the glucagon/GLP-1 "dual agonist" branch of the incretin family — the two-receptor design that sits between single GLP-1 agonists like semaglutide and triple agonists like retatrutide. The glucagon arm is the point of interest: rather than only suppressing appetite and stimulating insulin, glucagon-receptor activation is studied for increasing energy expenditure and, notably, mobilizing fat from the liver.',
      'Developed by Boehringer Ingelheim together with Zealand Pharma, it is dosed once weekly and remains investigational. Its most distinctive program is in liver disease: it received FDA Breakthrough Therapy designation for MASH (metabolic dysfunction-associated steatohepatitis) and is in Phase 3 trials there, alongside Phase 3 obesity trials where it has reported double-digit mean weight reductions. It is not FDA-approved.',
    ],
    keyResearch: [
      'Glucagon / GLP-1 dual agonism — pairs GLP-1’s appetite and glycemic effects with glucagon-driven energy expenditure and hepatic-fat mobilization.',
      'MASH — holds FDA Breakthrough Therapy designation for metabolic dysfunction-associated steatohepatitis, its most distinctive Phase 3 program.',
      'Obesity — Phase 3 trials reported substantial double-digit mean weight reduction over ~76 weeks.',
      'Once-weekly — acylated for a long half-life, like the rest of the modern incretin class.',
      'Investigational — developed by Boehringer Ingelheim / Zealand Pharma; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is survodutide?',
        a: 'Survodutide (BI 456906) is an investigational once-weekly glucagon / GLP-1 dual receptor agonist from Boehringer Ingelheim, studied for obesity and MASH (fatty liver disease).',
      },
      {
        q: 'How does it differ from semaglutide or tirzepatide?',
        a: 'Semaglutide targets GLP-1 alone and tirzepatide targets GIP + GLP-1; survodutide instead pairs GLP-1 with glucagon-receptor activation, studied for extra energy expenditure and liver-fat reduction.',
      },
      {
        q: 'What is it studied for in the liver?',
        a: 'It has FDA Breakthrough Therapy designation for MASH (metabolic dysfunction-associated steatohepatitis) and is in Phase 3 trials for it — the glucagon arm is of particular interest for hepatic fat.',
      },
      {
        q: 'Is survodutide approved?',
        a: 'No — it is investigational and not FDA-approved. This page is a research and educational reference.',
      },
    ],
    molecularWeight: 4232,
    molecularFormula: 'C192H289N47O61',
    cas: '2805997-46-8',
    pubchemCid: 171378821,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'mazdutide',
    name: 'Mazdutide',
    aliases: ['IBI362', 'LY3305677'],
    categories: ['metabolic'],
    shortDescription:
      'A glucagon / GLP-1 dual agonist (oxyntomodulin-based) approved in China for weight management and diabetes — not yet FDA-approved.',
    description:
      'Mazdutide is a once-weekly glucagon / GLP-1 dual receptor agonist based on mammalian oxyntomodulin, the natural gut hormone that activates both receptors. Licensed by Innovent Biologics from Eli Lilly for China, it became the first GCG/GLP-1 dual agonist to reach the market when China’s NMPA approved it in 2025 — first for chronic weight management, then for type 2 diabetes. It is not FDA-approved; Eli Lilly retains rights outside China, where it remains investigational.',
    mechanism:
      'Dual agonism at the glucagon and GLP-1 receptors, modeled on oxyntomodulin — combining GLP-1 satiety and insulin effects with glucagon-driven energy expenditure.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'MASH'],
    background: [
      'Mazdutide is built on oxyntomodulin, a naturally occurring gut hormone that — unusually — activates both the GLP-1 and glucagon receptors on its own. Engineering that dual activity into a stabilized, acylated, once-weekly peptide gives mazdutide the same glucagon/GLP-1 profile as survodutide, reached from a different molecular starting point.',
      'Its development is notable for geography. Eli Lilly created the molecule (LY3305677) and licensed Chinese rights to Innovent Biologics (as IBI362) in 2019. In 2025 China’s NMPA approved it — first for long-term weight management, then for glycemic control in type 2 diabetes — making it the first glucagon/GLP-1 dual agonist approved anywhere. Late-stage Chinese trials (the GLORY program) reported weight reductions around 20% at higher doses. It is not FDA-approved, and outside China it remains investigational.',
    ],
    keyResearch: [
      'Oxyntomodulin-based dual agonism — activates both glucagon and GLP-1 receptors, modeled on the natural dual-acting gut hormone.',
      'First-in-class approval (China) — China’s NMPA approved it in 2025 for weight management and then type 2 diabetes; the first GCG/GLP-1 dual agonist to market.',
      'Weight reduction — late-stage Chinese trials (GLORY) reported ~20% mean weight loss at higher doses.',
      'Developed by Lilly / Innovent — Innovent holds Chinese rights; Lilly retains rights elsewhere.',
      'Not FDA-approved — approved in China only; investigational elsewhere.',
    ],
    faqs: [
      {
        q: 'What is mazdutide?',
        a: 'Mazdutide is a once-weekly glucagon / GLP-1 dual receptor agonist based on oxyntomodulin, approved in China for weight management and type 2 diabetes and developed by Eli Lilly and Innovent.',
      },
      {
        q: 'Is mazdutide FDA-approved?',
        a: 'No. It was approved in China (2025) for weight management and diabetes, but it is not FDA-approved; outside China it remains investigational. This page is a research and educational reference.',
      },
      {
        q: 'How is it different from survodutide?',
        a: 'Both are glucagon / GLP-1 dual agonists, but mazdutide is based on the natural dual-acting hormone oxyntomodulin, while survodutide is a separate engineered peptide; they come from different developers.',
      },
      {
        q: 'What does the glucagon component add?',
        a: 'Glucagon-receptor activation is studied for increasing energy expenditure and reducing liver fat, complementing GLP-1’s appetite and glucose effects.',
      },
    ],
    molecularWeight: 4476,
    molecularFormula: 'C207H317N45O65',
    cas: '2259884-03-0',
    pubchemCid: 167312357,
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
    slug: 'cagrisema',
    name: 'CagriSema',
    aliases: ['Cagrilintide/semaglutide', 'cagrilintide + semaglutide'],
    categories: ['metabolic'],
    shortDescription:
      'Novo Nordisk’s investigational fixed combination of cagrilintide (amylin) and semaglutide (GLP-1) — two appetite pathways in one weekly injection.',
    description:
      'CagriSema is not a single molecule but a fixed-dose combination of two peptides already in this catalog: cagrilintide, a long-acting amylin analog, and semaglutide, the GLP-1 agonist. Novo Nordisk pairs the amylin and GLP-1 satiety pathways in one once-weekly injection, betting that two complementary appetite mechanisms together drive more weight loss than either alone. It is investigational and in Phase 3.',
    mechanism:
      'Co-agonism across two pathways: semaglutide activates the GLP-1 receptor while cagrilintide activates amylin and calcitonin receptors — complementary routes to satiety and slowed gastric emptying.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Combination metabolic therapy'],
    background: [
      'CagriSema is a combination product, and that is the whole point of it. Rather than engineer a single peptide that hits several receptors — the multi-agonist route taken by tirzepatide and retatrutide — Novo Nordisk co-formulates two of its existing peptides: the amylin analog cagrilintide and the GLP-1 agonist semaglutide. Both suppress appetite, but through different receptor systems, so combining them is studied for additive weight effect from a single weekly injection.',
      'Because it is a co-formulation, CagriSema has no molecular formula or sequence of its own — its properties are those of its two components, each documented on its own monograph here. It is investigational, studied in the Phase 3 REDEFINE program, where it produced large mean weight reductions in the low-to-mid twenties percent; the results were strong in absolute terms even as they were scrutinized against very high market expectations. It is not FDA-approved.',
    ],
    keyResearch: [
      'Two-pathway combination — pairs semaglutide (GLP-1) with cagrilintide (amylin) to engage two distinct satiety systems in one weekly injection.',
      'Not a single molecule — a fixed-dose co-formulation; its chemistry is that of its two component peptides, each catalogued separately here.',
      'Weight reduction — the Phase 3 REDEFINE program reported large mean reductions in the low-to-mid twenties percent.',
      'Combination rationale — an alternative to single multi-agonist peptides, reached by combining two proven components.',
      'Investigational — a Novo Nordisk candidate; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is CagriSema?',
        a: 'CagriSema is Novo Nordisk’s investigational fixed combination of two peptides — cagrilintide (an amylin analog) and semaglutide (a GLP-1 agonist) — given as one once-weekly injection for weight management.',
      },
      {
        q: 'Is CagriSema a single peptide?',
        a: 'No — it is a co-formulation of two separate peptides (cagrilintide and semaglutide), each with its own monograph here, so it has no single molecular formula.',
      },
      {
        q: 'How does it compare with tirzepatide?',
        a: 'Tirzepatide is one molecule hitting two receptors (GIP + GLP-1); CagriSema instead combines two molecules (amylin + GLP-1). Both aim for additive metabolic effect by different means.',
      },
      {
        q: 'Is CagriSema approved?',
        a: 'No — it is investigational and in Phase 3. This page is a research and educational reference, not medical advice.',
      },
    ],
    synthesisNotes:
      'CagriSema is a co-formulation, not a synthesized molecule: it is manufactured by making its two component peptides — cagrilintide and semaglutide — separately, each to its own spec and certificate of analysis, and combining them at fixed doses. Its quality therefore rests on the identity and purity of two peptides at once, described on their individual monographs.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'insulin',
    unlisted: true, // hidden from catalog browse (too pharmacy); kept in data/sitemap/search
    name: 'Insulin (human)',
    aliases: [
      'Recombinant human insulin',
      'rhInsulin',
      'regular insulin',
      'Humulin',
      'Novolin',
    ],
    categories: ['metabolic', 'peptide-hormone'],
    shortDescription:
      'The archetypal protein biologic — a 51-amino-acid two-chain hormone, disulfide-linked, and the first recombinant DNA drug ever marketed.',
    description:
      'Insulin is the hormone that defined the biologic era. It is a small but genuinely complex protein: two peptide chains — an A chain of 21 residues and a B chain of 30 — held together by two interchain disulfide bonds, with a third disulfide looping within the A chain. At ~5.8 kDa it is the smallest hormone in this catalog’s biologic tier, yet it is assembled, folded, and processed exactly like the larger proteins, and it was the molecule that proved recombinant human therapeutics were possible.',
    mechanism:
      'Binds the insulin receptor, a tyrosine kinase, triggering autophosphorylation and the PI3K/AKT cascade that drives GLUT4 translocation and glucose uptake into muscle and fat, suppresses hepatic glucose output, and promotes glycogen, lipid, and protein synthesis.',
    researchAreas: ['Type 1 diabetes', 'Type 2 diabetes', 'Glucose metabolism', 'Anabolic signaling', 'Peptide hormones'],
    background: [
      'Insulin is synthesized in the body as a single chain — preproinsulin → proinsulin — that folds and forms its disulfide bonds before a connecting C-peptide is excised, leaving the mature two-chain hormone. That biosynthetic detail is why early recombinant manufacturing expressed the A and B chains (or proinsulin) in bacteria and then handled folding and disulfide pairing as a controlled step: the chemistry that the body does enzymatically has to be reproduced and verified in a reactor. Get the disulfides wrong and you get a misfolded, inactive — or immunogenic — product.',
      'Its history is foundational twice over. Insulin was discovered in 1921 in Toronto by Banting, Best, Macleod, and Collip, and the patent was famously sold to the university for one dollar on the principle that "insulin belongs to the world." Six decades later, in 1982, recombinant human insulin (Humulin) became the first recombinant-DNA drug ever approved — the proof of concept for the entire modern biologic industry, including most of the engineered peptides elsewhere in this catalog.',
      'And then the American drama. Despite the dollar patent and a century of manufacturing experience, US insulin list prices roughly tripled between 2002 and 2013, pushing some patients to ration a drug they cannot live without — a recurring, deadly access failure that sits uncomfortably against the molecule’s origin story. For a reference that takes provenance and honest pricing seriously, insulin is the clearest case study in the gap between what a medicine costs to make and what it is sold for.',
      'Insulin is also widely misunderstood at the edges: it is occasionally misused in bodybuilding for its anabolic effects, where dosing errors cause life-threatening hypoglycemia, and the modern GLP-1 era has shifted public perception of what "diabetes medicine" even means. It remains, first and foremost, essential replacement therapy for type 1 diabetes and an important tool in advanced type 2.',
    ],
    keyResearch: [
      'Type 1 diabetes — life-sustaining replacement therapy; the body produces no insulin without it.',
      'Type 2 diabetes — used when oral agents and incretins no longer maintain glycemic control.',
      'Insulin-receptor signaling — the PI3K/AKT and MAPK pathways that make it a central anabolic and metabolic hormone.',
      'Analog engineering — rapid-acting (lispro, aspart) and long-acting (glargine, detemir) analogs re-engineer the sequence/formulation to reshape the absorption curve.',
      'First recombinant drug — Humulin (1982) established recombinant human protein manufacturing.',
      'Hypoglycemia risk — narrow therapeutic margin; misuse outside medical supervision is dangerous.',
    ],
    faqs: [
      {
        q: 'What is human insulin?',
        a: 'A 51-amino-acid protein hormone made of two disulfide-linked chains that lowers blood glucose by driving its uptake into cells. Recombinant human insulin is produced in engineered bacteria or yeast and was the first recombinant-DNA drug approved (1982).',
      },
      {
        q: 'Why is insulin considered a biologic and not just a peptide?',
        a: 'It is a folded, multi-chain protein whose activity depends on correct disulfide pairing, and it is produced in living cells. Its manufacturing and quality control are protein-grade, not the solid-phase synthesis used for short research peptides.',
      },
      {
        q: 'Why is insulin so expensive in the US if the patent was sold for a dollar?',
        a: 'The original patent was sold for $1, but modern insulin products, manufacturing, and the US pricing system are separate from that history. List prices rose sharply in the 2000s–2010s, a widely documented access problem.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No. This is a research and educational reference. Insulin has a narrow safety margin and is a prescription medicine; nothing here is dosing guidance.',
      },
    ],
    sequence:
      'A chain: GIVEQCCTSICSLYQLENYCN | B chain: FVNQHLCGSHLVEALYLVCGERGFFYTPKT',
    molecularWeight: 5808,
    molecularFormula: 'C257H383N65O77S6',
    cas: '11061-68-0',
    fdaApproved: true,
    storage:
      'Unopened insulin is refrigerated (2–8 °C); in-use vials/pens are typically kept at room temperature for a limited number of days per the product label. It must not be frozen — freezing denatures the protein and destroys activity — and should be protected from heat and direct light.',
    handling:
      'As a folded protein it is sensitive to heat, freezing, and agitation, which can cause aggregation (visible as clumping or frosting) and loss of potency. Aggregated insulin should never be used.',
    synthesisNotes:
      'Recombinant human insulin is expressed in E. coli or yeast — historically as separate A and B chains or as proinsulin — then folded, disulfide-paired, and (for the proinsulin route) enzymatically processed to remove C-peptide. Release testing is protein-specific: identity by peptide mapping and mass spectrometry, correct disulfide connectivity, potency by bioassay, plus host-cell-protein and endotoxin limits. This is biologic manufacturing, not peptide synthesis.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'glucagon',
    unlisted: true, // hidden from catalog browse (too big-brain); kept in data/sitemap/search
    name: 'Glucagon',
    aliases: ['GlucaGen', 'Baqsimi', 'Gvoke'],
    categories: ['metabolic', 'peptide-hormone'],
    shortDescription:
      'Insulin’s counter-hormone — a 29-amino-acid peptide that raises blood glucose, the emergency rescue for severe lows, and the "G" in the new triple agonists.',
    description:
      'Glucagon is the metabolic mirror image of insulin. Released by the pancreatic alpha cells when blood sugar falls, this 29-amino-acid peptide tells the liver to break down glycogen and make new glucose, pushing blood sugar back up. It is the body’s primary defense against hypoglycemia, the basis of emergency rescue products, and — in a development that has put it back at the center of metabolic drug design — one of the three receptors the newest weight-loss agonists deliberately engage.',
    mechanism:
      'Binds the glucagon receptor on hepatocytes, raising cAMP and driving glycogenolysis and gluconeogenesis to increase blood glucose. It opposes insulin in the moment-to-moment regulation of blood sugar.',
    researchAreas: ['Severe hypoglycemia', 'Glucose counter-regulation', 'Triple-agonist metabolic drugs', 'Peptide hormones'],
    background: [
      'Glucagon and insulin are a push-pull pair: insulin lowers blood glucose, glucagon raises it, and health depends on their balance. When blood sugar drops dangerously — most often in insulin-treated diabetes — glucagon is the rescue, which is why it is sold as emergency kits: the classic reconstituted injection (GlucaGen), a nasal powder (Baqsimi, 2019), and a ready-to-use autoinjector (Gvoke). It is also used in radiology and endoscopy to relax smooth muscle.',
      'As a molecule it is a 29-residue peptide derived from the same precursor (preproglucagon) that gives rise to GLP-1 and GLP-2 — a family relationship that matters more than it first appears. For decades glucagon was framed only as the hormone you suppress in diabetes. The reframing came from drug design: adding glucagon-receptor agonism to incretin drugs increases energy expenditure and fat mobilization, and the glucagon receptor is the "G" in the GIP/GLP-1/glucagon triple agonists (such as retatrutide) now posting the largest weight-loss numbers in trials.',
      'That is the forward-looking turn — the same hormone that, unopposed, worsens diabetic hyperglycemia becomes, when balanced against incretin signaling, a lever for greater fat loss and metabolic rate. It is a clean example of how a "bad" hormone in one context is a deliberate design ingredient in another.',
    ],
    keyResearch: [
      'Severe hypoglycemia rescue — the approved use; raises blood glucose fast via hepatic glycogenolysis.',
      'Insulin counter-regulation — the opposing arm of moment-to-moment glucose control.',
      'Triple-agonist drugs — glucagon-receptor agonism is the "G" in GIP/GLP-1/glucagon agonists studied for large weight loss.',
      'Procedural use — relaxes GI smooth muscle for imaging and endoscopy.',
      'Preproglucagon family — shares a precursor with GLP-1 and GLP-2.',
    ],
    faqs: [
      {
        q: 'What does glucagon do?',
        a: 'Glucagon raises blood sugar — it is the counter-hormone to insulin. The pancreas releases it when glucose falls, signaling the liver to release stored glucose. As a drug it is the emergency rescue for severe hypoglycemia.',
      },
      {
        q: 'Why is glucagon in weight-loss drugs?',
        a: 'Glucagon-receptor agonism increases energy expenditure and fat mobilization. It is the "G" in the GIP/GLP-1/glucagon triple agonists (like retatrutide) that show the largest weight-loss effects in trials.',
      },
      {
        q: 'How is it related to GLP-1?',
        a: 'Both come from the same precursor protein, preproglucagon. Glucagon raises blood sugar; GLP-1 lowers it and curbs appetite — different products of one parent molecule.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'HSQGTFTSDYSKYLDSRRAQDFVQWLMNT',
    molecularWeight: 3485,
    molecularFormula: 'C153H225N43O49S',
    cas: '16941-32-5',
    fdaApproved: true,
    storage:
      'Older glucagon kits are stored as lyophilized powder + diluent and reconstituted immediately before use; ready-to-use and nasal products follow their own label storage. The peptide is unstable in solution and is not kept reconstituted.',
    handling:
      'Reconstituted glucagon should be used promptly — it can aggregate/fibrillate in solution. Emergency products are designed for immediate single use.',
    synthesisNotes:
      'Glucagon is a 29-residue peptide produced by chemical synthesis or recombinant expression. It is prone to aggregation and fibrillation in aqueous solution, which is why traditional products are lyophilized and reconstituted at the point of use, and why newer formulations engineered for ready-to-use stability were a meaningful advance.',
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
    mechanism: 'Activates the VEGFR2–Akt–eNOS pathway (with upstream Src / Caveolin-1 signaling), driving nitric-oxide–dependent angiogenesis; also modulates growth-factor signaling and the gut–brain axis.',
    researchAreas: ['Tendinopathy', 'Wound healing', 'IBD models'],
    background: [
      'BPC-157 (Body Protective Compound-157) is a synthetic 15-amino-acid sequence derived from a protective protein identified in human gastric juice. It is studied as a cytoprotective and pro-angiogenic agent, with most of the interest centered on connective-tissue and gastrointestinal repair.',
      'Essentially all of the evidence is preclinical — cell cultures and rodent models — and BPC-157 is not approved by the FDA for any use. It is widely discussed in the tissue-repair literature but lacks the controlled human trials that characterize approved peptides, so model choice and endpoint definition are central caveats.',
    ],
    keyResearch: [
      'Angiogenesis mechanism — repair effects are attributed largely to activation of the VEGFR2–Akt–eNOS pathway (with upstream Src / Caveolin-1 signaling), increasing nitric-oxide–dependent new-vessel formation in hypovascular tissue such as tendon.',
      'Nitric-oxide modulation — the Sikiric research group first linked the gastric-protective effect to NO generation; subsequent L-NAME / L-arginine co-treatment studies support NO involvement across multiple tissue-injury models.',
      'Tendon, ligament & GI repair — the most-replicated preclinical domains, spanning musculoskeletal injury and ulcer / inflammatory-bowel models.',
      'Compared to TB-500 — both are studied as healing peptides but differ mechanistically: BPC-157 is perfusion-led (angiogenesis / NO) while TB-500 is migration-led (actin regulation), which is why the two are often examined together.',
      'Evidence quality — extensive rodent data (much of it from a single research group) but no controlled human trials; not FDA-approved.',
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
      'Actin regulation — corresponds to the actin-binding motif of thymosin β4; promotes G-actin sequestration and the polymerization / depolymerization cycle that mobilizes cells to injury sites.',
      'Angiogenesis & re-epithelialization — thymosin β4 research reports accelerated wound closure in rodent full-thickness models, with increased collagen deposition and new-vessel growth.',
      'Cardiac & dermal repair — investigated in myocardial-injury and dermal wound models, and explored in hair-follicle biology.',
      'Compared to BPC-157 — complementary mechanism: TB-500 is migration-led (actin / cell mobilization) while BPC-157 is perfusion-led (angiogenesis / NO).',
      'Evidence quality — much of the data derives from thymosin β4 rather than the TB-500 fragment specifically; preclinical, not FDA-approved, and prohibited by WADA.',
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
    storage:
      'Lyophilized: store frozen and protected from light for long-term stability. Reconstituted: refrigerate at 2–8 °C and use within weeks.',
    handling:
      'Reconstitute gently and avoid shaking; protect from heat, light, and repeated freeze–thaw.',
  },
  {
    slug: 'b7-33',
    name: 'B7-33',
    aliases: ['Single-chain relaxin', 'relaxin B7-33'],
    categories: ['healing-repair'],
    shortDescription:
      'A 27-residue single-chain relaxin-2 analog and selective RXFP1 agonist — a simplified relaxin mimetic studied for anti-fibrotic effects.',
    description:
      'B7-33 is a single-chain peptide derived from the B-chain of human relaxin-2, the hormone best known for remodeling connective tissue in pregnancy. Native relaxin is a complex two-chain, disulfide-linked hormone that is hard to make; B7-33 strips it down to a single 27-residue chain that still activates relaxin’s main receptor, RXFP1. Its research interest is anti-fibrotic: like relaxin, it has reduced or reversed scarring (fibrosis) in preclinical heart and lung models, but as a far simpler, more manufacturable molecule.',
    mechanism:
      'Functionally selective agonist of the relaxin receptor RXFP1 — signaling (in part via RXFP1–angiotensin II type-2 receptor heterodimers) toward pERK1/2 and the collagen-degrading enzyme MMP-2, driving anti-fibrotic remodeling.',
    researchAreas: ['Fibrosis', 'Cardiac repair', 'Pulmonary fibrosis', 'Tissue remodeling'],
    background: [
      'B7-33 is an exercise in simplification. Human relaxin-2 is a powerful anti-fibrotic hormone, but it is a two-chain, disulfide-linked protein — expensive and difficult to produce, which has long limited its therapeutic use. Researchers at the Florey Institute engineered B7-33 as a minimal single-chain version: a 27-residue peptide based on relaxin’s B-chain that dispenses with the second chain while still switching on the relaxin receptor RXFP1.',
      'What makes it notable is that the simplification did not cost the biology. In preclinical rodent models of heart and lung disease, B7-33 prevented or reversed fibrosis with potency similar to native relaxin, apparently through a functionally selective signal (via RXFP1–AT2 receptor complexes) that favors the collagen-degrading enzyme MMP-2. That combination — relaxin-like anti-fibrotic activity in a small, synthesizable peptide — is why it draws interest as a research compound. It is not FDA-approved.',
    ],
    keyResearch: [
      'Single-chain relaxin mimetic — a 27-residue analog of the relaxin-2 B-chain that activates RXFP1 without relaxin’s two-chain, disulfide-linked architecture.',
      'Anti-fibrotic — prevented or reversed fibrosis in preclinical heart and lung models with potency similar to native relaxin.',
      'Functionally selective signaling — proposed to act via RXFP1–angiotensin II type-2 receptor heterodimers toward pERK1/2 and MMP-2 (collagen degradation).',
      'Manufacturability — a small synthetic peptide, far simpler to make than the native two-chain hormone.',
      'Investigational — a research compound; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is B7-33?',
        a: 'B7-33 is a 27-residue single-chain analog of the relaxin-2 B-chain that activates the relaxin receptor RXFP1, studied as a simplified, anti-fibrotic relaxin mimetic.',
      },
      {
        q: 'How is it different from natural relaxin?',
        a: 'Native relaxin-2 is a two-chain, disulfide-linked protein that is hard to make; B7-33 is a single 27-residue chain that still activates RXFP1, so it is far simpler to synthesize.',
      },
      {
        q: 'What is it studied for?',
        a: 'Chiefly fibrosis — it reduced or reversed scarring in preclinical heart and lung models — along with broader tissue-remodeling research.',
      },
      {
        q: 'Is B7-33 approved?',
        a: 'No — it is an investigational research compound, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    cas: '1818415-56-3',
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
      'Gene expression — a widely cited transcriptomic analysis (originating from Loren Pickart\'s work) reported GHK can shift the expression of a large set of human genes, often framed as a move toward a more youthful profile.',
      'Compared to other copper / collagen peptides — GHK-Cu is the most-studied for skin remodeling; AHK-Cu is oriented toward the hair follicle, while Matrixyl (palmitoyl pentapeptide-4) stimulates collagen via matrikine signaling and contains no copper.',
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
    storage:
      'Lyophilized: store frozen and protected from light. Reconstituted: refrigerate at 2–8 °C and use within weeks; copper complexes are light- and oxidation-sensitive.',
    handling:
      'Reconstitute gently; protect from light and air, since the copper(II) complex is prone to oxidation. The characteristic blue color indicates copper binding but is not a substitute for assay.',
  },
  {
    slug: 'ahk-cu',
    name: 'AHK-Cu',
    aliases: ['Copper Tripeptide AHK', 'Ala-His-Lys Copper'],
    categories: ['cosmetic'],
    shortDescription: 'Copper-binding tripeptide (Ala-His-Lys) studied for hair-follicle stimulation and dermal repair.',
    description:
      'AHK-Cu is the copper complex of the tripeptide alanyl-L-histidyl-L-lysine, structurally related to GHK-Cu but studied primarily in hair-follicle biology rather than facial-skin remodeling.',
    mechanism: 'Copper delivery with VEGF upregulation and anti-apoptotic signaling in dermal papilla cells.',
    researchAreas: ['Hair growth', 'Dermal repair'],
    background: [
      'AHK-Cu is the copper(II) complex of the tripeptide alanyl-L-histidyl-L-lysine (AHK). It shares the histidine–lysine copper-binding motif of the better-known GHK-Cu but differs at the first residue (alanine in place of glycine), and the research interest is oriented toward the hair follicle rather than facial skin.',
      'Like other copper peptides it is studied as both a copper-delivery vehicle and a signaling molecule. The evidence base is preclinical — cell and ex-vivo follicle models — and it is used as a cosmetic ingredient rather than an approved drug.',
    ],
    keyResearch: [
      'Dermal papilla cells — studied for stimulating proliferation and reducing apoptosis (raised Bcl-2/Bax ratio, lower cleaved caspase-3 / PARP) in DPCs (Pyo & Yoo et al., 2007).',
      'Hair-follicle elongation — promotes elongation of human hair follicles ex vivo in preclinical work.',
      'Angiogenesis — upregulates VEGF and stimulates dermal fibroblast proliferation while reducing TGF-β1 secretion.',
      'Compared to GHK-Cu — the same copper-binding chemistry but oriented toward the follicle, where GHK-Cu is the reference compound for facial-skin remodeling.',
      'Preclinical / cosmetic — not FDA-approved as a drug.',
    ],
    faqs: [
      {
        q: 'What is AHK-Cu?',
        a: 'AHK-Cu is the copper complex of the tripeptide alanyl-histidyl-lysine, a copper peptide studied primarily for hair-follicle stimulation and dermal repair.',
      },
      {
        q: 'How does AHK-Cu differ from GHK-Cu?',
        a: 'They share the same histidine–lysine copper-binding motif but differ at the first residue. GHK-Cu is the reference compound for facial-skin remodeling; AHK-Cu research is oriented toward the hair follicle.',
      },
      {
        q: 'What is it studied for?',
        a: 'Dermal-papilla-cell proliferation, hair-follicle elongation, and angiogenesis (VEGF) — mostly in cell and ex-vivo models. It is used as a cosmetic ingredient, not an approved drug.',
      },
      {
        q: 'Is AHK-Cu FDA-approved?',
        a: 'No. It is a research and cosmetic compound, not an approved drug. This page is a research and educational reference.',
      },
    ],
    sequence: 'AHK',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
    storage:
      'Lyophilized: store frozen and protected from light. Reconstituted: refrigerate at 2–8 °C and use within weeks; copper complexes are light- and oxidation-sensitive.',
    handling:
      'Reconstitute gently; protect from light and air, since the copper(II) complex is prone to oxidation.',
  },
  {
    slug: 'matrixyl',
    unlisted: true, // hidden from catalog browse (too niche cosmetic); kept in data/sitemap/search
    name: 'Matrixyl (Palmitoyl Pentapeptide-4)',
    aliases: ['Palmitoyl Pentapeptide-4', 'Pal-KTTKS', 'Matrixyl'],
    categories: ['cosmetic'],
    shortDescription: 'Palmitoylated matrikine peptide that signals fibroblasts to synthesize collagen — contains no copper.',
    description:
      'Matrixyl is palmitoyl pentapeptide-4 (Pal-KTTKS), a lipidated peptide whose KTTKS core is a fragment of type-I procollagen. Rather than delivering copper, it acts as a matrikine signal that stimulates extracellular-matrix synthesis.',
    mechanism: 'Matrikine signaling — mimics a procollagen-I fragment to upregulate collagen and fibronectin synthesis.',
    researchAreas: ['Skin aging', 'Collagen synthesis'],
    background: [
      'Matrixyl is the trade name for palmitoyl pentapeptide-4, a five-amino-acid sequence (KTTKS) joined to a palmitic-acid chain that improves skin penetration. The KTTKS sequence is a fragment naturally cleaved from the C-terminal propeptide of type-I procollagen during collagen assembly.',
      'The body uses that fragment as a feedback signal — a "matrikine" — telling fibroblasts to keep producing matrix. Matrixyl exploits this: it is studied not as a copper peptide but as a signaling molecule that drives collagen synthesis, and it is one of the better-evidenced cosmetic peptide ingredients.',
    ],
    keyResearch: [
      'Matrikine signaling — the KTTKS core mimics a procollagen-I breakdown fragment, signaling fibroblasts to upregulate collagen I, collagen IV, and fibronectin.',
      'Clinical cosmetic data — a 12-week split-face randomized controlled trial (Robinson et al., 2005) reported improvements in wrinkle depth and skin roughness at low concentration.',
      'Palmitoylation — the lipid chain improves penetration of the otherwise hydrophilic peptide through the stratum corneum.',
      'Compared to copper peptides — unlike GHK-Cu or AHK-Cu, Matrixyl contains no copper and works purely by signaling, not metal delivery.',
      'Cosmetic ingredient — topical use; not a drug.',
    ],
    faqs: [
      {
        q: 'What is Matrixyl?',
        a: 'Matrixyl is palmitoyl pentapeptide-4 (Pal-KTTKS), a lipidated peptide whose KTTKS core is a procollagen-I fragment that signals fibroblasts to produce collagen. It is a widely used cosmetic ingredient.',
      },
      {
        q: 'Is Matrixyl a copper peptide?',
        a: 'No. Unlike GHK-Cu and AHK-Cu, Matrixyl contains no copper. It works as a matrikine signal, not by delivering a metal.',
      },
      {
        q: 'What is the evidence for Matrixyl?',
        a: 'A 12-week split-face randomized controlled trial (Robinson et al., 2005) reported improvements in wrinkle depth and skin roughness, making it one of the better-evidenced cosmetic peptides.',
      },
      {
        q: 'How does it work?',
        a: 'Its KTTKS sequence mimics a collagen-breakdown fragment, signaling fibroblasts to upregulate collagen I, collagen IV, and fibronectin synthesis.',
      },
    ],
    sequence: 'KTTKS',
    molecularWeight: 802.0,
    cas: '214047-00-4',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
    storage:
      'Store the lyophilized peptide frozen and protected from light; in cosmetic formulation, follow the product’s stability guidance.',
    handling:
      'Palmitoylation makes it amphiphilic — disperse carefully in formulation. Protect from heat and light.',
  },
  {
    slug: 'argireline',
    name: 'Argireline',
    aliases: ['Acetyl Hexapeptide-8', 'Acetyl Hexapeptide-3', 'Ac-EEMQRR-NH2'],
    categories: ['cosmetic'],
    shortDescription:
      'A topical "neurocosmetic" hexapeptide that mimics SNAP-25 to soften expression wrinkles — often called topical Botox.',
    description:
      'Argireline (acetyl hexapeptide-8) is a synthetic hexapeptide widely used in anti-aging cosmetics. It mimics the N-terminal end of SNAP-25, a protein in the SNARE complex that nerve endings use to release the signals that make facial muscles contract. By competing in that complex, Argireline is proposed to reduce the muscle contractions behind expression lines — the reason it is marketed as a topical, needle-free alternative to botulinum toxin.',
    mechanism:
      'Mimics the N-terminus of SNAP-25, competitively interfering with SNARE-complex assembly and reducing neurotransmitter release at the neuromuscular junction — dampening the muscle contractions that form expression wrinkles.',
    researchAreas: ['Topical anti-aging', 'Expression-line reduction', 'Cosmetic formulation'],
    background: [
      'Argireline was the peptide that launched the "neurocosmetic" category — topical ingredients that borrow the logic of botulinum toxin without the toxin. Its six-residue, N-acetylated sequence mimics the very end of SNAP-25, one of the SNARE proteins a nerve terminal uses to dock and release its signaling vesicles. By slotting into that machinery, Argireline is proposed to blunt the release that tells a facial muscle to contract, so repeated expressions crease the skin less.',
      'In practice it is a cosmetic-formulation ingredient, applied to the skin in serums and creams rather than injected, and its measured effects are modest and surface-level compared with injected botulinum toxin. It sits in this catalog alongside the other skin peptides — the copper peptides and matrixyl — as a reference entry: a well-defined, widely sold compound whose mechanism is genuinely interesting even where the marketing outruns the evidence. It is a cosmetic ingredient, not an FDA-approved drug.',
    ],
    keyResearch: [
      'SNAP-25 mimic — its acetylated hexapeptide sequence imitates the SNAP-25 N-terminus, competing in the SNARE complex that drives neurotransmitter release.',
      'The "topical Botox" concept — marketed as a needle-free way to soften expression lines by reducing muscle contraction; effects are modest and surface-level.',
      'Cosmetic ingredient — formulated into topical serums and creams (INCI: Acetyl Hexapeptide-8), not injected.',
      'Well-characterized peptide — a defined synthetic hexapeptide, in contrast to the marketing language around it.',
      'Not an FDA-approved drug — a cosmetic ingredient; this page is a research and educational reference.',
    ],
    faqs: [
      {
        q: 'What is Argireline?',
        a: 'Argireline (acetyl hexapeptide-8) is a synthetic hexapeptide used in anti-aging cosmetics that mimics SNAP-25 to reduce the muscle contractions behind expression wrinkles.',
      },
      {
        q: 'Is it really "topical Botox"?',
        a: 'It borrows the same SNARE / SNAP-25 logic as botulinum toxin, but it is applied topically and its effects are modest and superficial — not equivalent to injected Botox.',
      },
      {
        q: 'How does it compare with matrixyl?',
        a: 'Argireline targets muscle-contraction signaling (expression lines); matrixyl (a palmitoyl peptide) signals fibroblasts to make more collagen. They address different aspects of skin aging.',
      },
      {
        q: 'Is Argireline approved?',
        a: 'It is a cosmetic ingredient, not an FDA-approved drug. This page is a research and educational reference.',
      },
    ],
    sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2',
    molecularWeight: 887.0,
    molecularFormula: 'C35H62N14O11S',
    cas: '616204-22-9',
    pubchemCid: 71587772,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'snap-8',
    name: 'SNAP-8',
    aliases: ['Acetyl Octapeptide-3', 'Acetyl Octapeptide-1', 'Ac-EEMQRRAD-NH2'],
    categories: ['cosmetic'],
    shortDescription:
      'An elongated, higher-potency relative of Argireline — an eight-residue SNAP-25 mimic used as a topical, needle-free anti-wrinkle peptide.',
    description:
      'SNAP-8 (acetyl octapeptide-3) is a topical anti-aging peptide closely related to Argireline: it extends the same acetylated SNAP-25-mimicking sequence from six residues to eight, and is marketed as a more potent version of the same "topical Botox" concept. Like Argireline, it is proposed to interfere with the SNARE complex that triggers muscle contraction, softening expression lines when applied to the skin.',
    mechanism:
      'An elongated SNAP-25 N-terminal mimic that competes in SNARE-complex assembly, reducing neurotransmitter release at the neuromuscular junction and the muscle contractions that create expression wrinkles.',
    researchAreas: ['Topical anti-aging', 'Expression-line reduction', 'Cosmetic formulation'],
    background: [
      'SNAP-8 is Argireline’s longer sibling. Where Argireline is a six-residue fragment mimicking the tip of SNAP-25, SNAP-8 extends the same idea to eight residues (acetyl octapeptide-3), a change its developers positioned as improving the peptide’s ability to compete in the SNARE complex and therefore its wrinkle-softening effect. The mechanism is identical in spirit: interfere with the docking machinery that lets a nerve tell a facial muscle to contract.',
      'It is used the same way as Argireline — a cosmetic-formulation ingredient in topical serums and creams, not an injectable — and the same caveat applies: the effects are modest and surface-level next to injected botulinum toxin, and the marketing tends to outrun the controlled evidence. It is catalogued here as a well-defined companion to Argireline on the cosmetic-peptide shelf. It is a cosmetic ingredient, not an FDA-approved drug.',
    ],
    keyResearch: [
      'Elongated SNAP-25 mimic — an eight-residue acetylated peptide extending the Argireline concept, proposed to compete more effectively in the SNARE complex.',
      'Higher-potency positioning — marketed as a stronger version of the "topical Botox" idea than Argireline, though comparative evidence is limited.',
      'Cosmetic ingredient — used topically in serums and creams (INCI: Acetyl Octapeptide-3), not injected.',
      'Companion to Argireline — the same mechanism and use, one shelf over in the cosmetic peptides.',
      'Not an FDA-approved drug — a cosmetic ingredient; this page is a research and educational reference.',
    ],
    faqs: [
      {
        q: 'What is SNAP-8?',
        a: 'SNAP-8 (acetyl octapeptide-3) is a topical anti-aging peptide, an eight-residue relative of Argireline that mimics SNAP-25 to soften expression wrinkles.',
      },
      {
        q: 'How is it different from Argireline?',
        a: 'SNAP-8 extends Argireline’s six-residue sequence to eight residues and is marketed as more potent, but the mechanism and topical use are the same and comparative evidence is limited.',
      },
      {
        q: 'Is it injected like Botox?',
        a: 'No — like Argireline it is a topical cosmetic ingredient. Its effects are modest and superficial compared with injected botulinum toxin.',
      },
      {
        q: 'Is SNAP-8 approved?',
        a: 'It is a cosmetic ingredient, not an FDA-approved drug. This page is a research and educational reference.',
      },
    ],
    sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH2',
    molecularWeight: 1075.2,
    molecularFormula: 'C41H70N16O16S',
    cas: '868844-74-0',
    pubchemCid: 76283482,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'epo',
    name: 'EPO (Erythropoietin)',
    aliases: [
      'Erythropoietin',
      'Epoetin alfa',
      'Epogen',
      'Procrit',
      'recombinant human erythropoietin',
      'rhEPO',
    ],
    categories: ['healing-repair'],
    shortDescription:
      'A glycoprotein hormone that drives red-blood-cell production — a recombinant biologic famous in medicine for treating anemia and infamous in sport for blood doping.',
    description:
      'Erythropoietin is the hormone the kidneys release to tell the bone marrow to make more red blood cells. It is a 165-amino-acid glycoprotein, roughly 30–34 kDa once its sugar chains are counted, and like other glycoprotein hormones its carbohydrate is not optional — the glycosylation governs its stability and circulating half-life. Recombinant versions (epoetin alfa and its relatives) are produced in mammalian cells so that human-like glycosylation occurs, and beyond its core role in red-cell production it has a substantial research literature in tissue protection.',
    mechanism:
      'Binds the erythropoietin receptor on red-cell progenitors in the bone marrow, activating JAK2/STAT5 signaling that promotes their survival, proliferation, and maturation into erythrocytes — raising the blood’s oxygen-carrying capacity. The same receptor is expressed in other tissues, the basis for its cytoprotective research.',
    researchAreas: ['Anemia', 'Tissue protection', 'Neuroprotection', 'Erythropoiesis'],
    background: [
      'EPO is a glycoprotein, and that places it firmly in the biologic tier of this catalog. Its 165-residue chain folds into a four-helix bundle (the same architectural family as growth hormone) and is decorated with three N-linked and one O-linked glycan. Those sugars are functionally decisive: more heavily glycosylated, engineered versions (such as darbepoetin) circulate far longer. This is why EPO is made in mammalian cell culture rather than bacteria — only a eukaryotic cell adds the human-style glycosylation the molecule needs.',
      'In medicine it is well established and genuinely important: recombinant EPO treats the anemia of chronic kidney disease, chemotherapy, and other marrow-suppressed states, sparing transfusions for millions. Its receptor turns up in the nervous system and elsewhere, which has driven a long research thread into EPO as a cytoprotective and neuroprotective agent after ischemic injury — promising in models, unproven as therapy.',
      'Then there is the doping. EPO became the defining drug of endurance-sport scandals: by raising red-cell mass it boosts oxygen delivery and stamina, and it sat at the center of professional cycling’s doping era. The misuse carries real danger — thickened blood raises the risk of clots, stroke, and heart attack — and the same caution emerged in medicine, where trials showed that over-correcting hemoglobin to normal or high targets increased cardiovascular events and mortality. EPO is a clean example of a molecule whose reputation splits sharply between its legitimate, life-improving medical use and its dangerous performance misuse.',
    ],
    keyResearch: [
      'Anemia of chronic kidney disease — the core approved use, replacing the EPO failing kidneys no longer make.',
      'Chemotherapy-induced anemia — used to reduce transfusion need in selected patients.',
      'Hemoglobin-target caution — trials found that normalizing/over-correcting hemoglobin raised cardiovascular events and mortality, reshaping dosing.',
      'Tissue/neuroprotection — EPO-receptor signaling outside marrow is studied for cytoprotection after ischemic injury (research, not approved).',
      'Endurance doping — banned in sport; raising red-cell mass increases clot, stroke, and heart-attack risk.',
      'Glycosylation engineering — added glycans (darbepoetin) extend half-life, underscoring that the sugar defines the drug.',
    ],
    faqs: [
      {
        q: 'What is EPO?',
        a: 'Erythropoietin — a glycoprotein hormone, mainly from the kidneys, that signals the bone marrow to produce red blood cells. Recombinant EPO (epoetin alfa) treats anemia in kidney disease and chemotherapy.',
      },
      {
        q: 'Why is EPO a biologic rather than a peptide?',
        a: 'It is a folded, glycosylated 165-amino-acid protein whose sugar chains are essential to its activity and half-life. It is produced in mammalian cells so that human-like glycosylation occurs — something bacterial peptide synthesis cannot do.',
      },
      {
        q: 'Why is EPO associated with doping?',
        a: 'By increasing red-cell mass it raises oxygen delivery and endurance, which made it a notorious performance drug, especially in cycling. The misuse is dangerous — it thickens the blood and raises clot, stroke, and heart-attack risk.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. EPO is a prescription biologic with significant cardiovascular risks when misused.',
      },
    ],
    molecularWeight: 30400,
    cas: '113427-24-0',
    uniprotId: 'P01588',
    fdaApproved: true,
    storage:
      'Recombinant EPO is stored refrigerated (2–8 °C) and protected from light; it must not be frozen or shaken. Glycoprotein integrity is sensitive to heat and freeze–thaw.',
    handling:
      'A glycosylated protein sensitive to heat, freezing, and agitation, which can aggregate it and reduce potency. Aggregated protein is also an immunogenicity concern — historically linked to rare pure red-cell aplasia from anti-EPO antibodies.',
    synthesisNotes:
      'EPO is produced recombinantly in mammalian (CHO) cell culture so that its essential N- and O-linked glycosylation is human-like; its ~30–34 kDa mass is approximate and varies with glycosylation, so it has no single molecular formula. Characterization is glycoprotein-grade — glycan/isoform profiling, identity by mass spectrometry and peptide mapping, and cell-based potency — far beyond an HPLC purity figure.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ara-290',
    name: 'ARA-290',
    aliases: ['Cibinetide', 'pHBSP', 'Pyroglutamate helix B surface peptide'],
    categories: ['healing-repair'],
    shortDescription:
      'An 11-amino-acid, non-erythropoietic fragment of erythropoietin that keeps EPO’s tissue-protective, anti-inflammatory activity without raising red blood cells.',
    description:
      'ARA-290 (cibinetide) is a synthetic 11-amino-acid peptide taken from the helix-B surface of erythropoietin (EPO). It was designed to separate EPO’s tissue-protective and anti-inflammatory effects from its blood-building ones: ARA-290 activates the so-called innate repair receptor without stimulating red-cell production, so it carries none of EPO’s thrombotic risk. It has been studied mainly for neuropathic pain and tissue repair, most notably in sarcoidosis-related small-fiber neuropathy.',
    mechanism:
      'Selective agonist at the innate repair receptor — a heterocomplex of the EPO receptor and the β-common receptor (CD131) — driving tissue-protective and anti-inflammatory signaling without erythropoiesis.',
    researchAreas: ['Neuropathic pain', 'Small-fiber neuropathy', 'Tissue protection', 'Anti-inflammatory / repair'],
    background: [
      'ARA-290 is what you get when you ask which part of erythropoietin does the healing. EPO — the red-cell hormone catalogued just above — turns out to have two distinct jobs: it builds red blood cells, and, through a different receptor, it protects and repairs injured tissue and calms inflammation. Those activities are separable, and ARA-290 (cibinetide) is the 11-residue piece of EPO’s helix-B surface engineered to trigger only the second one.',
      'Because it does not act on the classic EPO receptor that raises red-cell mass, ARA-290 avoids the clotting and blood-thickening dangers that make EPO risky, while retaining EPO’s tissue-protective, anti-inflammatory signaling through the innate repair receptor. Its most developed research is in small-fiber neuropathy — including the neuropathic pain of sarcoidosis — along with broader work in tissue repair and metabolic inflammation. It carries an N-terminal pyroglutamate that improves its stability. It is investigational and not FDA-approved.',
    ],
    keyResearch: [
      'Non-erythropoietic by design — activates EPO’s tissue-protective innate repair receptor without raising red-cell mass, avoiding EPO’s thrombotic risk.',
      'Neuropathic pain — the most-developed indication; studied in sarcoidosis-associated small-fiber neuropathy.',
      'Tissue protection & anti-inflammation — retains EPO’s repair and immunomodulatory signaling, examined across injury and metabolic-inflammation models.',
      'Derived from EPO helix-B — an 11-residue surface fragment with an N-terminal pyroglutamate for stability.',
      'Investigational — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is ARA-290?',
        a: 'ARA-290 (cibinetide) is a synthetic 11-amino-acid fragment of erythropoietin that triggers EPO’s tissue-protective, anti-inflammatory signaling without stimulating red-blood-cell production.',
      },
      {
        q: 'How is it different from EPO?',
        a: 'EPO both builds red cells and protects tissue; ARA-290 keeps only the tissue-protective, anti-inflammatory activity, so it does not carry EPO’s clotting and blood-thickening risks.',
      },
      {
        q: 'What is it studied for?',
        a: 'Chiefly neuropathic pain and small-fiber neuropathy — including in sarcoidosis — plus broader tissue-protection and anti-inflammatory research.',
      },
      {
        q: 'Is ARA-290 approved?',
        a: 'No — it is investigational and not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'pGlu-Glu-Gln-Leu-Glu-Arg-Ala-Leu-Asn-Ser-Ser',
    molecularWeight: 1257.3,
    molecularFormula: 'C51H84N16O21',
    cas: '1208243-50-8',
    pubchemCid: 91810664,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'teriparatide',
    name: 'Teriparatide (PTH 1-34)',
    aliases: ['PTH(1-34)', 'Forteo', 'Bonsity', 'recombinant parathyroid hormone'],
    categories: ['healing-repair', 'longevity', 'peptide-hormone'],
    shortDescription:
      'The active fragment of parathyroid hormone — a recombinant peptide that builds bone, exploiting a paradox: the same hormone resorbs bone when continuous, but builds it when pulsed.',
    description:
      'Teriparatide is the first 34 amino acids of parathyroid hormone (PTH), the body’s master regulator of calcium. It is one of the few osteoporosis drugs that is genuinely anabolic — it builds new bone rather than just slowing its loss — and it does so by exploiting a striking biological paradox. The same PTH signal that dissolves bone when it is chronically elevated stimulates bone formation when it is delivered as a brief, once-daily pulse. Teriparatide turns that timing trick into a therapy.',
    mechanism:
      'Agonist at the PTH1 receptor on osteoblasts. Intermittent (once-daily) exposure favors osteoblast activity and new bone formation; continuous elevation (as in hyperparathyroidism) instead drives osteoclastic resorption. The therapeutic effect depends entirely on the pulsatile dosing.',
    researchAreas: ['Osteoporosis', 'Bone formation', 'Fracture healing', 'Calcium regulation', 'Peptide hormones'],
    background: [
      'Parathyroid hormone is the body’s calcium thermostat, and the N-terminal 1-34 fragment retains its full receptor activity — which is why teriparatide is that fragment rather than the whole 84-residue hormone. Its defining feature is the dose-pattern paradox: a continuously high PTH level (the disease state of hyperparathyroidism) leaches calcium from bone, but a short daily spike tips the balance toward the bone-building osteoblasts. Teriparatide (Forteo, approved 2002) was among the first treatments to add bone rather than merely preserve it, used in severe osteoporosis and high fracture risk.',
      'It also carries one of the more instructive drug-safety stories. Teriparatide launched with a black-box warning for osteosarcoma, a bone cancer seen when rats were given very high, lifelong doses — which translated into a strict two-year lifetime limit on use in people. Over nearly two decades of post-marketing data that signal did not materialize in humans, and in 2020 the FDA removed the boxed warning and the lifetime restriction. It is a useful case of a precautionary animal-derived warning being revised as real-world human evidence accumulated.',
      'For a reference catalog, teriparatide is a clean example of how *timing*, not just the molecule, determines a hormone’s effect — and of how a peptide fragment can outperform the full hormone for a specific therapeutic goal.',
    ],
    keyResearch: [
      'Anabolic osteoporosis therapy — builds new bone, distinct from antiresorptives that only slow loss.',
      'The dose-pattern paradox — intermittent PTH builds bone; continuous PTH resorbs it.',
      'Fracture-risk reduction — the approved use in severe osteoporosis and high fracture risk.',
      'Boxed-warning reversal — the rat osteosarcoma warning and 2-year limit were removed by the FDA in 2020 after human data.',
      'PTH1-receptor signaling — acts on osteoblasts; the 1-34 fragment retains full activity of the 84-residue hormone.',
    ],
    faqs: [
      {
        q: 'What is teriparatide?',
        a: 'Teriparatide is PTH(1-34), the active fragment of parathyroid hormone, used as a recombinant injectable (Forteo) for osteoporosis. Unlike most bone drugs, it is anabolic — it builds new bone.',
      },
      {
        q: 'How can parathyroid hormone both build and break down bone?',
        a: 'It is about timing. A brief once-daily pulse of PTH favors bone-building osteoblasts, while a continuously high level (as in hyperparathyroidism) drives bone resorption. Teriparatide uses the pulsatile pattern deliberately.',
      },
      {
        q: 'Is teriparatide still limited to two years?',
        a: 'The original 2-year lifetime limit and osteosarcoma boxed warning — based on high-dose rat studies — were removed by the FDA in 2020 after long-term human data did not show that risk.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'SVSEIQLMHNLGKHLNSMERVEWLRKKLQDVHNF',
    molecularWeight: 4117.8,
    molecularFormula: 'C181H291N55O51S2',
    cas: '52232-67-4',
    fdaApproved: true,
    storage:
      'Teriparatide is supplied as a refrigerated (2–8 °C) solution pen; it must not be frozen and is protected from light, with an in-use window defined by the label.',
    handling:
      'A peptide in aqueous solution — kept cold, not frozen or shaken. Pen devices deliver fixed daily doses to maintain the pulsatile exposure the mechanism depends on.',
    synthesisNotes:
      'Teriparatide is recombinant human PTH(1-34), expressed in E. coli and purified to a defined 34-residue peptide. Because it is the minimal active fragment rather than the full 84-residue hormone, it can be manufactured and characterized more like a long synthetic/recombinant peptide than a large folded protein — identity by mass spectrometry and peptide mapping, with potency confirmed functionally.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'somatropin',
    name: 'Somatropin (rHGH)',
    aliases: [
      'Recombinant human growth hormone',
      'rhGH',
      '191aa HGH',
      'Human growth hormone',
      'Genotropin',
      'Humatrope',
      'Norditropin',
      'Nutropin',
      'Saizen',
      'Omnitrope',
      'Serostim',
    ],
    categories: ['growth-hormone', 'longevity'],
    shortDescription:
      'Recombinant 191-amino-acid human growth hormone — a folded protein biologic identical in sequence to pituitary GH, not a synthetic research peptide.',
    description:
      'Somatropin is recombinant human growth hormone (rHGH): a single 191-amino-acid polypeptide, ~22.1 kDa, with the exact sequence of the major form secreted by the human pituitary. Unlike the short synthetic peptides elsewhere in this catalog, it is a folded protein biologic — produced in engineered cells, stabilized by two internal disulfide bonds, and dependent on its three-dimensional structure for activity. It is FDA-approved for several growth-hormone-deficiency and short-stature indications, and is simultaneously one of the most misunderstood molecules in the anti-aging conversation.',
    mechanism:
      'Binds a single GH receptor that then dimerizes, activating JAK2/STAT5 signaling. Most anabolic and growth effects are mediated indirectly through hepatic IGF-1 induction; GH also acts directly to drive lipolysis and oppose insulin.',
    researchAreas: [
      'Growth hormone deficiency',
      'Body composition',
      'Anti-aging (off-label)',
      'Longevity',
      'GH/IGF-1 axis',
    ],
    background: [
      'Somatropin is a biologic, and that distinction is the point of including it here. The research peptides in this catalog are mostly short chains built by solid-phase synthesis; somatropin is a full 191-residue protein with defined secondary and tertiary structure — a four-helix bundle held by two disulfide bridges (Cys53–Cys165 and Cys182–Cys189). Its sequence is identical to the dominant 22 kDa form of growth hormone the pituitary releases, which is why it is called "recombinant human" growth hormone rather than an analog. Activity lives in the fold: denature the protein and you do not get a weaker peptide, you get an inactive one.',
      'The molecule also carries its own history. Until 1985, growth hormone was extracted from cadaveric pituitaries — a supply that was abruptly halted when several recipients developed Creutzfeldt–Jakob disease from prion contamination. Recombinant production solved both the supply and the safety problem. The first recombinant product (somatrem) carried an extra N-terminal methionine, a 192-amino-acid artifact of bacterial expression; somatropin is the true 191-amino-acid, native-sequence version that followed and now defines the class across brands such as Genotropin, Humatrope, Norditropin, and Saizen.',
      'Mechanistically, growth hormone is a relay, not a direct effector. It binds and dimerizes the GH receptor, triggering JAK2/STAT5 signaling, and much of what people attribute to "GH" is actually the work of IGF-1 produced downstream in the liver. GH does have direct actions — it mobilizes fat and antagonizes insulin — but the growth and anabolic story runs largely through the GH/IGF-1 axis. This is also why the secretagogues elsewhere in this catalog (the GHRH analogs and GHRPs) exist: they coax the pituitary into releasing this same molecule, preserving the body’s pulsatile feedback rather than supplying a flat exogenous dose.',
      'Then there is the drama. In 1990 a small New England Journal of Medicine study by Daniel Rudman gave GH to twelve older men and reported reduced fat and increased lean mass over six months. That single paper — 12 subjects, no functional endpoints — became the founding myth of the GH anti-aging industry. The journal’s own editors later published an unusual note cautioning against using it to justify anti-aging treatment, and subsequent work documented the costs of supraphysiologic GH in healthy adults: fluid retention, carpal tunnel syndrome, joint pain, and insulin resistance. The headline rarely traveled with the footnotes.',
      'The deepest irony is the longevity science. Across model organisms, it is reduced GH/IGF-1 signaling — not elevated — that tracks with extended lifespan: GH-receptor-knockout mice are among the longest-lived strains known, and humans with Laron syndrome (GH-receptor insensitivity) show strikingly low rates of cancer and diabetes. So a hormone marketed for "longevity" sits on an axis whose downregulation is one of the most reproducible pro-longevity signals in biology. That tension — real, FDA-approved medicine for genuine deficiency; oversold and legally restricted as an anti-aging tonic; and pointing the opposite direction from the longevity data — is exactly why it belongs in an honest reference.',
    ],
    keyResearch: [
      'Growth hormone deficiency — the core approved use, in both pediatric and adult GHD, restoring GH/IGF-1 signaling to a physiologic range.',
      'Approved short-stature and wasting indications — Turner syndrome, Prader-Willi syndrome, chronic renal insufficiency, SHOX deficiency, idiopathic short stature, AIDS wasting, and short bowel syndrome, depending on the specific product label.',
      'Body composition — supraphysiologic GH reduces fat mass and increases lean/water mass, the effect that drives off-label anti-aging and athletic use; functional and long-term benefit in healthy adults is not established.',
      'Documented adverse effects — fluid retention/edema, carpal tunnel syndrome, arthralgia, and insulin resistance are recurrent findings when GH is given above physiologic need.',
      'Longevity paradox — reduced GH/IGF-1 signaling (GH-receptor knockout models, Laron syndrome) is associated with extended lifespan and lower cancer/diabetes risk, complicating the "anti-aging" rationale.',
      'Legally restricted — U.S. federal law (21 U.S.C. § 333(e)) makes distribution of hGH for any use not specifically authorized by the FDA a crime; this is a near-unique statutory restriction among prescription drugs.',
    ],
    faqs: [
      {
        q: 'What is somatropin (191aa rHGH)?',
        a: 'Somatropin is recombinant human growth hormone — a 191-amino-acid protein, ~22 kDa, with the same sequence as the growth hormone made by the human pituitary. It is a folded biologic, not a synthetic peptide, and is FDA-approved for several growth-hormone-deficiency and short-stature conditions.',
      },
      {
        q: 'Why is it described as a biologic rather than a peptide?',
        a: 'Its activity depends on three-dimensional structure — a four-helix fold stabilized by two disulfide bonds — and it is produced in living cells, not by solid-phase synthesis. That makes its manufacturing, characterization, and quality control much closer to a protein drug than to a short research peptide.',
      },
      {
        q: 'Is it really used for anti-aging?',
        a: 'Off-label, yes — that use traces largely to a small 1990 study whose authors and journal later warned against extrapolating it. Healthy-adult use carries documented side effects (edema, carpal tunnel, joint pain, insulin resistance), and U.S. law specifically restricts distributing hGH for uses the FDA has not authorized.',
      },
      {
        q: 'Does growth hormone extend lifespan?',
        a: 'The reverse is better supported in research: lower GH/IGF-1 signaling is associated with longer lifespan in animal models and with reduced cancer and diabetes in people with GH-receptor insensitivity (Laron syndrome). The popular "longevity" framing runs against much of the aging biology.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No. This is a research and educational reference. Somatropin is a prescription biologic with specific approved indications and significant legal restrictions; nothing here is a recommendation to obtain or use it.',
      },
    ],
    sequence:
      'FPTIPLSRLFDNAMLRAHRLHQLAFDTYQEFEEAYIPKEQKYSFLQNPQTSLCFSESIPTPSNREETQQKSNLELLRISLLLIQSWLEPVQFLRSVFANSLVYGASDSNVYDLLKDLEEGIQTLMGRLEDGSPRTGQIFKQTYSKFDTNSHNDDALLKNYGLLYCFRKDMDKVETFLRIVQCRSVEGSCGF',
    molecularWeight: 22124,
    molecularFormula: 'C990H1528N262O300S7',
    cas: '12629-01-5',
    uniprotId: 'P01241',
    fdaApproved: true,
    storage:
      'Lyophilized somatropin is stored refrigerated (2–8 °C); most products must stay cold and are reconstituted with a supplied diluent. Reconstituted solution is typically used within days to weeks under refrigeration and must not be frozen — freezing and agitation can denature and aggregate the protein.',
    handling:
      'As a folded biologic it is sensitive to heat, freeze–thaw, vigorous shaking, and surface adsorption, any of which can unfold or aggregate it and destroy potency without changing appearance. Aggregated protein is also a potential immunogenicity concern, which is why protein therapeutics carry a tighter cold chain than small peptides.',
    synthesisNotes:
      'Somatropin is not made by solid-phase peptide synthesis. It is expressed recombinantly — historically in E. coli (often as inclusion bodies requiring refolding) and in mammalian cell lines — then purified by multi-step chromatography and verified for correct folding and disulfide pairing. Identity and potency rest on protein-specific methods (peptide mapping, mass spectrometry, bioassay/cell-based potency, host-cell-protein and endotoxin testing), not an HPLC purity percentage alone. This is the defining difference between a complex biologic hormone and the short synthetic peptides in the rest of this catalog.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'igf-1',
    name: 'IGF-1 (Mecasermin)',
    aliases: [
      'Insulin-like growth factor 1',
      'Mecasermin',
      'Increlex',
      'Somatomedin C',
      'rhIGF-1',
    ],
    categories: ['growth-hormone', 'longevity'],
    shortDescription:
      'The downstream effector of growth hormone — a 70-amino-acid recombinant protein, structurally a cousin of proinsulin, that carries out most of GH’s growth signal.',
    description:
      'IGF-1 is the molecule that does much of growth hormone’s work. It is a 70-amino-acid single-chain protein (~7.6 kDa) with three disulfide bonds, structurally homologous to proinsulin — which is why insulin and IGF-1 signaling overlap. Produced mainly in the liver under GH stimulation, it is the mediator most responsible for GH’s anabolic and growth-promoting effects. The recombinant therapeutic version, mecasermin, is FDA-approved for severe IGF-1 deficiency. It pairs naturally with somatropin in this catalog: GH is the signal, IGF-1 is the message that actually reaches the tissues.',
    mechanism:
      'Binds the IGF-1 receptor (a tyrosine kinase) and, with lower affinity, the insulin receptor, activating PI3K/AKT and MAPK signaling to drive cell growth, proliferation, and survival. Circulating IGF-1 is largely bound to IGF-binding proteins, which modulate its availability.',
    researchAreas: ['Severe primary IGF-1 deficiency', 'GH/IGF-1 axis', 'Growth disorders', 'Longevity'],
    background: [
      'Where somatropin is the broadcast, IGF-1 is the signal received. Growth hormone acts on the liver and other tissues to induce IGF-1, and it is IGF-1 — acting through its own tyrosine-kinase receptor — that mediates most of the downstream growth and anabolic effects. Its structural kinship to proinsulin is not a coincidence: the IGF and insulin systems are evolutionary relatives, which is why IGF-1 has weak insulin-like (hypoglycemic) activity and why dosing is constrained by that overlap.',
      'The therapeutic form, mecasermin (Increlex), is recombinant human IGF-1 approved in 2005 for children with severe primary IGF-1 deficiency or growth-hormone insensitivity — the Laron syndrome population, in whom GH itself does not work because the receptor or its signaling is broken. In those patients, supplying IGF-1 directly bypasses the failed step.',
      'IGF-1 carries the same two layers of drama as growth hormone, sharpened. It is banned in sport and has been a recurring doping target; the most public episode was the 2013 "deer antler velvet spray" affair, in which an IGF-1-marketed product was tied to several athletes — a reminder that much of what is sold as IGF-1 outside medicine is unverified. And the longevity paradox is, if anything, cleaner here: low IGF-1 signaling is one of the most reproducible pro-longevity signals in biology, with IGF-1-pathway mutants living longer across species and Laron-syndrome individuals showing strikingly low cancer and diabetes incidence. A protein marketed for anti-aging sits on the very axis whose suppression extends life.',
    ],
    keyResearch: [
      'Severe primary IGF-1 deficiency — the approved use of mecasermin, supplying IGF-1 where GH signaling has failed.',
      'GH/IGF-1 axis — IGF-1 is the principal mediator of growth hormone’s anabolic effects.',
      'Insulin cross-talk — structural homology to proinsulin gives it weak hypoglycemic activity, a dosing constraint.',
      'Longevity paradox — reduced IGF-1 signaling tracks with extended lifespan and lower cancer/diabetes risk (Laron syndrome).',
      'Doping target — WADA-banned; "deer antler velvet" IGF-1 products are a notable case of unverified marketing.',
      'IGF-binding proteins — circulating IGF-1 is mostly protein-bound, which regulates its activity and half-life.',
      'Research analogs & splice variants — IGF-1 LR3 is a long-acting modified analog studied for systemic hypertrophy, while MGF (mechano growth factor) is a local IGF-1 splice variant studied for satellite-cell activation after muscle damage.',
    ],
    faqs: [
      {
        q: 'What is IGF-1?',
        a: 'Insulin-like growth factor 1 — a 70-amino-acid protein, made mainly in the liver under growth-hormone stimulation, that carries out most of GH’s growth-promoting effects. The recombinant drug mecasermin (Increlex) is approved for severe IGF-1 deficiency.',
      },
      {
        q: 'How is IGF-1 related to growth hormone?',
        a: 'GH stimulates the liver to produce IGF-1, and IGF-1 then does much of the actual signaling to tissues. That is why IGF-1 can treat people whose GH does not work (Laron syndrome).',
      },
      {
        q: 'Why is it called "insulin-like"?',
        a: 'IGF-1 is structurally homologous to proinsulin and binds the insulin receptor weakly, giving it mild insulin-like (glucose-lowering) effects.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Mecasermin is a prescription biologic; much of what is sold as IGF-1 outside medicine is unverified.',
      },
    ],
    sequence: 'GPETLCGAELVDALQFVCGDRGFYFNKPTGYGSSSRRAPQTGIVDECCFRSCDLRRLEMYCAPLKPAKSA',
    molecularWeight: 7649,
    molecularFormula: 'C331H512N94O101S7',
    cas: '68562-41-4',
    uniprotId: 'P05019',
    fdaApproved: true,
    storage:
      'Mecasermin is stored refrigerated (2–8 °C) and protected from light; it must not be frozen, and reconstituted/in-use solution is used within the label’s limited window.',
    handling:
      'A folded disulfide-bonded protein, sensitive to heat, freeze–thaw, and agitation. Because of its insulin-like activity, hypoglycemia is a specific handling/clinical concern.',
    synthesisNotes:
      'Recombinant IGF-1 is expressed (classically in E. coli), refolded to its native three-disulfide structure, and purified by chromatography. Release testing is protein-grade — peptide mapping, mass spectrometry, correct disulfide pairing, cell-based potency, host-cell-protein and endotoxin limits — not an HPLC purity figure alone.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    aliases: ['Long R3 IGF-1', 'LR3 IGF-1'],
    categories: ['growth-hormone'],
    shortDescription: 'A long-acting modified IGF-1 analog with reduced IGFBP binding and prolonged systemic activity.',
    description:
      'IGF-1 LR3 (Long R3 IGF-1) is an 83-amino-acid analog of IGF-1 with an arginine substitution at position 3 and a 13-residue N-terminal extension. These changes reduce binding to IGF-binding proteins, extending its half-life and potency versus native IGF-1.',
    mechanism: 'IGF-1 receptor agonism with reduced IGFBP binding → prolonged systemic anabolic signaling.',
    researchAreas: ['Muscle hypertrophy', 'Cell proliferation', 'GH/IGF-1 axis'],
    background: [
      'IGF-1 LR3 ("Long R3 IGF-1") is a modified version of insulin-like growth factor 1, engineered for a much longer duration of action. Two changes define it: arginine replaces glutamic acid at position 3, and a 13-amino-acid extension is added to the N-terminus.',
      'Together these reduce the analog’s affinity for IGF-binding proteins — the carriers that normally sequester circulating IGF-1 — so more remains free and active, extending half-life and increasing potency roughly two- to three-fold over native IGF-1 (~9.1 kDa). It is a research compound, widely used in cell culture, and is not FDA-approved; it is also prohibited in sport.',
    ],
    keyResearch: [
      'Reduced IGFBP binding — the R3 substitution lowers affinity for IGF-binding proteins, leaving more peptide free and active.',
      'Prolonged potency — systemic, long-acting anabolic signaling roughly two- to three-fold more potent than native IGF-1.',
      'Cell-culture standard — widely used as a serum-free supplement to promote cell proliferation in bioprocessing.',
      'Compared to MGF — IGF-1 LR3 is systemic and long-acting (hypertrophy), while MGF is a local, transient splice variant (satellite-cell activation).',
      'Preclinical / prohibited in sport — not FDA-approved; WADA-banned.',
    ],
    faqs: [
      {
        q: 'What is IGF-1 LR3?',
        a: 'IGF-1 LR3 (Long R3 IGF-1) is a modified, long-acting analog of IGF-1 with an arginine-3 substitution and an N-terminal extension that reduce IGF-binding-protein binding and extend its activity.',
      },
      {
        q: 'Why does the R3 modification matter?',
        a: 'It lowers the analog’s affinity for IGF-binding proteins, so more remains free and active in circulation — extending half-life and increasing potency versus native IGF-1.',
      },
      {
        q: 'How does it compare to MGF?',
        a: 'IGF-1 LR3 is systemic and long-acting, studied for hypertrophy; MGF is a local, transient IGF-1 splice variant studied for satellite-cell activation. The two are typically sequenced, not combined.',
      },
      {
        q: 'Is IGF-1 LR3 approved?',
        a: 'No. It is a research compound (also common in cell culture), not FDA-approved, and is prohibited in sport. This page is a research and educational reference.',
      },
    ],
    cas: '946870-92-4',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
    storage:
      'Lyophilized: store frozen and protected from light. Reconstituted: refrigerate at 2–8 °C and minimize freeze–thaw — a folded, disulfide-bonded protein.',
    handling:
      'A disulfide-bonded protein sensitive to heat, agitation, and freeze–thaw. Reconstitute gently (swirl, do not shake).',
  },
  {
    slug: 'igf-1-des',
    name: 'IGF-1 DES',
    aliases: ['DES(1-3)IGF-1', 'des-IGF-1', 'DES(1-3) IGF-1'],
    categories: ['growth-hormone'],
    shortDescription:
      'A truncated IGF-1 missing its first three residues — sharply reduced IGFBP binding and high local potency, but short-acting.',
    description:
      'IGF-1 DES (DES(1-3)IGF-1) is native IGF-1 with the first three N-terminal residues removed — a 67-amino-acid analog. Losing that tripeptide sharply reduces its affinity for the IGF-binding proteins that normally restrain IGF-1, leaving it far more potent locally, though much shorter-acting than the extended LR3 analog.',
    mechanism:
      'IGF-1 receptor agonism with greatly reduced IGFBP binding → potent, short-lived local anabolic signaling.',
    researchAreas: ['Muscle hypertrophy', 'Cell proliferation', 'GH/IGF-1 axis'],
    background: [
      'IGF-1 DES is the shortest of the common IGF-1 variants: insulin-like growth factor 1 with the first three amino acids (Gly-Pro-Glu) clipped from the N-terminus, giving a 67-residue peptide versus 70 for native IGF-1. That small deletion has an outsized effect, because the N-terminal tripeptide is part of what IGF-binding proteins grip. Removing it drops IGFBP affinity dramatically, so the peptide stays free and active rather than being sequestered.',
      'The result is a variant reported as roughly ten-fold more potent than native IGF-1 in some assays, but with a short half-life — the opposite design philosophy to IGF-1 LR3, which is engineered for extended, systemic action. IGF-1 DES is a research compound (~7.4 kDa), widely used in cell culture, not FDA-approved, and prohibited in sport.',
    ],
    keyResearch: [
      'Reduced IGFBP binding — removing the N-terminal Gly-Pro-Glu tripeptide sharply lowers affinity for IGF-binding proteins, leaving more peptide free and active.',
      'High local potency — reported roughly ten-fold more potent than native IGF-1 in some assays, with a short duration of action.',
      'Compared to IGF-1 LR3 — DES is short-acting and locally potent; LR3 is engineered (R3 substitution + N-terminal extension) for prolonged systemic activity.',
      'Cell-culture use — used as a serum supplement where IGFBP-independent activity is wanted.',
      'Preclinical / prohibited in sport — not FDA-approved; WADA-banned.',
    ],
    faqs: [
      {
        q: 'What is IGF-1 DES?',
        a: 'IGF-1 DES (DES(1-3)IGF-1) is a shortened form of IGF-1 missing its first three amino acids, which greatly reduces IGF-binding-protein binding and increases its local potency.',
      },
      {
        q: 'How is it different from IGF-1 LR3?',
        a: 'Both reduce IGFBP binding, but DES does it by truncation and is short-acting and locally potent, whereas LR3 adds modifications for long, systemic action.',
      },
      {
        q: 'Why does removing three amino acids matter so much?',
        a: 'The N-terminal tripeptide is part of what IGF-binding proteins grip; without it the peptide escapes sequestration and stays free and active.',
      },
      {
        q: 'Is IGF-1 DES approved?',
        a: 'No. It is a research compound (also common in cell culture), not FDA-approved, and prohibited in sport. This page is a research and educational reference.',
      },
    ],
    sequence: 'TLCGAELVDALQFVCGDRGFYFNKPTGYGSSSRRAPQTGIVDECCFRSCDLRRLEMYCAPLKPAKSA',
    molecularWeight: 7371.5,
    cas: '112603-35-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
    storage:
      'Lyophilized: store frozen and protected from light. Reconstituted: refrigerate at 2–8 °C and minimize freeze–thaw — a folded, disulfide-bonded protein.',
    handling:
      'A disulfide-bonded protein sensitive to heat, agitation, and freeze–thaw. Reconstitute gently (swirl, do not shake).',
  },
  {
    slug: 'mgf',
    name: 'MGF (Mechano Growth Factor)',
    aliases: ['Mechano Growth Factor', 'IGF-1Ec', 'IGF-1 Ec'],
    categories: ['growth-hormone'],
    shortDescription: 'A splice variant of IGF-1 expressed after muscle damage; studied for satellite-cell activation.',
    description:
      'MGF is the IGF-1Ec splice variant — produced locally in muscle after mechanical overload or injury. Its distinct C-terminal E-peptide is studied for activating satellite cells, upstream of IGF-1’s hypertrophic role.',
    mechanism: 'Local IGF-1 splice variant; the E-peptide activates muscle satellite (stem) cells, complementing IGF-1-receptor signaling.',
    researchAreas: ['Muscle repair', 'Satellite-cell activation'],
    background: [
      'Mechano growth factor (MGF) is a splice variant of IGF-1, also called IGF-1Ec. A 49-base-pair insert in exon 5 introduces a reading-frame shift, producing a distinct C-terminal peptide (the "E-domain") not found in the main circulating IGF-1 isoform.',
      'MGF is expressed rapidly and locally in muscle after mechanical overload or damage — the experimental basis was established by Geoffrey Goldspink and colleagues (UCL) beginning in the late 1990s. Its proposed role is to begin repair by activating satellite cells before differentiation, complementing the longer-acting hypertrophic signal of IGF-1 itself. It is a research compound, not FDA-approved.',
    ],
    keyResearch: [
      'Satellite-cell activation — the E-peptide is proposed to act upstream, promoting satellite-cell proliferation before differentiation.',
      'Damage-induced expression — produced locally and rapidly after mechanical overload or muscle injury (McKoy, Ashley, Yang et al., 1999).',
      'Splice-variant origin — an exon-5 insert gives IGF-1Ec a distinct C-terminal peptide versus the main IGF-1 isoform.',
      'Compared to IGF-1 LR3 — MGF is local and transient, driving satellite-cell activation; IGF-1 LR3 is systemic and long-acting, driving hypertrophy. The two are sequenced rather than combined.',
      'Preclinical / prohibited in sport — not FDA-approved; WADA-banned.',
    ],
    faqs: [
      {
        q: 'What is MGF?',
        a: 'MGF (mechano growth factor) is a splice variant of IGF-1 (IGF-1Ec) produced locally in muscle after damage. Its distinct E-peptide is studied for activating satellite cells.',
      },
      {
        q: 'How is MGF different from IGF-1?',
        a: 'MGF is a splice variant with a unique C-terminal peptide, expressed locally after mechanical stress. Where standard IGF-1 sustains hypertrophy systemically, MGF is studied for initiating repair by activating satellite cells.',
      },
      {
        q: 'How does MGF compare to IGF-1 LR3?',
        a: 'MGF is local and transient (satellite-cell activation); IGF-1 LR3 is systemic and long-acting (hypertrophy). They are generally studied in sequence rather than together.',
      },
      {
        q: 'Is MGF approved?',
        a: 'No. It is a research compound, not FDA-approved, and is prohibited in sport. This page is a research and educational reference.',
      },
    ],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
    storage:
      'Lyophilized: store frozen and protected from light. Reconstituted: refrigerate at 2–8 °C and use within weeks; minimize freeze–thaw.',
    handling:
      'Reconstitute gently and avoid shaking; protect from heat and light. PEGylated forms (PEG-MGF) are handled similarly but differ in half-life.',
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
      'Sustained exposure — albumin binding extends half-life to roughly 6–8 days (Teichman et al., 2006, J Clin Endocrinol Metab).',
      'GH / IGF-1 elevation — in early human study a single dose produced dose-dependent ~2–10-fold mean GH elevations and sustained IGF-1 increases lasting about 9–11 days.',
      'Pulsatility trade-off — continuous exposure raises baseline GH and IGF-1 but blunts the body’s natural pulsatile pattern.',
      'Compared to sermorelin / no-DAC — the same GHRH(1-29) backbone, but the DAC converts a minutes-long pulse into multi-day elevation.',
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
      'Selective GH release — characterized as the first GHRP to release GH without meaningfully raising ACTH, cortisol, or prolactin (Raun et al., 1998).',
      'GHRH synergy — commonly studied alongside GHRH analogs (CJC-1295 / sermorelin) for amplified, pulse-preserving release.',
      'Compared to hexarelin — trades raw potency for selectivity: hexarelin releases more GH per dose but recruits cortisol / prolactin and desensitizes the receptor faster.',
      'Lower desensitization — its clean receptor profile is studied as more sustainable over repeated exposure.',
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
      'GHRH-receptor agonism — binds GHRHR on pituitary somatotrophs, activating adenylyl cyclase / cAMP to drive endogenous GH synthesis and release.',
      'Physiologic pulsatility — the short half-life is a design feature, producing a discrete GH pulse that preserves somatostatin negative feedback rather than sustained elevation.',
      'GH-axis evaluation — historically used to test pituitary GH reserve; a former approved use in pediatric GH deficiency, since discontinued.',
      'Compared to CJC-1295 — the same GHRH(1-29) backbone; CJC-1295 stabilizes and (with DAC) extends it for multi-day action, trading pulsatility for duration.',
      'Discontinued commercially — referenced today as a research compound.',
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
      'Potent GH release — among the strongest GHRP secretagogues; at equivalent doses releases more GH than GHRP-2, GHRP-6, or ipamorelin.',
      'Cardioprotection — CD36-mediated effects studied in preclinical cardiac models, independent of GH release.',
      'Compared to ipamorelin — more potent but less selective: hexarelin can elevate cortisol and prolactin where ipamorelin does not.',
      'Receptor desensitization — its broader, stronger activation shows greater tolerance / desensitization with sustained exposure.',
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
    slug: 'ghrp-2',
    name: 'GHRP-2',
    aliases: ['Pralmorelin', 'KP-102', 'GPA-748'],
    categories: ['growth-hormone'],
    shortDescription:
      'Second-generation synthetic GHRP; a potent ghrelin-receptor agonist approved in Japan as a diagnostic for GH deficiency.',
    description:
      'GHRP-2 (pralmorelin) is a synthetic hexapeptide growth-hormone secretagogue that activates the GHS-R1a (ghrelin) receptor on pituitary somatotrophs. More potent than its predecessor GHRP-6, it is one of the very few GHRPs to reach regulatory approval anywhere — used in Japan as a single-injection diagnostic test of pituitary GH reserve.',
    mechanism: 'GHS-R1a (ghrelin receptor) agonism → pulsatile GH release.',
    researchAreas: ['GH secretion studies', 'GH-deficiency diagnostics', 'Pituitary function'],
    background: [
      'GHRP-2 is a second-generation growth-hormone-releasing peptide, developed after GHRP-6 as researchers tuned the original hexapeptide for greater potency. Like the rest of the family it activates the ghrelin receptor (GHS-R1a) on pituitary somatotrophs, driving a discrete pulse of endogenous growth hormone rather than supplying GH directly.',
      'It occupies an unusual place among research GHRPs: it is actually an approved drug in Japan (as pralmorelin), where a single injection is used to test whether the pituitary can release GH — a diagnostic for growth-hormone deficiency. It is not FDA-approved in the United States. Compared with GHRP-6 it releases more GH per dose and provokes noticeably less of GHRP-6’s hallmark hunger, though it is less selective than ipamorelin and can transiently raise cortisol and prolactin.',
    ],
    keyResearch: [
      'Potent GH release — a second-generation GHRP engineered from GHRP-6 for greater potency; releases GH via GHS-R1a with a stronger response per dose.',
      'Approved diagnostic (Japan) — marketed as pralmorelin for a single-injection test of pituitary GH reserve; one of the very few GHRPs approved anywhere.',
      'Less appetite than GHRP-6 — retains ghrelin-receptor agonism but with markedly less of the acute hunger GHRP-6 is known for.',
      'Cortisol / prolactin — less selective than ipamorelin: at higher doses it can transiently raise ACTH, cortisol, and prolactin.',
      'Not FDA-approved — a research compound in the US; commonly studied alongside a GHRH analog (CJC-1295 / sermorelin) for complementary, pulse-preserving release.',
    ],
    faqs: [
      {
        q: 'What is GHRP-2?',
        a: 'GHRP-2 (pralmorelin) is a synthetic hexapeptide that stimulates the pituitary to release growth hormone by activating the ghrelin receptor. In Japan it is an approved diagnostic for GH deficiency.',
      },
      {
        q: 'How is GHRP-2 different from GHRP-6?',
        a: 'GHRP-2 is the more potent, more refined successor: it releases more GH per dose and causes much less of the sharp hunger GHRP-6 is known for.',
      },
      {
        q: 'How does it compare with ipamorelin?',
        a: 'Both are GHRPs, but ipamorelin is prized for releasing GH with minimal cortisol or prolactin; GHRP-2 is more potent yet less selective.',
      },
      {
        q: 'Is GHRP-2 FDA-approved?',
        a: 'No. It is approved in Japan as a diagnostic (pralmorelin) but is not FDA-approved; in the US it is a research compound. This page is a research and educational reference.',
      },
    ],
    sequence: 'D-Ala-D-2-Nal-Ala-Trp-D-Phe-Lys-NH2',
    molecularWeight: 817.99,
    molecularFormula: 'C45H55N9O6',
    cas: '158861-67-7',
    pubchemCid: 6918245,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ghrp-6',
    name: 'GHRP-6',
    aliases: ['Growth Hormone Releasing Peptide-6', 'Growth hormone-releasing hexapeptide', 'GHRP'],
    categories: ['growth-hormone'],
    shortDescription:
      'The original growth-hormone-releasing peptide — the tool compound that led scientists to the ghrelin receptor and, ultimately, to ghrelin itself.',
    description:
      'GHRP-6 is the first-generation growth-hormone-releasing peptide and the historical starting point of the entire GHRP field. A synthetic hexapeptide that activates the GHS-R1a (ghrelin) receptor, it is pivotal beyond its own effects: the hunt for the receptor GHRP-6 bound led to the 1996 cloning of the GH-secretagogue receptor and, in 1999, to the discovery of its natural ligand, ghrelin.',
    mechanism: 'GHS-R1a (ghrelin receptor) agonism → GH release and appetite stimulation.',
    researchAreas: ['GH secretion studies', 'Ghrelin-receptor biology', 'Appetite regulation'],
    background: [
      'GHRP-6 is where the story of this whole class begins. Grown out of Cyril Bowers’ work on enkephalin-derived peptides, it was among the first peptides shown to release growth hormone through a receptor entirely separate from GHRH. That receptor was an orphan — no one knew its natural ligand — and GHRP-6 became the pharmacological probe used to find it.',
      'The payoff was foundational: in 1996 the GH-secretagogue receptor (GHS-R1a) was cloned, and in 1999 its endogenous ligand, the stomach hormone ghrelin, was identified — reframing GHRP-6 in hindsight as a synthetic mimic of a hormone that had not yet been discovered. Pharmacologically, GHRP-6’s other signature is appetite: it is the GHRP most associated with a sharp, ghrelin-like spike in hunger, which itself became a research tool for probing feeding circuits. It is not FDA-approved.',
    ],
    keyResearch: [
      'Discovery tool — the probe compound whose target hunt led to cloning the GH-secretagogue receptor (GHS-R1a, 1996) and identifying ghrelin (1999).',
      'GH release via a non-GHRH pathway — helped establish that a peptide could release GH through a receptor separate from the GHRH receptor.',
      'Appetite stimulation — the GHRP most strongly associated with acute, ghrelin-like hunger; used to study feeding and energy-balance circuits.',
      'Compared to GHRP-2 / ipamorelin — the original and least selective of the family; newer GHRPs were engineered from it for more GH per dose (GHRP-2) or fewer off-target effects (ipamorelin).',
      'Not FDA-approved — a research compound; often studied with a GHRH analog for complementary release.',
    ],
    faqs: [
      {
        q: 'What is GHRP-6?',
        a: 'GHRP-6 is the first growth-hormone-releasing peptide — a synthetic hexapeptide that releases GH by activating the ghrelin receptor, and the compound whose study led to the discovery of that receptor and of ghrelin itself.',
      },
      {
        q: 'Why is GHRP-6 historically important?',
        a: 'It was the pharmacological probe used to identify the GH-secretagogue receptor (cloned 1996) and its natural hormone, ghrelin (1999) — making it foundational to a whole area of endocrinology.',
      },
      {
        q: 'Why does GHRP-6 cause hunger?',
        a: 'It activates the ghrelin receptor, and ghrelin is the body’s hunger signal; GHRP-6 is the GHRP most associated with a sharp increase in appetite.',
      },
      {
        q: 'How does it compare with GHRP-2 and ipamorelin?',
        a: 'GHRP-6 is the original and least selective; GHRP-2 was tuned for more potency and less hunger, and ipamorelin for GH release with minimal cortisol or prolactin.',
      },
      {
        q: 'Is GHRP-6 approved?',
        a: 'No — it is a research compound. This page is a research and educational reference.',
      },
    ],
    sequence: 'His-D-Trp-Ala-Trp-D-Phe-Lys-NH2',
    molecularWeight: 873.04,
    molecularFormula: 'C46H56N12O6',
    cas: '87616-84-0',
    pubchemCid: 4345065,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'mk-677',
    name: 'MK-677',
    aliases: ['Ibutamoren', 'Ibutamoren mesylate', 'MK-0677', 'L-163,191'],
    categories: ['growth-hormone'],
    shortDescription:
      'An orally active, non-peptide ghrelin-receptor agonist and growth-hormone secretagogue — a small molecule catalogued alongside the GH peptides.',
    description:
      'MK-677 (ibutamoren) is a small molecule — not a peptide — that mimics ghrelin at the GHS-R1a receptor to raise growth hormone and IGF-1. Its defining feature is that it works by mouth and lasts about a day, where the peptide GH secretagogues must be injected — which is why it is almost always catalogued alongside them despite belonging to a different chemical class.',
    mechanism: 'Oral GHS-R1a (ghrelin receptor) agonism → sustained increase in GH and IGF-1.',
    researchAreas: ['GH/IGF-1 axis', 'Body composition', 'Bone density', 'Sleep'],
    background: [
      'MK-677 is the odd one out among growth-hormone secretagogues: chemically it is a non-peptide small molecule (a spiroindoline built for oral activity), yet functionally it does the same job as the GHRP peptides — it activates the ghrelin receptor to release growth hormone. It was developed by Merck in the 1990s in the search for an orally available GH secretagogue, and it succeeded where peptides could not: a single oral dose raises GH and IGF-1 for roughly 24 hours.',
      'That practicality is exactly why it sits in this catalog next to the peptide secretagogues — researchers treat them as interchangeable tools even though MK-677 is not a peptide. It has been studied in humans for body composition, bone density, and sleep, and reached late-stage trials (for example in older adults and for hip-fracture recovery) without gaining approval. It is a research compound, not FDA-approved, and prohibited in sport.',
    ],
    keyResearch: [
      'Oral GH secretagogue — a non-peptide ghrelin-receptor agonist active by mouth, raising GH and IGF-1 for about 24 hours per dose.',
      'Body composition — studied in humans for lean-mass and metabolic effects via sustained GH / IGF-1 elevation.',
      'Bone & sleep — examined for bone-density and slow-wave-sleep effects in clinical research.',
      'Not a peptide — a small molecule catalogued alongside the peptide secretagogues (ipamorelin, GHRP-2 / GHRP-6) for its shared mechanism.',
      'Preclinical / prohibited in sport — reached late-stage trials without approval; WADA-banned; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is MK-677?',
        a: 'MK-677 (ibutamoren) is an orally active, non-peptide ghrelin-receptor agonist that raises growth hormone and IGF-1 — a small molecule that does the same job as the injectable GHRP peptides.',
      },
      {
        q: 'Is MK-677 a peptide?',
        a: 'No. It is a small molecule, not a peptide, but it is catalogued alongside the peptide GH secretagogues because it shares their ghrelin-receptor mechanism and is used the same way.',
      },
      {
        q: 'How is it different from GHRP-2 or ipamorelin?',
        a: 'It hits the same receptor, but it is orally active and long-lasting (about 24 hours), whereas the GHRP peptides are injected and act in short pulses.',
      },
      {
        q: 'Is MK-677 approved?',
        a: 'No — it reached late-stage trials but was never approved, and it is prohibited in sport. This page is a research and educational reference.',
      },
    ],
    molecularWeight: 528.67,
    molecularFormula: 'C27H36N4O5S',
    cas: '159634-47-6',
    pubchemCid: 178024,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'myostatin',
    name: 'Myostatin (GDF-8)',
    aliases: ['GDF-8', 'Growth differentiation factor 8', 'MSTN'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'The body’s brake on muscle growth — a TGF-β-family growth factor whose inhibition is the leading strategy to preserve muscle, including during GLP-1 weight loss.',
    description:
      'Myostatin (GDF-8) is the molecule that limits how much muscle you build. A member of the TGF-β superfamily, it is a negative regulator of skeletal-muscle mass: secreted by muscle itself, it signals muscle to stop growing. That makes myostatin unusual in this catalog — the therapeutic interest is almost entirely in blocking it, not supplying it — and it has become a forward-looking target precisely because the GLP-1 era exposed a problem myostatin inhibition could solve.',
    mechanism:
      'Synthesized as a precursor and processed to a disulfide-linked dimer that signals through the activin type II receptors (ActRIIB) and the Smad2/3 pathway to suppress muscle-fiber growth. Removing or blocking myostatin releases that brake, increasing muscle mass; follistatin is a natural antagonist of this signal.',
    researchAreas: [
      'Muscle growth',
      'Body composition',
      'Sarcopenia',
      'Muscular dystrophy',
      'GLP-1 muscle preservation',
    ],
    background: [
      'Myostatin is best understood by what happens when it is missing. Cattle breeds with loss-of-function mutations — the "double-muscled" Belgian Blue — are dramatically more muscular; so are myostatin-null mice, a strain of "bully whippets," and, in a well-documented 2004 case, a human child with a myostatin mutation born unusually strong. The lesson is consistent across species: myostatin is a brake, and releasing it builds muscle. That is why the drug development around it aims to inhibit the pathway — with antibodies, ligand traps, and receptor blockers — rather than administer the growth factor.',
      'The clinical targets were originally the diseases of muscle loss: muscular dystrophies, sarcopenia (age-related muscle wasting), and cachexia. Results have been mixed — blocking myostatin reliably adds muscle mass, but translating that into durable strength and function has proven harder — which is the honest state of the field.',
      'The forward-looking turn is metabolic. The GLP-1 and dual/triple-agonist drugs produce large weight loss, but a substantial fraction of that loss is lean muscle, not just fat — a growing concern about the *quality* of weight loss as these drugs scale. Myostatin-pathway inhibition is the leading strategy to preserve or build muscle alongside that fat loss, and combinations of incretin agonists with muscle-sparing agents are an active frontier. This is the real "next chapter" beyond first-generation GLP-1 fat loss: not just losing weight, but keeping the muscle.',
      'It is also a doping and hype target — "myostatin blockers" are marketed well ahead of the evidence, and the pathway is banned in sport. As a reference entry, myostatin is the target and the science; specific inhibitor drugs are described as research and investigational, not endorsements.',
    ],
    keyResearch: [
      'Negative regulator of muscle — loss of myostatin (cattle, mice, dogs, a human case) produces dramatic muscle overgrowth.',
      'Inhibition as the therapeutic angle — antibodies, ligand traps, and receptor blockers aim to release the brake, not supply the factor.',
      'Muscle-wasting disease — studied in muscular dystrophy, sarcopenia, and cachexia; mass gains are more reliable than functional gains so far.',
      'GLP-1 muscle preservation — a leading strategy to counter the lean-mass loss that accompanies incretin-driven weight loss (the forward-looking use).',
      'ActRIIB/Smad signaling — myostatin acts through activin receptors; follistatin is its natural antagonist.',
      'Not an approved drug — no myostatin-targeting therapy is broadly approved; agents remain investigational.',
    ],
    faqs: [
      {
        q: 'What is myostatin?',
        a: 'Myostatin (GDF-8) is a TGF-β-family growth factor that limits skeletal-muscle growth — the body’s brake on muscle mass. Most therapeutic interest is in blocking it to increase muscle, not in administering it.',
      },
      {
        q: 'Why is myostatin relevant to GLP-1 weight loss?',
        a: 'GLP-1 and related drugs cause large weight loss that includes significant muscle, not just fat. Inhibiting the myostatin pathway is the leading approach to preserve muscle during that weight loss — a major forward-looking direction.',
      },
      {
        q: 'Do myostatin blockers work?',
        a: 'Blocking myostatin reliably increases muscle mass in studies, but translating that into lasting strength and function has been inconsistent. No myostatin-targeting drug is broadly approved; they remain investigational.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Myostatin-targeting agents are investigational and, as a pathway, are banned in sport.',
      },
    ],
    molecularWeight: 12400,
    uniprotId: 'O14793',
    fdaApproved: false,
    storage:
      'As a research protein, recombinant myostatin/GDF-8 is handled like other growth factors — stored frozen as lyophilized powder, kept cold and protected from repeated freeze–thaw once reconstituted.',
    handling:
      'A disulfide-linked dimeric protein sensitive to heat, repeated freeze–thaw, and agitation, any of which can disrupt the dimer and reduce activity.',
    synthesisNotes:
      'Myostatin is a processed, disulfide-linked dimer of the TGF-β superfamily — not a solid-phase synthetic peptide. Its mature monomer is ~12.4 kDa and the active form is a ~25 kDa dimer; because it is produced and processed in cells (and is studied as a target rather than supplied as a drug), it has no single small-molecule formula. Most therapeutics in this space are antibodies or engineered receptor traps, which are biologic-grade products in their own right.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'follistatin',
    name: 'Follistatin',
    aliases: ['FST', 'FS-288', 'FS-315', 'follistatin-344'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'A natural myostatin and activin antagonist — by neutralizing the muscle brake it is one of the most potent pro-muscle factors studied, and a doping and gene-therapy flashpoint.',
    description:
      'Follistatin is the body’s own counterweight to myostatin. It is a secreted glycoprotein that binds and neutralizes TGF-β-superfamily ligands — most importantly myostatin and activin — and by mopping up the signals that restrain muscle, it becomes one of the most powerful pro-muscle factors in the research literature. If myostatin is the brake on muscle growth, follistatin takes the foot off it.',
    mechanism:
      'Binds activin and myostatin with high affinity and sequesters them from their receptors, blocking the ActRIIB/Smad2/3 signaling that suppresses muscle growth. The net effect is disinhibition of muscle-fiber growth, studied as both a protein and a gene-therapy payload.',
    researchAreas: [
      'Muscle growth',
      'Muscular dystrophy',
      'Sarcopenia',
      'Body composition',
      'GLP-1 muscle preservation',
    ],
    background: [
      'Follistatin exists in the body precisely to oppose the activin/myostatin axis, and overexpressing it produces some of the most striking muscle-growth phenotypes in animal research — larger gains than knocking out myostatin alone, because follistatin blocks multiple inhibitory ligands at once. It occurs in several isoforms (the FS-288 and FS-315 forms differ in how tightly they bind to cell surfaces and heparan sulfate), and as a secreted glycoprotein it is a true biologic, not a synthetic peptide.',
      'Most of the serious work on follistatin has been as gene therapy: delivering a follistatin gene (often the FS-344 construct) to muscle has shown durable muscle growth in models and has been explored in early human trials for muscular dystrophies and inclusion-body myositis. That gene-therapy route — rather than injecting the protein — reflects both follistatin’s short half-life and the goal of sustained local expression.',
      'It shares the forward-looking metabolic angle with myostatin: as GLP-1-class drugs drive large weight loss that includes muscle, follistatin-based and myostatin-antagonist approaches are part of the strategy to protect lean mass and improve the *quality* of that weight loss. It is, equally, a doping and hype target — "follistatin" products are marketed far beyond the evidence, and the pathway is banned in sport.',
      'For a reference, follistatin is best framed honestly: a genuinely potent muscle-growth regulator with real promise in muscle-wasting disease and a real frontier role alongside metabolic drugs — but one whose most credible results come from gene therapy in research settings, not from the supplements and injectables sold under its name.',
    ],
    keyResearch: [
      'Potent muscle growth — neutralizing activin and myostatin disinhibits muscle, often exceeding myostatin knockout alone.',
      'Gene therapy — follistatin (FS-344) gene delivery has shown durable muscle growth in models and early human dystrophy/myositis trials.',
      'Muscle-wasting disease — studied across muscular dystrophies, sarcopenia, and cachexia.',
      'GLP-1 muscle preservation — part of the forward-looking strategy to protect lean mass during incretin-driven weight loss.',
      'Multiple isoforms — FS-288 vs FS-315 differ in cell-surface binding and bioavailability.',
      'Doping/hype caution — banned in sport; marketed products run well ahead of the evidence.',
    ],
    faqs: [
      {
        q: 'What is follistatin?',
        a: 'A secreted glycoprotein that binds and neutralizes myostatin and activin, removing the brakes on muscle growth. It is one of the most potent pro-muscle factors in research, studied mainly as a gene therapy.',
      },
      {
        q: 'How is follistatin different from myostatin?',
        a: 'Myostatin restrains muscle growth; follistatin blocks myostatin (and activin), so it does the opposite. Follistatin can exceed the muscle gains of removing myostatin alone because it neutralizes several inhibitory signals.',
      },
      {
        q: 'Does follistatin build muscle in humans?',
        a: 'The most credible results come from follistatin gene therapy in research and early trials, not from injectable proteins or supplements sold as "follistatin," which run ahead of the evidence. No follistatin therapy is broadly approved.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Follistatin-based approaches are investigational and the pathway is banned in sport.',
      },
    ],
    molecularWeight: 34000,
    uniprotId: 'P19883',
    fdaApproved: false,
    storage:
      'Recombinant follistatin is handled as a research glycoprotein — stored frozen as lyophilized powder, kept cold and protected from repeated freeze–thaw after reconstitution.',
    handling:
      'A glycosylated protein sensitive to heat, freeze–thaw, and agitation, which can aggregate it and reduce activity.',
    synthesisNotes:
      'Follistatin is a secreted glycoprotein (isoforms ~31–38 kDa with glycosylation), produced recombinantly in eukaryotic cells rather than by solid-phase synthesis; its mass varies with isoform and glycosylation, so it has no single molecular formula. Much of the credible therapeutic work uses follistatin gene delivery, characterized as a gene-therapy product, with the expressed protein verified by glycoprotein-grade analytics.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'apitegromab',
    unlisted: true, // hidden from catalog browse (antibody, SMA-focused); kept in data/sitemap/search
    name: 'Apitegromab',
    aliases: ['SRK-015', 'SRK-439'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'A monoclonal antibody that selectively blocks pro/latent myostatin — the muscle brake — studied to preserve lean mass during GLP-1 weight loss.',
    description:
      'Apitegromab is a fully human monoclonal antibody (Scholar Rock) and the first of the anti-myostatin biologics in this catalog. Where myostatin is the growth factor that brakes muscle and follistatin is the body’s natural antagonist, apitegromab is an engineered antagonist: an antibody that binds the inactive precursor forms of myostatin (pro- and latent myostatin) and prevents their activation. Its selectivity for those precursors — rather than mature myostatin or the related GDF11/activins — is its defining design feature.',
    mechanism:
      'Binds pro-myostatin and latent myostatin, blocking the proteolytic activation that releases mature, active myostatin. Lowering active myostatin disinhibits muscle growth via the ActRIIB/Smad pathway.',
    researchAreas: ['Spinal muscular atrophy', 'Muscle preservation', 'GLP-1 muscle preservation', 'Body composition'],
    background: [
      'Apitegromab’s lead program is in spinal muscular atrophy (SMA), where it is added on top of SMN-targeted therapy to build motor-relevant muscle. The same mechanism underlies its forward-looking metabolic use: in the Phase 2 EMBRAZE study, adding apitegromab to tirzepatide preserved lean mass during weight loss compared with tirzepatide alone, and its precursor-selectivity was framed as a potential tolerability advantage over broader myostatin/activin blockers.',
      'As a biologic it sits a full step beyond the protein hormones elsewhere in this catalog: it is an antibody (~150 kDa), produced in mammalian cells, designed to deplete a specific target. It is investigational — not an approved drug — and is included here as the antibody arm of the myostatin axis that myostatin and follistatin introduce.',
    ],
    keyResearch: [
      'Precursor-selective — binds pro/latent myostatin rather than mature myostatin or GDF11/activins, the basis of its selectivity claim.',
      'SMA — the lead clinical program, building muscle on top of SMN-directed therapy.',
      'GLP-1 muscle preservation — Phase 2 EMBRAZE preserved lean mass when added to tirzepatide.',
      'Antibody biologic — a ~150 kDa monoclonal antibody, the far end of the biologic spectrum from synthetic peptides.',
      'Investigational — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is apitegromab?',
        a: 'A monoclonal antibody that selectively blocks the precursor forms of myostatin, the growth factor that limits muscle. It is studied in spinal muscular atrophy and, in combination with GLP-1/GIP drugs, to preserve muscle during weight loss.',
      },
      {
        q: 'How is it different from blocking mature myostatin?',
        a: 'Apitegromab targets pro- and latent (inactive) myostatin before it is activated, rather than the mature protein — a selectivity intended to avoid hitting related factors and improve tolerability.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Apitegromab is an investigational antibody, not an approved drug.',
      },
    ],
    molecularWeight: 150000,
    fdaApproved: false,
    storage:
      'Monoclonal antibodies are stored refrigerated (2–8 °C), protected from light and freezing, and never shaken. Investigational handling follows the trial protocol.',
    handling:
      'A large folded, glycosylated antibody — sensitive to freezing, heat, and agitation, which can aggregate it. Aggregation is an immunogenicity concern.',
    synthesisNotes:
      'Apitegromab is a recombinant monoclonal antibody (~150 kDa) produced in mammalian cell culture — the most complex biologic class in this catalog, far removed from solid-phase peptide synthesis. Characterization is antibody-grade: glycan and charge-variant profiling, identity by mass spectrometry, and target-binding/cell-based potency, with host-cell-protein and endotoxin limits.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'trevogrumab',
    name: 'Trevogrumab',
    aliases: ['REGN1033'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'An anti-myostatin antibody (Regeneron) now studied in obesity combinations to cut lean-mass loss and deepen fat loss alongside semaglutide.',
    description:
      'Trevogrumab is a monoclonal antibody from Regeneron that neutralizes mature myostatin. After an earlier life in sarcopenia research, it has re-emerged squarely in the GLP-1 era: as a muscle-sparing add-on to incretin weight-loss drugs, and as one leg of a triple combination designed to maximize fat loss while protecting muscle.',
    mechanism:
      'Binds and neutralizes mature myostatin (GDF-8), removing its brake on muscle growth via the ActRIIB/Smad pathway. Used to offset the lean-mass loss that accompanies large GLP-1-driven weight loss.',
    researchAreas: ['Obesity', 'Muscle preservation', 'GLP-1 muscle preservation', 'Body composition'],
    background: [
      'Trevogrumab is the clearest worked example of the muscle-preservation thesis. In trial data, semaglutide alone reduced both fat (~−15.7%) and lean mass (~−6.5%); adding trevogrumab roughly halved the lean-mass loss (to ~−3.3 to −3.8%) while increasing fat loss (up to ~−19.1%). The triple combination of semaglutide + trevogrumab + garetosmab (an anti-activin-A antibody) produced the most favorable body-composition profile of all — heavy fat loss with minimal lean loss — and is being tested in the COURAGE program expected to read out in late 2026.',
      'It is a monoclonal antibody (~150 kDa) and an investigational agent. Its inclusion rounds out the myostatin axis with a mature-myostatin neutralizer, complementing apitegromab’s precursor-selective approach.',
    ],
    keyResearch: [
      'GLP-1 muscle preservation — roughly halved semaglutide-associated lean-mass loss while deepening fat loss in trial data.',
      'Triple combination — semaglutide + trevogrumab + garetosmab gave the best body-composition profile; COURAGE trial expected to complete late 2026.',
      'Mature-myostatin neutralizer — binds active myostatin, complementing precursor-selective antibodies.',
      'Sarcopenia origins — earlier studied for age-related muscle loss before the obesity pivot.',
      'Investigational — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is trevogrumab?',
        a: 'A Regeneron monoclonal antibody that neutralizes myostatin, studied as a muscle-sparing add-on to GLP-1 weight-loss drugs and in a triple combination with semaglutide and garetosmab.',
      },
      {
        q: 'What does adding it to semaglutide do?',
        a: 'In trial data it roughly halved the lean-mass loss seen with semaglutide alone while increasing fat loss — the core "quality of weight loss" idea.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Trevogrumab is an investigational antibody, not an approved drug.',
      },
    ],
    molecularWeight: 150000,
    fdaApproved: false,
    storage:
      'Stored refrigerated (2–8 °C), protected from light and freezing, not shaken; investigational handling per trial protocol.',
    handling:
      'A large glycosylated antibody sensitive to freezing, heat, and agitation, which can cause aggregation.',
    synthesisNotes:
      'Trevogrumab is a recombinant monoclonal antibody (~150 kDa) made in mammalian cell culture, characterized with antibody-grade analytics (glycan/charge-variant profiling, mass spectrometry, binding/potency bioassay) — not a synthetic peptide.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'emugrobart',
    unlisted: true, // hidden from catalog browse (antibody, indications discontinued); kept in data/sitemap/search
    name: 'Emugrobart',
    aliases: ['GYM-329', 'RG6237', 'RG-70240'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'A "sweeping" anti-myostatin antibody (Roche/Chugai) that not only blocks but actively clears myostatin — a cautionary case after its rare-disease trials failed.',
    description:
      'Emugrobart is a humanized IgG1 monoclonal antibody developed by Chugai and Roche, and it is the most mechanistically distinctive entry on the myostatin axis. Beyond binding pro- and latent myostatin to block their activation, it uses a "sweeping antibody" design: pH-dependent binding that ferries captured myostatin into cells for degradation and then releases it, recycling the antibody to capture more. The intent is not just to block myostatin but to actively lower its levels.',
    mechanism:
      'Binds pro/latent myostatin to prevent activation, and via pH-dependent (recycling/sweeping) engineering accelerates clearance of bound myostatin — reducing the circulating pool rather than only neutralizing it in place.',
    researchAreas: ['Spinal muscular atrophy', 'FSHD', 'Obesity', 'Muscle preservation'],
    background: [
      'Emugrobart is also the catalog’s clearest honest-evidence cautionary tale. Its lead muscular-disease programs failed: in March 2026, Roche/Genentech discontinued development in spinal muscular atrophy (SMA) and facioscapulohumeral muscular dystrophy (FSHD) after the MANATEE trial showed no consistent benefit over risdiplam monotherapy. Notably, the company stated that the scientific rationale in obesity remained, and the Phase 2 obesity program was set to continue.',
      'That split — a failed rare-disease readout but a continuing metabolic program — is exactly the kind of nuance a credible reference should carry, against the marketing that treats every "myostatin antibody" as a guaranteed muscle-builder. Emugrobart is an investigational antibody (~150 kDa); its sweeping-clearance design is its scientific signature.',
    ],
    keyResearch: [
      'Sweeping/recycling design — pH-dependent binding actively clears myostatin rather than only blocking it.',
      'MANATEE failure — discontinued in SMA and FSHD (March 2026) after no consistent benefit over risdiplam.',
      'Obesity program continued — the metabolic rationale was retained even as rare-disease use was dropped.',
      'Pro/latent myostatin target — binds the inactive precursor forms.',
      'Investigational — not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is emugrobart?',
        a: 'A Roche/Chugai anti-myostatin antibody (GYM-329) with a "sweeping" design that actively clears myostatin. It was studied in muscular diseases and obesity.',
      },
      {
        q: 'What happened in its trials?',
        a: 'Its spinal muscular atrophy and FSHD programs were discontinued in March 2026 after the MANATEE trial showed no consistent benefit over standard therapy; the obesity program was reported to be continuing.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Emugrobart is an investigational antibody, not an approved drug.',
      },
    ],
    molecularWeight: 150000,
    fdaApproved: false,
    storage:
      'Stored refrigerated (2–8 °C), protected from light and freezing, not shaken; investigational handling per trial protocol.',
    handling:
      'A large glycosylated antibody sensitive to freezing, heat, and agitation, which can cause aggregation.',
    synthesisNotes:
      'Emugrobart is a humanized IgG1 monoclonal antibody (~150 kDa) produced in mammalian cell culture, engineered for pH-dependent recycling. Characterization is antibody-grade (glycan/charge-variant profiling, mass spectrometry, binding/potency bioassay) — not a synthetic peptide.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'garetosmab',
    name: 'Garetosmab',
    aliases: ['REGN2477'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'An anti-activin-A antibody (Regeneron) — closest to approval of the axis (FOP), and a partner in obesity muscle-preservation combinations.',
    description:
      'Garetosmab is a monoclonal antibody from Regeneron that neutralizes activin A — a TGF-β-superfamily ligand that, like myostatin, signals through the activin type II receptors. Blocking activin A widens the axis beyond myostatin alone, and garetosmab plays two roles in this catalog: it is the most clinically advanced agent here, and it is the third leg of the triple obesity combination.',
    mechanism:
      'Binds and neutralizes activin A, blocking its signaling through ActRII. In bone disease this prevents activin-A-driven abnormal ossification; in the metabolic setting, adding activin-A blockade to myostatin blockade and incretin therapy further shifts body composition toward fat loss with preserved muscle.',
    researchAreas: ['Fibrodysplasia ossificans progressiva', 'Obesity', 'Body composition', 'Muscle preservation'],
    background: [
      'Garetosmab’s lead indication is fibrodysplasia ossificans progressiva (FOP) — an ultra-rare disease in which soft tissue turns to bone, driven by activin A. Its Phase 3 OPTIMA trial was positive (roughly 90–94% reduction in new heterotopic bone lesions), and its FDA Biologics License Application was accepted for Priority Review with a decision target around August 2026 — making it the closest-to-approval molecule on this axis, albeit for a rare bone disease rather than obesity.',
      'Its metabolic role is as the activin-A arm of the semaglutide + trevogrumab + garetosmab triple combination, which produced the best body-composition profile in early data. As an anti-activin-A antibody (~150 kDa), it illustrates that the "myostatin axis" is really a broader activin/ActRII network with multiple blockable nodes.',
    ],
    keyResearch: [
      'FOP — positive Phase 3 OPTIMA (~90–94% reduction in new abnormal bone lesions); the lead indication.',
      'Regulatory status — BLA accepted for FDA Priority Review (target decision ~Aug 2026), the most advanced agent on this axis.',
      'Anti-activin A — widens muscle/fat modulation beyond myostatin by blocking a related ActRII ligand.',
      'Triple combination — the activin-A leg of semaglutide + trevogrumab + garetosmab for body composition.',
      'Investigational in obesity — its metabolic use is not approved.',
    ],
    faqs: [
      {
        q: 'What is garetosmab?',
        a: 'A Regeneron monoclonal antibody that neutralizes activin A. Its lead use is the rare bone disease FOP, and it is also a component of an obesity triple-combination aimed at preserving muscle.',
      },
      {
        q: 'Why does an FOP drug appear alongside obesity compounds?',
        a: 'Activin A signals through the same ActRII receptors as myostatin. Blocking it both prevents abnormal bone formation in FOP and, combined with myostatin blockade and a GLP-1 drug, shifts weight loss toward fat while sparing muscle.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Garetosmab’s obesity use is investigational; its FOP application was under FDA review.',
      },
    ],
    molecularWeight: 150000,
    fdaApproved: false,
    storage:
      'Stored refrigerated (2–8 °C), protected from light and freezing, not shaken; investigational handling per trial protocol.',
    handling:
      'A large glycosylated antibody sensitive to freezing, heat, and agitation, which can cause aggregation.',
    synthesisNotes:
      'Garetosmab is a recombinant monoclonal antibody (~150 kDa) produced in mammalian cell culture, characterized with antibody-grade analytics (glycan/charge-variant profiling, mass spectrometry, binding/potency bioassay) — not a synthetic peptide.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'bimagrumab',
    unlisted: true, // hidden from catalog browse (antibody, obesity trial terminated); kept in data/sitemap/search
    name: 'Bimagrumab',
    aliases: ['BYM338'],
    categories: ['growth-hormone', 'metabolic'],
    shortDescription:
      'An antibody that blocks the activin type II receptor itself — shutting off myostatin AND activin signaling at once; famous for adding muscle while cutting fat.',
    description:
      'Bimagrumab is a fully human monoclonal antibody that blocks the activin type II receptors (ActRIIA/ActRIIB) — the receptor every ligand on this axis must use. By acting at the receptor rather than on a single ligand, it shuts down myostatin and activin signaling simultaneously, which is why it produces the axis’s most striking body-composition effect: in trials it has both reduced fat and increased lean mass, an unusual combination for a weight-affecting drug.',
    mechanism:
      'Binds ActRIIA/ActRIIB and prevents their natural ligands (myostatin, activins, and related factors) from signaling. Blocking the shared receptor disinhibits muscle growth broadly while reducing fat mass.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Muscle wasting', 'Body composition'],
    background: [
      'Bimagrumab’s history maps the whole field. It was developed (as BYM338, Novartis) for muscle-wasting conditions — sporadic inclusion body myositis (where its pivotal trial failed), sarcopenia, and COPD-related wasting — before a notable Phase 2 in type 2 diabetes showed it cut fat mass substantially while adding lean mass. That fat-down/muscle-up profile made it a centerpiece of the obesity muscle-preservation thesis: Versanis advanced it, and Eli Lilly acquired Versanis for roughly $2 billion in 2023 to pair it with tirzepatide.',
      'The honest update is that the path has not been smooth: a combination Phase 2 with semaglutide showed weight loss with preserved/added lean mass, but Lilly subsequently terminated a mid-stage obesity study pairing bimagrumab with its own incretin therapy. As the receptor-level blocker of the axis, bimagrumab is the broadest-acting and the most-watched — and a reminder that even the most mechanistically compelling agent has to clear real trials. It is investigational for these uses.',
    ],
    keyResearch: [
      'Receptor-level blockade — targets ActRIIA/B, blocking myostatin and activin signaling together (broadest mechanism on the axis).',
      'Fat down, muscle up — Phase 2 in type 2 diabetes reduced fat mass while increasing lean mass, an unusual profile.',
      'GLP-1 combination — bimagrumab + semaglutide preserved/added lean mass alongside weight loss in Phase 2.',
      'Commercial bet and setback — Lilly acquired Versanis (~$2B, 2023) but later terminated a mid-stage obesity combination study.',
      'Muscle-wasting origins — earlier developed for inclusion body myositis (pivotal trial failed), sarcopenia, and COPD.',
    ],
    faqs: [
      {
        q: 'What is bimagrumab?',
        a: 'A monoclonal antibody that blocks the activin type II receptor, shutting off both myostatin and activin signaling. It is notable for reducing fat while increasing muscle mass, and has been studied in obesity and type 2 diabetes.',
      },
      {
        q: 'How is it different from the myostatin antibodies?',
        a: 'The myostatin antibodies neutralize a ligand; bimagrumab blocks the shared receptor those ligands use, so it acts more broadly across the whole activin/myostatin axis.',
      },
      {
        q: 'Is bimagrumab approved for obesity?',
        a: 'No. Despite encouraging body-composition data and a major acquisition, it remains investigational, and at least one mid-stage obesity combination study was terminated.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. Bimagrumab is an investigational antibody, not an approved drug.',
      },
    ],
    molecularWeight: 150000,
    fdaApproved: false,
    storage:
      'Stored refrigerated (2–8 °C), protected from light and freezing, not shaken; investigational handling per trial protocol.',
    handling:
      'A large glycosylated antibody sensitive to freezing, heat, and agitation, which can cause aggregation.',
    synthesisNotes:
      'Bimagrumab is a fully human recombinant monoclonal antibody (~150 kDa) produced in mammalian cell culture, characterized with antibody-grade analytics (glycan/charge-variant profiling, mass spectrometry, receptor-binding/cell-based potency) — not a synthetic peptide.',
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
    slug: 'humanin',
    name: 'Humanin',
    aliases: ['HN', 'MT-RNR2 peptide'],
    categories: ['mitochondrial', 'longevity'],
    shortDescription:
      'A 24-amino-acid mitochondrial-derived peptide with cytoprotective, anti-apoptotic activity — a companion to MOTS-c on the mitochondrial-signaling frontier.',
    description:
      'Humanin was the first mitochondrial-derived peptide discovered — a 24-amino-acid peptide encoded not in the nuclear genome but within the mitochondrial 16S ribosomal RNA gene. It is cytoprotective and anti-apoptotic: it was originally identified for protecting neurons against Alzheimer’s-related toxicity, and it has since been tied to metabolic regulation and longevity, with higher levels associated with healthy aging.',
    mechanism:
      'Cytoprotective, anti-apoptotic signaling — binds and antagonizes the pro-apoptotic protein BAX and signals through a cell-surface receptor complex (CNTFR / WSX-1 / gp130); also interacts with IGFBP-3.',
    researchAreas: ['Aging biology', 'Neuroprotection', 'Metabolic regulation', 'Cytoprotection'],
    background: [
      'Humanin rewrote a small piece of the rulebook when it was found in 2001: a bioactive peptide encoded inside the mitochondrial genome, in the 16S ribosomal RNA region, rather than by nuclear DNA. It was discovered in the search for factors that protect neurons in Alzheimer’s disease — hence the name — and it turned out to be a broadly cytoprotective, anti-apoptotic signal that helps cells survive stress.',
      'It is now recognized as the founding member of the mitochondrial-derived peptides (MDPs), the same family as MOTS-c catalogued just above, and part of the larger idea that mitochondria actively signal to the rest of the body. Beyond neuroprotection, humanin has been linked to insulin sensitivity, cardiovascular protection, and longevity — circulating levels decline with age and tend to be higher in long-lived individuals. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'First mitochondrial-derived peptide — encoded within the mitochondrial 16S rRNA gene (MT-RNR2); discovered in 2001 in Alzheimer’s research.',
      'Cytoprotective / anti-apoptotic — antagonizes the pro-apoptotic protein BAX and signals via a CNTFR / WSX-1 / gp130 receptor complex.',
      'Longevity association — circulating levels decline with age and are higher in some long-lived individuals; studied in aging biology.',
      'Metabolic effects — linked to improved insulin sensitivity and cardiovascular protection in preclinical work.',
      'Companion to MOTS-c — both are mitochondrial-derived signaling peptides; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Humanin?',
        a: 'Humanin is a 24-amino-acid mitochondrial-derived peptide with cytoprotective, anti-apoptotic activity, first discovered for protecting neurons in Alzheimer’s research.',
      },
      {
        q: 'What does "mitochondrial-derived" mean?',
        a: 'Unlike most peptides, humanin is encoded within the mitochondrial genome (the 16S rRNA region), not by nuclear DNA — it was the first such peptide identified.',
      },
      {
        q: 'How does it relate to MOTS-c?',
        a: 'Both are mitochondrial-derived peptides (MDPs). Humanin is the cytoprotective, anti-apoptotic member; MOTS-c is studied more for metabolism and AMPK activation.',
      },
      {
        q: 'Is Humanin approved?',
        a: 'No — it is a research compound, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'MAPRGFSCLLLLTSEIDLPVKRRA',
    molecularWeight: 2687.2,
    molecularFormula: 'C119H204N34O32S2',
    cas: '330936-69-1',
    pubchemCid: 16131438,
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
    categories: ['longevity', 'bioregulator'],
    shortDescription: 'Synthetic tetrapeptide investigated for telomerase activity and circadian effects.',
    description:
      'Epitalon is a synthetic four-amino-acid peptide derived from the pineal peptide epithalamin. Russian-led clinical work has reported effects on melatonin secretion and lifespan endpoints in rodent models.',
    mechanism: 'Reported telomerase upregulation; pineal-axis modulation.',
    researchAreas: ['Aging biology', 'Circadian biology', 'Pineal function', 'Peptide bioregulators'],
    background: [
      'Epitalon (epithalon) is a synthetic four-amino-acid peptide modeled on epithalamin, a peptide extract of the pineal gland. It emerged from Russian gerontology research, where the pineal axis is studied as a regulator of aging and circadian rhythm.',
      'Russian-led studies have reported effects on melatonin secretion, telomerase activity, and lifespan endpoints in animal models. The evidence base is concentrated in that research tradition, independent replication is limited, and Epitalon is not FDA-approved.',
    ],
    keyResearch: [
      'Telomerase upregulation — studies report increased expression of the telomerase catalytic subunit and telomere elongation in human somatic cells (Khavinson, Bondarev & Butyugov, 2003).',
      'Replicative lifespan — the originating study extended human fetal fibroblast lifespan beyond the Hayflick limit without signs of malignant transformation.',
      'Circadian / pineal function — examined for effects on melatonin secretion via the pineal axis.',
      'Compared to other longevity peptides — a distinct mechanism: Epitalon targets telomere maintenance, where thymosin α-1 works through immune modulation and MOTS-c through mitochondrial / metabolic regulation.',
      'Evidence quality — concentrated in a single research tradition (the Khavinson group); large independent Western RCTs are not available.',
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
    slug: 'endoluten',
    name: 'Endoluten',
    aliases: ['A-3 pineal peptide', 'pineal peptide complex'],
    categories: ['longevity', 'bioregulator'],
    shortDescription:
      'The natural pineal peptide bioregulator — the animal-derived counterpart to synthetic Epitalon, marketed for aging and telomere support.',
    description:
      'Endoluten is a natural peptide complex extracted from the pineal gland, part of the Russian Cytomax line of tissue bioregulators. It is the animal-derived original that the synthetic tetrapeptide Epitalon was modeled on: where Epitalon is a single defined four-amino-acid sequence, Endoluten is a polypeptide fraction of the whole pineal extract. It is marketed within the Khavinson bioregulator tradition for aging, circadian, and telomere-related endpoints, on an evidence base concentrated in that research lineage.',
    mechanism:
      'Proposed pineal-axis and gene-regulatory (bioregulator) activity — the same tradition that reports telomerase and melatonin effects for its synthetic analog Epitalon.',
    researchAreas: ['Aging biology', 'Pineal function', 'Circadian biology', 'Peptide bioregulators'],
    background: [
      'Endoluten sits at the origin of the pineal-peptide story in this catalog. The Khavinson school of Russian gerontology began with natural peptide extracts of specific organs — the Cytomax bioregulators — and the pineal extract, sold as Endoluten, is among the most prominent, promoted for its proposed effects on aging and the body’s central clock. Its defining relationship is with Epitalon: Epitalon (Ala-Glu-Asp-Gly) is the synthetic short peptide distilled from this extract, so Endoluten is the natural, less-defined parent and Epitalon the reproducible synthetic descendant.',
      'As a tissue extract it has no single molecular formula or sequence — it is a standardized polypeptide fraction, like Thymalin. The claims made for it (telomerase activation, melatonin regulation, lifespan endpoints) come from the same concentrated research tradition that surrounds Epitalon, with limited independent Western replication. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Natural pineal bioregulator — a polypeptide extract of the pineal gland in the Cytomax line; the source material behind synthetic Epitalon.',
      'Aging & telomere claims — promoted within the Khavinson tradition for telomerase and lifespan endpoints, mirroring the Epitalon literature.',
      'Circadian / melatonin — proposed pineal-axis effects on the body’s central clock.',
      'A tissue extract — a standardized polypeptide fraction with no single formula or sequence, like Thymalin.',
      'Evidence quality — concentrated in one research lineage with limited independent replication; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Endoluten?',
        a: 'Endoluten is a natural peptide complex extracted from the pineal gland, part of the Russian Cytomax bioregulator line, marketed for aging, circadian, and telomere-related endpoints.',
      },
      {
        q: 'How is it related to Epitalon?',
        a: 'Epitalon is the synthetic four-amino-acid peptide (Ala-Glu-Asp-Gly) modeled on this pineal extract; Endoluten is the natural, less-defined parent material.',
      },
      {
        q: 'Does it have a molecular formula?',
        a: 'No — it is a tissue extract (a polypeptide fraction), like Thymalin, so it has no single sequence or molecular formula.',
      },
      {
        q: 'Is Endoluten approved?',
        a: 'No — it is a research compound, not FDA-approved, and its evidence base is concentrated in one research tradition. This page is a research and educational reference.',
      },
    ],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'foxo4-dri',
    name: 'FOXO4-DRI',
    aliases: ['Proxofim', 'FOXO4 D-Retro-Inverso peptide'],
    categories: ['longevity'],
    shortDescription:
      'A senolytic D-retro-inverso peptide that selectively triggers apoptosis in senescent cells by disrupting the FOXO4–p53 interaction.',
    description:
      'FOXO4-DRI is one of the most cited experimental senolytics — peptides designed to clear senescent ("zombie") cells that accumulate with age. It works by disrupting the interaction between the transcription factor FOXO4 and the tumor-suppressor p53, a partnership that senescent cells rely on to avoid self-destruction. Breaking it pushes p53 out of the nucleus and drives those cells into apoptosis, while sparing normal cells. It is built as a D-retro-inverso peptide — the sequence reversed and made from D-amino acids — to resist breakdown in the body.',
    mechanism:
      'Disrupts the FOXO4–p53 interaction in senescent cells, causing p53 nuclear exclusion and cell-intrinsic apoptosis (a senolytic effect); the D-retro-inverso design confers protease resistance.',
    researchAreas: ['Senescence / senolytics', 'Aging biology', 'Tissue regeneration'],
    background: [
      'FOXO4-DRI came out of a 2017 Cell paper from Peter de Keizer’s group (Baar et al., Erasmus MC) that gave the young field of senolytics one of its most striking results. Senescent cells — damaged cells that stop dividing but refuse to die, secreting inflammatory signals — build up with age and drive tissue decline. The insight was that many of them survive by using the protein FOXO4 to keep p53, the cell’s own suicide switch, sequestered and inactive.',
      'FOXO4-DRI is a decoy that occupies FOXO4’s binding site, freeing p53 to trigger apoptosis specifically in cells that depend on that leash. In aged and progeroid mice, the peptide reportedly restored fitness, fur density, and kidney function. To survive as a drug it is synthesized as a D-retro-inverso peptide — the amino-acid order reversed and every residue a mirror-image D-form — which keeps its shape and binding while making it highly resistant to proteases. It is an early-stage research compound (sometimes labeled Proxofim), not FDA-approved, with essentially no human safety data.',
    ],
    keyResearch: [
      'Senolytic mechanism — disrupts the FOXO4–p53 interaction so p53 is excluded from the nucleus, selectively driving senescent cells into apoptosis (Baar et al., Cell 2017).',
      'Preclinical rejuvenation — reported restoration of fitness, fur density, and renal function in aged and progeroid mice.',
      'D-retro-inverso design — reversed sequence built from D-amino acids for protease resistance and a long functional half-life.',
      'Selectivity — targets cells dependent on the FOXO4–p53 leash while sparing normal cells.',
      'Early-stage — not FDA-approved; human safety essentially uncharacterized.',
    ],
    faqs: [
      {
        q: 'What is FOXO4-DRI?',
        a: 'FOXO4-DRI is a senolytic peptide that selectively kills senescent cells by disrupting the FOXO4–p53 interaction, freeing p53 to trigger those cells’ apoptosis.',
      },
      {
        q: 'What does "D-retro-inverso" mean?',
        a: 'The peptide’s sequence is reversed and built from D-amino acids (mirror-image residues), which preserves its binding shape while making it highly resistant to protease breakdown.',
      },
      {
        q: 'What is a senolytic?',
        a: 'A compound that selectively removes senescent ("zombie") cells — damaged cells that stop dividing but resist death and secrete inflammatory signals associated with aging.',
      },
      {
        q: 'Is FOXO4-DRI approved?',
        a: 'No — it is an early-stage research compound with essentially no human data, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    molecularWeight: 5358.2,
    molecularFormula: 'C228H388N86O64',
    cas: '2460055-10-9',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'thymalin',
    name: 'Thymalin',
    aliases: ['Thymulin (distinct)', 'Thymus polypeptide fraction'],
    categories: ['immune', 'bioregulator'],
    shortDescription: 'Thymus-derived polypeptide complex — the founding tissue bioregulator (Cytomax) studied for immune restoration.',
    description:
      'Thymalin is a polypeptide fraction extracted from calf thymus, developed by the St. Petersburg school of bioregulation as one of the original "Cytomax" tissue bioregulators. Russian clinical work studied it for restoring T-cell function in aging and immunodeficiency.',
    mechanism: 'Reported normalization of T-lymphocyte populations and cytokine balance; tissue-specific immune regulation.',
    researchAreas: ['Immune modulation', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Thymalin is a peptide complex isolated from the thymus, introduced in the 1970s–80s as the prototype of the Cytomax class — animal-tissue peptide extracts intended to act as "bioregulators" of the organ they were drawn from. It is the historical anchor of the short-peptide bioregulator program later associated with Vladimir Khavinson.',
      'Unlike the defined short peptides that followed (Epitalon, Vesugen, Pinealon), Thymalin is a heterogeneous polypeptide fraction rather than a single synthetic sequence. Reported research framed it as restoring age- or stress-depleted thymic function. The evidence base is concentrated in Russian-language clinical literature with limited independent Western replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Immune restoration — Russian clinical studies reported normalization of T-lymphocyte subsets and immune indices in elderly and immunocompromised cohorts.',
      'Aging / healthspan — long-term observational work from the originating group reported reduced morbidity and mortality endpoints when combined with the pineal preparation epithalamin; these reports are not independently replicated.',
      'Class context — Thymalin (a tissue extract) is the conceptual parent of the later synthetic Cytogen short peptides such as Vilon (Lys-Glu), a defined dipeptide studied for the same thymic axis.',
      'Evidence quality — predominantly single-tradition, older, and often open-label; treat findings as preliminary.',
    ],
    faqs: [
      {
        q: 'What is Thymalin?',
        a: 'Thymalin is a polypeptide fraction extracted from thymus tissue, studied in Russia as an immune-restoring "bioregulator" and regarded as the founding compound of the tissue-bioregulator class.',
      },
      {
        q: 'How is it different from the short peptide bioregulators?',
        a: 'Thymalin is a tissue extract (a mix of polypeptides), whereas later bioregulators like Epitalon, Vesugen, and Pinealon are single, defined synthetic short peptides modeled on these extracts.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'The clinical literature is concentrated in a single research tradition with limited independent replication, so findings should be treated as preliminary. This page is a research and educational reference.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound and is not FDA-approved.',
      },
    ],
    cas: '86402-19-7',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'thymogen',
    name: 'Thymogen',
    aliases: ['Glutamyl-Tryptophan', 'Glu-Trp dipeptide', 'Bestim'],
    categories: ['immune', 'bioregulator'],
    shortDescription:
      'A synthetic thymic dipeptide (Glu-Trp) immunomodulator — the minimal active fragment distilled from thymus peptides.',
    description:
      'Thymogen is a synthetic dipeptide, glutamyl-tryptophan (Glu-Trp), developed in the Russian bioregulator tradition as a minimal, defined immunomodulator. It is essentially the shortest active core distilled from thymic peptide preparations like Thymalin — a two-amino-acid sequence studied for restoring and balancing immune function. It has been used in Russia, given intranasally or by injection, as an immunostimulant during infection and recovery.',
    mechanism:
      'Immunomodulatory (bioregulator) activity — proposed to normalize T-cell and broader immune-cell function, in the same thymic-peptide tradition as Thymalin and thymosin α-1.',
    researchAreas: ['Immune modulation', 'Infection recovery', 'Peptide bioregulators'],
    background: [
      'Thymogen is the dipeptide endpoint of a long reductionist thread in Russian peptide research: starting from whole thymus extracts (Thymalin), then isolating ever-shorter active fragments, investigators arrived at glutamyl-tryptophan — just two residues — as a sequence that still carried immunomodulatory activity. That makes it a companion to the other thymic peptides in this catalog: Thymalin (the extract) and thymosin α-1 (a 28-residue thymic peptide), with Thymogen as the minimal synthetic core.',
      'It has been used clinically in Russia as an immunostimulant — given intranasally or by injection to support immune function during infections and convalescence — though, like the rest of the bioregulator tradition, its evidence base is concentrated there with limited independent Western trials. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Minimal thymic peptide — glutamyl-tryptophan (Glu-Trp), the shortest active immunomodulatory core distilled from thymic peptide preparations.',
      'Immune modulation — studied for normalizing T-cell and immune-cell function, in the thymic-peptide tradition of Thymalin and thymosin α-1.',
      'Clinical use (Russia) — used as an intranasal or injectable immunostimulant for infection and recovery support.',
      'A defined dipeptide — unlike the Thymalin extract, a single two-residue synthetic sequence.',
      'Evidence quality — concentrated in one research tradition; not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Thymogen?',
        a: 'Thymogen is a synthetic dipeptide (glutamyl-tryptophan) immunomodulator — the minimal active core distilled from thymic peptides, studied for balancing immune function.',
      },
      {
        q: 'How does it relate to Thymalin?',
        a: 'Thymalin is the whole thymus peptide extract; Thymogen is the shortest active synthetic fragment (two amino acids) derived from that tradition.',
      },
      {
        q: 'What is it used for?',
        a: 'It has been used in Russia as an intranasal or injectable immunostimulant during infections and recovery; its evidence base is concentrated in that research tradition.',
      },
      {
        q: 'Is Thymogen approved?',
        a: 'No — it is a research compound, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'Glu-Trp',
    molecularWeight: 333.34,
    molecularFormula: 'C16H19N3O5',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'vilon',
    name: 'Vilon',
    aliases: ['Lys-Glu', 'KE dipeptide'],
    categories: ['immune', 'bioregulator', 'longevity'],
    shortDescription: 'Synthetic Lys-Glu dipeptide — the defined short-peptide successor to Thymalin, studied for immune and aging endpoints.',
    description:
      'Vilon is a synthetic dipeptide (Lys-Glu) developed as a defined-sequence "Cytogen" successor to the thymic extract Thymalin. Russian research studied it as a tissue bioregulator of immune function and an aging-axis peptide.',
    mechanism: 'Proposed direct gene-regulatory binding (short peptide–DNA interaction) modulating immune-related gene expression.',
    researchAreas: ['Immune modulation', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Vilon is one of the simplest members of the Khavinson short-peptide bioregulator class — a two–amino-acid sequence (Lys-Glu) intended to reproduce, in a defined synthetic form, the immune-regulating activity attributed to the thymic extract Thymalin.',
      'The class hypothesis is that such short peptides penetrate the cell and bind specific promoter regions of DNA, modulating transcription in a tissue-selective way. Reported studies examined effects on immune indices, chromatin activation, and lifespan in model organisms. As with the rest of the class, the literature is concentrated in one research tradition and lacks large independent trials; it is not FDA-approved.',
    ],
    keyResearch: [
      'Gene-regulatory hypothesis — the originating group reported that Lys-Glu can interact with DNA and de-condense heterochromatin, proposed as the basis for transcriptional activation of age-silenced genes.',
      'Immune indices — studied for normalization of immune and interferon parameters in aged animal models.',
      'Lifespan models — reported increases in mean lifespan in rodents in originating-group studies; not independently replicated.',
      'Evidence quality — single-tradition, mostly preclinical; findings are preliminary.',
    ],
    faqs: [
      {
        q: 'What is Vilon?',
        a: 'Vilon is a synthetic Lys-Glu dipeptide studied in Russia as a defined-sequence immune and aging bioregulator — the short-peptide successor to the thymic extract Thymalin.',
      },
      {
        q: 'How is it thought to work?',
        a: 'The class hypothesis is that the short peptide enters the cell and binds specific DNA promoter regions, modulating gene expression in a tissue-selective way. This mechanism is proposed, not firmly established.',
      },
      {
        q: 'Is the evidence strong?',
        a: 'No — it is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'KE',
    molecularWeight: 275.3,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'vesugen',
    name: 'Vesugen',
    aliases: ['Lys-Glu-Asp', 'KED tripeptide'],
    categories: ['bioregulator', 'longevity'],
    shortDescription: 'Synthetic Lys-Glu-Asp tripeptide studied as a vascular-axis bioregulator.',
    description:
      'Vesugen is a synthetic tripeptide (Lys-Glu-Asp) in the Khavinson short-peptide bioregulator series, studied for tissue-specific effects on the vascular wall and endothelium.',
    mechanism: 'Proposed gene-regulatory modulation of vascular/endothelial gene expression.',
    researchAreas: ['Vascular biology', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Vesugen (Lys-Glu-Asp) is the vascular-targeted member of the defined short-peptide bioregulator family. Each peptide in the series is associated with a specific tissue; Vesugen is framed around the blood-vessel wall and endothelial function.',
      'Reported research examined endothelial markers and vascular-tone regulation in cell and animal models, consistent with the class hypothesis of tissue-selective transcriptional modulation. Evidence is concentrated in the originating research tradition, independent replication is limited, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Vascular focus — studied for effects on endothelial cell function and markers of vascular regulation in preclinical models.',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression, the shared hypothesis across the Vesugen/Pinealon/Cardiogen series.',
      'Evidence quality — single-tradition and largely preclinical; treat as preliminary.',
    ],
    faqs: [
      {
        q: 'What is Vesugen?',
        a: 'Vesugen is a synthetic Lys-Glu-Asp tripeptide studied as a vascular-axis bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What tissue is it associated with?',
        a: 'The blood-vessel wall and endothelium — each bioregulator in the series is framed around a specific target tissue.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'KED',
    molecularWeight: 390.4,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'pinealon',
    name: 'Pinealon',
    aliases: ['Glu-Asp-Arg', 'EDR tripeptide'],
    categories: ['cognitive', 'bioregulator'],
    shortDescription: 'Synthetic Glu-Asp-Arg tripeptide studied as a brain/CNS bioregulator.',
    description:
      'Pinealon is a synthetic tripeptide (Glu-Asp-Arg) in the Khavinson short-peptide bioregulator series, studied for neuroprotective and CNS-directed effects.',
    mechanism: 'Proposed gene-regulatory modulation of neuronal gene expression; reported antioxidant / anti-apoptotic effects in neural models.',
    researchAreas: ['Cognition', 'Neuroprotection', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Pinealon (Glu-Asp-Arg) is the brain-directed member of the defined short-peptide bioregulator family. It is studied in the same gene-regulatory framework as Epitalon, but framed around neuronal tissue rather than the pineal/aging axis.',
      'Reported research examined protection of neurons against hypoxic and oxidative stress and effects on cognition in animal models. As with the rest of the class, the data originate largely from one research tradition, independent replication is limited, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Neuroprotection — studied for reduced neuronal apoptosis and oxidative damage under hypoxic/oxidative stress in cell and animal models.',
      'Cognition — examined for effects on learning and behavioral endpoints in rodent models.',
      'Class mechanism — proposed short peptide–DNA interaction modulating neuronal gene expression, shared with the wider bioregulator series.',
      'Evidence quality — single-tradition and largely preclinical; preliminary.',
    ],
    faqs: [
      {
        q: 'What is Pinealon?',
        a: 'Pinealon is a synthetic Glu-Asp-Arg tripeptide studied as a brain/CNS bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What is it studied for?',
        a: 'Neuroprotection under oxidative or hypoxic stress and cognition endpoints, mostly in preclinical models.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'EDR',
    molecularWeight: 418.4,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'bronchogen',
    name: 'Bronchogen',
    aliases: ['Ala-Asp-Glu-Leu', 'ADEL tetrapeptide'],
    categories: ['immune', 'bioregulator'],
    shortDescription: 'Synthetic Ala-Asp-Glu-Leu tetrapeptide studied as a respiratory-tissue bioregulator.',
    description:
      'Bronchogen is a synthetic tetrapeptide (Ala-Asp-Glu-Leu) in the Khavinson short-peptide bioregulator series, studied for effects on bronchial and respiratory-tract tissue.',
    mechanism: 'Proposed gene-regulatory modulation of bronchial epithelial gene expression.',
    researchAreas: ['Respiratory biology', 'Immune modulation', 'Peptide bioregulators'],
    background: [
      'Bronchogen (Ala-Asp-Glu-Leu) is the respiratory-directed member of the defined short-peptide bioregulator family, studied in the context of chronic bronchopulmonary conditions in the originating research tradition.',
      'Reported work examined bronchial epithelial markers and inflammatory indices in respiratory models, consistent with the class hypothesis of tissue-selective transcriptional modulation. Evidence is concentrated in one research tradition with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Respiratory focus — studied for effects on bronchial epithelium and inflammatory markers in models of chronic respiratory disease.',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression.',
      'Evidence quality — single-tradition and largely preclinical; preliminary.',
    ],
    faqs: [
      {
        q: 'What is Bronchogen?',
        a: 'Bronchogen is a synthetic Ala-Asp-Glu-Leu tetrapeptide studied as a respiratory-tissue bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What tissue is it associated with?',
        a: 'The bronchi and respiratory-tract epithelium — each bioregulator in the series is framed around a specific target tissue.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'ADEL',
    molecularWeight: 446.5,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'cardiogen',
    name: 'Cardiogen',
    aliases: ['Ala-Glu-Asp-Arg', 'AEDR tetrapeptide'],
    categories: ['bioregulator', 'healing-repair'],
    shortDescription: 'Synthetic Ala-Glu-Asp-Arg tetrapeptide studied as a cardiac-tissue bioregulator.',
    description:
      'Cardiogen is a synthetic tetrapeptide (Ala-Glu-Asp-Arg) in the Khavinson short-peptide bioregulator series, studied for effects on myocardial tissue.',
    mechanism: 'Proposed gene-regulatory modulation of myocardial gene expression.',
    researchAreas: ['Cardiac repair', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Cardiogen (Ala-Glu-Asp-Arg) is the heart-directed member of the defined short-peptide bioregulator family, studied in the context of age-related myocardial decline in the originating research tradition.',
      'Reported research examined cardiomyocyte markers and recovery endpoints in cardiac models, consistent with the class hypothesis of tissue-selective transcriptional modulation. Evidence is concentrated in one research tradition with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Cardiac focus — studied for effects on myocardial tissue and recovery markers in preclinical cardiac models.',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression.',
      'Evidence quality — single-tradition and largely preclinical; preliminary.',
    ],
    faqs: [
      {
        q: 'What is Cardiogen?',
        a: 'Cardiogen is a synthetic Ala-Glu-Asp-Arg tetrapeptide studied as a cardiac-tissue bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What tissue is it associated with?',
        a: 'The myocardium (heart muscle) — each bioregulator in the series is framed around a specific target tissue.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'AEDR',
    molecularWeight: 489.5,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'pancragen',
    name: 'Pancragen',
    aliases: ['Lys-Glu-Asp-Trp', 'KEDW tetrapeptide', 'Pancragen'],
    categories: ['bioregulator', 'metabolic'],
    shortDescription: 'Synthetic Lys-Glu-Asp-Trp tetrapeptide studied as a pancreas-tissue bioregulator.',
    description:
      'Pancragen is a synthetic tetrapeptide (Lys-Glu-Asp-Trp) in the Khavinson short-peptide bioregulator series, studied for effects on pancreatic tissue and carbohydrate metabolism.',
    mechanism: 'Proposed gene-regulatory modulation of pancreatic gene expression.',
    researchAreas: ['Metabolic', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Pancragen (Lys-Glu-Asp-Trp) is the pancreas-directed member of the defined short-peptide bioregulator family, studied in the context of age-related metabolic and pancreatic decline in the originating research tradition.',
      'Reported research examined markers of pancreatic function and carbohydrate metabolism in models, consistent with the class hypothesis of tissue-selective transcriptional modulation. Evidence is concentrated in one research tradition with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Pancreatic / metabolic focus — studied for effects on pancreatic tissue markers and carbohydrate-metabolism endpoints in preclinical models.',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression.',
      'Evidence quality — single-tradition and largely preclinical; preliminary.',
    ],
    faqs: [
      {
        q: 'What is Pancragen?',
        a: 'Pancragen is a synthetic Lys-Glu-Asp-Trp tetrapeptide studied as a pancreas-tissue bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What tissue is it associated with?',
        a: 'The pancreas — each bioregulator in the series is framed around a specific target tissue.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'KEDW',
    molecularWeight: 576.6,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'testagen',
    name: 'Testagen',
    aliases: ['Lys-Glu-Asp-Gly', 'KEDG tetrapeptide'],
    categories: ['reproductive', 'bioregulator'],
    shortDescription: 'Synthetic Lys-Glu-Asp-Gly tetrapeptide studied as a testis / reproductive-tissue bioregulator.',
    description:
      'Testagen is a synthetic tetrapeptide (Lys-Glu-Asp-Gly) in the Khavinson short-peptide bioregulator series, directed at reproductive (testicular) tissue and studied for effects on male reproductive and hormonal markers.',
    mechanism: 'Proposed gene-regulatory modulation of gene expression in reproductive tissue.',
    researchAreas: ['Reproductive function', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Testagen (Lys-Glu-Asp-Gly) is the reproductive-tissue member of the defined short-peptide bioregulator family — the synthetic, single-sequence counterpart to older testis extracts, framed around age-related decline in male reproductive function within the originating research tradition.',
      'Reported research examined markers of testicular and reproductive function in models, consistent with the class hypothesis of tissue-selective transcriptional modulation. As with the rest of the series, the evidence is concentrated in one research tradition with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Reproductive focus — studied for effects on testicular and reproductive-tissue markers in preclinical models.',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression.',
      'A defined tetrapeptide — the synthetic single-sequence counterpart to older testis extracts.',
      'Evidence quality — single-tradition and largely preclinical; preliminary. Not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Testagen?',
        a: 'Testagen is a synthetic Lys-Glu-Asp-Gly tetrapeptide studied as a testis / reproductive-tissue bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'What tissue is it associated with?',
        a: 'Reproductive (testicular) tissue — each bioregulator in the series is framed around a specific target tissue.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in a single research tradition and is largely preclinical, so findings are preliminary. This page is a research and educational reference.',
      },
    ],
    sequence: 'KEDG',
    molecularWeight: 447.4,
    molecularFormula: 'C17H29N5O9',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'prostamax',
    name: 'Prostamax',
    aliases: ['Lys-Glu-Asp-Pro', 'KEDP tetrapeptide'],
    categories: ['reproductive', 'bioregulator'],
    shortDescription:
      'Synthetic Lys-Glu-Asp-Pro tetrapeptide studied as a prostate-tissue bioregulator — the defined-sequence successor to older prostate extracts.',
    description:
      'Prostamax is a synthetic tetrapeptide (Lys-Glu-Asp-Pro) in the Khavinson short-peptide bioregulator series, directed at prostate tissue. It was conceived as the defined single-sequence successor to older bovine prostate extracts (such as Prostatilen), studied for prostate inflammation and age-related remodeling.',
    mechanism: 'Proposed gene-regulatory modulation of prostate gene expression.',
    researchAreas: ['Prostate health', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Prostamax (Lys-Glu-Asp-Pro) is the prostate-directed member of the defined short-peptide bioregulator family. Where the earlier generation used bovine prostate extracts (Prostatilen, Vitaprost), Prostamax is the synthetic, single-sequence peptide meant to reproduce that tissue-selective effect in a defined molecule.',
      'Reported research — largely Khavinson-school animal and cell-culture work — describes reduced prostate inflammation and slowed pathological remodeling in rat prostatitis models. There are no Western randomized trials of the synthetic peptide and no independent replication outside the originating institute, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Prostate focus — studied for reduced prostate inflammation and slowed pathological remodeling in preclinical prostatitis models.',
      'Successor to extracts — the defined-sequence synthetic counterpart to older bovine prostate extracts (Prostatilen, Vitaprost).',
      'Class mechanism — proposed short peptide–DNA interaction driving tissue-selective gene expression.',
      'Evidence quality — single-tradition and largely preclinical; no independent replication. Not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Prostamax?',
        a: 'Prostamax is a synthetic Lys-Glu-Asp-Pro tetrapeptide studied as a prostate-tissue bioregulator in the Khavinson short-peptide series.',
      },
      {
        q: 'How does it relate to older prostate extracts?',
        a: 'It is the defined single-sequence synthetic successor to bovine prostate extracts like Prostatilen and Vitaprost, meant to reproduce their tissue-selective effect in a defined molecule.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'It is concentrated in one research tradition and largely preclinical, with no independent replication. This page is a research and educational reference.',
      },
    ],
    sequence: 'KEDP',
    molecularWeight: 487.5,
    molecularFormula: 'C20H33N5O9',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'vladonix',
    name: 'Vladonix',
    aliases: ['A-6 thymus peptide', 'thymus peptide complex'],
    categories: ['immune', 'bioregulator'],
    shortDescription:
      'A natural thymus peptide complex (Cytomax A-6) — the extract-based counterpart to Thymalin, marketed for immune support and aging.',
    description:
      'Vladonix is a natural peptide complex extracted from thymus tissue (peptide complex A-6), part of the Russian Cytomax / Revilab line of tissue bioregulators. It is an extract-based immune bioregulator in the same lineage as Thymalin, marketed within the Khavinson tradition for immune restoration and healthy aging.',
    mechanism:
      'Proposed tissue-selective (bioregulator) modulation of thymic / immune-cell gene expression, in the thymic-peptide tradition of Thymalin and Thymogen.',
    researchAreas: ['Immune modulation', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Vladonix is the thymus-directed natural bioregulator of the Cytomax / Revilab line — the extract that sits alongside the thymic peptides already catalogued: Thymalin (the classic thymus extract) and Thymogen (the minimal Glu-Trp dipeptide). It featured in the long-running Khavinson observational work on immune-function markers with aging.',
      'As a tissue extract it is a standardized polypeptide fraction, not a single defined molecule, so it has no molecular formula or sequence. Its claims — immune restoration and aging-related endpoints — come from the same concentrated research tradition as the rest of the series, with limited independent replication. It is a research compound / supplement and is not FDA-approved.',
    ],
    keyResearch: [
      'Thymus bioregulator — a natural thymic peptide extract (complex A-6) in the immune-support lineage of Thymalin.',
      'Immune / aging focus — associated with the Khavinson observational work on immune markers with age.',
      'A tissue extract — a polypeptide fraction with no single formula or sequence.',
      'Evidence quality — concentrated in one research tradition; preliminary. Not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Vladonix?',
        a: 'Vladonix is a natural thymus peptide complex (Cytomax A-6) marketed for immune support and healthy aging, the extract-based counterpart to Thymalin.',
      },
      {
        q: 'How does it relate to Thymalin and Thymogen?',
        a: 'All three are thymic peptides: Thymalin and Vladonix are thymus extracts, while Thymogen is the minimal synthetic dipeptide (Glu-Trp) distilled from that tradition.',
      },
      {
        q: 'Does it have a molecular formula?',
        a: 'No — it is a tissue extract (a polypeptide fraction), so it has no single sequence or molecular formula.',
      },
      {
        q: 'Is Vladonix approved?',
        a: 'No — it is a research compound / supplement, not FDA-approved, with evidence concentrated in one research tradition. This page is a research and educational reference.',
      },
    ],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ventfort',
    name: 'Ventfort',
    aliases: ['A-3 vessel peptide', 'vascular peptide complex'],
    categories: ['bioregulator'],
    shortDescription:
      'A natural blood-vessel peptide complex (Cytomax A-3) — the extract-based counterpart to Vesugen, targeting vascular tissue.',
    description:
      'Ventfort is a natural peptide complex extracted from vascular (blood-vessel) tissue (peptide complex A-3), part of the Russian Cytomax / Revilab bioregulator line. It is the extract-based vascular counterpart to the synthetic tripeptide Vesugen (Lys-Glu-Asp), marketed within the Khavinson tradition for endothelial and vascular support.',
    mechanism:
      'Proposed tissue-selective (bioregulator) modulation of vascular / endothelial gene expression, in the same lineage as the synthetic vessel peptide Vesugen.',
    researchAreas: ['Vascular health', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Ventfort is the vessel-directed natural bioregulator of the Cytomax / Revilab line. It pairs with Vesugen, the synthetic Lys-Glu-Asp tripeptide already in this catalog: Ventfort is the natural vascular extract, Vesugen the defined synthetic short peptide modeled on the same tissue. In Khavinson protocols it is treated as a foundational entry because vascular function underlies every organ.',
      'As a tissue extract it is a standardized polypeptide fraction with no single molecular formula or sequence. Its vascular claims come from the same concentrated research tradition as the rest of the series, with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Vascular bioregulator — a natural vessel peptide extract (complex A-3), the extract counterpart to synthetic Vesugen.',
      'Endothelial / vascular focus — marketed for vessel elasticity and endothelial support within Khavinson protocols.',
      'A tissue extract — a polypeptide fraction with no single formula or sequence.',
      'Evidence quality — concentrated in one research tradition; preliminary. Not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Ventfort?',
        a: 'Ventfort is a natural blood-vessel peptide complex (Cytomax A-3), marketed for vascular and endothelial support — the extract-based counterpart to the synthetic peptide Vesugen.',
      },
      {
        q: 'How does it relate to Vesugen?',
        a: 'Ventfort is the natural vascular extract; Vesugen is the defined synthetic tripeptide (Lys-Glu-Asp) modeled on the same tissue.',
      },
      {
        q: 'Does it have a molecular formula?',
        a: 'No — it is a tissue extract (a polypeptide fraction), so it has no single sequence or molecular formula.',
      },
      {
        q: 'Is Ventfort approved?',
        a: 'No — it is a research compound / supplement, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'chelohart',
    name: 'Chelohart',
    aliases: ['A-14 heart peptide', 'cardiac peptide complex'],
    categories: ['bioregulator'],
    shortDescription:
      'A natural heart-muscle peptide complex (Cytomax A-14) — the extract-based counterpart to Cardiogen, targeting cardiac tissue.',
    description:
      'Chelohart is a natural peptide complex extracted from cardiac muscle (peptide complex A-14, from the heart of young calves or pigs), part of the Russian Cytomax / Revilab bioregulator line. It is the extract-based cardiac counterpart to the synthetic tetrapeptide Cardiogen (Ala-Glu-Asp-Arg), marketed within the Khavinson tradition for heart-muscle support.',
    mechanism:
      'Proposed tissue-selective (bioregulator) modulation of cardiomyocyte gene expression, in the same lineage as the synthetic heart peptide Cardiogen.',
    researchAreas: ['Cardiac health', 'Aging biology', 'Peptide bioregulators'],
    background: [
      'Chelohart is the heart-directed natural bioregulator of the Cytomax / Revilab line, extracted from cardiac muscle tissue. It pairs with Cardiogen, the synthetic Ala-Glu-Asp-Arg tetrapeptide already catalogued: Chelohart is the natural cardiac extract, Cardiogen the defined synthetic short peptide modeled on the same tissue.',
      'As a tissue extract it is a standardized polypeptide fraction with no single molecular formula or sequence. Its claims — supporting contractile function and cellular repair in cardiac tissue — come from the same concentrated research tradition as the rest of the series, with limited independent replication, and it is not FDA-approved.',
    ],
    keyResearch: [
      'Cardiac bioregulator — a natural heart-muscle peptide extract (complex A-14), the extract counterpart to synthetic Cardiogen.',
      'Cardiomyocyte focus — marketed for contractile function and cellular repair in heart tissue within Khavinson protocols.',
      'A tissue extract — a polypeptide fraction with no single formula or sequence.',
      'Evidence quality — concentrated in one research tradition; preliminary. Not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Chelohart?',
        a: 'Chelohart is a natural heart-muscle peptide complex (Cytomax A-14), marketed for cardiac support — the extract-based counterpart to the synthetic peptide Cardiogen.',
      },
      {
        q: 'How does it relate to Cardiogen?',
        a: 'Chelohart is the natural cardiac extract; Cardiogen is the defined synthetic tetrapeptide (Ala-Glu-Asp-Arg) modeled on the same tissue.',
      },
      {
        q: 'Does it have a molecular formula?',
        a: 'No — it is a tissue extract (a polypeptide fraction), so it has no single sequence or molecular formula.',
      },
      {
        q: 'Is Chelohart approved?',
        a: 'No — it is a research compound / supplement, not FDA-approved. This page is a research and educational reference.',
      },
    ],
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
      'Neurotrophic induction — reported to increase BDNF protein and trkB phosphorylation in the rat hippocampus and basal forebrain (Dolotov et al., 2006).',
      'Monoaminergic modulation — studied for enhancing dopaminergic and serotonergic signaling, alongside melanocortin activity, without activating the HPA stress axis.',
      'Ischemic stroke & cognition — approved in Russia for stroke, cognitive impairment, and optic-nerve disease; studied for attention and memory.',
      'Compared to Selank — both Russian neuropeptides, but Semax is oriented toward focus / cognition / neuroprotection where Selank targets anxiety; the two are often paired.',
      'Evidence quality — most controlled data are Russian-language; Western peer-reviewed replication is limited.',
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
      'Anxiolytic activity — clinical studies report an anxiolytic effect comparable to benzodiazepines but without sedation or dependence.',
      'GABAergic modulation — alters expression of genes in GABAergic neurotransmission and modulates GABA-A complexes allosterically, without binding the benzodiazepine site directly (Front Pharmacol, 2017).',
      'Serotonergic & enkephalin effects — also modulates serotonin metabolism and inhibits enkephalin breakdown — a multi-system rather than single-receptor profile.',
      'Compared to Semax — the same Russian neuropeptide lineage, but Selank soothes (anxiety) where Semax sharpens (cognition).',
      'Evidence quality — approved and used in Russia; not FDA-approved, and Western replication is limited.',
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
    slug: 'cerebrolysin',
    name: 'Cerebrolysin',
    aliases: ['FPF-1070', 'porcine brain-derived peptide preparation'],
    categories: ['cognitive'],
    shortDescription:
      'A porcine-brain-derived mixture of neuropeptides and free amino acids with neurotrophic activity — approved for stroke and dementia outside the US.',
    description:
      'Cerebrolysin is not a single molecule but a standardized mixture — low-molecular-weight neuropeptides (about 15%) and free amino acids (about 85%) produced by enzymatic breakdown of purified pig-brain proteins. Its small peptide fraction is able to cross the blood–brain barrier, where it is studied for mimicking the brain’s own neurotrophic factors. It is one of the most widely used injectable nootropics in the world, approved in dozens of countries for stroke, traumatic brain injury, and dementia — though not by the FDA.',
    mechanism:
      'Neurotrophic and neuroprotective activity attributed to peptide fragments that mimic endogenous neurotrophic factors (BDNF, NGF, GDNF, CNTF), supporting neuronal survival, neuroplasticity, and synaptogenesis.',
    researchAreas: ['Stroke recovery', 'Traumatic brain injury', 'Vascular dementia', 'Alzheimer’s disease', 'Neuroprotection'],
    background: [
      'Cerebrolysin belongs to a small group of entries in this catalog that are not single peptides at all but defined biological mixtures — like the glycoprotein hormones, it cannot be captured by one molecular formula. It is manufactured by EVER Pharma (originally EBEWE, Austria) from purified porcine brain proteins broken down by controlled enzymatic hydrolysis, yielding a reproducible blend of short neuropeptides and free amino acids standardized by peptide-nitrogen content rather than by a sequence.',
      'The rationale is neurotrophic mimicry: the low-molecular-weight peptide fraction is small enough to cross the blood–brain barrier and is proposed to reproduce, in part, the actions of the brain’s own growth factors — BDNF, NGF, GDNF and others — that support neuron survival and synapse formation. It has one of the largest clinical literatures of any nootropic, spanning ischemic stroke, traumatic brain injury, vascular dementia, and Alzheimer’s disease, and is approved in roughly 44 countries across Europe and Asia. It is not FDA-approved in the United States, where it is imported and used off-label.',
    ],
    keyResearch: [
      'Neurotrophic mimicry — the peptide fraction is proposed to mimic endogenous neurotrophic factors (BDNF, NGF, GDNF), supporting neuronal survival and plasticity.',
      'Stroke & TBI — the most-studied indications; used internationally in acute stroke and traumatic brain injury rehabilitation.',
      'Dementia — studied and approved in several countries for vascular dementia and Alzheimer’s disease.',
      'A defined mixture — not a single peptide but a standardized porcine-brain hydrolysate (≈15% peptides, ≈85% free amino acids); no single molecular formula.',
      'Approved abroad, not by FDA — marketed in ~44 countries; not FDA-approved in the US.',
    ],
    faqs: [
      {
        q: 'What is Cerebrolysin?',
        a: 'Cerebrolysin is a standardized mixture of small neuropeptides and free amino acids made from purified porcine brain proteins, studied for neurotrophic and neuroprotective effects in stroke, brain injury, and dementia.',
      },
      {
        q: 'Is it a single peptide?',
        a: 'No — it is a defined biological mixture (about 15% low-molecular-weight peptides and 85% free amino acids), so it has no single sequence or molecular formula.',
      },
      {
        q: 'Is Cerebrolysin FDA-approved?',
        a: 'No. It is approved in roughly 44 countries across Europe and Asia for stroke, traumatic brain injury, and dementia, but it is not FDA-approved in the United States. This page is a research and educational reference.',
      },
      {
        q: 'How is it thought to work?',
        a: 'Its small peptides can cross the blood–brain barrier and are proposed to mimic the brain’s own neurotrophic factors (BDNF, NGF, GDNF), supporting neuron survival and synapse formation.',
      },
    ],
    synthesisNotes:
      'Cerebrolysin is not synthesized but manufactured from purified porcine brain protein by controlled enzymatic hydrolysis, then standardized — its potency is defined by peptide-nitrogen content and a consistent low-molecular-weight profile, not by a single sequence or purity number. Because it is a biological mixture, quality rests on batch-to-batch reproducibility, species-source control, and freedom from larger proteins, closer to a biologic than to a synthetic peptide.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'dihexa',
    name: 'Dihexa',
    aliases: ['PNB-0408', 'N-hexanoic-Tyr-Ile-(6) aminohexanoic amide'],
    categories: ['cognitive'],
    shortDescription:
      'An orally active angiotensin IV–derived peptidomimetic reported as an extraordinarily potent synaptogenic (synapse-forming) compound.',
    description:
      'Dihexa is a small peptidomimetic derived from angiotensin IV, developed to promote the formation of new synapses. It works through the hepatocyte growth factor (HGF) / c-Met system rather than a classic neurotransmitter pathway, and it was reported in preclinical work to be orders of magnitude more potent than BDNF at driving synaptogenesis — which is why it draws intense interest as a cognitive research compound despite very limited human data.',
    mechanism:
      'Proposed potentiation of hepatocyte growth factor (HGF) signaling at its receptor c-Met, promoting synaptogenesis; derived from the angiotensin IV / AT4 system.',
    researchAreas: ['Cognition', 'Synaptogenesis', 'Neurodegeneration'],
    background: [
      'Dihexa came out of work by Joseph Harding and colleagues at Washington State University on angiotensin IV, a fragment of the blood-pressure hormone angiotensin that unexpectedly turned out to support learning and memory. The team engineered a stabilized, orally active, blood–brain-barrier-penetrant derivative — Dihexa — designed to keep the pro-cognitive activity while surviving in the body long enough to matter.',
      'Its headline claim is potency: in preclinical assays Dihexa was reported to promote new synapse formation at concentrations far below those needed by brain-derived neurotrophic factor (BDNF), acting by enhancing signaling of hepatocyte growth factor (HGF) through its receptor c-Met. That mechanism and potency make it a compelling research tool for neurodegeneration, but the same properties — a small molecule that powerfully drives cell signaling — mean its safety is essentially uncharacterized in humans. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Synaptogenesis — reported in preclinical work to promote new synapse formation with very high potency (orders of magnitude beyond BDNF in the original assays).',
      'HGF / c-Met mechanism — proposed to work by potentiating hepatocyte growth factor signaling at the c-Met receptor.',
      'Angiotensin IV origin — engineered from the pro-cognitive AT4-system peptide angiotensin IV for oral activity and brain penetration.',
      'Neurodegeneration research — studied as a candidate for cognitive-decline models; human data are very limited.',
      'Not FDA-approved — an early-stage research compound with an uncharacterized human safety profile.',
    ],
    faqs: [
      {
        q: 'What is Dihexa?',
        a: 'Dihexa is an orally active peptidomimetic derived from angiotensin IV, studied as a highly potent promoter of new synapse formation via the HGF / c-Met pathway.',
      },
      {
        q: 'Why is it considered so potent?',
        a: 'In the original preclinical assays it promoted synaptogenesis at concentrations orders of magnitude lower than BDNF, a benchmark neurotrophic factor.',
      },
      {
        q: 'How does it work?',
        a: 'It is proposed to enhance hepatocyte growth factor (HGF) signaling through the c-Met receptor, rather than acting on a classic neurotransmitter system.',
      },
      {
        q: 'Is Dihexa safe or approved?',
        a: 'No — it is an early-stage research compound, not FDA-approved, and its safety in humans is essentially uncharacterized. This page is a research and educational reference.',
      },
    ],
    molecularWeight: 504.7,
    molecularFormula: 'C27H44N4O5',
    cas: '1401708-83-5',
    pubchemCid: 129010512,
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
      'Pigmentation — MC1R agonism stimulates eumelanin production via Gs-coupled cAMP signaling.',
      'Central sexual response — MC4R activation drives arousal effects; the same MC4R activity also produces the nausea, flushing, and spontaneous erections documented in human studies.',
      'Compared to Melanotan I (afamelanotide) — MT-II is a truncated, non-selective MC1–5R agonist, whereas afamelanotide is highly MC1R-selective and FDA-approved (Scenesse) for photoprotection in erythropoietic protoporphyria.',
      'Relationship to PT-141 — PT-141 (bremelanotide) is a metabolite refined toward MC4R / sexual response and away from pigmentation.',
      'Not FDA-approved — its non-selectivity drives off-target effects; research compound.',
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
    slug: 'melanotan-1',
    name: 'Afamelanotide',
    aliases: ['Melanotan I', 'Melanotan-1', 'MT-I', 'MT-1', 'CUV1647', 'Scenesse'],
    categories: ['cosmetic'],
    shortDescription:
      'MC1R-selective α-MSH analog; FDA-approved (Scenesse) for photoprotection in erythropoietic protoporphyria.',
    description:
      'Afamelanotide (Melanotan I) is a 13-amino-acid linear analog of α-melanocyte-stimulating hormone (α-MSH), highly selective for the melanocortin-1 receptor (MC1R). It is FDA-approved as Scenesse — delivered as a controlled-release subcutaneous implant — to increase pain-free light exposure in adults with a history of phototoxic reactions from erythropoietic protoporphyria (EPP).',
    mechanism:
      'MC1R-selective melanocortin agonism, driving eumelanin synthesis (photoprotection) via Gs-coupled cAMP signaling.',
    researchAreas: ['Photoprotection', 'Pigmentation biology'],
    background: [
      'Afamelanotide is the [Nle4, D-Phe7] analog of α-MSH — substitutions that confer metabolic stability and high MC1R selectivity (roughly three orders of magnitude lower affinity for MC3R/MC4R than for MC1R).',
      'Unlike the non-selective Melanotan II, afamelanotide’s MC1R selectivity keeps its action largely confined to pigmentation/photoprotection, which is what allowed it to reach approval. It is administered as a controlled-release subcutaneous implant (Scenesse) rather than by injection.',
    ],
    keyResearch: [
      'FDA-approved as Scenesse (2019) for photoprotection in erythropoietic protoporphyria (EPP) — the first approved treatment for the condition.',
      'MC1R-selective — ~1000-fold lower affinity for MC3R/MC4R, so it drives eumelanin production without the MC4R-mediated sexual-response and nausea effects of non-selective analogs.',
      'Studied beyond EPP in solar urticaria, nonsegmental vitiligo (with narrow-band UVB), and xeroderma pigmentosum.',
      'Compared to Melanotan II — afamelanotide is linear, MC1R-selective, and approved; Melanotan II is cyclic, non-selective (MC1–5R), and unapproved.',
    ],
    faqs: [
      {
        q: 'What is afamelanotide?',
        a: 'Afamelanotide (Melanotan I) is an MC1R-selective α-MSH analog, FDA-approved as Scenesse for photoprotection in erythropoietic protoporphyria.',
      },
      {
        q: 'How is it different from Melanotan II?',
        a: 'Afamelanotide is MC1R-selective and FDA-approved; Melanotan II is non-selective across MC1–5R (including the MC4R activity that drives side effects) and is not approved.',
      },
      {
        q: 'How is it administered?',
        a: 'As a controlled-release subcutaneous implant (Scenesse), not a self-administered injection.',
      },
    ],
    molecularFormula: 'C78H111N21O19',
    molecularWeight: 1646.8,
    pubchemCid: 16197727,
    fdaApproved: true,
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
      'Central arousal mechanism — a cyclic α-MSH analog acting on melanocortin MC3R / MC4R in the hypothalamus to drive sexual desire independent of the reproductive hormone axis (Molinoff / Diamond et al., 2003).',
      'HSDD — FDA-approved (Vyleesi, 2019) for hypoactive sexual desire disorder in premenopausal women.',
      'Distinct from vascular agents — acts on central desire circuits rather than on blood flow.',
      'Compared to kisspeptin — PT-141 produces acute central arousal via melanocortin receptors, while kisspeptin acts upstream on the GnRH hormone axis; they address different research questions.',
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
      'GnRH stimulation — KISS1R (GPR54) agonism on hypothalamic GnRH neurons increases GnRH pulsatility and downstream LH / FSH and sex-steroid secretion.',
      'Reproductive-axis probe — studied for restoring signaling in hypothalamic amenorrhea and as a physiologic trigger of LH / FSH in fertility research.',
      'Puberty & limbic effects — a key regulator of pubertal onset; KISS1R is also expressed in limbic areas, enabling direct central sexual-motivation effects.',
      'Compared to PT-141 — kisspeptin acts upstream on the hormonal axis (GnRH → LH / FSH), where PT-141 produces acute central arousal via melanocortin receptors.',
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
    slug: 'gonadorelin',
    name: 'Gonadorelin',
    aliases: [
      'GnRH',
      'LHRH',
      'Gonadoliberin',
      'Luteinizing hormone-releasing hormone',
      'Factrel',
      'Lutrepulse',
    ],
    categories: ['reproductive', 'peptide-hormone'],
    shortDescription:
      'Synthetic GnRH — the native decapeptide at the top of the pituitary-gonadal axis; pulsatile dosing switches the axis on, continuous dosing shuts it down.',
    description:
      'Gonadorelin is synthetic gonadotropin-releasing hormone (GnRH), the ten-amino-acid hypothalamic hormone that governs reproduction. Delivered to the pituitary it triggers release of LH and FSH — but only when given in pulses: the receptor’s defining quirk is that continuous exposure desensitizes it and suppresses the very hormones a pulse would release, the paradox that underlies both fertility and hormone-suppression medicine.',
    mechanism:
      'GnRH-receptor agonism on pituitary gonadotrophs. Pulsatile stimulation drives LH / FSH secretion; continuous stimulation desensitizes the receptor and suppresses the gonadotropins.',
    researchAreas: ['Reproductive endocrinology', 'HPG-axis function', 'Fertility', 'Hypogonadism'],
    background: [
      'Gonadorelin is the manufactured form of GnRH, the master hormone of reproduction. Isolated and sequenced in 1971 — work that earned Andrew Schally a share of the 1977 Nobel Prize — it sits one step below kisspeptin in the hypothalamic-pituitary-gonadal (HPG) axis and one step above LH and FSH. Its ten residues are the switch that turns the whole reproductive cascade on.',
      'What makes GnRH biology remarkable is its dependence on rhythm. The pituitary responds to pulses, not to a steady signal: given in a pulsatile pattern gonadorelin stimulates LH and FSH and can reawaken a dormant axis, but given continuously it does the opposite — the receptor downregulates and gonadotropins fall. That single paradox splits its uses in two. Pulsatile gonadorelin was FDA-approved (Lutrepulse, via a programmable pump) for infertility from hypothalamic amenorrhea, and a version (Factrel) served as a diagnostic of pituitary function; both were later discontinued in the US. The same continuous-suppression principle is why long-acting GnRH analogs such as leuprolide are used to shut the axis down.',
      'In practice gonadorelin draws attention as the axis-signaling counterpart to hormones this catalog already covers: it acts upstream of hCG — which mimics LH at the gonad — and downstream of kisspeptin, which triggers GnRH release in the first place. Its native half-life, measured in minutes, is precisely why the pulsatile-versus-continuous distinction matters so much.',
    ],
    keyResearch: [
      'Native GnRH decapeptide — the manufactured form of the hypothalamic hormone that controls LH and FSH; sequenced in 1971 (Schally, Nobel 1977).',
      'Pulsatile vs continuous — the defining paradox: pulses stimulate the gonadotropins, continuous exposure desensitizes the receptor and suppresses them.',
      'Approved uses (historical) — pulsatile Lutrepulse for hypothalamic-amenorrhea infertility and Factrel as a pituitary-function diagnostic; both discontinued in the US.',
      'Axis position — acts downstream of kisspeptin (which releases GnRH) and upstream of hCG (which mimics LH at the gonad).',
      'Short half-life — a native peptide cleared within minutes, which is why delivery pattern, not just dose, determines the effect.',
    ],
    faqs: [
      {
        q: 'What is gonadorelin?',
        a: 'Gonadorelin is synthetic GnRH — the natural ten-amino-acid hypothalamic hormone that tells the pituitary to release LH and FSH, the hormones that drive the gonads.',
      },
      {
        q: 'Why does pulsatile versus continuous dosing matter?',
        a: 'The GnRH receptor responds to rhythm: pulses stimulate LH and FSH, while continuous exposure desensitizes the receptor and suppresses them — the basis for both fertility and hormone-suppression uses.',
      },
      {
        q: 'How does gonadorelin relate to hCG and kisspeptin?',
        a: 'It sits between them on the reproductive axis: kisspeptin triggers GnRH (gonadorelin) release, gonadorelin drives LH and FSH, and hCG acts further down by mimicking LH directly at the gonad.',
      },
      {
        q: 'Is gonadorelin FDA-approved?',
        a: 'It was historically approved in the US (Lutrepulse for infertility; Factrel as a diagnostic) but both were discontinued. This page is a research and educational reference, not medical advice.',
      },
    ],
    sequence: 'pGlu-His-Trp-Ser-Tyr-Gly-Leu-Arg-Pro-Gly-NH2',
    molecularWeight: 1182.29,
    molecularFormula: 'C55H75N17O13',
    cas: '33515-09-2',
    pubchemCid: 638793,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'hcg',
    name: 'HCG',
    aliases: [
      'Human chorionic gonadotropin',
      'Choriogonadotropin alfa',
      'Ovidrel',
      'Pregnyl',
      'Novarel',
    ],
    categories: ['reproductive'],
    shortDescription:
      'A heterodimeric glycoprotein hormone — two different glycosylated subunits — that mimics the LH surge; the pregnancy hormone, also the subject of a debunked diet.',
    description:
      'Human chorionic gonadotropin is the most structurally complex hormone in this catalog. It is not a single chain but a non-covalent heterodimer of two different subunits — a 92-amino-acid alpha subunit (shared with LH, FSH, and TSH) and a 145-amino-acid beta subunit that is specific to hCG — each heavily decorated with sugar chains. That glycosylation is not decoration: it is essential to the hormone’s long circulating half-life and biological activity, and it makes hCG a true glycoprotein biologic, roughly 36–40 kDa, that cannot be captured as a simple amino-acid formula.',
    mechanism:
      'Acts as an agonist at the LH/CG receptor, reproducing the luteinizing-hormone signal: in women it triggers ovulation and sustains the corpus luteum’s progesterone; in men it stimulates Leydig-cell testosterone production. Its long half-life, conferred by glycosylation, lets a single dose mimic the natural LH surge.',
    researchAreas: ['Ovulation induction', 'Assisted reproduction', 'Male hypogonadism', 'Fertility preservation'],
    background: [
      'hCG’s biology is defined by its architecture. The alpha subunit is common to the whole glycoprotein-hormone family (LH, FSH, TSH); specificity comes entirely from the beta subunit and the way the two fold together. Because the subunits are made and then assembled — and because the sugar chains are added by the producing cell — hCG is a genuine glycoprotein: recombinant versions (choriogonadotropin alfa) are made in mammalian (CHO) cells precisely so that human-like glycosylation can occur, while older products are purified from the urine of pregnant women. This is biology that bacterial synthesis cannot reproduce.',
      'In medicine it is well established: it triggers ovulation in assisted reproduction, supports early-pregnancy progesterone, and is used in male hypogonadism and to preserve testicular function and fertility — including alongside testosterone therapy, where it keeps the testes signaled. It is also, famously, the hormone that pregnancy tests detect.',
      'The drama is the HCG diet. In the 1950s a British physician, Albert Simeons, claimed hCG injections plus a 500-calorie diet caused targeted fat loss. The diet was repeatedly debunked — the weight loss comes from near-starvation, not the hormone — yet it resurfaces continually, and the FDA has explicitly warned that over-the-counter "homeopathic" hCG weight-loss products are illegal and ineffective. A second, quieter misunderstanding surrounds its use in performance and TRT communities. Both make hCG a clean example of a legitimate, well-characterized hormone whose public reputation is dominated by uses it was never validated for.',
    ],
    keyResearch: [
      'Ovulation induction & ART — the approved use, supplying the LH-like trigger for egg release and luteal support.',
      'Male hypogonadism — stimulates endogenous testosterone via the LH/CG receptor; used to maintain testicular function.',
      'Glycoprotein structure — a heterodimer whose shared alpha + specific beta subunits and glycosylation define its activity and half-life.',
      'The HCG diet — repeatedly debunked; the FDA warns OTC homeopathic hCG weight-loss products are illegal and ineffective.',
      'Pregnancy detection — the hormone measured by home and clinical pregnancy tests.',
    ],
    faqs: [
      {
        q: 'What is HCG?',
        a: 'Human chorionic gonadotropin — a glycoprotein hormone made of two different glycosylated subunits that mimics luteinizing hormone. It triggers ovulation, supports early pregnancy, and stimulates testosterone in men. It is also the hormone pregnancy tests detect.',
      },
      {
        q: 'Why is HCG a glycoprotein rather than a simple peptide?',
        a: 'It is a two-subunit protein heavily modified with sugar chains that are essential to its half-life and activity. Recombinant hCG is made in mammalian cells so that human-like glycosylation can occur — something bacterial peptide synthesis cannot do.',
      },
      {
        q: 'Does the HCG diet work?',
        a: 'No. The HCG diet has been repeatedly debunked — any weight loss comes from the extreme calorie restriction, not the hormone — and the FDA has warned that OTC homeopathic hCG weight-loss products are illegal and ineffective.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference. hCG is a prescription hormone with specific approved indications.',
      },
    ],
    molecularWeight: 36700,
    cas: '9002-61-3',
    fdaApproved: true,
    storage:
      'Depending on the product, hCG is stored refrigerated (2–8 °C) and, once reconstituted, used within the label’s window; it must not be frozen. Glycoprotein integrity is sensitive to heat and freeze–thaw.',
    handling:
      'A glycosylated heterodimer sensitive to heat, freezing, and agitation, any of which can dissociate the subunits or aggregate the protein and reduce potency.',
    synthesisNotes:
      'hCG is either purified from the urine of pregnant women or, as choriogonadotropin alfa, produced recombinantly in mammalian (CHO) cells so that the essential glycosylation is human-like. Its molecular weight (~36–40 kDa) is approximate and varies with glycosylation, so it is not represented by a single molecular formula. Characterization includes subunit identity, glycan profiling, and bioassay potency — glycoprotein-grade analytics well beyond an HPLC purity number.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'oxytocin',
    name: 'Oxytocin',
    aliases: ['Pitocin', 'Syntocinon', 'the love hormone'],
    categories: ['reproductive', 'cognitive', 'peptide-hormone'],
    shortDescription:
      'A 9-amino-acid cyclic hormone of labor and bonding — historically the first peptide hormone ever chemically synthesized, and the most over-marketed "love hormone."',
    description:
      'Oxytocin is a tiny but pivotal hormone: a 9-amino-acid cyclic peptide, closed by a single disulfide bridge, released from the posterior pituitary. It drives uterine contractions in labor and milk letdown in nursing, and it acts in the brain on social behavior — the source of its "love hormone" fame. It also holds a place in scientific history: in 1953 Vincent du Vigneaud synthesized it, the first polypeptide hormone ever made in the lab, a feat that won the 1955 Nobel Prize in Chemistry and opened the door to synthetic peptide therapeutics.',
    mechanism:
      'Agonist at the oxytocin receptor (a G-protein-coupled receptor). Peripherally it contracts uterine smooth muscle and the mammary myoepithelium; centrally it modulates circuits involved in social bonding, trust, and stress, which is the basis of its behavioral research.',
    researchAreas: ['Labor induction', 'Lactation', 'Social bonding', 'Anxiety and stress', 'Peptide hormones'],
    background: [
      'Oxytocin’s established medicine is obstetric. As Pitocin it is one of the most widely used drugs in childbirth — to induce or augment labor and to control bleeding afterward — and it mediates the milk-ejection reflex during breastfeeding. Structurally it is almost a twin of vasopressin, differing in only two residues, which is why the two hormones’ effects sometimes overlap.',
      'Its fame, though, comes from the brain. Animal and early human work tied oxytocin to pair-bonding, maternal behavior, trust, and social affiliation, and the popular press crowned it the "love hormone" or "cuddle chemical." That framing drove a wave of intranasal-oxytocin research and products promising better social functioning — in autism, social anxiety, even relationship enhancement.',
      'The honest reckoning is more sober. Rigorous, larger trials of intranasal oxytocin — including in autism — have largely failed to reproduce the early promise, and there are real questions about how much intranasal oxytocin even reaches the brain. Oxytocin is a genuine, important hormone whose behavioral marketing ran far ahead of the evidence — a textbook case of a misunderstood molecule, which is exactly why it belongs in an honest reference.',
    ],
    keyResearch: [
      'Labor and delivery — induction/augmentation of labor and control of postpartum bleeding (the core approved use).',
      'Lactation — mediates the milk-ejection (letdown) reflex.',
      'Social neuroscience — studied for bonding, trust, and stress modulation; the basis of the "love hormone" label.',
      'Intranasal hype vs evidence — larger trials (including autism) have largely not confirmed early behavioral claims.',
      'A historic first — the first peptide hormone chemically synthesized (du Vigneaud, 1953; Nobel Prize 1955).',
    ],
    faqs: [
      {
        q: 'What is oxytocin?',
        a: 'A 9-amino-acid cyclic hormone from the posterior pituitary that drives uterine contractions and milk letdown, and acts in the brain on social behavior. As a drug (Pitocin) it is used in labor.',
      },
      {
        q: 'Is oxytocin really the "love hormone"?',
        a: 'It does play a role in bonding and social behavior, but the "love hormone" label is overstated. Rigorous trials of intranasal oxytocin for social conditions, including autism, have largely failed to confirm the early hype.',
      },
      {
        q: 'Why is oxytocin historically important?',
        a: 'It was the first peptide hormone ever chemically synthesized (Vincent du Vigneaud, 1953), which won the 1955 Nobel Prize in Chemistry and helped launch the field of synthetic peptide therapeutics.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'CYIQNCPLG-NH2',
    molecularWeight: 1007.19,
    molecularFormula: 'C43H66N12O12S2',
    cas: '50-56-6',
    fdaApproved: true,
    storage:
      'Oxytocin injection is stored refrigerated (2–8 °C) per most labels; the cyclic disulfide peptide is sensitive to heat over time. Nasal/compounded forms follow their own storage.',
    handling:
      'A small disulfide-bridged peptide; protect from heat and prolonged storage in solution to preserve potency.',
    synthesisNotes:
      'Oxytocin is a 9-residue cyclic peptide with a single intramolecular disulfide bond, made by solid-phase peptide synthesis — fittingly, since its 1953 chemical synthesis was the historical proof that peptide hormones could be built in the lab at all. Its small size and defined structure make it straightforward to characterize by mass spectrometry and HPLC, unlike the large folded biologics elsewhere in this catalog.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'fsh',
    name: 'FSH (Follitropin)',
    aliases: [
      'Follicle-stimulating hormone',
      'Follitropin alfa',
      'Gonal-f',
      'Follistim',
      'Puregon',
    ],
    categories: ['reproductive'],
    shortDescription:
      'A heterodimeric glycoprotein gonadotropin that drives follicle growth and spermatogenesis — the workhorse of IVF stimulation, and a sister molecule to HCG and LH.',
    description:
      'Follicle-stimulating hormone is one of the three pituitary glycoprotein gonadotropins, and like its siblings LH and HCG it is built from a shared alpha subunit paired with a hormone-specific beta subunit, heavily glycosylated. FSH is the signal that recruits and grows ovarian follicles in women and supports sperm production in men, which makes recombinant FSH (follitropin) the central tool of assisted reproduction — the drug that drives controlled ovarian stimulation in IVF.',
    mechanism:
      'Binds the FSH receptor on ovarian granulosa cells (driving follicle maturation and estrogen production) and on testicular Sertoli cells (supporting spermatogenesis). Its glycosylation governs its circulating half-life and activity.',
    researchAreas: ['Ovarian stimulation', 'IVF / assisted reproduction', 'Anovulation', 'Male infertility'],
    background: [
      'FSH completes the gonadotropin picture alongside HCG and LH in this catalog: the same alpha subunit, a distinct beta subunit, and obligatory glycosylation that makes it a true glycoprotein hormone rather than a simple peptide. Its job is the front half of the reproductive cycle — recruiting and maturing ovarian follicles — where LH and the LH-mimicking HCG handle the ovulatory trigger that follows.',
      'Therapeutically, recombinant FSH (follitropin alfa, Gonal-f; follitropin beta, Follistim) is produced in mammalian cells so its glycosylation is human-like, and it is the backbone of controlled ovarian stimulation in IVF — driving the development of multiple follicles in a cycle — as well as treatment for anovulation and certain male infertility. Older urine-derived gonadotropin products (menotropins) supplied FSH and LH activity together; recombinant versions allow precise, consistent dosing.',
      'FSH is less surrounded by pop-culture drama than oxytocin or HCG, but it carries the same molecular lesson: glycoprotein hormones are assembled, glycosylated biologics whose sugar chains are part of the drug, which is why they are grown in cells and characterized by glycan and bioassay analytics rather than a simple purity figure.',
    ],
    keyResearch: [
      'Controlled ovarian stimulation — the core use; drives multi-follicle development for IVF.',
      'Anovulation — used to induce follicle growth when ovulation fails.',
      'Male infertility — supports spermatogenesis via Sertoli-cell FSH receptors.',
      'Gonadotropin family — shares an alpha subunit with LH, HCG, and TSH; specificity is in the beta subunit.',
      'Recombinant vs urinary — recombinant follitropin allows precise dosing vs older urine-derived menotropins.',
    ],
    faqs: [
      {
        q: 'What does FSH do?',
        a: 'Follicle-stimulating hormone drives the growth of ovarian follicles in women and supports sperm production in men. As recombinant follitropin it is the main drug used to stimulate the ovaries in IVF.',
      },
      {
        q: 'How is FSH related to HCG and LH?',
        a: 'They are all glycoprotein gonadotropins sharing the same alpha subunit; their unique beta subunits give them different jobs. FSH grows follicles, while LH and the LH-mimicking HCG trigger ovulation.',
      },
      {
        q: 'Why is FSH a glycoprotein biologic?',
        a: 'It is a two-subunit, heavily glycosylated protein whose sugar chains are essential to its activity and half-life. It is made in mammalian cells so glycosylation is human-like — not by peptide synthesis.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    molecularWeight: 30000,
    uniprotId: 'P01225',
    fdaApproved: true,
    storage:
      'Recombinant FSH products are refrigerated (2–8 °C) and protected from light and freezing; reconstituted/in-use pens follow the label’s window. Glycoprotein integrity is sensitive to heat and freeze–thaw.',
    handling:
      'A glycosylated heterodimer sensitive to heat, freezing, and agitation, which can dissociate the subunits or aggregate the protein and reduce potency.',
    synthesisNotes:
      'Recombinant follitropin is produced in mammalian (CHO) cells so its essential glycosylation is human-like; its ~30 kDa mass is approximate and varies with glycosylation, so it has no single molecular formula. Characterization is glycoprotein-grade — subunit identity, glycan/isoform profiling, and bioassay potency — well beyond an HPLC purity number.',
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
    molecularFormula: 'C16H30N4O4',
    pubchemCid: 125672,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'hgh-fragment-176-191',
    name: 'HGH Fragment 176-191',
    aliases: ['HGH Frag 176-191', 'hGH 176-191', 'Somatropin fragment 176-191'],
    categories: ['metabolic'],
    shortDescription:
      'The lipolytic C-terminal fragment of human growth hormone — the parent peptide that AOD-9604 was engineered from.',
    description:
      'HGH Fragment 176-191 is a 16-amino-acid piece of human growth hormone — residues 176 to 191, the C-terminal tail that carries GH’s fat-metabolizing activity. Isolated from the rest of the hormone, it is studied for lipolysis without the growth-promoting or blood-sugar effects of full GH, and it is the direct structural parent of the engineered analog AOD-9604.',
    mechanism:
      'Proposed β3-adrenergic-mediated lipolysis; does not bind the GH receptor or raise IGF-1.',
    researchAreas: ['Lipolysis', 'Obesity (preclinical)', 'Fat metabolism'],
    background: [
      'The idea behind HGH Fragment 176-191 is that growth hormone’s many effects are not all located in the same place on the molecule. Structure-activity work mapped GH’s fat-burning (lipolytic) activity to its C-terminal region, and the fragment spanning residues 176–191 was found to reproduce that effect on its own — while leaving behind the parts of GH responsible for growth signaling and the unwanted rise in blood glucose.',
      'That makes the fragment a kind of natural experiment: a way to ask whether GH’s lipolysis can be separated from everything else it does. It is closed by a single disulfide bond between its two cysteines, and it is the peptide from which AOD-9604 was derived — AOD-9604 simply swaps the fragment’s N-terminal residue for a tyrosine to improve stability. It is a research compound and is not FDA-approved.',
    ],
    keyResearch: [
      'Lipolytic domain — reproduces the fat-metabolizing activity mapped to GH’s C-terminal region, isolated from the rest of the hormone.',
      'No GH-receptor binding — studied for fat metabolism without the growth or glucose effects of full growth hormone or its IGF-1 rise.',
      'Parent of AOD-9604 — the direct structural precursor; AOD-9604 adds an N-terminal tyrosine to the same fragment for stability.',
      'Disulfide loop — a single Cys–Cys bond closes the peptide, its defining structural feature.',
      'Preclinical — not FDA-approved as a therapeutic.',
    ],
    faqs: [
      {
        q: 'What is HGH Fragment 176-191?',
        a: 'It is a 16-amino-acid piece of human growth hormone (residues 176–191) that carries GH’s fat-metabolizing activity, studied for lipolysis without GH’s growth or blood-sugar effects.',
      },
      {
        q: 'How does it relate to AOD-9604?',
        a: 'HGH Fragment 176-191 is the parent peptide; AOD-9604 is the engineered version, differing by an added N-terminal tyrosine that improves stability.',
      },
      {
        q: 'Does it raise IGF-1 like growth hormone?',
        a: 'No — the fragment is studied specifically because it reproduces GH’s lipolytic effect without binding the GH receptor or driving IGF-1.',
      },
      {
        q: 'Is it approved?',
        a: 'No — it is a research compound, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'FLRIVQCRSVEGSCGF',
    molecularWeight: 1799.1,
    molecularFormula: 'C78H123N23O22S2',
    cas: '66004-57-7',
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
    slug: 'adipotide',
    name: 'Adipotide',
    aliases: ['FTPP', 'Prohibitin-targeting peptide-1', 'CKGGRAKDC-GG-D(KLAKLAK)2'],
    categories: ['metabolic'],
    shortDescription:
      'A fat-targeting proapoptotic peptide that destroys the blood supply of white fat — striking in animals, but discontinued in humans for kidney toxicity.',
    description:
      'Adipotide (FTPP, "fat-targeted proapoptotic peptide") is a chimeric peptide designed to attack obesity from an unusual angle: instead of curbing appetite, it kills the blood vessels that feed white fat. One end is a homing sequence (CKGGRAKDC) that binds prohibitin on the vasculature of fat tissue; the other is a proapoptotic peptide that triggers cell death once delivered. In obese primates it produced rapid, striking fat loss — but its clinical development was halted over kidney toxicity.',
    mechanism:
      'A two-domain peptide: a cyclic CKGGRAKDC motif homes to prohibitin on white-adipose-tissue blood vessels, delivering a D(KLAKLAK)2 proapoptotic sequence that disrupts mitochondrial membranes and triggers apoptosis of the vascular endothelium feeding the fat.',
    researchAreas: ['Obesity (preclinical)', 'Targeted apoptosis', 'Adipose vasculature'],
    background: [
      'Adipotide is one of the boldest ideas in metabolic research: treat obesity like a tumor by cutting off its blood supply. Developed at MD Anderson Cancer Center by Renata Pasqualini and Wadih Arap, it is a chimera of two peptides. The targeting half, the cyclic nonapeptide CKGGRAKDC, recognizes prohibitin displayed on the endothelial cells of the vasculature that specifically supplies white adipose tissue. The payload half, a D-amino-acid proapoptotic sequence written D(KLAKLAK)2, is harmless outside cells but disrupts mitochondrial membranes once the targeting domain gets it inside — killing the fat’s blood vessels and, with them, the fat.',
      'In obese rhesus monkeys the results were dramatic: rapid loss of body weight and fat over a few weeks of treatment. But translating it to people ran into a hard limit. The same peptide accumulates in the kidney, and clinical development was discontinued (around 2019) because of nephrotoxicity — the gap between the fat-reducing dose and the kidney-damaging dose proved too narrow. Adipotide is not FDA-approved and is not in active clinical development; it remains an instructive, cautionary research compound.',
    ],
    keyResearch: [
      'Antiangiogenic mechanism — homes via prohibitin to the blood vessels feeding white fat and triggers their apoptosis, rather than acting on appetite.',
      'Two-domain design — a cyclic CKGGRAKDC targeting motif fused to a D(KLAKLAK)2 proapoptotic peptide.',
      'Primate results — produced rapid, marked weight and fat loss in obese rhesus monkeys.',
      'Discontinued for nephrotoxicity — clinical development halted (~2019); the therapeutic window against kidney toxicity was too narrow.',
      'Preclinical / not approved — a cautionary research compound, not FDA-approved.',
    ],
    faqs: [
      {
        q: 'What is Adipotide?',
        a: 'Adipotide (FTPP) is a fat-targeting proapoptotic peptide that kills the blood vessels supplying white fat, developed at MD Anderson and studied for obesity in animals.',
      },
      {
        q: 'How does it work?',
        a: 'A targeting sequence (CKGGRAKDC) homes to prohibitin on the vasculature of fat tissue and delivers a proapoptotic peptide that triggers those blood vessels to die — starving the fat rather than suppressing appetite.',
      },
      {
        q: 'Why was its development stopped?',
        a: 'Clinical development was discontinued (around 2019) because of kidney toxicity — the peptide accumulates in the kidney and the safe dose window proved too narrow. It is not approved.',
      },
      {
        q: 'Is Adipotide approved?',
        a: 'No — it is a preclinical research compound, discontinued in clinical development and not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'CKGGRAKDC-GG-D(KLAKLAK)2',
    molecularWeight: 2557.2,
    molecularFormula: 'C111H206N36O28S2',
    cas: '859216-15-2',
    pubchemCid: 163360068,
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
  {
    slug: 'glutathione',
    name: 'Glutathione',
    aliases: ['GSH', 'γ-Glu-Cys-Gly', 'reduced glutathione'],
    categories: ['mitochondrial', 'longevity'],
    shortDescription:
      'The body’s master antioxidant — a tripeptide (γ-Glu-Cys-Gly) sold as an injectable for antioxidant, detox, and skin-related use.',
    description:
      'Glutathione is the cell’s principal antioxidant: a tripeptide of glutamate, cysteine, and glycine that neutralizes reactive oxygen species and supports detoxification. It is one of the few genuine peptides in the antioxidant/cofactor group of this catalog, though it is usually thought of as a metabolite rather than a "peptide drug." On the grey market it is sold as an injectable and IV additive for antioxidant support, detoxification, and — especially — skin brightening, a popular use for which the evidence is weak.',
    mechanism:
      'A redox buffer — its cysteine thiol donates electrons to neutralize reactive oxygen species and is a substrate for glutathione peroxidases and S-transferases in detoxification; cycles between reduced (GSH) and oxidized (GSSG) forms.',
    researchAreas: ['Oxidative stress', 'Detoxification', 'Skin (depigmentation)', 'Mitochondrial protection'],
    background: [
      'Glutathione (GSH) is ubiquitous and essential — present in nearly every cell as the main line of defense against oxidative damage. Structurally it is a small tripeptide with one unusual feature: its glutamate is joined through its side-chain (γ) carboxyl rather than the normal backbone linkage, which protects it from ordinary peptidases. Its business end is the cysteine thiol, which donates electrons to quench reactive oxygen species and then recycles between reduced (GSH) and oxidized (GSSG) states.',
      'Because oxidative stress and declining glutathione are themes in aging and disease, it is widely sold — as oral, liposomal, and especially injectable / IV forms — for antioxidant support and detoxification. Its most popular grey-market use is cosmetic skin lightening, where it is marketed heavily despite thin and inconsistent clinical evidence and unclear safety for that purpose. It is included here as the rare true peptide among the antioxidant / cofactor compounds; it is a supplement and research reagent, not an FDA-approved drug for these uses.',
    ],
    keyResearch: [
      'Master antioxidant — the cell’s principal redox buffer, neutralizing reactive oxygen species via its cysteine thiol.',
      'Detoxification — a substrate for glutathione S-transferases and peroxidases that conjugate and clear toxins and peroxides.',
      'Skin depigmentation — its most popular grey-market use (injectable / IV), marketed for skin lightening on weak clinical evidence.',
      'γ-glutamyl structure — an unusual side-chain peptide bond that resists ordinary peptidases; cycles between GSH and GSSG.',
      'Not an approved drug for these uses — sold as a supplement / reagent; antioxidant and cosmetic claims are largely unproven.',
    ],
    faqs: [
      {
        q: 'What is glutathione?',
        a: 'Glutathione (GSH) is the body’s master antioxidant — a tripeptide of glutamate, cysteine, and glycine that neutralizes reactive oxygen species and supports detoxification.',
      },
      {
        q: 'Is glutathione a peptide?',
        a: 'Yes — it is a tripeptide (γ-Glu-Cys-Gly), one of the few true peptides among the antioxidant and cofactor compounds catalogued here, though it is usually thought of as a metabolite.',
      },
      {
        q: 'Does injectable glutathione lighten skin?',
        a: 'It is marketed heavily for skin lightening, but the clinical evidence is weak and inconsistent and its safety for that use is unclear. This page is a research and educational reference, not medical advice.',
      },
      {
        q: 'Is it FDA-approved?',
        a: 'No — it is sold as a supplement and research reagent, not an FDA-approved drug for antioxidant, detox, or cosmetic uses.',
      },
    ],
    sequence: 'γ-Glu-Cys-Gly',
    molecularWeight: 307.32,
    molecularFormula: 'C10H17N3O6S',
    cas: '70-18-8',
    pubchemCid: 124886,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'vasopressin',
    name: 'Vasopressin',
    aliases: ['Arginine vasopressin', 'AVP', 'Antidiuretic hormone', 'ADH', 'Vasostrict', 'Desmopressin (analog)'],
    categories: ['peptide-hormone'],
    shortDescription:
      'The body’s water-conservation hormone — a 9-amino-acid posterior-pituitary peptide, near-twin of oxytocin, used as a vasopressor and (as desmopressin) for diabetes insipidus.',
    description:
      'Vasopressin is a cyclic nonapeptide released from the posterior pituitary that controls how much water the kidney retains and constricts blood vessels. It differs from oxytocin by only two residues, yet does an entirely different job — a textbook example of how a tiny sequence change repurposes a hormone. In the clinic the native hormone (Vasostrict) is a vasopressor for refractory shock, while its engineered analog desmopressin (dDAVP) treats central diabetes insipidus, bedwetting, and some bleeding disorders.',
    mechanism:
      'Agonist at the V2 receptor in the renal collecting duct (inserting aquaporin-2 water channels to concentrate urine) and the V1a receptor on vascular smooth muscle (vasoconstriction). Desmopressin is V2-selective, giving the antidiuretic effect without the pressor action.',
    researchAreas: ['Diabetes insipidus', 'Vasodilatory shock', 'Osmoregulation', 'Peptide hormones'],
    background: [
      'Vasopressin and oxytocin are the two posterior-pituitary nonapeptides, structurally almost identical — they differ at only two of nine positions and share the same disulfide-closed ring — but functionally distinct. That near-identity is a classic illustration of how peptide hormones diversify: gene duplication of an ancestral nonapeptide, then a few substitutions that switch receptor preference and physiological role.',
      'Its central job is water balance. When the body is dehydrated, vasopressin tells the kidney to reabsorb water, concentrating the urine; failure of this signal — from the pituitary (central) or the kidney (nephrogenic) — causes diabetes insipidus, with copious dilute urine and thirst. The V2-selective analog desmopressin restores that signal in central diabetes insipidus and is also used for nocturnal enuresis and to raise clotting factors in mild hemophilia and von Willebrand disease.',
      'The native hormone’s second face is vascular. Through V1a receptors it constricts blood vessels, which is why a vasopressin infusion (Vasostrict) is used to raise blood pressure in septic and other vasodilatory shock when catecholamines alone are not enough. One molecule, two receptor systems, two very different clinical uses — selected apart by which analog you reach for.',
    ],
    keyResearch: [
      'Diabetes insipidus — desmopressin (V2-selective) replaces the antidiuretic signal in central DI; the disorder is the classic demonstration of the hormone’s role.',
      'Vasodilatory shock — native vasopressin is a second-line vasopressor (V1a-mediated) for septic and post-cardiotomy shock refractory to catecholamines.',
      'Hemostasis — desmopressin releases von Willebrand factor and factor VIII, used in mild hemophilia A and von Willebrand disease.',
      'Structure–function — two-residue difference from oxytocin reroutes receptor selectivity, a canonical peptide-hormone case study.',
      'Osmoregulation — the V2/aquaporin-2 axis is the molecular basis of renal water reabsorption.',
    ],
    faqs: [
      {
        q: 'What does vasopressin do?',
        a: 'It conserves body water by making the kidney reabsorb it (its "antidiuretic" action) and it constricts blood vessels. As a drug, native vasopressin is used as a vasopressor in shock, and its analog desmopressin treats central diabetes insipidus.',
      },
      {
        q: 'How is it related to oxytocin?',
        a: 'They are near-twins — both 9-amino-acid posterior-pituitary hormones that differ at only two positions — yet vasopressin governs water balance and blood pressure while oxytocin governs labor and bonding.',
      },
      {
        q: 'What is desmopressin?',
        a: 'Desmopressin (dDAVP) is a synthetic vasopressin analog engineered to act selectively at the V2 receptor, giving the water-retaining effect without raising blood pressure. It is used for central diabetes insipidus, bedwetting, and some bleeding disorders.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance. Vasopressin and its analogs are prescription medicines.',
      },
    ],
    sequence: 'CYFQNCPRG (1–6 disulfide, C-terminal amide)',
    molecularWeight: 1084.2,
    cas: '113-79-1',
    fdaApproved: true,
    synthesisNotes:
      'A nonapeptide built by solid-phase synthesis and then oxidatively folded to close its single 1–6 disulfide, with a C-terminal amide. The synthetically interesting object is the analog: desmopressin (dDAVP) re-engineers the hormone with a deaminated position 1 and a D-arginine at position 8 — a stereochemical substitution that resists aminopeptidase cleavage, strips out the V1a pressor activity, and extends the half-life. It is a compact lesson in how D-amino acids and end-group edits convert a labile hormone into a dosable drug. Identity and disulfide connectivity are the key release tests.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'somatostatin',
    name: 'Somatostatin',
    aliases: ['SST', 'Somatotropin release-inhibiting factor', 'SRIF', 'GHIH', 'Octreotide (analog)', 'Sandostatin'],
    categories: ['peptide-hormone', 'growth-hormone'],
    shortDescription:
      'The universal "off switch" — a cyclic hormone that inhibits growth hormone, insulin, glucagon, and gut secretions; its analog octreotide is the workhorse drug.',
    description:
      'Somatostatin is an inhibitory hormone with unusually broad reach: it suppresses the release of growth hormone, insulin, glucagon, gastrin, and a range of other pancreatic and gastrointestinal secretions. The endogenous 14-residue cyclic peptide has a half-life of only a couple of minutes, so the therapeutics that exploit its biology are stabilized analogs — octreotide (Sandostatin) and lanreotide — used for acromegaly and hormone-secreting neuroendocrine tumors.',
    mechanism:
      'Agonist at five somatostatin receptor subtypes (SSTR1–5), Gi-coupled, lowering cAMP and inhibiting hormone secretion across the pituitary, pancreatic islets, and GI tract. Octreotide is biased toward SSTR2/SSTR5, which carry the clinically useful growth-hormone- and tumor-suppressing effects.',
    researchAreas: ['Acromegaly', 'Neuroendocrine tumors', 'Growth hormone regulation', 'Peptide hormones'],
    background: [
      'Somatostatin is the body’s general inhibitory signal in the endocrine system. Discovered as the hypothalamic factor that blocks growth-hormone release (hence "growth-hormone-inhibiting hormone"), it turned out to be far more widely distributed — in pancreatic delta cells, throughout the gut, and in the nervous system — where it brakes the secretion of insulin, glucagon, gastrin, secretin, and more. It is the counterweight to the body’s many "go" signals.',
      'Its therapeutic problem is its virtue: it shuts off so much, so briefly. Native somatostatin is cleared within minutes, which makes the raw hormone impractical as a drug. The solution was engineering — octreotide is a synthetic eight-residue analog that keeps the essential receptor-binding core, resists degradation, and lasts long enough to dose. Long-acting depot formulations of octreotide and lanreotide now stretch that to monthly injections.',
      'Clinically these analogs are the standard medical therapy for acromegaly (growth-hormone excess) and for controlling the hormone-driven symptoms of neuroendocrine tumors such as carcinoid syndrome. The same broad inhibition also makes them useful in certain GI bleeding and secretory states. Somatostatin is the clearest example in this catalog of a hormone too short-lived to use directly, productively reborn as a stabilized analog.',
    ],
    keyResearch: [
      'Acromegaly — somatostatin analogs (octreotide, lanreotide) are first-line medical therapy to suppress excess growth hormone and IGF-1.',
      'Neuroendocrine tumors — control hormone-mediated symptoms (e.g. carcinoid syndrome) and can slow tumor progression; radiolabeled analogs also enable SSTR-targeted imaging and therapy.',
      'Broad endocrine inhibition — suppresses GH, insulin, glucagon, gastrin and other GI/pancreatic secretions via SSTR1–5.',
      'Analog engineering — octreotide distills the 14-residue hormone to a protease-resistant 8-residue peptide, the design that made the biology druggable.',
      'Short native half-life — endogenous somatostatin lasts only minutes, the reason the raw hormone is not used as a chronic therapy.',
    ],
    faqs: [
      {
        q: 'What is somatostatin?',
        a: 'A cyclic peptide hormone that broadly inhibits secretion — of growth hormone, insulin, glucagon, and many gut hormones. It acts as a general "off switch" across the endocrine and digestive systems.',
      },
      {
        q: 'Why is octreotide used instead of somatostatin itself?',
        a: 'Native somatostatin is cleared within minutes, too briefly to be a practical drug. Octreotide is a stabilized synthetic analog that keeps the key receptor-binding region but resists breakdown, so it can be dosed and even formulated as a long-acting depot.',
      },
      {
        q: 'What is it used to treat?',
        a: 'Its analogs are standard therapy for acromegaly and for controlling hormone-related symptoms of neuroendocrine tumors such as carcinoid syndrome. This page is a research and educational reference, not treatment guidance.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'AGCKNFFWKTFTSC (3–14 disulfide)',
    molecularWeight: 1637.9,
    cas: '38916-34-6',
    synthesisNotes:
      'A cyclic 14-mer requiring regioselective formation of the 3–14 disulfide after chain assembly. The native peptide is rarely the product worth making — its minutes-long half-life makes it impractical — so the synthetic target is octreotide: the 14-mer distilled to a protease-resistant 8-residue cyclic analog incorporating D-Phe and D-Trp and a reduced C-terminal threoninol. Those D-residue couplings and the controlled disulfide cyclization are the hard steps, and they are exactly what stretch the half-life from minutes to hours. A defining case of pharmacophore minimization in peptide drug design.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'calcitonin',
    name: 'Calcitonin (salmon)',
    aliases: ['Salmon calcitonin', 'Miacalcin', 'Fortical', 'sCT'],
    categories: ['peptide-hormone'],
    shortDescription:
      'A calcium-lowering hormone of the thyroid C-cells — the salmon form, far more potent than human, is used for hypercalcemia, Paget’s disease, and bone pain.',
    description:
      'Calcitonin is a 32-amino-acid hormone secreted by the thyroid’s parafollicular C-cells that lowers blood calcium — the functional opposite of parathyroid hormone. The therapeutic version is salmon calcitonin, which binds the human receptor far more potently and durably than the human peptide, a quirk of comparative endocrinology that made the fish hormone the drug of choice for hypercalcemia, Paget’s disease of bone, and osteoporosis-related bone pain.',
    mechanism:
      'Agonist at the calcitonin receptor (a GPCR) on osteoclasts, inhibiting bone resorption and thereby lowering serum calcium; it also increases renal calcium excretion. The net effect opposes parathyroid hormone in calcium homeostasis.',
    researchAreas: ['Hypercalcemia', 'Paget’s disease', 'Osteoporosis', 'Calcium regulation', 'Peptide hormones'],
    background: [
      'Calcitonin sits on the opposite side of calcium balance from parathyroid hormone (teriparatide, elsewhere in this catalog). PTH raises blood calcium; calcitonin lowers it by switching off the osteoclasts that dissolve bone. In normal human physiology calcitonin’s day-to-day role is relatively minor, but pharmacologically it became a useful brake on bone breakdown.',
      'The clinically interesting fact is species. Salmon calcitonin binds the human calcitonin receptor with much higher affinity and a longer-lasting effect than human calcitonin, so the marketed drug is the fish sequence, not the human one — a rare case where another species’ hormone is the better human therapeutic. It is available as injection and as a nasal spray (Miacalcin, Fortical).',
      'Its therapeutic niche has narrowed as more potent agents (bisphosphonates, denosumab, and the anabolic PTH analogs) took over osteoporosis, and long-term nasal-spray data raised a possible malignancy signal that tightened its labeling. Today calcitonin is mainly used short-term for hypercalcemia, for Paget’s disease, and notably for the acute bone pain of vertebral fracture, where it has a distinctive analgesic effect. It is a good example of an older hormone therapy repositioned around its remaining strengths.',
    ],
    keyResearch: [
      'Hypercalcemia — rapidly lowers elevated serum calcium by inhibiting osteoclastic bone resorption; used as short-term acute therapy.',
      'Paget’s disease of bone — reduces the accelerated bone turnover characteristic of the disease.',
      'Osteoporotic bone pain — has a recognized analgesic effect on acute pain from vertebral compression fractures.',
      'Cross-species potency — salmon calcitonin out-binds the human hormone at the human receptor, which is why the fish sequence is the drug.',
      'PTH counterpoint — physiologically opposes parathyroid hormone in calcium homeostasis.',
    ],
    faqs: [
      {
        q: 'What does calcitonin do?',
        a: 'It lowers blood calcium by inhibiting the osteoclasts that break down bone — the functional opposite of parathyroid hormone. As a drug it is used for hypercalcemia, Paget’s disease, and certain bone pain.',
      },
      {
        q: 'Why is salmon calcitonin used instead of the human hormone?',
        a: 'Salmon calcitonin binds the human calcitonin receptor more potently and for longer than human calcitonin, making the fish version the more effective therapeutic.',
      },
      {
        q: 'Is calcitonin still widely used?',
        a: 'Less than it once was. More potent bone agents have taken over much of osteoporosis care, and long-term nasal-spray safety data tightened its labeling, so it is now mostly used short-term for hypercalcemia, Paget’s disease, and acute fracture pain.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'CSNLSTCVLGKLSQELHKLQTYPRTNTGSGTP (1–7 disulfide, C-terminal amide; salmon)',
    molecularWeight: 3431.9,
    cas: '47931-85-1',
    fdaApproved: true,
    synthesisNotes:
      'A 32-residue chain with an N-terminal 1–7 disulfide ring and a C-terminal amide — long by solid-phase standards and prone to on-resin aggregation, so it demands careful coupling, pseudoproline/backbone-protection strategy, and a controlled oxidation step to set the disulfide cleanly. Notably the manufacturing target is the salmon sequence, not the human one, because it binds the human receptor far more potently: a case where pharmacology, not species, dictates what you synthesize. Purity is dominated by deletion sequences and disulfide isomers.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'amylin',
    name: 'Amylin',
    aliases: ['IAPP', 'Islet amyloid polypeptide', 'Pramlintide (analog)', 'Symlin'],
    categories: ['peptide-hormone', 'metabolic'],
    shortDescription:
      'The pancreas’s second satiety hormone — co-secreted with insulin from the beta cell; its stabilized analog pramlintide treats diabetes, and the class now drives a new wave of obesity drugs.',
    description:
      'Amylin is a 37-amino-acid hormone released alongside insulin from the pancreatic beta cells, where it slows gastric emptying, suppresses glucagon, and promotes satiety — complementing insulin’s glucose-lowering action. Native human amylin is sticky and aggregation-prone (it forms the islet amyloid seen in type 2 diabetes), so the therapeutic is the soluble analog pramlintide (Symlin); the longer-acting analog cagrilintide, profiled separately in this catalog, has pushed the class to the front of obesity drug development.',
    mechanism:
      'Agonist at the amylin receptor (a calcitonin-receptor core complexed with receptor-activity-modifying proteins, RAMPs). It slows gastric emptying, suppresses postprandial glucagon, and acts centrally to reduce food intake.',
    researchAreas: ['Type 1 diabetes', 'Type 2 diabetes', 'Obesity', 'Satiety signaling', 'Peptide hormones'],
    background: [
      'Insulin is famous; the hormone the beta cell co-secretes with it is not. Amylin (islet amyloid polypeptide) is released in the same secretory granules and handles the parts of glucose control insulin does not: it puts a brake on gastric emptying so nutrients arrive more slowly, it suppresses the inappropriate glucagon that drives post-meal sugar spikes, and it signals fullness to the brain. In effect amylin and insulin are a co-secreted pair, much as glucagon is insulin’s counter-hormone.',
      'The molecule has a notorious second identity. Human amylin is amyloidogenic — it misfolds and aggregates into the islet amyloid deposits found in type 2 diabetes, which is both a manufacturing headache and a disease-relevant feature. That stickiness is why the native hormone cannot simply be bottled: pramlintide swaps three residues (prolines that block aggregation) to create a stable, soluble analog usable as an injectable adjunct to insulin in type 1 and type 2 diabetes.',
      'The forward-looking story is obesity. Because amylin signaling curbs appetite through a pathway distinct from the incretins, long-acting amylin analogs — led by cagrilintide — are being combined with GLP-1 drugs (e.g. cagrilintide plus semaglutide) and are posting some of the largest weight-loss figures in current trials. Amylin is a hormone that spent decades as insulin’s overlooked partner and is now a primary target in its own right.',
    ],
    keyResearch: [
      'Diabetes adjunct — pramlintide, the stabilized analog, is used with mealtime insulin in type 1 and type 2 diabetes to blunt post-meal glucose and aid weight control.',
      'Obesity — long-acting analogs (cagrilintide) combined with GLP-1 agonists are among the most effective weight-loss combinations in development.',
      'Satiety and gastric emptying — slows stomach emptying and suppresses glucagon, complementing insulin rather than duplicating it.',
      'Islet amyloid — native human amylin aggregates into the amyloid deposits characteristic of type 2 diabetes, the reason a substituted analog is required.',
      'Receptor biology — signals through calcitonin-receptor/RAMP complexes, linking it mechanistically to the calcitonin family.',
    ],
    faqs: [
      {
        q: 'What is amylin?',
        a: 'A hormone co-secreted with insulin from the pancreatic beta cells that slows gastric emptying, suppresses glucagon, and promotes satiety — handling parts of glucose control that insulin does not.',
      },
      {
        q: 'What is pramlintide?',
        a: 'Pramlintide (Symlin) is a synthetic amylin analog with three amino-acid substitutions that prevent the aggregation seen with native human amylin, making it stable enough to use as an injectable add-on to insulin.',
      },
      {
        q: 'Why is amylin important for weight loss?',
        a: 'Amylin curbs appetite through a pathway separate from the GLP-1 incretins, so long-acting amylin analogs such as cagrilintide — especially combined with GLP-1 drugs — produce large weight-loss effects in trials.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'KCNTATCATQRLANFLVHSSNNFGAILSSTNVGSNTY (2–7 disulfide, C-terminal amide; human)',
    molecularWeight: 3903.3,
    cas: '122384-88-7',
    synthesisNotes:
      'A 37-residue, 2–7-disulfide, C-terminal-amide peptide and one of the hardest sequences in this class to make: native human amylin is intrinsically amyloidogenic, so it aggregates on the resin and in solution. The therapeutic pramlintide is the design answer — three proline substitutions (Ala25, Ser28, Ser29 → Pro) that break the β-sheet stacking, simultaneously making the peptide synthesizable, soluble, and shelf-stable. It is the catalog’s clearest example of engineering *against* aggregation to obtain a manufacturable peptide; the longer-acting analog cagrilintide (profiled separately) extends the same logic.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'acth',
    name: 'ACTH (Corticotropin)',
    aliases: ['Adrenocorticotropic hormone', 'Corticotropin', 'Acthar', 'Cosyntropin (1–24 analog)', 'Tetracosactide'],
    categories: ['peptide-hormone'],
    shortDescription:
      'The pituitary’s command to the adrenal gland — a 39-amino-acid hormone that drives cortisol release; its 1–24 fragment is the standard test of adrenal function.',
    description:
      'ACTH is a 39-amino-acid hormone released by the anterior pituitary that tells the adrenal cortex to make cortisol — the central relay of the body’s stress (HPA) axis. Clinically it appears in two forms: the full-length hormone as a long-acting gel (Acthar) used in select inflammatory and seizure conditions, and the synthetic 1–24 fragment cosyntropin (tetracosactide), which carries all the receptor activity and is the standard agent for testing adrenal reserve.',
    mechanism:
      'Agonist at the melanocortin-2 receptor (MC2R) on adrenocortical cells, raising cAMP and stimulating steroidogenesis — chiefly cortisol — from the adrenal cortex. The biologically essential activity resides in the N-terminal 1–24 residues.',
    researchAreas: ['Adrenal insufficiency', 'HPA axis', 'Infantile spasms', 'Peptide hormones'],
    background: [
      'ACTH is the middle link in the hypothalamic–pituitary–adrenal axis: the hypothalamus releases CRH, the pituitary responds with ACTH, and ACTH drives the adrenal cortex to secrete cortisol, which then feeds back to shut the loop. It is cleaved from a larger precursor, proopiomelanocortin (POMC), the same parent that yields melanocyte-stimulating hormone — which is why high ACTH states can darken the skin.',
      'Only the first 24 of its 39 residues are needed for full biological activity, and that fact is the basis of its main diagnostic use. Cosyntropin (synthetic ACTH 1–24) is given in the "ACTH stimulation test": a healthy adrenal gland responds with a brisk rise in cortisol, whereas a blunted response reveals adrenal insufficiency. The trimmed fragment is cheaper, fully active, and less immunogenic than the whole hormone.',
      'The full-length hormone has a separate, more debated life as a therapeutic. Long-acting corticotropin gel (Acthar) is used in conditions such as infantile spasms and certain flares of autoimmune disease, on the rationale that it does more than simply raise cortisol — including direct melanocortin-receptor effects. Its high cost relative to conventional steroids has made it a recurring subject of pricing scrutiny, another instance where the economics around a hormone are as notable as its biology.',
    ],
    keyResearch: [
      'Adrenal function testing — cosyntropin (ACTH 1–24) is the standard stimulus in the ACTH stimulation test for adrenal insufficiency.',
      'HPA axis — the pituitary signal that drives adrenal cortisol output; central to stress physiology and its feedback regulation.',
      'Infantile spasms — corticotropin gel is an established treatment for this severe infantile epilepsy.',
      'Structure–function — biological activity lives in the N-terminal 1–24 residues, the basis of the synthetic diagnostic fragment.',
      'POMC family — cleaved from the same precursor as MSH, explaining the skin hyperpigmentation of ACTH excess.',
    ],
    faqs: [
      {
        q: 'What does ACTH do?',
        a: 'ACTH (corticotropin) is a pituitary hormone that signals the adrenal cortex to release cortisol. It is the pituitary-to-adrenal step of the body’s stress (HPA) axis.',
      },
      {
        q: 'What is cosyntropin?',
        a: 'Cosyntropin (tetracosactide) is the synthetic first 24 amino acids of ACTH — the portion that carries all the activity. It is used in the ACTH stimulation test to assess whether the adrenal glands respond normally.',
      },
      {
        q: 'Why is corticotropin gel controversial?',
        a: 'The long-acting full-length hormone (Acthar) is used in conditions like infantile spasms and some autoimmune flares, but its very high cost relative to conventional corticosteroids has made it a frequent subject of pricing scrutiny.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'SYSMEHFRWGKPVGKKRRPVKVYPNGAEDESAEAFPLEF (human 1–39)',
    molecularWeight: 4541.1,
    cas: '9002-60-2',
    fdaApproved: true,
    synthesisNotes:
      'A 39-residue hormone whose full biological activity lives in the N-terminal 1–24 segment — so the synthetic agent cosyntropin (tetracosactide) is simply that 24-mer. Truncating to the essential pharmacophore makes it markedly shorter and cheaper to build by solid-phase synthesis, avoids the difficult C-terminal residues, and lowers immunogenicity versus the whole hormone. A textbook "synthesize only the part that matters" decision in peptide drug design.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'secretin',
    name: 'Secretin',
    aliases: ['ChiRhoStim', 'human secretin'],
    categories: ['peptide-hormone'],
    shortDescription:
      'The first hormone ever discovered — the 1902 gut peptide that coined the word "hormone"; today a diagnostic agent for the pancreas.',
    description:
      'Secretin is a 27-amino-acid hormone of the upper small intestine that signals the pancreas and bile ducts to release bicarbonate-rich fluid, neutralizing stomach acid as it enters the duodenum. Its historical importance is hard to overstate: discovered by Bayliss and Starling in 1902, it was the first chemical messenger ever identified, and Starling coined the very word "hormone" to describe it. Synthetic human secretin (ChiRhoStim) is used today mainly as a diagnostic stimulant in pancreatic-function and imaging tests.',
    mechanism:
      'Agonist at the secretin receptor (a class B GPCR) on pancreatic duct and biliary cells, raising cAMP and stimulating secretion of water and bicarbonate. It also modestly inhibits gastric acid and gastric emptying.',
    researchAreas: ['Pancreatic function testing', 'Gastrointestinal physiology', 'Gastrinoma diagnosis', 'Peptide hormones'],
    background: [
      'Secretin is where endocrinology begins. In 1902 William Bayliss and Ernest Starling showed that acid in the small intestine triggers pancreatic secretion even when all the nerves are cut — proof that a blood-borne chemical, not a nerve, carried the message. Starling later named this new class of messengers "hormones," from the Greek for "to set in motion." Secretin is therefore both a working hormone and the founding object of the entire field, which is reason enough for it to anchor this category historically.',
      'Physiologically it is a bicarbonate hormone. Released by S-cells of the duodenum when acidic chyme arrives, secretin drives the pancreas and bile ducts to pour out an alkaline, bicarbonate-rich fluid that protects the intestinal lining and creates the neutral pH that digestive enzymes need. It belongs to the secretin/glucagon/VIP superfamily, sharing a structural template with several other gut and metabolic hormones in this catalog.',
      'Its modern role is diagnostic rather than therapeutic. Synthetic human secretin is given to stimulate pancreatic output during function testing and secretin-enhanced MRCP imaging, and to provoke gastrin release in the diagnosis of gastrinoma (Zollinger–Ellison syndrome). A once-fashionable hypothesis that secretin might treat autism was tested in controlled trials and clearly failed — a useful, honest footnote to a hormone whose real value is as a precise diagnostic tool.',
    ],
    keyResearch: [
      'Historical first — the first hormone ever discovered (Bayliss & Starling, 1902); the molecule that gave the word "hormone" to science.',
      'Pancreatic-function testing — synthetic secretin stimulates pancreatic bicarbonate output, used in function tests and secretin-enhanced MRCP.',
      'Gastrinoma diagnosis — the secretin stimulation test paradoxically raises gastrin in Zollinger–Ellison syndrome, aiding diagnosis.',
      'Bicarbonate physiology — duodenal S-cells release it in response to acid, triggering alkaline pancreatic/biliary secretion.',
      'Autism hypothesis refuted — controlled trials of secretin for autism showed no benefit, a clear negative result.',
    ],
    faqs: [
      {
        q: 'What does secretin do?',
        a: 'It signals the pancreas and bile ducts to release bicarbonate-rich fluid that neutralizes stomach acid entering the small intestine. It is released by the duodenum in response to acid.',
      },
      {
        q: 'Why is secretin historically important?',
        a: 'It was the first hormone ever discovered (1902), and its discovery prompted Ernest Starling to coin the word "hormone." It effectively founded the science of endocrinology.',
      },
      {
        q: 'What is secretin used for now?',
        a: 'Mainly diagnosis — stimulating pancreatic secretion for function tests and MRCP imaging, and provoking gastrin release to diagnose gastrinoma. A past idea that it could treat autism was tested and disproven.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'HSDGTFTSELSRLREGARLQRLLQGLV (C-terminal amide; human)',
    molecularWeight: 3039.4,
    synthesisNotes:
      'A 27-residue C-terminal-amide peptide of the secretin/glucagon/VIP family, made by solid-phase synthesis with a terminal amidation step. The meaningful modern change is provenance rather than chemistry: the clinical agent (synthetic human secretin, ChiRhoStim) replaced earlier porcine material extracted from animal tissue. That shift — from variable animal extract to a defined, sequence-verified synthetic product with a certificate of analysis — is the core quality story for older hormone peptides and exactly the transparency this catalog tracks.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'vip',
    name: 'VIP (Vasoactive Intestinal Peptide)',
    aliases: ['Vasoactive Intestinal Peptide', 'Aviptadil', 'VIP'],
    categories: ['peptide-hormone', 'immune'],
    shortDescription:
      'A 28-amino-acid neuropeptide and gut hormone with broad anti-inflammatory and vasodilatory activity — studied in chronic inflammatory illness and, as aviptadil, in the lung.',
    description:
      'Vasoactive intestinal peptide (VIP) is a 28-residue neuropeptide of the secretin/glucagon/VIP superfamily, released by nerves throughout the gut, lungs, and brain. It is a potent vasodilator and a broad anti-inflammatory and immunomodulatory signal, acting at the VPAC1 and VPAC2 receptors. Its synthetic form, aviptadil, has been investigated for pulmonary conditions, and VIP is used on the grey market as a nasal spray in chronic inflammatory illness protocols.',
    mechanism:
      'Agonist at the VPAC1 and VPAC2 receptors (class B GPCRs), raising cAMP; produces vasodilation, bronchodilation, and a broad anti-inflammatory / immunomodulatory shift.',
    researchAreas: ['Chronic inflammatory response syndrome', 'Anti-inflammatory / immune modulation', 'Pulmonary arterial hypertension', 'Sarcoidosis'],
    background: [
      'VIP is one of the body’s master anti-inflammatory signals. A 28-amino-acid member of the secretin/glucagon/VIP superfamily — a structural cousin of secretin and PACAP — it is released by nerve endings across the gastrointestinal tract, lungs, and central nervous system, where it relaxes smooth muscle, widens blood vessels, and damps down inflammatory immune activity by shifting cells away from a pro-inflammatory state.',
      'That anti-inflammatory breadth is the basis of its research interest. Its synthetic equivalent, aviptadil, has been studied in pulmonary arterial hypertension, sarcoidosis, and acute respiratory failure. Separately, VIP has developed a following in the chronic inflammatory response syndrome (CIRS) community, where an intranasal form is used in the later stages of the mold-illness protocol popularized by Ritchie Shoemaker — a use that is neither FDA-approved nor validated by large trials. VIP is not FDA-approved; its C-terminus is amidated, a modification essential to its receptor activity.',
    ],
    keyResearch: [
      'Broad anti-inflammatory signal — shifts immune activity away from a pro-inflammatory state via VPAC1 / VPAC2 receptors, a basis for its use in inflammatory conditions.',
      'Vasodilation & lung — a potent vasodilator; the synthetic form aviptadil has been trialed in pulmonary arterial hypertension and acute respiratory failure.',
      'CIRS / mold-illness protocols — an intranasal form is used in the later stages of the Shoemaker CIRS protocol, a grey-market use not validated by large trials.',
      'Secretin/glucagon/VIP family — a structural relative of secretin and PACAP, sharing the class B GPCR template.',
      'Not FDA-approved — investigational; the C-terminal amide is required for activity.',
    ],
    faqs: [
      {
        q: 'What is VIP?',
        a: 'Vasoactive intestinal peptide is a 28-amino-acid neuropeptide and gut hormone that dilates blood vessels and broadly damps inflammation, acting at the VPAC1 and VPAC2 receptors.',
      },
      {
        q: 'What is VIP studied for?',
        a: 'Anti-inflammatory and immune modulation, pulmonary conditions (as aviptadil), and — on the grey market — chronic inflammatory response syndrome (CIRS) via an intranasal form.',
      },
      {
        q: 'What is the CIRS / mold connection?',
        a: 'Intranasal VIP is used in the later stages of the Shoemaker CIRS ("mold illness") protocol. This is not an FDA-approved use and is not validated by large controlled trials.',
      },
      {
        q: 'Is VIP approved?',
        a: 'No — VIP (and its synthetic form aviptadil) is investigational, not FDA-approved. This page is a research and educational reference.',
      },
    ],
    sequence: 'HSDAVFTDNYTRLRKQMAVKKYLNSILN-NH2',
    molecularWeight: 3326.8,
    molecularFormula: 'C147H237N43O43S',
    cas: '37221-79-7',
    pubchemCid: 53314964,
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
  {
    slug: 'ghrelin',
    name: 'Ghrelin',
    aliases: ['Lenomorelin', 'the hunger hormone', 'acyl-ghrelin'],
    categories: ['peptide-hormone', 'growth-hormone'],
    shortDescription:
      'The only hormone that makes you hungry — a stomach peptide, uniquely fatty-acid-modified, that drives appetite and also releases growth hormone.',
    description:
      'Ghrelin is a 28-amino-acid hormone made mainly in the stomach and best known as the body’s principal hunger signal — levels rise before meals and fall after eating. It is biochemically unusual: it requires an octanoyl (C8 fatty-acid) group attached to its third residue to be active, the only known hormone modified this way. Beyond appetite, ghrelin is a potent releaser of growth hormone, which links it to the secretagogue peptides elsewhere in this catalog.',
    mechanism:
      'Agonist at the growth-hormone secretagogue receptor (GHSR-1a). The octanoyl modification (added by the enzyme GOAT) is required for receptor binding. Activation stimulates appetite via hypothalamic NPY/AgRP neurons and triggers growth-hormone release from the pituitary.',
    researchAreas: ['Appetite regulation', 'Growth hormone regulation', 'Cachexia', 'Energy balance', 'Peptide hormones'],
    background: [
      'Almost every appetite hormone tells you to stop eating; ghrelin is the one that tells you to start. Secreted by the stomach when it is empty, it rises in the run-up to a meal, drives the sensation of hunger through hypothalamic feeding circuits, and falls once you have eaten. That makes it the orexigenic counterweight to satiety hormones like leptin, amylin, and the incretins — and a natural target for the opposite therapeutic goal: stimulating appetite in wasting conditions.',
      'Its defining oddity is chemical. Ghrelin is the only human hormone known to carry an O-acyl fatty-acid modification — an octanoyl group esterified to the serine at position 3 by a dedicated enzyme (ghrelin O-acyltransferase, GOAT). Without that fatty acid the peptide cannot activate its receptor. This makes the GOAT enzyme an unusual drug target and the acylation a defining feature of how the hormone is studied and measured (acyl- versus des-acyl ghrelin).',
      'Ghrelin’s second action is on growth hormone: it is the endogenous ligand of the growth-hormone secretagogue receptor, the same receptor hit by synthetic GHRPs such as ipamorelin and hexarelin found elsewhere in this catalog — so ghrelin is, in effect, the natural template those drugs imitate. Therapeutically the interest runs toward appetite stimulation: ghrelin-receptor agonists (anamorelin, relamorelin) have been studied for cancer cachexia and gastroparesis, making the hunger hormone a candidate where too little appetite is the problem.',
    ],
    keyResearch: [
      'Appetite — the principal circulating hunger signal; rises before meals and stimulates feeding via hypothalamic NPY/AgRP neurons.',
      'Growth hormone — the endogenous ligand of GHSR-1a, the receptor targeted by synthetic secretagogues (ipamorelin, hexarelin).',
      'Cachexia — ghrelin-receptor agonists (anamorelin) studied to stimulate appetite and lean mass in cancer-related wasting.',
      'Unique acylation — the only human hormone requiring an octanoyl fatty-acid modification (via GOAT) for activity; the enzyme is a distinctive drug target.',
      'Energy balance — acts opposite to satiety hormones such as leptin and amylin in body-weight regulation.',
    ],
    faqs: [
      {
        q: 'What is ghrelin?',
        a: 'A stomach-derived hormone that is the body’s main hunger signal — it rises before meals to stimulate appetite and falls after eating. It also triggers growth-hormone release.',
      },
      {
        q: 'Why is ghrelin chemically unusual?',
        a: 'It is the only known human hormone that needs a fatty-acid (octanoyl) group attached to one of its residues to work. The enzyme that adds it, GOAT, is a distinctive potential drug target.',
      },
      {
        q: 'How is ghrelin related to growth-hormone peptides?',
        a: 'Ghrelin is the natural ligand of the growth-hormone secretagogue receptor — the same receptor that synthetic GHRPs like ipamorelin and hexarelin activate. Those drugs essentially mimic ghrelin’s growth-hormone action.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No — this is a research and educational reference, not dosing guidance.',
      },
    ],
    sequence: 'GSSFLSPEHQRVQQRKESKKPPAKLQPR (Ser3 O-octanoylated; human)',
    molecularWeight: 3370.9,
    cas: '304853-26-7',
    synthesisNotes:
      'The standout synthetic challenge in this class: activity requires an O-octanoyl ester on the Ser3 hydroxyl — the only such acylation among human hormones (installed biologically by ghrelin O-acyltransferase, GOAT). Standard solid-phase synthesis assembles the 28-mer, but installing and preserving the acid- and base-labile octanoyl ester demands orthogonal side-chain protection and a deliberately mild final deprotection/cleavage, since the unmodified by-product (des-acyl ghrelin) is inactive. The acylation is the purity-defining step, and acyl-vs-des-acyl ratio is the assay that matters most.',
    market: { trackedSuppliers: 0, trackedVariants: 0, certificatesOnFile: 0 },
  },
]

export const PEPTIDES: Peptide[] = SEED_PEPTIDES.map(enrich)

/**
 * The curated set shown in forward-facing browse surfaces (catalog grid,
 * category pages, compounds hub, homepage counts). Excludes `unlisted`
 * entries — those remain in PEPTIDES for the sitemap, monograph pages,
 * text search, the API, and llms.txt.
 */
export const LISTED_PEPTIDES: Peptide[] = PEPTIDES.filter((p) => !p.unlisted)

export function getPeptideBySlug(slug: string): Peptide | undefined {
  return PEPTIDES.find((p) => p.slug === slug)
}

export function getPeptidesByCategory(category: PeptideCategory): Peptide[] {
  return PEPTIDES.filter((p) => p.categories.includes(category))
}

export function getCategoryLabel(id: PeptideCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
