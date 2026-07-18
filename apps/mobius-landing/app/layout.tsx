import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobius — See, understand, and help shape the world',
  description:
    'A shared AI-native world where humans and machines learn, witness, simulate, and build together. Read the Pulse, enter the Chambers, explore HIVE.',
  openGraph: {
    title: 'Mobius — See, understand, and help shape the world',
    description:
      'Read the Pulse. Enter the Chambers. Explore HIVE. A journey-first front door to the Mobius ecosystem.',
    images: ['/og.jpg'],
  },
  twitter: { 
    card: "summary_large_image" 
  }
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
