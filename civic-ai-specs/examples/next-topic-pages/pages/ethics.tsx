import React from 'react';
import Head from 'next/head';

export default function Ethics() {
  return (
    <>
      <Head>
        <title>Ethics - Civic AI Standard</title>
        <meta name="description" content="Ethical framework for AI systems that serve the common good" />
        <meta name="keywords" content="AI ethics, artificial intelligence, ethical AI, civic AI, responsible AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ethics in Civic AI
            </h1>
            <p className="text-xl text-gray-600">
              A comprehensive framework for ethical artificial intelligence systems
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Core Ethical Principles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Beneficence
                </h3>
                <p className="text-gray-600">
                  AI systems must act in ways that benefit humanity and the environment,
                  prioritizing human welfare and promoting sustainable practices.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Non-Maleficence
                </h3>
                <p className="text-gray-600">
                  AI systems must not cause harm, avoiding actions that could hurt humans
                  or damage the environment.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Autonomy
                </h3>
                <p className="text-gray-600">
                  AI systems must respect human autonomy, supporting human decision-making
                  and avoiding manipulation.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Justice
                </h3>
                <p className="text-gray-600">
                  AI systems must treat all people fairly, avoiding discrimination and
                  ensuring equitable access.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Implementation Framework
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ethical Decision-Making Process
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  <strong>Situation Analysis:</strong> Identify all stakeholders and assess potential impacts
                </li>
                <li>
                  <strong>Ethical Evaluation:</strong> Apply core principles and consider alternative actions
                </li>
                <li>
                  <strong>Decision Implementation:</strong> Choose the most ethical option and document reasoning
                </li>
                <li>
                  <strong>Continuous Improvement:</strong> Review decisions regularly and update frameworks
                </li>
              </ol>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cultural Integration
            </h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                Our ethical framework recognizes that different cultures have different values
                and practices. We integrate cultural wisdom while maintaining universal ethical principles.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Respect for cultural diversity and local values</li>
                <li>Integration of traditional wisdom and practices</li>
                <li>Community-based ethical decision making</li>
                <li>Cultural sensitivity in AI system design</li>
                <li>Intergenerational knowledge transfer</li>
              </ul>
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
                  <li><a href="/specs/03-agent-ethics.md" className="text-blue-600 hover:underline">Agent Ethics Framework</a></li>
                  <li><a href="/specs/08-validation-checklist.md" className="text-blue-600 hover:underline">Validation Checklist</a></li>
                  <li><a href="/specs/09-cultural-kernel-archetypes.md" className="text-blue-600 hover:underline">Cultural Archetypes</a></li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li><a href="/contributing" className="text-blue-600 hover:underline">Contributing Guidelines</a></li>
                  <li><a href="/governance" className="text-blue-600 hover:underline">Governance Model</a></li>
                  <li><a href="/community" className="text-blue-600 hover:underline">Community Forum</a></li>
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