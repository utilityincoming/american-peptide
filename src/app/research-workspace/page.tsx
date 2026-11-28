import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResearchWorkspace from '@/components/research-workspace/ResearchWorkspace'
import { RESEARCH_WORKSPACE } from '@/lib/page-meta'

export const metadata: Metadata = {
  title: RESEARCH_WORKSPACE.label,
  description: RESEARCH_WORKSPACE.description,
  alternates: { canonical: RESEARCH_WORKSPACE.href },
  openGraph: {
    title: RESEARCH_WORKSPACE.label,
    description: RESEARCH_WORKSPACE.description,
    url: RESEARCH_WORKSPACE.href,
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
