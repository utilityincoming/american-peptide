import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Catalog — 100+ Research Compounds | AmericanPeptide.com',
  description:
    'Browse 100+ research peptides — GLP-1 agonists, healing peptides, nootropics, longevity compounds, and more. Filter by category, indication, and FDA status. Free open reference.',
  alternates: { canonical: `${SITE}/catalog` },
  openGraph: {
    title: 'Peptide Catalog — 100+ Research Compounds',
    description:
      'Browse 100+ research peptides by category, indication, and FDA status — semaglutide, tirzepatide, BPC-157, and more. Free open reference.',
    url: `${SITE}/catalog`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Catalog — 100+ Research Compounds | AmericanPeptide.com',
    description:
      'Browse 100+ research peptides — GLP-1 agonists, healing peptides, nootropics, and longevity compounds. Free open reference.',
  },
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
