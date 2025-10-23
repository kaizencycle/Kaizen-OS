"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { lessonToMarkdown, downloadMarkdown } from "../../lib/markdown";
import { lessonToPDF } from "../../lib/pdf";

type Plan = {
  title: string;
  objectives: string[];
  sections: { title: string; summary: string; content: string; quick_checks?: string[] }[];
  practice?: { prompt: string }[];
  takeaways?: string[];
};

export default function LessonPage() {
  const [topic, setTopic] = useState("Algebra — Solving Linear Equations");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setPlan(null);
    try {
      const res = await fetch("/api/lesson", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data.plan); setSessionId(data.session_id || null); setActiveIdx(0);
    } catch (e:any) {
      setToast(`⚠️ ${e.message || "lesson error"}`);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const contentRef = useRef<HTMLDivElement>(null);

  async function exportPDF() {
    if (!plan || !contentRef.current) return;
    await lessonToPDF(contentRef.current, plan.title || "lesson");
  }

  function exportMarkdown() {
    if (!plan) return;
    const md = lessonToMarkdown(plan);
    const safe = (plan.title || "lesson").toLowerCase().replace(/[^a-z0-9\-]+/g, "-");
    downloadMarkdown(`${safe}.md`, md);
  }

  async function sendToDiary() {
    const notes = [
      `Lesson: ${plan?.title}`,
      `Objectives: ${(plan?.objectives || []).join("; ")}`,
      `Sections: ${(plan?.sections || []).map(s => s.title).join(" · ")}`
    ].join("\n");
    const res = await fetch("/api/diary/add", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: plan?.title || topic, summary: "Completed a micro-lesson.", notes, session_id: sessionId })
    });
    const j = await res.json();
    setToast(j.ok ? "Saved to Diary ✅" : `Diary error: ${j.error || "unknown"}`);
    setTimeout(() => setToast(null), 2500);
  }

  const section = useMemo(() => (plan?.sections || [])[activeIdx] || null, [plan, activeIdx]);

  return (
    <div style={wrap}>
      {/* Outline column */}
      <aside style={left}>
        <div style={bar}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Forces and Motion)"
            style={inpt}
          />
          <button onClick={generate} disabled={loading} style={genBtn}>{loading ? "Generating…" : "Generate"}</button>
        </div>
        {plan ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{plan.title}</div>
            <div>
              <div style={subhead}>Objectives</div>
              <ul style={ul}>
                {plan.objectives?.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <div style={subhead}>Sections</div>
              <div style={{ display: "grid", gap: 6 }}>
                {plan.sections?.map((s, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} style={secBtn(i === activeIdx)}>{s.title}</button>
                ))}
              </div>
            </div>
            {plan.practice?.length ? (
              <div>
                <div style={subhead}>Practice</div>
                <ul style={ul}>
                  {plan.practice.map((p, i) => <li key={i}>{p.prompt}</li>)}
                </ul>
              </div>
            ) : null}
            {plan.takeaways?.length ? (
              <div>
                <div style={subhead}>Takeaways</div>
                <ul style={ul}>{plan.takeaways.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ opacity: 0.8, fontSize: 13 }}>Enter a topic and click <b>Generate</b> to create a micro-lesson.</div>
        )}
      </aside>

      {/* Content column */}
      <main style={right}>
        <header style={top}>
          <div style={{ fontWeight: 700 }}>{plan?.title || "Lesson Content"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportPDF} disabled={!plan} style={ghost}>Export PDF</button>
            <button onClick={exportMarkdown} disabled={!plan} style={ghost}>Export .md</button>
            <button onClick={sendToDiary} disabled={!plan} style={primary}>Send to Diary</button>
          </div>
        </header>
        <div ref={contentRef} style={content}>
          {!plan && <div style={{ opacity: 0.7 }}>No lesson yet.</div>}
          {plan && section && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{section.title}</div>
              {section.summary && <p style={p}>{section.summary}</p>}
              <pre style={pre}>{section.content}</pre>
              {(section.quick_checks || []).length ? (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Quick checks</div>
                  <ul style={ul}>
                    {section.quick_checks!.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
      {toast && <div style={toastBox}>{toast}</div>}
    </div>
  );
}

/* ---------- styles ---------- */
const wrap: React.CSSProperties = { display: "grid", gridTemplateColumns: "340px 1fr", height: "100vh", background: "#0f172a" };
const left: React.CSSProperties = { background: "#0b1225", color: "white", padding: 16, borderRight: "1px solid #1e293b", overflow: "auto" };
const right: React.CSSProperties = { display: "grid", gridTemplateRows: "56px 1fr", background: "white", color: "#0f172a" };
const top: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #e5e7eb" };
const content: React.CSSProperties = { padding: 16, overflow: "auto", background: "#f8fafc" };
const p: React.CSSProperties = { margin: 0, lineHeight: 1.6 };
const pre: React.CSSProperties = { whiteSpace: "pre-wrap", margin: 0, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, sans-serif", fontSize: 14 };
const bar: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 130px", gap: 8, marginBottom: 12 };
const inpt: React.CSSProperties = { border: "1px solid #334155", background: "#0f172a", color: "white", borderRadius: 8, padding: "8px 10px" };
const genBtn: React.CSSProperties = { border: "1px solid #334155", background: "#1e293b", color: "white", borderRadius: 8, fontWeight: 700, cursor: "pointer" };
const subhead: React.CSSProperties = { fontWeight: 700, opacity: 0.9, marginBottom: 6, fontSize: 14 };
const ul: React.CSSProperties = { margin: 0, paddingLeft: 18, lineHeight: 1.6 };
const secBtn = (active: boolean): React.CSSProperties => ({
  textAlign: "left",
  border: "1px solid #334155",
  background: active ? "#1e293b" : "#0f172a",
  color: "white",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer"
});
const primary: React.CSSProperties = { border: "1px solid #111827", background: "#111827", color: "white", borderRadius: 10, fontWeight: 700, cursor: "pointer", padding: "6px 10px" };
const ghost: React.CSSProperties = { border: "1px solid #d1d5db", background: "white", color: "#0f172a", borderRadius: 10, fontWeight: 700, cursor: "pointer", padding: "6px 10px" };
const toastBox: React.CSSProperties = {
  position: "fixed", right: 16, bottom: 16, background: "#111827", color: "white",
  borderRadius: 10, padding: "10px 12px", border: "1px solid #1f2937", boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
};