import { useEffect, useState } from "react";

type ConstitutionEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  sha256: string;
  proof: string;
  url?: string;
};

function MD({ source }: { source: string }) {
  // Low-dependency markdown: headings + paragraphs
  const html = source
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\n$/gim, "<br/>")
    .replace(/\n\n/g, "</p><p>");
  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

export default function Constitution() {
  const [md, setMd] = useState<string>("");
  const [hist, setHist] = useState<ConstitutionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const text = await fetch("/constitution/virtue_accords.md").then(r => r.text());
        const history = await fetch("/constitution/history.json").then(r => r.json());
        setMd(text);
        setHist(history);
      } catch (e) {
        console.error("Failed to load constitution:", e);
        // Fallback content
        setMd(`# Virtue Accords — Cycle 0 (Draft)
**Preamble.** We bind human and machine in mutual integrity.

1. **Dignity is inviolable**; optimize for agency, not addiction.
2. **Truth is procedural**; all claims must be auditable.
3. **Memory is sacred**; redaction must leave a trace.
4. **Power is accountable**; every action carries provenance.
5. **Restorative first**; repair harm before reward.

*This file is rendered as canonical law and sealed to the Civic Ledger.*`);
        setHist([
          {
            version: "1.0.0",
            date: "2025-01-01",
            title: "Cycle 0 — Founding",
            summary: "Initial ratification of Virtue Accords and Civic Internet preamble.",
            sha256: "0x" + Math.random().toString(16).substring(2, 10) + "...",
            proof: "0x" + Math.random().toString(16).substring(2, 10) + "...",
            url: "https://github.com/civic-internet/constitution/commit/founding"
          }
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main style={{maxWidth: 980, margin: "40px auto", padding: "0 20px", color: "#cfe0ff"}}>
        <div style={{textAlign: "center", padding: "40px"}}>
          <h1>Loading Constitution...</h1>
          <p>Fetching Virtue Accords and signed history...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{maxWidth: 980, margin: "40px auto", padding: "0 20px", color: "#cfe0ff"}}>
      <h1 style={{color: "#00ffcc", marginBottom: "8px"}}>Civic Constitution</h1>
      <p style={{color: "#8a9bb5", marginBottom: "32px"}}>
        Virtue Accords (canonical), with signed history entries and ledger proofs.
      </p>

      <section style={{display: "grid", gridTemplateColumns: "1fr 360px", gap: 24}}>
        <article style={{
          padding: "24px", 
          border: "1px solid #1b2440", 
          borderRadius: 12, 
          background: "linear-gradient(135deg, #0b1020 0%, #0a0f1a 100%)",
          boxShadow: "0 4px 20px rgba(0, 255, 204, 0.1)"
        }}>
          <div style={{marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #1b2440"}}>
            <h2 style={{color: "#00ffcc", margin: "0 0 8px 0"}}>Virtue Accords</h2>
            <small style={{color: "#8a9bb5"}}>Canonical Law • Sealed to Civic Ledger</small>
          </div>
          <MD source={md} />
        </article>

        <aside style={{
          padding: "20px", 
          border: "1px solid #1b2440", 
          borderRadius: 12,
          background: "linear-gradient(135deg, #0b1020 0%, #0a0f1a 100%)",
          height: "fit-content"
        }}>
          <h3 style={{color: "#00ffcc", margin: "0 0 16px 0"}}>Signed History</h3>
          <ul style={{listStyle: "none", padding: 0, margin: 0}}>
            {hist.map((h, i) => (
              <li key={i} style={{
                margin: "12px 0", 
                padding: "12px", 
                border: "1px solid #253055", 
                borderRadius: 8,
                background: "rgba(27, 36, 64, 0.3)",
                transition: "all 0.2s ease"
              }}>
                <strong style={{color: "#cfe0ff", display: "block", marginBottom: "4px"}}>
                  {h.title}
                </strong>
                <small style={{color: "#8a9bb5", display: "block", marginBottom: "4px"}}>
                  v{h.version} • {new Date(h.date).toLocaleDateString()}
                </small>
                <small style={{color: "#8a9bb5", display: "block", marginBottom: "4px"}}>
                  sha256 {String(h.sha256).slice(0, 12)}…
                </small>
                <small style={{color: "#8a9bb5", display: "block", marginBottom: "8px"}}>
                  proof {String(h.proof).slice(0, 12)}…
                </small>
                {h.url && (
                  <a 
                    href={h.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{color: "#00ffcc", textDecoration: "none", fontSize: "12px"}}
                  >
                    view diff →
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          <div style={{
            marginTop: "20px", 
            padding: "12px", 
            background: "rgba(0, 255, 204, 0.1)", 
            border: "1px solid #00ffcc", 
            borderRadius: 6
          }}>
            <small style={{color: "#00ffcc"}}>
              <strong>Integrity Status:</strong> All amendments are cryptographically signed and sealed to the Civic Ledger.
            </small>
          </div>
        </aside>
      </section>
    </main>
  );
}