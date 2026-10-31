# americanpeptide.net — Outbound Redirect Host Go-Live Checklist

_Scope: activating `americanpeptide.net` as the dedicated outbound-redirect
host for affiliate / community links, so commercial outbound leaves through
`.net` and the editorial `americanpeptide.com` domain's outbound link profile
stays clean. All code has shipped; this is the operational runbook._

_Last reviewed: 2026-10-31 · against branch `main`_

---

## TL;DR

The feature is **fully built and merged**, shipped dormant so it is a no-op
until `.net` is attached and the one activation knob is flipped. Nothing in the
codebase needs to change to go live. The remaining work is DNS + Vercel + one
production env var + a redeploy, then verification.

- **Default (today):** `NEXT_PUBLIC_REDIRECT_ORIGIN` unset → every `/go/<id>`
  anchor renders same-origin, exactly as if `.net` did not exist. Safe.
- **Activated:** set the env var to `https://americanpeptide.net` in Production
  and redeploy → affiliate/community anchors render onto `.net`; `.net` serves
  only `/go` and 308s everything else to `.com`.

---

## How it works (already shipped)

| Piece | File | Role |
| --- | --- | --- |
| Outbound routing (#155) | `src/lib/redirect-origin.ts` | `goUrl()` absolutizes `/go/<id>` anchors onto `NEXT_PUBLIC_REDIRECT_ORIGIN`; default `''` keeps them same-origin. |
| Anchor wiring (#155) | `src/lib/vendors.ts`, `src/lib/community.ts` | Every affiliate (`vendorHref`) and community (`COMMUNITY_HREF`) link renders through `goUrl()`. No raw `/go/` anchors exist elsewhere. |
| Chokepoint (#155) | `src/app/go/[id]/route.ts` | 302s to the vendor with no-PII referral counting + `?p=` deep links. Runs on **every** attached domain (one Vercel project). |
| Host consolidation (#155) | `src/middleware.ts` | On `.net` (+ `www`): passes `/go` through, 308s every other path to `https://americanpeptide.com{path}{query}`. No-op on `.com` and previews. |
| Env knob (#156) | `.env.example` | Documents `NEXT_PUBLIC_REDIRECT_ORIGIN`. |
| Host-aware robots (#157) | `src/app/robots.txt/route.ts` | `.net` → `Disallow: /`, no sitemap; `.com`/previews → allow-all + `.com` sitemap. |

**Key invariant:** the `/go` route handler is served on *every* host because it
is one Vercel project. `NEXT_PUBLIC_REDIRECT_ORIGIN` only chooses which host the
rendered anchors point at; the middleware keeps `.net` serving nothing but `/go`.

---

## Go-live steps (in order)

- [ ] **1. DNS** — register / point `americanpeptide.net` and
      `www.americanpeptide.net` at Vercel (per Vercel's domain instructions).
- [ ] **2. Attach domains** — add both `americanpeptide.net` and
      `www.americanpeptide.net` to the **same** Vercel project that serves
      `americanpeptide.com`. Do **not** create a second project.
- [ ] **3. Production env var** — set, in the **Production** environment only:

      ```
      NEXT_PUBLIC_REDIRECT_ORIGIN=https://americanpeptide.net
      ```

      Leave it **unset** in Preview and local (`.env.local`) so links stay
      same-origin where `.net` is not attached.
- [ ] **4. Redeploy Production** — required. `NEXT_PUBLIC_*` is inlined at
      build time, so the anchors flip onto `.net` only after a fresh build.

---

## Verification (after the redeploy)

- [ ] **Anchors point at `.net`** — on a live `.com` page with an active
      affiliate, a vendor link's `href` is `https://americanpeptide.net/go/<id>`
      (view source or inspect the link).
- [ ] **`/go` works on `.net`** — `https://americanpeptide.net/go/<id>` 302s to
      the vendor (and records the no-PII click).
- [ ] **`.net` consolidates** — `https://americanpeptide.net/catalog` (any
      non-`/go` path) 308s to `https://americanpeptide.com/catalog`, preserving
      path + query.

      ```bash
      curl -sI https://americanpeptide.net/catalog | grep -i '^location\|HTTP'
      # expect: HTTP/2 308 ... location: https://americanpeptide.com/catalog
      ```
- [ ] **`.net` robots** — `https://americanpeptide.net/robots.txt` returns
      `User-agent: *` / `Disallow: /` with **no** sitemap line.

      ```bash
      curl -s https://americanpeptide.net/robots.txt
      ```
- [ ] **`.com` robots unchanged** — `https://americanpeptide.com/robots.txt`
      still allows all and points at `https://americanpeptide.com/sitemap.xml`.
- [ ] **`www.` variant** — `https://www.americanpeptide.net/go/<id>` behaves the
      same as the apex (the host check matches `www.` too).

---

## Post-launch: referral-click monitoring

The `/go` chokepoint records aggregate, no-PII click counts (per vendor, per
vendor×product, and the community link) via Upstash Redis, readable at
`GET /api/admin/referrals?months=<1..13>`.

**Two prerequisites before any counts can be read:**

1. **A reachable Upstash Redis.** Counts write through `src/lib/kv.ts`. If the
   `UPSTASH_REDIS_REST_*` vars are unset or the database is archived/deleted,
   writes fail silently (the redirect is unaffected — best-effort `after()` +
   try/catch) and nothing accumulates. Restore or recreate the database and set
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in Production.
2. **`ADMIN_SECRET` set in Production.** The endpoint returns `503` until
   `ADMIN_SECRET` (or `CRON_SECRET`) is set. Generate one with
   `openssl rand -hex 32`. Read the endpoint with
   `Authorization: Bearer <secret>`.

**Reading it once (manual):**

```bash
curl -sS -H "Authorization: Bearer $ADMIN_SECRET" \
  "https://americanpeptide.com/api/admin/referrals?months=3"
```

**Recurring monitor (a few days after launch):** a daily Claude Code Routine can
fetch the endpoint, diff against the prior day's snapshot, and report per-vendor
/ per-product deltas. Keep the secret OUT of the Routine prompt — have it read
`$ADMIN_SECRET` (fallback `$CRON_SECRET`) from the cloud environment's variables,
and make it no-op quietly (one-line "still blocked") on `503` or
`"persistent": false`. Delete the Routine once the monitoring window is done.

---

## Rollback

Instant and total, no code revert needed:

1. Unset `NEXT_PUBLIC_REDIRECT_ORIGIN` in Production.
2. Redeploy.

Anchors return to same-origin `/go/<id>` immediately. The `.net` domain can stay
attached (harmless — it just 308s to `.com`) or be detached entirely.

---

## Notes & gotchas

- **Preview deploys stay same-origin** by design — never set the env var outside
  Production, or preview links will point at a `.net` host that previews are not
  served from.
- **App (TWA) build** never routes out: `src/app/go/[id]/route.ts` returns a
  redirect to `/catalog` when `IS_APP_BUILD`, regardless of host.
- **SEO:** the 308s already keep `.net` out of the index; the `Disallow: /`
  robots response is belt-and-suspenders and ensures `.net` never advertises the
  `.com` sitemap from the wrong host.
- **This is a research platform, not a medical device** — unchanged by this
  work; affiliate routing does not touch any user-facing medical disclaimer.
