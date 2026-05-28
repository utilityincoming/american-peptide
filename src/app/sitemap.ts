import type { MetadataRoute } from 'next'
import { PEPTIDES, CATEGORIES } from '@/lib/peptides'

const SITE = 'https://www.americanpeptide.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/catalog',
    '/research',
    '/compounds',
    '/compounds/builder',
    '/trials',
    '/tools/reconstitution-calculator',
  ].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE}/catalog/category/${c.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const peptideRoutes = PEPTIDES.map((p) => ({
    url: `${SITE}/catalog/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...peptideRoutes]
}
