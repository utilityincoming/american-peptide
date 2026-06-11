'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileSearch,
  Info,
  Lock,
  MinusCircle,
  Send,
  ShieldCheck,
  Upload,
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

// The transparency checklist, disclosed on the page so the grade is auditable.
const RUBRIC: { label: string; weight: number }[] = [
  { label: 'Purity (HPLC)', weight: 2 },
  { label: 'Identity — mass spectrometry', weight: 2 },
  { label: 'Peptide / net content', weight: 2 },
  { label: 'Water content (Karl Fischer)', weight: 1 },
  { label: 'Counterion (acetate / TFA)', weight: 1 },
  { label: 'Endotoxin / sterility', weight: 1 },
  { label: 'Lot, dates & traceability', weight: 1 },
  { label: 'Test methods named', weight: 1 },
]

// Extract text from a PDF entirely in the browser (pdfjs is lazy-loaded so it
// never weighs down the initial page). The worker is pulled from a CDN matching
// the installed version. Scanned/image-only PDFs yield no text — handled above.
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  const data = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data }).promise
  let out = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    out += content.items.map((it) => (it as { str?: string }).str ?? '').join(' ') + '\n'
  }
  return out.trim()
}

function reportToText(r: CoaReport): string {
  const lines: string[] = ['Peptide COA analysis — AmericanPeptide.com', '']
  if (r.detectedPeptide) lines.push(`Identified: ${r.detectedPeptide.name}`)
  lines.push(`Transparency grade: ${r.score.grade} (${r.score.percent}%)`, r.score.summary, '', 'Checklist:')
  for (const f of r.fields)
    lines.push(`  [${f.status === 'good' ? 'x' : ' '}] ${f.label}${f.value ? `: ${f.value}` : ''}`)
  if (r.catalogChecks.length) {
    lines.push('', 'Identity cross-check vs verified reference:')
    for (const c of r.catalogChecks) lines.push(`  ${c.label}: COA ${c.claimed} vs ${c.reference} — ${c.verdict}`)
  }
  if (r.redFlags.length) {
    lines.push('', 'Red flags:')
    for (const f of r.redFlags) lines.push(`  - ${f}`)
  }
  lines.push('', r.supplierRequest, '', 'Graded free at https://www.americanpeptide.com/tools/coa-decoder')
  return lines.join('\n')
}

export default function CoaDecoderPage() {
  const [text, setText] = useState('')
  const [report, setReport] = useState<CoaReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileBusy, setFileBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setReport(null)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    try {
      setFileBusy(true)
      if (isPdf) {
        const extracted = await extractPdfText(file)
        if (extracted.length < 20) {
          setError(
            'Could not read text from that PDF — it may be a scanned image. Paste the COA text instead.',
          )
          return
        }
        setText(extracted)
      } else {
        setText((await file.text()).slice(0, 20000))
      }
    } catch {
      setError('Could not read that file. Paste the COA text instead.')
    } finally {
      setFileBusy(false)
    }
  }

  async function copy(kind: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleFile(e.dataTransfer.files?.[0])
              }}
              className="relative"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your Certificate of Analysis text here — or drop a PDF / click Upload."
                rows={10}
                className="w-full resize-y rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-sm text-white/85 placeholder:text-white/25 focus:border-[#2DD4A8]/40 focus:outline-none"
              />
              {fileBusy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#0B1220]/70 text-sm text-white/70">
                  Reading file…
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
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
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
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

            <details className="group mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-xs font-medium text-white/50 hover:text-white/75">
                How this grade is calculated
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-white/[0.06] px-4 py-3 text-xs leading-relaxed text-white/45">
                <p className="mb-2.5">
                  Each transparency item present on the COA earns its weight; the score is the sum over the
                  maximum. Grades: A ≥85% · B ≥70% · C ≥55% · D ≥40% · F below.
                </p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {RUBRIC.map((r) => (
                    <li key={r.label} className="flex items-center justify-between gap-2 font-mono text-[11px]">
                      <span>{r.label}</span>
                      <span className="text-white/30">×{r.weight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
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
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <button
                    onClick={() => copy('report', reportToText(report))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {copied === 'report' ? <Check className="h-3.5 w-3.5 text-[#2DD4A8]" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'report' ? 'Copied' : 'Copy full report'}
                  </button>
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

              {/* Supplier request — operationalize the gaps */}
              {report.missing.length > 0 && (
                <div className="rounded-2xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-6">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Send className="h-4 w-4 text-[#2DD4A8]" />
                    <h2 className="text-sm font-semibold">Ask your supplier</h2>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-white/65">{report.supplierRequest}</p>
                  <button
                    onClick={() => copy('supplier', report.supplierRequest)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1.5 text-xs font-medium text-[#2DD4A8] transition-colors hover:bg-[#2DD4A8]/[0.14]"
                  >
                    {copied === 'supplier' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'supplier' ? 'Copied' : 'Copy supplier request'}
                  </button>
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
                            {f.action && (
                              <p className="mt-1 text-[11px] text-white/35">
                                Ask the supplier for {f.action}.
                              </p>
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
