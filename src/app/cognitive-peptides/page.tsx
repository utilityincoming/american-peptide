import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ChevronRight, FlaskConical } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Cognitive & Nootropic Peptides — Research Guide | AmericanPeptide.com',
  description:
    'Research reference for cognitive and nootropic peptides — Semax (BDNF/NGF induction), Selank (anxiolytic, GABAergic), DSIP (sleep/circadian). Mechanisms, evidence quality, and BBB considerations.',
  alternates: { canonical: `${SITE}/cognitive-peptides` },
  keywords: [
    'cognitive peptides',
    'nootropic peptides research',
    'semax research',
    'selank research',
    'DSIP peptide',
    'peptides for cognition',
    'neuroprotective peptides',
    'BDNF peptide',
    'anxiolytic peptide',
  ],
  openGraph: {
    title: 'Cognitive & Nootropic Peptides Research Guide',
    description: 'Semax, Selank, DSIP — mechanisms (BDNF/NGF, GABAergic, circadian), evidence quality, and BBB context.',
    url: `${SITE}/cognitive-peptides`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cognitive & Nootropic Peptides Research Guide | AmericanPeptide.com',
    description: 'Semax, Selank, DSIP — mechanism, evidence quality, and what BBB permeability means for peptide CNS research.',
  },
}

const COMPOUNDS = [
  {
    slug: 'semax',
    name: 'Semax',
    origin: 'Synthetic ACTH(4–10) analog · Russia',
    mechanism: 'BDNF / NGF upregulation; melanocortin signaling without HPA activation',
    areas: ['Ischemic stroke recovery', 'Cognition', 'Neuroprotection'],
    evidence: 'Clinical (Russia) / Preclinical (global)',
    color: '#2DD4A8',
    note: 'Used clinically in Russia for stroke and cognitive disorders. Key distinguishing feature: derived from ACTH but does not activate the HPA stress axis. The most studied nootropic peptide in this cluster.',
  },
  {
    slug: 'selank',
    name: 'Selank',
    origin: 'Synthetic tuftsin analog · Russia',
    mechanism: 'GABAergic / serotonergic modulation; enkephalinase inhibition',
    areas: ['Generalized anxiety', 'Cognitive performance'],
    evidence: 'Clinical (Russia) / Preclinical (global)',
    color: '#818CF8',
    note: 'Used clinically in Russia as an anxiolytic. Research interest centers on calming effects without sedation, tolerance, or dependence — unlike benzodiazepines. Derived from tuftsin, an immune peptide, but its cognitive effects appear CNS-mediated.',
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    origin: 'Endogenous neuropeptide · isolated 1974',
    mechanism: 'Incompletely characterized; multimodal CNS modulation',
    areas: ['Sleep architecture', 'Stress physiology', 'Circadian rhythm'],
    evidence: 'Preclinical',
    color: '#FB923C',
    note: 'First isolated from rabbit cerebral blood during induced sleep. Mechanism and receptor remain incompletely characterized — a research target precisely because the biology is unresolved. Not FDA-approved.',
  },
]

