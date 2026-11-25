import type { Metadata } from 'next'
import { faqPageJsonLd } from '@/lib/faqs'
import { RECON_FAQS } from './faqs'

const SITE = 'https://americanpeptide.com'
const url = `${SITE}/tools/reconstitution-calculator`

export const metadata: Metadata = {
  title: 'Peptide Reconstitution Calculator',
  description:
    'Free peptide reconstitution calculator. Calculate bacteriostatic water volume, concentration per injection, and dosing from vial size and desired dose. Essential tool for peptide researchers.',
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
    title: 'Peptide Reconstitution Calculator',
    description:
      'Free calculator for bacteriostatic water volume, concentration per injection, and dose — straight from vial size and target dose.',
    url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Reconstitution Calculator | AmericanPeptide.com',
    description:
      'Free calculator: bacteriostatic water volume, concentration per unit, and dose from vial size and target dose.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Peptide Reconstitution Calculator',
  url: 'https://americanpeptide.com/tools/reconstitution-calculator',
  applicationCategory: 'EducationalApplication',
  isAccessibleForFree: true,
  license: 'https://creativecommons.org/licenses/by/4.0/',
  author: {
    '@type': 'Organization',
    '@id': 'https://americanpeptide.com/#organization',
    name: 'AmericanPeptide.com',
    url: 'https://americanpeptide.com',
  },
}

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
      {/* FAQPage structured data for the on-page Reconstitution FAQ. Server-
          rendered here so it's in the initial HTML; the visible accordion in
          page.tsx renders the same RECON_FAQS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(RECON_FAQS)) }}
      />
      {children}
    </>
  )
}
