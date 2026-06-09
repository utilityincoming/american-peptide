import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Compass,
  Factory,
  GraduationCap,
} from 'lucide-react'
import { STAGES } from '@/lib/synthesis'
import { RESEARCH_AREAS } from '@/lib/research-areas'
import { GLOSSARY } from '@/lib/glossary'

const SITE = 'https://www.americanpeptide.com'

const RESOURCES = [
  {
    href: '/synthesis',
    Icon: Factory,
    label: 'Synthesis',
    description:
      'How a pure peptide is actually made — the full manufacturing pipeline, what the equipment and operations cost, and how purity holds across the cold chain.',
    meta: `${STAGES.length}-stage pipeline`,
  },
  {
    href: '/learn/compatibility',
    Icon: Beaker,
    label: 'Compatibility & Stability',
    description:
      'The chemistry of what can be combined and what degrades peptides — reconstitution, storage, and why blending un-characterized peptides multiplies risk.',
    meta: 'guide + beta tools',
  },
  {
    href: '/research-areas',
    Icon: Compass,
    label: 'Research Areas',
    description:
      'Browse peptides by what they’re studied for — the indication or use case — with the underlying biology and every matching catalog entry.',
    meta: `${RESEARCH_AREAS.length} areas`,
  },
  {
    href: '/glossary',
    Icon: BookOpen,
    label: 'Glossary',
    description:
      'The vocabulary of peptide science in plain English — COA, HPLC, lyophilization, endotoxin, and more — each cross-linked to where it matters.',
    meta: `${GLOSSARY.length} terms`,
  },
] as const

export const metadata: Metadata = {
  title: 'Learn — Peptide Science, Synthesis & Terminology | AmericanPeptide.com',
  description:
    'Start here to understand research peptides: how they’re manufactured, what they’re studied for, and the terminology that lets you read a certificate of analysis with confidence.',
  alternates: { canonical: `${SITE}/learn` },
  openGraph: {
    title: 'Learn — Peptide Science, Synthesis & Terminology',
    description:
      'Understand research peptides: how they’re made, what they’re studied for, and the terminology to read a COA with confidence.',
    url: `${SITE}/learn`,
    type: 'website',
  },
}

export default function LearnPage() {
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Learn — Peptide Science',
    description:
      'Educational resources on peptide synthesis, research areas, and terminology.',
    url: `${SITE}/learn`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: RESOURCES.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: r.label,
        url: `${SITE}${r.href}`,
      })),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE}/learn` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <GraduationCap className="h-4 w-4 text-[#2DD4A8]" />
          Learn
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Learn the{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              science behind the vial
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Everything you need to evaluate research peptides like a
            professional — how they’re manufactured, what they’re studied for,
            and the terminology that turns a certificate of analysis from
            jargon into a decision you can trust.
          </p>
        </div>
      </section>

      {/* ── Resource cards ── */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map(({ href, Icon, label, description, meta }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#2DD4A8]/25 hover:bg-white/[0.04] hover:shadow-[0_18px_50px_-12px_rgba(45,212,168,0.12)]"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-[#2DD4A8]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">
                  {label}
                </h2>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/40">
                  {meta}
                </span>
              </div>
              <p className="mb-5 flex-1 text-[13px] leading-relaxed text-white/50">
                {description}
              </p>
              <span className="flex items-center gap-1 text-[11px] text-[#2DD4A8]/70 transition-colors group-hover:text-[#2DD4A8]">
                Open
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-amber-400/65">
            <span className="font-semibold text-amber-400/85">
              Research use only.
            </span>{' '}
            These resources are educational references, not medical advice,
            dosing protocols, or offers for sale. Independent validation
            required for any experimental use.
          </p>
        </div>
      </section>
    </div>
  )
}
