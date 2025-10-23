import type { NextApiRequest, NextApiResponse } from "next";

// Required env in Render/Vercel:
// LEDGER_BASE_URL=https://<ledger-domain>
// (optional) LEDGER_ADMIN_TOKEN=...  // only if your ledger endpoint needs auth
// PROOF_CACHE_SECONDS=60

const LEDGER = process.env.LEDGER_BASE_URL!;
const AUTH   = process.env.LEDGER_ADMIN_TOKEN || "";
const TTL    = Number(process.env.PROOF_CACHE_SECONDS || 60);

// (Optional) local map of backrefs written by your CI write-back step
// Structure: { "<proofId>": { eommFile: "data/eomm/...", beacon: "/public/ai-seo/beacons/..." } }
import fs from "fs"; import path from "path";
function readBackref(proofId: string) {
  try {
    const f = path.join(process.cwd(), "out", "proof-backrefs.json");
    if (!fs.existsSync(f)) return null;
    const m = JSON.parse(fs.readFileSync(f, "utf8"));
    return m[proofId] || null;
  } catch { return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "").trim();
  if (!LEDGER || !id) return res.status(400).json({ ok:false, error:"missing_config_or_id" });

  const url = `${LEDGER.replace(/\/$/,"")}/ledger/proofs/${encodeURIComponent(id)}`;

  const headers: Record<string,string> = { "accept":"application/json" };
  if (AUTH) headers["authorization"] = `Bearer ${AUTH}`;

  try {
    const r = await fetch(url, { headers });
    if (!r.ok) {
      return res.status(r.status).json({ ok:false, error:"ledger_error", status:r.status });
    }
    const proof = await r.json();

    // Backrefs (optional, best-effort)
    const back = readBackref(id) || {
      // try to infer from typical proof body fields if present
      eommFile: proof?.meta?.eommFile || null,
      beacon: proof?.meta?.beaconUrl || null
    };

    res.setHeader("Cache-Control", `public, max-age=${TTL}`);
    return res.status(200).json({
      ok: true,
      proof: {
        id,
        hash: proof?.hash || proof?.integrityHash || null,
        signer: proof?.signer || proof?.attestation?.signer || null,
        createdAt: proof?.createdAt || proof?.timestamp || null,
        status: proof?.status || "verified",
        links: {
          ledger: url,
          eommFile: back?.eommFile || null,
          beacon: back?.beacon || null
        },
        meta: {
          agent: proof?.agent || proof?.oaa?.companion || null,
          cycle: proof?.oaa?.cycle || null,
          geo: proof?.geo || null,
          citationCount: Array.isArray(proof?.citation) ? proof.citation.length : undefined
        }
      }
    });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:"proxy_exception", message:e?.message });
  }
}
