'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Check,
  Delete,
  Dna,
  Eraser,
  FlaskConical,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  AMINO_ACIDS,
  AA_BY_CODE,
  AA_CATEGORIES,
  CATEGORY_BY_ID,
  sequenceStats,
  toThreeLetter,
  type SequenceStats,
} from '@/lib/amino-acids'

const STORAGE_KEY = 'amp-peptideforge'
const XP_PER_RESIDUE = 5

interface Challenge {
  id: string
  title: string
  description: string
  xp: number
  test: (s: SequenceStats) => boolean
}

const CHALLENGES: Challenge[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Chain together 3 residues.',
    xp: 50,
    test: (s) => s.length >= 3,
  },
  {
    id: 'disulfide',
    title: 'Disulfide Ready',
    description: 'Include 2 cysteines (a potential disulfide bridge).',
    xp: 80,
    test: (s) => s.cysteines >= 2,
  },
  {
    id: 'chain-builder',
    title: 'Chain Builder',
    description: 'Reach a 10-residue chain.',
    xp: 100,
    test: (s) => s.length >= 10,
  },
  {
    id: 'heavyweight',
    title: 'Heavyweight',
    description: 'Build past 1,000 Da.',
    xp: 100,
    test: (s) => s.mass > 1000,
  },
  {
    id: 'polar-express',
    title: 'Polar Express',
    description: 'Use 5 or more polar residues.',
    xp: 100,
    test: (s) => s.counts.polar >= 5,
  },
  {
    id: 'aromatic-trio',
    title: 'Aromatic Trio',
    description: 'Include 3 aromatic residues (F, W, Y, H).',
    xp: 120,
    test: (s) => s.aromatic >= 3,
  },
  {
    id: 'charged-up',
    title: 'Charged Up',
    description: 'Reach a net charge of +3 or higher.',
    xp: 120,
    test: (s) => s.netCharge >= 3,
  },
  {
    id: 'hydrophobe',
    title: 'Hydrophobe',
    description: 'Push GRAVY above +1.5 (min 5 residues).',
    xp: 150,
    test: (s) => s.length >= 5 && s.gravy > 1.5,
  },
  {
    id: 'balanced',
    title: 'Balanced Design',
    description: 'Include all four residue categories.',
    xp: 150,
    test: (s) => s.distinctCategories === 4,
  },
  {
    id: 'icosapeptide',
    title: 'Icosapeptide Master',
    description: 'Build a 20-residue peptide.',
    xp: 200,
    test: (s) => s.length >= 20,
  },
]

interface Level {
  level: number
  title: string
  min: number // cumulative XP needed
}

const LEVELS: Level[] = [
  { level: 1, title: 'Novice', min: 0 },
  { level: 2, title: 'Apprentice', min: 150 },
  { level: 3, title: 'Bench Chemist', min: 400 },
  { level: 4, title: 'Synthesist', min: 800 },
  { level: 5, title: 'Peptide Architect', min: 1300 },
  { level: 6, title: 'Forge Master', min: 2000 },
]

function levelFor(xp: number) {
  let current = LEVELS[0]
  for (const l of LEVELS) if (xp >= l.min) current = l
  const next = LEVELS.find((l) => l.min > current.min) ?? null
  const base = current.min
  const span = next ? next.min - base : 1
  const into = xp - base
  const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100
  return { current, next, pct }
}

interface Persisted {
  xp: number
  completed: string[]
}

