import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/dev/ledger/seal
 * body: { title?: string, slug?: string, companion: string, sha256: string }
 * forwards to: {LEDGER_BASE_URL}/seal with Authorization header
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error: "method_not_allowed" });

  try {
    const { title, slug, companion, sha256 } = req.body || {};
    if (!companion || !sha256) return res.status(400).json({ ok:false, error: "missing_params" });

    const base = process.env.LEDGER_BASE_URL!;
    const token = process.env.LEDGER_ADMIN_TOKEN || "";
    const r = await fetch(`${base}/seal`, {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${token}` },
      body: JSON.stringify({ title, slug, companion, sha256 })
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) return res.status(502).json({ ok:false, error: j?.error || `seal_failed_${r.status}` });

    return res.status(200).json({ ok:true, proof: j.proof, ts: j.ts });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || "seal_proxy_error" });
  }
}

