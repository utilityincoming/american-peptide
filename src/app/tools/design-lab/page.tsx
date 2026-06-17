'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dna,
  Shuffle,
  Trash2,
  Share2,
  Check,
  Save,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Loader2,
  Atom,
} from 'lucide-react'
import {
  AMINO_ACIDS,
  AA_CATEGORIES,
  sequenceStats,
  toThreeLetter,
} from '@/lib/amino-acids'
import {
  chargeAtPH,
  isoelectricPoint,
  extinctionCoefficient,
  a280Point1pct,
  sanitizeSequence,
  synthesisDifficulty,
  type FlagLevel,
} from '@/lib/peptide-properties'
import { PEPTIDES } from '@/lib/peptides'

const FLAG_DOT: Record<FlagLevel, string> = {
  info: 'bg-ink/30',
  caution: 'bg-amber-400',
  warn: 'bg-red-400',
}

const SCORE_CHIP: Record<string, string> = {
  straightforward: 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.10] text-accent',
  moderate: 'border-amber-500/30 bg-amber-500/[0.10] text-amber-400',
  challenging: 'border-red-500/30 bg-red-500/[0.10] text-red-400',
}

const SAVE_KEY = 'amp-design-lab-saved'

// 3Dmol.js is loaded on demand from CDN (only when the user predicts a
// structure) — this is a beta, online-only page, so no offline concern.
type Mol3DViewer = {
  addModel: (data: string, format: string) => void
  setStyle: (sel: Record<string, unknown>, style: Record<string, unknown>) => void
  zoomTo: () => void
  render: () => void
  spin: (axis: string) => void
}
type Mol3D = {
  createViewer: (el: HTMLElement, config?: Record<string, unknown>) => Mol3DViewer
}
declare global {
  interface Window {
    $3Dmol?: Mol3D
  }
}

let molPromise: Promise<Mol3D> | null = null
function load3Dmol(): Promise<Mol3D> {
  if (typeof window !== 'undefined' && window.$3Dmol) return Promise.resolve(window.$3Dmol)
  if (molPromise) return molPromise
  molPromise = new Promise<Mol3D>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://3Dmol.org/build/3Dmol-min.js'
    s.async = true
    s.onload = () =>
      window.$3Dmol ? resolve(window.$3Dmol) : reject(new Error('3D viewer failed to initialize.'))
    s.onerror = () => {
      molPromise = null
      reject(new Error('Could not load the 3D viewer.'))
    }
    document.head.appendChild(s)
  })
  return molPromise
}

const PRESETS = PEPTIDES.filter((p) => p.sequence)
  .map((p) => ({ name: p.name, slug: p.slug, seq: sanitizeSequence(p.sequence ?? '') }))
  .filter((p) => p.seq.length >= 2)
  .sort((a, b) => a.name.localeCompare(b.name))

const TOOLS = [
  {
    name: 'AlphaFold Server',
    href: 'https://alphafoldserver.com/',
    desc: '3D structure prediction',
  },
  {
    name: 'RFdiffusion',
    href: 'https://github.com/RosettaCommons/RFdiffusion',
    desc: 'De novo backbone design',
  },
  {
    name: 'ProteinMPNN',
    href: 'https://github.com/dauparas/ProteinMPNN',
    desc: 'Inverse folding / sequence design',
  },
  {
    name: 'ExPASy ProtParam',
    href: 'https://web.expasy.org/protparam/',
    desc: 'Independent property cross-check',
  },
]

const PIPELINE = [
  'Define goal',
  'Predict properties',
  '3D structure',
  'Optimize sequence',
  'Validate folding',
  'Lab synthesis',
]

