import type { Metadata } from 'next'

// Personal, per-browser page — no shareable content, so keep it out of search.
export const metadata: Metadata = {
  title: 'Your Workspace — AmericanPeptide.com',
  description:
    'Your private peptide research workspace: a watchlist with the latest trials and publications, and your saved Design-Lab sequences. Stored only in your browser.',
  robots: { index: false, follow: false },
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
