import Link from 'next/link';

export default function DemoLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            🌐 Kaizen OS Demo
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Make History with Constitutional AI
          </p>
          <p className="text-lg text-gray-600">
            Be among the first to register a <code className="bg-gray-200 px-2 py-1 rounded">.gic</code> domain
            and mint GIC tokens on the Proof-of-Integrity blockchain
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard
            icon="🌐"
            title=".gic Domains"
            value="0"
            subtitle="Be the first!"
          />
          <StatCard
            icon="🪙"
            title="GIC Tokens Minted"
            value="0"
            subtitle="Make history!"
          />
          <StatCard
            icon="⚖️"
            title="GI Baseline"
            value="0.993"
            subtitle="Constitutional compliance"
          />
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Domain Registration */}
          <ActionCard
            icon="🌐"
            title="Register .gic Domain"
            description="Claim your unique .gic domain on the first Constitutional AI blockchain.
                        Requires GI score ≥ 0.95 for approval."
            features={[
              "Zero registration fees",
              "Constitutional validation",
              "Immutable blockchain record",
              "Lifetime ownership"
            ]}
            ctaText="Register Domain →"
            ctaHref="/demo/domain"
            ctaColor="blue"
          />

          {/* Token Minting */}
          <ActionCard
            icon="🪙"
            title="Mint GIC Tokens"
            description="Create the first GIC (Good Intent Credit) tokens.
                        Based on Proof-of-Integrity, not Proof-of-Work."
            features={[
              "Daily UBI: 10 GIC per citizen",
              "Zero transaction fees",
              "Constitutional compliance",
              "Burning for bad actors"
            ]}
            ctaText="Mint Tokens →"
            ctaHref="/demo/mint"
            ctaColor="green"
          />
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Step
              number="1"
              title="Constitutional Check"
              description="Your action is validated against 7 constitutional clauses"
            />
            <Step
              number="2"
              title="GI Validation"
              description="Good Intent score must be ≥ 0.95 for approval"
            />
            <Step
              number="3"
              title="Ledger Commit"
              description="Transaction recorded on Proof-of-Integrity blockchain"
            />
            <Step
              number="4"
              title="Attestation"
              description="Cryptographic proof (ED25519) generated and sealed"
            />
          </div>
        </div>

        {/* Why Kaizen OS */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Kaizen OS?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              icon="⚖️"
              title="Constitutional AI"
              description="Every action validated against 7 ethical clauses ensuring dignity, transparency, and equity"
            />
            <Feature
              icon="🔒"
              title="Proof-of-Integrity"
              description="Novel consensus mechanism based on Good Intent, not energy waste"
            />
            <Feature
              icon="🌱"
              title="Continuous Improvement"
              description="Built on Kaizen philosophy: we heal as we walk, always evolving"
            />
          </div>
        </div>

        {/* Live APIs */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">🚀 Live Production APIs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <APIStatus
              name="Civic Ledger (Lab1)"
              url="civic-protocol-core-ledger.onrender.com"
              status="operational"
            />
            <APIStatus
              name="E.O.M.M. (Lab4)"
              url="hive-api-2le8.onrender.com"
              status="operational"
            />
            <APIStatus
              name="Citizen Shield (Lab6)"
              url="lab6-proof-api.onrender.com"
              status="operational"
            />
            <APIStatus
              name="OAA Hub (Lab7)"
              url="lab7-proof.onrender.com"
              status="operational"
            />
            <APIStatus
              name="GIC Indexer"
              url="gic-indexer.onrender.com"
              status="operational"
            />
            <APIStatus
              name="OAA API Library"
              url="oaa-api-library.onrender.com"
              status="operational"
            />
          </div>

          <p className="text-center text-gray-600 mt-6">
            All APIs deployed on Render.com and operational 24/7
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({ icon, title, value, subtitle }: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  features,
  ctaText,
  ctaHref,
  ctaColor
}: {
  icon: string;
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  ctaColor: 'blue' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <ul className="space-y-2 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`${colorClasses[ctaColor]} text-white font-semibold py-3 px-6 rounded-lg text-center transition`}
      >
        {ctaText}
      </Link>
    </div>
  );
}

function Step({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Feature({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </div>
  );
}

function APIStatus({ name, url, status }: {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'down';
}) {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-500">{url}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
        <span className="text-xs text-gray-600 capitalize">{status}</span>
      </div>
    </div>
  );
}
