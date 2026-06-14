// ── Homepage FAQ ────────────────────────────────────────────────────────────
// This is the curation surface. Edit STATIC_FAQS by hand over time — reorder,
// reword, add, or retire entries as you learn what researchers actually ask.
//
// SEO + stability strategy:
//   • STATIC_FAQS are hand-curated and emitted as FAQPage structured data
//     (see faqPageJsonLd). Keep them stable and accurate — search engines reward
//     consistent, trustworthy schema and can show these as rich results.
//   • Dynamic / Agent-sourced questions belong in getDynamicFaqs() and are kept
//     OUT of the JSON-LD, so the indexed schema never churns. Surface them in the
//     accordion under a separate, clearly-labelled group.
//
// A good cadence: watch the Peptide Agent's most-asked questions, draft answers
// with the Agent, then promote the keepers up into STATIC_FAQS by hand.

export interface Faq {
  /** Stable slug — used for the ARIA ids and as a React key. Don't reuse. */
  id: string
  question: string
  /**
   * Plain-text answer. Keep it self-contained and 1–3 sentences: this exact
   * string is also the answer text in the FAQPage JSON-LD, so no markup.
   */
  answer: string
  /** Optional deep-link surfaced beneath the answer (a tool, the Agent, a page). */
  cta?: { label: string; href: string }
}

/**
 * Curated, SEO-anchored FAQs. Order = priority (the first renders open by
 * default). These are the stable core that ships in the structured data.
 */
export const STATIC_FAQS: Faq[] = [
  {
    id: 'what-is',
    question: 'What is AmericanPeptide.com?',
    answer:
      'AmericanPeptide.com is an AI-assisted research platform and open reference for peptide science. It pairs a citation-backed research assistant — the Peptide Agent — with an open catalog of research peptides, hands-on calculators, and synthesis guides, all grounded in public datasets like PubChem, UniProt, PubMed, and ClinicalTrials.gov.',
    cta: { label: 'More about us', href: '/about' },
  },
  {
    id: 'buy-peptides',
    question: 'Can I buy peptides here?',
    answer:
      'No — AmericanPeptide.com does not sell peptides or take orders; our role is to help you evaluate a source, not to be one. We publish the chemistry, the evidence, and the criteria that separate a trustworthy vendor from a questionable one, so wherever you buy you can judge it on its COA, third-party testing, and purity.',
  },
  {
    id: 'medical-advice',
    question: 'Is any of this medical advice?',
    answer:
      'No. Everything on the site is for computational research and education only. It is not medical advice, diagnosis, treatment, or a dosing protocol, and AI-generated output is a hypothesis that requires independent experimental validation. Always consult a qualified professional and follow applicable laws.',
  },
  {
    id: 'agent-sources',
    question: 'Where does the Peptide Agent get its answers?',
    answer:
      'The Peptide Agent answers from primary sources, not guesswork. It grounds responses with live tools across PubChem, UniProt, PubMed, and ClinicalTrials.gov, and shows its citations so you can trace every claim back to the original record.',
    cta: { label: 'Ask the Peptide Agent', href: '/research' },
  },
  {
    id: 'coa-purity',
    question: 'What is a COA, and why does purity matter?',
    answer:
      "A certificate of analysis (COA) is the third-party lab report documenting a peptide's identity and purity — typically by HPLC and mass spectrometry. Purity matters because impurities and truncated sequences can confound results, so reading the COA is how you separate a clean compound from a questionable one.",
    cta: { label: 'Decode a COA', href: '/tools/coa-decoder' },
  },
  {
    id: 'open-data',
    question: 'Is the catalog data free to use?',
    answer:
      'Yes. The peptide catalog is open data under Creative Commons Attribution 4.0 (CC BY 4.0) — free to read, query via the API, and redistribute, including commercially, as long as you credit AmericanPeptide.com. There is also a JSON API, markdown twins, and an MCP server for agents.',
    cta: { label: 'See the developer docs', href: '/developers' },
  },
  {
    id: 'reconstitution',
    question: 'How do I calculate peptide reconstitution?',
    answer:
      'Reconstitution is a dilution calculation: the final concentration depends on the mass of peptide in the vial and the volume of solvent (usually bacteriostatic water) you add. The reconstitution calculator does the math and shows the draw volume for a target amount.',
    cta: { label: 'Open the calculator', href: '/tools/reconstitution-calculator' },
  },
]

// Dynamic / Agent-sourced FAQs now live in lib/agent-faqs.ts (KV-backed, ranked
// by real /api/chat usage) and render client-side via the DynamicFaqs component,
// kept out of the JSON-LD below so the indexed structured data stays stable.
// Promote durable popular questions up into STATIC_FAQS by hand when they've
// earned a permanent, indexed spot.

/**
 * Build schema.org FAQPage structured data from the static set. Inject the
 * result as <script type="application/ld+json"> so search engines can render
 * these as rich results. Only pass curated, stable questions here.
 */
export function faqPageJsonLd(faqs: Faq[] = STATIC_FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}
