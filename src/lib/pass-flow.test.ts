import { describe, it, expect } from 'vitest'
import {
  agentAccessReducer,
  canAsk,
  canStartCheckout,
  initialAgentAccess,
  initialPassPage,
  parseChatReplyMeta,
  parsePassSummary,
  passPagePanels,
  passPageReducer,
  type AgentAccessEvent,
  type AgentAccessState,
  type PassPageEvent,
  type PassPageState,
  type PassSummary,
} from './pass-flow'

const OFFER = { available: true, price: '$15.00', days: 30 }
const PASS = { expiresAt: '2026-12-16T00:00:00.000Z' }

const summary = (over: Partial<PassSummary> = {}): PassSummary => ({
  pass: null,
  quota: { limit: 5, remaining: 5 },
  offer: OFFER,
  ...over,
})

const agent = (...events: AgentAccessEvent[]): AgentAccessState =>
  events.reduce(agentAccessReducer, initialAgentAccess)
const page = (...events: PassPageEvent[]): PassPageState => events.reduce(passPageReducer, initialPassPage)

describe('parsePassSummary', () => {
  it('reads the GET /api/pass shape', () => {
    expect(parsePassSummary({ enabled: true, pass: null, limit: 5, remaining: 3, offer: OFFER })).toEqual({
      pass: null,
      quota: { limit: 5, remaining: 3 },
      offer: OFFER,
    })
  })

  it('reports no quota when the allowance is off, and survives junk', () => {
    expect(parsePassSummary({ enabled: false, pass: PASS, offer: OFFER }).quota).toBeNull()
    expect(parsePassSummary(null)).toEqual({ pass: null, quota: null, offer: null })
    expect(parsePassSummary({ enabled: true, limit: '5', offer: { available: 'yes' } })).toEqual({
      pass: null,
      quota: null,
      offer: null,
    })
  })
})

describe('parseChatReplyMeta', () => {
  it('marks only HTTP 402 as exhausted', () => {
    expect(parseChatReplyMeta(402, { quota: { limit: 5, remaining: 0 }, offer: OFFER })).toEqual({
      exhausted: true,
      quota: { limit: 5, remaining: 0 },
      pass: null,
      offer: OFFER,
    })
    expect(parseChatReplyMeta(200, { content: 'hi', pass: PASS }).exhausted).toBe(false)
    expect(parseChatReplyMeta(502, undefined)).toEqual({ exhausted: false, quota: null, pass: null, offer: null })
  })
})

describe('agent access', () => {
  it('starts unknown and lets the visitor ask', () => {
    expect(initialAgentAccess.access.status).toBe('unknown')
    expect(canAsk(initialAgentAccess)).toBe(true)
  })

  it('a pass outranks the free allowance', () => {
    const s = agent({ type: 'summary_loaded', summary: summary({ pass: PASS, quota: { limit: 5, remaining: 0 } }) })
    expect(s.access).toEqual({ status: 'pass', pass: PASS })
    expect(canAsk(s)).toBe(true)
  })

  it('tracks the remaining free searches from each reply', () => {
    const s = agent(
      { type: 'summary_loaded', summary: summary() },
      { type: 'reply_received', reply: parseChatReplyMeta(200, { quota: { limit: 5, remaining: 4 } }) },
    )
    expect(s.access).toEqual({ status: 'free', limit: 5, remaining: 4 })
  })

  it('is exhausted on a 402, and when the last free search is used', () => {
    const on402 = agent({ type: 'reply_received', reply: parseChatReplyMeta(402, { offer: OFFER }) })
    expect(on402.access).toEqual({ status: 'exhausted', limit: 5 })
    expect(canAsk(on402)).toBe(false)

    const lastUsed = agent({
      type: 'reply_received',
      reply: parseChatReplyMeta(200, { quota: { limit: 3, remaining: 0 } }),
    })
    expect(lastUsed.access).toEqual({ status: 'exhausted', limit: 3 })

    const onLoad = agent({ type: 'summary_loaded', summary: summary({ quota: { limit: 5, remaining: 0 } }) })
    expect(canAsk(onLoad)).toBe(false)
  })

  it('never shows a pass and an exhausted allowance together', () => {
    // A pass that lapsed mid-session: the next ask comes back 402.
    const s = agent(
      { type: 'summary_loaded', summary: summary({ pass: PASS }) },
      { type: 'reply_received', reply: parseChatReplyMeta(402, { quota: { limit: 5, remaining: 0 } }) },
    )
    expect(s.access).toEqual({ status: 'exhausted', limit: 5 })
  })

  it('keeps what it knows when a reply carries no access information', () => {
    const before = agent({ type: 'summary_loaded', summary: summary({ quota: { limit: 5, remaining: 2 } }) })
    const after = agentAccessReducer(before, { type: 'reply_received', reply: parseChatReplyMeta(500, { error: 'x' }) })
    expect(after.access).toEqual(before.access)
    expect(after.offer).toEqual(OFFER)
  })

  it('only starts checkout when the pass is on sale, and never twice', () => {
    expect(canStartCheckout(initialAgentAccess)).toBe(false)
    expect(agent({ type: 'checkout_started' }).checkout.status).toBe('idle')

    const offSale = agent({ type: 'summary_loaded', summary: summary({ offer: { ...OFFER, available: false } }) })
    expect(canStartCheckout(offSale)).toBe(false)

    const starting = agent({ type: 'summary_loaded', summary: summary() }, { type: 'checkout_started' })
    expect(starting.checkout.status).toBe('starting')
    expect(canStartCheckout(starting)).toBe(false)

    const failed = agentAccessReducer(starting, { type: 'checkout_failed', error: 'nope' })
    expect(failed.checkout).toEqual({ status: 'failed', error: 'nope' })
    expect(canStartCheckout(failed)).toBe(true)
    expect(agentAccessReducer(failed, { type: 'checkout_started' }).checkout.status).toBe('starting')
  })
})

