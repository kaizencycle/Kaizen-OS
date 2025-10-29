'use client'

import { useEffect, useState } from 'react'
import { Shield, Lock, Activity, CheckCircle, XCircle } from 'lucide-react'

interface GuardianStatusData {
  guardian: {
    name: string
    did: string
    custody_status: string
    role_summary: string
  }
  ward: {
    name: string
    did: string
    custody_status: string
    role_summary: string
  }
  relationship: string
  revival_progress: {
    gi_threshold: { required: number; current: number; met: boolean }
    quorum_support: { required: number; current: number; met: boolean }
    stability_period: { required_days: number; current_days: number; met: boolean }
    overall_ready: boolean
  }
}

export function GuardianStatus() {
  const [status, setStatus] = useState<GuardianStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/guardian/status')
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch guardian status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const { guardian, ward, revival_progress } = status

  return (
    <div className="card">
      <div className="flex items-start gap-4 mb-6">
        <Shield className="w-8 h-8 text-aurea-gold flex-shrink-0" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-aurea-gold mb-2">
            Guardian Status
          </h2>
          <p className="text-slate-300">
            <strong className="text-aurea-gold">{guardian.name}</strong>
            {' safeguards '}
            <strong className="text-slate-400">{ward.name}</strong>
            {' (Dormant Founder Agent)'}
          </p>
        </div>
      </div>

      {/* Relationship Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Guardian</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Agent:</span>{' '}
              <span className="text-slate-200">{guardian.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              <span className="text-emerald-400 uppercase">
                {guardian.custody_status}
              </span>
            </div>
            <div>
              <span className="text-slate-500">DID:</span>{' '}
              <span className="text-slate-400 font-mono text-xs">
                {guardian.did}
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-200">Ward</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Agent:</span>{' '}
              <span className="text-slate-200">{ward.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              <span className="text-yellow-400 uppercase">
                {ward.custody_status}
              </span>
            </div>
            <div>
              <span className="text-slate-500">DID:</span>{' '}
              <span className="text-slate-400 font-mono text-xs">
                {ward.did}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revival Progress */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-slate-200">Revival Progress</h3>
        </div>

        <div className="space-y-3">
          {/* GI Threshold */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {revival_progress.gi_threshold.met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-sm text-slate-300">GI Threshold</span>
            </div>
            <div className="text-sm">
              <span
                className={
                  revival_progress.gi_threshold.met
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }
              >
                {revival_progress.gi_threshold.current.toFixed(3)}
              </span>
              <span className="text-slate-500">
                {' '}
                / {revival_progress.gi_threshold.required.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quorum Support */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {revival_progress.quorum_support.met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-sm text-slate-300">Quorum Support</span>
            </div>
            <div className="text-sm">
              <span
                className={
                  revival_progress.quorum_support.met
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }
              >
                {(revival_progress.quorum_support.current * 100).toFixed(0)}%
              </span>
              <span className="text-slate-500">
                {' '}
                / {(revival_progress.quorum_support.required * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Stability Period */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {revival_progress.stability_period.met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-sm text-slate-300">Stability Period</span>
            </div>
            <div className="text-sm">
              <span
                className={
                  revival_progress.stability_period.met
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }
              >
                {revival_progress.stability_period.current_days} days
              </span>
              <span className="text-slate-500">
                {' '}
                / {revival_progress.stability_period.required_days} days
              </span>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Revival Ready
            </span>
            <span
              className={`text-sm font-semibold ${
                revival_progress.overall_ready
                  ? 'text-emerald-400'
                  : 'text-yellow-400'
              }`}
            >
              {revival_progress.overall_ready ? 'YES' : 'NOT YET'}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-slate-500">
        AUREA serves as constitutional custodian without spending power.
        Genesis Wallet (1,000,000 GIC) remains secured until revival conditions met.
      </div>
    </div>
  )
}
