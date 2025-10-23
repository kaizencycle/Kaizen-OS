import fs from "fs"; import path from "path";

const root = path.join(process.cwd(), "capability-gate");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "gate.config.json"), "utf8"));
const runId = process.argv[2]; if (!runId) { console.error("usage: node stage_rollout.mjs <runId>"); process.exit(1); }

console.log(`[rollout] canary ${cfg.rollout.canary_percent}% for ${cfg.rollout.canary_hours}h then stages: ${cfg.rollout.stages.join("% → ")}%`);
console.log(`[rollout] kill switch route: ${cfg.rollout.kill_switch_route}`);
console.log(JSON.stringify({ ok: true, runId, plan: cfg.rollout }, null, 2));