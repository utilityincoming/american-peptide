// Research Pass + Peptide Agent access — the client-side state machines.
//
// Pure: no React, no DOM, no fetch. The pages (/research, /research/pass) hold
// one of these states in useReducer and dispatch events; everything a page may
// render is derived by the selectors at the bottom. Network calls live in
// pass-client.ts. Tests: pass-flow.test.ts.
//
// Three small machines are composed here.
//
// 1. Checkout — starting Stripe Checkout (shared by both pages)
//
//      idle ──checkout_started──▶ starting ──(browser leaves for Stripe)
//        ▲                           │
//        └───── failed ◀──checkout_failed
//               (checkout_started retries from failed)
//
// 2. Access — what the visitor may do on /research. The server is the
//    authority; the latest server report always wins.
//
//      unknown ─┬─▶ pass        an active Research Pass, no daily limit
//               ├─▶ free        remaining > 0 free searches today
//               └─▶ exhausted   none left (HTTP 402, or remaining = 0)
//
//    `unknown` also covers "allowance switched off": nothing to show, and the
//    server enforces whatever applies.
//
// 3. Pass page — four independent regions, each an explicit union:
//
//      summary   loading ─▶ ready | failed          (GET /api/pass)
//      claim     none ─▶ confirming ─▶ issued | failed   (return from Stripe)
//                failed ─▶ confirming                (retry, when retryable)
//      checkout  (machine 1)
//      redeem    idle ─▶ checking ─▶ idle | failed   (enter an access code)

/** sessionStorage key: the question held while the visitor buys a pass. */
export const PENDING_QUESTION_KEY = 'ap_pending_question'

export interface Offer {
  available: boolean
  price: string
  days: number
}

export interface PassInfo {
  expiresAt: string
}

export interface Quota {
  limit: number
  remaining: number
}

// ── Server payloads, normalized ───────────────────────────────────────────────

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function parseOffer(v: unknown): Offer | null {
  if (!isRecord(v)) return null
  if (typeof v.available !== 'boolean' || typeof v.price !== 'string' || typeof v.days !== 'number') return null
  return { available: v.available, price: v.price, days: v.days }
}

function parsePass(v: unknown): PassInfo | null {
  return isRecord(v) && typeof v.expiresAt === 'string' ? { expiresAt: v.expiresAt } : null
}

function parseQuota(v: unknown): Quota | null {
  if (!isRecord(v) || typeof v.limit !== 'number' || typeof v.remaining !== 'number') return null
  return { limit: v.limit, remaining: v.remaining }
}

/** GET /api/pass, reduced to what the UI uses. */
export interface PassSummary {
  pass: PassInfo | null
  /** Free daily allowance; null when the allowance is off or unreadable. */
  quota: Quota | null
  offer: Offer | null
}

export function parsePassSummary(data: unknown): PassSummary {
  if (!isRecord(data)) return { pass: null, quota: null, offer: null }
  return {
    pass: parsePass(data.pass),
    quota: data.enabled ? parseQuota(data) : null,
    offer: parseOffer(data.offer),
  }
}

/** The access-relevant part of a POST /api/chat response (any status). */
export interface ChatReplyMeta {
  /** HTTP 402: the free allowance is spent and the question was not answered. */
  exhausted: boolean
  quota: Quota | null
  pass: PassInfo | null
  offer: Offer | null
}

export function parseChatReplyMeta(httpStatus: number, data: unknown): ChatReplyMeta {
  const d = isRecord(data) ? data : {}
  return {
    exhausted: httpStatus === 402,
    quota: parseQuota(d.quota),
    pass: parsePass(d.pass),
    offer: parseOffer(d.offer),
  }
}

// ── 1. Checkout ───────────────────────────────────────────────────────────────

export type CheckoutState = { status: 'idle' } | { status: 'starting' } | { status: 'failed'; error: string }

export type CheckoutEvent = { type: 'checkout_started' } | { type: 'checkout_failed'; error: string }

