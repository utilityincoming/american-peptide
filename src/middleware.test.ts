import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

function request(url: string, host: string) {
  return new NextRequest(new URL(url), {
    headers: { host },
  })
}

describe('middleware host canonicalization', () => {
  it('308-redirects www.americanpeptide.com to the bare apex, preserving path + query', () => {
    const res = middleware(
      request('https://www.americanpeptide.com/catalog/ghk-cu?x=1', 'www.americanpeptide.com'),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/catalog/ghk-cu?x=1')
  })

  it('redirects a www apex glossary URL to the apex', () => {
    const res = middleware(
      request('https://www.americanpeptide.com/glossary/diluent', 'www.americanpeptide.com'),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/glossary/diluent')
  })

  it('leaves the bare apex host untouched', () => {
    const res = middleware(
      request('https://americanpeptide.com/catalog/ghk-cu', 'americanpeptide.com'),
    )
    // NextResponse.next() has no redirect Location header.
    expect(res.headers.get('location')).toBeNull()
  })

  it('still 308s the .net outbound host to the apex for non-/go paths', () => {
    const res = middleware(
      request('https://americanpeptide.net/catalog/ghk-cu', 'americanpeptide.net'),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/catalog/ghk-cu')
  })

  it('lets the /go chokepoint through on the .net host', () => {
    const res = middleware(request('https://americanpeptide.net/go/abc', 'americanpeptide.net'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('308s the .org consolidation host to the apex, preserving path + query', () => {
    const res = middleware(
      request('https://americanpeptide.org/catalog/ghk-cu?ref=x', 'americanpeptide.org'),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/catalog/ghk-cu?ref=x')
  })

  it('308s www.americanpeptide.org to the apex too', () => {
    const res = middleware(
      request('https://www.americanpeptide.org/research', 'www.americanpeptide.org'),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/research')
  })

  it('does NOT carve out /go on .org — only .net serves the outbound chokepoint', () => {
    const res = middleware(request('https://americanpeptide.org/go/abc', 'americanpeptide.org'))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/go/abc')
  })
})
