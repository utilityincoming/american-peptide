import { describe, it, expect } from 'vitest'
import { codeForSession, normalizeCode, grantPass, lookupPass, passCookie, readPassCode } from './agent-pass'
import { reserveRun, weekId, weekResetsAt, FREE_WEEKLY } from './agent-quota'

// Runs against the in-memory KV backend (no Upstash / Stripe env in tests).

describe('access codes', () => {
  it('derives a stable, well-formed code per checkout session', () => {
    const a = codeForSession('cs_test_aaaaaaaaaaaa', 'sk_test_x')
    expect(a).toMatch(/^APP-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}$/)
    expect(codeForSession('cs_test_aaaaaaaaaaaa', 'sk_test_x')).toBe(a)
    expect(codeForSession('cs_test_bbbbbbbbbbbb', 'sk_test_x')).not.toBe(a)
    expect(codeForSession('cs_test_aaaaaaaaaaaa', 'sk_test_y')).not.toBe(a)
  })

  it('normalizes sloppy input and rejects junk', () => {
    const code = codeForSession('cs_test_cccccccccccc', 'k')
    expect(normalizeCode(code.toLowerCase())).toBe(code)
    expect(normalizeCode(`  ${code.replace(/-/g, ' ')} `)).toBe(code)
    expect(normalizeCode(code.slice(4))).toBe(code) // without the APP- prefix
    expect(normalizeCode('APP-1234')).toBeNull()
    expect(normalizeCode(42)).toBeNull()
  })
})

describe('pass records', () => {
  it('grants once, never extends, and expires', async () => {
    const code = codeForSession('cs_test_dddddddddddd', 'k')
    const exp = Date.now() + 86_400_000
    await grantPass(code, exp, 'cs_test_dddddddddddd')
    await grantPass(code, exp + 999_999_999, 'cs_test_dddddddddddd') // reload must not extend
    expect((await lookupPass(code))?.expiresAt).toBe(new Date(exp).toISOString())

    const old = codeForSession('cs_test_eeeeeeeeeeee', 'k')
    await grantPass(old, Date.now() - 1000, 'cs_test_eeeeeeeeeeee')
    expect(await lookupPass(old)).toBeNull()
    expect(await lookupPass(codeForSession('cs_test_never_granted', 'k'))).toBeNull()
  })

  it('round-trips the code through its cookie', () => {
    const code = codeForSession('cs_test_ffffffffffff', 'k')
    const cookie = passCookie(code, new Date(Date.now() + 60_000).toISOString()).split(';')[0]
    const req = new Request('https://americanpeptide.com/api/chat', { headers: { cookie: `a=b; ${cookie}` } })
    expect(readPassCode(req)).toBe(code)
  })
})

describe('pass holders skip the weekly allowance', () => {
  it('allows well past FREE_WEEKLY and reports the pass, not a quota', async () => {
    const code = codeForSession('cs_test_gggggggggggg', 'k')
    await grantPass(code, Date.now() + 86_400_000, 'cs_test_gggggggggggg')
    const mk = () =>
      new Request('https://americanpeptide.com/api/chat', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.200', cookie: `ap_pass=${code}` },
      })
    for (let i = 0; i < FREE_WEEKLY * 4; i++) {
      const r = await reserveRun(mk(), 'chat')
      expect(r.allowed).toBe(true)
      expect(r.quota).toBeNull()
      expect(r.pass?.expiresAt).toBeTruthy()
    }
  })
})

describe('weekly window', () => {
  it('runs Monday 00:00 UTC to the next Monday', () => {
    const wed = new Date('2026-11-11T15:30:00Z')
    expect(weekId(wed)).toBe('2026-11-09')
    expect(weekResetsAt(wed)).toBe('2026-11-16T00:00:00.000Z')
    // Sunday night still belongs to the week that began the previous Monday.
    expect(weekId(new Date('2026-11-15T23:59:59Z'))).toBe('2026-11-09')
    expect(weekId(new Date('2026-11-16T00:00:00Z'))).toBe('2026-11-16')
  })
})
