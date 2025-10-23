#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LORE_DIR = path.join(__dirname, '..', 'lore');
const VALID_EXTENSIONS = ['.md', '.json'];
const REQUIRED_FIELDS = {
  'factions': ['name', 'description', 'values', 'traditions'],
  'places': ['name', 'description', 'location', 'significance'],
  'relics': ['name', 'description', 'origin', 'powers'],
  'quests': ['title', 'description', 'objectives', 'rewards']
};

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

function validateMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // Check for required frontmatter
  if (!content.startsWith('---')) {
    errors.push('Missing frontmatter (YAML header)');
  } else {
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      errors.push('Incomplete frontmatter');
    } else {
      const frontmatter = content.substring(3, frontmatterEnd);
      const lines = frontmatter.split('\n');
      
      // Check for required fields based on file type
      const fileType = path.basename(path.dirname(filePath));
      if (REQUIRED_FIELDS[fileType]) {
        for (const field of REQUIRED_FIELDS[fileType]) {
          if (!frontmatter.includes(`${field}:`)) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }
    }
  }

  // Check for proper heading structure
  const lines = content.split('\n');
  let hasH1 = false;
  let hasH2 = false;
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      hasH1 = true;
    } else if (line.startsWith('## ')) {
      hasH2 = true;
    }
  }

  if (!hasH1) {
    warnings.push('No H1 heading found');
  }
  if (!hasH2) {
    warnings.push('No H2 headings found');
  }

  // Check for proper citation format
  const citationRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const citations = content.match(citationRegex);
  if (citations && citations.length > 0) {
    for (const citation of citations) {
      const match = citation.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const url = match[2];
        if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
          warnings.push(`Suspicious citation format: ${citation}`);
        }
      }
    }
  }

  return { errors, warnings };
}

function validateJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  try {
    const data = JSON.parse(content);
    
    // Check for required fields
    if (!data.id) {
      errors.push('Missing required field: id');
    }
    if (!data.timestamp) {
      errors.push('Missing required field: timestamp');
    }
    if (!data.content) {
      errors.push('Missing required field: content');
    }

    // Validate timestamp format
    if (data.timestamp) {
      const timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    }

    // Check for proper structure
    if (data.content && typeof data.content === 'object') {
      if (!data.content.title) {
        warnings.push('Missing content title');
      }
      if (!data.content.description) {
        warnings.push('Missing content description');
      }
    }

  } catch (error) {
    errors.push(`Invalid JSON: ${error.message}`);
  }

  return { errors, warnings };
}

function validateFile(filePath) {
  const ext = path.extname(filePath);
  const relativePath = path.relative(LORE_DIR, filePath);
  
  log('blue', `Validating: ${relativePath}`);

  let result;
  if (ext === '.md') {
    result = validateMarkdown(filePath);
  } else if (ext === '.json') {
    result = validateJSON(filePath);
  } else {
    return { errors: [`Unsupported file type: ${ext}`], warnings: [] };
  }

  // Report errors
  for (const error of result.errors) {
    log('red', `  ERROR: ${error}`);
  }

  // Report warnings
  for (const warning of result.warnings) {
    log('yellow', `  WARNING: ${warning}`);
  }

  return result;
}

function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subResult = scanDirectory(fullPath);
      totalErrors += subResult.errors;
      totalWarnings += subResult.warnings;
      totalFiles += subResult.files;
    } else if (entry.isFile() && VALID_EXTENSIONS.includes(path.extname(entry.name))) {
      const result = validateFile(fullPath);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      totalFiles++;
    }
  }

  return { errors: totalErrors, warnings: totalWarnings, files: totalFiles };
}

function main() {
  log('blue', 'Starting lore validation...\n');

  if (!fs.existsSync(LORE_DIR)) {
    log('red', `Lore directory not found: ${LORE_DIR}`);
    process.exit(1);
  }

  const result = scanDirectory(LORE_DIR);

  log('blue', '\nValidation Summary:');
  log('green', `  Files processed: ${result.files}`);
  log('yellow', `  Warnings: ${result.warnings}`);
  log('red', `  Errors: ${result.errors}`);

  if (result.errors > 0) {
    log('red', '\nValidation failed with errors.');
    process.exit(1);
  } else if (result.warnings > 0) {
    log('yellow', '\nValidation completed with warnings.');
    process.exit(0);
  } else {
    log('green', '\nAll files passed validation.');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}