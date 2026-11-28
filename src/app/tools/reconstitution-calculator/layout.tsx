import type { Metadata } from 'next'
import { faqPageJsonLd } from '@/lib/faqs'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'
import RelatedCatalog from '@/components/RelatedCatalog'
import { RECON_FAQS } from './faqs'

const SITE = 'https://americanpeptide.com'
const url = `${SITE}/tools/reconstitution-calculator`

export const metadata: Metadata = {
  title: 'Reconstitution calculator — volume and dose',
  description:
    'Research calculator for bacteriostatic water volume and concentration from vial size and target dose. Cited reference tool, not a store.',
  alternates: { canonical: url },
  keywords: [
    'peptide reconstitution calculator',
    'bacteriostatic water calculator',
    'peptide dosage calculator',
    'how to reconstitute peptides',
    'peptide dilution calculator',
    'BAC water peptide',
    'peptide mixing calculator',
  ],
  openGraph: {
    title: 'Reconstitution calculator — volume and dose',
    description:
      'Research calculator for bacteriostatic water volume and concentration from vial size and target dose. Cited reference tool, not a store.',
    url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reconstitution calculator — volume and dose',
    description:
      'Research calculator for bacteriostatic water volume and concentration from vial size and target dose. Cited reference tool, not a store.',
  },
}

const jsonLd = webApplicationJsonLd({
  name: 'Peptide Reconstitution Calculator',
  description:
    'Calculate bacteriostatic water volume and concentration from vial size and target dose.',
  path: '/tools/reconstitution-calculator',
})

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Reconstitution Calculator', path: '/tools/reconstitution-calculator' },
])

export default function ReconstitutionCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* FAQPage structured data for the on-page Reconstitution FAQ. Server-
          rendered here so it's in the initial HTML; the visible accordion in
          page.tsx renders the same RECON_FAQS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(RECON_FAQS)) }}
      />
      {children}
      <RelatedCatalog slugs={['semaglutide', 'tirzepatide', 'bpc-157', 'tb-500']} heading="Use with these peptides" />
    </>
  )
}
