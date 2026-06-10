import type { Metadata } from 'next'

const SITE = 'https://www.americanpeptide.com'
const url = `${SITE}/trials`

const medicalPageLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Peptide Clinical Trials — ClinicalPulse',
  description:
    'Search active and completed clinical trials for research peptides — semaglutide, tirzepatide, retatrutide, BPC-157, and more. Powered by ClinicalTrials.gov.',
  url,
  audience: { '@type': 'MedicalAudience', audienceType: 'Researcher' },
  medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Researcher' },
}

const datasetLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Peptide Clinical Trials Index',
  description:
    'A searchable index of peptide-related clinical trials drawn from ClinicalTrials.gov, covering GLP-1 agonists, GH secretagogues, healing peptides, melanocortin compounds, and more.',
  url,
  keywords: [
    'peptide clinical trials',
    'semaglutide trials',
    'tirzepatide trials',
    'BPC-157 trials',
    'research peptides clinical data',
  ],
  isAccessibleForFree: true,
  license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  provider: {
    '@type': 'Organization',
    name: 'ClinicalTrials.gov',
    url: 'https://clinicaltrials.gov',
  },
  creator: {
    '@type': 'Organization',
    name: 'AmericanPeptide.com',
    url: SITE,
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Clinical Trials', item: url },
  ],
}

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  )
}
