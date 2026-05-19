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
}

export function getCategoryContent(
  id: PeptideCategory,
): CategoryContent | undefined {
  return CATEGORY_CONTENT[id]
}
