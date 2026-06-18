'use client'

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

// Reader-profile editor for the Peptide Agent. Persists to localStorage under
// 'ap_profile'; the research page reads that key fresh on every send, so edits
// take effect on the next message with no prop plumbing. Every value here is
// re-validated server-side (enum-whitelisted or resolved against the catalog),
// so free-text focus/compound entries that don't match are simply dropped.

const STORAGE_KEY = 'ap_profile'

type Expertise = 'consumer' | 'researcher'
type Depth = 'concise' | 'standard' | 'deep'
type Units = 'metric' | 'us'

interface Profile {
  expertise?: Expertise
  depth?: Depth
  units?: Units
  focusAreas?: string[]
  compounds?: string[]
}

const EXPERTISE: { value: Expertise; label: string }[] = [
  { value: 'consumer', label: 'General reader' },
  { value: 'researcher', label: 'Researcher' },
]
const DEPTH: { value: Depth; label: string }[] = [
  { value: 'concise', label: 'Concise' },
  { value: 'standard', label: 'Standard' },
  { value: 'deep', label: 'In-depth' },
]
const UNITS: { value: Units; label: string }[] = [
  { value: 'metric', label: 'Metric' },
  { value: 'us', label: 'US' },
]

function parseList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (v: T | undefined) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            // Click the active option again to clear it.
            onClick={() => onChange(active ? undefined : o.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              active
                ? 'border-[#2DD4A8]/40 bg-[#2DD4A8]/[0.12] text-accent'
                : 'border-ink/[0.08] bg-ink/[0.02] text-ink/55 hover:border-[#2DD4A8]/25 hover:text-ink/80'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export default function ProfilePanel() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>({})
  const [focusInput, setFocusInput] = useState('')
  const [compoundsInput, setCompoundsInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw) as Profile
        if (p && typeof p === 'object') {
          setProfile(p)
          setFocusInput((p.focusAreas ?? []).join(', '))
          setCompoundsInput((p.compounds ?? []).join(', '))
        }
      }
    } catch {
      /* absent or malformed — start empty */
    }
  }, [])

  // Persist whenever the structured profile changes. An empty profile clears
  // the key entirely so no stale `context.profile` is sent.
  useEffect(() => {
    try {
      const clean: Profile = {}
      if (profile.expertise) clean.expertise = profile.expertise
      if (profile.depth) clean.depth = profile.depth
      if (profile.units) clean.units = profile.units
      if (profile.focusAreas?.length) clean.focusAreas = profile.focusAreas
      if (profile.compounds?.length) clean.compounds = profile.compounds
      if (Object.keys(clean).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage unavailable — ignore */
    }
  }, [profile])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const activeCount =
    (profile.expertise ? 1 : 0) +
    (profile.depth ? 1 : 0) +
    (profile.units ? 1 : 0) +
    (profile.focusAreas?.length ? 1 : 0) +
    (profile.compounds?.length ? 1 : 0)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-ink/35 transition-colors hover:bg-ink/[0.05] hover:text-ink"
        aria-label="Reader profile"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Profile</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-[#2DD4A8]/[0.15] px-1.5 text-[10px] font-semibold text-accent">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-ink/[0.08] bg-surface p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Reader profile</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-ink/35 hover:bg-ink/[0.05] hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-4 text-[11px] leading-relaxed text-ink/40">
            Tunes how the Agent answers. Stored only in this browser.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                Audience
              </label>
              <Segmented
                options={EXPERTISE}
                value={profile.expertise}
                onChange={(v) => setProfile((p) => ({ ...p, expertise: v }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                Answer depth
              </label>
              <Segmented
                options={DEPTH}
                value={profile.depth}
                onChange={(v) => setProfile((p) => ({ ...p, depth: v }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                Units
              </label>
              <Segmented
                options={UNITS}
                value={profile.units}
                onChange={(v) => setProfile((p) => ({ ...p, units: v }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                Research focus
              </label>
              <input
                value={focusInput}
                onChange={(e) => {
                  setFocusInput(e.target.value)
                  setProfile((p) => ({ ...p, focusAreas: parseList(e.target.value) }))
                }}
                placeholder="weight loss, healing, longevity…"
                className="w-full rounded-lg border border-ink/[0.08] bg-ink/[0.02] px-3 py-2 text-xs text-ink placeholder:text-ink/25 focus:border-[#2DD4A8]/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                Following compounds
              </label>
              <input
                value={compoundsInput}
                onChange={(e) => {
                  setCompoundsInput(e.target.value)
                  setProfile((p) => ({ ...p, compounds: parseList(e.target.value) }))
                }}
                placeholder="semaglutide, BPC-157…"
                className="w-full rounded-lg border border-ink/[0.08] bg-ink/[0.02] px-3 py-2 text-xs text-ink placeholder:text-ink/25 focus:border-[#2DD4A8]/40 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-ink/30">
                Comma-separated. Unrecognized names are ignored.
              </p>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => {
                setProfile({})
                setFocusInput('')
                setCompoundsInput('')
              }}
              className="mt-4 w-full rounded-lg border border-ink/[0.08] py-2 text-xs text-ink/45 transition-colors hover:border-ink/20 hover:text-ink/70"
            >
              Clear profile
            </button>
          )}
        </div>
      )}
    </div>
  )
}
