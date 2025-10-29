'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function SeasonClock() {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 45,
    hours: 12,
    minutes: 34,
    seconds: 56,
  })

  useEffect(() => {
    // TODO: Fetch actual epoch end time from smart contract
    // For now, simulate countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass rounded-lg px-4 py-2 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-aurea-gold" />
        <span className="text-xs text-slate-400">Next Epoch</span>
      </div>
      <div className="flex items-center gap-1 text-sm font-mono">
        <span className="text-aurea-gold font-semibold">{timeRemaining.days}d</span>
        <span className="text-slate-500">:</span>
        <span className="text-aurea-gold font-semibold">{timeRemaining.hours}h</span>
        <span className="text-slate-500">:</span>
        <span className="text-aurea-gold font-semibold">{timeRemaining.minutes}m</span>
      </div>
    </div>
  )
}
