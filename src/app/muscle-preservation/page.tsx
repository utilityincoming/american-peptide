import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Microscope,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react'
import LastUpdated from '@/components/LastUpdated'
import { freshnessProps } from '@/lib/schema'

const SITE = 'https://americanpeptide.com'
const UPDATED = '2026-09-13'

export const metadata: Metadata = {
  title:
    'Muscle Preservation on GLP-1s — The Activin/Myostatin Axis | AmericanPeptide.com',
  description:
    'Research reference for preserving lean mass during GLP-1 weight loss: why ~25–40% of the weight lost is muscle, the activin/myostatin axis, and the antibodies (apitegromab, trevogrumab, garetosmab, bimagrumab) studied to keep it.',
  alternates: { canonical: `${SITE}/muscle-preservation` },
  keywords: [
    'muscle preservation GLP-1',
    'GLP-1 muscle loss',
    'lean mass Ozempic',
    'myostatin inhibitor obesity',
    'activin receptor obesity',
    'apitegromab',
    'trevogrumab',
    'bimagrumab',
    'garetosmab',
    'quality of weight loss',
    'preserve muscle semaglutide tirzepatide',
  ],
  openGraph: {
    title: 'Muscle Preservation on GLP-1s — The Activin/Myostatin Axis',
    description:
      'Why a quarter to 40% of GLP-1 weight loss is lean mass, and the activin/myostatin axis studied to keep the muscle — a research reference.',
    url: `${SITE}/muscle-preservation`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muscle Preservation on GLP-1s | AmericanPeptide.com',
    description:
      'The activin/myostatin axis and the antibodies studied to preserve lean mass during GLP-1 weight loss. Research reference.',
  },
}

// The four converging Phase 2 readouts — the "quality of weight loss" evidence.
const READOUTS = [
  {
    slug: 'trevogrumab',
    agent: 'Trevogrumab + semaglutide',
    trial: 'COURAGE · Phase 2 (Regeneron)',
    finding:
      '~35% of semaglutide-alone weight loss was lean mass; adding trevogrumab preserved an estimated 50–80% of it while deepening fat loss.',
    color: '#818CF8',
  },
  {
    slug: 'garetosmab',
    agent: '+ garetosmab (the triplet)',
    trial: 'COURAGE · Phase 2 (Regeneron)',
    finding:
      'The trevogrumab + garetosmab triplet preserved ~80.9% of the lean mass semaglutide alone would have cost — the best profile, but with more tolerability-driven dropouts.',
    color: '#2DD4A8',
  },
  {
    slug: 'apitegromab',
    agent: 'Apitegromab + tirzepatide',
    trial: 'EMBRAZE · Phase 2 (Scholar Rock)',
    finding:
      'Tirzepatide alone lost 30% of weight as lean mass; apitegromab preserved 54.9% of it (~1.9 kg / 4.2 lb), and was generally well tolerated.',
    color: '#34D399',
  },
  {
    slug: 'bimagrumab',
    agent: 'Bimagrumab + semaglutide',
    trial: 'Phase 2 (Lilly / Versanis)',
    finding:
      'The combination reached ~22.1% weight loss with ~92.8% of it from fat, versus 71.8% fat for semaglutide alone; bimagrumab alone lost ~10.8% essentially all from fat.',
    color: '#FB923C',
  },
]

// The four ways to release the brake — mechanism classes, color-matched to the figure.
const CLASSES = [
  {
    n: 1,
    label: 'Ligand-neutralizing antibody',
    color: '#818CF8',
    how: 'Binds the mature growth factor in circulation before it reaches the receptor. The most direct block — one ligand at a time.',
    members: ['Trevogrumab (myostatin)', 'Garetosmab (activin A)'],
  },
  {
    n: 2,
    label: 'Precursor-selective antibody',
    color: '#2DD4A8',
    how: 'Binds the inactive pro/latent form of myostatin and blocks its activation — a selectivity meant to spare related factors like GDF11 and the activins.',
    members: ['Apitegromab', 'Emugrobart (also clears it)'],
  },
  {
    n: 3,
    label: 'Receptor-level blocker',
    color: '#FB923C',
    how: 'Blocks the shared ActRII receptor itself, shutting off myostatin and activin signaling at once — the broadest mechanism, and the one that most reliably adds muscle.',
    members: ['Bimagrumab'],
  },
  {
    n: 4,
    label: 'Natural antagonist',
    color: '#34D399',
    how: 'Follistatin is the body’s own brake-release: it sequesters myostatin and activin away from the receptor. Studied as a protein and, more potently, as a gene-therapy payload.',
    members: ['Follistatin'],
  },
]

