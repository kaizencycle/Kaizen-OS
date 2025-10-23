import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error: "method_not_allowed" });
  const payload = req.body || {};
  return res.status(200).json({ ok: true, received: payload });
}
