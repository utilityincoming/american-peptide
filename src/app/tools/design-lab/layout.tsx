import { DESIGN_LAB } from '@/lib/page-meta'
import type { Metadata } from 'next'
import { breadcrumbJsonLd, webApplicationJsonLd } from '@/lib/schema'

export const metadata: Metadata = {
  title: DESIGN_LAB.label,
  description: DESIGN_LAB.description,
  alternates: { canonical: DESIGN_LAB.href },
  robots: { index: false, follow: false },
}

export default function DesignLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: DESIGN_LAB.label, path: DESIGN_LAB.href },
  ])
  const jsonLd = webApplicationJsonLd({
    name: DESIGN_LAB.label,
    description: DESIGN_LAB.description,
    path: DESIGN_LAB.href,
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}
