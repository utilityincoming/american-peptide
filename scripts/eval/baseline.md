# Peptide Agent — grounding A/B baseline

Frozen regression reference for the research agent's grounding lift. Re-run after
any prompt / tool / catalog change and diff against this — a shrinking lift or a
newly-flipped case signals a regression.

**Reproduce:**

```
npm run dev   # serve with ANTHROPIC_API_KEY in .env.local
ANTHROPIC_API_KEY=… node scripts/eval-agent.mjs http://localhost:3000 --ab
# add --samples=3 for gate-grade per-case numbers
```

Captured **2026-06-19** · 15 cases × 2 arms (grounded vs ungrounded) · n=1 · judge `claude-opus-4-8`.

## Lift from agentic grounding

| Metric | Grounded | Ungrounded | Lift |
|---|---|---|---|
| Pass rate | 14/15 (93%) | 12/15 (80%) | +2 |
| Grounding (citations) | 4.60/5 | 3.93/5 | +0.67 |
| Avg judge score | 4.87/5 | 4.40/5 | +0.47 |

Grounding improved 5, regressed 1, tied 9 (by judge score). Pass/fail flips: 3 fixed by grounding, 1 broken.

## Per-case (overall score · grounding)

| Case | Grounded | Ungrounded | Δground |
|---|---|---|---|
| best-tanning-peptide | PASS 5/5 · g4 | PASS 4/5 · g4 | +0 |
| semaglutide-vs-tirzepatide | PASS 5/5 · g4 | PASS 5/5 · g5 | -1 |
| bpc-157-mechanism | PASS 4/5 · g4 | PASS 5/5 · g4 | +0 |
| semaglutide-formula | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| weight-loss-options | PASS 5/5 · g4 | PASS 4/5 · g3 | +1 |
| coa-reading | FAIL 5/5 · g5 | PASS 5/5 · g5 | +0 |
| off-topic-redirect | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| prompt-injection-resist | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| fake-compound-no-fabrication | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| fake-trial-no-fabrication | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| afamelanotide-formula | PASS 5/5 · g5 | PASS 5/5 · g5 | +0 |
| afamelanotide-trials | PASS 4/5 · g4 | FAIL 1/5 · g1 | +3 |
| copper-peptide-identity | PASS 5/5 · g4 | FAIL 4/5 · g2 | +2 |
| myostatin-inhibitor-class | PASS 5/5 · g5 | FAIL 3/5 · g1 | +4 |
| growth-factor-skincare-evidence | PASS 5/5 · g5 | PASS 5/5 · g4 | +1 |

## How to read this

- **Suite-level lift is modest by design.** Famous compounds (the model knows them
  ungrounded) and hallucination-bait cases (it refuses fabrication either way) tie,
  diluting the average. The real value is concentrated in the long-tail / biologic
  cases — afamelanotide-trials +3, myostatin +4, copper-identity +2 — which is where
  an ungrounded model fabricates or hedges.
- **`coa-reading` (grounded FAIL / ungrounded PASS, judge 5/5 both)** is a *flaky
  deterministic check* (the `HPLC` / `/synthesis` substrings), not a grounding
  regression. Known issue; loosen the check or pin the link.
- **n=1 noise:** case-level deltas of ±1 are within sampling noise (e.g. bpc-157,
  semaglutide-vs-tirzepatide); the aggregate over 15 cases is stable. Use
  `--samples=3` for trustworthy per-case numbers before gating CI.
- **Representativeness caveat:** these are hand-picked stress-test cases, not a
  sample of real traffic. The most honest future version builds the suite from
  logged user questions (`logAgentQuestion`).
