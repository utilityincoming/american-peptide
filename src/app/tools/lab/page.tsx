import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import LabTools from '@/components/lab-tools/LabTools'
import { webApplicationJsonLd } from '@/lib/schema'
import { LISTED_PEPTIDES } from '@/lib/peptides'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Lab tools — COA batch review, catalog feed, sourcing intake',
  description:
    'Research tools for reading certificates of analysis, querying the open catalog with a free API key, and previewing a submission against the published 100-point sourcing standard. Not a store and not medical advice.',
  alternates: { canonical: `${SITE}/tools/lab` },
}

export default function LabToolsPage() {
  const jsonLd = webApplicationJsonLd({
    name: 'Lab tools',
    description: 'Batch COA review, catalog feed, and sourcing intake for peptide research.',
    path: '/tools/lab',
  })
  const samples = LISTED_PEPTIDES.filter((p) => p.sequence).slice(0, 4)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<p className="px-8 py-16 text-sm text-ink/50">Loading lab tools…</p>}>
        <LabTools />
      </Suspense>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/55">Use with these peptides</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {samples.map((p) => (
            <li key={p.slug}>
              <Link href={`/catalog/${p.slug}`} className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
                {p.name} monograph
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
