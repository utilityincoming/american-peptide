import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Minus } from 'lucide-react'
import {
  PEPTIDES,
  CATEGORIES,
  getPeptideBySlug,
  type Peptide,
} from '@/lib/peptides'

const SITE = 'https://www.americanpeptide.com'
const MAX_COMPARE = 4

interface Props {
  searchParams: Promise<{ ids?: string }>
}

function parseIds(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE)
}

function resolvePeptides(ids: string[]): Peptide[] {
  const seen = new Set<string>()
  const out: Peptide[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    const p = getPeptideBySlug(id)
    if (p) {
      out.push(p)
      seen.add(id)
    }
  }
  return out
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { ids } = await searchParams
  const peptides = resolvePeptides(parseIds(ids))
  if (peptides.length < 2) {
    return {
      title: 'Compare peptides — AmericanPeptide.com Catalog',
      description:
        'Side-by-side comparison of research peptides — sequence, molecular weight, mechanism, FDA status, and PubChem identifiers.',
    }
  }
  const names = peptides.map((p) => p.name).join(' vs ')
  return {
    title: `Compare: ${names} — AmericanPeptide.com Catalog`,
    description: `Side-by-side comparison of ${names}: sequence, molecular weight, mechanism, FDA status, and PubChem identifiers.`,
    alternates: {
      canonical: `${SITE}/catalog/compare?ids=${peptides
        .map((p) => p.slug)
        .join(',')}`,
    },
  }
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const peptides = resolvePeptides(parseIds(ids))

  const itemListLd =
    peptides.length >= 2
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Compare: ${peptides.map((p) => p.name).join(' vs ')}`,
          itemListElement: peptides.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: `${SITE}/catalog/${p.slug}`,
          })),
        }
      : null

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: `${SITE}/catalog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Compare',
        item: `${SITE}/catalog/compare`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/catalog"
          className="text-sm text-white/35 transition-colors hover:text-white"
        >
          Catalog
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">Compare</span>
      </header>

      <section className="border-b border-white/[0.06] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Compare peptides
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Side-by-side reference for sequence, molecular weight, mechanism,
            and approval status. Add or remove peptides from the{' '}
            <Link
              href="/catalog"
              className="text-[#2DD4A8] underline-offset-2 hover:underline"
            >
              catalog
            </Link>
            .
          </p>
        </div>
      </section>

      {peptides.length < 2 ? (
        <EmptyState count={peptides.length} />
      ) : (
        <ComparisonGrid peptides={peptides} />
      )}
    </div>
  )
}

function EmptyState({ count }: { count: number }) {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.015] px-6 py-12 text-center">
        <p className="mb-2 text-sm text-white/70">
          {count === 0
            ? 'No peptides selected for comparison yet.'
            : 'Select at least one more peptide to compare.'}
        </p>
        <p className="mb-6 text-xs text-white/40">
          On the catalog page, tap{' '}
          <span className="font-medium text-white/65">+ Compare</span> on any
          peptide card to add it.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-4 py-2 text-sm font-medium text-[#2DD4A8] transition-colors hover:border-[#2DD4A8]/50 hover:bg-[#2DD4A8]/20"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to catalog
        </Link>
      </div>
    </section>
  )
}

interface Row {
  label: string
  render: (p: Peptide) => React.ReactNode
}

