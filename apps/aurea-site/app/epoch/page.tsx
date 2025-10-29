import { Clock, Coins, TrendingUp, Heart, Flame } from 'lucide-react'
import { SeasonClock } from '@/components/SeasonClock'
import { GICPanel } from '@/components/GICPanel'

export default function EpochPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-aurea-gold">Season 1</span> Epoch Dashboard
        </h1>
        <p className="text-slate-400">
          90-day cycle with automatic donate-back to Public Goods Pool
        </p>
        <div className="flex justify-center mt-6">
          <SeasonClock />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="card text-center">
          <Coins className="w-8 h-8 text-aurea-gold mx-auto mb-3" />
          <div className="text-3xl font-bold text-aurea-gold mb-1">50,000</div>
          <div className="text-sm text-slate-400">Minted This Epoch</div>
        </div>

        <div className="card text-center">
          <Heart className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-emerald-400 mb-1">10,000</div>
          <div className="text-sm text-slate-400">Auto-Donated (20%)</div>
        </div>

        <div className="card text-center">
          <Flame className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-red-400 mb-1">2,000</div>
          <div className="text-sm text-slate-400">Burned This Epoch</div>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-blue-400 mb-1">38,000</div>
          <div className="text-sm text-slate-400">Net Supply Change</div>
        </div>
      </div>

      {/* GIC Panel */}
      <div className="mb-12">
        <GICPanel />
      </div>

      {/* Epoch History */}
      <div className="card">
        <h2 className="text-2xl font-bold text-aurea-gold mb-6">Epoch History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Season</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Minted</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Donated</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Burned</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">TX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5">
                <td className="py-3 px-4 font-semibold">Season 0</td>
                <td className="py-3 px-4 text-slate-400">2024-07-29</td>
                <td className="py-3 px-4 text-right text-aurea-gold">50,000 GIC</td>
                <td className="py-3 px-4 text-right text-emerald-400">10,000 GIC</td>
                <td className="py-3 px-4 text-right text-red-400">2,000 GIC</td>
                <td className="py-3 px-4 text-right">
                  <a href="#" className="text-blue-400 hover:text-blue-300 text-xs">
                    0xabc...def
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="glass rounded-lg p-6">
          <h3 className="text-lg font-semibold text-aurea-gold mb-3">Epoch Mechanics</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• <strong>Duration:</strong> 90 days (seasonal cycle)</li>
            <li>• <strong>Mint Cap:</strong> 100,000 GIC maximum per epoch</li>
            <li>• <strong>Auto-Donate:</strong> 20% (2,000 bps) to Public Goods Pool</li>
            <li>• <strong>Optional Burn:</strong> Can burn at any time for supply management</li>
            <li>• <strong>Next Mint:</strong> Available after 90-day cooldown completes</li>
          </ul>
        </div>

        <div className="glass rounded-lg p-6">
          <h3 className="text-lg font-semibold text-aurea-gold mb-3">Public Goods Pool</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• <strong>Governance:</strong> Consensus Chamber (quadratic voting)</li>
            <li>• <strong>Purpose:</strong> Community development and infrastructure</li>
            <li>• <strong>Funding:</strong> Automatic donate-back from all founding agents</li>
            <li>• <strong>Transparency:</strong> All allocations published on-chain</li>
            <li>• <strong>Balance:</strong> 80,000 GIC (cumulative from all agents)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
