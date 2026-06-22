# Google Play Submission Runbook — American Peptide (TWA)

End-to-end steps to ship americanpeptide.com to the Play Store as a Trusted Web
Activity (TWA). Follow top to bottom. Companion files:
- `PLAY_LISTING.md` — all store listing text (paste-ready).
- `src/lib/platform.ts` — the reference-only build gate.
- `src/app/.well-known/assetlinks.json/route.ts` — Digital Asset Links.

Status legend:  ✅ done   ⏳ waiting/blocked   ▶️ your action

---

## 0. Where things stand

- ✅ PWA is valid (manifest, service worker, icon set).
- ✅ Asset Links route, reference-only gate, and `/privacy` page are in the repo.
- ✅ Listing copy drafted.
- ⏳ DUNS verification submitted (gates the Play *organization* account).
- ⏳ `app.americanpeptide.com` DNS resolves, but it is still serving the OLD
  build — without the gate and without `assetlinks.json`. Step 1 fixes that.

---

## 1. Stand up the app deployment  ▶️

The TWA loads a LIVE URL — we point it at `app.americanpeptide.com`, built in
*reference-only* mode so Play reviewers never see the affiliate layer.

**The Vercel catch:** one Vercel project serves all its domains from a single
build with a single set of env vars. So `www` (full funnel) and `app` (gated)
cannot differ inside one project. Use ONE of these:

**Option A — Separate Vercel project (recommended, simplest mental model).**
1. In Vercel, create a *second* project from the same Git repo.
2. Set its Environment Variables (Production):
   ```
   NEXT_PUBLIC_PLATFORM = android
   ANDROID_PACKAGE_NAME = com.americanpeptide.twa
   ANDROID_SHA256_FINGERPRINTS =        (leave empty for now — filled in Step 4)
   ```
3. Add the domain `app.americanpeptide.com` to THIS project (move it here if it
   was attached to the main project). Vercel will guide the DNS/verification.
4. Deploy. The main `www` project is untouched and keeps the full affiliate UI.

**Option B — One project, Preview branch.** Create a long-lived branch (e.g.
`app`), scope `NEXT_PUBLIC_PLATFORM=android` to the Preview environment for that
branch, and assign `app.americanpeptide.com` to the branch deployment. Workable
but easier to misconfigure than Option A.

**First: commit and push the new code** (gate, assetlinks route, privacy page,
listing docs) so the app deployment actually has it. They're currently local
only.

**Verify Step 1 before continuing:**
```
# Gate active — affiliate/"Where to source" must NOT appear on app domain:
open https://app.americanpeptide.com/catalog/semaglutide

# Outbound redirect neutralized — should 302 to /catalog, not an external vendor:
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://app.americanpeptide.com/go/test

# Asset links served (fingerprints empty for now, but valid JSON + 200):
curl -s https://app.americanpeptide.com/.well-known/assetlinks.json

# Privacy page live (required for the listing):
curl -s -o /dev/null -w "%{http_code}\n" https://app.americanpeptide.com/privacy
```

---

## 2. Create the Google Play developer account  ⏳▶️

1. Go to https://play.google.com/console and pay the one-time **$25** fee.
2. **Organization** account (recommended for a brand): requires the **D-U-N-S
   number** — that's the verification you've submitted. Org accounts skip the
   closed-testing-before-launch requirement (see Step 7).
   - Individual account is faster but: (a) requires ID verification, and (b) if
     created recently, must run a **closed test with 12+ testers for 14 days**
     before it can publish to Production.
3. Complete identity/contact verification when prompted.

---

## 3. Install Bubblewrap and generate the app  ▶️

Bubblewrap is Google's official TWA generator. Needs Node 18+ and JDK 17 (it can
install the Android SDK/JDK for you on first run).

```
npm i -g @bubblewrap/cli
bubblewrap doctor          # installs/locates JDK + Android SDK
```

Initialize FROM the app deployment's manifest (not www):
```
bubblewrap init --manifest https://app.americanpeptide.com/manifest.json
```
Answer the prompts:
- **Application ID / package name:** `com.americanpeptide.twa`
  (must match `ANDROID_PACKAGE_NAME` in Step 1).
- **App name:** American Peptide   ·   **Launcher name:** American Peptide
- **Display mode:** standalone   ·   **Orientation:** default (or portrait)
- **Status bar / theme color:** accept manifest defaults (`#0B1220`).
- **Signing key:** let Bubblewrap CREATE a new keystore. **Back up the
  `.keystore` file and its passwords somewhere safe** — lose it and you can't
  ship updates under this app without a key reset.

Build the release bundle:
```
bubblewrap build
```
Produces `app-release-bundle.aab` (upload this) and `app-release-signed.apk`
(handy for a quick on-device smoke test).

---

## 4. Wire up Digital Asset Links  ▶️

The app verifies it owns the domain via two SHA-256 fingerprints. Without BOTH,
the TWA shows a browser address bar (a visible failure).

1. **Upload-key fingerprint** (your local keystore):
   ```
   bubblewrap fingerprint
   ```
   (or `keytool -list -v -keystore <the>.keystore -alias <alias>` and copy the
   SHA-256.)
