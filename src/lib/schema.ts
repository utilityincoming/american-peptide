// Shared Schema.org / JSON-LD builders.
//
// Two jobs:
//   1. A site-wide entity graph (Organization + the WebSite it publishes),
//      emitted once from the root layout so every page carries the same
//      canonical entity. Answer engines dedupe structured data on `@id`, so a
//      single Organization node referenced by @id from everywhere reads as one
//      authority — not dozens of unlinked mentions.
//   2. A reusable BreadcrumbList builder, replacing the per-page hand-rolled
//      breadcrumb objects so the trail is impossible to get subtly wrong.

import { API_SITE, API_ATTRIBUTION } from './catalog-api'

export const SITE = API_SITE
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

// Stable @id anchors. Every node that references the site's identity points at
// these instead of redeclaring name/url/logo.
export const ORG_ID = `${SITE}/#organization`
export const WEBSITE_ID = `${SITE}/#website`

/** Site-relative path ('/catalog') or absolute URL → absolute URL. */
function absolute(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  return `${SITE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

// ── Site entity graph ────────────────────────────────────────────────────────

function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: API_ATTRIBUTION,
    url: SITE,
    description:
      'An AI-assisted research platform and open reference for peptide science.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE}/apple-touch-icon.png`,
      width: 180,
      height: 180,
    },
    foundingDate: '2026',
    // Add every profile you actually control — GitHub, LinkedIn, Crunchbase,
    // Wikidata — as they go live. sameAs is how an answer engine reconciles
    // this site with a known entity in its graph.
    sameAs: ['https://x.com/USPeptide'],
  }
}

function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE,
    name: 'AmericanPeptide.com',
    inLanguage: 'en-US',
    publisher: { '@id': ORG_ID },
    license: LICENSE_URL,
    // Natural-language site search via the Peptide Agent (/research?q=…). Makes
    // the WebSite entity eligible for a sitelinks searchbox and tells answer
    // engines the site accepts a query — which is literally what it does.
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}/research?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * The root-layout graph: the Organization and the WebSite it publishes, linked
 * by @id and emitted once for the whole site.
 */
export function siteGraphJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), webSiteNode()],
  }
}

// ── Freshness ────────────────────────────────────────────────────────────────

/**
 * Freshness props to spread into any CreativeWork node (WebPage, Article,
 * CollectionPage, …). Emits nothing when there is no honest date to report, so
 * a page never advertises a modification it can't back up.
 */
export function freshnessProps(dateModified?: string, datePublished?: string) {
  if (!dateModified) return {}
  return { dateModified, ...(datePublished ? { datePublished } : {}) }
}

/**
 * A page-level entity for content whose primary node isn't itself a
 * CreativeWork — e.g. a catalog page whose subject is a MolecularEntity, so
 * the dateModified must live on the *page*, not the compound. Linked into the
 * site graph by @id (isPartOf the WebSite, published by the Organization).
 */
export function webPageJsonLd(opts: {
  url: string
  name: string
  description?: string
  dateModified: string
  datePublished?: string
  /** @id of the primary entity this page is about (e.g. `${url}#entity`). */
  mainEntityId?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    inLanguage: 'en-US',
    license: LICENSE_URL,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    ...freshnessProps(opts.dateModified, opts.datePublished),
    ...(opts.mainEntityId ? { mainEntity: { '@id': opts.mainEntityId } } : {}),
  }
}

export function medicalWebPageJsonLd(opts: {
  url: string
  name: string
  description?: string
  dateModified: string
  datePublished?: string
  /** @id of the primary entity this page is about (e.g. `${url}#substance`). */
  mainEntityId?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    inLanguage: 'en-US',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    ...freshnessProps(opts.dateModified, opts.datePublished),
    ...(opts.mainEntityId ? { mainEntity: { '@id': opts.mainEntityId } } : {}),
  }
}

export interface MolecularEntityInput {
  slug: string
  name: string
  shortDescription?: string
  aliases?: string[]
  molecularFormula?: string
  molecularWeight?: number
  cas?: string
  pubchemCid?: number
  uniprotId?: string
}

/**
 * Strict reference-only JSON-LD for a catalog compound monograph using
 * Schema.org MolecularEntity. Derived strictly from verified catalog fields —
 * emits zero Product, Offer, Drug, or MedicalEntity properties.
 */
