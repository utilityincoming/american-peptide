import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'How to Read Peptide Research — Evidence Hierarchy Guide | AmericanPeptide.com',
  description:
    'A researcher\'s guide to evaluating peptide evidence — the difference between cell culture, animal models, Phase 1–3 trials, and approved drugs. Why "studies show" needs context.',
  alternates: { canonical: `${SITE}/learn/evidence-hierarchy` },
  keywords: [
    'how to read peptide research',
    'peptide evidence hierarchy',
    'clinical trial phases',
    'preclinical vs clinical evidence',
    'how to evaluate peptide studies',
    'research peptide evidence quality',
  ],
  openGraph: {
    title: 'How to Read Peptide Research — Evidence Hierarchy Guide',
    description: 'A structured guide to evaluating peptide evidence quality — from cell culture to approved drug, and what each level actually tells you.',
    url: `${SITE}/learn/evidence-hierarchy`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evidence Hierarchy Guide for Peptide Research | AmericanPeptide.com',
    description: 'Cell culture vs animal models vs Phase 3 trials — what each level of evidence actually means.',
  },
}

const LEVELS = [
  {
    level: '1',
    label: 'In vitro (cell culture)',
    color: '#60A5FA',
    strength: 'Weakest',
    what: 'Experiments on cells or cell lines in a dish — no organism, no pharmacokinetics, no immune system, no tissue context.',
    tells: 'A compound can interact with a receptor or pathway. Necessary for initial mechanism work.',
    misses: 'Whether the compound reaches that receptor in a living organism, at what concentration, and whether the cell line behaves like the tissue of interest.',
    example: 'Most early BPC-157 angiogenesis data is in vitro.',
  },
  {
    level: '2',
    label: 'In vivo — rodent models',
    color: '#34D399',
    strength: 'Moderate (preclinical)',
    what: 'Studies in living animals — usually rats or mice, often using disease models (surgically created tendon injuries, chemically induced colitis, diet-induced obesity).',
    tells: 'A compound can produce measurable effects in a mammalian biological system, with real pharmacokinetics and immune responses.',
    misses: 'Whether the effect translates to humans. Rodent metabolism, immune function, and tissue biology differ meaningfully from human. Disease models are often simplified proxies.',
    example: 'The majority of BPC-157, TB-500, and DSIP evidence is rodent-model work.',
  },
  {
    level: '3',
    label: 'Phase 1 — human safety/PK',
    color: '#FBBF24',
    strength: 'Human safety only',
    what: 'First-in-human trials, typically small (20–100 participants), focused on safety, tolerability, pharmacokinetics, and dose-finding.',
    tells: 'The compound is not acutely toxic at studied doses in humans, and provides PK data (half-life, Cmax, AUC). Does not establish efficacy.',
    misses: 'Whether it works for any indication. Phase 1 is not designed to test efficacy.',
    example: 'Several GH-axis peptides (tesamorelin, CJC-1295) have Phase 1 PK data.',
  },
  {
    level: '4',
    label: 'Phase 2 — signal of efficacy',
    color: '#FB923C',
    strength: 'Indicative (not confirmatory)',
    what: 'Randomized trials in people with the target condition — typically 50–500 participants — testing whether a signal of efficacy exists at a tolerable dose.',
    tells: 'The compound shows a preliminary efficacy signal in the target population. Sufficient to justify a larger trial.',
    misses: 'Definitive confirmation of benefit. Phase 2 trials are often too small to distinguish true effects from chance, and effect sizes may shrink in Phase 3.',
    example: 'Retatrutide\'s 24% weight-loss data is from a Phase 2 trial. Semaglutide has Phase 3 data.',
  },
  {
    level: '5',
    label: 'Phase 3 — confirmatory efficacy',
    color: '#F472B6',
    strength: 'Strong (registration standard)',
    what: 'Large randomized, usually placebo-controlled trials (hundreds to thousands of participants) designed to confirm efficacy and establish safety at scale. The standard for regulatory approval.',
    tells: 'The compound produces a reliable benefit in the studied population at a studied dose, and the safety profile is characterized.',
    misses: 'Real-world heterogeneity (trials select narrow populations). Long-term effects beyond the trial window. Rare adverse events that require post-marketing surveillance.',
    example: 'STEP-1 (semaglutide), SURMOUNT-1 (tirzepatide), SURMOUNT-5 (head-to-head) are Phase 3.',
  },
  {
    level: '6',
    label: 'FDA approval + post-market (Phase 4)',
    color: '#2DD4A8',
    strength: 'Strongest (for approved indication only)',
    what: 'Regulatory approval means the Phase 3 evidence met the FDA standard for safety and efficacy for a specific indication. Post-approval surveillance continues.',
    tells: 'The compound is reliably beneficial for the approved indication in the studied population. Real-world use data accumulates after approval.',
    misses: 'Approval is indication-specific. Using an approved drug off-label (different dose, different population) returns you to lower evidence levels for that new use.',
    example: 'Semaglutide, tirzepatide, tesamorelin are FDA-approved (specific indications). BPC-157 has no human trials.',
  },
]