export default function PeptideForgePage() {
  const [seq, setSeq] = useState<string[]>([])
  const [xp, setXp] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<Challenge | null>(null)
  const hydrated = useRef(false)
  const flashTimer = useRef<number | null>(null)

  // Hydrate from localStorage once.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted
        if (typeof parsed.xp === 'number') setXp(parsed.xp)
        if (Array.isArray(parsed.completed))
          setCompleted(new Set(parsed.completed.filter((x) => typeof x === 'string')))
      }
    } catch {
      /* ignore */
    } finally {
      hydrated.current = true
    }
  }, [])

  // Persist progress (not the working sequence).
  useEffect(() => {
    if (!hydrated.current) return
    try {
      const data: Persisted = { xp, completed: [...completed] }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [xp, completed])

  const stats = useMemo(() => sequenceStats(seq), [seq])

  // Evaluate challenges whenever the sequence changes.
  useEffect(() => {
    if (!hydrated.current) return
    const newlyDone: Challenge[] = []
    for (const ch of CHALLENGES) {
      if (!completed.has(ch.id) && ch.test(stats)) newlyDone.push(ch)
    }
    if (newlyDone.length === 0) return

    setCompleted((prev) => {
      const next = new Set(prev)
      newlyDone.forEach((c) => next.add(c.id))
      return next
    })
    setXp((prev) => prev + newlyDone.reduce((acc, c) => acc + c.xp, 0))
    setFlash(newlyDone[newlyDone.length - 1])
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 3200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats])

  const add = useCallback((code: string) => {
    if (!AA_BY_CODE[code]) return
    setSeq((prev) => [...prev, code])
    setXp((prev) => prev + XP_PER_RESIDUE)
  }, [])

  const removeLast = useCallback(() => {
    setSeq((prev) => prev.slice(0, -1))
  }, [])

  const clear = useCallback(() => setSeq([]), [])

  // Keyboard: letter keys append, Backspace removes last.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable)
        return
      if (e.key === 'Backspace') {
        e.preventDefault()
        removeLast()
        return
      }
      const k = e.key.toUpperCase()
      if (k.length === 1 && AA_BY_CODE[k]) {
        add(k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [add, removeLast])

  const { current, next, pct } = levelFor(xp)
  const doneCount = completed.size
  const sequenceString = seq.join('')

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Page identity ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/compounds"
          className="text-sm text-ink/35 transition-colors hover:text-ink"
        >
          Compounds
        </Link>
        <span className="text-ink/20">/</span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Dna className="h-4 w-4 text-accent" />
          PeptideForge
        </span>
      </header>

      {/* ── Hero / level strip ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-8 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-medium text-accent">
              <Sparkles className="h-3 w-3" />
              PeptideForge · Build & score your own peptide
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Forge a peptide, residue by residue
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55 md:text-base">
              Tap amino acids to grow a chain and watch the chemistry update
              live. Clear challenges to earn XP and level up your bench cred.
            </p>
          </div>

          {/* Level card */}
          <div className="w-full shrink-0 rounded-2xl border border-ink/[0.08] bg-ink/[0.025] p-4 md:w-72">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-accent" />
                Lv {current.level} · {current.title}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-ink/55">
                <Zap className="h-3 w-3 text-accent" />
                {xp} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2DD4A8] to-[#5EEBC8] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink/40">
              {next
                ? `${next.min - xp} XP to Lv ${next.level} · ${next.title}`
                : 'Max level reached — Forge Master!'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Challenge completion flash ── */}
      {flash && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#2DD4A8]/30 bg-panel px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2DD4A8]/15">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Challenge complete: {flash.title}
              </p>
              <p className="text-xs text-accent">+{flash.xp} XP</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1fr_300px]">
        {/* ── Builder column ── */}
        <div className="space-y-6">
          {/* Sequence display */}
          <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Your peptide
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={removeLast}
                  disabled={seq.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/[0.08] px-2.5 py-1 text-[11px] text-ink/55 transition-colors hover:border-ink/15 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Delete className="h-3 w-3" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={clear}
                  disabled={seq.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/[0.08] px-2.5 py-1 text-[11px] text-ink/55 transition-colors hover:border-ink/15 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Eraser className="h-3 w-3" />
                  Clear
                </button>
              </div>
            </div>

            {seq.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink/[0.10] px-4 py-10 text-center text-sm text-ink/35">
                Tap an amino acid below (or press its letter key) to start your
                chain.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-ink/30">
                    H₂N–
                  </span>
                  {seq.map((code, i) => {
                    const aa = AA_BY_CODE[code]
                    const cat = CATEGORY_BY_ID[aa.category]
                    return (
                      <span
                        key={`${code}-${i}`}
                        title={`${aa.name} (${aa.three})`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border font-mono text-sm font-semibold ${cat.border} ${cat.bg} ${cat.text}`}
                      >
                        {code}
                      </span>
                    )
                  })}
                  <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-ink/30">
                    –COOH
                  </span>
                </div>
                <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-ink/45">
                  {toThreeLetter(seq)}
                </p>
              </>
            )}
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Length" value={`${stats.length}`} unit="aa" />
            <Stat
              label="Mass"
              value={stats.mass ? stats.mass.toFixed(1) : '0'}
              unit="Da"
            />
            <Stat label="GRAVY" value={stats.gravy.toFixed(2)} />
            <Stat
              label="Net charge"
              value={stats.netCharge > 0 ? `+${stats.netCharge}` : `${stats.netCharge}`}
            />
          </div>

          {/* Composition */}
          {stats.length > 0 && (
            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Composition
              </h2>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-ink/[0.05]">
                {AA_CATEGORIES.map((c) => {
                  const n = stats.counts[c.id]
                  if (n === 0) return null
                  const pctw = (n / stats.length) * 100
                  return (
                    <div
                      key={c.id}
                      className={c.solid}
                      style={{ width: `${pctw}%` }}
                      title={`${c.label}: ${n}`}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
                {AA_CATEGORIES.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${c.solid}`} />
                    <span className="text-ink/55">{c.label}</span>
                    <span className="font-mono text-ink/35">
                      {stats.counts[c.id]}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Palette */}
          <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
              Amino acids
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {AMINO_ACIDS.map((aa) => {
                const cat = CATEGORY_BY_ID[aa.category]
                return (
                  <button
                    key={aa.code}
                    type="button"
                    onClick={() => add(aa.code)}
                    title={`${aa.name} · ${aa.residueMass.toFixed(1)} Da · press ${aa.code}`}
                    className={`group flex flex-col items-center rounded-xl border bg-ink/[0.02] py-2.5 transition-all hover:-translate-y-0.5 ${cat.border} ${cat.hoverBg}`}
                  >
                    <span className={`font-mono text-lg font-bold ${cat.text}`}>
                      {aa.code}
                    </span>
                    <span className="text-[10px] text-ink/45">{aa.three}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Synthesis CTA */}
          <div className="overflow-hidden rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <FlaskConical className="h-4 w-4 text-accent" />
                  Forge it for real
                </h2>
                <p className="mt-1 max-w-md text-sm text-ink/55">
                  {seq.length >= 2
                    ? `Custom synthesis of your ${stats.length}-mer (~${stats.mass.toFixed(0)} Da) launches with the marketplace. Join the waitlist to request a quote.`
                    : 'Build a sequence, then request a custom-synthesis quote. Synthesis launches with the marketplace.'}
                </p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0]"
              >
                Request synthesis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {sequenceString && (
              <p className="mt-4 break-all rounded-lg border border-ink/[0.06] bg-black/30 px-3 py-2 font-mono text-[11px] text-accent">
                {sequenceString}
              </p>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-ink/30">
            PeptideForge is an educational sandbox. Calculated mass, GRAVY, and
            charge are simplified estimates for learning — not a synthesis spec.
            Independent validation required for any experimental use.
          </p>
        </div>

        {/* ── Challenges sidebar ── */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                Challenges
              </h2>
              <span className="font-mono text-[11px] text-ink/40">
                {doneCount}/{CHALLENGES.length}
              </span>
            </div>
            <ul className="space-y-2">
              {CHALLENGES.map((ch) => {
                const done = completed.has(ch.id)
                return (
                  <li
                    key={ch.id}
                    className={
                      'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ' +
                      (done
                        ? 'border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.06]'
                        : 'border-ink/[0.06] bg-ink/[0.02]')
                    }
                  >
                    <div
                      className={
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ' +
                        (done
                          ? 'border-[#2DD4A8] bg-[#2DD4A8] text-[#0B1220]'
                          : 'border-ink/20')
                      }
                    >
                      {done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={
                            'text-[13px] font-medium ' +
                            (done ? 'text-ink' : 'text-ink/80')
                          }
                        >
                          {ch.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-accent/70">
                          +{ch.xp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink/45">
                        {ch.description}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.025] px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-ink/40">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-ink">
        {value}
        {unit && <span className="ml-1 text-xs text-ink/35">{unit}</span>}
      </p>
    </div>
  )
}
