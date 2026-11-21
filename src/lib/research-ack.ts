'use client'

/**
 * Research-use acknowledgment, shared between the ambient (non-blocking) banner
 * and the on-demand blocking gate.
 *
 * Two surfaces, one acknowledgment:
 *  - A slim, dismissible banner greets first-time visitors without covering the
 *    page or locking scroll — content first (see ResearchUseGate).
 *  - A blocking modal is raised lazily, only when a viewer starts a *research
 *    action* (AI chat, peptide analysis) and hasn't acknowledged yet. That is
 *    the moment the research-use framing is actually relevant, and the point
 *    App Store guideline 4.2 cares about.
 *
 * `ensureResearchAck()` is the imperative entry point callers await before
 * running a research action: it resolves true immediately for anyone who has
 * already acknowledged, otherwise presents the modal and resolves when they do.
 *
 * The persisted key/version is unchanged from the original one-time gate, so
 * visitors who already acknowledged are never re-prompted.
 */

export const STORAGE_KEY = 'amp-research-ack'
// Bump to re-prompt all users if the acknowledgment wording materially changes.
export const ACK_VERSION = '1'

type Listener = () => void
const listeners = new Set<Listener>()

// The host component registers a presenter so callers anywhere can raise the
// blocking modal without a shared React context.
type Presenter = () => Promise<boolean>
let presenter: Presenter | null = null

export function hasAcked(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === ACK_VERSION
  } catch {
    // Storage unavailable (private mode, etc.) — treat as not-yet-acked so the
    // notice still shows, but never trap the user in a loop.
    return false
  }
}

export function setAcked(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, ACK_VERSION)
  } catch {
    /* ignore — acknowledgment still holds for this session via listeners */
  }
  listeners.forEach((l) => l())
}

/** Subscribe to acknowledgment changes (e.g. banner hiding once the modal is acked). */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Internal: the host registers/clears its modal presenter on mount/unmount. */
export function registerPresenter(p: Presenter | null): void {
  presenter = p
}

/**
 * Gate a research action. Resolves true if the viewer may proceed.
 *  - Already acknowledged → true immediately (no interruption for returning users).
 *  - Not acknowledged, host mounted → present the blocking modal; true on
 *    "I understand", false if dismissed (the action should abort).
 *  - No host mounted (SSR / unexpected) → fail open so we never block the user.
 */
export function ensureResearchAck(): Promise<boolean> {
  if (hasAcked()) return Promise.resolve(true)
  if (presenter) return presenter()
  return Promise.resolve(true)
}
