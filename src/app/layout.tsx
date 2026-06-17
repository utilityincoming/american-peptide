import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'
import SectionNav from '@/components/SectionNav'
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

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.americanpeptide.com'),
  title: 'AmericanPeptide.com — AI-Powered Peptide Research',
  description:
    'An AI-assisted research platform and open reference for peptide science — explore how peptides are designed, synthesized, purified, and proven, with the Peptide Agent, an open catalog, and hands-on tools.',
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
  openGraph: {
    type: 'website',
    siteName: 'AmericanPeptide.com',
    title: 'AmericanPeptide.com — AI-Powered Peptide Research',
    description:
      'AI-assisted research platform and open reference for peptide science — catalog, Peptide Agent, clinical trials, synthesis guides, and hands-on tools.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@americanpeptide',
    title: 'AmericanPeptide.com — AI-Powered Peptide Research',
    description:
      'AI-assisted research platform and open reference for peptide science — catalog, Peptide Agent, clinical trials, synthesis guides, and hands-on tools.',
  },
}

// themeColor (mobile browser chrome) is driven by JS in the no-flash script
// below so it tracks the actually-applied theme — OS preference *and* the
// user's manual toggle — not just prefers-color-scheme. The <meta> default is
// rendered in <head>; the script and ThemeToggle update its content.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// GA4 measurement ID (e.g. "G-XXXXXXXXXX"). Set NEXT_PUBLIC_GA_ID in the
// environment (Vercel project settings) to enable Google Analytics; when unset
// — local dev, previews — GA simply doesn't load. Coexists with Vercel Analytics.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Default chrome color (dark); the script below flips it to match the
            applied theme before paint. */}
        <meta name="theme-color" content="#0B1220" />
        {/* No-flash theme: apply the stored/OS preference before first paint,
            so light-mode users never see a dark flash. Default is dark. Also
            syncs the mobile browser-chrome color to the resolved theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: light)').matches;var light=(s==='light'||(!s&&m));if(light){document.documentElement.classList.add('light');}var mc=document.querySelector('meta[name="theme-color"]');if(mc){mc.setAttribute('content',light?'#F7F9FB':'#0B1220');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ServiceWorkerRegistrar />
        <SiteHeader />
        <SectionNav />
        {children}
        <Footer />
        <ResearchUseGate />
        <Analytics />
        <SpeedInsights />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
