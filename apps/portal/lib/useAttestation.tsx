'use client';

import { useEffect, useState } from "react";
import ProvenanceCard, { ProvenanceData } from "../components/ProvenanceCard";

export function AttestationBlock({ endpoint, mediaHash }:{ endpoint:string; mediaHash:string }){
  const [data,setData]=useState<ProvenanceData|null>(null);
  const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{(async()=>{
    try{
      const res=await fetch(`${endpoint}/attest`,{
        method:"POST",headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ media_hash:mediaHash, c2pa:false, watermark_ok:false, declared_synthetic:true })
      });
      if(!res.ok) throw new Error(String(res.status));
      setData(await res.json());
    }catch(e:any){setErr(e.message);}
  })();},[endpoint,mediaHash]);

  if(err) return <div style={{color:"#dc2626"}}>Attestation error: {err}</div>;
  if(!data) return <div>Attesting…</div>;
  return <ProvenanceCard data={data}/>;
}

