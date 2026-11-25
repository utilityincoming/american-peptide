'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, TimerReset, GitCompareArrows, DollarSign, AlertTriangle, Plus, X, FlaskConical } from 'lucide-react'
import {
  pkWithHalfLife,
  getPk,
  halfLifeMidpoint,
  timeToSteadyState,
  accumulationRatio,
  peakTroughRatio,
  clearanceTime,
  interactionCheck,
  buildAccumulationCurve,
  buildDecayCurve,
  PK_SCOPE_NOTE,
  type PkCurvePoint,
  type PkRecord,
} from '@/lib/pharmacokinetics'
import { screenBlend, DEFAULT_BUFFER_PH } from '@/lib/blend-screen'
import { costPerDose } from '@/lib/tracker'

// RESEARCH REFERENCE ONLY. These are single-compartment first-order estimates
// drawn from published half-lives — "roughly when" answers, not dosing advice.

type Lab = 'steady' | 'clearance' | 'interaction' | 'cost'

const PK_LIST = pkWithHalfLife()

const INTERVALS = [
  { label: 'Daily', hours: 24 },
  { label: 'EOD', hours: 48 },
  { label: '2× / week', hours: 84 },
  { label: 'Weekly', hours: 168 },
]

function parsePositive(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Render an hour count as the most readable unit. */
function fmtDuration(hours: number): string {
  if (!Number.isFinite(hours)) return '—'
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${hours.toLocaleString(undefined, { maximumFractionDigits: 1 })} h`
  const days = hours / 24
  if (days < 21) return `${days.toLocaleString(undefined, { maximumFractionDigits: 1 })} days`
  return `${(days / 7).toLocaleString(undefined, { maximumFractionDigits: 1 })} weeks`
}

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const LABS: { id: Lab; label: string; Icon: typeof Activity }[] = [
  { id: 'steady', label: 'Steady-state', Icon: Activity },
  { id: 'clearance', label: 'Clearance', Icon: TimerReset },
  { id: 'interaction', label: 'Interaction', Icon: GitCompareArrows },
  { id: 'cost', label: 'Cost / dose', Icon: DollarSign },
]

const selectClass =
  'w-full rounded-lg border border-hairline-strong bg-fill px-3 py-2 text-sm text-ink focus:border-accent/50 focus:outline-none'
const inputClass =
  'w-full rounded-lg border border-hairline-strong bg-fill px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent/50 focus:outline-none'

function HalfLifeNote({ rec }: { rec: PkRecord }) {
  if (!rec.halfLifeHours) return null
  const { low, high } = rec.halfLifeHours
  const range = low === high ? fmtDuration(low) : `${fmtDuration(low)} – ${fmtDuration(high)}`
  return (
    <p className="text-xs text-ink/45">
      Half-life {range} · {rec.sourceNote}
    </p>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-fill px-4 py-3">
      <div className="text-lg font-semibold text-ink/90">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  )
}

export default function PkCalculators({ initialSlug }: { initialSlug?: string }) {
  const [lab, setLab] = useState<Lab>('steady')

  return (
    <div className="rounded-2xl border border-hairline bg-fill/40 p-5 md:p-6">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-ink/80">Pharmacokinetics labs</h2>
        <span className="rounded-full border border-accent/30 bg-accent/[0.10] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Beta
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-ink/50">
        Published half-lives, turned into rough steady-state, clearance, interaction and cost estimates. A
        single-compartment approximation for research reference — not dosing advice. Compounds with no established
        human half-life are omitted.
      </p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {LABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setLab(id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              lab === id
                ? 'border-accent/40 bg-accent/[0.10] text-accent'
                : 'border-hairline-strong text-ink/55 hover:border-ink/20 hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {lab === 'steady' && <SteadyStateLab initialSlug={initialSlug} />}
      {lab === 'clearance' && <ClearanceLab initialSlug={initialSlug} />}
      {lab === 'interaction' && <InteractionLab initialSlug={initialSlug} />}
      {lab === 'cost' && <CostLab />}
    </div>
  )
}

// --- Zero-dependency responsive SVG PK curve chart --------------------------

function PkCurveSvg({
  points,
  mode,
  halfLifeHours,
  steadyStateHours,
  clearance90Hours,
  clearance97Hours,
}: {
  points: PkCurvePoint[]
  mode: 'accumulation' | 'decay'
  halfLifeHours: number
  steadyStateHours?: number
  clearance90Hours?: number
  clearance97Hours?: number
}) {
  if (points.length < 2) return null

  const VB_W = 680
  const VB_H = 220
  const PAD_L = 46
  const PAD_R = 18
  const PAD_T = 22
  const PAD_B = 34
  const PLOT_W = VB_W - PAD_L - PAD_R
  const PLOT_H = VB_H - PAD_T - PAD_B

  const maxHour = Math.max(1e-3, points[points.length - 1].hour)
  const rawMaxConc = Math.max(...points.map((p) => p.concentration), 1)
  const maxConc = mode === 'decay' ? 1 : rawMaxConc * 1.08

  const xOf = (hour: number) => PAD_L + (Math.max(0, Math.min(hour, maxHour)) / maxHour) * PLOT_W
  const yOf = (conc: number) => PAD_T + (1 - Math.max(0, Math.min(conc, maxConc)) / maxConc) * PLOT_H

  const polyline = points.map((p) => `${xOf(p.hour).toFixed(1)},${yOf(p.concentration).toFixed(1)}`).join(' ')
  const areaPath =
    `M ${xOf(points[0].hour).toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} ` +
    points.map((p) => `L ${xOf(p.hour).toFixed(1)} ${yOf(p.concentration).toFixed(1)}`).join(' ') +
    ` L ${xOf(points[points.length - 1].hour).toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} Z`

  // Window highlights:
  // - Accumulation mode: highlight the steady-state window [tss, maxHour]
  // - Decay mode: highlight the washout/clearance window [t_90%, t_97%] (and half-life marker)
  const ssX =
    mode === 'accumulation' && steadyStateHours && steadyStateHours < maxHour
      ? xOf(steadyStateHours)
      : null
  const c90X =
    mode === 'decay' && clearance90Hours && clearance90Hours < maxHour ? xOf(clearance90Hours) : null
  const c97X =
    mode === 'decay' && clearance97Hours && clearance97Hours <= maxHour ? xOf(clearance97Hours) : null
  const hlX = mode === 'decay' && halfLifeHours < maxHour ? xOf(halfLifeHours) : null

  const yTicks = mode === 'decay' ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1].map((f) => f * rawMaxConc)
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxHour)

  return (
    <div className="rounded-xl border border-hairline bg-surface/70 p-3.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink/75">
          {mode === 'accumulation'
            ? 'Relative concentration over time (repeated dosing accumulation)'
            : 'Relative concentration over time (single-dose first-order decay)'}
        </span>
        <span className="rounded-full border border-hairline-strong bg-fill px-2.5 py-0.5 font-mono text-[10px] text-ink/60">
          {PK_SCOPE_NOTE}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          mode === 'accumulation'
            ? `Pharmacokinetic accumulation curve reaching steady state around ${fmtDuration(steadyStateHours ?? 0)}`
            : `Pharmacokinetic single-dose decay curve with half-life ${fmtDuration(halfLifeHours)}`
        }
      >
        {/* Highlighted Steady-State Window */}
        {ssX !== null && (
          <g>
            <rect
              x={ssX}
              y={PAD_T}
              width={Math.max(0, PAD_L + PLOT_W - ssX)}
              height={PLOT_H}
              fill="var(--accent)"
              fillOpacity="0.10"
            />
            <line
              x1={ssX}
              y1={PAD_T}
              x2={ssX}
              y2={PAD_T + PLOT_H}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={Math.min(ssX + 6, PAD_L + PLOT_W - 115)}
              y={PAD_T + 13}
              className="fill-accent"
              style={{ fontSize: '9.5px', fontFamily: 'monospace', fontWeight: 600 }}
            >
              ~97% steady state ({fmtDuration(steadyStateHours ?? 0)})
            </text>
          </g>
        )}

        {/* Highlighted Clearance Window (90% -> 97% cleared) */}
        {c90X !== null && c97X !== null && (
          <g>
            <rect
              x={c90X}
              y={PAD_T}
              width={Math.max(0, c97X - c90X)}
              height={PLOT_H}
              fill="var(--accent)"
              fillOpacity="0.10"
            />
            <line
              x1={c90X}
              y1={PAD_T}
              x2={c90X}
              y2={PAD_T + PLOT_H}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={Math.max(PAD_L + 4, c90X - 4)}
              y={PAD_T + 13}
              textAnchor="end"
              className="fill-accent"
              style={{ fontSize: '9.5px', fontFamily: 'monospace', fontWeight: 600 }}
            >
              90–97% clearance window ({fmtDuration(clearance90Hours ?? 0)}–{fmtDuration(clearance97Hours ?? 0)})
            </text>
          </g>
        )}

        {/* 1 half-life marker in decay mode */}
        {hlX !== null && (
          <g>
            <line
              x1={hlX}
              y1={PAD_T}
              x2={hlX}
              y2={PAD_T + PLOT_H}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={hlX + 4}
              y={yOf(0.5) - 4}
              className="fill-ink/60"
              style={{ fontSize: '9px', fontFamily: 'monospace' }}
            >
              t½ ({fmtDuration(halfLifeHours)})
            </text>
          </g>
        )}

        {/* Horizontal gridlines + Y labels */}
        {yTicks.map((val, idx) => {
          const y = yOf(val)
          const label =
            mode === 'decay'
              ? `${Math.round(val * 100)}%`
              : `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}×`
          return (
            <g key={`y-${idx}`}>
              <line
                x1={PAD_L}
                y1={y}
                x2={PAD_L + PLOT_W}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
              <text
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-ink/50"
                style={{ fontSize: '9px', fontFamily: 'monospace' }}
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Vertical axis + bottom baseline */}
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={PAD_T + PLOT_H}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <line
          x1={PAD_L}
          y1={PAD_T + PLOT_H}
          x2={PAD_L + PLOT_W}
          y2={PAD_T + PLOT_H}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* X ticks */}
        {xTicks.map((hr, idx) => {
          const x = xOf(hr)
          return (
            <g key={`x-${idx}`}>
              <line
                x1={x}
                y1={PAD_T + PLOT_H}
                x2={x}
                y2={PAD_T + PLOT_H + 4}
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
              <text
                x={x}
                y={PAD_T + PLOT_H + 16}
                textAnchor={idx === 0 ? 'start' : idx === xTicks.length - 1 ? 'end' : 'middle'}
                className="fill-ink/50"
                style={{ fontSize: '9px', fontFamily: 'monospace' }}
              >
                {hr === 0 ? '0 h' : fmtDuration(hr)}
              </text>
            </g>
          )
        })}

        {/* Shaded area under curve + main curve polyline */}
        <path d={areaPath} fill="var(--accent)" fillOpacity="0.12" />
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
      </svg>

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink/50">
        {PK_SCOPE_NOTE}. Single-compartment first-order model (t½ = {fmtDuration(halfLifeHours)}).
      </p>
    </div>
  )
}

// --- Steady-state & accumulation --------------------------------------------

function SteadyStateLab({ initialSlug }: { initialSlug?: string }) {
  const defaultSlug =
    initialSlug && PK_LIST.some((r) => r.slug === initialSlug)
      ? initialSlug
      : (PK_LIST[0]?.slug ?? '')
  const [slug, setSlug] = useState(defaultSlug)
  const [interval, setInterval] = useState('168')

  useEffect(() => {
    if (initialSlug && PK_LIST.some((r) => r.slug === initialSlug)) {
      setSlug(initialSlug)
    }
  }, [initialSlug])

  const rec = getPk(slug)
  const hl = rec?.halfLifeHours ? halfLifeMidpoint(rec.halfLifeHours) : 0
  const tau = parsePositive(interval)

  const { tss, accum, pt, curvePoints } = useMemo(() => {
    if (!hl || !tau) return { tss: NaN, accum: NaN, pt: NaN, curvePoints: [] }
    return {
      tss: timeToSteadyState(hl, 0.97),
      accum: accumulationRatio(hl, tau),
      pt: peakTroughRatio(hl, tau),
      curvePoints: buildAccumulationCurve(hl, tau),
    }
  }, [hl, tau])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Compound</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={selectClass}>
            {PK_LIST.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Dosing interval</span>
          <select value={interval} onChange={(e) => setInterval(e.target.value)} className={selectClass}>
            {INTERVALS.map((i) => (
              <option key={i.hours} value={i.hours}>
                {i.label} ({i.hours} h)
              </option>
            ))}
          </select>
        </label>
      </div>
      {rec && <HalfLifeNote rec={rec} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat value={fmtDuration(tss)} label="Time to ~97% steady state" />
        <Stat value={`${accum.toLocaleString(undefined, { maximumFractionDigits: 2 })}×`} label="Accumulation ratio" />
        <Stat value={`${pt.toLocaleString(undefined, { maximumFractionDigits: 2 })}×`} label="Peak-to-trough swing" />
      </div>
      {curvePoints.length > 1 && (
        <PkCurveSvg
          points={curvePoints}
          mode="accumulation"
          halfLifeHours={hl}
          steadyStateHours={tss}
        />
      )}
      <p className="text-xs leading-relaxed text-ink/45">
        Accumulation above ~1.2× means repeated doses build up before leveling off; a peak-to-trough near 1×
        means a flat profile between doses. Both assume a fixed dose at a fixed interval.
      </p>
    </div>
  )
}

// --- Clearance --------------------------------------------------------------

function ClearanceLab({ initialSlug }: { initialSlug?: string }) {
  const defaultSlug =
    initialSlug && PK_LIST.some((r) => r.slug === initialSlug)
      ? initialSlug
      : (PK_LIST[0]?.slug ?? '')
  const [slug, setSlug] = useState(defaultSlug)

  useEffect(() => {
    if (initialSlug && PK_LIST.some((r) => r.slug === initialSlug)) {
      setSlug(initialSlug)
    }
  }, [initialSlug])

  const rec = getPk(slug)
  const hl = rec?.halfLifeHours ? halfLifeMidpoint(rec.halfLifeHours) : 0

  const rows = useMemo(
    () =>
      [
        { pct: 0.5, label: '50% cleared (1 half-life)' },
        { pct: 0.75, label: '75% cleared' },
        { pct: 0.9, label: '90% cleared' },
        { pct: 0.97, label: '~97% cleared (≈5 half-lives)' },
        { pct: 0.99, label: '99% cleared' },
      ].map((r) => ({ ...r, hours: hl ? clearanceTime(hl, 1 - r.pct) : NaN })),
    [hl],
  )

  const decayPoints = useMemo(() => (hl ? buildDecayCurve(hl) : []), [hl])
  const c90 = useMemo(() => (hl ? clearanceTime(hl, 0.1) : NaN), [hl])
  const c97 = useMemo(() => (hl ? clearanceTime(hl, 0.03) : NaN), [hl])

  return (
    <div className="space-y-4">
      <label className="block max-w-sm">
        <span className="mb-1 block text-xs font-medium text-ink/60">Compound</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className={selectClass}>
          {PK_LIST.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      {rec && <HalfLifeNote rec={rec} />}
      {decayPoints.length > 1 && (
        <PkCurveSvg
          points={decayPoints}
          mode="decay"
          halfLifeHours={hl}
          clearance90Hours={c90}
          clearance97Hours={c97}
        />
      )}
      <div className="overflow-hidden rounded-xl border border-hairline">
        {rows.map((r, i) => (
          <div
            key={r.pct}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 ? 'bg-fill' : ''}`}
          >
            <span className="text-ink/60">{r.label}</span>
            <span className="font-medium text-ink/90">{fmtDuration(r.hours)} after last dose</span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-ink/45">
        Estimated time for a single dose to wash out, from the compound&apos;s elimination half-life. First-order
        decay only — it ignores tissue binding and active metabolites.
      </p>
    </div>
  )
}

