"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import oaa from '@/lib/oaa';

/* ---------- Types ---------- */
type StartResp = { session_id: string; mentors: string[]; started_at: string };
type SubmitResp = {
  attestation_id: string; xp_awarded: number; level_before: number; level_after: number;
  reward_tx_id?: string | null; balance_after?: number | null;
};
type BalanceResp = { wallet: string; balance: number; last_tx_id?: string | null };
type Drafts = Record<string, string>;
type CritiqueResp = { rubric: { accuracy: number; depth: number; originality: number; integrity: number }, critique: string };

/* ---------- Helpers ---------- */
async function postJSON<T>(path: string, body: any): Promise<T> {
  const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
function sentences(text: string): string[] {
  return text.split(/(?<=[\.\?\!])\s+/g).map((s) => s.trim()).filter(Boolean);
}
function normTokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}
function jaccard(a: string, b: string): number {
  const A = new Set(normTokens(a)); const B = new Set(normTokens(b));
  const inter = new Set([...A].filter((x) => B.has(x))).size;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

/* Weighted synthesis: score sentences by (sum of mentor weights for mentors that contain the sentence) */
function synthesizeWeighted(draftMap: Drafts, weights: Record<string, number>): string {
  const score = new Map<string, number>();
  Object.entries(draftMap).forEach(([mentor, text]) => {
    const w = weights[mentor] ?? 0;
    if (w <= 0) return;
    sentences(text).forEach((s) => {
      const key = s.trim();
      if (!key) return;
      score.set(key, (score.get(key) || 0) + w);
    });
  });
  const ranked = [...score.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([s]) => s);
  // soft de-dup by semantic proximity
  const out: string[] = [];
  ranked.forEach((s) => {
    const near = out.some((x) => jaccard(x, s) > 0.85);
    if (!near) out.push(s);
  });
  // small scaffold
  if (out.length > 0) {
    out.unshift("**Thesis:**");
    out.push("\n**Examples:**\n- …\n- …");
    out.push("\n**Takeaway:** …");
  }
  return out.join(" ");
}

/* ---------- Component ---------- */
export default function MentorPage() {
  // Core
  const [handle, setHandle] = useState("michael");
  const [userId, setUserId] = useState("michael");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [prompt, setPrompt] = useState("Explain gravity to a teen.");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [lastSubmit, setLastSubmit] = useState<SubmitResp | null>(null);
  const [balance, setBalance] = useState<BalanceResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drafts + compare
  const [drafts, setDrafts] = useState<Drafts>({});
  const [gettingDrafts, setGettingDrafts] = useState(false);
  const [selectedMentors, setSelectedMentors] = useState<string[]>(["gemini", "claude", "deepseek", "perplexity"]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const startedRef = useRef(false);

  // Weighted modal
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    gemini: 0.25, claude: 0.25, deepseek: 0.25, perplexity: 0.25,
  });

  // Critique
  const [critLoading, setCritLoading] = useState(false);
  const [critique, setCritique] = useState<CritiqueResp | null>(null);

  // OAA Console
  const [oaaHealth, setOaaHealth] = useState<any>(null);
  const [oaaKeys, setOaaKeys] = useState<any>(null);
  const [verifyOut, setVerifyOut] = useState<any>(null);
  const [oaaErr, setOaaErr] = useState<string>('');

  /* Auto-start */
  useEffect(() => {
    if (!handle || startedRef.current) return;
    (async () => {
      try {
        setStarting(true);
        // Simulate session start for demo purposes
        const mockSession = { session_id: `session_${Date.now()}`, mentors: selectedMentors, started_at: new Date().toISOString() };
        setUserId(handle); setSessionId(mockSession.session_id); startedRef.current = true;
        // Mock balance for demo
        setBalance({ wallet: `wallet_${handle}`, balance: 100, last_tx_id: null });
      } catch (e: any) { setError(e.message ?? String(e)); }
      finally { setStarting(false); }
    })();
  }, [handle]); // eslint-disable-line

  /* OAA Console initialization */
  useEffect(() => {
    (async () => {
      try {
        setOaaHealth(await oaa.health());
        setOaaKeys(await oaa.keys());
      } catch (e: any) { setOaaErr(e.message); }
    })();
  }, []);

  const canSubmit = useMemo(() => !!sessionId && !!userId && prompt.trim() && answer.trim(), [sessionId, userId, prompt, answer]);

  async function onSubmit() {
    try {
      setSubmitting(true); setError(null);
      // Mock submission for demo purposes
      const mockRes: SubmitResp = {
        attestation_id: `attest_${Date.now()}`,
        xp_awarded: Math.floor(Math.random() * 50) + 10,
        level_before: 1,
        level_after: 2,
        reward_tx_id: `tx_${Date.now()}`,
        balance_after: 150
      };
      setLastSubmit(mockRes);
      setBalance(prev => prev ? { ...prev, balance: mockRes.balance_after || prev.balance } : null);
    } catch (e: any) { setError(e.message ?? String(e)); }
    finally { setSubmitting(false); }
  }

  async function getDrafts() {
    if (!sessionId || !prompt.trim()) return;
    try {
      setGettingDrafts(true); setError(null);
      // Mock drafts for demo purposes
      const mockDrafts: Drafts = {
        gemini: "This is a mock response from Gemini about the topic.",
        claude: "Here's Claude's perspective on the subject matter.",
        deepseek: "DeepSeek provides this analysis of the question.",
        perplexity: "Perplexity offers this comprehensive answer."
      };
      setDrafts(mockDrafts);
      const keys = Object.keys(mockDrafts);
      setChecked(Object.fromEntries(keys.map((k) => [k, true])));
    } catch (e: any) { setError(e.message ?? String(e)); }
    finally { setGettingDrafts(false); }
  }

  function insertDraft(text: string) {
    setAnswer((cur) => (cur ? cur + "\n\n---\n" + text : text));
  }
  function toggleMentor(m: string) {
    setSelectedMentors((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }
  function toggleChecked(m: string) {
    setChecked((c) => ({ ...c, [m]: !c[m] }));
  }
  function onCombineSimple() {
    const chosen = Object.entries(checked).filter(([_, v]) => v).map(([k]) => k);
    if (chosen.length === 0) return;
    // simple equal-weight merge using the previous function (kept from prior version)
    const equal = Object.fromEntries(chosen.map((m) => [m, 1]));
    const combo = synthesizeWeighted(Object.fromEntries(chosen.map((m) => [m, drafts[m]])), equal);
    insertDraft(combo);
  }
  function onCombineWeighted() {
    setShowWeights(true);
  }
  function applyWeights() {
    const active = Object.keys(drafts).filter((m) => (weights[m] ?? 0) > 0);
    if (active.length === 0) return setShowWeights(false);
    const selectedDrafts: Drafts = {};
    active.forEach((m) => { selectedDrafts[m] = drafts[m]; });
    const combo = synthesizeWeighted(selectedDrafts, weights);
    insertDraft(combo);
    setShowWeights(false);
  }

  async function runCritique() {
    if (!sessionId || !answer.trim()) return;
    try {
      setCritLoading(true); setError(null);
      // Mock critique for demo purposes
      const mockCritique: CritiqueResp = {
        rubric: {
          accuracy: 4,
          depth: 3,
          originality: 4,
          integrity: 5
        },
        critique: "This is a mock critique of your answer. The response shows good understanding of the topic with accurate information and demonstrates integrity in the approach."
      };
      setCritique(mockCritique);
    } catch (e: any) { setError(e.message ?? String(e)); }
    finally { setCritLoading(false); }
  }

  const runOaaVerify = async () => {
    try {
      const demo = { statement:"hello", sig:"", pub:"", ts:new Date().toISOString() }; // replace with a real sample
      setVerifyOut(await oaa.verify(demo));
    } catch (e: any) { setOaaErr(e.message); }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px", lineHeight: 1.5 }}>
      <h1>Lab7 — Online Apprenticeship Agent</h1>
      <p style={{ marginTop: 4, opacity: 0.85 }}>
        <em>&ldquo;Initializing Lab7-proof (OAA) — Mentor–Apprentice Integrity Framework.&rdquo;</em>
      </p>

      {/* OAA Console */}
      <section style={card}>
        <h3 style={h3}>🧠 OAA Console</h3>
        {oaaErr && <div style={{ color: "#b00020", marginBottom: 12 }}>OAA Error: {oaaErr}</div>}
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={infoBox}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Health</h4>
            <pre style={pre}>{JSON.stringify(oaaHealth, null, 2)}</pre>
          </div>
          <div style={infoBox}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Current Public Keys</h4>
            <pre style={pre}>{JSON.stringify(oaaKeys, null, 2)}</pre>
          </div>
        </div>
        
        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Verify (sample)</h4>
          <button style={miniButton} onClick={runOaaVerify}>Run verify</button>
          {verifyOut && (
            <pre style={{ ...pre, marginTop: 8 }}>{JSON.stringify(verifyOut, null, 2)}</pre>
          )}
        </div>
      </section>

      {/* User */}
      <section style={card}>
        <h3 style={h3}>1) User</h3>
        <div style={row}>
          <label style={label}>Handle</label>
          <input
            style={input}
            value={handle}
            onChange={(e) => {
              startedRef.current = false;
              setHandle(e.target.value);
              setSessionId(null); setLastSubmit(null); setBalance(null);
              setDrafts({}); setChecked({}); setCritique(null);
            }}
            placeholder="your-handle"
          />
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
          {starting ? "Starting session..." : sessionId ? `Session: ${sessionId}` : "No session yet"}
        </div>
      </section>

      {/* Task + Drafts */}
      <section style={card}>
        <h3 style={h3}>2) Task</h3>
        <div style={row}>
          <label style={label}>Prompt</label>
          <textarea style={textarea} rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>

        <div style={{ ...row, marginTop: 4 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Mentors</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["gemini", "claude", "deepseek", "perplexity"].map((m) => (
              <label key={m} style={chip(selectedMentors.includes(m))}>
                <input type="checkbox" checked={selectedMentors.includes(m)} onChange={() => toggleMentor(m)} style={{ marginRight: 6 }} />
                {m}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={secondaryButton} disabled={!sessionId || gettingDrafts || selectedMentors.length === 0} onClick={getDrafts}>
              {gettingDrafts ? "Getting drafts…" : "Get Drafts"}
            </button>
            <button style={miniButton} disabled={Object.keys(drafts).length === 0} onClick={onCombineSimple}>
              Combine Selected → Answer
            </button>
            <button style={miniGhost} disabled={Object.keys(drafts).length === 0} onClick={onCombineWeighted}>
              Synthesize (weights)
            </button>
          </div>
        </div>

        {Object.keys(drafts).length > 0 && (
          <div style={{ ...infoBox, marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Drafts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(drafts).map(([mentor, text]) => (
                <div key={mentor} style={draftCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="checkbox" checked={!!checked[mentor]} onChange={() => toggleChecked(mentor)} />
                      <strong style={{ textTransform: "capitalize" }}>{mentor}</strong>
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={miniButton} onClick={() => insertDraft(text)}>Insert</button>
                    </div>
                  </div>
                  <pre style={pre}>{text}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={row}>
          <label style={label}>Your Answer</label>
          <textarea style={textarea} rows={10} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={button} disabled={!canSubmit || submitting} onClick={onSubmit}>
            {submitting ? "Submitting…" : "Submit for Rubric → XP → Attest → Reward"}
          </button>
          <button style={miniButton} disabled={!answer.trim() || critLoading} onClick={runCritique}>
            {critLoading ? "Critiquing…" : "Critique Answer"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: "#b00020", whiteSpace: "pre-wrap" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>

      {/* Critique Panel */}
      {critique && (
        <section style={card}>
          <h3 style={h3}>Critique & Rubric</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
            {(["accuracy","depth","originality","integrity"] as const).map((k) => (
              <div key={k} style={rubricPill}><strong style={{ textTransform: "capitalize" }}>{k}:</strong> {critique.rubric[k]} / 5</div>
            ))}
          </div>
          <pre style={pre}>{critique.critique}</pre>
        </section>
      )}

      {/* Results */}
      <section style={card}>
        <h3 style={h3}>3) Results</h3>
        {!lastSubmit ? (
          <div style={{ opacity: 0.7 }}>No submission yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={infoBox}>
              <div style={infoRow}><span>XP Awarded</span><strong>{lastSubmit.xp_awarded}</strong></div>
              <div style={infoRow}><span>Level</span><strong>{lastSubmit.level_before} → {lastSubmit.level_after}</strong></div>
              <div style={infoRow}><span>Attestation</span><code style={code}>{lastSubmit.attestation_id}</code></div>
            </div>
            <div style={infoBox}>
              <div style={infoRow}><span>Reward Tx</span><code style={code}>{lastSubmit.reward_tx_id ?? "—"}</code></div>
              <div style={infoRow}><span>Balance After</span><strong>{lastSubmit.balance_after ?? "—"}</strong></div>
            </div>
          </div>
        )}
      </section>

      {/* Wallet */}
      <section style={card}>
        <h3 style={h3}>4) Wallet</h3>
        {balance ? (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div><strong>Wallet:</strong> <code style={code}>{balance.wallet}</code></div>
            <div><strong>Balance:</strong> {balance.balance}</div>
          </div>
        ) : (<div style={{ opacity: 0.7 }}>No balance yet.</div>)}
      </section>

      {/* Weights Modal */}
      {showWeights && (
        <div style={modalBackdrop}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Synthesize (weights)</h3>
            <p style={{ marginTop: -6, opacity: 0.8 }}>Adjust mentor weights (sum doesn&apos;t need to be 1; we normalize internally).</p>
            {Object.keys(drafts).map((m) => (
              <div key={m} style={{ display: "grid", gridTemplateColumns: "100px 1fr 50px", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <div style={{ textTransform: "capitalize" }}>{m}</div>
                <input type="range" min={0} max={100} step={5}
                  value={(weights[m] ?? 0) * 100}
                  onChange={(e) => setWeights((w) => ({ ...w, [m]: Number(e.target.value) / 100 }))}
                />
                <div>{Math.round((weights[m] ?? 0) * 100)}%</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={button} onClick={applyWeights}>Apply</button>
              <button style={miniGhost} onClick={() => setShowWeights(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 32, opacity: 0.7, fontSize: 13 }}>
        Powered by OAA Orchestrator ↔ Rubric ↔ Citizen Shield ↔ GIC Indexer.
      </footer>
    </div>
  );
}

/* ---------- Styles ---------- */
const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16, background: "#fff" };
const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 };
const label: React.CSSProperties = { fontWeight: 600 };
const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 };
const textarea: React.CSSProperties = { ...input, minHeight: 120 };
const button: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "#fff", fontWeight: 600, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...button, background: "#ffffff", color: "#111827", borderColor: "#111827" };
const miniButton: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 };
const miniGhost: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#111827", cursor: "pointer", fontSize: 12 };
const h3: React.CSSProperties = { marginTop: 0, marginBottom: 12 };
const infoBox: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 };
const infoRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #eee" };
const code: React.CSSProperties = { background: "#f3f4f6", padding: "2px 6px", borderRadius: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 };
const draftCard: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, background: "#fafafa" };
const pre: React.CSSProperties = { whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 };
const rubricPill: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px", fontSize: 12, background: "#f8fafc" };
const modalBackdrop: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 };
const modal: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 18, width: "min(680px, 92vw)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const chip = (active: boolean): React.CSSProperties => ({ border: "1px solid #d1d5db", borderRadius: 999, padding: "6px 10px", background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", cursor: "pointer" });
