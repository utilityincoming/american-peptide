// Markdown surfaces for AI agents.
//
// Three public endpoints are generated from this module so they can never
// drift from the catalog data:
//   /llms.txt           — curated site index (llmstxt.org convention)
//   /llms-full.txt      — the entire catalog as one markdown document
//   /catalog/{slug}.md  — one peptide as clean markdown (rewritten to
//                         /md/catalog/{slug} in next.config.ts)
//
// Agents that fetch markdown instead of HTML get the same facts at a fraction
// of the tokens, with the canonical URL and CC BY 4.0 attribution embedded in
// every document — so content that travels keeps pointing home.

import {
  PEPTIDES,
  CATEGORIES,
  getCategoryLabel,
  getPeptidesByCategory,
  type Peptide,
} from './peptides'
import {
  RESEARCH_AREAS,
  getAreasForPeptide,
  getPeptidesForArea,
  type ResearchArea,
} from './research-areas'
import { COMPARISONS, type Comparison } from './comparisons'
import { GLOSSARY } from './glossary'
import {
  API_SITE,
  API_LICENSE,
  API_ATTRIBUTION,
  CORS_HEADERS,
  CACHE_HEADERS,
} from './catalog-api'

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

// ── Headers ──────────────────────────────────────────────────────────────────

/**
 * Headers for markdown/plaintext agent surfaces: CORS-open, edge-cached, with
 * machine-readable license + canonical links so scrapers and agents can
 * attribute without parsing the body.
 */
export function markdownHeaders(opts: {
  contentType: 'text/plain' | 'text/markdown'
  canonical: string
}): Record<string, string> {
  return {
    ...CORS_HEADERS,
    ...CACHE_HEADERS,
    'Content-Type': `${opts.contentType}; charset=utf-8`,
    Link: `<${opts.canonical}>; rel="canonical", <${LICENSE_URL}>; rel="license", <${opts.canonical}>; rel="cite-as"`,
    'X-Robots-Tag': 'noindex', // markdown mirrors must not compete with the HTML pages in search
  }
}

// ── Shared fragments ─────────────────────────────────────────────────────────

function attributionFooter(canonical: string): string {
  return [
    '---',
    '',
    `Source: ${API_ATTRIBUTION} — ${canonical}`,
    `Data license: ${API_LICENSE} (${LICENSE_URL}). Attribution: ${API_ATTRIBUTION}.`,
    'Research reference only — computational and educational content, not medical advice.',
  ].join('\n')
}

function faqBlock(faqs: { q: string; a: string }[]): string[] {
  const lines: string[] = []
  for (const f of faqs) {
    lines.push(`### ${f.q}`, '', f.a, '')
  }
  return lines
}

// ── Single peptide → markdown ────────────────────────────────────────────────

import type { LatestResearch } from './freshness'

function latestResearchBlock(latest: LatestResearch): string[] {
  const lines: string[] = []
  if (!latest.trials.length && !latest.articles.length) return lines
  lines.push(
    '## Latest research',
    '',
    `Recent trials and publications mentioning ${latest.query}, pulled automatically from ClinicalTrials.gov and PubMed (unfiltered search results, refreshed daily).`,
    '',
  )
  if (latest.trials.length) {
    lines.push('### Recent trials', '')
    for (const t of latest.trials) {
      const meta = [t.status, t.phase, t.nctId].filter(Boolean).join(' · ')
      lines.push(`- [${t.title}](${t.url})${meta ? ` — ${meta}` : ''}`)
    }
    lines.push('')
  }
  if (latest.articles.length) {
    lines.push('### Recent publications', '')
    for (const a of latest.articles) {
      const meta = [a.journal, a.date].filter(Boolean).join(', ')
      lines.push(`- [${a.title}](${a.url})${meta ? ` — ${meta}` : ''} (PMID ${a.pmid})`)
    }
    lines.push('')
  }
  return lines
}

