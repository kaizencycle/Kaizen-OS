import type { NextApiRequest, NextApiResponse } from "next";
import { makeQueue, defaultJobOpts } from "../../../lib/queue/bull";

const q = makeQueue("publishEvents");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  const { label, cid, integrityHex, sha256 } = req.body || {};
  if (!label || !cid || !integrityHex || !sha256) return res.status(400).json({ ok:false, error:"missing_params" });

  try {
    const job = await q.add("new-post", { label, cid, integrityHex, sha256 }, defaultJobOpts);
    return res.status(200).json({ ok:true, id: job.id });
  } catch (error: any) {
    console.error("Failed to enqueue job:", error);
    return res.status(500).json({ ok:false, error: error?.message || "enqueue_failed" });
  }
}

