'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Syringe,
  AlertTriangle,
  FlaskConical,
  Share2,
  Check,
  ArrowRightLeft,
  Search,
  X,
  ExternalLink,
} from 'lucide-react'
import {
  RECON_PRESETS,
  RECON_PRESET_GROUPS,
  type ReconPreset,
} from '@/lib/reconstitution-presets'

const VIAL_PRESETS_MG = [2, 5, 10, 15, 20, 30, 50]
const DOSE_PRESETS_MCG = [100, 250, 500, 750, 1000, 1500, 2000]
const VIAL_PRESETS_IU = [4, 10, 12, 15, 24, 36]
const DOSE_PRESETS_IU = [1, 2, 3, 4, 5, 8]
const DRAW_PRESETS = [10, 20, 25, 50]
const REF_VIALS = [2, 5, 10]
const REF_WATERS = [1, 2, 3, 5]

// GLP-1 pre-filled pens. Tirzepatide, semaglutide, and retatrutide are commonly
// supplied both as lyophilized vials and as multi-dose pens. A pen arrives
// already in solution, so there is no bacteriostatic water to add — only a fixed
// fill volume set at the factory.
const PEN_PRESETS_MG = [5, 10, 15, 20, 30]
const PEN_FILL_PRESETS = [0.5, 1, 1.5, 2, 3]
// Tirzepatide-style titration ladder, stored in mcg but surfaced in mg. This is
// the crux of pen mode: one pen carries a research subject through the whole
// escalating range, so the per-injection aliquot changes every few weeks.
const PEN_DOSE_PRESETS_MCG = [2500, 5000, 7500, 10000, 12500, 15000]

type Measurement = 'mcg' | 'iu'
type Mode = 'forward' | 'reverse'
type Form = 'vial' | 'pen'

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

