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
  {
    id: 'bac-vs-sterile-water',
    question:
      'What is the difference between bacteriostatic water and sterile water for reconstitution?',
    answer:
      'Bacteriostatic water contains about 0.9% benzyl alcohol, a preservative that suppresses bacterial growth so a vial can be entered repeatedly over several weeks. Sterile water has no preservative and is intended for single use — once a vial is opened it offers no protection against contamination. For a multi-dose peptide vial that will be drawn from over time, bacteriostatic water is the volume this calculator assumes.',
  },
  {
    id: 'how-long-reconstituted-lasts',
    question: 'How long does a reconstituted peptide last in the refrigerator?',
    answer:
      'Most reconstituted research peptides are generally cited as stable for roughly 4–6 weeks when stored refrigerated at 2–8°C, protected from light, and mixed with bacteriostatic water. Exact stability is compound-specific and depends on purity, temperature, and handling, so label the vial with the reconstitution date and treat the window as a guideline, not a guarantee. Lyophilized (undissolved) powder lasts far longer — often many months to years — which is why peptides ship as powder and are reconstituted only when needed.',
  },
  {
    id: 'why-not-shake',
    question: 'Why should I swirl and not shake a peptide vial?',
    answer:
      'Peptides are fragile chains of amino acids, and the mechanical shear and foaming from vigorous shaking can denature or degrade them, lowering the amount of intact peptide you actually draw. Add the bacteriostatic water slowly against the inside glass wall rather than onto the powder, then let it dissolve on its own or swirl gently until the solution is clear.',
  },
  {
    id: 'dose-smaller-than-mark',
    question: 'What if my dose is smaller than the smallest mark on the syringe?',
    answer:
      'If a dose lands below one or two units it is hard to measure accurately, which makes each injection inconsistent. The fix is to reconstitute with more bacteriostatic water: a lower concentration spreads the same dose across more syringe units, moving it onto readable tick marks. Raise the water volume in the calculator above and watch the units-per-injection climb until the draw is easy to read.',
  },
  {
    id: 'can-you-freeze',
    question: 'Can reconstituted peptides be frozen?',
    answer:
      'Reconstituted peptide solution should not be frozen — a freeze–thaw cycle forms ice crystals that can break the peptide and damage its activity. Keep the mixed solution refrigerated at 2–8°C. Freezing is generally reserved for long-term storage of the dry lyophilized powder, not the dissolved solution.',
  },
]
