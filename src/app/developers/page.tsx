import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code2, Database, Scale, Zap } from 'lucide-react'
import { PEPTIDES } from '@/lib/peptides'

const SITE = 'https://www.americanpeptide.com'

export const metadata: Metadata = {
  title: 'Developers — Open Peptide Catalog API | AmericanPeptide.com',
  description:
    'Free, open peptide reference data via a simple JSON API. Query the AmericanPeptide catalog by category, research area, or slug — PubChem-enriched chemistry, sequences, and identifiers under CC BY 4.0.',
  alternates: { canonical: `${SITE}/developers` },
  openGraph: {
    title: 'Developers — Open Peptide Catalog API',
    description:
      'Free, open peptide reference data via a simple JSON API. CC BY 4.0.',
    url: `${SITE}/developers`,
    type: 'website',
  },
}

const exampleList = `GET /api/catalog?area=weight-loss&fda=true

{
  "version": "1.0",
  "license": "CC BY 4.0",
  "attribution": "AmericanPeptide.com",
  "documentation": "https://www.americanpeptide.com/developers",
  "count": 2,
  "peptides": [
    {
      "slug": "semaglutide",
      "name": "Semaglutide",
      "aliases": ["Ozempic", "Wegovy", "Rybelsus"],
      "categories": ["metabolic"],
      "researchAreaGuides": [
        { "slug": "weight-loss", "label": "Weight Loss & Metabolic Health",
          "url": "https://www.americanpeptide.com/research-areas/weight-loss" }
      ],
      "molecularFormula": "C157H235N41O47",
      "pubchemCid": 56843331,
      "fdaApproved": true,
      "url": "https://www.americanpeptide.com/catalog/semaglutide"
    }
  ]
}`

const endpoints = [
  {
    method: 'GET',
    path: '/api/catalog',
    desc: 'List all peptides. Supports query filters (below).',
  },
  {
    method: 'GET',
    path: '/api/catalog/{slug}',
    desc: 'A single peptide by slug, e.g. /api/catalog/semaglutide.',
  },
  {
    method: 'GET',
    path: '/catalog/{slug}.md',
    desc: 'A single peptide as clean markdown — token-efficient for LLMs and agents.',
  },
  {
    method: 'GET',
    path: '/llms.txt',
    desc: 'Curated markdown index of the whole site (llmstxt.org convention).',
  },
  {
    method: 'GET',
    path: '/llms-full.txt',
    desc: 'The entire catalog as one markdown document.',
  },
  {
    method: 'MCP',
    path: '/api/mcp',
    desc: 'Remote MCP server (Streamable HTTP) — connect from Claude, ChatGPT, or Cursor.',
  },
  {
    method: 'POST',
    path: '/api/keys',
    desc: 'Self-serve a free API key — higher rate + daily limits. Returned once.',
  },
  {
    method: 'GET',
    path: '/api/keys',
    desc: 'Your key’s tier, limits, and usage (authenticate with the key itself).',
  },
]

const params = [
  { name: 'category', desc: 'Filter by catalog category id (e.g. metabolic).' },
  { name: 'area', desc: 'Filter by research-area slug (e.g. weight-loss).' },
  { name: 'fda', desc: 'Set to true to return only FDA-approved peptides.' },
  { name: 'q', desc: 'Free-text search over name, aliases, and description.' },
]

