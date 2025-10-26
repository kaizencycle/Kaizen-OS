import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok: false, error: "dev_routes_disabled" });
  }
  try {
    const p = path.join(process.cwd(), "docs", "ops", "INCIDENTS.md");
    if (!fs.existsSync(p)) return res.status(200).json({ ok: true, md: "# Incident Digest\n\n_No report yet._" });
    const md = fs.readFileSync(p, "utf8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, md });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "read_failed" });
  }
}


