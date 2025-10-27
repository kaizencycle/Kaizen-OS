import Link from 'next/link';

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
        Model-Agnostic Sovereignty Layer for AI & Humans
      </h1>
      <p className="mt-5 text-xl text-slate-700 max-w-3xl">
        Constitutional validation, GI scoring, and consensus—so your agents can act with integrity.
      </p>
      <div className="mt-8 flex gap-4">
        <Link 
          href="/onboarding" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Launch .gic Onboarding
        </Link>
        <Link 
          href="/dashboard" 
          className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Open Dashboard
        </Link>
      </div>
    </section>
  );
}