'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileSearch,
  FlaskConical,
  Info,
  Lock,
  MinusCircle,
  Send,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import {
  analyzeCoa,
  buildCoaTextFromQuickEntry,
  type CoaReport,
  type FieldStatus,
  type QuickEntryCoaInput,
} from '@/lib/coa'
import { LISTED_PEPTIDES } from '@/lib/peptides'
import { extractPdfText, SCANNED_PDF_MIN_NON_WS_CHARS } from '@/lib/coa-pdf'

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

// A disulfide peptide (oxytocin) — a strong COA on the generic fields, yet it
// never verifies the disulfide bond or the C-terminal amide, so it showcases the
// peptide-specific "tests that matter" section flagging those gaps.
const SAMPLE_COA_DISULFIDE = `CERTIFICATE OF ANALYSIS

Product: Oxytocin (acetate)
Lot No.: AP-260714
Date of Manufacture: 2026-07-14
Retest Date: 2028-07-14
Appearance: White lyophilized powder

Purity (RP-HPLC): 98.4 %
Identity (ESI-MS): Observed mass 1007.4; conforms
Net Peptide Content: 84.6 %
Water Content (Karl Fischer): 4.8 %
Acetate Content: 8.1 %

Storage: -20 C, protected from light
Test Methods: RP-HPLC, ESI-MS, Karl Fischer titration`

const STATUS_STYLES: Record<FieldStatus, { icon: typeof CheckCircle2; color: string }> = {
  good: { icon: CheckCircle2, color: 'text-accent' },
  warn: { icon: AlertTriangle, color: 'text-amber-400' },
  missing: { icon: MinusCircle, color: 'text-ink/55' },
  info: { icon: Info, color: 'text-ink/55' },
}

function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return 'text-accent border-accent/30 bg-accent/[0.08]'
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

async function extractPdfContent(file: File): Promise<{ text: string; nonWsCount: number; pdfBuffer: ArrayBuffer }> {
  const pdfBuffer = await file.arrayBuffer()
  const extracted = await extractPdfText(new File([pdfBuffer], file.name, { type: file.type }))
  return { ...extracted, pdfBuffer }
}

async function renderPdfPage1ToCanvas(
  pdfBuffer: ArrayBuffer,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  const doc = await pdfjs.getDocument({ data: pdfBuffer.slice(0) }).promise
  const page = await doc.getPage(1)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = Math.min(2.0, Math.max(1.1, 760 / Math.max(1, baseViewport.width)))
  const viewport = page.getViewport({ scale })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const canvasContext = canvas.getContext('2d')
  if (!canvasContext) return
  await page.render({ canvasContext, canvas, viewport }).promise
}

function reportToText(r: CoaReport): string {
  const lines: string[] = ['Peptide COA analysis — AmericanPeptide.com', '']
  if (r.detectedPeptide) lines.push(`Identified: ${r.detectedPeptide.name}`)
  lines.push(`Transparency grade: ${r.score.grade} (${r.score.percent}%)`, r.score.summary, '', 'Checklist:')
  for (const f of r.fields)
    lines.push(`  [${f.status === 'good' ? 'x' : ' '}] ${f.label}${f.value ? `: ${f.value}` : ''}`)
  if (r.catalogChecks.length) {
    lines.push('', 'Identity cross-check vs verified reference:')
    for (const c of r.catalogChecks) {
      const species = c.msMatch?.speciesLabel ? ` [${c.msMatch.speciesLabel}]` : ''
      lines.push(`  ${c.label}: COA ${c.claimed} vs ${c.reference} — ${c.verdict}${species}`)
      lines.push(`    ${c.note}`)
    }
  }
  if (r.featureChecks.length) {
    lines.push('', 'Tests that matter for this peptide:')
    for (const c of r.featureChecks)
      lines.push(`  [${c.mentioned ? 'x' : ' '}] ${c.label}${c.mentioned ? '' : ' — not mentioned on this COA'}`)
  }
  if (r.redFlags.length) {
    lines.push('', 'Red flags:')
    for (const f of r.redFlags) lines.push(`  - ${f}`)
  }
  lines.push('', r.supplierRequest, '', 'Graded free at https://americanpeptide.com/tools/coa-decoder')
  return lines.join('\n')
}

