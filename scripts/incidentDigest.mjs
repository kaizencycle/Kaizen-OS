/**
 * Weekly Incident Digest
 * - Pulls issues labeled: incident,sentinel (last 8 weeks)
 * - Groups by week (Mon–Sun), computes durations, peaks from embedded JSON snapshot
 * - Appends/updates docs/ops/INCIDENTS.md with a new weekly section
 *
 * Env:
 *   GITHUB_OWNER, GITHUB_REPO  (required)
 *   GITHUB_TOKEN               (GH Actions GITHUB_TOKEN or PAT with repo:read)
 *   WEEKS_BACK                 (optional, default 8)
 */

import fs from "fs";
import path from "path";

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const WEEKS = Number(process.env.WEEKS_BACK || 8);
if (!OWNER || !REPO || !TOKEN) {
  console.error("Missing GITHUB_OWNER/REPO/TOKEN");
  process.exit(1);
}

const API = "https://api.github.com";
const headers = {
  "User-Agent": "oaa-incident-digest",
  "Accept": "application/vnd.github+json",
  "Authorization": `Bearer ${TOKEN}`
};

function isoWeekStart(d=new Date()) {
  // Monday as start of week
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (date.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0,0,0,0);
  return date;
}
function fmt(d){ return new Date(d).toISOString().slice(0,19).replace("T"," "); }
function safeJson(txt){ try { return JSON.parse(String(txt||"{}")); } catch { return {}; } }

async function gh(path, params={}) {
  const url = new URL(`${API}${path}`);
  Object.entries(params).forEach(([k,v])=> url.searchParams.set(k,String(v)));
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

async function listIssues() {
  // We grab both open and recently closed incidents within the window
  const since = new Date(isoWeekStart()); since.setUTCDate(since.getUTCDate() - WEEKS*7);
  const out = [];
  let page = 1;
  while (true) {
    const batch = await gh(`/repos/${OWNER}/${REPO}/issues`, {
      state: "all", per_page: 100, page, labels: "incident,sentinel", since: since.toISOString()
    });
    out.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return out.filter(i => i.pull_request === undefined); // exclude PRs
}

function extractSnapshot(issue) {
  // Expect a fenced code block with JSON from our auto-incident workflow
  const body = issue.body || "";
  const m = body.match(/```json\s*([\s\S]+?)\s*```/);
  const json = m ? safeJson(m[1]) : {};
  const status = json.status || {};
  const vitals = json.vitals || {};
  const depth = Number(vitals.depth || 0);
  const failRate = Number(vitals.failRate || 0);
  return { depth, failRate, raw: { status, vitals } };
}

function groupByWeek(issues) {
  const map = new Map(); // key=YYYY-WW
  for (const i of issues) {
    const created = new Date(i.created_at);
    const start = isoWeekStart(created);
    const ww = `${start.toISOString().slice(0,10)}`;
    if (!map.has(ww)) map.set(ww, []);
    map.get(ww).push(i);
  }
  return [...map.entries()].sort(([a],[b]) => a.localeCompare(b)); // ascending
}

function durationHours(issue) {
  if (issue.state === "open") return null;
  const start = new Date(issue.created_at).getTime();
  const end = new Date(issue.closed_at || issue.updated_at || Date.now()).getTime();
  return Math.max(0, (end - start) / 3_600_000);
}

function summarize(issues) {
  const total = issues.length;
  const opened = issues.filter(i => i.state === "open").length;
  const closed = total - opened;
  let maxDepth = 0, maxFail = 0;
  const rows = issues.map(i => {
    const snap = extractSnapshot(i);
    maxDepth = Math.max(maxDepth, snap.depth);
    maxFail  = Math.max(maxFail,  snap.failRate);
    return {
      number: i.number,
      title: i.title,
      state: i.state,
      created: i.created_at,
      closed: i.closed_at || "",
      durationH: durationHours(i),
      depth: snap.depth,
      fail: snap.failRate
    };
  });
  const mttrH = (() => {
    const durs = rows.map(r => r.durationH).filter(v => v != null);
    if (!durs.length) return null;
    return durs.reduce((a,b)=>a+b,0)/durs.length;
  })();
  return { total, opened, closed, maxDepth, maxFail, mttrH, rows };
}

function sectionMarkdown(weekStart, report) {
  const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate()+6);
  const h = (n) => n==null ? "—" : (typeof n==="number" ? n.toFixed && n >= 1 ? n.toFixed(1) : String(n) : String(n));
  const title = `### Week of ${weekStart} → ${weekEnd.toISOString().slice(0,10)}`;
  const head =
`**Incidents:** ${report.total}  •  **Open:** ${report.opened}  •  **Closed:** ${report.closed}  
**Max Depth:** ${report.maxDepth}  •  **Max Fail%:** ${(report.maxFail*100).toFixed(1)}%  •  **MTTR:** ${report.mttrH==null?"—":report.mttrH.toFixed(1)+"h"}`;

  const tableHeader = `| # | Status | Created (UTC) | Closed (UTC) | Hours | Depth | Fail% | Title |
|---:|:------:|:-------------:|:------------:|------:|------:|------:|:------|
`;
  const lines = report.rows
    .sort((a,b)=>a.number-b.number)
    .map(r => `| ${r.number} | ${r.state} | ${fmt(r.created)} | ${r.closed?fmt(r.closed):"—"} | ${h(r.durationH)} | ${r.depth} | ${(r.fail*100).toFixed(1)} | ${r.title.replace(/\|/g,"\\|")} |`)
    .join("\n");
  return `${title}\n\n${head}\n\n${tableHeader}${lines}\n`;
}

async function main() {
  const issues = await listIssues();
  const grouped = groupByWeek(issues);
  const sections = [];
  for (const [weekStart, list] of grouped) {
    const summary = summarize(list);
    sections.push(sectionMarkdown(weekStart, summary));
  }

  const outPath = path.join("docs","ops","INCIDENTS.md");
  const prolog =
`# Operational Incidents — Weekly Digest

This file is maintained by the **Incident Digest** job.  
It summarizes incidents labeled \`incident\`, \`sentinel\`.

_Last update: ${fmt(new Date().toISOString())}Z_

`;

  const content = prolog + sections.reverse().join("\n---\n\n");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`Wrote ${outPath} with ${sections.length} section(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
