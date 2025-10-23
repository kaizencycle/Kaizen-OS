import type { NextApiRequest, NextApiResponse } from "next";
import { shaHex } from "../../../lib/dev/hash";

/**
 * GET  /api/dev/ledger/proof?companion=&sha256=
 * POST /api/dev/ledger/proof { text }  -> returns { sha256 } (local helper)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const text = String(req.body?.text || "");
      if (!text) return res.status(400).json({ ok:false, error:"text_required" });
      const sha256 = await shaHex(text);
      return res.status(200).json({ ok:true, sha256 });
    }

    const companion = (req.query.companion as string || "").toLowerCase();
    const sha256 = (req.query.sha256 as string || "");
    if (!companion || !sha256) return res.status(400).json({ ok:false, error:"missing_params" });

    const ledger = process.env.LEDGER_BASE_URL!;
    const r = await fetch(`${ledger}/proofs?companion=${encodeURIComponent(companion)}&sha256=${encodeURIComponent(sha256)}`, {
      headers: { "authorization": `Bearer ${process.env.LEDGER_ADMIN_TOKEN || ""}` }
    });
    if (!r.ok) return res.status(200).json({ ok:true, proof: null });
    const j = await r.json();
    return res.status(200).json({ ok:true, proof: j?.proof || null });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || "lookup_failed" });
  }
}