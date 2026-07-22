import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Agent — AI-Powered Peptide Research | AmericanPeptide.com',
  description:
    'Ask the Peptide Agent about peptide mechanisms, synthesis, clinical evidence, and compound profiles — citation-backed answers sourced from PubMed, PubChem, and ClinicalTrials.gov.',
  alternates: { canonical: `${SITE}/research` },
  openGraph: {
    title: 'Peptide Agent — AI-Powered Peptide Research',
    description:
      'AI-powered peptide research with citation-backed answers — mechanisms, synthesis, clinical evidence, compound profiles.',
    url: `${SITE}/research`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Agent | AmericanPeptide.com',
    description:
      'AI-powered Peptide Agent for peptide mechanisms, clinical evidence, and synthesis — citation-backed answers.',
  },
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
