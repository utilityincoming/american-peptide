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

## 2026-11-18 — Adopt a plain-markdown second brain
**Context:** Wanted a durable, searchable personal knowledge base that works
with AI agents and plain tooling.
**Decision:** Folder-per-domain markdown structure with layered CLAUDE context.
**Why:** Portable, diffable, no lock-in; layered context keeps requests cheap.
**Alternatives considered:** A dedicated notes app (lock-in, weak git/agent
integration); a single big file (doesn't scale, hard to load selectively).
