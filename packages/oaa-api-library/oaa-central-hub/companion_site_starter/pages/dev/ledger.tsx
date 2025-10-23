import { useState } from "react";
import DevLayout from "../../components/DevLayout";

export default function DevLedger() {
  const [companion, setCompanion] = useState("jade");
  const [sha, setSha] = useState("");
  const [res, setRes] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function lookup() {
    setBusy(true); setErr(null); setRes(null);
    try {
      const r = await fetch(`/api/dev/ledger/proof?companion=${encodeURIComponent(companion)}&sha256=${encodeURIComponent(sha)}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "lookup_failed");
      setRes(j);
    } catch (e:any) {
      setErr(e?.message || "lookup_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DevLayout>
      <p>Paste a <code>companion</code> id and the content <code>sha256</code> hash to query the Civic Ledger.</p>

      <section style={{display: "grid", gap: 12, marginTop: 16}}>
        <input
          placeholder="companion (e.g., jade)"
          value={companion}
          onChange={(e)=>setCompanion(e.target.value.toLowerCase())}
          style={{padding: 10, border: "1px solid #1b2440", borderRadius: 8}}
        />
        <input
          placeholder="sha256 (0x...)"
          value={sha}
          onChange={(e)=>setSha(e.target.value)}
          style={{padding: 10, border: "1px solid #1b2440", borderRadius: 8}}
        />
        <div style={{display:"flex", gap: 8}}>
          <button onClick={lookup} disabled={busy} style={{padding:"10px 14px"}}>{busy ? "Checking..." : "Verify Proof"}</button>
        </div>
      </section>

      {err && <p style={{color:"#ff6a6a", marginTop:12}}>Error: {err}</p>}
      {res && (
        <section style={{marginTop: 16}}>
          <h3>Result</h3>
          <pre style={{padding:12, background:"#0b1020", border:"1px solid #1b2440", borderRadius:8}}>
{JSON.stringify(res, null, 2)}
          </pre>
          <p>
            {res.proof
              ? <span>✅ <b>Proof found</b> — {String(res.proof).slice(0, 12)}…</span>
              : <span>⚠️ <b>No proof</b> recorded for this hash.</span>}
          </p>
        </section>
      )}

      <hr style={{margin:"28px 0"}} />

      <details>
        <summary>Need a hash? (local helper)</summary>
        <HashHelper onHash={(h)=>setSha(h)} />
      </details>
    </DevLayout>
  );
}

function HashHelper({ onHash }:{ onHash: (h:string)=>void }) {
  const [text, setText] = useState("");
  const [h, setH] = useState("");

  async function doHash() {
    const r = await fetch("/api/dev/ledger/proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text })
    });
    const j = await r.json();
    if (j?.sha256) { setH(j.sha256); onHash(j.sha256); }
  }

  async function sealNow() {
    // crude title/slug defaults for demos
    const title = "Dev Seal";
    const slug  = "dev-seal";
    const companion = "jade";  // tweak as needed in demos
    const r = await fetch("/api/dev/ledger/seal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, slug, companion, sha256: h })
    });
    const j = await r.json();
    alert(j.ok ? `Sealed! proof=${String(j.proof).slice(0,12)}…` : `Seal failed: ${j.error}`);
  }

  return (
    <div style={{marginTop:12}}>
      <textarea placeholder="paste markdown or any text" value={text} onChange={e=>setText(e.target.value)}
        style={{width:"100%", minHeight:120, padding:10, border:"1px solid #1b2440", borderRadius:8}}/>
      <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
        <button onClick={doHash}>Compute sha256</button>
        {h && <code style={{whiteSpace:"nowrap"}}>{h.slice(0,26)}…</code>}
        <button onClick={sealNow} disabled={!h}>Seal to Ledger</button>
      </div>
      <p style={{marginTop:8, opacity:0.8, fontSize:13}}>
        Uses <code>/api/dev/ledger/seal</code> → <code>{process.env.NEXT_PUBLIC_LEDGER_HINT || "LEDGER_BASE_URL"}</code>
      </p>
    </div>
  );
}