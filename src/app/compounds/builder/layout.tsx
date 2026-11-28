import { PEPTIDE_FORGE } from '@/lib/page-meta'
import type { Metadata } from 'next'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'

// PeptideForge is an interactive learning game (XP/levels/challenges), not an
// indexable content surface — it has no server-rendered text to rank and would
// read as thin content. Keep it for users, but noindex it (follow:true so it
// still passes link equity to the catalog/tools it links out to).
export const metadata: Metadata = {
  title: PEPTIDE_FORGE.label,
  description: PEPTIDE_FORGE.description,
  alternates: { canonical: PEPTIDE_FORGE.href },
  robots: { index: false, follow: true },
}

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Compound Search', path: '/compounds' },
    { name: PEPTIDE_FORGE.label, path: PEPTIDE_FORGE.href },
  ])
  const jsonLd = webApplicationJsonLd({
    name: PEPTIDE_FORGE.label,
    description: PEPTIDE_FORGE.description,
    path: PEPTIDE_FORGE.href,
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
