import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import ResearchUseGate from '@/components/ResearchUseGate'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.americanpeptide.com'),
  title: 'AmericanPeptide.com — AI-Powered Peptide Drug Discovery',
  description:
    'AI-assisted computational research platform for peptide drug discovery. Design sequences, monitor clinical trials, and synthesize literature at machine speed.',
  manifest: '/manifest.json',
  applicationName: 'AmericanPeptide',
  appleWebApp: {
    capable: true,
    title: 'AmericanPeptide',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1220',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ServiceWorkerRegistrar />
        <SiteHeader />
        {children}
        <Footer />
        <ResearchUseGate />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
