'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Cpu,
  FileCheck2,
  Filter,
  Flag,
  FlaskConical,
  PencilRuler,
  Replace,
  Scissors,
  Snowflake,
  TestTubes,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import type { SynthesisStage } from '@/lib/synthesis'

const ICONS: Record<string, LucideIcon> = {
  PencilRuler,
  Cpu,
  Scissors,
  Filter,
  Replace,
  Snowflake,
  TestTubes,
  FileCheck2,
  Truck,
}

const TEAL = '#2DD4A8'
const FAINT = 'rgba(255,255,255,0.12)'

/**
 * Animated SVG for a single synthesis stage. Each visual is ambient (looping)
 * rather than one-shot, so it reads as "alive" whether it scrolls into view or
 * sits in the sticky desktop panel. Motion is disabled under
 * prefers-reduced-motion via the sw-* classes in globals.css.
 */
function StageVisual({ slug }: { slug: string }) {
  // useId keeps gradient/clip ids unique across the many instances rendered
  // (sticky panel + one per mobile card). Strip colons for valid url(#…) refs.
  const uid = useId().replace(/:/g, '')

  switch (slug) {
    /* 1 — Sequence design & specification */
    case 'design': {
      const letters = ['H', 'K', 'I', 'G', 'A', 'Q', 'K']
      return (
        <Svg label="Sequence specification sheet">
          <rect x="48" y="44" width="224" height="232" rx="14" fill="rgba(255,255,255,0.025)" stroke={FAINT} />
          <text x="68" y="78" fontSize="11" fill={TEAL} fontFamily="monospace" letterSpacing="2">
            SPECIFICATION
          </text>
          <line x1="68" y1="90" x2="252" y2="90" stroke={FAINT} />
          {letters.map((l, i) => (
            <g key={i} className="sw-pulse" style={{ animationDelay: `${i * 0.22}s` }}>
              <rect x={68 + i * 26} y="108" width="22" height="26" rx="4" fill={`${TEAL}1f`} stroke={`${TEAL}55`} />
              <text x={68 + i * 26 + 11} y="126" fontSize="13" fill={TEAL} fontFamily="monospace" textAnchor="middle">
                {l}
              </text>
            </g>
          ))}
          {['target purity ≥ 98%', 'salt form: acetate', 'release criteria locked'].map((t, i) => (
            <g key={t}>
              <circle cx="74" cy={170 + i * 30} r="3" fill={`${TEAL}aa`} />
              <text x="86" y={174 + i * 30} fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="monospace">
                {t}
              </text>
            </g>
          ))}
        </Svg>
      )
    }

    /* 2 — Solid-phase peptide synthesis (chain climbs the resin) */
    case 'spps': {
      const nodes = [248, 216, 184, 152, 120, 88]
      return (
        <Svg label="Peptide chain assembled on resin">
          <defs>
            <radialGradient id={`spps-node-${uid}`} cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#8ef3da" />
              <stop offset="55%" stopColor={TEAL} />
              <stop offset="100%" stopColor="#0f7a63" />
            </radialGradient>
          </defs>
          {/* resin bead */}
          <circle cx="160" cy="280" r="24" fill={`${TEAL}1a`} stroke={`${TEAL}66`} strokeWidth="1.5" />
          <text x="160" y="285" fontSize="13" fill={TEAL} fontFamily="monospace" textAnchor="middle">
            R
          </text>
          {/* backbone */}
          <polyline
            points={`160,280 ${nodes.map((y, i) => `${i % 2 === 0 ? 142 : 178},${y}`).join(' ')}`}
            fill="none"
            stroke={`${TEAL}88`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {nodes.map((y, i) => {
            const x = i % 2 === 0 ? 142 : 178
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={i % 2 === 0 ? x - 22 : x + 22} y2={y - 12} stroke={`${TEAL}40`} strokeWidth="2" strokeLinecap="round" />
                <circle cx={i % 2 === 0 ? x - 22 : x + 22} cy={y - 12} r="4.5" fill={`${TEAL}66`} />
                <circle cx={x} cy={y} r="11" fill={`url(#spps-node-${uid})`} stroke="rgba(255,255,255,0.18)" />
              </g>
            )
          })}
          {/* coupling frontier climbing the chain */}
          <g className="sw-rise">
            <circle cx="160" cy="262" r="18" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.7" />
            <circle cx="160" cy="262" r="6" fill="#8ef3da" />
          </g>
          <text x="160" y="34" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            + one residue per cycle
          </text>
        </Svg>
      )
    }

    /* 3 — Cleavage & global deprotection */
    case 'cleavage': {
      return (
        <Svg label="Peptide cleaved from resin">
          <circle cx="92" cy="248" r="24" fill={`${TEAL}1a`} stroke={`${TEAL}66`} strokeWidth="1.5" />
          <text x="92" y="253" fontSize="13" fill={TEAL} fontFamily="monospace" textAnchor="middle">
            R
          </text>
          <line x1="116" y1="232" x2="150" y2="208" stroke={FAINT} strokeWidth="2" strokeDasharray="4 5" />
          {/* freed chain floats up-right */}
          <g className="sw-float2">
            <polyline
              points="156,206 186,176 216,196 246,166"
              fill="none"
              stroke={`${TEAL}aa`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[
              [156, 206],
              [186, 176],
              [216, 196],
              [246, 166],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="9" fill={TEAL} fillOpacity="0.85" stroke="rgba(255,255,255,0.2)" />
            ))}
          </g>
          {/* protecting groups falling away */}
          {[
            [150, 150, -26],
            [196, 138, 8],
            [232, 120, 28],
            [120, 200, -18],
          ].map(([x, y, dx], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="rgba(255,255,255,0.4)"
              className="sw-fall"
              style={{ '--dx': `${dx}px`, animationDelay: `${i * 0.5}s` } as CSSProperties}
            />
          ))}
          <text x="160" y="294" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            cleave · deprotect · precipitate
          </text>
        </Svg>
      )
    }

    /* 4 — Preparative HPLC purification (detector sweep + clean peak) */
    case 'purification': {
      return (
        <Svg label="HPLC chromatogram resolving a clean peak">
          {/* axes */}
          <line x1="48" y1="250" x2="288" y2="250" stroke={FAINT} strokeWidth="1.5" />
          <line x1="48" y1="60" x2="48" y2="250" stroke={FAINT} strokeWidth="1.5" />
          {/* crude noise + small impurity peaks */}
          <polyline
            points="48,250 92,242 110,232 124,244 150,250 250,250 270,246 288,250"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1.5"
          />
          {/* the target peak */}
          <path
            d="M150,250 C176,250 182,96 196,96 C210,96 216,250 242,250 Z"
            fill={`${TEAL}1f`}
            stroke={TEAL}
            strokeWidth="2.5"
          />
          {/* detector sweep */}
          <g className="sw-scan">
            <line x1="50" y1="58" x2="50" y2="252" stroke={`${TEAL}cc`} strokeWidth="2" />
            <circle cx="50" cy="58" r="3.5" fill="#8ef3da" />
          </g>
          <text x="196" y="84" fontSize="11" fill={TEAL} fontFamily="monospace" textAnchor="middle">
            ≥ 98%
          </text>
          <text x="118" y="224" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="monospace" textAnchor="middle">
            impurities
          </text>
        </Svg>
      )
    }

    /* 5 — Counterion exchange & salt form */
    case 'counterion': {
      return (
        <Svg label="Counterion exchanged from TFA to acetate">
          <rect x="118" y="128" width="84" height="64" rx="16" fill={`${TEAL}1a`} stroke={`${TEAL}66`} />
          <text x="160" y="165" fontSize="12" fill={TEAL} fontFamily="monospace" textAnchor="middle">
            peptide
          </text>
          {/* outgoing TFA */}
          <g className="sw-crossA">
            {[
              [70, 96],
              [250, 104],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 28} y={y - 14} width="56" height="26" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,120,120,0.4)" />
                <text x={x} y={y + 3} fontSize="10" fill="rgba(255,150,150,0.85)" fontFamily="monospace" textAnchor="middle">
                  CF₃COO⁻
                </text>
              </g>
            ))}
          </g>
          {/* incoming acetate */}
          <g className="sw-crossB">
            {[
              [70, 224],
              [250, 216],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 30} y={y - 14} width="60" height="26" rx="8" fill={`${TEAL}10`} stroke={`${TEAL}66`} />
                <text x={x} y={y + 3} fontSize="10" fill={TEAL} fontFamily="monospace" textAnchor="middle">
                  CH₃COO⁻
                </text>
              </g>
            ))}
          </g>
          <text x="160" y="290" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            TFA → acetate
          </text>
        </Svg>
      )
    }

    /* 6 — Lyophilization (sublimation forms the cake) */
    case 'lyophilization': {
      return (
        <Svg label="Purified peptide freeze-dried into a cake">
          {/* vial */}
          <path
            d="M120,70 H200 V96 L196,108 V250 a14,14 0 0 1 -14,14 H134 a14,14 0 0 1 -14,-14 V108 L120,96 Z"
            fill="rgba(255,255,255,0.025)"
            stroke={FAINT}
            strokeWidth="1.5"
          />
          <rect x="128" y="58" width="64" height="16" rx="4" fill="rgba(255,255,255,0.06)" stroke={FAINT} />
          {/* porous cake */}
          <rect x="128" y="214" width="64" height="44" rx="6" fill={`${TEAL}26`} stroke={`${TEAL}66`} />
          {[
            [140, 226],
            [156, 234],
            [172, 224],
            [182, 240],
            [148, 246],
            [168, 250],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(11,18,32,0.6)" />
          ))}
          {/* sublimation vapor */}
          {[
            [144, 210],
            [160, 210],
            [176, 210],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill={`${TEAL}99`}
              className="sw-vapor"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          ))}
          <Snowflakes />
          <text x="160" y="292" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            freeze · vacuum · sublimate
          </text>
        </Svg>
      )
    }

    /* 7 — Fill, finish & vialing */
    case 'fill-finish': {
      const vials = [70, 140, 210]
      return (
        <Svg label="Material dispensed into vials">
          {vials.map((x, i) => (
            <g key={i}>
              <rect x={x} y="92" width="40" height="150" rx="12" fill="rgba(255,255,255,0.025)" stroke={FAINT} strokeWidth="1.5" />
              <rect x={x + 6} y="80" width="28" height="16" rx="4" fill="rgba(255,255,255,0.06)" stroke={FAINT} />
              <rect
                x={x + 4}
                y="118"
                width="32"
                height="120"
                rx="8"
                fill={`${TEAL}33`}
                className="sw-fill"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            </g>
          ))}
          <text x="160" y="276" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            controlled environment · sealed · labeled
          </text>
        </Svg>
      )
    }

    /* 8 — QC & certificate of analysis */
    case 'qc': {
      const rows = ['identity · MS', 'purity · HPLC', 'water · KF', 'endotoxin · LAL']
      return (
        <Svg label="Certificate of analysis with passing checks">
          <rect x="56" y="44" width="208" height="232" rx="14" fill="rgba(255,255,255,0.025)" stroke={FAINT} />
          <text x="76" y="76" fontSize="10" fill={TEAL} fontFamily="monospace" letterSpacing="1.5">
            CERTIFICATE OF ANALYSIS
          </text>
          <line x1="76" y1="88" x2="244" y2="88" stroke={FAINT} />
          {/* mini chromatogram */}
          <path d="M76,128 C104,128 108,100 120,100 C132,100 136,128 164,128" fill="none" stroke={`${TEAL}aa`} strokeWidth="1.5" />
          <line x1="76" y1="128" x2="244" y2="128" stroke={FAINT} />
          {rows.map((r, i) => (
            <g key={r}>
              <circle
                cx="84"
                cy={164 + i * 28}
                r="8"
                fill={`${TEAL}1f`}
                stroke={`${TEAL}66`}
                className="sw-blink"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
              <path
                d={`M80,${164 + i * 28} l3,3 l5,-6`}
                fill="none"
                stroke={TEAL}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sw-blink"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
              <text x="102" y={168 + i * 28} fontSize="11" fill="rgba(255,255,255,0.6)" fontFamily="monospace">
                {r}
              </text>
            </g>
          ))}
        </Svg>
      )
    }

    /* 9 — Storage, cold chain & distribution */
    case 'cold-chain': {
      return (
        <Svg label="Cold chain from lab to bench">
          {/* route */}
          <line x1="56" y1="180" x2="264" y2="180" stroke={FAINT} strokeWidth="2" strokeDasharray="3 8" />
          {[56, 160, 264].map((x, i) => (
            <circle key={i} cx={x} cy="180" r="5" fill={`${TEAL}88`} />
          ))}
          <text x="56" y="208" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace" textAnchor="middle">
            lab
          </text>
          <text x="264" y="208" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace" textAnchor="middle">
            bench
          </text>
          {/* moving cold package */}
          <g className="sw-move">
            <rect x="48" y="156" width="34" height="30" rx="5" fill={`${TEAL}26`} stroke={`${TEAL}88`} />
            <path d="M60,168 l3,3 l6,-7" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* thermometer holding cold */}
          <g>
            <rect x="150" y="70" width="20" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke={FAINT} />
            <circle cx="160" cy="132" r="14" fill={`${TEAL}33`} stroke={`${TEAL}88`} />
            <rect x="156" y="92" width="8" height="42" rx="4" fill={TEAL} />
          </g>
          <Snowflakes />
          <text x="160" y="262" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace" textAnchor="middle">
            short · cold · accountable
          </text>
        </Svg>
      )
    }

    default:
      return (
        <Svg label="Synthesis stage">
          <circle cx="160" cy="160" r="60" fill={`${TEAL}1a`} stroke={`${TEAL}66`} />
        </Svg>
      )
  }
}

