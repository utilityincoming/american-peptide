import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  breadcrumbJsonLd,
  buildAgentHandoffUrl,
  buildCalculatorHandoffUrl,
  buildCorrectionHandoffUrl,
  datasetJsonLd,
  faqPageJsonLd,
  molecularEntityJsonLd,
  webPageJsonLd,
} from '@/lib/schema'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  Droplets,
  Factory,
  Flag,
  FlaskConical,
  HelpCircle,
  Info,
  Layers,
  Newspaper,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Syringe,
} from 'lucide-react'
import {
  PEPTIDES,
  CATEGORIES,
  getPeptideBySlug,
  getComponents,
  getBlendsContaining,
  SYNTHESIS_DIFFICULTY_LABEL,
  type Peptide,
} from '@/lib/peptides'
import { getAreasForPeptide } from '@/lib/research-areas'
import { comparisonsFor } from '@/lib/comparisons'
import GlossaryText from '@/components/GlossaryText'
import { monographDescription, monographTitle } from '@/lib/page-meta'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { IS_APP_BUILD } from '@/lib/platform'
import { getPubchemVerification } from '@/lib/verification'
import { molecularWeightClaim, molecularFormulaClaim } from '@/lib/evidence'
import { catalogClaims, isLoadBearing, reconPresetFor, reconPresetClaims } from '@/lib/evidence/from-catalog'
import { reconcileCompoundSources } from '@/lib/evidence/from-vendors'
import { TierBadge, EvidenceFloor } from '@/components/evidence'
import { getLatestResearch } from '@/lib/freshness'
import AgentPrompt from '@/components/AgentPrompt'
import PeptideStory from '@/components/PeptideStory'
import WatchButton from '@/components/WatchButton'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import LastUpdated from '@/components/LastUpdated'
import SequenceGlyph from '@/components/SequenceGlyph'
import ThymosinBeta4Figure from '@/components/ThymosinBeta4Figure'
import {
  vendorHref,
  type Vendor,
} from '@/lib/vendors'

const SITE = 'https://americanpeptide.com'

// ISR: re-render at most once per day so the live "Latest research" section
// stays current without rebuilding. External fetches in getLatestResearch are
// themselves day-cached and fail soft, so this never blocks or breaks a render.
export const revalidate = 86400

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
    title: monographTitle(peptide.name, peptide.slug),
    description: monographDescription(peptide.slug, peptide.shortDescription),
    alternates: {
      canonical: url,
      types: { 'text/markdown': `${url}.md` },
    },
    openGraph: {
      title: monographTitle(peptide.name, peptide.slug),
      description: monographDescription(peptide.slug, peptide.shortDescription),
      url,
      type: 'article',
    },
  }
}

