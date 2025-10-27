import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Nav />
      <Hero />
    </main>
  );
}