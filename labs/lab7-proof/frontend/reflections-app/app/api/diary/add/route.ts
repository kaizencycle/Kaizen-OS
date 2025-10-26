import { NextRequest, NextResponse } from "next/server";

// Placeholder persistence endpoint.
// Replace with Prisma create() later.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // minimal validation
    const entry = {
      ts: new Date().toISOString(),
      topic: body?.topic || "Lesson",
      summary: body?.summary || "",
      notes: body?.notes || "",
      session_id: body?.session_id || null
    };
    // In-memory echo (stateless on Render dyno but useful as placeholder)
    return NextResponse.json({ ok: true, entry });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || "diary error" }, { status: 500 });
  }
}
