'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

// Reads the theme the no-flash script (in layout.tsx) already applied to <html>,
// then lets the user flip it. Choice is persisted to localStorage; absent a
// stored choice the script falls back to the OS preference.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
    // Enable color transitions only after first paint, so the initial load
    // doesn't animate from the wrong colors.
    document.documentElement.classList.add('theme-ready')
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('light', next === 'light')
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* storage may be unavailable (private mode); the in-page toggle still works */
    }
    setTheme(next)
  }

  // Render a stable placeholder until mounted to avoid hydration mismatch
  // (server can't know the client's stored/OS preference).
  const isLight = mounted && theme === 'light'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/[0.08] bg-ink/[0.02] text-ink/75 transition-colors hover:bg-ink/[0.06] hover:text-ink"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