describe('pass page', () => {
  const loaded: PassPageEvent = { type: 'summary_loaded', summary: summary() }

  it('shows the offer but cannot buy until the summary answers', () => {
    const p = passPagePanels(initialPassPage)
    expect(p.offer).toBe('buy')
    expect(p.canBuy).toBe(false)
    expect(p.showRedeem).toBe(true)
    expect(passPagePanels(page(loaded)).canBuy).toBe(true)
  })

  it('still lets the visitor buy when the summary could not be read', () => {
    const p = passPagePanels(page({ type: 'summary_failed' }))
    expect(p.offer).toBe('buy')
    expect(p.canBuy).toBe(true)
    expect(p.terms).toBeNull()
  })

  it('a failed refresh keeps the summary already loaded', () => {
    expect(page(loaded, { type: 'summary_failed' }).summary.status).toBe('ready')
  })

  it('says so when the pass is not on sale', () => {
    const p = passPagePanels(
      page({ type: 'summary_loaded', summary: summary({ offer: { ...OFFER, available: false } }) }),
    )
    expect(p.offer).toBe('not_on_sale')
    expect(p.canBuy).toBe(false)
  })

  it('hides the offer and the code form for an active pass', () => {
    const p = passPagePanels(page({ type: 'summary_loaded', summary: summary({ pass: PASS }) }))
    expect(p.activePass).toEqual(PASS)
    expect(p.offer).toBe('hidden')
    expect(p.showRedeem).toBe(false)
  })

  it('walks a successful return from Stripe', () => {
    const confirming = page({ type: 'claim_started' })
    expect(passPagePanels(confirming)).toMatchObject({ confirming: true, offer: 'hidden', issued: null })

    const issued = passPageReducer(confirming, { type: 'claim_succeeded', code: 'APP-AAAA-BBBB-CCCC-DDDD' })
    const p = passPagePanels(issued)
    expect(p.confirming).toBe(false)
    expect(p.issued).toEqual({ code: 'APP-AAAA-BBBB-CCCC-DDDD', copied: false })
    expect(p.offer).toBe('hidden')
  })

  it('never offers a second purchase while a payment may still land', () => {
    const s = page(loaded, { type: 'claim_started' }, { type: 'claim_failed', error: 'later', retryable: true })
    const p = passPagePanels(s)
    expect(p.claimError).toEqual({ error: 'later', retryable: true })
    expect(p.offer).toBe('hidden')
    expect(p.canBuy).toBe(false)
    expect(passPageReducer(s, { type: 'checkout_started' }).checkout.status).toBe('idle')
    // "Check again" re-enters confirming.
    expect(passPageReducer(s, { type: 'claim_started' }).claim.status).toBe('confirming')
  })

  it('returns to the offer when there is nothing to claim', () => {
    const s = page(loaded, { type: 'claim_started' }, { type: 'claim_failed', error: 'unknown', retryable: false })
    expect(passPagePanels(s)).toMatchObject({ offer: 'buy', canBuy: true })
    expect(passPageReducer(s, { type: 'claim_started' }).claim.status).toBe('failed')
  })

  it('ignores claim results that arrive out of turn', () => {
    expect(page({ type: 'claim_succeeded', code: 'X' }).claim.status).toBe('none')
    const issued = page({ type: 'claim_started' }, { type: 'claim_succeeded', code: 'X' })
    expect(passPageReducer(issued, { type: 'claim_started' })).toBe(issued)
    expect(passPageReducer(issued, { type: 'claim_failed', error: 'e', retryable: true })).toBe(issued)
  })

  it('flips the copied flag only on an issued code', () => {
    expect(page({ type: 'code_copied' }).claim.status).toBe('none')
    const issued = page({ type: 'claim_started' }, { type: 'claim_succeeded', code: 'X' }, { type: 'code_copied' })
    expect(passPagePanels(issued).issued?.copied).toBe(true)
    expect(passPagePanels(passPageReducer(issued, { type: 'copy_reset' })).issued?.copied).toBe(false)
  })

  it('runs checkout idle → starting → failed → starting', () => {
    const starting = page(loaded, { type: 'checkout_started' })
    expect(starting.checkout.status).toBe('starting')
    expect(passPagePanels(starting).canBuy).toBe(false)
    const failed = passPageReducer(starting, { type: 'checkout_failed', error: 'declined' })
    expect(failed.checkout).toEqual({ status: 'failed', error: 'declined' })
    expect(passPageReducer(failed, { type: 'checkout_started' }).checkout.status).toBe('starting')
  })

  it('runs redeem idle → checking → failed, clearing the error on retry', () => {
    const failed = page({ type: 'redeem_started' }, { type: 'redeem_failed', error: 'bad code' })
    expect(failed.redeem).toEqual({ status: 'failed', error: 'bad code' })
    const again = passPageReducer(failed, { type: 'redeem_started' })
    expect(again.redeem.status).toBe('checking')
    expect(passPageReducer(again, { type: 'redeem_succeeded' }).redeem.status).toBe('idle')
    expect(page({ type: 'redeem_succeeded' }).redeem.status).toBe('idle')
  })
})
