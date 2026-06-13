import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Mail, MessageSquare, Send } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

const SITE = 'https://www.americanpeptide.com'

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

const lanes = [
  {
    Icon: MessageSquare,
    title: 'Peptide Agent feedback',
    body: 'Flag a wrong answer, a missing study, or a peptide we should add. The fastest path is the Telegram channel.',
  },
  {
    Icon: Mail,
    title: 'Catalog & data',
    body: 'Corrections to a catalog entry, questions about the open API, or attribution for reuse under CC BY 4.0.',
  },
  {
    Icon: Send,
    title: 'Partnerships & press',
    body: 'Suppliers, labs, collaborators, and journalists — tell us what you have in mind and we’ll route it.',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Breadcrumb (nested under About) ── */}
      <header className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3 text-sm md:px-6">
        <Link
          href="/about"
          className="text-white/50 transition-colors hover:text-white"
        >
          About
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-white/30" />
        <span className="font-medium text-white">Contact</span>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-white/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-3 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
            Get in touch
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55">
            We read everything. Corrections and Peptide Agent feedback get
            answered first — they make the platform better for everyone. For a
            real-time loop, the{' '}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2DD4A8] underline-offset-2 hover:underline"
            >
              Telegram channel
            </a>{' '}
            is the quickest way to reach us.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1.4fr]">
          {/* Left rail: lanes + Telegram */}
          <div className="space-y-4">
            {lanes.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-[#2DD4A8]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h2 className="mb-1.5 text-sm font-semibold">{title}</h2>
                <p className="text-xs leading-relaxed text-white/50">{body}</p>
              </div>
            ))}

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-[#2DD4A8]/20 bg-gradient-to-br from-[#2DD4A8]/[0.08] to-transparent p-5 transition-colors hover:border-[#2DD4A8]/40"
            >
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2DD4A8] text-[#0B1220]">
                <Send className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold">Telegram group</p>
                <p className="text-xs text-white/45">
                  Peptide Agent feedback · invite-only
                </p>
              </div>
            </a>
          </div>

          {/* Right: the form */}
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
