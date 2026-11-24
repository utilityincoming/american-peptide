import { test } from 'vitest'
import { PEPTIDES } from './peptides'
import { createCatalogMatcher } from './catalog-query'

const queries = ['o', 'oz', 'oze', 'ozem', 'ozemp', 'ozempic', 'no-such-compound']
const matches = createCatalogMatcher(false)

test('repeated catalog searches', async ({ bench }) => {
  const rebuild = bench('rebuild each searchable string', () => {
    for (const query of queries) {
      PEPTIDES.filter((peptide) =>
        [peptide.name, peptide.shortDescription, ...(peptide.aliases ?? [])]
          .join(' ').toLowerCase().includes(query),
      )
    }
  })

  const reuse = bench('reuse searchable strings', () => {
    for (const query of queries) PEPTIDES.filter((peptide) => matches(peptide, query))
  })
  await bench.compare(rebuild, reuse)
})
