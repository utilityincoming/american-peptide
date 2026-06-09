import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ChevronRight, FlaskConical } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Longevity & Mitochondrial Peptides — Research Guide | AmericanPeptide.com',
  description:
    'Research reference for longevity and mitochondrial peptides — MOTS-c, SS-31 (elamipretide), Epitalon, NAD+, and 5-amino-1MQ. Mechanisms spanning mitochondrial signaling, AMPK, cardiolipin, and NAD+ biology.',
  alternates: { canonical: `${SITE}/longevity-peptides` },
  keywords: [
    'longevity peptides',
    'MOTS-c research',
    'SS-31 elamipretide',
    'Epitalon research',
    'mitochondrial peptides',
    'anti-aging peptides research',
    'NAD+ peptide',
    '5-amino-1MQ',
    'aging biology peptides',
  ],
  openGraph: {
    title: 'Longevity & Mitochondrial Peptides Research Guide',
    description: 'MOTS-c, SS-31, Epitalon, NAD+, 5-amino-1MQ — mechanisms, evidence quality, and the three axes of longevity peptide research.',
    url: `${SITE}/longevity-peptides`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Longevity Peptides Research Guide | AmericanPeptide.com',
    description: 'MOTS-c, SS-31, Epitalon, NAD+, 5-amino-1MQ — mechanisms and evidence quality across three axes of longevity research.',
  },
}

const AXES = [
  {
    label: 'Mitochondrial signaling',
    color: '#2DD4A8',
    desc: 'Peptides encoded by or targeted at mitochondria — regulating energy metabolism as retrograde signals from the organelle to the cell.',
    peptides: ['MOTS-c (mitochondria-derived, AMPK)', 'SS-31 / elamipretide (cardiolipin stabilization)'],
  },
  {
    label: 'NAD⁺ economy',
    color: '#818CF8',
    desc: 'Compounds studied for preserving or restoring the NAD⁺ redox cofactor, which declines with age and gates sirtuin and PARP activity.',
    peptides: ['NAD⁺ (research reagent, direct supplementation)', '5-amino-1MQ (NNMT inhibitor, indirect route)'],
  },
  {
    label: 'Pineal / telomere axis',
    color: '#F472B6',
    desc: 'Peptides derived from or studied in the context of the pineal gland and telomere maintenance — circadian regulation and cellular aging markers.',
    peptides: ['Epitalon (telomerase activity, melatonin, circadian)'],
  },
]

const COMPOUNDS = [
  {
    slug: 'mots-c',
    name: 'MOTS-c',
    axis: 'Mitochondrial signaling',
    mechanism: 'AMPK activation; folate–methionine cycle modulation',
    evidence: 'Preclinical',
    color: '#2DD4A8',
    note: 'Unique: encoded in mitochondrial DNA (12S rRNA region) rather than the nuclear genome. AMPK activation proposed as a retrograde stress signal from mitochondrion to cell. Declines with age.',
  },
  {
    slug: 'ss-31',
    name: 'SS-31 / Elamipretide',
    axis: 'Mitochondrial signaling',
    mechanism: 'Cardiolipin binding; ETC efficiency',
    evidence: 'Clinical trials',
    color: '#2DD4A8',
    note: 'Most clinically advanced compound in this cluster. Tetrapeptide that concentrates in the inner mitochondrial membrane and binds cardiolipin. Trials in primary mitochondrial myopathy, Barth syndrome, and heart failure. Not FDA-approved.',
  },
  {
    slug: 'epitalon',
    name: 'Epitalon',
    axis: 'Pineal / telomere',
    mechanism: 'Reported telomerase upregulation; melatonin / circadian modulation',
    evidence: 'Preclinical (concentrated)',
    color: '#F472B6',
    note: 'Evidence concentrated in Russian research tradition with limited independent replication. Tetrapeptide from pineal extract (epithalamin). Telomerase-activation claims are preliminary and require independent verification.',
  },
  {
    slug: 'nad-plus',
    name: 'NAD⁺',
    axis: 'NAD⁺ economy',
    mechanism: 'Redox cofactor; sirtuin and PARP substrate',
    evidence: 'Preclinical + early clinical',
    color: '#818CF8',
    note: 'Catalogued as a research reagent. Essential to oxidative phosphorylation and NAD⁺-dependent signaling. Plasma NAD⁺ declines with age. Direct supplementation vs precursor (NMN/NR) approaches are distinct strategies studied in parallel.',
  },
  {
    slug: '5-amino-1mq',
    name: '5-Amino-1MQ',
    axis: 'NAD⁺ economy',
    mechanism: 'NNMT inhibition → preserves SAM/methyl-donor pools and NAD⁺',
    evidence: 'Preclinical',
    color: '#818CF8',
    note: 'Small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor — often catalogued alongside peptides. Inhibiting NNMT is studied as an indirect route to preserving NAD⁺ and methyl-donor availability. Distinct from direct NAD⁺ supplementation mechanistically.',
  },
]

