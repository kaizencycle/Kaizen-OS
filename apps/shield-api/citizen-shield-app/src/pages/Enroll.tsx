import { useState } from 'react'
import { api } from '../api/client'

export default function Enroll() {
  const [name, setName] = useState('')
  const [citizenId, setCitizenId] = useState('')
  const [pubkey, setPubkey] = useState('')
  const [out, setOut] = useState<string>('')
  const [err, setErr] = useState<string>('')

  const submit = async () => {
    setOut(''); setErr('')
    try {
      const res = await api.enroll({ name, citizenId, pubkey: pubkey || undefined })
      setOut(JSON.stringify(res, null, 2))
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <div className="container">
      <h2>Enroll Citizen/Agent</h2>
      <label>Name</label><input value={name} onChange={e=>setName(e.target.value)} />
      <label>Citizen ID</label><input value={citizenId} onChange={e=>setCitizenId(e.target.value)} placeholder="uuid or handle" />
      <label>Public Key (optional)</label><input value={pubkey} onChange={e=>setPubkey(e.target.value)} placeholder="ed25519/secp256k1..." />
      <button onClick={submit} disabled={!name || !citizenId}>Enroll</button>
      {out && <pre>{out}</pre>}
      {err && <p className="error">{err}</p>}
    </div>
  )
}