function checkoutReducer(state: CheckoutState, event: CheckoutEvent): CheckoutState {
  switch (event.type) {
    case 'checkout_started':
      return state.status === 'starting' ? state : { status: 'starting' }
    case 'checkout_failed':
      return state.status === 'starting' ? { status: 'failed', error: event.error } : state
  }
}

// ── 2. Access (/research) ─────────────────────────────────────────────────────

export type AccessState =
  | { status: 'unknown' }
  | { status: 'pass'; pass: PassInfo }
  | { status: 'free'; limit: number; remaining: number }
  | { status: 'exhausted'; limit: number }

const DEFAULT_FREE_LIMIT = 5

function accessFromQuota(q: Quota): AccessState {
  return q.remaining > 0
    ? { status: 'free', limit: q.limit, remaining: q.remaining }
    : { status: 'exhausted', limit: q.limit }
}

function knownLimit(access: AccessState): number {
  return access.status === 'free' || access.status === 'exhausted' ? access.limit : DEFAULT_FREE_LIMIT
}

export interface AgentAccessState {
  access: AccessState
  offer: Offer | null
  checkout: CheckoutState
}

export const initialAgentAccess: AgentAccessState = {
  access: { status: 'unknown' },
  offer: null,
  checkout: { status: 'idle' },
}

export type AgentAccessEvent =
  | { type: 'summary_loaded'; summary: PassSummary }
  | { type: 'reply_received'; reply: ChatReplyMeta }
  | CheckoutEvent

export function agentAccessReducer(state: AgentAccessState, event: AgentAccessEvent): AgentAccessState {
  switch (event.type) {
    case 'summary_loaded': {
      const { pass, quota, offer } = event.summary
      const access: AccessState = pass ? { status: 'pass', pass } : quota ? accessFromQuota(quota) : state.access
      return { ...state, access, offer: offer ?? state.offer }
    }
    case 'reply_received': {
      const { exhausted, quota, pass, offer } = event.reply
      let access = state.access
      if (exhausted) access = { status: 'exhausted', limit: quota?.limit ?? knownLimit(state.access) }
      else if (pass) access = { status: 'pass', pass }
      else if (quota) access = accessFromQuota(quota)
      return { ...state, access, offer: offer ?? state.offer }
    }
    case 'checkout_started':
    case 'checkout_failed': {
      // Checkout is only offered once the allowance is spent and sales are on.
      if (event.type === 'checkout_started' && !canStartCheckout(state)) return state
      return { ...state, checkout: checkoutReducer(state.checkout, event) }
    }
  }
}

/** A question may be sent unless the free allowance is known to be spent. */
export function canAsk(state: AgentAccessState): boolean {
  return state.access.status !== 'exhausted'
}

export function canStartCheckout(state: AgentAccessState): boolean {
  return state.checkout.status !== 'starting' && state.offer?.available === true
}

// ── 3. Pass page (/research/pass) ─────────────────────────────────────────────

export type SummaryState =
  | { status: 'loading' }
  | { status: 'ready'; summary: PassSummary }
  /** GET /api/pass failed. Buying and redeeming still work — the server decides. */
  | { status: 'failed' }

export type ClaimState =
  | { status: 'none' }
  | { status: 'confirming' }
  | { status: 'issued'; code: string; copied: boolean }
  /** retryable: the payment may well have gone through (unpaid-yet, store or
   *  network trouble) — offer "check again", never a second purchase. */
  | { status: 'failed'; error: string; retryable: boolean }

export type RedeemState = { status: 'idle' } | { status: 'checking' } | { status: 'failed'; error: string }

export interface PassPageState {
  summary: SummaryState
  claim: ClaimState
  checkout: CheckoutState
  redeem: RedeemState
}

export const initialPassPage: PassPageState = {
  summary: { status: 'loading' },
  claim: { status: 'none' },
  checkout: { status: 'idle' },
  redeem: { status: 'idle' },
}

