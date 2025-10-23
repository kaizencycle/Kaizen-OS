import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// POST /api/unlock  { user, companion, costGIC }
export async function POST(req: NextRequest) {
  const { user, companion, costGIC } = await req.json().catch(() => ({}));
  if (!user || !companion || !costGIC || costGIC <= 0) {
    return NextResponse.json({ error: "Missing user, companion, or cost" }, { status: 400 });
  }
  // Burn GIC from user's balance to record the unlock on the ledger
  const r = await fetch(`${process.env.GIC_INDEXER_URL}/ingest/ledger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.GIC_INDEXER_KEY as string
    },
    body: JSON.stringify({
      kind: "burn",
      amount: Number(costGIC),
      unit: "GIC",
      actor: user,
      meta: { source: "lab4-proof", action: "unlock_companion", companion }
    })
  });
  if (!r.ok) {
    const err = await r.text();
    return NextResponse.json({ error: `Index burn failed: ${err}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
