import { describe, it, expect } from 'vitest'
import { goUrl, REDIRECT_ORIGIN } from './redirect-origin'

// These tests run with NEXT_PUBLIC_REDIRECT_ORIGIN unset (the default), which is
// the state that must never break the live site: links stay same-origin. The
// activated (.net) behavior is a build-time inlined constant, exercised by the
// deploy with the env var set rather than re-imported here.
describe('goUrl', () => {
  it('leaves a /go path same-origin when no redirect origin is configured', () => {
    expect(REDIRECT_ORIGIN).toBe('')
    expect(goUrl('/go/amino-club')).toBe('/go/amino-club')
    expect(goUrl('/go/amino-club?p=bpc-157')).toBe('/go/amino-club?p=bpc-157')
  })
})
