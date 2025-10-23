"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { COMPANIONS } from "@/lib/companions";
import { authedFetchJSON } from "@/lib/fetchers";

export default function Consensus(){
  const [user, setUser] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [mode, setMode] = useState<"equal"|"gic"|"quad">("equal");
  const [gic, setGic] = useState(0);
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me"); const j = r.ok?await r.json():{};
      setUser(j.handle||"");
    })();
  }, []);
  useEffect(() => {
    (async () => {
      if (!user || !process.env.NEXT_PUBLIC_GIC_INDEXER_URL) return;
      const b = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/balances/${user}`).then(r=>r.json()).catch(()=>null);
      setGic(b?.total_gic || 0);
    })();
  }, [user]);

  async function deliberate(){
    const say = async (key:string) => {
      const r = await authedFetchJSON("/api/reflect", {
        method:"POST",
        body: JSON.stringify({ user, text: `Consensus on: ${topic}`, companion: key })
      });
      const j = await r.json();
      return `${COMPANIONS[key as keyof typeof COMPANIONS].icon} ${COMPANIONS[key as keyof typeof COMPANIONS].name}: ${j.reply||"…"}`;
    };
    const voices = await Promise.all(["jade","hermes","eve","zeus"].map(k=>say(k)));
    // naive weighted summary: prefix meta line with mode + weight
    const weight = (m: typeof mode) => m==="equal" ? 1 : m==="gic" ? Math.max(1, gic) : Math.max(1, Math.sqrt(gic));
    const w = weight(mode);
    setNotes([
      `Mode: ${mode.toUpperCase()}  (weight=${w.toFixed(2)})`,
      ...voices
    ]);
  }

  return (
    <section className="container">
      <h1 className="title">Consensus Chamber</h1>
      <p className="muted">Unlocked at 100 GIC. All companions weigh in; later we'll add voting & staking.</p>
      <div className="card">
        <input className="field" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Proposal or festival theme…" />
        <div className="row" style={{gap:8,alignItems:"center"}}>
          <select className="field" value={mode} onChange={e=>setMode(e.target.value as any)}>
            <option value="equal">Equal weighting</option>
            <option value="gic">GIC-weighted</option>
            <option value="quad">Quadratic (√GIC)</option>
          </select>
          <button className="btn primary" onClick={deliberate} disabled={!topic.trim()}>Deliberate</button>
        </div>
        <small className="muted">Your balance: {gic.toFixed(3)} GIC</small>
      </div>
      <div className="card" style={{marginTop:12}}>
        <strong>Outputs</strong>
        <ul>
          {notes.map((n,i)=>(<li key={i} style={{margin:"6px 0"}}>{n}</li>))}
        </ul>
      </div>
    </section>
  );
}