const FAQS = [
  {
    q: 'What are longevity peptides?',
    a: 'Longevity peptides is an informal term for compounds studied in the context of aging biology — targeting mechanisms including mitochondrial function, cellular energy sensing (AMPK), NAD⁺ availability, senescence, and circadian/telomere biology. The compounds on this page span three distinct mechanistic axes: mitochondrial signaling (MOTS-c, SS-31), NAD⁺ economy (NAD⁺, 5-amino-1MQ), and pineal/telomere biology (Epitalon). They share a research interest in aging hallmarks but have unrelated receptor targets and mechanisms.',
  },
  {
    q: 'What is MOTS-c and why is it unusual?',
    a: 'MOTS-c is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA gene — meaning it is produced by mitochondrial DNA, not the nuclear genome. This makes it a "mitochondria-derived peptide" (MDP), one of a small family of organelle-produced signaling molecules. It is studied for AMPK activation and metabolic effects, with expression declining with age. Most peptides in pharmacological research are encoded by the nuclear genome; MOTS-c\'s mitochondrial origin is its defining unusual feature.',
  },
  {
    q: 'How does SS-31 differ from MOTS-c?',
    a: 'They operate through entirely different mechanisms. MOTS-c is mitochondria-derived and acts systemically via AMPK. SS-31 (elamipretide) is a synthetic tetrapeptide that physically concentrates in the inner mitochondrial membrane and binds cardiolipin — a structural phospholipid essential to electron-transport-chain efficiency. SS-31 is also more clinically advanced, with ongoing and completed trials in mitochondrial myopathy, Barth syndrome, and heart failure.',
  },
  {
    q: 'What is the difference between NAD⁺ supplementation and 5-amino-1MQ?',
    a: 'NAD⁺ is the cofactor itself — studied by direct administration or via precursors (NMN, NR). 5-amino-1MQ is an NNMT inhibitor: it blocks nicotinamide N-methyltransferase, an enzyme that consumes NAD⁺ precursors and methyl donors. The indirect route of NNMT inhibition is proposed to preserve endogenous NAD⁺ and methyl-donor (SAM) pools simultaneously. The two approaches are mechanistically distinct routes to the same endpoint.',
  },
  {
    q: 'How reliable is the evidence for Epitalon\'s telomere effects?',
    a: 'The telomerase-activation narrative for Epitalon rests largely on work from a single Russian research group (Khavinson et al.) with limited independent replication. The findings are preclinical or early-phase and have not been confirmed in large, multi-center human trials. This does not rule out the effects — it means the evidence is preliminary and should be held at the appropriate level of confidence.',
  },
  {
    q: 'Are any longevity peptides FDA-approved?',
    a: 'None of the compounds on this page are FDA-approved for anti-aging indications. SS-31 (elamipretide) has the most advanced clinical profile, with trials in defined mitochondrial diseases — but it has not been approved. Longevity endpoints are among the hardest to validate in controlled trials (long timelines, complex endpoints), which is why approved evidence in this area remains limited.',
  },
]

