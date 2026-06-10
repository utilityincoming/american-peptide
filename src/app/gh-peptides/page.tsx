import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ChevronRight, FlaskConical, TrendingUp, Zap } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Growth Hormone Peptides — GHRH Analogs & GHRPs Research Guide | AmericanPeptide.com',
  description:
    'Research reference for growth hormone secretagogues — CJC-1295, ipamorelin, sermorelin, tesamorelin, hexarelin. GHRH vs GHRP mechanism, pulsatile vs sustained release, and the synergy rationale.',
  alternates: { canonical: `${SITE}/gh-peptides` },
  keywords: [
    'CJC-1295 ipamorelin',
    'growth hormone peptides research',
    'GHRH analog',
    'GHRP research',
    'CJC-1295 research',
    'ipamorelin research',
    'sermorelin research',
    'growth hormone secretagogue',
    'GHS-R1a agonist',
    'tesamorelin',
  ],
  openGraph: {
    title: 'Growth Hormone Peptides — GHRH Analogs & GHRPs Research Guide',
    description:
      'Research reference for GH secretagogues — CJC-1295, ipamorelin, sermorelin, tesamorelin, hexarelin. Mechanism, half-life engineering, and synergy.',
    url: `${SITE}/gh-peptides`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growth Hormone Peptides Research Guide | AmericanPeptide.com',
    description:
      'GHRH analogs and GHRPs: CJC-1295, ipamorelin, sermorelin, tesamorelin. Mechanism, synergy, and the pulsatile vs sustained release distinction.',
  },
}

const RECEPTOR_CLASSES = [
  {
    label: 'GHRH analogs',
    receptor: 'GHRHR (pituitary)',
    color: '#2DD4A8',
    how: 'Mimic the hypothalamic signal that prompts pituitary somatotrophs to synthesize and release GH. DPP-4-resistant substitutions extend stability from the native ~7-minute half-life. The DAC addition to CJC-1295 further extends to ~7 days via albumin binding.',
    members: ['Sermorelin (GHRH 1–29)', 'CJC-1295 no DAC (Mod GRF 1-29)', 'CJC-1295 with DAC', 'Tesamorelin (FDA-approved)'],
  },
  {
    label: 'GHRPs (ghrelin-axis)',
    receptor: 'GHS-R1a (pituitary + hypothalamus)',
    color: '#818CF8',
    how: 'Act on the ghrelin receptor via a separate intracellular pathway. They amplify GH release synergistically when combined with a GHRH analog — the two receptor classes converge downstream. Ipamorelin is the most selective GHRP, releasing GH without meaningfully raising cortisol or prolactin.',
    members: ['Ipamorelin (selective, minimal cortisol)', 'Hexarelin (potent, also CD36)', 'GHRP-6 / GHRP-2 (reference compounds)'],
  },
]

const COMPOUNDS = [
  {
    slug: 'sermorelin',
    name: 'Sermorelin',
    aliases: 'GRF 1-29 · Geref',
    class: 'GHRH analog',
    halfLife: '~10–20 min',
    release: 'Pulsatile',
    fda: true,
    fdaNote: 'Discontinued (1990)',
    color: '#2DD4A8',
    note: 'Shortest active GHRH fragment; historically the first GHRH analog FDA-approved (pediatric GH deficiency), later discontinued commercially.',
  },
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (no DAC)',
    aliases: 'Mod GRF 1-29',
    class: 'GHRH analog',
    halfLife: '~30 min',
    release: 'Pulsatile',
    fda: false,
    color: '#2DD4A8',
    note: 'Four DPP-4-resistant substitutions extend stability vs sermorelin. The preferred pairing with ipamorelin for pulsatile GH research.',
  },
  {
    slug: 'cjc-1295-with-dac',
    name: 'CJC-1295 (DAC)',
    aliases: 'CJC-1295 DAC',
    class: 'GHRH analog',
    halfLife: '~6–8 days',
    release: 'Sustained',
    fda: false,
    color: '#2DD4A8',
    note: 'Albumin-binding DAC moiety extends half-life to ~a week. Studied for sustained IGF-1 elevation; blunts natural GH pulsatility.',
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    aliases: 'Egrifta',
    class: 'GHRH analog',
    halfLife: '~26 min',
    release: 'Pulsatile',
    fda: true,
    fdaNote: 'Approved (2010, Egrifta)',
    color: '#34D399',
    note: 'Only currently FDA-approved GH-axis peptide. Approved for HIV-associated visceral lipodystrophy. Also studied for cognition and hepatic fat.',
  },
  {
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    aliases: '—',
    class: 'GHRP (ghrelin-axis)',
    halfLife: '~2 h',
    release: 'Pulsatile',
    fda: false,
    color: '#818CF8',
    note: 'Most selective GHRP: GH release with minimal ACTH/cortisol/prolactin impact. Standard pairing with CJC-1295 (no DAC) in synergy research.',
  },
  {
    slug: 'hexarelin',
    name: 'Hexarelin',
    aliases: '—',
    class: 'GHRP (ghrelin-axis)',
    halfLife: '~2–3 h',
    release: 'Pulsatile',
    fda: false,
    color: '#818CF8',
    note: 'More potent than ipamorelin but less selective. Distinctive CD36-mediated cardioprotective thread in preclinical literature, independent of GH release.',
  },
]

