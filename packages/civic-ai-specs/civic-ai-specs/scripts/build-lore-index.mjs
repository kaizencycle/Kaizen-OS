#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LORE_DIR = path.join(__dirname, '..', 'lore');
const INDEX_DIR = path.join(LORE_DIR, 'indexes');
const OUTPUT_FILE = path.join(INDEX_DIR, 'lore-index.json');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function extractFrontmatter(content) {
  if (!content.startsWith('---')) {
    return {};
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    return {};
  }

  const frontmatter = content.substring(3, frontmatterEnd);
  const metadata = {};
  
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      metadata[key] = value;
    }
  }

  return metadata;
}

function extractMarkdownMetadata(filePath, content) {
  const metadata = extractFrontmatter(content);
  const lines = content.split('\n');
  
  // Extract title from first H1 heading
  let title = metadata.title || '';
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      break;
    }
  }

  // Extract description from first paragraph
  let description = metadata.description || '';
  if (!description) {
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
        description = line.trim();
        break;
      }
    }
  }

  // Extract tags from content
  const tags = new Set();
  if (metadata.tags) {
    metadata.tags.split(',').forEach(tag => tags.add(tag.trim()));
  }

  // Extract keywords from content
  const keywords = new Set();
  const keywordRegex = /\*\*([^*]+)\*\*/g;
  let match;
  while ((match = keywordRegex.exec(content)) !== null) {
    keywords.add(match[1].toLowerCase());
  }

  return {
    title,
    description,
    tags: Array.from(tags),
    keywords: Array.from(keywords),
    ...metadata
  };
}

function extractJSONMetadata(filePath, content) {
  try {
    const data = JSON.parse(content);
    return {
      title: data.content?.title || data.title || '',
      description: data.content?.description || data.description || '',
      tags: data.tags || [],
      keywords: data.content?.keywords || [],
      type: data.type || 'unknown',
      ...data
    };
  } catch (error) {
    log('red', `Error parsing JSON file ${filePath}: ${error.message}`);
    return {};
  }
}

function processFile(filePath) {
  const relativePath = path.relative(LORE_DIR, filePath);
  const ext = path.extname(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  let metadata = {
    file: relativePath,
    type: ext === '.md' ? 'markdown' : 'json',
    size: fs.statSync(filePath).size,
    modified: fs.statSync(filePath).mtime.toISOString()
  };

  if (ext === '.md') {
    metadata = { ...metadata, ...extractMarkdownMetadata(filePath, content) };
  } else if (ext === '.json') {
    metadata = { ...metadata, ...extractJSONMetadata(filePath, content) };
  }

  return metadata;
}

function scanDirectory(dirPath, category = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subItems = scanDirectory(fullPath, entry.name);
      items.push(...subItems);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
      const item = processFile(fullPath);
      item.category = category;
      items.push(item);
    }
  }

  return items;
}

function buildIndex(items) {
  const index = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_items: items.length,
      categories: [...new Set(items.map(item => item.category))],
      types: [...new Set(items.map(item => item.type))]
    },
    items: items,
    categories: {},
    tags: {},
    keywords: {}
  };

  // Group by categories
  for (const item of items) {
    if (!index.categories[item.category]) {
      index.categories[item.category] = [];
    }
    index.categories[item.category].push(item);
  }

  // Build tag index
  for (const item of items) {
    if (item.tags) {
      for (const tag of item.tags) {
        if (!index.tags[tag]) {
          index.tags[tag] = [];
        }
        index.tags[tag].push(item);
      }
    }
  }

  // Build keyword index
  for (const item of items) {
    if (item.keywords) {
      for (const keyword of item.keywords) {
        if (!index.keywords[keyword]) {
          index.keywords[keyword] = [];
        }
        index.keywords[keyword].push(item);
      }
    }
  }

  return index;
}

function generateSearchIndex(index) {
  const searchIndex = {
    metadata: {
      generated_at: new Date().toISOString(),
      version: '1.0.0'
    },
    searchable_items: []
  };

  for (const item of index.items) {
    const searchableItem = {
      id: item.id || item.file,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      tags: item.tags || [],
      keywords: item.keywords || [],
      file: item.file,
      search_text: [
        item.title,
        item.description,
        ...(item.tags || []),
        ...(item.keywords || [])
      ].join(' ').toLowerCase()
    };

    searchIndex.searchable_items.push(searchableItem);
  }

  return searchIndex;
}

function main() {
  log('blue', 'Building lore index...\n');

  if (!fs.existsSync(LORE_DIR)) {
    log('red', `Lore directory not found: ${LORE_DIR}`);
    process.exit(1);
  }

  // Ensure index directory exists
  if (!fs.existsSync(INDEX_DIR)) {
    fs.mkdirSync(INDEX_DIR, { recursive: true });
  }

  try {
    // Scan all lore files
    const items = scanDirectory(LORE_DIR);
    log('green', `Found ${items.length} lore items`);

    // Build main index
    const index = buildIndex(items);
    
    // Write main index
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    log('green', `Main index written to: ${path.relative(process.cwd(), OUTPUT_FILE)}`);

    // Generate search index
    const searchIndex = generateSearchIndex(index);
    const searchIndexFile = path.join(INDEX_DIR, 'search-index.json');
    fs.writeFileSync(searchIndexFile, JSON.stringify(searchIndex, null, 2));
    log('green', `Search index written to: ${path.relative(process.cwd(), searchIndexFile)}`);

    // Generate category-specific indexes
    for (const [category, categoryItems] of Object.entries(index.categories)) {
      const categoryFile = path.join(INDEX_DIR, `${category}-index.json`);
      const categoryIndex = {
        metadata: {
          category,
          generated_at: new Date().toISOString(),
          total_items: categoryItems.length
        },
        items: categoryItems
      };
      fs.writeFileSync(categoryFile, JSON.stringify(categoryIndex, null, 2));
      log('green', `${category} index written to: ${path.relative(process.cwd(), categoryFile)}`);
    }

    // Generate tag index
    const tagIndexFile = path.join(INDEX_DIR, 'tags-index.json');
    fs.writeFileSync(tagIndexFile, JSON.stringify(index.tags, null, 2));
    log('green', `Tag index written to: ${path.relative(process.cwd(), tagIndexFile)}`);

    log('green', '\nLore index build completed successfully!');
    log('blue', `Total items: ${index.metadata.total_items}`);
    log('blue', `Categories: ${index.metadata.categories.join(', ')}`);
    log('blue', `Types: ${index.metadata.types.join(', ')}`);

  } catch (error) {
    log('red', `Error building lore index: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}