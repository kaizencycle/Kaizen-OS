'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mintGICTokens, getGICBalance, type GICMint } from '@/lib/gic-api';

export default function TokenMinting() {
  const router = useRouter();
  const [amount, setAmount] = useState('100');
  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [giScore, setGiScore] = useState(0.993); // Mock for demo

  // Check balance
  const handleCheckBalance = async () => {
    if (!recipient) return;

    try {
      const result = await getGICBalance(recipient);
      if (result.success && result.data) {
        setBalance(result.data.balance);
      }
    } catch (err) {
      console.error('Balance check error:', err);
    }
  };

  // Handle minting
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await mintGICTokens({
        amount: parseFloat(amount),
        recipient,
        purpose
      });

      if (result.success && result.data) {
        // Store result in sessionStorage for success page
        sessionStorage.setItem('token_mint', JSON.stringify(result.data));
        router.push('/demo/success?type=mint');
      } else {
        setError(result.error || 'Minting failed');
      }
    } catch (err) {
      setError('Minting failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/demo"
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-8"
        >
          ← Back to Demo Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🪙 Mint GIC Tokens</h1>
          <p className="text-xl text-gray-700">
            Create the first Good Intent Credit tokens on Proof-of-Integrity blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Minting Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Token Minting Form</h2>

              <form onSubmit={handleMint} className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (GIC) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max="10000"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xl font-mono"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Suggested amounts: 10 GIC (daily UBI) | 100 GIC (standard) | 1000 GIC (premium)
                  </p>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Agent ID *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="recipient@kaizen.os"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleCheckBalance}
                      disabled={!recipient}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      Check Balance
                    </button>
                  </div>

                  {balance && (
                    <div className="mt-2 text-green-600 flex items-center gap-2">
                      Current balance: {balance} GIC
                    </div>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select purpose...</option>
                    <option value="First minting ceremony">First minting ceremony 🎉</option>
                    <option value="Daily UBI distribution">Daily UBI distribution</option>
                    <option value="Contribution reward">Contribution reward</option>
                    <option value="Consensus participation">Consensus participation</option>
                    <option value="Community treasury">Community treasury</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Custom Purpose (if "Other" selected) */}
                {purpose === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Purpose
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Describe the purpose of this minting..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !amount || !recipient || !purpose}
                  className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Minting...' : `Mint ${amount} GIC`}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Minting requires GI score ≥ 0.95 and constitutional validation
                </p>
              </form>
            </div>

            {/* Token Economics */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6">💡 Token Economics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EconomicsStat
                  icon="🏦"
                  label="Total Supply"
                  value="1,000,000,000 GIC"
                  description="Fixed cap, no inflation"
                />
                <EconomicsStat
                  icon="🎁"
                  label="Daily UBI"
                  value="10 GIC"
                  description="Per verified citizen"
                />
                <EconomicsStat
                  icon="🔥"
                  label="Burn Rate"
                  value="10-50%"
                  description="For GI violations"
                />
                <EconomicsStat
                  icon="💰"
                  label="Transaction Fees"
                  value="0 GIC"
                  description="Zero-fee transfers"
                />
              </div>
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

            {/* Token Features */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">✨ GIC Features</h3>

              <ul className="space-y-3 text-sm">
                <FeatureItem text="Zero transaction fees" />
                <FeatureItem text="Daily UBI distribution" />
                <FeatureItem text="Proof-of-Integrity consensus" />
                <FeatureItem text="Constitutional validation" />
                <FeatureItem text="Automatic burning for violations" />
                <FeatureItem text="Cross-lab compatibility" />
              </ul>
            </div>

            {/* Distribution Methods */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-blue-900">
                📊 Distribution Methods
              </h3>

              <ul className="space-y-3 text-sm text-blue-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold">UBI:</span>
                  <span>10 GIC daily per verified citizen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">Rewards:</span>
                  <span>10-100 GIC for contributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">Consensus:</span>
                  <span>5-20 GIC per deliberation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">Treasury:</span>
                  <span>Community fund allocations</span>
                </li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-yellow-900">
                ⚠️ Important
              </h3>

              <ul className="space-y-2 text-sm text-yellow-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>GI score must remain ≥ 0.95</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Violations result in token burning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>All minting is recorded on blockchain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Constitutional compliance required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function EconomicsStat({ icon, label, value, description }: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

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

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-white">✓</span>
      <span>{text}</span>
    </li>
  );
}