const EMPTY_QUICK_ENTRY: QuickEntryCoaInput = {
  peptideName: '',
  purityPct: '',
  observedMassDa: '',
  counterion: 'Acetate',
  waterPct: '',
  netContentPct: '',
  endotoxinEu: '',
  labName: '',
  batchOrTaskId: '',
}

export default function CoaDecoderPage() {
  const [text, setText] = useState('')
  const [report, setReport] = useState<CoaReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileBusy, setFileBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Scanned-PDF fallback state: client-only page-1 <canvas> preview + inline quick-entry drawer
  const [scannedPdfBuffer, setScannedPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [scannedPdfName, setScannedPdfName] = useState<string | null>(null)
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false)
  const [quickEntry, setQuickEntry] = useState<QuickEntryCoaInput>(EMPTY_QUICK_ENTRY)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!scannedPdfBuffer || !quickDrawerOpen || !previewCanvasRef.current) return
    let cancelled = false
    void (async () => {
      try {
        if (!cancelled && previewCanvasRef.current) {
          await renderPdfPage1ToCanvas(scannedPdfBuffer, previewCanvasRef.current)
        }
      } catch {
        // Preview rendering is best-effort; the manual quick-entry drawer still works.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [scannedPdfBuffer, quickDrawerOpen])

  function updateQuickField<K extends keyof QuickEntryCoaInput>(key: K, value: string) {
    setQuickEntry((prev) => ({ ...prev, [key]: value }))
  }

  function gradeFromQuickEntry() {
    setError(null)
    const synthesized = buildCoaTextFromQuickEntry(quickEntry)
    setText(synthesized)
    setReport(analyzeCoa(synthesized))
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setReport(null)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    try {
      setFileBusy(true)
      if (isPdf) {
        const { text: extracted, nonWsCount, pdfBuffer } = await extractPdfContent(file)
        if (nonWsCount < SCANNED_PDF_MIN_NON_WS_CHARS) {
          setScannedPdfBuffer(pdfBuffer)
          setScannedPdfName(file.name)
          setQuickDrawerOpen(true)
          const stem = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim()
          const matchedCatalog = LISTED_PEPTIDES.find(
            (p) =>
              stem.toLowerCase().includes(p.slug.replace(/-/g, ' ')) ||
              stem.toLowerCase().includes(p.name.toLowerCase()),
          )
          if (matchedCatalog) {
            setQuickEntry((prev) => ({
              ...prev,
              peptideName: prev.peptideName || matchedCatalog.name,
            }))
          }
          return
        }
        setScannedPdfBuffer(null)
        setScannedPdfName(null)
        setQuickDrawerOpen(false)
        setText(extracted)
      } else {
        setScannedPdfBuffer(null)
        setScannedPdfName(null)
        setQuickDrawerOpen(false)
        setText((await file.text()).slice(0, 20000))
      }
    } catch {
      setError('Could not read that file. Paste the COA text or use the manual quick-entry drawer below.')
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
      // Deterministic client-side grading — never sends raw COA text to /api/chat.
      setReport(analyzeCoa(text))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Breadcrumb */}
      <header className="flex items-center gap-2 border-b border-hairline px-4 py-3 md:px-6">
        <Link href="/tools/reconstitution-calculator" className="text-sm text-ink/55 hover:text-ink/70">
          Tools
        </Link>
        <span className="text-ink/20">/</span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <FileSearch className="h-4 w-4 text-accent" />
          COA Decoder
        </span>
      </header>

      {/* Hero */}
      <section className="border-b border-hairline px-6 py-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Decode &{' '}
            <span className="bg-gradient-to-r from-[#7EE0B5] to-[#D2FBE6] bg-clip-text text-transparent">
              grade a COA
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55">
            A Certificate of Analysis is what should let you trust a powder you
            cannot see into. Paste one below — every field gets explained in
            plain English, scored against a transparency checklist, and, when we
            recognize the peptide, cross-checked against verified chemistry.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink/55">
            <Lock className="h-3.5 w-3.5 text-accent/70" />
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
                className="w-full resize-y rounded-2xl border border-hairline bg-fill p-4 font-mono text-sm text-ink/85 placeholder:text-ink/25 focus:border-accent/40 focus:outline-none"
              />
              {fileBusy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface/70 text-sm text-ink/70">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7EE0B5] px-5 py-2.5 text-sm font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileSearch className="h-4 w-4" />
                {loading ? 'Analyzing…' : 'Analyze COA'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </button>
              <button
                onClick={() => setQuickDrawerOpen((v) => !v)}
                className="rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
              >
                {quickDrawerOpen ? 'Hide quick-entry drawer' : 'Scanned COA quick-entry'}
              </button>
              <button
                onClick={() => setText(SAMPLE_COA)}
                className="rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
              >
                Load sample
              </button>
              <button
                onClick={() => setText(SAMPLE_COA_DISULFIDE)}
                className="rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
              >
                Disulfide sample
              </button>
              {(text || report || scannedPdfBuffer) && (
                <button
                  onClick={() => {
                    setText('')
                    setReport(null)
                    setError(null)
                    setScannedPdfBuffer(null)
                    setScannedPdfName(null)
                    setQuickDrawerOpen(false)
                    setQuickEntry(EMPTY_QUICK_ENTRY)
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink/55 transition-colors hover:text-ink/70"
                >
                  Clear
                </button>
              )}
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            {/* Scanned-PDF Graceful Fallback: Client-only <canvas> preview of page 1 + inline manual quick-entry drawer */}
            {quickDrawerOpen && (
              <div className="mt-5 rounded-2xl border border-accent/30 bg-fill p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      <h2 className="text-sm font-semibold text-ink/90">
                        {scannedPdfBuffer
                          ? `Scanned PDF detected${scannedPdfName ? ` (${scannedPdfName})` : ''} — Manual Quick-Entry`
                          : 'Manual COA Quick-Entry Drawer'}
                      </h2>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink/55">
                      {scannedPdfBuffer
                        ? 'This PDF has fewer than 40 selectable characters (likely a scanned image). Page 1 is rendered locally below — never uploaded or logged. Enter the key figures from the certificate to grade and cross-check it deterministically.'
                        : 'Transcribe the key figures from a scanned or image-only certificate to grade it against the transparency checklist and salt-aware MS reference.'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-accent">
                    <Lock className="h-3 w-3" />
                    Client-only · 0 bytes uploaded
                  </span>
                </div>

                <div className={scannedPdfBuffer ? 'grid gap-6 lg:grid-cols-2' : ''}>
                  {scannedPdfBuffer && (
                    <div className="overflow-hidden rounded-xl border border-hairline bg-surface p-3">
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
                        Page 1 local preview (canvas)
                      </p>
                      <div className="max-h-[520px] overflow-auto rounded-lg border border-hairline bg-white/95 p-2">
                        <canvas
                          ref={previewCanvasRef}
                          aria-label="Scanned COA PDF page 1 preview"
                          className="mx-auto block h-auto max-w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Compound / Peptide
                        </span>
                        <input
                          type="text"
                          list="coa-catalog-peptides"
                          value={quickEntry.peptideName ?? ''}
                          onChange={(e) => updateQuickField('peptideName', e.target.value)}
                          placeholder="e.g. BPC-157 or GHK-Cu"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                        <datalist id="coa-catalog-peptides">
                          {LISTED_PEPTIDES.map((p) => (
                            <option key={p.slug} value={p.name} />
                          ))}
                        </datalist>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          HPLC Purity (%)
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quickEntry.purityPct ?? ''}
                          onChange={(e) => updateQuickField('purityPct', e.target.value)}
                          placeholder="e.g. 99.1"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Observed MS (Da or m/z)
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quickEntry.observedMassDa ?? ''}
                          onChange={(e) => updateQuickField('observedMassDa', e.target.value)}
                          placeholder="e.g. 1419.5 or 710.8"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Stated Counterion / Salt
                        </span>
                        <select
                          value={quickEntry.counterion ?? 'Acetate'}
                          onChange={(e) => updateQuickField('counterion', e.target.value)}
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-ink/85 focus:border-accent/40 focus:outline-none"
                        >
                          <option value="Acetate">Acetate</option>
                          <option value="TFA">TFA (Trifluoroacetate)</option>
                          <option value="None">Not stated on COA</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Net Peptide Content (%)
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quickEntry.netContentPct ?? ''}
                          onChange={(e) => updateQuickField('netContentPct', e.target.value)}
                          placeholder="e.g. 84.2 (leave blank if omitted)"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Water Content (%)
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quickEntry.waterPct ?? ''}
                          onChange={(e) => updateQuickField('waterPct', e.target.value)}
                          placeholder="e.g. 4.8 (leave blank if omitted)"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Endotoxin (EU/mg)
                        </span>
                        <input
                          type="text"
                          value={quickEntry.endotoxinEu ?? ''}
                          onChange={(e) => updateQuickField('endotoxinEu', e.target.value)}
                          placeholder="e.g. <0.5 (leave blank if omitted)"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-ink/70">
                          Testing Lab Name
                        </span>
                        <input
                          type="text"
                          value={quickEntry.labName ?? ''}
                          onChange={(e) => updateQuickField('labName', e.target.value)}
                          placeholder="e.g. Janoshik or MZ Biolabs"
                          className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-ink/70">
                        Batch / Lot / Task ID
                      </span>
                      <input
                        type="text"
                        value={quickEntry.batchOrTaskId ?? ''}
                        onChange={(e) => updateQuickField('batchOrTaskId', e.target.value)}
                        placeholder="e.g. AP-240517 or Task #48219"
                        className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-sm text-ink/85 placeholder:text-ink/30 focus:border-accent/40 focus:outline-none"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={gradeFromQuickEntry}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#7EE0B5] px-4 py-2 text-xs font-semibold text-[#0E1512] transition-colors hover:bg-[#A6F0CC]"
                      >
                        <FileSearch className="h-3.5 w-3.5" />
                        Grade & Cross-Check Quick Entry
                      </button>
                      <span className="text-[11px] text-ink/50">
                        Populates the COA text box and runs the salt-aware MS cross-check.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <details className="group mt-4 rounded-xl border border-hairline bg-fill [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-xs font-medium text-ink/50 hover:text-ink/75">
                How this grade is calculated
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-hairline px-4 py-3 text-xs leading-relaxed text-ink/55">
                <p className="mb-2.5">
                  Each transparency item present on the COA earns its weight; the score is the sum over the
                  maximum. Grades: A ≥85% · B ≥70% · C ≥55% · D ≥40% · F below.
                </p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {RUBRIC.map((r) => (
                    <li key={r.label} className="flex items-center justify-between gap-2 font-mono text-[11px]">
                      <span>{r.label}</span>
                      <span className="text-ink/55">×{r.weight}</span>
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
              <div className="rounded-2xl border border-hairline bg-fill p-6">
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
                      <span className="text-sm font-semibold text-ink/80">
                        Transparency score
                      </span>
                      <span className="font-mono text-sm text-ink/50">
                        {report.score.points}/{report.score.max} · {report.score.percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-fill-strong">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7EE0B5] to-[#D2FBE6]"
                        style={{ width: `${report.score.percent}%` }}
                      />
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink/55">{report.score.summary}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-hairline pt-4">
                  <button
                    onClick={() => copy('report', reportToText(report))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
                  >
                    {copied === 'report' ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'report' ? 'Copied' : 'Copy full report'}
                  </button>
                </div>
              </div>

              {/* Detected peptide + catalog cross-check */}
              {report.detectedPeptide && (
                <div className="rounded-2xl border border-hairline bg-fill p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold">
                      Identified as{' '}
                      <Link
                        href={`/catalog/${report.detectedPeptide.slug}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {report.detectedPeptide.name}
                      </Link>
                      {report.detectedPeptide.verifiedInCatalog && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-accent/70">
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
                          className="flex flex-col gap-1 rounded-lg border border-hairline bg-fill px-3 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                        >
                          <span className="w-36 shrink-0 text-xs font-medium text-ink/55">{c.label}</span>
                          <span className="flex-1 text-sm text-ink/70">
                            COA: <span className="font-mono">{c.claimed}</span> · Reference:{' '}
                            <span className="font-mono">{c.reference}</span>
                            <span
                              className={
                                'ml-2 text-xs font-semibold ' +
                                (c.verdict === 'match'
                                  ? 'text-accent'
                                  : c.verdict === 'mismatch'
                                    ? 'text-red-400'
                                    : 'text-ink/55')
                              }
                            >
                              {c.verdict}
                            </span>
                            {c.msMatch && c.msMatch.matched && (
                              <span className="ml-2 inline-flex items-center rounded-full border border-accent/25 bg-accent/[0.08] px-2 py-0.5 font-mono text-[10px] font-medium text-accent">
                                {c.msMatch.speciesLabel}
                              </span>
                            )}
                            <span className="mt-0.5 block text-xs text-ink/55">{c.note}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink/55">
                      No molecular weight / formula / sequence found on the COA to cross-check against the
                      reference.
                    </p>
                  )}
                </div>
              )}

              {/* Peptide-specific tests from synthetic features */}
              {report.featureChecks.length > 0 && (
                <div className="rounded-2xl border border-hairline bg-fill p-6">
                  <div className="mb-1.5 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold">
                      Tests that matter for this peptide
                    </h2>
                  </div>
                  <p className="mb-4 text-xs leading-relaxed text-ink/55">
                    Mass spec confirms the target mass, but this molecule&apos;s
                    structure calls for checks a mass number can&apos;t cover. We
                    flag whether the COA appears to address each.
                  </p>
                  <div className="space-y-3">
                    {report.featureChecks.map((c) => {
                      const Icon = c.mentioned ? CheckCircle2 : AlertTriangle
                      const color = c.mentioned ? 'text-accent' : 'text-amber-400'
                      return (
                        <div
                          key={c.feature}
                          className="rounded-xl border border-hairline bg-fill p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={'mt-0.5 h-4 w-4 shrink-0 ' + color} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm font-semibold text-ink/85">
                                  {c.label}
                                </span>
                                <span
                                  className={
                                    'shrink-0 text-[10px] font-semibold uppercase tracking-wider ' +
                                    color
                                  }
                                >
                                  {c.mentioned ? 'addressed' : 'not mentioned'}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-ink/55">
                                {c.whatToCheck}
                              </p>
                              {!c.mentioned && (
                                <p className="mt-1 text-[11px] text-ink/55">
                                  Ask the supplier for {c.action}.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-ink/55">
                    A keyword read of the pasted text, not lab verification — a
                    COA may cover a test under wording we don&apos;t recognize.
                    Use this to know what to look for and ask about.
                  </p>
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
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink/70">
                        <span className="text-red-400">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supplier request — operationalize the gaps */}
              {report.missing.length > 0 && (
                <div className="rounded-2xl border border-accent/20 bg-accent/[0.05] p-6">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Send className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold">Ask your supplier</h2>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-ink/65">{report.supplierRequest}</p>
                  <button
                    onClick={() => copy('supplier', report.supplierRequest)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-accent/[0.08] px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/[0.14]"
                  >
                    {copied === 'supplier' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'supplier' ? 'Copied' : 'Copy supplier request'}
                  </button>
                </div>
              )}

              {/* Checklist */}
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Transparency checklist
                </h2>
                <div className="space-y-3">
                  {report.fields.map((f) => {
                    const { icon: Icon, color } = STATUS_STYLES[f.status]
                    return (
                      <div
                        key={f.key}
                        className="rounded-xl border border-hairline bg-fill p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={'mt-0.5 h-4 w-4 shrink-0 ' + color} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-sm font-semibold text-ink/85">{f.label}</span>
                              {f.value && (
                                <span className="shrink-0 font-mono text-xs text-ink/55">{f.value}</span>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-ink/55">{f.explanation}</p>
                            {f.note && (
                              <p className={'mt-1.5 text-xs leading-relaxed ' + color}>{f.note}</p>
                            )}
                            {f.action && (
                              <p className="mt-1 text-[11px] text-ink/55">
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

              <p className="text-xs leading-relaxed text-ink/55">
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