const FAQS = [
  {
    q: 'What are nootropic peptides?',
    a: 'Nootropic peptides are compounds studied for effects on cognitive function, memory, neuroprotection, or mood — acting through central nervous system pathways. The research cluster on this page includes ACTH-fragment analogs (Semax), immune peptide analogs studied for anxiolytic activity (Selank), and endogenous sleep-regulatory peptides (DSIP). They share a CNS research context but have distinct mechanisms and receptor targets.',
  },
  {
    q: 'Why does the blood–brain barrier matter for peptide nootropics?',
    a: 'Most peptides do not readily cross the blood–brain barrier (BBB), which restricts large polar molecules from entering brain tissue. For a peptide to act centrally, it must either cross the BBB, be administered intranasally (which provides partial CNS access via olfactory pathways), or act peripherally on CNS-accessible targets. Semax and Selank are both studied via intranasal administration — a route that partially bypasses the BBB. DSIP is an endogenous neuropeptide that presumably reaches its CNS targets via normal physiologic processes.',
  },
  {
    q: 'How does Semax differ from other ACTH-related compounds?',
    a: 'Full ACTH activates the HPA (hypothalamic–pituitary–adrenal) stress axis, raising cortisol. Semax is based on the ACTH(4–10) fragment that retains melanocortin receptor signaling but does not trigger adrenal cortisol release — a mechanistically important distinction for cognitive research where avoiding stress-axis activation is desirable. Its reported effects are on neurotrophic factor induction (BDNF, NGF) rather than HPA stimulation.',
  },
  {
    q: 'What is selank\'s proposed mechanism?',
    a: 'Proposed mechanisms include modulation of GABAergic and serotonergic neurotransmission and inhibition of enkephalinase — the enzyme that degrades endogenous enkephalins. By extending enkephalin half-life, Selank may indirectly enhance endogenous opioid signaling, contributing to its anxiolytic profile. These are proposed mechanisms based on preclinical and early clinical data; the full pharmacology has not been established.',
  },
  {
    q: 'Is there human clinical evidence for Semax or Selank?',
    a: 'Both are used clinically in Russia — Semax for stroke recovery and cognitive disorders, Selank as an anxiolytic. Controlled trial data from Russian clinical practice exists for both, but the studies are generally smaller and have not been conducted to the standards or scale of Western Phase 3 registration trials. Outside Russia they are research compounds with no FDA or EMA approval. The evidence base is real but geographically concentrated and of limited scope.',
  },
  {
    q: 'What is DSIP and why is its mechanism unknown?',
    a: 'DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring nine-amino-acid neuropeptide first isolated in the 1970s. Its mechanism remains incompletely characterized because no clear, single high-affinity receptor has been identified — suggesting it may act through multiple pathways simultaneously or via indirect mechanisms. This makes it an interesting research subject (the biology is unresolved) but also means the evidence is preliminary and mechanistically murky.',
  },
]

