import { NextRequest, NextResponse } from "next/server";
import { getCompanion } from "@/lib/companions";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, text, companion = "jade" } = await req.json();
    if (!text || !user) {
      return NextResponse.json({ error: "Missing user or text" }, { status: 400 });
    }
    const { system } = getCompanion(companion);

    // Call OpenAI (swap to GitHub Models later if you prefer)
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text }
        ]
      })
    });
    if (!r.ok) {
      const err = await r.text();
      return NextResponse.json({ error: `LLM error: ${err}` }, { status: 500 });
    }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content ?? "…";

    // XP rule (MVP)
    const xp = Math.min(50, Math.max(5, Math.floor((text.length || 0) / 10)));

    // Fire-and-forget GIC Indexer ingest
    fetch(`${process.env.GIC_INDEXER_URL}/ingest/ledger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.GIC_INDEXER_KEY as string
      },
      body: JSON.stringify({
        kind: "xp_award",
        amount: xp,
        unit: "XP",
        target: user,
        meta: { source: "lab4-proof", companion, chars: text.length }
      })
    }).catch(() => {});

    return NextResponse.json({ reply, xpGranted: xp });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
