'use client';
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function claimName() {
    setError(null); setResult(null);
    try {
      const r = await fetch('/api/names/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, pubkey })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Request failed');
      setResult(d);
    } catch (e:any) {
      setError(e.message);
    }
  }

  return (
    <section>
      <h1 style={{fontSize:28, marginBottom:8}}>Claim your <em>sovereign home</em></h1>
      <p style={{color:"#4b5563"}}>Pick a name (e.g., <code>michael</code>) and your owner public key to reserve <code>name.gic</code>.</p>
      <div style={{display:"grid", gap:12, maxWidth:520, marginTop:16}}>
        <input placeholder="name (letters, numbers, hyphens)"
               value={name} onChange={e=>setName(e.target.value)}
               style={{padding:10, border:"1px solid #e5e7eb", borderRadius:8}} />
        <input placeholder="owner pubkey (e.g., ed25519:...)"
               value={pubkey} onChange={e=>setPubkey(e.target.value)}
               style={{padding:10, border:"1px solid #e5e7eb", borderRadius:8}} />
        <button onClick={claimName}
                style={{padding:"10px 14px", borderRadius:8, background:"#111", color:"#fff", border:"0"}}>
          Reserve name
        </button>
        {error && <p style={{color:"#b91c1c"}}>{error}</p>}
        {result && (
          <pre style={{background:"#f8fafc", padding:12, borderRadius:8, overflowX:"auto"}}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}
