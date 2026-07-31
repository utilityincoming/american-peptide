// Cross-property links to the sister site, PeptideHormone (peptidehormone.com), an
// editorially independent, research-grade monograph reference. We link a molecule to
// its full monograph only where PeptideHormone actually has one, so the network
// cluster never carries a dead link. PH_CATALOG mirrors peptidehormone.com's molecule
// slugs (point-in-time) — refresh it if that catalog grows.

const PH = 'https://www.peptidehormone.com'

const PH_CATALOG = new Set([
  'glp-1', 'gip', 'glucagon', 'amylin', 'insulin', 'semaglutide', 'tirzepatide',
  'liraglutide', 'exenatide', 'retatrutide', 'pramlintide', 'cagrilintide',
  'amycretin', 'maridebart-cafraglutide', 'growth-hormone', 'igf-1', 'ghrh',
  'ghrelin', 'somatostatin', 'alpha-msh', 'acth', 'oxytocin', 'vasopressin', 'crh',
  'trh', 'pyy', 'cck', 'secretin', 'motilin', 'gnrh', 'lh', 'fsh', 'kisspeptin',
  'hcg', 'leptin', 'adiponectin', 'pth', 'calcitonin', 'pthrp', 'anp', 'bnp', 'cnp',
  'myostatin', 'activin-a', 'follistatin', 'thymosin-beta-4', 'ghk-cu', 'bpc-157',
  'tb-500', 'leuprolide', 'goserelin', 'cetrorelix', 'octreotide', 'lanreotide',
  'pasireotide', 'mots-c', 'humanin', 'epitalon', 'selank', 'tesamorelin',
  'cjc-1295', 'sermorelin', 'ipamorelin', 'pt-141', 'ss-31', 'aod-9604', 'kpv',
  'dsip', 'semax', 'ara-290',
])

// Where our catalog slug differs from PeptideHormone's for the same molecule.
const PH_ALIAS: Record<string, string> = {
  'cjc-1295-no-dac': 'cjc-1295',
  'cjc-1295-with-dac': 'cjc-1295',
  'kisspeptin-10': 'kisspeptin',
}

/**
 * Deep link to the PeptideHormone monograph for a molecule, or null when the sister
 * site doesn't cover it — so the cross-link only renders where it resolves.
 */
export function peptideHormoneUrl(slug: string): string | null {
  const s = PH_ALIAS[slug] ?? slug
  return PH_CATALOG.has(s) ? `${PH}/hormones/${s}` : null
}
