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
  {
    slug: 'semaglutide-vs-liraglutide',
    aSlug: 'semaglutide',
    bSlug: 'liraglutide',
    aName: 'Semaglutide',
    bName: 'Liraglutide',
    aPill: 'GLP-1R · once-weekly · FDA approved',
    bPill: 'GLP-1R · once-daily · FDA approved',
    metaTitle:
      'Semaglutide vs Liraglutide — Weekly vs Daily GLP-1, Trials & Differences | AmericanPeptide.com',
    metaDescription:
      'Research comparison of semaglutide (Ozempic/Wegovy) and liraglutide (Victoza/Saxenda) — the same acylated GLP-1 template at once-weekly vs once-daily dosing, head-to-head STEP 8 and SUSTAIN 10 data, and why the successor outperforms.',
    keywords: [
      'semaglutide vs liraglutide',
      'ozempic vs victoza',
      'wegovy vs saxenda',
      'STEP 8 trial',
      'SUSTAIN 10',
      'GLP-1 weekly vs daily',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'the same GLP-1 template, weekly versus daily',
    intro: [
      'Liraglutide proved the acylated GLP-1 idea; semaglutide is the successor that stretched it from once-daily to once-weekly and larger average weight loss. They share a mechanism and a maker — the differences are in engineering, dosing, and how they perform head-to-head.',
    ],
    atAGlance: [
      { dim: 'Generic name', a: 'Semaglutide', b: 'Liraglutide' },
      { dim: 'Brand names', a: 'Ozempic · Wegovy · Rybelsus', b: 'Victoza · Saxenda' },
      { dim: 'Developer', a: 'Novo Nordisk', b: 'Novo Nordisk' },
      { dim: 'Receptor target', a: 'GLP-1R (mono-agonist)', b: 'GLP-1R (mono-agonist)' },
      { dim: 'Dosing', a: 'Once weekly (injectable) · daily oral (Rybelsus)', b: 'Once daily (injectable)' },
      { dim: 'Half-life', a: '~168 h', b: '~13 h' },
      { dim: 'Acylation', a: 'C18 fatty-diacid + Aib8, Arg34', b: 'C16 palmitic acid + Arg34, via γGlu spacer' },
      { dim: 'Backbone', a: 'GLP-1 analog, 31 residues', b: 'GLP-1(7-37) analog' },
      { dim: 'Approved: T2D', a: 'Yes (Ozempic 2017; oral Rybelsus 2019)', b: 'Yes (Victoza 2010)' },
      { dim: 'Approved: obesity', a: 'Yes (Wegovy 2021, 2.4 mg)', b: 'Yes (Saxenda 2014, 3.0 mg)' },
      { dim: 'CV outcome trial', a: 'SUSTAIN-6 · SELECT (MACE reduction)', b: 'LEADER (MACE reduction)' },
      { dim: 'Molecular weight', a: '4113.6 Da', b: '3751.2 Da' },
    ],
    proseSections: [
      {
        title: 'One template, taken further',
        paragraphs: [
          'Both drugs solve the same problem — native GLP-1 lasts only minutes — the same way: a fatty-acid chain that binds reversibly to albumin, plus substitutions that resist the DPP-4 enzyme. Liraglutide (2010) was the proof of concept, carrying a C16 palmitic-acid chain on a glutamate spacer that stretched GLP-1’s half-life to about 13 hours — enough for once-daily injection.',
          'Semaglutide is that same strategy pushed harder: a longer C18 fatty-diacid, an Aib substitution at position 8 to further blunt DPP-4, and a linker tuned for tighter albumin binding. The result is a ~1-week half-life — once-weekly dosing — and, at obesity doses, meaningfully larger weight loss. Semaglutide also reaches where liraglutide cannot: an oral tablet (Rybelsus), something a daily-injection molecule never offered.',
        ],
      },
    ],
    trials: [
      { name: 'STEP 8', arm: 'Sema 2.4 mg vs Lira 3.0 mg', n: '338', duration: '68 wk', endpoint: 'Mean body-weight change (obesity, no diabetes)', result: '−15.8% (sema) vs −6.4% (lira)', note: 'Rubino et al., JAMA 2022 — direct head-to-head; semaglutide superior' },
      { name: 'SUSTAIN 10', arm: 'Sema 1.0 mg vs Lira 1.2 mg', n: '577', duration: '30 wk', endpoint: 'HbA1c & weight (type 2 diabetes)', result: 'HbA1c −1.7 vs −1.0% · weight −5.8 vs −1.9 kg', note: 'Open-label; semaglutide superior on both' },
      { name: 'LEADER', arm: 'Liraglutide', n: '9340', duration: '~3.8 yr', endpoint: 'MACE (CV outcome)', result: '13% MACE reduction vs placebo', note: 'Established liraglutide’s cardiovascular benefit in T2D' },
      { name: 'SELECT', arm: 'Semaglutide 2.4 mg', n: '17604', duration: '~5 yr', endpoint: 'MACE in obesity without diabetes', result: '20% MACE reduction vs placebo', note: 'Extended CV benefit to obesity without diabetes' },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'Where the two have been compared directly — STEP 8 in obesity and SUSTAIN 10 in type 2 diabetes — once-weekly semaglutide produced greater weight loss and larger HbA1c reductions than once-daily liraglutide. Both carry proven cardiovascular-outcome data (LEADER for liraglutide; SUSTAIN-6 and SELECT for semaglutide). Liraglutide remains a used medicine and the historical bridge to the weekly era; semaglutide is the more potent successor. These are population means from trials, not predictions for any individual.',
      ],
    },
    faqs: [
      { q: 'What is the main difference between semaglutide and liraglutide?', a: 'Both are acylated GLP-1 receptor agonists from Novo Nordisk that work by the same mechanism. Liraglutide is dosed once daily (half-life ~13 hours); semaglutide was engineered — a longer fatty-acid chain and an additional DPP-4-resistant substitution — for once-weekly dosing and, at obesity doses, larger average weight loss.' },
      { q: 'Which causes more weight loss?', a: 'In the head-to-head STEP 8 trial (68 weeks, obesity without diabetes), semaglutide 2.4 mg produced −15.8% mean body-weight change versus −6.4% for liraglutide 3.0 mg. Semaglutide was superior on the primary endpoint. Individual responses vary; these are population means.' },
      { q: 'What is the difference between Victoza/Saxenda and Ozempic/Wegovy?', a: 'Victoza (liraglutide) and Ozempic (semaglutide) are the diabetes doses; Saxenda (liraglutide 3.0 mg) and Wegovy (semaglutide 2.4 mg) are the higher obesity doses. Within each brand pair the compound is the same; dose and FDA indication differ.' },
      { q: 'Is one available as a pill?', a: 'Semaglutide is — as oral Rybelsus for type 2 diabetes. Liraglutide is injectable only. Both injectable forms are subcutaneous.' },
      { q: 'Are both FDA-approved?', a: 'Yes. Liraglutide: Victoza (T2D, 2010) and Saxenda (obesity, 2014). Semaglutide: Ozempic (T2D, 2017), Rybelsus (oral T2D, 2019), and Wegovy (obesity, 2021). This page is a research and educational reference, not medical advice.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Semaglutide', alternateName: 'Ozempic' },
      { name: 'Liraglutide', alternateName: 'Victoza' },
    ],
  },
  {
    slug: 'retatrutide-vs-semaglutide',
    aSlug: 'retatrutide',
    bSlug: 'semaglutide',
    aName: 'Retatrutide',
    bName: 'Semaglutide',
    aPill: 'Triple agonist · investigational',
    bPill: 'GLP-1R · FDA approved',
    metaTitle:
      'Retatrutide vs Semaglutide — Triple Agonist vs GLP-1, Weight-Loss Data | AmericanPeptide.com',
    metaDescription:
      'Research comparison of retatrutide (GIP/GLP-1/glucagon triple agonist) and semaglutide (GLP-1 mono-agonist) — what two extra receptors add, the ~24% vs ~15% weight-loss figures, and why this is a cross-trial, not head-to-head, comparison.',
    keywords: [
      'retatrutide vs semaglutide',
      'triple agonist vs GLP-1',
      'retatrutide vs ozempic',
      'LY3437943 vs semaglutide',
      'retatrutide weight loss',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'three receptors versus one',
    intro: [
      'Semaglutide is the established GLP-1 mono-agonist; retatrutide is the investigational triple agonist that adds GIP and glucagon on top. It is the widest mechanistic gap in the incretin field — and, importantly, one that has not been tested head-to-head. This page separates what the trials show from what they don’t.',
    ],
    atAGlance: [
      { dim: 'Receptor targets', a: 'GIP-R + GLP-1R + glucagon-R', b: 'GLP-1R only' },
      { dim: 'Agonism class', a: 'Triple agonist', b: 'Mono-agonist' },
      { dim: 'Developer', a: 'Eli Lilly (LY3437943)', b: 'Novo Nordisk' },
      { dim: 'Approval status', a: 'Investigational (Phase 3 — TRIUMPH)', b: 'FDA approved (2017 T2D · 2021 obesity)' },
      { dim: 'Peak weight ↓ (trial)', a: '~24% (Phase 2, 48 wk, 12 mg)', b: '~15% (STEP-1, 68 wk, 2.4 mg)' },
      { dim: 'Extra vs GLP-1', a: 'GIP (insulinotropic) + glucagon (energy expenditure, liver fat)', b: '—' },
      { dim: 'Dosing', a: 'Once weekly (trial)', b: 'Once weekly (or daily oral)' },
      { dim: 'Maturity of evidence', a: 'Phase 2 complete; Phase 3 ongoing', b: 'Multiple completed Phase 3 + CV outcomes' },
    ],
    columnSections: [
      {
        title: 'What the two extra receptors add',
        columns: [
          {
            heading: 'GLP-1 agonism (shared)',
            accent: 'neutral',
            points: [
              'Glucose-dependent insulin secretion and glucagon suppression',
              'Slowed gastric emptying and central appetite reduction',
              'The single mechanism behind semaglutide’s full effect',
            ],
          },
          {
            heading: 'GIP + glucagon (retatrutide only)',
            accent: 'a',
            points: [
              'GIP: a complementary insulinotropic and adipose signal',
              'Glucagon: raises energy expenditure beyond appetite suppression',
              'Glucagon: promotes hepatic lipolysis — studied for liver-fat reduction',
              'The proposed basis for the larger Phase 2 weight reduction',
            ],
          },
        ],
      },
    ],
    trials: [
      { name: 'Retatrutide Phase 2', arm: 'Retatrutide 12 mg', n: '338', duration: '48 wk', endpoint: 'Mean body-weight change', result: '~24% vs ~2% (placebo)', note: 'Jastreboff et al., NEJM 2023; highest-dose arm' },
      { name: 'STEP-1', arm: 'Semaglutide 2.4 mg', n: '1961', duration: '68 wk', endpoint: 'Mean body-weight change', result: '−14.9% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Wegovy' },
      { name: 'TRIUMPH program', arm: 'Retatrutide (multiple)', duration: 'Ongoing', endpoint: 'Phase 3 efficacy/safety', result: 'In progress — not yet reported', note: 'Approval and any label depend on these outcomes' },
    ],
    verdict: {
      title: 'What the evidence supports — and what it doesn’t',
      paragraphs: [
        'Retatrutide’s triple mechanism produced the largest mean weight reduction reported for an incretin agent in Phase 2 (~24%), above semaglutide’s pivotal STEP-1 figure (~15%). But these are separate trials at different doses, durations, and stages — not a head-to-head — so the gap is suggestive, not settled. Semaglutide is FDA-approved with completed Phase 3 and cardiovascular-outcome data; retatrutide is investigational, with its Phase 3 (TRIUMPH) results and full safety profile still pending. Treat the comparison as mechanism plus early data, not a ranking.',
      ],
    },
    faqs: [
      { q: 'What is the difference between retatrutide and semaglutide?', a: 'Semaglutide activates only the GLP-1 receptor. Retatrutide activates three receptors — GIP, GLP-1, and glucagon. The added GIP and glucagon arms are associated with a complementary insulin signal, increased energy expenditure, and hepatic fat reduction, and are the proposed basis for retatrutide’s larger Phase 2 weight loss.' },
      { q: 'Is retatrutide better than semaglutide for weight loss?', a: 'In Phase 2, retatrutide reported ~24% mean weight reduction at the highest dose versus semaglutide’s ~15% in STEP-1 — but across different trials, not a direct comparison, and retatrutide’s Phase 3 results are not yet reported. It is premature to call one superior on head-to-head evidence, because none exists yet.' },
      { q: 'Is retatrutide FDA-approved?', a: 'No. Retatrutide (LY3437943) is investigational and in Phase 3 (the TRIUMPH program). Semaglutide is FDA-approved as Ozempic, Rybelsus, and Wegovy.' },
      { q: 'What does the glucagon receptor add over GLP-1?', a: 'Beyond GLP-1’s appetite and glycemic effects, glucagon-receptor agonism is studied for increased energy expenditure and hepatic lipolysis (liver-fat reduction). The trade-off is that glucagon can raise glucose, so a triple agonist must balance it against the insulinotropic GLP-1/GIP signals.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Retatrutide', alternateName: 'LY3437943' },
      { name: 'Semaglutide', alternateName: 'Ozempic' },
    ],
  },
  {
    slug: 'mk-677-vs-ipamorelin',
    aSlug: 'mk-677',
    bSlug: 'ipamorelin',
    aName: 'MK-677',
    bName: 'Ipamorelin',
    aPill: 'Oral ghrelin mimetic · non-peptide',
    bPill: 'Selective GHRP · pentapeptide',
    metaTitle:
      'MK-677 vs Ipamorelin — Oral vs Injectable Ghrelin-Receptor GH Secretagogues | AmericanPeptide.com',
    metaDescription:
      'Research comparison of MK-677 (ibutamoren) and ipamorelin — the same ghrelin receptor, two very different tools: an oral non-peptide with ~24-hour action vs a selective injectable pentapeptide that acts in short pulses. Cited.',
    keywords: [
      'MK-677 vs ipamorelin',
      'ibutamoren vs ipamorelin',
      'oral GH secretagogue',
      'ghrelin receptor agonist comparison',
      'sustained vs pulsatile GH',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'same receptor, oral-sustained versus injectable-pulsatile',
    intro: [
      'MK-677 and ipamorelin both raise growth hormone through the same ghrelin receptor — but one is an oral small molecule that works for about a day, and the other is a selective injectable peptide that acts in short pulses. The receptor is shared; almost everything about how they behave is not.',
    ],
    atAGlance: [
      { dim: 'Chemical class', a: 'Non-peptide small molecule (spiroindoline)', b: 'Pentapeptide (GHRP)' },
      { dim: 'Receptor', a: 'GHS-R1a (ghrelin receptor)', b: 'GHS-R1a (ghrelin receptor)' },
      { dim: 'Route', a: 'Oral', b: 'Injectable (subcutaneous)' },
      { dim: 'Duration of action', a: '~24 h per dose (sustained)', b: '~2 h (short, pulsatile)' },
      { dim: 'GH release pattern', a: 'Sustained GH / IGF-1 elevation', b: 'Discrete, physiologic pulse' },
      { dim: 'Selectivity', a: 'Ghrelin-receptor agonist; can raise appetite, cortisol, glucose', b: 'Highly selective — minimal cortisol / prolactin' },
      { dim: 'Appetite effect', a: 'Increased (ghrelin mimetic)', b: 'Minimal' },
      { dim: 'Origin', a: 'Merck (MK-0677), 1990s', b: 'Characterized by Raun et al., 1998' },
      { dim: 'Molecular weight', a: '528.7 Da', b: '711.9 Da' },
      { dim: 'FDA approval', a: 'None (reached late-stage trials)', b: 'None' },
      { dim: 'WADA status', a: 'Prohibited (S2)', b: 'Prohibited (S2)' },
    ],
    proseSections: [
      {
        title: 'The oral-versus-pulse trade-off',
        paragraphs: [
          'The defining fact about MK-677 (ibutamoren) is that it is not a peptide. It is a spiroindoline small molecule Merck designed in the 1990s to do orally what the injectable GHRP peptides do — activate the ghrelin receptor to release growth hormone. A single oral dose raises GH and IGF-1 for roughly 24 hours, which is the practical appeal and, simultaneously, the physiologic caveat: sustained ghrelin-receptor tone raises baseline IGF-1 and blunts the natural pulsatility of the GH axis, and — because it mimics ghrelin — it tends to increase appetite and can nudge cortisol, blood glucose, and water retention.',
          'Ipamorelin is the opposite design. It is a selective pentapeptide that produces a short, discrete GH pulse and, unlike earlier GHRPs, releases GH with minimal effect on ACTH, cortisol, or prolactin (Raun et al., 1998). It has to be injected and it acts briefly — but that brevity preserves the pulsatile pattern the body uses, and its clean receptor profile is studied as more sustainable over repeated exposure. So the choice is a genuine trade-off: oral convenience and all-day elevation versus injectable, selective, pulse-preserving release.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are not interchangeable. MK-677 is the tool when oral dosing and sustained GH/IGF-1 elevation are the point — accepting increased appetite and a blunted pulse; ipamorelin is the tool when selectivity and a physiologic, pulsatile signal matter — accepting the need to inject. One is a non-peptide catalogued alongside the peptides for its shared mechanism; the other is the reference selective GHRP. Neither is FDA-approved, and both are prohibited in sport.',
      ],
    },
    faqs: [
      { q: 'What is the difference between MK-677 and ipamorelin?', a: 'Both activate the same ghrelin receptor (GHS-R1a) to release growth hormone, but MK-677 (ibutamoren) is an oral non-peptide small molecule that elevates GH and IGF-1 for about 24 hours, while ipamorelin is a selective injectable pentapeptide that produces a short GH pulse with minimal cortisol or prolactin.' },
      { q: 'Is MK-677 a peptide?', a: 'No. MK-677 is a small molecule (a spiroindoline), not a peptide. It is grouped with the GH peptides because it shares their ghrelin-receptor mechanism and is used the same way — but chemically it belongs to a different class.' },
      { q: 'Which is more physiologic?', a: 'Ipamorelin. Its short half-life produces a discrete pulse that preserves the natural GH rhythm, whereas MK-677’s all-day elevation raises baseline IGF-1 and blunts pulsatility. MK-677 also raises appetite because it mimics ghrelin.' },
      { q: 'Are either FDA-approved?', a: 'No. MK-677 reached late-stage clinical trials (for example in older adults and hip-fracture recovery) without approval; ipamorelin is a research compound. Both are prohibited in sport. This page is a research and educational reference.' },
    ],
    relatedAreas: ['growth-hormone-axis'],
    about: [
      { name: 'MK-677', alternateName: 'Ibutamoren' },
      { name: 'Ipamorelin' },
    ],
  },
  {
    slug: 'tesamorelin-vs-cjc-1295',
    aSlug: 'tesamorelin',
    bSlug: 'cjc-1295-with-dac',
    aName: 'Tesamorelin',
    bName: 'CJC-1295',
    aPill: 'GHRH(1-44) · FDA approved',
    bPill: 'GHRH(1-29) analog · research',
    metaTitle:
      'Tesamorelin vs CJC-1295 — The Approved GHRH Analog vs the Research One | AmericanPeptide.com',
    metaDescription:
      'Research comparison of tesamorelin (Egrifta, the only FDA-approved GHRH analog) and CJC-1295 — full-length GHRH(1-44) with Phase 3 visceral-fat data vs a modified GHRH(1-29) research compound, with or without DAC. Cited.',
    keywords: [
      'tesamorelin vs CJC-1295',
      'GHRH analog comparison',
      'tesamorelin Egrifta',
      'CJC-1295 DAC',
      'visceral fat peptide',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GH Peptides', href: '/gh-peptides' },
    headline: 'the approved GHRH analog versus the research one',
    intro: [
      'Tesamorelin and CJC-1295 are both GHRH-receptor agonists that prompt the pituitary to release the body’s own growth hormone. One is an FDA-approved drug with a specific indication and Phase 3 evidence; the other is a research compound built on a shorter GHRH fragment. That difference — approved-and-characterized versus research-grade — is the real story.',
    ],
    atAGlance: [
      { dim: 'Class', a: 'Stabilized GHRH(1-44) analog', b: 'Modified GHRH(1-29) analog (Mod GRF 1-29)' },
      { dim: 'Receptor', a: 'GHRH receptor (GHRHR)', b: 'GHRH receptor (GHRHR)' },
      { dim: 'Key modification', a: 'N-terminal trans-3-hexenoic acid on full-length GHRH(1-44)', b: 'Four DPP-4-resistant substitutions ± albumin-binding DAC' },
      { dim: 'Duration / dosing', a: 'Short-acting — dosed daily (SC)', b: 'No DAC: ~30 min pulse · with DAC: ~6–8 days' },
      { dim: 'GH release pattern', a: 'Prompts endogenous, feedback-preserving GH', b: 'Pulsatile (no DAC) / sustained, blunted pulse (DAC)' },
      { dim: 'Approval status', a: 'FDA approved (Egrifta, 2010)', b: 'None — research compound' },
      { dim: 'Approved indication', a: 'Excess visceral fat in HIV-associated lipodystrophy', b: '—' },
      { dim: 'Evidence base', a: 'Completed Phase 3 trials', b: 'Human PK plus preclinical / anecdotal' },
      { dim: 'Molecular weight', a: '5135.9 Da', b: '~3.6 kDa (with DAC)' },
      { dim: 'Commonly paired with', a: 'Studied as monotherapy (approved)', b: 'A GHRP (e.g. ipamorelin)' },
    ],
    proseSections: [
      {
        title: 'Full-length and approved vs truncated and research',
        paragraphs: [
          'Tesamorelin is a stabilized analog of the full 44-residue GHRH sequence, capped at the N-terminus with a trans-3-hexenoic acid group that protects it from rapid breakdown. It is short-acting and dosed daily — but it is the only GHRH analog to carry an FDA approval, granted in 2010 (Egrifta) to reduce excess visceral abdominal fat in people with HIV-associated lipodystrophy, backed by completed Phase 3 trials. Because it stimulates the pituitary to release endogenous GH, it preserves more of the body’s natural feedback than exogenous GH would.',
          'CJC-1295 starts from a shorter piece — the first 29 residues of GHRH — with four substitutions that resist DPP-4. On its own (no DAC) it produces a brief, ~30-minute pulse; with the Drug Affinity Complex, it binds albumin and stretches to a 6–8-day half-life, trading pulsatility for sustained elevation. It is a research compound: its human evidence is largely pharmacokinetic, and it is typically studied alongside a GHRP rather than as a standalone therapy. So beyond the shared receptor, the two diverge on the thing that matters most for a reference — the depth and grade of the evidence behind them.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'Both raise endogenous GH through the GHRH receptor, but they sit on opposite sides of the evidence line. Tesamorelin is an approved drug with a defined indication, a known structure, and Phase 3 data — the reference point for what a characterized GHRH analog looks like. CJC-1295 is a research compound on a truncated backbone whose main appeal is the multi-day duration the DAC provides; its evidence is thinner and it is not approved. For research framing, tesamorelin is the benchmark and CJC-1295 the experimental tool.',
      ],
    },
    faqs: [
      { q: 'What is the difference between tesamorelin and CJC-1295?', a: 'Both are GHRH-receptor agonists that stimulate the pituitary to release growth hormone. Tesamorelin is a stabilized full-length GHRH(1-44) analog and the only FDA-approved GHRH analog (Egrifta, for HIV-associated visceral fat). CJC-1295 is a modified GHRH(1-29) research compound that, with a Drug Affinity Complex (DAC), can last 6–8 days.' },
      { q: 'Is tesamorelin FDA-approved?', a: 'Yes — as Egrifta (2010), to reduce excess visceral abdominal fat in people with HIV-associated lipodystrophy. CJC-1295 is not FDA-approved for any use.' },
      { q: 'Which lasts longer?', a: 'CJC-1295 with DAC lasts far longer (6–8 days) than tesamorelin, which is short-acting and dosed daily. Longer duration is not automatically better: sustained GHRH exposure blunts the natural pulsatility of the GH axis, whereas tesamorelin’s daily dosing better preserves it.' },
      { q: 'Why is CJC-1295 paired with a GHRP?', a: 'GHRH analogs and GHRPs (like ipamorelin) act on different receptors on the same pituitary cells; combining them is studied for synergistic GH release. Tesamorelin, as an approved drug, is used as monotherapy in its indication. This page is a research and educational reference.' },
    ],
    relatedAreas: ['growth-hormone-axis'],
    about: [
      { name: 'Tesamorelin', alternateName: 'Egrifta' },
      { name: 'CJC-1295' },
    ],
  },
  {
    slug: 'pt-141-vs-melanotan-2',
    aSlug: 'pt-141',
    bSlug: 'melanotan-2',
    aName: 'PT-141',
    bName: 'Melanotan II',
    aPill: 'MC4R-preferential · FDA approved',
    bPill: 'Non-selective MC1–5R · unapproved',
    metaTitle:
      'PT-141 vs Melanotan II — The Libido Metabolite vs the Tanning Peptide | AmericanPeptide.com',
    metaDescription:
      'Research comparison of PT-141 (bremelanotide) and Melanotan II — how the FDA-approved MC4R agonist for desire was literally derived from the non-selective tanning peptide, and what a single C-terminal change did to selectivity. Cited.',
    keywords: [
      'PT-141 vs melanotan 2',
      'bremelanotide vs melanotan II',
      'melanocortin agonist comparison',
      'PT-141 metabolite melanotan',
      'MC4R vs MC1R',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'Melanocortin Peptides', href: '/melanocortin' },
    headline: 'the same core peptide, one refined toward desire',
    intro: [
      'PT-141 and Melanotan II are not rivals so much as parent and offspring: bremelanotide (PT-141) is the active metabolite of Melanotan II, and the story of how one became the other is a lesson in what receptor selectivity buys you. One is FDA-approved for sexual desire; the other is an unapproved, non-selective tanning peptide.',
    ],
    atAGlance: [
      { dim: 'Structure', a: 'Cyclic heptapeptide, C-terminal free acid (-OH)', b: 'Cyclic heptapeptide, C-terminal amide (-NH2)' },
      { dim: 'Relationship', a: 'Active metabolite of Melanotan II', b: 'The parent compound' },
      { dim: 'Receptor profile', a: 'MC4R-preferential', b: 'Non-selective: MC1R / MC3R / MC4R / MC5R' },
      { dim: 'Primary effect', a: 'Central sexual arousal (MC4R)', b: 'Pigmentation (MC1R) + MC4R central effects' },
      { dim: 'Tanning activity', a: 'Not the target (refined away from MC1R)', b: 'Yes — its best-known use' },
      { dim: 'FDA status', a: 'Approved (Vyleesi, 2019, HSDD in premenopausal women)', b: 'Not approved' },
      { dim: 'Known side effects', a: 'Nausea, flushing, transient BP rise', b: 'Nausea, flushing, spontaneous erections, mole/freckle darkening' },
      { dim: 'Origin', a: 'Palatin Technologies (Molinoff / Diamond et al., 2003)', b: 'University of Arizona' },
    ],
    proseSections: [
      {
        title: 'How a tanning peptide became a desire drug',
        paragraphs: [
          'Melanotan II was developed at the University of Arizona as a non-selective α-MSH analog — it activates all four melanocortin receptors from MC1R to MC5R. Through MC1R it drives pigmentation, which is what it became known for; but through MC4R it also acts on central sexual-response circuits, and in early human studies that MC4R activity showed up as spontaneous erections alongside nausea and flushing. Those “side effects” were the clue: the arousal signal could be separated from the tan.',
          'PT-141 (bremelanotide) is what that separation looks like chemically. It is the active metabolite of Melanotan II, differing by a single change at the C-terminus — an amide (-NH2) replaced by a free acid (-OH) — which shifts the molecule’s preference toward MC4R and away from the MC1R-driven pigmentation. Refined that way and developed for central arousal, it became FDA-approved (Vyleesi, 2019) for hypoactive sexual desire disorder in premenopausal women. Melanotan II, non-selective and carrying the pigmentation and off-target effects that selectivity removes, never gained approval.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'This is a textbook case of selectivity turning a research peptide into an approved drug. Melanotan II is the non-selective parent — pigmentation plus MC4R effects plus the off-target profile that comes with hitting every melanocortin receptor. PT-141 is the MC4R-preferential metabolite, refined toward sexual desire and cleaned up enough to reach approval for a specific indication. They share a core structure, but only one is a characterized, approved medicine; the other remains an unapproved, gray-market compound. This page is a research and educational reference, not a usage recommendation.',
      ],
    },
    faqs: [
      { q: 'What is the difference between PT-141 and Melanotan II?', a: 'Melanotan II is a non-selective melanocortin agonist (MC1R–MC5R) best known for pigmentation, and it is not approved. PT-141 (bremelanotide) is its active metabolite, refined toward the MC4R receptor and central sexual arousal, and it is FDA-approved as Vyleesi for hypoactive sexual desire disorder in premenopausal women.' },
      { q: 'Is PT-141 really derived from Melanotan II?', a: 'Yes. Bremelanotide (PT-141) is the active metabolite of Melanotan II, differing by a single C-terminal change — an amide replaced by a free acid — which shifts its receptor preference toward MC4R and away from the MC1R pigmentation activity. Its development followed the observation that Melanotan II produced arousal effects via MC4R.' },
      { q: 'Does PT-141 cause tanning?', a: 'Tanning is not its purpose. PT-141 is refined toward MC4R and away from the MC1R activity that drives pigmentation, so it is studied and approved for sexual desire rather than as a tanning agent. Melanotan II is the non-selective one that produces the tan.' },
      { q: 'Is either FDA-approved?', a: 'PT-141 (bremelanotide) is FDA-approved as Vyleesi (2019). Melanotan II is not approved. This page is a research and educational reference, not medical advice or a usage recommendation.' },
    ],
    relatedAreas: ['sexual-reproductive', 'skin-hair'],
    about: [
      { name: 'PT-141', alternateName: 'Bremelanotide' },
      { name: 'Melanotan II', alternateName: 'MT-II' },
    ],
  },
  {
    slug: 'bpc-157-vs-ghk-cu',
    aSlug: 'bpc-157',
    bSlug: 'ghk-cu',
    aName: 'BPC-157',
    bName: 'GHK-Cu',
    aPill: 'Gastric pentadecapeptide · systemic repair',
    bPill: 'Copper tripeptide · skin & ECM',
    metaTitle:
      'BPC-157 vs GHK-Cu — Systemic Tissue Repair vs Copper-Peptide Skin Remodeling | AmericanPeptide.com',
    metaDescription:
      'Research comparison of BPC-157 and GHK-Cu — two of the most-searched “repair” peptides that work through different mechanisms (angiogenesis/NO vs copper delivery and ECM remodeling) on different tissue. Cited, research-grade.',
    keywords: [
      'BPC-157 vs GHK-Cu',
      'copper peptide vs BPC-157',
      'repair peptide comparison',
      'GHK-Cu skin',
      'BPC-157 tissue repair',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'Healing & Repair', href: '/catalog/category/healing-repair' },
    headline: 'systemic repair versus skin & matrix remodeling',
    intro: [
      'BPC-157 and GHK-Cu are often grouped under “recovery” or “regeneration,” but they are quite different molecules doing different jobs in different tissue — a systemic injury-repair peptide versus a copper-carrying skin and matrix signal. Grouping them by outcome hides how little they share by mechanism.',
    ],
    atAGlance: [
      { dim: 'Structure', a: '15-aa pentadecapeptide (gastric-derived)', b: 'Copper-bound tripeptide (Gly-His-Lys)' },
      { dim: 'Primary mechanism', a: 'VEGFR2–Akt–eNOS angiogenesis + nitric-oxide signaling', b: 'Copper delivery + ECM-remodeling gene modulation' },
      { dim: 'Target tissue', a: 'Tendon, ligament, muscle, GI tract (systemic)', b: 'Skin, extracellular matrix, hair follicle' },
      { dim: 'Typical route (research)', a: 'Injected / oral (systemic)', b: 'Topical / local (also injectable)' },
      { dim: 'Best-studied for', a: 'Musculoskeletal and gut repair', b: 'Collagen / elastin synthesis, wound healing, skin aging' },
      { dim: 'Evidence base', a: 'Preclinical (largely rodent, one main group); no controlled human trials', b: 'Extensive dermatologic / cosmetic literature, incl. human topical data' },
      { dim: 'Status', a: 'Research compound — not FDA-approved', b: 'Cosmetic ingredient (Copper Tripeptide-1) / research' },
      { dim: 'Molecular weight', a: '1419.5 Da', b: '401.9 Da' },
    ],
    columnSections: [
      {
        title: 'Two different repair mechanisms',
        columns: [
          {
            heading: 'BPC-157 — perfusion-led',
            accent: 'a',
            points: [
              'Attributed to VEGFR2–Akt–eNOS activation → nitric-oxide-dependent angiogenesis',
              'Studied for new-vessel formation in poorly vascularized tissue like tendon',
              'Cytoprotective effects prominent in gastrointestinal models',
              'Acts systemically — the interest is injury repair, not cosmetics',
            ],
          },
          {
            heading: 'GHK-Cu — matrix-led',
            accent: 'b',
            points: [
              'Carries copper(II), a cofactor for matrix-remodeling and antioxidant enzymes',
              'Modulates collagen, elastin, glycosaminoglycan and decorin synthesis',
              'Studied for wound healing, skin aging, and hair-follicle biology',
              'Predominantly topical / local — the reference “copper peptide”',
            ],
          },
        ],
      },
    ],
    proseSections: [
      {
        title: 'Different molecules, different evidence',
        paragraphs: [
          'BPC-157 is a 15-residue peptide derived from a protective protein in gastric juice, studied as a systemic pro-angiogenic and cytoprotective agent — its repair effects are attributed largely to the VEGFR2–Akt–eNOS pathway and nitric-oxide signaling, with the most-replicated results in tendon, ligament, and gastrointestinal models. The honest caveat is evidence quality: essentially all of it is preclinical, much from a single research group, with no controlled human trials.',
          'GHK-Cu is a different kind of molecule and a different kind of literature. It is the copper complex of the tripeptide glycyl-histidyl-lysine, first isolated from human plasma in 1973, and it works by delivering copper and shifting the expression of extracellular-matrix and antioxidant genes. Its evidence is concentrated in dermatology and cosmetics — including human topical data — where it is a reference “copper peptide” (INCI Copper Tripeptide-1) for collagen support, wound healing, and skin aging. So the two overlap only at the vaguest level (“repair”): one is a systemic injury peptide with thin human data, the other a topical skin/matrix signal with a deeper cosmetic record.',
        ],
      },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'These are complementary tools for different questions, not substitutes. BPC-157 is studied for systemic tissue and gut repair through angiogenesis and nitric-oxide signaling, with a preclinical-only evidence base. GHK-Cu is the reference copper peptide for skin and extracellular-matrix remodeling, with a much deeper dermatologic and cosmetic literature. Neither is an FDA-approved drug — GHK-Cu is a cosmetic ingredient, BPC-157 a research compound — and grouping them as one “recovery” category obscures how differently they act. This page is a research and educational reference.',
      ],
    },
    faqs: [
      { q: 'What is the difference between BPC-157 and GHK-Cu?', a: 'BPC-157 is a 15-amino-acid peptide studied for systemic tissue repair — tendon, ligament, and gut — through angiogenesis (the VEGFR2–Akt–eNOS pathway) and nitric-oxide signaling. GHK-Cu is a copper-bound tripeptide studied for skin and extracellular-matrix remodeling (collagen, elastin) and wound healing. Different structures, mechanisms, and target tissue.' },
      { q: 'Are BPC-157 and GHK-Cu used together?', a: 'Because they act on different tissue by different mechanisms, they are sometimes discussed together in “recovery” contexts, but there is no controlled human data on the combination. This page is a research reference, not a protocol.' },
      { q: 'Which has stronger evidence?', a: 'They have different kinds of evidence. GHK-Cu has an extensive dermatologic and cosmetic literature, including human topical studies. BPC-157’s evidence is almost entirely preclinical (mostly rodent, much from a single group), with no controlled human trials. Neither is an approved drug.' },
      { q: 'Is either FDA-approved?', a: 'No. BPC-157 is a research compound and is not FDA-approved for any use. GHK-Cu is used as a cosmetic ingredient (Copper Tripeptide-1), not an approved drug. This page is a research and educational reference.' },
    ],
    relatedAreas: ['wound-healing', 'skin-hair'],
    about: [
      { name: 'BPC-157', alternateName: 'Body Protective Compound 157' },
      { name: 'GHK-Cu', alternateName: 'Copper Tripeptide-1' },
    ],
  },
  {
    slug: 'cagrisema-vs-tirzepatide',
    aSlug: 'cagrisema',
    bSlug: 'tirzepatide',
    aName: 'CagriSema',
    bName: 'Tirzepatide',
    aPill: 'Amylin + GLP-1 · investigational',
    bPill: 'GIP/GLP-1R · FDA approved',
    metaTitle:
      'CagriSema vs Tirzepatide — Combination vs Single-Molecule, Trial Data | AmericanPeptide.com',
    metaDescription:
      'Research comparison of CagriSema (cagrilintide + semaglutide) and tirzepatide (Zepbound) — two ways to exceed semaglutide: co-formulating two peptides vs one dual-receptor molecule. REDEFINE 1 vs SURMOUNT-1 data, cross-trial. Cited.',
    keywords: [
      'cagrisema vs tirzepatide',
      'cagrisema vs zepbound',
      'REDEFINE 1 results',
      'amylin GLP-1 vs GIP GLP-1',
      'next-gen obesity drugs',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'two peptides combined versus one dual-receptor molecule',
    intro: [
      'CagriSema and tirzepatide are two different answers to the same question — how to beat semaglutide on weight. Tirzepatide engineers a second receptor (GIP) into one molecule; CagriSema instead co-formulates two peptides (amylin plus semaglutide). One is FDA-approved and one is investigational, and their trial numbers land close enough that the design philosophy is the real story.',
    ],
    atAGlance: [
      { dim: 'What it is', a: 'Fixed combination of two peptides', b: 'One synthetic dual-agonist molecule' },
      { dim: 'Mechanism', a: 'Amylin (cagrilintide) + GLP-1 (semaglutide)', b: 'GIP + GLP-1 co-agonism' },
      { dim: 'Developer', a: 'Novo Nordisk', b: 'Eli Lilly' },
      { dim: 'Dosing', a: 'Once weekly (injectable)', b: 'Once weekly (injectable)' },
      { dim: 'Peak weight ↓ (trial)', a: '~20.4% (REDEFINE 1, 68 wk; up to 22.7% w/ full adherence)', b: '~22.5% (SURMOUNT-1, 72 wk, 15 mg)' },
      { dim: 'Approval status', a: 'Investigational (Phase 3 REDEFINE)', b: 'FDA approved (Mounjaro 2022 · Zepbound 2023)' },
      { dim: 'Molecular identity', a: 'No single formula — a co-formulation', b: '39-aa peptide, MW 4813.5' },
      { dim: 'Maturity of evidence', a: 'Phase 3 program reporting', b: 'Multiple completed Phase 3 + CV/OSA data' },
    ],
    proseSections: [
      {
        title: 'Combine two, or engineer one',
        paragraphs: [
          'Tirzepatide is a single 39-residue peptide designed to hit two incretin receptors at once — GIP and GLP-1 — and it is the approved benchmark, with ~22.5% mean weight loss in SURMOUNT-1 and a full Phase 3 record behind it. CagriSema takes the opposite route: instead of one multi-receptor molecule, Novo Nordisk combines two of its existing peptides in a single weekly injection — the amylin analog cagrilintide and the GLP-1 agonist semaglutide — pairing two different satiety systems.',
          'In the Phase 3 REDEFINE 1 trial, CagriSema produced roughly 20.4% mean weight loss over 68 weeks (up to 22.7% under a full-adherence analysis) — clearly beating semaglutide alone (14.9%) and cagrilintide alone (11.5%), which is the proof that the amylin arm adds real effect. But it landed close to tirzepatide’s figure rather than above it, and below the ~25% the market had priced in. So the honest read is two comparably powerful approaches: an approved single molecule versus an investigational two-peptide combination.',
        ],
      },
    ],
    trials: [
      { name: 'REDEFINE 1', arm: 'CagriSema vs sema 2.4 vs cagri 2.4', n: '3417', duration: '68 wk', endpoint: 'Mean body-weight change (obesity, no diabetes)', result: '−20.4% vs −14.9% (sema) vs −11.5% (cagri) vs −3.0% (placebo)', note: 'Treatment-policy estimand; up to −22.7% under full adherence' },
      { name: 'SURMOUNT-1', arm: 'Tirzepatide 15 mg', n: '2539', duration: '72 wk', endpoint: 'Mean body-weight change', result: '−22.5% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Zepbound' },
      { name: 'REDEFINE 2', arm: 'CagriSema (type 2 diabetes)', n: '1206', duration: '68 wk', endpoint: 'Mean body-weight change', result: '−13.7% vs −3.4% (placebo)', note: 'Diabetes population — smaller loss, as expected for the class' },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'These are two strong, comparably effective strategies rather than a clear winner. Tirzepatide is the FDA-approved single-molecule dual agonist with the deeper evidence base; CagriSema is the investigational two-peptide combination that clearly beats its own components but did not decisively exceed tirzepatide, and came in under lofty expectations. Note that REDEFINE and SURMOUNT are separate trials — this is a cross-trial comparison, not a head-to-head. These are population means, not predictions for any individual.',
      ],
    },
    faqs: [
      { q: 'What is the difference between CagriSema and tirzepatide?', a: 'Tirzepatide is one synthetic molecule that activates two receptors (GIP and GLP-1). CagriSema is a fixed combination of two separate peptides — cagrilintide (an amylin analog) and semaglutide (a GLP-1 agonist). Both aim to exceed semaglutide’s weight loss, by different means: engineering one multi-receptor molecule versus combining two.' },
      { q: 'Which produces more weight loss?', a: 'They are close. In REDEFINE 1, CagriSema reported ~20.4% mean weight loss over 68 weeks (up to 22.7% with full adherence); tirzepatide reported ~22.5% in SURMOUNT-1 over 72 weeks. These are different trials, not a head-to-head, so the numbers should not be read as a direct ranking.' },
      { q: 'Is CagriSema FDA-approved?', a: 'No. CagriSema is investigational and in the Phase 3 REDEFINE program. Tirzepatide is FDA-approved as Mounjaro (type 2 diabetes) and Zepbound (weight management).' },
      { q: 'Why did CagriSema “disappoint” if it beat semaglutide?', a: 'It clearly beat semaglutide and cagrilintide alone, confirming the combination works. The disappointment was relative to expectations — the market had anticipated ~25% weight loss, and ~20.4% fell short of that bar while still being a strong absolute result. This page is a research and educational reference.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'CagriSema', alternateName: 'Cagrilintide/semaglutide' },
      { name: 'Tirzepatide', alternateName: 'Zepbound' },
    ],
  },
  {
    slug: 'cagrisema-vs-retatrutide',
    aSlug: 'cagrisema',
    bSlug: 'retatrutide',
    aName: 'CagriSema',
    bName: 'Retatrutide',
    aPill: 'Amylin + GLP-1 · investigational',
    bPill: 'Triple agonist · investigational',
    metaTitle:
      'CagriSema vs Retatrutide — Novo’s Combo vs Lilly’s Triple Agonist | AmericanPeptide.com',
    metaDescription:
      'Research comparison of CagriSema (cagrilintide + semaglutide) and retatrutide (GIP/GLP-1/glucagon triple agonist) — the two leading next-generation obesity candidates, reached by opposite strategies. ~20% vs ~24%, cross-trial. Cited.',
    keywords: [
      'cagrisema vs retatrutide',
      'retatrutide vs cagrisema',
      'next generation obesity drugs',
      'amylin combination vs triple agonist',
      'novo vs lilly obesity',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'the combination versus the triple agonist',
    intro: [
      'CagriSema and retatrutide are the two most-watched next-generation obesity candidates, and they represent opposite bets. Novo Nordisk combines two existing peptides (amylin plus GLP-1); Eli Lilly engineers a single molecule that hits three receptors (GIP, GLP-1, and glucagon). Both are investigational, and their reported numbers sit at the top of the field.',
    ],
    atAGlance: [
      { dim: 'Strategy', a: 'Combine two peptides', b: 'One molecule, three receptors' },
      { dim: 'Mechanism', a: 'Amylin (cagrilintide) + GLP-1 (semaglutide)', b: 'GIP + GLP-1 + glucagon' },
      { dim: 'Developer', a: 'Novo Nordisk', b: 'Eli Lilly (LY3437943)' },
      { dim: 'Peak weight ↓ (trial)', a: '~20.4% (REDEFINE 1, 68 wk; up to 22.7% adherence)', b: '~24% (Phase 2, 48 wk, 12 mg)' },
      { dim: 'Extra vs GLP-1', a: 'Amylin — a separate satiety pathway', b: 'GIP (insulinotropic) + glucagon (energy expenditure, liver fat)' },
      { dim: 'Approval status', a: 'Investigational (Phase 3 REDEFINE)', b: 'Investigational (Phase 3 TRIUMPH)' },
      { dim: 'Molecular identity', a: 'No single formula — a co-formulation', b: 'Single peptide, MW 4731.5' },
      { dim: 'Maturity of evidence', a: 'Phase 3 reporting', b: 'Phase 2 complete; Phase 3 ongoing' },
    ],
    columnSections: [
      {
        title: 'Two ways to add to GLP-1',
        columns: [
          {
            heading: 'CagriSema — add amylin (combination)',
            accent: 'a',
            points: [
              'Keeps semaglutide’s GLP-1 mechanism intact',
              'Adds cagrilintide, a long-acting amylin analog, as a second satiety signal',
              'Two molecules, each with its own certificate of analysis',
              'REDEFINE 1: ~20.4% over 68 weeks',
            ],
          },
          {
            heading: 'Retatrutide — add GIP + glucagon (triple)',
            accent: 'b',
            points: [
              'GIP: complementary insulinotropic and adipose signaling',
              'Glucagon: raises energy expenditure and mobilizes liver fat',
              'One engineered peptide activating all three receptors',
              'Phase 2: ~24% over 48 weeks',
            ],
          },
        ],
      },
    ],
    trials: [
      { name: 'REDEFINE 1', arm: 'CagriSema', n: '3417', duration: '68 wk', endpoint: 'Mean body-weight change (obesity)', result: '−20.4% vs −3.0% (placebo)', note: 'Beat semaglutide (−14.9%) and cagrilintide (−11.5%) alone' },
      { name: 'Retatrutide Phase 2', arm: 'Retatrutide 12 mg', n: '338', duration: '48 wk', endpoint: 'Mean body-weight change', result: '~24% vs ~2% (placebo)', note: 'Jastreboff et al., NEJM 2023; highest-dose arm' },
      { name: 'Phase 3 programs', arm: 'REDEFINE (Novo) · TRIUMPH (Lilly)', duration: 'Ongoing', endpoint: 'Confirmatory efficacy/safety', result: 'Reporting — neither FDA-approved', note: 'Head-to-head trials between them have not been run' },
    ],
    verdict: {
      title: 'What the evidence supports — and what it doesn’t',
      paragraphs: [
        'On the numbers reported so far, retatrutide’s ~24% (Phase 2, 48 weeks) edges CagriSema’s ~20.4% (Phase 3, 68 weeks) — but these are different trials at different stages, not a head-to-head, so the gap is suggestive at best. The more durable distinction is strategic: a two-peptide combination that can be built from proven parts versus a single triple-agonist molecule that adds glucagon-driven energy expenditure and liver-fat effects GLP-1/amylin do not. Both are investigational; neither is approved. Treat this as mechanism plus early data, not a ranking.',
      ],
    },
    faqs: [
      { q: 'What is the difference between CagriSema and retatrutide?', a: 'CagriSema is a combination of two peptides — cagrilintide (amylin) and semaglutide (GLP-1). Retatrutide is a single molecule that activates three receptors — GIP, GLP-1, and glucagon. CagriSema adds a separate satiety pathway (amylin); retatrutide adds insulinotropic (GIP) and energy-expenditure/liver-fat (glucagon) mechanisms.' },
      { q: 'Which causes more weight loss?', a: 'Reported figures put retatrutide at ~24% (Phase 2, 48 weeks) and CagriSema at ~20.4% (Phase 3 REDEFINE 1, 68 weeks). These come from separate trials at different stages, not a direct comparison, and retatrutide’s Phase 3 results are still pending — so it is premature to rank them.' },
      { q: 'Are either approved?', a: 'No. Both are investigational and in Phase 3 — CagriSema in Novo Nordisk’s REDEFINE program, retatrutide in Eli Lilly’s TRIUMPH program. Neither is FDA-approved.' },
      { q: 'What does the glucagon arm give retatrutide that CagriSema lacks?', a: 'Glucagon-receptor agonism is studied for increased energy expenditure and hepatic (liver) fat reduction — effects that neither GLP-1 nor amylin provide directly. CagriSema’s advantage is being buildable from two already well-characterized peptides. This page is a research and educational reference.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'CagriSema', alternateName: 'Cagrilintide/semaglutide' },
      { name: 'Retatrutide', alternateName: 'LY3437943' },
    ],
  },
  {
    slug: 'survodutide-vs-retatrutide',
    aSlug: 'survodutide',
    bSlug: 'retatrutide',
    aName: 'Survodutide',
    bName: 'Retatrutide',
    aPill: 'Glucagon/GLP-1 · investigational',
    bPill: 'GIP/GLP-1/glucagon · investigational',
    metaTitle:
      'Survodutide vs Retatrutide — Glucagon Dual vs Triple Agonist, MASH & Obesity | AmericanPeptide.com',
    metaDescription:
      'Research comparison of survodutide (glucagon/GLP-1 dual, MASH Breakthrough) and retatrutide (GIP/GLP-1/glucagon triple) — both lean on the glucagon arm for energy expenditure and liver fat. What adding GIP changes, and the NEJM MASH data. Cited.',
    keywords: [
      'survodutide vs retatrutide',
      'glucagon GLP-1 dual vs triple agonist',
      'survodutide MASH',
      'BI 456906 vs LY3437943',
      'glucagon agonist obesity liver',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'the glucagon dual versus the triple agonist',
    intro: [
      'Survodutide and retatrutide share the receptor that sets them apart from semaglutide and tirzepatide — glucagon. Survodutide pairs glucagon with GLP-1 (a dual agonist); retatrutide adds GIP on top of both (a triple). Both are investigational, and the interesting question is what that third receptor actually buys — and where each one’s evidence is strongest.',
    ],
    atAGlance: [
      { dim: 'Receptor targets', a: 'Glucagon-R + GLP-1R', b: 'GIP-R + GLP-1R + glucagon-R' },
      { dim: 'Agonism class', a: 'Dual agonist (glucagon/GLP-1)', b: 'Triple agonist' },
      { dim: 'Developer', a: 'Boehringer Ingelheim / Zealand (BI 456906)', b: 'Eli Lilly (LY3437943)' },
      { dim: 'Distinctive program', a: 'MASH — FDA Breakthrough Therapy', b: 'Obesity — largest Phase 2 weight figure' },
      { dim: 'Peak weight ↓ (trial)', a: 'Double-digit mean (Phase 2/3, dose-dependent)', b: '~24% (Phase 2, 48 wk, 12 mg)' },
      { dim: 'Shared glucagon rationale', a: 'Energy expenditure + hepatic-fat mobilization', b: 'Energy expenditure + hepatic-fat mobilization' },
      { dim: 'Extra receptor', a: '— (no GIP)', b: 'GIP — complementary insulinotropic/adipose signal' },
      { dim: 'Approval status', a: 'Investigational (Phase 3 SYNCHRONIZE)', b: 'Investigational (Phase 3 TRIUMPH)' },
      { dim: 'Molecular weight', a: '4232 Da', b: '4731.5 Da' },
    ],
    proseSections: [
      {
        title: 'What the third receptor adds',
        paragraphs: [
          'Both molecules recruit glucagon for the same reasons: on top of GLP-1’s appetite and glycemic effects, glucagon-receptor activation is studied for raising energy expenditure and mobilizing fat from the liver. That shared logic is why survodutide’s standout data is in the liver — in a Phase 2 MASH trial (NEJM 2024), 62% of patients on the 4.8 mg dose achieved MASH improvement without worsening fibrosis versus 14% on placebo, with fibrosis improvement up to ~52% — earning it FDA Breakthrough Therapy designation for MASH.',
          'Retatrutide keeps the glucagon and GLP-1 arms and adds a third receptor, GIP, which contributes a complementary insulinotropic and adipose signal. Its headline is weight: ~24% mean reduction at the highest Phase 2 dose, the largest reported for the incretin class. So the practical contrast is emphasis — survodutide is the glucagon/GLP-1 dual with the strongest liver-disease evidence, retatrutide the triple with the largest weight figure. Whether the added GIP is worth the extra complexity is exactly what the two Phase 3 programs are meant to answer.',
        ],
      },
    ],
    trials: [
      { name: 'Survodutide MASH Phase 2', arm: 'Survodutide 4.8 mg', n: '293', duration: '48 wk', endpoint: 'MASH improvement, no worsening fibrosis', result: '62% vs 14% (placebo)', note: 'NEJM 2024; fibrosis improvement up to ~52% vs ~26%' },
      { name: 'Retatrutide Phase 2', arm: 'Retatrutide 12 mg', n: '338', duration: '48 wk', endpoint: 'Mean body-weight change', result: '~24% vs ~2% (placebo)', note: 'Jastreboff et al., NEJM 2023; highest-dose arm' },
      { name: 'Phase 3 programs', arm: 'SYNCHRONIZE (survodutide) · TRIUMPH (retatrutide)', duration: 'Ongoing', endpoint: 'Confirmatory obesity/metabolic', result: 'Reporting — neither FDA-approved', note: 'No head-to-head between them has been run' },
    ],
    verdict: {
      title: 'What the evidence supports',
      paragraphs: [
        'These are close cousins that emphasize different endpoints. Survodutide, the glucagon/GLP-1 dual, has the strongest liver-disease signal — its MASH data is what earned Breakthrough designation. Retatrutide, the triple, adds GIP and reports the largest weight reduction in the class. Both are investigational, both rely on the glucagon arm for energy expenditure and liver fat, and there is no head-to-head trial between them — so the comparison is one of mechanism and program focus, not a settled ranking. These are population means, not individual predictions.',
      ],
    },
    faqs: [
      { q: 'What is the difference between survodutide and retatrutide?', a: 'Survodutide is a glucagon/GLP-1 dual agonist; retatrutide adds a third receptor, GIP, making it a GIP/GLP-1/glucagon triple agonist. Both use the glucagon arm for energy expenditure and liver-fat reduction. Survodutide’s strongest data is in MASH (fatty liver disease); retatrutide’s is the largest weight loss reported for the class.' },
      { q: 'Which is better for fatty liver (MASH)?', a: 'Survodutide has the more advanced dedicated liver program — in a Phase 2 MASH trial (NEJM 2024) 62% on the 4.8 mg dose achieved MASH improvement without worsening fibrosis versus 14% on placebo, and it holds FDA Breakthrough Therapy designation for MASH. Retatrutide is also studied for hepatic fat but is framed primarily around weight.' },
      { q: 'Which causes more weight loss?', a: 'Retatrutide reported ~24% mean weight loss at the highest Phase 2 dose, the largest for the incretin class. Survodutide has reported double-digit mean reductions. These come from separate trials, not a head-to-head, and both are still in Phase 3.' },
      { q: 'Are either FDA-approved?', a: 'No. Both are investigational — survodutide (Boehringer Ingelheim / Zealand) in the SYNCHRONIZE program and retatrutide (Eli Lilly) in TRIUMPH. Neither is FDA-approved. This page is a research and educational reference.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Survodutide', alternateName: 'BI 456906' },
      { name: 'Retatrutide', alternateName: 'LY3437943' },
    ],
  },
  {
    slug: 'mazdutide-vs-tirzepatide',
    aSlug: 'mazdutide',
    bSlug: 'tirzepatide',
    aName: 'Mazdutide',
    bName: 'Tirzepatide',
    aPill: 'Glucagon/GLP-1 · approved in China',
    bPill: 'GIP/GLP-1R · FDA approved',
    metaTitle:
      'Mazdutide vs Tirzepatide — Glucagon vs GIP as the Partner to GLP-1 | AmericanPeptide.com',
    metaDescription:
      'Research comparison of mazdutide (glucagon/GLP-1 dual, approved in China) and tirzepatide (GIP/GLP-1 dual, FDA-approved) — same “dual agonist” class, different second receptor, different geography of approval. GLORY-1 vs SURMOUNT-1. Cited.',
    keywords: [
      'mazdutide vs tirzepatide',
      'glucagon GLP-1 vs GIP GLP-1',
      'mazdutide GLORY-1',
      'IBI362 vs tirzepatide',
      'dual agonist comparison',
    ],
    updated: '2026-09-01',
    breadcrumb: { label: 'GLP-1 Peptides', href: '/glp-1' },
    headline: 'two dual agonists, two different second receptors',
    intro: [
      'Mazdutide and tirzepatide are both “dual agonists,” but they pair GLP-1 with a different second receptor — mazdutide with glucagon, tirzepatide with GIP. That single choice changes what each does, and their approval geographies differ too: tirzepatide is FDA-approved, while mazdutide reached the market first in China.',
    ],
    atAGlance: [
      { dim: 'Receptor targets', a: 'Glucagon-R + GLP-1R', b: 'GIP-R + GLP-1R' },
      { dim: 'Second receptor', a: 'Glucagon — energy expenditure, liver fat', b: 'GIP — insulinotropic, adipose signaling' },
      { dim: 'Molecular basis', a: 'Oxyntomodulin-based (natural dual hormone)', b: 'Chimeric GIP/GLP-1, de novo design' },
      { dim: 'Developer', a: 'Eli Lilly / Innovent (IBI362)', b: 'Eli Lilly' },
      { dim: 'Approval status', a: 'Approved in China (NMPA, 2025); not FDA-approved', b: 'FDA approved (Mounjaro 2022 · Zepbound 2023)' },
      { dim: 'Peak weight ↓ (trial)', a: '~14.8% (GLORY-1, 6 mg, 48 wk; ~20% at 9 mg)', b: '~22.5% (SURMOUNT-1, 15 mg, 72 wk)' },
      { dim: 'Pivotal trial', a: 'GLORY-1 (Chinese adults)', b: 'SURMOUNT-1' },
      { dim: 'Molecular weight', a: '4476 Da', b: '4813.5 Da' },
    ],
    proseSections: [
      {
        title: 'Glucagon or GIP — the partner matters',
        paragraphs: [
          'Both drugs keep GLP-1 and add a second incretin-family receptor, but they choose differently. Tirzepatide pairs GLP-1 with GIP — a complementary insulinotropic and adipose signal — in a de-novo chimeric molecule, and in SURMOUNT-1 it reached ~22.5% mean weight loss, the benchmark for an approved agent. Mazdutide pairs GLP-1 with glucagon, and it is built on oxyntomodulin, the natural gut hormone that already activates both of those receptors on its own; the glucagon arm is studied for extra energy expenditure and liver-fat reduction rather than the insulin-side effect GIP contributes.',
          'The other real difference is where they are approved. Tirzepatide is FDA-approved in the United States. Mazdutide was approved first by China’s NMPA in 2025 — the first glucagon/GLP-1 dual agonist to reach any market — on the strength of the Phase 3 GLORY-1 trial, where the 6 mg dose produced ~14.8% mean weight loss over 48 weeks in Chinese adults (higher doses reached about 20%). It is not FDA-approved, and a head-to-head Phase 3 against semaglutide (GLORY-3) is underway, but none exists against tirzepatide.',
        ],
      },
    ],
    trials: [
      { name: 'GLORY-1', arm: 'Mazdutide 6 mg (and 4 mg)', n: '610', duration: '48 wk', endpoint: 'Mean body-weight change (Chinese adults)', result: '−14.8% (6 mg) · −12.0% (4 mg) vs −0.5% (placebo)', note: 'Basis for China NMPA approval; ~20% reported at 9 mg' },
      { name: 'SURMOUNT-1', arm: 'Tirzepatide 15 mg', n: '2539', duration: '72 wk', endpoint: 'Mean body-weight change', result: '−22.5% vs −2.4% (placebo)', note: 'Pivotal obesity trial for Zepbound' },
    ],
    verdict: {
      title: 'What the comparison comes down to',
      paragraphs: [
        'Same class, different partner receptor and different market. Tirzepatide’s GIP pairing and de-novo design underpin the larger reported weight loss and its FDA approval; mazdutide’s glucagon pairing, built from oxyntomodulin, brings an energy-expenditure and liver-fat emphasis and made it the first glucagon/GLP-1 dual approved anywhere — in China. The trial figures come from separate studies in different populations, not a head-to-head, so they are not directly comparable. Neither the numbers nor the approvals make one universally superior; they answer somewhat different questions. This page is a research and educational reference.',
      ],
    },
    faqs: [
      { q: 'What is the difference between mazdutide and tirzepatide?', a: 'Both are dual agonists that keep GLP-1 and add a second receptor — but mazdutide adds glucagon (for energy expenditure and liver-fat effects) while tirzepatide adds GIP (an insulinotropic and adipose signal). Mazdutide is built on the natural hormone oxyntomodulin; tirzepatide is a de-novo chimeric peptide.' },
      { q: 'Is mazdutide FDA-approved?', a: 'No. Mazdutide was approved by China’s NMPA in 2025 — first for weight management, then type 2 diabetes — making it the first glucagon/GLP-1 dual agonist approved anywhere. It is not FDA-approved; outside China it remains investigational. Tirzepatide is FDA-approved (Mounjaro, Zepbound).' },
      { q: 'Which produces more weight loss?', a: 'Tirzepatide reported ~22.5% in SURMOUNT-1 (15 mg, 72 weeks). Mazdutide reported ~14.8% at 6 mg over 48 weeks in GLORY-1, with about 20% at the higher 9 mg dose. These are separate trials in different populations, not a head-to-head, so they are not directly comparable.' },
      { q: 'Why choose glucagon over GIP as the second receptor?', a: 'It is a design trade-off, not a settled answer. Glucagon agonism adds energy expenditure and liver-fat mobilization; GIP adds an insulinotropic and adipose signal. The two Phase 3 programs — and eventual head-to-head trials — are what will clarify which pairing wins for which endpoint. This page is a research and educational reference.' },
    ],
    relatedAreas: ['weight-loss'],
    about: [
      { name: 'Mazdutide', alternateName: 'IBI362' },
      { name: 'Tirzepatide', alternateName: 'Zepbound' },
    ],
  },
]

export const COMPARISON_BY_SLUG: Record<string, Comparison> = Object.fromEntries(
  COMPARISONS.map((c) => [c.slug, c]),
)

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISON_BY_SLUG[slug]
}
