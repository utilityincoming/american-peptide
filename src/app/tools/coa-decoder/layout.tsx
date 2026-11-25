import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'COA Decoder — Read & Grade a Peptide COA',
  description:
    'Paste a peptide Certificate of Analysis and get every field explained — HPLC purity, mass-spec identity, endotoxin — plus a transparency grade. Free.',
  alternates: { canonical: `${SITE}/tools/coa-decoder` },
  openGraph: {
    title: 'COA Decoder — Read & Grade a Peptide Certificate of Analysis',
    description:
      'Decode and grade a peptide COA: purity, identity, net content, endotoxin, and a transparency score. Free.',
    url: `${SITE}/tools/coa-decoder`,
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Peptide COA Decoder',
  url: `${SITE}/tools/coa-decoder`,
  applicationCategory: 'EducationalApplication',
  isAccessibleForFree: true,
  license: 'https://creativecommons.org/licenses/by/4.0/',
  author: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'AmericanPeptide.com', url: SITE },
}

export default function CoaDecoderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
