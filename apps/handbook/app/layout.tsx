import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobius Handbook Library',
  description: 'Interactive Mobius handbook — live proof, graph shell, future search',
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0e14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="hb-dark" data-mobius-handbook-library>
      <body>{children}</body>
    </html>
  );
}
