# Reference floor & the free-use refund
> When no AI model answers, /api/chat serves published reference content and
> refunds the visitor's free search.
Updated: 2026-11-18
Source: `src/app/api/chat/route.ts:527-565`

## The floor
The provider ladder (see `provider-ladder.md`) ends in a model-free rung:
`retrievalFallback(query)` pulls the matching entry from the site's own
published reference content. It runs when every model rung errored or returned
nothing, or when models were never allowed to run at all (site-wide daily
ceiling reached, or the quota/counter store is down → `modelsAllowed` false).

## The refund (the non-obvious part)
A visitor gets 5 free agent searches per UTC day, reserved up front by
`reserveRun`. If the request reaches the floor because **no model answered**,
the code calls `run.refund()` — the request does **not** cost a free use.

Rationale: a free search should buy a real model answer. If all providers failed
(an outage on our side, not the user's fault), charging the visitor a use would
be penalizing them for our degraded service. The reference entry is a courtesy,
not the product, so it's free.

## Two distinct degraded paths
- **Models allowed but all failed** → refund + serve reference (or an error if no
  reference entry matches). This is the outage case.
- **Models not allowed** (`!modelsAllowed`, i.e. daily ceiling / store down) →
  the model was never called, so there's nothing to refund; serve the reference
  entry marked `degraded: true`, or return a capacity error (`code: capacity`).

## Why it matters
Easy to miss when reasoning about quota accounting: "a search was reserved" does
not imply "a use was spent." Reconcile metering against refunds, not reservations.
