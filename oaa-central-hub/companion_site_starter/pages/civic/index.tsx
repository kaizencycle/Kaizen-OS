import Link from "next/link";

export default function CivicHome() {
  return (
    <main style={{minHeight:'100vh',background:'#050914',color:'#cfe0ff',display:'grid',placeItems:'center',padding:20}}>
      <div style={{maxWidth:720}}>
        <h1>Civic Dashboard</h1>
        <p>Manage your civic identity, integrity proofs, and .gic domain.</p>
        <p>
          <Link href="/civic/registry" style={{color:'#9fd1ff'}}>
            Open Registry
          </Link>
        </p>
        <div style={{marginTop: '2rem', padding: '1rem', background: '#0a1a2e', borderRadius: '8px'}}>
          <h3>What is .gic?</h3>
          <p>The Global Integrity Citizen (.gic) top-level domain system connects the Civic Ledger, OAA Learning Hub, and Citizen Shield ecosystem under one integrity-anchored namespace.</p>
          <p>Each domain becomes a reflection, each reflection becomes a citizen.</p>
        </div>
      </div>
    </main>
  );
}