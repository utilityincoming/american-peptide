import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Activity,
  AlertCircle,
  ChevronRight,
  FlaskConical,
  Scale,
  TrendingDown,
  Zap,
} from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title:
    'GLP-1 Peptides — Semaglutide, Tirzepatide & Incretin Agonist Research | AmericanPeptide.com',
  description:
    'Complete research reference for GLP-1 receptor agonists — semaglutide (Ozempic/Wegovy), tirzepatide (Mounjaro/Zepbound), retatrutide, cagrilintide, and the incretin biology behind them. Compare mechanisms, clinical endpoints, and synthesis complexity.',
  alternates: { canonical: `${SITE}/glp-1` },
  keywords: [
    'GLP-1 peptides',
    'semaglutide research',
    'tirzepatide research',
    'GLP-1 receptor agonist',
    'incretin agonists',
    'weight loss peptides research',
    'retatrutide',
    'cagrilintide',
    'semaglutide vs tirzepatide',
    'ozempic research peptide',
    'wegovy compounding',
    'mounjaro peptide',
  ],
  openGraph: {
    title:
      'GLP-1 Peptides — Semaglutide, Tirzepatide & Incretin Agonist Research',
    description:
      'Complete research reference for GLP-1 receptor agonists — semaglutide (Ozempic/Wegovy), tirzepatide (Mounjaro/Zepbound), retatrutide, and the incretin biology behind them.',
    url: `${SITE}/glp-1`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'GLP-1 Peptides Research Guide | AmericanPeptide.com',
    description:
      'Research reference for semaglutide, tirzepatide, retatrutide, and incretin biology — mechanisms, clinical data, and synthesis.',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGONISTS = [
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    brands: 'Ozempic · Wegovy · Rybelsus',
    targets: 'GLP-1R',
    class: 'Mono-agonist',
    fda: true,
    weightLoss: '~15%',
    trial: 'STEP-1',
    halfLife: '~168 h',
    accent: '#2DD4A8',
    highlight: false,
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    brands: 'Mounjaro · Zepbound',
    targets: 'GIP/GLP-1R',
    class: 'Dual-agonist',
    fda: true,
    weightLoss: '~22%',
    trial: 'SURMOUNT-1',
    halfLife: '~120 h',
    accent: '#818CF8',
    highlight: true,
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    brands: 'LY3437943',
    targets: 'GIP/GLP-1R/GcgR',
    class: 'Triple-agonist',
    fda: false,
    weightLoss: '~24%',
    trial: 'Phase 2 (NEJM 2023)',
    halfLife: '~168 h',
    accent: '#F472B6',
    highlight: false,
  },
  {
    slug: 'cagrilintide',
    name: 'Cagrilintide',
    brands: 'CagriSema (combo)',
    targets: 'Amylin / CGRP-R',
    class: 'Amylin analog',
    fda: false,
    weightLoss: '~15–16%',
    trial: 'Phase 2 mono',
    halfLife: '~168 h',
    accent: '#FB923C',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'What is a GLP-1 receptor agonist?',
    a: 'A GLP-1 receptor agonist is a synthetic peptide engineered to mimic and prolong the action of glucagon-like peptide-1 — a gut hormone released after meals. By binding the GLP-1 receptor in the pancreas, brain, and gut, these compounds promote glucose-dependent insulin secretion, slow gastric emptying, and suppress appetite. Fatty-acid acylation and DPP-4-resistant amino-acid substitutions extend half-life from minutes to days or weeks, enabling once-weekly subcutaneous dosing.',
  },
  {
    q: 'What is the difference between semaglutide and tirzepatide?',
    a: 'Semaglutide activates only the GLP-1 receptor (mono-agonism). Tirzepatide simultaneously activates both the GLP-1 and GIP receptors (dual agonism), a mechanism associated with larger body-weight reductions in head-to-head trials. In SURMOUNT-1, tirzepatide achieved up to 22.5% mean body-weight reduction vs approximately 15% for semaglutide 2.4 mg in STEP-1. Clinical tolerability and dosing profiles differ; neither compound is a direct substitute for the other.',
  },
  {
    q: 'What is retatrutide and how does it compare?',
    a: 'Retatrutide (LY3437943) is an investigational triple agonist targeting GIP, GLP-1, and glucagon receptors (GcgR) in a single molecule. Glucagon-receptor agonism adds a thermogenic signal — increased energy expenditure — on top of the incretin axes. A 2023 Phase 2 trial published in NEJM reported approximately 24.2% mean body-weight reduction at 48 weeks on the highest dose — the largest signal reported in any peptide trial class at that time. Retatrutide has not received FDA approval.',
  },
  {
    q: 'Are these peptides legal to research?',
    a: 'FDA-approved compounds (semaglutide, tirzepatide) are approved prescription medications with defined regulatory pathways. Investigational compounds (retatrutide, cagrilintide) remain in clinical trials. This platform is a research reference for scientists, researchers, formulators, and educators studying the mechanisms and evidence base of these compounds — it is not a medical device and does not constitute treatment, dosing, or purchasing advice.',
  },
  {
    q: 'Why are GLP-1 peptides complex to synthesize?',
    a: 'GLP-1 receptor agonists are long-chain modified peptides (31–39 amino acids) with lipophilic side chains for half-life extension. Each modification adds synthesis steps: solid-phase chain assembly, protection-group chemistry, post-chain fatty-acid acylation, multi-step HPLC purification to pharmaceutical-grade purity, lyophilization, and cold-chain distribution. Impurity profiles in long modified peptides are complex and require orthogonal analytical methods (RP-HPLC, SEC, MS) to characterize fully — which is why certificate-of-analysis documentation is the minimum bar for any research-grade material.',
  },
  {
    q: 'Where can I track GLP-1 clinical trials in real time?',
    a: 'The ClinicalPulse tool on this platform searches ClinicalTrials.gov in real time for trials involving GLP-1 agonists, amylin analogs, and related metabolic peptides. Filter by phase, recruiting status, and compound name to track the latest completed and active studies.',
  },
  {
    q: 'What is the incretin axis?',
    a: 'The incretin axis refers to the coordinated signaling of gut-derived hormones — primarily GLP-1 (glucagon-like peptide-1) and GIP (glucose-dependent insulinotropic polypeptide) — that amplify insulin secretion in response to nutrient ingestion. Together they account for roughly 50–70% of postprandial insulin release. Both are rapidly degraded by DPP-4; engineered resistance to this degradation is the defining pharmaceutical chemistry challenge that modern incretin agonists solve.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GLP1Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'GLP-1 Receptor Agonists: Mechanisms, Comparisons, and Research Guide',
    description:
      'Complete research reference for GLP-1 receptor agonists — semaglutide, tirzepatide, retatrutide, cagrilintide, and the incretin biology behind them.',
    url: `${SITE}/glp-1`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: AGONISTS.map((a) => ({ '@type': 'Drug', name: a.name })),
    audience: { '@type': 'Audience', audienceType: 'Researchers, Healthcare Professionals' },
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'GLP-1 Peptides',
        item: `${SITE}/glp-1`,
      },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/"
          className="text-sm text-white/35 transition-colors hover:text-white"
        >
          Home
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">GLP-1 Peptides</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
            <Activity className="h-3 w-3" />
            Research reference · 4 compounds
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            GLP-1 &amp; Incretin Peptide
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              Research Guide
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Mechanism-first reference for the incretin agonist class —
            semaglutide, tirzepatide, retatrutide, and beyond. Clinical data,
            synthesis complexity, and the biology behind the headline numbers.
          </p>
          <p className="mt-3 text-xs text-white/30">
            Research reference only. Not medical advice, dosing guidance, or an
            offer for sale.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* ── Main Column ── */}
          <div className="space-y-16">

            {/* The Incretin Axis */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                The Incretin Axis
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/65">
                <p>
                  GLP-1 (glucagon-like peptide-1) and GIP
                  (glucose-dependent insulinotropic polypeptide) are gut-derived
                  hormones released within minutes of nutrient ingestion.
                  Together they account for roughly 50–70% of postprandial
                  insulin release — the &ldquo;incretin effect.&rdquo; Both are rapidly
                  degraded by DPP-4 (dipeptidyl peptidase-4), with half-lives
                  under two minutes in their native form.
                </p>
                <p>
                  The defining pharmaceutical chemistry challenge for this class
                  has been converting these transient meal signals into
                  durable, once-weekly pharmacological agents. The solutions —
                  C-18 fatty-diacid acylation on a mini-PEG linker
                  (semaglutide), GIP/GLP-1 chimeric sequence design
                  (tirzepatide), and triple receptor agonism with glucagon
                  co-activation (retatrutide) — represent successive generations
                  of incretin engineering.
                </p>
                <p>
                  Beyond glycemic control, incretin receptors in the
                  hypothalamus and brainstem govern satiety and energy balance.
                  This central mechanism is why the class produces
                  substantial, dose-dependent body-weight reduction even in
                  non-diabetic subjects — a finding that reshaped obesity
                  pharmacology entirely.
                </p>
              </div>
            </section>

            {/* Agonism Hierarchy */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                The Agonism Hierarchy
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Mono-agonism',
                    icon: <Zap className="h-4 w-4" />,
                    color: '#2DD4A8',
                    drugs: 'Semaglutide, liraglutide',
                    desc: 'GLP-1R only. Benchmark for glucose control, satiety, and weight reduction.',
                  },
                  {
                    label: 'Dual-agonism',
                    icon: <Scale className="h-4 w-4" />,
                    color: '#818CF8',
                    drugs: 'Tirzepatide',
                    desc: 'GLP-1R + GIP-R. Complementary insulinotropic and adipose-tissue pathways — superior weight endpoints vs mono in head-to-head data.',
                  },
                  {
                    label: 'Triple-agonism',
                    icon: <TrendingDown className="h-4 w-4" />,
                    color: '#F472B6',
                    drugs: 'Retatrutide',
                    desc: 'GLP-1R + GIP-R + GcgR. Adds thermogenic glucagon activity — the steepest weight-loss signal reported in any class to date.',
                  },
                ].map((tier) => (
                  <div
                    key={tier.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
                    style={{ borderTopColor: tier.color, borderTopWidth: 2 }}
                  >
                    <div
                      className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${tier.color}18`,
                        color: tier.color,
                      }}
                    >
                      {tier.icon}
                    </div>
                    <p
                      className="mb-1 text-sm font-semibold"
                      style={{ color: tier.color }}
                    >
                      {tier.label}
                    </p>
                    <p className="mb-2 text-xs text-white/40">{tier.drugs}</p>
                    <p className="text-xs leading-relaxed text-white/55">
                      {tier.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Comparison Table */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Compound comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-white/35">
                      <th className="pb-3 pr-4 font-medium">Compound</th>
                      <th className="pb-3 pr-4 font-medium">Targets</th>
                      <th className="pb-3 pr-4 font-medium">Class</th>
                      <th className="pb-3 pr-4 font-medium">FDA</th>
                      <th className="pb-3 pr-4 font-medium">Peak weight↓</th>
                      <th className="pb-3 font-medium">t½</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {AGONISTS.map((a) => (
                      <tr
                        key={a.slug}
                        className={
                          a.highlight
                            ? 'bg-[#818CF8]/[0.04]'
                            : 'hover:bg-white/[0.02]'
                        }
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/catalog/${a.slug}`}
                            className="group flex flex-col"
                          >
                            <span
                              className="font-medium transition-colors group-hover:text-[#2DD4A8]"
                              style={{ color: a.accent }}
                            >
                              {a.name}
                            </span>
                            <span className="text-xs text-white/30">
                              {a.brands}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-white/60">
                          {a.targets}
                        </td>
                        <td className="py-3 pr-4 text-xs text-white/55">
                          {a.class}
                        </td>
                        <td className="py-3 pr-4">
                          {a.fda ? (
                            <span className="rounded-full bg-[#2DD4A8]/10 px-2 py-0.5 text-[10px] font-medium text-[#2DD4A8]">
                              Approved
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40">
                              Inv.
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-sm font-semibold text-white/80">
                          {a.weightLoss}
                        </td>
                        <td className="py-3 text-xs text-white/50">{a.halfLife}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-white/30">
                Weight-reduction figures are primary endpoint means from
                pivotal trials; individual responses vary. Not a basis for
                clinical decisions.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/compare/semaglutide-vs-tirzepatide"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                >
                  Semaglutide vs Tirzepatide
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/compare/retatrutide-vs-tirzepatide"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                >
                  Retatrutide vs Tirzepatide
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>

            {/* Synthesis Complexity */}
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                Synthesis complexity
              </h2>
              <p className="mb-6 text-xs text-white/30">
                Why research-grade purity is difficult and expensive to achieve
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-white/65">
                <p>
                  GLP-1 agonists are among the most chemically complex
                  peptides in commercial-scale production. Semaglutide&rsquo;s
                  31-residue chain carries a C-18 fatty-diacid on a
                  mini-PEG/γGlu linker — manufactured via solid-phase
                  peptide synthesis (SPPS) followed by solution-phase
                  acylation. Tirzepatide is a 39-residue chimeric sequence
                  derived from native GIP with GLP-1-like modifications;
                  retatrutide adds glucagon-receptor pharmacophore elements to
                  a 39-mer backbone.
                </p>
                <p>
                  Each added axis multiplies potential impurity species.
                  Deletion sequences, racemization at sensitive residues, and
                  incomplete acylation are the primary process-related
                  impurities. Orthogonal analytical methods — reversed-phase
                  HPLC for sequence identity, size-exclusion chromatography
                  for aggregates, and high-resolution mass spectrometry for
                  side-chain integrity — are all required for a credible
                  certificate of analysis.
                </p>
                <Link
                  href="/synthesis"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#2DD4A8]"
                >
                  How research peptides are manufactured
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <p className="mb-2 text-sm font-semibold text-white/90">
                      {faq.q}
                    </p>
                    <p className="text-sm leading-relaxed text-white/55">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <div className="text-xs leading-relaxed text-white/45">
                <strong className="text-white/60">Research reference only.</strong>{' '}
                This page is computational and educational content produced by
                AmericanPeptide.com. It does not constitute medical advice,
                treatment recommendations, prescribing guidance, or an offer
                for sale of any compound. All clinical data citations are
                provided for informational purposes; individual outcomes vary.
                Consult a licensed medical professional for any health-related
                decisions.
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Catalog links */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Catalog entries
              </p>
              <div className="space-y-2">
                {AGONISTS.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/catalog/${a.slug}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div>
                      <p
                        className="text-sm font-medium transition-colors group-hover:text-[#2DD4A8]"
                        style={{ color: a.accent }}
                      >
                        {a.name}
                      </p>
                      <p className="text-xs text-white/30">{a.class}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-white/25 transition-colors group-hover:text-[#2DD4A8]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Related pages */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Related resources
              </p>
              <div className="space-y-2">
                {[
                  {
                    href: '/research-areas/weight-loss',
                    label: 'Weight Loss & Metabolic Health',
                    sub: 'Research area guide',
                  },
                  {
                    href: '/catalog/category/metabolic',
                    label: 'Metabolic Peptides',
                    sub: 'Full category',
                  },
                  {
                    href: '/trials',
                    label: 'GLP-1 Clinical Trials',
                    sub: 'Search ClinicalTrials.gov',
                  },
                  {
                    href: '/glossary/glp-1',
                    label: 'GLP-1 Definition',
                    sub: 'Glossary entry',
                  },
                  {
                    href: '/synthesis',
                    label: 'Synthesis & Manufacturing',
                    sub: 'How peptides are made',
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white/70 transition-colors group-hover:text-white">
                        {link.label}
                      </p>
                      <p className="text-xs text-white/30">{link.sub}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-colors group-hover:text-white/50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Marketplace waitlist CTA */}
            <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
                <FlaskConical className="h-4 w-4 text-[#2DD4A8]" />
              </div>
              <p className="mb-1 text-sm font-semibold text-[#2DD4A8]">
                Marketplace coming soon
              </p>
              <p className="mb-4 text-xs leading-relaxed text-white/45">
                Vetted suppliers, COA-backed material, transparent pricing.
                Be first when the GLP-1 research marketplace opens.
              </p>
              <Link
                href="/catalog"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Research agent CTA */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="mb-1 text-sm font-semibold text-white/80">
                Ask the Peptide Agent
              </p>
              <p className="mb-4 text-xs leading-relaxed text-white/40">
                Get citation-backed answers about GLP-1 mechanisms, trial
                data, and synthesis — powered by PubMed, PubChem, and
                ClinicalTrials.gov.
              </p>
              <Link
                href="/research"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                Open Peptide Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
