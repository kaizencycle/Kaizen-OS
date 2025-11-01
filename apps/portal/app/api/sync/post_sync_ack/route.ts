// apps/portal/app/api/sync/post_sync_ack/route.ts
import { NextRequest, NextResponse } from "next/server";

// Store last ATLAS sync heartbeat (Redis/file)
// For now, we'll use a simple in-memory cache
let lastSyncAck: any = null;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    lastSyncAck = {
      ...payload,
      received_at: new Date().toISOString()
    };
    return NextResponse.json({ ok: true, ack: lastSyncAck });
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(lastSyncAck || { message: "no sync ack recorded" });
}
