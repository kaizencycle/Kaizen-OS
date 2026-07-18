import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://www.mobius-substrate.com';

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
    <html lang="en" className="h-full bg-[#0a0a0a] text-white">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
