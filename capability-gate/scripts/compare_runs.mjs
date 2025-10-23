import fs from "fs"; import path from "path";

const root = path.join(process.cwd(), "capability-gate");
const outDir = path.join(root, "evals", "out");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "gate.config.json"), "utf8"));

function decision(summary){
  const thr = cfg.eval_thresholds;
  let pass = true;
  for (const [k,v] of Object.entries(thr)) {
    const s = summary.scores[k] ?? 0;
    if (s < v.min_absolute) pass = false;
  }
  return { passes: pass, decision: pass ? "promote" : "reject" };
}

const runId = process.argv[2];
if (!runId) { console.error("usage: node compare_runs.mjs <runId>"); process.exit(1); }
const summary = JSON.parse(fs.readFileSync(path.join(outDir, `${runId}.summary.json`), "utf8"));
const dec = decision(summary);
const gate = { ...summary, ...dec, artifacts: { summary: `${runId}.summary.json` } };
fs.writeFileSync(path.join(outDir, `${runId}.gate.json`), JSON.stringify(gate, null, 2));
console.log(JSON.stringify(gate, null, 2));