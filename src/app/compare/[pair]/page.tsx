import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ShieldCheck, FlaskConical } from 'lucide-react'
import { COMPARISONS, getComparison } from '@/lib/comparisons'
import { getPeptideBySlug } from '@/lib/peptides'
import { getPubchemVerification } from '@/lib/verification'
import EvidenceContext from '@/components/EvidenceContext'
import AgentPrompt from '@/components/AgentPrompt'

const SITE = 'https://www.americanpeptide.com'
const A = '#2DD4A8'
const B = '#818CF8'

interface RouteParams {
  params: Promise<{ pair: string }>
}

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ pair: c.slug }))
}

// Only the comparisons we've authored resolve here — any other /compare/* 404s.
export const dynamicParams = false

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { pair } = await params
  const c = getComparison(pair)
  if (!c) return { title: 'Not Found' }
  const url = `${SITE}/compare/${c.slug}`
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${c.aName} vs ${c.bName} — ${c.headline}`,
      description: c.metaDescription,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.aName} vs ${c.bName} Research Comparison | AmericanPeptide.com`,
      description: c.metaDescription,
    },
  }
}

function VerifiedLine({ slug, name }: { slug?: string; name: string }) {
  if (!slug) return null
  const v = getPubchemVerification(slug)
  const peptide = getPeptideBySlug(slug)
  if (!v && !peptide) return null
  return (
    <div className="flex items-start gap-2 text-[13px] leading-relaxed text-ink/55">
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" strokeWidth={1.75} />
      <span>
        <span className="text-ink/75">{name}</span>
        {peptide?.molecularFormula ? <> · {peptide.molecularFormula}</> : null}
        {peptide?.molecularWeight ? <> · {peptide.molecularWeight.toLocaleString()} Da</> : null}
        {v ? (
          <>
            {' · '}
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${v.cid}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              <ShieldCheck className="h-3 w-3" /> verified · PubChem CID {v.cid}
            </a>
          </>
        ) : null}
      </span>
    </div>
  )
}

