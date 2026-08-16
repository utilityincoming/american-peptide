// A single, polite door onto PubChem PUG-REST.
//
// PubChem's usage policy caps callers at 5 requests/second and 400/minute, and
// answers 503 once you cross it. Every PubChem call in this codebase goes
// through here so the limit is enforced where requests actually happen.
//
// That distinction is the bug this fixes. The verification-manifest pass used to
// sleep 350ms between PEPTIDES, which reads like ~2.9 req/s — but an entry
// without a curated CID costs TWO calls (name→CID, then properties) fired
// back-to-back, so the real peak was closer to 6/s, over the line. Pacing the
// loop cannot fix that; pacing the requests can, because the gate below counts
// the thing the server counts.
//
// Failure behavior matters as much as pacing. A throttled pass previously
// vanished: buildVerificationManifest swallows per-entry errors by design, so a
// 503 storm produced an empty manifest with HTTP 200 and wiped every "verified"
// badge. Retrying on 503/429 turns a throttle into a slower run rather than
// silent data loss — which is the whole point, since the caller cannot tell
// "PubChem said no" apart from "this compound isn't in PubChem".

/** Minimum spacing between requests. ~2.9/s, comfortably under the 5/s cap. */
const MIN_INTERVAL_MS = 350

/** Retries for a throttled or transient response, beyond the first attempt. */
const MAX_RETRIES = 3

/** PubChem asks callers to identify themselves; an anonymous burst gets blocked first. */
const USER_AGENT =
  'AmericanPeptide.com/1.0 (+https://americanpeptide.com; catalog verification)'

const RETRYABLE = new Set([429, 500, 502, 503, 504])

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Requests queue through one promise chain, so concurrent callers interleave
// politely instead of each keeping its own private idea of the rate.
let chain: Promise<void> = Promise.resolve()
let lastStartedAt = 0

function reserveSlot(): Promise<void> {
  const slot = chain.then(async () => {
    const since = Date.now() - lastStartedAt
    if (since < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - since)
    lastStartedAt = Date.now()
  })
  // Keep the chain alive even if a waiter rejects, or one failure stalls all
  // later requests behind it.
  chain = slot.catch(() => {})
  return slot
}

/** Honor Retry-After when PubChem sends one; otherwise back off exponentially. */
function backoffMs(res: Response | null, attempt: number): number {
  const header = res?.headers.get('retry-after')
  if (header) {
    const seconds = Number(header)
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 15_000)
  }
  return Math.min(1000 * 2 ** attempt, 8000)
}

/**
 * Rate-limited PubChem request with retry on throttling. Resolves to the
 * Response on success, or null once retries are exhausted — callers treat null
 * as "no evidence", same as before.
 */
export async function pubchemFetch(
  url: string,
  { timeoutMs = 8000 }: { timeoutMs?: number } = {},
): Promise<Response | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await reserveSlot()

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    let res: Response | null = null
    try {
      res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      })
    } catch {
      res = null // network error or timeout — retried like a 5xx
    } finally {
      clearTimeout(timer)
    }

    if (res?.ok) return res

    // A 404 is a real answer: PubChem has no such compound. Don't retry it.
    if (res && !RETRYABLE.has(res.status)) return res

    if (attempt < MAX_RETRIES) await sleep(backoffMs(res, attempt))
  }
  return null
}
