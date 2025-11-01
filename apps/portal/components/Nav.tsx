import Link from 'next/link';
import { HealthBadge } from './HealthBadge';

export function Nav() {
  return (
    <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link href="/" className="font-bold text-xl text-indigo-600">
        Kaizen OS
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/consensus" className="text-slate-700 hover:text-indigo-600 transition-colors">
          Consensus
        </Link>
        <Link href="/consensus/sr" className="text-slate-700 hover:text-indigo-600 transition-colors">
          SR Reports
        </Link>
        <Link href="/companions" className="text-slate-700 hover:text-indigo-600 transition-colors">
          Companions
        </Link>
        <Link href="/charter" className="text-slate-700 hover:text-indigo-600 transition-colors">
          Charter
        </Link>
        <Link href="/docs" className="text-slate-700 hover:text-indigo-600 transition-colors">
          Docs
        </Link>
        <Link 
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors" 
          href="/onboarding"
        >
          Get Started
        </Link>
        <HealthBadge />
      </div>
    </nav>
  );
}