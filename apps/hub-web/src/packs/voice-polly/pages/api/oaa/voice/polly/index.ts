// pages/api/oaa/voice/polly/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Polly, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { mapPollyViseme } from "../../../../lib/visemeMap";

const polly = new Polly({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  } : undefined
});

function toDataUrl(buf: Buffer, mime = "audio/mpeg") {
  return `data:${mime};base64,` + buf.toString("base64");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  const { text = "", voice = (process.env.POLLY_VOICE || "Joanna"), format = "mp3", rate, pitch } = req.body || {};
  if (!text || typeof text !== "string") return res.status(400).json({ ok:false, error:"missing_text" });

  try {
    // 1) Audio
    const audioCmd = new SynthesizeSpeechCommand({
      OutputFormat: format === "pcm" ? "pcm" : "mp3",
      Text: text,
      VoiceId: voice,
      Engine: (process.env.POLLY_ENGINE as any) || "neural"
    });
    const audioResp = await polly.send(audioCmd);
    const audioBuf = Buffer.from(await audioResp.AudioStream!.transformToByteArray());
    const audioUrl = toDataUrl(audioBuf, format === "pcm" ? "audio/wav" : "audio/mpeg");

    // 2) Speech marks (visemes)
    const marksCmd = new SynthesizeSpeechCommand({
      OutputFormat: "json",
      SpeechMarkTypes: ["viseme"],
      Text: text,
      VoiceId: voice,
      Engine: (process.env.POLLY_ENGINE as any) || "neural"
    });
    const marksResp = await polly.send(marksCmd);
    const marksBuf = Buffer.from(await marksResp.AudioStream!.transformToByteArray());
    const lines = marksBuf.toString("utf8").trim().split(/\r?\n/).filter(Boolean);
    const parsed = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) as any[];

    const visemes = parsed
      .filter(v => v.type === "viseme")
      .map(v => ({ t: Number(v.time) || 0, v: mapPollyViseme(String(v.value)) }));

    return res.status(200).json({ ok:true, provider:"polly", audioUrl, visemes });
  } catch (err: any) {
    console.error("[polly] error", err);
    return res.status(500).json({ ok:false, error:"polly_failed", detail: String(err?.message || err) });
  }
}


