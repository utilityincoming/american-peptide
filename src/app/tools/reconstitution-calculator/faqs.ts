import type { Faq } from '@/lib/faqs'

// Calculator-specific FAQ, single-sourced here so the visible accordion (in the
// client page) and the FAQPage JSON-LD (emitted server-side from layout.tsx)
// can never drift. Answers are plain text — the exact same strings feed the
// structured data — and stay accurate to what the tool on this page actually
// does. Question wording tracks real long-tail search intent (bacteriostatic
// water volume, insulin-syringe units, per-compound applicability).
export const RECON_FAQS: Faq[] = [
  {
    id: 'bac-water-amount',
    question: 'How much bacteriostatic water should I add to a peptide vial?',
    answer:
      'There is no single correct volume — the water you add sets the concentration, so you choose it to make your target dose easy to measure. More water spreads the peptide across more syringe units, so small doses land on readable tick marks; less water keeps the injection volume tiny. Enter your vial size and dose above to see the concentration and draw volume for any amount you try.',
  },
  {
    id: 'syringe-units',
    question: 'How many units is my peptide dose on an insulin syringe?',
    answer:
      'On a U-100 insulin syringe, "units" are hundredths of a milliliter — 100 units = 1 mL — not a measure of peptide mass. Your dose in units depends on the concentration: after reconstitution, the calculator converts your target dose in mcg to the exact units to draw and marks the fill on a U-100 barrel.',
  },
  {
    id: 'which-peptides',
    question:
      'Does this calculator work for semaglutide, tirzepatide, retatrutide, and BPC-157?',
    answer:
      'Yes. The math is the same for any lyophilized peptide supplied by vial weight — semaglutide, tirzepatide, retatrutide, BPC-157, TB-500, and the rest — because reconstitution is just peptide mass divided by the water you add. Enter the vial size in mg and your dose in mcg, and it handles the conversion.',
    cta: { label: 'Browse the peptide catalog', href: '/catalog' },
  },
]