export default async function PeptideDetailPage({ params }: RouteParams) {
  const { slug } = await params
  const peptide = getPeptideBySlug(slug)
  if (!peptide) notFound()

  const components = getComponents(peptide)
  const partOfBlends = getBlendsContaining(peptide.slug)

  const related = PEPTIDES.filter(
    (p) =>
      p.slug !== peptide.slug &&
      !p.unlisted &&
      p.categories.some((c) => peptide.categories.includes(c)) &&
      !components.some((comp) => comp.slug === p.slug),
  ).slice(0, 3)

  const areas = getAreasForPeptide(peptide)
  const latest = await getLatestResearch(peptide)

  const verification = getPubchemVerification(peptide.slug)
  const mwClaim = molecularWeightClaim(verification)
  const mfClaim = molecularFormulaClaim(verification)
  const hasIdentifiers = Boolean(
    peptide.molecularWeight || peptide.molecularFormula || peptide.cas ||
    peptide.pubchemCid || peptide.uniprotId,
  )

  const url = `${SITE}/catalog/${peptide.slug}`
  const nctIds = latest.trials.map((t) => t.nctId).filter(Boolean).slice(0, 3)

  // Strict reference-only JSON-LD: MolecularEntity derived strictly from
  // verified catalog fields (name, molecularWeight, sameAs PubChem/UniProt URLs,
  // license: CC BY 4.0). Zero Product, Offer, Drug, or MedicalEntity fields.
  const entityLd = molecularEntityJsonLd(peptide)

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Catalog', path: '/catalog' },
    { name: peptide.name, path: `/catalog/${peptide.slug}` },
  ])

  // The catalog page's live "Latest research" section is refreshed on each daily
  // ISR revalidation; fetchedAt is that real timestamp — an honest dateModified.
  const webPageLd = webPageJsonLd({
    url,
    name: `${peptide.name} — AmericanPeptide.com Catalog`,
    description: peptide.shortDescription,
    dateModified: latest.fetchedAt,
    mainEntityId: `${url}#entity`,
  })

  const faqLd = peptide.faqs?.length ? faqPageJsonLd(peptide.faqs) : null
  const datasetLd = datasetJsonLd(peptide)
  const headToHeads = comparisonsFor([peptide.slug]).slice(0, 2)

  const preset = reconPresetFor(peptide.slug)
  const calcHandoffHref = buildCalculatorHandoffUrl({
    slug: peptide.slug,
    molecularWeight: peptide.molecularWeight,
    preset,
  })
  const agentHandoffHref = buildAgentHandoffUrl({
    slug: peptide.slug,
    name: peptide.name,
    pubchemCid: peptide.pubchemCid,
    uniprotId: peptide.uniprotId,
    nctIds,
  })
  const correctionHref = buildCorrectionHandoffUrl({
    slug: peptide.slug,
    section: 'Identity & citations',
  })

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
  const pubmedSearch = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(peptide.name)}`
  const trialSearch = `https://clinicaltrials.gov/search?term=${encodeURIComponent(peptide.name)}`
  references.push(
    { label: 'PubMed literature search', href: pubmedSearch },
    { label: 'ClinicalTrials.gov search', href: trialSearch },
  )

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entityLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-hairline px-4 py-3 md:px-6">
        <Link
          href="/catalog"
          className="text-sm text-ink/55 transition-colors hover:text-ink"
        >
          Catalog
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">{peptide.name}</span>
      </header>

      {/* ── Title block ── */}
      <section className="border-b border-hairline px-4 py-10 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {peptide.categories.map((cat) => (
              <Link
                key={cat}
                href={`/catalog/category/${cat}`}
                className="rounded-md border border-hairline bg-fill px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink/55 transition-colors hover:border-accent/30 hover:text-accent"
              >
                {CATEGORIES.find((c) => c.id === cat)?.label ?? cat}
              </Link>
            ))}
            {peptide.fdaApproved && (
              <span className="rounded-md border border-accent/25 bg-accent/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                FDA Approved
              </span>
            )}
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            {peptide.name}
          </h1>
          {peptide.aliases && peptide.aliases.length > 0 && (
            <p className="mb-5 text-sm text-ink/55">
              Also known as {peptide.aliases.join(' · ')}
            </p>
          )}
          <p className="max-w-3xl text-base leading-relaxed text-ink/65 md:text-lg">
            <GlossaryText text={peptide.shortDescription} />
          </p>
          <nav aria-label="Explore" className="mt-5 flex flex-wrap gap-2 text-xs">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/research-areas/${area.slug}`}
                className="rounded-full border border-accent/30 px-3 py-1 text-accent hover:bg-accent/10"
              >
                {area.label} research
              </Link>
            ))}
            <Link href="/synthesis" className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
              Synthesis guide
            </Link>
            <Link href={calcHandoffHref} className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
              Reconstitution calculator
            </Link>
            <Link href="/tools/coa-decoder" className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
              COA decoder
            </Link>
            <Link href="/methodology" className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
              Methodology
            </Link>
            <Link href="/us-peptides" className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent">
              US sourcing standard
            </Link>
            {headToHeads.map((item) => (
              <Link
                key={item.slug}
                href={`/compare/${item.slug}`}
                className="rounded-full border border-hairline px-3 py-1 text-ink/70 hover:text-accent"
              >
                {item.aName} vs {item.bName}
              </Link>
            ))}
          </nav>
          {/* Page-level evidence rollup (the Standard §3): the LOWEST tier among
              the monograph's load-bearing figures, so a reader calibrates before
              scrolling. Identity claims are excluded; a page with no empirical
              figure shows no floor rather than borrowing one from its chemistry. */}
          <EvidenceFloor
            claims={catalogClaims(peptide)}
            loadBearing={isLoadBearing}
            className="mt-5"
          />
          <LastUpdated
            date={latest.fetchedAt}
            label="Research refreshed"
            className="mt-4 text-[11px] text-ink/55"
          />
          <WatchButton slug={peptide.slug} />
        </div>
      </section>

      {/* ── Body grid ── */}
      <section className="px-4 py-10 md:px-6 md:py-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main column */}
          <div className="min-w-0 space-y-8">
            {(peptide.slug === 'thymosin-beta-4' || peptide.slug === 'tb-500') && (
              <Block title="How the chain is used">
                <div className="rounded-2xl border border-hairline bg-fill p-4 text-ink">
                  <ThymosinBeta4Figure />
                </div>
              </Block>
            )}

            {(peptide.sequence || hasIdentifiers || verification) && (
              <section aria-labelledby="monograph-identity" className="border border-hairline bg-panel p-4 sm:p-6">
                <h2 id="monograph-identity" className="mb-4 text-2xl font-semibold text-ink">
                  Identity
                </h2>
                {peptide.sequence && (
                  <figure className="mb-4">
                    <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-sm font-medium">Primary structure</span>
                      <span className="font-scientific text-xs text-ink-muted">
                        {peptide.sequence.replace(/[^A-Za-z]/g, '').length} residues
                      </span>
                    </figcaption>
                    <SequenceGlyph sequence={peptide.sequence} />
                    <code className="mt-2 block break-all font-scientific text-sm text-ink">
                      {peptide.sequence}
                    </code>
                  </figure>
                )}
                {hasIdentifiers && (
                  <dl className="grid gap-x-6 gap-y-4 border-t border-hairline pt-4 text-sm sm:grid-cols-2">
                    {peptide.molecularWeight && (
                      <Row
                        label="Molecular weight"
                        value={
                          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-scientific">{`${peptide.molecularWeight.toLocaleString()} Da`}</span>
                            {mwClaim && <TierBadge claim={mwClaim} showDate />}
                          </span>
                        }
                      />
                    )}
                    {peptide.molecularFormula && (
                      <Row
                        label="Molecular formula"
                        value={
                          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="break-all font-scientific text-sm text-ink">
                              {peptide.molecularFormula}
                            </span>
                            {mfClaim && <TierBadge claim={mfClaim} showDate />}
                          </span>
                        }
                      />
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
                            className="inline-flex items-center gap-1 font-scientific text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {peptide.pubchemCid}
                            <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
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
                            className="inline-flex items-center gap-1 font-scientific text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {peptide.uniprotId}
                            <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                          </a>
                        }
                      />
                    )}
                  </dl>
                )}
                {verification && (
                  <div className="mt-5 border-t border-hairline pt-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                      <h3 className="text-sm font-semibold text-accent">Chemistry verified</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      Cross-referenced against the PubChem reference record on{' '}
                      <span className="text-ink/75">{verification.checkedAt}</span>
                      {verification.molecularFormula ? (
                        <>
                          {' '}— formula{' '}
                          <span className="font-mono text-ink/75">{verification.molecularFormula}</span>
                        </>
                      ) : null}
                      .
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <a
                        href={`https://pubchem.ncbi.nlm.nih.gov/compound/${verification.cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        Verify on PubChem · CID {verification.cid}
                        <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                      </a>
                      <Link
                        href="/methodology"
                        className="inline-flex items-center gap-1 text-[13px] text-ink/50 transition-colors hover:text-accent"
                      >
                        How we verify
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Stateless tool handoffs & zero-PII correction link */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-4">
                  {!preset && (
                    <Link
                      href={calcHandoffHref}
                      className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:underline"
                    >
                      <Syringe className="h-3.5 w-3.5 shrink-0" />
                      Open in reconstitution calculator
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  <Link
                    href={agentHandoffHref}
                    className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    Research {peptide.name} in Peptide Agent
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={correctionHref}
                    className="group inline-flex items-center gap-1.5 text-xs text-ink/55 transition-colors hover:text-accent"
                  >
                    <Flag className="h-3.5 w-3.5 shrink-0 text-ink/45 group-hover:text-accent" />
                    Suggest correction / Flag citation
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>
            )}

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
            <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-[#7EE0B5]/[0.05] to-transparent p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
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
                      className="inline-flex items-center rounded-full border border-hairline bg-fill px-2.5 py-1 text-[11px] font-medium text-ink/60 transition-colors hover:border-accent/30 hover:bg-accent/[0.06] hover:text-accent"
                    >
                      {f}
                    </Link>
                  ))}
                </div>
              )}

              {(peptide.storage || peptide.handling) && (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {peptide.storage && (
                    <div className="rounded-xl border border-hairline bg-fill px-4 py-3">
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
                    <div className="rounded-xl border border-hairline bg-fill px-4 py-3">
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

              <div className="mt-4 rounded-xl border border-hairline bg-fill px-4 py-3">
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
                  {peptide.researchAreas.map((area) => {
                    const guide = RESEARCH_AREAS.find((item) =>
                      item.matchers.some((matcher) => area.toLowerCase().includes(matcher)),
                    )
                    return (
                    <li
                      key={area}
                      className="flex items-center gap-2 rounded-lg border border-hairline bg-fill px-3 py-2 text-sm text-ink/65"
                    >
                      <FlaskConical className="h-3.5 w-3.5 text-accent/70" />
                      {guide ? (
                        <Link href={`/research-areas/${guide.slug}`} className="hover:text-accent">
                          {area} research guide
                        </Link>
                      ) : (
                        area
                      )}
                    </li>
                    )
                  })}
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-fill px-3 py-1 text-xs text-ink/60 transition-colors hover:border-accent/30 hover:text-accent"
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
                <p className="mb-4 text-sm leading-relaxed text-ink-muted">
                  Recent clinical trials and publications mentioning {latest.query}. The
                  listings are refreshed daily and show unfiltered search results.
                  AmericanPeptide does not endorse specific results. Search for {peptide.name} on{' '}
                  <a href={trialSearch} className="text-accent underline underline-offset-4">
                    ClinicalTrials.gov
                  </a>{' '}
                  or in{' '}
                  <a href={pubmedSearch} className="text-accent underline underline-offset-4">
                    PubMed
                  </a>.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  {latest.trials.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink/55">
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
                              className="group block rounded-lg border border-hairline bg-fill px-3 py-2.5 transition-colors hover:border-accent/30"
                            >
                              <span className="block text-sm leading-snug text-ink/75 group-hover:text-ink/90">
                                {t.title}
                              </span>
                              <span className="mt-1 block text-[11px] text-ink/55">
                                {[t.status, t.phase].filter(Boolean).map((item) => `${item} · `)}
                                <span className="font-scientific">{t.nctId}</span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {latest.articles.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink/55">
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
                              className="group block rounded-lg border border-hairline bg-fill px-3 py-2.5 transition-colors hover:border-accent/30"
                            >
                              <span className="block text-sm leading-snug text-ink/75 group-hover:text-ink/90">
                                {a.title}
                              </span>
                              <span className="mt-1 block text-[11px] text-ink/55">
                                {[a.journal, a.date].filter(Boolean).map((item) => `${item} · `)}
                                <span className="font-scientific">PMID {a.pmid}</span>
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
                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/55">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {peptide.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-xl border border-hairline bg-fill p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink/85">
                        {f.q}
                        <span className="text-ink/55 transition-transform group-open:rotate-45">
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

            {components.length > 0 && (
              <Block title="Components">
                <p className="mb-3 text-sm leading-relaxed text-ink/60">
                  {peptide.name} is a blend. Each component is a single
                  compound with its own catalog monograph — purity, mechanism,
                  and research are documented per component below.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {components.map((c) => (
                    <RelatedCard key={c.slug} peptide={c} />
                  ))}
                </div>
              </Block>
            )}

            {partOfBlends.length > 0 && (
              <Block title="Found in these blends">
                <div className="flex flex-wrap gap-2">
                  {partOfBlends.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/catalog/${b.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-fill px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/25 hover:bg-fill-strong"
                    >
                      <Layers className="h-3 w-3 text-accent/70" />
                      {b.name}
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

            <AgentPrompt
              context={{
                kind: 'compound',
                slug: peptide.slug,
                name: peptide.name,
                pubchemCid: peptide.pubchemCid,
                uniprotId: peptide.uniprotId,
                nctIds,
              }}
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
            {/* Reference figures — the calculator's preset for this compound,
                each number carrying its claim tier. These are curated conventions
                (community tier, §9), stamped with the presets' curation date. */}
            {(() => {
              if (!preset) return null
              const [amount, vial, water] = reconPresetClaims(preset)
              const fmtAmount = (mcg: number) =>
                mcg >= 1000 ? `${(mcg / 1000).toLocaleString()} mg` : `${mcg.toLocaleString()} mcg`
              return (
                <div className="rounded-2xl border border-hairline bg-fill p-5">
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/55">
                    Reference figures
                  </h3>
                  <p className="mb-4 text-[11px] leading-relaxed text-ink/55">
                    Calculation reference points, not dosing recommendations. Tiered
                    by provenance under the Validation Tier Schema.
                  </p>
                  <dl className="space-y-3 text-sm">
                    <Row
                      label="Reference amount"
                      value={
                        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                          {fmtAmount(amount.value)}
                          <TierBadge claim={amount} showDate />
                        </span>
                      }
                    />
                    <Row
                      label="Common vial strength"
                      value={
                        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                          {`${vial.value} mg`}
                          <TierBadge claim={vial} showDate />
                        </span>
                      }
                    />
                    <Row
                      label="Typical reconstitution volume"
                      value={
                        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                          {`${water.value} mL`}
                          <TierBadge claim={water} showDate />
                        </span>
                      }
                    />
                  </dl>
                  {preset.note && (
                    <p className="mt-3 text-[11px] leading-relaxed text-ink/55">{preset.note}</p>
                  )}
                  <Link
                    href={calcHandoffHref}
                    className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent"
                  >
                    Open in the reconstitution calculator
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )
            })()}

            {/* Sources panel — live trust-ranked vendors via generalized reconciliation helper, else status */}
            {(() => {
              const reconciliation = reconcileCompoundSources(peptide.slug)
              // No vendors means two different things. On the Play build it's
              // the whole directory being hidden; on the web it's a compound the
              // peptide market doesn't supply. Same emptiness, opposite reasons.
              if (!reconciliation.isReconciled)
                return IS_APP_BUILD ? (
                  <ReferenceEdition />
                ) : (
                  <ReferenceCompoundPanel peptide={peptide} />
                )
              return (
                <div className="space-y-2">
                  <SourcesPanel slug={peptide.slug} />
                  {/* Deep link to the tiered sourcing aggregator — only where it
                      exists, gated by the same rule /sources generates from. */}
                  {reconciliation.hasSourcingPage && (
                    <Link
                      href={`/sources/${peptide.slug}`}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-accent/25 bg-accent/[0.05] px-5 py-3.5 text-sm font-medium text-accent transition-colors hover:bg-accent/[0.09]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Layers className="h-4 w-4" strokeWidth={2} />
                        Sources by evidence tier
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )
            })()}

            {/* Further reading — generated authoritative sources */}
            <div className="rounded-2xl border border-hairline bg-fill p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
                <BookOpen className="h-3.5 w-3.5" />
                Further reading
              </h2>
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
              <p className="mt-3 text-[10px] leading-relaxed text-ink/60">
                Links open external databases. AmericanPeptide does not endorse
                specific results.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="border border-research-notice-border bg-research-notice px-4 py-3">
              <p className="text-xs leading-relaxed text-research-notice-ink">
                <span className="font-semibold">
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
      <h2 className="mb-3 text-2xl font-semibold leading-tight text-ink">
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
      <dt className="text-xs font-medium text-ink-muted">
        {label}
      </dt>
      <dd
        className={
          mono
            ? 'break-all font-scientific text-sm text-ink'
            : 'text-sm text-ink/85'
        }
      >
        {value}
      </dd>
    </div>
  )
}

// Reference-only fallback for the Play (TWA) build, where IS_APP_BUILD hides
// every outbound vendor link. Its copy points the reader to the web, so it must
// never render ON the web — a compound with no vendors there is a different
// situation entirely, handled by ReferenceCompoundPanel below. The trust-ranked
// affiliate directory is the sourcing layer; this platform never sells peptides.
function ReferenceEdition() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-fill p-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline-strong bg-fill-strong text-ink/50">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">Reference edition</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-ink/55">
        This edition is a research reference only — no supplier listings or
        pricing. AmericanPeptide never sells peptides; sourcing is handled on the
        web through an independently trust-ranked vendor directory.
      </p>
    </div>
  )
}

// Shown on the web for a compound the research-peptide market doesn't supply:
// a recombinant biologic, a monoclonal antibody, or an endogenous hormone the
// catalog documents for reference. Saying so plainly is the point — the failure
// mode this replaces was a broad-catalog vendor being credited with stocking
// secretin. An empty sourcing panel would read as "we haven't found sources
// yet"; this says there are none to find, and why.
function ReferenceCompoundPanel({ peptide }: { peptide: Peptide }) {
  const isHormone = peptide.categories.includes('peptide-hormone')
  const features = peptide.syntheticFeatures ?? []
  const route = features.includes('Monoclonal antibody')
    ? 'a monoclonal antibody grown in mammalian cell culture'
    : features.includes('Recombinant protein')
      ? 'a recombinant protein expressed in living cells, not assembled by peptide synthesis'
      : null

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-fill p-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline-strong bg-fill-strong text-ink/50">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">Reference entry — no sources listed</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-ink/55">
        {peptide.name} is documented here for its chemistry and history, not as
        something to source.{' '}
        {route
          ? `It is ${route}, so it does not come from the research-peptide market at all.`
          : isHormone
            ? 'It is a native hormone the catalog carries as a reference point for the analogs engineered from it.'
            : ''}{' '}
        None of the vendors we track has published a claim to carry it, and we
        will not infer one from a broad &ldquo;full catalog&rdquo; statement —{' '}
        <Link href="/methodology" className="text-accent hover:underline">
          the Standard
        </Link>{' '}
        applies to availability the same way it applies to purity.
      </p>
    </div>
  )
}

function SourcesPanel({ slug }: { slug: string }) {
  // Reconciles vendor transparency bands onto the evidence-tier scale (3P / VEN / COMM)
  // via the generalized GHK-Cu reconciliation helper. A paid featured partner is
  // NOT pulled out or pinned above the tiers — it ranks in its honest tier like
  // any other vendor, carrying only a quiet inline "Featured partner · paid" badge.
  const reconciliation = reconcileCompoundSources(slug)

  const CAP = 8
  const shown = reconciliation.sources.slice(0, CAP)
  const hidden = reconciliation.sources.length - shown.length
  const shownIds = new Set(shown.map((s) => s.vendor.id))
  const groups = reconciliation.groups
    .map((g) => ({
      ...g,
      sources: g.sources.filter((s) => shownIds.has(s.vendor.id)),
    }))
    .filter((g) => g.sources.length > 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-accent/15 bg-accent/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/[0.08] text-accent">
          <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold">Where to source</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-ink/55">
          Ranked by trust
        </span>
      </div>

      <div className="space-y-6">
        {groups.map((group, gi) => (
          <div key={group.band.id}>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <TierBadge tier={group.claimTier} />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-accent/80">
                {group.band.label}
              </h4>
              <span className="text-[10px] text-ink/55">{group.sources.length}</span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-ink/55">
              {group.band.blurb}
            </p>
            <div className="space-y-4">
              {group.sources.map((src, j) => (
                <VendorCard
                  key={src.vendor.id}
                  vendor={src.vendor}
                  claim={src.claim}
                  score={src.trustScore}
                  slug={slug}
                  isFirst={j === 0}
                  badge={
                    src.featured
                      ? 'featured'
                      : gi === 0 && j === 0
                        ? 'best'
                        : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <p className="mt-3 text-[11px] text-ink/55">
          +{hidden} more vendor{hidden > 1 ? 's' : ''} not shown.
        </p>
      )}

      <AffiliateDisclosure className="mt-4" />
    </div>
  )
}

function VendorCard({
  vendor,
  claim,
  score,
  slug,
  isFirst,
  badge,
}: {
  vendor: Vendor
  claim: ReturnType<typeof reconcileCompoundSources>['sources'][number]['claim']
  score: number
  /** The compound being viewed — routes the outbound to its product deep link. */
  slug: string
  isFirst: boolean
  /** 'best' = top of the trust ranking. 'featured' = paid placement, disclosed as such. */
  badge?: 'best' | 'featured'
}) {
  const t = vendor.trust
  const hasAbsimListing =
    vendor.id === 'absim-peptides' &&
    Boolean(vendor.affiliate?.active && vendor.affiliate.productUrls?.[slug])
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
    <div className={isFirst ? '' : 'border-t border-hairline pt-4'}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{vendor.name}</span>
          {badge === 'best' && (
            <span className="rounded-full border border-accent/25 bg-accent/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
              Best trust
            </span>
          )}
          {badge === 'featured' && (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300/90">
              Featured partner · paid
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <TierBadge claim={claim} showDate />
          <span className="rounded-full border border-hairline-strong px-2 py-0.5 text-[10px] font-semibold text-ink/70">
            {score}/100
          </span>
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-ink/55">{vendor.blurb}</p>

      {badge === 'featured' && vendor.affiliate?.offer && (
        <p className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.08] px-3 py-2.5 text-sm font-semibold text-amber-200">
          {vendor.affiliate.offer}
        </p>
      )}

      {badge === 'featured' && vendor.spotlightNote && (
        <p className="mb-3 border-l-2 border-amber-400/30 pl-3 text-[11px] leading-relaxed text-ink/60">
          {vendor.spotlightNote}
        </p>
      )}

      <ul className="mb-3 space-y-1.5 text-xs">
        {signals.map((s) => (
          <li key={s.label} className="flex items-start gap-2">
            {s.ok ? (
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" strokeWidth={2.5} />
            ) : (
              <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-ink/55" />
            )}
            <span className={s.ok ? 'text-ink/70' : 'text-ink/55'}>{s.label}</span>
          </li>
        ))}
      </ul>

      <a
        href={vendorHref(vendor, slug)}
        aria-describedby={hasAbsimListing ? 'absim-listing-details' : undefined}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/15 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
      >
        {hasAbsimListing ? 'View listing at ABSIM' : `Shop ${vendor.name}`}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>

      {hasAbsimListing && (
        <p id="absim-listing-details" className="mt-2 text-xs leading-relaxed text-ink/65">
          See the Certificate of Analysis tab on the ABSIM listing. We may earn a
          commission if you purchase through this link.
        </p>
      )}

      {vendor.affiliate?.code &&
        (badge === 'featured' && vendor.affiliate?.offer ? (
          // Discount case: the offer above is pure benefit; this line carries the
          // redemption mechanics so a reader knows it will actually land — the
          // referral param applies it automatically, the code is the fallback.
          <p className="mt-2 text-center text-[11px] leading-relaxed text-ink/55">
            Discount applies automatically — or enter{' '}
            <span className="font-mono font-semibold text-ink/80">
              {vendor.affiliate.code}
            </span>{' '}
            at checkout.
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] text-ink/55">
            Referral code{' '}
            <span className="font-mono font-semibold text-ink/70">
              {vendor.affiliate.code}
            </span>
          </p>
        ))}

      {vendor.notes && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-400/70">
          <Info className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
          <span>{vendor.notes}</span>
        </p>
      )}
    </div>
  )
}

function RelatedCard({ peptide }: { peptide: Peptide }) {
  return (
    <Link
      href={`/catalog/${peptide.slug}`}
      className="group flex flex-col rounded-xl border border-hairline bg-fill p-4 transition-colors hover:border-accent/25 hover:bg-fill-strong"
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
