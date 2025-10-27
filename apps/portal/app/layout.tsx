import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kaizen OS - Model-Agnostic Sovereignty Layer',
  description: 'Constitutional validation, GI scoring, and consensus for AI & humans',
  keywords: ['AI', 'sovereignty', 'constitution', 'integrity', 'consensus'],
  authors: [{ name: 'Kaizen OS Team' }],
  openGraph: {
    title: 'Kaizen OS - Model-Agnostic Sovereignty Layer',
    description: 'Constitutional validation, GI scoring, and consensus for AI & humans',
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
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}