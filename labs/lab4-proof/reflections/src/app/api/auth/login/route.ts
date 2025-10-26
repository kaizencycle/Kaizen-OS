import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const handle = String(body?.handle || "").trim().toLowerCase();
  if (!handle || handle.length < 3) {
    return NextResponse.json({ error: "Handle too short" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, handle });
  const session = await getSession(req, res);
  session.handle = handle;
  await session.save();
  return res;
}

