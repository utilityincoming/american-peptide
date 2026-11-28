import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { COMPARISONS } from '@/lib/comparisons'

const SITE = 'https://americanpeptide.com'

export default function ComparisonGuides() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Comparison Guides',
    itemListElement: COMPARISONS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${c.aName} vs ${c.bName}`,
      url: `${SITE}/compare/${c.slug}`,
    })),
  }

  return (
    <section id="comparison-guides" className="scroll-mt-24 border-t border-hairline px-6 py-12 md:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold tracking-tight">Comparison Guides</h2>
        <p className="mb-6 mt-2 text-sm text-ink/55">
          Read head-to-head guides on mechanisms, trial evidence, and key differences.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPARISONS.map((c) => (
            <article
              key={c.slug}
              className="group flex flex-col rounded-2xl border border-hairline bg-fill p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-fill-strong hover:shadow-[0_18px_50px_-12px_rgba(126,224,181,0.12)]"
            >
              <Link href={`/compare/${c.slug}`} className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span style={{ color: '#7EE0B5' }}>{c.aName}</span>
                <span className="text-ink/25">vs</span>
                <span style={{ color: '#818CF8' }}>{c.bName}</span>
              </Link>
              <p className="mb-3 flex-1 text-[13px] leading-relaxed text-ink/50">
                {c.headline.charAt(0).toUpperCase() + c.headline.slice(1)}.
              </p>
              <p className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/55">
                {c.aSlug && (
                  <Link href={`/catalog/${c.aSlug}`} className="hover:text-accent">
                    {c.aName} monograph
                  </Link>
                )}
                {c.bSlug && (
                  <Link href={`/catalog/${c.bSlug}`} className="hover:text-accent">
                    {c.bName} monograph
                  </Link>
                )}
              </p>
              <Link href={`/compare/${c.slug}`} className="flex items-center gap-1 text-[11px] text-accent/70 transition-colors group-hover:text-accent">
                Read {c.aName} vs {c.bName}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
