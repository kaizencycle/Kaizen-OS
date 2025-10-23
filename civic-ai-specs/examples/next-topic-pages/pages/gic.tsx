import React from 'react';
import Head from 'next/head';

export default function GIC() {
  return (
    <>
      <Head>
        <title>GIC (Global Integrity Credit) - Civic AI Standard</title>
        <meta name="description" content="Global Integrity Credit system for incentivizing ethical AI behavior and community contribution" />
        <meta name="keywords" content="GIC, Global Integrity Credit, AI incentives, community rewards, ethical AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Global Integrity Credit (GIC)
            </h1>
            <p className="text-xl text-gray-600">
              A sustainable incentive economy that rewards ethical behavior and community contribution
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What is GIC?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                Global Integrity Credit (GIC) is a reputation and incentive system that rewards
                individuals and organizations for contributing to the common good through ethical
                AI development, community service, and knowledge sharing.
              </p>
              <p className="text-gray-600">
                GIC creates a sustainable economy where value creation, ethical behavior, and
                community benefit are rewarded, aligning individual incentives with collective well-being.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Core Principles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Value Creation
                </h3>
                <p className="text-gray-600">
                  GIC rewards actions that create value for the community, including contributing
                  to open source projects, providing helpful information, and building useful tools.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ethical Behavior
                </h3>
                <p className="text-gray-600">
                  GIC incentivizes ethical conduct, including honest communication, respectful
                  interaction, fair dealing, and transparent processes.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Long-term Thinking
                </h3>
                <p className="text-gray-600">
                  GIC promotes sustainable practices, future-oriented decisions, environmental
                  responsibility, and community building.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Benefit
                </h3>
                <p className="text-gray-600">
                  GIC rewards community service, including helping others, mentoring newcomers,
                  contributing to governance, and supporting diversity.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How to Earn GIC
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Content Creation
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">High-quality posts</h4>
                  <p className="text-gray-600">10-50 GIC</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Helpful answers</h4>
                  <p className="text-gray-600">5-25 GIC</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Educational content</h4>
                  <p className="text-gray-600">15-75 GIC</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Research contributions</h4>
                  <p className="text-gray-600">25-150 GIC</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Community Service
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Mentoring others</h4>
                  <p className="text-gray-600">10-30 GIC per session</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Organizing events</h4>
                  <p className="text-gray-600">50-200 GIC per event</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Translation work</h4>
                  <p className="text-gray-600">5-25 GIC per page</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Documentation</h4>
                  <p className="text-gray-600">10-50 GIC per page</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Technical Contributions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Bug fixes</h4>
                  <p className="text-gray-600">25-100 GIC</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Feature development</h4>
                  <p className="text-gray-600">50-500 GIC</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Security improvements</h4>
                  <p className="text-gray-600">100-1000 GIC</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Testing and QA</h4>
                  <p className="text-gray-600">10-50 GIC</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Reputation System
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Novice</h3>
                  <p className="text-sm text-gray-600">0-100 GIC</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Contributor</h3>
                  <p className="text-sm text-gray-600">100-500 GIC</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Expert</h3>
                  <p className="text-sm text-gray-600">500-2000 GIC</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">👑</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Master</h3>
                  <p className="text-sm text-gray-600">2000-10000 GIC</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Legend</h3>
                  <p className="text-sm text-gray-600">10000+ GIC</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Resources
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Documentation
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/specs/07-incentives-gic.md" className="text-blue-600 hover:underline">GIC Specification</a></li>
                  <li><a href="/specs/01-overview.md" className="text-blue-600 hover:underline">Civic AI Overview</a></li>
                  <li><a href="/governance" className="text-blue-600 hover:underline">Governance Model</a></li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/community" className="text-blue-600 hover:underline">Community Forum</a></li>
                  <li><a href="/leaderboard" className="text-blue-600 hover:underline">GIC Leaderboard</a></li>
                  <li><a href="/rewards" className="text-blue-600 hover:underline">Rewards Catalog</a></li>
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