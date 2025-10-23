import type { NextApiRequest, NextApiResponse } from "next";
const INDEXER = process.env.GIC_INDEXER_URL!;
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { userId } = req.query; const cycle = String(req.query.cycle||"").trim();
  if (!userId) return res.status(400).json({ ok:false, error:"missing_userId" });
  try{
    const url = `${INDEXER.replace(/\/$/,"")}/ubi/${encodeURIComponent(String(userId))}${cycle?`?cycle=${encodeURIComponent(cycle)}`:""}`;
    const r = await fetch(url); if (!r.ok) return res.status(r.status).json({ ok:false, error:"indexer_error" });
    const data = await r.json();
    res.setHeader("Cache-Control","public, max-age=30");
    return res.status(200).json({ ok:true, payout:data });
  }catch(e:any){
    return res.status(500).json({ ok:false, error:"proxy_exception", message: e?.message });
  }
}
