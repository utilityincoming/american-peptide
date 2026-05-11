'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Syringe, AlertTriangle } from 'lucide-react'

const VIAL_PRESETS = [2, 5, 10, 15, 20, 30]
const DOSE_PRESETS = [100, 250, 500, 750, 1000, 1500, 2000]
const REF_VIALS = [2, 5, 10]
const REF_WATERS = [1, 2, 3, 5]

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

export default function ReconstitutionCalculatorPage() {
  const [vialMg, setVialMg] = useState('5')
  const [doseMcg, setDoseMcg] = useState('250')
  const [waterMl, setWaterMl] = useState('2')

  const calc = useMemo(() => {
    const vial = parsePositive(vialMg)
    const dose = parsePositive(doseMcg)
    const water = parsePositive(waterMl)
    const vialMcg = vial * 1000
    const concentrationPerMl = water > 0 ? vialMcg / water : 0
    const concentrationPerTick = concentrationPerMl / 10
    const volumePerInjectionMl = concentrationPerMl > 0 ? dose / concentrationPerMl : 0
    const unitsPerInjection = volumePerInjectionMl * 100
    const dosesPerVial = dose > 0 ? Math.floor(vialMcg / dose) : 0
    return {
      vial,
      dose,
      water,
      vialMcg,
      concentrationPerMl,
      concentrationPerTick,
      volumePerInjectionMl,
      unitsPerInjection,
      dosesPerVial,
    }
  }, [vialMg, doseMcg, waterMl])

  const onConcentrationEdit = (raw: string) => {
    const c = parseFloat(raw)
    if (Number.isFinite(c) && c > 0 && calc.vialMcg > 0) {
      const newWater = calc.vialMcg / (c * 10)
      setWaterMl(newWater >= 0.01 ? newWater.toFixed(2) : '')
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-white/35 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">AmericanPeptide</span>
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
            <Syringe className="h-4 w-4 text-[#2DD4A8]" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-medium">Reconstitution Calculator</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* ── Page heading (SEO) ── */}
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Peptide Reconstitution Calculator
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Calculate bacteriostatic water volume, peptide concentration, and dose volume on
            a U-100 insulin syringe. Inputs and results update in real time.
          </p>
        </div>

        {/* ── Inputs ── */}
        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#2DD4A8]/70">
            Inputs
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <NumberField
              label="Peptide amount in vial"
              unit="mg"
              value={vialMg}
              onChange={setVialMg}
              presets={VIAL_PRESETS}
              presetLabel={(n) => `${n}mg`}
              onPreset={(n) => setVialMg(String(n))}
            />
            <NumberField
              label="Desired dose per injection"
              unit="mcg"
              value={doseMcg}
              onChange={setDoseMcg}
              presets={DOSE_PRESETS}
              presetLabel={(n) => `${n}mcg`}
              onPreset={(n) => setDoseMcg(String(n))}
            />
            <NumberField
              label="Bacteriostatic water to add"
              unit="mL"
              value={waterMl}
              onChange={setWaterMl}
              hint="Edit either this OR the concentration below — they're linked."
            />
            <NumberField
              label="Desired concentration"
              unit="mcg per 0.1 mL"
              value={
                calc.concentrationPerTick > 0
                  ? calc.concentrationPerTick.toFixed(2).replace(/\.?0+$/, '')
                  : ''
              }
              onChange={onConcentrationEdit}
              hint="Auto-calculated from water volume; type to override."
            />
          </div>
        </section>

        {/* ── Results ── */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Total water"
            value={fmt(calc.water)}
            unit="mL"
          />
          <ResultCard
            label="Concentration"
            value={fmt(calc.concentrationPerTick)}
            unit="mcg / 0.1 mL"
            highlight
          />
          <ResultCard
            label="Doses per vial"
            value={calc.dosesPerVial > 0 ? calc.dosesPerVial.toString() : '—'}
            unit="injections"
          />
          <ResultCard
            label="Volume per injection"
            value={fmt(calc.volumePerInjectionMl, 3)}
            unit={`mL · ${fmt(calc.unitsPerInjection, 1)} units`}
            highlight
          />
        </section>

        {/* ── Syringe diagram ── */}
        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2DD4A8]/70">
              U-100 Insulin Syringe
            </h2>
            <span className="font-mono text-xs text-white/40">
              {fmt(calc.unitsPerInjection, 1)} units · {fmt(calc.volumePerInjectionMl, 3)} mL
            </span>
          </div>
          <SyringeDiagram units={calc.unitsPerInjection} />
          <p className="mt-3 text-center text-[11px] text-white/35">
            Each tick = 1 unit (0.01 mL). Major labeled marks every 10 units (0.1 mL).
          </p>
        </section>

        {/* ── Reference table ── */}
        <section className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#2DD4A8]/70">
            Quick Reference
          </h2>
          <p className="mb-4 text-xs text-white/40">
            Concentration in mcg per 0.1 mL by vial size and water volume. Your current
            selection is highlighted.
          </p>
          <ReferenceTable currentVial={calc.vial} currentWater={calc.water} />
        </section>

        {/* ── Educational content ── */}
        <section className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            How to Reconstitute Peptides
          </h2>
          <ol className="space-y-3 text-sm leading-relaxed text-white/65">
            <li className="flex gap-3">
              <Step n={1} />
              <span>Clean the vial stopper with an alcohol swab.</span>
            </li>
            <li className="flex gap-3">
              <Step n={2} />
              <span>Draw the calculated amount of bacteriostatic water into a syringe.</span>
            </li>
            <li className="flex gap-3">
              <Step n={3} />
              <span>
                Inject water slowly into the vial, aiming the stream against the glass wall
                — never directly onto the peptide powder.
              </span>
            </li>
            <li className="flex gap-3">
              <Step n={4} />
              <span>Gently swirl the vial — do not shake.</span>
            </li>
            <li className="flex gap-3">
              <Step n={5} />
              <span>Allow to dissolve completely (may take 1–5 minutes).</span>
            </li>
            <li className="flex gap-3">
              <Step n={6} />
              <span>Store reconstituted peptide refrigerated at 2–8°C.</span>
            </li>
            <li className="flex gap-3">
              <Step n={7} />
              <span>
                Note the date of reconstitution — most reconstituted peptides are stable for
                4–6 weeks refrigerated.
              </span>
            </li>
          </ol>
        </section>

        <section className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Storage Guidelines</h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-white/65">
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
              <span>
                <span className="font-medium text-white/85">Unreconstituted:</span> room
                temperature or refrigerated, away from light.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
              <span>
                <span className="font-medium text-white/85">Reconstituted:</span> refrigerated
                at 2–8°C, use within 4–6 weeks.
              </span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400/70" />
              <span>
                <span className="font-medium text-white/85">Never freeze</span> reconstituted
                peptides.
              </span>
            </li>
          </ul>
        </section>

      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

function NumberField({
  label,
  unit,
  value,
  onChange,
  hint,
  presets,
  presetLabel,
  onPreset,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  hint?: string
  presets?: number[]
  presetLabel?: (n: number) => string
  onPreset?: (n: number) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/55">
        {label} <span className="text-white/30">({unit})</span>
      </label>
      {presets && presetLabel && onPreset && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {presets.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPreset(n)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                String(n) === value
                  ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] text-[#2DD4A8]'
                  : 'border-white/[0.08] bg-white/[0.02] text-white/55 hover:border-white/[0.15] hover:text-white/85'
              }`}
            >
              {presetLabel(n)}
            </button>
          ))}
        </div>
      )}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 font-mono text-base text-white outline-none transition-colors focus:border-[#2DD4A8]/40"
      />
      {hint && <p className="mt-1 text-[10px] text-white/30">{hint}</p>}
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
          : 'border-white/[0.07] bg-white/[0.025]'
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums leading-tight md:text-3xl ${
          highlight ? 'text-[#2DD4A8]' : 'text-white'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-white/40">{unit}</p>
    </div>
  )
}

function SyringeDiagram({ units }: { units: number }) {
  const clamped = Math.max(0, Math.min(units, 100))
  const VB_W = 600
  const VB_H = 110
  const BARREL_X = 90
  const BARREL_W = 420
  const BARREL_Y = 35
  const BARREL_H = 32
  const fillW = (clamped / 100) * BARREL_W

  const majorTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const minorTicks = Array.from({ length: 101 }, (_, i) => i).filter((i) => i % 10 !== 0)

  const labelX = BARREL_X + fillW
  const showLabel = clamped > 0

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`U-100 insulin syringe filled to ${clamped.toFixed(1)} units`}
    >
      {/* Plunger */}
      <rect x="10" y="40" width="20" height="22" rx="3" fill="#2A3548" />
      <rect x="30" y="44" width="58" height="14" rx="2" fill="#1A2336" />
      <rect x="86" y="38" width="6" height="26" rx="1" fill="#3A4A66" />

      {/* Barrel */}
      <rect
        x={BARREL_X}
        y={BARREL_Y}
        width={BARREL_W}
        height={BARREL_H}
        rx="2"
        fill="#0F1A2E"
        stroke="#2A3548"
        strokeWidth="1"
      />

      {/* Fill */}
      {clamped > 0 && (
        <rect
          x={BARREL_X}
          y={BARREL_Y}
          width={fillW}
          height={BARREL_H}
          rx="2"
          fill="#2DD4A8"
          fillOpacity="0.28"
        />
      )}
      {clamped > 0 && (
        <line
          x1={BARREL_X + fillW}
          y1={BARREL_Y - 2}
          x2={BARREL_X + fillW}
          y2={BARREL_Y + BARREL_H + 2}
          stroke="#2DD4A8"
          strokeWidth="1.5"
        />
      )}

      {/* Minor ticks */}
      {minorTicks.map((t) => {
        const x = BARREL_X + (t / 100) * BARREL_W
        return (
          <line
            key={`min-${t}`}
            x1={x}
            y1={BARREL_Y}
            x2={x}
            y2={BARREL_Y + 4}
            stroke="#3A4A66"
            strokeWidth="0.5"
          />
        )
      })}

      {/* Major ticks + labels */}
      {majorTicks.map((t) => {
        const x = BARREL_X + (t / 100) * BARREL_W
        return (
          <g key={`maj-${t}`}>
            <line
              x1={x}
              y1={BARREL_Y}
              x2={x}
              y2={BARREL_Y + 8}
              stroke="#5A6B85"
              strokeWidth="1"
            />
            <text
              x={x}
              y={BARREL_Y - 4}
              textAnchor="middle"
              className="fill-white/40"
              style={{ fontSize: '9px', fontFamily: 'monospace' }}
            >
              {t}
            </text>
          </g>
        )
      })}

      {/* Needle hub */}
      <polygon
        points={`${BARREL_X + BARREL_W},${BARREL_Y} ${BARREL_X + BARREL_W + 18},${BARREL_Y + 6} ${BARREL_X + BARREL_W + 18},${BARREL_Y + BARREL_H - 6} ${BARREL_X + BARREL_W},${BARREL_Y + BARREL_H}`}
        fill="#2A3548"
      />
      {/* Needle */}
      <line
        x1={BARREL_X + BARREL_W + 18}
        y1={BARREL_Y + BARREL_H / 2}
        x2={BARREL_X + BARREL_W + 80}
        y2={BARREL_Y + BARREL_H / 2}
        stroke="#5A6B85"
        strokeWidth="1.5"
      />

      {/* Dose label */}
      {showLabel && (
        <g>
          <rect
            x={Math.max(BARREL_X, Math.min(labelX - 24, BARREL_X + BARREL_W - 48))}
            y={BARREL_Y + BARREL_H + 8}
            width="48"
            height="18"
            rx="3"
            fill="#2DD4A8"
            fillOpacity="0.15"
            stroke="#2DD4A8"
            strokeOpacity="0.4"
            strokeWidth="0.75"
          />
          <text
            x={Math.max(BARREL_X + 24, Math.min(labelX, BARREL_X + BARREL_W - 24))}
            y={BARREL_Y + BARREL_H + 21}
            textAnchor="middle"
            className="fill-[#2DD4A8]"
            style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}
          >
            {clamped.toFixed(1)} u
          </text>
        </g>
      )}
    </svg>
  )
}

function ReferenceTable({
  currentVial,
  currentWater,
}: {
  currentVial: number
  currentWater: number
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-white/[0.04]">
            <th className="px-3 py-2.5 text-left font-medium text-white/55">Vial \ Water</th>
            {REF_WATERS.map((w) => (
              <th
                key={w}
                className="px-3 py-2.5 text-right font-mono font-medium text-white/55"
              >
                {w} mL
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REF_VIALS.map((v) => (
            <tr key={v} className="border-t border-white/[0.05]">
              <td className="px-3 py-2.5 font-mono text-white/65">{v} mg</td>
              {REF_WATERS.map((w) => {
                const conc = (v * 100) / w
                const isCurrent = v === currentVial && w === currentWater
                return (
                  <td
                    key={w}
                    className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      isCurrent
                        ? 'bg-[#2DD4A8]/[0.1] font-semibold text-[#2DD4A8]'
                        : 'text-white/65'
                    }`}
                  >
                    {conc % 1 === 0 ? conc : conc.toFixed(1)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] font-mono text-[11px] font-semibold text-[#2DD4A8]">
      {n}
    </span>
  )
}