export function peptideMarkdown(p: Peptide, latest?: LatestResearch): string {
  const canonical = `${API_SITE}/catalog/${p.slug}`
  const areas = getAreasForPeptide(p)
  const lines: string[] = []

  lines.push(`# ${p.name}`, '', `> ${p.shortDescription}`, '')

  const facts: string[] = []
  if (p.aliases?.length) facts.push(`- Also known as: ${p.aliases.join(', ')}`)
  facts.push(
    `- Class: ${p.categories.map((c) => getCategoryLabel(c)).join(', ')}`,
  )
  facts.push(`- FDA approved: ${p.fdaApproved ? 'Yes' : 'No'}`)
  facts.push(`- Canonical page: ${canonical}`)
  lines.push(...facts, '')

  lines.push('## Overview', '', p.description, '')
  if (p.background?.length) lines.push(...p.background.flatMap((b) => [b, '']))

  if (p.mechanism) lines.push('## Mechanism', '', p.mechanism, '')

  // Chemistry table — only rows we actually have.
  const chem: [string, string][] = []
  if (p.molecularFormula) chem.push(['Molecular formula', p.molecularFormula])
  if (p.molecularWeight) chem.push(['Molecular weight', `${p.molecularWeight} Da`])
  if (p.cas) chem.push(['CAS number', p.cas])
  if (p.pubchemCid)
    chem.push([
      'PubChem CID',
      `[${p.pubchemCid}](https://pubchem.ncbi.nlm.nih.gov/compound/${p.pubchemCid})`,
    ])
  if (p.uniprotId)
    chem.push(['UniProt', `[${p.uniprotId}](https://www.uniprot.org/uniprotkb/${p.uniprotId})`])
  if (chem.length) {
    lines.push('## Chemistry', '', '| Property | Value |', '| --- | --- |')
    lines.push(...chem.map(([k, v]) => `| ${k} | ${v} |`), '')
  }
  if (p.sequence) lines.push('## Sequence', '', '```', p.sequence, '```', '')

  if (p.researchAreas?.length || areas.length) {
    lines.push('## Research areas')
    lines.push('')
    if (p.researchAreas?.length)
      lines.push(`Studied in: ${p.researchAreas.join(', ')}.`, '')
    if (areas.length) {
      lines.push('Guides on this site:', '')
      lines.push(
        ...areas.map(
          (a) => `- [${a.label}](${API_SITE}/research-areas/${a.slug}): ${a.tagline}`,
        ),
        '',
      )
    }
  }

  if (p.keyResearch?.length) {
    lines.push('## Key research', '', ...p.keyResearch.map((k) => `- ${k}`), '')
  }

  const practical: string[] = []
  if (p.storage) practical.push(`**Storage.** ${p.storage}`, '')
  if (p.handling) practical.push(`**Handling.** ${p.handling}`, '')
  if (p.synthesisNotes) practical.push(`**Synthesis.** ${p.synthesisNotes}`, '')
  if (practical.length) lines.push('## Storage, handling & synthesis', '', ...practical)

  if (p.faqs?.length) lines.push('## FAQs', '', ...faqBlock(p.faqs))

  if (latest) lines.push(...latestResearchBlock(latest))

  lines.push(attributionFooter(canonical))
  return lines.join('\n')
}

// ── Research area → markdown ─────────────────────────────────────────────────

export function researchAreaMarkdown(a: ResearchArea): string {
  const canonical = `${API_SITE}/research-areas/${a.slug}`
  const peps = getPeptidesForArea(a)
  const lines: string[] = []

  lines.push(`# ${a.label}`, '', `> ${a.tagline}`, '')
  lines.push(...a.intro.flatMap((p) => [p, '']))

  if (peps.length) {
    lines.push('## Peptides studied in this area', '')
    lines.push(
      ...peps.map(
        (p) =>
          `- [${p.name}](${API_SITE}/catalog/${p.slug}.md): ${p.shortDescription}`,
      ),
      '',
    )
  }

  if (a.faqs.length) lines.push('## FAQs', '', ...faqBlock(a.faqs))

  lines.push(attributionFooter(canonical))
  return lines.join('\n')
}

// ── Comparison → markdown ────────────────────────────────────────────────────