function Svg({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

function Snowflakes() {
  return (
    <g className="sw-pulse">
      {[
        [70, 90],
        [250, 110],
        [240, 250],
        [80, 240],
      ].map(([x, y], i) => (
        <text key={i} x={x} y={y} fontSize="14" fill={`${TEAL}66`} textAnchor="middle">
          ❄
        </text>
      ))}
    </g>
  )
}

export default function SynthesisWalk({ stages }: { stages: SynthesisStage[] }) {
  const [active, setActive] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            if (!Number.isNaN(idx)) setActive(idx)
          }
        }
      },
      // Trigger when a stage crosses the vertical centre band of the viewport.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    const els = sectionRefs.current.filter(Boolean) as HTMLElement[]
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const activeStage = stages[active]

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
      {/* ── Sticky animated visual (desktop) ── */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-ink/[0.07] bg-ink/[0.02]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div key={active} className="sw-enter absolute inset-6">
              <StageVisual slug={activeStage.slug} />
            </div>
          </div>

          {/* progress + active label */}
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-accent/70">
                Step {activeStage.num} / {stages.length}
              </span>
              <span className="text-[11px] text-ink/40">{activeStage.title.split(' (')[0]}</span>
            </div>
            <div className="flex gap-1.5">
              {stages.map((s, i) => (
                <button
                  key={s.slug}
                  onClick={() =>
                    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                  aria-label={`Go to step ${s.num}: ${s.title}`}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i === active ? 'bg-[#2DD4A8]' : 'bg-ink/10 hover:bg-ink/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrolling stage cards ── */}
      <div className="space-y-5">
        {stages.map((s, i) => {
          const Icon = ICONS[s.icon] ?? FlaskConical
          return (
            <article
              key={s.slug}
              id={s.slug}
              data-index={i}
              ref={(el) => {
                sectionRefs.current[i] = el
              }}
              className="scroll-mt-24 rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-6 md:p-7"
            >
              {/* Inline visual — mobile only */}
              <div className="mb-5 aspect-[5/3] w-full overflow-hidden rounded-xl border border-ink/[0.06] bg-ink/[0.015] lg:hidden">
                <div className="mx-auto h-full max-w-[260px]">
                  <StageVisual slug={s.slug} />
                </div>
              </div>

              <div className="mb-4 flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2DD4A8]/12 text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-accent/70">
                    Step {s.num} / {stages.length}
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink/45">{s.summary}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-ink/70">
                {s.detail.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {s.cost && (
                  <div className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/70">
                      What it costs
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-ink/60">{s.cost}</p>
                  </div>
                )}
                {s.risk && (
                  <div className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-400/70">
                      Where purity is lost
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-ink/60">{s.risk}</p>
                  </div>
                )}
                {s.americanStandard && (
                  <div className="rounded-xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] px-4 py-3 sm:col-span-2">
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent/80">
                      <Flag className="h-3 w-3" />
                      The American standard
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-ink/65">{s.americanStandard}</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
