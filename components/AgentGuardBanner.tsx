import { useEffect, useState } from "react";

type Guard = { enabled:boolean; lastHash:string; noopCount:number; maxNoop:number };
type Cool = { nextAllowedAt:number; cooldownSec:number };

export default function AgentGuardBanner(){
  const [data,setData]=useState<{guard:Guard; cooldown:Cool; remainingSec:number} | null>(null);
  const [err,setErr]=useState<string|null>(null);

  async function load(){
    try{
      const r = await fetch("/api/dev/agents/guards", { cache:"no-store" });
      const j = await r.json();
      if(!j.ok) throw new Error(j.error||"guard_fetch_failed");
      setData({ guard:j.guard, cooldown:j.cooldown, remainingSec:j.remainingSec });
      if (j.smoked) console.info("[AgentGuards] self-healed guard files");
      setErr(null);
    }catch(e:any){ setErr(e?.message||"load_failed"); }
  }

  useEffect(()=>{ load(); const id=setInterval(load, 10000); return ()=>clearInterval(id); },[]);

  if(err) return <Bar><span style={{color:"#ff8a8a"}}>Agent Guards: {err}</span><Btn onClick={load}>Retry</Btn></Bar>;
  if(!data) return <Bar>Agent Guards: loading…</Bar>;

  const { guard, remainingSec } = data;
  const pct = Math.min(100, Math.round((guard.noopCount/Math.max(1,guard.maxNoop))*100));
  const color = pct>=100 ? "#ff6a6a" : pct>=66 ? "#ffb84a" : "#9fd1ff";

  return (
    <Bar>
      <span>Agent Guards</span>
      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        <Meter label={`noop ${guard.noopCount}/${guard.maxNoop}`} pct={pct} color={color} />
        <Chip>cooldown {fmt(remainingSec)}</Chip>
        <Btn onClick={load}>Refresh</Btn>
        <Btn
          onClick={async ()=>{
            const key = prompt("Enter DEV sign key to reset guards");
            if(!key) return;
            const r = await fetch("/api/dev/agents/reset", { method:"POST", headers:{ "x-dev-key": key } });
            const j = await r.json();
            if(!j.ok){ alert(`Reset failed: ${j.error||"unknown"}`); return; }
            await load();
          }}
          title="Zero noop counter and clear cooldown (DEV only)"
        >
          Reset (DEV)
        </Btn>
      </div>
    </Bar>
  );
}

function Bar({children}:{children:any}){
  return (
    <div style={{
      border:"1px solid #1b2440", background:"#0b1020", color:"#cfe0ff",
      padding:"8px 10px", borderRadius:10, display:"flex", alignItems:"center",
      gap:12
    }}>
      {children}
    </div>
  );
}

function Meter({pct,label,color}:{pct:number;label:string;color:string}){
  return (
    <div style={{display:"flex", alignItems:"center", gap:8}}>
      <div style={{width:120, height:8, background:"#11162a", borderRadius:6, overflow:"hidden"}}>
        <div style={{width:`${pct}%`, height:"100%", background:color}}/>
      </div>
      <span style={{fontSize:12, opacity:.85}}>{label}</span>
    </div>
  );
}

function Chip({children}:{children:any}){
  return (
    <span style={{
      fontSize:12, padding:"4px 8px", border:"1px solid #1b2440",
      borderRadius:20, background:"#0a1124", color:"#cfe0ff"
    }}>{children}</span>
  );
}

function Btn(props:any){
  return <button {...props} style={{padding:"6px 10px", border:"1px solid #1b2440", background:"#0a1124", color:"#cfe0ff", borderRadius:8}} />;
}

function fmt(sec:number){
  if(sec<=0) return "ready";
  if(sec<60) return `${sec}s`;
  const m=Math.floor(sec/60), s=sec%60;
  return `${m}m ${s}s`;
}