const FAQS = [
  {
    q: 'What is a growth hormone secretagogue?',
    a: 'A growth hormone secretagogue is any compound that stimulates the pituitary gland to release growth hormone (GH). The term covers two mechanistically distinct classes: GHRH analogs, which mimic hypothalamic growth-hormone-releasing hormone at the GHRHR receptor, and GHRPs (growth-hormone-releasing peptides), which act on the ghrelin receptor (GHS-R1a). Both classes are studied separately and in combination.',
  },
  {
    q: 'What is the difference between a GHRH analog and a GHRP?',
    a: 'GHRH analogs (sermorelin, CJC-1295, tesamorelin) bind the GHRH receptor on pituitary somatotrophs and prompt GH synthesis and release, mimicking the hypothalamic pulse. GHRPs (ipamorelin, hexarelin) bind the ghrelin receptor (GHS-R1a) via a separate intracellular pathway. The two classes act synergistically — combining them produces more GH release than either alone because the downstream pathways converge.',
  },
  {
    q: 'Why is CJC-1295 (no DAC) commonly paired with ipamorelin?',
    a: 'CJC-1295 (no DAC) provides a short GHRH-receptor signal; ipamorelin provides a simultaneous ghrelin-receptor signal. Together they converge on the same pituitary somatotroph and produce a larger, synergistic GH pulse than either alone. The short half-life of both compounds keeps the pulse physiologic rather than sustained — preserving natural GH pulsatility.',
  },
  {
    q: 'What is the difference between CJC-1295 with DAC and without DAC?',
    a: 'The DAC (Drug Affinity Complex) is a maleimidopropionic acid group that allows the peptide to bind covalently to serum albumin, extending half-life from ~30 minutes (no DAC) to ~6–8 days (DAC). The no-DAC form produces brief, pulsatile GH pulses. The DAC form produces sustained GH and IGF-1 elevation but blunts the natural pulsatility of the GH axis — a trade-off studied in body-composition and IGF-1 research.',
  },
  {
    q: 'What makes ipamorelin different from other GHRPs?',
    a: 'Ipamorelin is defined by its selectivity: it releases GH with minimal effect on ACTH, cortisol, or prolactin, unlike earlier GHRPs (GHRP-6, hexarelin) that raise these hormones alongside GH. This cleaner profile has made it the most studied GHRP in combination protocols. It is not FDA-approved.',
  },
  {
    q: 'Is tesamorelin FDA-approved?',
    a: 'Yes — tesamorelin (Egrifta) is the only currently FDA-approved GH-axis peptide in this catalog. It is approved for reduction of excess visceral abdominal fat in people with HIV-associated lipodystrophy. Other uses described here are research contexts, not approved indications.',
  },
  {
    q: 'How do GH secretagogues differ from injecting growth hormone directly?',
    a: 'Secretagogues prompt the pituitary to release the body\'s own GH, preserving the natural feedback loop (IGF-1 suppresses further GH release when levels rise). Direct GH injection bypasses this feedback. Whether preserving pulsatility and feedback is clinically meaningful depends on the indication and is an active research question. Secretagogues are studied partly because they are peptides that require pituitary integrity to work, while direct GH does not.',
  },
]

