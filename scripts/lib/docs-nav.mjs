/**
 * Shared MkDocs nav helpers for Docs Guard (C-381).
 * Zero runtime dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';

const NAV_PATH_RE = /:\s+([\w./-]+\.md)\s*$/;

/**
 * @param {string} mkdocsYaml
 * @returns {{ title: string, path: string }[]}
 */
export function parseMkdocsNav(mkdocsYaml) {
  const lines = mkdocsYaml.split('\n');
  const entries = [];
  let inNav = false;
  let depth = 0;

  for (const line of lines) {
    if (/^nav:\s*$/.test(line)) {
      inNav = true;
      continue;
    }
    if (!inNav) continue;
    if (/^[a-zA-Z_][\w-]*:\s*/.test(line) && !line.startsWith(' ')) break;

    const itemMatch = line.match(/^\s+-\s+"([^"]+)":\s+(.+)$/);
    if (itemMatch) {
      const pathValue = itemMatch[2].trim();
      if (pathValue.endsWith('.md')) {
        entries.push({ title: itemMatch[1], path: pathValue });
      }
      continue;
    }

    const bareMatch = line.match(/^\s+-\s+([^:]+):\s+(.+)$/);
    if (bareMatch) {
      const pathValue = bareMatch[2].trim();
      if (pathValue.endsWith('.md')) {
        entries.push({ title: bareMatch[1].trim(), path: pathValue });
      }
    }
  }

  return entries;
}

/**
 * @param {string} root
 * @returns {string}
 */
export function readMkdocs(root) {
  return fs.readFileSync(path.join(root, 'mkdocs.yml'), 'utf8');
}

/**
 * @param {string} docsDir
 * @param {string[]} excludePrefixes
 * @returns {string[]}
 */
export function listMarkdownFiles(docsDir, excludePrefixes = []) {
  const results = [];

  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = path.relative(docsDir, full).replace(/\\/g, '/');
      if (excludePrefixes.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (name.endsWith('.md')) results.push(rel);
    }
  }

  walk(docsDir);
  return results.sort();
}

/**
 * @param {string} cycleId e.g. C-381
 * @returns {number}
 */
export function cycleNumber(cycleId) {
  const m = /^C-(\d+)$/.exec(cycleId);
  return m ? Number(m[1]) : 0;
}

/**
 * @param {string} journalsDir
 * @returns {{ cycle: string, file: string, num: number }[]}
 */
export function listJournalFiles(journalsDir) {
  if (!fs.existsSync(journalsDir)) return [];
  return fs
    .readdirSync(journalsDir)
    .filter((f) => /^C-\d+\.md$/.test(f))
    .map((f) => {
      const cycle = f.replace(/\.md$/, '');
      return { cycle, file: `journals/${f}`, num: cycleNumber(cycle) };
    })
    .sort((a, b) => b.num - a.num);
}

/**
 * @param {string} filePath
 * @returns {{ last_witnessed_cycle?: string, status?: string } | null}
 */
export function parseFrontMatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.startsWith('---\n')) return null;
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const block = raw.slice(4, end);
  const meta = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return meta;
}

/**
 * @param {string} mkdocsYaml
 * @param {string} startMarker
 * @param {string} endMarker
 * @param {string} replacement
 * @returns {string}
 */
export function replaceMarkedBlock(mkdocsYaml, startMarker, endMarker, replacement) {
  const start = mkdocsYaml.indexOf(startMarker);
  const end = mkdocsYaml.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found: ${startMarker} / ${endMarker}`);
  }
  const before = mkdocsYaml.slice(0, start + startMarker.length);
  const after = mkdocsYaml.slice(end);
  return `${before}\n${replacement}\n${after}`;
}
