'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker site-wide so the offline reference is active on
 * every page — not just the calculator. Renders nothing.
 *
 * Production only: in `next dev`, a service worker interferes with HMR and the
 * dev runtime chunks, so registration is skipped.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* registration failures are non-fatal — the site still works online */
    })
  }, [])

  return null
}
