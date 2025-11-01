// apps/portal/app/api/sr/emit/route.ts
import { NextRequest, NextResponse } from "next/server";

// Optional: Vercel KV / Upstash Redis (recommended)
const KV_URL  = process.env.KV_REST_API_URL;     // e.g. from Vercel KV
const KV_TOKEN= process.env.KV_REST_API_TOKEN;   // bearer token
const KV_KEY  = process.env.SR_KV_KEY ?? "kaizen:sr:latest";

// Simple HMAC-style shared secret
const SR_SECRET = process.env.SR_SECRET ?? "";

type SRPayload = {
  cycle: string;              // e.g. "C-121"
  gi: number | string;        // e.g. 0.993
  verdict: "ADOPT" | "SHADOW" | "DEFER" | "UNKNOWN";
  notes?: string;             // short human note (optional)
  updated_at?: string;        // ISO; auto-filled if absent
};

async function writeKV(obj: any) {
  if (!KV_URL || !KV_TOKEN) return false;
  await fetch(`${KV_URL}/set/${encodeURIComponent(KV_KEY)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
    cache: "no-store"
  });
  return true;
}

// fallback (per-instance, non-durable)
let LAST_SR: any = null;

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("x-sr-secret") ?? "";
  if (!SR_SECRET || auth !== SR_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: SRPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const sr = {
    cycle: body.cycle ?? "C-121",
    gi: Number(body.gi ?? 0).toFixed(3),
    details: {
      verdict: String(body.verdict ?? "UNKNOWN").toUpperCase(),
      notes: body.notes ?? "",
      updated_at: body.updated_at ?? new Date().toISOString()
    }
  };

  // Try KV first; fall back to memory
  let persisted = false;
  try { persisted = await writeKV(sr); } catch { /* ignore */ }
  if (!persisted) LAST_SR = sr;

  return NextResponse.json({ ok: true, persisted, sr });
}
