# Google Play — Store Listing Copy

Ready-to-paste text for the Play Console listing. Tuned for the **reference-only
Android build** (`NEXT_PUBLIC_PLATFORM=android`): the app ships the research
tools, not the affiliate/vendor layer. Keep the copy aligned with that — do not
describe buying, ordering, or sourcing peptides.

Policy guardrails baked into this copy:
- Leads with the *research/reference* function, never purchasing.
- No therapeutic, dosing-advice, or health-outcome claims.
- States plainly it does not sell peptides and is not medical advice.
- Suitable for an 18+ / Mature content rating.

---

## App title  (max 30 chars)

```
American Peptide: Research
```
*(26 chars. Alt: "American Peptide" — 16 chars.)*

---

## Short description  (max 80 chars)

```
Peptide research reference: catalog, calculators, COA decoder & trial tracker.
```
*(78 chars.)*

---

## Full description  (max 4000 chars)

```
American Peptide is a research reference tool for scientists, students, and
informed researchers working with peptides. It organizes public scientific data
into fast, offline-friendly tools — so you can look things up at the bench, not
just at a desk.

It is a reference and education app. It does not sell peptides, take orders, or
provide medical advice.

WHAT'S INSIDE

• Peptide catalog — a structured reference of research peptides with sequences,
  mechanisms, and links to the primary literature. Searchable and built for
  quick lookups.

• Reconstitution calculator — work out bacteriostatic water volume and the
  amount per measured draw for a given vial. Works fully offline.

• Blend calculator — plan multi-peptide reconstitution with clear, per-component
  figures.

• COA decoder — make sense of a Certificate of Analysis: what HPLC and mass-spec
  results mean, what purity figures describe, and which questions a COA should
  answer.

• Clinical trials tracker — search current and completed studies sourced from
  ClinicalTrials.gov, so you can see where the real evidence stands.

• Glossary — plain-language definitions of the terms you hit when reading
  peptide literature.

• Research assistant — an AI helper that answers reference questions and is
  grounded in public databases (PubChem, ClinicalTrials.gov, PubMed). Every
  answer is a computational reference, not advice.

• Comparison views — side-by-side reference summaries of related compounds.

GROUNDED IN PUBLIC DATA

The catalog, trials, and assistant draw on open scientific sources — PubChem,
UniProt, ClinicalTrials.gov, and PubMed. We do not fabricate data. Where a
figure is unknown, the app says so.

WORKS OFFLINE

The calculators and core reference work without a connection, so they're useful
in a lab where Wi-Fi isn't.

IMPORTANT

American Peptide is a computational research and education reference. It is NOT
a medical device and does NOT provide medical, diagnostic, or treatment advice.
Peptides referenced are research compounds; many are not approved for human use.
Nothing in the app is a recommendation to acquire, possess, or use any
substance. Always consult qualified professionals and follow the laws and
regulations that apply to you. Intended for adults (18+).
```
*(~1,950 chars — well within the 4,000 limit.)*

---

## Other listing fields

**Category:** Education (alt: Medical — but Education attracts less restricted-
content scrutiny and fits the reference framing).

**Tags / app content keywords:** peptide reference, research, science,
calculator, clinical trials, glossary.

**Contact email:** *(your support address)*

**Privacy policy URL:** `https://app.americanpeptide.com/privacy`
*(Must be live before submission — confirm this page exists on the app
deployment. If the web build has /privacy, the app build serves it too.)*

**Website:** `https://americanpeptide.com`

---

## Content rating questionnaire — how to answer

- Reference to controlled/restricted substances: **Yes** (educational/reference).
- Facilitates purchase of regulated goods: **No** (true for the app build —
  affiliate layer is gated off).
- Medical/health claims or advice: **No**.
- Target age group: **Adults only (18+)** / Mature. Do NOT mark as designed for
  or appealing to children.

Expect the rating to land at Mature 17+ / PEGI 18. That's fine.

---

## Data Safety form — what to declare

The app loads the live site, so disclose what that site collects:

- **Analytics:** Vercel Analytics + Speed Insights → "App activity / app
  interactions" and "Device or other IDs," collected, not shared, for analytics.
- **Research assistant (/api/chat):** text the user types is sent to the backend
  and an LLM provider to generate a response → "User-generated content,"
  collected. State whether it's stored. If chat content is not retained,
  declare it as processed-not-stored (ephemeral).
- **No** location, contacts, financial, or health data is collected by the app.
- Data encrypted in transit: **Yes** (HTTPS).

Keep this in sync with the actual privacy policy — Play cross-checks them.

---

## What's new  (release notes, first release)

```
First release. Peptide research reference: searchable catalog, reconstitution
and blend calculators, COA decoder, clinical-trials tracker, glossary, and a
research assistant grounded in public scientific databases. Works offline.
```
