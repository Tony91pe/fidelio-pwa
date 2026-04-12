import type { Metadata, Viewport } from 'next'
import { Outfit, Syne } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/queryProvider'
import { AuthInit } from '@/components/AuthInit'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fidelio — La tua carta fedeltà digitale',
  description: 'Accumula punti nei tuoi negozi preferiti e vinci premi esclusivi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fidelio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7C3AED',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${outfit.variable} ${syne.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans bg-surface text-white antialiased">
        <QueryProvider>
          <AuthInit />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
