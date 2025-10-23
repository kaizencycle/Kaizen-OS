"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/app/styles/reflections.css";
import ReflectionInput from "@/components/ReflectionInput";
import ReflectionPost, { Reflection } from "@/components/ReflectionPost";

export default function FeedPage(){
  const [handle,setHandle]=useState<string>("");
  const [gic,setGic]=useState<number>(0);
  const [feed,setFeed]=useState<Reflection[]>([]);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{ (async()=>{
    const me = await fetch("/api/me").then(r=>r.ok?r.json():{});
    if (me?.handle){ setHandle(me.handle); }
    // initial balances (if configured)
    if (process.env.NEXT_PUBLIC_GIC_INDEXER_URL && me?.handle) {
      try{
        const r = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/balances/${me.handle}`, { cache:"no-store" });
        if (r.ok){ const j = await r.json(); setGic(j?.total_gic||0); }
      }catch{}
    }
  })(); },[]);

  async function loadFeed(){
    try{
      const r = await fetch("/api/reflections/list", { cache:"no-store" });
      if (r.ok){ const j = await r.json(); setFeed(j.items||[]); }
    }catch{}
  }
  useEffect(()=>{ loadFeed(); const t=setInterval(loadFeed, 15000); return ()=>clearInterval(t); },[]);

  async function onPost(text:string){
    if (!text.trim()) return;
    setBusy(true);
    const r = await fetch("/api/reflections/post", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user: handle||"guest", text })
    });
    setBusy(false);
    if (!r.ok){ const j = await r.json().catch(()=>({error:"post failed"})); alert(j.error||"Post failed"); return; }
    await loadFeed();
  }

  return (
    <>
      <header className="fb-header">
        <div className="inner">
          <div className="brand">
            <Image src="/sigil.svg" alt="Concord Sigil" width={24} height={24} />
            <span>Reflections</span>
          </div>
          <span className="pill">balance: {gic.toFixed(2)} GIC</span>
          <div style={{flex:1}}/>
          <Link href="/companion" className="pill">Companion</Link>
          <Link href="/forest" className="pill">Forest</Link>
          <Link href="/programs" className="pill">Programs</Link>
        </div>
      </header>
      <main className="fb-shell">
        <aside className="panel col">
          <div className="row">
            <Image src="/sigil.svg" alt="" width={36} height={36}/>
            <div>
              <div style={{fontWeight:700}}>{handle || "Guest"}</div>
              <div className="mini">🪙 {gic.toFixed(2)} GIC</div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="mini">Archetype Wheel (see Companion)</div>
          <Link href="/companion" className="btn">Open Companion</Link>
        </aside>

        <section className="col">
          <div className="panel">
            <ReflectionInput placeholder="What did you learn today?" onSubmit={onPost} busy={busy}/>
          </div>
          <div className="panel feed">
            {feed.map(p => <ReflectionPost key={p.id} post={p} />)}
            {feed.length===0 && <div className="mini">No reflections yet — be the first to share ✨</div>}
          </div>
        </section>

        <aside className="panel rightcard">
          <strong>Community Insights</strong>
          <div className="row" style={{marginTop:8, flexWrap:"wrap"}}>
            <span className="badge">✨ Insight: +1 XP</span>
            <span className="badge">💡 Agree: +morale</span>
            <span className="badge">🪞 Reflect: start thread</span>
          </div>
          <div className="divider"></div>
          <div className="mini">Shards (heroes), Healing (sages), Meditation (monks) active now are visible on <Link href="/programs">Programs</Link>.</div>
        </aside>
      </main>
    </>
  );
}