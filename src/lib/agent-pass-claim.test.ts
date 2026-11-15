import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Loads agent-pass after STRIPE_SECRET_KEY is set. The module reads that key
// once at import, and the suite must not call Stripe.

const SESSION = 'cs_test_paidpass01'
const ORIGIN = 'https://americanpeptide.com'

function paidSession(overrides: Record<string, unknown> = {}) {
  return {
    id: SESSION,
    mode: 'payment',
    currency: 'usd',
    amount_total: 2999,
    payment_status: 'paid',
    created: Math.floor(Date.now() / 1000),
    success_url: `${ORIGIN}/research/pass?session_id={CHECKOUT_SESSION_ID}`,
    ...overrides,
  }
}

describe('Research Pass checkout claim', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_claim')
    vi.stubEnv('AGENT_PASS_PRICE_CENTS', '2999')
    vi.stubEnv('AGENT_PASS_DAYS', '30')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function load(body: unknown, status = 200) {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const mod = await import('./agent-pass')
    return { ...mod, fetchMock }
  }

  it('creates a hosted session with the Checkout Studio parameters and the real pass price', async () => {
    const { createCheckout, fetchMock } = await load({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    const url = await createCheckout(ORIGIN)
    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_test')

    const init = fetchMock.mock.calls[0][1]
    expect(new Headers(init?.headers).get('Stripe-Version')).toBe('2026-09-30.endive')
    expect(init?.body).toEqual(expect.any(String))
    const params = new URLSearchParams(String(init?.body))
    expect(params.get('ui_mode')).toBe('hosted_page')
    expect(params.get('mode')).toBe('payment')
    expect(params.get('billing_address_collection')).toBe('auto')
    expect(params.get('phone_number_collection[enabled]')).toBe('false')
    expect(params.get('automatic_tax[enabled]')).toBe('false')
    expect(params.get('allow_promotion_codes')).toBe('false')
    expect(params.get('submit_type')).toBe('auto')
    expect(params.get('saved_payment_method_options[payment_method_save]')).toBeNull()
    expect(params.get('integration_identifier')).toBe('hosted_mobile_app_0001')
    expect(params.get('origin_context')).toBe('mobile_app')
    expect(params.get('payment_method_collection')).toBeNull()
    expect(params.get('metadata[product]')).toBeNull()
    expect(params.get('success_url')).toBe(`${ORIGIN}/research/pass?session_id={CHECKOUT_SESSION_ID}`)
    expect(params.get('cancel_url')).toBe(`${ORIGIN}/research/pass`)
    expect(params.get('line_items[0][price_data][currency]')).toBe('usd')
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe('2999')
    expect(params.get('line_items[0][quantity]')).toBe('1')
  })

  it('grants a pass for a paid Research Pass session that has no metadata', async () => {
    const { claimSession, lookupPass } = await load(paidSession())
    const result = await claimSession(SESSION)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.code).toMatch(/^APP-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}$/)
    expect((await lookupPass(result.code))?.expiresAt).toBe(result.expiresAt)
  })

  it('accepts the success URL after Stripe substitutes the session id', async () => {
    const { claimSession } = await load(
      paidSession({ success_url: `${ORIGIN}/research/pass?session_id=${SESSION}` }),
    )
    const result = await claimSession(SESSION)
    expect(result.ok).toBe(true)
  })

  it('does not grant a pass for a different paid Checkout Session', async () => {
    const other = 'cs_test_otherprod1'
    const { claimSession, lookupPass, codeForSession } = await load(
      paidSession({
        id: other,
        amount_total: 500,
        success_url: `${ORIGIN}/catalog?session_id=${other}`,
      }),
    )
    expect(await claimSession(other)).toEqual({ ok: false, reason: 'invalid' })
    expect(await lookupPass(codeForSession(other))).toBeNull()
  })

  it('refuses an unpaid Research Pass session', async () => {
    const { claimSession } = await load(paidSession({ payment_status: 'unpaid' }))
    expect(await claimSession(SESSION)).toEqual({ ok: false, reason: 'unpaid' })
  })

  it('refuses a session whose pass term has already elapsed', async () => {
    const created = Math.floor(Date.now() / 1000) - 40 * 86_400
    const { claimSession } = await load(paidSession({ created }))
    expect(await claimSession(SESSION)).toEqual({ ok: false, reason: 'expired' })
  })

  it('maps Stripe 404 and 500 to invalid and unavailable', async () => {
    const missing = await load({ error: { message: 'missing' } }, 404)
    expect(await missing.claimSession(SESSION)).toEqual({ ok: false, reason: 'invalid' })

    vi.resetModules()
    const down = await load({ error: { message: 'down' } }, 500)
    expect(await down.claimSession(SESSION)).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('does not call Stripe for a malformed session id', async () => {
    const { claimSession, fetchMock } = await load(paidSession())
    expect(await claimSession('not-a-session')).toEqual({ ok: false, reason: 'invalid' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