const CONCEPTS = [
  {
    term: 'Publication bias',
    def: 'Positive results are more likely to be published than negative results. This inflates the apparent success rate of compounds in the literature — especially true for early-stage peptide research.',
  },
  {
    term: 'Effect size vs statistical significance',
    def: 'A result can be statistically significant (p < 0.05) but clinically meaningless if the effect is tiny. Always check the actual magnitude of change, not just whether the p-value is below a threshold.',
  },
  {
    term: 'Single-lab findings',
    def: 'When the majority of evidence for a compound comes from one research group (Epitalon, some BPC-157 mechanisms), treat findings as preliminary until independently replicated.',
  },
  {
    term: 'Disease model vs clinical disease',
    def: 'A surgically severed tendon in a rat is a controlled model — not the same as chronic tendinopathy in a human with varied activity levels, age, and comorbidities. Model-to-clinic translation frequently fails.',
  },
  {
    term: 'Dose and route',
    def: 'A compound that works at one dose or route (e.g., direct injection into a joint) may not work at another (systemic subcutaneous). Evidence from one context does not automatically extend to another.',
  },
]

const FAQS = [
  {
    q: 'What does "preclinical" mean?',
    a: 'Preclinical means the evidence comes from studies in cells or animals — not humans. Preclinical findings are hypothesis-generating: they provide a rationale for studying a compound in humans, but they do not confirm that the effect will occur in human beings at tolerable doses. The translation from preclinical to clinical regularly fails — including for compounds with multiple positive animal studies.',
  },
  {
    q: 'Can I trust a study published in a peer-reviewed journal?',
    a: 'Peer review is a quality filter, not a guarantee. The relevant questions are: what was the study design (in vitro vs in vivo vs randomized human trial)? What was the sample size? Was there a proper control group? Was the result replicated? Who funded the study? A peer-reviewed cell-culture study is still a cell-culture study — the level of evidence is determined by the experimental design, not the journal.',
  },
  {
    q: 'Why do so many peptides have animal data but no human trials?',
    a: 'Human trials are expensive, slow, and require regulatory approval. Animal studies can be conducted quickly and cheaply. For peptides without a clear commercial sponsor (i.e., not under patent), there is limited financial incentive to fund Phase 3 trials. This is why most non-approved research peptides have a rich rodent literature and minimal human data — it reflects funding economics, not a neutral assessment of their potential.',
  },
  {
    q: 'What should I look for in a peptide clinical trial?',
    a: 'Key questions: (1) Was it randomized and placebo-controlled? (2) Was it blinded? (3) How large was the sample? (4) What was the primary endpoint, and was it pre-specified? (5) Was the trial registered on ClinicalTrials.gov before data collection? (6) Did the effect size reach clinical meaningfulness, not just statistical significance? (7) Has it been replicated? The ClinicalPulse tool on this platform links to ClinicalTrials.gov registrations where you can check these directly.',
  },
]

