import fs from "fs"; import path from "path";

const root = path.join(process.cwd(), "capability-gate");
const outDir = path.join(root, "evals", "out");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "gate.config.json"), "utf8"));

function summarize(runId){
  const j = JSON.parse(fs.readFileSync(path.join(outDir, `${runId}.json`), "utf8"));
  const scores = {};
  for (const suite of j.suites) {
    const mean = suite.results.reduce((a,b)=>a+b.avg,0)/suite.results.length;
    scores[suite.suite] = Number(mean.toFixed(4));
  }
  return { runId: j.runId, candidateTag: j.candidateTag, baselineTag: cfg.baseline_tag, scores };
}

const runId = process.argv[2];
if (!runId) { console.error("usage: node summarize_evals.mjs <runId>"); process.exit(1); }
const out = summarize(runId);
fs.writeFileSync(path.join(outDir, `${runId}.summary.json`), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));