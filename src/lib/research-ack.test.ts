import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACK_VERSION,
  STORAGE_KEY,
  ensureResearchAck,
  hasAcked,
  registerPresenter,
  setAcked,
  subscribe,
} from './research-ack'

/**
 * Minimal localStorage stand-in — the module reads `window.localStorage` and is
 * exercised here under Vitest's `node` environment, where no `window` exists.
 */
function fakeLocalStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: fakeLocalStorage() })
})

afterEach(() => {
  // Reset module singletons so cases don't leak into each other.
  registerPresenter(null)
  vi.unstubAllGlobals()
})

describe('hasAcked / setAcked', () => {
  it('is false before acknowledgment and true after', () => {
    expect(hasAcked()).toBe(false)
    setAcked()
    expect(hasAcked()).toBe(true)
  })

  it('persists the current ACK_VERSION under STORAGE_KEY', () => {
    setAcked()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(ACK_VERSION)
  })

  it('does not match a stale/other stored version', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-the-version')
    expect(hasAcked()).toBe(false)
  })

  it('treats storage being unavailable as not-yet-acked', () => {
    vi.stubGlobal('window', undefined)
    expect(hasAcked()).toBe(false)
    // setAcked must swallow the failure rather than throw.
    expect(() => setAcked()).not.toThrow()
  })
})

describe('subscribe', () => {
  it('notifies listeners when acknowledgment is granted', () => {
    const seen: boolean[] = []
    const unsubscribe = subscribe(() => seen.push(hasAcked()))
    setAcked()
    expect(seen).toEqual([true])
    unsubscribe()
    setAcked()
    expect(seen).toEqual([true]) // no further calls after unsubscribe
  })
})

describe('ensureResearchAck', () => {
  it('resolves true immediately for an already-acknowledged viewer, without the modal', async () => {
    setAcked()
    const presenter = vi.fn(() => Promise.resolve(false))
    registerPresenter(presenter)
    await expect(ensureResearchAck()).resolves.toBe(true)
    expect(presenter).not.toHaveBeenCalled()
  })

  it('presents the modal when not acknowledged and resolves with its result', async () => {
    const presenter = vi.fn(() => Promise.resolve(true))
    registerPresenter(presenter)
    await expect(ensureResearchAck()).resolves.toBe(true)
    expect(presenter).toHaveBeenCalledTimes(1)
  })

  it('resolves false when the viewer dismisses the modal', async () => {
    registerPresenter(() => Promise.resolve(false))
    await expect(ensureResearchAck()).resolves.toBe(false)
  })

  it('fails open (true) when no host/presenter is mounted', async () => {
    registerPresenter(null)
    await expect(ensureResearchAck()).resolves.toBe(true)
  })
})
