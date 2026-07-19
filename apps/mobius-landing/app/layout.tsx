import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';

const siteUrl = 'https://www.mobius-substrate.com';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-serif',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Mobius — See, understand, and help shape the world',
  description:
    'A shared AI-native world where humans and machines learn, witness, simulate, and build together. Read the Pulse, enter the Chambers, explore HIVE.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mobius — See, understand, and help shape the world',
    description:
      'Read the Pulse. Enter the Chambers. Explore HIVE. A journey-first front door to the Mobius ecosystem.',
    url: siteUrl,
    siteName: 'Mobius',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobius — See, understand, and help shape the world',
    description:
      'Read the Pulse. Enter the Chambers. Explore HIVE. A journey-first front door to the Mobius ecosystem.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
