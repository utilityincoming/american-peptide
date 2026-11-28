import type { Metadata } from 'next'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'

const SITE = 'https://americanpeptide.com'

// PeptideForge is an interactive learning game (XP/levels/challenges), not an
// indexable content surface — it has no server-rendered text to rank and would
// read as thin content. Keep it for users, but noindex it (follow:true so it
// still passes link equity to the catalog/tools it links out to).
export const metadata: Metadata = {
  title: 'PeptideForge — Interactive Peptide Builder',
  description:
    'Build a peptide residue by residue and watch its chemistry update live — an interactive learning tool with challenges and XP.',
  alternates: { canonical: `${SITE}/compounds/builder` },
  robots: { index: false, follow: true },
}

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Compounds', path: '/compounds' },
    { name: 'PeptideForge', path: '/compounds/builder' },
  ])
  const jsonLd = webApplicationJsonLd({
    name: 'PeptideForge',
    description: 'Interactive peptide builder that updates molecular properties as residues change.',
    path: '/compounds/builder',
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