// The pipeline, honest status included — one card per agent.
const PIPELINE = [
  {
    slug: 'garetosmab',
    name: 'Garetosmab',
    target: 'Activin A',
    sponsor: 'Regeneron',
    status: 'FDA-approved · FOP',
    tone: 'approved' as const,
    note: 'Approved as Pasatru in August 2026 for the rare bone disease FOP — the first drug of the entire axis to reach the market. Its obesity and muscle-preservation use is investigational; it is the activin-A leg of the COURAGE triplet.',
  },
  {
    slug: 'apitegromab',
    name: 'Apitegromab',
    target: 'Pro/latent myostatin',
    sponsor: 'Scholar Rock',
    status: 'Under FDA review · SMA',
    tone: 'review' as const,
    note: 'EMBRAZE preserved 54.9% of the lean mass otherwise lost on tirzepatide. Its spinal-muscular-atrophy application, resubmitted after a facility-related CRL, has an FDA decision date of Sept 30, 2026.',
  },
  {
    slug: 'trevogrumab',
    name: 'Trevogrumab',
    target: 'Mature myostatin',
    sponsor: 'Regeneron',
    status: 'Phase 2 · obesity',
    tone: 'clinical' as const,
    note: 'The COURAGE workhorse — preserved an estimated 50–80% of otherwise-lost lean mass added to semaglutide, and the most-studied muscle-sparing add-on in the incretin era.',
  },
  {
    slug: 'bimagrumab',
    name: 'Bimagrumab',
    target: 'ActRII receptor',
    sponsor: 'Lilly / Versanis',
    status: 'Phase 2 · mixed',
    tone: 'mixed' as const,
    note: 'Fat down and muscle up — an unusual profile that drew a ~$2B acquisition. Lilly ended its tirzepatide combination in type 2 diabetes in 2025 (portfolio priority, not safety); a non-diabetic obesity study continues toward a 2026 readout.',
  },
  {
    slug: 'emugrobart',
    name: 'Emugrobart',
    target: 'Pro/latent myostatin (sweeping)',
    sponsor: 'Roche / Chugai',
    status: 'Discontinued · rare disease',
    tone: 'stopped' as const,
    note: 'A "sweeping" antibody engineered to actively clear myostatin, not just block it. Its SMA and FSHD programs were dropped in 2026 after the MANATEE trial missed — though the company said the obesity rationale still stood.',
  },
]

const TONE: Record<
  string,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  approved: {
    label: 'Approved',
    className: 'bg-[#2DD4A8]/12 text-accent',
    Icon: CheckCircle2,
  },
  review: {
    label: 'In review',
    className: 'bg-amber-400/12 text-amber-300',
    Icon: Microscope,
  },
  clinical: {
    label: 'Clinical',
    className: 'bg-[#818CF8]/12 text-[#a5aefc]',
    Icon: Activity,
  },
  mixed: {
    label: 'Mixed',
    className: 'bg-[#FB923C]/12 text-[#fbb072]',
    Icon: AlertCircle,
  },
  stopped: {
    label: 'Halted',
    className: 'bg-ink/[0.06] text-ink/45',
    Icon: Ban,
  },
}

