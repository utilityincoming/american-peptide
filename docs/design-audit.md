# Visual Design & Graphic Assets — Audit and Roadmap

_Scope: graphic assets / images and layout & visual design. Copywriting is
noted only where it sits inside a visual element. No code changes in this
document — this is a prioritized plan._

_Last reviewed: 2026-10-13 · against branch `claude/cool-cori-zag95m`_

---

## TL;DR

The site is visually strong and unusually disciplined: one teal-on-dark system,
clean typographic hierarchy (Space Grotesk display + Geist), tokenized theming
with a real light mode, and all graphics drawn in code (SVG + CSS gradients +
Lucide icons). There are **zero raster images and zero `next/image` uses** in
`src/` — nothing to optimize, nothing to go blurry, nothing unlicensed.

That strength is also the gap. Because everything is hand-drawn per page, the
visual language is **inconsistent at the edges**: the brand mark is literally
three different designs (header, favicon, OG), every page re-invents its own
glow/dot-grid background, and the Open Graph share image is a single text
template with no molecular identity. The highest-leverage work is **unifying
the brand mark and systematizing the decorative primitives** — not adding new
art.

Priorities, in order:

1. **P0 — One brand mark.** Reconcile the three divergent logos and the
   off-palette favicon.
2. **P0 — Share images with identity.** OG images are text-only and all
   look alike; add the molecular/brand signature.
3. **P1 — Extract the decorative background into one component.** Stop
   re-declaring the dot-grid + radial glow on every page.
4. **P1 — A real molecular visual on catalog detail pages** (structure, not
   just a text card).
5. **P2 — Motion, empty/loading states, and accessibility polish.**

---

## 1. Brand mark & identity — **P0**

There are **three different marks** for the same brand, plus an off-palette
favicon:

| Surface | Mark | Colors |
|---|---|---|
| Header (`SiteHeader.tsx`) | Teal rounded square + white double-arc "helix" strokes, wordmark `AmericanPeptide` (one word) | accent `#2DD4A8`, ink `#0B1220` |
| Favicon (`public/favicon.svg`) | Navy gradient square + `AP` letterform + decorative chains | **`#00d4aa` / `#00e5b0` / `#0d1b2a`** — a *different* teal and navy |
| OG image (`src/lib/og.tsx`) | Three/four colored dots + wordmark `American Peptide` (two-tone, spaced) | `#2DD4A8` + `#818CF8` + `#60A5FA` + `#A78BFA` |

Three logos means the brand has no single recognizable asset. The favicon's
palette (`#00d4aa`, navy `#0d1b2a`) doesn't match the site's tokens (`#2DD4A8`,
surface `#0B1220`), so the browser-tab color reads subtly "off."

**Next steps**
- Pick **one** primary mark. The header's helix-in-teal-square is the cleanest
  and most legible at small sizes; make it the canonical glyph.
- Redraw `favicon.svg` (and regenerate the PNG sizes + `apple-touch-icon` +
  `android-chrome-*`) from that one glyph, in the token palette. Drop the `AP`
  letterform or keep it only if it becomes the official glyph everywhere.
- Decide the wordmark once: `AmericanPeptide` vs `American Peptide` (two-tone).
  Use the same treatment in header, OG, and footer.
- Extract the glyph to a shared `<BrandMark />` / `<Wordmark />` component so
  header, OG, footer, and future assets all reference one source.
- Add the mark to the footer if it isn't there (quick brand-recall win).

_Deliverable: one SVG glyph + regenerated favicon/PWA icon set + a shared
component. ~Half a day._

---

## 2. Open Graph / social share images — **P0**

All share cards go through one template (`src/lib/og.tsx`): dark gradient,
dots, wordmark, eyebrow/title/subtitle text. Catalog pages reuse it verbatim
with the peptide name as the title.

Problems:
- **No molecular identity.** A peptide reference site shares a plain text card.
  The hero molecule and the synthesis/structure visuals never make it into the
  thing people actually see in a feed.
- **Every card looks identical** — the home page and 50+ catalog entries are
  distinguishable only by one line of text. Low scroll-stopping power, weak
  brand recall in search/social previews.
- `fontFamily: 'sans-serif'` — Satori falls back to a generic sans, so the
  share image does **not** use Space Grotesk/Geist and looks unlike the site.
- `twitter:image` inherits this, so the problem is doubled across platforms.

**Next steps**
- Add a **molecular signature** to the OG layout: the peptide-chain glyph (a
  Satori-safe simplified version of `HeroMolecule`) on the right third, so
  cards read as "peptide" at a glance.
- For **catalog** OG images, render something structural per molecule — at
  minimum the sequence mono-text and residue count; ideally a small
  backbone/node drawing keyed to the entry. This makes every card unique.
- Embed the real display font (load Space Grotesk as an `ArrayBuffer` into
  `ImageResponse({ fonts })`) so share cards match the site typography.
- Add a subtle category-accent tint (indigo/blue/purple/amber already in
  tokens) so categories are visually sortable in a feed.

_Deliverable: upgraded `og.tsx` + per-molecule catalog variant + embedded
font. ~1 day._

---

