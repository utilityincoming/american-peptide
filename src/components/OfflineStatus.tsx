'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CloudOff,
  Download,
  Loader2,
  WifiOff,
} from 'lucide-react'

type CacheState = 'unsupported' | 'registering' | 'ready' | 'error'

// Subset of the BeforeInstallPromptEvent surface we actually use.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function OfflineStatus() {
  const [cacheState, setCacheState] = useState<CacheState>('registering')
  const [online, setOnline] = useState(true)
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(
    null,
  )
  const [installed, setInstalled] = useState(false)

  // Register the service worker. In dev (next dev) we skip — service workers
  // in development mode interfere with HMR and Next.js's runtime chunks.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) {
      setCacheState('unsupported')
      return
    }
    if (process.env.NODE_ENV !== 'production') {
      // In dev, just report ready (no SW is registered in development).
      setCacheState('ready')
      return
    }
    // Registration is handled site-wide by ServiceWorkerRegistrar; here we just
    // wait for the active worker and report readiness.
    navigator.serviceWorker.ready
      .then(() => setCacheState('ready'))
      .catch(() => setCacheState('error'))
  }, [])

  // Online / offline tracking.
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Install-prompt capture (Chrome/Edge desktop + Android).
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }

    // Already running as a standalone PWA?
    const standalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari
        (navigator as Navigator & { standalone?: boolean }).standalone === true)
    if (standalone) setInstalled(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const onInstall = async () => {
    if (!installEvent) return
    try {
      await installEvent.prompt()
      const { outcome } = await installEvent.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setInstallEvent(null)
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <StatusPill cacheState={cacheState} online={online} />
      {!online && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-amber-300/85">
          <WifiOff className="h-3 w-3" />
          You&apos;re offline — calculations still work
        </span>
      )}
      {installEvent && !installed && (
        <button
          type="button"
          onClick={onInstall}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/35 bg-[#2DD4A8]/[0.10] px-3 py-1 text-[11px] font-semibold text-[#2DD4A8] transition-colors hover:border-[#2DD4A8]/55 hover:bg-[#2DD4A8]/[0.18]"
        >
          <Download className="h-3 w-3" />
          Install for offline use
        </button>
      )}
      {installed && (
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#2DD4A8]/85">
          <CheckCircle2 className="h-3 w-3" />
          Installed
        </span>
      )}
    </div>
  )
}

function StatusPill({
  cacheState,
  online,
}: {
  cacheState: CacheState
  online: boolean
}) {
  if (cacheState === 'unsupported') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/45">
        <CloudOff className="h-3 w-3" />
        Offline mode unsupported on this browser
      </span>
    )
  }
  if (cacheState === 'registering') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55">
        <Loader2 className="h-3 w-3 animate-spin" />
        Caching for offline use…
      </span>
    )
  }
  if (cacheState === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-1 text-[11px] text-amber-300/80">
        <CloudOff className="h-3 w-3" />
        Offline caching unavailable
      </span>
    )
  }
  // ready
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2DD4A8]/25 bg-[#2DD4A8]/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#2DD4A8]">
      <CheckCircle2 className="h-3 w-3" />
      {online ? 'Available offline' : 'Running offline'}
    </span>
  )
}