2. **Play App Signing fingerprint:** appears AFTER you upload the AAB once
   (Step 6). Play Console ▸ Test and release ▸ Setup ▸ **App signing** ▸ copy the
   "SHA-256 certificate fingerprint" under *App signing key certificate*.
   - Google re-signs your bundle, so this is the cert users actually install —
     it MUST be in `assetlinks.json`.
3. Put both into the app deployment's env (comma-separated), then redeploy:
   ```
   ANDROID_SHA256_FINGERPRINTS = AA:BB:...:11 , CC:DD:...:22
   ```
4. Verify:
   ```
   curl -s https://app.americanpeptide.com/.well-known/assetlinks.json
   ```
   Then run Google's checker:
   https://developers.google.com/digital-asset-links/tools/generator
   (source = https://app.americanpeptide.com, package = com.americanpeptide.twa).

> Order note: you'll do 4.1 before upload, then come back for 4.2 after the first
> upload exists. The address bar disappears once both fingerprints are live and
> the user has a fresh app launch.

---

## 5. Create the app in Play Console  ▶️

1. Play Console ▸ **Create app**.
   - Name: **American Peptide: Research**  (≤30 chars)
   - Default language: English (US)  ·  App  ·  Free
   - Confirm the declarations (developer program policies, US export laws).
2. **Store listing** — paste from `PLAY_LISTING.md`:
   - Short + full description, app icon (512×512), feature graphic (1024×500),
     phone screenshots (2–8), category **Education**, contact email, and the
     privacy policy URL `https://app.americanpeptide.com/privacy`.
3. **Content rating** — complete the questionnaire per `PLAY_LISTING.md`
   (references restricted substances = yes; facilitates purchase = no; medical
   advice = no). Expect Mature 17+ / PEGI 18.
4. **Target audience & content** — set to **18+ adults only**. Do not mark as
   appealing to children.
5. **Data safety** — fill in exactly as `PLAY_LISTING.md` describes (Vercel
   analytics; assistant text to AI provider; encrypted in transit; no sale).
   Must match the privacy policy.
6. **App access** — if any area needs login, provide test credentials;
   otherwise declare "all functionality available without restrictions."
7. **Ads** — declare **No ads** (unless you add them).
8. **Government apps / financial / health** declarations — answer honestly;
   this is a reference tool, not a health app providing medical services.

---

## 6. Upload and test  ▶️

1. **Testing ▸ Internal testing ▸ Create release.**
2. Upload `app-release-bundle.aab`. (First upload enrolls you in Play App
   Signing → now go do Step 4.2, set the second fingerprint, redeploy.)
3. Add yourself + testers as internal testers; share the opt-in link.
4. Install on a real device and check:
   - App opens full-screen with **no browser address bar** (= asset links OK).
   - Catalog, reconstitution + blend calculators, COA decoder, glossary,
     trials, and the research assistant all work.
   - **No** "Where to source" / vendor links anywhere (= gate OK).
   - Offline: calculators still work with airplane mode on.

---

## 7. Promote to production  ▶️

1. **(Individual accounts created recently only)** Run **Closed testing** with
   **12+ testers for 14 continuous days** before Production unlocks. Org
   accounts skip this. ⟵ plan the calendar around this if you went individual.
2. **Testing ▸ Production ▸ Create release** → reuse the same AAB.
3. Set rollout (start at 20–100%).
4. Submit for review. First review for a new account commonly takes a few days
   and may include extra identity/app checks. Restricted-substance topics can
   draw closer scrutiny — the reference-only gate is your main defense.

---

## 8. If it gets rejected

Most likely reason = **restricted/unapproved substances** or **facilitating
sale of regulated goods**. Response playbook:
- Confirm the gate is actually live on the reviewed build (re-run Step 1 checks).
  A reviewer seeing a vendor link is the #1 own-goal.
- Read the exact policy citation in the rejection; address that clause
  specifically in the appeal, pointing to the in-app disclaimer and the
  reference-only scope.
- If catalog wording reads as promotional for a substance, neutralize it to
  plainly factual/encyclopedic.
- Appeal via the rejection email link; if needed, remove the flagged surface and
  resubmit. Don't resubmit unchanged.

---

## 9. Updating the app later

- Content/feature changes that live on the website ship instantly — the TWA
  loads the live site, no Play re-submission needed.
- You only rebuild + re-upload the AAB when you change native shell config
  (package name, icons baked into the bundle, target SDK, app name). Bump
  `appVersionCode`/`appVersionName` in `twa-manifest.json`, `bubblewrap build`,
  upload a new release.
- Keep the keystore + passwords backed up. Same key for every update.

---

## Quick reference

| Thing | Value |
|---|---|
| Package name | `com.americanpeptide.twa` |
| App deployment | `https://app.americanpeptide.com` (NEXT_PUBLIC_PLATFORM=android) |
| Manifest for Bubblewrap | `https://app.americanpeptide.com/manifest.json` |
| Asset links | `https://app.americanpeptide.com/.well-known/assetlinks.json` |
| Privacy policy | `https://app.americanpeptide.com/privacy` |
| Listing copy | `PLAY_LISTING.md` |
| Upload artifact | `app-release-bundle.aab` |
