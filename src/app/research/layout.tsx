import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Research Agent — AI-Powered Queries | AmericanPeptide.com',
  description:
    'Ask the AI research agent about peptide mechanisms, synthesis, clinical evidence, and compound profiles — citation-backed answers sourced from PubMed, PubChem, and ClinicalTrials.gov.',
  alternates: { canonical: `${SITE}/research` },
  openGraph: {
    title: 'Peptide Research Agent — AI-Powered Queries',
    description:
      'AI-powered peptide research with citation-backed answers — mechanisms, synthesis, clinical evidence, compound profiles.',
    url: `${SITE}/research`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Research Agent | AmericanPeptide.com',
    description:
      'AI-powered research agent for peptide mechanisms, clinical evidence, and synthesis — citation-backed answers.',
  },
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
