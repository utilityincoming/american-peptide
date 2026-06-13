'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

interface PopularQuestion {
  text: string
  count: number
}

/**
 * The dynamic half of the homepage FAQ: the most-asked Peptide Agent questions,
 * sourced from real usage. Rendered client-side (so it stays out of the static
 * HTML and the FAQPage JSON-LD) and self-hiding when there's nothing popular yet
 * — a fresh deploy shows nothing here until usage accrues. Each question opens
 * the Agent for a live, cited answer rather than showing a pre-generated one.
 */
export default function DynamicFaqs() {
  const [questions, setQuestions] = useState<PopularQuestion[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/faqs/dynamic')
      .then((r) => (r.ok ? r.json() : { questions: [] }))
      .then((d) => {
        if (!cancelled && Array.isArray(d?.questions)) setQuestions(d.questions)
      })
      .catch(() => {
        /* the dynamic group is supplementary — fail silently */
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (questions.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
        <MessageCircle className="h-4 w-4 text-[#2DD4A8]" />
        What researchers are asking the Agent
      </h3>
      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <Link
            key={q.text}
            href={`/research?q=${encodeURIComponent(q.text)}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-white/70 transition-colors hover:border-[#2DD4A8]/25 hover:bg-white/[0.04] hover:text-white"
          >
            <span>{q.text}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#2DD4A8] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/30">
        Trending Peptide Agent questions — opens the Agent for a live, cited answer.
      </p>
    </div>
  )
}