export default function CognitivePeptidesPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'Cognitive and Nootropic Peptides: Mechanisms and Research Guide',
    description: 'Research reference for Semax, Selank, and DSIP — mechanisms, evidence quality, and BBB context.',
    url: `${SITE}/cognitive-peptides`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: COMPOUNDS.map((c) => ({ '@type': 'Drug', name: c.name })),
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Cognitive Peptides', item: `${SITE}/cognitive-peptides` },
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

      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 hover:text-ink transition-colors">Home</Link>
        <span className="text-ink/20">/</span>
        <span className="text-sm font-medium truncate">Cognitive &amp; Nootropic Peptides</span>
      </header>

      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(129,140,248,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#818CF8]/25 bg-[#818CF8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent-indigo">
            CNS research · 3 compounds · BBB considerations
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Cognitive &amp; Nootropic
            <br />
            <span className="bg-gradient-to-r from-[#818CF8] to-[#2DD4A8] bg-clip-text text-transparent">
              Peptide Research
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            Peptides studied for effects on cognition, neuroprotection, anxiety, and sleep —
            through BDNF/NGF induction, GABAergic modulation, and circadian pathways.
            Most evidence is preclinical; Semax and Selank have clinical use in Russia.
          </p>
          <p className="mt-3 text-xs text-ink/30">Research reference only. Not medical advice.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-16">

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">The BBB constraint</h2>
              <div className="rounded-xl border border-[#818CF8]/20 bg-[#818CF8]/[0.04] p-5 text-sm leading-relaxed text-ink/60">
                <p className="mb-3">
                  The blood–brain barrier (BBB) restricts most peptides from reaching CNS targets.
                  For a peptide to produce central nervous system effects, it must cross this barrier —
                  either systemically or via alternative routes such as intranasal administration,
                  which provides partial CNS access through olfactory and trigeminal pathways.
                </p>
                <p>
                  Semax and Selank are studied primarily via intranasal routes.
                  DSIP is endogenous and presumably reaches CNS targets through physiologic mechanisms.
                  BBB permeability is a critical variable in cognitive peptide research that is often
                  underemphasized in secondary literature.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">Compound profiles</h2>
              <div className="space-y-5">
                {COMPOUNDS.map((c) => (
                  <Link key={c.slug} href={`/catalog/${c.slug}`}
                    className="group flex flex-col gap-3 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 transition-colors hover:border-ink/[0.12] hover:bg-ink/[0.04]"
                    style={{ borderLeftColor: c.color, borderLeftWidth: 3 }}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold group-hover:text-accent transition-colors" style={{ color: c.color }}>{c.name}</p>
                        <p className="text-xs text-ink/30">{c.origin}</p>
                      </div>
                      <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] text-ink/40">{c.evidence}</span>
                    </div>
                    <p className="text-xs text-ink/40">Mechanism: <span className="text-ink/55">{c.mechanism}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {c.areas.map((a) => (
                        <span key={a} className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[10px] text-ink/40">{a}</span>
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed text-ink/45">{c.note}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Related research areas</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { href: '/research-areas/cognition-neuroprotection', label: 'Cognition & Neuroprotection', color: '#2DD4A8' },
                  { href: '/research-areas/anxiety-mood', label: 'Anxiety, Mood & Stress', color: '#818CF8' },
                  { href: '/research-areas/sleep-circadian', label: 'Sleep & Circadian Rhythm', color: '#FB923C' },
                ].map((ra) => (
                  <Link key={ra.href} href={ra.href}
                    className="group rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4 transition-colors hover:border-ink/[0.12]">
                    <p className="text-sm font-medium group-hover:text-accent transition-colors" style={{ color: ra.color }}>{ra.label}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink/30 group-hover:text-ink/50">
                      Research area guide <ArrowRight className="h-3 w-3" />
                    </p>
                  </Link>
                ))}
              </div>
            </section>

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

            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <p className="text-xs leading-relaxed text-ink/45">
                <strong className="text-ink/60">Research reference only.</strong> None of these compounds are FDA-approved.
                Clinical data for Semax and Selank exists but originates from Russian clinical practice and has not been
                replicated in large Western trials. Nothing here constitutes medical advice.
              </p>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Catalog entries</p>
              {COMPOUNDS.map((c) => (
                <Link key={c.slug} href={`/catalog/${c.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]">
                  <div>
                    <p className="text-sm font-medium group-hover:text-accent transition-colors" style={{ color: c.color }}>{c.name}</p>
                    <p className="text-xs text-ink/30 truncate max-w-[140px]">{c.mechanism.split(';')[0]}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 group-hover:text-accent" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Related</p>
              {[
                { href: '/catalog/category/cognitive', label: 'Cognitive category', sub: 'All cognitive peptides' },
                { href: '/glossary/bdnf', label: 'BDNF definition', sub: 'Glossary entry' },
                { href: '/glossary/blood-brain-barrier', label: 'Blood–brain barrier', sub: 'Glossary entry' },
                { href: '/learn/evidence-hierarchy', label: 'Reading the evidence', sub: 'Trial quality guide' },
                { href: '/trials', label: 'CNS peptide trials', sub: 'ClinicalTrials.gov' },
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

            <div className="rounded-xl border border-[#818CF8]/20 bg-[#818CF8]/[0.05] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#818CF8]/10">
                <FlaskConical className="h-4 w-4 text-accent-indigo" />
              </div>
              <p className="mb-1 text-sm font-semibold text-accent-indigo">Marketplace coming soon</p>
              <p className="mb-4 text-xs text-ink/45">COA-verified cognitive research peptides.</p>
              <Link href="/catalog"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#818CF8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] hover:opacity-90">
                Browse catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
