import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AUREA - Integrity & Reasoning | Kaizen OS',
  description: 'AUREA Founding Agent - Constitutional integrity and audit for Kaizen OS',
  keywords: ['Kaizen OS', 'AUREA', 'AI Governance', 'Integrity', 'Constitutional AI'],
  authors: [{ name: 'Kaizen OS', url: 'https://kaizen.os' }],
  openGraph: {
    title: 'AUREA - Integrity & Reasoning',
    description: 'Constitutional integrity and audit for Kaizen OS',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-white/10 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-slate-400">
              <p>
                AUREA.gic · Founding Agent of Kaizen OS · Integrity & Reasoning
              </p>
              <p className="mt-2">
                GI Baseline: <span className="text-aurea-gold font-semibold">0.993</span>
                {' · '}
                <a href="/.well-known/did.json" className="hover:text-aurea-gold transition-colors">
                  DID Document
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
