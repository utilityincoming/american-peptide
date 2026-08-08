// Personal research workspace — client-side only.
//
// Everything lives in the browser's localStorage: no account, no server, no
// cost, and the data never leaves the device. That privacy guarantee is part
// of the product, and it matches the existing localStorage patterns (Design
// Lab, compare bar, research-use ack).
//
// All functions guard `typeof window` so they are safe to import anywhere, but
// only return real data when called client-side (effects / event handlers).

const WS_KEY = 'amp-workspace-v1'
const DESIGN_KEY = 'amp-design-lab-saved' // owned by /tools/design-lab

export interface SavedDesign {
  seq: string
  ts: number
}

interface WorkspaceState {
  /** Watched peptide slugs, most-recently-added first. */
  watchlist: string[]
  /** Per-slug set of research item IDs (NCT/PMID) the user has already seen. */
  seen: Record<string, string[]>
}

const EMPTY: WorkspaceState = { watchlist: [], seen: {} }

function read(): WorkspaceState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(WS_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>
    return {
      watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist.filter((s) => typeof s === 'string') : [],
      seen: parsed.seen && typeof parsed.seen === 'object' ? (parsed.seen as Record<string, string[]>) : {},
    }
  } catch {
    return { ...EMPTY }
  }
}

function write(state: WorkspaceState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(state))
  } catch {
    /* quota / privacy mode — ignore */
  }
}

export function getWatchlist(): string[] {
  return read().watchlist
}

export function isWatched(slug: string): boolean {
  return read().watchlist.includes(slug)
}

/** Toggle a peptide on the watchlist. Returns the new watched state. */
export function toggleWatch(slug: string): boolean {
  const state = read()
  if (state.watchlist.includes(slug)) {
    state.watchlist = state.watchlist.filter((s) => s !== slug)
    delete state.seen[slug]
    write(state)
    return false
  }
  state.watchlist = [slug, ...state.watchlist].slice(0, 100)
  write(state)
  return true
}

export function removeWatch(slug: string): void {
  const state = read()
  state.watchlist = state.watchlist.filter((s) => s !== slug)
  delete state.seen[slug]
  write(state)
}

export function getSeen(slug: string): Set<string> {
  return new Set(read().seen[slug] ?? [])
}

/** Mark a set of research item IDs as seen for a peptide (clears its "new" badges). */
export function markSeen(slug: string, ids: string[]): void {
  const state = read()
  const merged = new Set([...(state.seen[slug] ?? []), ...ids])
  state.seen[slug] = [...merged].slice(-200) // bound growth
  write(state)
}

/** Saved Design-Lab sequences (read-only view of the Design Lab's own store). */
export function getSavedDesigns(): SavedDesign[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DESIGN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((d) => d && typeof d.seq === 'string').map((d) => ({ seq: d.seq, ts: Number(d.ts) || 0 }))
      : []
  } catch {
    return []
  }
}

export function removeSavedDesign(seq: string): void {
  if (typeof window === 'undefined') return
  try {
    const next = getSavedDesigns().filter((d) => d.seq !== seq)
    localStorage.setItem(DESIGN_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
