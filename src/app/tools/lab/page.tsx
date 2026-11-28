import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import LabTools from '@/components/lab-tools/LabTools'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'
import RelatedCatalog from '@/components/RelatedCatalog'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Lab tools — COA batch review, catalog feed, sourcing intake',
  description:
    'Research tools for reading certificates of analysis, querying the open catalog with a free API key, and previewing a submission against the published 100-point sourcing standard. Not a store and not medical advice.',
  alternates: { canonical: `${SITE}/tools/lab` },
}

export default function LabToolsPage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Lab tools', path: '/tools/lab' },
  ])
  const jsonLd = webApplicationJsonLd({
    name: 'Lab tools',
    description: 'Batch COA review, catalog feed, and sourcing intake for peptide research.',
    path: '/tools/lab',
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <header className="flex items-center gap-2 border-b border-hairline px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/55 hover:text-ink">Home</Link>
        <span className="text-ink/20">/</span>
        <span className="text-sm font-medium">Lab tools</span>
      </header>
      <Suspense fallback={<p className="px-8 py-16 text-sm text-ink/50">Loading lab tools…</p>}>
        <LabTools />
      </Suspense>
      <RelatedCatalog slugs={['bpc-157', 'tb-500', 'semaglutide', 'ghk-cu']} heading="Use with these peptides" />
    </>
  )
}