export default function CalculatorBetaPage() {
  const [measurement, setMeasurement] = useState<Measurement>('mcg')
  const [mode, setMode] = useState<Mode>('forward')
  const [form, setForm] = useState<Form>('vial')
  const [vialMg, setVialMg] = useState('5')
  const [doseMcg, setDoseMcg] = useState('250')
  const [vialIu, setVialIu] = useState('10')
  const [doseIu, setDoseIu] = useState('2')
  const [waterMl, setWaterMl] = useState('2')
  const [drawUnits, setDrawUnits] = useState('20')
  const [loaded, setLoaded] = useState<ReconPreset | null>(null)
  const [copied, setCopied] = useState(false)

  // Prefill from a shared link.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    // A ?pep= slug seeds the vial/water/dose from the catalog preset; explicit
    // params below then override any of those fields.
    const pep = p.get('pep')
    const preset = pep ? RECON_PRESETS.find((x) => x.slug === pep) ?? null : null
    if (preset) {
      setMeasurement('mcg')
      setForm('vial')
      setVialMg(String(preset.vialMg))
      setDoseMcg(String(preset.doseMcg))
      setWaterMl(String(preset.waterMl))
      setLoaded(preset)
    }
    const m = p.get('m')
    if (m === 'iu' || m === 'mcg') setMeasurement(m)
    const md = p.get('mode')
    if (md === 'r') setMode('reverse')
    else if (md === 'f') setMode('forward')
    const fm = p.get('f')
    if (fm === 'pen') setForm('pen')
    else if (fm === 'vial') setForm('vial')
    const v = p.get('v')
    const d = p.get('d')
    const w = p.get('w')
    const u = p.get('u')
    if (w) setWaterMl(w)
    if (u) setDrawUnits(u)
    if (m === 'iu') {
      if (v) setVialIu(v)
      if (d) setDoseIu(d)
    } else {
      if (v) setVialMg(v)
      if (d) setDoseMcg(d)
    }
  }, [])

  const isIu = measurement === 'iu'
  // Pens are a peptide (mcg) format only — IU biologics don't ship this way.
  const isPen = !isIu && form === 'pen'
  // A pen's fill volume is fixed at the factory, so there's nothing to reverse-solve.
  const reverse = mode === 'reverse' && !isPen
  const unitLabel = isIu ? 'IU' : 'mcg'
  const vialUnit = isIu ? 'IU' : 'mg'
  const liquidLabel = isPen ? 'Pen fill volume' : 'Bacteriostatic water to add'
  const vialValue = isIu ? vialIu : vialMg
  const setVialValue = isIu ? setVialIu : setVialMg
  const doseValue = isIu ? doseIu : doseMcg
  const setDoseValue = isIu ? setDoseIu : setDoseMcg

  const calc = useMemo(() => {
    const dose = parsePositive(doseValue)
    const draw = parsePositive(drawUnits)
    // Vial amount expressed in the dose unit: mcg (mg × 1000) or IU (as entered).
    const vialAmount = isIu
      ? parsePositive(vialIu)
      : parsePositive(vialMg) * 1000

    // Forward: user types the water/fill. Reverse: solve water for a target draw.
    const water = reverse
      ? dose > 0
        ? (vialAmount * (draw * 0.01)) / dose
        : 0
      : parsePositive(waterMl)

    const concentrationPerMl = water > 0 ? vialAmount / water : 0
    const concentrationPerTick = concentrationPerMl / 10
    const volumePerInjectionMl =
      concentrationPerMl > 0 ? dose / concentrationPerMl : 0
    const unitsPerInjection = volumePerInjectionMl * 100
    const dosesPerVial = dose > 0 ? Math.floor(vialAmount / dose) : 0
    return {
      dose,
      vialAmount,
      water,
      concentrationPerMl,
      concentrationPerTick,
      volumePerInjectionMl,
      unitsPerInjection,
      dosesPerVial,
    }
  }, [isIu, reverse, vialMg, vialIu, doseValue, waterMl, drawUnits])

  const onConcentrationEdit = (raw: string) => {
    const c = parseFloat(raw)
    if (Number.isFinite(c) && c > 0 && calc.vialAmount > 0) {
      const newWater = calc.vialAmount / (c * 10)
      setWaterMl(newWater >= 0.01 ? newWater.toFixed(2) : '')
    }
  }

  // Catalog presets describe a lyophilized vial reconstitution, so loading one
  // snaps the calculator to mcg · vial · forward before seeding the fields.
  const loadPreset = (p: ReconPreset) => {
    setMeasurement('mcg')
    setForm('vial')
    setMode('forward')
    setVialMg(String(p.vialMg))
    setDoseMcg(String(p.doseMcg))
    setWaterMl(String(p.waterMl))
    setLoaded(p)
  }
  const clearLoaded = () => setLoaded(null)
  // Changing measurement or form invalidates the "loaded" label (its numbers
  // were a vial recipe), so drop it when the user switches context.
  const selectMeasurement = (m: Measurement) => {
    setMeasurement(m)
    setLoaded(null)
  }
  const selectForm = (f: Form) => {
    setForm(f)
    setLoaded(null)
  }

  const summary = useMemo(() => {
    const v = parsePositive(vialValue)
    const d = parsePositive(doseValue)
    if (!(v > 0 && d > 0 && calc.water > 0))
      return isPen
        ? 'Enter the pen size, dose, and fill volume to see a summary.'
        : 'Enter a vial amount, dose, and water volume to see a summary.'
    const water = fmt(calc.water)
    const conc = fmt(calc.concentrationPerTick)
    const vol = fmt(calc.volumePerInjectionMl, 3)
    const u = fmt(calc.unitsPerInjection, 1)
    const doses = calc.dosesPerVial
    if (reverse)
      return `For a ${fmt(d)} ${unitLabel} dose drawn at ${fmt(
        parsePositive(drawUnits),
        1,
      )} units, add ${water} mL BAC water to a ${fmt(v)} ${vialUnit} vial (${conc} ${unitLabel}/0.1 mL).`
    if (isPen)
      return `A ${fmt(
        v,
      )} ${vialUnit} pen holding ${water} mL → ${conc} ${unitLabel}/0.1 mL. Each ${fmt(
        d,
      )} ${unitLabel} dose is ${u} units (${vol} mL)${
        doses > 0 ? ` — about ${doses} doses per pen at this step` : ''
      }.`
    return `Add ${water} mL BAC water to a ${fmt(
      v,
    )} ${vialUnit} vial → ${conc} ${unitLabel}/0.1 mL. Draw ${u} units (${vol} mL) for a ${fmt(
      d,
    )} ${unitLabel} dose.`
  }, [
    vialValue,
    doseValue,
    drawUnits,
    reverse,
    isPen,
    unitLabel,
    vialUnit,
    calc.water,
    calc.concentrationPerTick,
    calc.volumePerInjectionMl,
    calc.unitsPerInjection,
    calc.dosesPerVial,
  ])

  const share = async () => {
    const p = new URLSearchParams()
    p.set('m', measurement)
    p.set('mode', mode === 'reverse' ? 'r' : 'f')
    p.set('f', form)
    p.set('v', vialValue)
    p.set('d', doseValue)
    p.set('w', waterMl)
    p.set('u', drawUnits)
    if (loaded) p.set('pep', loaded.slug)
    const url = `${window.location.origin}${window.location.pathname}?${p.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#2DD4A8]/15">
          <Syringe className="h-4 w-4 text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium">Peptide Calculator</span>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
          Beta
        </span>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* ── Beta banner ── */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <FlaskConical
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80"
            strokeWidth={1.75}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-300/90">
              Beta · in development
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink/50">
              An experimental calculator with extra modes we&apos;re still
              testing — features may change and this version isn&apos;t part of
              the offline app. For the stable, offline-installable tool, use the{' '}
              <Link
                href="/tools/reconstitution-calculator"
                className="text-accent underline-offset-2 hover:underline"
              >
                reconstitution calculator
              </Link>
              .
            </p>
          </div>
        </div>

        {/* ── Page heading ── */}
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Peptide Calculator <span className="text-amber-400/80">Beta</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            The reconstitution calculator plus experimental modes — a{' '}
            <span className="text-ink/80">pen mode for GLP-1s</span> (pre-filled
            pens and 10–50 mg vials), a reverse solver (water for a target draw),
            an IU mode for HGH &amp; GH, quick unit converters, and shareable
            links. Inputs and results update in real time.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/tools/blend-calculator"
              className="rounded-lg border border-ink/[0.08] px-3 py-2 text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent"
            >
              Blend calculator (beta) →
            </Link>
            <Link
              href="/learn/compatibility"
              className="rounded-lg border border-ink/[0.08] px-3 py-2 text-ink/60 transition-colors hover:border-[#2DD4A8]/25 hover:text-accent"
            >
              Compatibility &amp; stability guide →
            </Link>
          </div>
        </div>

        {/* ── Inputs ── */}
        <section className="mb-6 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
                Inputs
              </h2>
              {/* Mode toggle — a pen's fill volume is fixed, so there's no reverse solve. */}
              {!isPen && (
                <div className="inline-flex rounded-xl border border-ink/[0.08] bg-ink/[0.02] p-0.5 text-xs">
                  <Toggle active={mode === 'forward'} onClick={() => setMode('forward')}>
                    Solve for draw volume
                  </Toggle>
                  <Toggle active={mode === 'reverse'} onClick={() => setMode('reverse')}>
                    Solve for water to add
                  </Toggle>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Measurement toggle */}
              <div className="inline-flex self-start rounded-xl border border-ink/[0.08] bg-ink/[0.02] p-0.5 text-xs">
                <Toggle active={!isIu} onClick={() => selectMeasurement('mcg')}>
                  mcg · peptides
                </Toggle>
                <Toggle active={isIu} onClick={() => selectMeasurement('iu')}>
                  IU · HGH / GH
                </Toggle>
              </div>

              {/* Form toggle — vials are reconstituted; GLP-1 pens ship pre-filled. */}
              {!isIu && (
                <div className="inline-flex self-start rounded-xl border border-ink/[0.08] bg-ink/[0.02] p-0.5 text-xs">
                  <Toggle active={!isPen} onClick={() => selectForm('vial')}>
                    Vial · reconstitute
                  </Toggle>
                  <Toggle active={isPen} onClick={() => selectForm('pen')}>
                    Pen · pre-filled
                  </Toggle>
                </div>
              )}
            </div>
          </div>

          <p className="mb-5 text-xs leading-relaxed text-ink/40">
            {isPen
              ? 'Enter the pen size and its fill volume — get the per-dose draw and how many doses the pen holds. A pen ships pre-mixed, so there is no water to add.'
              : reverse
                ? 'Enter the draw size you want — get the exact bacteriostatic water to add. Handy for keeping a consistent draw across vials of different masses.'
                : 'Enter the water you plan to add — get your draw volume and concentration.'}
            {isIu && ' HGH and growth-hormone analogs are dosed in international units (IU), not mcg.'}
          </p>

          {/* ── Load a peptide (catalog presets) ── */}
          {!isIu && (
            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-medium text-ink/55">
                Load a peptide{' '}
                <span className="text-ink/30">
                  (autofills vial, water &amp; a reference amount)
                </span>
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
                Preset vial sizes and volumes reflect how these compounds are commonly supplied
                and dissolved for laboratory research. Amounts are calculation reference points
                only — not dosing guidance or medical advice. Adjust any field freely.
              </p>
              {isPen && (
                <p className="mt-1 text-[10px] leading-relaxed text-amber-400/70">
                  Loading a preset switches back to vial mode — catalog references describe
                  lyophilized vials, not pre-filled pens.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <NumberField
              label={isPen ? 'Amount in pen' : 'Amount in vial'}
              unit={vialUnit}
              value={vialValue}
              onChange={setVialValue}
              presets={isIu ? VIAL_PRESETS_IU : isPen ? PEN_PRESETS_MG : VIAL_PRESETS_MG}
              presetLabel={(n) => `${n}${vialUnit}`}
              onPreset={(n) => setVialValue(String(n))}
            />
            <NumberField
              label="Desired dose per injection"
              unit={unitLabel}
              value={doseValue}
              onChange={setDoseValue}
              presets={isIu ? DOSE_PRESETS_IU : isPen ? PEN_DOSE_PRESETS_MCG : DOSE_PRESETS_MCG}
              presetLabel={isPen ? (n) => `${n / 1000}mg` : (n) => `${n}${unitLabel}`}
              onPreset={(n) => setDoseValue(String(n))}
              hint={
                isPen
                  ? 'Tirzepatide-style titration steps — semaglutide runs lower (0.25–2.4 mg).'
                  : undefined
              }
            />

            {!reverse ? (
              <>
                <NumberField
                  label={liquidLabel}
                  unit="mL"
                  value={waterMl}
                  onChange={setWaterMl}
                  presets={isPen ? PEN_FILL_PRESETS : undefined}
                  presetLabel={isPen ? (n) => `${n} mL` : undefined}
                  onPreset={isPen ? (n) => setWaterMl(String(n)) : undefined}
                  hint={
                    isPen
                      ? 'The volume already in the pen — check the label (e.g. 10 mg / 2 mL).'
                      : "Edit either this OR the concentration below — they're linked."
                  }
                />
                <NumberField
                  label="Desired concentration"
                  unit={`${unitLabel} per 0.1 mL`}
                  value={
                    calc.concentrationPerTick > 0
                      ? calc.concentrationPerTick.toFixed(2).replace(/\.?0+$/, '')
                      : ''
                  }
                  onChange={onConcentrationEdit}
                  hint={
                    isPen
                      ? 'Auto-calculated from fill volume; type to override.'
                      : 'Auto-calculated from water volume; type to override.'
                  }
                />
              </>
            ) : (
              <NumberField
                label="Desired draw size"
                unit="units (U-100)"
                value={drawUnits}
                onChange={setDrawUnits}
                presets={DRAW_PRESETS}
                presetLabel={(n) => `${n}u`}
                onPreset={(n) => setDrawUnits(String(n))}
                hint="1 unit = 0.01 mL on a U-100 insulin syringe."
              />
            )}
          </div>
        </section>

        {/* ── Results ── */}
        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label={reverse ? 'BAC water to add' : isPen ? 'Fill volume' : 'Total water'}
            value={fmt(calc.water)}
            unit="mL"
            highlight={reverse}
          />
          <ResultCard
            label="Concentration"
            value={fmt(calc.concentrationPerTick)}
            unit={`${unitLabel} / 0.1 mL`}
            highlight={!reverse}
          />
          <ResultCard
            label={isPen ? 'Doses per pen' : 'Doses per vial'}
            value={calc.dosesPerVial > 0 ? calc.dosesPerVial.toString() : '—'}
            unit="injections"
          />
          <ResultCard
            label="Volume per injection"
            value={fmt(calc.volumePerInjectionMl, 3)}
            unit={`mL · ${fmt(calc.unitsPerInjection, 1)} units`}
            highlight={!reverse}
          />
        </section>

        {/* ── Summary + share ── */}
        <section className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-4">
          <p className="text-sm leading-relaxed text-ink/75">{summary}</p>
          <button
            type="button"
            onClick={share}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/20"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </>
            )}
          </button>
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
          {isPen && (
            <p className="mt-1 text-center text-[11px] text-ink/35">
              Shown as a draw into a U-100 syringe. Dialing the pen directly uses
              its own click scale — check the device insert.
            </p>
          )}
        </section>

        {/* ── Quick converters ── */}
        <section className="mb-10 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
            Quick Converters
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Converter leftUnit="mg" rightUnit="mcg" factor={1000} />
            <Converter leftUnit="mL" rightUnit="units" factor={100} />
            <Converter
              leftUnit="mg"
              rightUnit="IU"
              factor={3}
              note="HGH ≈ 3 IU per mg"
            />
          </div>
        </section>

        {/* ── Reference table (mcg vial mode only) ── */}
        {!isIu && !isPen && (
          <section className="mb-10 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5 md:p-6">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-accent/70">
              Quick Reference
            </h2>
            <p className="mb-4 text-xs text-ink/40">
              Concentration in mcg per 0.1 mL by vial size and water volume. Your current
              selection is highlighted.
            </p>
            <ReferenceTable
              currentVial={parsePositive(vialMg)}
              currentWater={calc.water}
            />
          </section>
        )}

        {/* ── Pen usage note (pen mode) ── */}
        {isPen && (
          <section className="mb-10 rounded-2xl border border-ink/[0.06] bg-ink/[0.02] p-5 md:p-6">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Using a Pre-Filled Pen
            </h2>
            <ul className="space-y-2.5 text-sm leading-relaxed text-ink/65">
              <li className="flex gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
                <span>
                  A pen ships already in solution — there is nothing to
                  reconstitute. Its concentration is fixed by the total peptide
                  and the fill volume printed on the label (e.g. 10 mg / 2 mL).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
                <span>
                  Across a titration the per-injection aliquot climbs while the
                  concentration stays put — so a single pen delivers fewer doses
                  as the dose escalates.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />
                <span>
                  Prime and dial per the device insert. The unit figure above
                  applies only if you instead draw the pen&apos;s solution into a
                  U-100 syringe.
                </span>
              </li>
            </ul>
          </section>
        )}

        {/* ── Educational content ── */}
        {!isPen && (
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
        )}

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

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'rounded-lg px-3 py-1.5 font-medium transition-colors ' +
        (active ? 'bg-[#2DD4A8]/15 text-accent' : 'text-ink/55 hover:text-ink')
      }
    >
      {children}
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

function Converter({
  leftUnit,
  rightUnit,
  factor,
  note,
}: {
  leftUnit: string
  rightUnit: string
  factor: number
  note?: string
}) {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const trim = (n: number) =>
    Number.isFinite(n) ? String(Number(n.toFixed(6))) : ''

  const onLeft = (v: string) => {
    setLeft(v)
    const n = parseFloat(v)
    setRight(Number.isFinite(n) ? trim(n * factor) : '')
  }
  const onRight = (v: string) => {
    setRight(v)
    const n = parseFloat(v)
    setLeft(Number.isFinite(n) ? trim(n / factor) : '')
  }

  return (
    <div className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-3">
      <div className="flex items-center gap-2">
        <ConvInput unit={leftUnit} value={left} onChange={onLeft} />
        <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-ink/30" />
        <ConvInput unit={rightUnit} value={right} onChange={onRight} />
      </div>
      {note && <p className="mt-2 text-[10px] text-ink/30">{note}</p>}
    </div>
  )
}

function ConvInput({
  unit,
  value,
  onChange,
}: {
  unit: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-1 rounded-lg border border-ink/[0.08] bg-ink/[0.03] px-2 py-1.5 focus-within:border-[#2DD4A8]/40">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full min-w-0 bg-transparent font-mono text-sm text-ink placeholder:text-ink/25 outline-none"
      />
      <span className="shrink-0 text-[10px] text-ink/35">{unit}</span>
    </label>
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
