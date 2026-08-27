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

// ── Grounded-identifier guardrail ────────────────────────────────────────────
//
// A weaker primary model can confabulate specific EXTERNAL identifiers — NCT
// trial ids, PubChem CIDs, PubMed PMIDs, UniProt accessions — that LOOK
// verifiable but were never looked up (judged-eval failures: afamelanotide-trials
// invented NCT ids; copper-peptide-identity invented CIDs around a false identity
// claim). The deterministic citation check can't catch this: it only sees a
// well-formed id, not whether it is real.
//
// This is the enforceable backstop. "Grounded" = the identifier appeared in this
// turn's authoritative sources: the grounding-tool results and the injected
// verified catalog facts. Any external identifier in the answer that is NOT in
// that set is neutralized — a fabricated citation link is de-linked (keeping the
// surrounding words, per the sanitizeAgentLinks philosophy) and a bare fabricated
// id is replaced with an "(unverified …)" marker. It removes the false authority
// of a made-up identifier without deleting the model's directional claim.
//
// Scope note: this can only police IDENTIFIERS, not free-prose claims (a
// fabricated stoichiometry sentence with no id survives) — but stripping the
// invented CID/NCT is what removes the citation-grade authority the model leaned on.

/**
 * Collect external identifiers from `text` as canonical keys (e.g. "NCT:NCT06109649",
 * "CID:92432", "PMID:31680560", "UNIPROT:P01588"). Runs over both grounded sources
 * (to build the allow-set) and answer fragments (to test them), so the same URL /
 * prefixed / catalog-fact forms normalize identically on both sides.
 */
function collectIdentifiers(text: string): Set<string> {
  const ids = new Set<string>()
  // ClinicalTrials.gov NCT id — same token whether bare, in a study URL, or in
  // the tool's JSON ("nctId":"NCT…").
  for (const m of text.matchAll(/\bNCT\d{5,8}\b/gi)) ids.add('NCT:' + m[0].toUpperCase())
  // PubChem CID — "CID 123", "CID: 123", "PubChem CID: 123", or a /compound/123 URL.
  // (Leading zeros stripped so both sides key identically.)
  for (const m of text.matchAll(/\bCID[\s:]*0*(\d+)/gi)) ids.add('CID:' + m[1])
  for (const m of text.matchAll(/compound\/0*(\d+)/gi)) ids.add('CID:' + m[1])
  // PubMed PMID — "PMID 123", "PMID: 123", or a /pubmed/123 URL.
  for (const m of text.matchAll(/\bPMID[\s:]*0*(\d+)/gi)) ids.add('PMID:' + m[1])
  for (const m of text.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/0*(\d+)/gi)) ids.add('PMID:' + m[1])
  // UniProt accession — a uniprotkb URL, or the "UniProt: P01588" catalog-fact line.
  for (const m of text.matchAll(/uniprotkb\/([A-Za-z0-9]+)/gi)) ids.add('UNIPROT:' + m[1].toUpperCase())
  for (const m of text.matchAll(/\bUniProt[\s:]+([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z0-9]{3}[0-9])\b/gi))
    ids.add('UNIPROT:' + m[1].toUpperCase())
  return ids
}

/**
 * Neutralize external identifiers in `answer` that are absent from `groundedText`
 * (this turn's tool results + injected verified facts). Returns the cleaned text
 * and the count of neutralizations (for observability). A grounded set built from
 * empty grounded text neutralizes every external id — the correct behavior when
 * nothing was actually looked up.
 */
export function sanitizeUngroundedIdentifiers(
  answer: string,
  groundedText: string,
): { text: string; stripped: number } {
  const grounded = collectIdentifiers(groundedText)
  const ungrounded = (key: string) => !grounded.has(key)
  let stripped = 0

  // Pass 1 — external citation links whose id is ungrounded: drop the href, keep
  // the label (a bare-id label is neutralized in pass 2). Links with no external
  // identifier, or whose id IS grounded, are left untouched.
  let out = answer.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label: string, href: string) => {
    const hrefIds = collectIdentifiers(href)
    if (hrefIds.size === 0) return whole
    for (const key of hrefIds) {
      if (ungrounded(key)) {
        stripped++
        return label
      }
    }
    return whole
  })

  // Pass 2 — bare fabricated id tokens in prose → an "(unverified …)" marker.
  out = out
    .replace(/\bNCT\d{5,8}\b/gi, (tok) =>
      ungrounded('NCT:' + tok.toUpperCase()) ? ((stripped++, '(unverified trial id)')) : tok,
    )
    .replace(/\bCID[\s:]*0*(\d+)/gi, (tok, num: string) =>
      ungrounded('CID:' + num) ? ((stripped++, '(unverified CID)')) : tok,
    )
    .replace(/\bPMID[\s:]*0*(\d+)/gi, (tok, num: string) =>
      ungrounded('PMID:' + num) ? ((stripped++, '(unverified PMID)')) : tok,
    )

  return { text: out, stripped }
}
