import { describe, it, expect } from 'vitest'
import {
  buildAgentHandoffUrl,
  buildCalculatorHandoffUrl,
  buildCorrectionHandoffUrl,
  molecularEntityJsonLd,
  webPageJsonLd,
} from '@/lib/schema'
import { PEPTIDES } from '@/lib/peptides'

const FORBIDDEN_SCHEMA_TYPES = new Set([
  'Product',
  'Offer',
  'AggregateOffer',
  'Drug',
  'MedicalEntity',
  'MedicalWebPage',
  'DietarySupplement',
])

const FORBIDDEN_SCHEMA_KEYS = new Set([
  'offers',
  'price',
  'priceCurrency',
  'drugClass',
  'administrationRoute',
  'legalStatus',
  'recognizingAuthority',
  'brand',
  'activeIngredient',
  'dosageForm',
])

function collectTypesAndKeys(node: unknown, types: string[] = [], keys: string[] = []) {
  if (!node || typeof node !== 'object') return { types, keys }
  if (Array.isArray(node)) {
    for (const item of node) collectTypesAndKeys(item, types, keys)
    return { types, keys }
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    keys.push(k)
    if (k === '@type' && typeof v === 'string') types.push(v)
    collectTypesAndKeys(v, types, keys)
  }
  return { types, keys }
}

describe('molecularEntityJsonLd — strict reference-only schema', () => {
  it('emits valid MolecularEntity with name, molecularWeight, sameAs (PubChem/UniProt), and CC BY 4.0 license', () => {
    const bpc = PEPTIDES.find((p) => p.slug === 'bpc-157')!
    const ld = molecularEntityJsonLd(bpc)

    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('MolecularEntity')
    expect(ld.name).toBe('BPC-157')
    expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(ld.molecularWeight).toEqual({
      '@type': 'QuantitativeValue',
      value: 1419.5,
      unitText: 'g/mol',
    })
    expect(ld.sameAs).toContain('https://pubchem.ncbi.nlm.nih.gov/compound/9941957')
  })

  it('includes UniProt sameAs URL when uniprotId is verified', () => {
    const tb4 = PEPTIDES.find((p) => p.slug === 'thymosin-beta-4')!
    const ld = molecularEntityJsonLd(tb4)
    expect(ld.sameAs).toContain('https://www.uniprot.org/uniprotkb/P62328')
  })

  it('emits zero Product, Offer, Drug, or MedicalEntity types or properties across the entire catalog', () => {
    for (const peptide of PEPTIDES) {
      const entity = molecularEntityJsonLd(peptide)
      const page = webPageJsonLd({
        url: `https://americanpeptide.com/catalog/${peptide.slug}`,
        name: `${peptide.name} — AmericanPeptide.com Catalog`,
        description: peptide.shortDescription,
        dateModified: '2026-11-24',
        mainEntityId: `https://americanpeptide.com/catalog/${peptide.slug}#entity`,
      })

      const { types, keys } = collectTypesAndKeys([entity, page])
      for (const t of types) {
        expect(FORBIDDEN_SCHEMA_TYPES.has(t)).toBe(false)
      }
      for (const k of keys) {
        expect(FORBIDDEN_SCHEMA_KEYS.has(k)).toBe(false)
      }
    }
  })
})

describe('stateless tool handoffs & zero-PII correction URLs', () => {
  it('builds calculator handoff with ?compound=<slug>&mw=<value> plus preset params when available', () => {
    const urlWithPreset = buildCalculatorHandoffUrl({
      slug: 'bpc-157',
      molecularWeight: 1419.5,
      preset: { vialMg: 5, doseMcg: 250, waterMl: 2 },
    })
    expect(urlWithPreset).toBe(
      '/tools/reconstitution-calculator?compound=bpc-157&mw=1419.5&vial=5&dose=250&water=2',
    )

    const urlWithoutPreset = buildCalculatorHandoffUrl({
      slug: 'ara-290',
      molecularWeight: 1257.3,
    })
    expect(urlWithoutPreset).toBe('/tools/reconstitution-calculator?compound=ara-290&mw=1257.3')
  })

  it('builds Peptide Agent handoff scoped with verified PubChem CID, UniProt, and NCT IDs', () => {
    const url = buildAgentHandoffUrl({
      slug: 'semaglutide',
      name: 'Semaglutide',
      pubchemCid: 56843331,
      uniprotId: 'P01275',
      nctIds: ['NCT05567796', 'NCT06123456'],
    })
    const parsed = new URL(url, 'https://americanpeptide.com')
    expect(parsed.pathname).toBe('/research')
    expect(parsed.searchParams.get('ctx')).toBe('compound:semaglutide')
    expect(parsed.searchParams.get('q')).toBe(
      'Semaglutide (PubChem CID 56843331 · UniProt P01275 · NCT NCT05567796, NCT06123456)',
    )
  })

  it('builds zero-PII correction link pre-filled only with compound slug and section name', () => {
    const url = buildCorrectionHandoffUrl({
      slug: 'ghk-cu',
      section: 'Identity & citations',
    })
    const parsed = new URL(url, 'https://americanpeptide.com')
    expect(parsed.pathname).toBe('/about/contact')
    expect(parsed.searchParams.get('topic')).toBe('correction')
    expect(parsed.searchParams.get('compound')).toBe('ghk-cu')
    expect(parsed.searchParams.get('section')).toBe('Identity & citations')
  })
})