export function molecularEntityJsonLd(peptide: MolecularEntityInput) {
  const url = `${SITE}/catalog/${peptide.slug}`
  const sameAs: string[] = []
  if (peptide.pubchemCid) {
    sameAs.push(`https://pubchem.ncbi.nlm.nih.gov/compound/${peptide.pubchemCid}`)
  }
  if (peptide.uniprotId) {
    sameAs.push(`https://www.uniprot.org/uniprotkb/${peptide.uniprotId}`)
  }

  const identifier: {
    '@type': 'PropertyValue'
    propertyID: string
    value: string
  }[] = []
  if (peptide.cas) {
    identifier.push({ '@type': 'PropertyValue', propertyID: 'CAS', value: peptide.cas })
  }
  if (peptide.pubchemCid) {
    identifier.push({
      '@type': 'PropertyValue',
      propertyID: 'PubChem CID',
      value: String(peptide.pubchemCid),
    })
  }
  if (peptide.uniprotId) {
    identifier.push({
      '@type': 'PropertyValue',
      propertyID: 'UniProt',
      value: peptide.uniprotId,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'MolecularEntity',
    '@id': `${url}#entity`,
    name: peptide.name,
    ...(peptide.shortDescription ? { description: peptide.shortDescription } : {}),
    url,
    license: LICENSE_URL,
    ...(peptide.aliases?.length ? { alternateName: peptide.aliases } : {}),
    ...(peptide.molecularFormula ? { molecularFormula: peptide.molecularFormula } : {}),
    ...(typeof peptide.molecularWeight === 'number' && Number.isFinite(peptide.molecularWeight)
      ? {
          molecularWeight: {
            '@type': 'QuantitativeValue',
            value: peptide.molecularWeight,
            unitText: 'g/mol',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(identifier.length ? { identifier } : {}),
  }
}

/**
 * Build a stateless calculator handoff URL (?compound=<slug>&mw=<value> plus
 * optional preset vial/dose/water parameters). Uses URL params only, zero server state.
 */
export function buildCalculatorHandoffUrl(opts: {
  slug: string
  molecularWeight?: number
  preset?: { vialMg: number; doseMcg: number; waterMl: number } | null
  basePath?: string
}): string {
  const basePath = opts.basePath ?? '/tools/reconstitution-calculator'
  const sp = new URLSearchParams()
  sp.set('compound', opts.slug)
  if (typeof opts.molecularWeight === 'number' && Number.isFinite(opts.molecularWeight)) {
    sp.set('mw', String(opts.molecularWeight))
  }
  if (opts.preset) {
    sp.set('vial', String(opts.preset.vialMg))
    sp.set('dose', String(opts.preset.doseMcg))
    sp.set('water', String(opts.preset.waterMl))
  }
  return `${basePath}?${sp.toString()}`
}

/**
 * Build a stateless Peptide Agent handoff URL (?q=<compound_name> scoped with
 * verified identifiers: PubChem CID, UniProt ID, and NCT IDs).
 */
export function buildAgentHandoffUrl(opts: {
  slug: string
  name: string
  question?: string
  pubchemCid?: number
  uniprotId?: string
  nctIds?: string[]
}): string {
  const ids: string[] = []
  if (opts.pubchemCid) ids.push(`PubChem CID ${opts.pubchemCid}`)
  if (opts.uniprotId) ids.push(`UniProt ${opts.uniprotId}`)
  if (opts.nctIds && opts.nctIds.length > 0) {
    const cleanNcts = opts.nctIds.filter((id) => /^NCT\d+$/i.test(id)).slice(0, 3)
    if (cleanNcts.length > 0) ids.push(`NCT ${cleanNcts.join(', ')}`)
  }
  const idScope = ids.length > 0 ? ` (${ids.join(' · ')})` : ''
  const q = opts.question
    ? opts.question.includes(idScope) || !idScope
      ? opts.question
      : `${opts.question} ${idScope}`
    : `${opts.name}${idScope}`
  const sp = new URLSearchParams()
  sp.set('q', q)
  sp.set('ctx', `compound:${opts.slug}`)
  return `/research?${sp.toString()}`
}

/**
 * Build a zero-PII correction / citation flag link routed to /about/contact,
 * pre-filled only with the compound slug and section name.
 */
export function buildCorrectionHandoffUrl(opts: {
  slug: string
  section: string
}): string {
  const sp = new URLSearchParams()
  sp.set('topic', 'correction')
  sp.set('compound', opts.slug)
  sp.set('section', opts.section)
  return `/about/contact?${sp.toString()}`
}

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

export interface Crumb {
  name: string
  /** Site-relative path ('/catalog') or absolute URL. Omit for the site root. */
  path?: string
}

/**
 * BreadcrumbList builder. Pass the trail from the top level down to the current
 * page; a Home crumb is prepended automatically, and each item is resolved to
 * an absolute URL so the trail is anchored to the site.
 *
 *   breadcrumbJsonLd([
 *     { name: 'Catalog', path: '/catalog' },
 *     { name: peptide.name, path: `/catalog/${peptide.slug}` },
 *   ])
 */
export function breadcrumbJsonLd(trail: Crumb[]) {
  const items: Crumb[] = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.path ?? '/'),
    })),
  }
}
