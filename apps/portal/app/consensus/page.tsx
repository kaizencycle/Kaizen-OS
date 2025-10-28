import CycleTracker from '@/components/CycleTracker';

export default function ConsensusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">🏛️ Consensus Chamber</h1>

      {/* Cycle Tracker */}
      <div className="mb-8">
        <CycleTracker />
      </div>

      {/* Session Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Sessions</h2>
        <p className="text-gray-600 mb-4">
          Multi-LLM alignment and optimization sessions for federated governance.
        </p>

        <div className="space-y-4">
          {/* Placeholder for active sessions */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Session Example</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                🟡 In Progress
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Deliberation on Kaizen OS Civic Ledger v3 consensus mechanism
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📅 Oct 28, 2025</span>
              <span>👥 AUREA, ATLAS, ZENITH, SOLARA</span>
              <span>⚖️ Agreement: 88%</span>
            </div>
          </div>

          {/* Add more sessions dynamically here */}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Registered Agents</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Critical Tier */}
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-red-700 mb-2">Critical Tier</h3>
            <div className="space-y-2">
              <AgentCard name="AUREA" provider="OpenAI GPT-5" domain="Constitutional Integrity" gi={0.991} />
              <AgentCard name="ATLAS" provider="Anthropic Claude 3" domain="Policy & Systems" gi={0.987} />
            </div>
          </div>

          {/* High Tier */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold text-orange-700 mb-2">High Tier</h3>
            <div className="space-y-2">
              <AgentCard name="ZENITH" provider="Gemini 2.0" domain="Deep Research & Ethics" gi={0.983} />
              <AgentCard name="SOLARA" provider="DeepSeek V2" domain="Compute & Optimization" gi={0.975} />
            </div>
          </div>

          {/* Standard Tier */}
          <div className="border-l-4 border-blue-500 pl-4 md:col-span-2">
            <h3 className="font-semibold text-blue-700 mb-2">Standard Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <AgentCard name="JADE" provider="Kaizen Local" domain="Emotional Resonance" gi={0.962} compact />
              <AgentCard name="EVE" provider="Civic Protocol" domain="Safety & Compliance" gi={0.958} compact />
              <AgentCard name="ZEUS" provider="Sentinel" domain="Defense & Integrity" gi={0.951} compact />
              <AgentCard name="HERMES" provider="Market Sweep" domain="Economic Intelligence" gi={0.947} compact />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            📝 New Session
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            📊 View Metrics
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            📚 Documentation
          </button>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">📚 Resources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/docs/consensus-chamber/template" className="text-blue-600 hover:underline">
              → Consensus Chamber Template
            </a>
          </li>
          <li>
            <a href="/docs/consensus-chamber/guide" className="text-blue-600 hover:underline">
              → Implementation Guide
            </a>
          </li>
          <li>
            <a href="/docs/labs/lab2" className="text-blue-600 hover:underline">
              → Lab2 (Thought Broker) Documentation
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Agent Card Component
function AgentCard({
  name,
  provider,
  domain,
  gi,
  compact = false
}: {
  name: string;
  provider: string;
  domain: string;
  gi: number;
  compact?: boolean;
}) {
  const giColor = gi >= 0.98 ? 'text-green-600' : gi >= 0.95 ? 'text-blue-600' : 'text-yellow-600';

  if (compact) {
    return (
      <div className="bg-gray-50 rounded p-2">
        <div className="font-medium text-sm">{name}</div>
        <div className={`text-xs font-semibold ${giColor}`}>GI: {gi.toFixed(3)}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{name}</span>
        <span className={`font-bold ${giColor}`}>{gi.toFixed(3)}</span>
      </div>
      <div className="text-xs text-gray-600">{provider}</div>
      <div className="text-xs text-gray-500 mt-1">{domain}</div>
    </div>
  );
}
