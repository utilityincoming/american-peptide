import type { Metadata } from 'next'
import { webApplicationJsonLd } from '@/lib/schema'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Design Lab (Beta)',
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
  const jsonLd = webApplicationJsonLd({
    name: 'Peptide Design Lab',
    description:
      'Experimental peptide design lab for molecular weight, charge, isoelectric point, GRAVY, and extinction coefficient.',
    path: '/tools/design-lab',
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
