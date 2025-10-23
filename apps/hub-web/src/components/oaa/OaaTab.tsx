// components/OaaTab.tsx
import { useState } from "react";

type Card = { title?: string; author?: string; updated_at?: string; note?: string };

export default function OaaTab() {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const p = await fetch("/api/oaa/plan", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({})}).then(r=>r.json());
      const tool = p?.plan?.tool || "webDataScout";
      const args = { url: "https://status.render.com", fields: [{ name: "title", required: true }] };
      const out = await fetch("/api/oaa/act", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ tool, args })}).then(r=>r.json());
      if (!out.ok) throw new Error(out.error || "unknown_error");
      setCard({ title: out?.data?.title || "OK", note: "Live from OAA hub" });
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: 16 }}>
      <h2>OAA Central Hub</h2>
      <p className="sub">Plan • Act • Learn • Seal</p>
      <button onClick={run} disabled={loading}>{loading ? "Running..." : "Fetch Live Example"}</button>
      {error && <pre style={{ color: "crimson" }}>Error: {error}</pre>}
      {card && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          <strong>{card.title}</strong>
          {card.note && <div style={{ color: "#666" }}>{card.note}</div>}
        </div>
      )}
    </section>
  );
}
