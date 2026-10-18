'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  NotebookPen,
  CalendarClock,
  Package,
  Lock,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { PEPTIDES } from '@/lib/peptides'
import {
  getTracker,
  addLogEntry,
  removeLogEntry,
  addProtocol,
  updateProtocol,
  removeProtocol,
  addVial,
  updateVial,
  removeVial,
  exportTracker,
  clearTracker,
  costPerDose,
  nextDue,
  type LogEntry,
  type Protocol,
  type Vial,
  type VialStatus,
} from '@/lib/tracker'

type Tab = 'log' | 'protocols' | 'stock'

// Compound suggestions for the pickers — catalog name → slug.
const COMPOUNDS = PEPTIDES.map((p) => ({ label: p.name, slug: p.slug })).sort((a, b) =>
  a.label.localeCompare(b.label),
)

function parsePositive(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function slugFor(label: string): string | undefined {
  const hit = COMPOUNDS.find((c) => c.label.toLowerCase() === label.trim().toLowerCase())
  return hit?.slug
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const TABS: { id: Tab; label: string; Icon: typeof NotebookPen }[] = [
  { id: 'log', label: 'Log', Icon: NotebookPen },
  { id: 'protocols', label: 'Protocols', Icon: CalendarClock },
  { id: 'stock', label: 'Stock', Icon: Package },
]

const INTERVAL_PRESETS = [
  { label: 'Daily', hours: 24 },
  { label: 'EOD', hours: 48 },
  { label: '2× / week', hours: 84 },
  { label: 'Weekly', hours: 168 },
]

export default function TrackerPage() {
  const [tab, setTab] = useState<Tab>('log')
  const [mounted, setMounted] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [vials, setVials] = useState<Vial[]>([])

  function refresh() {
    const t = getTracker()
    setLog(t.log)
    setProtocols(t.protocols)
    setVials(t.vials)
  }

  useEffect(() => {
    setMounted(true)
    refresh()
  }, [])

  function handleExport() {
    const blob = new Blob([exportTracker()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `peptide-tracker-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClear() {
    if (confirm('Delete all tracker data on this device? This cannot be undone.')) {
      clearTracker()
      refresh()
    }
  }

  const hasData = log.length > 0 || protocols.length > 0 || vials.length > 0

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <NotebookPen className="h-4 w-4 text-accent" />
          Protocol Tracker
          <span className="ml-1 rounded-full border border-accent/30 bg-accent/[0.10] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            Beta
          </span>
        </span>
        {mounted && hasData && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 rounded-lg border border-hairline-strong px-2.5 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/20 hover:text-ink"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg border border-hairline-strong px-2.5 py-1.5 text-xs font-medium text-ink/60 hover:border-red-400/40 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        )}
      </header>

      <section className="border-b border-hairline px-6 py-10 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Research protocol tracker</h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55">
            A private bench logbook — record what a research protocol consisted of, plan its cadence, and track
            vials from sealed to empty with a live cost-per-dose.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink/55">
            <Lock className="h-3.5 w-3.5 text-accent/70" />
            Private to this browser — stored locally, never uploaded. No account, no server.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-ink/60">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>
              Research record-keeping only — not medical advice, not a dosing tool, and not a medical device.
              Entries describe laboratory research, not human use.
            </span>
          </div>
        </div>
      </section>

      <div className="border-b border-hairline px-6 md:px-10">
        <div className="mx-auto flex max-w-4xl gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                tab === id
                  ? 'border-accent text-ink'
                  : 'border-transparent text-ink/50 hover:text-ink/80'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-4xl">
          {!mounted ? (
            <p className="text-sm text-ink/50">Loading…</p>
          ) : tab === 'log' ? (
            <LogTab entries={log} onChange={refresh} />
          ) : tab === 'protocols' ? (
            <ProtocolsTab protocols={protocols} onChange={refresh} />
          ) : (
            <StockTab vials={vials} onChange={refresh} />
          )}
        </div>
      </section>

      <footer className="border-t border-hairline px-6 py-6 md:px-10">
        <div className="mx-auto max-w-4xl text-xs text-ink/45">
          Need the dilution math?{' '}
          <Link href="/tools/calculator-beta" className="text-accent hover:underline">
            Open the beta calculator
          </Link>{' '}
          for reconstitution, steady-state and clearance.
        </div>
      </footer>
    </div>
  )
}

// A shared compound <input> backed by a datalist of catalog names.
function CompoundInput({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (v: string) => void
  id: string
}) {
  return (
    <>
      <input
        list={`${id}-compounds`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Compound"
        className="w-full rounded-lg border border-hairline-strong bg-fill px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent/50 focus:outline-none"
      />
      <datalist id={`${id}-compounds`}>
        {COMPOUNDS.map((c) => (
          <option key={c.slug} value={c.label} />
        ))}
      </datalist>
    </>
  )
}

const fieldClass =
  'w-full rounded-lg border border-hairline-strong bg-fill px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent/50 focus:outline-none'

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-fill p-8 text-center text-sm text-ink/50">
      {children}
    </div>
  )
}

// --- Log --------------------------------------------------------------------

function LogTab({ entries, onChange }: { entries: LogEntry[]; onChange: () => void }) {
  const [label, setLabel] = useState('')
  const [dose, setDose] = useState('')
  const [site, setSite] = useState('')
  const [feeling, setFeeling] = useState('')
  const [notes, setNotes] = useState('')

  function add() {
    const doseMcg = parsePositive(dose)
    if (!label.trim() || doseMcg <= 0) return
    addLogEntry({
      ts: Date.now(),
      slug: slugFor(label),
      label: label.trim(),
      doseMcg,
      site: site.trim() || undefined,
      feeling: feeling ? Number(feeling) : undefined,
      notes: notes.trim() || undefined,
    })
    setLabel('')
    setDose('')
    setSite('')
    setFeeling('')
    setNotes('')
    onChange()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-fill p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink/80">Record an administration</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CompoundInput id="log" value={label} onChange={setLabel} />
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            inputMode="decimal"
            placeholder="Dose (mcg)"
            className={fieldClass}
          />
          <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site (optional)" className={fieldClass} />
          <select value={feeling} onChange={(e) => setFeeling(e.target.value)} className={fieldClass}>
            <option value="">How it felt (optional)</option>
            <option value="1">1 · Poor</option>
            <option value="2">2</option>
            <option value="3">3 · Neutral</option>
            <option value="4">4</option>
            <option value="5">5 · Great</option>
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes / side effects (optional)"
            className={`${fieldClass} sm:col-span-2`}
          />
        </div>
        <button
          onClick={add}
          disabled={!label.trim() || parsePositive(dose) <= 0}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5BA88C] px-4 py-2 text-sm font-semibold text-[#0E1512] hover:bg-[#6FBF9A] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add entry
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState>No entries yet. Record your first administration above.</EmptyState>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-hairline bg-fill px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {e.slug ? (
                    <Link href={`/catalog/${e.slug}`} className="text-sm font-semibold text-ink/90 hover:text-accent">
                      {e.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-ink/90">{e.label}</span>
                  )}
                  <span className="text-sm text-ink/60">{e.doseMcg.toLocaleString()} mcg</span>
                  {e.feeling != null && (
                    <span className="rounded-full border border-hairline-strong px-1.5 py-0.5 text-[10px] text-ink/55">
                      felt {e.feeling}/5
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-ink/50">
                  {fmtDate(e.ts)}
                  {e.site ? ` · ${e.site}` : ''}
                  {e.notes ? ` · ${e.notes}` : ''}
                </div>
              </div>
              <button
                onClick={() => {
                  removeLogEntry(e.id)
                  onChange()
                }}
                aria-label="Delete entry"
                className="shrink-0 text-ink/40 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Protocols --------------------------------------------------------------

function ProtocolsTab({ protocols, onChange }: { protocols: Protocol[]; onChange: () => void }) {
  const [label, setLabel] = useState('')
  const [dose, setDose] = useState('')
  const [interval, setIntervalHours] = useState('168')

  function add() {
    const doseMcg = parsePositive(dose)
    const intervalHours = parsePositive(interval)
    if (!label.trim() || doseMcg <= 0 || intervalHours <= 0) return
    addProtocol({
      slug: slugFor(label),
      label: label.trim(),
      doseMcg,
      intervalHours,
      startTs: Date.now(),
      active: true,
    })
    setLabel('')
    setDose('')
    onChange()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-fill p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink/80">Plan a protocol</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CompoundInput id="proto" value={label} onChange={setLabel} />
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            inputMode="decimal"
            placeholder="Dose (mcg)"
            className={fieldClass}
          />
          <select value={interval} onChange={(e) => setIntervalHours(e.target.value)} className={fieldClass}>
            {INTERVAL_PRESETS.map((p) => (
              <option key={p.hours} value={p.hours}>
                {p.label} ({p.hours} h)
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={add}
          disabled={!label.trim() || parsePositive(dose) <= 0}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5BA88C] px-4 py-2 text-sm font-semibold text-[#0E1512] hover:bg-[#6FBF9A] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add protocol
        </button>
      </div>

      {protocols.length === 0 ? (
        <EmptyState>No protocols yet. Plan one above to see its next scheduled administration.</EmptyState>
      ) : (
        <div className="space-y-2">
          {protocols.map((p) => {
            const due = nextDue(p)
            return (
              <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-hairline bg-fill px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {p.slug ? (
                      <Link href={`/catalog/${p.slug}`} className="text-sm font-semibold text-ink/90 hover:text-accent">
                        {p.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-ink/90">{p.label}</span>
                    )}
                    <span className="text-sm text-ink/60">
                      {p.doseMcg.toLocaleString()} mcg · every {p.intervalHours} h
                    </span>
                    {!p.active && (
                      <span className="rounded-full border border-hairline-strong px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink/45">
                        paused
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink/50">
                    <Clock className="h-3 w-3" />
                    {p.active && due ? `Next due ${fmtDate(due)}` : 'Paused'}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      updateProtocol(p.id, { active: !p.active })
                      onChange()
                    }}
                    className="rounded-lg border border-hairline-strong px-2 py-1 text-xs text-ink/55 hover:border-ink/20 hover:text-ink"
                  >
                    {p.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => {
                      removeProtocol(p.id)
                      onChange()
                    }}
                    aria-label="Delete protocol"
                    className="text-ink/40 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Stock ------------------------------------------------------------------

function StockTab({ vials, onChange }: { vials: Vial[]; onChange: () => void }) {
  const [label, setLabel] = useState('')
  const [mg, setMg] = useState('')
  const [cost, setCost] = useState('')
  const [dose, setDose] = useState('')

  function add() {
    const totalMg = parsePositive(mg)
    if (!label.trim() || totalMg <= 0) return
    addVial({
      slug: slugFor(label),
      label: label.trim(),
      totalMg,
      bacWaterMl: 0,
      cost: parsePositive(cost) || undefined,
      status: 'sealed',
    })
    setLabel('')
    setMg('')
    setCost('')
    onChange()
  }

  const doseMcg = parsePositive(dose)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-fill p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink/80">Add a vial</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CompoundInput id="stock" value={label} onChange={setLabel} />
          <input value={mg} onChange={(e) => setMg(e.target.value)} inputMode="decimal" placeholder="Mass (mg)" className={fieldClass} />
          <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" placeholder="Cost (optional)" className={fieldClass} />
        </div>
        <button
          onClick={add}
          disabled={!label.trim() || parsePositive(mg) <= 0}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5BA88C] px-4 py-2 text-sm font-semibold text-[#0E1512] hover:bg-[#6FBF9A] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add vial
        </button>

        <div className="mt-5 border-t border-hairline pt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink/60">
            Cost-per-dose preview — per-injection amount (mcg)
          </label>
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 250"
            className={`${fieldClass} max-w-xs`}
          />
          <p className="mt-2 text-xs text-ink/45">
            Applied to each vial below with a known cost.
          </p>
        </div>
      </div>

      {vials.length === 0 ? (
        <EmptyState>No vials yet. Add one above to track it from sealed to empty with a cost-per-dose.</EmptyState>
      ) : (
        <div className="space-y-2">
          {vials.map((v) => {
            const cpd = doseMcg > 0 ? costPerDose(v.totalMg, doseMcg, v.cost) : null
            return (
              <div key={v.id} className="flex items-start justify-between gap-3 rounded-xl border border-hairline bg-fill px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {v.slug ? (
                      <Link href={`/catalog/${v.slug}`} className="text-sm font-semibold text-ink/90 hover:text-accent">
                        {v.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-ink/90">{v.label}</span>
                    )}
                    <span className="text-sm text-ink/60">{v.totalMg} mg</span>
                    {v.cost != null && <span className="text-sm text-ink/60">· {fmtMoney(v.cost)}</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-ink/50">
                    {cpd ? (
                      <>
                        {cpd.dosesPerVial.toLocaleString(undefined, { maximumFractionDigits: 1 })} doses/vial
                        {cpd.costPerDose != null && <> · {fmtMoney(cpd.costPerDose)}/dose</>}
                      </>
                    ) : (
                      <>Enter a per-injection amount above to see cost-per-dose</>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={v.status}
                    onChange={(e) => {
                      const status = e.target.value as VialStatus
                      updateVial(v.id, {
                        status,
                        openedTs: status === 'open' && !v.openedTs ? Date.now() : v.openedTs,
                      })
                      onChange()
                    }}
                    className="rounded-lg border border-hairline-strong bg-fill px-2 py-1 text-xs text-ink/70 focus:border-accent/50 focus:outline-none"
                  >
                    <option value="sealed">Sealed</option>
                    <option value="open">Open</option>
                    <option value="empty">Empty</option>
                  </select>
                  <button
                    onClick={() => {
                      removeVial(v.id)
                      onChange()
                    }}
                    aria-label="Delete vial"
                    className="text-ink/40 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