export function comparisonMarkdown(c: Comparison): string {
  const canonical = `${API_SITE}/compare/${c.slug}`
  const lines: string[] = []

  lines.push(`# ${c.aName} vs ${c.bName}`, '', `> ${c.headline}`, '')
  lines.push(...c.intro.flatMap((p) => [p, '']))

  if (c.atAGlance.length) {
    lines.push('## At a glance', '')
    lines.push(`| Dimension | ${c.aName} | ${c.bName} |`, '| --- | --- | --- |')
    lines.push(...c.atAGlance.map((r) => `| ${r.dim} | ${r.a} | ${r.b} |`), '')
  }

  if (c.trials?.length) {
    lines.push('## Key trials', '')
    lines.push('| Trial | Arm | Result |', '| --- | --- | --- |')
    lines.push(
      ...c.trials.map((t) => `| ${t.name} | ${t.arm} | ${t.result} |`),
      '',
    )
  }

  for (const s of c.proseSections ?? []) {
    lines.push(`## ${s.title}`, '', ...s.paragraphs.flatMap((p) => [p, '']))
  }

  lines.push(attributionFooter(canonical))
  return lines.join('\n')
}

// ── /llms.txt — curated index ────────────────────────────────────────────────

export function llmsIndexMarkdown(): string {
  const lines: string[] = []

  lines.push(
    '# AmericanPeptide.com',
    '',
    '> AI-powered peptide research reference: a PubChem-enriched catalog of research peptides, indication guides, head-to-head comparisons, clinical-trial intelligence, and an open CC BY 4.0 JSON API.',
    '',
    `All catalog data is licensed ${API_LICENSE} with attribution to ${API_ATTRIBUTION}. Every peptide page has a markdown twin at /catalog/{slug}.md, and the whole catalog is available as one document at /llms-full.txt. This is a research platform, not a medical device — content describes published research, not clinical recommendations.`,
    '',
  )

  lines.push('## Peptide catalog')
  lines.push('')
  const seen = new Set<string>()
  for (const cat of CATEGORIES) {
    for (const p of getPeptidesByCategory(cat.id)) {
      if (seen.has(p.slug)) continue
      seen.add(p.slug)
      const label = p.categories.map((c) => getCategoryLabel(c)).join(' / ')
      lines.push(
        `- [${p.name}](${API_SITE}/catalog/${p.slug}.md): ${label} — ${p.shortDescription}`,
      )
    }
  }
  lines.push('')

  lines.push('## Research area guides')
  lines.push('')
  for (const a of RESEARCH_AREAS) {
    lines.push(`- [${a.label}](${API_SITE}/research-areas/${a.slug}): ${a.tagline}`)
  }
  lines.push('')

  lines.push('## Comparisons')
  lines.push('')
  for (const c of COMPARISONS) {
    lines.push(
      `- [${c.aName} vs ${c.bName}](${API_SITE}/compare/${c.slug}): ${c.metaDescription}`,
    )
  }
  lines.push('')

  lines.push(
    '## Guides & reference',
    '',
    `- [GLP-1 & metabolic peptides](${API_SITE}/glp-1): the incretin class — semaglutide, tirzepatide, retatrutide.`,
    `- [BPC-157](${API_SITE}/bpc-157): deep dive on the most-discussed healing peptide.`,
    `- [Growth hormone peptides](${API_SITE}/gh-peptides): GHRH analogs and secretagogues.`,
    `- [Cognitive peptides](${API_SITE}/cognitive-peptides): nootropic and neurotrophic compounds.`,
    `- [Longevity peptides](${API_SITE}/longevity-peptides): aging-axis research compounds.`,
    `- [Immune peptides](${API_SITE}/immune-peptides): thymic peptides and immunomodulators.`,
    `- [Melanocortin hub](${API_SITE}/melanocortin): melanocortin receptor agonist research.`,
    `- [How peptides are made](${API_SITE}/synthesis): synthesis, purification, lyophilization, QC, and reading a COA.`,
    `- [Evidence hierarchy](${API_SITE}/learn/evidence-hierarchy): how to weigh peptide research quality.`,
    `- [Peptide compatibility](${API_SITE}/learn/compatibility): which research peptides are commonly co-studied.`,
    `- [Glossary](${API_SITE}/glossary): ${GLOSSARY.length} defined terms across dosing, chemistry, biology, identifiers, and research.`,
    '',
  )

  lines.push(
    '## API & data',
    '',
    `- [Developer docs](${API_SITE}/developers): free, open JSON API — query by category, research area, or slug. No key required.`,
    `- [Full catalog JSON](${API_SITE}/api/catalog): every peptide, PubChem-enriched, ${API_LICENSE}.`,
    `- [Full catalog markdown](${API_SITE}/llms-full.txt): the entire catalog as one markdown document.`,
    `- MCP server (Streamable HTTP): ${API_SITE}/api/mcp — connect from Claude, ChatGPT, Cursor, or any MCP client for live tools: search_peptides, get_peptide, get_research_area, compare_peptides, search_clinical_trials, search_pubmed, search_pubchem.`,
    '',
  )

  lines.push(
    '## Optional',
    '',
    `- [Clinical trials dashboard](${API_SITE}/trials): live ClinicalTrials.gov intelligence.`,
    `- [Compound search](${API_SITE}/compounds): PubChem-backed compound explorer.`,
    `- [Reconstitution calculator](${API_SITE}/tools/reconstitution-calculator): research-prep math.`,
    '',
  )

  lines.push(attributionFooter(API_SITE))
  return lines.join('\n')
}

