import type { Metadata } from 'next'
import { Suspense } from 'react'
import LabTools from '@/components/lab-tools/LabTools'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Lab tools — COA batch review, catalog feed, sourcing intake',
  description:
    'Research tools for reading certificates of analysis, querying the open catalog with a free API key, and previewing a submission against the published 100-point sourcing standard. Not a store and not medical advice.',
  alternates: { canonical: `${SITE}/tools/lab` },
}

export default function LabToolsPage() {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-sm text-ink/50">Loading lab tools…</p>}>
      <LabTools />
    </Suspense>
  )
}
