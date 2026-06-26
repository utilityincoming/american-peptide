// Editorial content for catalog category landing pages.
//
// Prose here is original, written for a research/educational audience. Where
// it draws on external references (e.g. the archived "Peptide Guide" under
// content/sources/), the substance has been independently rewritten and
// reframed — no consumer "optimization", protocol, dosing, or results
// guidance is carried over. Categories without an entry fall back to the
// CATEGORIES blurb on the page.

import type { PeptideCategory } from './peptides'

export interface CategoryFaq {
  q: string
  a: string
}

export interface CategoryContent {
  /** <title> / og:title (keep ~55-60 chars). */
  metaTitle: string
  /** meta description (keep ~150-160 chars). */
  metaDescription: string
  /** H1 on the page. */
  heading: string
  /** One-sentence positioning under the H1. */
  tagline: string
  /** Lead paragraph (2-4 sentences). */
  intro: string
  /** "How this class works" — 2-4 paragraphs of mechanism-level education. */
  howItWorks: string[]
  /** Recurring research themes for the class. */
  researchThemes: string[]
  /** FAQ — also emitted as FAQPage JSON-LD for rich results. */
  faqs: CategoryFaq[]
}

export const CATEGORY_CONTENT: Partial<
  Record<PeptideCategory, CategoryContent>
