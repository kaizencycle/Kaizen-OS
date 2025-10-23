import fs from "fs";
import path from "path";

const root = process.cwd();
const cfg = JSON.parse(fs.readFileSync(path.join(root, "ai-seo-engine", "seo.config.json"), "utf8"));
const inPath = path.join(root, "ai-seo-engine", "out", "crawl.json");
const outPath = path.join(root, "ai-seo-engine", "out", "ranked.json");

function scoreFreshness(iso){
  const age = Math.max(0, Date.now() - new Date(iso).getTime());
  const days = age / (1000*60*60*24);
  // 1.0 if < 1 day; ~0.5 at 7d; decays thereafter
  return Math.max(0, Math.min(1, 1 - Math.log10(1 + days)/2));
}

function inferKind(x){
  if (x._raw?.ledger) return "ledger";
  if (x._raw?.pulses) return "pulse";
  return "memory";
}

function gicFrom(x){
  // Placeholder heuristic: ledger seals get higher base
  if (x._raw?.ledger) return 0.9;
  if (x._raw?.pulses) return 0.75;
  return 0.6;
}

function accordsFrom(x){
  // If Eve/TomorrowIntent present → nudge up (commitment).
  const txt = JSON.stringify(x._raw || "").toLowerCase();
  if (txt.includes("tomorrowintent")) return 0.9;
  if (txt.includes("wins")) return 0.85;
  return 0.7;
}

function rank(){
  if (!fs.existsSync(inPath)) { console.error("crawl.json missing"); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const w = cfg.weights;

  const ranked = data.items.map(x => {
    const fresh = scoreFreshness(x.dateModified);
    const gic = gicFrom(x);
    const acc = accordsFrom(x);
    const integrity = (w.gic * gic) + (w.accords * acc) + (w.freshness * fresh);
    return {
      ...x,
      oaa: {
        kind: inferKind(x),
        gicScore: Number(gic.toFixed(3)),
        accordsScore: Number(acc.toFixed(3)),
        freshnessScore: Number(fresh.toFixed(3)),
        integrityScore: Number(integrity.toFixed(3)),
        sha256: x._raw?.ledger?.sha || x._raw?.memory?.sha256 || undefined,
        cycle: x._raw?.memory?.cycle || undefined,
        companion: x._raw?.memory?.companion || undefined
      }
    };
  }).filter(y => y.oaa.integrityScore >= cfg.minIntegrity);

  // drop _raw
  for (const y of ranked) delete y._raw;

  const out = { ok:true, count: ranked.length, items: ranked.sort((a,b)=>b.oaa.integrityScore - a.oaa.integrityScore) };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`[ranker] kept ${out.count}/${data.count} items`);
}

rank();