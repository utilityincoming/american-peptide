import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ChevronRight, FlaskConical } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'CJC-1295 vs Ipamorelin — Mechanism, Synergy & Key Differences | AmericanPeptide.com',
  description:
    'Research comparison of CJC-1295 (no DAC / with DAC) and ipamorelin — receptor differences (GHRHR vs GHS-R1a), why they are studied together, pulsatile vs sustained release, and compound profiles.',
  alternates: { canonical: `${SITE}/cjc-1295-vs-ipamorelin` },
  keywords: [
    'CJC-1295 vs ipamorelin',
    'CJC-1295 ipamorelin combination',
    'CJC-1295 no DAC vs with DAC',
    'GHRH vs GHRP',
    'ipamorelin mechanism',
    'CJC-1295 mechanism',
    'growth hormone peptide comparison',
  ],
  openGraph: {
    title: 'CJC-1295 vs Ipamorelin — Mechanism, Synergy & Key Differences',
    description: 'Research comparison: GHRHR agonism (CJC-1295) vs GHS-R1a agonism (ipamorelin) — why they are studied together and what each alone.',
    url: `${SITE}/cjc-1295-vs-ipamorelin`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJC-1295 vs Ipamorelin Research Comparison | AmericanPeptide.com',
    description: 'Mechanism, synergy rationale, and compound profiles for CJC-1295 and ipamorelin.',
  },
}

const TABLE = [
  { dim: 'Receptor', cjc: 'GHRH receptor (GHRHR)', ipa: 'Ghrelin receptor (GHS-R1a)' },
  { dim: 'Pathway', cjc: 'cAMP / PKA cascade in somatotrophs', ipa: 'IP₃ / Ca²⁺ cascade in somatotrophs' },
  { dim: 'Natural ligand', cjc: 'GHRH (hypothalamic pulse)', ipa: 'Ghrelin (gut-derived, pulsatile)' },
  { dim: 'Chain length', cjc: '30 AA (no DAC) / 30 AA + DAC', ipa: '5 AA (pentapeptide)' },
  { dim: 'Half-life', cjc: '~30 min (no DAC) / ~6–8 days (DAC)', ipa: '~2 h' },
  { dim: 'GH release pattern', cjc: 'Pulsatile (no DAC) / Sustained (DAC)', ipa: 'Pulsatile' },
  { dim: 'Cortisol / ACTH effect', cjc: 'Minimal', ipa: 'Minimal (key selectivity feature)' },
  { dim: 'Prolactin effect', cjc: 'Minimal', ipa: 'Minimal' },
  { dim: 'FDA approval', cjc: 'None', ipa: 'None' },
  { dim: 'WADA status', cjc: 'Prohibited (S2)', ipa: 'Prohibited (S2)' },
]

