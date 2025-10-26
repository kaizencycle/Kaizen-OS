#!/usr/bin/env node
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const BROKER = process.env.BROKER_URL || "http://localhost:8080";
const CYCLE = process.env.CYCLE || "C-109";

function r(p: string){ return path.join(process.cwd(), p); }
function read(p: string){ return fs.existsSync(r(p)) ? fs.readFileSync(r(p), "utf8") : ""; }

(async () => {
  const body = {
    cycle: CYCLE,
    proposalRef: "/.civic/change.proposal.json",
    specRef: "/.civic/change.spec.md",
    testsRef: "/.civic/change.tests.json",
    goal: "Produce consensus patch plan with test cases",
    models: [{id:"oaa-llm-a"},{id:"oaa-llm-b"},{id:"oaa-llm-c"}]
  };

  // basic existence check
  ["./.civic/change.proposal.json","./.civic/change.spec.md","./.civic/change.tests.json"].forEach(p=>{
    if(!fs.existsSync(p)) { console.error(`Missing ${p}`); process.exit(1); }
  });

  // start
  const start = await fetch(`${BROKER}/v1/loop/start`, {
    method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify(body)
  });
  if (!start.ok) { console.error("broker start failed", await start.text()); process.exit(1); }
  const s = await start.json();
  const id = s.loopId; console.log("loopId:", id);

  // poll (bounded)
  let tries = 0;
  while (tries++ < 20) {
    await new Promise(r => setTimeout(r, 1500));
    const st = await fetch(`${BROKER}/v1/loop/${id}/status`).then(r=>r.json());
    console.log("status:", st.status, "step:", st.step, "score:", st.score);
    if (st.status !== "running") break;
  }

  // consensus
  const cons = await fetch(`${BROKER}/v1/loop/${id}/consensus`);
  if (!cons.ok) { console.error("no consensus yet"); process.exit(1); }
  const cj = await cons.json();

  // write artifacts back to repo
  const outSpec = r("./.civic/change.spec.md");
  const outTests = r("./.civic/change.tests.json");
  const outAtt = r("./.civic/attestation.json");

  if (cj?.consensus?.specDelta) fs.writeFileSync(outSpec, cj.consensus.specDelta);
  if (cj?.consensus?.testsDelta) fs.writeFileSync(outTests, JSON.stringify(cj.consensus.testsDelta, null, 2));
  fs.writeFileSync(outAtt, JSON.stringify({
    type: "DeliberationProof",
    cycle: CYCLE,
    attestRef: cj.attestRef || null,
    score: cj?.consensus?.score ?? 0,
    citations: cj?.consensus?.citations ?? []
  }, null, 2));

  console.log("Consensus artifacts written to .civic/. Done.");
})().catch(e => { console.error(e); process.exit(1); });
