import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

function validateEntry(entry: any): string[] {
  const errs: string[] = [];
  if (!entry || typeof entry !== "object") { errs.push("not_an_object"); return errs; }
  for (const k of ["title","timestamp","agent","cycle","content"]) {
    if (!entry[k] || String(entry[k]).trim().length === 0) errs.push(`missing_${k}`);
  }
  return errs;
}
function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });

  let entry: any;
  try { entry = req.body && typeof req.body === "object" ? req.body : JSON.parse(String(req.body||"{}")); }
  catch { return res.status(200).json({ ok:false, verdict:"quarantine", errors:["invalid_json"] }); }

  const errors = validateEntry(entry);
  if (errors.length > 0) {
    return res.status(200).json({ ok:false, verdict:"quarantine", errors });
  }

  const sha = sha256Hex(JSON.stringify(entry));
  return res.status(200).json({
    ok: true,
    verdict: "pass",
    sha256: sha,
    echo: {
      title: entry.title,
      agent: entry.agent,
      cycle: entry.cycle,
      timestamp: entry.timestamp
    }
  });
}
