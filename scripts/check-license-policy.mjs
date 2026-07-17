#!/usr/bin/env node
/**
 * C-360 OPT-01 — Fail CI on non-ratified license strings in constitutional surfaces.
 * Policy: configs/license-policy.yaml
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const POLICY_PATH = path.join(ROOT, 'configs', 'license-policy.yaml');

function loadPolicy() {
  const text = fs.readFileSync(POLICY_PATH, 'utf8');
  const allowed = [];
  const forbidden = [];
  let section = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('allowed_license_markers:')) section = 'allowed';
    else if (line.startsWith('forbidden_project_licenses:')) section = 'forbidden';
    else if (line.startsWith('scan_paths:') || line.startsWith('exclude_')) section = null;
    else if (section === 'allowed' && line.trim().startsWith('- ')) {
      allowed.push(line.trim().slice(2).trim());
    } else if (section === 'forbidden' && line.trim().startsWith('- ')) {
      forbidden.push(line.trim().slice(2).trim());
    }
  }
  const scanPaths = [];
  let inScan = false;
  for (const line of text.split('\n')) {
    if (line.startsWith('scan_paths:')) inScan = true;
    else if (line.startsWith('exclude_')) inScan = false;
    else if (inScan && line.trim().startsWith('- ')) {
      scanPaths.push(line.trim().slice(2).trim());
    }
  }
  return { allowed, forbidden, scanPaths };
}

function readFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [abs];
  const out = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const p = path.join(abs, ent.name);
    if (ent.isDirectory()) out.push(...readFiles(path.relative(ROOT, p)));
    else if (/\.(md|yml|yaml)$/i.test(ent.name) || ent.name === 'LICENSE') out.push(p);
  }
  return out;
}

const { forbidden, scanPaths } = loadPolicy();
const files = scanPaths.flatMap(readFiles);
const violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (rel.includes('10-ARCHIVES') || rel.includes('/archive/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const bad of forbidden) {
    if (content.includes(bad)) {
      violations.push(`${rel}: forbidden project license marker "${bad}"`);
    }
  }
}

const license = fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8');
if (!license.includes('GNU Affero General Public License')) {
  violations.push('LICENSE: missing AGPL-3.0 text');
}

const mkdocs = fs.readFileSync(path.join(ROOT, 'mkdocs.yml'), 'utf8');
if (!mkdocs.includes('CC-BY-SA 4.0')) {
  violations.push('mkdocs.yml: handbook copyright must be CC-BY-SA 4.0');
}

const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
if (!readme.includes('configs/license-policy.yaml') && !readme.includes('license-policy.yaml')) {
  violations.push('README.md: must reference configs/license-policy.yaml');
}

if (violations.length) {
  console.error('❌ License policy violations:\n');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log(`✅ License policy OK (${files.length} files scanned).`);
