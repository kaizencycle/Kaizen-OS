import fs from "fs";
import path from "path";

const root = process.cwd();
const cfg = JSON.parse(fs.readFileSync(path.join(root, "ai-seo-engine", "seo.config.json"), "utf8"));
const base = process.env[cfg.baseUrlVar] || "http://localhost:3000";

async function fetchJSON(url){
  try {
    const r = await fetch(url, { headers: { "cache-control": "no-store" }});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch {
    return null;
  }
}

function norm(ts){
  try { return new Date(ts).toISOString(); } catch { return new Date().toISOString(); }
}

async function crawl(){
  const outDir = path.join(root, "ai-seo-engine", "out");
  fs.mkdirSync(outDir, { recursive: true });

  const pulses = await fetchJSON(base + cfg.sources.pulses);
  const ledger = await fetchJSON(base + cfg.sources.ledgerRecent);
  const memory = await fetchJSON(base + cfg.sources.memory);

  const items = [];

  // Pulses → CreativeWork
  if (pulses && pulses.ok) {
    const v = pulses || {};
    items.push({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      id: base + "/dev/reports#sentinel",
      url: base + "/dev/reports",
      name: "Sentinel Vitals",
      description: "Operational vitals and incident signals.",
      isAccessibleForFree: true,
      keywords: ["OAA","Sentinel","Vitals","Ops"],
      dateModified: norm(new Date().toISOString()),
      _raw: { pulses: v }
    });
  }

  // Ledger → Dataset per recent proof list
  if (ledger && ledger.ok && Array.isArray(ledger.items)) {
    for (const it of ledger.items.slice(0, cfg.maxItemsPerType)) {
      items.push({
        "@context": "https://schema.org",
        "@type": "Dataset",
        id: `${base}/ledger/${it.slug || it.sha || it.id}`,
        url: `${base}/ledger/${it.slug || it.sha || it.id}`,
        name: it.title || "Ledger Seal",
        description: "Civic Ledger attestation",
        isAccessibleForFree: true,
        keywords: ["OAA","Civic Ledger","GIC","Attestation"],
        dateModified: norm(it.ts || it.date || Date.now()),
        _raw: { ledger: it }
      });
    }
  }

  // Memory → SoftwareSourceCode or CreativeWork (use companion hint)
  if (memory && memory.ok && Array.isArray(memory.notes)) {
    for (const n of memory.notes.slice(0, cfg.maxItemsPerType)) {
      const type = String(n.type || "").includes("clockout") ? "CreativeWork" : "SoftwareSourceCode";
      items.push({
        "@context": "https://schema.org",
        "@type": type,
        id: `${base}/memory/${n.ts}`,
        url: base + "/dev/memory",
        name: n.type ? `Memory: ${n.type}` : "Memory Note",
        description: (n.digest || n.note || "").slice(0, 240),
        isAccessibleForFree: true,
        keywords: ["OAA","Memory","Eve","Cycle"],
        dateModified: norm(n.ts || Date.now()),
        _raw: { memory: n }
      });
    }
  }

  const out = { ok:true, count: items.length, items };
  fs.writeFileSync(path.join(outDir, "crawl.json"), JSON.stringify(out, null, 2));
  console.log(`[crawler] wrote ${out.count} items`);
}

crawl().catch(e=>{ console.error(e); process.exit(1); });