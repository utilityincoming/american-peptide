import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Blend Calculator (Beta)',
  description:
    'Experimental, research-use blend math plus a post-reconstitution screen: opposite charge, isoelectric point, hydrophobicity, cysteines, and labeled syringe incompatibilities. Not administration or dosing guidance.',
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
