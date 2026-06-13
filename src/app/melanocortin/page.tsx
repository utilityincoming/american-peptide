'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Microscope,
  MessageSquare,
  Calendar,
  Info,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Drug {
  id: string
  name: string
  brand: string
  sponsor: string
  targetShort: string
  targetFull: string
  structure: string
  sequence?: string
  indication: string
  approvedYear: number
  expandedIndications?: string
  route: string
  note?: string
  accent: string
}

interface Receptor {
  id: string
  location: string
  primaryFunction: string
  keyAgonist: string
  maturity: 'approved' | 'clinical' | 'preclinical'
}

interface PipelineEntry {
  name: string
  sponsor: string
  target: string
  modality: string
  phase: string
  indication: string
  status: 'active' | 'planned'
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const DRUGS: Drug[] = [
  {
    id: 'setmelanotide',
    name: 'Setmelanotide',
    brand: 'IMCIVREE',
    sponsor: 'Rhythm Pharmaceuticals',
    targetShort: 'MC4R',
    targetFull: 'MC4R (selective)',
    structure: '8-amino-acid cyclic peptide',
    indication: 'Obesity from POMC, PCSK1, or LEPR deficiency',
    approvedYear: 2020,
    expandedIndications: 'Bardet-Biedl syndrome, Alström syndrome',
    route: 'Daily subcutaneous injection',
    accent: '#2DD4A8',
  },
  {
    id: 'bremelanotide',
    name: 'Bremelanotide',
    brand: 'Vyleesi / PT-141',
    sponsor: 'Palatin Technologies / AMAG Pharmaceuticals',
    targetShort: 'MC4R + MC1R',
    targetFull: 'MC4R and MC1R (nonselective)',
    structure: '7-amino-acid cyclic peptide',
    sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH',
    indication: 'Hypoactive sexual desire disorder in premenopausal women',
    approvedYear: 2019,
    route: 'On-demand subcutaneous injection',
    note: 'Derived from Melanotan II',
    accent: '#818cf8',
  },
  {
    id: 'afamelanotide',
    name: 'Afamelanotide',
    brand: 'Scenesse',
    sponsor: 'Clinuvel Pharmaceuticals',
    targetShort: 'MC1R',
    targetFull: 'MC1R (selective)',
    structure: '13-amino-acid linear peptide (α-MSH analog)',
    indication: 'Erythropoietic protoporphyria phototoxicity',
    approvedYear: 2019,
    route: 'Subcutaneous implant every 2 months',
    note: 'Increases eumelanin production',
    accent: '#f59e0b',
  },
]

const RECEPTORS: Receptor[] = [
  {
    id: 'MC1R',
    location: 'Skin, melanocytes, immune cells',
    primaryFunction: 'Pigmentation (eumelanin synthesis), UV protection, immune modulation',
    keyAgonist: 'Afamelanotide (Scenesse)',
    maturity: 'approved',
  },
  {
    id: 'MC2R',
    location: 'Adrenal cortex',
    primaryFunction: 'Adrenal steroidogenesis — sole known receptor for ACTH',
    keyAgonist: 'None approved',
    maturity: 'preclinical',
  },
  {
    id: 'MC3R',
    location: 'Brain, gut, immune cells',
    primaryFunction: 'Energy homeostasis, anti-inflammatory signaling, feeding behavior',
    keyAgonist: 'Under investigation',
    maturity: 'clinical',
  },
  {
    id: 'MC4R',
    location: 'Hypothalamus, limbic system',
    primaryFunction: 'Appetite, energy expenditure, sexual function, autonomic control',
    keyAgonist: 'Setmelanotide, Bremelanotide',
    maturity: 'approved',
  },
  {
    id: 'MC5R',
    location: 'Exocrine glands, skin, skeletal muscle',
    primaryFunction: 'Exocrine secretion, sebum production, immune function',
    keyAgonist: 'None approved',
    maturity: 'preclinical',
  },
]

// Relative binding activity (0–100) for visualization — not exact Ki/EC50 values
const RADAR_DATA = [
  { receptor: 'MC1R', Setmelanotide: 18, Bremelanotide: 72, Afamelanotide: 95 },
  { receptor: 'MC2R', Setmelanotide: 2,  Bremelanotide: 5,  Afamelanotide: 2  },
  { receptor: 'MC3R', Setmelanotide: 38, Bremelanotide: 52, Afamelanotide: 22 },
  { receptor: 'MC4R', Setmelanotide: 92, Bremelanotide: 82, Afamelanotide: 28 },
  { receptor: 'MC5R', Setmelanotide: 14, Bremelanotide: 42, Afamelanotide: 16 },
]

const PIPELINE: PipelineEntry[] = [
  {
    name: 'PL7737',
    sponsor: 'Palatin Technologies',
    target: 'MC4R',
    modality: 'Oral small molecule',
    phase: 'Phase 1 planned 2026',
    indication: 'Obesity',
    status: 'planned',
  },
  {
    name: 'Next-gen MC4R peptide agonists',
    sponsor: 'Palatin Technologies',
    target: 'MC4R',
    modality: 'Once-weekly subcutaneous peptide',
    phase: 'Phase 1 mid-2026',
    indication: 'Hypothalamic obesity',
    status: 'planned',
  },
  {
    name: 'Setmelanotide (expanded indications)',
    sponsor: 'Rhythm Pharmaceuticals',
    target: 'MC4R',
    modality: 'Daily subcutaneous',
    phase: 'Phase 3 ongoing',
    indication: 'Additional genetic obesity subtypes',
    status: 'active',
  },
]

const MATURITY = {
  approved:   { label: 'Approved',        dot: 'bg-[#2DD4A8]',    badge: 'bg-[#2DD4A8]/10 text-[#2DD4A8] border-[#2DD4A8]/20',      ring: 'border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.03]' },
  clinical:   { label: 'Clinical Trials', dot: 'bg-amber-400',    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       ring: 'border-amber-500/15 bg-amber-500/[0.02]'  },
  preclinical:{ label: 'Preclinical',     dot: 'bg-white/20',     badge: 'bg-white/[0.04] text-white/35 border-white/10',            ring: 'border-white/[0.07] bg-white/[0.015]'     },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2DD4A8]/60">
        {eyebrow}
      </p>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm text-white/40 md:text-base">{subtitle}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">
        {label}
      </p>
      <p className="text-xs leading-relaxed text-white/60">{value}</p>
    </div>
  )
}

