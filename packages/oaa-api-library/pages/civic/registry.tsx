import { useState } from "react";
import { useRegistry } from "../../lib/civic/useRegistry";
import GicRegisterForm from "../../components/civic/GicRegisterForm";
import GicUpdateForm from "../../components/civic/GicUpdateForm";
import IntegrityProofCard from "../../components/civic/IntegrityProofCard";

export default function CivicRegistry() {
  const [label, setLabel] = useState("");
  const { data, loading, error } = useRegistry(label);

  return (
    <main style={{minHeight:'100vh',background:'#050914',color:'#cfe0ff',padding:20}}>
      <div style={{maxWidth:900, margin:"0 auto"}}>
        <h1>Civic Registry (.gic)</h1>
        <p>Register a new name, update records, and view integrity proofs.</p>

        <section style={{margin:"16px 0"}}>
          <h3>Lookup Domain</h3>
          <input 
            placeholder="lookup label (e.g., jade)" 
            value={label} 
            onChange={e=>setLabel(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#0a1a2e',
              border: '1px solid #1e3a8a',
              borderRadius: '4px',
              color: '#cfe0ff',
              width: '300px',
              marginRight: '8px'
            }}
          />
          {loading && <p>Loading…</p>}
          {error && <p style={{color:"#ff6a6a"}}>Error: {error}</p>}
          {data && <IntegrityProofCard data={data}/>}
        </section>

        <hr style={{borderColor: '#1e3a8a', margin: '2rem 0'}}/>
        
        <section style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
          <GicRegisterForm/>
          <GicUpdateForm/>
        </section>
      </div>
    </main>
  );
}