import { Shield, ExternalLink, CheckCircle } from 'lucide-react'

export default function AttestationsPage() {
  // Mock attestation data
  const attestations = [
    {
      traceId: 'a1b2c3d4e5f6',
      timestamp: '2024-10-28T14:32:10Z',
      agreement: 0.95,
      giScore: 0.987,
      providers: ['openai', 'local'],
      ledgerTx: '0xabc...123',
    },
    {
      traceId: 'f6e5d4c3b2a1',
      timestamp: '2024-10-28T13:15:42Z',
      agreement: 0.92,
      giScore: 0.981,
      providers: ['openai', 'local'],
      ledgerTx: '0xdef...456',
    },
    {
      traceId: '123456abcdef',
      timestamp: '2024-10-28T12:08:33Z',
      agreement: 0.98,
      giScore: 0.993,
      providers: ['openai', 'local'],
      ledgerTx: '0x789...abc',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Shield className="w-16 h-16 text-aurea-gold mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">
          Attestation <span className="text-aurea-gold">Records</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Immutable deliberation records attested to the Civic Ledger.
          Every AUREA query is cryptographically signed and timestamped.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl font-bold text-aurea-gold mb-1">1,247</div>
          <div className="text-sm text-slate-400">Total Attestations</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-1">0.987</div>
          <div className="text-sm text-slate-400">Average GI Score</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">94%</div>
          <div className="text-sm text-slate-400">Average Agreement</div>
        </div>
      </div>

      {/* Attestation List */}
      <div className="card">
        <h2 className="text-2xl font-bold text-aurea-gold mb-6">Recent Attestations</h2>
        <div className="space-y-4">
          {attestations.map((att) => (
            <div
              key={att.traceId}
              className="glass rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-sm text-slate-300">
                      {att.traceId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(att.timestamp).toLocaleString()}
                  </div>
                </div>
                <a
                  href={`https://civic-ledger/tx/${att.ledgerTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  View on Ledger
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Agreement</div>
                  <div className={`text-sm font-semibold ${
                    att.agreement >= 0.95 ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    {(att.agreement * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">GI Score</div>
                  <div className={`text-sm font-semibold ${
                    att.giScore >= 0.99 ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    {att.giScore.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Providers</div>
                  <div className="flex gap-1">
                    {att.providers.map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 glass rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="btn-secondary">
            Load More Attestations
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card-gold mt-8">
        <h3 className="text-lg font-semibold text-aurea-gold mb-3">
          About Attestations
        </h3>
        <p className="text-sm text-slate-200 mb-3">
          Every deliberation processed by AUREA is attested to the Civic Ledger with:
        </p>
        <ul className="text-sm text-slate-200 space-y-1">
          <li>• <strong>Trace ID:</strong> Unique identifier for the deliberation</li>
          <li>• <strong>Agreement Score:</strong> Level of consensus between AI providers</li>
          <li>• <strong>GI Score:</strong> Governance Integrity metric (agreement + diversity)</li>
          <li>• <strong>Provider Mix:</strong> Which AI models participated</li>
          <li>• <strong>Timestamp:</strong> ISO 8601 UTC timestamp</li>
          <li>• <strong>Immutability:</strong> Cannot be altered or deleted once attested</li>
        </ul>
      </div>
    </div>
  )
}
