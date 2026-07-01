'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Syringe, AlertTriangle, ArrowRight, Search, X, ExternalLink, Link2, Check } from 'lucide-react'
import OfflineStatus from '@/components/OfflineStatus'
import { RECON_PRESETS, RECON_PRESET_GROUPS, type ReconPreset } from '@/lib/reconstitution-presets'

const VIAL_PRESETS = [1, 2, 5, 10, 15, 20, 30, 50]
const DOSE_PRESETS = [100, 250, 500, 1000, 2000, 2500, 5000]
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
  const [loaded, setLoaded] = useState<ReconPreset | null>(null)

  // Only start writing the URL after the user actually changes something, so a
  // freshly-opened page keeps a clean URL. Hydration from a shared link does not
  // set this flag; the incoming params are simply consumed.
  const dirty = useRef(false)

  const markDirty = () => {
    dirty.current = true
  }
  const changeVial = (v: string) => {
    markDirty()
    setVialMg(v)
  }
  const changeDose = (v: string) => {
    markDirty()
    setDoseMcg(v)
  }
  const changeWater = (v: string) => {
    markDirty()
    setWaterMl(v)
  }

  const loadPreset = (p: ReconPreset) => {
    markDirty()
    setVialMg(String(p.vialMg))
    setDoseMcg(String(p.doseMcg))
    setWaterMl(String(p.waterMl))
    setLoaded(p)
  }

  const clearLoaded = () => {
    markDirty()
    setLoaded(null)
  }

  // Hydrate state from the URL once, on mount. A ?peptide= slug applies that
  // preset first; explicit vial/dose/water params then override it. This does
  // not mark the page dirty, so an unshared visit leaves the URL untouched.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const pep = sp.get('peptide')
    const found = pep ? RECON_PRESETS.find((p) => p.slug === pep) ?? null : null
    if (found) {
      setVialMg(String(found.vialMg))
      setDoseMcg(String(found.doseMcg))
      setWaterMl(String(found.waterMl))
      setLoaded(found)
    }
    const v = sp.get('vial')
    const d = sp.get('dose')
    const w = sp.get('water')
    if (v && parsePositive(v)) setVialMg(v)
    if (d && parsePositive(d)) setDoseMcg(d)
    if (w && parsePositive(w)) setWaterMl(w)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reflect current inputs back into the URL (replace, no history spam) so the
  // configuration is shareable — but only once the user has interacted.
  useEffect(() => {
    if (!dirty.current) return
    const sp = new URLSearchParams()
    if (parsePositive(vialMg)) sp.set('vial', vialMg)
    if (parsePositive(doseMcg)) sp.set('dose', doseMcg)
    if (parsePositive(waterMl)) sp.set('water', waterMl)
    if (loaded) sp.set('peptide', loaded.slug)
    const qs = sp.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [vialMg, doseMcg, waterMl, loaded])

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
      changeWater(newWater >= 0.01 ? newWater.toFixed(2) : '')
    }
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
          <Syringe className="h-4 w-4 text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium">Reconstitution Calculator</span>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* ── Offline status / install ── */}
        <OfflineStatus />

        {/* ── Beta calculator link ── */}
        <Link
          href="/tools/calculator-beta"
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-4 py-2.5 text-xs transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
        >
          <span className="text-ink/55">
            <span className="font-semibold text-accent">New ·</span> Try the
            beta calculator with a reverse-dose solver
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent" />
        </Link>

        {/* ── Page heading (SEO) ── */}
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Peptide Reconstitution Calculator
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            Calculate bacteriostatic water volume, peptide concentration, and dose volume on
            a U-100 insulin syringe. Inputs and results update in real time — installable as
            an app for offline bench use.
          </p>
        </div>

        {/* ── Inputs ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              Inputs
            </h2>
            <CopyLinkButton />
          </div>

          {/* ── Peptide-aware presets ── */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium text-ink/55">
              Load a peptide{' '}
              <span className="text-ink/30">(autofills vial, water &amp; a reference amount)</span>
            </label>
            <PeptidePicker loaded={loaded} onSelect={loadPreset} onClear={clearLoaded} />
            {loaded && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] px-3 py-2 text-[11px] text-ink/55">
                <span>
                  Loaded <span className="font-semibold text-accent">{loaded.name}</span> ·{' '}
                  {loaded.vialMg}mg vial · {loaded.waterMl}mL ·{' '}
                  {loaded.doseMcg >= 1000
                    ? `${(loaded.doseMcg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}mg`
                    : `${loaded.doseMcg}mcg`}{' '}
                  reference amount
                </span>
                {loaded.note && <span className="text-amber-400/80">{loaded.note}</span>}
                <Link
                  href={`/catalog/${loaded.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
            <p className="mt-1.5 text-[10px] leading-relaxed text-ink/30">
              Preset vial sizes and volumes reflect how these compounds are commonly supplied and
              dissolved for laboratory research. Amounts are calculation reference points only — not
              dosing guidance or medical advice. Adjust any field freely.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <NumberField
              label="Peptide amount in vial"
              unit="mg"
              value={vialMg}
              onChange={changeVial}
              presets={VIAL_PRESETS}
              presetLabel={(n) => `${n}mg`}
              onPreset={(n) => changeVial(String(n))}
            />
            <NumberField
              label="Desired dose per injection"
              unit="mcg"
              value={doseMcg}
              onChange={changeDose}
              presets={DOSE_PRESETS}
              presetLabel={(n) => (n >= 1000 ? `${n / 1000}mg` : `${n}mcg`)}
              onPreset={(n) => changeDose(String(n))}
            />
            <NumberField
              label="Bacteriostatic water to add"
              unit="mL"
              value={waterMl}
              onChange={changeWater}
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
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              U-100 Insulin Syringe
            </h2>
            <span className="font-mono text-xs text-ink/40">
              {fmt(calc.unitsPerInjection, 1)} units · {fmt(calc.volumePerInjectionMl, 3)} mL
            </span>
          </div>
          <SyringeDiagram units={calc.unitsPerInjection} />
          <p className="mt-3 text-center text-[11px] text-ink/35">
            Each tick = 1 unit (0.01 mL). Major labeled marks every 10 units (0.1 mL).
          </p>
        </section>

        {/* ── Reference table ── */}
        <section className="mb-10 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Quick Reference
          </h2>
          <p className="mb-4 text-xs text-ink/40">
            Concentration in mcg per 0.1 mL by vial size and water volume. Your current
            selection is highlighted.
          </p>
          <ReferenceTable currentVial={calc.vial} currentWater={calc.water} />
        </section>

        {/* ── Educational content ── */}
        <section className="mb-10 rounded-2xl border border-ink/[0.06] bg-ink/[0.02] p-5 md:p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            How to Reconstitute Peptides
          </h2>
          <ol className="space-y-3 text-sm leading-relaxed text-ink/65">
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

        <section className="mb-10 rounded-2xl border border-ink/[0.06] bg-ink/[0.02] p-5 md:p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Storage Guidelines</h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-ink/65">
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
              <span>
                <span className="font-medium text-ink/85">Unreconstituted:</span> room
                temperature or refrigerated, away from light.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
              <span>
                <span className="font-medium text-ink/85">Reconstituted:</span> refrigerated
                at 2–8°C, use within 4–6 weeks.
              </span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400/70" />
              <span>
                <span className="font-medium text-ink/85">Never freeze</span> reconstituted
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

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for insecure contexts / clipboard-blocked environments.
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } catch {
        /* no-op — copy unavailable */
      }
      document.body.removeChild(el)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy a shareable link to this configuration"
      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
        copied
          ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] text-accent'
          : 'border-ink/[0.1] bg-ink/[0.02] text-ink/55 hover:border-[#2DD4A8]/25 hover:text-ink/85'
      }`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> Copied
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" /> Copy link
        </>
      )}
    </button>
  )
}

