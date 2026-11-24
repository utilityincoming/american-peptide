import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { CATEGORIES, PEPTIDES } from './peptides'
import { API_SITE, serializePeptide } from './catalog-api'
import { identityClaims } from './evidence/from-catalog'

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const categoryIds = new Set<string>(CATEGORIES.map(({ id }) => id))
const record = z.object({
  slug,
  name: z.string().trim().min(1),
  categories: z.array(z.string().refine((value) => categoryIds.has(value), 'Unknown category')).min(1),
  components: z.array(slug).optional(),
})
const sourceUrl = z.url({ protocol: /^https$/ })

describe('published catalog integrity', () => {
  it('has valid records, unique slugs, resolvable components, and valid identity source URLs', () => {
    const slugs = new Set<string>()
    const knownSlugs = new Set(PEPTIDES.map((peptide) => peptide.slug))
    const errors: string[] = []

    for (const peptide of PEPTIDES) {
      const result = record.safeParse(peptide)
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push(`${peptide.slug}: ${issue.path.join('.')}: ${issue.message}`)
        }
      }
      if (slugs.has(peptide.slug)) errors.push(`${peptide.slug}: duplicate slug`)
      slugs.add(peptide.slug)

      for (const component of peptide.components ?? []) {
        if (component === peptide.slug || !knownSlugs.has(component)) {
          errors.push(`${peptide.slug}: invalid component ${component}`)
        }
      }

      const published = serializePeptide(peptide)
      if (published.url !== `${API_SITE}/catalog/${peptide.slug}`) {
        errors.push(`${peptide.slug}: invalid canonical URL`)
      }
      for (const claim of identityClaims(peptide)) {
        if (!sourceUrl.safeParse(claim.provenance.source_url).success) {
          errors.push(`${peptide.slug}: invalid source URL for ${claim.field}`)
        }
      }
    }

    if (process.env.CATALOG_REPORT_COMPLETENESS === '1') {
      const fields = ['molecularFormula', 'molecularWeight', 'pubchemCid', 'sequence'] as const
      for (const field of fields) {
        const missing = PEPTIDES.filter((peptide) => !peptide[field]).map((peptide) => peptide.slug)
        console.info(`Catalog completeness: ${field} missing from ${missing.length} of ${PEPTIDES.length} entries.`, missing)
      }
    }

    expect(errors).toEqual([])
  })
})
