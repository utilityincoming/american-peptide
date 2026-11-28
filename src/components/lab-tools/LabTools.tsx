'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ResearchDisclaimer from '@/components/research-workspace/ResearchDisclaimer'
import WorkspaceErrorBoundary from '@/components/research-workspace/WorkspaceErrorBoundary'
import BatchCoa from './BatchCoa'
import CatalogFeed from './CatalogFeed'
import SourcingIntake from './SourcingIntake'

const TABS = [
  { id: 'batch', label: 'Batch COA' },
  { id: 'feed', label: 'Catalog feed' },
  { id: 'intake', label: 'Sourcing intake' },
] as const

type Tab = (typeof TABS)[number]['id']

function tabOf(value: string | null): Tab {
  if (value === 'feed' || value === 'intake' || value === 'batch') return value
  return 'batch'
}

export default function LabTools() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tab = tabOf(params.get('tool'))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="text-xs uppercase tracking-[0.16em] text-accent">Lab and supplier tools</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Read a COA, query the catalog, preview a sourcing submission</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/60">
        These tools do not sell peptides and do not rank products for purchase. Scores use the published COA checklist and the 100-point sourcing standard already on the site.
      </p>
      <div className="mt-5">
        <ResearchDisclaimer />
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Lab tools">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`rounded-full px-4 py-2 text-sm ${tab === item.id ? 'bg-[#7EE0B5] font-semibold text-[#0E1512]' : 'border border-hairline text-ink/70'}`}
            onClick={() => router.replace(`${pathname}?tool=${item.id}`, { scroll: false })}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <WorkspaceErrorBoundary key={tab}>
          {tab === 'batch' && <BatchCoa />}
          {tab === 'feed' && <CatalogFeed />}
          {tab === 'intake' && <SourcingIntake />}
        </WorkspaceErrorBoundary>
      </div>
    </div>
  )
}
