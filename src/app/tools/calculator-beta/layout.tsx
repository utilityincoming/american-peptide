import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Calculator (Beta) — AmericanPeptide.com',
  description:
    'Experimental peptide calculator with extra modes in development, including a reverse solver for bacteriostatic water volume from a target draw size.',
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