// --- Interaction check ------------------------------------------------------

function InteractionLab({ initialSlug }: { initialSlug?: string }) {
  const [selected, setSelected] = useState<string[]>(() =>
    initialSlug && PK_LIST.some((r) => r.slug === initialSlug) ? [initialSlug] : [],
  )
  const [pick, setPick] = useState('')

  const notes = useMemo(() => interactionCheck(selected), [selected])
  const blendReport = useMemo(
    () =>
      selected.length >= 2
        ? screenBlend(
            selected.map((s) => ({ slug: s })),
            DEFAULT_BUFFER_PH,
          )
        : null,
    [selected],
  )

  function add() {
    if (pick && !selected.includes(pick)) setSelected([...selected, pick])
    setPick('')
  }

  const available = PK_LIST.filter((r) => !selected.includes(r.slug))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="block flex-1 min-w-[180px]">
          <span className="mb-1 block text-xs font-medium text-ink/60">Add a compound to the stack</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {available.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={add}
          disabled={!pick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7EE0B5] px-3 py-2 text-sm font-semibold text-[#0E1512] hover:bg-[#A6F0CC] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-fill px-2.5 py-1 text-xs text-ink/70"
            >
              {getPk(s)?.label ?? s}
              <button
                onClick={() => setSelected(selected.filter((x) => x !== s))}
                aria-label="Remove"
                className="text-ink/40 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length < 2 ? (
        <p className="rounded-xl border border-dashed border-hairline bg-fill px-4 py-6 text-center text-sm text-ink/50">
          Add two or more compounds to scan for overlapping mechanisms and shared-vial compatibility.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="rounded-xl border border-hairline bg-fill px-4 py-3 text-sm text-ink/60">
              No overlapping pharmacological pathways flagged among these compounds. Absence of a flag is not a safety claim.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-ink/70"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{n.message}</span>
                </div>
              ))}
            </div>
          )}

          {blendReport && (
            <div className="rounded-xl border border-hairline bg-surface/60 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/80">
                  <FlaskConical className="h-3.5 w-3.5 text-accent" />
                  Shared-vial physical &amp; chemical compatibility (pH {blendReport.pH.toFixed(1)})
                </span>
                {(() => {
                  const hasWarn = blendReport.flags.some((f) => f.level === 'warn')
                  const hasCaution = blendReport.flags.some((f) => f.level === 'caution')
                  const label = hasWarn ? 'warn' : hasCaution ? 'caution' : 'clear'
                  return (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        hasWarn
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : hasCaution
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : 'border-accent/30 bg-accent/10 text-accent'
                      }`}
                    >
                      {label}
                    </span>
                  )
                })()}
              </div>
              {blendReport.flags.length === 0 ? (
                <p className="text-xs text-ink/60">
                  No charge, pI, hydrophobicity, or labeled syringe warnings detected at pH {blendReport.pH.toFixed(1)}.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {blendReport.flags.map((f, idx) => (
                    <li
                      key={`${f.code}-${idx}`}
                      className={`rounded-lg border px-3 py-2 ${
                        f.level === 'warn'
                          ? 'border-red-500/25 bg-red-500/[0.06] text-ink/80'
                          : f.level === 'caution'
                            ? 'border-amber-500/25 bg-amber-500/[0.06] text-ink/80'
                            : 'border-hairline bg-fill text-ink/65'
                      }`}
                    >
                      <span className="font-semibold text-ink/90">{f.title}</span> — {f.detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      <p className="text-xs leading-relaxed text-ink/45">
        A conservative scan for shared pharmacological pathways — a prompt to read further, not a clinical
        interaction database. It will not catch every interaction.
      </p>
    </div>
  )
}

// --- Cost per dose ----------------------------------------------------------

function CostLab() {
  const [mg, setMg] = useState('10')
  const [dose, setDose] = useState('250')
  const [cost, setCost] = useState('80')

  const { dosesPerVial, costPerDose: perDose } = useMemo(
    () => costPerDose(parsePositive(mg), parsePositive(dose), parsePositive(cost) || undefined),
    [mg, dose, cost],
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Vial mass (mg)</span>
          <input value={mg} onChange={(e) => setMg(e.target.value)} inputMode="decimal" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Dose per injection (mcg)</span>
          <input value={dose} onChange={(e) => setDose(e.target.value)} inputMode="decimal" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Vial cost</span>
          <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" className={inputClass} />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          value={dosesPerVial > 0 ? dosesPerVial.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
          label="Doses per vial"
        />
        <Stat value={perDose != null ? fmtMoney(perDose) : '—'} label="Cost per dose" />
      </div>
      <p className="text-xs leading-relaxed text-ink/45">
        Doses per vial = vial mass ÷ dose. Track vials with a running cost-per-dose in the{' '}
        <Link href="/tools/tracker" className="text-accent hover:underline">
          protocol tracker
        </Link>
        .
      </p>
    </div>
  )
}
