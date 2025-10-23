import type { Metadata } from 'next'
import './globals.css'
import NavBar from '../components/NavBar'
import ServiceWorker from '../components/ServiceWorker'

export const metadata: Metadata = {
  title: 'OAA Console - Open Attestation Authority',
  description: 'Open Attestation Authority - STEM Apprenticeship Engine with LLM Stack Interface',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OAA Console',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OAA Console" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-900 text-white antialiased" style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif" }}>
        <ServiceWorker />
        {children}
      </body>
    </html>
  )
}
