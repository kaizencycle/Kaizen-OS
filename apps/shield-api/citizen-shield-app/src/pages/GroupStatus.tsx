import { useState } from 'react'
import { api } from '../api/client'

export default function GroupStatus() {
  const [out, setOut] = useState<string>('')
  const [err, setErr] = useState<string>('')

  const load = async () => {
    setOut(''); setErr('')
    try {
      const res = await api.groupStatus()
      setOut(JSON.stringify(res, null, 2))
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <div className="container">
      <h2>Group Status</h2>
      <button onClick={load}>Refresh</button>
      {out && <pre>{out}</pre>}
      {err && <p className="error">{err}</p>}
    </div>
  )
}
