import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Calculator (Beta) — AmericanPeptide.com',
  description:
    'Experimental peptide calculator with extra modes in development — a GLP-1 pen mode for pre-filled pens and 10–50 mg vials, a reverse solver for bacteriostatic water from a target draw, and IU dosing for HGH.',
  alternates: { canonical: `${SITE}/tools/calculator-beta` },
  // In-development surface — keep it out of search until it graduates.
  robots: { index: false, follow: false },
}

export default function CalculatorBetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
