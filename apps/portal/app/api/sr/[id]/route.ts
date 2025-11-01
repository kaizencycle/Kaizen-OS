// apps/portal/app/api/sr/[id]/route.ts
import { NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_INTEGRITY_FEED_BASE || '';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!BASE) {
    return NextResponse.json({ error: 'INTEGRITY_FEED_BASE missing' }, { status: 500 });
  }
  const url = `${BASE}/public_integrity_feed/${encodeURIComponent(params.id)}`;
  const r = await fetch(url, { cache: 'no-store' });

  const res = NextResponse.json(r.ok ? await r.json() : { error: await r.text() }, { status: r.status });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
