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
import SourcingCard from '@/components/SourcingCard'
import HeadToHeadGrid from '@/components/HeadToHeadGrid'
import CompoundingStatus from '@/components/CompoundingStatus'
import { getVendorsForPeptide } from '@/lib/vendors'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title:
    'GLP-1 Peptides — Semaglutide, Tirzepatide & Incretin Agonist Research | AmericanPeptide.com',
  description:
    'Research reference for GLP-1 receptor agonists — semaglutide (Ozempic/Wegovy), tirzepatide (Mounjaro/Zepbound), retatrutide, and the incretin biology.',
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
    weightLoss: '~28%',
    trial: 'TRIUMPH-1 (Phase 3)',
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
  {
    slug: 'cagrisema',
    name: 'CagriSema',
    brands: 'Cagrilintide + semaglutide',
    targets: 'Amylin + GLP-1R',
    class: 'Fixed-dose combination',
    fda: false,
    weightLoss: '~20%',
    trial: 'REDEFINE 1',
    halfLife: '~168 h',
    accent: '#FB923C',
    highlight: false,
  },
  {
    slug: 'survodutide',
    name: 'Survodutide',
    brands: 'BI 456906',
    targets: 'GcgR/GLP-1R',
    class: 'Dual-agonist',
    fda: false,
    weightLoss: 'MASH-led',
    trial: 'Phase 2 MASH (NEJM 2024)',
    halfLife: '~168 h',
    accent: '#F472B6',
    highlight: false,
  },
  {
    slug: 'mazdutide',
    name: 'Mazdutide',
    brands: 'IBI362 · LY3305677',
    targets: 'GcgR/GLP-1R',
    class: 'Dual-agonist',
    fda: false,
    weightLoss: '~15%',
    trial: 'GLORY-1',
    halfLife: '~168 h',
    accent: '#818CF8',
    highlight: false,
  },
  {
    slug: 'liraglutide',
    name: 'Liraglutide',
    brands: 'Victoza · Saxenda',
    targets: 'GLP-1R',
    class: 'Mono-agonist',
    fda: true,
    weightLoss: '~6%',
    trial: 'STEP 8',
    halfLife: '~13 h',
    accent: '#2DD4A8',
    highlight: false,
  },
]

