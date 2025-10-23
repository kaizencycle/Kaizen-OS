import React from 'react';
import Head from 'next/head';

export default function CivicAI() {
  return (
    <>
      <Head>
        <title>Civic AI - Open Standard for Ethical AI</title>
        <meta name="description" content="Open standard for ethical, verifiable, and geocivic AI systems that serve the common good" />
        <meta name="keywords" content="civic AI, ethical AI, AI standards, open source AI, community AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Civic AI Standard
            </h1>
            <p className="text-2xl text-gray-600 mb-4">
              Open standard for ethical, verifiable, and geocivic AI systems
            </p>
            <p className="text-lg text-gray-500 italic">
              "We heal as we walk."
            </p>
          </header>

          <section className="mb-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
                Core Components
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    OAA (Online Apprenticeship Agent)
                  </h3>
                  <p className="text-gray-600">
                    Learning and reflection engine that enables AI systems to learn from interactions,
                    reflect on their actions, and improve over time while maintaining ethical alignment.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    DVA (Digital Vector Architecture)
                  </h3>
                  <p className="text-gray-600">
                    Governance and integrity kernel that provides decision-making frameworks,
                    ethical constraint enforcement, and community input integration.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📜</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Civic Ledger Core
                  </h3>
                  <p className="text-gray-600">
                    Proof-of-integrity ledger that records all AI decisions and actions,
                    provides cryptographic proof of authenticity, and enables audit trails.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    GIC (Global Integrity Credit)
                  </h3>
                  <p className="text-gray-600">
                    Incentive and reputation economy that rewards ethical behavior,
                    penalizes harmful actions, and enables community governance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔍 Verifiability
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Cryptographically signed decisions</li>
                  <li>• Complete audit trails</li>
                  <li>• Transparent processes</li>
                  <li>• Community verification</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🌍 Cultural Integration
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Multiple cultural wisdom</li>
                  <li>• Local value respect</li>
                  <li>• Community adaptation</li>
                  <li>• Cultural diversity</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ⚖️ Ethical Alignment
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Built-in constraints</li>
                  <li>• Community input</li>
                  <li>• Regular reviews</li>
                  <li>• Continuous improvement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
              Use Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🏛️ Community Governance
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Participatory decision-making</li>
                  <li>• Transparent voting systems</li>
                  <li>• Community resource management</li>
                  <li>• Conflict resolution</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🎓 Education
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Personalized learning systems</li>
                  <li>• Cultural knowledge preservation</li>
                  <li>• Skill development programs</li>
                  <li>• Mentorship networks</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🏥 Healthcare
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Diagnostic assistance systems</li>
                  <li>• Treatment recommendation engines</li>
                  <li>• Health monitoring tools</li>
                  <li>• Community health initiatives</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🌱 Environmental Protection
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Climate monitoring systems</li>
                  <li>• Resource management tools</li>
                  <li>• Conservation planning</li>
                  <li>• Sustainability tracking</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
              Getting Started
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    For Developers
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 text-gray-600">
                    <li>Review the complete specification</li>
                    <li>Choose your implementation approach</li>
                    <li>Set up the required infrastructure</li>
                    <li>Begin with pilot projects</li>
                    <li>Scale based on success</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    For Communities
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 text-gray-600">
                    <li>Understand the core principles</li>
                    <li>Identify community needs</li>
                    <li>Engage with local stakeholders</li>
                    <li>Start with small initiatives</li>
                    <li>Build on successes</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
              Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📚 Documentation
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/specs/01-overview.md" className="text-blue-600 hover:underline">Overview</a></li>
                  <li><a href="/specs/02-attestations.md" className="text-blue-600 hover:underline">Attestations</a></li>
                  <li><a href="/specs/03-agent-ethics.md" className="text-blue-600 hover:underline">Agent Ethics</a></li>
                  <li><a href="/schemas" className="text-blue-600 hover:underline">JSON Schemas</a></li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🛠️ Tools
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/examples" className="text-blue-600 hover:underline">Examples</a></li>
                  <li><a href="/sdk" className="text-blue-600 hover:underline">SDKs</a></li>
                  <li><a href="/tools" className="text-blue-600 hover:underline">Development Tools</a></li>
                  <li><a href="/templates" className="text-blue-600 hover:underline">Templates</a></li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  👥 Community
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/contributing" className="text-blue-600 hover:underline">Contributing</a></li>
                  <li><a href="/governance" className="text-blue-600 hover:underline">Governance</a></li>
                  <li><a href="/forum" className="text-blue-600 hover:underline">Community Forum</a></li>
                  <li><a href="/events" className="text-blue-600 hover:underline">Events</a></li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-center">
              © 2025 Kaizen Cycle / Michael Judan — Civic AI Standard
            </p>
            <p className="text-gray-500 text-center mt-2">
              <em>We heal as we walk.</em>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}