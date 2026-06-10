import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Activity, AlertTriangle } from 'lucide-react'

const SITE = 'https://www.americanpeptide.com'
const url = `${SITE}/immune-peptides`

export const metadata: Metadata = {
  title: 'Immune Peptides Research Hub — Thymosin α1, LL-37, Thymosin β4',
  description:
    'Research overview of immune-modulating peptides: thymosin alpha-1 for T-cell activation, LL-37 cathelicidin for innate immunity, and thymosin β4 at the immune-repair interface.',
  alternates: { canonical: url },
  keywords: [
    'immune peptides research',
    'thymosin alpha 1',
    'LL-37 cathelicidin',
    'thymosin beta 4',
    'immunomodulatory peptides',
    'antimicrobial peptides research',
    'T-cell activation peptide',
    'thymalin peptide',
  ],
  openGraph: {
    title: 'Immune Peptides Research Hub — Thymosin α1, LL-37, Thymosin β4',
    description:
      'Innate and adaptive immune modulation: research context for thymosin α1, LL-37 cathelicidin, and thymosin β4.',
    url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immune Peptides Research Hub',
    description:
      'Innate and adaptive immune modulation: thymosin α1, LL-37, and thymosin β4 research context.',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Immune Peptides', item: url },
  ],
}

const medicalPageLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Immune Peptides Research Hub',
  description:
    'Research overview of peptides that modulate innate and adaptive immune function, including thymosin α1, LL-37 cathelicidin, and thymosin β4.',
  url,
  audience: { '@type': 'MedicalAudience', audienceType: 'Researcher' },
  medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Researcher' },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is thymosin alpha-1 and how does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Thymosin α1 is a 28-amino-acid peptide originally isolated from thymic tissue. In research models it activates dendritic cells, promotes T-cell maturation, and upregulates MHC class I expression. It is approved under the name Zadaxin in several countries for hepatitis B, hepatitis C, and adjunctive use in certain cancers, but is not FDA-approved in the United States.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is thymosin alpha-1 FDA approved?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Thymosin α1 (brand name Zadaxin) is approved in approximately 35 countries for specific indications but has not received FDA approval. It holds orphan-drug designation in the US for certain applications. Any use outside approved jurisdictions is investigational.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is LL-37 and what does it do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LL-37 is a 37-amino-acid cathelicidin — the only member of that antimicrobial peptide family identified in humans. It disrupts bacterial membranes, modulates Toll-like receptor (TLR) signaling, and promotes wound healing. Evidence is largely preclinical; a small number of Phase 1/2 studies have examined topical and intravenous formulations.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is thymosin β4 different from thymosin α1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Despite sharing the "thymosin" name, thymosin α1 and thymosin β4 are structurally and functionally distinct. Thymosin α1 is a thymic peptide that primarily modulates adaptive immunity (T-cell activation, dendritic-cell priming). Thymosin β4 sequesters G-actin monomers, drives tissue remodeling, and has anti-inflammatory properties via its Ac-SDKP fragment — it belongs to the healing and repair axis, not the thymic immunology axis.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is TB-500 and how does it relate to thymosin β4?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TB-500 is a synthetic peptide fragment corresponding to amino acids 17–23 of thymosin β4 (sequence: LKKTETQ). This fragment retains the actin-binding and tissue-repair activity associated with full-length Tβ4, while being shorter and easier to synthesize. It is a research chemical with no approved clinical use.',
      },
    },
    {
      '@type': 'Question',
      name: 'What evidence level exists for immune peptide research?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evidence varies by compound. Thymosin α1 has Phase 3 trial data and multi-country approval for specific indications. LL-37 is primarily preclinical with limited Phase 1/2 data. Thymosin β4 has Phase 1/2 wound-healing trial data. None are FDA-approved; all require further validation before clinical conclusions can be drawn from research findings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are immune peptides the same as immunosuppressants?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The peptides covered here are immunomodulatory, not broadly immunosuppressive. Thymosin α1 generally upregulates immune readiness (useful in immunocompromised states); LL-37 amplifies innate antimicrobial responses. Immunosuppressants reduce immune activity (e.g., for autoimmune disease or transplant rejection) — the mechanism is opposite.',
      },
    },
  ],
}

