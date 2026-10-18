// Local-first research-protocol tracker — client-side only.
//
// RESEARCH RECORD-KEEPING ONLY. This is a private bench logbook, not a dosing
// tool and not medical advice. It records what a research protocol consisted of
// (compound, amount, timing, observations) the same way a lab notebook would.
//
// Privacy is the product: everything lives in this browser's localStorage. No
// account, no server, no analytics, nothing leaves the device — the same model
// as the Design Lab and Workspace. All functions guard `typeof window`, so they
// are safe to import anywhere but only return real data client-side.
//
// Pure derivations (cost-per-dose, next-due) are exported separately so they can
// be unit-tested without a DOM.

const KEY = 'amp-tracker-v1'

export type VialStatus = 'sealed' | 'open' | 'empty'

/** A single recorded administration in a research protocol. */
export interface LogEntry {
  id: string
  ts: number
  /** Catalog slug, when the compound is in the catalog. */
  slug?: string
  label: string
  doseMcg: number
  site?: string
  /** Subjective 1–5 "how the subject felt", optional. */
  feeling?: number
  sideEffects?: string
  notes?: string
}

/** A planned protocol — compound, amount and cadence. */
export interface Protocol {
  id: string
  slug?: string
  label: string
  doseMcg: number
  intervalHours: number
  startTs: number
  active: boolean
  notes?: string
}

/** A tracked vial, from sealed through reconstituted to empty. */
export interface Vial {
  id: string
  slug?: string
  label: string
  /** Peptide mass in the vial, milligrams. */
  totalMg: number
  /** Bacteriostatic water added on reconstitution, mL (0 until opened). */
  bacWaterMl: number
  /** Acquisition cost in the user's currency, optional. */
  cost?: number
  openedTs?: number
  status: VialStatus
}

export interface TrackerState {
  log: LogEntry[]
  protocols: Protocol[]
  vials: Vial[]
}

const EMPTY: TrackerState = { log: [], protocols: [], vials: [] }

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function read(): TrackerState {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { log: [], protocols: [], vials: [] }
    const parsed = JSON.parse(raw) as Partial<TrackerState>
    return {
      log: Array.isArray(parsed.log) ? parsed.log : [],
      protocols: Array.isArray(parsed.protocols) ? parsed.protocols : [],
      vials: Array.isArray(parsed.vials) ? parsed.vials : [],
    }
  } catch {
    return { log: [], protocols: [], vials: [] }
  }
}

function write(state: TrackerState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota / privacy mode — ignore, same as the rest of the app */
  }
}

export function getTracker(): TrackerState {
  return read()
}

// --- Log --------------------------------------------------------------------

export function addLogEntry(entry: Omit<LogEntry, 'id'>): LogEntry {
  const state = read()
  const full: LogEntry = { ...entry, id: uid() }
  state.log = [full, ...state.log].slice(0, 2000)
  write(state)
  return full
}

export function removeLogEntry(id: string): void {
  const state = read()
  state.log = state.log.filter((e) => e.id !== id)
  write(state)
}

// --- Protocols --------------------------------------------------------------

export function addProtocol(protocol: Omit<Protocol, 'id'>): Protocol {
  const state = read()
  const full: Protocol = { ...protocol, id: uid() }
  state.protocols = [full, ...state.protocols].slice(0, 200)
  write(state)
  return full
}

export function updateProtocol(id: string, patch: Partial<Omit<Protocol, 'id'>>): void {
  const state = read()
  state.protocols = state.protocols.map((p) => (p.id === id ? { ...p, ...patch } : p))
  write(state)
}

export function removeProtocol(id: string): void {
  const state = read()
  state.protocols = state.protocols.filter((p) => p.id !== id)
  write(state)
}

// --- Vials / stock ----------------------------------------------------------

export function addVial(vial: Omit<Vial, 'id'>): Vial {
  const state = read()
  const full: Vial = { ...vial, id: uid() }
  state.vials = [full, ...state.vials].slice(0, 200)
  write(state)
  return full
}

export function updateVial(id: string, patch: Partial<Omit<Vial, 'id'>>): void {
  const state = read()
  state.vials = state.vials.map((v) => (v.id === id ? { ...v, ...patch } : v))
  write(state)
}

export function removeVial(id: string): void {
  const state = read()
  state.vials = state.vials.filter((v) => v.id !== id)
  write(state)
}

// --- Export / clear ---------------------------------------------------------

/** Serialize the whole tracker for a manual, on-device backup. */
export function exportTracker(): string {
  return JSON.stringify({ version: 1, exportedAt: Date.now(), ...read() }, null, 2)
}

export function clearTracker(): void {
  write({ log: [], protocols: [], vials: [] })
}

// --- Pure derivations (unit-tested) -----------------------------------------

export interface CostPerDose {
  dosesPerVial: number
  costPerDose: number | null
}

/**
 * Cost per dose from a vial's mass and price. `totalMg` and `doseMcg` fix how
 * many doses the vial holds; `cost` (if known) divides across them.
 */
export function costPerDose(totalMg: number, doseMcg: number, cost?: number): CostPerDose {
  if (!(totalMg > 0) || !(doseMcg > 0)) return { dosesPerVial: 0, costPerDose: null }
  const dosesPerVial = (totalMg * 1000) / doseMcg
  const perDose = cost != null && cost > 0 ? cost / dosesPerVial : null
  return { dosesPerVial, costPerDose: perDose }
}

/** Next scheduled administration for a protocol, or null if inactive/invalid. */
export function nextDue(protocol: Protocol, now = Date.now()): number | null {
  if (!protocol.active || !(protocol.intervalHours > 0)) return null
  const intervalMs = protocol.intervalHours * 3_600_000
  if (now <= protocol.startTs) return protocol.startTs
  const elapsed = now - protocol.startTs
  const periods = Math.floor(elapsed / intervalMs) + 1
  return protocol.startTs + periods * intervalMs
}
