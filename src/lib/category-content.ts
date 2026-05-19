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
}

export function getCategoryContent(
  id: PeptideCategory,
): CategoryContent | undefined {
  return CATEGORY_CONTENT[id]
}
