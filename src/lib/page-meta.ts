/** SEO titles and descriptions. Descriptions stay near 140–160 characters. */

const FEATURED = new Set([
  'semaglutide',
  'tirzepatide',
  'retatrutide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'tesamorelin',
  'ipamorelin',
])

const MONOGRAPH_DESCRIPTION: Record<string, string> = {
  semaglutide:
    'Semaglutide sequence, GLP-1 mechanism, and cited trial evidence in one research reference, with calculator and COA tools. Not a store. Research use only.',
  tirzepatide:
    'Tirzepatide sequence, dual GIP/GLP-1 mechanism, and cited trial evidence in one research reference, with lab tools. Not a store. Research use only.',
  retatrutide:
    'Retatrutide sequence, triple-agonist mechanism, and cited trial evidence in one research reference, with lab tools. Not a store. Research use only.',
  'bpc-157':
    'BPC-157 sequence, proposed repair mechanisms, and cited preclinical notes in one research reference, with lab tools. Not a store. Research use only.',
  'tb-500':
    'TB-500 sequence, actin-related research, and cited evidence notes in one research reference, with calculator and COA tools. Not a store. Research use only.',
  'ghk-cu':
    'GHK-Cu sequence, copper-peptide research, and cited evidence notes in one research reference, with COA and calculator tools. Not a store. Research use only.',
  tesamorelin:
    'Tesamorelin sequence, GHRH mechanism, and cited evidence notes in one research reference, with calculator and COA tools. Not a store. Research use only.',
  ipamorelin:
    'Ipamorelin sequence, ghrelin-receptor research, and cited evidence notes in one research reference, with lab tools. Not a store. Research use only.',
}

export function isFeaturedMonograph(slug: string): boolean {
  return FEATURED.has(slug)
}

export function monographTitle(name: string, slug: string): string {
  if (FEATURED.has(slug)) return `${name} — sequence, evidence, tools`
  return `${name} — sequence & mechanism`
}

export function monographDescription(slug: string, fallback: string): string {
  return MONOGRAPH_DESCRIPTION[slug] ?? trimDescription(fallback)
}

function trimDescription(text: string): string {
  const suffix = ' Cited research reference, not a store.'
  const room = 160 - suffix.length
  const base = text.length <= room ? text : `${text.slice(0, room - 1).trimEnd()}…`
  const combined = `${base}${suffix}`
  return combined.length <= 165 ? combined : combined.slice(0, 160)
}
