import Link from 'next/link'
import { getPeptideBySlug } from '@/lib/peptides'

export default function RelatedCatalog({
  slugs,
  heading = 'Related catalog entries',
}: {
  slugs: string[]
  heading?: string
}) {
  const peptides = slugs
    .map((slug) => getPeptideBySlug(slug))
    .filter((peptide): peptide is NonNullable<typeof peptide> => Boolean(peptide))
  if (peptides.length === 0) return null
  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/55">{heading}</h2>
      <ul className="flex flex-wrap gap-2 text-sm">
        {peptides.map((peptide) => (
          <li key={peptide.slug}>
            <Link
              href={`/catalog/${peptide.slug}`}
              className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent"
            >
              {peptide.name} monograph
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
