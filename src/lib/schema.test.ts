import { describe, it, expect } from 'vitest'
import {
  buildAgentHandoffUrl,
  buildCalculatorHandoffUrl,
  buildCorrectionHandoffUrl,
  datasetJsonLd,
  breadcrumbJsonLd,
  molecularEntityJsonLd,
  siteGraphJsonLd,
  webApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/schema'
import {
  PEPTIDES,
  LISTED_PEPTIDES,
  CATALOG_COUNT,
  CATEGORY_COUNT,
  CATALOG_FDA_APPROVED_COUNT,
  CATALOG_FULL_SEQUENCE_COUNT,
  CATALOG_MORE_BEYOND_SPOTLIGHT_COUNT,
  BROWSE_SPOTLIGHT,
} from '@/lib/peptides'
import { RESEARCH_AREAS_MAPPED_COUNT } from '@/lib/research-areas'
import { CONTACT_EMAIL, PRIVACY_EMAIL, TODO_CONFIRM_CONTACT_MAILBOX } from '@/lib/contact'

const FORBIDDEN_SCHEMA_TYPES = new Set([
  'Product',
  'Offer',
  'AggregateOffer',
  'Store',
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
  it('emits valid layout-level Organization and WebSite JSON-LD with disambiguation and zero outbound americanpeptide.org links', () => {
    const graph = siteGraphJsonLd()
    const raw = JSON.stringify(graph)
    expect(raw).not.toContain('americanpeptide.org')
    expect(graph['@context']).toBe('https://schema.org')
    const [org, site] = graph['@graph']
    expect(org['@type']).toBe('Organization')
    expect(org.url).toBe('https://americanpeptide.com')
    expect(org.disambiguatingDescription).toContain('American Peptide Company')
    expect(site['@type']).toBe('WebSite')
    expect(site.url).toBe('https://americanpeptide.com')
    expect(site.license).toBe('https://creativecommons.org/licenses/by/4.0/')

    const { types, keys } = collectTypesAndKeys(graph)
    for (const t of types) {
      expect(FORBIDDEN_SCHEMA_TYPES.has(t)).toBe(false)
    }
    for (const k of keys) {
      expect(FORBIDDEN_SCHEMA_KEYS.has(k)).toBe(false)
    }
  })

  it('keeps catalog counts and @americanpeptide.com contact addresses consistent from a single source of truth', () => {
    expect(CATALOG_COUNT).toBe(LISTED_PEPTIDES.length)
    expect(CATALOG_FDA_APPROVED_COUNT).toBe(LISTED_PEPTIDES.filter((p) => p.fdaApproved).length)
    expect(CATALOG_FULL_SEQUENCE_COUNT).toBe(LISTED_PEPTIDES.filter((p) => p.sequence).length)
    expect(CATALOG_MORE_BEYOND_SPOTLIGHT_COUNT).toBe(
      LISTED_PEPTIDES.length - BROWSE_SPOTLIGHT.length,
    )
    expect(CATEGORY_COUNT).toBe(11)
    expect(RESEARCH_AREAS_MAPPED_COUNT).toBeGreaterThan(0)
    expect(RESEARCH_AREAS_MAPPED_COUNT).toBeLessThanOrEqual(CATALOG_COUNT)

    expect(CONTACT_EMAIL).toMatch(/@americanpeptide\.com$/)
    expect(PRIVACY_EMAIL).toMatch(/@americanpeptide\.com$/)
    expect(TODO_CONFIRM_CONTACT_MAILBOX).toBe(true)
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

describe('dataset and web application schema', () => {
  it('marks a monograph as a CC BY research dataset with identifiers', () => {
    const bpc = PEPTIDES.find((p) => p.slug === 'bpc-157')!
    const ld = datasetJsonLd(bpc)
    const { types, keys } = collectTypesAndKeys(ld)
    expect(ld['@type']).toBe('Dataset')
    expect(ld.license).toContain('creativecommons.org/licenses/by/4.0')
    expect(ld.description).toMatch(/Not medical advice/)
    expect(JSON.stringify(ld.identifier)).toContain('PubChem CID')
    for (const type of types) expect(FORBIDDEN_SCHEMA_TYPES.has(type)).toBe(false)
    for (const key of keys) expect(FORBIDDEN_SCHEMA_KEYS.has(key)).toBe(false)
  })

  it('describes a tool as a browser educational application', () => {
    const ld = webApplicationJsonLd({
      name: 'Peptide Design Lab',
      description: 'Live sequence properties.',
      path: '/tools/design-lab',
    })
    expect(ld['@type']).toBe('WebApplication')
    expect(ld.url).toBe('https://americanpeptide.com/tools/design-lab')
    expect(ld.operatingSystem).toBe('Web browser')
  })

  it('builds a Home-rooted breadcrumb for a tool page', () => {
    const ld = breadcrumbJsonLd([
      { name: 'COA Decoder', path: '/tools/coa-decoder' },
    ])
    expect(ld['@type']).toBe('BreadcrumbList')
    expect(ld.itemListElement[0]).toMatchObject({ name: 'Home', item: 'https://americanpeptide.com/' })
    expect(ld.itemListElement[1].item).toBe('https://americanpeptide.com/tools/coa-decoder')
  })
})
