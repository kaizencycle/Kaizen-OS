// apps/portal/app/api/sr/emit/dry-run/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const sr = {
    cycle: body.cycle ?? process.env.NEXT_PUBLIC_KAIZEN_CURRENT_CYCLE ?? "C-121",
    gi: Number(body.gi ?? process.env.NEXT_PUBLIC_KAIZEN_GI_BASELINE ?? 0).toFixed(3),
    details: {
      verdict: String(body.verdict ?? process.env.NEXT_PUBLIC_SR_VERDICT ?? "UNKNOWN").toUpperCase(),
      notes: body.notes ?? "(dry-run)",
      updated_at: new Date().toISOString()
    },
    _dry_run: true,
    _persisted: false
  };
  return NextResponse.json(sr);
}
