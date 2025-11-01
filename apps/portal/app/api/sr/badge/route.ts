// apps/portal/app/api/sr/badge/route.ts
import { NextResponse } from "next/server";

function colorFor(verdict: string) {
  switch (verdict) {
    case "ADOPT": return "green";
    case "SHADOW": return "orange";
    case "DEFER": return "red";
    default: return "gray";
  }
}

export async function GET() {
  // Reuse your /api/sr/latest output
  const base = process.env.NEXT_PUBLIC_PORTAL_BASE || "http://localhost:3002";
  const r = await fetch(`${base}/api/sr/latest`, { cache: "no-store" })
    .catch(() => null);
  const data = r && r.ok ? await r.json() : { details: { verdict: "UNKNOWN" } };

  const verdict = String(data?.details?.verdict ?? "UNKNOWN").toUpperCase();
  const badge = {
    schemaVersion: 1,
    label: "Verdict",
    message: verdict,
    color: colorFor(verdict)
  };
  return NextResponse.json(badge);
}
