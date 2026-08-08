'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight } from 'lucide-react'

// Prominent entry point to the Peptide Agent. Type a question and it hands off
// to /research?q=… which auto-asks on load. The lead feature of the research
// section.
//
// When dropped on an entity page, pass `context` so the hand-off also carries
// &ctx=kind:slug — the research page then tells the Agent which compound / area
// / comparison the user came from, so bare follow-ups ("what's the dose?")
// resolve correctly.

export type AgentContext = {
  kind: 'compound' | 'research-area' | 'comparison'
  slug: string
}

const DEFAULT_EXAMPLES = [
  'What is the best-studied peptide for muscle preservation during GLP-1 weight loss?',
  'How do I read a peptide certificate of analysis?',
  'Compare semaglutide and tirzepatide.',
]

export default function AgentPrompt({
  className = '',
  context,
  heading = 'Ask anything about peptide research',
  subhead = 'Mechanisms, comparisons, clinical evidence, synthesis, certificates of analysis — citation-backed answers grounded in PubMed, PubChem, and ClinicalTrials.gov.',
  examples = DEFAULT_EXAMPLES,
}: {
  className?: string
  context?: AgentContext
  heading?: string
  subhead?: string
  examples?: string[]
}) {
  const router = useRouter()
  const [q, setQ] = useState('')

  function ask(question: string) {
    const text = question.trim()
    if (!text) return
    const ctx = context ? `&ctx=${encodeURIComponent(`${context.kind}:${context.slug}`)}` : ''
    router.push(`/research?q=${encodeURIComponent(text)}${ctx}`)
  }

  return (
    <section
      className={
        'overflow-hidden rounded-3xl border border-[#2DD4A8]/25 bg-gradient-to-br from-[#2DD4A8]/[0.10] via-[#2DD4A8]/[0.04] to-transparent p-6 md:p-8 ' +
        className
      }
    >
      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
        <Sparkles className="h-3.5 w-3.5" />
        Peptide Agent
      </div>
      <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55">{subhead}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(q)
        }}
        className="mt-5 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about a peptide, mechanism, or indication…"
          className="flex-1 rounded-xl border border-ink/[0.10] bg-surface/60 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-[#2DD4A8]/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!q.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-3 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ask Peptide Agent
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => ask(ex)}
            className="rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1.5 text-left text-xs text-ink/50 transition-colors hover:border-[#2DD4A8]/30 hover:text-ink/80"
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  )
}