// ── Site-index digest (for the research agent's internal-linking) ────────────

// A compact map of every internal page the agent may link, injected as a
// cached system block. Lets the agent turn each answer into a distribution
// surface for our own URLs — and only these URLs, so it never invents links.
export function siteIndexDigest(): string {
  const lines: string[] = [
    'INTERNAL PAGES — link to these with the EXACT url shown when you mention the compound, indication, or comparison. Never invent a url not in this list.',
    '',
    `Peptides (${API_SITE}/catalog/{slug}):`,
  ]
  for (const p of PEPTIDES) {
    const aka = p.aliases?.length ? ` (${p.aliases.join(', ')})` : ''
    lines.push(`- ${p.name}${aka} -> ${API_SITE}/catalog/${p.slug}`)
  }
  lines.push('', `Research-area guides (${API_SITE}/research-areas/{slug}):`)
  for (const a of RESEARCH_AREAS) {
    lines.push(`- ${a.label} -> ${API_SITE}/research-areas/${a.slug}`)
  }
  lines.push('', `Head-to-head comparisons (${API_SITE}/compare/{slug}):`)
  for (const c of COMPARISONS) {
    lines.push(`- ${c.aName} vs ${c.bName} -> ${API_SITE}/compare/${c.slug}`)
  }
  return lines.join('\n')
}

// ── Retrieval fallback (used when the chat model declines to answer) ─────────
//
// The chat model can refuse a subset of legitimate peptide-research questions
// at the safety layer (stop_reason=refusal, empty content). Rather than return
// nothing, the chat route falls back to THIS: a match of the user's
// question against our own published, vetted reference content. The assistant
// degrades from generative to retrieval — surfacing the catalog/area/comparison
// entry the user could have navigated to anyway — instead of failing.

// A few common entity-free phrasings → the peptide they're really asking about.
const INTENT_HINTS: { pattern: RegExp; slug: string }[] = [
  { pattern: /\btan(ning|ned)?\b|sunless tan/, slug: 'melanotan-2' },
  { pattern: /\blibido\b|sex(ual)? desire/, slug: 'pt-141' },
]

function peptideBrief(p: Peptide): string {
  const lines: string[] = [`**${p.name}** — ${p.shortDescription}`, '', p.description, '']
  if (p.mechanism) lines.push(`**Mechanism.** ${p.mechanism}`, '')
  if (p.keyResearch?.length) {
    lines.push(...p.keyResearch.slice(0, 4).map((k) => `- ${k}`), '')
  }
  lines.push(
    `Full reference: [/catalog/${p.slug}](/catalog/${p.slug}) · Research and educational content, not medical advice.`,
  )
  return lines.join('\n')
}

