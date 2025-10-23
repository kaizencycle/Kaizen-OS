import fs from "fs";
import path from "path";

const root = process.cwd();
const cfg = JSON.parse(fs.readFileSync(path.join(root, "ai-seo-engine", "seo.config.json"), "utf8"));
const inPath = path.join(root, "ai-seo-engine", "out", "ranked.json");
const outFile = path.join(root, cfg.publish.outputPath);

function publish(){
  if (!fs.existsSync(inPath)) { console.error("ranked.json missing"); process.exit(1); }
  const ranked = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const doc = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "OAA Integrity Feed",
    "dateModified": new Date().toISOString(),
    "dataFeedElement": ranked.items
  };
  const dir = path.dirname(outFile);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(doc, null, 2));
  console.log(`[publisher] wrote ${cfg.publish.outputPath}`);
}

publish();