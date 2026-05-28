import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  FileCheck2,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react'
import {
  PEPTIDES,
  CATEGORIES,
  getPeptideBySlug,
  type Peptide,
} from '@/lib/peptides'
import { getAreasForPeptide } from '@/lib/research-areas'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PEPTIDES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)
  if (!peptide) return { title: 'Not Found' }

  return {
    title: `${peptide.name} — AmericanPeptide.com Catalog`,
    description: peptide.shortDescription,
  }
}

export default async function PeptideDetailPage({ params }: RouteParams) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)
  if (!peptide) notFound()

  const related = PEPTIDES.filter(
    (p) =>
      p.slug !== peptide.slug &&
      p.categories.some((c) => peptide.categories.includes(c)),
  ).slice(0, 3)

  const areas = getAreasForPeptide(peptide)

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/catalog"
          className="text-sm text-white/35 transition-colors hover:text-white"
        >
          Catalog
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">{peptide.name}</span>
      </header>

      {/* ── Title block ── */}
      <section className="border-b border-white/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {peptide.categories.map((cat) => (
              <Link
                key={cat}
                href={`/catalog/category/${cat}`}
                className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
              >
                {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
              </Link>
            ))}
            {peptide.fdaApproved && (
              <span className="rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                FDA Approved
              </span>
            )}
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            {peptide.name}
          </h1>
          {peptide.aliases && peptide.aliases.length > 0 && (
            <p className="mb-5 text-sm text-white/45">
              Also known as {peptide.aliases.join(' · ')}
            </p>
          )}
          <p className="max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
            {peptide.shortDescription}
          </p>
        </div>
      </section>

      {/* ── Body grid ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-8">
            <Block title="Overview">
              <p className="text-sm leading-relaxed text-white/65">
                {peptide.description}
              </p>
            </Block>

            {peptide.mechanism && (
              <Block title="Mechanism">
                <p className="text-sm leading-relaxed text-white/65">
                  {peptide.mechanism}
                </p>
              </Block>
            )}

            {peptide.researchAreas && peptide.researchAreas.length > 0 && (
              <Block title="Research areas">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {peptide.researchAreas.map((area) => (
                    <li
                      key={area}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white/65"
                    >
                      <FlaskConical className="h-3.5 w-3.5 text-[#2DD4A8]/70" />
                      {area}
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {areas.length > 0 && (
              <Block title="Research-area guides">
                <div className="flex flex-wrap gap-2">
                  {areas.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/research-areas/${a.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/60 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                    >
                      <FlaskConical className="h-3 w-3 text-[#2DD4A8]/70" />
                      {a.label}
                    </Link>
                  ))}
                </div>
              </Block>
            )}

            {related.length > 0 && (
              <Block title="Related peptides">
                <div className="grid gap-3 sm:grid-cols-3">
                  {related.map((r) => (
                    <RelatedCard key={r.slug} peptide={r} />
                  ))}
                </div>
              </Block>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Identity panel */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Identity
              </h3>
              <dl className="space-y-3 text-sm">
                {peptide.molecularWeight && (
                  <Row
                    label="Molecular weight"
                    value={`${peptide.molecularWeight.toLocaleString()} Da`}
                  />
                )}
                {peptide.molecularFormula && (
                  <Row
                    label="Molecular formula"
                    value={peptide.molecularFormula}
                    mono
                  />
                )}
                {peptide.sequence && (
                  <Row label="Sequence" value={peptide.sequence} mono />
                )}
                {peptide.cas && <Row label="CAS" value={peptide.cas} mono />}
                {peptide.pubchemCid && (
                  <Row
                    label="PubChem CID"
                    value={
                      <a
                        href={`https://pubchem.ncbi.nlm.nih.gov/compound/${peptide.pubchemCid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#2DD4A8] hover:underline"
                      >
                        {peptide.pubchemCid}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
                {peptide.uniprotId && (
                  <Row
                    label="UniProt"
                    value={
                      <a
                        href={`https://www.uniprot.org/uniprotkb/${peptide.uniprotId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#2DD4A8] hover:underline"
                      >
                        {peptide.uniprotId}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
              </dl>
            </div>

            {/* Marketplace status panel */}
            <div className="overflow-hidden rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] text-[#2DD4A8]">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold">Marketplace</h3>
              </div>

              <div className="mb-4 space-y-2 text-xs text-white/55">
                <MarketRow Icon={Building2} label="Vetted suppliers" value="Coming soon" />
                <MarketRow Icon={FileCheck2} label="COAs on file"     value="Coming soon" />
                <MarketRow Icon={ShieldCheck} label="Escrow protection" value="Coming soon" />
              </div>

              <button
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-2 text-xs font-medium text-[#2DD4A8] opacity-80"
              >
                <Bell className="h-3.5 w-3.5" />
                Notify me when live
              </button>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-amber-400/65">
                <span className="font-semibold text-amber-400/85">
                  Research use only.
                </span>{' '}
                Catalog entries are educational references — not offers for sale or
                medical guidance. Independent validation required for any
                experimental use.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

function Block({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'break-all font-mono text-xs text-white/85'
            : 'text-sm text-white/85'
        }
      >
        {value}
      </dd>
    </div>
  )
}

function MarketRow({
  Icon,
  label,
  value,
}: {
  Icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-white/40" />
        {label}
      </span>
      <span className="text-white/40">{value}</span>
    </div>
  )
}

function RelatedCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-[#2DD4A8]/25 hover:bg-white/[0.04]"
    >
      <h4 className="mb-1.5 text-sm font-semibold">{peptide.name}</h4>
      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-white/50">
        {peptide.shortDescription}
      </p>
      <span className="flex items-center gap-1 text-[11px] text-[#2DD4A8]/70 transition-colors group-hover:text-[#2DD4A8]">
        View
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  )
}
