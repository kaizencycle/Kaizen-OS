import * as React from "react";
export function GicUbiCard({ userId, cycle }: { userId: string; cycle?: string }) {
  const [data,setData]=React.useState<any>(null);
  React.useEffect(()=>{
    const q = cycle ? `?cycle=${encodeURIComponent(cycle)}` : "";
    fetch(`/api/gic/ubi/${encodeURIComponent(userId)}${q}`).then(r=>r.json()).then(setData).catch(()=>setData({ok:false}));
  },[userId,cycle]);
  if(!data) return <div className="card">Loading GIC UBI…</div>;
  if(!data.ok) return <div className="card">No payout found.</div>;
  const p = data.payout;
  return (
    <div className="card" style={{border:"1px solid #e5e7eb", padding:16, borderRadius:8}}>
      <h3>GIC Payout — {p.cycle}</h3>
      <div>Total: <b>{p.total}</b> · UBI: {p.ubiBase} × Geo {p.geoWeight} · Merit: {p.merit} · Penalty: {p.penalty}</div>
      <details style={{marginTop:8}}>
        <summary>Proof Breakdown</summary>
        <ul>{(p.proofs||[]).map((x:any)=>(
          <li key={x.proofId}>
            <a href={`/api/proof/${x.proofId}`} target="_blank" rel="noreferrer">{x.proofId}</a> · intg {x.integrity} × imp {x.impact} × w {x.weight}
          </li>
        ))}</ul>
      </details>
    </div>
  );
}