'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, TimerReset, GitCompareArrows, DollarSign, AlertTriangle, Plus, X } from 'lucide-react'
import {
  pkWithHalfLife,
  getPk,
  halfLifeMidpoint,
  timeToSteadyState,
  accumulationRatio,
  peakTroughRatio,
  clearanceTime,
  interactionCheck,
  type PkRecord,
} from '@/lib/pharmacokinetics'
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

export default function PkCalculators() {
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

      {lab === 'steady' && <SteadyStateLab />}
      {lab === 'clearance' && <ClearanceLab />}
      {lab === 'interaction' && <InteractionLab />}
      {lab === 'cost' && <CostLab />}
    </div>
  )
}

// --- Steady-state & accumulation --------------------------------------------

function SteadyStateLab() {
  const [slug, setSlug] = useState(PK_LIST[0]?.slug ?? '')
  const [interval, setInterval] = useState('168')
  const rec = getPk(slug)
  const hl = rec?.halfLifeHours ? halfLifeMidpoint(rec.halfLifeHours) : 0
  const tau = parsePositive(interval)

  const { tss, accum, pt } = useMemo(() => {
    if (!hl || !tau) return { tss: NaN, accum: NaN, pt: NaN }
    return {
      tss: timeToSteadyState(hl, 0.97),
      accum: accumulationRatio(hl, tau),
      pt: peakTroughRatio(hl, tau),
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
      <p className="text-xs leading-relaxed text-ink/45">
        Accumulation above ~1.2× means repeated doses build up before leveling off; a peak-to-trough near 1×
        means a flat profile between doses. Both assume a fixed dose at a fixed interval.
      </p>
    </div>
  )
}

// --- Clearance --------------------------------------------------------------

function ClearanceLab() {
  const [slug, setSlug] = useState(PK_LIST[0]?.slug ?? '')
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

function InteractionLab() {
  const [selected, setSelected] = useState<string[]>([])
  const [pick, setPick] = useState('')

  const notes = useMemo(() => interactionCheck(selected), [selected])

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
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5BA88C] px-3 py-2 text-sm font-semibold text-[#0E1512] hover:bg-[#6FBF9A] disabled:opacity-40"
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
          Add two or more compounds to scan for overlapping mechanisms.
        </p>
      ) : notes.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-fill px-4 py-4 text-sm text-ink/60">
          No overlapping mechanisms flagged among these compounds. Absence of a flag is not a safety claim.
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