function Tag({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
        accent ? 'bg-[#2DD4A8]/10 text-[#2DD4A8]' : 'bg-white/[0.05] text-white/50'
      }`}
    >
      {label}
    </span>
  )
}

function DrugCard({ drug }: { drug: Drug }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        borderColor: open ? `${drug.accent}40` : 'rgba(255,255,255,0.07)',
        backgroundColor: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
      }}
    >
      {/* Coloured top bar */}
      <div
        className="h-0.5 w-full flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${drug.accent}80, ${drug.accent}20, transparent)`,
        }}
      />

      <div className="flex flex-1 flex-col p-6">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">{drug.name}</h3>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${drug.accent}18`,
                  color: drug.accent,
                }}
              >
                FDA {drug.approvedYear}
              </span>
            </div>
            <p className="text-sm text-white/35">{drug.brand}</p>
          </div>
          <div
            className="flex-shrink-0 rounded-lg border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: `${drug.accent}35`,
              color: drug.accent,
              backgroundColor: `${drug.accent}10`,
            }}
          >
            {drug.targetShort}
          </div>
        </div>

        {/* Indication */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-white/55">
          <span className="font-medium text-white/70">Indication: </span>
          {drug.indication}
        </p>

        {/* Expanded detail panel */}
        {open && (
          <div className="mb-4 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <DetailRow label="Sponsor" value={drug.sponsor} />
            <DetailRow label="Target" value={drug.targetFull} />
            <DetailRow label="Structure" value={drug.structure} />
            {drug.sequence && (
              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-white/25">
                  Sequence
                </p>
                <code className="block font-mono text-xs leading-relaxed text-[#2DD4A8]/80">
                  {drug.sequence}
                </code>
              </div>
            )}
            <DetailRow label="Route of administration" value={drug.route} />
            {drug.expandedIndications && (
              <DetailRow label="Also approved for" value={drug.expandedIndications} />
            )}
            {drug.note && <DetailRow label="Note" value={drug.note} />}
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white"
          >
            {open ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> View details
              </>
            )}
          </button>
          <Link
            href={`/research?q=${encodeURIComponent(
              `Tell me about ${drug.name} (${drug.brand}) as a melanocortin receptor agonist — mechanism, clinical data, and development history`,
            )}`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: `${drug.accent}15`, color: drug.accent }}
          >
            Ask AI <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReceptorCard({ receptor }: { receptor: Receptor }) {
  const m = MATURITY[receptor.maturity]
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 transition-all duration-200 hover:brightness-110 ${m.ring}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-2xl font-bold text-white">{receptor.id}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.badge}`}
        >
          {m.label}
        </span>
      </div>
      <div className="space-y-2.5 text-xs">
        <div>
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">
            Location
          </p>
          <p className="text-white/50">{receptor.location}</p>
        </div>
        <div>
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">
            Function
          </p>
          <p className="leading-relaxed text-white/50">{receptor.primaryFunction}</p>
        </div>
        <div>
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">
            Key agonist
          </p>
          <p
            className={`font-medium ${
              receptor.maturity === 'approved'
                ? 'text-[#2DD4A8]'
                : receptor.maturity === 'clinical'
                  ? 'text-amber-400'
                  : 'text-white/30'
            }`}
          >
            {receptor.keyAgonist}
          </p>
        </div>
      </div>
    </div>
  )
}

function RadarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1A2E] p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="ml-auto pl-3 text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function ToolCard({
  icon,
  title,
  description,
  href,
  cta,
  accent = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  cta: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
        accent
          ? 'border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.05] hover:border-[#2DD4A8]/40 hover:bg-[#2DD4A8]/[0.08]'
          : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.035]'
      }`}
    >
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? 'bg-[#2DD4A8]/15 text-[#2DD4A8]' : 'bg-white/[0.06] text-white/50'
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 font-semibold text-white">{title}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-white/45">{description}</p>
      <div
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
          accent ? 'text-[#2DD4A8]' : 'text-white/40 group-hover:text-white/70'
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MelanocortinPage() {
  return (
    <div className="relative min-h-screen bg-[#0B1220] text-white">

      {/* Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 select-none">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.18) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-40 right-1/3 h-[450px] w-[450px] rounded-full bg-[#2DD4A8] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-1/2 left-1/4 h-80 w-80 rounded-full bg-purple-500 opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-1/2 h-96 w-96 rounded-full bg-amber-500 opacity-[0.025] blur-[120px]" />
      </div>

      {/* ── Page identity / metadata ── */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-4 md:px-10">
        <span className="text-sm font-medium text-white/70">
          Melanocortin Research Hub
        </span>
        <div className="flex items-center gap-1.5 text-xs text-white/25">
          <Calendar className="h-3.5 w-3.5" />
          Last updated: May 2026
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10">

        {/* ── Hero ── */}
        <section className="mb-20 max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.07] px-3.5 py-1.5 text-xs font-medium text-[#2DD4A8]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4A8] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4A8]" />
            </span>
            Therapeutic Class Review · Melanocortin System
          </div>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Melanocortin Agonist
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#818cf8] bg-clip-text text-transparent">
              Research Hub
            </span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/50">
            Exploring MC1R–MC5R receptor agonists — from FDA-approved therapeutics to
            next-generation candidates. 3 approved therapies · 5 receptor subtypes · expanding
            pipeline.
          </p>

          {/* Hero stat pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { value: '3', label: 'FDA-Approved Therapies' },
              { value: '5', label: 'Receptor Subtypes' },
              { value: '3+', label: 'Pipeline Candidates' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5"
              >
                <span className="text-xl font-bold text-[#2DD4A8]">{value}</span>
                <span className="text-sm text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Approved Therapies ── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Approved Therapeutics"
            title="FDA-Approved Melanocortin Agonists"
            subtitle="Three approved therapies targeting the melanocortin system across distinct therapeutic indications"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {DRUGS.map((drug) => (
              <DrugCard key={drug.id} drug={drug} />
            ))}
          </div>
        </section>

        {/* ── Receptor Map ── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Receptor Biology"
            title="Melanocortin Receptor Map"
            subtitle="Five distinct receptor subtypes with different tissue distributions, functions, and therapeutic development status"
          />

          {/* Legend */}
          <div className="mb-5 flex flex-wrap items-center gap-5">
            {(Object.entries(MATURITY) as [keyof typeof MATURITY, (typeof MATURITY)[keyof typeof MATURITY]][]).map(
              ([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ),
            )}
          </div>

          {/* Receptor grid */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {RECEPTORS.map((r) => (
              <ReceptorCard key={r.id} receptor={r} />
            ))}
          </div>

          {/* Radar chart */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 md:p-8">
            <div className="mb-1">
              <h3 className="text-base font-semibold text-white">
                Receptor Binding Selectivity Profiles
              </h3>
              <p className="mt-1 text-xs text-white/35">
                Relative binding activity across MC1R–MC5R for each FDA-approved agonist
              </p>
            </div>
            <p className="mb-6 flex items-center gap-1.5 text-[10px] text-white/25">
              <Info className="h-3 w-3 flex-shrink-0" />
              Normalized relative values (0–100) for visualization only — not exact K<sub>i</sub> or
              EC<sub>50</sub> data.
            </p>
            <div className="h-72 w-full md:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="receptor"
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600 }}
                  />
                  <Radar
                    name="Setmelanotide"
                    dataKey="Setmelanotide"
                    stroke="#2DD4A8"
                    fill="#2DD4A8"
                    fillOpacity={0.13}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Bremelanotide"
                    dataKey="Bremelanotide"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.13}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Afamelanotide"
                    dataKey="Afamelanotide"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.13}
                    strokeWidth={2}
                  />
                  <Tooltip content={<RadarTooltip />} />
                  <Legend
                    formatter={(value: string) => (
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>
                        {value}
                      </span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Pipeline ── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Emerging Candidates"
            title="Melanocortin Agonist Pipeline"
            subtitle="Next-generation candidates advancing toward and through clinical development as of May 2026"
          />

          <div className="space-y-4">
            {PIPELINE.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition-colors hover:border-white/[0.11] hover:bg-white/[0.03] sm:flex-row sm:items-start"
              >
                {/* Status badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span
                    className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                      item.status === 'active'
                        ? 'bg-[#2DD4A8]/10 text-[#2DD4A8]'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.status === 'active' ? '● Active' : '◎ Planned'}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="text-base font-semibold text-white">{item.name}</h4>
                    <span className="text-sm text-white/35">{item.sponsor}</span>
                  </div>
                  <p className="mb-3 text-sm text-white/55">{item.indication}</p>
                  <div className="flex flex-wrap gap-2">
                    <Tag label={item.target} />
                    <Tag label={item.modality} />
                    <Tag label={item.phase} accent />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Research Tools ── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Platform Tools"
            title="Continue Your Research"
            subtitle="Use AmericanPeptide's integrated tools to go deeper into melanocortin biology and therapeutic development"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <ToolCard
              icon={<FlaskConical className="h-5 w-5" />}
              title="Search PubChem"
              description="Browse melanocortin compound structures, properties, and bioactivity data"
              href="/research?q=Search+PubChem+for+melanocortin+peptide+agonist+compounds+and+their+chemical+properties"
              cta="Search compounds"
            />
            <ToolCard
              icon={<Microscope className="h-5 w-5" />}
              title="Find Clinical Trials"
              description="Discover active and recruiting melanocortin trials from ClinicalTrials.gov"
              href="/trials?q=melanocortin+agonist"
              cta="Browse trials"
            />
            <ToolCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Ask the AI Agent"
              description="Deep-dive into melanocortin receptor biology with the Peptide Agent"
              href="/research?q=Give+me+a+comprehensive+overview+of+the+melanocortin+system%2C+its+five+receptor+subtypes%2C+and+the+therapeutic+applications+of+MC+receptor+agonists"
              cta="Open Peptide Agent"
              accent
            />
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-col gap-2 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/" className="transition-colors hover:text-white/60">
                AmericanPeptide.com
              </Link>
              <span className="text-white/15">·</span>
              <span>Melanocortin Research Hub</span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> May 2026
              </span>
            </div>
            <Link
              href="/research"
              className="transition-colors hover:text-white/60"
            >
              Peptide Agent →
            </Link>
          </div>

          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
            <p className="text-xs leading-relaxed text-amber-400/60">
              <span className="font-semibold text-amber-400/80">Research Disclaimer: </span>
              This page contains curated scientific information for research purposes only. Regulatory
              approval status, clinical trial phases, pipeline timelines, and receptor binding data
              reflect publicly available information as of May 2026 and may not reflect current
              regulatory status or commercial availability. Receptor binding selectivity values in
              the chart are normalized estimates for visualization and are not exact K<sub>i</sub>,
              IC<sub>50</sub>, or EC<sub>50</sub> values. AmericanPeptide.com is not a medical
              device and nothing herein constitutes medical advice, diagnosis, or treatment
              recommendations. All data requires independent verification before scientific or
              clinical use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