## 3. Decorative backgrounds — extract to one primitive — **P1**

The same two-layer decoration — a `radial-gradient` dot grid plus one or two
blurred teal "glow" blobs — is **hand-redeclared** on the home page and inside
most spotlight sections (see `page.tsx` lines ~113–125, ~271–285, ~379–393),
each with slightly different opacities, sizes, and blur radii.

Problems:
- Drift: the dot grid is `28px` in the hero but `24px` in the spotlights;
  glow opacity varies `0.04`–`0.14` with no system.
- Every new page/section re-copies the markup, so the look will keep diverging.
- It's all inline styles, so it can't be themed or tuned centrally.

**Next steps**
- Create `<DotField />` and `<Glow />` (or one `<AmbientBackdrop variant="..." />`)
  component with a fixed set of sizes/intensities. Replace the inline copies.
- Define the dot-grid spacing and glow intensities as a couple of tokens so
  "the backdrop" is one decision, not twenty.
- Audit light mode for these — a teal glow tuned for `#0B1220` can look muddy
  on the `#F7F9FB` light surface; verify and set per-theme opacity.

_Deliverable: 1–2 shared components + replacements across `page.tsx` and
section files. ~Half a day._

---

## 4. Catalog detail: a real molecular visual — **P1**

The home hero has a lovely animated peptide chain (`HeroMolecule`), but the
**catalog detail pages** — the pages that most deserve a structure — appear to
lean on text/spec cards and the PubChem link rather than showing a drawing.
(Several inline-SVG pages exist: `SynthesisWalk`, `muscle-preservation`,
`about`, the calculators — so the capability is clearly in-house.)

**Next steps**
- Add a per-entry **backbone/residue visual** to catalog detail pages, driven
  by the entry's `sequence` (which many entries already carry). Reuse the
  `HeroMolecule` drawing style so it's instantly on-brand.
- Where a 2D structure image exists on PubChem, consider an optional embedded
  structure thumbnail (with attribution) — but the in-house SVG keeps you free
  of external image dependencies and matches the "all code-drawn" discipline.
- This same visual then feeds the catalog OG image (ties into §2).

_Deliverable: a `<SequenceGlyph sequence=... />` component used on detail pages
+ OG. ~1 day (shares work with §2)._

---

## 5. Layout & visual-design polish — **P2**

Smaller, lower-risk refinements. Grouped so they can be picked off individually.

**Spacing & rhythm**
- Section bottom-padding varies (`pb-20`, `pb-24`, `pb-32`) without an obvious
  rule; standardize to a scale (e.g. `pb-24` default, `pb-32` for major
  section breaks) for a steadier vertical rhythm.
- The home page stacks four full-width spotlight/feature bands; consider a
  tighter transition or a divider motif so they don't read as four separate
  "hero" moments.

**Color & accents**
- Many teal values are hard-coded hex (`#2DD4A8`, `#5EEBC8`, `#34ddb0`) instead
  of the `--accent` token, so light mode and any future palette tweak won't
  reach them. Sweep literal `#2DD4A8`/gradient stops toward tokens where the
  element should follow the theme. (Intentional exceptions: the `--viz` stage
  and OG images, which stay dark by design.)
- The category accent palette (indigo/blue/purple/amber) is defined but
  lightly used on the home page — lean on it to make categories scannable.

**Motion**
- Hero animations already respect `prefers-reduced-motion` — good. Extend the
  same care to any new hover/scroll motion, and add gentle scroll-reveal only
  if it doesn't fight the "fast, bench-ready" positioning.

**Empty / loading / error states**
- Audit tool and agent pages for skeletons and empty states; branded skeletons
  (dot-grid shimmer) beat raw spinners and reinforce identity during the waits
  that matter (agent responses, PubChem/trials fetches).

**Accessibility (visual)**
- Verify contrast of the many low-opacity ink utilities (`text-ink/40`,
  `text-ink/25`, `text-ink/30`) against both surfaces — some fall below WCAG AA
  for body text, especially the italic sourcing lines.
- Confirm all decorative SVG/containers are `aria-hidden` (the hero and preview
  syringe already carry roles/labels — keep that standard).

_Deliverable: incremental PRs; each item is independently shippable._

---

## Suggested sequencing

| Phase | Work | Rough effort |
|---|---|---|
| 1 | §1 Unify brand mark + refresh favicon/icon set | ~0.5 day |
| 1 | §2 OG images: molecular signature + embedded font | ~1 day |
| 2 | §4 `SequenceGlyph` for catalog detail (feeds §2 catalog OG) | ~1 day |
| 2 | §3 Extract `DotField`/`Glow` backdrop primitives | ~0.5 day |
| 3 | §5 Token sweep, spacing scale, a11y contrast, states | incremental |

Phases 1–2 are the identity payoff (consistent mark + share cards that look
like a peptide platform). Phase 3 is ongoing hygiene.

## What NOT to change

- Don't introduce stock photography or 3D renders — the all-code-drawn,
  zero-raster approach is a genuine strength (fast, crisp at every DPI,
  license-clean, on-brand). Keep new assets as SVG/CSS.
- Don't touch the working light/dark token architecture; extend it, don't
  replace it.
