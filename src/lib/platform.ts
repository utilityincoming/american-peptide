// Build target flag.
//
// The Google Play (TWA) build loads this same site, but Play's restricted-
// substance policy makes the affiliate / "where to source" layer risky inside
// an Android app. So we ship a reference-only variant: same research tools,
// no outbound vendor links.
//
// Because a Trusted Web Activity loads the LIVE site (it does not bundle its own
// copy), the gate is a BUILD-TIME env var baked into the deployment the app
// points at — e.g. a dedicated `app.americanpeptide.com` deployment, or a second
// Vercel project, built with:
//
//     NEXT_PUBLIC_PLATFORM=android
//
// That deployment renders no affiliate UI, so Play reviewers never see it, while
// the main web deployment (no env var) is unchanged. The constant is inlined at
// build time, so static generation and SEO on the web build are unaffected.

export const IS_APP_BUILD = process.env.NEXT_PUBLIC_PLATFORM === 'android'
