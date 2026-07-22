import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  FlaskConical,
  Microscope,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import SourcingCard from '@/components/SourcingCard'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title:
    'BPC-157 Research — Mechanism, Evidence Quality & Synthesis | AmericanPeptide.com',
  description:
    'Comprehensive research reference for BPC-157 (Body Protective Compound 157) — proposed VEGFR2/nitric-oxide/growth-factor mechanisms, preclinical evidence summary, synthesis quality context, and comparison with TB-500.',
  alternates: { canonical: `${SITE}/bpc-157` },
  keywords: [
    'BPC-157',
    'BPC-157 research',
    'BPC-157 mechanism',
    'body protective compound 157',
    'BPC-157 vs TB-500',
    'BPC-157 VEGF',
    'BPC-157 tendon',
    'BPC-157 gut healing',
    'research peptide healing',
  ],
  openGraph: {
    title: 'BPC-157 Research — Mechanism, Evidence & Synthesis',
    description:
      'Research reference for BPC-157 — proposed mechanisms, preclinical evidence summary, synthesis quality, and comparison with TB-500.',
    url: `${SITE}/bpc-157`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BPC-157 Research Guide | AmericanPeptide.com',
    description:
      'Mechanism, evidence quality, and synthesis context for BPC-157 — the most studied tissue-repair research peptide.',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MECHANISMS = [
  {
    label: 'VEGFR2 upregulation',
    desc: 'Proposed to upregulate vascular endothelial growth factor receptor 2 (VEGFR2), promoting new-vessel formation and tissue vascularisation in wound models.',
    icon: <Zap className="h-4 w-4" />,
    color: '#2DD4A8',
  },
  {
    label: 'Nitric oxide (NO) pathway',
    desc: 'Studies suggest modulation of endothelial nitric-oxide synthase (eNOS), with downstream effects on blood flow and cytoprotection.',
    icon: <Microscope className="h-4 w-4" />,
    color: '#818CF8',
  },
  {
    label: 'Growth-factor pathway interactions',
    desc: 'Reported interactions with PDGF, EGF, and GH-receptor signaling in cell models — contributing to fibroblast activation and ECM remodeling.',
    icon: <FlaskConical className="h-4 w-4" />,
    color: '#FB923C',
  },
]

const EVIDENCE_TABLE = [
  {
    context: 'Tendon & ligament repair',
    model: 'Rodent (transection, crush)',
    finding: 'Accelerated histological repair, tensile strength improvement',
    quality: 'Preclinical',
  },
  {
    context: 'Gastrointestinal protection',
    model: 'Rodent ulcer & IBD models',
    finding: 'Reduced ulcer area, mucosal cytoprotection',
    quality: 'Preclinical',
  },
  {
    context: 'Muscle repair',
    model: 'Rodent crush & ischemia',
    finding: 'Reduced fibrosis, improved strength recovery',
    quality: 'Preclinical',
  },
  {
    context: 'Angiogenesis',
    model: 'Cell culture / rodent',
    finding: 'VEGFR2 upregulation, new-vessel formation markers',
    quality: 'Preclinical',
  },
  {
    context: 'Human clinical evidence',
    model: '—',
    finding: 'No controlled human trials completed',
    quality: 'None',
  },
]

const VS_TB500 = [
  {
    dim: 'Source',
    bpc: 'Derived from human gastric juice protein',
    tb: 'Active fragment of thymosin β4',
  },
  {
    dim: 'Sequence length',
    bpc: '15 amino acids',
    tb: '7 amino acids',
  },
  {
    dim: 'Primary mechanism',
    bpc: 'VEGFR2 / NO / growth-factor pathways',
    tb: 'G-actin sequestration; cytoskeletal remodeling',
  },
  {
    dim: 'Main research contexts',
    bpc: 'Tendon, GI, muscle',
    tb: 'Wound healing, cardiac, hair follicle',
  },
  {
    dim: 'Sport status',
    bpc: 'WADA-prohibited (S2 peptide hormones)',
    tb: 'WADA-prohibited (S2)',
  },
  {
    dim: 'FDA approval',
    bpc: 'None',
    tb: 'None',
  },
  {
    dim: 'Evidence level',
    bpc: 'Preclinical only',
    tb: 'Preclinical only',
  },
]

const FAQS = [
  {
    q: 'What is BPC-157?',
    a: 'BPC-157 (Body Protective Compound 157) is a synthetic 15-amino-acid peptide derived from a cytoprotective protein identified in human gastric juice. It is studied in preclinical models — primarily rodent and cell-culture — for tissue repair, GI protection, and angiogenesis. It has no FDA-approved medical use.',
  },
  {
    q: 'What is the proposed mechanism of action for BPC-157?',
    a: 'Several mechanisms have been proposed, none fully established in humans. The most cited involve upregulation of the VEGFR2 receptor (promoting angiogenesis), modulation of endothelial nitric-oxide synthase (eNOS), and interactions with PDGF and EGF signaling pathways. These are based on cell-culture and rodent experiments; the operative mechanism in humans, if any, is unknown.',
  },
  {
    q: 'What tissues and conditions has BPC-157 been studied in?',
    a: 'Preclinical research contexts include tendon and ligament repair (transection and crush models), gastrointestinal protection (ulcer and IBD models), skeletal muscle repair, and angiogenesis. There are no completed, controlled human clinical trials.',
  },
  {
    q: 'How does BPC-157 differ from TB-500?',
    a: 'BPC-157 and TB-500 are completely distinct peptides with unrelated mechanisms. BPC-157 (15 residues) is studied primarily through VEGFR2/NO pathways. TB-500 (7 residues, derived from thymosin β4) works through G-actin sequestration and cytoskeletal remodeling. Both are preclinical and not FDA-approved; both are prohibited in regulated sport.',
  },
  {
    q: 'Is BPC-157 banned in sport?',
    a: 'Yes — BPC-157 is prohibited by the World Anti-Doping Agency (WADA) under category S2 (Peptide Hormones and Related Substances). This is regardless of whether human efficacy has been established.',
  },
  {
    q: 'Why does synthesis quality matter for BPC-157?',
    a: 'At only 15 residues, BPC-157 is inexpensive to synthesize, which makes it easy to produce low-quality or adulterated material. The low cost is precisely why a batch-specific certificate of analysis (COA) — with identity confirmation by mass spectrometry and purity by HPLC — is essential for any research-grade supply.',
  },
  {
    q: 'What does the evidence base for BPC-157 look like overall?',
    a: 'The evidence base is almost entirely preclinical. Studies span multiple tissue contexts and consistently report positive findings in rodent models — which has driven significant research interest — but no controlled human clinical trials have been completed. The translation from rodent to human remains unproven, and any use in humans is outside approved medical practice.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BPC157Page() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline:
      'BPC-157: Mechanism, Evidence Quality, and Synthesis Reference',
    description:
      'Comprehensive research reference for BPC-157 — proposed VEGFR2/NO/growth-factor mechanisms, preclinical evidence summary, synthesis context, and comparison with TB-500.',
    url: `${SITE}/bpc-157`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: [
      { '@type': 'Drug', name: 'BPC-157', alternateName: 'Body Protective Compound 157' },
      { '@type': 'Drug', name: 'TB-500', alternateName: 'Thymosin Beta-4 fragment' },
    ],
    audience: { '@type': 'MedicalAudience', audienceType: 'MedicalResearcher' },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'BPC-157 Research', item: `${SITE}/bpc-157` },
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
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">
          Home
        </Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">BPC-157</span>
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
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3 py-1 text-[11px] font-medium text-accent">
              <FlaskConical className="h-3 w-3" />
              Healing &amp; Repair · 15 residues
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1 text-[11px] font-medium text-amber-400">
              <ShieldAlert className="h-3 w-3" />
              Preclinical only — no human trials
            </span>
          </div>
          <h1 className="mb-4 mt-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            BPC-157
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              {' '}Research Guide
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            Body Protective Compound 157 is a synthetic 15-amino-acid
            peptide derived from a cytoprotective protein in human gastric
            juice. It is the most studied non-approved tissue-repair research
            peptide, with a substantial preclinical literature and no
            completed human clinical trials.
          </p>
          <p className="mt-3 text-xs text-ink/30">
            Research and educational reference only. Not medical advice,
            dosing guidance, or an offer for sale.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          {/* ── Main Column ── */}
          <div className="space-y-16">

            {/* What it is */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                What BPC-157 is
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
                <p>
                  BPC-157 is a synthetic pentadecapeptide — a 15-amino-acid
                  chain (sequence: GEPPPGKPADDAGLV) derived from a protective
                  protein (BPC) isolated from human gastric juice. It is not
                  a fragment of any approved drug; it has no endogenous
                  equivalent circulating in the body at pharmacological
                  concentrations.
                </p>
                <p>
                  The compound entered the research literature primarily
                  through work from a Croatian laboratory in the 1990s–2000s
                  and has since generated a substantial body of rodent
                  experiments across multiple tissue contexts. Its short
                  sequence makes it inexpensive to synthesize, which partly
                  explains its outsized presence in the non-approved
                  research-peptide literature: accessible cost lowers the
                  barrier for preclinical investigation.
                </p>
                <p>
                  It is not approved by the FDA or any major regulatory
                  agency for any indication. It is prohibited by the World
                  Anti-Doping Agency (WADA). Its status in the compounding
                  pharmacy context has been contested.
                </p>
              </div>
            </section>

            {/* Proposed mechanisms */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Proposed mechanisms
              </h2>
              <p className="mb-6 text-xs text-ink/30">
                None fully established in humans; based on cell culture and
                rodent experiments
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {MECHANISMS.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5"
                    style={{ borderTopColor: m.color, borderTopWidth: 2 }}
                  >
                    <div
                      className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${m.color}18`, color: m.color }}
                    >
                      {m.icon}
                    </div>
                    <p className="mb-2 text-sm font-semibold" style={{ color: m.color }}>
                      {m.label}
                    </p>
                    <p className="text-xs leading-relaxed text-ink/50">{m.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Evidence table */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Evidence summary
              </h2>
              <p className="mb-5 text-xs text-ink/30">
                All completed studies are in cell or animal models
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-xs text-ink/35">
                      <th className="pb-3 pr-4 font-medium">Research context</th>
                      <th className="pb-3 pr-4 font-medium">Model</th>
                      <th className="pb-3 pr-4 font-medium">Reported finding</th>
                      <th className="pb-3 font-medium">Evidence level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {EVIDENCE_TABLE.map((row) => (
                      <tr key={row.context} className="hover:bg-ink/[0.02]">
                        <td className="py-3 pr-4 text-sm font-medium text-ink/80">
                          {row.context}
                        </td>
                        <td className="py-3 pr-4 text-xs text-ink/50">{row.model}</td>
                        <td className="py-3 pr-4 text-xs leading-relaxed text-ink/55">
                          {row.finding}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              row.quality === 'None'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {row.quality}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* BPC-157 vs TB-500 */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                BPC-157 vs TB-500
              </h2>
              <p className="mb-5 text-xs text-ink/30">
                Two distinct peptides frequently studied in overlapping
                contexts — different sequences, different mechanisms
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/[0.06] text-left text-xs text-ink/35">
                      <th className="pb-3 pr-4 font-medium w-32">Dimension</th>
                      <th className="pb-3 pr-4 font-medium">
                        <span className="text-accent">BPC-157</span>
                      </th>
                      <th className="pb-3 font-medium">
                        <span className="text-accent-indigo">TB-500</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/[0.04]">
                    {VS_TB500.map((row) => (
                      <tr key={row.dim} className="hover:bg-ink/[0.02]">
                        <td className="py-3 pr-4 text-xs font-medium text-ink/40">
                          {row.dim}
                        </td>
                        <td className="py-3 pr-4 text-xs text-ink/65">{row.bpc}</td>
                        <td className="py-3 text-xs text-ink/65">{row.tb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink/30">
                The two compounds are often compared because they appear in
                overlapping tissue-repair research contexts, but their
                sequences, targets, and proposed mechanisms are unrelated.
              </p>
            </section>

            {/* Synthesis quality */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Synthesis quality and purity
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
                <p>
                  BPC-157&rsquo;s 15-residue length places it at the short end of
                  research peptides, making synthesis comparatively
                  inexpensive. That accessibility is part of its appeal for
                  preclinical researchers — but it is also precisely why the
                  market carries a high proportion of low-quality material.
                </p>
                <p>
                  Short peptides require fewer coupling cycles but are not
                  inherently pure. Common quality failures include truncation
                  sequences (incomplete assembly), oxidation at methionine
                  (if present in related analogs), and outright adulteration
                  with filler. The only reliable quality check is a
                  batch-specific certificate of analysis with identity
                  confirmation by mass spectrometry and purity by
                  reversed-phase HPLC — not an aggregate COA, not a
                  manufacturer&rsquo;s certificate applied to multiple lots.
                </p>
                <Link
                  href="/synthesis"
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent"
                >
                  How research peptides are synthesized and characterized
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Frequently asked questions
              </h2>
              <div className="space-y-5">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5"
                  >
                    <p className="mb-2 text-sm font-semibold text-ink/90">{faq.q}</p>
                    <p className="text-sm leading-relaxed text-ink/55">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <div className="text-xs leading-relaxed text-ink/45">
                <strong className="text-ink/60">Research reference only.</strong>{' '}
                BPC-157 is not approved for any medical use. The evidence base
                is preclinical; controlled human efficacy data do not exist.
                Nothing on this page constitutes medical advice, dosing
                guidance, or an offer for sale. Consult a licensed medical
                professional before making any health-related decision.
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Catalog entries */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Catalog entries
              </p>
              {[
                { slug: 'bpc-157', label: 'BPC-157', sub: '15 AA · VEGFR2 / NO', color: '#2DD4A8' },
                { slug: 'tb-500', label: 'TB-500', sub: '7 AA · Actin / cytoskeletal', color: '#818CF8' },
                { slug: 'ghk-cu', label: 'GHK-Cu', sub: 'Tripeptide · ECM remodeling', color: '#FB923C' },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={`/catalog/${item.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                >
                  <div>
                    <p className="text-sm font-medium transition-colors group-hover:text-accent"
                       style={{ color: item.color }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-ink/30">{item.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 transition-colors group-hover:text-accent" />
                </Link>
              ))}
            </div>

            {/* Related resources */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Related resources
              </p>
              {[
                { href: '/compare/bpc-157-vs-tb-500', label: 'BPC-157 vs TB-500', sub: 'Head-to-head comparison' },
                { href: '/research-areas/wound-healing', label: 'Wound Healing & Tissue Repair', sub: 'Research area guide' },
                { href: '/catalog/category/healing-repair', label: 'Healing & Repair peptides', sub: 'Full category' },
                { href: '/trials', label: 'Peptide clinical trials', sub: 'Search ClinicalTrials.gov' },
                { href: '/glossary/vegf', label: 'VEGF definition', sub: 'Glossary entry' },
                { href: '/learn/compatibility', label: 'Stability & compatibility', sub: 'Handling guide' },
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
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 group-hover:text-ink/50" />
                </Link>
              ))}
            </div>

            {/* Where to source — trust-ranked directory (hidden on the app build) */}
            <SourcingCard slugs={['bpc-157', 'tb-500', 'ghk-cu']} />

            {/* Research agent CTA */}
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5">
              <p className="mb-1 text-sm font-semibold text-ink/80">
                Ask the Peptide Agent
              </p>
              <p className="mb-4 text-xs leading-relaxed text-ink/40">
                Get citation-backed answers about BPC-157 mechanisms, trial
                status, and related compounds.
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
