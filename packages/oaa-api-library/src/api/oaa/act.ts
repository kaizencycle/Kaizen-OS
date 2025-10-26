// pages/api/oaa/act.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { act } from "../../../oaa/hub";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  const out = await act(req.body);
  res.status(200).json(out);
}

