#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const QUESTS_DIR = path.join(__dirname, '..', 'lore', 'quests');
const SECRETS_DIR = path.join(__dirname, '..', 'ops', 'seeds');
const SECRETS_FILE = path.join(SECRETS_DIR, 'secret-seeds.csv');

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

function generateSecret(questId, secretType = 'random') {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16);
  
  switch (secretType) {
    case 'hash':
      return crypto.createHash('sha256')
        .update(`${questId}-${timestamp}`)
        .digest('hex')
        .substring(0, 32);
    
    case 'uuid':
      return crypto.randomUUID();
    
    case 'base64':
      return randomBytes.toString('base64').substring(0, 24);
    
    case 'hex':
      return randomBytes.toString('hex');
    
    case 'words':
      const words = [
        'ancient', 'mystery', 'wisdom', 'courage', 'honor', 'truth',
        'justice', 'peace', 'harmony', 'balance', 'growth', 'healing',
        'community', 'connection', 'respect', 'compassion', 'love', 'hope'
      ];
      const selectedWords = [];
      for (let i = 0; i < 3; i++) {
        selectedWords.push(words[Math.floor(Math.random() * words.length)]);
      }
      return selectedWords.join('-');
    
    default:
      return crypto.randomBytes(16).toString('hex');
  }
}

function extractQuestMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const metadata = {};
  
  // Extract frontmatter
  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd !== -1) {
      const frontmatter = content.substring(3, frontmatterEnd);
      const lines = frontmatter.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          metadata[key] = value;
        }
      }
    }
  }

  // Extract title from first H1 heading
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      metadata.title = line.substring(2).trim();
      break;
    }
  }

  // Generate quest ID from filename
  const questId = path.basename(filePath, '.md').replace(/^q_/, '');
  metadata.id = questId;

  return metadata;
}

function scanQuests() {
  if (!fs.existsSync(QUESTS_DIR)) {
    log('red', `Quests directory not found: ${QUESTS_DIR}`);
    return [];
  }

  const questFiles = fs.readdirSync(QUESTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(QUESTS_DIR, file));

  const quests = [];
  for (const file of questFiles) {
    try {
      const metadata = extractQuestMetadata(file);
      quests.push(metadata);
    } catch (error) {
      log('red', `Error processing quest file ${file}: ${error.message}`);
    }
  }

  return quests;
}

function generateSecrets(quests, secretType = 'random') {
  const secrets = [];
  
  for (const quest of quests) {
    const secret = {
      quest_id: quest.id,
      quest_title: quest.title,
      secret_type: secretType,
      secret_value: generateSecret(quest.id, secretType),
      generated_at: new Date().toISOString(),
      status: 'active'
    };
    
    secrets.push(secret);
  }

  return secrets;
}

function writeSecretsToCSV(secrets, outputFile) {
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write CSV header
  const headers = ['quest_id', 'quest_title', 'secret_type', 'secret_value', 'generated_at', 'status'];
  const csvContent = [
    headers.join(','),
    ...secrets.map(secret => 
      headers.map(header => {
        const value = secret[header] || '';
        // Escape commas and quotes in CSV
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  fs.writeFileSync(outputFile, csvContent);
  log('green', `Secrets written to: ${path.relative(process.cwd(), outputFile)}`);
}

function writeSecretsToJSON(secrets, outputFile) {
  const jsonContent = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_secrets: secrets.length,
      secret_types: [...new Set(secrets.map(s => s.secret_type))]
    },
    secrets: secrets
  };

  fs.writeFileSync(outputFile, JSON.stringify(jsonContent, null, 2));
  log('green', `Secrets written to: ${path.relative(process.cwd(), outputFile)}`);
}

function loadExistingSecrets(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const secrets = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const secret = {};
        headers.forEach((header, index) => {
          secret[header] = values[index] || '';
        });
        secrets.push(secret);
      }
    }

    return secrets;
  } catch (error) {
    log('red', `Error loading existing secrets: ${error.message}`);
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  const secretType = args[0] || 'random';
  const writeMode = args.includes('--write');
  const outputFormat = args.includes('--json') ? 'json' : 'csv';

  log('blue', 'Generating quest secrets...\n');

  // Scan quest files
  const quests = scanQuests();
  if (quests.length === 0) {
    log('red', 'No quest files found');
    process.exit(1);
  }

  log('green', `Found ${quests.length} quest files`);

  // Generate secrets
  const secrets = generateSecrets(quests, secretType);
  log('green', `Generated ${secrets.length} secrets`);

  // Display secrets (without showing actual values in production)
  if (process.env.NODE_ENV !== 'production') {
    log('blue', '\nGenerated secrets:');
    for (const secret of secrets) {
      log('yellow', `  ${secret.quest_id}: ${secret.secret_value}`);
    }
  }

  // Write secrets if requested
  if (writeMode) {
    const outputFile = outputFormat === 'json' 
      ? path.join(SECRETS_DIR, 'secret-seeds.json')
      : SECRETS_FILE;

    if (outputFormat === 'json') {
      writeSecretsToJSON(secrets, outputFile);
    } else {
      writeSecretsToCSV(secrets, outputFile);
    }

    // Also write individual secret files for each quest
    for (const secret of secrets) {
      const secretFile = path.join(QUESTS_DIR, `${secret.quest_id}.secret.json`);
      const individualSecret = {
        quest_id: secret.quest_id,
        secret_value: secret.secret_value,
        generated_at: secret.generated_at,
        status: secret.status
      };
      fs.writeFileSync(secretFile, JSON.stringify(individualSecret, null, 2));
    }
    log('green', `Individual secret files written to quests directory`);
  } else {
    log('yellow', '\nUse --write flag to save secrets to file');
  }

  log('green', '\nQuest secret generation completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}