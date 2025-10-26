import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const f = path.join(process.cwd(), "configs", "services.json");
    const json = JSON.parse(fs.readFileSync(f, "utf8"));
    res.setHeader("Cache-Control", "public, max-age=60");
    res.status(200).json(json);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: "services_manifest_unavailable", message: e?.message });
  }
}
