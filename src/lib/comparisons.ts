// Programmatic comparison engine.
//
// Each "X vs Y" page is now data, not a bespoke 600-line file: the dynamic
// route at /compare/[pair] renders this model + catalog chemistry + verified
// PubChem provenance + the shared EvidenceContext module. Add a comparison by
// appending an entry here — no new page file.

export interface CompareRow {
  dim: string
  a: string
  b: string
}

export interface CompareTable {
  title: string
  rows: CompareRow[]
  note?: string
}

export interface CompareColumns {
  title: string
  columns: { heading: string; accent: 'a' | 'b' | 'neutral'; points: string[] }[]
}

export interface CompareProse {
  title: string
  paragraphs: string[]
}

export interface CompareTrial {
  name: string
  arm: string
  n?: string
  duration?: string
  endpoint?: string
  result: string
  note?: string
}

export interface Comparison {
  slug: string
  /** Catalog peptide slugs — used for verified-PubChem provenance + chemistry. */
  aSlug?: string
  bSlug?: string
  aName: string
  bName: string
  /** Hero pills, e.g. "GLP-1R · FDA approved". */
  aPill: string
  bPill: string
  metaTitle: string
  metaDescription: string
  keywords?: string[]
  /** ISO date (YYYY-MM-DD) of last editorial review; drives freshness schema + the visible stamp. */
  updated?: string
  breadcrumb: { label: string; href: string }
  headline: string
  intro: string[]
  atAGlance: CompareRow[]
  columnSections?: CompareColumns[]
  proseSections?: CompareProse[]
  trials?: CompareTrial[]
  tables?: CompareTable[]
  verdict?: { title: string; paragraphs: string[] }
  faqs: { q: string; a: string }[]
  /** Research-area slugs — feed EvidenceContext + cross-links. */
  relatedAreas?: string[]
  /** JSON-LD Drug entries for `about`. */
  about?: { name: string; alternateName?: string }[]
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'semaglutide-vs-tirzepatide',
    aSlug: 'semaglutide',
    bSlug: 'tirzepatide',
    aName: 'Semaglutide',
    bName: 'Tirzepatide',
    aPill: 'GLP-1R · FDA approved',
    bPill: 'GIP/GLP-1R · FDA approved',
    metaTitle:
      'Semaglutide vs Tirzepatide — Mechanism, Trials & Clinical Differences | AmericanPeptide.com',
    metaDescription:
      'Research comparison of semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound) — mechanism differences (GLP-1R mono vs GIP/GLP-1R dual agonism), head-to-head trial data, synthesis complexity, and the case for retatrutide.',
    keywords: [
      'semaglutide vs tirzepatide',
      'ozempic vs mounjaro',
      'wegovy vs zepbound',
      'GLP-1 vs dual agonist',
      'SURMOUNT-5 results',
      'incretin comparison',
    ],
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'mechanism, trials, and key differences',
    intro: [
      'Both are once-weekly incretin agonists approved for type 2 diabetes and obesity — but different receptor targets, trial outcomes, and synthesis profiles distinguish them. This page covers what the research actually shows.',
    ],
    atAGlance: [
      { dim: 'Generic name', a: 'Semaglutide', b: 'Tirzepatide' },
      { dim: 'Brand names', a: 'Ozempic · Wegovy · Rybelsus', b: 'Mounjaro · Zepbound' },
      { dim: 'Developer', a: 'Novo Nordisk', b: 'Eli Lilly' },
      { dim: 'Receptor targets', a: 'GLP-1R only', b: 'GIP-R + GLP-1R' },
      { dim: 'Agonism class', a: 'Mono-agonist', b: 'Dual-agonist ("twincretin")' },
      { dim: 'Chain length', a: '31 amino acids', b: '39 amino acids' },
      { dim: 'Half-life', a: '~168 h (once-weekly)', b: '~120 h (once-weekly)' },
      { dim: 'Approved: T2D', a: 'Yes (2017, Ozempic)', b: 'Yes (2022, Mounjaro)' },
      { dim: 'Approved: obesity', a: 'Yes (2021, Wegovy)', b: 'Yes (2023, Zepbound)' },
      { dim: 'Peak weight ↓ (pivotal)', a: '~15% (STEP-1, 2.4 mg)', b: '~22% (SURMOUNT-1, 15 mg)' },
      { dim: 'Head-to-head weight ↓', a: '~13% (SURMOUNT-5)', b: '~21% (SURMOUNT-5)' },
      { dim: 'CV outcome trial', a: 'SELECT (MACE reduction confirmed)', b: 'SURPASS-CVOT (non-inferior vs sema)' },
    ],
    columnSections: [
      {
        title: 'How the mechanisms differ',
        columns: [
          {
            heading: 'GLP-1R agonism (shared)',
            accent: 'neutral',
            points: [
              'Glucose-dependent insulin secretion from pancreatic β-cells',
              'Glucagon suppression from α-cells',
              'Slowed gastric emptying → prolonged satiety',
              'Hypothalamic appetite suppression via CNS GLP-1 receptors',
            ],
          },
          {
            heading: 'GIP-R agonism (tirzepatide only)',
            accent: 'b',
            points: [
              'Complementary insulinotropic signal through pancreatic GIPR',
              'Adipose-tissue signaling via GIPR — studied for lipid handling',
              'CNS GIP receptors reported to contribute to satiety in rodent work',
              'Dual-receptor engagement is the proposed basis for superior weight endpoints',
            ],
          },
        ],
      },
    ],
    trials: [
      { name: 'STEP-1', arm: 'Semaglutide 2.4 mg', n: '1961', duration: '68 wk', endpoint: 'Mean body-weight change', result: '−14.9% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Wegovy' },
      { name: 'SURMOUNT-1', arm: 'Tirzepatide 15 mg', n: '2539', duration: '72 wk', endpoint: 'Mean body-weight change', result: '−22.5% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Zepbound' },
      { name: 'SURMOUNT-5', arm: 'Tirz 15 mg vs Sema 2.4 mg', n: '~750', duration: '72 wk', endpoint: 'Head-to-head weight change', result: '~21% (tirz) vs ~13% (sema)', note: 'Direct head-to-head; tirzepatide superior on primary endpoint' },
      { name: 'SELECT', arm: 'Semaglutide 2.4 mg', n: '17604', duration: '~5 yr', endpoint: 'MACE (CV outcome)', result: '20% MACE reduction vs placebo', note: 'Established CV benefit in obesity without T2D' },
      { name: 'SURPASS-CVOT', arm: 'Tirzepatide vs Sema 1 mg', n: '~14000', duration: 'Reported ~2024', endpoint: 'MACE non-inferiority', result: 'Non-inferior; full results pending', note: 'Comparator is diabetes-dose sema, not Wegovy dose' },
    ],
    tables: [
      {
        title: 'Synthesis & manufacturing',
        note: 'A credible certificate of analysis is the minimum bar for research-grade material of either compound.',
        rows: [
          { dim: 'Chain length', a: '31 AA', b: '39 AA — more coupling cycles, more deletion impurities' },
          { dim: 'Acylation', a: 'C18 fatty-diacid on Lys34 (γGlu/mini-PEG linker)', b: 'C20 fatty-diacid on Lys26 (modified linker)' },
          { dim: 'Receptor design', a: 'Native GLP-1 backbone with Aib substitutions', b: 'Chimeric GIP/GLP-1 — de novo pharmacophore' },
          { dim: 'Analytical', a: 'RP-HPLC + SEC + MS', b: 'Same, plus more complex impurity profile' },
        ],
      },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'On weight reduction, tirzepatide’s dual GIP/GLP-1 agonism outperforms semaglutide’s GLP-1 mono-agonism in both pivotal trials and the direct SURMOUNT-5 head-to-head. Semaglutide has the more mature cardiovascular-outcome evidence (SELECT). These are population means from trial data, not predictions for any individual.',
        'The trajectory continues with retatrutide (LY3437943), an investigational triple agonist that adds glucagon-receptor agonism and reported ~24% mean weight reduction in Phase 2 — exceeding both, but not FDA-approved.',
      ],
    },
    faqs: [
      { q: 'What is the main difference between semaglutide and tirzepatide?', a: 'Semaglutide activates only the GLP-1 receptor (mono-agonism). Tirzepatide simultaneously activates both the GIP and GLP-1 receptors (dual agonism). This additional GIP-receptor engagement is associated with larger body-weight reductions in both placebo-controlled and direct head-to-head trials.' },
      { q: 'Which produces more weight loss — semaglutide or tirzepatide?', a: 'In the SURMOUNT-5 direct head-to-head trial, tirzepatide 15 mg achieved approximately 21% mean body-weight reduction vs approximately 13% for semaglutide 2.4 mg over 72 weeks. The difference was statistically significant on the primary endpoint. Individual responses vary, and these are population means — not predictions for any individual.' },
      { q: 'Are Ozempic and Mounjaro the same as Wegovy and Zepbound?', a: 'Ozempic and Wegovy are both semaglutide at different doses: Ozempic (≤2 mg) for type 2 diabetes; Wegovy (2.4 mg) for chronic weight management. Mounjaro (≤15 mg) is tirzepatide for type 2 diabetes and Zepbound is tirzepatide for weight management. The active compound is the same in each pair; dose, labeling, and FDA indication differ.' },
      { q: 'What does GIP add to GLP-1 agonism?', a: 'GIP provides a complementary insulinotropic signal through pancreatic GIPR and potentially an adipose-tissue signal through peripheral GIPR. In tirzepatide, co-activation of both receptor types is hypothesized to produce synergistic satiety and metabolic effects exceeding GLP-1 agonism alone — supported by the magnitude of weight loss in trials.' },
      { q: 'How does retatrutide compare to both?', a: 'Retatrutide (LY3437943) adds glucagon-receptor agonism to the GIP/GLP-1 dual mechanism — a triple agonist. In Phase 2 trials it reported approximately 24% mean body-weight reduction at the highest dose, exceeding both semaglutide and tirzepatide data. It remains investigational and is not FDA-approved.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Semaglutide', alternateName: 'Ozempic' },
      { name: 'Tirzepatide', alternateName: 'Mounjaro' },
    ],
  },
  {
    slug: 'cjc-1295-vs-ipamorelin',
    aSlug: 'cjc-1295-no-dac',
    bSlug: 'ipamorelin',
    aName: 'CJC-1295',
    bName: 'Ipamorelin',
    aPill: 'GHRH analog · GHRHR',
    bPill: 'GHRP · GHS-R1a',
    metaTitle:
      'CJC-1295 vs Ipamorelin — Mechanism, Synergy & Key Differences | AmericanPeptide.com',
    metaDescription:
      'Research comparison of CJC-1295 (no DAC / with DAC) and ipamorelin — receptor differences (GHRHR vs GHS-R1a), why they are studied together, pulsatile vs sustained release, and compound profiles.',
    keywords: [
      'CJC-1295 vs ipamorelin',
      'CJC-1295 ipamorelin combination',
      'CJC-1295 no DAC vs with DAC',
      'GHRH vs GHRP',
      'growth hormone peptide comparison',
    ],
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'different receptors, synergistic outcome',
    intro: [
      'CJC-1295 and ipamorelin are not alternatives — they act on different receptor systems. Understanding why they are studied together requires understanding what each does alone.',
    ],
    atAGlance: [
      { dim: 'Receptor', a: 'GHRH receptor (GHRHR)', b: 'Ghrelin receptor (GHS-R1a)' },
      { dim: 'Pathway', a: 'cAMP / PKA cascade in somatotrophs', b: 'IP₃ / Ca²⁺ cascade in somatotrophs' },
      { dim: 'Natural ligand', a: 'GHRH (hypothalamic pulse)', b: 'Ghrelin (gut-derived, pulsatile)' },
      { dim: 'Chain length', a: '30 AA (no DAC) / 30 AA + DAC', b: '5 AA (pentapeptide)' },
      { dim: 'Half-life', a: '~30 min (no DAC) / ~6–8 days (DAC)', b: '~2 h' },
      { dim: 'GH release pattern', a: 'Pulsatile (no DAC) / Sustained (DAC)', b: 'Pulsatile' },
      { dim: 'Cortisol / ACTH effect', a: 'Minimal', b: 'Minimal (key selectivity feature)' },
      { dim: 'Prolactin effect', a: 'Minimal', b: 'Minimal' },
      { dim: 'FDA approval', a: 'None', b: 'None' },
      { dim: 'WADA status', a: 'Prohibited (S2)', b: 'Prohibited (S2)' },
    ],
    proseSections: [
      {
        title: 'Why they are studied together',
        paragraphs: [
          'Pituitary somatotrophs — the cells that synthesize and secrete GH — carry receptor sites for both GHRH and ghrelin. CJC-1295 occupies the GHRH receptor (a cAMP/PKA signal) while ipamorelin occupies the ghrelin receptor (an IP₃/Ca²⁺ signal). When both arrive at the same somatotroph simultaneously, the two intracellular cascades amplify each other, producing a combined GH pulse substantially larger than additive.',
          'That synergy is the primary rationale for studying the pair as a combination rather than individually — each contributes a distinct, convergent signal.',
        ],
      },
      {
        title: 'DAC vs no-DAC, and ipamorelin’s selectivity',
        paragraphs: [
          'The DAC (Drug Affinity Complex) addition extends CJC-1295’s half-life from ~30 minutes to ~6–8 days by allowing covalent binding to serum albumin. No-DAC produces brief, pulsatile GH pulses compatible with natural rhythm; DAC produces sustained GH/IGF-1 elevation but blunts pulsatility.',
          'Ipamorelin’s distinguishing feature among GHRPs is selectivity: earlier GHRPs (GHRP-6, hexarelin) release GH alongside ACTH, cortisol, and prolactin, whereas ipamorelin activates GHS-R1a with high selectivity — the main reason it is the most widely used GHRP in combination research.',
        ],
      },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'These are complements, not competitors: different receptors converging on the same somatotroph, studied together for a synergistic GH pulse. Both have receptor-binding and GH-release characterization plus some human PK/PD data (stronger for CJC-1295); endpoints like body composition rest on thinner, smaller-trial evidence. Neither is FDA-approved, and both are WADA-prohibited (S2).',
      ],
    },
    faqs: [
      { q: 'What is the main difference between CJC-1295 and ipamorelin?', a: 'They act on entirely different receptors. CJC-1295 (a GHRH analog) binds the GHRH receptor via a cAMP/PKA cascade. Ipamorelin (a GHRP) binds the ghrelin receptor (GHS-R1a) via an IP₃/Ca²⁺ cascade. Because the two pathways converge downstream on the same pituitary somatotroph, combining them produces synergistically larger GH pulses than either alone.' },
      { q: 'Why are CJC-1295 and ipamorelin often studied together?', a: 'When a GHRH-receptor signal (CJC-1295) and a ghrelin-receptor signal (ipamorelin) arrive at the same pituitary somatotroph simultaneously, the two intracellular cascades amplify each other. The combined GH pulse is substantially larger than additive. This synergy is the primary rationale for studying them as a combination.' },
      { q: 'What is the difference between CJC-1295 with DAC and without DAC?', a: 'The DAC addition extends half-life from ~30 minutes (no DAC) to ~6–8 days (DAC) via covalent binding to serum albumin. No-DAC produces brief, pulsatile GH pulses compatible with natural GH rhythm; DAC produces sustained GH and IGF-1 elevation but blunts pulsatility. The choice depends on whether pulsatile or sustained exposure is the endpoint of interest.' },
      { q: 'What makes ipamorelin selective compared to other GHRPs?', a: 'Earlier GHRPs (GHRP-6, hexarelin) release GH alongside ACTH, cortisol, and prolactin. Ipamorelin activates GHS-R1a with high selectivity, releasing GH without meaningfully raising the others — the primary reason it is the most widely used GHRP in combination research.' },
      { q: 'Are CJC-1295 and ipamorelin FDA-approved?', a: 'No. Neither compound is FDA-approved. Both are prohibited by the World Anti-Doping Agency under category S2 (Peptide Hormones). The only currently approved GH-axis peptide in this catalog is tesamorelin (Egrifta), for a specific HIV-related indication.' },
      { q: 'What is the evidence base for CJC-1295 and ipamorelin?', a: 'Both have pharmacological characterization data (receptor binding, GH release curves) and some human PK/PD data — peer-reviewed human PK exists for CJC-1295. Evidence for specific endpoints like body composition is thinner, mostly from small trials or case series. Neither has completed Phase 3 trials.' },
    ],
    relatedAreas: ['growth-hormone-axis', 'longevity-aging'],
    about: [{ name: 'CJC-1295' }, { name: 'Ipamorelin' }],
  },
  {
    slug: 'bpc-157-vs-tb-500',
    aSlug: 'bpc-157',
    bSlug: 'tb-500',
    aName: 'BPC-157',
    bName: 'TB-500',
    aPill: 'Pentadecapeptide · tissue repair',
    bPill: 'Tβ4 fragment · cell migration',
    metaTitle:
      'BPC-157 vs TB-500 — Mechanism, Repair Pathways & Key Differences | AmericanPeptide.com',
    metaDescription:
      'Research comparison of BPC-157 and TB-500 — distinct repair mechanisms (angiogenesis/cytoprotection vs actin regulation and cell migration), origins, evidence base, and why they are often studied together.',
    keywords: [
      'BPC-157 vs TB-500',
      'BPC-157 TB-500 stack',
      'BPC-157 mechanism',
      'TB-500 thymosin beta-4',
      'peptide repair comparison',
    ],
    breadcrumb: { label: 'Healing & Repair', href: '/catalog/category/healing-repair' },
    headline: 'two repair peptides, two different mechanisms',
    intro: [
      'BPC-157 and TB-500 are the two most-studied research peptides in the tissue-repair space, and are often discussed together — but they act through entirely different mechanisms. Neither is FDA-approved, and the human evidence base for both is limited.',
    ],
    atAGlance: [
      { dim: 'Origin', a: 'Stable fragment of body-protection compound (gastric)', b: 'Synthetic fragment of thymosin β4' },
      { dim: 'Chain length', a: '15 AA (pentadecapeptide)', b: '7 AA actin-binding motif (LKKTETQ)' },
      { dim: 'Primary mechanism', a: 'Angiogenesis (VEGFR2) + cytoprotection', b: 'G-actin sequestration → cell migration' },
      { dim: 'Signaling', a: 'Nitric-oxide & growth-factor modulation', b: 'Actin dynamics, downstream migration/angiogenesis' },
      { dim: 'Most-studied for', a: 'Tendon/ligament & GI-tract repair', b: 'Cell migration, soft-tissue & cardiac repair (preclinical)' },
      { dim: 'Evidence base', a: 'Largely rodent models; scant human data', b: 'Largely rodent models; scant human data' },
      { dim: 'FDA approval', a: 'None', b: 'None' },
      { dim: 'WADA status', a: 'Prohibited (S0/S2 context)', b: 'Prohibited (S2)' },
    ],
    columnSections: [
      {
        title: 'How the repair mechanisms differ',
        columns: [
          {
            heading: 'BPC-157 — angiogenesis & cytoprotection',
            accent: 'a',
            points: [
              'Reported upregulation of VEGFR2, promoting new-vessel formation',
              'Modulation of the nitric-oxide system and several growth-factor pathways',
              'Cytoprotective effects studied prominently in GI-tract models',
              'Preclinical focus on tendon, ligament, and gut-lining repair',
            ],
          },
          {
            heading: 'TB-500 — actin regulation & migration',
            accent: 'b',
            points: [
              'Sequesters monomeric G-actin, regulating cytoskeletal dynamics',
              'Promotes directed cell migration into injured tissue',
              'Downstream angiogenesis and reduced inflammation reported',
              'Derived from thymosin β4’s actin-binding domain',
            ],
          },
        ],
      },
    ],
    proseSections: [
      {
        title: 'Why they are often studied together',
        paragraphs: [
          'Because the two act on non-overlapping pathways — BPC-157 on angiogenesis and cytoprotection, TB-500 on actin-driven cell migration — repair-focused research protocols sometimes examine them in combination on the rationale that they address different stages of the repair cascade. This is a mechanistic rationale, not a proven clinical synergy: rigorous human combination data does not exist.',
          'Both should be read as preclinical research compounds. The bulk of published evidence is from animal models, and neither has completed controlled human trials for any repair indication.',
        ],
      },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'These are complementary research tools, not interchangeable ones: BPC-157’s evidence centers on angiogenesis and GI/tendon cytoprotection, TB-500’s on actin regulation and cell migration. For both, the strongest data is preclinical, and human efficacy/safety for repair endpoints remains unestablished. Treat any comparison as a mechanistic contrast, not a clinical recommendation.',
      ],
    },
    faqs: [
      { q: 'What is the difference between BPC-157 and TB-500?', a: 'BPC-157 is a 15-amino-acid stable gastric peptide studied for angiogenesis (via VEGFR2) and cytoprotection, with a research focus on tendon, ligament, and GI repair. TB-500 is a synthetic fragment of thymosin β4 that sequesters G-actin and is studied for cell migration and cytoskeletal regulation. They act through different mechanisms.' },
      { q: 'Are BPC-157 and TB-500 used together?', a: 'They are sometimes studied in combination because they target different parts of the repair process — BPC-157 on angiogenesis/cytoprotection and TB-500 on actin-driven cell migration. This is a mechanistic rationale; controlled human data on the combination does not exist. This page is a research reference, not a protocol.' },
      { q: 'Is BPC-157 or TB-500 FDA-approved?', a: 'Neither is FDA-approved for any indication. Both are research compounds, and both are prohibited in sport by the World Anti-Doping Agency. Most published evidence for either is from animal models.' },
      { q: 'Is TB-500 the same as thymosin β4?', a: 'TB-500 is a synthetic peptide based on thymosin β4 — typically representing the actin-binding region (the LKKTETQ motif) rather than the full 43-residue protein. Research framing should distinguish the marketed fragment from native thymosin β4.' },
    ],
    relatedAreas: ['wound-healing'],
    about: [{ name: 'BPC-157' }, { name: 'TB-500', alternateName: 'Thymosin beta-4 fragment' }],
  },
  {
    slug: 'retatrutide-vs-tirzepatide',
    aSlug: 'retatrutide',
    bSlug: 'tirzepatide',
    aName: 'Retatrutide',
    bName: 'Tirzepatide',
    aPill: 'Triple agonist · investigational',
    bPill: 'Dual agonist · FDA approved',
    metaTitle:
      'Retatrutide vs Tirzepatide — Triple vs Dual Agonist, Trials & Differences | AmericanPeptide.com',
    metaDescription:
      'Research comparison of retatrutide (GIP/GLP-1/glucagon triple agonist) and tirzepatide (GIP/GLP-1 dual agonist) — what the glucagon arm adds, trial weight-loss data, and approval status.',
    keywords: [
      'retatrutide vs tirzepatide',
      'triple agonist vs dual agonist',
      'retatrutide weight loss',
      'LY3437943 vs tirzepatide',
      'glucagon GLP-1 GIP',
    ],
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'triple vs dual incretin agonism',
    intro: [
      'Both are Eli Lilly incretin agonists, but retatrutide adds a third receptor — glucagon — to tirzepatide’s GIP/GLP-1 dual mechanism. Tirzepatide is FDA-approved; retatrutide is investigational. This page covers what the added glucagon agonism does and what the trials show.',
    ],
    atAGlance: [
      { dim: 'Receptor targets', a: 'GIP-R + GLP-1R + glucagon-R', b: 'GIP-R + GLP-1R' },
      { dim: 'Agonism class', a: 'Triple agonist', b: 'Dual agonist ("twincretin")' },
      { dim: 'Developer', a: 'Eli Lilly (LY3437943)', b: 'Eli Lilly' },
      { dim: 'Approval status', a: 'Investigational (Phase 3 — TRIUMPH program)', b: 'FDA approved (Mounjaro 2022 · Zepbound 2023)' },
      { dim: 'Peak weight ↓ (trial)', a: '~24% (Phase 2, 48 wk, highest dose)', b: '~22.5% (SURMOUNT-1, 72 wk, 15 mg)' },
      { dim: 'Glucagon arm', a: 'Adds energy expenditure + hepatic lipolysis', b: 'None' },
      { dim: 'Maturity of evidence', a: 'Phase 2 complete; Phase 3 ongoing', b: 'Multiple completed Phase 3 trials' },
    ],
    columnSections: [
      {
        title: 'What the third receptor adds',
        columns: [
          {
            heading: 'Shared GIP + GLP-1 (both)',
            accent: 'neutral',
            points: [
              'GLP-1: glucose-dependent insulin, glucagon suppression, satiety',
              'GIP: complementary insulinotropic + adipose signaling',
              'Together drive the appetite and glycemic effects of the dual class',
            ],
          },
          {
            heading: 'Glucagon agonism (retatrutide only)',
            accent: 'a',
            points: [
              'Increases energy expenditure beyond appetite suppression alone',
              'Promotes hepatic lipolysis — studied for liver-fat reduction',
              'Proposed basis for the larger weight reduction seen in Phase 2',
              'Requires careful glycemic balancing against GLP-1/GIP insulinotropic effects',
            ],
          },
        ],
      },
    ],
    trials: [
      { name: 'Retatrutide Phase 2', arm: 'Retatrutide 12 mg', n: '338', duration: '48 wk', endpoint: 'Mean body-weight change', result: '~24% vs ~2% (placebo)', note: 'Jastreboff et al., NEJM 2023; highest-dose arm' },
      { name: 'SURMOUNT-1', arm: 'Tirzepatide 15 mg', n: '2539', duration: '72 wk', endpoint: 'Mean body-weight change', result: '−22.5% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Zepbound' },
      { name: 'TRIUMPH program', arm: 'Retatrutide (multiple)', duration: 'Ongoing', endpoint: 'Phase 3 efficacy/safety', result: 'In progress — not yet reported', note: 'Approval depends on these outcomes' },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'Retatrutide’s triple mechanism produced the largest weight reduction reported among incretin agonists in Phase 2 (~24%), exceeding tirzepatide’s pivotal data — but the comparison is across different trials and stages, not a head-to-head, and retatrutide’s Phase 3 (TRIUMPH) results and full safety profile are still pending. Tirzepatide is the established, FDA-approved option with multiple completed Phase 3 trials. These are population means from trial data, not predictions for any individual.',
      ],
    },
    faqs: [
      { q: 'What is the difference between retatrutide and tirzepatide?', a: 'Tirzepatide is a dual agonist of the GIP and GLP-1 receptors. Retatrutide is a triple agonist that adds glucagon-receptor agonism on top of GIP/GLP-1. The glucagon arm is associated with increased energy expenditure and hepatic lipolysis, and is the proposed basis for retatrutide’s larger weight-loss in Phase 2.' },
      { q: 'Is retatrutide more effective than tirzepatide for weight loss?', a: 'In Phase 2, retatrutide reported ~24% mean body-weight reduction at the highest dose, exceeding tirzepatide’s pivotal SURMOUNT-1 result (~22.5%). However, these are separate trials at different durations and stages — not a head-to-head comparison — and retatrutide’s Phase 3 results are not yet reported. Individual responses vary.' },
      { q: 'Is retatrutide FDA-approved?', a: 'No. Retatrutide (LY3437943) is investigational and in Phase 3 trials (the TRIUMPH program). Tirzepatide is FDA-approved as Mounjaro (type 2 diabetes, 2022) and Zepbound (chronic weight management, 2023).' },
      { q: 'What does glucagon-receptor agonism add?', a: 'Beyond the appetite suppression and glycemic control of GLP-1/GIP, glucagon-receptor agonism is studied for increased energy expenditure and hepatic lipolysis (liver-fat reduction). The trade-off is that glucagon can raise glucose, so a triple agonist must balance it against the insulinotropic GLP-1/GIP signals.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Retatrutide', alternateName: 'LY3437943' },
      { name: 'Tirzepatide', alternateName: 'Mounjaro' },
    ],
  },
  {
    slug: 'cjc-1295-vs-sermorelin',
    aSlug: 'cjc-1295-with-dac',
    bSlug: 'sermorelin',
    aName: 'CJC-1295',
    bName: 'Sermorelin',
    aPill: 'GHRH analog · extended half-life',
    bPill: 'GHRH(1-29) · short-acting',
    metaTitle:
      'CJC-1295 vs Sermorelin — GHRH Analogs & Half-Life Compared | AmericanPeptide.com',
    metaDescription:
      'Both are GHRH analogs that prompt natural GH release. Sermorelin is the short-acting GHRH(1-29) fragment; CJC-1295 with DAC binds albumin for a multi-day half-life. A cited research comparison.',
    keywords: [
      'CJC-1295 vs sermorelin',
      'GHRH analog comparison',
      'sermorelin half-life',
      'CJC-1295 DAC',
      'growth hormone peptide comparison',
    ],
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'same GHRH backbone, different duration',
    intro: [
      'CJC-1295 and sermorelin are built on the same GHRH(1-29) sequence and act on the same receptor — the difference is how long each one lasts, and what that does to the GH pulse.',
    ],
    atAGlance: [
      { dim: 'Class', a: 'Modified GHRH(1-29) analog', b: 'Native GHRH(1-29) fragment' },
      { dim: 'Receptor', a: 'GHRH receptor (GHRHR)', b: 'GHRH receptor (GHRHR)' },
      { dim: 'Half-life', a: '~30 min (no DAC) / ~6–8 days (DAC)', b: '~minutes' },
      { dim: 'GH release pattern', a: 'Pulsatile (no DAC) / sustained (DAC)', b: 'Discrete physiologic pulse' },
      { dim: 'Pulsatility preserved', a: 'Yes (no DAC) / blunted (DAC)', b: 'Yes' },
      { dim: 'Key modification', a: 'DPP-4-resistant substitutions ± albumin-binding DAC', b: 'None (unmodified fragment)' },
      { dim: 'Pituitary feedback', a: 'Preserved', b: 'Preserved (somatostatin feedback intact)' },
      { dim: 'FDA approval', a: 'None (research compound)', b: 'Approved 1990 (Geref), since discontinued' },
      { dim: 'Commonly paired with', a: 'A GHRP (e.g. ipamorelin)', b: 'A GHRP' },
    ],
    proseSections: [
      {
        title: 'Why duration is the whole story',
        paragraphs: [
          'Sermorelin is the first 29 amino acids of GHRH — the shortest fragment that keeps full GH-releasing activity. It binds GHRHR on pituitary somatotrophs, activating the cAMP cascade to release the body’s own GH in a short, discrete pulse. That brevity is a feature: it preserves the natural somatostatin feedback loop and circadian rhythm of GH secretion.',
          'CJC-1295 starts from that same backbone but adds DPP-4-resistant substitutions and, in the DAC form, a Drug Affinity Complex that binds serum albumin — extending the half-life to roughly 6–8 days (Teichman et al., 2006). The trade-off is physiologic: sustained GHRHR exposure raises baseline GH and IGF-1 but blunts the pulsatility that sermorelin keeps intact.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are the same molecule family at two ends of a duration spectrum. Sermorelin offers the most physiologic, pulse-preserving profile and has an actual (if discontinued) approval history; CJC-1295 with DAC offers sustained elevation at the cost of natural pulsatility. Both are studied alongside a GHRP, where GHRH and ghrelin-receptor signals converge for a larger combined pulse. Neither is a current FDA-approved therapy for the uses discussed here.',
      ],
    },
    faqs: [
      { q: 'What is the difference between CJC-1295 and sermorelin?', a: 'Both are GHRH analogs that stimulate the pituitary to release growth hormone. Sermorelin is the native GHRH(1-29) fragment with a half-life of minutes, producing a short pulse. CJC-1295 is a stabilized version of the same backbone; with a DAC it binds albumin and lasts roughly 6–8 days.' },
      { q: 'Which is more physiologic?', a: 'Sermorelin. Its short half-life produces a discrete GH pulse that preserves the natural somatostatin feedback loop. CJC-1295 with DAC raises baseline GH and IGF-1 but blunts that pulsatility.' },
      { q: 'Is either FDA-approved?', a: 'Sermorelin was approved in 1990 (Geref) for GH-deficiency evaluation and pediatric use but was later discontinued commercially. CJC-1295 is a research compound and is not FDA-approved. This page is a research and educational reference.' },
      { q: 'Why are they paired with a GHRP?', a: 'GHRH analogs (like these) and GHRPs act on different receptors on the same pituitary cells. Combining them is studied for synergistic GH release that exceeds either alone.' },
    ],
    relatedAreas: ['growth-hormone-axis'],
    about: [
      { name: 'CJC-1295' },
      { name: 'Sermorelin', alternateName: 'GRF 1-29' },
    ],
  },
  {
    slug: 'ipamorelin-vs-hexarelin',
    aSlug: 'ipamorelin',
    bSlug: 'hexarelin',
    aName: 'Ipamorelin',
    bName: 'Hexarelin',
    aPill: 'GHRP · selective',
    bPill: 'GHRP · potent',
    metaTitle:
      'Ipamorelin vs Hexarelin — Selectivity vs Potency | AmericanPeptide.com',
    metaDescription:
      'Both are GHRPs acting on the ghrelin receptor. Ipamorelin releases GH cleanly without raising cortisol or prolactin; hexarelin is more potent but less selective. A cited research comparison.',
    keywords: [
      'ipamorelin vs hexarelin',
      'GHRP comparison',
      'selective growth hormone secretagogue',
      'hexarelin cortisol prolactin',
      'ghrelin receptor peptide',
    ],
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'selectivity versus potency',
    intro: [
      'Ipamorelin and hexarelin are both GHRPs that act on the ghrelin receptor (GHS-R1a) — but they sit at opposite ends of a selectivity-versus-potency trade-off.',
    ],
    atAGlance: [
      { dim: 'Class', a: 'Pentapeptide GHRP', b: 'Hexapeptide GHRP (GHRP-6 analog)' },
      { dim: 'Receptor', a: 'GHS-R1a (ghrelin receptor)', b: 'GHS-R1a + CD36' },
      { dim: 'GH potency', a: 'Moderate, selective', b: 'High — strongest of common GHRPs' },
      { dim: 'Cortisol / ACTH', a: 'Minimal (selective)', b: 'Can elevate' },
      { dim: 'Prolactin', a: 'Minimal', b: 'Can elevate' },
      { dim: 'Receptor desensitization', a: 'Lower', b: 'Greater' },
      { dim: 'Notable extra activity', a: '—', b: 'CD36-mediated cardioprotection (preclinical)' },
      { dim: 'FDA approval', a: 'None', b: 'None' },
      { dim: 'Characterizing study', a: 'Raun et al., 1998', b: 'GHRP-6 analog literature' },
    ],
    proseSections: [
      {
        title: 'The trade-off in one line',
        paragraphs: [
          'Ipamorelin was characterized as the first GHRP to release GH without meaningfully raising ACTH, cortisol, or prolactin (Raun et al., 1998, Eur J Endocrinol) — a “clean” selective profile that also shows less receptor desensitization over repeated exposure. That selectivity is its defining research feature.',
          'Hexarelin releases more GH per dose than GHRP-2, GHRP-6, or ipamorelin, making it the more potent secretagogue — but it recruits cortisol and prolactin and desensitizes the receptor faster. It also carries a distinct research thread: CD36-mediated cardioprotective effects independent of GH release.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'If the research question prioritizes a clean, sustainable GH signal, ipamorelin’s selectivity is the draw. If it prioritizes raw GH output (or the separate CD36 / cardiac line of inquiry), hexarelin is the more potent but less selective tool. Both act on the same receptor, both are commonly studied with a GHRH analog, and neither is FDA-approved.',
      ],
    },
    faqs: [
      { q: 'What is the difference between ipamorelin and hexarelin?', a: 'Both are GHRPs acting on the ghrelin receptor (GHS-R1a). Ipamorelin is selective, releasing GH without meaningfully raising cortisol or prolactin. Hexarelin is more potent but also elevates cortisol and prolactin and desensitizes the receptor faster.' },
      { q: 'Why is ipamorelin called “selective”?', a: 'In its characterizing study (Raun et al., 1998), ipamorelin released GH without the ACTH and cortisol increases seen with earlier GHRPs, earning it the description “the first selective growth hormone secretagogue.”' },
      { q: 'What is hexarelin’s CD36 connection?', a: 'Beyond GH release, hexarelin binds the CD36 receptor, through which preclinical studies report cardioprotective effects independent of growth hormone.' },
      { q: 'Are either FDA-approved?', a: 'No. Both are research compounds and are not FDA-approved; both are also prohibited in sport. This page is a research and educational reference.' },
    ],
    relatedAreas: ['growth-hormone-axis'],
    about: [
      { name: 'Ipamorelin' },
      { name: 'Hexarelin' },
    ],
  },
  {
    slug: 'semax-vs-selank',
    aSlug: 'semax',
    bSlug: 'selank',
    aName: 'Semax',
    bName: 'Selank',
    aPill: 'ACTH(4-10) analog · nootropic',
    bPill: 'Tuftsin analog · anxiolytic',
    metaTitle: 'Semax vs Selank — Focus vs Calm | AmericanPeptide.com',
    metaDescription:
      'Semax (an ACTH(4-10) analog) is studied for cognition and BDNF; Selank (a tuftsin analog) for anxiety via GABA / serotonin. A cited research comparison of the two Russian neuropeptides.',
    keywords: [
      'semax vs selank',
      'nootropic peptide comparison',
      'semax BDNF',
      'selank anxiety',
      'russian neuropeptides',
    ],
    breadcrumb: { label: 'Cognitive Peptides', href: '/cognitive-peptides' },
    headline: 'sharpen versus soothe',
    intro: [
      'Semax and Selank are often lumped together as Russian “nootropic” peptides, but they target different problems — cognition and focus versus anxiety and stress.',
    ],
    atAGlance: [
      { dim: 'Derived from', a: 'ACTH(4-10)', b: 'Tuftsin' },
      { dim: 'Primary research focus', a: 'Cognition, focus, neuroprotection', b: 'Anxiety, stress resilience' },
      { dim: 'Key mechanism', a: 'BDNF / trkB upregulation; dopaminergic & serotonergic tone', b: 'GABAergic & serotonergic modulation; enkephalinase inhibition' },
      { dim: 'HPA (stress) axis', a: 'Not activated', b: 'Not activated' },
      { dim: 'Sedation / dependence', a: 'No', b: 'No (unlike benzodiazepines)' },
      { dim: 'Common form', a: 'Intranasal (research)', b: 'Intranasal (research)' },
      { dim: 'Russian clinical status', a: 'Approved (stroke, cognition, optic nerve)', b: 'Approved (anxiety)' },
      { dim: 'FDA approval', a: 'None', b: 'None' },
    ],
    proseSections: [
      {
        title: 'Two peptides, two jobs',
        paragraphs: [
          'Semax, an ACTH(4-10) analog, is studied for upregulating BDNF and trkB in the hippocampus and basal forebrain (Dolotov et al., 2006) and for enhancing dopaminergic and serotonergic signaling — without activating the stress axis. That profile underlies its association with attention, memory, and neuroprotection; it is approved in Russia for stroke, cognitive impairment, and optic-nerve disease.',
          'Selank, derived from the immunopeptide tuftsin, is studied for anxiolytic effects via GABAergic and serotonergic modulation, with clinical reports of benzodiazepine-comparable anxiety relief but without sedation or dependence. The simplest model: Semax sharpens, Selank soothes — which is why the two are frequently studied as a complementary pair.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are complements, not substitutes: Semax for cognition / neuroprotection, Selank for anxiety / calm. Both avoid the HPA-axis activation and dependence concerns of older agents in their respective spaces. The important caveat for both is evidence quality — most controlled data are Russian-language, and independent Western replication is limited. Neither is FDA-approved.',
      ],
    },
    faqs: [
      { q: 'What is the difference between Semax and Selank?', a: 'Semax is an ACTH(4-10) analog studied for cognition, focus and neuroprotection via BDNF upregulation. Selank is a tuftsin analog studied for anxiety via GABAergic and serotonergic modulation. A simple model: Semax to sharpen, Selank to soothe.' },
      { q: 'Can they be used together?', a: 'In the research literature they are often studied as a complementary pair — Semax for cognitive / neuroprotective endpoints and Selank for anxiety — because their mechanisms and targets differ.' },
      { q: 'Do they cause sedation or dependence?', a: 'Research interest in both centers on effects without the sedation, tolerance, or withdrawal associated with classic agents (e.g. benzodiazepines for Selank), and neither activates the HPA stress axis.' },
      { q: 'Are they FDA-approved?', a: 'No. Both are approved and used in Russia but are research compounds elsewhere and not FDA-approved. Western peer-reviewed replication is limited. This page is a research and educational reference.' },
    ],
    relatedAreas: ['cognition-neuroprotection', 'anxiety-mood'],
    about: [
      { name: 'Semax' },
      { name: 'Selank' },
    ],
  },
  {
    slug: 'pt-141-vs-kisspeptin',
    aSlug: 'pt-141',
    bSlug: 'kisspeptin-10',
    aName: 'PT-141',
    bName: 'Kisspeptin',
    aPill: 'Melanocortin agonist · MC3R/MC4R',
    bPill: 'KISS1R / GPR54 · GnRH axis',
    metaTitle:
      'PT-141 vs Kisspeptin — Central Arousal vs the GnRH Axis | AmericanPeptide.com',
    metaDescription:
      'PT-141 (bremelanotide) acts on brain melanocortin receptors for acute arousal; kisspeptin drives the upstream GnRH hormone axis. A cited research comparison of two approaches to sexual function.',
    keywords: [
      'PT-141 vs kisspeptin',
      'bremelanotide vs kisspeptin',
      'melanocortin vs GnRH',
      'sexual function peptide comparison',
      'kisspeptin GnRH',
    ],
    breadcrumb: { label: 'Sexual & Reproductive', href: '/research-areas/sexual-reproductive' },
    headline: 'central arousal versus the hormone axis',
    intro: [
      'PT-141 and kisspeptin are both studied for sexual function, but through entirely different systems — central melanocortin arousal versus the upstream reproductive-hormone axis.',
    ],
    atAGlance: [
      { dim: 'Structure', a: 'Cyclic heptapeptide (α-MSH analog)', b: 'Hypothalamic neuropeptide' },
      { dim: 'Receptor', a: 'Melanocortin MC3R / MC4R (CNS)', b: 'KISS1R / GPR54 (GnRH neurons)' },
      { dim: 'Pathway', a: 'Central arousal, hormone-independent', b: 'GnRH → LH / FSH → sex steroids' },
      { dim: 'Research framing', a: 'Acute central desire', b: 'Hormonal-axis regulation' },
      { dim: 'Onset', a: 'Acute', b: 'Physiologic (axis-driven)' },
      { dim: 'FDA status', a: 'Approved (Vyleesi, HSDD in premenopausal women)', b: 'Investigational' },
      { dim: 'Characterizing work', a: 'Molinoff / Diamond et al., 2003', b: 'KISS1R / GnRH endocrinology' },
    ],
    proseSections: [
      {
        title: 'Two levels of the same system',
        paragraphs: [
          'PT-141 (bremelanotide) is a cyclic α-MSH analog that acts in the brain on melanocortin MC3R / MC4R receptors to generate sexual arousal independent of the reproductive hormone axis — an acute, central, on-demand mechanism (Molinoff / Diamond et al., 2003). It is FDA-approved (Vyleesi) for hypoactive sexual desire disorder in premenopausal women.',
          'Kisspeptin works one level upstream: it signals through KISS1R / GPR54 on GnRH neurons, increasing GnRH pulsatility and downstream LH, FSH, and sex-steroid production — and, via limbic KISS1R expression, contributes directly to sexual motivation. So PT-141 addresses acute central arousal, while kisspeptin addresses the hormonal regulation of the reproductive axis.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These answer different research questions. PT-141 is the tool for acute central arousal and is the only one of the two with an FDA approval; kisspeptin is the tool for probing or restoring the GnRH hormone axis and remains investigational. They are not interchangeable, and in principle act on complementary parts of the same overall system.',
      ],
    },
    faqs: [
      { q: 'What is the difference between PT-141 and kisspeptin?', a: 'PT-141 (bremelanotide) is a melanocortin MC3R/MC4R agonist that produces acute central sexual arousal independent of reproductive hormones. Kisspeptin acts on KISS1R/GPR54 on GnRH neurons to drive the reproductive hormone axis (GnRH, LH, FSH, sex steroids). Different systems, different research uses.' },
      { q: 'Is PT-141 FDA-approved?', a: 'Yes — bremelanotide (PT-141) is FDA-approved as Vyleesi for hypoactive sexual desire disorder in premenopausal women. Kisspeptin remains investigational.' },
      { q: 'How does kisspeptin affect sexual function?', a: 'Kisspeptin stimulates GnRH pulsatility and downstream LH / FSH and sex-steroid secretion, and KISS1R is also expressed in limbic brain regions, which is studied as a direct route to sexual motivation.' },
      { q: 'Is this medical advice?', a: 'No — this page is a research and educational reference, not medical advice or a dosing protocol.' },
    ],
    relatedAreas: ['sexual-reproductive'],
    about: [
      { name: 'PT-141', alternateName: 'Bremelanotide' },
      { name: 'Kisspeptin-10' },
    ],
  },
  {
    slug: 'melanotan-2-vs-melanotan-1',
    aSlug: 'melanotan-2',
    aName: 'Melanotan II',
    bName: 'Melanotan I (Afamelanotide)',
    aPill: 'Non-selective MC1–5R agonist',
    bPill: 'MC1R-selective · FDA-approved',
    metaTitle:
      'Melanotan I vs Melanotan II — MC1R Selectivity & Safety | AmericanPeptide.com',
    metaDescription:
      'Afamelanotide (Melanotan I) is MC1R-selective and FDA-approved; Melanotan II is non-selective and activates MC4R, driving side effects. A cited melanocortin research comparison.',
    keywords: [
      'melanotan 1 vs melanotan 2',
      'afamelanotide vs melanotan II',
      'MC1R selectivity',
      'melanocortin receptor comparison',
      'melanotan side effects',
    ],
    breadcrumb: { label: 'Melanocortin Peptides', href: '/melanocortin' },
    headline: 'selectivity is the whole difference',
    intro: [
      'Both are α-MSH analogs studied for pigmentation, but they differ in receptor selectivity — and that difference explains Melanotan II’s notorious side-effect profile.',
    ],
    atAGlance: [
      { dim: 'Structure', a: '7-aa cyclic truncated analog', b: '13-aa linear α-MSH analog' },
      { dim: 'Receptor profile', a: 'Non-selective: MC1R / MC3R / MC4R / MC5R', b: 'MC1R-selective (~1000× lower MC3R/MC4R)' },
      { dim: 'Primary effect', a: 'Pigmentation + MC4R central effects', b: 'Pigmentation via MC1R' },
      { dim: 'Notable side effects', a: 'Nausea, flushing, spontaneous erections (MC4R)', b: 'Fewer off-target effects' },
      { dim: 'FDA status', a: 'Not approved', b: 'Approved (Scenesse) for EPP photoprotection' },
      { dim: 'Characterizing work', a: 'Dorr et al., 1996 (Phase I)', b: 'Afamelanotide / Scenesse program' },
    ],
    proseSections: [
      {
        title: 'Why selectivity drives safety',
        paragraphs: [
          'Both peptides activate Gs-coupled melanocortin receptors, raising cAMP to drive melanin production. Afamelanotide (Melanotan I) is a 13-amino-acid analog highly selective for MC1R — roughly 1000-fold lower affinity for MC3R / MC4R — so its action stays largely confined to pigmentation. It is FDA-approved as Scenesse for photoprotection in erythropoietic protoporphyria.',
          'Melanotan II is a truncated 7-amino-acid cyclic analog with much less selectivity, also hitting MC4R centrally. In a 1996 Phase I study (Dorr et al.) it produced tanning alongside dose-dependent nausea, flushing, and spontaneous erections — effects consistent with MC4R activation. Those off-target effects are why MT-II never reached approval: they can’t be cleanly separated from the tan.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'The two are a textbook case of selectivity determining safety. Afamelanotide’s MC1R selectivity gives it a clean enough profile to be an approved drug; Melanotan II’s non-selectivity drives both its broader effects and its side effects, and it remains unapproved. This page is a research and educational reference, not a usage recommendation.',
      ],
    },
    faqs: [
      { q: 'What is the difference between Melanotan I and Melanotan II?', a: 'Melanotan I (afamelanotide) is a 13-amino-acid analog highly selective for the MC1R receptor and is FDA-approved as Scenesse. Melanotan II is a truncated cyclic analog that activates MC1R, MC3R, MC4R and MC5R non-selectively; its MC4R activity drives side effects, and it is not approved.' },
      { q: 'Why does Melanotan II cause more side effects?', a: 'Because it is non-selective and activates MC4R in the brain, producing nausea, flushing and spontaneous erections (documented in Dorr et al., 1996) that cannot be cleanly separated from its pigmentation effect.' },
      { q: 'Is either FDA-approved?', a: 'Afamelanotide (Melanotan I) is FDA-approved as Scenesse for photoprotection in erythropoietic protoporphyria. Melanotan II is not FDA-approved. This page is a research and educational reference.' },
      { q: 'Do both cause tanning?', a: 'Both stimulate melanin production through MC1R. Melanotan I does so selectively; Melanotan II does so along with broader, non-selective melanocortin effects.' },
    ],
    relatedAreas: ['skin-hair'],
    about: [
      { name: 'Melanotan II', alternateName: 'MT-II' },
      { name: 'Afamelanotide', alternateName: 'Melanotan I' },
    ],
  },
  {
    slug: 'ghk-cu-vs-ahk-cu',
    aSlug: 'ghk-cu',
    bSlug: 'ahk-cu',
    aName: 'GHK-Cu',
    bName: 'AHK-Cu',
    aPill: 'Copper tripeptide · skin',
    bPill: 'Copper tripeptide · hair',
    metaTitle:
      'GHK-Cu vs AHK-Cu — Copper Peptides for Skin vs Hair (vs Matrixyl) | AmericanPeptide.com',
    metaDescription:
      'GHK-Cu and AHK-Cu share copper-binding chemistry but target different tissue — skin remodeling vs the hair follicle. How they compare, and where the non-copper peptide Matrixyl fits. Cited.',
    keywords: [
      'GHK-Cu vs AHK-Cu',
      'copper peptide comparison',
      'GHK-Cu vs Matrixyl',
      'copper peptide hair',
      'copper peptide skin',
    ],
    breadcrumb: { label: 'Cosmetic Peptides', href: '/catalog/category/cosmetic' },
    headline: 'same copper chemistry, different target tissue',
    intro: [
      '"Copper peptide" gets used as one term, but GHK-Cu and AHK-Cu are distinct molecules with different target tissue — and Matrixyl, often grouped with them, is not a copper peptide at all.',
    ],
    atAGlance: [
      { dim: 'Structure', a: 'Cu-bound tripeptide (Gly-His-Lys)', b: 'Cu-bound tripeptide (Ala-His-Lys)' },
      { dim: 'Copper-based?', a: 'Yes', b: 'Yes' },
      { dim: 'Primary research focus', a: 'Skin repair, collagen, antioxidant', b: 'Hair follicle / hair growth' },
      { dim: 'Key mechanism', a: 'Copper delivery + ECM remodeling-gene modulation', b: 'Copper delivery + VEGF / anti-apoptotic signaling in DPCs' },
      { dim: 'Reference compound for', a: 'Facial-skin remodeling', b: 'Follicular biology' },
      { dim: 'Evidence stage', a: 'Extensive dermatologic literature', b: 'Preclinical (cell / ex-vivo follicle)' },
      { dim: 'Status', a: 'Cosmetic ingredient (Copper Tripeptide-1)', b: 'Cosmetic / research compound' },
    ],
    proseSections: [
      {
        title: 'Skin, hair — and the non-copper outlier',
        paragraphs: [
          'GHK-Cu (glycyl-histidyl-lysine + copper) is the most-studied copper peptide, carrying copper into tissue and modulating a broad set of remodeling and antioxidant genes that support collagen, elastin, and wound repair. AHK-Cu (alanyl-histidyl-lysine + copper) shares the same histidine–lysine copper-binding motif but is oriented toward the hair follicle: it is studied for dermal-papilla-cell proliferation, anti-apoptotic signaling, and VEGF-driven angiogenesis (Pyo & Yoo et al., 2007).',
          'The common third name, Matrixyl (palmitoyl pentapeptide-4), is not a copper peptide at all. It is a "matrikine" whose KTTKS core mimics a procollagen-I fragment, signaling fibroblasts to make collagen — backed by a 12-week split-face RCT (Robinson et al., 2005). So the real choice isn’t "which copper peptide" but skin remodeling (GHK-Cu) vs hair (AHK-Cu) vs signaling-only anti-wrinkle (Matrixyl).',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'GHK-Cu is the reference for facial-skin remodeling; AHK-Cu applies the same copper chemistry to the hair follicle; Matrixyl is a separate, copper-free matrikine for collagen signaling. All three are cosmetic / research compounds, not approved drugs. This page is a research and educational reference.',
      ],
    },
    faqs: [
      { q: 'What is the difference between GHK-Cu and AHK-Cu?', a: 'Both are copper-bound tripeptides sharing a histidine–lysine copper-binding motif. GHK-Cu (glycyl-histidyl-lysine) is the most-studied for facial-skin remodeling, collagen, and wound repair. AHK-Cu (alanyl-histidyl-lysine) is oriented toward the hair follicle and follicular angiogenesis.' },
      { q: 'Is Matrixyl a copper peptide?', a: 'No. Matrixyl (palmitoyl pentapeptide-4) contains no copper. It is a matrikine that signals fibroblasts to produce collagen by mimicking a collagen-breakdown fragment, where GHK-Cu and AHK-Cu deliver copper.' },
      { q: 'Which copper peptide is better for hair?', a: 'AHK-Cu is the one studied specifically for the hair follicle — dermal-papilla-cell proliferation and VEGF-driven angiogenesis — while GHK-Cu is the reference for facial skin. Both remain preclinical / cosmetic, not approved drugs.' },
      { q: 'Are these FDA-approved?', a: 'No. GHK-Cu, AHK-Cu, and Matrixyl are cosmetic / research compounds, not approved drugs. This page is a research and educational reference.' },
    ],
    relatedAreas: ['skin-hair'],
    about: [
      { name: 'GHK-Cu', alternateName: 'Copper Tripeptide-1' },
      { name: 'AHK-Cu' },
    ],
  },
  {
    slug: 'igf-1-lr3-vs-mgf',
    aSlug: 'igf-1-lr3',
    bSlug: 'mgf',
    aName: 'IGF-1 LR3',
    bName: 'MGF',
    aPill: 'Long-acting IGF-1 analog · systemic',
    bPill: 'IGF-1 splice variant · local',
    metaTitle:
      'IGF-1 LR3 vs MGF — Hypertrophy vs Satellite-Cell Activation | AmericanPeptide.com',
    metaDescription:
      'IGF-1 LR3 is a long-acting systemic IGF-1 analog studied for hypertrophy; MGF is a local IGF-1 splice variant studied for satellite-cell activation. A cited research comparison.',
    keywords: [
      'IGF-1 LR3 vs MGF',
      'mechano growth factor comparison',
      'IGF-1 splice variant',
      'satellite cell activation',
      'muscle peptide comparison',
    ],
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'systemic hypertrophy versus local repair',
    intro: [
      'Both come from the IGF-1 gene, but one is a long-acting systemic growth factor and the other a short-lived local repair signal — and they do different jobs in muscle.',
    ],
    atAGlance: [
      { dim: 'Origin', a: 'Modified long-acting IGF-1 analog', b: 'Splice variant of IGF-1 (IGF-1Ec)' },
      { dim: 'Action radius', a: 'Systemic', b: 'Local (site of mechanical stress)' },
      { dim: 'Duration', a: 'Prolonged (hours–days)', b: 'Transient (rapid, post-damage)' },
      { dim: 'Primary effect', a: 'Hypertrophy — protein synthesis in existing fibers', b: 'Satellite-cell proliferation (new myonuclei)' },
      { dim: 'Key modification', a: 'Arg-3 substitution + N-terminal extension (↓ IGFBP binding)', b: 'Exon-5 insert → distinct C-terminal E-peptide' },
      { dim: 'Potency note', a: '~2–3× native IGF-1', b: 'Pulse signal, not sustained' },
      { dim: 'Status', a: 'Research / cell-culture; WADA-banned', b: 'Research; WADA-banned' },
    ],
    proseSections: [
      {
        title: 'Initiate versus sustain',
        paragraphs: [
          'MGF is the splice variant the body upregulates immediately after mechanical overload or muscle damage; its role is to activate satellite cells, expanding the pool of cells that can fuse and donate nuclei (McKoy, Ashley, Yang et al., 1999; Goldspink group, UCL). IGF-1 LR3 is engineered for a long half-life — an arginine-3 substitution and N-terminal extension reduce IGF-binding-protein binding — and acts systemically to sustain protein synthesis over hours to days.',
          'The sequence in the literature is therefore: MGF initiates the repair phase, IGF-1 LR3 sustains it. A nuance worth stating is that running both simultaneously may be counterproductive, since IGF-1 can drive premature differentiation before MGF has expanded the satellite-cell pool.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are complementary, not interchangeable: MGF is the local, transient initiator of repair; IGF-1 LR3 is the systemic, long-acting driver of hypertrophy. Both are research compounds (IGF-1 LR3 is also a cell-culture standard), neither is FDA-approved, and both are prohibited in sport. This page is a research and educational reference.',
      ],
    },
    faqs: [
      { q: 'What is the difference between IGF-1 LR3 and MGF?', a: 'IGF-1 LR3 is a modified, long-acting, systemic IGF-1 analog studied for hypertrophy via sustained protein synthesis. MGF (mechano growth factor) is a local IGF-1 splice variant upregulated after muscle damage that activates satellite cells. MGF initiates repair; IGF-1 LR3 sustains it.' },
      { q: 'Should IGF-1 LR3 and MGF be used together?', a: 'In the research literature they are typically sequenced rather than combined simultaneously, because IGF-1 may promote premature differentiation before MGF has expanded the satellite-cell pool.' },
      { q: 'Why is IGF-1 LR3 longer-acting?', a: 'An arginine-3 substitution and a 13-residue N-terminal extension reduce its binding to IGF-binding proteins, leaving more peptide free and active and extending its half-life versus native IGF-1.' },
      { q: 'Are they FDA-approved?', a: 'No. Both are research compounds — IGF-1 LR3 is also widely used in cell culture — and neither is FDA-approved; both are prohibited in sport. This page is a research and educational reference.' },
    ],
    relatedAreas: ['growth-hormone-axis'],
    about: [
      { name: 'IGF-1 LR3', alternateName: 'Long R3 IGF-1' },
      { name: 'MGF', alternateName: 'Mechano Growth Factor' },
    ],
  },
  {
    slug: 'epitalon-vs-mots-c',
    aSlug: 'epitalon',
    bSlug: 'mots-c',
    aName: 'Epitalon',
    bName: 'MOTS-c',
    aPill: 'Pineal tetrapeptide · telomeres',
    bPill: 'Mitochondrial peptide · metabolism',
    metaTitle:
      'Epitalon vs MOTS-c — Telomere vs Mitochondrial Longevity | AmericanPeptide.com',
    metaDescription:
      'Two longevity peptides, two mechanisms: Epitalon is studied for telomerase upregulation, MOTS-c for mitochondrial and metabolic regulation. A cited research comparison.',
    keywords: [
      'Epitalon vs MOTS-c',
      'longevity peptide comparison',
      'telomerase peptide',
      'mitochondrial peptide',
      'anti-aging peptide',
    ],
    breadcrumb: { label: 'Longevity Peptides', href: '/longevity-peptides' },
    headline: 'telomere maintenance versus mitochondrial metabolism',
    intro: [
      'Epitalon and MOTS-c are both studied under the longevity banner, but they act on entirely different aging mechanisms — telomere maintenance versus mitochondrial energy metabolism.',
    ],
    atAGlance: [
      { dim: 'Structure', a: 'Tetrapeptide (AEDG), pineal-derived', b: 'Mitochondrial-derived peptide (16 aa)' },
      { dim: 'Primary mechanism', a: 'Telomerase upregulation → telomere length', b: 'Mitochondrial / AMPK metabolic regulation' },
      { dim: 'Longevity rationale', a: 'Replicative lifespan, circadian / pineal axis', b: 'Metabolic healthspan, exercise mimetic' },
      { dim: 'Originating research', a: 'Khavinson group (St. Petersburg)', b: 'Mitochondrial-derived-peptide field (USC / Cohen lab)' },
      { dim: 'Evidence stage', a: 'Preclinical / early; limited Western RCTs', b: 'Preclinical (largely rodent / cell)' },
      { dim: 'Status', a: 'Research compound', b: 'Research compound' },
    ],
    proseSections: [
      {
        title: 'Two routes to the same banner',
        paragraphs: [
          'Epitalon (AEDG), a pineal-derived tetrapeptide developed by Khavinson’s group, is studied for upregulating the telomerase catalytic subunit and extending telomere length — one study extended human fibroblast replicative lifespan beyond the Hayflick limit without malignant transformation. Its longevity rationale is telomere maintenance and the pineal / circadian axis.',
          'MOTS-c is a mitochondrial-derived peptide studied for metabolic regulation — activating AMPK and acting as an exercise-mimetic signal that improves insulin sensitivity and metabolic flexibility in models. So the two address aging from opposite ends: Epitalon at the replicative / telomere level, MOTS-c at the mitochondrial / metabolic level.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are not substitutes — they target different aging mechanisms. Epitalon’s draw is telomere maintenance (with the caveat that its evidence is concentrated in a single research tradition and lacks large Western RCTs); MOTS-c’s is mitochondrial / metabolic regulation (largely preclinical). Both are research compounds, neither is FDA-approved. This page is a research and educational reference.',
      ],
    },
    faqs: [
      { q: 'What is the difference between Epitalon and MOTS-c?', a: 'Epitalon (AEDG) is a pineal-derived tetrapeptide studied for telomerase upregulation and telomere length. MOTS-c is a mitochondrial-derived peptide studied for metabolic regulation via AMPK as an exercise-mimetic signal. They target different aging mechanisms.' },
      { q: 'How strong is the evidence for each?', a: 'Epitalon’s research is concentrated in the Khavinson tradition with limited independent Western RCTs; MOTS-c data is largely preclinical (rodent and cell). Both should be read as early-stage.' },
      { q: 'Can they be studied together?', a: 'Because they act on different mechanisms — telomere maintenance versus mitochondrial metabolism — they are studied as complementary longevity approaches rather than alternatives.' },
      { q: 'Are they FDA-approved?', a: 'No. Both are research compounds and not FDA-approved. This page is a research and educational reference, not medical advice.' },
    ],
    relatedAreas: ['longevity-aging', 'mitochondrial'],
    about: [
      { name: 'Epitalon' },
      { name: 'MOTS-c' },
    ],
  },
]

export const COMPARISON_BY_SLUG: Record<string, Comparison> = Object.fromEntries(
  COMPARISONS.map((c) => [c.slug, c]),
)

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISON_BY_SLUG[slug]
}
