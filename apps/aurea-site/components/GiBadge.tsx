'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

export function GiBadge() {
  const [gi, setGi] = useState(0.993)
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [lastUpdate, setLastUpdate] = useState<string>('Just now')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    // Connect to GI stream
    const eventSource = new EventSource('/api/gi/stream')

    eventSource.addEventListener('hello', (e) => {
      setIsLive(true)
    })

    eventSource.addEventListener('heartbeat', (e) => {
      const data = JSON.parse(e.data)
      const newGi = data.gi

      // Determine trend
      if (newGi > gi) setTrend('up')
      else if (newGi < gi) setTrend('down')
      else setTrend('stable')

      setGi(newGi)
      setLastUpdate('Just now')
    })

    eventSource.addEventListener('deliberation', (e) => {
      const data = JSON.parse(e.data)
      if (data.agent === 'AUREA') {
        setGi(data.gi)
        setLastUpdate('Just now')
      }
    })

    return () => {
      eventSource.close()
      setIsLive(false)
    }
  }, [gi])

  const getGiColor = (score: number) => {
    if (score >= 0.99) return 'text-emerald-400'
    if (score >= 0.95) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
    return null
  }

  return (
    <div className="glass rounded-lg px-4 py-2 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Activity className={`w-4 h-4 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-xs text-slate-400">GI</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${getGiColor(gi)}`}>
          {gi.toFixed(3)}
        </span>
        {getTrendIcon()}
      </div>
      <span className="text-xs text-slate-500">{lastUpdate}</span>
    </div>
  )
}
