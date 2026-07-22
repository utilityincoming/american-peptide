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
    sameAs: ['https://x.com/americanpeptide', 'https://twitter.com/americanpeptide'],
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
 * CreativeWork — e.g. a catalog page whose subject is a ChemicalSubstance, so
 * the dateModified must live on the *page*, not the compound. Linked into the
 * site graph by @id (isPartOf the WebSite, published by the Organization).
 */
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