const FAQS = [
  {
    q: 'Do GLP-1 drugs like Ozempic and Zepbound cause muscle loss?',
    a: 'Some lean-mass loss accompanies the large weight loss they produce. Across trial body-composition substudies, lean tissue accounts for roughly a quarter to 40% of the total weight lost on semaglutide and tirzepatide — proportions broadly similar to diet-induced weight loss, but now happening at the scale of tens of millions of people. This page is a research reference, not medical advice.',
  },
  {
    q: 'What is being developed to preserve muscle during weight loss?',
    a: 'The leading strategy targets the activin/myostatin axis — the body’s brake on muscle growth. Antibodies against myostatin (trevogrumab, apitegromab) or activin A (garetosmab), and the receptor-level blocker bimagrumab, are being tested on top of GLP-1 drugs. Myostatin and follistatin are the underlying biology; follistatin gene therapy is a separate, earlier-stage approach.',
  },
  {
    q: 'How much muscle can these agents actually preserve?',
    a: 'In the Phase 2 COURAGE trial, adding trevogrumab to semaglutide preserved an estimated 50–80% of the lean mass otherwise lost, and the trevogrumab-plus-garetosmab triplet preserved about 80.9% (with more tolerability dropouts). In the Phase 2 EMBRAZE trial, apitegromab preserved 54.9% of the lean mass otherwise lost on tirzepatide. These are Phase 2 results, not approvals.',
  },
  {
    q: 'What is myostatin, and why does blocking it build muscle?',
    a: 'Myostatin (GDF-8) is a growth factor that limits skeletal-muscle mass — the body’s brake on muscle. It signals through the activin type II receptors and the Smad2/3 pathway. Removing or blocking it releases the brake and increases muscle, which is why the whole field is built around inhibiting the pathway rather than supplying the factor.',
  },
  {
    q: 'Are any muscle-preservation drugs FDA-approved?',
    a: 'Not for muscle preservation. Garetosmab (Pasatru) was FDA-approved in August 2026 for the rare bone disease FOP — the first agent of the axis to reach the market — and apitegromab is under FDA review for spinal muscular atrophy. Every obesity and muscle-preservation use here is investigational. The pathway is also banned in sport.',
  },
  {
    q: 'Can I buy these to preserve muscle on a GLP-1?',
    a: 'No. These are monoclonal antibodies studied in clinical trials, not research peptides available from vendors, and none is approved for muscle preservation. This page catalogs the science and the pipeline; it is not medical advice, dosing guidance, or an offer for sale.',
  },
]

