import fs from "fs";
import path from "path";

const root = process.cwd();
const cfg = JSON.parse(fs.readFileSync(path.join(root, "ai-seo-engine", "seo.config.json"), "utf8"));
const feedPath = path.join(root, cfg.publish.outputPath);
const outDir = path.join(root, cfg.publish.beaconsDir);

function safe(fn){ try { fn(); } catch {} }

function main(){
  if (!fs.existsSync(feedPath)) {
    console.error("Feed not found:", feedPath);
    process.exit(0);
  }
  const feed = JSON.parse(fs.readFileSync(feedPath, "utf8"));
  const items = Array.isArray(feed?.dataFeedElement) ? feed.dataFeedElement : [];
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const it of items) {
    const id = String(it.id || "").replace(/[^a-zA-Z0-9\-_:.]/g,"_").slice(-160) || `item_${count}`;
    const file = path.join(outDir, `${id}.jsonld`);
    safe(()=> fs.writeFileSync(file, JSON.stringify(it, null, 2)));
    count++;
  }
  console.log(`[beacons] wrote ${count} beacon files to ${cfg.publish.beaconsDir}`);
}
main();
