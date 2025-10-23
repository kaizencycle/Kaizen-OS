import { useState } from "react";
import { postShield } from "../../lib/civic/client";

export default function GicRegisterForm() {
  const [label, setLabel] = useState("");
  const [cid, setCid] = useState("");
  const [proof, setProof] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); 
    setMsg(null);
    const j = await postShield("/api/civic/register", { label, cid, integrityHex: proof });
    setMsg(j.ok ? `Registered. tx=${j.tx}` : `Error: ${j.error}`);
    setBusy(false);
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: '#0a1a2e',
      borderRadius: '8px',
      border: '1px solid #1e3a8a'
    }}>
      <h3 style={{marginTop: 0, color: '#9fd1ff'}}>Register .gic</h3>
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <input 
          placeholder="label (e.g., michael)" 
          value={label} 
          onChange={e=>setLabel(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#050914',
            border: '1px solid #1e3a8a',
            borderRadius: '4px',
            color: '#cfe0ff'
          }}
        />
        <input 
          placeholder="ipfs CID" 
          value={cid} 
          onChange={e=>setCid(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#050914',
            border: '1px solid #1e3a8a',
            borderRadius: '4px',
            color: '#cfe0ff'
          }}
        />
        <input 
          placeholder="integrity proof (0x...)" 
          value={proof} 
          onChange={e=>setProof(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#050914',
            border: '1px solid #1e3a8a',
            borderRadius: '4px',
            color: '#cfe0ff'
          }}
        />
        <button 
          disabled={busy} 
          onClick={submit}
          style={{
            padding: '10px 16px',
            background: busy ? '#374151' : '#1e40af',
            color: '#cfe0ff',
            border: 'none',
            borderRadius: '4px',
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          {busy ? 'Registering...' : 'Register'}
        </button>
        {msg && (
          <p style={{
            color: msg.includes('Error') ? '#ff6a6a' : '#10b981',
            fontSize: '14px',
            margin: '8px 0 0 0'
          }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}