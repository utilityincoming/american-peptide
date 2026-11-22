import type { Metadata } from 'next'

// Admin surfaces are never indexed, never followed. Belt-and-suspenders beside
// the Bearer gate on the underlying /api/admin/* endpoints.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
