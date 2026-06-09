import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ChevronRight, FlaskConical } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title:
    'Semaglutide vs Tirzepatide — Mechanism, Trials & Clinical Differences | AmericanPeptide.com',
  description:
    'Research comparison of semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound) — mechanism differences (GLP-1R mono vs GIP/GLP-1R dual agonism), head-to-head trial data, synthesis complexity, and the case for retatrutide.',
  alternates: { canonical: `${SITE}/semaglutide-vs-tirzepatide` },
  keywords: [
    'semaglutide vs tirzepatide',
    'ozempic vs mounjaro',
    'wegovy vs zepbound',
    'semaglutide tirzepatide difference',
    'GLP-1 vs dual agonist',
    'tirzepatide better than semaglutide',
    'SURMOUNT-5 results',
    'incretin comparison',
  ],
  openGraph: {
    title: 'Semaglutide vs Tirzepatide — Mechanism, Trials & Key Differences',
    description:
      'Research comparison of semaglutide and tirzepatide — mechanism, head-to-head trial data, synthesis complexity, and what comes next.',
    url: `${SITE}/semaglutide-vs-tirzepatide`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Semaglutide vs Tirzepatide Research Comparison | AmericanPeptide.com',
    description:
      'Mechanism, trial data, and synthesis differences between semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound).',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HEAD_TO_HEAD = [
  { dim: 'Generic name', sema: 'Semaglutide', tirz: 'Tirzepatide' },
  { dim: 'Brand names', sema: 'Ozempic · Wegovy · Rybelsus', tirz: 'Mounjaro · Zepbound' },
  { dim: 'Developer', sema: 'Novo Nordisk', tirz: 'Eli Lilly' },
  { dim: 'Receptor targets', sema: 'GLP-1R only', tirz: 'GIP-R + GLP-1R' },
  { dim: 'Agonism class', sema: 'Mono-agonist', tirz: 'Dual-agonist ("twincretin")' },
  { dim: 'Chain length', sema: '31 amino acids', tirz: '39 amino acids' },
  { dim: 'Half-life', sema: '~168 h (once-weekly)', tirz: '~120 h (once-weekly)' },
  { dim: 'Approved: T2D', sema: 'Yes (2017, Ozempic)', tirz: 'Yes (2022, Mounjaro)' },
  { dim: 'Approved: obesity', sema: 'Yes (2021, Wegovy)', tirz: 'Yes (2023, Zepbound)' },
  { dim: 'Peak weight ↓ (pivotal trial)', sema: '~15% (STEP-1, sema 2.4 mg)', tirz: '~22% (SURMOUNT-1, tirz 15 mg)' },
  { dim: 'Head-to-head weight ↓', sema: '~13% (SURMOUNT-5)', tirz: '~21% (SURMOUNT-5)' },
  { dim: 'CV outcome trial', sema: 'SELECT (MACE reduction confirmed)', tirz: 'SURPASS-CVOT (non-inferior vs sema)' },
]

const MECHANISMS = [
  {
    title: 'GLP-1R agonism (shared)',
    color: '#2DD4A8',
    points: [
      'Glucose-dependent insulin secretion from pancreatic β-cells',
      'Glucagon suppression from α-cells',
      'Slowed gastric emptying → prolonged satiety',
      'Hypothalamic appetite suppression via GLP-1 receptors in the CNS',
    ],
  },
  {
    title: 'GIP-R agonism (tirzepatide only)',
    color: '#818CF8',
    points: [
      'Complementary insulinotropic signal through GIPR in pancreas',
      'Adipose-tissue signaling via GIPR — studied for improved lipid handling',
      'CNS GIP receptors reported to contribute to satiety in rodent work',
      'The additive effect of dual-receptor engagement is the proposed basis for superior weight-loss endpoints',
    ],
  },
]

const TRIALS = [
  {
    name: 'STEP-1',
    drug: 'Semaglutide 2.4 mg',
    n: '1961',
    duration: '68 weeks',
    endpoint: 'Mean body-weight change',
    result: '−14.9% vs −2.4% (placebo)',
    note: 'Pivotal obesity trial for Wegovy',
    color: '#2DD4A8',
  },
  {
    name: 'SURMOUNT-1',
    drug: 'Tirzepatide 15 mg',
    n: '2539',
    duration: '72 weeks',
    endpoint: 'Mean body-weight change',
    result: '−22.5% vs −2.4% (placebo)',
    note: 'Pivotal obesity trial for Zepbound',
    color: '#818CF8',
  },
  {
    name: 'SURMOUNT-5',
    drug: 'Tirz 15 mg vs Sema 2.4 mg',
    n: '~750',
    duration: '72 weeks',
    endpoint: 'Head-to-head weight change',
    result: '~21% (tirz) vs ~13% (sema)',
    note: 'Direct head-to-head; tirzepatide superior on primary endpoint',
    color: '#F472B6',
  },
  {
    name: 'SELECT',
    drug: 'Semaglutide 2.4 mg',
    n: '17604',
    duration: '~5 years',
    endpoint: 'MACE (CV outcome)',
    result: '20% MACE reduction vs placebo',
    note: 'Established CV benefit in obesity without T2D',
    color: '#2DD4A8',
  },
  {
    name: 'SURPASS-CVOT',
    drug: 'Tirzepatide 5/10/15 mg vs Sema 1 mg',
    n: '~14000',
    duration: 'Ongoing / reported ~2024',
    endpoint: 'MACE non-inferiority vs sema 1 mg',
    result: 'Non-inferior; full results pending publication',
    note: 'T2D CV outcome trial; comparator is diabetes-dose sema (not Wegovy dose)',
    color: '#818CF8',
  },
]

const SYNTHESIS = [
  {
    label: 'Chain length',
    sema: '31 AA',
    tirz: '39 AA',
    note: 'More residues = more coupling cycles = more deletion impurities to purify away',
  },
  {
    label: 'Acylation',
    sema: 'C18 fatty-diacid on Lys34 via mini-PEG/γGlu linker',
    tirz: 'C20 fatty-diacid on Lys26 via modified linker',
    note: 'Both require post-chain solution-phase acylation steps',
  },
  {
    label: 'Receptor design',
    sema: 'Native GLP-1 backbone with Aib substitutions',
    tirz: 'Chimeric GIP/GLP-1 sequence — custom pharmacophore',
    note: 'Tirz sequence is de novo designed; more complex orthogonal analytical work needed',
  },
  {
    label: 'Purity requirement',
    sema: 'Pharma-grade RP-HPLC + SEC + MS',
    tirz: 'Same, plus more complex impurity profile from longer chain',
    note: 'A credible COA is the minimum bar for any research-grade material of either compound',
  },
]

const FAQS = [
  {
    q: 'What is the main difference between semaglutide and tirzepatide?',
    a: 'Semaglutide activates only the GLP-1 receptor (mono-agonism). Tirzepatide simultaneously activates both the GIP and GLP-1 receptors (dual agonism). This additional GIP-receptor engagement is associated with larger body-weight reductions in both placebo-controlled and direct head-to-head trials.',
  },
  {
    q: 'Which produces more weight loss — semaglutide or tirzepatide?',
    a: 'In the SURMOUNT-5 direct head-to-head trial, tirzepatide 15 mg achieved approximately 21% mean body-weight reduction vs approximately 13% for semaglutide 2.4 mg over 72 weeks. The difference was statistically significant on the primary endpoint. Pivotal trials of each compound individually reported similar hierarchies: SURMOUNT-1 (tirzepatide, ~22.5%) vs STEP-1 (semaglutide, ~15%). Individual responses vary, and these are population means — not predictions for any individual.',
  },
  {
    q: 'Are Ozempic and Mounjaro the same as Wegovy and Zepbound?',
    a: 'Ozempic and Wegovy are both semaglutide but at different doses: Ozempic (≤2 mg) is approved for type 2 diabetes; Wegovy (2.4 mg) is approved for chronic weight management. Similarly, Mounjaro (≤15 mg) is tirzepatide for type 2 diabetes and Zepbound (≤15 mg) is tirzepatide for weight management. The active compound is the same in each pair; dose, labeling, and FDA indication differ.',
  },
  {
    q: 'Is tirzepatide FDA approved?',
    a: 'Yes. Tirzepatide is approved by the FDA as Mounjaro for type 2 diabetes (2022) and as Zepbound for chronic weight management (2023). Both are prescription-only medications.',
  },
  {
    q: 'What does GIP add to GLP-1 agonism?',
    a: 'GIP (glucose-dependent insulinotropic polypeptide) provides a complementary insulinotropic signal through GIPR receptors in the pancreas and potentially an adipose-tissue signal through peripheral GIPR. In tirzepatide, co-activation of both receptor types is hypothesized to produce synergistic satiety and metabolic effects that exceed GLP-1 agonism alone — supported by the magnitude of weight loss in trials.',
  },
  {
    q: 'How does retatrutide compare to both?',
    a: 'Retatrutide (LY3437943) adds glucagon-receptor (GcgR) agonism to the GIP/GLP-1 dual mechanism — making it a triple agonist. In Phase 2 trials, it reported approximately 24% mean body-weight reduction at the highest dose, exceeding both semaglutide and tirzepatide data. It remains investigational and has not received FDA approval.',
  },
  {
    q: 'Which compound is harder to synthesize?',
    a: 'Tirzepatide is the more demanding synthesis — its 39-residue chimeric sequence is longer than semaglutide\'s 31 residues, and the custom dual-receptor pharmacophore requires more complex analytical characterization. Both compounds require post-chain acylation, RP-HPLC purification, and mass-spectrometry identity confirmation. A credible certificate of analysis is essential for any research-grade material of either.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SemaVsTirzPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline:
      'Semaglutide vs Tirzepatide: Mechanism, Clinical Trial Data, and Key Differences',
    description:
      'Research comparison of semaglutide and tirzepatide — mechanism differences, head-to-head trial evidence (SURMOUNT-5), synthesis complexity, and next-generation context.',
    url: `${SITE}/semaglutide-vs-tirzepatide`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: [
      { '@type': 'Drug', name: 'Semaglutide', alternateName: 'Ozempic' },
      { '@type': 'Drug', name: 'Tirzepatide', alternateName: 'Mounjaro' },
    ],
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Semaglutide vs Tirzepatide',
        item: `${SITE}/semaglutide-vs-tirzepatide`,
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
      <header className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link href="/glp-1" className="text-sm text-white/35 transition-colors hover:text-white">
          GLP-1 peptides
        </Link>
        <span className="text-white/20">/</span>
        <span className="truncate text-sm font-medium">Semaglutide vs Tirzepatide</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-medium text-[#2DD4A8]">
              Semaglutide · GLP-1R · FDA approved
            </span>
            <span className="text-white/20 self-center">vs</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#818CF8]/25 bg-[#818CF8]/[0.08] px-3 py-1 text-[11px] font-medium text-[#818CF8]">
              Tirzepatide · GIP/GLP-1R · FDA approved
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Semaglutide vs Tirzepatide
            <br />
            <span className="text-2xl font-normal text-white/40 md:text-3xl">
              mechanism, trials, and key differences
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Both are once-weekly incretin agonists approved for type 2 diabetes
            and obesity — but different receptor targets, trial outcomes, and
            synthesis profiles distinguish them. This page covers what the
            research actually shows.
          </p>
          <p className="mt-3 text-xs text-white/30">
            Research reference only. Not medical advice, prescribing guidance, or a product recommendation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* ── Main Column ── */}
          <div className="space-y-16">

            {/* Quick-reference table */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">
                At a glance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs">
                      <th className="pb-3 pr-6 font-medium text-white/30 w-40">Dimension</th>
                      <th className="pb-3 pr-6 font-medium text-[#2DD4A8]">Semaglutide</th>
                      <th className="pb-3 font-medium text-[#818CF8]">Tirzepatide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {HEAD_TO_HEAD.map((row) => (
                      <tr key={row.dim} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-6 text-xs font-medium text-white/35">{row.dim}</td>
                        <td className="py-3 pr-6 text-sm text-white/70">{row.sema}</td>
                        <td className="py-3 text-sm text-white/70">{row.tirz}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mechanism */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Mechanism: what GIP adds to GLP-1
              </h2>
              <p className="mb-6 text-xs text-white/30">
                The mechanism difference is the reason tirzepatide produces greater weight loss
              </p>
              <div className="space-y-4">
                {MECHANISMS.map((mech) => (
                  <div
                    key={mech.title}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                    style={{ borderLeftColor: mech.color, borderLeftWidth: 3 }}
                  >
                    <p className="mb-3 text-sm font-semibold" style={{ color: mech.color }}>
                      {mech.title}
                    </p>
                    <ul className="space-y-1.5">
                      {mech.points.map((point) => (
                        <li key={point} className="flex gap-2 text-xs leading-relaxed text-white/55">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/20" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/40">
                The precise contribution of GIP-R agonism to tirzepatide&rsquo;s weight-loss
                advantage is still being studied. Some analyses suggest GIP receptor
                potentiation of GLP-1 signaling; others point to independent adipose-tissue
                effects. The outcome data — tirzepatide outperforming semaglutide in head-to-head
                trials — is established; the mechanistic explanation remains an active research question.
              </p>
            </section>

            {/* Key trials */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Key trials
              </h2>
              <p className="mb-5 text-xs text-white/30">
                Selected pivotal and head-to-head studies — population means, not individual predictions
              </p>
              <div className="space-y-4">
                {TRIALS.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: t.color }}
                        >
                          {t.name}
                        </span>
                        <span className="ml-2 text-xs text-white/40">{t.drug}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-white/35">
                        <span>n={t.n}</span>
                        <span>{t.duration}</span>
                      </div>
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white/85">{t.result}</p>
                    <p className="text-xs text-white/40">{t.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/30">
                SURMOUNT-5 is the principal direct head-to-head weight-loss comparison;
                SURPASS-CVOT uses a diabetes-dose semaglutide comparator, not the
                2.4 mg weight-management dose, so it is not a head-to-head weight-loss trial.
              </p>
            </section>

            {/* Synthesis */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">
                Synthesis complexity
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-white/35">
                      <th className="pb-3 pr-4 font-medium w-32">Dimension</th>
                      <th className="pb-3 pr-4 font-medium text-[#2DD4A8]">Semaglutide</th>
                      <th className="pb-3 pr-4 font-medium text-[#818CF8]">Tirzepatide</th>
                      <th className="pb-3 font-medium">Why it matters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {SYNTHESIS.map((row) => (
                      <tr key={row.label}>
                        <td className="py-3 pr-4 font-medium text-white/35">{row.label}</td>
                        <td className="py-3 pr-4 text-white/60">{row.sema}</td>
                        <td className="py-3 pr-4 text-white/60">{row.tirz}</td>
                        <td className="py-3 leading-relaxed text-white/40">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                href="/synthesis"
                className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#2DD4A8]"
              >
                How GLP-1 peptides are synthesized and characterized
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </section>

            {/* What comes next */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                What comes next: retatrutide
              </h2>
              <div className="rounded-xl border border-[#F472B6]/20 bg-[#F472B6]/[0.04] p-5">
                <p className="mb-2 text-sm font-semibold text-[#F472B6]">
                  Retatrutide — triple agonist (GIP/GLP-1/GcgR)
                </p>
                <p className="mb-4 text-sm leading-relaxed text-white/55">
                  Adding glucagon-receptor agonism to the GIP/GLP-1 dual mechanism
                  introduces a third signal: thermogenesis and increased energy
                  expenditure via hepatic and peripheral GcgR. In Phase 2 trials,
                  retatrutide reported approximately 24% mean body-weight reduction
                  at 48 weeks — exceeding both semaglutide and tirzepatide data —
                  though it remains investigational and has not received FDA approval.
                </p>
                <Link
                  href="/catalog/retatrutide"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#F472B6]"
                >
                  Retatrutide catalog entry
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">
                Frequently asked questions
              </h2>
              <div className="space-y-5">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <p className="mb-2 text-sm font-semibold text-white/90">{faq.q}</p>
                    <p className="text-sm leading-relaxed text-white/55">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <div className="text-xs leading-relaxed text-white/45">
                <strong className="text-white/60">Research reference only.</strong>{' '}
                This comparison is for educational purposes. Semaglutide and tirzepatide
                are prescription medications; neither should be used without a licensed
                prescriber. Trial data represents population means — individual responses
                vary. This page does not constitute medical advice, prescribing guidance,
                or a product recommendation.
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Catalog entries */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Catalog entries
              </p>
              {[
                { slug: 'semaglutide', label: 'Semaglutide', sub: 'GLP-1R · Ozempic / Wegovy', color: '#2DD4A8' },
                { slug: 'tirzepatide', label: 'Tirzepatide', sub: 'GIP/GLP-1R · Mounjaro / Zepbound', color: '#818CF8' },
                { slug: 'retatrutide', label: 'Retatrutide', sub: 'GIP/GLP-1R/GcgR · investigational', color: '#F472B6' },
                { slug: 'cagrilintide', label: 'Cagrilintide', sub: 'Amylin analog · investigational', color: '#FB923C' },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={`/catalog/${item.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div>
                    <p className="text-sm font-medium transition-colors group-hover:text-[#2DD4A8]"
                       style={{ color: item.color }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-white/30">{item.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-colors group-hover:text-[#2DD4A8]" />
                </Link>
              ))}
            </div>

            {/* Related pages */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Related
              </p>
              {[
                { href: '/glp-1', label: 'GLP-1 Peptides Hub', sub: 'Full incretin reference' },
                { href: '/research-areas/weight-loss', label: 'Weight Loss & Metabolic Health', sub: 'Research area guide' },
                { href: '/catalog/category/metabolic', label: 'Metabolic Peptides', sub: 'Full category' },
                { href: '/trials', label: 'GLP-1 Clinical Trials', sub: 'ClinicalTrials.gov search' },
                { href: '/synthesis', label: 'Synthesis & Manufacturing', sub: 'COA and purity context' },
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
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50" />
                </Link>
              ))}
            </div>

            {/* Marketplace CTA */}
            <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
                <FlaskConical className="h-4 w-4 text-[#2DD4A8]" />
              </div>
              <p className="mb-1 text-sm font-semibold text-[#2DD4A8]">
                Marketplace coming soon
              </p>
              <p className="mb-4 text-xs leading-relaxed text-white/45">
                COA-verified GLP-1 research peptides. Be first when the
                metabolic peptide marketplace opens.
              </p>
              <Link
                href="/catalog"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