// TRIUMPH-1 (Phase 3, n=2,339, 80 weeks) as reported under both pre-declared
// estimands. Kept as one table so the two columns can never drift apart — the
// mistake this section exists to teach readers to spot.
const ESTIMAND_ROWS = [
  { arm: 'Retatrutide 12 mg', efficacy: '−28.3%', regimen: '−25.0%' },
  { arm: 'Retatrutide 9 mg', efficacy: '−25.9%', regimen: '−23.7%' },
  { arm: 'Retatrutide 4 mg', efficacy: '−19.0%', regimen: '−17.6%' },
  { arm: 'Placebo', efficacy: '−2.2%', regimen: '−3.9%' },
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
    q: 'Why do two sources quote different weight-loss numbers for the same trial?',
    a: 'Because modern obesity trials report more than one estimand — the pre-declared rule for how to count participants who stop the drug or start something else. In retatrutide’s Phase 3 TRIUMPH-1 trial, the 12 mg arm reduced mean body weight by 28.3% under the efficacy estimand and 25.0% under the treatment-regimen estimand, over 80 weeks in 2,339 adults. The efficacy estimand describes people who stayed on treatment as assigned; the treatment-regimen estimand keeps everyone randomised regardless of what they did next. Both are legitimate. A figure quoted without saying which one it is cannot be compared to anything.',
  },
  {
    q: 'Has retatrutide reported Phase 3 results?',
    a: 'Yes. TRIUMPH-1 randomised 2,339 adults with obesity, or overweight with a weight-related comorbidity and without diabetes, to once-weekly retatrutide at 4 mg, 9 mg or 12 mg or to placebo over 80 weeks. Mean body-weight reduction at 12 mg was 28.3% under the efficacy estimand against 2.2% for placebo. A subset with a baseline BMI of 35 or above continued to 104 weeks and reached about 30%. Retatrutide remains investigational and is not FDA-approved.',
  },
  {
    q: 'How does CagriSema compare with tirzepatide head-to-head?',
    a: 'REDEFINE 4 is the direct comparison — an open-label randomised trial of 809 adults with obesity and comorbidities over 84 weeks. CagriSema reduced mean body weight by 23.0% against 25.5% for tirzepatide, and did not meet its primary endpoint of non-inferiority. Under the treatment-regimen estimand the figures were 20.2% and 23.6%. CagriSema is not FDA-approved; Novo Nordisk submitted a New Drug Application in December 2025.',
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
    <div className="min-h-screen bg-surface text-ink">
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
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link
          href="/"
          className="text-sm text-ink/35 transition-colors hover:text-ink"
        >
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">GLP-1 Peptides</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <Activity className="h-3 w-3" />
            Research reference · 8 compounds
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            GLP-1 &amp; Incretin Peptide
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              Research Guide
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Mechanism-first reference for the incretin agonist class —
            semaglutide, tirzepatide, retatrutide, and beyond. Clinical data,
            synthesis complexity, and the biology behind the headline numbers.
          </p>
          <p className="mt-3 text-xs text-ink/30">
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
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                The Incretin Axis
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
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
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
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
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5"
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
                    <p className="mb-2 text-xs text-ink/40">{tier.drugs}</p>
                    <p className="text-xs leading-relaxed text-ink/55">
                      {tier.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Comparison Table */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Compound comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-xs text-ink/35">
                      <th className="pb-3 pr-4 font-medium">Compound</th>
                      <th className="pb-3 pr-4 font-medium">Targets</th>
                      <th className="pb-3 pr-4 font-medium">Class</th>
                      <th className="pb-3 pr-4 font-medium">FDA</th>
                      <th className="pb-3 pr-4 font-medium">Peak weight↓</th>
                      <th className="pb-3 font-medium">t½</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {AGONISTS.map((a) => (
                      <tr
                        key={a.slug}
                        className={
                          a.highlight
                            ? 'bg-[#818CF8]/[0.04]'
                            : 'hover:bg-ink/[0.02]'
                        }
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/catalog/${a.slug}`}
                            className="group flex flex-col"
                          >
                            <span
                              className="font-medium transition-colors group-hover:text-accent"
                              style={{ color: a.accent }}
                            >
                              {a.name}
                            </span>
                            <span className="text-xs text-ink/30">
                              {a.brands}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-ink/60">
                          {a.targets}
                        </td>
                        <td className="py-3 pr-4 text-xs text-ink/55">
                          {a.class}
                        </td>
                        <td className="py-3 pr-4">
                          {a.fda ? (
                            <span className="rounded-full bg-[#2DD4A8]/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                              Approved
                            </span>
                          ) : (
                            <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium text-ink/40">
                              Inv.
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-sm font-semibold text-ink/80">
                          {a.weightLoss}
                        </td>
                        <td className="py-3 text-xs text-ink/50">{a.halfLife}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink/30">
                Weight-reduction figures are primary endpoint means from
                pivotal trials; individual responses vary. Not a basis for
                clinical decisions.
              </p>
            </section>

            {/* How to read the headline number */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                How to read a weight-loss number
              </h2>
              <p className="mb-5 text-xs text-ink/30">
                The same trial reports more than one figure, and the gap between
                them is not a rounding error
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
                <p>
                  Every percentage in the table above is a mean from a specific
                  trial under a specific estimand — the pre-declared rule for
                  what counts as an outcome when participants stop taking the
                  drug, miss doses, or start something else. Modern obesity
                  trials report at least two, and the difference between them is
                  usually three to four percentage points.
                </p>
                <p>
                  Retatrutide&rsquo;s Phase 3 TRIUMPH-1 trial is the clearest
                  worked example. Across 2,339 adults with obesity or overweight
                  without diabetes, randomised to 4 mg, 9 mg, 12 mg, or placebo
                  over 80 weeks, the two estimands report the same study
                  differently.
                </p>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-xs text-ink/35">
                      <th className="pb-3 pr-4 font-medium">
                        TRIUMPH-1, 80 weeks
                      </th>
                      <th className="pb-3 pr-4 font-medium">Efficacy estimand</th>
                      <th className="pb-3 font-medium">Treatment-regimen estimand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {ESTIMAND_ROWS.map((row) => (
                      <tr key={row.arm} className="hover:bg-ink/[0.02]">
                        <td className="py-3 pr-4 text-xs font-medium text-ink/50">
                          {row.arm}
                        </td>
                        <td className="py-3 pr-4 text-sm font-semibold tabular-nums text-ink/80">
                          {row.efficacy}
                        </td>
                        <td className="py-3 text-sm tabular-nums text-ink/60">
                          {row.regimen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
                <p>
                  The efficacy estimand answers what happens to people who stay
                  on the drug as assigned. The treatment-regimen estimand keeps
                  everyone who was randomised, whatever they went on to do. The
                  first number is the pharmacology; the second is closer to what
                  a population actually experiences. Neither is dishonest, and a
                  headline that quotes one without saying which is.
                </p>
                <p>
                  This is why cross-trial comparison is so slippery. Two
                  compounds can look separated by four points purely because one
                  press release quoted its efficacy estimand and the other did
                  not. Where a real head-to-head exists, it settles the question
                  properly: in REDEFINE 4, an open-label trial of 809 adults over
                  84 weeks, CagriSema reached 23.0% against tirzepatide&rsquo;s
                  25.5%, and missed its non-inferiority endpoint. That is a
                  different kind of evidence from two separate trials placed side
                  by side.
                </p>
                <Link
                  href="/methodology"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent"
                >
                  How we tier the evidence behind these claims
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            <CompoundingStatus
              slugs={['semaglutide', 'tirzepatide', 'liraglutide', 'retatrutide']}
              intro="The incretin agonists reached the compounding question by a different road than the research peptides. These are approved drugs, so the bulks list never applied to them. What applied instead is the rule against compounding an essentially-identical copy of a commercially available product — a rule suspended while a drug is in shortage, and reinstated when the shortage ends. That is what closed the compounded-GLP-1 era in 2025, and it is why a compounded version is not simply a cheaper equivalent."
            />

            <HeadToHeadGrid
              slugs={AGONISTS.map((a) => a.slug)}
              blurb="Every side-by-side page covering a compound on this hub"
            />

            {/* Synthesis Complexity */}
            <section>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Synthesis complexity
              </h2>
              <p className="mb-6 text-xs text-ink/30">
                Why research-grade purity is difficult and expensive to achieve
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
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
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent"
                >
                  How research peptides are manufactured
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5"
                  >
                    <p className="mb-2 text-sm font-semibold text-ink/90">
                      {faq.q}
                    </p>
                    <p className="text-sm leading-relaxed text-ink/55">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <div className="text-xs leading-relaxed text-ink/45">
                <strong className="text-ink/60">Research reference only.</strong>{' '}
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
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Catalog entries
              </p>
              <div className="space-y-2">
                {AGONISTS.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/catalog/${a.slug}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                  >
                    <div>
                      <p
                        className="text-sm font-medium transition-colors group-hover:text-accent"
                        style={{ color: a.accent }}
                      >
                        {a.name}
                      </p>
                      <p className="text-xs text-ink/30">{a.class}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-ink/25 transition-colors group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Related pages */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
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
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">
                        {link.label}
                      </p>
                      <p className="text-xs text-ink/30">{link.sub}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-ink/20 transition-colors group-hover:text-ink/50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Where to source — trust-ranked, same as the catalog. Falls back to
                the placeholder on the Play (TWA) build, where getVendorsForPeptide
                returns [] and no outbound vendor links are rendered. */}
            {(() => {
              const sources = getVendorsForPeptide('semaglutide')
              return sources.length ? (
                <SourcingCard
                  slugs={['semaglutide', 'tirzepatide', 'retatrutide', 'cagrilintide']}
                />
              ) : (
                <MarketplaceComingSoon />
              )
            })()}

            {/* Companion placement — the muscle-preservation frontier.
                GLP-1 vendors are handled above; this surfaces the GH-axis and
                metabolic compounds studied for holding lean mass through rapid
                weight loss. These slugs are deliberately NOT GLP-1s — the
                featured partner (ABSIM) carries this recovery stack, not the
                incretins, so it can only ever be featured here, never dressed up
                as a GLP-1 source. Research framing, not a protocol. */}
            {(() => {
              const companionSlugs = [
                'ipamorelin',
                'cjc-1295-no-dac',
                'tesamorelin',
                'mots-c',
              ]
              const hasCompanions = companionSlugs.some(
                (s) => getVendorsForPeptide(s).length > 0,
              )
              if (!hasCompanions) return null
              return (
                <div className="space-y-3">
                  <div className="px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2DD4A8]">
                      The muscle-preservation frontier
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-ink/90">
                      Holding lean mass through the drop
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink/50">
                      Rapid GLP-1 weight loss sheds fat and lean tissue alike —
                      trials put the muscle fraction as high as a quarter of total
                      loss. The GH-axis and metabolic peptides below are where the
                      research is looking to bias that ratio back toward fat.
                      Reference only — not a protocol, dosing guidance, or medical
                      advice.
                    </p>
                  </div>
                  <SourcingCard slugs={companionSlugs} />
                </div>
              )
            })()}

            {/* Research agent CTA */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5">
              <p className="mb-1 text-sm font-semibold text-ink/80">
                Ask the Peptide Agent
              </p>
              <p className="mb-4 text-xs leading-relaxed text-ink/40">
                Get citation-backed answers about GLP-1 mechanisms, trial
                data, and synthesis — powered by PubMed, PubChem, and
                ClinicalTrials.gov.
              </p>
              <Link
                href="/research"
                className="flex items-center justify-center gap-2 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/20 hover:text-ink"
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

// Fallback on the Play (TWA) build, where the vendor helpers return nothing and
// no affiliate UI is rendered. Mirrors the catalog detail page's "Reference
// edition" fallback: this build is reference-only, and we deliberately do NOT
// tease a marketplace product that isn't live — sourcing on the web is the
// trust-ranked vendor directory, not a first-party store.
function MarketplaceComingSoon() {
  return (
    <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
        <FlaskConical className="h-4 w-4 text-accent" />
      </div>
      <p className="mb-1 text-sm font-semibold text-accent">
        Reference edition
      </p>
      <p className="mb-4 text-xs leading-relaxed text-ink/45">
        This edition is a research reference only — no supplier listings or
        pricing. AmericanPeptide never sells peptides; sourcing is handled on the
        web through an independently trust-ranked vendor directory.
      </p>
      <Link
        href="/catalog"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
      >
        Browse catalog
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
