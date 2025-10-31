'use client';

type Label = "authentic"|"synthetic_declared"|"synthetic_undeclared"|"indeterminate";

export interface ProvenanceData {
  hash: string;
  c2pa: boolean;
  watermark: "ok"|"missing";
  declared: boolean;
  consensus: { agreement:number; votes:number; label:Label; rationale:string[] };
  gi_effect: number;
  creator_did?: string;
  timestamp: string;
  osint_refs?: { source:string; url?:string; note?:string }[];
}

const badgeText: Record<Label,string> = {
  authentic: "✅ Authentic",
  synthetic_declared: "⚠ Synthetic (declared)",
  synthetic_undeclared: "🚫 Synthetic (undeclared)",
  indeterminate: "❓ Indeterminate"
};

export default function ProvenanceCard({ data }: { data: ProvenanceData }) {
  const { consensus } = data;
  const border = consensus.label==="authentic" ? "#16a34a"
    : consensus.label==="synthetic_declared" ? "#f59e0b"
    : consensus.label==="synthetic_undeclared" ? "#dc2626"
    : "#6b7280";

  return (
    <div style={{border:`2px solid ${border}`, borderRadius:12, padding:16, lineHeight:1.5}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <strong>Provenance</strong>
        <span style={{fontWeight:600}}>{badgeText[consensus.label]}</span>
      </div>
      <div>Media Hash: <code>{short(data.hash)}</code></div>
      <div>Timestamp: {new Date(data.timestamp).toLocaleString()}</div>
      <div>Creator DID: {data.creator_did ?? "—"}</div>
      <div style={{marginTop:8}}>
        <small>C2PA: {data.c2pa ? "present" : "missing"} · Watermark: {data.watermark}</small>
      </div>
      <hr style={{margin:"12px 0"}}/>
      <div><b>Consensus</b> — agreement {(consensus.agreement*100).toFixed(1)}%, votes {consensus.votes}</div>
      <ul style={{margin:"6px 0 0 18px"}}>
        {consensus.rationale.map((r,i)=>(<li key={i}><small>{r}</small></li>))}
      </ul>
      <div style={{marginTop:8}}>GI effect: {(data.gi_effect>=0?"+":"")}{data.gi_effect.toFixed(3)}</div>
      {data.osint_refs?.length ? (
        <>
          <hr style={{margin:"12px 0"}}/>
          <b>OSINT</b>
          <ul style={{margin:"6px 0 0 18px"}}>
            {data.osint_refs.map((o,i)=>(
              <li key={i}><small>{o.source}{o.url?": ":""}{o.url ? <a href={o.url} target="_blank" rel="noreferrer">{o.url}</a> : ""} {o.note?`— ${o.note}`:""}</small></li>
            ))}
          </ul>
        </>
      ):null}
    </div>
  );
}

function short(h:string){ return h.length>18 ? `${h.slice(0,10)}…${h.slice(-6)}` : h; }

