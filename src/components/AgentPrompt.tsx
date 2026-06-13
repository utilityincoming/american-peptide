'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight } from 'lucide-react'

// Prominent entry point to the Peptide Agent. Type a question and it hands off
// to /research?q=… which auto-asks on load. The lead feature of the research
// section.

const EXAMPLES = [
  'What is the best-studied peptide for muscle preservation during GLP-1 weight loss?',
  'How do I read a peptide certificate of analysis?',
  'Compare semaglutide and tirzepatide.',
]

export default function AgentPrompt({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [q, setQ] = useState('')

  function ask(question: string) {
    const text = question.trim()
    if (!text) return
    router.push(`/research?q=${encodeURIComponent(text)}`)
  }

  return (
    <section
      className={
        'overflow-hidden rounded-3xl border border-[#2DD4A8]/25 bg-gradient-to-br from-[#2DD4A8]/[0.10] via-[#2DD4A8]/[0.04] to-transparent p-6 md:p-8 ' +
        className
      }
    >
      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
        <Sparkles className="h-3.5 w-3.5" />
        Peptide Agent
      </div>
      <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        Ask anything about peptide research
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
        Mechanisms, comparisons, clinical evidence, synthesis, certificates of analysis — citation-backed
        answers grounded in PubMed, PubChem, and ClinicalTrials.gov.
      </p>

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
          className="flex-1 rounded-xl border border-white/[0.10] bg-[#0B1220]/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#2DD4A8]/40 focus:outline-none"
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
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => ask(ex)}
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-left text-xs text-white/50 transition-colors hover:border-[#2DD4A8]/30 hover:text-white/80"
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  )
}
