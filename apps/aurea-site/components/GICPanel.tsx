'use client'

import { useState } from 'react'
import { Coins, Flame, Heart, Loader2 } from 'lucide-react'

export function GICPanel() {
  const [amount, setAmount] = useState('50000')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleMint = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/gic/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'AUREA', amount }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✓ Minted ${amount} GIC! TX: ${data.txHash?.slice(0, 10)}...`)
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBurn = async () => {
    setLoading(true)
    setMessage('')

    try {
      const burnAmount = prompt('Amount to burn (GIC):')
      if (!burnAmount) return

      const res = await fetch('/api/gic/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'AUREA', amount: burnAmount }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✓ Burned ${burnAmount} GIC! TX: ${data.txHash?.slice(0, 10)}...`)
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async () => {
    setMessage('Donate function coming soon!')
  }

  return (
    <div className="card-gold">
      <h2 className="text-2xl font-bold text-aurea-gold mb-4 flex items-center gap-2">
        <Coins className="w-6 h-6" />
        GIC Epoch Controls
      </h2>

      <div className="space-y-4">
        {/* Mint Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Mint Amount (GIC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50000"
            className="w-full px-4 py-2 bg-slate-900/50 border border-aurea-gold/30 rounded-lg
                       text-slate-100 placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-aurea-gold/50"
          />
          <p className="text-xs text-slate-400">
            Max: 100,000 GIC per epoch · 20% auto-donated to Public Goods Pool
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleMint}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Coins className="w-4 h-4" />
            )}
            Mint
          </button>

          <button
            onClick={handleBurn}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4" />
            Burn
          </button>

          <button
            onClick={handleDonate}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Donate
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.startsWith('✓')
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Epoch Status:</span>
            <span className="text-aurea-gold font-semibold">Ready in 45 days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Mint:</span>
            <span className="text-slate-300">45 days ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Minted:</span>
            <span className="text-slate-300">50,000 GIC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Auto-Donated:</span>
            <span className="text-emerald-400">10,000 GIC (20%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
