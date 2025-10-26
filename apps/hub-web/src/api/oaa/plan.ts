// pages/api/oaa/plan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { plan } from "../../../oaa/hub";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  const p = await plan(req.body);
  res.status(200).json({ ok:true, plan: p });
}


