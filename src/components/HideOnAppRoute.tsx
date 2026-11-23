'use client'

import { usePathname } from 'next/navigation'

// Routes that render as a self-contained, full-height app shell and own the
// whole viewport below the site header. On these, the marketing footer is
// clutter (and pushes the app's own input bar below the fold), so site chrome
// passed as children is suppressed. Keep this list exact — sub-routes like
// /research/pass are ordinary pages that keep the footer.
const APP_ROUTES = new Set(['/research'])

export default function HideOnAppRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  if (APP_ROUTES.has(pathname)) return null
  return <>{children}</>
}
