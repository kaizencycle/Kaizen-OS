// pages/api/oaa/voice.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/oaa/voice
 * body: { text: string, provider?: "mock"|"polly"|"elevenlabs"|"azure", voice?: string, rate?: number, pitch?: number }
 * returns: { ok: boolean, audioUrl?: string, visemes?: Array<{t:number, v:string}>, provider: string }
 *
 * This is a provider-agnostic stub that you can wire to a real TTS.
 * For now it generates a synthetic viseme timeline and a placeholder audio url.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error: "method_not_allowed" });
  const { text = "", provider = "mock" } = req.body || {};
  if (!text || typeof text !== "string") return res.status(400).json({ ok:false, error:"missing_text" });

  // --- MOCK PROVIDER ---
  // naive mapping by character groups into a tiny viseme sequence
  const map: Record<string,string> = {
    A: "A", E: "E", I: "E", O: "O", U: "U",
    B: "BMP", P: "BMP", M: "BMP",
    F: "FV", V: "FV",
    L: "L", R: "L",
    S: "S", Z: "S", C: "S", J: "S", Q: "S", X: "S"
  };
  const letters = text.toUpperCase().replace(/[^A-Z ]/g, "").split("");
  let t = 0;
  const visemes: {t:number, v:string}[] = [];
  for (const ch of letters) {
    const v = map[ch] || "REST";
    visemes.push({ t, v });
    t += 90; // ~90ms per letter avg
  }

  // Placeholder audio URL (front-end can fall back to Web Speech if none)
  const audioUrl = `/api/oaa/voice/mock/audio?t=${Date.now()}`;
  return res.status(200).json({ ok:true, provider, audioUrl, visemes });
}


