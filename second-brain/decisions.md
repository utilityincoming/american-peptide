# Decisions

Append-only log of choices and why. Newest at top. One entry per decision.

Format:
```
## YYYY-MM-DD — <short title>
**Context:** what prompted the choice.
**Decision:** what was chosen.
**Why:** the reasoning / tradeoffs.
**Alternatives considered:** what was rejected and why.
```

---

## 2026-11-18 — Provider ladder ordered by cost, Venice first
**Context:** `/api/chat` can answer from several AI providers; needed a policy
for which to try in what order.
**Decision:** Venice → Grok → Anthropic Claude → published reference floor, each
rung tried only if the previous errored or returned nothing.
**Why:** Ordered by cost per search so outages degrade to the next-cheapest
before reaching the most expensive (Anthropic). Venice also goes first because,
being uncensored, it answers dosing/protocol research questions that Claude's
policy layer refuses — so visitors still get a substantive, grounded answer.
The reference floor is a model-free safety net and refunds the free use.
**Alternatives considered:** Claude-first (simpler, but most expensive per call
and refuses a chunk of in-scope research questions); single provider (no
resilience to outages); no floor (users hit hard errors on total failure).
**Source:** `src/app/api/chat/route.ts:432-565`. See `notes/provider-ladder.md`.

---

## 2026-11-18 — Adopt a plain-markdown second brain
**Context:** Wanted a durable, searchable personal knowledge base that works
with AI agents and plain tooling.
**Decision:** Folder-per-domain markdown structure with layered CLAUDE context.
**Why:** Portable, diffable, no lock-in; layered context keeps requests cheap.
**Alternatives considered:** A dedicated notes app (lock-in, weak git/agent
integration); a single big file (doesn't scale, hard to load selectively).
