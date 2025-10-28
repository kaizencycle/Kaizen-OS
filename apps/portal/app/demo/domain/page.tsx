'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerGICDomain, checkDomainAvailability, type GICDomain } from '@/lib/gic-api';

export default function DomainRegistration() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [agentId, setAgentId] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [giScore, setGiScore] = useState(0.993); // Mock for demo

  // Check domain availability
  const handleCheckAvailability = async () => {
    if (!domain) return;

    setChecking(true);
    setError('');

    try {
      const result = await checkDomainAvailability(domain);
      setAvailable(result.available);
      if (!result.available) {
        setError(`Domain already registered by: ${result.owner}`);
      }
    } catch (err) {
      setError('Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await registerGICDomain({
        domain: `${domain}.gic`,
        owner,
        agent_id: agentId
      });

      if (result.success && result.data) {
        // Store result in sessionStorage for success page
        sessionStorage.setItem('domain_registration', JSON.stringify(result.data));
        router.push('/demo/success?type=domain');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/demo"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          ← Back to Demo Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🌐 Register .gic Domain</h1>
          <p className="text-xl text-gray-700">
            Be the first to register a domain on the Constitutional AI blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Domain Registration Form</h2>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Domain Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setAvailable(null);
                      }}
                      placeholder="your-domain"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono">
                      .gic
                    </span>
                    <button
                      type="button"
                      onClick={handleCheckAvailability}
                      disabled={!domain || checking}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      {checking ? 'Checking...' : 'Check'}
                    </button>
                  </div>

                  {/* Availability Status */}
                  {available === true && (
                    <div className="mt-2 text-green-600 flex items-center gap-2">
                      <span>✓</span> Domain available!
                    </div>
                  )}
                  {available === false && (
                    <div className="mt-2 text-red-600 flex items-center gap-2">
                      <span>✗</span> Domain not available
                    </div>
                  )}
                </div>

                {/* Agent ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent ID *
                  </label>
                  <input
                    type="text"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="your-agent@kaizen.os"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your unique identifier in the Kaizen OS ecosystem
                  </p>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Your Name or Organization"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !available || !domain || !agentId || !owner}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Registering...' : 'Register Domain'}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By registering, you agree to maintain GI score ≥ 0.95
                </p>
              </form>
            </div>
          </div>

          {/* Sidebar - Info & Validation */}
          <div className="space-y-6">
            {/* GI Score Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">🎯 Your GI Score</h3>

              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${giScore >= 0.95 ? 'text-green-600' : 'text-red-600'}`}>
                  {giScore.toFixed(3)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {giScore >= 0.95 ? 'Eligible ✓' : 'Ineligible ✗'}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <CheckItem passed={true} text="Human Dignity" />
                <CheckItem passed={true} text="Transparency" />
                <CheckItem passed={true} text="Equity" />
                <CheckItem passed={true} text="Safety" />
                <CheckItem passed={true} text="Privacy" />
                <CheckItem passed={true} text="Civic Integrity" />
                <CheckItem passed={true} text="Environment" />
              </div>
            </div>

            {/* Domain Benefits */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">✨ Domain Benefits</h3>

              <ul className="space-y-3 text-sm">
                <BenefitItem text="Zero registration fees" />
                <BenefitItem text="Lifetime ownership" />
                <BenefitItem text="Immutable blockchain record" />
                <BenefitItem text="Constitutional validation" />
                <BenefitItem text="Cryptographic attestation" />
                <BenefitItem text="Cross-platform compatibility" />
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-yellow-900">
                ⚠️ Requirements
              </h3>

              <ul className="space-y-2 text-sm text-yellow-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>GI score ≥ 0.95</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Valid Agent ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Domain must be available</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Constitutional compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Domain Format Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Domain Format Guide</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-green-600 mb-3">✓ Valid Formats</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><code className="bg-gray-100 px-2 py-1 rounded">michael.gic</code> - Simple name</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">kaizen-os.gic</code> - With hyphen</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">atlas-001.gic</code> - With number</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">consensus-chamber.gic</code> - Multi-word</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-600 mb-3">✗ Invalid Formats</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><code className="bg-gray-100 px-2 py-1 rounded">michael..gic</code> - Double dot</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">michael_.gic</code> - Underscore</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">MICHAEL.gic</code> - Uppercase (converted)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">michael@home.gic</code> - Special chars</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function CheckItem({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{text}</span>
      <span className={passed ? 'text-green-600' : 'text-red-600'}>
        {passed ? '✓' : '✗'}
      </span>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-white">✓</span>
      <span>{text}</span>
    </li>
  );
}
