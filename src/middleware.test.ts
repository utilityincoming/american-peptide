import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

function request(url: string, host: string, accept?: string) {
  const headers: Record<string, string> = { host }
  if (accept !== undefined) headers.accept = accept
  return new NextRequest(new URL(url), { headers })
}

// NextResponse.rewrite records its destination in this internal header.
function rewriteTarget(res: { headers: Headers }): string | null {
  const raw = res.headers.get('x-middleware-rewrite')
  if (!raw) return null
  try {
    return new URL(raw).pathname
  } catch {
    return raw
  }
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

  it('leaves americanpeptide.org untouched — it is a separate live site, not a redirect host', () => {
    const res = middleware(
      request('https://americanpeptide.org/standards/evidence-tier/v0.1', 'americanpeptide.org'),
    )
    // No match in REDIRECT_HOSTS → NextResponse.next(), no Location. Guards
    // against anyone re-adding .org and silently 308-ing the standards site.
    expect(res.headers.get('location')).toBeNull()
  })
})

const MD = 'text/markdown'
const HTML = 'text/html,application/xhtml+xml,*/*'

describe('middleware markdown content negotiation', () => {
  it('rewrites the apex home page to its markdown twin for Accept: text/markdown', () => {
    const res = middleware(request('https://americanpeptide.com/', 'americanpeptide.com', MD))
    expect(rewriteTarget(res)).toBe('/md/index')
    expect(res.headers.get('vary')).toBe('Accept')
    expect(res.headers.get('location')).toBeNull()
  })

  it('rewrites a catalog page to its markdown twin for Accept: text/markdown', () => {
    const res = middleware(
      request('https://americanpeptide.com/catalog/bpc-157', 'americanpeptide.com', MD),
    )
    expect(rewriteTarget(res)).toBe('/md/catalog/bpc-157')
    expect(res.headers.get('vary')).toBe('Accept')
  })

  it('rewrites research-area and compare pages to their markdown twins', () => {
    const area = middleware(
      request('https://americanpeptide.com/research-areas/longevity', 'americanpeptide.com', MD),
    )
    expect(rewriteTarget(area)).toBe('/md/research-areas/longevity')

    const cmp = middleware(
      request('https://americanpeptide.com/compare/cjc-1295-vs-ipamorelin', 'americanpeptide.com', MD),
    )
    expect(rewriteTarget(cmp)).toBe('/md/compare/cjc-1295-vs-ipamorelin')
  })

  it('serves HTML (no rewrite) to browsers, but tags the negotiable URL Vary: Accept', () => {
    const res = middleware(
      request('https://americanpeptide.com/catalog/bpc-157', 'americanpeptide.com', HTML),
    )
    expect(rewriteTarget(res)).toBeNull()
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('vary')).toBe('Accept')
  })

  it('does not treat */* or text/* as a markdown request', () => {
    for (const accept of ['*/*', 'text/*', 'text/html']) {
      const res = middleware(
        request('https://americanpeptide.com/catalog/bpc-157', 'americanpeptide.com', accept),
      )
      expect(rewriteTarget(res)).toBeNull()
    }
  })

  it('does not negotiate multi-segment or already-markdown sibling paths', () => {
    for (const path of [
      '/catalog', // index
      '/catalog/compare', // /md/compare is for /compare, not this
      '/catalog/category/longevity', // two segments under catalog
      '/catalog/bpc-157.md', // explicit markdown URL already
      '/about', // no markdown twin
    ]) {
      const res = middleware(request(`https://americanpeptide.com${path}`, 'americanpeptide.com', MD))
      expect(rewriteTarget(res)).toBeNull()
    }
  })

  it('does not negotiate markdown on the .net redirect host — it still 308s to .com', () => {
    const res = middleware(
      request('https://americanpeptide.net/catalog/bpc-157', 'americanpeptide.net', MD),
    )
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://americanpeptide.com/catalog/bpc-157')
  })
})