const ROWS: Row[] = [
  {
    label: 'Aliases',
    render: (p) =>
      p.aliases && p.aliases.length > 0 ? (
        <span className="text-white/75">{p.aliases.join(' · ')}</span>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'Categories',
    render: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.categories.map((c) => (
          <Link
            key={c}
            href={`/catalog/category/${c}`}
            className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
          >
            {CATEGORIES.find((cm) => cm.id === c)?.label ?? c}
          </Link>
        ))}
      </div>
    ),
  },
  {
    label: 'FDA approved',
    render: (p) =>
      p.fdaApproved ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
          <Check className="h-3 w-3" />
          Approved
        </span>
      ) : (
        <span className="text-[11px] uppercase tracking-wider text-white/35">
          Investigational
        </span>
      ),
  },
  {
    label: 'Molecular weight',
    render: (p) =>
      p.molecularWeight ? (
        <span className="font-mono text-[13px] text-white/80">
          {p.molecularWeight.toLocaleString()} Da
        </span>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'Molecular formula',
    render: (p) =>
      p.molecularFormula ? (
        <span className="font-mono text-[13px] text-white/80">
          {p.molecularFormula}
        </span>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'Sequence',
    render: (p) =>
      p.sequence ? (
        <code className="block max-h-40 overflow-y-auto whitespace-pre-wrap break-all rounded-md border border-white/[0.06] bg-black/30 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-[#5EEBC8]">
          {p.sequence}
        </code>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'Mechanism',
    render: (p) =>
      p.mechanism ? (
        <p className="text-[13px] leading-relaxed text-white/70">
          {p.mechanism}
        </p>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'Research areas',
    render: (p) =>
      p.researchAreas && p.researchAreas.length > 0 ? (
        <ul className="space-y-0.5 text-[12px] text-white/65">
          {p.researchAreas.map((a) => (
            <li key={a}>· {a}</li>
          ))}
        </ul>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'CAS',
    render: (p) =>
      p.cas ? (
        <span className="font-mono text-[12px] text-white/75">{p.cas}</span>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'PubChem CID',
    render: (p) =>
      p.pubchemCid ? (
        <a
          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${p.pubchemCid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-[#2DD4A8] underline-offset-2 hover:underline"
        >
          {p.pubchemCid}
        </a>
      ) : (
        <Dash />
      ),
  },
  {
    label: 'UniProt',
    render: (p) =>
      p.uniprotId ? (
        <a
          href={`https://www.uniprot.org/uniprotkb/${p.uniprotId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-[#2DD4A8] underline-offset-2 hover:underline"
        >
          {p.uniprotId}
        </a>
      ) : (
        <Dash />
      ),
  },
]

function Dash() {
  return (
    <span className="inline-flex h-4 items-center text-white/25">
      <Minus className="h-3 w-3" />
    </span>
  )
}

function ComparisonGrid({ peptides }: { peptides: Peptide[] }) {
  const otherSlugs = PEPTIDES.filter(
    (p) => !peptides.some((pp) => pp.slug === p.slug),
  ).slice(0, 6)

  return (
    <>
      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.015]">
            <table className="w-full min-w-[720px] border-collapse text-left align-top">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.025]">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 w-44 min-w-[10rem] border-r border-white/[0.06] bg-white/[0.025] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45"
                  >
                    Attribute
                  </th>
                  {peptides.map((p) => (
                    <th
                      key={p.slug}
                      scope="col"
                      className="min-w-[14rem] border-l border-white/[0.06] px-4 py-4 align-top"
                    >
                      <Link
                        href={`/catalog/${p.slug}`}
                        className="block"
                      >
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-base font-semibold text-white">
                            {p.name}
                          </span>
                          {p.fdaApproved && (
                            <span className="shrink-0 rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                              FDA
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-2 text-[11px] leading-snug text-white/45">
                          {p.shortDescription}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#2DD4A8]/70 hover:text-[#2DD4A8]">
                          View profile
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr
                    key={row.label}
                    className={
                      ri % 2 === 0
                        ? 'border-b border-white/[0.05]'
                        : 'border-b border-white/[0.05] bg-white/[0.012]'
                    }
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 w-44 min-w-[10rem] border-r border-white/[0.06] bg-[#0B1220] px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-white/45"
                    >
                      {row.label}
                    </th>
                    {peptides.map((p) => (
                      <td
                        key={p.slug}
                        className="min-w-[14rem] border-l border-white/[0.06] px-4 py-4 align-top text-sm"
                      >
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] text-white/35">
            Empty fields indicate the attribute is not catalogued for that
            peptide. Data is reference-only; independent validation required
            before experimental use.
          </p>
        </div>
      </section>

      {otherSlugs.length > 0 && (
        <section className="border-t border-white/[0.06] px-6 py-10 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
              Swap in another peptide
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {otherSlugs.map((p) => (
                <Link
                  key={p.slug}
                  href={`/catalog/compare?ids=${[
                    ...peptides.slice(0, MAX_COMPARE - 1).map((pp) => pp.slug),
                    p.slug,
                  ].join(',')}`}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                >
                  + {p.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
