"use client";
import { useState } from "react";

export default function ReflectionInput({ placeholder, onSubmit, busy }:{
  placeholder:string; onSubmit:(text:string)=>void; busy?:boolean;
}){
  const [text,setText]=useState("");
  return (
    <div>
      <textarea className="input" value={text} onChange={e=>setText(e.target.value)} placeholder={placeholder}/>
      <div className="row" style={{justifyContent:"space-between", marginTop:8}}>
        <span className="mini">Tip: write one concrete thing you learned.</span>
        <button className="btn primary" disabled={busy||!text.trim()} onClick={()=>{ onSubmit(text); setText(""); }}>
          {busy? "Reflecting…" : "Reflect ✨"}
        </button>
      </div>
    </div>
  );
}