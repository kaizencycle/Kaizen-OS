import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobius Handbook Library',
  description: 'Interactive Mobius handbook — live proof, graph shell, future search',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