function areaBrief(a: ResearchArea): string {
  const peps = getPeptidesForArea(a)
  const lines: string[] = [`**${a.label}** — ${a.tagline}`, '', a.intro[0] ?? '', '']
  if (peps.length) {
    lines.push('Peptides studied in this area:', '')
    lines.push(
      ...peps.slice(0, 8).map((p) => `- [${p.name}](/catalog/${p.slug}): ${p.shortDescription}`),
      '',
    )
  }
  lines.push(`Full guide: [/research-areas/${a.slug}](/research-areas/${a.slug})`)
  return lines.join('\n')
}

function comparisonBrief(c: Comparison): string {
  const lines: string[] = [`**${c.aName} vs ${c.bName}** — ${c.headline}`, '', c.intro[0] ?? '', '']
  if (c.atAGlance.length) {
    lines.push(`| Dimension | ${c.aName} | ${c.bName} |`, '| --- | --- | --- |')
    lines.push(...c.atAGlance.slice(0, 6).map((r) => `| ${r.dim} | ${r.a} | ${r.b} |`), '')
  }
  lines.push(`Full comparison: [/compare/${c.slug}](/compare/${c.slug})`)
  return lines.join('\n')
}

/**
 * Match free-text against our published reference content. Returns grounded
 * markdown for the best match, or null if nothing relevant is found.
 */
export function retrievalFallback(userText: string): string | null {
  const t = userText.toLowerCase()

  // 1. A comparison wins if both compounds are named.
  for (const c of COMPARISONS) {
    if (t.includes(c.aName.toLowerCase()) && t.includes(c.bName.toLowerCase())) {
      return comparisonBrief(c)
    }
  }

  // 2. Best (longest, most specific) peptide name/alias/slug match.
  let best: Peptide | null = null
  let bestLen = 0
  for (const p of PEPTIDES) {
    const candidates = [p.name, ...(p.aliases ?? []), p.slug.replace(/-/g, ' '), p.slug]
    for (const cand of candidates) {
      const c = cand.toLowerCase()
      if (c.length >= 3 && t.includes(c) && c.length > bestLen) {
        best = p
        bestLen = c.length
      }
    }
  }
  if (best) return peptideBrief(best)

  // 3. Entity-free intent hints (e.g. "tanning" → Melanotan II).
  for (const h of INTENT_HINTS) {
    if (h.pattern.test(t)) {
      const p = PEPTIDES.find((x) => x.slug === h.slug)
      if (p) return peptideBrief(p)
    }
  }

  // 4. Research area by matcher substring or slug-as-phrase ("weight loss").
  for (const a of RESEARCH_AREAS) {
    const slugPhrase = a.slug.replace(/-/g, ' ')
    if (a.matchers.some((m) => t.includes(m.toLowerCase())) || t.includes(slugPhrase)) {
      return areaBrief(a)
    }
  }

  // 5. Synthesis / quality questions → the synthesis walkthrough.
  if (/\bcoa\b|certificate of analysis|\bpurity\b|\bhplc\b|lyophiliz|\bsynthesis\b|reconstitut|how .*\bmade\b/.test(t)) {
    return [
      'How research peptides are actually made — synthesis, purification, lyophilization, and reading a certificate of analysis (COA) — is covered in depth in our walkthrough.',
      '',
      'A COA should show: purity by **HPLC** (%), identity by **mass spectrometry**, **peptide/net content**, water/counterion, and endotoxin. Appearance (a fluffy lyophilized cake) is not a purity signal.',
      '',
      'Full walkthrough: [/synthesis](/synthesis)',
    ].join('\n')
  }

  return null
}

// ── /llms-full.txt — full catalog dump ───────────────────────────────────────

export function llmsFullMarkdown(): string {
  const header = [
    '# AmericanPeptide.com — Full Peptide Catalog',
    '',
    `> ${PEPTIDES.length} research peptides with PubChem-enriched chemistry, mechanisms, research areas, and FAQs. License: ${API_LICENSE}, attribution: ${API_ATTRIBUTION}.`,
    '',
    `Curated index: ${API_SITE}/llms.txt · JSON API: ${API_SITE}/api/catalog · Docs: ${API_SITE}/developers`,
    '',
  ].join('\n')

  const body = PEPTIDES.map((p) => peptideMarkdown(p)).join('\n\n')
  return `${header}\n${body}\n`
}
