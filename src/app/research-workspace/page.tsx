import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResearchWorkspace from '@/components/research-workspace/ResearchWorkspace'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Research Workspace — compare, trials, sequence lab',
  description:
    'Compare catalog peptides, scan ClinicalTrials.gov peptide studies, and calculate sequence properties. Research estimates only — not medical advice. Catalog data CC BY 4.0, AmericanPeptide.com.',
  alternates: { canonical: `${SITE}/research-workspace` },
  openGraph: {
    title: 'Research Workspace — AmericanPeptide.com',
    description:
      'Side-by-side peptide comparison, a clinical-trial pulse, and a live sequence property explorer.',
    url: `${SITE}/research-workspace`,
    type: 'website',
  },
}

export default function ResearchWorkspacePage() {
  return (
    <Suspense fallback={<p className="px-8 py-16 text-sm text-ink/50">Loading the research workspace…</p>}>
      <ResearchWorkspace />
    </Suspense>
  )
}
