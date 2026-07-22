import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Peptide Reconstitution Calculator — AmericanPeptide.com',
  description:
    'Free peptide reconstitution calculator. Calculate bacteriostatic water volume, concentration per injection, and dosing from vial size and desired dose. Essential tool for peptide researchers.',
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
