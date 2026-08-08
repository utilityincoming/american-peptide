import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Melanocortin Agonist Research Hub | AmericanPeptide.com',
  description:
    'Deep-dive reference for melanocortin receptor agonists — FDA-approved drugs (bremelanotide, setmelanotide, afamelanotide), MC1R–MC5R receptor biology, and the investigational pipeline.',
  alternates: { canonical: `${SITE}/melanocortin` },
  openGraph: {
    title: 'Melanocortin Agonist Research Hub',
    description:
      'FDA-approved melanocortin drugs, MC1R–MC5R receptor biology, binding profiles, and the clinical pipeline.',
    url: `${SITE}/melanocortin`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melanocortin Agonist Research Hub | AmericanPeptide.com',
    description:
      'FDA-approved melanocortin drugs, receptor biology (MC1R–MC5R), and the investigational pipeline.',
  },
}

export default function MelanocortinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
