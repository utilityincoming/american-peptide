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
]

export const COMPARISON_BY_SLUG: Record<string, Comparison> = Object.fromEntries(
  COMPARISONS.map((c) => [c.slug, c]),
)

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISON_BY_SLUG[slug]
}
