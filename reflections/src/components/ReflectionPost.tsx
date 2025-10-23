"use client";
import { useState } from "react";

export type Reflection = {
  id: string;
  user: string;
  text: string;
  ts: number;           // epoch ms
  archetype?: string;   // dominant tag, optional
};

export default function ReflectionPost({ post }:{ post:Reflection }){
  const [agree,setAgree]=useState(0);
  const [insight,setInsight]=useState(0);
  const dt = new Date(post.ts);
  const when = timeAgo(dt);
  return (
    <article className="post">
      <div className="meta">
        <span className="name">{post.user}</span>
        <span className="time">· {when}</span>
        {post.archetype && <span className="tag">{post.archetype}</span>}
      </div>
      <div style={{marginTop:6, lineHeight:1.5}}>{post.text}</div>
      <div className="reactions">
        <button className="btn" onClick={()=>setAgree(x=>x+1)}>💡 Agree {agree?`(${agree})`:""}</button>
        <button className="btn" onClick={()=>setInsight(x=>x+1)}>✨ Insight {insight?`(${insight})`:""}</button>
        <button className="btn" onClick={()=>alert("Threading coming soon")}>🪞 Reflect</button>
      </div>
    </article>
  );
}
function timeAgo(d:Date){
  const s = Math.floor((Date.now()-d.getTime())/1000);
  if (s<60) return `${s}s`;
  const m = Math.floor(s/60); if (m<60) return `${m}m`;
  const h = Math.floor(m/60); if (h<24) return `${h}h`;
  const dd = Math.floor(h/24); return `${dd}d`;
}