const features = [
  {
    Icon: Database,
    title: 'PubChem-enriched',
    body: 'Each entry carries mechanism, sequence, molecular weight/formula, identifiers (CAS, PubChem CID, UniProt), plus editorial background, research findings, and FAQs.',
  },
  {
    Icon: Zap,
    title: 'No key required',
    body: 'Open GET endpoints with permissive CORS — call directly from a browser, server, or notebook.',
  },
  {
    Icon: Scale,
    title: 'CC BY 4.0',
    body: 'Free to use and redistribute with attribution back to AmericanPeptide.com.',
  },
]

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* ── Breadcrumb ── */}
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 md:px-6">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Code2 className="h-4 w-4 text-[#2DD4A8]" />
          Developers
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(45,212,168,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-3.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
            <Database className="h-3 w-3" />
            Open data · CC BY 4.0
          </div>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            The open peptide{' '}
            <span className="bg-gradient-to-r from-[#2DD4A8] via-[#5EEBC8] to-[#2DD4A8] bg-clip-text text-transparent">
              catalog API
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Build on the same {PEPTIDES.length}-peptide reference that powers
            this site — mechanism, sequence, and PubChem-enriched chemistry as
            structured JSON. No key, no signup. Free to embed with attribution.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2DD4A8] px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#34ddb0]"
            >
              Browse the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            {/* A filtered example: the query param makes the endpoint return
                JSON even on a direct click (bare navigations redirect to docs),
                and shows a small preview rather than the full dump. */}
            <a
              href="/api/catalog?area=weight-loss&fda=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              <Code2 className="h-4 w-4" />
              View live JSON
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2DD4A8]/20 bg-[#2DD4A8]/10 text-[#2DD4A8]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
                <p className="text-xs leading-relaxed text-white/50">{body}</p>
              </div>
            ))}
          </div>

          {/* Endpoints */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Endpoints
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
              {endpoints.map((e, i) => (
                <div
                  key={e.path}
                  className={
                    'flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 ' +
                    (i > 0 ? 'border-t border-white/[0.06]' : '')
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#2DD4A8]">
                      {e.method}
                    </span>
                    <code className="font-mono text-sm text-white/85">
                      {e.path}
                    </code>
                  </div>
                  <span className="text-xs text-white/45 sm:ml-auto sm:text-right">
                    {e.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Query params */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Query parameters
              <span className="ml-2 font-normal normal-case tracking-normal text-white/30">
                (list endpoint)
              </span>
            </h2>
            <div className="space-y-2">
              {params.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <code className="font-mono text-sm text-[#2DD4A8]">
                    {p.name}
                  </code>
                  <span className="text-xs text-white/55">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Example
            </h2>
            <pre className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/40 p-5 font-mono text-[12px] leading-relaxed text-white/75">
              {exampleList}
            </pre>
          </div>

          {/* Markdown for AI agents */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Markdown for AI agents
            </h2>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <p className="mb-3 text-sm leading-relaxed text-white/60">
                Every catalog page has a markdown twin — append{' '}
                <code className="font-mono text-[13px] text-[#2DD4A8]">.md</code>{' '}
                to any peptide URL (e.g.{' '}
                <a
                  href="/catalog/semaglutide.md"
                  className="font-mono text-[13px] text-[#2DD4A8] underline-offset-2 hover:underline"
                >
                  /catalog/semaglutide.md
                </a>
                ) for the same facts at a fraction of the tokens.{' '}
                <a
                  href="/llms.txt"
                  className="font-mono text-[13px] text-[#2DD4A8] underline-offset-2 hover:underline"
                >
                  /llms.txt
                </a>{' '}
                is a curated index of the site for agent discovery, and{' '}
                <a
                  href="/llms-full.txt"
                  className="font-mono text-[13px] text-[#2DD4A8] underline-offset-2 hover:underline"
                >
                  /llms-full.txt
                </a>{' '}
                packs the full catalog into one document for retrieval pipelines.
              </p>
              <p className="text-xs leading-relaxed text-white/40">
                All markdown responses embed the canonical URL and CC BY 4.0
                attribution, and send CORS-open headers — cite
                AmericanPeptide.com when content travels.
              </p>
            </div>
          </div>

          {/* Authentication & limits */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Authentication & limits
            </h2>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <p className="mb-4 text-sm leading-relaxed text-white/60">
                The API works with no key at the{' '}
                <span className="text-white/80">Anonymous</span> tier. Want
                higher limits? Mint a free key — no signup — and send it with
                each request:
              </p>
              <pre className="mb-4 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/75">
                {`# Get a free key (save it — shown once)
curl -X POST https://www.americanpeptide.com/api/keys

# Use it on any endpoint
curl https://www.americanpeptide.com/api/catalog?fda=true \\
  -H "Authorization: Bearer amp_sk_…"

# Check your usage
curl https://www.americanpeptide.com/api/keys \\
  -H "Authorization: Bearer amp_sk_…"`}
              </pre>
              <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                <div className="grid grid-cols-3 gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  <span>Tier</span>
                  <span className="text-right">Per minute</span>
                  <span className="text-right">Per day</span>
                </div>
                {[
                  { tier: 'Anonymous', min: '30', day: '1,000' },
                  { tier: 'Free (with key)', min: '120', day: '10,000' },
                  { tier: 'Pro', min: '600', day: '200,000' },
                ].map((row, i) => (
                  <div
                    key={row.tier}
                    className={
                      'grid grid-cols-3 gap-2 px-4 py-2.5 text-sm ' +
                      (i > 0 ? 'border-t border-white/[0.06] ' : '') +
                      (row.tier === 'Pro' ? 'text-white/45' : 'text-white/75')
                    }
                  >
                    <span>
                      {row.tier}
                      {row.tier === 'Pro' && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-white/30">
                          coming soon
                        </span>
                      )}
                    </span>
                    <span className="text-right font-mono">{row.min}</span>
                    <span className="text-right font-mono">{row.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/40">
                Every response carries{' '}
                <code className="font-mono text-[11px] text-white/60">
                  RateLimit-*
                </code>{' '}
                and{' '}
                <code className="font-mono text-[11px] text-white/60">
                  X-Quota-Remaining
                </code>{' '}
                headers so you always know your remaining budget. Keys also work
                with the MCP server. Send your key as a Bearer token to the MCP
                endpoint to connect at your tier.
              </p>
            </div>
          </div>

          {/* MCP server */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Connect via MCP
            </h2>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <p className="mb-4 text-sm leading-relaxed text-white/60">
                AmericanPeptide.com is also a remote{' '}
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2DD4A8] underline-offset-2 hover:underline"
                >
                  MCP server
                </a>
                . Connect it to Claude, ChatGPT, Cursor, or any MCP client and
                your AI gets live tools for catalog search, full peptide
                references, research-area guides, head-to-head comparisons, and
                grounded lookups against ClinicalTrials.gov, PubMed, and
                PubChem — every result with a canonical link back here.
              </p>
              <pre className="overflow-x-auto rounded-xl border border-white/[0.07] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/75">
                {`# Endpoint (Streamable HTTP, no auth)
https://www.americanpeptide.com/api/mcp

# Claude Code
claude mcp add --transport http american-peptide \\
  https://www.americanpeptide.com/api/mcp`}
              </pre>
            </div>
          </div>

          {/* License */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#2DD4A8]" />
              <h2 className="text-sm font-semibold">License & attribution</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-white/60">
              The catalog data is offered under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2DD4A8] underline-offset-2 hover:underline"
              >
                Creative Commons Attribution 4.0
              </a>
              . You may use, adapt, and redistribute it — including commercially
              — provided you credit{' '}
              <span className="text-white/80">AmericanPeptide.com</span> with a
              link back to the source.
            </p>
            <p className="text-xs leading-relaxed text-white/40">
              Reference data is for research and educational use only. It is not
              medical advice, a dosing protocol, or an offer for sale, and
              should be independently validated before any experimental use.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