export default async function ComparePage({ params }: RouteParams) {
  const { pair } = await params
  const c = getComparison(pair)
  if (!c) notFound()

  const url = `${SITE}/compare/${c.slug}`
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: `${c.aName} vs ${c.bName}: ${c.headline}`,
    description: c.metaDescription,
    url,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    ...(c.about ? { about: c.about.map((d) => ({ '@type': 'Drug', ...d })) } : {}),
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: c.breadcrumb.label, item: `${SITE}${c.breadcrumb.href}` },
      { '@type': 'ListItem', position: 3, name: `${c.aName} vs ${c.bName}`, item: url },
    ],
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const peptideSlugs = [c.aSlug, c.bSlug].filter((s): s is string => Boolean(s))

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Breadcrumb */}
      <header className="flex flex-wrap items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href={c.breadcrumb.href} className="text-sm text-ink/35 transition-colors hover:text-ink">
          {c.breadcrumb.label}
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">
          {c.aName} vs {c.bName}
        </span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap gap-2">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: `${A}40`, background: `${A}14`, color: A }}
            >
              {c.aName} · {c.aPill}
            </span>
            <span className="self-center text-ink/20">vs</span>
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: `${B}40`, background: `${B}14`, color: B }}
            >
              {c.bName} · {c.bPill}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {c.aName} vs {c.bName}
            <br />
            <span className="text-2xl font-normal text-ink/40 md:text-3xl">{c.headline}</span>
          </h1>
          {c.intro.map((p, i) => (
            <p key={i} className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
              {p}
            </p>
          ))}
          <p className="mt-3 text-xs text-ink/30">
            Research reference only. Not medical advice, prescribing guidance, or a product recommendation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* Main column */}
          <div className="space-y-16">
            {/* At a glance */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">At a glance</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-xs">
                      <th className="w-40 pb-3 pr-6 font-medium text-ink/30">Dimension</th>
                      <th className="pb-3 pr-6 font-medium" style={{ color: A }}>{c.aName}</th>
                      <th className="pb-3 font-medium" style={{ color: B }}>{c.bName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {c.atAGlance.map((row) => (
                      <tr key={row.dim} className="hover:bg-ink/[0.02]">
                        <td className="py-3 pr-6 text-xs font-medium text-ink/35">{row.dim}</td>
                        <td className="py-3 pr-6 text-sm text-ink/70">{row.a}</td>
                        <td className="py-3 text-sm text-ink/70">{row.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Column sections (mechanisms) */}
            {c.columnSections?.map((sec) => (
              <section key={sec.title}>
                <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">{sec.title}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sec.columns.map((col) => {
                    const accent = col.accent === 'a' ? A : col.accent === 'b' ? B : '#9CA3AF'
                    return (
                      <div key={col.heading} className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
                        <h3 className="mb-3 text-sm font-semibold" style={{ color: accent }}>{col.heading}</h3>
                        <ul className="space-y-2 text-[13px] leading-relaxed text-ink/60">
                          {col.points.map((pt, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: accent }}>·</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            {/* Prose sections */}
            {c.proseSections?.map((sec) => (
              <section key={sec.title}>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">{sec.title}</h2>
                <div className="space-y-4 text-sm leading-relaxed text-ink/65">
                  {sec.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            {/* Trials */}
            {c.trials && c.trials.length > 0 && (
              <section>
                <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">Key clinical trials</h2>
                <div className="space-y-3">
                  {c.trials.map((t) => (
                    <div key={t.name} className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4">
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-ink/85">{t.name}</span>
                        <span className="text-xs text-ink/40">{t.arm}</span>
                      </div>
                      <p className="text-sm text-ink/70">{t.result}</p>
                      <p className="mt-1 text-xs text-ink/40">
                        {[t.endpoint, t.n ? `n=${t.n}` : null, t.duration].filter(Boolean).join(' · ')}
                        {t.note ? ` — ${t.note}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Extra tables (synthesis) */}
            {c.tables?.map((tbl) => (
              <section key={tbl.title}>
                <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">{tbl.title}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <tbody className="divide-y divide-ink/[0.04]">
                      {tbl.rows.map((row) => (
                        <tr key={row.dim} className="hover:bg-ink/[0.02]">
                          <td className="w-40 py-3 pr-6 text-xs font-medium text-ink/35">{row.dim}</td>
                          <td className="py-3 pr-6 text-sm text-ink/70">{row.a}</td>
                          <td className="py-3 text-sm text-ink/70">{row.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tbl.note && <p className="mt-3 text-xs text-ink/40">{tbl.note}</p>}
              </section>
            ))}

            {/* Verdict */}
            {c.verdict && (
              <section className="rounded-2xl border border-[#2DD4A8]/15 bg-[#2DD4A8]/[0.04] p-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent/80">{c.verdict.title}</h2>
                <div className="space-y-3 text-sm leading-relaxed text-ink/70">
                  {c.verdict.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {c.faqs.length > 0 && (
              <section>
                <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">Frequently asked questions</h2>
                <div className="space-y-3">
                  {c.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink/85">
                        {f.q}
                        <span className="text-ink/30 transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-ink/55">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <AgentPrompt
              context={{ kind: 'comparison', slug: c.slug }}
              heading={`Ask the Agent: ${c.aName} vs ${c.bName}`}
              subhead={`Mechanism, evidence, and trade-offs between ${c.aName} and ${c.bName} — citation-backed answers grounded in PubMed, PubChem, and ClinicalTrials.gov.`}
              examples={[
                `How do ${c.aName} and ${c.bName} differ in mechanism?`,
                `Which has stronger clinical evidence, ${c.aName} or ${c.bName}?`,
                `What are the trade-offs between ${c.aName} and ${c.bName}?`,
              ]}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Verified provenance */}
            {peptideSlugs.length > 0 && (
              <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.025] p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">Compound identity</h3>
                <div className="space-y-3">
                  <VerifiedLine slug={c.aSlug} name={c.aName} />
                  <VerifiedLine slug={c.bSlug} name={c.bName} />
                </div>
                <div className="mt-4 flex flex-col gap-1.5 border-t border-ink/[0.06] pt-3 text-[13px]">
                  {c.aSlug && (
                    <Link href={`/catalog/${c.aSlug}`} className="inline-flex items-center gap-1 text-accent/80 hover:text-accent">
                      {c.aName} in catalog <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {c.bSlug && (
                    <Link href={`/catalog/${c.bSlug}`} className="inline-flex items-center gap-1 text-accent/80 hover:text-accent">
                      {c.bName} in catalog <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Contextual education */}
            <EvidenceContext
              peptideSlugs={peptideSlugs}
              areaSlugs={c.relatedAreas}
              moreLinks={[{ href: '/compare', label: 'All comparisons' }]}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
