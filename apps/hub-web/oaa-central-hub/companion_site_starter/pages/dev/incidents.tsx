import { useEffect, useState } from "react";
import DevBanner from "../../components/DevBanner";
import SentinelBadge from "../../components/SentinelBadge";

export default function DevReports() {
  const [md, setMd] = useState<string>("Loading…");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/dev/incidents", { cache: "no-store" });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "failed");
        setMd(j.md || "");
      } catch (e: any) {
        setErr(e?.message || "load_failed");
      }
    })();
  }, []);

  return (
    <>
      <DevBanner />
      <main style={{ maxWidth: 980, margin: "36px auto", padding: "0 20px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Operational Reports</h1>
          <div style={{ marginLeft: "auto" }}><SentinelBadge /></div>
        </header>

        <p style={{ opacity: 0.85, marginTop: 4 }}>
          This page shows the generated weekly digest from <code>docs/ops/INCIDENTS.md</code>.
        </p>

        {err ? (
          <p style={{ color: "#ff6a6a" }}>Error: {err}</p>
        ) : (
          <article
            dangerouslySetInnerHTML={{ __html: miniMarkdown(md) }}
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid #1b2440",
              borderRadius: 12,
              background: "#0b1020",
              color: "#cfe0ff",
              lineHeight: 1.6,
            }}
          />
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => location.reload()}>Refresh</button>
          <a href="/api/dev/incidents" target="_blank" rel="noreferrer">Open raw JSON</a>
        </div>
      </main>
    </>
  );
}

/**
 * A tiny, zero-dep Markdown-to-HTML helper (good enough for headings, code, links, tables).
 * For production docs, swap to a full renderer (remark/marked) – but this keeps deps minimal.
 */
function miniMarkdown(src: string): string {
  // Escape HTML
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));

  // Code fences
  let out = src.replace(/```([a-z]+)?\n([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre style="background:#0a0f1f;border:1px solid #1b2440;border-radius:8px;padding:12px;overflow:auto"><code>${esc(code)}</code></pre>`
  );

  // Headings
  out = out
    .replace(/^###### (.*)$/gm, `<h6>$1</h6>`)
    .replace(/^##### (.*)$/gm, `<h5>$1</h5>`)
    .replace(/^#### (.*)$/gm, `<h4>$1</h4>`)
    .replace(/^### (.*)$/gm, `<h3>$1</h3>`)
    .replace(/^## (.*)$/gm, `<h2>$1</h2>`)
    .replace(/^# (.*)$/gm, `<h1>$1</h1>`);

  // Bold/italic
  out = out.replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`).replace(/\*(.+?)\*/g, `<em>$1</em>`);

  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);

  // Inline code
  out = out.replace(/`([^`]+)`/g, `<code style="background:#0a0f1f;padding:2px 4px;border:1px solid #1b2440;border-radius:4px">$1</code>`);

  // Tables (very naive)
  if (/\|/.test(out)) {
    out = out.replace(/(^\|.+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|.*\|\r?\n)+)/gm, (block) => {
      const lines = block.trim().split(/\r?\n/);
      const header = lines[0]
        .slice(1, -1)
        .split("|")
        .map((s) => s.trim());
      const rows = lines.slice(2).map((ln) =>
        ln
          .slice(1, -1)
          .split("|")
          .map((s) => s.trim())
      );
      const th = header.map((h) => `<th style="border-bottom:1px solid #1b2440;padding:6px 8px;text-align:left">${h}</th>`).join("");
      const trs = rows
        .map(
          (cols) =>
            `<tr>${cols.map((c) => `<td style="border-bottom:1px solid #1b2440;padding:6px 8px">${c}</td>`).join("")}</tr>`
        )
        .join("");
      return `<table style="border-collapse:collapse;width:100%;margin:8px 0">${`<thead><tr>${th}</tr></thead><tbody>${trs}</tbody>`}</table>`;
    });
  }

  // Paragraphs (simple)
  out = out
    .split(/\n{2,}/)
    .map((blk) => (blk.match(/^<h\d|^<pre|^<table/) ? blk : `<p>${blk.replace(/\n/g, "<br/>")}</p>`))
    .join("\n");

  return out;
}
