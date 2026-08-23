import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'
const url = `${SITE}/tools/reconstitution-calculator`

export const metadata: Metadata = {
  title: 'Peptide Reconstitution Calculator — AmericanPeptide.com',
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
  applicationCategory: 'HealthApplication',
  author: {
    '@type': 'Organization',
    name: 'AmericanPeptide.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
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
      {children}
    </>
  )
}
