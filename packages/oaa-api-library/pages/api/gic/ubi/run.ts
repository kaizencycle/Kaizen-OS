import type { NextApiRequest, NextApiResponse } from "next";
const INDEXER = process.env.GIC_INDEXER_URL!;
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "POST") return res.status(405).end();
  const auth = req.headers.authorization || "";
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ ok:false, error:"unauthorized" });
  const cycle = String(req.query.cycle||"").trim();
  const r = await fetch(`${INDEXER.replace(/\/$/,"")}/ubi/run${cycle?`?cycle=${encodeURIComponent(cycle)}`:""}`, { method:"POST", headers:{ authorization: auth } });
  const body = await r.json().catch(()=> ({}));
  return res.status(r.ok?200:r.status).json(body);
}
