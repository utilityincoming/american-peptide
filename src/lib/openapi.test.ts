import { describe, it, expect } from 'vitest'
import { openApiSpec } from './openapi'
import { API_VERSION } from './catalog-api'

const spec = openApiSpec()

// Collect every local "$ref": "#/a/b/c" string anywhere in the document.
function collectRefs(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const v of node) collectRefs(v, out)
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') out.push(v)
      else collectRefs(v, out)
    }
  }
  return out
}

function resolve(ref: string): unknown {
  // "#/components/schemas/Peptide" → walk the spec object.
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
      return undefined
    }, spec)
}

describe('OpenAPI spec', () => {
  it('is OpenAPI 3.1 and versioned from the shared constant', () => {
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.info.version).toBe(API_VERSION)
  })

  it('every $ref resolves to a defined node', () => {
    const refs = [...new Set(collectRefs(spec))]
    expect(refs.length).toBeGreaterThan(0)
    const broken = refs.filter((r) => resolve(r) === undefined)
    expect(broken).toEqual([])
  })

  it('documents the core catalog endpoints', () => {
    expect(spec.paths['/api/catalog']?.get).toBeTruthy()
    expect(spec.paths['/api/catalog/{slug}']?.get).toBeTruthy()
    expect(spec.paths['/api/keys']?.post).toBeTruthy()
  })

  it('declares the bearer + x-api-key security schemes', () => {
    const schemes = spec.components.securitySchemes
    expect(schemes.ApiKeyHeader).toMatchObject({ type: 'apiKey', in: 'header', name: 'x-api-key' })
    expect(schemes.BearerAuth).toMatchObject({ type: 'http', scheme: 'bearer' })
  })

  it('gives every operation a unique operationId', () => {
    const ids: string[] = []
    for (const path of Object.values(spec.paths)) {
      for (const [method, op] of Object.entries(path as Record<string, unknown>)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          ids.push((op as { operationId: string }).operationId)
        }
      }
    }
    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