export type PassPageEvent =
  | { type: 'summary_loaded'; summary: PassSummary }
  | { type: 'summary_failed' }
  | { type: 'claim_started' }
  | { type: 'claim_succeeded'; code: string }
  | { type: 'claim_failed'; error: string; retryable: boolean }
  | { type: 'code_copied' }
  | { type: 'copy_reset' }
  | { type: 'redeem_started' }
  | { type: 'redeem_succeeded' }
  | { type: 'redeem_failed'; error: string }
  | CheckoutEvent

export function passPageReducer(state: PassPageState, event: PassPageEvent): PassPageState {
  const { claim, redeem } = state
  switch (event.type) {
    case 'summary_loaded':
      return { ...state, summary: { status: 'ready', summary: event.summary } }
    case 'summary_failed':
      // A failed refresh never discards a summary we already have.
      return state.summary.status === 'loading' ? { ...state, summary: { status: 'failed' } } : state

    case 'claim_started': {
      const mayStart = claim.status === 'none' || (claim.status === 'failed' && claim.retryable)
      return mayStart ? { ...state, claim: { status: 'confirming' } } : state
    }
    case 'claim_succeeded':
      return claim.status === 'confirming'
        ? { ...state, claim: { status: 'issued', code: event.code, copied: false } }
        : state
    case 'claim_failed':
      return claim.status === 'confirming'
        ? { ...state, claim: { status: 'failed', error: event.error, retryable: event.retryable } }
        : state
    case 'code_copied':
      return claim.status === 'issued' ? { ...state, claim: { ...claim, copied: true } } : state
    case 'copy_reset':
      return claim.status === 'issued' ? { ...state, claim: { ...claim, copied: false } } : state

    case 'redeem_started':
      return redeem.status === 'checking' ? state : { ...state, redeem: { status: 'checking' } }
    case 'redeem_succeeded':
      return redeem.status === 'checking' ? { ...state, redeem: { status: 'idle' } } : state
    case 'redeem_failed':
      return redeem.status === 'checking' ? { ...state, redeem: { status: 'failed', error: event.error } } : state

    case 'checkout_started':
    case 'checkout_failed': {
      if (event.type === 'checkout_started' && !passPagePanels(state).canBuy) return state
      return { ...state, checkout: checkoutReducer(state.checkout, event) }
    }
  }
}

/** Everything /research/pass renders, derived from the state in one place. */
export interface PassPagePanels {
  /** "Confirming your payment…" */
  confirming: boolean
  claimError: { error: string; retryable: boolean } | null
  /** The just-purchased card with the access code. */
  issued: { code: string; copied: boolean } | null
  /** The "Research Pass active" card. */
  activePass: PassInfo | null
  /** hidden: nothing to sell right now (active, mid-claim, or a payment that
   *  may have gone through). not_on_sale: Stripe isn't configured. */
  offer: 'hidden' | 'buy' | 'not_on_sale'
  canBuy: boolean
  /** The access-code form. */
  showRedeem: boolean
  /** Offer terms, when the server has reported them. */
  terms: Offer | null
  /** Free daily searches, when the server has reported them. */
  freeLimit: number | null
}

export function passPagePanels(state: PassPageState): PassPagePanels {
  const { summary, claim, checkout } = state
  const known = summary.status === 'ready' ? summary.summary : null
  const activePass = known?.pass ?? null
  const paymentPending = claim.status === 'failed' && claim.retryable

  let offer: PassPagePanels['offer'] = 'buy'
  if (activePass || claim.status === 'confirming' || claim.status === 'issued' || paymentPending) offer = 'hidden'
  else if (known?.offer && !known.offer.available) offer = 'not_on_sale'

  return {
    confirming: claim.status === 'confirming',
    claimError: claim.status === 'failed' ? { error: claim.error, retryable: claim.retryable } : null,
    issued: claim.status === 'issued' ? { code: claim.code, copied: claim.copied } : null,
    activePass,
    offer,
    canBuy: offer === 'buy' && summary.status !== 'loading' && checkout.status !== 'starting',
    showRedeem: !activePass,
    terms: known?.offer ?? null,
    freeLimit: known?.quota?.limit ?? null,
  }
}
