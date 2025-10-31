#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.cache',
  '.vercel',
  '.idea',
  '.vscode',
  '.pnpm',
  '.yarn',
  '.venv',
  'venv',
  '__pycache__',
  '.mypy_cache',
  '.pytest_cache',
  '.ruff_cache',
  'coverage',
  'tmp',
  'logs'
]);

const ALLOWED_EXTENSIONS = new Set(['.md', '.mdx', '.markdown', '.txt']);

const documents = [];

function isReadme(filename) {
  return /^readme(\.|$)/i.test(filename);
}

function looksLikeDocument(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return true;
  }
  return isReadme(filename);
}

function decodeTitle(line) {
  return line.replace(/^#+\s*/, '').trim();
}

function extractTitleFromContent(content) {
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      return decodeTitle(line);
    }
    if (line.length > 0) {
      return line.slice(0, 120);
    }
  }
  return null;
}

function detectStatus(filename, content) {
  const normalizedName = filename.toLowerCase();
  if (normalizedName.includes('complete')) {
    return 'completed';
  }

  const snippet = content.slice(0, 4000).toLowerCase();
  if (snippet.includes('status: completed') || snippet.includes('status: complete') || snippet.includes('status: done')) {
    return 'completed';
  }

  return 'active';
}

async function walk(currentDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) continue;
    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(REPO_ROOT, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      await walk(fullPath);
    } else if (entry.isFile() && looksLikeDocument(entry.name)) {
      let content;
      try {
        content = await fs.readFile(fullPath, 'utf8');
      } catch (error) {
        console.warn(`⚠️ Could not read ${relativePath}:`, error.message);
        continue;
      }

      const title = extractTitleFromContent(content);
      const status = detectStatus(entry.name, content);

      documents.push({
        path: relativePath.replace(/\\/g, '/'),
        name: entry.name,
        title: title || null,
        category: isReadme(entry.name) ? 'readme' : 'doc',
        status,
        size: Buffer.byteLength(content, 'utf8')
      });
    }
  }
}

async function main() {
  await walk(REPO_ROOT);

  documents.sort((a, b) => a.path.localeCompare(b.path));

  const generatedAt = new Date().toISOString();
  const completedCount = documents.filter((doc) => doc.status === 'completed').length;

  const jsonOutput = {
    generatedAt,
    total: documents.length,
    completed: completedCount,
    documents
  };

  const jsonFile = path.join(DOCS_DIR, 'document-index.json');
  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.writeFile(jsonFile, JSON.stringify(jsonOutput, null, 2) + '\n', 'utf8');

  const grouped = new Map();
  for (const doc of documents) {
    const segments = doc.path.split('/');
    const group = segments.length > 1 ? segments[0] : '.';
    if (!grouped.has(group)) {
      grouped.set(group, []);
    }
    grouped.get(group).push(doc);
  }

  const groupsSorted = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let markdown = '# Kaizen OS Document Registry\n\n';
  markdown += `Generated: ${generatedAt}\n\n`;
  markdown += `Total documents: ${documents.length}\n\n`;
  markdown += `Completed documents: ${completedCount}\n\n`;
  markdown += '---\n\n';

  for (const [group, docs] of groupsSorted) {
    markdown += `## ${group === '.' ? 'Repository Root' : group}\n\n`;
    for (const doc of docs) {
      const absoluteDocPath = path.join(REPO_ROOT, doc.path);
      const relativeFromDocs = path.relative(DOCS_DIR, absoluteDocPath).replace(/\\/g, '/');
      const displayTitle = doc.title || doc.name;
      const statusBadge = doc.status === 'completed' ? ' ✅ Completed' : '';
      markdown += `- [${displayTitle}](${encodeURI(relativeFromDocs)}) — ${doc.category}${statusBadge}\n`;
    }
    markdown += '\n';
  }

  const markdownFile = path.join(DOCS_DIR, 'DOCUMENT_REGISTRY.md');
  await fs.writeFile(markdownFile, markdown, 'utf8');

  console.log(`📚 Document index written to ${path.relative(REPO_ROOT, jsonFile)}`);
  console.log(`🗂️  Document registry written to ${path.relative(REPO_ROOT, markdownFile)}`);
  console.log(`   Total documents: ${documents.length} (completed: ${completedCount})`);
}

main().catch((error) => {
  console.error('Failed to generate document index:', error);
  process.exitCode = 1;
});

