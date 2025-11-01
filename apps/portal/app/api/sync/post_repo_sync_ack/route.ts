// apps/portal/app/api/sync/post_repo_sync_ack/route.ts
import { NextRequest, NextResponse } from "next/server";

// Store minimal ack (file/redis/db). Here we just echo.
let lastRepoAck: any = null;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    lastRepoAck = {
      ...payload,
      received_at: new Date().toISOString()
    };
    return NextResponse.json({ ok: true, ack: lastRepoAck });
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(lastRepoAck || { message: "no repo sync ack recorded" });
}
