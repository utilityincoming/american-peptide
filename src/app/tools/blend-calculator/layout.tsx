import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Blend Calculator (Beta) — AmericanPeptide.com',
  description:
    'Experimental, research-use blend math: combine multiple peptides into one vial and verify the per-dose mass each draw delivers. Not administration or dosing guidance.',
  alternates: { canonical: `${SITE}/tools/blend-calculator` },
  robots: { index: false, follow: false },
}

export default function BlendCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