> = {
  metabolic: {
    metaTitle: 'Metabolic Peptides — Mechanisms & Research | AmericanPeptide',
    metaDescription:
      'A research reference on metabolic peptides — GLP-1, GIP, glucagon, and amylin receptor agonists. Mechanisms, incretin biology, and the compounds under active study.',
    heading: 'Metabolic Peptides',
    tagline:
      'Incretin and adipose-axis peptides — the most actively studied class in modern peptide research.',
    intro:
      'Metabolic peptides are the signaling molecules the body already uses to coordinate glucose handling, satiety, and energy expenditure. The current research wave centers on incretin biology — the gut-derived hormones that tune insulin secretion to nutrient intake — and on engineered analogs that extend those short-lived native signals into durable pharmacology. This page is a research reference to the mechanisms involved and the compounds catalogued here; it is not medical or dosing guidance.',
    howItWorks: [
      'Native incretins such as GLP-1 and GIP are released from the gut in response to nutrients and act on pancreatic, gastric, and central targets — but they are degraded within minutes by DPP-4. The defining engineering problem for this class has been resistance to that degradation: amino-acid substitutions, fatty-acid acylation, and albumin-binding moieties all extend half-life from minutes to days, converting a transient meal signal into a once-weekly pharmacological one.',
      'Single-receptor GLP-1 agonism drives glucose-dependent insulin secretion, slowed gastric emptying, and central appetite suppression. Dual GIP/GLP-1 co-agonism layers a complementary insulinotropic and adipose-tissue signal on top of that. Triple agonism adds glucagon-receptor activity, which is associated in research with increased energy expenditure and hepatic lipid handling — the rationale behind the steepest body-composition endpoints reported in recent trials.',
      'A parallel branch of the class works outside the incretin system entirely. Amylin analogs recruit calcitonin and amylin receptors for a distinct satiety signal studied in combination with GLP-1 agonists. Other catalogued compounds act on adipose tissue or cofactor metabolism directly rather than through gut-hormone receptors, which is why this category spans more than the GLP-1 headline names.',
    ],
    researchThemes: [
      'Incretin receptor pharmacology (GLP-1, GIP, glucagon)',
      'Half-life engineering: acylation and albumin binding',
      'Mono- vs dual- vs triple-agonist body-composition endpoints',
      'Amylin co-agonism and combination metabolic therapy',
      'Adipose-tissue and NAD+/cofactor-axis approaches',
      'Cardiometabolic and hepatic (MASH) research directions',
    ],
    faqs: [
      {
        q: 'What is a metabolic peptide?',
        a: 'In this catalog, a metabolic peptide is a peptide or peptide-like compound whose primary studied activity is on glucose handling, satiety, or energy expenditure — most commonly through the incretin receptors (GLP-1, GIP, glucagon) or the amylin system. Entries are reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'How do GLP-1 receptor agonists differ from dual and triple agonists?',
        a: 'A GLP-1 agonist activates a single incretin receptor. Dual agonists (GIP/GLP-1) co-activate two complementary pathways; triple agonists add glucagon-receptor activity associated with increased energy expenditure in research. Each added axis is, broadly, associated with larger body-composition effects in published trials, alongside a distinct research and tolerability profile.',
      },
      {
        q: 'Why are these peptides engineered for long half-lives?',
        a: 'Native incretins are cleared within minutes by the enzyme DPP-4. Substitutions, fatty-acid acylation, and albumin-binding linkers make analogs resistant to that clearance, extending exposure from minutes to days and enabling once-weekly research dosing schedules.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  'healing-repair': {
    metaTitle: 'Healing & Repair Peptides — Mechanisms & Research | AmericanPeptide',
    metaDescription:
      'A research reference on tissue-repair peptides — BPC-157, TB-500, GHK-Cu and related compounds. Angiogenesis, cell migration, and ECM remodeling mechanisms.',
    heading: 'Healing & Repair Peptides',
    tagline:
      'Regenerative peptides studied for angiogenesis, cell migration, and extracellular-matrix remodeling.',
    intro:
      'Healing and repair peptides are studied for their role in the cascade the body runs after tissue injury — recruiting blood supply, moving repair cells to the damage site, and rebuilding the structural matrix that holds tissue together. Unlike the metabolic class, much of this category rests on preclinical and mechanistic evidence rather than large human trials, so the research framing matters: these are reference profiles of investigational compounds, not validated therapies or dosing guidance.',
    howItWorks: [
      'Tissue repair is a staged process — hemostasis, inflammation, proliferation, and remodeling — and the peptides in this class are studied for their effects on the proliferation and remodeling phases in particular. The recurring theme is angiogenesis: re-establishing microvasculature so that oxygen and repair cells can reach hypoxic, damaged tissue. Compounds such as BPC-157 are studied for upregulation of the VEGF/VEGFR2 axis and nitric-oxide signaling in injured tendon, ligament, muscle, and gastrointestinal tissue.',
      'A second mechanism is directed cell migration. Thymosin-β4-derived sequences (TB-500) act on the actin cytoskeleton — sequestering G-actin and modulating polymerization — which in preclinical models accelerates the movement of endothelial and progenitor cells into the wound bed. This is mechanistically distinct from angiogenic signaling but complementary to it, which is why these two peptides are frequently studied together in the literature.',
      'The third axis is matrix remodeling and cytoprotection. Copper-binding peptides such as GHK-Cu are studied for modulation of collagen and elastin synthesis and a broad influence on extracellular-matrix and antioxidant gene programs. Other catalogued entries (LL-37, KPV) sit at the interface of repair and immune signaling — antimicrobial defense and resolution of inflammation are part of how a wound progresses to closure, so the healing and immune categories deliberately overlap.',
    ],
    researchThemes: [
      'Angiogenesis and the VEGF/VEGFR2 axis',
      'Actin-cytoskeleton modulation and cell migration',
      'Collagen, elastin, and extracellular-matrix remodeling',
      'Cytoprotection and growth-factor pathway modulation',
      'Repair–immune interface (antimicrobial, inflammation resolution)',
      'Preclinical evidence maturity vs. human trial data',
    ],
    faqs: [
      {
        q: 'What is a healing or repair peptide?',
        a: 'In this catalog, a healing/repair peptide is a peptide whose primary studied activity supports tissue regeneration — typically through angiogenesis, directed cell migration, or extracellular-matrix remodeling. Entries are reference profiles of investigational compounds, not products or treatment recommendations.',
      },
      {
        q: 'How do BPC-157 and TB-500 differ mechanistically?',
        a: 'They act on different parts of the repair cascade. BPC-157 is studied primarily for pro-angiogenic and cytoprotective activity (VEGFR2 and nitric-oxide pathways), while TB-500 — a thymosin-β4 fragment — is studied for actin-cytoskeleton modulation that promotes cell migration to injury sites. They are mechanistically complementary, which is why the literature often examines them in parallel.',
      },
      {
        q: 'How strong is the evidence for this peptide class?',
        a: 'Evidence maturity varies widely and is generally earlier-stage than the metabolic class. Much of the supporting work is preclinical or mechanistic rather than large randomized human trials. This page reports studied mechanisms and research directions, not established clinical efficacy.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  'growth-hormone': {
    metaTitle: 'Growth Hormone Peptides — GHRH & GHRP Research | AmericanPeptide',
    metaDescription:
      'A research reference on growth-hormone peptides — GHRH analogs and ghrelin-receptor secretagogues. Pulsatile GH release, half-life engineering, and the compounds under study.',
    heading: 'Growth Hormone Peptides',
    tagline:
      'GHRH analogs and ghrelin-receptor secretagogues studied for endogenous, pulsatile growth-hormone release.',
    intro:
      'Growth-hormone peptides are studied not as replacement hormone but as secretagogues — compounds that prompt the pituitary to release the body\'s own growth hormone in its natural pulsatile rhythm. The class splits cleanly along two receptor systems, and a recurring engineering theme is extending the very short native signal into a usable research half-life. This page is a research reference to those mechanisms and the catalogued compounds; it is not medical or dosing guidance.',
    howItWorks: [
      'The first branch is the GHRH-receptor agonists — sermorelin, the CJC-1295 analogs, and tesamorelin. These mimic growth-hormone-releasing hormone and act on pituitary somatotrophs to stimulate synthesis and release of endogenous GH. Because they work upstream of the pituitary, they are studied as preserving the body\'s feedback regulation and pulsatility rather than overriding it, which is the conceptual contrast with exogenous recombinant GH.',
      'The second branch is the growth-hormone secretagogues that act on the ghrelin receptor (GHS-R1a) — ipamorelin and hexarelin. These mimic ghrelin to trigger a GH pulse through a separate pathway, and selectivity is the differentiating research variable: ipamorelin is studied for releasing GH with minimal effect on cortisol or prolactin, whereas earlier-generation secretagogues are less selective. GHRH-pathway and ghrelin-pathway compounds are frequently studied in combination because their signals are complementary.',
      'Half-life engineering defines much of the catalogued variation. Native GHRH is cleared within minutes; sermorelin (GHRH 1-29) is the truncated parent sequence, modified GRF (1-29) adds stabilizing substitutions, and the DAC ("Drug Affinity Complex") variant of CJC-1295 adds an albumin-binding moiety that extends exposure from minutes to days. Evidence maturity is uneven across the class: tesamorelin carries an FDA approval for HIV-associated lipodystrophy and sermorelin was historically approved, while the secretagogue side remains largely investigational.',
    ],
    researchThemes: [
      'GHRH-receptor agonism and pituitary somatotroph signaling',
      'Ghrelin-receptor (GHS-R1a) secretagogue pathways',
      'Preservation of endogenous GH pulsatility vs. exogenous GH',
      'Secretagogue selectivity (cortisol / prolactin sparing)',
      'Half-life engineering: truncation, substitution, albumin binding (DAC)',
      'Evidence maturity: approved members vs. investigational secretagogues',
    ],
    faqs: [
      {
        q: 'What is a growth-hormone peptide?',
        a: 'In this catalog, a growth-hormone peptide is a secretagogue — a compound studied for prompting the pituitary to release endogenous growth hormone, either through the GHRH receptor or the ghrelin (GHS-R1a) receptor. These are reference profiles, not products, hormone replacement, or treatment recommendations.',
      },
      {
        q: 'How do GHRH analogs differ from ghrelin-receptor secretagogues?',
        a: 'GHRH analogs (sermorelin, CJC-1295, tesamorelin) mimic growth-hormone-releasing hormone at the pituitary GHRH receptor. Ghrelin-receptor secretagogues (ipamorelin, hexarelin) act on GHS-R1a through a separate pathway. The two are mechanistically complementary and are often studied together in the literature.',
      },
      {
        q: 'What does the "DAC" in CJC-1295 with DAC mean?',
        a: 'DAC is a Drug Affinity Complex — an albumin-binding moiety added to modified GRF (1-29). Native GHRH is cleared within minutes; the DAC linker binds serum albumin and extends exposure from minutes to days, which is the main pharmacokinetic difference between the with-DAC and no-DAC CJC-1295 entries.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  longevity: {
    metaTitle: 'Longevity Peptides — Mitochondrial & NAD+ Research | AmericanPeptide',
    metaDescription:
      'A research reference on longevity peptides — mitochondrial bioenergetics, the NAD+ axis, and telomere biology. Mechanisms and the compounds under active study.',
    heading: 'Longevity Peptides',
    tagline:
      'Compounds studied against the cellular hallmarks of aging — mitochondrial function, the NAD+ axis, and telomere biology.',
    intro:
      'Longevity peptides are studied not for a single endpoint but against the underlying cellular processes that decline with age. In this catalog the cluster organizes around three mechanistic axes rather than the cosmetic "anti-aging" framing common elsewhere: mitochondrial bioenergetics, the NAD+ cofactor economy, and telomere/pineal biology. Evidence here is mixed and often early-stage, so this page is a research reference to mechanisms and directions — not a claim of efficacy, and not medical or dosing guidance.',
    howItWorks: [
      'The largest axis is mitochondrial function. Mitochondrial dysfunction is a recognized hallmark of aging, and several catalogued compounds target it directly: MOTS-c is a mitochondrially-encoded peptide studied for AMPK activation and metabolic-stress signaling, while SS-31 (elamipretide) concentrates in the inner mitochondrial membrane and binds cardiolipin, studied for stabilizing cristae architecture and electron-transport efficiency. SS-31 is the most clinically advanced entry in the category, with trials in primary mitochondrial myopathy and Barth syndrome.',
      'The second axis is the NAD+ economy. NAD+ is an essential redox cofactor and substrate for sirtuins and PARPs, and its availability declines with age. The category includes NAD+ itself as a research reagent and 5-Amino-1MQ, an NNMT inhibitor studied for preserving cellular NAD+ and methyl-donor pools rather than supplementing the cofactor directly — two mechanistically different routes to the same metabolic endpoint, which is why both sit in this category.',
      'The third axis is telomere and pineal biology. Epitalon is a synthetic tetrapeptide derived from the pineal peptide epithalamin; it is studied in a telomere-maintenance and circadian framework, though the telomerase-activation narrative often attached to it rests largely on earlier-stage and regionally-concentrated studies rather than broad randomized human data. We present it as a mechanistic hypothesis under investigation, not an established effect.',
    ],
    researchThemes: [
      'Mitochondrial bioenergetics and cristae integrity',
      'Cardiolipin binding and electron-transport efficiency',
      'NAD+ cofactor economy and sirtuin/PARP substrate supply',
      'NNMT inhibition vs. direct cofactor supplementation',
      'Telomere maintenance and pineal/circadian signaling',
      'Hallmarks-of-aging framing and evidence maturity',
    ],
    faqs: [
      {
        q: 'What is a longevity peptide?',
        a: 'In this catalog, a longevity peptide is a compound studied against a cellular hallmark of aging — most commonly mitochondrial dysfunction, NAD+ decline, or telomere attrition — rather than a cosmetic anti-aging product. Entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'How do MOTS-c and SS-31 differ?',
        a: 'Both target mitochondria but differently. MOTS-c is a mitochondrially-encoded peptide studied for AMPK activation and metabolic-stress signaling; SS-31 (elamipretide) is a cardiolipin-binding tetrapeptide studied for stabilizing inner-membrane cristae and electron-transport efficiency. SS-31 is the more clinically advanced of the two.',
      },
      {
        q: 'Is the telomerase claim for Epitalon established?',
        a: 'No. Epitalon is studied within a telomere-maintenance and circadian framework, but the telomerase-activation narrative rests largely on earlier-stage and regionally-concentrated research rather than broad randomized human trials. We present it as a mechanistic hypothesis under investigation, not an established effect.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  reproductive: {
    metaTitle: 'Reproductive Peptides — Melanocortin & HPG-Axis Research | AmericanPeptide',
    metaDescription:
      'A research reference on reproductive peptides — central melanocortin agonists and kisspeptin/HPG-axis signaling. Mechanisms and the compounds under study.',
    heading: 'Reproductive Peptides',
    tagline:
      'Two neuroendocrine entry points: central melanocortin signaling and upstream kisspeptin/HPG-axis drive.',
    intro:
      'Reproductive peptides in this catalog act on the central nervous system and the hypothalamic–pituitary–gonadal (HPG) axis rather than peripherally. The cluster divides along two distinct neuroendocrine pathways, and the research distinction that matters most is central versus vascular: these compounds are studied for signaling effects in the brain, not for the peripheral hemodynamic mechanism of more familiar agents. This page is a mechanistic research reference, not medical or dosing guidance.',
    howItWorks: [
      'The first pathway is central melanocortin signaling. Melanotan II is a non-selective agonist across MC1R–MC5R, while PT-141 (bremelanotide) is melanocortin-4-receptor preferential and acts within hypothalamic circuits — its sexual-response effect is studied as centrally mediated rather than vascular, which is the key mechanistic contrast with PDE5-type agents. PT-141 is the most clinically mature entry in the category, carrying an FDA approval for hypoactive sexual desire disorder in premenopausal women; Melanotan II remains investigational and is also catalogued under cosmetic for its pigmentary activity.',
      'The second pathway is upstream of the gonadal hormones entirely. Kisspeptin-10 is the minimum bioactive fragment of kisspeptin and acts on KISS1R (GPR54) on hypothalamic GnRH neurons. It sits at the top of the HPG cascade — stimulating GnRH release, which drives pituitary LH and FSH and downstream sex-steroid production — which is why it is studied in reproductive endocrinology contexts such as hypothalamic amenorrhea and as a probe of HPG-axis integrity.',
      'The organizing theme of the category is therefore neuroendocrine level of action: melanocortin compounds act on central sexual-response circuitry, while kisspeptin acts as the master upstream regulator of the hormonal axis itself. They are not interchangeable and are studied for different research questions despite both being classed as "reproductive".',
    ],
    researchThemes: [
      'Central (CNS) vs. vascular mechanisms of sexual response',
      'Melanocortin receptor pharmacology (MC4R preference vs. non-selective)',
      'Kisspeptin / KISS1R (GPR54) signaling on GnRH neurons',
      'HPG-axis cascade: GnRH → LH/FSH → sex steroids',
      'Reproductive-endocrinology research models (e.g. amenorrhea)',
      'Evidence maturity: approved vs. investigational members',
    ],
    faqs: [
      {
        q: 'What is a reproductive peptide?',
        a: 'In this catalog, a reproductive peptide is a compound studied for effects on central sexual-response circuitry or the hypothalamic–pituitary–gonadal axis — through either melanocortin receptors or kisspeptin signaling. Entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'How is PT-141 different from vascular agents?',
        a: 'PT-141 (bremelanotide) is a melanocortin-4-receptor-preferential agonist studied for a centrally mediated effect within hypothalamic circuits, rather than the peripheral vascular mechanism of PDE5-type agents. That central-vs-vascular distinction is the defining mechanistic feature of the melanocortin pathway in this category.',
      },
      {
        q: 'Why is kisspeptin grouped with melanocortin peptides?',
        a: 'Both are reproductive-axis compounds but act at different levels. Kisspeptin-10 acts upstream on hypothalamic GnRH neurons (KISS1R/GPR54), driving the whole HPG cascade, whereas melanocortin agonists act on central sexual-response circuitry. They share the category but are studied for distinct research questions.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  cognitive: {
    metaTitle: 'Cognitive Peptides — Neurotrophic & Neuromodulatory Research | AmericanPeptide',
    metaDescription:
      'A research reference on cognitive peptides — neurotrophic, anxiolytic, and sleep-architecture mechanisms. Semax, Selank, DSIP, and the science under study.',
    heading: 'Cognitive Peptides',
    tagline:
      'CNS peptides studied for neurotrophic support, anxiolysis, and sleep-architecture modulation.',
    intro:
      'Cognitive peptides act within the central nervous system, but "cognitive" here is an umbrella over three mechanistically distinct subtypes rather than a single nootropic effect. The catalogued compounds were largely developed in Russian neuroscience programs, so a recurring evidence theme is that their clinical use is regionally concentrated rather than supported by broad international randomized trials. This page is a mechanistic research reference, not medical or dosing guidance.',
    howItWorks: [
      'The first subtype is neurotrophic and neuroprotective signaling. Semax is a heptapeptide analog of the ACTH(4-10) fragment studied for induction of BDNF and NGF and for melanocortin-system signaling without activating the HPA stress axis. It is used clinically in Russia in ischemic-stroke and cognitive contexts, and the research interest centers on neuroplasticity and neuroprotection following ischemic insult.',
      'The second subtype is anxiolytic neuromodulation. Selank is a synthetic analog of the immunomodulatory peptide tuftsin, studied for modulation of GABAergic and serotonergic systems and for inhibition of enkephalin degradation. The differentiating research observation is anxiolytic activity reported without the sedation or dependence liability associated with conventional anxiolytics — which is the property that makes it a distinct probe rather than a benzodiazepine analog.',
      'The third subtype is sleep-architecture and neuroendocrine modulation. DSIP (delta sleep-inducing peptide) is an endogenous nonapeptide studied for promotion of delta-wave activity and for lowering cortisol and ACTH, placing it at the interface of sleep biology and the stress axis. Its mechanism remains incompletely characterized and is likely multimodal, which is itself a notable feature of the category — these peptides are grouped by CNS locus of action, not by a shared receptor.',
    ],
    researchThemes: [
      'BDNF / NGF induction and neuroplasticity',
      'Neuroprotection in ischemic / stroke models',
      'GABAergic and serotonergic anxiolytic modulation',
      'Enkephalinase inhibition',
      'Delta-wave sleep architecture and the cortisol/ACTH axis',
      'Regionally-concentrated clinical evidence vs. international trials',
    ],
    faqs: [
      {
        q: 'What is a cognitive peptide?',
        a: 'In this catalog, a cognitive peptide is a CNS-acting compound studied for neurotrophic support, anxiolysis, or sleep-architecture modulation. The grouping is by central locus of action rather than a shared receptor, and entries are mechanistic reference profiles — not products or treatment recommendations.',
      },
      {
        q: 'How do Semax, Selank, and DSIP differ?',
        a: 'They represent three different subtypes. Semax is studied for BDNF/NGF-mediated neurotrophic and neuroprotective effects; Selank for GABAergic/serotonergic anxiolysis without sedation or dependence; DSIP for delta-wave sleep promotion and cortisol/ACTH modulation. They share the category but not a mechanism.',
      },
      {
        q: 'How strong is the clinical evidence for this class?',
        a: 'Several of these peptides see clinical use in Russia, but the supporting evidence is regionally concentrated rather than drawn from broad international randomized trials, and DSIP\'s mechanism remains incompletely characterized. This page reports studied mechanisms and research directions, not established international clinical efficacy.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  immune: {
    metaTitle: 'Immune Peptides — Immunomodulation Research | AmericanPeptide',
    metaDescription:
      'A research reference on immune peptides — thymic immunopotentiators, cathelicidin antimicrobials, and anti-inflammatory fragments. Mechanisms and compounds under study.',
    heading: 'Immune Peptides',
    tagline:
      'Immunomodulators studied in both directions — potentiating host defense and resolving inflammation.',
    intro:
      'The defining feature of this category is that it runs in two opposite directions. Some catalogued peptides are studied for potentiating immune responses and host defense; others for dampening and resolving inflammation. "Immunomodulation" is therefore not a single effect here, and the research question for any given compound depends on which arm of the immune response it engages. This page is a mechanistic research reference, not medical or dosing guidance.',
    howItWorks: [
      'The immunopotentiating arm is anchored by Thymosin α1, a 28-amino-acid thymic peptide studied for TLR9-mediated dendritic-cell activation and Th1 immune polarization. It is the most clinically mature entry in the category — approved in numerous countries as an adjunct in chronic viral hepatitis and as a general immune modulator — and is studied in sepsis and oncology-adjunct contexts where restoring a depressed immune response is the goal.',
      'The innate-defense arm is represented by LL-37, the only cathelicidin expressed in humans. It is studied for direct membrane disruption of bacteria, fungi, and viruses, and separately for immunomodulatory signaling and chemotaxis via the FPRL1 receptor. This dual role — direct antimicrobial action plus host-signaling — places it at the interface of innate immunity and wound healing, which is why it is also catalogued under healing-repair.',
      'The resolution arm runs the other way. KPV is the C-terminal tripeptide of α-MSH and retains much of α-MSH\'s anti-inflammatory activity — studied for NF-κB pathway inhibition and reduction of pro-inflammatory cytokines — without the pigmentary effects of the parent hormone. It is studied in colitis and skin-inflammation models, representing the inflammation-resolving counterweight to the potentiating compounds in the same category.',
    ],
    researchThemes: [
      'Thymic immunopotentiation and Th1 polarization',
      'TLR9-mediated dendritic-cell activation',
      'Cathelicidin antimicrobial activity and FPRL1 signaling',
      'NF-κB inhibition and inflammation resolution',
      'Innate immunity at the repair interface',
      'Bidirectional immunomodulation (potentiate vs. resolve)',
    ],
    faqs: [
      {
        q: 'What is an immune peptide?',
        a: 'In this catalog, an immune peptide is a compound studied for modulating the immune response — either potentiating host defense (e.g. Thymosin α1, LL-37) or resolving inflammation (e.g. KPV). The category deliberately spans both directions, so entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'Why does this category contain opposite mechanisms?',
        a: 'Immunomodulation is not a single effect. Thymosin α1 and LL-37 are studied for potentiating immune and antimicrobial responses, while KPV is studied for dampening inflammation via NF-κB inhibition. They share the "immune" classification because they all act on the immune system, but they engage different arms of it.',
      },
      {
        q: 'Which immune peptide has the most clinical support?',
        a: 'Thymosin α1 (thymalfasin) is the most clinically mature entry — approved in numerous countries as an adjunct in chronic viral hepatitis and as an immune modulator. LL-37 is an endogenous peptide heavily studied in innate-immunity research, while KPV remains largely preclinical.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  cosmetic: {
    metaTitle: 'Cosmetic Peptides — Dermal & Pigmentary Research | AmericanPeptide',
    metaDescription:
      'A research reference on cosmetic peptides — dermal matrix remodeling and melanocortin pigmentation. GHK-Cu, Melanotan II, and the mechanisms under study.',
    heading: 'Cosmetic Peptides',
    tagline:
      'Skin-targeting peptides studied along two unrelated axes: dermal matrix remodeling and melanocortin pigmentation.',
    intro:
      'This is a small, deliberately heterogeneous category. The catalogued compounds share a skin-relevant research context but not a mechanism — one acts on the dermal extracellular matrix, the other on melanocyte pigmentation through the melanocortin system. Treating "cosmetic" as a single mechanism would be misleading, so this page separates the two. It is a mechanistic research reference, not cosmetic-efficacy marketing, medical advice, or dosing guidance.',
    howItWorks: [
      'The dermal-matrix axis is GHK-Cu, the copper complex of the endogenous tripeptide glycyl-L-histidyl-L-lysine, originally isolated from human plasma. It has one of the longest research histories in the catalog and is studied for copper delivery, modulation of collagen and elastin synthesis, fibroblast activity, antioxidant gene programs, and hair-follicle proliferation. Because matrix remodeling is also the substrate of tissue repair, GHK-Cu is cross-listed under healing-repair — the cosmetic framing is one application of a broader ECM-remodeling mechanism.',
      'The pigmentary axis is Melanotan II, a non-selective melanocortin agonist active across MC1R–MC5R. Its pigmentary effect is studied through MC1R agonism on melanocytes, driving eumelanin synthesis, with photoprotection as a research interest. Because the compound is non-selective rather than MC1R-specific, its activity extends beyond pigmentation — which is why it is also cross-listed under reproductive. It is investigational and unapproved, and is presented here as a mechanistic reference only, not an endorsement of use.',
      'The organizing point of the category is therefore divergence, not convergence: a well-characterized endogenous matrix peptide and a non-selective investigational melanocortin agonist happen to share a skin-relevant research surface but should not be read as a single class.',
    ],
    researchThemes: [
      'Copper delivery and ECM/antioxidant gene modulation',
      'Collagen and elastin synthesis; fibroblast activity',
      'Hair-follicle proliferation',
      'MC1R agonism and eumelanin synthesis',
      'Photoprotection research',
      'Endogenous, well-characterized vs. non-selective investigational',
    ],
    faqs: [
      {
        q: 'What is a cosmetic peptide?',
        a: 'In this catalog, a cosmetic peptide is a compound studied in a skin-relevant research context — either dermal matrix remodeling (GHK-Cu) or melanocortin-driven pigmentation (Melanotan II). The two share the category label but not a mechanism, and entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'Why are GHK-Cu and Melanotan II in the same category?',
        a: 'Only by skin-relevant research surface, not by mechanism. GHK-Cu is an endogenous copper tripeptide studied for extracellular-matrix remodeling; Melanotan II is a non-selective melanocortin agonist studied for pigmentation. They are cross-listed elsewhere (GHK-Cu under healing-repair, Melanotan II under reproductive) because their mechanisms extend beyond cosmetic context.',
      },
      {
        q: 'Is Melanotan II approved?',
        a: 'No. Melanotan II is investigational and unapproved. It is presented here as a mechanistic reference profile only — not an endorsement of use. GHK-Cu, by contrast, is an endogenous peptide with a long research history, though catalog entries remain reference material rather than treatment recommendations.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },

  mitochondrial: {
    metaTitle: 'Mitochondrial Peptides — Bioenergetics Research | AmericanPeptide',
    metaDescription:
      'A research reference on mitochondrial peptides — mitochondrial-derived signaling, cristae integrity, and the redox cofactor economy. MOTS-c, SS-31, NAD+.',
    heading: 'Mitochondrial Peptides',
    tagline:
      'Compounds studied at three levels of the same organelle: genome signaling, membrane structure, and redox chemistry.',
    intro:
      'This category shares its compounds with longevity but frames them differently. Longevity organizes around the aging endpoint; this page organizes around the organelle itself — bioenergetics at the level of mitochondrial signaling, inner-membrane architecture, and the electron-carrier economy. Reading the two pages together gives the mechanism (here) and the aging-hallmark context (longevity). This is a mechanistic research reference, not medical or dosing guidance.',
    howItWorks: [
      'The first level is the mitochondrial genome as a signaling source. MOTS-c is a mitochondrial-derived peptide (MDP) — encoded within the mitochondrial 12S rRNA region rather than the nuclear genome — and is studied as a retrograde signal from mitochondrion to cell, with AMPK activation and adaptation to metabolic stress as the principal research themes. The MDP concept itself is the notable idea: the organelle is not only a power plant but a source of regulatory peptides.',
      'The second level is inner-membrane architecture. SS-31 (elamipretide) concentrates in the inner mitochondrial membrane and binds cardiolipin, the signature phospholipid that organizes electron-transport-chain supercomplexes and cristae curvature. It is studied for preserving cristae integrity and electron-transport efficiency, and it is the most clinically advanced entry — investigated in primary mitochondrial myopathy and Barth syndrome — making it the bridge between mechanistic research and clinical mitochondrial medicine.',
      'The third level is the redox cofactor economy. NAD+ is the central electron carrier for oxidative phosphorylation and the obligate substrate for sirtuins and PARPs; its availability gates both bioenergetic flux and NAD+-dependent signaling. Catalogued as a research reagent and investigational therapeutic, it represents the chemistry layer beneath the signaling and structural layers — three different entry points into the same organelle rather than three interchangeable compounds.',
    ],
    researchThemes: [
      'Mitochondrial-derived peptides (MDPs) and retrograde signaling',
      'AMPK activation and metabolic-stress adaptation',
      'Cardiolipin binding and cristae / supercomplex organization',
      'Electron-transport-chain efficiency',
      'NAD+ redox economy and sirtuin/PARP substrate supply',
      'Mechanistic framing vs. the longevity aging-hallmark view',
    ],
    faqs: [
      {
        q: 'What is a mitochondrial peptide?',
        a: 'In this catalog, a mitochondrial peptide is a compound studied at the level of mitochondrial function — genome-derived signaling (MOTS-c), inner-membrane structure (SS-31), or the redox cofactor economy (NAD+). Entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'How is this category different from longevity?',
        a: 'They share compounds but not framing. This page organizes them by organelle-level mechanism — signaling, membrane structure, redox chemistry. The longevity page organizes the same peptides around the aging endpoint and hallmarks of aging. Reading both gives mechanism plus aging context.',
      },
      {
        q: 'What is a mitochondrial-derived peptide (MDP)?',
        a: 'An MDP is a peptide encoded within the mitochondrial genome rather than the nuclear genome. MOTS-c, encoded in the mitochondrial 12S rRNA region, is the catalog\'s example — studied as a retrograde signal from mitochondrion to cell, with AMPK activation as a principal theme.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },
  bioregulator: {
    metaTitle: 'Peptide Bioregulators — Khavinson Short Peptides | AmericanPeptide',
    metaDescription:
      'A research reference on short peptide bioregulators — the Khavinson Cytomax/Cytogen series. Tissue-specific di-, tri-, and tetrapeptides, the gene-regulatory hypothesis, and an honest read of the evidence.',
    heading: 'Peptide Bioregulators',
    tagline:
      'Very short, tissue-specific peptides proposed to regulate gene expression — the Khavinson series, read with the evidence in full view.',
    intro:
      'Bioregulators are the shortest peptides in this catalog — di-, tri-, and tetrapeptides developed largely by the St. Petersburg Institute of Bioregulation and Gerontology (the "Khavinson" school). Each is associated with a specific tissue and proposed to act not as a hormone or receptor ligand but as a direct regulator of gene expression. The class is popular in longevity circles and unusually thin on independent Western data, which is exactly why it belongs here framed honestly rather than promotionally. This is a mechanistic research reference, not medical, dosing, or purchasing guidance.',
    howItWorks: [
      'The class began with tissue extracts. Thymalin, a polypeptide fraction of thymus, was the prototype "Cytomax" — an animal-tissue extract intended to bioregulate the organ it came from. The defined synthetic short peptides that followed (the "Cytogens") were modeled on these extracts: Vilon (Lys-Glu) as a defined stand-in for Thymalin, then a family of organ-specific sequences — Epitalon (pineal), Vesugen (vascular), Pinealon (brain), Bronchogen (lung), Cardiogen (heart), Pancragen (pancreas).',
      'The central hypothesis is gene-regulatory rather than receptor-mediated. Because these peptides are so small, the originating group proposed that they enter the cell, reach the nucleus, and bind specific promoter sequences in DNA — de-condensing heterochromatin and switching on tissue-relevant genes that fall silent with age. Tissue selectivity, in this model, comes from sequence-specific DNA contacts rather than from a cell-surface receptor. This mechanism is proposed and partially supported in the originating literature, not firmly established by independent structural work.',
      'The honest caveat is the point, not a footnote. Nearly all of the clinical and lifespan data come from a single research tradition, much of it older, Russian-language, and not independently replicated in large Western trials. Epitalon\'s telomerase and lifespan claims in particular outrun the third-party evidence. For a trust-first reference the value-add is exactly this: clear sequences, a sober evidence grade, and identity/purity scrutiny for a category where short, cheap peptides are easy to misrepresent.',
    ],
    researchThemes: [
      'Tissue-specific short peptides (di-, tri-, tetrapeptides)',
      'Cytomax tissue extracts vs. defined synthetic Cytogens',
      'The peptide–DNA gene-regulatory hypothesis',
      'Heterochromatin de-condensation and age-silenced genes',
      'Aging / healthspan endpoints in model organisms',
      'Single-tradition evidence base and replication gaps',
    ],
    faqs: [
      {
        q: 'What is a peptide bioregulator?',
        a: 'In this catalog, a bioregulator is a very short, tissue-specific peptide — usually 2 to 4 amino acids — from the Khavinson Cytomax/Cytogen series, proposed to regulate gene expression in a particular organ rather than act as a hormone. Entries are mechanistic reference profiles, not products or treatment recommendations.',
      },
      {
        q: 'How is this different from the longevity or immune categories?',
        a: 'It is a class (short tissue-regulating peptides), not an indication, so its members are cross-listed by what they are studied for — Epitalon and Vilon also appear under longevity and immune. This page organizes them by the shared bioregulator hypothesis and history.',
      },
      {
        q: 'How strong is the evidence for bioregulators?',
        a: 'Weaker and narrower than the popularity suggests. Most clinical and lifespan data come from a single research tradition with limited independent Western replication, so findings should be treated as preliminary. We flag this on every entry rather than burying it.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },
  'peptide-hormone': {
    metaTitle: 'Peptide Hormones — Synthesis & Analog Engineering | AmericanPeptide',
    metaDescription:
      'How hormone sequences become manufacturable synthetic drugs: the analog engineering and synthesis behind somatostatin→octreotide, amylin→pramlintide, vasopressin→desmopressin, ACTH→cosyntropin, plus ghrelin’s unique acylation and calcitonin’s disulfide chemistry.',
    heading: 'Peptide Hormones',
    tagline:
      'The synthesis and analog-engineering side of the hormone peptides — how a natural sequence is turned into a pure, stable, manufacturable drug.',
    intro:
      'This category profiles the hormone peptides from AmericanPeptide.com’s angle: synthetic science and synthesis. The question here is not what a hormone does in the body — the endogenous physiology is covered in depth at our sister site peptidehormone.com — but how its sequence is built, why the native molecule is so often a poor drug, and what analog engineering turns it into a manufacturable, pure, stable therapeutic. Each entry pairs the sequence, disulfide pattern, and modifications with a synthesis note on the difficult couplings, oxidation/acylation steps, and purity pitfalls that define it. It is a synthesis and medicinal-chemistry reference, not medical, dosing, or purchasing guidance.',
    howItWorks: [
      'Start from the sequence and its modifications. These peptides carry the features that make hormone synthesis hard: intramolecular disulfides that must be formed regioselectively after chain assembly (vasopressin’s 1–6 ring, somatostatin’s 3–14, calcitonin’s 1–7, amylin’s 2–7), C-terminal amides, and — in ghrelin’s case — an O-octanoyl ester on Ser3, the only such acylation among human hormones and the purity-defining step in its manufacture. Solid-phase synthesis builds the chain; the chemistry that matters is in the folding, oxidation, and side-chain handling that follow.',
      'The native hormone is usually a bad drug, and the engineering is the story. Somatostatin lasts only minutes, so the usable medicine is octreotide — the 14-mer distilled to a protease-resistant 8-residue cyclic analog with D-amino acids. Human amylin aggregates into islet amyloid, so pramlintide swaps three residues to prolines that break the β-sheet and make the peptide synthesizable and shelf-stable. Vasopressin becomes desmopressin through a D-arginine and a deamination that split its two receptor activities. ACTH’s whole activity lives in its first 24 residues, so cosyntropin is just that fragment. Each is a distinct design tactic — minimization, anti-aggregation substitution, stereochemical editing, truncation — and reading them together is a short course in peptide drug design.',
      'Provenance and purity are the throughline this catalog exists to track. Several of these (secretin, calcitonin, ACTH) were historically animal-extracted and are now defined synthetic products with a certificate of analysis — a shift from variable biological material to a sequence-verified, assayable molecule. For each entry the failure modes are concrete: deletion sequences, disulfide isomers, des-acyl by-product, aggregation. That is the layer AmericanPeptide.com adds on top of the biology — what it takes to make one of these correctly and prove it.',
    ],
    researchThemes: [
      'Solid-phase synthesis of disulfide-containing and amidated hormone peptides',
      'Analog engineering: minimization, truncation, D-amino-acid substitution',
      'Designing against aggregation (amylin → pramlintide)',
      'Site-specific acylation and half-life extension (ghrelin, vasopressin)',
      'Animal-extracted → defined-synthetic provenance and the certificate of analysis',
      'Purity failure modes: deletion sequences, disulfide isomers, des-acyl by-product',
    ],
    faqs: [
      {
        q: 'What does this category cover that peptidehormone.com does not?',
        a: 'The synthesis and analog-engineering side: how each hormone sequence is built, what makes it hard to synthesize, and how analogs are designed to be stable, pure, and manufacturable. The endogenous physiology and clinical biology of these hormones is covered at peptidehormone.com; the two are complementary.',
      },
      {
        q: 'Why do several entries center on an analog drug rather than the hormone itself?',
        a: 'Because the native hormone is frequently impractical to make or to dose — too short-lived (somatostatin), aggregation-prone (amylin), or unnecessarily long (ACTH). The synthetic analog is where the engineering lives, so octreotide, pramlintide, desmopressin, and cosyntropin are the molecules whose synthesis the entries focus on.',
      },
      {
        q: 'How is this different from the bioregulator category?',
        a: 'Bioregulators are very short peptides framed around a gene-regulatory hypothesis. This category is framed around synthesis and analog engineering of receptor-active hormone peptides — what their sequences and modifications demand to manufacture and purify.',
      },
      {
        q: 'Is this page medical or dosing advice?',
        a: 'No. AmericanPeptide.com is a computational research and reference platform, not a medical device or clinical decision-support system. Nothing here is medical advice, a dosing protocol, or an offer to sell. Independent expert and regulatory review is required before any experimental use.',
      },
    ],
  },
}

export function getCategoryContent(
  id: PeptideCategory,
): CategoryContent | undefined {
  return CATEGORY_CONTENT[id]
}
