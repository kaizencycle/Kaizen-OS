import { NextRequest, NextResponse } from "next/server";

const OAA_BASE = process.env.NEXT_PUBLIC_OAA_BASE || "http://localhost:8080";

type Mentor = "gemini" | "claude" | "deepseek" | "perplexity";

const SYSTEM = `
You are the OAA Lesson Planner. Produce a concise JSON lesson plan:
{
  "title": string,
  "objectives": [string, ...],
  "sections": [
    { "title": string, "summary": string, "content": string, "quick_checks": [string, ...] }
  ],
  "practice": [ { "prompt": string } ],
  "takeaways": [string, ...]
}
Keep it practical for a 15–25 minute micro-lesson.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id = "lesson",
      topic = "Derivatives 101",
      mentors = ["gemini","claude","deepseek","perplexity"] as Mentor[]
    } = body;

    const startRes = await fetch(`${OAA_BASE}/v1/session/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id, mentors })
    });
    if (!startRes.ok) return NextResponse.json({ error: "session start failed" }, { status: 500 });
    const { session_id } = await startRes.json();

    // Ask mentors to draft a structured lesson JSON
    const prompt = `${SYSTEM}\n\nCreate a lesson on: ${topic}`;
    const turnRes = await fetch(`${OAA_BASE}/v1/session/turn`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id, prompt })
    });
    if (!turnRes.ok) {
      const t = await turnRes.text();
      return NextResponse.json({ error: `turn failed: ${t}` }, { status: 500 });
    }
    const data = await turnRes.json();
    const drafts = data?.drafts || {};

    // Pick the first valid JSON from drafts or fall back to a minimal plan
    let plan: any = null;
    for (const text of Object.values(drafts) as string[]) {
      const match = text.match(/\{[\s\S]*\}$/);
      if (match) {
        try { plan = JSON.parse(match[0]); break; } catch {}
      }
    }
    if (!plan) {
      plan = {
        title: topic,
        objectives: ["Understand key ideas", "Practice with examples"],
        sections: [{ title: "Overview", summary: "Quick intro", content: "Explanation...", quick_checks: ["What is X?"] }],
        practice: [{ prompt: "Try problem A" }],
        takeaways: ["Main idea A", "Main idea B"]
      };
    }
    return NextResponse.json({ plan, session_id, sources: drafts });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "lesson proxy error" }, { status: 500 });
  }
}
