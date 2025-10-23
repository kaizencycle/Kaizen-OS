#!/usr/bin/env node
/**
 * Best-effort snapshot for .copilot/suggestions.json
 * Tries, in order:
 * 1) Cursor/Copilot environment dump (if present)
 * 2) Fallback: stage diff as a "suggestion" (so CI has a baseline)
 */
import fs from "fs";
import { execSync } from "child_process";
import path from "path";

function sh(cmd){ try { return execSync(cmd, {stdio:["ignore","pipe","ignore"]}).toString(); } catch { return ""; } }
function writeJSON(p, obj){ fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }

const out = ".copilot/suggestions.json";
let suggestions = [];

// (1) If you have a local dump exported by your editor or agent, read it here.
// For example, if your agent writes .cursor/copilot.json:
try {
  if (fs.existsSync(".cursor/copilot.json")) {
    const j = JSON.parse(fs.readFileSync(".cursor/copilot.json","utf8"));
    if (Array.isArray(j?.suggestions)) suggestions = j.suggestions.map(s => ({ file: s.file || "", text: s.text || "" }));
  }
} catch {}

if (suggestions.length === 0) {
  // (2) Fallback: use staged diff as pseudo-suggestion
  const diff = sh("git diff --cached --unified=0 --no-color");
  if (diff.trim()) suggestions = [{ file: "(staged)", text: diff }];
}

// Ensure file exists
if (!fs.existsSync(".copilot")) fs.mkdirSync(".copilot");
writeJSON(out, { suggestions });
console.log(`copilot suggestions → ${out} (${suggestions.length})`);