function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export default function DesignLabPage() {
  const [seq, setSeq] = useState('GEPPPGKPADDAGLV')
  const [ph, setPh] = useState(7.4)
  const [saved, setSaved] = useState<{ seq: string; ts: number }[]>([])
  const [copied, setCopied] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [folding, setFolding] = useState(false)
  const [foldError, setFoldError] = useState<string | null>(null)
  const [hasStructure, setHasStructure] = useState(false)
  const viewerRef = useRef<HTMLDivElement | null>(null)

  // Load saved designs + any shared-link state.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setSaved(parsed)
      }
    } catch {
      /* ignore */
    }
    const p = new URLSearchParams(window.location.search)
    const s = p.get('s')
    const phQ = p.get('p')
    if (s) setSeq(sanitizeSequence(s))
    if (phQ && Number.isFinite(parseFloat(phQ))) {
      setPh(Math.min(14, Math.max(0, parseFloat(phQ))))
    }
  }, [])

  const codes = useMemo(() => seq.split(''), [seq])
  const stats = useMemo(() => sequenceStats(codes), [codes])
  const charge = useMemo(() => chargeAtPH(codes, ph), [codes, ph])
  const pI = useMemo(() => isoelectricPoint(codes), [codes])
  const ext = useMemo(() => extinctionCoefficient(codes), [codes])
  const a280 = a280Point1pct(ext.reduced, stats.mass)
  const difficulty = useMemo(() => synthesisDifficulty(codes), [codes])

  const append = (code: string) => setSeq((s) => s + code)
  const clear = () => setSeq('')
  const randomize = () => {
    const len = 5 + Math.floor(Math.random() * 8)
    let s = ''
    for (let i = 0; i < len; i++)
      s += AMINO_ACIDS[Math.floor(Math.random() * AMINO_ACIDS.length)].code
    setSeq(s)
  }

  const save = () => {
    if (!seq) return
    setSaved((prev) => {
      const next = [{ seq, ts: Date.now() }, ...prev.filter((x) => x.seq !== seq)].slice(0, 12)
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }
  const removeSaved = (s: string) =>
    setSaved((prev) => {
      const next = prev.filter((x) => x.seq !== s)
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })

  const share = async () => {
    const p = new URLSearchParams({ s: seq, p: String(ph) })
    const url = `${window.location.origin}${window.location.pathname}?${p.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  const analyze = async () => {
    if (codes.length < 2) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const res = await fetch('/api/analyze-peptide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: seq,
          pH: ph,
          properties: {
            Length: stats.length,
            'MW (Da, avg)': Math.round(stats.mass),
            'Net charge': `${charge >= 0 ? '+' : ''}${charge.toFixed(2)} at pH ${ph.toFixed(1)}`,
            'Isoelectric point': pI.toFixed(2),
            GRAVY: stats.gravy.toFixed(2),
            'Extinction e280 (reduced)': ext.reduced,
            Aromatic: stats.aromatic,
            Cysteines: stats.cysteines,
            'Synthesis difficulty (heuristic)': difficulty.score,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalysis(null)
        setAnalysisError(
          typeof data.error === 'string'
            ? data.error.slice(0, 200)
            : 'Analysis failed.',
        )
      } else {
        setAnalysis(data.content)
      }
    } catch {
      setAnalysisError('Network error — please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Reset any rendered structure when the sequence changes.
  useEffect(() => {
    setHasStructure(false)
    setFoldError(null)
    if (viewerRef.current) viewerRef.current.innerHTML = ''
  }, [seq])

  const predictStructure = async () => {
    if (codes.length < 2) return
    setFolding(true)
    setFoldError(null)
    try {
      const res = await fetch('/api/fold-peptide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: seq }),
      })
      const data = await res.json()
      if (!res.ok || !data.pdb) {
        setFoldError(
          typeof data.error === 'string' ? data.error : 'Structure prediction failed.',
        )
        return
      }
      const mol = await load3Dmol()
      const el = viewerRef.current
      if (!el) return
      el.innerHTML = ''
      const viewer = mol.createViewer(el, { backgroundColor: '#0B1220' })
      viewer.addModel(data.pdb, 'pdb')
      viewer.setStyle(
        {},
        { cartoon: { color: 'spectrum' }, stick: { radius: 0.18 } },
      )
      viewer.zoomTo()
      viewer.render()
      setHasStructure(true)
    } catch (err) {
      setFoldError(err instanceof Error ? err.message : 'Structure prediction failed.')
    } finally {
      setFolding(false)
    }
  }

  const cysNote = stats.cysteines >= 2

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
          <Dna className="h-4 w-4 text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium">Design Lab</span>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
          Beta
        </span>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* ── Beta banner ── */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <Dna className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" strokeWidth={1.75} />
          <p className="min-w-0 text-xs leading-relaxed text-ink/55">
            <span className="font-semibold text-amber-300/90">Beta · in development. </span>
            A research-use sequence property calculator. Property values are
            estimates — cross-check before relying on them. Prefer a hands-on,
            gamified build? Try{' '}
            <Link
              href="/compounds/builder"
              className="text-accent underline-offset-2 hover:underline"
            >
              PeptideForge
            </Link>
            .
          </p>
        </div>

        {/* ── Heading ── */}
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Peptide Design Lab
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            Build a sequence, paste one, or load a catalog peptide — then read
            molecular weight, pH-dependent net charge, isoelectric point, GRAVY,
            and the 280&nbsp;nm extinction coefficient in real time.
          </p>
        </div>

        {/* ── Sequence input ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              Sequence
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={randomize}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] px-2.5 py-1.5 text-xs text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Random
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] px-2.5 py-1.5 text-xs text-ink/60 transition-colors hover:border-red-400/30 hover:text-red-400/80"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            value={seq}
            onChange={(e) => setSeq(sanitizeSequence(e.target.value))}
            placeholder="Type or paste single-letter codes, e.g. GEPPPGKPADDAGLV"
            spellCheck={false}
            className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-4 py-3 font-mono text-base tracking-wider text-ink placeholder:text-ink/25 outline-none transition-colors focus:border-[#2DD4A8]/40"
          />

          {/* Catalog presets */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-ink/35">Load from catalog:</span>
            <select
              value=""
              onChange={(e) => {
                const hit = PRESETS.find((p) => p.slug === e.target.value)
                if (hit) setSeq(hit.seq)
              }}
              className="rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-2.5 py-1.5 text-xs text-ink/70 outline-none focus:border-[#2DD4A8]/40"
            >
              <option value="" className="bg-panel">
                Select a peptide… ({PRESETS.length})
              </option>
              {PRESETS.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-panel">
                  {p.name} ({p.seq.length} aa)
                </option>
              ))}
            </select>
          </div>

          {/* Residue palette */}
          <div className="mt-5 space-y-2.5">
            {AA_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-center gap-1.5">
                <span className={`mr-1 w-16 text-[11px] ${cat.text}`}>{cat.label}</span>
                {AMINO_ACIDS.filter((aa) => aa.category === cat.id).map((aa) => (
                  <button
                    key={aa.code}
                    type="button"
                    onClick={() => append(aa.code)}
                    title={`${aa.name} (${aa.three})`}
                    className={`h-8 w-8 rounded-lg border font-mono text-sm transition-colors ${cat.border} ${cat.bg} ${cat.text} ${cat.hoverBg}`}
                  >
                    {aa.code}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── pH slider ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              pH environment
            </h2>
            <span className="font-mono text-sm text-accent">pH {ph.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={14}
            step={0.1}
            value={ph}
            onChange={(e) => setPh(parseFloat(e.target.value))}
            className="w-full accent-[#2DD4A8]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-ink/30">
            <span>0 · acidic</span>
            <span>7.4 · physiological</span>
            <span>14 · basic</span>
          </div>
        </section>

        {/* ── Analysis ── */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Length" value={stats.length ? String(stats.length) : '—'} unit="residues" />
          <StatCard label="Molecular weight" value={fmt(stats.mass)} unit="Da (avg)" highlight />
          <StatCard
            label={`Net charge @ pH ${ph.toFixed(1)}`}
            value={stats.length ? (charge >= 0 ? `+${fmt(charge)}` : fmt(charge)) : '—'}
            unit="e"
            highlight
          />
          <StatCard label="Isoelectric point" value={stats.length ? fmt(pI, 2) : '—'} unit="pI" highlight />
          <StatCard
            label="GRAVY"
            value={stats.length ? fmt(stats.gravy, 2) : '—'}
            unit="hydropathy"
          />
          <StatCard
            label="Extinction ε₂₈₀"
            value={stats.length ? fmt(ext.reduced, 0) : '—'}
            unit={
              cysNote
                ? `M⁻¹cm⁻¹ · ${fmt(ext.cystine, 0)} w/ S–S`
                : 'M⁻¹·cm⁻¹ (reduced)'
            }
          />
          <StatCard label="A280 (0.1%)" value={stats.length ? fmt(a280, 3) : '—'} unit="1 g/L" />
          <StatCard label="Aromatic" value={String(stats.aromatic)} unit="F/W/Y/H" />
          <StatCard
            label="Cysteines"
            value={String(stats.cysteines)}
            unit={cysNote ? `up to ${Math.floor(stats.cysteines / 2)} disulfide(s)` : 'thiols'}
          />
        </section>

        {/* ── Composition + sequence ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Composition
          </h2>
          <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.05]">
            {AA_CATEGORIES.map((cat) => {
              const n = stats.counts[cat.id]
              const pct = stats.length ? (n / stats.length) * 100 : 0
              if (pct <= 0) return null
              return (
                <div
                  key={cat.id}
                  className={cat.solid}
                  style={{ width: `${pct}%` }}
                  title={`${cat.label}: ${n}`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {AA_CATEGORIES.map((cat) => (
              <span key={cat.id} className="inline-flex items-center gap-1.5 text-[11px] text-ink/55">
                <span className={`h-2.5 w-2.5 rounded-sm ${cat.solid}`} />
                {cat.label}: {stats.counts[cat.id]}
              </span>
            ))}
          </div>
          {stats.length > 0 && (
            <p className="mt-4 break-words font-mono text-xs text-ink/45">
              {toThreeLetter(codes)}
            </p>
          )}
        </section>

        {/* ── Synthesis difficulty ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              Synthesis difficulty
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${SCORE_CHIP[difficulty.score]}`}
            >
              {difficulty.score}
            </span>
          </div>
          {difficulty.flags.length === 0 ? (
            <p className="text-sm text-ink/45">
              No major synthesis liabilities flagged for this sequence.
            </p>
          ) : (
            <ul className="space-y-2">
              {difficulty.flags.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${FLAG_DOT[f.level]}`} />
                  <span>
                    <span className="font-medium text-ink/85">{f.label}.</span>{' '}
                    <span className="text-ink/55">{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[10px] leading-relaxed text-ink/30">
            Heuristic estimate from sequence — see the{' '}
            <Link href="/synthesis" className="text-accent/70 hover:text-accent">
              synthesis guide
            </Link>{' '}
            for what drives cost &amp; purity.
          </p>
        </section>

        {/* ── AI analysis ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              AI design analysis
            </h2>
            <button
              type="button"
              onClick={analyze}
              disabled={analyzing || codes.length < 2}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze design
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <p className="mb-2 text-xs leading-relaxed text-amber-400/75">{analysisError}</p>
          )}

          {analysis ? (
            <div className="space-y-2 text-sm leading-relaxed text-ink/70 [&_a]:text-accent [&_a]:underline [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-ink [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-ink/90 [&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-ink/85 [&_strong]:text-ink/90 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
            </div>
          ) : (
            !analyzing && (
              <p className="text-sm leading-relaxed text-ink/45">
                Get a research-framed read on this sequence — charge &amp;
                solubility, stability &amp; synthesis liabilities, and similar
                known peptides. Not medical, dosing, or administration advice.
              </p>
            )
          )}
        </section>

        {/* ── 3D structure ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              3D structure
            </h2>
            <button
              type="button"
              onClick={predictStructure}
              disabled={folding || codes.length < 2}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {folding ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Folding…
                </>
              ) : (
                <>
                  <Atom className="h-3.5 w-3.5" />
                  {hasStructure ? 'Re-predict' : 'Predict structure'}
                </>
              )}
            </button>
          </div>

          {foldError && (
            <p className="mb-2 text-xs leading-relaxed text-amber-400/75">{foldError}</p>
          )}

          <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-ink/[0.07] bg-surface">
            <div ref={viewerRef} className="absolute inset-0" />
            {!hasStructure && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
                {folding ? (
                  <div className="flex flex-col items-center gap-2 text-ink/50">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    <span className="text-xs">
                      Folding with ESMFold — this can take a few seconds…
                    </span>
                  </div>
                ) : (
                  <div className="text-ink/35">
                    <Atom className="mx-auto mb-2 h-6 w-6 text-accent/50" />
                    <p className="text-xs">Predict a 3D structure for this sequence.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasStructure && (
            <p className="mt-2 text-[11px] text-ink/40">
              Drag to rotate · scroll to zoom · colored N→C (spectrum).
            </p>
          )}
          <p className="mt-2 text-[10px] leading-relaxed text-ink/30">
            Structure predicted with{' '}
            <a
              href="https://esmatlas.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/70 hover:text-accent"
            >
              ESMFold
            </a>{' '}
            (Meta) — a computational prediction, not an experimental structure.
            For larger or higher-confidence models, use AlphaFold Server below.
          </p>
        </section>

        {/* ── Save / share ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!seq}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Save className="h-3.5 w-3.5" />
              Save design
            </button>
            <button
              type="button"
              onClick={share}
              disabled={!seq}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Share link'}
            </button>
          </div>

          {saved.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink/35">
                My saved designs
              </p>
              <div className="flex flex-wrap gap-2">
                {saved.map((s) => (
                  <span
                    key={s.ts}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/[0.08] bg-ink/[0.03] py-1 pl-2 pr-1 text-[11px]"
                  >
                    <button
                      type="button"
                      onClick={() => setSeq(s.seq)}
                      title="Load"
                      className="max-w-[140px] truncate font-mono text-ink/70 hover:text-accent"
                    >
                      {s.seq}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSaved(s.seq)}
                      aria-label="Delete"
                      className="rounded p-0.5 text-ink/35 hover:bg-ink/[0.08] hover:text-ink"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Research pipeline + tools ── */}
        <section className="mb-10 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            From design to bench
          </h2>
          <ol className="mb-6 flex flex-wrap items-center gap-2">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={
                    'rounded-lg border px-2.5 py-1.5 text-[11px] ' +
                    (i === 1
                      ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] font-medium text-accent'
                      : 'border-ink/[0.07] bg-ink/[0.02] text-ink/55')
                  }
                >
                  {step}
                  {i === 1 && <span className="ml-1 text-[9px] text-accent/70">you are here</span>}
                </span>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink/20" />
                )}
              </li>
            ))}
          </ol>

          <div className="grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <a
                key={t.href}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3 transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
              >
                <div>
                  <p className="text-sm font-medium text-ink/85">{t.name}</p>
                  <p className="text-[12px] text-ink/45">{t.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-accent/70 transition-colors group-hover:text-accent" />
              </a>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-ink/30">
            External research tools open in a new tab. AmericanPeptide is not
            affiliated with and does not endorse these services.
          </p>
        </section>

        <div className="mb-10 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-amber-400/65">
            <span className="font-semibold text-amber-400/85">Research use only.</span>{' '}
            Computed properties are estimates for educational/research reference,
            not medical advice or an offer for sale. Validate independently.
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? 'border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.04]'
          : 'border-ink/[0.07] bg-ink/[0.025]'
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-xl font-semibold tabular-nums leading-tight md:text-2xl ${
          highlight ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink/40">{unit}</p>
    </div>
  )
}
