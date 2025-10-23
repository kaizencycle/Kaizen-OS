import type { NextApiRequest, NextApiResponse } from "next";
const INDEXER = process.env.GIC_INDEXER_URL!;
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const cycle = String(req.query.cycle||"").trim();
  try{
    const r = await fetch(`${INDEXER.replace(/\/$/,"")}/ubi/summary${cycle?`?cycle=${encodeURIComponent(cycle)}`:""}`);
    if (!r.ok) return res.status(r.status).json({ ok:false, error:"indexer_error" });
    const data = await r.json();
    res.setHeader("Cache-Control","public, max-age=60");
    return res.status(200).json({ ok:true, summary:data });
  }catch(e:any){
    return res.status(500).json({ ok:false, error:"proxy_exception", message:e?.message });
  }
}