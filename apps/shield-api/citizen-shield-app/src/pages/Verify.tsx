import { useState } from 'react'
import { api } from '../api/client'

export default function Verify() {
  const [hash, setHash] = useState('')
  const [out, setOut] = useState<string>('')
  const [err, setErr] = useState<string>('')

  const submit = async () => {
    setOut(''); setErr('')
    try {
      const res = await api.verifyReflection({ reflection_hash: hash })
      setOut(JSON.stringify(res, null, 2))
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <div className="container">
      <h2>Zero‑Knowledge Verify Reflection</h2>
      <label>Reflection Hash</label><input value={hash} onChange={e=>setHash(e.target.value)} placeholder="sha256/keccak256..." />
      <button onClick={submit} disabled={!hash}>Verify</button>
      {out && <pre>{out}</pre>}
      {err && <p className="error">{err}</p>}
    </div>
  )
}
