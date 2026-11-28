import type { Metadata } from 'next'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'

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
    </>
  )
}
