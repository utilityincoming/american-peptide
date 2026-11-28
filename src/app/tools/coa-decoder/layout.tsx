import type { Metadata } from 'next'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'
import RelatedCatalog from '@/components/RelatedCatalog'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'COA decoder — purity, identity, endotoxin',
  description:
    'Research tool that explains HPLC purity, mass-spec identity, and endotoxin fields on a peptide COA. Cited reference, not a store.',
  alternates: { canonical: `${SITE}/tools/coa-decoder` },
  openGraph: {
    title: 'COA decoder — purity, identity, endotoxin',
    description:
      'Research tool that explains HPLC purity, mass-spec identity, and endotoxin fields on a peptide COA. Cited reference, not a store.',
    url: `${SITE}/tools/coa-decoder`,
    type: 'website',
  },
}

const jsonLd = webApplicationJsonLd({
  name: 'Peptide COA Decoder',
  description:
    'Paste a peptide Certificate of Analysis and get purity, identity, and endotoxin fields explained.',
  path: '/tools/coa-decoder',
})

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Tools', path: '/tools/reconstitution-calculator' },
  { name: 'COA Decoder', path: '/tools/coa-decoder' },
])

export default function CoaDecoderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
      <RelatedCatalog slugs={['bpc-157', 'tb-500', 'ghk-cu', 'semaglutide']} heading="Use with these peptides" />
    </>
  )
}
