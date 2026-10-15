# Page Expansion, Sitemap & Indexing — Roadmap

_Scope: which pages to add next, how to keep the sitemap in lockstep with what
ships, and how to help Google Search Console (GSC) catch up on pages it is
already discovering. Prioritized plan; grounded in the current data model, no
fabricated content._

_Last reviewed: 2026-10-15 · against branch `claude/sweet-franklin-f4kkid`_

---

## TL;DR

The site serves **334 URLs** through the sitemap and is structurally healthy:
one clean `sitemap.ts` derived from the data layer, a `robots.txt` that points
to it, per-route `robots` control, and clusters that interlink. The gaps are at
the edges, and they are the usual reason GSC indexes a page before the site
"admits" it exists: a page is indexable but **undeclared** (missing from the
sitemap) or **under-linked** (reachable only from one deep page).

This pass closed the known declaration/linking gaps. The forward work is
**freshness coverage** and **demand-driven hub expansion** — both of which
should be steered by the GSC worklist, not guessed.

---

## Done in this pass

- **Sitemap caught up to the indexable surface.** Added `/about`,
  `/about/contact`, `/privacy`, and `/catalog/compare` — all were indexable
  (site-wide `index/follow` default) but absent from `sitemap.ts`, so search
  found them before the sitemap declared them.
- **Honest `lastmod` where it is backed.** Comparison and research-area routes
  now emit `lastModified` from the same editorial-review `updated` date that
  drives the visible stamp + JSON-LD `dateModified` (23 of 334 URLs today).
  Routes without a review date omit `lastmod` rather than faking it to build
  time.
- **Trust pages linked site-wide.** The footer now carries About / Methodology /
  Contact / Privacy. `/privacy` had **zero** internal links (a true orphan) and
  `/about` was reachable only from `/about/contact`; both are the kind of page
  crawlers expect in a footer.
- **Regression guard.** `src/app/sitemap.test.ts` asserts the trust pages are
  declared, no `noindex`/private route leaks in, `lastmod` appears only where an
  `updated` date exists, and there are no duplicate or relative URLs.

---

## P1 — Freshness coverage for the bulk of the index

`lastmod` reaches only **23 / 334** URLs. The 104 catalog monographs and the
glossary — the long tail GSC is working through — carry no freshness signal at
all, because `Peptide` and `GlossaryTerm` have no `updated` field.

**Step:** add an optional `updated?: string` (ISO `YYYY-MM-DD`) to `Peptide`
(`src/lib/peptides.ts`) and `GlossaryTerm` (`src/lib/glossary.ts`), wire it into
`peptideRoutes` / `glossaryRoutes` in `sitemap.ts` exactly as the comparison
routes already do, and surface it on the page via the existing `LastUpdated` +
`freshnessProps` path. Backfill dates only where there has been a real
editorial review — the value of `lastmod` is that it is trustworthy, so an
un-reviewed monograph simply omits it.

This is the single highest-leverage freshness change: it lets the monographs
advertise a credible recrawl signal as they are revised, instead of looking
static to Google.

## P1 — Hub pages for under-served categories (validate demand first)

Editorial cluster hubs exist for the high-intent categories (`/glp-1`,
`/gh-peptides`, `/bpc-157`, `/longevity-peptides`, `/cognitive-peptides`,
`/immune-peptides`, plus cross-cuts `/muscle-preservation`, `/melanocortin`).
Several large categories have **only** a `/catalog/category/[id]` filter view
and a `/research-areas/[slug]` science page — no commercial-intent hub:

| Category | Compounds | Has cluster hub? | Nearest existing hub |
|---|---:|---|---|
| `bioregulator` | 23 | ✗ | `/research-areas/bioregulators` |
| `peptide-hormone` | 16 | ✗ | `/research-areas/peptide-hormones` |
| `reproductive` | 12 | ✗ | `/research-areas/sexual-reproductive`, `/melanocortin` |
| `cosmetic` | 7 | ✗ | `/research-areas/skin-hair` |
| `mitochondrial` | 5 | ✗ | `/research-areas/mitochondrial` |

`bioregulator` (23 compounds, recently expanded with the Cytomax organ-extract
series) and `peptide-hormone` (16) are the strongest candidates by catalog
depth. **Do not build on catalog depth alone** — confirm query demand first
(`npm run gsc`, "striking-distance" + "emerging" buckets). A hub earns its place
when GSC shows real impressions for head terms it would target; otherwise it
risks thin/duplicate overlap with the existing category + research-area pages.

## P2 — Contain `/catalog/compare?ids=` index bloat

The comparator self-canonicals each `?ids=` permutation to itself, so an
unbounded set of parameter URLs is individually indexable. The curated
`/compare/[pair]` pages are the intended SEO targets. **Step:** canonical the
parameterized comparator to the bare `/catalog/compare` (or, where a curated
pair exists, to that `/compare/[pair]`), keeping the tool fully usable but
collapsing the crawl/index surface to the pages meant to rank. Re-check the
GSC "Pages" report afterward for `Duplicate, Google chose different canonical`.

## P2 — Demand-driven comparison expansion

34 comparisons exist across 104 compounds; many plausible head-to-heads remain.
Add new `/compare/[pair]` entries **only** where (a) GSC shows "X vs Y" query
demand and (b) both compounds have enough verified data for an honest
side-by-side. Each new entry needs a real `updated` date so it enters the
sitemap with `lastmod` already attached.

---

## Working loop

1. `npm run gsc -- sc-domain:americanpeptide.com` → read the striking-distance,
   low-CTR, and emerging buckets.
2. Decide: is the win a **title/meta rewrite** (existing page), a **new hub /
   comparison** (demand proven), or a **linking/declaration fix**?
3. Ship the page/data change; the sitemap and (where an `updated` date exists)
   `lastmod` update automatically from the data layer.
4. Let `src/app/sitemap.test.ts` catch anything that quietly falls out of the
   sitemap.
5. Re-check GSC "Pages" → `Discovered/Crawled — not indexed` to confirm the
   catch-up is landing.
