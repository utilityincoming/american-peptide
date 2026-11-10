import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Research Pass',
  description:
    'Unlimited Peptide Agent research searches for 30 days — cited answers grounded in PubChem, ClinicalTrials.gov, PubMed and UniProt. Research and educational use only.',
  alternates: { canonical: `${SITE}/research/pass` },
  // A checkout/redemption surface (and the post-payment return URL), not
  // reference content — kept out of search and absent from the sitemap.
  robots: { index: false, follow: false },
}

export default function ResearchPassLayout({ children }: { children: React.ReactNode }) {
  return children
}