export default function GHPeptidesPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'Growth Hormone Secretagogues: GHRH Analogs and GHRPs Research Guide',
    description: 'Research reference for GH secretagogue peptides — mechanism, half-life engineering, synergy rationale, and compound profiles.',
    url: `${SITE}/gh-peptides`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: COMPOUNDS.map((c) => ({ '@type': 'Drug', name: c.name })),
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'GH Peptides', item: `${SITE}/gh-peptides` },
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
        <span className="text-sm font-medium truncate">GH Secretagogues</span>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
            <TrendingUp className="h-3 w-3" />
            GH axis · 2 receptor classes · 6 compounds
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Growth Hormone
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              Secretagogue Research
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            GHRH analogs and GHRPs are mechanistically distinct compounds that both
            result in pituitary GH release — through different receptors that act
            synergistically. This page covers the two classes, their compounds, and why
            the combination approach is studied.
          </p>
          <p className="mt-3 text-xs text-white/30">Research reference only. Not medical advice or dosing guidance.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-16">

            {/* Two receptor classes */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Two receptor classes, one outcome</h2>
              <p className="mb-6 text-xs text-white/30">Both stimulate pituitary GH release — via different receptors that converge downstream</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {RECEPTOR_CLASSES.map((rc) => (
                  <div key={rc.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
                    style={{ borderTopColor: rc.color, borderTopWidth: 2 }}>
                    <p className="mb-1 text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</p>
                    <p className="mb-3 text-xs text-white/35">Receptor: {rc.receptor}</p>
                    <p className="mb-4 text-xs leading-relaxed text-white/55">{rc.how}</p>
                    <ul className="space-y-1">
                      {rc.members.map((m) => (
                        <li key={m} className="flex gap-2 text-xs text-white/45">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/25" />{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2DD4A8]" />
                  <p className="text-xs leading-relaxed text-white/55">
                    <strong className="text-white/70">Synergy:</strong> When a GHRH analog and a GHRP are combined,
                    the downstream cAMP (GHRH pathway) and IP₃/Ca²⁺ (ghrelin pathway) signals converge
                    on the same somatotroph, producing larger GH pulses than either alone.
                    This is why CJC-1295 (no DAC) + ipamorelin is the most studied combination
                    in the GH-secretagogue literature.
                  </p>
                </div>
              </div>
            </section>

            {/* Compound table */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">Compound reference</h2>
              <div className="space-y-4">
                {COMPOUNDS.map((c) => (
                  <Link key={c.slug} href={`/catalog/${c.slug}`}
                    className="group flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold transition-colors group-hover:text-[#2DD4A8]"
                          style={{ color: c.color }}>{c.name}</p>
                        {c.aliases !== '—' && <p className="text-xs text-white/30">{c.aliases}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-white/40">{c.class}</span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-white/40">t½ {c.halfLife}</span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-white/40">{c.release}</span>
                        {c.fda && (
                          <span className="rounded-full bg-[#2DD4A8]/10 px-2 py-0.5 font-medium text-[#2DD4A8]">
                            {c.fdaNote ?? 'FDA approved'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-white/50">{c.note}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Pulsatile vs sustained */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Pulsatile vs sustained release</h2>
              <div className="space-y-3 text-sm leading-relaxed text-white/65">
                <p>
                  Endogenous GH is released in pulses — the largest occurring during
                  deep sleep — and this pulsatility is functionally important for the
                  GH/IGF-1 axis. Short-acting compounds (sermorelin, CJC-1295 no DAC,
                  ipamorelin) reproduce this pulsatile pattern by producing brief
                  receptor activation.
                </p>
                <p>
                  The DAC addition to CJC-1295 shifts the pharmacokinetic profile from
                  pulsatile to sustained: albumin binding keeps the peptide in circulation
                  for days, producing prolonged GHRHR occupancy. This raises baseline GH
                  and IGF-1 but blunts the natural peak-to-trough rhythm. Whether blunting
                  pulsatility is clinically consequential for the endpoints studied —
                  body composition, IGF-1, fat distribution — is the central research question
                  distinguishing the two CJC-1295 forms.
                </p>
                <Link href="/compare/cjc-1295-vs-ipamorelin"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#2DD4A8]">
                  CJC-1295 vs ipamorelin — detailed comparison
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
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
                <strong className="text-white/60">Research reference only.</strong> Except for tesamorelin (Egrifta, specific indication only),
                none of the compounds on this page are FDA-approved. Nothing here constitutes medical advice,
                dosing guidance, or an offer for sale.
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
                    <p className="text-sm font-medium transition-colors group-hover:text-[#2DD4A8]" style={{ color: c.color }}>{c.name}</p>
                    <p className="text-xs text-white/30">{c.class}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#2DD4A8]" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Related</p>
              {[
                { href: '/compare/cjc-1295-vs-ipamorelin', label: 'CJC-1295 vs Ipamorelin', sub: 'Detailed comparison' },
                { href: '/research-areas/growth-hormone-axis', label: 'GH & Body Composition', sub: 'Research area guide' },
                { href: '/catalog/category/growth-hormone', label: 'GH Peptides category', sub: 'Full catalog view' },
                { href: '/trials', label: 'GH peptide trials', sub: 'ClinicalTrials.gov' },
                { href: '/synthesis', label: 'Synthesis & COA', sub: 'Purity context' },
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

            <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.05] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4A8]/10">
                <FlaskConical className="h-4 w-4 text-[#2DD4A8]" />
              </div>
              <p className="mb-1 text-sm font-semibold text-[#2DD4A8]">Marketplace coming soon</p>
              <p className="mb-4 text-xs leading-relaxed text-white/45">
                COA-verified GH-axis peptides with transparent pricing.
              </p>
              <Link href="/catalog"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90">
                Browse catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
