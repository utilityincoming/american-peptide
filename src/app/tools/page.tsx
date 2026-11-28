import type { Metadata } from 'next'
import Toolkit from '@/components/Toolkit'

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Browse the peptide sequence, catalog comparison, clinical trial, and lab tools.',
  alternates: { canonical: '/tools' },
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <Toolkit title="Tools" heading="h1" exclude={['/research', '/compounds']} />
    </main>
  )
}
