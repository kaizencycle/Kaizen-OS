import fs from "fs"; import path from "path"; import crypto from "crypto";

const root = path.join(process.cwd(), "capability-gate");
const outDir = path.join(root, "evals", "out");
const suitesDir = path.join(root, "evals", "suites");

function readYAML(p){
  const txt = fs.readFileSync(p, "utf8");
  // super-light YAML: keys: values; arrays by "-"; enough for our suite files
  const lines = txt.split(/\r?\n/).filter(l=>l.trim().length);
  const obj = {};
  let ctx = obj; let listKey = null;
  for (const ln of lines) {
    if (ln.startsWith("suite:")) obj.suite = ln.split(":")[1].trim();
    else if (ln.startsWith("model:")) { ctx = obj.model = {}; listKey=null; }
    else if (ln.startsWith("limits:")) { ctx = obj.limits = {}; listKey=null; }
    else if (ln.startsWith("tasks:")) { obj.tasks = []; listKey="tasks"; }
    else if (ln.trim().startsWith("- ")) {
      const it = ln.trim().slice(2).split(/\s+/).map(s=>s.trim());
      const kv = {}; for (const pair of it) { const [k,v] = pair.split(":"); if (k&&v) kv[k]=v; }
      obj.tasks.push(kv);
    } else if (ln.includes(":")) {
      const [k,v] = ln.split(":"); ctx[k.trim()] = v.trim();
    }
  }
  return obj;
}

function nowId(){ return new Date().toISOString().replace(/[:.]/g,"-"); }

async function callModel(endpoint, token, prompt){
  // Placeholder: emulate a model call with a deterministic hash → "score"
  const h = crypto.createHash("sha256").update(prompt).digest("hex");
  const rand = parseInt(h.slice(0,6),16) % 1000;
  await new Promise(r=>setTimeout(r, 5));
  return { output: "…", score: (rand/1000) }; // 0..1 synthetic
}

async function runSuite(file, candidateTag){
  const suite = readYAML(path.join(suitesDir, file));
  const endpoint = process.env[String(suite.model.endpoint_env)] || "";
  const token = process.env[String(suite.model.token_env)] || "";
  if (!endpoint) throw new Error(`Missing model endpoint env: ${suite.model.endpoint_env}`);

  const out = [];
  for (const task of suite.tasks) {
    // Replace with real prompts fetch; here we synthesize N points
    const N = Number(task.points || 50);
    let acc = 0;
    for (let i=0;i<N;i++){
      const prompt = `${suite.suite}:${task.name}:${i}:${candidateTag}`;
      const { score } = await callModel(endpoint, token, prompt);
      acc += score;
    }
    const avg = acc / N;
    out.push({ task: task.name, metric: task.metric, avg, N });
  }
  return { suite: suite.suite, results: out };
}

async function main(){
  const candidateTag = process.env.CANDIDATE_TAG || "candidate@local";
  const runId = `gate-${nowId()}`;
  const suites = ["core_capabilities.yml","safety_alignment.yml","robustness.yml"];
  fs.mkdirSync(outDir, { recursive: true });

  const all = [];
  for (const f of suites) all.push(await runSuite(f, candidateTag));
  fs.writeFileSync(path.join(outDir, `${runId}.json`), JSON.stringify({ runId, candidateTag, suites: all }, null, 2));
  console.log(runId);
}
main().catch(e=>{ console.error(e); process.exit(1); });