const compounds = [
  {
    slug: 'thymosin-alpha-1',
    name: 'Thymosin α1',
    axis: 'Adaptive Immunity',
    axisColor: '#60A5FA',
    receptor: 'TLR2 / TLR9 / DC surface',
    pathway: 'NF-κB, T-cell co-stimulation',
    chainLength: '28 aa',
    halfLife: '~2 hours (sc)',
    evidence: 'Phase 3 / Multi-country approval',
    evidenceLevel: 4,
    fda: 'Not approved (US)',
    keyAction: 'T-cell maturation, dendritic-cell activation, MHC I upregulation',
    note: 'Approved as Zadaxin in ~35 countries',
  },
  {
    slug: 'thymosin-beta-4',
    name: 'Thymosin β4',
    axis: 'Immune–Repair Bridge',
    axisColor: '#34D399',
    receptor: 'G-actin (sequestration), ILK',
    pathway: 'Actin dynamics, Ac-SDKP → anti-inflammatory',
    chainLength: '43 aa',
    halfLife: 'Unknown (endogenous)',
    evidence: 'Phase 1/2 (wound healing)',
    evidenceLevel: 2,
    fda: 'Not approved',
    keyAction: 'Actin sequestration, tissue remodeling, anti-inflammatory via Ac-SDKP',
    note: 'Mechanistically distinct from thymosin α1 — repair/actin axis',
  },
  {
    slug: 'll-37',
    name: 'LL-37',
    axis: 'Innate Immunity',
    axisColor: '#A78BFA',
    receptor: 'Bacterial membranes, TLR4 modulation, FPRL1',
    pathway: 'Membrane disruption, TLR signaling modulation',
    chainLength: '37 aa',
    halfLife: 'Minutes (plasma)',
    evidence: 'Preclinical / Phase 1',
    evidenceLevel: 1,
    fda: 'Not approved',
    keyAction: 'Antimicrobial membrane disruption, TLR modulation, wound healing',
    note: 'Only human cathelicidin',
  },
]

