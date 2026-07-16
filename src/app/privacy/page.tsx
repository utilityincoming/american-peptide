import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock } from 'lucide-react'

const SITE = 'https://americanpeptide.com'

// Keep this date current whenever the policy materially changes — Google Play
// and app stores cross-check the "last updated" date against listing reviews.
const LAST_UPDATED = 'June 21, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy | AmericanPeptide.com',
  description:
    'How AmericanPeptide.com collects, uses, and protects information across the website and Android app — analytics, the research assistant, and the data we deliberately do not collect.',
  alternates: { canonical: `${SITE}/privacy` },
  openGraph: {
    title: 'Privacy Policy — AmericanPeptide.com',
    description:
      'How AmericanPeptide.com handles data across the website and app.',
    url: `${SITE}/privacy`,
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Lock className="h-4 w-4 text-accent" />
          Privacy Policy
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-ink/[0.06] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-ink/45">Last updated: {LAST_UPDATED}</p>
          <p className="mt-5 text-sm leading-relaxed text-ink/65 md:text-[15px]">
            This policy explains what information AmericanPeptide.com
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use our
            website and our Android application, how we use it, and the choices
            you have. It applies to both the site at americanpeptide.com and the
            app, which loads the same service. We built this product to be a
            research reference, and we collect as little as we can to run it.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* The short version */}
          <Block title="The short version">
            <ul className="space-y-2">
              <Bullet>
                We do <strong>not</strong> sell or rent your personal
                information to anyone.
              </Bullet>
              <Bullet>
                We use privacy-respecting analytics to understand how the
                product is used.
              </Bullet>
              <Bullet>
                If you use the research assistant, what you type is sent to our
                server and an AI provider to generate a response.
              </Bullet>
              <Bullet>
                We only collect personal details (like your email) when you
                choose to give them to us — for example, joining a waitlist or
                contacting us.
              </Bullet>
              <Bullet>
                The app is intended for adults (18+). It is a research and
                education tool, not medical advice.
              </Bullet>
            </ul>
          </Block>

          {/* Information we collect */}
          <Block title="Information we collect">
            <p className="mb-3">
              <SubHead>Usage and performance analytics.</SubHead> We use Vercel
              Analytics and Vercel Speed Insights to measure aggregate traffic
              and page performance. This includes information such as pages
              visited, referring site, approximate region, device and browser
              type, and performance timings. These analytics are designed to be
              privacy-friendly and are used in aggregate; we do not use them to
              build advertising profiles.
            </p>
            <p className="mb-3">
              <SubHead>Research assistant content.</SubHead> When you submit a
              question to the research assistant, the text of your message is
              sent to our server and to a third-party AI provider (Anthropic,
              which operates Claude) so that a response can be generated. We use
              this content to produce your answer and to operate and improve the
              feature. Please do not enter personal, confidential, or sensitive
              information into the assistant.
            </p>
            <p className="mb-3">
              <SubHead>Information you provide.</SubHead> If you join a waitlist,
              submit the contact form, or otherwise reach out, we collect what
              you send us — typically your email address and your message — so we
              can respond and, where applicable, add you to the list you
              requested.
            </p>
            <p>
              <SubHead>Local device storage.</SubHead> The app and site may store
              preferences and offline data on your device (for example, to make
              the calculators and reference work offline). This stays on your
              device and is not personal information we collect about you.
            </p>
          </Block>

          {/* What we do NOT collect */}
          <Block title="What we do not collect">
            <ul className="space-y-2">
              <Bullet>
                We do not collect health records, diagnoses, or medical history.
              </Bullet>
              <Bullet>
                We do not collect precise location, contacts, photos, or
                financial account information.
              </Bullet>
              <Bullet>
                We do not request device permissions such as camera, microphone,
                or location.
              </Bullet>
              <Bullet>We do not sell your personal information.</Bullet>
            </ul>
          </Block>

          {/* How we use information */}
          <Block title="How we use information">
            <ul className="space-y-2">
              <Bullet>To operate, maintain, and secure the service.</Bullet>
              <Bullet>
                To generate responses from the research assistant.
              </Bullet>
              <Bullet>
                To understand usage in aggregate and improve performance and
                features.
              </Bullet>
              <Bullet>
                To respond to your messages and manage lists you ask to join.
              </Bullet>
              <Bullet>
                To comply with legal obligations and enforce our terms.
              </Bullet>
            </ul>
          </Block>

          {/* Sharing */}
          <Block title="How information is shared">
            <p className="mb-3">
              We share information only with service providers who help us run
              the product, and only as needed to provide it:
            </p>
            <ul className="space-y-2">
              <Bullet>
                <strong>Hosting &amp; analytics:</strong> Vercel (hosting,
                analytics, and performance insights).
              </Bullet>
              <Bullet>
                <strong>AI processing:</strong> Anthropic, to generate research
                assistant responses from the text you submit.
              </Bullet>
              <Bullet>
                <strong>Legal:</strong> when required by law, or to protect the
                rights, safety, and security of our users and the service.
              </Bullet>
            </ul>
            <p className="mt-3">
              Reference content in the app is drawn from public scientific
              databases (including PubChem, UniProt, PubMed, and
              ClinicalTrials.gov). Querying that reference data does not send
              your personal information to those sources.
            </p>
          </Block>

          {/* Data security & retention */}
          <Block title="Data security and retention">
            <p className="mb-3">
              All traffic is encrypted in transit (HTTPS). We retain information
              only as long as needed for the purposes described here — for
              example, to operate the service, answer your message, or keep you
              on a list you joined — and then delete or anonymize it. No system
              is perfectly secure, but we take reasonable measures to protect
              your information.
            </p>
          </Block>

          {/* Your choices */}
          <Block title="Your choices and rights">
            <p className="mb-3">
              Depending on where you live, you may have rights to access,
              correct, or delete personal information we hold about you, or to
              opt out of certain processing. To make a request, contact us at
              the address below and we will respond as required by applicable
              law. You can stop providing information to the assistant at any
              time by not using it, and you can ask us to remove you from any
              list you joined.
            </p>
          </Block>

          {/* Children */}
          <Block title="Children's privacy">
            <p>
              The service is intended for adults (18 years and older). It is not
              directed to children, and we do not knowingly collect personal
              information from children. If you believe a child has provided us
              information, contact us and we will delete it.
            </p>
          </Block>

          {/* International */}
          <Block title="International users">
            <p>
              We operate from the United States, and our service providers may
              process information in the United States and other countries. By
              using the service, you understand that your information may be
              processed in countries whose data-protection laws may differ from
              those in your country.
            </p>
          </Block>

          {/* Changes */}
          <Block title="Changes to this policy">
            <p>
              We may update this policy from time to time. When we make material
              changes, we will update the &ldquo;Last updated&rdquo; date above
              and, where appropriate, provide additional notice within the
              service.
            </p>
          </Block>

          {/* Contact */}
          <Block title="Contact us">
            <p>
              Questions about this policy or your information? Email us at{' '}
              <a
                href="mailto:americanpeptides@gmail.com"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                americanpeptides@gmail.com
              </a>{' '}
              or use our{' '}
              <Link
                href="/about/contact"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                contact page
              </Link>
              .
            </p>
          </Block>

          {/* Research disclaimer echo — mirrors the About page */}
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
            <p className="text-xs leading-relaxed text-amber-400/60">
              <span className="font-semibold text-amber-400/80">
                Research use only:{' '}
              </span>
              AmericanPeptide.com is a computational research and education
              reference, not a medical device or clinical decision-support
              system. Nothing here is medical advice or an offer for sale.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Block({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-ink/65">{children}</div>
    </div>
  )
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-ink/80">{children}</span>
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
      <span>{children}</span>
    </li>
  )
}
