// apps/portal/app/api/sync/get_hvc_flags/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_INTEGRITY_FEED_BASE || '';

export async function GET() {
  if (!BASE) {
    return NextResponse.json({ error: 'INTEGRITY_FEED_BASE missing' }, { status: 500 });
  }

  // Return any items from feed where kind in ["violation","remediation"] and gate != "Beneficence"
  const url = `${BASE}/public_integrity_feed?kind=violation,remediation&limit=50`;
  const r = await fetch(url, { cache: 'no-store' });

  if (!r.ok) {
    return NextResponse.json({ error: await r.text() }, { status: r.status });
  }

  const data = await r.json();
  // Filter where gate != "Beneficence"
  const filtered = Array.isArray(data) ? data.filter((item: any) => item.gate !== "Beneficence") : [];
  
  return NextResponse.json(filtered);
}