function PeptidePicker({
  loaded,
  onSelect,
  onClear,
}: {
  loaded: ReconPreset | null
  onSelect: (p: ReconPreset) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const groups = useMemo(() => {
    if (!q) return RECON_PRESET_GROUPS
    return RECON_PRESET_GROUPS.map((g) => ({
      group: g.group,
      items: g.items.filter((p) => p.name.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [q])

  const flat = groups.flatMap((g) => g.items)

  const choose = (p: ReconPreset) => {
    onSelect(p)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-3 transition-colors focus-within:border-[#2DD4A8]/40">
        <Search className="h-4 w-4 flex-shrink-0 text-ink/35" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={loaded ? loaded.name : 'Search a peptide…'}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              inputRef.current?.blur()
            } else if (e.key === 'Enter' && flat.length > 0) {
              e.preventDefault()
              choose(flat[0])
            }
          }}
          className="w-full bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink/35"
        />
        {(loaded || query) && (
          <button
            type="button"
            aria-label="Clear loaded peptide"
            onClick={() => {
              setQuery('')
              onClear()
              inputRef.current?.focus()
            }}
            className="flex-shrink-0 rounded-md p-1 text-ink/35 transition-colors hover:bg-ink/[0.06] hover:text-ink/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <>
          {/* Backdrop to close on outside click */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-72 overflow-y-auto rounded-xl border border-ink/[0.1] bg-[var(--panel,#0f1729)] p-1 shadow-xl shadow-black/30">
            {flat.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-ink/40">No peptides match “{query}”.</p>
            ) : (
              groups.map((g) => (
                <div key={g.group} className="mb-1 last:mb-0">
                  <p className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                    {g.group}
                  </p>
                  {g.items.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => choose(p)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-ink/80 transition-colors hover:bg-[#2DD4A8]/[0.08] hover:text-ink"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="flex-shrink-0 font-mono text-[11px] text-ink/40">
                        {p.vialMg}mg · {p.waterMl}mL
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

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
      <label className="mb-1.5 block text-xs font-medium text-ink/55">
        {label} <span className="text-ink/30">({unit})</span>
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
                  ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.08] text-accent'
                  : 'border-ink/[0.08] bg-ink/[0.02] text-ink/55 hover:border-ink/[0.15] hover:text-ink/85'
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
        className="w-full rounded-xl border border-ink/[0.08] bg-ink/[0.03] px-4 py-2.5 font-mono text-base text-ink outline-none transition-colors focus:border-[#2DD4A8]/40"
      />
      {hint && <p className="mt-1 text-[10px] text-ink/30">{hint}</p>}
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
        fill="var(--panel)"
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
              className="fill-ink/40"
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
    <div className="overflow-x-auto rounded-xl border border-ink/[0.07]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-ink/[0.04]">
            <th className="px-3 py-2.5 text-left font-medium text-ink/55">Vial \ Water</th>
            {REF_WATERS.map((w) => (
              <th
                key={w}
                className="px-3 py-2.5 text-right font-mono font-medium text-ink/55"
              >
                {w} mL
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REF_VIALS.map((v) => (
            <tr key={v} className="border-t border-ink/[0.05]">
              <td className="px-3 py-2.5 font-mono text-ink/65">{v} mg</td>
              {REF_WATERS.map((w) => {
                const conc = (v * 100) / w
                const isCurrent = v === currentVial && w === currentWater
                return (
                  <td
                    key={w}
                    className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      isCurrent
                        ? 'bg-[#2DD4A8]/[0.1] font-semibold text-accent'
                        : 'text-ink/65'
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
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] font-mono text-[11px] font-semibold text-accent">
      {n}
    </span>
  )
}
