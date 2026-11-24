import { z } from 'zod'
import { CATEGORIES } from './peptides'
import { getResearchAreaBySlug } from './research-areas'
import { normalizeCatalogQuery } from './catalog-query'

export const CATALOG_PAGE_DEFAULT = 25
export const CATALOG_PAGE_MAX = 100
export const CATALOG_QUERY_MAX = 200

const categoryIds = new Set<string>(CATEGORIES.map(({ id }) => id))

const catalogRequest = z.strictObject({
  category: z.string().transform(normalizeCatalogQuery)
    .refine((value) => value !== null && categoryIds.has(value), 'Unknown catalog category.').optional(),
  area: z.string().transform(normalizeCatalogQuery)
    .refine((value) => value !== null && Boolean(getResearchAreaBySlug(value)), 'Unknown research area.').optional(),
  fda: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  q: z.string().max(CATALOG_QUERY_MAX).transform(normalizeCatalogQuery).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number)
    .pipe(z.number().int().min(1).max(CATALOG_PAGE_MAX)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number)
    .pipe(z.number().int().min(0)).optional(),
})

export function parseCatalogV2(params: URLSearchParams) {
  const seen = new Set<string>()
  for (const [field] of params) {
    if (seen.has(field)) {
      return { errors: [{ field, message: 'Parameter must occur only once.' }] }
    }
    seen.add(field)
  }

  const parsed = catalogRequest.safeParse(Object.fromEntries(params))
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.flatMap((issue) =>
        issue.code === 'unrecognized_keys'
          ? issue.keys.map((field) => ({ field, message: 'Unknown parameter.' }))
          : [{ field: String(issue.path[0]), message: issue.message }],
      ),
    }
  }
  return { filters: parsed.data }
}
