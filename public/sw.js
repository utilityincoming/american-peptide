// AmericanPeptide.com — offline service worker
//
// Scope: makes the reconstitution calculator (and other visited pages)
// usable offline after at least one online visit.
//
// Strategy:
//   - HTML routes: network-first with cache fallback (so users get fresh
//     deploys when online, last-good cache when offline)
//   - /_next/static/* (fingerprinted JS/CSS): cache-first (immutable)
//   - manifest + icon: cache-first
//   - Cross-origin requests: passed through to the network (no SW handling)
//
// Versioned cache name: bump CACHE_VERSION on breaking SW changes to evict
// stale entries. Routine deploys don't need a bump because /_next/static/*
// URLs change with every build.

// Bumped from v1 → v2 after icon set swap (old /icon.svg / /icon-maskable.svg
// no longer exist; bumping evicts the stale cache for any installed clients).
const CACHE_VERSION = 'v2'
const CACHE_NAME = `amp-offline-${CACHE_VERSION}`

const OFFLINE_FALLBACK = '/tools/reconstitution-calculator'

// Pre-cache the calculator HTML route so the first offline launch works
// even if the user installs the app and immediately drops connection.
const PRECACHE_URLS = ['/tools/reconstitution-calculator', '/manifest.json']

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
            .filter((k) => k.startsWith('amp-offline-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
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

  // Network-first for HTML routes — fresh content when online,
  // cached fallback when offline.
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

  // Cache-first for fingerprinted static assets — they are immutable
  // by URL, so a cache hit is always safe.
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
