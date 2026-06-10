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

export function peptideMarkdown(p: Peptide): string {
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
