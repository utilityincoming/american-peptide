import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Design Lab (Beta) — AmericanPeptide.com',
  description:
    'Experimental, research-use peptide design lab: build or load a sequence and get live molecular weight, pH-dependent net charge, isoelectric point, GRAVY, and 280 nm extinction coefficient.',
  alternates: { canonical: `${SITE}/tools/design-lab` },
  robots: { index: false, follow: false },
}

export default function DesignLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
