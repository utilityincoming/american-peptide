import type { Metadata } from 'next'

const SITE = 'https://americanpeptide.com'

export const metadata: Metadata = {
  title: 'Protocol Tracker (Beta) — AmericanPeptide.com',
  description:
    'A private, local-first bench logbook — record what a research protocol consisted of, plan its cadence, and track vials from sealed to empty with a live cost-per-dose. All data stays in your browser.',
  alternates: { canonical: `${SITE}/tools/tracker` },
  // Private + in-development surface, so kept out of search on two counts. The
  // tracker stores everything locally in the visitor's browser (nothing is
  // server-rendered to index), which is the same reason /workspace is noindex;
  // and like the other /tools betas it stays out of the index until it
  // graduates. follow:false because there is nothing here to crawl onward to.
  // Consequently it is absent from sitemap.ts by design — a noindex page must
  // never be advertised for crawling.
  robots: { index: false, follow: false },
}

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
