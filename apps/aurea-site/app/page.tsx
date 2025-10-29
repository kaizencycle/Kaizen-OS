import Link from 'next/link'
import { Scale, Sparkles, Shield, MessageSquare } from 'lucide-react'
import { GiBadge } from '@/components/GiBadge'
import { SeasonClock } from '@/components/SeasonClock'
import { GICPanel } from '@/components/GICPanel'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-block mb-6">
          <Scale className="w-24 h-24 text-aurea-gold animate-glow" />
        </div>
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-aurea-gold">AUREA</span>
        </h1>
        <p className="text-2xl text-slate-300 mb-2">
          Integrity & Reasoning
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Constitutional integrity and audit. Founding Agent of Kaizen OS.
        </p>

        {/* Live Status */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <GiBadge />
          <div className="h-8 w-px bg-white/20" />
          <SeasonClock />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <Link href="/avatar" className="card hover:scale-105 transition-transform cursor-pointer">
          <MessageSquare className="w-8 h-8 text-aurea-gold mb-3" />
          <h3 className="text-xl font-semibold mb-2">Chat with AUREA</h3>
          <p className="text-slate-400 text-sm">
            Engage in constitutional deliberation and integrity reasoning
          </p>
        </Link>

        <Link href="/epoch" className="card hover:scale-105 transition-transform cursor-pointer">
          <Sparkles className="w-8 h-8 text-aurea-gold mb-3" />
          <h3 className="text-xl font-semibold mb-2">Epoch Dashboard</h3>
          <p className="text-slate-400 text-sm">
            View current epoch status, minting history, and donations
          </p>
        </Link>

        <Link href="/attestations" className="card hover:scale-105 transition-transform cursor-pointer">
          <Shield className="w-8 h-8 text-aurea-gold mb-3" />
          <h3 className="text-xl font-semibold mb-2">Attestations</h3>
          <p className="text-slate-400 text-sm">
            Browse immutable deliberation records on the Civic Ledger
          </p>
        </Link>
      </section>

      {/* GIC Panel */}
      <section className="mb-16">
        <GICPanel />
      </section>

      {/* About AUREA */}
      <section className="card-gold max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-aurea-gold mb-4">
          About AUREA
        </h2>
        <div className="space-y-4 text-slate-200">
          <p>
            <strong className="text-aurea-gold">AUREA</strong> serves as the constitutional
            integrity anchor for Kaizen OS. Through rigorous reasoning and audit protocols,
            AUREA ensures that all governance actions align with the Virtue Accords and
            maintain the system's foundational principles.
          </p>
          <p>
            <strong>Domain Focus:</strong> Integrity & Reasoning
          </p>
          <p>
            <strong>Ledger Role:</strong> Constitutional integrity and audit validation
          </p>
          <p>
            <strong>Sovereignty Model:</strong> Full root-key control with Ed25519 signing
          </p>
          <p>
            <strong>Codex Route:</strong> OpenAI ↔ Local (Ollama) for maximum reliability
          </p>
          <p>
            <strong>GI Target:</strong> 0.99 (Constitutional compliance threshold)
          </p>
          <blockquote className="border-l-4 border-aurea-gold pl-4 italic mt-6">
            "Integrity is our scalability function. Constitutional compliance ensures
            long-term stability."
          </blockquote>
        </div>
      </section>
    </div>
  )
}
