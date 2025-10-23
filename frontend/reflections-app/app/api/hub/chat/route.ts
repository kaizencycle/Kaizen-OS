import { NextRequest, NextResponse } from "next/server";

// Simple proxy to Orchestrator: /v1/session/start + /v1/session/turn
// Merges mentor drafts into a single reply (equal-weight) for now.

const OAA_BASE = process.env.NEXT_PUBLIC_OAA_BASE || process.env.OAA_BASE || "http://localhost:8080";

type Mentor = "gemini" | "claude" | "deepseek" | "perplexity";

function sentences(text: string): string[] {
  return text.split(/(?<=[\.\?\!])\s+/g).map((s) => s.trim()).filter(Boolean);
}

function synthesizeEqual(drafts: Record<string, string>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  Object.values(drafts).forEach((t) => {
    sentences(t).forEach((s) => {
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    });
  });
  if (out.length) {
    out.unshift("**Thesis:**");
    out.push("\n**Examples:**\n- …\n- …");
    out.push("\n**Takeaway:** …");
  }
  return out.join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id = "hub",
      messages = [],
      model = "ensemble",
      mentors = ["gemini", "claude", "deepseek", "perplexity"] as Mentor[],
      system = "You are the OAA Assistant. Be crisp, helpful, and cite mentors when useful."
    } = body;

    const last = messages[messages.length - 1];
    const prompt: string = last?.content || "Hello from OAA Hub.";

    // start or reuse a session (stateless MVP: always start)
    const startRes = await fetch(`${OAA_BASE}/v1/session/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id, mentors })
    });
    if (!startRes.ok) {
      const t = await startRes.text();
      return NextResponse.json({ error: `start failed: ${t}` }, { status: 500 });
    }
    const { session_id } = await startRes.json();

    // get mentor drafts (turn)
    const turnRes = await fetch(`${OAA_BASE}/v1/session/turn`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id, prompt: `${system}\n\nUser: ${prompt}`, tools: mentors })
    });
    if (!turnRes.ok) {
      const t = await turnRes.text();
      return NextResponse.json({ error: `turn failed: ${t}` }, { status: 500 });
    }
    const turnData = await turnRes.json();
    const drafts = (turnData?.drafts || {}) as Record<string, string>;
    const combined = synthesizeEqual(drafts);

    const sources = Object.entries(drafts).map(([k, v]) => ({ mentor: k, preview: v.slice(0, 220) }));

    return NextResponse.json({
      role: "assistant",
      content: combined || "No drafts returned.",
      sources,
      session_id
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "hub proxy error" }, { status: 500 });
  }
}
