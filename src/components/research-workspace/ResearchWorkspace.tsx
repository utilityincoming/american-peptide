'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ClinicalPulse from './ClinicalPulse'
import WorkspaceErrorBoundary from './WorkspaceErrorBoundary'
import CompareDashboard from './CompareDashboard'
import PeptideForge from './PeptideForge'
import ResearchDisclaimer from './ResearchDisclaimer'
import { filtersFromSearchParams, filtersToSearchParams } from '@/lib/research-workspace/pulse'
import type { PulseFilters, WorkspaceTool } from '@/lib/research-workspace/types'

const TOOLS: { id: WorkspaceTool; label: string; blurb: string }[] = [
  { id: 'compare', label: 'Compare', blurb: 'Two to four catalog peptides, side by side.' },
  { id: 'pulse', label: 'ClinicalPulse', blurb: 'Peptide-related trials from ClinicalTrials.gov.' },
  { id: 'forge', label: 'PeptideForge', blurb: 'Live sequence properties and substitution deltas.' },
]

function toolOf(raw: string | null): WorkspaceTool {
  if (raw === 'pulse' || raw === 'forge' || raw === 'compare') return raw
  return 'compare'
}

export default function ResearchWorkspace() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tool = toolOf(params.get('tool'))
  const ids = (params.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)

  const replace = useCallback(
    (next: URLSearchParams) => {
      const q = next.toString()
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  function setTool(next: WorkspaceTool) {
    const sp = new URLSearchParams(params.toString())
    sp.set('tool', next)
    replace(sp)
  }

  function setIds(next: string[]) {
    const sp = new URLSearchParams(params.toString())
    sp.set('tool', 'compare')
    if (next.length) sp.set('ids', next.join(','))
    else sp.delete('ids')
    replace(sp)
  }

  function setFilters(filters: PulseFilters) {
    replace(new URLSearchParams(filtersToSearchParams(filters, 'pulse')))
  }

  function setSequence(seq: string) {
    const sp = new URLSearchParams(params.toString())
    sp.set('tool', 'forge')
    if (seq) sp.set('seq', seq)
    else sp.delete('seq')
    replace(sp)
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">Research workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Compare, trials, and sequence math</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/60">
          One place for catalog comparisons, a ClinicalTrials.gov slice, and a sequence calculator.
          Numbers are estimates. Sources stay linked: the catalog monograph, PubChem when a CID exists, and the official trial record.
        </p>
        <div className="mt-5">
          <ResearchDisclaimer />
        </div>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Workspace tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tool === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTool(t.id)}
              className={`rounded-full px-4 py-2 text-sm ${tool === t.id ? 'bg-[#7EE0B5] font-semibold text-[#0E1512]' : 'border border-hairline text-ink/70'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/50">{TOOLS.find((t) => t.id === tool)?.blurb}</p>
        <div className="mt-6" role="tabpanel" id={`panel-${tool}`} aria-labelledby={`tab-${tool}`}>
          <WorkspaceErrorBoundary key={tool}>
            {tool === 'compare' && <CompareDashboard ids={ids} onIds={setIds} />}
            {tool === 'pulse' && <ClinicalPulse filters={filtersFromSearchParams(params)} onChange={setFilters} />}
            {tool === 'forge' && <PeptideForge initial={(params.get('seq') ?? '').toUpperCase()} onSequence={setSequence} />}
          </WorkspaceErrorBoundary>
        </div>
      </div>
    </div>
  )
}
