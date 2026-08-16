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

/**
 * Consecutive throttled responses before we stop retrying for the rest of the
 * process. Retrying is the right answer to a brief burst and the wrong answer
 * to a blocked caller: when PubChem is refusing an IP outright — which is what
 * a CI runner on a shared address tends to hit — every retry multiplies the
 * work without changing the outcome. A 63-entry pass ground past five minutes
 * that way and killed its own client on a headers timeout, turning "finishes
 * empty, fails the delta guard cleanly" into "hangs, then dies opaquely".
 * Tripping keeps the failure fast and legible.
 */
const THROTTLE_TRIP = 5

const RETRYABLE = new Set([429, 500, 502, 503, 504])

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Circuit state. Deliberately per-process and never auto-resetting on a timer:
// the manifest pass is a single short-lived batch, so once PubChem has clearly
// stopped answering it, the useful thing is to finish quickly and report, not
// to keep probing. Any success resets the counter.
let consecutiveThrottles = 0
let tripped = false

/** Reset the breaker — for tests, or a caller that knows conditions changed. */
export function resetPubchemBreaker(): void {
  consecutiveThrottles = 0
  tripped = false
}

/** True once PubChem has refused enough consecutive calls to stop trying. */
export function pubchemBreakerTripped(): boolean {
  return tripped
}

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
  // Already established that PubChem isn't answering us — don't spend a slot,
  // a retry, or a backoff sleep proving it again.
  if (tripped) return null

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

    if (res?.ok) {
      consecutiveThrottles = 0
      return res
    }

    // A 404 is a real answer: PubChem has no such compound. Don't retry it, and
    // don't count it against the breaker — the service is working fine.
    if (res && !RETRYABLE.has(res.status)) {
      consecutiveThrottles = 0
      return res
    }

    if (attempt < MAX_RETRIES) await sleep(backoffMs(res, attempt))
  }

  // Exhausted retries: this call was refused throughout.
  consecutiveThrottles++
  if (!tripped && consecutiveThrottles >= THROTTLE_TRIP) {
    tripped = true
    console.warn(
      `[pubchem] ${consecutiveThrottles} consecutive requests refused after retries — ` +
        'giving up for this process. Remaining lookups return no evidence, so the ' +
        'caller finishes fast rather than grinding against a block.',
    )
  }
  return null
}
