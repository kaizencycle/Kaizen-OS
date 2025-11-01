// apps/portal/app/api/sr/latest/route.ts
import { NextResponse } from "next/server";

const KV_URL  = process.env.KV_REST_API_URL;
const KV_TOKEN= process.env.KV_REST_API_TOKEN;
const KV_KEY  = process.env.SR_KV_KEY ?? "kaizen:sr:latest";

// module-level cache as a last resort
let LAST_SR: any = null;

async function readKV() {
  if (!KV_URL || !KV_TOKEN) return null;
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store"
  });
  if (!r.ok) return null;
  const j = await r.json();          // Upstash returns { result: "<json or string>" }
  const raw = j?.result;
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function GET() {
  try {
    const sr = await readKV();
    if (sr) return NextResponse.json(sr);
  } catch { /* ignore and fall through */ }

  if (LAST_SR) return NextResponse.json(LAST_SR);

  // Fallback to env defaults if nothing persisted yet
  return NextResponse.json({
    cycle: process.env.NEXT_PUBLIC_KAIZEN_CURRENT_CYCLE ?? "C-121",
    gi: (process.env.NEXT_PUBLIC_KAIZEN_GI_BASELINE ?? "0.993"),
    details: {
      verdict: (process.env.NEXT_PUBLIC_SR_VERDICT ?? "UNKNOWN").toUpperCase(),
      updated_at: new Date().toISOString()
    }
  });
}