export default function LongevityPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'Longevity & Mitochondrial Peptides: Mechanisms and Research Guide',
    description: 'Research reference across three axes of longevity peptide research: mitochondrial signaling, NAD⁺ economy, and pineal/telomere biology.',
    url: `${SITE}/longevity-peptides`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: COMPOUNDS.map((c) => ({ '@type': 'Drug', name: c.name })),
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Longevity Peptides', item: `${SITE}/longevity-peptides` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-white/35 hover:text-white transition-colors">Home</Link>
        <span className="text-white/20">/</span>
        <span className="text-sm font-medium truncate">Longevity Peptides</span>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#818CF8]/25 bg-[#818CF8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#818CF8]">
            Longevity &amp; Mitochondrial · 3 research axes · 5 compounds
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Longevity &amp; Mitochondrial
            <br />
            <span className="bg-gradient-to-r from-[#818CF8] to-[#F472B6] bg-clip-text text-transparent">
              Peptide Research
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Compounds studied across three distinct axes of aging biology —
            mitochondrial signaling (MOTS-c, SS-31), NAD⁺ economy (NAD⁺, 5-amino-1MQ),
            and pineal biology (Epitalon). Unrelated mechanisms grouped by shared research context.
          </p>
          <p className="mt-3 text-xs text-white/30">Research reference only. Not medical advice.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-16">

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Three mechanistic axes</h2>
              <p className="mb-6 text-xs text-white/30">These compounds share a research context but have unrelated receptor targets</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {AXES.map((a) => (
                  <div key={a.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
                    style={{ borderTopColor: a.color, borderTopWidth: 2 }}>
                    <p className="mb-2 text-sm font-semibold" style={{ color: a.color }}>{a.label}</p>
                    <p className="mb-4 text-xs leading-relaxed text-white/50">{a.desc}</p>
                    <ul className="space-y-1">
                      {a.peptides.map((p) => (
                        <li key={p} className="flex gap-2 text-xs text-white/40">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: a.color + '80' }} />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">Compound profiles</h2>
              <div className="space-y-4">
                {COMPOUNDS.map((c) => (
                  <Link key={c.slug} href={`/catalog/${c.slug}`}
                    className="group flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold group-hover:text-[#2DD4A8] transition-colors" style={{ color: c.color }}>{c.name}</p>
                        <p className="text-xs text-white/30">{c.axis}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-white/40">{c.evidence}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-white/40">Mechanism: <span className="text-white/55 font-normal">{c.mechanism}</span></p>
                    <p className="text-xs leading-relaxed text-white/45">{c.note}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">Frequently asked questions</h2>
              <div className="space-y-5">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="mb-2 text-sm font-semibold text-white/90">{f.q}</p>
                    <p className="text-sm leading-relaxed text-white/55">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <p className="text-xs leading-relaxed text-white/45">
                <strong className="text-white/60">Research reference only.</strong> None of these compounds are FDA-approved for anti-aging indications.
                Evidence quality varies — SS-31 has clinical-trial data; Epitalon has concentrated preclinical data with limited independent replication.
                Nothing here constitutes medical advice.
              </p>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Catalog entries</p>
              {COMPOUNDS.map((c) => (
                <Link key={c.slug} href={`/catalog/${c.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium group-hover:text-[#2DD4A8] transition-colors" style={{ color: c.color }}>{c.name}</p>
                    <p className="text-xs text-white/30">{c.axis}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#2DD4A8]" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Related</p>
              {[
                { href: '/research-areas/longevity-aging', label: 'Longevity & Aging', sub: 'Research area guide' },
                { href: '/research-areas/mitochondrial', label: 'Mitochondrial & Bioenergetics', sub: 'Research area guide' },
                { href: '/catalog/category/longevity', label: 'Longevity category', sub: 'Full catalog' },
                { href: '/catalog/category/mitochondrial', label: 'Mitochondrial category', sub: 'Full catalog' },
                { href: '/learn/evidence-hierarchy', label: 'Reading the evidence', sub: 'Trial quality guide' },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-white/70 group-hover:text-white">{l.label}</p>
                    <p className="text-xs text-white/30">{l.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-[#818CF8]/20 bg-[#818CF8]/[0.05] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#818CF8]/10">
                <FlaskConical className="h-4 w-4 text-[#818CF8]" />
              </div>
              <p className="mb-1 text-sm font-semibold text-[#818CF8]">Marketplace coming soon</p>
              <p className="mb-4 text-xs text-white/45">COA-verified longevity research peptides.</p>
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
