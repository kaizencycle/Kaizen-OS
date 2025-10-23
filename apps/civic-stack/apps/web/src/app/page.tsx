'use client'
import { useEffect, useState } from 'react'
import { queueWrite, drainQueue, getQueueSize } from '../lib/queue'

export default function Page() {
  const [status, setStatus] = useState<'NORMAL'|'DEGRADED'>('NORMAL')
  const [queueSize, setQueueSize] = useState(0)

  async function checkStatus() {
    try {
      if (process.env.NEXT_PUBLIC_SIMULATE_DEGRADED === 'true' || process.env.SIMULATE_DEGRADED === 'true') throw new Error('Simulated')
      const res = await fetch(process.env.NEXT_PUBLIC_STATUS_URL || '/status.json', { cache: 'no-store' })
      if (!res.ok) throw new Error('Status not ok')
      const j = await res.json()
      setStatus(j.healthy ? 'NORMAL' : 'DEGRADED')
    } catch(e) { setStatus('DEGRADED') }
  }

  useEffect(() => {
    checkStatus()
    const t = setInterval(checkStatus, 10000)
    const q = setInterval(async () => setQueueSize(await getQueueSize()), 2000)
    return () => { clearInterval(t); clearInterval(q) }
  }, [])

  return (
    <main style={{ fontFamily:'system-ui', padding:'16px' }}>
      <h1>Civic Stack — Offline‑first Demo</h1>
      {status === 'DEGRADED' && (
        <div style={{background:'#fff3cd', border:'1px solid #ffeeba', padding:'8px', marginBottom:'12px'}}>
          <b>DEGRADED MODE</b> — using edge cache & queuing writes
        </div>
      )}
      <p>Status: <b>{status}</b></p>
      <p>Queued writes: <b>{queueSize}</b></p>
      <button onClick={async () => { await queueWrite({ type: 'form.submit', payload: { message: 'Hello from offline-first!' } }); setQueueSize(await getQueueSize()); }}>Queue a Write</button>
      <button onClick={async () => { await drainQueue(); setQueueSize(await getQueueSize()); }} style={{marginLeft:8}}>Try Drain Queue</button>
    </main>
  )
}