import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  Check,
  Droplets,
  Factory,
  FileCheck2,
  FlaskConical,
  HelpCircle,
  Newspaper,
  ShieldCheck,
  Snowflake,
} from 'lucide-react'
import {
  PEPTIDES,
  CATEGORIES,
  getPeptideBySlug,
  SYNTHESIS_DIFFICULTY_LABEL,
  type Peptide,
} from '@/lib/peptides'
import { getAreasForPeptide } from '@/lib/research-areas'
import { getPubchemVerification } from '@/lib/verification'
import { getLatestResearch } from '@/lib/freshness'
import AgentPrompt from '@/components/AgentPrompt'
import PeptideStory from '@/components/PeptideStory'
import WatchButton from '@/components/WatchButton'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import {
  getVendorsForPeptide,
  trustScore,
  vendorHref,
  vendorsByTier,
  type Vendor,
} from '@/lib/vendors'

const SITE = 'https://www.americanpeptide.com'

// ISR: re-render at most once per day so the live "Latest research" section
// stays current without rebuilding. External fetches in getLatestResearch are
// themselves day-cached and fail soft, so this never blocks or breaks a render.
export const revalidate = 86400

const DRUG_METADATA: Record<string, {
  drugClass: string
  administrationRoute: string
  brandName?: string[]
}> = {
  semaglutide: {
    drugClass: 'GLP-1 receptor agonist',
    administrationRoute: 'subcutaneous injection; oral tablet',
    brandName: ['Ozempic', 'Wegovy', 'Rybelsus'],
  },
  tirzepatide: {
    drugClass: 'GLP-1/GIP dual receptor agonist',
    administrationRoute: 'subcutaneous injection',
    brandName: ['Mounjaro', 'Zepbound'],
  },
  tesamorelin: {
    drugClass: 'GHRH analog',
    administrationRoute: 'subcutaneous injection',
    brandName: ['Egrifta'],
  },
  'pt-141': {
    drugClass: 'Melanocortin receptor agonist',
    administrationRoute: 'subcutaneous injection',
    brandName: ['Vyleesi'],
  },
}

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

  const url = `${SITE}/catalog/${peptide.slug}`
  return {
    title: `${peptide.name} — AmericanPeptide.com Catalog`,
    description: peptide.shortDescription,
    alternates: {
      canonical: url,
      types: { 'text/markdown': `${url}.md` },
    },
    openGraph: {
      title: `${peptide.name} — AmericanPeptide.com Catalog`,
      description: peptide.shortDescription,
      url,
      type: 'article',
    },
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
  const latest = await getLatestResearch(peptide)

  const url = `${SITE}/catalog/${peptide.slug}`

  const sameAs: string[] = []
  if (peptide.pubchemCid)
    sameAs.push(`https://pubchem.ncbi.nlm.nih.gov/compound/${peptide.pubchemCid}`)
  if (peptide.uniprotId)
    sameAs.push(`https://www.uniprot.org/uniprotkb/${peptide.uniprotId}`)

  const identifier: {
    '@type': 'PropertyValue'
    propertyID: string
    value: string
  }[] = []
  if (peptide.cas)
    identifier.push({ '@type': 'PropertyValue', propertyID: 'CAS', value: peptide.cas })
  if (peptide.pubchemCid)
    identifier.push({
      '@type': 'PropertyValue',
      propertyID: 'PubChem CID',
      value: String(peptide.pubchemCid),
    })
  if (peptide.uniprotId)
    identifier.push({
      '@type': 'PropertyValue',
      propertyID: 'UniProt',
      value: peptide.uniprotId,
    })

  const substanceLd = {
    '@context': 'https://schema.org',
    '@type': 'ChemicalSubstance',
    name: peptide.name,
    description: peptide.shortDescription,
    url,
    ...(peptide.aliases?.length ? { alternateName: peptide.aliases } : {}),
    ...(peptide.molecularFormula
      ? { molecularFormula: peptide.molecularFormula }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(identifier.length ? { identifier } : {}),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: `${SITE}/catalog` },
      { '@type': 'ListItem', position: 3, name: peptide.name, item: url },
    ],
  }

  const faqLd = peptide.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: peptide.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  const drugMeta = DRUG_METADATA[peptide.slug]
  const drugLd =
    peptide.fdaApproved && drugMeta
      ? {
          '@context': 'https://schema.org',
          '@type': 'Drug',
          name: peptide.name,
          description: peptide.shortDescription,
          url,
          ...(peptide.aliases?.length ? { alternateName: peptide.aliases } : {}),
          drugClass: drugMeta.drugClass,
          ...(peptide.mechanism ? { mechanismOfAction: peptide.mechanism } : {}),
          administrationRoute: drugMeta.administrationRoute,
          legalStatus: 'PrescriptionOnly',
          recognizingAuthority: {
            '@type': 'Organization',
            name: 'U.S. Food and Drug Administration',
            url: 'https://www.fda.gov',
          },
          ...(drugMeta.brandName?.length
            ? { brand: drugMeta.brandName.map((b) => ({ '@type': 'Brand', name: b })) }
            : {}),
          ...(sameAs.length ? { sameAs } : {}),
        }
      : null

  // Authoritative external references, generated from identifiers/name — no
  // fabricated citations. Rendered as a "Further reading" block.
  const references: { label: string; href: string }[] = []
  if (peptide.pubchemCid)
    references.push({
      label: 'PubChem compound record',
      href: `https://pubchem.ncbi.nlm.nih.gov/compound/${peptide.pubchemCid}`,
    })
  if (peptide.uniprotId)
    references.push({
      label: 'UniProt entry',
      href: `https://www.uniprot.org/uniprotkb/${peptide.uniprotId}`,
    })
  references.push({
    label: 'PubMed literature search',
    href: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(peptide.name)}`,
  })
  references.push({
    label: 'ClinicalTrials.gov search',
    href: `https://clinicaltrials.gov/search?term=${encodeURIComponent(peptide.name)}`,
  })

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(substanceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {drugLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(drugLd) }}
        />
      )}

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/catalog"
          className="text-sm text-ink/35 transition-colors hover:text-ink"
        >
          Catalog
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">{peptide.name}</span>
      </header>

      {/* ── Title block ── */}
      <section className="border-b border-ink/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {peptide.categories.map((cat) => (
              <Link
                key={cat}
                href={`/catalog/category/${cat}`}
                className="rounded-md border border-ink/[0.07] bg-ink/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/55 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
              >
                {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
              </Link>
            ))}
            {peptide.fdaApproved && (
              <span className="rounded-md border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                FDA Approved
              </span>
            )}
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            {peptide.name}
          </h1>
          {peptide.aliases && peptide.aliases.length > 0 && (
            <p className="mb-5 text-sm text-ink/45">
              Also known as {peptide.aliases.join(' · ')}
            </p>
          )}
          <p className="max-w-3xl text-base leading-relaxed text-ink/65 md:text-lg">
            {peptide.shortDescription}
          </p>
          <WatchButton slug={peptide.slug} />
        </div>
      </section>

      {/* ── Body grid ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-8">
            <Block title="Overview">
              <p className="text-sm leading-relaxed text-ink/65">
                {peptide.description}
              </p>
            </Block>

            {peptide.background && peptide.background.length > 0 && (
              <Block title="Background">
                <div className="space-y-4">
                  {peptide.background.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-ink/65">
                      {para}
                    </p>
                  ))}
                </div>
              </Block>
            )}

            {peptide.mechanism && (
              <Block title="Mechanism">
                <p className="text-sm leading-relaxed text-ink/65">
                  {peptide.mechanism}
                </p>
              </Block>
            )}

            {peptide.keyResearch && peptide.keyResearch.length > 0 && (
              <Block title="Key research findings">
                <ul className="space-y-2.5">
                  {peptide.keyResearch.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-ink/65"
                    >
                      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {/* Per-peptide "born here" story — ties the synthesis pipeline to this molecule */}
            <PeptideStory peptide={peptide} />

            {/* Handling, storage & why purity is hard — universal consumer-hardening callout */}
            <div className="rounded-2xl border border-[#2DD4A8]/15 bg-gradient-to-br from-[#2DD4A8]/[0.05] to-transparent p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-accent">
                  <Factory className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-sm font-semibold tracking-tight">
                  Handling, storage &amp; why purity is hard
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-ink/65">
                {peptide.synthesisNotes ??
                  `Producing ${peptide.name} to a genuine purity spec means solid-phase synthesis, preparative HPLC purification, and batch quality control — none of it cheap, and none of it something you can verify by eye.`}
              </p>

              {(peptide.synthesisDifficulty ||
                (peptide.syntheticFeatures && peptide.syntheticFeatures.length > 0)) && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {peptide.synthesisDifficulty && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                      title="Relative difficulty of synthesizing and purifying to a genuine spec"
                    >
                      <FlaskConical className="h-3 w-3" />
                      {SYNTHESIS_DIFFICULTY_LABEL[peptide.synthesisDifficulty]} synthesis
                    </span>
                  )}
                  {peptide.syntheticFeatures?.map((f) => (
                    <Link
                      key={f}
                      href={`/catalog?synthesis=${encodeURIComponent(f)}`}
                      title={`Browse peptides with: ${f}`}
                      className="inline-flex items-center rounded-full border border-ink/[0.08] bg-ink/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink/60 transition-colors hover:border-[#2DD4A8]/30 hover:bg-[#2DD4A8]/[0.06] hover:text-accent"
                    >
                      {f}
                    </Link>
                  ))}
                </div>
              )}

              {(peptide.storage || peptide.handling) && (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {peptide.storage && (
                    <div className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3">
                      <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent/80">
                        <Snowflake className="h-3 w-3" />
                        Storage
                      </dt>
                      <dd className="text-[12.5px] leading-relaxed text-ink/60">
                        {peptide.storage}
                      </dd>
                    </div>
                  )}
                  {peptide.handling && (
                    <div className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3">
                      <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent/80">
                        <Droplets className="h-3 w-3" />
                        Handling
                      </dt>
                      <dd className="text-[12.5px] leading-relaxed text-ink/60">
                        {peptide.handling}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="mt-4 rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-4 py-3">
                <p className="text-[12.5px] leading-relaxed text-ink/55">
                  <span className="font-semibold text-ink/75">
                    Don&apos;t judge a vial by its cake.
                  </span>{' '}
                  A fluffy, good-looking lyophilized powder reflects bulking
                  agents and freeze-drying parameters — not purity. Insist on a
                  batch-specific certificate of analysis.
                </p>
              </div>

              <Link
                href="/synthesis"
                className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent"
              >
                How peptides are made — the full pipeline
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {peptide.researchAreas && peptide.researchAreas.length > 0 && (
              <Block title="Research areas">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {peptide.researchAreas.map((area) => (
                    <li
                      key={area}
                      className="flex items-center gap-2 rounded-lg border border-ink/[0.06] bg-ink/[0.02] px-3 py-2 text-sm text-ink/65"
                    >
                      <FlaskConical className="h-3.5 w-3.5 text-accent/70" />
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-ink/[0.02] px-3 py-1 text-xs text-ink/60 transition-colors hover:border-[#2DD4A8]/30 hover:text-accent"
                    >
                      <FlaskConical className="h-3 w-3 text-accent/70" />
                      {a.label}
                    </Link>
                  ))}
                </div>
              </Block>
            )}

            {(latest.trials.length > 0 || latest.articles.length > 0) && (
              <Block title="Latest research">
                <p className="mb-4 text-xs leading-relaxed text-ink/40">
                  Recent clinical trials and publications mentioning{' '}
                  <span className="text-ink/60">{latest.query}</span>, pulled
                  automatically from ClinicalTrials.gov and PubMed and refreshed
                  daily. Listings are unfiltered search results, not curated
                  endorsements.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  {latest.trials.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                        <FlaskConical className="h-3.5 w-3.5 text-accent/70" />
                        Recent trials
                      </h3>
                      <ul className="space-y-2">
                        {latest.trials.map((t) => (
                          <li key={t.nctId}>
                            <a
                              href={t.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-lg border border-ink/[0.06] bg-ink/[0.02] px-3 py-2.5 transition-colors hover:border-[#2DD4A8]/30"
                            >
                              <span className="block text-sm leading-snug text-ink/75 group-hover:text-ink/90">
                                {t.title}
                              </span>
                              <span className="mt-1 block text-[11px] text-ink/40">
                                {[t.status, t.phase, t.nctId].filter(Boolean).join(' · ')}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {latest.articles.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                        <Newspaper className="h-3.5 w-3.5 text-accent/70" />
                        Recent publications
                      </h3>
                      <ul className="space-y-2">
                        {latest.articles.map((a) => (
                          <li key={a.pmid}>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-lg border border-ink/[0.06] bg-ink/[0.02] px-3 py-2.5 transition-colors hover:border-[#2DD4A8]/30"
                            >
                              <span className="block text-sm leading-snug text-ink/75 group-hover:text-ink/90">
                                {a.title}
                              </span>
                              <span className="mt-1 block text-[11px] text-ink/40">
                                {[a.journal, a.date, `PMID ${a.pmid}`].filter(Boolean).join(' · ')}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Block>
            )}

            {peptide.faqs && peptide.faqs.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {peptide.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink/85">
                        {f.q}
                        <span className="text-ink/30 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-ink/55">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
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

            <AgentPrompt
              context={{ kind: 'compound', slug: peptide.slug }}
              heading={`Ask the Agent about ${peptide.name}`}
              subhead={`Dosing protocols, mechanism, comparisons, and the latest trials — citation-backed answers grounded in PubMed, PubChem, and ClinicalTrials.gov.`}
              examples={[
                `What does the research say about ${peptide.name} dosing protocols?`,
                `What is the mechanism of action of ${peptide.name}?`,
                `What side effects of ${peptide.name} are documented in the literature?`,
              ]}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Identity panel */}
            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
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
                        className="inline-flex items-center gap-1 text-accent hover:underline"
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
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        {peptide.uniprotId}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
              </dl>
            </div>

            {/* Verified-provenance panel — shown only for entries confirmed
                against a PubChem record by the fact-QA pass. */}
            {(() => {
              const v = getPubchemVerification(peptide.slug)
              if (!v) return null
              return (
                <div className="rounded-2xl border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.05] p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                    <h3 className="text-sm font-semibold text-accent">Chemistry verified</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink/60">
                    Cross-referenced against the PubChem reference record on{' '}
                    <span className="text-ink/75">{v.checkedAt}</span>
                    {v.molecularFormula ? (
                      <>
                        {' '}— formula{' '}
                        <span className="font-mono text-ink/75">{v.molecularFormula}</span>
                      </>
                    ) : null}
                    .
                  </p>
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${v.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                  >
                    Verify on PubChem · CID {v.cid}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )
            })()}

            {/* Marketplace panel — live trust-ranked vendors, else status */}
            {(() => {
              const vendors = getVendorsForPeptide(peptide.slug)
              return vendors.length ? (
                <MarketplacePanel vendors={vendors} />
              ) : (
                <MarketplaceComingSoon />
              )
            })()}

            {/* Further reading — generated authoritative sources */}
            <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                <BookOpen className="h-3.5 w-3.5" />
                Further reading
              </h3>
              <ul className="space-y-2.5">
                {references.map((r) => (
                  <li key={r.href}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-ink/65 transition-colors hover:text-accent"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] leading-relaxed text-ink/30">
                Links open external databases. AmericanPeptide does not endorse
                specific results.
              </p>
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
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
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
      <dt className="text-[10px] uppercase tracking-wider text-ink/35">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'break-all font-mono text-xs text-ink/85'
            : 'text-sm text-ink/85'
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
        <Icon className="h-3 w-3 text-ink/40" />
        {label}
      </span>
      <span className="text-ink/40">{value}</span>
    </div>
  )
}

function MarketplaceComingSoon() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] text-accent">
          <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">Marketplace</h3>
      </div>

      <div className="mb-4 space-y-2 text-xs text-ink/55">
        <MarketRow Icon={Building2} label="Vetted suppliers" value="Coming soon" />
        <MarketRow Icon={FileCheck2} label="COAs on file" value="Coming soon" />
        <MarketRow Icon={ShieldCheck} label="Escrow protection" value="Coming soon" />
      </div>

      <button
        disabled
        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/10 px-3 py-2 text-xs font-medium text-accent opacity-80"
      >
        <Bell className="h-3.5 w-3.5" />
        Notify me when live
      </button>
    </div>
  )
}

function MarketplacePanel({ vendors }: { vendors: Vendor[] }) {
  const CAP = 8
  const shown = vendors.slice(0, CAP)
  const hidden = vendors.length - shown.length
  // Group the already trust-ranked list into tiers; each tier keeps trust order.
  const groups = vendorsByTier(shown)

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] text-accent">
          <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">Where to source</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-ink/35">
          Ranked by trust
        </span>
      </div>

      <div className="space-y-6">
        {groups.map((group, gi) => (
          <div key={group.tier.id}>
            <div className="mb-1 flex items-baseline gap-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-accent/80">
                {group.tier.label}
              </h4>
              <span className="text-[10px] text-ink/35">{group.vendors.length}</span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-ink/40">
              {group.tier.blurb}
            </p>
            <div className="space-y-4">
              {group.vendors.map((v, j) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  isFirst={j === 0}
                  isBest={gi === 0 && j === 0}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <p className="mt-3 text-[11px] text-ink/40">
          +{hidden} more vendor{hidden > 1 ? 's' : ''} not shown.
        </p>
      )}

      <AffiliateDisclosure className="mt-4" />
    </div>
  )
}

function VendorCard({
  vendor,
  isFirst,
  isBest,
}: {
  vendor: Vendor
  isFirst: boolean
  isBest: boolean
}) {
  const score = trustScore(vendor)
  const t = vendor.trust
  const signals: { label: string; ok: boolean }[] = [
    { label: 'Independent third-party testing (HPLC/MS)', ok: t.thirdPartyTested },
    { label: 'Per-batch / lot-level testing', ok: t.perBatchTesting },
    {
      label: t.purityPct ? `Stated purity ≥ ${t.purityPct}%` : 'Stated purity',
      ok: Boolean(t.purityPct),
    },
    { label: 'Per-lot COA available to customers', ok: t.coaOnFile },
    { label: 'Reship on carrier loss', ok: t.reshipPolicy },
    { label: 'Published refund policy', ok: t.refundPolicy },
  ]

  return (
    <div className={isFirst ? '' : 'border-t border-ink/[0.07] pt-4'}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{vendor.name}</span>
          {isBest && (
            <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
              Best trust
            </span>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-semibold text-ink/70">
          {score}/100
        </span>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-ink/55">{vendor.blurb}</p>

      <ul className="mb-3 space-y-1.5 text-xs">
        {signals.map((s) => (
          <li key={s.label} className="flex items-start gap-2">
            {s.ok ? (
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" strokeWidth={2.5} />
            ) : (
              <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-ink/30" />
            )}
            <span className={s.ok ? 'text-ink/70' : 'text-ink/40'}>{s.label}</span>
          </li>
        ))}
      </ul>

      <a
        href={vendorHref(vendor)}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2DD4A8]/30 bg-[#2DD4A8]/15 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-[#2DD4A8]/25"
      >
        Visit {vendor.name}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>

      {vendor.affiliate?.code && (
        <p className="mt-2 text-center text-[11px] text-ink/45">
          Referral code{' '}
          <span className="font-mono font-semibold text-ink/70">
            {vendor.affiliate.code}
          </span>
        </p>
      )}

      {vendor.notes && (
        <p className="mt-3 text-[11px] leading-relaxed text-amber-400/70">
          {vendor.notes}
        </p>
      )}
    </div>
  )
}

function RelatedCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group flex flex-col rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4 transition-colors hover:border-[#2DD4A8]/25 hover:bg-ink/[0.04]"
    >
      <h4 className="mb-1.5 text-sm font-semibold">{peptide.name}</h4>
      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-ink/50">
        {peptide.shortDescription}
      </p>
      <span className="flex items-center gap-1 text-[11px] text-accent/70 transition-colors group-hover:text-accent">
        View
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  )
}
