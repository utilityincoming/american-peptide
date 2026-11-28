'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { AA_CATEGORIES, AA_BY_CODE, AMINO_ACIDS, sequenceStats } from '@/lib/amino-acids'
import {
  a280Point1pct,
  chargeAtPH,
  extinctionCoefficient,
  isoelectricPoint,
  sanitizeSequence,
  synthesisDifficulty,
} from '@/lib/peptide-properties'
import { mutationDeltas, sequenceCardMarkdown } from '@/lib/research-workspace/sequence'
import { ChargeChart, HydropathyChart } from './PropertyCharts'

const XP_KEY = 'amp-forge-xp'

export default function PeptideForge({
  initial,
  onSequence,
}: {
  initial: string
  onSequence: (seq: string) => void
}) {
  const [seq, setSeq] = useState(initial)
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState('')
  const [xp, setXp] = useState(0)
  const deferred = useDeferredValue(seq)
  const codes = useMemo(() => sanitizeSequence(deferred).split('').filter(Boolean), [deferred])

  const stats = useMemo(() => sequenceStats(codes), [codes])
  const charge = useMemo(() => chargeAtPH(codes, 7.4), [codes])
  const pi = useMemo(() => (codes.length ? isoelectricPoint(codes) : null), [codes])
  const ext = useMemo(() => extinctionCoefficient(codes), [codes])
  const synth = useMemo(() => synthesisDifficulty(codes), [codes])
  const deltas = useMemo(() => mutationDeltas(codes, Math.min(selected, Math.max(0, codes.length - 1))), [codes, selected])

  function update(next: string) {
    const clean = sanitizeSequence(next)
    setSeq(clean)
    onSequence(clean)
    setSelected((i) => Math.min(i, Math.max(0, clean.length - 1)))
  }

  const challenges = [
    { id: 'len', label: 'Chain of 8 or more residues', done: codes.length >= 8 },
    { id: 'gravy', label: 'Positive GRAVY', done: codes.length > 0 && stats.gravy > 0 },
    { id: 'neutral', label: 'Near-neutral charge at pH 7.4', done: codes.length > 0 && Math.abs(charge) < 0.5 },
  ]
  const earned = challenges.filter((c) => c.done).length

  const card = sequenceCardMarkdown({
    title: 'Sequence card',
    sequence: codes.join(''),
    lines: [
      { label: 'Length', value: String(codes.length) },
      { label: 'Average mass (Da)', value: stats.mass.toFixed(2) },
      { label: 'pI (estimate)', value: pi == null ? '—' : pi.toFixed(2) },
      { label: 'Net charge at pH 7.4', value: charge.toFixed(2) },
      { label: 'GRAVY', value: stats.gravy.toFixed(2) },
      { label: 'ε280 reduced', value: String(ext.reduced) },
      { label: 'A280 of 1 g/L', value: a280Point1pct(ext.reduced, stats.mass).toFixed(3) },
      { label: 'Synthesis heuristic', value: synth.score },
    ],
    flags: synth.flags.map((f) => `${f.label}: ${f.detail}`),
  })

  const agentHref = '/research'

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="space-y-4">
          <label htmlFor="forge-seq" className="text-sm font-medium">Sequence</label>
          <textarea
            id="forge-seq"
            value={seq}
            onChange={(e) => update(e.target.value)}
            rows={3}
            spellCheck={false}
            className="mt-1 w-full rounded-xl border border-hairline bg-fill p-3 font-mono text-sm outline-none focus:border-accent"
            placeholder="Paste single-letter codes, or build below"
          />
          <div className="flex flex-wrap gap-1" role="group" aria-label="Add a residue">
            {AMINO_ACIDS.map((aa) => (
              <button
                key={aa.code}
                type="button"
                title={aa.name}
                onClick={() => update(seq + aa.code)}
                className="h-8 w-8 rounded-md border border-hairline font-mono text-xs hover:border-accent"
              >
                {aa.code}
              </button>
            ))}
            <button type="button" className="rounded-md border border-hairline px-2 text-xs" onClick={() => update(seq.slice(0, -1))}>
              Delete
            </button>
            <button type="button" className="rounded-md border border-hairline px-2 text-xs" onClick={() => update('')}>
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-ink/50">
            {AA_CATEGORIES.map((c) => (
              <span key={c.id}>{c.label}</span>
            ))}
          </div>
          {codes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-ink/55">
              Add residues to calculate mass, charge, GRAVY, and synthesis flags.
            </p>
          ) : (
            <ol className="flex flex-wrap gap-1" aria-label="Residues">
              {codes.map((c, i) => {
                const aa = AA_BY_CODE[c]
                return (
                  <li key={`${c}${i}`}>
                    <button
                      type="button"
                      aria-pressed={i === selected}
                      onClick={() => setSelected(i)}
                      className={`h-9 min-w-9 rounded-md border px-1 font-mono text-xs ${i === selected ? 'border-accent text-accent' : 'border-hairline'}`}
                    >
                      {i + 1}
                      {aa?.code}
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
        <aside className="space-y-2 rounded-2xl border border-hairline bg-fill p-4 text-sm">
          <Stat label="Length" value={String(stats.length)} />
          <Stat label="Mass (Da)" value={stats.mass ? stats.mass.toFixed(1) : '—'} />
          <Stat label="pI" value={pi == null ? '—' : pi.toFixed(2)} />
          <Stat label="Charge @ 7.4" value={codes.length ? charge.toFixed(2) : '—'} />
          <Stat label="GRAVY" value={codes.length ? stats.gravy.toFixed(2) : '—'} />
          <Stat label="ε280" value={String(ext.reduced)} />
          <Stat label="Synthesis" value={synth.score} />
          <ul className="space-y-2 pt-2">
            {synth.flags.length === 0 && codes.length > 0 && <li className="text-xs text-ink/50">No synthesis flags on this chain.</li>}
            {synth.flags.map((f) => (
              <li key={f.label} className="text-xs leading-relaxed text-ink/70">
                <span className="font-medium text-ink">{f.label}.</span> {f.detail}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {codes.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <HydropathyChart chains={[{ name: 'Sequence', codes }]} />
            <ChargeChart chains={[{ name: 'Sequence', codes }]} />
          </div>
          <section className="rounded-2xl border border-hairline bg-fill p-4">
            <h2 className="text-sm font-medium">
              Substitutions at residue {Math.min(selected, codes.length - 1) + 1} ({codes[Math.min(selected, codes.length - 1)]})
            </h2>
            <p className="mt-1 text-xs text-ink/50">Deltas versus the current chain. A hypothesis for what a swap would do to the calculated properties.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-ink/45">
                  <tr>
                    <th className="py-1">To</th>
                    <th>Δ mass</th>
                    <th>Δ GRAVY</th>
                    <th>Δ charge @ 7.4</th>
                  </tr>
                </thead>
                <tbody>
                  {deltas.map((d) => (
                    <tr key={d.code} className="border-t border-hairline">
                      <td className="py-1 font-mono">{d.code} {d.name}</td>
                      <td>{d.dMass.toFixed(1)}</td>
                      <td>{d.dGravy.toFixed(2)}</td>
                      <td>{d.dCharge74.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-2xl border border-hairline p-4">
            <h2 className="text-sm font-medium">Sequence card</h2>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-fill p-3 font-mono text-xs text-ink/75">{card}</pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#7EE0B5] px-3 py-1.5 text-sm font-semibold text-[#0E1512]"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(card)
                    setCopied('Copied.')
                    const next = earned
                    setXp(next)
                    try {
                      localStorage.setItem(XP_KEY, String(next))
                    } catch {
                      /* ignore */
                    }
                  } catch {
                    setCopied('Clipboard blocked.')
                  }
                }}
              >
                Copy card
              </button>
              <Link href={agentHref} className="rounded-lg border border-hairline px-3 py-1.5 text-sm">
                Open Peptide Agent
              </Link>
              <a
                className="rounded-lg border border-hairline px-3 py-1.5 text-sm"
                href={`https://www.uniprot.org/uniprotkb?query=${encodeURIComponent(codes.join(''))}`}
              >
                UniProt sequence search
              </a>
              <a className="rounded-lg border border-hairline px-3 py-1.5 text-sm" href="https://alphafold.ebi.ac.uk/">
                AlphaFold DB
              </a>
            </div>
            {copied && <p className="mt-2 text-xs text-accent" role="status">{copied}</p>}
          </section>
          <section className="rounded-2xl border border-hairline p-4" aria-label="Practice challenges">
            <h2 className="text-sm font-medium">Practice checks <span className="font-normal text-ink/45">({earned}/3 on this chain)</span></h2>
            <ul className="mt-2 space-y-1 text-sm">
              {challenges.map((c) => (
                <li key={c.id} className={c.done ? 'text-accent' : 'text-ink/55'}>
                  {c.done ? 'Done' : 'Open'} — {c.label}
                </li>
              ))}
            </ul>
            {xp > 0 && <p className="mt-2 text-xs text-ink/45">Saved locally: {xp} checks complete when you last copied a card.</p>}
          </section>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hairline py-1.5">
      <span className="text-ink/50">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
