// Output-side guardrail for the research agent.
//
// The system prompt tells the model to link ONLY to internal pages from the
// supplied index and never to invent a URL. This is the enforceable backstop:
// after generation, we verify every link to a dynamic *entity* page
// (/catalog/{slug}, /research-areas/{slug}, /compare/{slug}) actually resolves
// to a real slug. If the model fabricated one (e.g. /catalog/made-up-peptide),
// we strip the link but KEEP the link text — the reader still gets the words,
// just not a dead/hallucinated href.
//
// Deliberately conservative: we ONLY touch the three dynamic entity patterns.
// Static pages (/synthesis, /glp-1, /trials, /learn/*, …) and external
// citations (PubChem/PubMed/ClinicalTrials URLs the tools returned) are left
// untouched, so this can't create false positives on legitimate links.

import { PEPTIDES } from './peptides'
import { RESEARCH_AREAS } from './research-areas'
import { COMPARISONS } from './comparisons'

const PEPTIDE_SLUGS = new Set(PEPTIDES.map((p) => p.slug))
const AREA_SLUGS = new Set(RESEARCH_AREAS.map((a) => a.slug))
const COMPARISON_SLUGS = new Set(COMPARISONS.map((c) => c.slug))

// Hosts we treat as "us" when an absolute URL is used.
const INTERNAL_HOSTS = new Set([
  'americanpeptide.com',
  'www.americanpeptide.com',
])

/** Reduce an href to a root-relative path if it's internal; else null. */
function internalPath(href: string): string | null {
  if (href.startsWith('/')) return href
  try {
    const u = new URL(href)
    if (INTERNAL_HOSTS.has(u.host)) return u.pathname
  } catch {
    /* not an absolute URL */
  }
  return null
}

/**
 * Whether a path is a *known-bad* dynamic entity link — i.e. it matches one of
 * the three entity patterns but the slug does not exist. Returns false for any
 * path that isn't a dynamic entity link (those are left alone).
 */
function isInvalidEntityPath(path: string): boolean {
  const m = path.match(/^\/(catalog|research-areas|compare)\/([a-z0-9-]+)\/?$/i)
  if (!m) return false
  const kind = m[1].toLowerCase()
  const slug = m[2].toLowerCase()
  if (kind === 'catalog') return !PEPTIDE_SLUGS.has(slug)
  if (kind === 'research-areas') return !AREA_SLUGS.has(slug)
  return !COMPARISON_SLUGS.has(slug)
}

/**
 * Strip markdown links to fabricated internal entity pages, keeping the text.
 * Returns the cleaned text and the count of links removed (for observability).
 */
export function sanitizeAgentLinks(text: string): { text: string; stripped: number } {
  let stripped = 0
  // Matches [label](href). Href stops at the first ')' — good enough for the
  // simple absolute/relative URLs the agent emits (no parenthesised URLs).
  const cleaned = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (whole, label: string, href: string) => {
      const path = internalPath(href)
      if (path && isInvalidEntityPath(path)) {
        stripped++
        return label
      }
      return whole
    },
  )
  return { text: cleaned, stripped }
}
