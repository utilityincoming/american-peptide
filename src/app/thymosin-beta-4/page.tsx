import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react'
import ThymosinBeta4Figure from '@/components/ThymosinBeta4Figure'
import SourcingCard from '@/components/SourcingCard'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Thymosin β4 — Actin, Ac-SDKP, and TB-500',
  description:
    'Thymosin β4 holds the cell’s G-actin pool. Ac-SDKP is the clipped N-terminus. TB-500 is only residues 17–23. A research reference that keeps the three molecules apart.',
  alternates: { canonical: `${SITE}/thymosin-beta-4` },
  keywords: [
    'thymosin beta 4',
    'thymosin β4',
    'Tβ4',
    'TB-500',
    'Ac-SDKP',
    'LKKTETQ',
    'actin sequestration',
  ],
  openGraph: {
    title: 'Thymosin β4 — Actin buffer, Ac-SDKP, and the TB-500 fragment',
    description:
      'What the 43-residue peptide does, which papers belong to Ac-SDKP, and why TB-500 is not the same molecule.',
    url: `${SITE}/thymosin-beta-4`,
    type: 'article',
  },
}

const PIECES = [
  {
    name: 'Thymosin β4',
    span: '43 residues',
    role: 'Binds one G-actin monomer and keeps it out of the filament until the cell moves.',
  },
  {
    name: 'Ac-SDKP',
    span: 'Residues 1–4',
    role: 'Clipped from the N-terminus. This is the peptide in the fibrosis and NF-κB papers.',
  },
  {
    name: 'TB-500',
    span: 'Residues 17–23',
    role: 'The LKKTETQ actin motif, synthesized on its own. It does not include Ac-SDKP.',
  },
]

export default function ThymosinBeta4Page() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is thymosin β4?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A 43-residue peptide that sequesters monomeric actin. Cells draw on that pool when they build filament to migrate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is TB-500 the same as thymosin β4?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. TB-500 is residues 17–23 (LKKTETQ). Thymosin β4 is the full chain and the source of Ac-SDKP.',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <nav className="mb-8 flex items-center gap-2 text-xs text-ink/55">
            <Link href="/" className="hover:text-ink/70">Home</Link>
            <span>/</span>
            <span>Thymosin β4</span>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Healing & repair</p>
          <h1 className="mb-5 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Thymosin β4 is an actin buffer with two other peptides hiding in the sequence.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-ink/65">
            One chain. Three things the literature treats as interchangeable. The intact
            43-mer holds G-actin. The first four residues, once clipped, are Ac-SDKP. Residues
            17–23 are what gets bottled as TB-500.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200/80">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Research reference. Thymosin β4 is not FDA-approved. Early wound trials exist;
              they are not a dosing guide.
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Where the chain acts</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-ink/55">
          The left side is the sequestered monomer. The right side is the filament a cell
          builds after that monomer is released. The map underneath marks the two fragments
          that have their own names.
        </p>
        <div className="rounded-2xl border border-hairline bg-fill p-4 text-ink md:p-6">
          <ThymosinBeta4Figure />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-12 md:grid-cols-3 md:px-10">
        {PIECES.map((p) => (
          <div key={p.name} className="rounded-2xl border border-hairline bg-fill p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">{p.span}</p>
            <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.role}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">What the papers actually dosed</h2>
              <div className="space-y-4 text-sm leading-relaxed text-ink/65">
                <p>
                  Platelets carry a large store of thymosin β4. In culture and in rodent wounds,
                  adding the full peptide speeds re-epithelialization and new-vessel growth. The
                  usual reading is cytoskeletal: more monomer on hand, faster actin assembly at
                  the leading edge. Corneal and dermal models are the cleanest of these. Cardiac
                  injury models exist and are still preclinical.
                </p>
                <p>
                  Ac-SDKP is generated when prolyl oligopeptidase cuts the acetylated N-terminus.
                  Its papers track NF-κB, TGF-β, and collagen in heart and kidney. That is a
                  different experiment from “cells migrate faster.” Citing a fibrosis result as
                  evidence for TB-500 swaps the molecule.
                </p>
                <p>
                  Human evidence is early wound studies, not an approved indication. Sport
                  authorities prohibit thymosin β4 and the fragment together. Neither fact is a
                  potency claim.
                </p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">Read the sequence on the label</h2>
              <p className="text-sm leading-relaxed text-ink/65">
                A 43-residue acetylated chain and a 7-residue motif are both sold under names
                that collapse into “TB-500.” The certificate should print the sequence. If it
                says LKKTETQ, you have the motif. If it lists the 43-mer beginning SDKP, you
                have thymosin β4. Mass and acetylation status belong on that same page — the
                acetyl group is part of the endogenous protein.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/catalog/thymosin-beta-4" className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent">
                  Catalog monograph <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/catalog/tb-500" className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink/60">
                  TB-500 monograph
                </Link>
                <Link href="/compare/bpc-157-vs-tb-500" className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink/60">
                  BPC-157 vs TB-500
                </Link>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {[
              { href: '/catalog/thymosin-beta-4', label: 'Thymosin β4', sub: '43 aa · UniProt P62328' },
              { href: '/catalog/tb-500', label: 'TB-500', sub: 'LKKTETQ only' },
              { href: '/immune-peptides', label: 'Immune peptides', sub: 'Why Tβ4 is not thymosin α1' },
              { href: '/bpc-157', label: 'BPC-157', sub: 'Perfusion, not actin' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl border border-hairline bg-fill px-4 py-3 hover:border-ink/20">
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-ink/50">{item.sub}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ink/30" />
              </Link>
            ))}
            <SourcingCard slugs={['tb-500']} accent="#A6F0CC" />
          </aside>
        </div>
      </section>
    </div>
  )
}
