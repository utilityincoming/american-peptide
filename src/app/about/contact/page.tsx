import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

const SITE = 'https://americanpeptide.com'

const TELEGRAM_URL = 'https://t.me/+17FKLWux_OQyOGEx'

export const metadata: Metadata = {
  title: 'Contact — AmericanPeptide.com',
  description:
    'Reach the AmericanPeptide.com team: Peptide Agent feedback, catalog corrections, data and API questions, partnership and supplier inquiries, or press.',
  alternates: { canonical: `${SITE}/about/contact` },
  openGraph: {
    title: 'Contact AmericanPeptide.com',
    description:
      'Peptide Agent feedback, catalog corrections, data questions, and partnership inquiries.',
    url: `${SITE}/about/contact`,
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Breadcrumb (nested under About) ── */}
      <header className="flex items-center gap-1.5 border-b border-ink/[0.06] px-4 py-3 text-sm md:px-6">
        <Link
          href="/about"
          className="text-ink/50 transition-colors hover:text-ink"
        >
          About
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
        <span className="font-medium text-ink">Contact</span>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-ink/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-3 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
            Get in touch
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/55">
            We read everything. Corrections and Peptide Agent feedback get
            answered first — they make the platform better for everyone. For a
            real-time loop, the{' '}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Telegram channel
            </a>{' '}
            is the quickest way to reach us.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