export default function MusclePreservationPage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline:
      'Muscle Preservation on GLP-1s: The Activin/Myostatin Axis',
    description:
      'Research reference for preserving lean mass during GLP-1 weight loss — the quality-of-weight-loss problem, the activin/myostatin axis, and the antibody pipeline.',
    url: `${SITE}/muscle-preservation`,
    isPartOf: { '@type': 'WebSite', name: 'AmericanPeptide.com', url: SITE },
    about: PIPELINE.map((p) => ({ '@type': 'Drug', name: p.name })),
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'MedicalResearcher',
    },
    ...freshnessProps(UPDATED),
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Muscle Preservation',
        item: `${SITE}/muscle-preservation`,
      },
    ],
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-ink/[0.06] px-4 py-3 md:px-6">
        <Link href="/" className="text-sm text-ink/35 transition-colors hover:text-ink">Home</Link>
        <span className="text-ink/20">/</span>
        <span className="truncate text-sm font-medium">Muscle Preservation</span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-accent">
            <Dumbbell className="h-3 w-3" />
            The muscle-preservation frontier · activin/myostatin axis
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            The quality of the
            <br />
            <span className="bg-gradient-to-r from-[#2DD4A8] to-[#818CF8] bg-clip-text text-transparent">
              weight you lose
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink/55 md:text-base">
            GLP-1 drugs settled how <em>much</em> weight comes off. The open
            question now is <em>what kind</em> — because a large share of that
            loss is muscle, not fat. This is the research frontier built to
            keep the muscle: the activin/myostatin axis, and the antibodies
            being tested on top of the incretins.
          </p>
          <p className="mt-3 text-xs text-ink/30">
            Research reference only. Not medical advice, dosing guidance, or an offer for sale.
          </p>
          <LastUpdated date={UPDATED} className="mt-4 text-[11px] text-ink/35" />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
          <div className="space-y-16">

            {/* ── The problem ── */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                The quality-of-weight-loss problem
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-ink/65">
                <p>
                  Weight on a scale is fat and muscle together. When weight
                  comes off fast, some muscle goes with it — and the incretin
                  drugs come off fast. Across trial body-composition substudies,
                  lean tissue makes up roughly a{' '}
                  <strong className="text-ink/85">quarter to 40%</strong> of the
                  total weight lost on semaglutide and tirzepatide. That’s in
                  the same range as diet-based weight loss, but it is now
                  happening at the scale of tens of millions of people, and over
                  a lifetime of use rather than a diet.
                </p>
                <p>
                  Muscle is not cosmetic. It is where the body burns glucose,
                  the reserve that protects against falls and frailty with age,
                  and part of why weight regain after stopping tends to come
                  back as fat. So the next chapter of the field is not a bigger
                  number on the scale — it is a better <em>composition</em>
                  {' '}of the loss.
                </p>
              </div>

              {/* fat vs lean split — a simple, honest visual */}
              <div className="mt-6 rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                  A typical GLP-1 weight-loss split
                </p>
                <div className="flex h-8 w-full overflow-hidden rounded-lg">
                  <div
                    className="flex items-center justify-center text-[11px] font-medium text-[#0B1220]"
                    style={{ width: '68%', backgroundColor: '#2DD4A8' }}
                  >
                    ~60–75% fat
                  </div>
                  <div
                    className="flex items-center justify-center text-[11px] font-medium text-ink/80"
                    style={{ width: '32%', backgroundColor: 'rgba(129,140,248,0.35)' }}
                  >
                    ~25–40% lean
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink/40">
                  Proportions vary by drug, dose, and study — tirzepatide’s
                  SURMOUNT-1 DXA substudy put lean mass near the low end (~25%),
                  while some semaglutide substudies land higher. The goal of the
                  agents below is to shrink the right-hand bar.
                </p>
              </div>
            </section>

            {/* ── The axis — SVG figure ── */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                One control system: the activin/myostatin axis
              </h2>
              <p className="mb-6 text-xs text-ink/30">
                Nearly every muscle-preservation agent acts somewhere along this
                single signaling path — the body’s brake on muscle growth
              </p>

              <figure className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
                <svg
                  viewBox="0 0 760 272"
                  className="h-auto w-full text-ink"
                  role="img"
                  aria-label="The activin/myostatin signaling axis: myostatin and activin A signal through the ActRII receptor and Smad2/3 to brake muscle growth. Four intervention points are marked — precursor-selective antibodies, ligand-neutralizing antibodies, follistatin, and receptor-level blockers."
                >
                  {/* membrane */}
                  <line x1="380" y1="40" x2="380" y2="260" stroke="currentColor" strokeOpacity="0.10" strokeWidth="18" />
                  <text x="380" y="30" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.35">
                    muscle-cell membrane
                  </text>

                  {/* precursor → mature ligand */}
                  <rect x="20" y="120" width="120" height="46" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.15" />
                  <text x="80" y="140" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.6">pro / latent</text>
                  <text x="80" y="155" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.6">myostatin</text>

                  <line x1="140" y1="143" x2="205" y2="143" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                  <polygon points="205,143 197,139 197,147" fill="currentColor" fillOpacity="0.3" />

                  {/* mature ligands */}
                  <rect x="208" y="112" width="132" height="62" rx="9" fill="#818CF8" fillOpacity="0.10" stroke="#818CF8" strokeOpacity="0.5" />
                  <text x="274" y="137" textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity="0.8" fontWeight="600">Myostatin (GDF-8)</text>
                  <text x="274" y="154" textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity="0.8" fontWeight="600">· Activin A</text>

                  <line x1="340" y1="143" x2="372" y2="143" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
                  <polygon points="372,143 364,139 364,147" fill="currentColor" fillOpacity="0.35" />

                  {/* receptor */}
                  <rect x="372" y="108" width="20" height="70" rx="4" fill="#FB923C" fillOpacity="0.25" stroke="#FB923C" strokeOpacity="0.6" />
                  <text x="382" y="196" textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity="0.6">ActRII</text>

                  {/* receptor → smad → outcome */}
                  <line x1="392" y1="143" x2="452" y2="143" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                  <polygon points="452,143 444,139 444,147" fill="currentColor" fillOpacity="0.3" />
                  <rect x="454" y="120" width="96" height="46" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.15" />
                  <text x="502" y="140" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.6">Smad 2/3</text>
                  <text x="502" y="155" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.6">signaling</text>

                  <line x1="550" y1="143" x2="606" y2="143" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                  <polygon points="606,143 598,139 598,147" fill="currentColor" fillOpacity="0.3" />
                  <rect x="608" y="116" width="132" height="54" rx="9" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.14" />
                  <text x="674" y="139" textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity="0.55" fontWeight="600">Muscle growth</text>
                  <text x="674" y="156" textAnchor="middle" fontSize="11" fill="#F87171" fillOpacity="0.9">◀ braked</text>

                  {/* follistatin — natural antagonist sequestering the ligand */}
                  <path d="M200 108 C 214 124, 238 118, 260 114" fill="none" stroke="#34D399" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 3" />
                  <rect x="150" y="78" width="100" height="30" rx="8" fill="#34D399" fillOpacity="0.12" stroke="#34D399" strokeOpacity="0.5" />
                  <text x="200" y="97" textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity="0.7">④ Follistatin</text>

                  {/* intervention markers — numbers map to the cards below */}
                  {/* ② precursor */}
                  <circle cx="174" cy="143" r="9.5" fill="#2DD4A8" />
                  <text x="174" y="147" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B1220">2</text>

                  {/* ① ligand */}
                  <circle cx="356" cy="143" r="9.5" fill="#818CF8" />
                  <text x="356" y="147" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B1220">1</text>

                  {/* ③ receptor */}
                  <circle cx="382" cy="100" r="9.5" fill="#FB923C" />
                  <text x="382" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B1220">3</text>

                  {/* the payoff line */}
                  <text x="380" y="248" textAnchor="middle" fontSize="12" fill="#2DD4A8" fontWeight="600">
                    Block the brake at any point → muscle preserved or built
                  </text>
                </svg>
              </figure>
              <figcaption className="mt-2 text-[11px] leading-relaxed text-ink/35">
                Myostatin and activin A are TGF-β-family brakes on muscle; they
                converge on the ActRII receptor and Smad2/3. Each numbered point
                is where a drug class intervenes — detailed below.
              </figcaption>
            </section>

            {/* ── The four intervention classes ── */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Four ways to release the brake
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {CLASSES.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-ink/[0.07] bg-ink/[0.03] p-5"
                    style={{ borderTopColor: c.color, borderTopWidth: 2 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-[#0B1220]"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.n}
                      </span>
                      <p className="text-sm font-semibold" style={{ color: c.color }}>
                        {c.label}
                      </p>
                    </div>
                    <p className="mb-4 text-xs leading-relaxed text-ink/55">{c.how}</p>
                    <ul className="space-y-1">
                      {c.members.map((m) => (
                        <li key={m} className="flex gap-2 text-xs text-ink/45">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/25" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ── The evidence — converging readouts ── */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                What the trials show
              </h2>
              <p className="mb-6 text-xs text-ink/30">
                Four independent Phase 2 programs, one direction: keep the muscle, shift the loss onto fat
              </p>
              <div className="space-y-4">
                {READOUTS.map((r) => (
                  <Link
                    key={r.agent}
                    href={`/catalog/${r.slug}`}
                    className="group flex flex-col gap-1.5 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 transition-colors hover:border-ink/[0.12] hover:bg-ink/[0.04]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-sm font-semibold transition-colors group-hover:text-accent" style={{ color: r.color }}>
                        {r.agent}
                      </p>
                      <span className="text-[11px] text-ink/35">{r.trial}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink/60">{r.finding}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex gap-2 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-4">
                <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <p className="text-xs leading-relaxed text-ink/55">
                  <strong className="text-ink/70">The through-line:</strong> in
                  every readout, blocking the axis on top of a GLP-1 drug moved
                  the loss off muscle and onto fat. The gains are real and
                  consistent — and they come from Phase 2 trials, not approvals.
                  The open questions are durability, function (does preserved
                  mass mean preserved strength?), and tolerability.
                </p>
              </div>
            </section>

            {/* ── The pipeline ── */}
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-ink/40">
                The pipeline — honestly
              </h2>
              <div className="space-y-4">
                {PIPELINE.map((p) => {
                  const tone = TONE[p.tone]
                  return (
                    <Link
                      key={p.slug}
                      href={`/catalog/${p.slug}`}
                      className="group flex flex-col gap-2 rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5 transition-colors hover:border-ink/[0.12] hover:bg-ink/[0.04]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink/90 transition-colors group-hover:text-accent">
                            {p.name}
                          </p>
                          <p className="text-xs text-ink/35">
                            {p.target} · {p.sponsor}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${tone.className}`}>
                          <tone.Icon className="h-3 w-3" />
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink/55">{p.note}</p>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* ── The honest state / what's accessible ── */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Where this actually stands
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-ink/65">
                <p>
                  This is a frontier, and it reads like one. The mechanism is
                  unusually clean — a single brake, several ways to release it —
                  and the early data point the same direction. But no agent is
                  approved to preserve muscle during weight loss. The one axis
                  drug that has reached the market,{' '}
                  <Link href="/catalog/garetosmab" className="text-accent hover:underline">garetosmab (Pasatru)</Link>,
                  is approved for a rare bone disease, not obesity. Bimagrumab’s
                  most-watched combination was shelved for portfolio reasons.
                  The story is genuinely promising and genuinely unfinished.
                </p>
                <p>
                  It is also a hype magnet. &ldquo;Myostatin blockers&rdquo; are
                  marketed well ahead of the evidence, the antibodies here are
                  not sold as research peptides, and the pathway is banned in
                  sport. The biology worth knowing is real — start with{' '}
                  <Link href="/catalog/myostatin" className="text-accent hover:underline">myostatin</Link>{' '}
                  and its natural antagonist{' '}
                  <Link href="/catalog/follistatin" className="text-accent hover:underline">follistatin</Link>{' '}
                  — but the drugs are investigational, not a shortcut you can order.
                </p>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section>
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Frequently asked questions
              </h2>
              <div className="space-y-5">
                {FAQS.map((f) => (
                  <div key={f.q} className="rounded-xl border border-ink/[0.06] bg-ink/[0.02] p-5">
                    <p className="mb-2 text-sm font-semibold text-ink/90">{f.q}</p>
                    <p className="text-sm leading-relaxed text-ink/55">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
              <p className="text-xs leading-relaxed text-ink/45">
                <strong className="text-ink/60">Research reference only.</strong>{' '}
                Except for garetosmab (approved for FOP only), none of the agents
                on this page are FDA-approved, and none is approved to preserve
                muscle during weight loss. Nothing here is medical advice, dosing
                guidance, or an offer for sale.
              </p>
            </section>
          </div>

          {/* ── Aside ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/40">
                <ShieldCheck className="h-3.5 w-3.5 text-accent/70" />
                The axis in the catalog
              </p>
              {[
                { slug: 'myostatin', name: 'Myostatin (GDF-8)', sub: 'The brake' },
                { slug: 'follistatin', name: 'Follistatin', sub: 'Natural antagonist' },
                { slug: 'apitegromab', name: 'Apitegromab', sub: 'Precursor-selective Ab' },
                { slug: 'trevogrumab', name: 'Trevogrumab', sub: 'Anti-myostatin Ab' },
                { slug: 'garetosmab', name: 'Garetosmab', sub: 'Anti-activin-A · approved (FOP)' },
                { slug: 'bimagrumab', name: 'Bimagrumab', sub: 'ActRII receptor blocker' },
                { slug: 'emugrobart', name: 'Emugrobart', sub: 'Sweeping anti-myostatin Ab' },
              ].map((e) => (
                <Link
                  key={e.slug}
                  href={`/catalog/${e.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                >
                  <div>
                    <p className="text-sm font-medium text-ink/80 transition-colors group-hover:text-accent">{e.name}</p>
                    <p className="text-xs text-ink/30">{e.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 group-hover:text-accent" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-ink/[0.07] bg-ink/[0.02] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/40">Related</p>
              {[
                { href: '/glp-1', label: 'GLP-1 & Metabolic', sub: 'The weight-loss hub' },
                { href: '/research-areas/muscle-lean-mass', label: 'Muscle & Lean Mass', sub: 'Research-area guide' },
                { href: '/gh-peptides', label: 'GH Secretagogues', sub: 'The other body-comp axis' },
                { href: '/catalog/category/metabolic', label: 'Metabolic Peptides', sub: 'Full category' },
                { href: '/trials', label: 'Clinical Trials', sub: 'Search ClinicalTrials.gov' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                >
                  <div>
                    <p className="text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">{l.label}</p>
                    <p className="text-xs text-ink/30">{l.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink/20 group-hover:text-ink/50" />
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-[#2DD4A8]/20 bg-[#2DD4A8]/[0.04] p-5">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink/85">
                <Zap className="h-4 w-4 text-accent" />
                Ask the Peptide Agent
              </p>
              <p className="mb-3 text-xs leading-relaxed text-ink/50">
                Citation-backed answers on the myostatin axis, grounded in
                PubMed, PubChem, and ClinicalTrials.gov.
              </p>
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent"
              >
                Open the agent
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
