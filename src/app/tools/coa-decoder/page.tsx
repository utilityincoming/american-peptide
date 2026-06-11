'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Info,
  Lock,
  MinusCircle,
  ShieldCheck,
} from 'lucide-react'
import type { CoaReport, FieldStatus } from '@/lib/coa'

const SAMPLE_COA = `CERTIFICATE OF ANALYSIS

Product: BPC-157
Lot No.: AP-240517
Date of Manufacture: 2026-05-17
Retest Date: 2028-05-17
Appearance: White lyophilized powder

Purity (RP-HPLC): 98.7 %
Identity (ESI-MS): Observed mass 1419.5; conforms
Net Peptide Content: 82.3 %
Water Content (Karl Fischer): 5.1 %
Acetate Content: 7.4 %

Storage: -20 C, protected from light
Test Methods: RP-HPLC, ESI-MS, Karl Fischer titration`

const STATUS_STYLES: Record<FieldStatus, { icon: typeof CheckCircle2; color: string }> = {
  good: { icon: CheckCircle2, color: 'text-[#2DD4A8]' },
  warn: { icon: AlertTriangle, color: 'text-amber-400' },
  missing: { icon: MinusCircle, color: 'text-white/30' },
  info: { icon: Info, color: 'text-white/45' },
}

function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return 'text-[#2DD4A8] border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08]'
  if (grade === 'C') return 'text-amber-400 border-amber-400/30 bg-amber-400/[0.08]'
  return 'text-red-400 border-red-400/30 bg-red-400/[0.08]'
}

export default function CoaDecoderPage() {
  const [text, setText] = useState('')
  const [report, setReport] = useState<CoaReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/coa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')
      setReport(data as CoaReport)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Breadcrumb */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link href="/tools/reconstitution-calculator" className="text-sm text-white/40 hover:text-white/70">
          Tools
        </Link>
        <span className="text-white/20">/</span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <FileSearch className="h-4 w-4 text-[#2DD4A8]" />
          COA Decoder
        </span>
      </header>

      {/* Hero */}
      <section className="border-b border-white/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Decode &{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#5EEBC8] bg-clip-text text-transparent">
              grade a COA
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55">
            A Certificate of Analysis is what should let you trust a powder you
            cannot see into. Paste one below — every field gets explained in
            plain English, scored against a transparency checklist, and, when we
            recognize the peptide, cross-checked against verified chemistry.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/40">
            <Lock className="h-3.5 w-3.5 text-[#2DD4A8]/70" />
            Analyzed on demand and never stored or logged.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Input */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full text of your Certificate of Analysis here…"
              rows={10}
              className="w-full resize-y rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-sm text-white/85 placeholder:text-white/25 focus:border-[#2DD4A8]/40 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={analyze}
                disabled={loading || text.trim().length < 20}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileSearch className="h-4 w-4" />
                {loading ? 'Analyzing…' : 'Analyze COA'}
              </button>
              <button
                onClick={() => setText(SAMPLE_COA)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                Load sample
              </button>
              {(text || report) && (
                <button
                  onClick={() => {
                    setText('')
                    setReport(null)
                    setError(null)
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/40 transition-colors hover:text-white/70"
                >
                  Clear
                </button>
              )}
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>

          {/* Report */}
          {report && (
            <div className="space-y-6">
              {/* Score */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <div className="flex items-center gap-5">
                  <div
                    className={
                      'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-3xl font-bold ' +
                      gradeColor(report.score.grade)
                    }
                  >
                    {report.score.grade}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-white/80">
                        Transparency score
                      </span>
                      <span className="font-mono text-sm text-white/50">
                        {report.score.points}/{report.score.max} · {report.score.percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2DD4A8] to-[#5EEBC8]"
                        style={{ width: `${report.score.percent}%` }}
                      />
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">{report.score.summary}</p>
                  </div>
                </div>
              </div>

              {/* Detected peptide + catalog cross-check */}
              {report.detectedPeptide && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2DD4A8]" />
                    <h2 className="text-sm font-semibold">
                      Identified as{' '}
                      <Link
                        href={`/catalog/${report.detectedPeptide.slug}`}
                        className="text-[#2DD4A8] underline-offset-2 hover:underline"
                      >
                        {report.detectedPeptide.name}
                      </Link>
                      {report.detectedPeptide.verifiedInCatalog && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-[#2DD4A8]/70">
                          verified reference
                        </span>
                      )}
                    </h2>
                  </div>
                  {report.catalogChecks.length > 0 ? (
                    <div className="space-y-2">
                      {report.catalogChecks.map((c) => (
                        <div
                          key={c.field}
                          className="flex flex-col gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                        >
                          <span className="w-36 shrink-0 text-xs font-medium text-white/45">{c.label}</span>
                          <span className="flex-1 text-sm text-white/70">
                            COA: <span className="font-mono">{c.claimed}</span> · Reference:{' '}
                            <span className="font-mono">{c.reference}</span>
                            <span
                              className={
                                'ml-2 text-xs font-semibold ' +
                                (c.verdict === 'match'
                                  ? 'text-[#2DD4A8]'
                                  : c.verdict === 'mismatch'
                                    ? 'text-red-400'
                                    : 'text-white/40')
                              }
                            >
                              {c.verdict}
                            </span>
                            <span className="mt-0.5 block text-xs text-white/40">{c.note}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/45">
                      No molecular weight / formula / sequence found on the COA to cross-check against the
                      reference.
                    </p>
                  )}
                </div>
              )}

              {/* Red flags */}
              {report.redFlags.length > 0 && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <h2 className="text-sm font-semibold text-red-300">Red flags</h2>
                  </div>
                  <ul className="space-y-2">
                    {report.redFlags.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-white/70">
                        <span className="text-red-400">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Checklist */}
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Transparency checklist
                </h2>
                <div className="space-y-3">
                  {report.fields.map((f) => {
                    const { icon: Icon, color } = STATUS_STYLES[f.status]
                    return (
                      <div
                        key={f.key}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={'mt-0.5 h-4 w-4 shrink-0 ' + color} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-sm font-semibold text-white/85">{f.label}</span>
                              {f.value && (
                                <span className="shrink-0 font-mono text-xs text-white/55">{f.value}</span>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-white/45">{f.explanation}</p>
                            {f.note && (
                              <p className={'mt-1.5 text-xs leading-relaxed ' + color}>{f.note}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-white/30">
                This is a research and educational literacy tool, not lab verification, medical advice, or a
                guarantee of product quality. It reads the text you paste; it cannot detect a falsified COA.
                Always confirm critical material with independent third-party testing.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