export default function EvidenceHierarchyPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'How to Read Peptide Research: An Evidence Hierarchy Guide',
    description: 'A structured guide to evaluating peptide evidence quality, from cell culture to FDA approval.',
    url: `${SITE}/learn/evidence-hierarchy`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: [
      { '@type': 'Thing', name: 'Clinical trial phases' },
      { '@type': 'Thing', name: 'Evidence-based medicine' },
      { '@type': 'Thing', name: 'Peptide research methodology' },
    ],
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE}/learn` },
      { '@type': 'ListItem', position: 3, name: 'Evidence Hierarchy', item: `${SITE}/learn/evidence-hierarchy` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="flex flex-wrap items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/learn" className="text-sm text-ink/35 hover:text-ink transition-colors">Learn</Link>
        <span className="text-ink/20">/</span>
        <span className="text-sm font-medium truncate">Evidence hierarchy</span>
      </header>

      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-14 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            Learning guide · evidence quality
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            How to read
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              peptide research
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            &ldquo;Studies show&rdquo; is not a single category. A cell-culture result and a
            Phase 3 randomized trial are separated by a decade of work and a high
            failure rate. This guide explains the hierarchy and what each level
            actually justifies claiming.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_260px]">
          <div className="space-y-16">

            {/* Evidence ladder */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">The evidence ladder</h2>
              <p className="mb-8 text-xs text-ink/30">Six levels from weakest to strongest — each answers different questions</p>
              <div className="space-y-px">
                {LEVELS.map((l, i) => (
                  <div key={l.level} className="relative flex gap-4">
                    {/* Connector line */}
                    {i < LEVELS.length - 1 && (
                      <div className="absolute left-4 top-10 h-full w-px bg-ink/[0.06]" />
                    )}
                    {/* Level badge */}
                    <div className="relative mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
                      style={{ borderColor: l.color, color: l.color, backgroundColor: `${l.color}12` }}>
                      {l.level}
                    </div>
                    <div className="mb-8 flex-1 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: l.color }}>{l.label}</p>
                        <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] text-ink/40">{l.strength}</span>
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-ink/55">{l.what}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink/30">What it tells you</p>
                          <p className="text-xs leading-relaxed text-ink/55">{l.tells}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink/30">What it misses</p>
                          <p className="text-xs leading-relaxed text-ink/40">{l.misses}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-ink/30">
                        <span className="font-medium text-ink/40">Example: </span>{l.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Key concepts */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">Five concepts that change how you read a study</h2>
              <div className="space-y-4">
                {CONCEPTS.map((c) => (
                  <div key={c.term} className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5">
                    <p className="mb-1.5 text-sm font-semibold text-ink/85">{c.term}</p>
                    <p className="text-sm leading-relaxed text-ink/55">{c.def}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick reference */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">Quick reference: compounds on this platform by evidence level</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-xs">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-ink/35">
                      <th className="pb-3 pr-6 font-medium">Compound(s)</th>
                      <th className="pb-3 pr-6 font-medium">Highest evidence level</th>
                      <th className="pb-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {[
                      { compounds: 'Semaglutide, Tirzepatide', level: 'Phase 3 + FDA approved', color: '#2DD4A8', note: 'Multiple large RCTs; head-to-head data' },
                      { compounds: 'Tesamorelin', level: 'Phase 3 + FDA approved', color: '#2DD4A8', note: 'Approved for specific HIV-related indication only' },
                      { compounds: 'PT-141 (Bremelanotide)', level: 'Phase 3 + FDA approved', color: '#2DD4A8', note: 'Approved for HSDD in premenopausal women' },
                      { compounds: 'SS-31 / Elamipretide', level: 'Phase 2–3 (investigational)', color: '#FB923C', note: 'Clinical trials in mitochondrial disease; not approved' },
                      { compounds: 'Retatrutide', level: 'Phase 2', color: '#FBBF24', note: 'Phase 2 weight-loss data; Phase 3 ongoing' },
                      { compounds: 'Cagrilintide, CJC-1295', level: 'Phase 1–2', color: '#FBBF24', note: 'Human PK/PD data; limited efficacy trials' },
                      { compounds: 'Semax, Selank', level: 'Clinical (Russia)', color: '#60A5FA', note: 'Approved in Russia; limited independent RCT data' },
                      { compounds: 'BPC-157, TB-500, MOTS-c', level: 'Preclinical only', color: '#94A3B8', note: 'No completed controlled human trials' },
                      { compounds: 'Epitalon, DSIP', level: 'Preclinical (limited)', color: '#94A3B8', note: 'Evidence concentrated or mechanistically incomplete' },
                    ].map((r) => (
                      <tr key={r.compounds}>
                        <td className="py-3 pr-6 font-medium text-ink/70">{r.compounds}</td>
                        <td className="py-3 pr-6">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                            {r.level}
                          </span>
                        </td>
                        <td className="py-3 text-ink/40 leading-relaxed">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">Frequently asked questions</h2>
              <div className="space-y-5">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5">
                    <p className="mb-2 text-sm font-semibold text-ink/90">{f.q}</p>
                    <p className="text-sm leading-relaxed text-ink/55">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Learning guides</p>
              {[
                { href: '/learn', label: 'Learn hub', sub: 'All guides' },
                { href: '/synthesis', label: 'How peptides are made', sub: 'Synthesis & COA' },
                { href: '/learn/compatibility', label: 'Compatibility & Stability', sub: 'Handling guide' },
                { href: '/glossary/clinical-phase', label: 'Clinical Phase definition', sub: 'Glossary entry' },
                { href: '/glossary/fda-approved', label: 'FDA Approved definition', sub: 'Glossary entry' },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-ink/70 group-hover:text-ink">{l.label}</p>
                    <p className="text-xs text-ink/30">{l.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 group-hover:text-ink/50" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Search trials</p>
              <p className="mb-4 text-xs leading-relaxed text-ink/45">
                Check the current evidence base for any compound directly on ClinicalTrials.gov.
              </p>
              <Link href="/trials"
                className="flex items-center justify-center gap-2 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/20 hover:text-ink">
                ClinicalPulse <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Peptide Agent</p>
              <p className="mb-4 text-xs leading-relaxed text-ink/45">
                Ask about evidence quality for a specific compound — backed by PubMed and ClinicalTrials.gov.
              </p>
              <Link href="/research"
                className="flex items-center justify-center gap-2 rounded-lg border border-ink/[0.10] bg-ink/[0.04] px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/20 hover:text-ink">
                Ask the agent <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
