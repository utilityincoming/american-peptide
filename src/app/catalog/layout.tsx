import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

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
  // No twitter title/description here on purpose. This layout wraps the catalog
  // index *and* the dynamic children (/catalog/[slug], /category/[id], /compare)
  // that each set their own openGraph but not twitter. Since a twitter object
  // doesn't deep-merge, any title set here would stamp the index's title onto
  // every child's card. Left absent, each page's Twitter card falls back to its
  // own og:title (and the index to this layout's og:title above). Card type and
  // @handle come from the root layout.
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
