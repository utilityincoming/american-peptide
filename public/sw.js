// AmericanPeptide.com — offline service worker
//
// Goal: make the site a genuine offline peptide reference. The calculator,
// catalog hubs, and all visited pages work offline after one online visit;
// an opt-in "Download reference" action bulk-caches every catalog + glossary
// page so the full reference works offline with no prior browsing.
//
// Strategy:
//   - HTML routes: network-first with cache fallback (fresh when online,
//     last-good cache when offline)
//   - /_next/static/* (fingerprinted JS/CSS): cache-first (immutable)
//   - manifest + icons: cache-first
//   - Cross-origin requests: passed through (no SW handling)
//
// Two caches:
//   amp-offline-<ver>  — runtime + precached hubs; evicted on version bump
//   amp-reference-v1   — the opt-in downloaded reference; PERSISTS across SW
//                        version bumps so a user's offline copy isn't wiped
//                        by a routine deploy.

const CACHE_VERSION = 'v5'
const CACHE_NAME = `amp-offline-${CACHE_VERSION}`
const REFERENCE_CACHE = 'amp-reference-v1'

// Branded fallback shown when an uncached page is requested offline.
const OFFLINE_FALLBACK = '/offline'

// Precache the core hubs + the open catalog JSON on install, so the first
// offline launch has working entry points and all peptide data on hand.
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/catalog',
  '/synthesis',
  '/glossary',
  '/research-areas',
  '/tools/reconstitution-calculator',
  '/developers',
  '/manifest.json',
  '/api/catalog',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: 'reload' })
              .then((res) => (res.ok ? cache.put(url, res) : null))
              .catch(() => null),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // Only evict stale versioned offline caches. The reference cache
            // (different prefix) deliberately survives version bumps.
            .filter((k) => k.startsWith('amp-offline-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// ── Opt-in bulk caching ──────────────────────────────────────────────────────
// The client posts { type: 'CACHE_REFERENCE', urls: [...] }. We fetch and store
// each into the persistent reference cache, then report progress back so the UI
// can show "Saved N pages". Failures are tolerated per-URL.
self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'CACHE_REFERENCE' || !Array.isArray(data.urls)) {
    return
  }

  event.waitUntil(
    caches.open(REFERENCE_CACHE).then(async (cache) => {
      let cached = 0
      await Promise.all(
        data.urls.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'reload' })
            if (res.ok) {
              await cache.put(url, res)
              cached += 1
            }
          } catch {
            /* tolerate individual failures */
          }
        }),
      )
      const clients = await self.clients.matchAll({ includeUncontrolled: true })
      for (const client of clients) {
        client.postMessage({
          type: 'REFERENCE_CACHED',
          count: cached,
          total: data.urls.length,
        })
      }
    }),
  )
})

function isHtmlRequest(request) {
  if (request.mode === 'navigate') return true
  const accept = request.headers.get('accept') || ''
  return accept.includes('text/html')
}

function isStaticAsset(url) {
  const p = url.pathname
  return (
    p.startsWith('/_next/static/') ||
    p === '/manifest.json' ||
    p.startsWith('/favicon') ||
    p.startsWith('/apple-touch-icon') ||
    p.startsWith('/android-chrome')
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Network-first for HTML routes — fresh content when online, cached fallback
  // when offline. caches.match() searches ALL caches, so a page saved in the
  // reference cache is served offline even if never visited this session.
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, copy))
            .catch(() => {})
          return res
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match(OFFLINE_FALLBACK).then(
                (fallback) =>
                  fallback ||
                  new Response(
                    '<h1>Offline</h1><p>This page hasn’t been cached yet.</p>',
                    { headers: { 'content-type': 'text/html' }, status: 503 },
                  ),
              ),
          ),
        ),
    )
    return
  }

  // Cache-first for fingerprinted static assets — immutable by URL.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .catch(() => {})
            }
            return res
          })
          .catch(() => cached)
      }),
    )
  }
})
