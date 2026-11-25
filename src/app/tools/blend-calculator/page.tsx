'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Blend, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { RECON_PRESET_GROUPS } from '@/lib/reconstitution-presets'
import { blend, OVER_FRACTION_HIGHLIGHT } from '@/lib/blend'
import {
  DEFAULT_BUFFER_PH,
  screenBlend,
  type ScreenFlag,
  type ScreenLevel,
} from '@/lib/blend-screen'

const MAX_PEPTIDES = 10
const MIN_PEPTIDES = 2

interface Row {
  /** Catalog slug. Empty until a peptide is picked; chemistry needs it. */
  slug: string
  name: string
  mass: string // mg in this peptide's vial
  dose: string // desired mcg per injection
}

const LEVEL_TEXT: Record<ScreenLevel, string> = {
  warn: 'text-amber-300',
  caution: 'text-amber-200/80',
  info: 'text-ink/60',
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
  const [bufferPh, setBufferPh] = useState(String(DEFAULT_BUFFER_PH))
  const [rows, setRows] = useState<Row[]>([
    { slug: '', name: '', mass: '5', dose: '250' },
    { slug: '', name: '', mass: '10', dose: '500' },
  ])

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const addRow = () =>
    setRows((prev) =>
      prev.length >= MAX_PEPTIDES
        ? prev
        : [...prev, { slug: '', name: '', mass: '', dose: '' }],
    )

  const removeRow = (i: number) =>
    setRows((prev) =>
      prev.length <= MIN_PEPTIDES ? prev : prev.filter((_, idx) => idx !== i),
    )

  const calc = useMemo(() => {
    const water = parsePositive(waterMl)
    const result = blend(
      water,
      rows.map((r) => ({
        name: r.name.trim(),
        massMg: parsePositive(r.mass),
        doseMcg: parsePositive(r.dose),
      })),
    )

    const perPeptide = result.components.map((c) => ({
      name: c.name ?? '',
      mass: c.massMg,
      dose: c.doseMcg,
      ok: c.valid,
      deliveredMcg: c.deliveredMcg,
      overPct: c.overFraction * 100,
    }))

    const anyOver = result.components.some(
      (c) => c.valid && c.overFraction > OVER_FRACTION_HIGHLIGHT,
    )
    const validCount = result.components.filter((c) => c.valid).length

    return {
      water: result.waterMl,
      doses: result.doses,
      drawMl: result.drawMl,
      units: result.units,
      perPeptide,
      anyOver,
      validCount,
    }
  }, [waterMl, rows])

  const screen = useMemo(() => {
    const pH = parseFloat(bufferPh)
    return screenBlend(
      rows.map((r) => ({ slug: r.slug || undefined, name: r.name })),
      Number.isFinite(pH) ? pH : DEFAULT_BUFFER_PH,
    )
  }, [rows, bufferPh])

  const pickPreset = (i: number, slug: string) => {
    const preset = RECON_PRESET_GROUPS.flatMap((g) => g.items).find(
      (p) => p.slug === slug,
    )
    const insulin = slug === 'insulin'
    setRow(i, {
      slug,
      name: preset?.name ?? (insulin ? 'Insulin (human)' : ''),
    })
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-hairline px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-accent/15">
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
            mass each draw delivers. Pick catalog peptides to also see whether
            the reconstituted solutions are likely to associate: charge at a
            buffer pH, isoelectric point, hydrophobicity, cysteines, and the
            few pairs a product label already forbids.
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
        <section className="mb-6 rounded-2xl border border-hairline bg-fill p-5 md:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Blend setup
          </h2>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="max-w-xs">
              <label className="mb-1.5 block text-xs font-medium text-ink/55">
                Total bacteriostatic water in blend vial{' '}
                <span className="text-ink/55">(mL)</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-fill px-4 py-2.5 font-mono text-base text-ink outline-none transition-colors focus:border-accent/40"
              />
            </div>
            <div className="max-w-xs">
              <label className="mb-1.5 block text-xs font-medium text-ink/55">
                Buffer pH for the charge screen
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={14}
                step="0.1"
                value={bufferPh}
                onChange={(e) => setBufferPh(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-fill px-4 py-2.5 font-mono text-base text-ink outline-none transition-colors focus:border-accent/40"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink/40">
                Bacteriostatic water is often near {DEFAULT_BUFFER_PH}. Charge
                and pI ignore fatty-acid chains and disulfides.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-xl border border-hairline bg-fill p-3 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <select
                    value={r.slug}
                    onChange={(e) => pickPreset(i, e.target.value)}
                    aria-label={`Catalog peptide ${i + 1}`}
                    className="rounded-lg border border-hairline bg-fill px-3 py-2 text-sm text-ink outline-none focus:border-accent/40"
                  >
                    <option value="">Catalog peptide (for the screen)</option>
                    {RECON_PRESET_GROUPS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="Reference biologics">
                      <option value="insulin">Insulin (human)</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={r.name}
                    onChange={(e) => setRow(i, { name: e.target.value })}
                    placeholder="Label (optional)"
                    className="rounded-lg border border-hairline bg-fill px-3 py-2 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent/40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={r.mass}
                    onChange={(e) => setRow(i, { mass: e.target.value })}
                    placeholder="mg"
                    className="w-20 rounded-lg border border-hairline bg-fill px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent/40"
                  />
                  <span className="text-[11px] text-ink/55">mg vial</span>
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
                    className="w-24 rounded-lg border border-hairline bg-fill px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent/40"
                  />
                  <span className="text-[11px] text-ink/55">mcg dose</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= MIN_PEPTIDES}
                  aria-label={`Remove peptide ${i + 1}`}
                  className="inline-flex h-9 w-9 items-center justify-center self-center rounded-lg border border-hairline text-ink/55 transition-colors hover:border-red-400/30 hover:text-red-400/80 disabled:cursor-not-allowed disabled:opacity-30"
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
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs text-ink/60 transition-colors hover:border-accent/25 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
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
        <section className="mb-6 rounded-2xl border border-hairline bg-fill p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Per-dose verification
          </h2>
          <p className="mb-4 text-xs text-ink/55">
            What each {fmt(calc.units, 1)}-unit draw actually delivers, versus
            what you intended.
          </p>

          <div className="overflow-x-auto rounded-xl border border-hairline">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-fill-strong text-left">
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
                  <tr key={i} className="border-t border-hairline">
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
                        <span className="text-ink/55">—</span>
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

        <CompatibilityScreen screen={screen} />

        {/* ── Cross-links ── */}
        <div className="mb-10 flex flex-wrap gap-3 text-xs">
          <Link
            href="/learn/compatibility"
            className="rounded-lg border border-hairline px-3 py-2 text-ink/60 transition-colors hover:border-accent/25 hover:text-accent"
          >
            Compatibility &amp; stability guide →
          </Link>
          <Link
            href="/tools/reconstitution-calculator"
            className="rounded-lg border border-hairline px-3 py-2 text-ink/60 transition-colors hover:border-accent/25 hover:text-accent"
          >
            Single-peptide calculator →
          </Link>
        </div>
      </main>
    </div>
  )
}

function fmtSigned(n: number | null, digits: number): string {
  if (n === null || !Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function CompatibilityScreen({
  screen,
}: {
  screen: ReturnType<typeof screenBlend>
}) {
  const linked = screen.peptides.filter((p) => p.slug)
  return (
    <section className="mb-6 rounded-2xl border border-hairline bg-fill p-5 md:p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
        After reconstitution
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-ink/55">
        Estimated association risk at pH {fmt(screen.pH, 1)} once each peptide
        is already in solution. Flags are hypotheses from sequence and from
        labeled incompatibilities. They are not a mixing procedure.
      </p>

      {linked.length > 0 && (
        <div className="mb-4 overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-fill-strong text-left">
                <th className="px-3 py-2.5 font-medium text-ink/55">Peptide</th>
                <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                  Charge
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                  pI
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                  GRAVY
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-ink/55">
                  Cys
                </th>
              </tr>
            </thead>
            <tbody>
              {screen.peptides.map((p, i) => (
                <tr key={`${p.slug ?? 'row'}-${i}`} className="border-t border-hairline">
                  <td className="px-3 py-2.5 text-ink/75">{p.name}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                    {fmtSigned(p.charge, 1)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                    {fmtSigned(p.pi, 1)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                    {fmtSigned(p.gravy, 2)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-ink/70">
                    {p.hasSequence ? p.cysteines : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="space-y-2">
        {screen.flags.map((flag, i) => (
          <FlagRow key={`${flag.code}-${i}`} flag={flag} />
        ))}
        {screen.unresolved.map((name) => (
          <li
            key={name}
            className="rounded-xl border border-hairline px-3 py-2 text-xs leading-relaxed text-ink/55"
          >
            <span className="font-medium text-ink/75">{name}</span> is not a
            catalog name, so charge, pI, and GRAVY were skipped.
          </li>
        ))}
        {linked.length === 0 && screen.unresolved.length === 0 && (
          <li className="text-xs leading-relaxed text-ink/45">
            Choose a catalog peptide on each row to run the screen.
          </li>
        )}
      </ul>

      <ul className="mt-4 space-y-2 border-t border-hairline pt-4">
        {screen.notes.map((flag) => (
          <FlagRow key={flag.code} flag={flag} />
        ))}
      </ul>
    </section>
  )
}

function FlagRow({ flag }: { flag: ScreenFlag }) {
  return (
    <li className="rounded-xl border border-hairline px-3 py-2 text-xs leading-relaxed">
      <p className={`font-medium ${LEVEL_TEXT[flag.level]}`}>{flag.title}</p>
      <p className="mt-0.5 text-ink/50">{flag.detail}</p>
    </li>
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
          ? 'border-accent/25 bg-accent/[0.04]'
          : 'border-hairline bg-fill'
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/55">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums leading-tight md:text-3xl ${
          highlight ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink/55">{unit}</p>
    </div>
  )
}
