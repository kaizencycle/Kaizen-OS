// apps/portal/app/api/sync/get_recent_events/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_INTEGRITY_FEED_BASE || '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since_last_sync = searchParams.get('since_last_sync') === 'true';
  const limit = parseInt(searchParams.get('limit') || '25', 10);

  if (!BASE) {
    return NextResponse.json({ error: 'INTEGRITY_FEED_BASE missing' }, { status: 500 });
  }

  const url = `${BASE}/public_integrity_feed?limit=${limit}${since_last_sync ? '&since_last_sync=true' : ''}`;
  const r = await fetch(url, { cache: 'no-store' });

  if (!r.ok) {
    return NextResponse.json({ error: await r.text() }, { status: r.status });
  }

  const data = await r.json();
  return NextResponse.json(data);
}