const FAQS = [
  {
    q: 'What is the main difference between CJC-1295 and ipamorelin?',
    a: 'They act on entirely different receptors. CJC-1295 (a GHRH analog) binds the GHRH receptor via a cAMP/PKA cascade. Ipamorelin (a GHRP) binds the ghrelin receptor (GHS-R1a) via an IP₃/Ca²⁺ cascade. Because the two pathways converge downstream on the same pituitary somatotroph, combining them produces synergistically larger GH pulses than either alone.',
  },
  {
    q: 'Why are CJC-1295 and ipamorelin often studied together?',
    a: 'When a GHRH-receptor signal (CJC-1295) and a ghrelin-receptor signal (ipamorelin) arrive at the same pituitary somatotroph simultaneously, the two intracellular cascades amplify each other. The combined GH pulse is substantially larger than additive. This synergy is the primary rationale for studying them as a combination rather than individually.',
  },
  {
    q: 'What is the difference between CJC-1295 with DAC and without DAC?',
    a: 'The DAC (Drug Affinity Complex) addition extends half-life from ~30 minutes (no DAC) to ~6–8 days (DAC) by allowing covalent binding to serum albumin. The no-DAC form produces brief, pulsatile GH pulses compatible with natural GH rhythm. The DAC form produces sustained GH and IGF-1 elevation but blunts pulsatility. The choice between them in research depends on whether pulsatile vs sustained exposure is the endpoint of interest.',
  },
  {
    q: 'What makes ipamorelin selective compared to other GHRPs?',
    a: 'Earlier GHRPs (GHRP-6, hexarelin) release GH alongside ACTH, cortisol, and prolactin — hormones researchers generally prefer not to elevate. Ipamorelin activates GHS-R1a with high selectivity, releasing GH without meaningfully raising the others. This selectivity is the primary reason ipamorelin is the most widely used GHRP in combination research.',
  },
  {
    q: 'Are CJC-1295 and ipamorelin FDA-approved?',
    a: 'No. Neither compound is FDA-approved. Both are prohibited by the World Anti-Doping Agency under category S2 (Peptide Hormones). The only currently approved GH-axis peptide in this catalog is tesamorelin (Egrifta), approved for a specific HIV-related indication.',
  },
  {
    q: 'What is the evidence base for CJC-1295 and ipamorelin?',
    a: 'Both have pharmacological characterization data (receptor binding, GH release curves) and some human pharmacokinetic/pharmacodynamic data. For CJC-1295, peer-reviewed human PK data on GH and IGF-1 effects exists. The evidence base for specific endpoints like body composition is thinner and mostly from small trials or case series. Neither compound has completed Phase 3 clinical trials.',
  },
]

