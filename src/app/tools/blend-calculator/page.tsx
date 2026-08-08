'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Blend, Plus, Trash2, AlertTriangle } from 'lucide-react'

const MAX_PEPTIDES = 10
const MIN_PEPTIDES = 2

interface Row {
  name: string
  mass: string // mg in this peptide's vial
  dose: string // desired mcg per injection
}

function parsePositive(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n) || n === 0) return '—'
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export default function BlendCalculatorPage() {
  const [waterMl, setWaterMl] = useState('3')
  const [rows, setRows] = useState<Row[]>([
    { name: '', mass: '5', dose: '250' },
    { name: '', mass: '10', dose: '500' },
  ])

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const addRow = () =>
    setRows((prev) =>
      prev.length >= MAX_PEPTIDES
        ? prev
        : [...prev, { name: '', mass: '', dose: '' }],
    )

  const removeRow = (i: number) =>
    setRows((prev) =>
      prev.length <= MIN_PEPTIDES ? prev : prev.filter((_, idx) => idx !== i),
    )

  const calc = useMemo(() => {
    const water = parsePositive(waterMl)
    const items = rows.map((r) => ({
      name: r.name.trim(),
      mass: parsePositive(r.mass),
      dose: parsePositive(r.dose),
    }))
    const valid = items.filter((i) => i.mass > 0 && i.dose > 0)

    // Doses each peptide could supply on its own, at its desired dose.
    const standalone = valid.map((i) => (i.mass * 1000) / i.dose)
    // The blend is limited by the scarcest peptide — that sets whole doses.
    const doses = standalone.length ? Math.floor(Math.min(...standalone)) : 0
    const drawMl = doses > 0 && water > 0 ? water / doses : 0
    const units = drawMl * 100

    const perPeptide = items.map((i) => {
      const ok = i.mass > 0 && i.dose > 0
      const deliveredMcg = doses > 0 && ok ? (i.mass * 1000) / doses : 0
      const overPct =
        ok && i.dose > 0 ? ((deliveredMcg - i.dose) / i.dose) * 100 : 0
      return { ...i, ok, deliveredMcg, overPct }
    })

    const anyOver = perPeptide.some((p) => p.ok && p.overPct > 2)

    return { water, doses, drawMl, units, perPeptide, anyOver, validCount: valid.length }
  }, [waterMl, rows])

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
          <Blend className="h-4 w-4 text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium">Blend Calculator</span>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
          Beta
        </span>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Peptide blend calculator
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            Combine multiple peptides into a single vial and see how many doses
            the blend supports, the draw volume per injection, and the actual
            mass each draw delivers per peptide — versus what you intended.
          </p>
        </div>

        {/* ── Safety / stability cautions (the part stand-alone blend tools omit) ── */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80"
            strokeWidth={1.75}
          />
          <div className="min-w-0 text-xs leading-relaxed text-ink/55">
            <p className="mb-1 font-semibold text-amber-300/90">
              Math only — not administration guidance, and read this first.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Co-storing peptides in one vial can accelerate degradation and
                removes your ability to verify each component against its COA.
              </li>
              <li>
                Every transfer is a contamination/sterility risk; a blend only
                cleanly preserves doses when vial masses are proportioned to the
                same dose count.
              </li>
              <li>
                Review pair-level handling first in the{' '}
                <Link
                  href="/learn/compatibility"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  compatibility &amp; stability guide
                </Link>
                . Research use only.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Inputs ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Blend setup
          </h2>

          <div className="mb-5 max-w-xs">
            <label className="mb-1.5 block text-xs font-medium text-ink/55">
              Total bacteriostatic water in blend vial{' '}
              <span className="text-ink/30">(mL)</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={waterMl}
              onChange={(e) => setWaterMl(e.target.value)}
              className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-4 py-2.5 font-mono text-base text-ink outline-none transition-colors focus:border-[#2DD4A8]/40"
            />
          </div>

          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <input
                  type="text"
                  value={r.name}
                  onChange={(e) => setRow(i, { name: e.target.value })}
                  placeholder={`Peptide ${i + 1} (optional name)`}
                  className="rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-[#2DD4A8]/40"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={r.mass}
                    onChange={(e) => setRow(i, { mass: e.target.value })}
                    placeholder="mg"
                    className="w-20 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/25 outline-none focus:border-[#2DD4A8]/40"
                  />
                  <span className="text-[11px] text-ink/35">mg vial</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={r.dose}
                    onChange={(e) => setRow(i, { dose: e.target.value })}
                    placeholder="mcg"
                    className="w-24 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/25 outline-none focus:border-[#2DD4A8]/40"
                  />
                  <span className="text-[11px] text-ink/35">mcg dose</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= MIN_PEPTIDES}
                  aria-label={`Remove peptide ${i + 1}`}
                  className="inline-flex h-9 w-9 items-center justify-center self-center rounded-lg border border-ink/[0.08] text-ink/45 transition-colors hover:border-red-400/30 hover:text-red-400/80 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_PEPTIDES}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] px-3 py-2 text-xs text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
            Add peptide ({rows.length}/{MAX_PEPTIDES})
          </button>
        </section>

        {/* ── Blend summary ── */}
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <ResultCard
            label="Doses in blend"
            value={calc.doses > 0 ? String(calc.doses) : '—'}
            unit="injections"
            highlight
          />
          <ResultCard
            label="Draw per dose"
            value={fmt(calc.drawMl, 3)}
            unit={`mL · ${fmt(calc.units, 1)} units`}
            highlight
          />
          <ResultCard
            label="Total water"
            value={fmt(calc.water)}
            unit="mL"
          />
        </section>

        {/* ── Per-dose verification ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Per-dose verification
          </h2>
          <p className="mb-4 text-xs text-ink/40">
            What each {fmt(calc.units, 1)}-unit draw actually delivers, versus
            what you intended.
          </p>

          <div className="overflow-x-auto rounded-xl border border-ink/[0.07]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ink/[0.04] text-left">
                  <th className="px-3 py-2.5 font-medium text-ink/55">Peptide</th>
                  <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                    Vial
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                    Intended
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                    Delivered / dose
                  </th>
                </tr>
              </thead>
              <tbody>
                {calc.perPeptide.map((p, i) => (
                  <tr key={i} className="border-t border-ink/[0.05]">
                    <td className="px-3 py-2.5 text-ink/75">
                      {p.name || `Peptide ${i + 1}`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink/55">
                      {p.ok ? `${fmt(p.mass)} mg` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink/55">
                      {p.ok ? `${fmt(p.dose)} mcg` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {p.ok && calc.doses > 0 ? (
                        <span
                          className={
                            p.overPct > 2
                              ? 'text-amber-400'
                              : 'text-accent'
                          }
                        >
                          {fmt(p.deliveredMcg)} mcg
                          {p.overPct > 2 && (
                            <span className="ml-1 text-[11px] text-amber-400/70">
                              (+{fmt(p.overPct, 0)}%)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-ink/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {calc.anyOver && (
            <p className="mt-3 text-[11px] leading-relaxed text-amber-400/70">
              Some peptides deliver more than intended: a single shared draw only
              hits every target dose when each vial&apos;s mass is proportioned
              to the same dose count. Adjust vial masses (or doses) so the
              delivered column matches your intended column.
            </p>
          )}
        </section>

        {/* ── Cross-links ── */}
        <div className="mb-10 flex flex-wrap gap-3 text-xs">
          <Link
            href="/learn/compatibility"
            className="rounded-lg border border-ink/[0.08] px-3 py-2 text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent"
          >
            Compatibility &amp; stability guide →
          </Link>
          <Link
            href="/tools/reconstitution-calculator"
            className="rounded-lg border border-ink/[0.08] px-3 py-2 text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent"
          >
            Single-peptide calculator →
          </Link>
        </div>
      </main>
    </div>
  )
}

function ResultCard({
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
        className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums leading-tight md:text-3xl ${
          highlight ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink/40">{unit}</p>
    </div>
  )
}
