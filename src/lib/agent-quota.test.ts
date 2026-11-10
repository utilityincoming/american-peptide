import { describe, it, expect, beforeEach } from 'vitest'
import {
  reserveRun,
  peekQuota,
  readMetering,
  ipBucket,
  hashIp,
  isLikelyBot,
  isSameOriginBrowser,
  FREE_WEEKLY,
  IP_WEEKLY_MAX,
} from './agent-quota'

// Runs against the in-memory KV backend (no Upstash env in tests).

let ipSeq = 0
const freshIp = () => `203.0.${Math.floor(++ipSeq / 250)}.${(ipSeq % 250) + 1}`

function req(ip: string, cookie?: string): Request {
  return new Request('https://americanpeptide.com/api/chat', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
      origin: 'https://americanpeptide.com',
      host: 'americanpeptide.com',
      ...(cookie ? { cookie } : {}),
    },
  })
}

const cookieOf = (setCookie: string | null) => (setCookie ?? '').split(';')[0]

describe('reserveRun', () => {
  let ip: string
  beforeEach(() => {
    ip = freshIp()
  })

  it('gives a visitor exactly FREE_WEEKLY uses, then denies with reason quota', async () => {
    const first = await reserveRun(req(ip), 'chat')
    expect(first.allowed).toBe(true)
    expect(first.quota?.remaining).toBe(FREE_WEEKLY - 1)
    const cookie = cookieOf(first.setCookie)
    expect(cookie).toMatch(/^ap_vid=[a-f0-9]{32}$/)

    for (let i = 1; i < FREE_WEEKLY; i++) {
      const r = await reserveRun(req(ip, cookie), 'chat')
      expect(r.allowed).toBe(true)
      expect(r.setCookie).toBeNull()
    }
    const denied = await reserveRun(req(ip, cookie), 'chat')
    expect(denied.allowed).toBe(false)
    if (!denied.allowed) expect(denied.reason).toBe('quota')
    expect(denied.quota?.remaining).toBe(0)

    // A denied attempt must not consume anything further.
    expect((await peekQuota(req(ip, cookie), 'chat'))?.remaining).toBe(0)
  })

  it('caps a client that discards its cookie at IP_WEEKLY_MAX', async () => {
    let allowed = 0
    for (let i = 0; i < IP_WEEKLY_MAX + 5; i++) {
      if ((await reserveRun(req(ip), 'chat')).allowed) allowed++
    }
    expect(allowed).toBe(IP_WEEKLY_MAX)
  })

  it('lets a second visitor on the same IP have their own allowance', async () => {
    const a = await reserveRun(req(ip), 'chat')
    const cookieA = cookieOf(a.setCookie)
    for (let i = 1; i < FREE_WEEKLY; i++) await reserveRun(req(ip, cookieA), 'chat')
    expect((await reserveRun(req(ip, cookieA), 'chat')).allowed).toBe(false)

    const b = await reserveRun(req(ip), 'chat')
    expect(b.allowed).toBe(true)
    expect(b.quota?.remaining).toBe(FREE_WEEKLY - 1)
  })

  it('refund returns the use', async () => {
    const r = await reserveRun(req(ip), 'chat')
    const cookie = cookieOf(r.setCookie)
    if (!r.allowed) throw new Error('expected allowed')
    await r.refund()
    expect((await peekQuota(req(ip, cookie), 'chat'))?.remaining).toBe(FREE_WEEKLY)
  })

  it('keeps chat and analyze allowances separate', async () => {
    const r = await reserveRun(req(ip), 'chat')
    const cookie = cookieOf(r.setCookie)
    expect((await peekQuota(req(ip, cookie), 'analyze'))?.remaining).toBe(FREE_WEEKLY)
  })

  it('meters requests and denials', async () => {
    const [today] = await readMetering(1)
    expect(today.routes.chat.counters.requests).toBeGreaterThan(0)
    expect(today.routes.chat.counters['denied:quota']).toBeGreaterThan(0)
    expect(today.routes.chat.topCallers.length).toBeGreaterThan(0)
    expect(today.ceilingUsed).toBeGreaterThan(0)
  })
})

describe('caller screening', () => {
  it('buckets IPv6 by /64 and leaves IPv4 alone', () => {
    expect(ipBucket('198.51.100.7')).toBe('198.51.100.7')
    expect(ipBucket('2001:db8:1:2:aaaa:bbbb:cccc:dddd')).toBe(ipBucket('2001:db8:1:2::1'))
    expect(ipBucket('2001:db8:1:2::1')).not.toBe(ipBucket('2001:db8:1:3::1'))
    expect(hashIp('2001:db8:1:2::1')).toBe(hashIp('2001:db8:1:2:ffff::9'))
  })

  it('flags crawlers and HTTP libraries but not real browsers', () => {
    expect(isLikelyBot(null)).toBe(true)
    expect(isLikelyBot('curl/8.5.0')).toBe(true)
    expect(isLikelyBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isLikelyBot('Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/126.0.0.0 Safari/537.36')).toBe(true)
    expect(
      isLikelyBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'),
    ).toBe(false)
    expect(
      isLikelyBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'),
    ).toBe(false)
  })

  it('requires a same-host Origin header', () => {
    const mk = (origin?: string) =>
      new Request('https://americanpeptide.com/api/chat', {
        method: 'POST',
        headers: { host: 'americanpeptide.com', ...(origin ? { origin } : {}) },
      })
    expect(isSameOriginBrowser(mk('https://americanpeptide.com'))).toBe(true)
    expect(isSameOriginBrowser(mk('https://evil.example'))).toBe(false)
    expect(isSameOriginBrowser(mk())).toBe(false)
  })
})