export default function CJCVsIpaPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: 'CJC-1295 vs Ipamorelin: Mechanism, Synergy, and Key Differences',
    description: 'Research comparison of CJC-1295 and ipamorelin — receptor targets, synergy mechanism, pulsatile vs sustained release, and compound profiles.',
    url: `${SITE}/cjc-1295-vs-ipamorelin`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'GH Peptides', item: `${SITE}/gh-peptides` },
      { '@type': 'ListItem', position: 3, name: 'CJC-1295 vs Ipamorelin', item: `${SITE}/cjc-1295-vs-ipamorelin` },
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

      <header className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <Link href="/gh-peptides" className="text-sm text-white/35 hover:text-white transition-colors">GH peptides</Link>
        <span className="text-white/20">/</span>
        <span className="text-sm font-medium truncate">CJC-1295 vs Ipamorelin</span>
      </header>

      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(45,212,168,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-medium text-[#2DD4A8]">CJC-1295 · GHRH analog · GHRHR</span>
            <span className="text-white/20 self-center">vs</span>
            <span className="rounded-full border border-[#818CF8]/25 bg-[#818CF8]/[0.08] px-3 py-1 text-[11px] font-medium text-[#818CF8]">Ipamorelin · GHRP · GHS-R1a</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            CJC-1295 vs Ipamorelin
            <br />
            <span className="text-2xl font-normal text-white/40 md:text-3xl">different receptors, synergistic outcome</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            CJC-1295 and ipamorelin are not alternatives — they act on different receptor systems.
            Understanding why they are studied together requires understanding what each does alone.
          </p>
          <p className="mt-3 text-xs text-white/30">Research reference only. Not medical advice or dosing guidance.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-16">

            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-white/40">Side-by-side comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs">
                      <th className="pb-3 pr-6 font-medium text-white/30 w-36">Dimension</th>
                      <th className="pb-3 pr-6 font-medium text-[#2DD4A8]">CJC-1295</th>
                      <th className="pb-3 font-medium text-[#818CF8]">Ipamorelin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {TABLE.map((r) => (
                      <tr key={r.dim} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-6 text-xs font-medium text-white/35">{r.dim}</td>
                        <td className="py-3 pr-6 text-sm text-white/70">{r.cjc}</td>
                        <td className="py-3 text-sm text-white/70">{r.ipa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Why they are studied together</h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/65">
                <p>
                  Pituitary somatotrophs — the cells that synthesize and secrete GH — have
                  receptor sites for both GHRH and ghrelin. CJC-1295 occupies the GHRH
                  receptor and activates a cAMP/PKA intracellular cascade. Ipamorelin
                  occupies the ghrelin receptor (GHS-R1a) and activates a separate
                  IP₃/Ca²⁺ cascade. Both cascades converge on the same downstream
                  machinery that triggers GH exocytosis.
                </p>
                <p>
                  When both receptors are occupied simultaneously, the two signals amplify
                  each other — producing a GH pulse significantly larger than the sum of
                  each compound alone. This receptor-level synergy, rather than mere
                  additive effect, is why the combination is the most studied GH-axis
                  protocol in the research literature.
                </p>
                <p>
                  Timing matters for the no-DAC form: because CJC-1295 (no DAC) has a
                  half-life of ~30 minutes and ipamorelin ~2 hours, administering them
                  together maximizes the window of simultaneous receptor occupancy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">CJC-1295 no DAC vs with DAC — the third choice</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: 'No DAC (Mod GRF 1-29)',
                    t: '~30 min',
                    release: 'Pulsatile',
                    color: '#2DD4A8',
                    pros: ['Preserves natural GH pulsatility', 'Tighter control over timing', 'Standard combination partner with ipamorelin'],
                    cons: ['Requires more frequent administration', 'Shorter window per dose'],
                  },
                  {
                    label: 'With DAC',
                    t: '~6–8 days',
                    release: 'Sustained',
                    color: '#60A5FA',
                    pros: ['Once-weekly dosing', 'Sustained IGF-1 elevation', 'Studied for body composition endpoints'],
                    cons: ['Blunts natural GH pulsatility', 'Harder to titrate', 'Less commonly studied in synergy protocols'],
                  },
                ].map((v) => (
                  <div key={v.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
                    style={{ borderTopColor: v.color, borderTopWidth: 2 }}>
                    <p className="mb-1 text-sm font-semibold" style={{ color: v.color }}>{v.label}</p>
                    <p className="mb-3 text-xs text-white/35">t½ {v.t} · {v.release}</p>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Studied for</p>
                    <ul className="mb-3 space-y-1">
                      {v.pros.map((p) => (
                        <li key={p} className="flex gap-2 text-xs text-white/55">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#2DD4A8]/60" />{p}
                        </li>
                      ))}
                    </ul>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Trade-offs</p>
                    <ul className="space-y-1">
                      {v.cons.map((c) => (
                        <li key={c} className="flex gap-2 text-xs text-white/40">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/25" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                <strong className="text-white/60">Research reference only.</strong> Neither CJC-1295 nor ipamorelin is FDA-approved.
                Both are WADA-prohibited. Nothing here constitutes medical advice or dosing guidance.
              </p>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Catalog entries</p>
              {[
                { slug: 'cjc-1295-no-dac', label: 'CJC-1295 (no DAC)', sub: 'GHRH analog · pulsatile', color: '#2DD4A8' },
                { slug: 'cjc-1295-with-dac', label: 'CJC-1295 (DAC)', sub: 'GHRH analog · sustained', color: '#60A5FA' },
                { slug: 'ipamorelin', label: 'Ipamorelin', sub: 'GHRP · GHS-R1a · selective', color: '#818CF8' },
              ].map((c) => (
                <Link key={c.slug} href={`/catalog/${c.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium group-hover:text-[#2DD4A8] transition-colors" style={{ color: c.color }}>{c.label}</p>
                    <p className="text-xs text-white/30">{c.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#2DD4A8]" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Related</p>
              {[
                { href: '/gh-peptides', label: 'GH Secretagogues Hub', sub: 'Full cluster overview' },
                { href: '/catalog/category/growth-hormone', label: 'GH Peptides category', sub: 'All 6 compounds' },
                { href: '/research-areas/growth-hormone-axis', label: 'GH & Body Composition', sub: 'Research area guide' },
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
              <p className="mb-4 text-xs text-white/45">COA-verified GH peptides with transparent pricing.</p>
              <Link href="/catalog"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2DD4A8] px-4 py-2.5 text-sm font-semibold text-[#0B1220] hover:opacity-90">
                Browse catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
