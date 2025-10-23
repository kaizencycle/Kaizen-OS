import React from 'react';

type ProofCardProps = {
  id: string;
  compact?: boolean;
};

export function ProofCard({ id, compact }: ProofCardProps) {
  const [data, setData] = React.useState<any>(null);
  const [err, setErr]   = React.useState<string|undefined>();

  React.useEffect(() => {
    fetch(`/api/proof/${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(setData)
      .catch(e => setErr(String(e)));
  }, [id]);

  if (err) return <div className="proof error">Error: {err}</div>;
  if (!data) return <div className="proof loading">Loading proof…</div>;
  if (!data.ok) return <div className="proof error">Not found or invalid</div>;

  const p = data.proof;
  return (
    <div className="proof card" style={{border:"1px solid #e5e7eb", borderRadius:8, padding:16, margin:"12px 0"}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:12}}>
        <strong>Ledger Proof</strong>
        <code style={{fontSize:12, opacity:0.8}}>{p.id}</code>
      </div>
      <div style={{fontSize:13, marginTop:8}}>
        <div>Signer: <b>{p.signer || "—"}</b></div>
        <div>Hash: <code>{p.hash ? String(p.hash).slice(0,18)+"…" : "—"}</code></div>
        <div>Created: {p.createdAt || "—"}</div>
        {p.meta?.agent ? <div>Agent: {p.meta.agent}{p.meta.cycle ? ` · ${p.meta.cycle}` : ""}</div> : null}
        {p.meta?.citationCount ? <div>Citations: {p.meta.citationCount}</div> : null}
      </div>
      <div style={{marginTop:8, display:"flex", gap:12, flexWrap:"wrap"}}>
        <a href={p.links.ledger} target="_blank" rel="noreferrer">View on Ledger</a>
        {p.links.beacon ? <a href={p.links.beacon} target="_blank" rel="noreferrer">Beacon</a> : null}
        {p.links.eommFile ? <a href={`/${p.links.eommFile}`} target="_blank" rel="noreferrer">E.O.M.M. JSON</a> : null}
      </div>
    </div>
  );
}
