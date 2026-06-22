// Digital Asset Links — proves americanpeptide.com authorizes the Android app,
// which lets the Trusted Web Activity run full-screen with no browser address
// bar. Served at /.well-known/assetlinks.json.
//
// Fill these in from env once Bubblewrap has generated your signing key. You
// typically need TWO fingerprints:
//   1. Your local upload key  →  `bubblewrap fingerprint` (or keytool on the
//      .keystore Bubblewrap created).
//   2. Play App Signing key   →  Play Console ▸ Setup ▸ App signing ▸
//      "SHA-256 certificate fingerprint". (Google re-signs your bundle, so this
//      cert is what users actually install — it MUST be listed or verification
//      fails in production.)
//
// Set in the app deployment's env (comma-separated, colon-delimited hex):
//   ANDROID_PACKAGE_NAME=com.americanpeptide.twa
//   ANDROID_SHA256_FINGERPRINTS=AA:BB:...:11,CC:DD:...:22
//
// Verify after deploy: https://developers.google.com/digital-asset-links/tools/generator

const PACKAGE_NAME = process.env.ANDROID_PACKAGE_NAME ?? 'com.americanpeptide.twa'

const FINGERPRINTS = (process.env.ANDROID_SHA256_FINGERPRINTS ?? '')
  .split(',')
  .map((fp) => fp.trim())
  .filter(Boolean)

export async function GET() {
  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: FINGERPRINTS,
      },
    },
  ]

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      // Asset links are fetched by the Play/Chrome verifier; let it cache, but
      // not so long that a fingerprint update takes a day to propagate.
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
