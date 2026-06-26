// Research-area (indication) taxonomy for AmericanPeptide.com.
//
// These are *use-case* landing pages — what a peptide is studied FOR —
// distinct from the mechanism/class-framed catalog categories. Topics are
// curated (not generated from raw researchArea strings) so each page carries
// real editorial substance and maps cleanly to ≥2 catalog peptides.
//
// Matching is by lowercase substring against each peptide's `researchAreas`,
// which absorbs the free-text variants in the data (e.g. "Obesity" and
// "Obesity (historical)" both match the "obesity" matcher).

import { PEPTIDES, type Peptide, type PeptideCategory } from './peptides'

export interface ResearchArea {
  slug: string
  label: string
  tagline: string
  metaTitle: string
  metaDescription: string
  /** Editorial intro paragraphs — substance to keep pages out of thin-content territory. */
  intro: string[]
  /** Lowercase substrings matched against peptide.researchAreas. */
  matchers: string[]
  /** Catalog categories to cross-link from this area. */
  relatedCategories: PeptideCategory[]
  /** Indication-level FAQs — render on the page and emit FAQPage schema. */
  faqs: { q: string; a: string }[]
}

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    slug: 'weight-loss',
    label: 'Weight Loss & Metabolic Health',
    tagline: 'Incretin and metabolic peptides studied for glycemic control and fat loss.',
    metaTitle: 'Weight Loss & Metabolic Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for metabolic peptides studied in obesity, type 2 diabetes, and MASH — GLP-1/GIP/glucagon agonists, amylin analogs, and adipose-targeting compounds.',
    intro: [
      'Metabolic peptides are among the most clinically validated classes in modern medicine. The incretin axis — GLP-1, GIP, and glucagon receptor signaling — coordinates insulin secretion, satiety, gastric emptying, and energy expenditure, and engineered agonists of these receptors now anchor the treatment of type 2 diabetes and obesity.',
      'Research in this area spans single-, dual-, and triple-receptor agonists, amylin analogs, and adipose-selective fragments. Endpoints commonly studied include glycemic control, body-weight reduction, MASH/hepatic-fat resolution, and cardiovascular risk — with half-life extension (fatty-acid acylation, DPP-4 resistance) a recurring engineering theme.',
    ],
    matchers: [
      'obesity',
      'type 2 diabetes',
      'mash',
      'metabolic',
      'visceral adiposity',
      'lipodystrophy',
      'obstructive sleep apnea',
      'cardiovascular risk',
    ],
    relatedCategories: ['metabolic'],
    faqs: [
      {
        q: 'What kinds of peptides are studied for weight loss?',
        a: 'The most studied are incretin receptor agonists — GLP-1, dual GLP-1/GIP, and triple GLP-1/GIP/glucagon agonists — alongside amylin analogs. They act on satiety, insulin secretion, gastric emptying, and energy expenditure.',
      },
      {
        q: 'How do GLP-1 receptor agonists support weight reduction?',
        a: 'In studies they slow gastric emptying and signal satiety in the brain while improving glucose-dependent insulin release, which together reduce caloric intake and improve glycemic control.',
      },
      {
        q: 'Are these peptides approved or investigational?',
        a: 'Several GLP-1 and dual-agonist peptides are FDA-approved for type 2 diabetes and chronic weight management; others remain investigational. This page is a research reference, not medical advice.',
      },
    ],
  },
  {
    slug: 'wound-healing',
    label: 'Wound Healing & Tissue Repair',
    tagline: 'Regenerative peptides studied for soft-tissue, tendon, and vascular repair.',
    metaTitle: 'Wound Healing & Tissue Repair Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for regenerative peptides studied in wound healing, tendinopathy, and tissue repair — angiogenesis, cytoprotection, and extracellular-matrix remodeling.',
    intro: [
      'Tissue-repair peptides are studied for their effects on angiogenesis, fibroblast and keratinocyte activity, and the cytoprotective signaling that governs how injured tissue recovers. The interest spans dermal wounds, tendon and ligament injury, cartilage, and ischemic or post-surgical repair models.',
      'Mechanisms under investigation include up-regulation of growth-factor receptor expression, modulation of the nitric-oxide system, actin sequestration and cell migration, and copper-dependent remodeling of the extracellular matrix. Most evidence here is preclinical, making rigorous model selection and endpoint definition especially important.',
    ],
    matchers: [
      'wound healing',
      'tendinopathy',
      'cardiac repair',
      'cartilage repair',
      'cardioprotection',
      'tissue repair',
    ],
    relatedCategories: ['healing-repair'],
    faqs: [
      {
        q: 'How are peptides studied for tissue repair?',
        a: 'Research focuses on angiogenesis, fibroblast and keratinocyte activity, and cytoprotective signaling — measured in dermal wound, tendon, cartilage, and ischemic repair models.',
      },
      {
        q: 'What mechanisms do repair peptides act through?',
        a: 'Commonly studied mechanisms include upregulation of growth-factor receptors, nitric-oxide modulation, actin sequestration and cell migration, and copper-dependent remodeling of the extracellular matrix.',
      },
      {
        q: 'Is the evidence clinical or preclinical?',
        a: 'Most tissue-repair peptide evidence is preclinical (cell and animal models), so model selection and endpoint definition matter and independent human validation is generally lacking.',
      },
    ],
  },
  {
    slug: 'cognition-neuroprotection',
    label: 'Cognition & Neuroprotection',
    tagline: 'Nootropic and neurotrophic peptides studied for cognition and recovery.',
    metaTitle: 'Cognition & Neuroprotection Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for nootropic and neuroprotective peptides studied in cognition, stroke recovery, and neurodegeneration — neurotrophic signaling and synaptic modulation.',
    intro: [
      'Neuroactive peptides are studied for their influence on neurotrophic signaling, synaptic plasticity, and resilience to ischemic and oxidative stress. Research areas range from cognitive performance and memory consolidation to recovery after ischemic stroke and models of neurodegeneration.',
      'Proposed mechanisms include modulation of BDNF and other neurotrophins, regulation of monoaminergic and GABAergic tone, and protection of neuronal mitochondria. The blood–brain-barrier permeability of a given sequence is a central variable, and much of the clinical literature originates outside large Western registries.',
    ],
    matchers: ['cognition', 'cognitive', 'neuroprotection', 'stroke', 'neurodegeneration'],
    relatedCategories: ['cognitive'],
    faqs: [
      {
        q: 'Which peptides are studied for cognition?',
        a: 'Neuroactive peptides studied for memory, focus, stroke recovery, and neurodegeneration models — typically acting through neurotrophic and synaptic-plasticity pathways.',
      },
      {
        q: 'What mechanisms underlie neuroprotective peptides?',
        a: 'Proposed mechanisms include modulation of BDNF and other neurotrophins, regulation of monoaminergic and GABAergic tone, and protection of neuronal mitochondria.',
      },
      {
        q: 'Why does blood–brain-barrier permeability matter?',
        a: 'A peptide must cross the blood–brain barrier to act centrally, so permeability is a key research variable that shapes route, dose, and sequence design.',
      },
    ],
  },
  {
    slug: 'anxiety-mood',
    label: 'Anxiety, Mood & Stress',
    tagline: 'Regulatory peptides studied for anxiolysis and stress-axis modulation.',
    metaTitle: 'Anxiety, Mood & Stress Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for peptides studied in anxiety, mood, and stress physiology — anxiolytic signaling without the sedation profile of classic GABAergic medications.',
    intro: [
      'A small set of regulatory peptides is studied for anxiolytic and mood-stabilizing effects, often with interest in achieving calm without the sedation, dependence, or cognitive dulling associated with classic GABAergic agents.',
      'Investigated mechanisms include modulation of the stress (HPA) axis, neurotrophic support, and effects on serotonergic and GABAergic signaling. As with other neuroactive peptides, much of the human data is early-stage and concentrated in specific research traditions.',
    ],
    matchers: ['anxiety', 'stress physiology', 'mood'],
    relatedCategories: ['cognitive'],
    faqs: [
      {
        q: 'How are peptides studied for anxiety?',
        a: 'A few regulatory peptides are studied for anxiolytic and mood-stabilizing effects, often with the goal of calm without the sedation, dependence, or cognitive dulling of classic GABAergic agents.',
      },
      {
        q: 'What pathways are involved?',
        a: 'Investigated mechanisms include modulation of the HPA (stress) axis, neurotrophic support, and effects on serotonergic and GABAergic signaling.',
      },
      {
        q: 'Is the human evidence strong?',
        a: 'Much of the human data is early-stage and concentrated in specific research traditions, so findings should be treated as preliminary.',
      },
    ],
  },
  {
    slug: 'sleep-circadian',
    label: 'Sleep & Circadian Rhythm',
    tagline: 'Peptides studied for sleep architecture and circadian regulation.',
    metaTitle: 'Sleep & Circadian Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for peptides studied in sleep biology and circadian regulation — pineal signaling, sleep architecture, and stress-axis interactions.',
    intro: [
      'Sleep- and circadian-active peptides are studied for their role in regulating sleep architecture, the timing of the biological clock, and the pineal signaling that links light exposure to rest cycles.',
      'Research interest centers on how these peptides influence slow-wave sleep, melatonin-adjacent pathways, and the interaction between the sleep system and the stress axis. The field overlaps substantially with aging biology, where circadian decline is a recurring theme.',
    ],
    matchers: ['sleep', 'circadian', 'pineal'],
    relatedCategories: ['cognitive', 'longevity'],
    faqs: [
      {
        q: 'How are peptides linked to sleep?',
        a: 'Sleep- and circadian-active peptides are studied for effects on sleep architecture, biological-clock timing, and the pineal signaling that links light exposure to rest cycles.',
      },
      {
        q: 'What sleep measures are studied?',
        a: 'Research looks at slow-wave (deep) sleep, melatonin-adjacent pathways, and interactions between the sleep system and the stress axis.',
      },
      {
        q: 'How does this relate to aging?',
        a: 'Circadian regulation declines with age, so this area overlaps heavily with longevity research and shares several regulatory peptides.',
      },
    ],
  },
  {
    slug: 'longevity-aging',
    label: 'Longevity & Aging',
    tagline: 'Peptides studied across the aging axis — senescence, NAD+, and resilience.',
    metaTitle: 'Longevity & Aging Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for peptides studied in aging biology — telomere and senescence pathways, NAD+ metabolism, mitochondrial function, and healthspan endpoints.',
    intro: [
      'Longevity research examines peptides that act on the hallmarks of aging: cellular senescence, mitochondrial decline, telomere maintenance, NAD+ metabolism, and the gradual loss of circadian and hormonal regulation. The goal in most models is healthspan — preserving function — rather than a single disease endpoint.',
      'Compounds studied here often originate as endogenous regulatory peptides whose expression falls with age. Because aging endpoints are slow and multifactorial, this area leans heavily on biomarker studies, model organisms, and mechanistic work rather than large outcome trials.',
    ],
    matchers: ['aging biology', 'nad+', 'sarcopenia', 'senescence'],
    relatedCategories: ['longevity', 'mitochondrial'],
    faqs: [
      {
        q: 'What does longevity peptide research target?',
        a: 'The hallmarks of aging — cellular senescence, mitochondrial decline, telomere maintenance, NAD+ metabolism, and loss of circadian and hormonal regulation — usually with healthspan as the goal.',
      },
      {
        q: 'Why are outcomes hard to measure?',
        a: 'Aging endpoints are slow and multifactorial, so research relies on biomarkers, model organisms, and mechanistic work rather than large outcome trials.',
      },
      {
        q: 'Where do these peptides come from?',
        a: 'Many are endogenous regulatory peptides whose expression falls with age, studied as candidates to restore more youthful signaling.',
      },
    ],
  },
  {
    slug: 'growth-hormone-axis',
    label: 'Growth Hormone & Body Composition',
    tagline: 'Secretagogues studied for GH release, IGF-1, and body composition.',
    metaTitle: 'Growth Hormone & Body Composition Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for growth-hormone secretagogues — GHRH analogs and GHRPs studied for pulsatile GH release, IGF-1 elevation, and body-composition endpoints.',
    intro: [
      'Growth-hormone secretagogues are studied for their ability to stimulate the body’s own pulsatile GH release rather than supplying exogenous hormone. The two principal classes — GHRH analogs and growth-hormone-releasing peptides (GHRPs) — act on distinct receptors and are frequently studied in combination for synergistic effect.',
      'Common endpoints include GH pulse amplitude, downstream IGF-1 elevation, and body-composition changes such as visceral-fat reduction and lean-mass support. Preserving the physiological pulsatility and feedback of the GH axis is a defining research consideration for this class.',
    ],
    matchers: ['gh ', 'growth hormone', 'igf', 'pituitary', 'body composition'],
    relatedCategories: ['growth-hormone'],
    faqs: [
      {
        q: 'How do GH secretagogues differ from growth hormone itself?',
        a: 'Secretagogues stimulate the body’s own pulsatile GH release rather than supplying exogenous hormone, aiming to preserve natural feedback and pulsatility.',
      },
      {
        q: 'What are GHRH analogs versus GHRPs?',
        a: 'GHRH analogs and growth-hormone-releasing peptides (GHRPs) act on distinct receptors and are frequently studied in combination for synergistic GH release.',
      },
      {
        q: 'What endpoints are measured?',
        a: 'Common endpoints are GH pulse amplitude, downstream IGF-1 elevation, and body-composition changes such as visceral-fat reduction and lean-mass support.',
      },
    ],
  },
  {
    slug: 'skin-hair',
    label: 'Skin & Hair',
    tagline: 'Peptides studied for skin aging, pigmentation, and hair follicle biology.',
    metaTitle: 'Skin & Hair Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for cosmetic peptides studied in skin aging, pigmentation, photoprotection, and hair follicle biology — collagen signaling and melanocortin pathways.',
    intro: [
      'Cosmetic and dermatologic peptides are studied for effects on collagen synthesis, melanocyte and pigmentation pathways, photoprotection, and the hair-follicle cycle. The class spans copper-binding remodeling peptides, melanocortin agonists, and signal peptides that influence dermal matrix turnover.',
      'Research endpoints include measures of skin elasticity and wrinkle depth, follicular density and anagen duration, and UV-response markers. Many of these peptides overlap with tissue-repair biology, reflecting shared pathways in matrix remodeling and angiogenesis.',
    ],
    matchers: ['skin aging', 'hair follicle', 'hair growth', 'pigmentation', 'photoprotection'],
    relatedCategories: ['cosmetic'],
    faqs: [
      {
        q: 'How are peptides used in skin and hair research?',
        a: 'They’re studied for collagen synthesis, pigmentation pathways, photoprotection, and the hair-follicle cycle, spanning copper-binding, melanocortin, and signal peptides.',
      },
      {
        q: 'What outcomes are measured?',
        a: 'Endpoints include skin elasticity and wrinkle depth, follicular density and anagen (growth-phase) duration, and UV-response markers.',
      },
      {
        q: 'Why do these overlap with wound healing?',
        a: 'Skin and hair peptides share matrix-remodeling and angiogenesis pathways with tissue-repair biology, so the two areas frequently intersect.',
      },
    ],
  },
  {
    slug: 'sexual-reproductive',
    label: 'Sexual & Reproductive Health',
    tagline: 'Peptides studied across the HPG axis and CNS sexual-response pathways.',
    metaTitle: 'Sexual & Reproductive Health Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for peptides studied in sexual and reproductive health — melanocortin and kisspeptin signaling, HSDD, and hypothalamic–pituitary–gonadal regulation.',
    intro: [
      'This area covers peptides acting on the central and endocrine control of sexual and reproductive function. Two pathways dominate the literature: central melanocortin signaling, studied for sexual-response disorders, and kisspeptin signaling, the upstream regulator of the hypothalamic–pituitary–gonadal (HPG) axis.',
      'Endpoints range from hypoactive sexual desire disorder (HSDD) and CNS-mediated arousal to reproductive-endocrine applications such as hypothalamic amenorrhea and the study of puberty. Because these peptides act centrally and on hormone cascades, dose timing and feedback regulation are key research variables.',
    ],
    matchers: ['sexual', 'hsdd', 'reproductive', 'amenorrhea', 'puberty', 'erectile'],
    relatedCategories: ['reproductive', 'cosmetic'],
    faqs: [
      {
        q: 'What pathways do these peptides act on?',
        a: 'Two dominate the literature: central melanocortin signaling, studied for sexual-response disorders, and kisspeptin signaling, the upstream regulator of the HPG axis.',
      },
      {
        q: 'What conditions are studied?',
        a: 'Research contexts include hypoactive sexual desire disorder (HSDD), CNS-mediated arousal, hypothalamic amenorrhea, and the study of puberty.',
      },
      {
        q: 'Why is dose timing important?',
        a: 'Because these peptides act centrally and on hormone cascades, timing and feedback regulation strongly influence the response observed in studies.',
      },
    ],
  },
  {
    slug: 'immune-inflammation',
    label: 'Immune & Inflammation',
    tagline: 'Thymic and host-defense peptides studied for immune modulation.',
    metaTitle: 'Immune & Inflammation Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for immunomodulatory peptides studied in inflammation, innate immunity, and infection — thymic peptides, antimicrobial peptides, and anti-inflammatory fragments.',
    intro: [
      'Immunoactive peptides are studied for their ability to modulate both innate and adaptive immunity — restoring T-cell function, regulating cytokine balance, and providing direct antimicrobial activity. The class includes thymic peptides, host-defense (antimicrobial) peptides, and short anti-inflammatory fragments.',
      'Research contexts span chronic viral infection, sepsis and oncology adjunct settings, antimicrobial-resistance models, and inflammatory conditions such as IBD and atopic dermatitis. Host-defense peptides are of particular interest as the antibiotic-resistance crisis renews attention on innate-immune mechanisms.',
    ],
    matchers: [
      'ibd',
      'immun',
      'inflammation',
      'antimicrobial',
      'hepatitis',
      'sepsis',
      'oncology',
      'atopic dermatitis',
    ],
    relatedCategories: ['immune'],
    faqs: [
      {
        q: 'How do immunoactive peptides work?',
        a: 'They’re studied to modulate innate and adaptive immunity — restoring T-cell function, balancing cytokines, and in some cases acting directly as antimicrobials.',
      },
      {
        q: 'What are host-defense peptides?',
        a: 'Antimicrobial (host-defense) peptides are part of innate immunity and draw renewed research interest as antibiotic resistance grows.',
      },
      {
        q: 'What conditions appear in this research?',
        a: 'Contexts span chronic viral infection, sepsis and oncology adjunct settings, antimicrobial-resistance models, and inflammatory conditions like IBD and atopic dermatitis.',
      },
    ],
  },
  {
    slug: 'mitochondrial',
    label: 'Mitochondrial & Bioenergetics',
    tagline: 'Mitochondria-targeted peptides studied for bioenergetics and cardiolipin.',
    metaTitle: 'Mitochondrial & Bioenergetic Peptides — Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for mitochondria-targeted peptides studied in bioenergetics, cardiolipin stabilization, and mitochondrial myopathy — exercise physiology and heart failure models.',
    intro: [
      'Mitochondrial peptides are studied as regulators of cellular energy production — both the mitochondria-derived peptides encoded within the mitochondrial genome and synthetic compounds that target the inner membrane. The unifying interest is bioenergetic efficiency and resilience under metabolic stress.',
      'Research endpoints include cardiolipin stabilization and electron-transport efficiency, exercise capacity and metabolic flexibility, and inherited or acquired mitochondrial dysfunction such as mitochondrial myopathy, Barth syndrome, and heart failure. The area overlaps closely with aging and metabolic research.',
    ],
    matchers: ['mitochondri', 'barth syndrome', 'bioenergetic', 'heart failure', 'exercise physiology'],
    relatedCategories: ['mitochondrial', 'longevity'],
    faqs: [
      {
        q: 'What are mitochondrial peptides?',
        a: 'They include mitochondria-derived peptides encoded in the mitochondrial genome and synthetic compounds targeting the inner membrane, studied for bioenergetic efficiency.',
      },
      {
        q: 'What endpoints are studied?',
        a: 'Research looks at cardiolipin stabilization, electron-transport efficiency, exercise capacity and metabolic flexibility, and mitochondrial dysfunction.',
      },
      {
        q: 'Which disorders are modeled?',
        a: 'Models include mitochondrial myopathy, Barth syndrome, and heart failure, with substantial overlap into aging and metabolic research.',
      },
    ],
  },
  {
    slug: 'bioregulators',
    label: 'Peptide Bioregulators',
    tagline: 'Short, tissue-specific peptides proposed to regulate gene expression — the Khavinson series.',
    metaTitle: 'Peptide Bioregulators — Khavinson Short Peptides Research Guide | AmericanPeptide.com',
    metaDescription:
      'Research reference for short peptide bioregulators — the Khavinson Cytomax/Cytogen series. Tissue-specific di-, tri-, and tetrapeptides, the gene-regulatory hypothesis, and an honest read of the evidence.',
    intro: [
      'Peptide bioregulators are a distinct research program rather than a single indication: very short peptides — typically two to four amino acids — developed largely by the St. Petersburg Institute of Bioregulation and Gerontology (the "Khavinson" school). Each is associated with a specific tissue and is proposed to act not as a hormone or receptor ligand but as a direct regulator of gene expression in that tissue.',
      'The series began with animal-tissue extracts (the "Cytomax" preparations such as Thymalin) and moved to defined synthetic short peptides (the "Cytogens" — Vilon, Epitalon, Vesugen, Pinealon, Bronchogen, Cardiogen, Pancragen). The central, still-debated hypothesis is that these peptides enter the cell, reach the nucleus, and bind sequence-specific promoter regions of DNA, switching on tissue-relevant genes that fall silent with age. Crucially, almost all clinical and lifespan data come from a single research tradition with limited independent Western replication — so this area is framed as preliminary and evidence-graded, not promotional. It is a research reference, not medical advice.',
    ],
    matchers: ['bioregulator'],
    relatedCategories: ['bioregulator', 'longevity', 'immune'],
    faqs: [
      {
        q: 'What is a peptide bioregulator?',
        a: 'A very short, tissue-specific peptide — usually 2 to 4 amino acids — from the Khavinson Cytomax/Cytogen series, proposed to regulate gene expression in a particular organ rather than act as a hormone or receptor ligand.',
      },
      {
        q: 'How are they thought to work?',
        a: 'The class hypothesis is that the short peptide enters the cell, reaches the nucleus, and binds specific DNA promoter regions, modulating transcription in a tissue-selective way. This mechanism is proposed and partially supported in the originating literature, not firmly established by independent structural work.',
      },
      {
        q: 'How strong is the evidence?',
        a: 'Weaker and narrower than the popularity suggests. Most clinical and lifespan data come from a single research tradition with limited independent replication, so findings should be treated as preliminary.',
      },
      {
        q: 'How is this different from the longevity research area?',
        a: 'Longevity is an indication (the aging endpoint); bioregulators is a class (short tissue-regulating peptides). Several members — Epitalon, Vilon, Vesugen — appear in both, framed by endpoint in one and by the shared bioregulator hypothesis here.',
      },
    ],
  },
  {
    slug: 'peptide-hormones',
    label: 'Peptide Hormone Synthesis',
    tagline: 'How hormone sequences are turned into pure, stable, manufacturable synthetic drugs.',
    metaTitle: 'Peptide Hormone Synthesis & Analog Engineering — Research Guide | AmericanPeptide.com',
    metaDescription:
      'A synthesis-focused reference on the hormone peptides — disulfide formation, acylation, anti-aggregation design, and the analog engineering behind octreotide, pramlintide, desmopressin, and cosyntropin.',
    intro: [
      'This guide covers the hormone peptides from the synthesis and medicinal-chemistry side — the angle AmericanPeptide.com is built around. The subject here is how the sequences are made, not the endogenous biology of what they do in the body. That means the features that make hormone synthesis hard: intramolecular disulfides formed regioselectively after chain assembly, C-terminal amides, and site-specific acylations such as ghrelin’s unique Ser3 octanoyl ester. Solid-phase synthesis builds the chain, but the chemistry that decides yield and purity is in the folding, oxidation, and side-chain handling that follow.',
      'The recurring theme is that the native hormone is frequently a poor drug, and the engineering is the story. Somatostatin lasts minutes, so the medicine is octreotide — a minimized, protease-resistant cyclic analog with D-amino acids. Human amylin aggregates, so pramlintide substitutes three prolines to break the β-sheet and make the peptide synthesizable and shelf-stable. Vasopressin becomes desmopressin through a D-arginine and a deamination; ACTH is truncated to its active 1–24 fragment as cosyntropin. Each is a distinct design tactic, and each entry pairs it with the concrete purity failure modes — deletion sequences, disulfide isomers, des-acyl by-product — that a certificate of analysis has to rule out. This is a synthesis and educational reference, not medical advice.',
    ],
    matchers: ['peptide hormone'],
    relatedCategories: ['peptide-hormone', 'metabolic', 'growth-hormone'],
    faqs: [
      {
        q: 'What does this guide focus on?',
        a: 'The synthesis and analog engineering — how each hormone sequence is built, what makes it hard to synthesize and purify, and how analogs are designed to be stable and manufacturable — rather than the endogenous physiology and clinical biology of the hormones.',
      },
      {
        q: 'What makes hormone peptides hard to synthesize?',
        a: 'Intramolecular disulfides that must be formed regioselectively, C-terminal amidation, aggregation-prone sequences (amylin), long chains (calcitonin), and site-specific modifications like ghrelin’s octanoyl ester. The solid-phase chain assembly is only the first step; oxidation, acylation, and purification determine the result.',
      },
      {
        q: 'Why do several entries center on an analog drug?',
        a: 'Because the native hormone is often impractical to make or dose, so the synthetic analog is where the engineering lives — octreotide for somatostatin, pramlintide for amylin, desmopressin for vasopressin, cosyntropin for ACTH.',
      },
      {
        q: 'Is this medical advice?',
        a: 'No. This is a research and educational reference on synthesis and chemistry; nothing here is dosing guidance, and these molecules are prescription medicines.',
      },
    ],
  },
]

export const RESEARCH_AREA_BY_SLUG: Record<string, ResearchArea> =
  Object.fromEntries(RESEARCH_AREAS.map((a) => [a.slug, a]))

export function getResearchAreaBySlug(slug: string): ResearchArea | undefined {
  return RESEARCH_AREA_BY_SLUG[slug]
}

function peptideMatchesArea(peptide: Peptide, area: ResearchArea): boolean {
  const areas = (peptide.researchAreas ?? []).map((a) => a.toLowerCase())
  return areas.some((a) => area.matchers.some((m) => a.includes(m)))
}

/** Peptides studied in a given research area. */
export function getPeptidesForArea(area: ResearchArea): Peptide[] {
  return PEPTIDES.filter((p) => peptideMatchesArea(p, area))
}

/** Research areas a given peptide maps to (for cross-linking from peptide pages). */
export function getAreasForPeptide(peptide: Peptide): ResearchArea[] {
  return RESEARCH_AREAS.filter((area) => peptideMatchesArea(peptide, area))
}

export function peptideCountByArea(): Record<string, number> {
  return Object.fromEntries(
    RESEARCH_AREAS.map((a) => [a.slug, getPeptidesForArea(a).length]),
  )
}
