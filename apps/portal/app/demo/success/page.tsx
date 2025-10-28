'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { GICDomain, GICMint } from '@/lib/gic-api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'domain' or 'mint'

  const [domainData, setDomainData] = useState<GICDomain | null>(null);
  const [mintData, setMintData] = useState<GICMint | null>(null);

  useEffect(() => {
    // Load data from sessionStorage
    if (type === 'domain') {
      const stored = sessionStorage.getItem('domain_registration');
      if (stored) {
        setDomainData(JSON.parse(stored));
      }
    } else if (type === 'mint') {
      const stored = sessionStorage.getItem('token_mint');
      if (stored) {
        setMintData(JSON.parse(stored));
      }
    }
  }, [type]);

  const shareOnTwitter = () => {
    const text = type === 'domain'
      ? `I just registered the first .gic domain on Kaizen OS! 🌐 ${domainData?.domain} - Powered by Constitutional AI and Proof-of-Integrity blockchain. #KaizenOS #Web3 #ConstitutionalAI`
      : `I just minted the first GIC tokens on Kaizen OS! 🪙 ${mintData?.amount} GIC - Zero fees, Proof-of-Integrity consensus. #KaizenOS #Crypto #ConstitutionalAI`;

    const url = 'https://kaizen-os.vercel.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  if (!domainData && !mintData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No transaction data found</p>
          <Link href="/demo" className="text-blue-600 hover:underline">
            Return to Demo Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Celebration Header */}
        <div className="text-center mb-12 animate-bounce-slow">
          <div className="text-9xl mb-4">🎉</div>
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            History Made!
          </h1>
          <p className="text-2xl text-gray-700">
            {type === 'domain'
              ? 'You registered the first .gic domain'
              : 'You minted the first GIC tokens'}
          </p>
        </div>

        {/* Transaction Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
            {type === 'domain' && domainData && (
              <DomainSuccess data={domainData} />
            )}
            {type === 'mint' && mintData && (
              <MintSuccess data={mintData} />
            )}

            {/* Blockchain Proof */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold mb-4">🔐 Blockchain Proof</h3>

              <div className="space-y-3">
                <ProofItem
                  label="Transaction ID"
                  value={domainData?.tx_id || mintData?.tx_id || 'N/A'}
                  copyable
                />
                <ProofItem
                  label="Block Number"
                  value={`#${domainData?.block_number || mintData?.block_number || 'N/A'}`}
                />
                <ProofItem
                  label="Timestamp"
                  value={new Date(domainData?.registered_at || mintData?.minted_at || Date.now()).toLocaleString()}
                />
                <ProofItem
                  label="Network"
                  value="Kaizen OS Civic Ledger (Proof-of-Integrity)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={shareOnTwitter}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  🐦 Share on Twitter
                </button>

                <a
                  href={`https://civic-protocol-core-ledger.onrender.com/tx/${domainData?.tx_id || mintData?.tx_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  📊 View on Ledger
                </a>

                <Link
                  href="/demo"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  🏠 Back to Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">✨ What's Next?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {type === 'domain' ? (
                <>
                  <NextStepCard
                    icon="🪙"
                    title="Mint GIC Tokens"
                    description="Create your first Good Intent Credits"
                    href="/demo/mint"
                  />
                  <NextStepCard
                    icon="🏛️"
                    title="Join Consensus"
                    description="Participate in governance deliberations"
                    href="/consensus"
                  />
                </>
              ) : (
                <>
                  <NextStepCard
                    icon="🌐"
                    title="Register Domain"
                    description="Claim your unique .gic domain"
                    href="/demo/domain"
                  />
                  <NextStepCard
                    icon="🏛️"
                    title="Join Consensus"
                    description="Use your GIC in governance"
                    href="/consensus"
                  />
                </>
              )}
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              Pioneer Achievement Unlocked!
            </h3>
            <p className="text-yellow-800 mb-4">
              You are officially a Kaizen OS Pioneer. You were here at the beginning.
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full">
              <span>🌟</span>
              <span>GENESIS PARTICIPANT #{domainData?.block_number || mintData?.block_number || '1'}</span>
              <span>🌟</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function DomainSuccess({ data }: { data: GICDomain }) {
  return (
    <>
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {data.domain}
        </div>
        <p className="text-gray-600">Your .gic domain is now live!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard label="Owner" value={data.owner} />
        <InfoCard label="Agent ID" value={data.agent_id} />
        <InfoCard label="GI Score" value={data.gi_score.toFixed(3)} highlight />
        <InfoCard label="Registration Date" value={new Date(data.registered_at).toLocaleDateString()} />
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold text-green-900">Constitutional Validation Passed</div>
            <div className="text-sm text-green-700">All 7 clauses satisfied with GI score {data.gi_score.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function MintSuccess({ data }: { data: GICMint }) {
  return (
    <>
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-green-600 mb-2">
          {data.amount} GIC
        </div>
        <p className="text-gray-600">Successfully minted!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard label="Recipient" value={data.recipient} />
        <InfoCard label="Purpose" value={data.purpose} />
        <InfoCard label="Minting Date" value={new Date(data.minted_at).toLocaleDateString()} />
        <InfoCard label="Transaction Fees" value="0 GIC" highlight />
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold text-green-900">Proof-of-Integrity Confirmed</div>
            <div className="text-sm text-green-700">Tokens minted with constitutional compliance and zero fees</div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value, highlight }: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`font-semibold ${highlight ? 'text-green-600 text-lg' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

function ProofItem({ label, value, copyable }: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-mono text-sm text-gray-900">{value}</div>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}

function NextStepCard({ icon, title, description, href }: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-6 transition"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-white/90 text-sm">{description}</p>
    </Link>
  );
}