export default function ImmunePeptidesPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(96,165,250,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#60A5FA] opacity-[0.07] blur-[120px]"
        />

        <div className="relative mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">Home</Link>
            <span>/</span>
            <span className="text-white/60">Immune Peptides</span>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#60A5FA]/25 bg-[#60A5FA]/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
            <Shield className="h-3 w-3" />
            Immune Modulation Cluster
          </div>

          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Immune Peptides
            <br />
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#93C5FD] to-[#60A5FA] bg-clip-text text-transparent">
              Research Overview
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/60">
            Peptides that modulate immune function span two distinct axes: the{' '}
            <strong className="font-semibold text-white/80">adaptive immune system</strong> —
            T-cell maturation, dendritic-cell priming, antigen presentation — and the{' '}
            <strong className="font-semibold text-white/80">innate immune system</strong> —
            antimicrobial defense, pattern recognition, and rapid first-response signaling.
          </p>

          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-300/80">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong className="font-semibold text-amber-300">Research context only.</strong>{' '}
              None of these compounds are FDA-approved (with the exception of thymosin α1 in
              select non-US jurisdictions). All findings referenced are from published research;
              consult a licensed clinician before any clinical application.
            </span>
          </div>
        </div>
      </section>

      {/* ── Two-axis framing ── */}
      <section className="mx-auto max-w-5xl px-6 py-16 md:px-10">
        <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">Two Immune Axes</h2>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-white/50">
          Immune-modulating peptides divide cleanly by mechanism. Understanding which axis a
          compound acts on is the first step in interpreting research findings.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Adaptive */}
          <div className="rounded-2xl border border-[#60A5FA]/20 bg-[#60A5FA]/[0.04] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#60A5FA]/25 bg-[#60A5FA]/10 text-[#60A5FA]">
                <Shield className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#60A5FA]/70">
                  Axis 1
                </p>
                <h3 className="font-semibold">Adaptive Immunity</h3>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/55">
              The adaptive system learns and remembers. Peptides like thymosin α1 act on dendritic
              cells and T-cell progenitors, promoting differentiation from naïve to effector cells
              and upregulating MHC class I — the machinery that presents antigens to cytotoxic T
              lymphocytes.
            </p>
            <div className="space-y-1.5">
              {[
                'Thymosin α1 → dendritic-cell TLR2/TLR9 activation',
                'T-helper / T-cytotoxic differentiation',
                'MHC class I upregulation',
                'Antiviral and antifungal adjunct research',
              ].map((point) => (
                <div key={point} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#60A5FA]/60" />
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#60A5FA]/15 bg-[#60A5FA]/[0.05] px-3 py-2 text-xs text-[#60A5FA]/80">
              Primary compound: <strong className="text-[#60A5FA]">Thymosin α1</strong>
            </div>
          </div>

          {/* Innate */}
          <div className="rounded-2xl border border-[#A78BFA]/20 bg-[#A78BFA]/[0.04] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[#A78BFA]">
                <Zap className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A78BFA]/70">
                  Axis 2
                </p>
                <h3 className="font-semibold">Innate Immunity</h3>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/55">
              The innate system responds fast and non-specifically. Antimicrobial peptides like
              LL-37 disrupt pathogen membranes directly, modulate TLR signaling to calibrate the
              inflammatory response, and recruit immune cells to sites of infection or injury.
            </p>
            <div className="space-y-1.5">
              {[
                'LL-37 → bacterial and fungal membrane disruption',
                'TLR4 modulation — can dampen or amplify signaling',
                'Neutrophil and monocyte chemotaxis',
                'Anti-biofilm activity in vitro',
              ].map((point) => (
                <div key={point} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#A78BFA]/60" />
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#A78BFA]/15 bg-[#A78BFA]/[0.05] px-3 py-2 text-xs text-[#A78BFA]/80">
              Primary compound: <strong className="text-[#A78BFA]">LL-37 (cathelicidin)</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compound cards ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">Compound Profiles</h2>
        <p className="mb-8 text-sm text-white/50">
          Mechanism, evidence level, and key research context for each compound in this cluster.
        </p>

        <div className="space-y-5">
          {compounds.map((c) => (
            <div
              key={c.slug}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 md:p-8"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div
                    className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: c.axisColor }}
                  >
                    {c.axis}
                  </div>
                  <h3 className="text-xl font-bold">{c.name}</h3>
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                  style={{
                    borderColor: `${c.axisColor}33`,
                    backgroundColor: `${c.axisColor}0D`,
                    color: c.axisColor,
                  }}
                >
                  {c.evidence}
                </span>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-white/60">{c.keyAction}</p>

              {c.note && (
                <div className="mb-5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-xs text-white/50">
                  {c.note}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Chain', value: c.chainLength },
                  { label: 'Half-life', value: c.halfLife },
                  { label: 'Receptor', value: c.receptor },
                  { label: 'FDA status', value: c.fda },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">
                      {label}
                    </p>
                    <p className="text-xs font-medium text-white/70">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/catalog/${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
                >
                  Full catalog entry
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(c.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
                >
                  PubMed search ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Thymosin β4 bridge callout ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#34D399]/[0.04] p-6 md:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#34D399]/25 bg-[#34D399]/10 text-[#34D399]">
              <Activity className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#34D399]/70">
                Immune–Repair Interface
              </p>
              <h3 className="font-semibold">Thymosin β4 — a different mechanism entirely</h3>
            </div>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-white/60">
            Despite sharing the &ldquo;thymosin&rdquo; name, thymosin β4 (Tβ4) is{' '}
            <strong className="text-white/80">mechanistically unrelated</strong> to thymosin α1.
            Where thymosin α1 acts on immune-cell differentiation via TLR signaling, Tβ4 works
            by sequestering G-actin monomers — regulating cytoskeletal dynamics, wound healing,
            and angiogenesis. Its anti-inflammatory effects are largely mediated by the Ac-SDKP
            fragment, which inhibits NF-κB activation.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: 'G-actin sequestration',
                desc: 'Binds monomeric actin (Kd ~0.5 μM), regulating filament assembly and cell motility',
              },
              {
                label: 'Ac-SDKP fragment',
                desc: 'A tetrapeptide cleaved from the N-terminus; inhibits NF-κB and fibrosis markers',
              },
              {
                label: 'TB-500 synthetic fragment',
                desc: 'Residues 17–23 (LKKTETQ) — retains actin-binding activity, easier to synthesize',
              },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-xl border border-[#34D399]/15 bg-[#34D399]/[0.04] p-4">
                <p className="mb-1.5 text-xs font-semibold text-[#34D399]">{label}</p>
                <p className="text-xs leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/catalog/thymosin-beta-4"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#34D399]/20 px-3 py-1.5 text-xs font-medium text-[#34D399]/80 transition-colors hover:border-[#34D399]/40 hover:text-[#34D399]"
            >
              Thymosin β4 catalog entry <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/bpc-157"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
            >
              Healing & Repair cluster ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ── Evidence table ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Evidence Summary</h2>
        <p className="mb-6 text-sm text-white/50">
          Evidence levels across the immune cluster — matched to the{' '}
          <Link href="/learn/evidence-hierarchy" className="text-[#60A5FA] underline-offset-2 hover:underline">
            6-level evidence hierarchy
          </Link>
          .
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {['Compound', 'Axis', 'Highest evidence', 'Human trials', 'Approval status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'Thymosin α1',
                  axis: 'Adaptive',
                  axisColor: '#60A5FA',
                  evidence: 'Phase 3 / Approved (non-US)',
                  evidenceColor: 'text-emerald-400',
                  human: 'Yes — Phase 3 RCTs (hepatitis, melanoma)',
                  approval: 'Zadaxin (~35 countries); Not FDA-approved',
                },
                {
                  name: 'LL-37',
                  axis: 'Innate',
                  axisColor: '#A78BFA',
                  evidence: 'Preclinical / Phase 1',
                  evidenceColor: 'text-amber-400',
                  human: 'Limited — Phase 1 wound/topical studies',
                  approval: 'Not approved anywhere',
                },
                {
                  name: 'Thymosin β4',
                  axis: 'Repair bridge',
                  axisColor: '#34D399',
                  evidence: 'Phase 1/2 (wound healing)',
                  evidenceColor: 'text-blue-400',
                  human: 'Phase 1/2 wound-healing trials',
                  approval: 'Not approved',
                },
                {
                  name: 'TB-500 (Tβ4 fragment)',
                  axis: 'Repair bridge',
                  axisColor: '#34D399',
                  evidence: 'Preclinical',
                  evidenceColor: 'text-amber-400',
                  human: 'None',
                  approval: 'Not approved; WADA prohibited',
                },
              ].map((row, i) => (
                <tr
                  key={row.name}
                  className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                >
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: row.axisColor }}>
                      {row.axis}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${row.evidenceColor}`}>
                    {row.evidence}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/55">{row.human}</td>
                  <td className="px-4 py-3 text-xs text-white/55">{row.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqLd.mainEntity.map((item) => (
            <details
              key={item.name}
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-white/80 group-open:text-white">
                {item.name}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {item.acceptedAnswer.text}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Cluster nav ── */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:px-10">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">
            Other Research Clusters
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/glp-1', label: 'GLP-1 / Metabolic' },
              { href: '/gh-peptides', label: 'GH Axis' },
              { href: '/bpc-157', label: 'Healing & Repair' },
              { href: '/longevity-peptides', label: 'Longevity' },
              { href: '/cognitive-peptides', label: 'Cognitive' },
              { href: '/melanocortin', label: 'Melanocortin' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-white/15 hover:text-white/80"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mx-auto max-w-5xl border-t border-white/[0.06] px-6 py-8 text-center text-xs leading-relaxed text-white/25 md:px-10">
        This page is for research and educational purposes only. AmericanPeptide.com is not a
        medical device, does not provide medical advice, and does not sell compounds. All
        statements describe research findings, not clinical outcomes. Consult a licensed
        healthcare provider for any health-related decisions.
      </div>
    </div>
  )
}
