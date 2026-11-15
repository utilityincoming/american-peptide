# Stripe Integration TODO

Scenario **A** applied: an existing Checkout Session create call was found in
[`src/lib/agent-pass.ts`](src/lib/agent-pass.ts) (`createCheckout` →
`POST /v1/checkout/sessions` via raw `fetch`, no Stripe SDK). Only that call’s
parameters were updated.

---

## Values to Replace

No `sample_only` placeholders remain. The existing real values were preserved:

**Files containing Checkout Session parameters:**
- [src/lib/agent-pass.ts](src/lib/agent-pass.ts)

| Field | Current Value | Status |
|-------|---------------|--------|
| mode | `payment` | Kept — one-time Research Pass (not a subscription). |
| success_url | `` `${origin}/research/pass?session_id={CHECKOUT_SESSION_ID}` `` | Kept — real success page. |
| cancel_url | `` `${origin}/research/pass` `` | Kept — real cancel/return page. |
| line_items | Inline `price_data` (USD, `AGENT_PASS_PRICE_CENTS`, product name/description) | Kept — real product, not a `price_...` placeholder. |

### Fulfillment identity

Checkout Studio Field Intents do not include `metadata`, so the Session create
call does not send `metadata[product]`. [`claimSession`](src/lib/agent-pass.ts)
treats a retrieved session as a Research Pass only when all of these match the
session `createCheckout` creates:

- `mode` is `payment`
- `currency` is `usd`
- `amount_total` equals `AGENT_PASS_PRICE_CENTS` (default 2999)
- `success_url` path is `/research/pass` and its `session_id` is this session
  or the `{CHECKOUT_SESSION_ID}` template
- `payment_status` is `paid`

A paid session for any other product is rejected. Do not re-add `metadata` to
the Session create call unless you also change this check.

---

## Configured Parameters

These parameters were set from Checkout Studio (`fixed_by_ui`) on the existing
Session create call.

**Files containing these parameters:**
- [src/lib/agent-pass.ts](src/lib/agent-pass.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | `hosted_page` |
| billing_address_collection | `auto` |
| phone_number_collection.enabled | `false` |
| automatic_tax.enabled | `false` |
| allow_promotion_codes | `false` |
| submit_type | `auto` |
| saved_payment_method_options.payment_method_save | `enabled` |
| integration_identifier | `hosted_mobile_app_0001` |
| origin_context | `mobile_app` |

Notes:

- **No Stripe Node SDK** is installed (`package.json` has none). This integration
  uses Stripe’s HTTPS form API directly, so `ui_mode` defaults to `hosted_page`
  (SDK ≥ 21.0.0 naming). If you later adopt an SDK below 21.0.0, switch to
  `hosted`.
- **`payment_method_collection`** (`always`) was **not** sent: Field Intents
  include it, but it applies only when `mode` is `subscription`. This product
  is `payment` (one-time).

---

## Setup and next steps

### Environment variables

Already documented in [`.env.example`](.env.example). Required for sales:

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Restricted key with Checkout Sessions write+read. Use `sk_test_…` on preview; `sk_live_…` in production. Sales stay off until this is set. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Durable pass storage + metering across serverless instances. |
| `AGENT_PASS_PRICE_CENTS` | Optional; default `2999` ($29.99). |
| `AGENT_PASS_DAYS` | Optional; default `30`. |
| `AGENT_PASS_DAILY_MAX` | Optional fair-use cap per pass per UTC day; default `200`. |

No publishable key is required for Hosted Checkout (redirect flow). Do not put
secret keys in client code.

### Project structure

No new routes or files were added for Checkout itself. Existing surface:

| Path | Role |
|------|------|
| `src/lib/agent-pass.ts` | Session create + claim + access-code cookie |
| `src/app/api/pass/checkout/route.ts` | `POST` → redirects/returns hosted Checkout URL |
| `src/app/api/pass/claim/route.ts` | Verifies Session with Stripe, grants pass |
| `src/app/research/pass/page.tsx` | Buy / success / redeem UI |

### How the integration works

1. Visitor hits **Get the Research Pass** on `/research/pass`.
2. Client `POST`s `/api/pass/checkout`; server creates a Hosted Checkout Session
   and returns the Stripe-hosted URL.
3. Buyer pays on Stripe; Stripe redirects to
   `/research/pass?session_id={CHECKOUT_SESSION_ID}`.
4. Client `POST`s `/api/pass/claim` with that Session id; server re-fetches the
   Session from Stripe, verifies payment, grants a deterministic access code,
   and sets the `ap_pass` HttpOnly cookie.
5. `/api/chat` / `/api/analyze-peptide` treat a valid pass as unlimited weekly
   use (still bound by `AGENT_PASS_DAILY_MAX`).

There is still **no webhook**. The success page grants the pass only after
Stripe confirms the session is paid. A signed webhook is required before
launch so a buyer who never returns is still granted a pass, and so a refund
or dispute revokes it. See Next steps.

### Testing

1. Set `STRIPE_SECRET_KEY` to a test restricted key (`rk_test_…`, Checkout
   Sessions write + read) in `.env.local` (and Upstash for durable passes).
2. `npm run dev` → open `/research/pass` → start Checkout.
3. Pay with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. Confirm redirect back with `session_id`, access code shown, cookie set, and
   agent searches no longer hit the weekly free limit.
5. Decline / cancel path should return to `/research/pass` without granting a
   pass.

More test cards: https://docs.stripe.com/testing

### Next steps

Do these in order. Step 3 is required before launch: a buyer who pays and never
lands back on `/research/pass` does not get a pass today, because granting
happens on that page after the server re-checks the session with Stripe.

1. **Test mode purchase.** Set `STRIPE_SECRET_KEY` to a test restricted key
   (`rk_test_…`, Checkout Sessions write + read) and Upstash for durable
   passes. `npm run dev` → `/research/pass` → pay with `4242 4242 4242 4242`.
   Confirm the access code, the `ap_pass` cookie, and that agent searches skip
   the weekly free limit. Cancel must not grant a pass.
2. **Production secrets.** Put the live restricted key and Upstash URL/token
   in the production secret store (on Vercel, a sensitive environment
   variable). Run one live purchase, then refund it from the Dashboard and
   delete the `pass:<hash>` key until step 3 revokes it automatically.
3. **Webhook fulfillment (required before launch).** Add a signed webhook
   endpoint for `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`. Grant the pass only when
   `payment_status` is not `unpaid`. Also handle
   `checkout.session.async_payment_failed`, refunds, and disputes by deleting
   `pass:<hash>`. Verify the `Stripe-Signature` header with
   `STRIPE_WEBHOOK_SECRET`. Keep the success-page claim so the buyer still
   sees the same access code immediately — `claimSession` is idempotent.
4. **Optional:** switch inline `price_data` to a Dashboard Price ID, and add
   a receipt email / lost-code recovery path. The code is deterministic from
   the Checkout Session id, so a verified session can always re-issue it.

### Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/testing
- https://dashboard.stripe.com/apikeys
- https://dashboard.stripe.com/prices
