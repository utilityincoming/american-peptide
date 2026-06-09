import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Peptide Clinical Trials — ClinicalPulse | AmericanPeptide.com',
  description:
    'Search active and completed clinical trials for research peptides — semaglutide, tirzepatide, retatrutide, BPC-157, and more. Filter by phase, status, and indication. Powered by ClinicalTrials.gov.',
  alternates: { canonical: `${SITE}/trials` },
  openGraph: {
    title: 'Peptide Clinical Trials — ClinicalPulse',
    description:
      'Search active and completed clinical trials for research peptides by compound, phase, and status. Powered by ClinicalTrials.gov.',
    url: `${SITE}/trials`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Clinical Trials — ClinicalPulse | AmericanPeptide.com',
    description:
      'Search active and completed clinical trials for semaglutide, tirzepatide, retatrutide, and 100+ research peptides.',
  },
}

export default function TrialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
