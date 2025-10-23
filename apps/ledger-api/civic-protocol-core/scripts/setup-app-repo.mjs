#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const APP_NAME = process.argv[2];
const MIN_SCORE = process.argv[3] || '0.35';
const FAIL_ON_LOW = process.argv[4] || 'false';

if (!APP_NAME) {
  console.error('❌ Usage: node setup-app-repo.mjs <app-name> [min-score] [fail-on-low]');
  console.error('   Example: node setup-app-repo.mjs oaa-api-library 0.35 false');
  process.exit(1);
}

console.log(`🚀 Setting up Copilot verification for ${APP_NAME}...`);
console.log(`   Min score: ${MIN_SCORE}`);
console.log(`   Fail on low: ${FAIL_ON_LOW}`);

// Create necessary directories
const dirs = ['.github/workflows', 'scripts', '.copilot'];
dirs.forEach(dir => {
  try {
    mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } catch (error) {
    console.warn(`⚠️  Directory ${dir} may already exist`);
  }
});

// Copy verification script
const verificationScript = `#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configuration from environment
const BASE_REF = process.env.BASE_REF || 'HEAD~1';
const HEAD_REF = process.env.HEAD_REF || 'HEAD';
const MIN_SCORE = parseFloat(process.env.MIN_SCORE || '0.35');
const MIN_SCORE_FAIL = process.env.MIN_SCORE_FAIL === 'true';
const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL;
const LEDGER_ADMIN_TOKEN = process.env.LEDGER_ADMIN_TOKEN;
const PROOF_OUT = process.env.PROOF_OUT || '.copilot/proof.json';

console.log('🔍 Copilot Diff Verifier');
console.log(\`Base ref: \${BASE_REF}\`);
console.log(\`Head ref: \${HEAD_REF}\`);
console.log(\`Min score: \${MIN_SCORE}\`);
console.log(\`Fail on low: \${MIN_SCORE_FAIL}\`);

// Ensure .copilot directory exists
execSync('mkdir -p .copilot', { stdio: 'inherit' });

// Load suggestions if they exist
let suggestions = { suggestions: [] };
if (existsSync('.copilot/suggestions.json')) {
  try {
    suggestions = JSON.parse(readFileSync('.copilot/suggestions.json', 'utf8'));
    console.log(\`📝 Loaded \${suggestions.suggestions.length} suggestions\`);
  } catch (error) {
    console.warn('⚠️  Could not parse suggestions.json, using empty array');
  }
}

// Get the diff between base and head
let diff = '';
try {
  diff = execSync(\`git diff \${BASE_REF}..\${HEAD_REF}\`, { encoding: 'utf8' });
  console.log(\`📊 Diff size: \${diff.length} characters\`);
} catch (error) {
  console.error('❌ Failed to get git diff:', error.message);
  process.exit(1);
}

if (!diff.trim()) {
  console.log('ℹ️  No changes detected, skipping verification');
  const proof = {
    timestamp: new Date().toISOString(),
    base_ref: BASE_REF,
    head_ref: HEAD_REF,
    overlap_score: 1.0,
    suggestions_checked: 0,
    changes_detected: 0,
    status: 'no_changes',
    ledger_proof: null
  };
  
  writeFileSync(PROOF_OUT, JSON.stringify(proof, null, 2));
  console.log('✅ Proof written to', PROOF_OUT);
  process.exit(0);
}

// Calculate overlap score
let overlapScore = 0;
let suggestionsChecked = 0;
let changesDetected = 0;

if (suggestions.suggestions.length > 0) {
  // Simple overlap calculation based on common lines
  const diffLines = diff.split('\\n').filter(line => line.startsWith('+') || line.startsWith('-'));
  changesDetected = diffLines.length;
  
  for (const suggestion of suggestions.suggestions) {
    suggestionsChecked++;
    const suggestionLines = suggestion.text.split('\\n');
    
    // Check for overlap between suggestion and diff
    let matches = 0;
    for (const suggestionLine of suggestionLines) {
      const cleanSuggestionLine = suggestionLine.trim();
      if (cleanSuggestionLine.length < 3) continue; // Skip very short lines
      
      for (const diffLine of diffLines) {
        const cleanDiffLine = diffLine.substring(1).trim(); // Remove +/- prefix
        if (cleanDiffLine.includes(cleanSuggestionLine) || cleanSuggestionLine.includes(cleanDiffLine)) {
          matches++;
          break;
        }
      }
    }
    
    if (suggestionLines.length > 0) {
      overlapScore += matches / suggestionLines.length;
    }
  }
  
  if (suggestionsChecked > 0) {
    overlapScore = overlapScore / suggestionsChecked;
  }
} else {
  console.log('ℹ️  No suggestions to verify against');
  overlapScore = 0.5; // Default score when no suggestions available
}

console.log(\`📈 Overlap score: \${overlapScore.toFixed(3)} (\${suggestionsChecked} suggestions checked)\`);
console.log(\`📊 Changes detected: \${changesDetected}\`);

// Create proof object
const proof = {
  timestamp: new Date().toISOString(),
  base_ref: BASE_REF,
  head_ref: HEAD_REF,
  overlap_score: overlapScore,
  suggestions_checked: suggestionsChecked,
  changes_detected: changesDetected,
  status: overlapScore >= MIN_SCORE ? 'verified' : 'low_score',
  ledger_proof: null
};

// Seal to ledger if configured
if (LEDGER_BASE_URL && LEDGER_ADMIN_TOKEN) {
  try {
    console.log('🔐 Sealing proof to Civic Ledger...');
    
    const ledgerPayload = {
      type: 'copilot_verification',
      data: {
        repository: process.env.GITHUB_REPOSITORY || 'unknown',
        commit: HEAD_REF,
        overlap_score: overlapScore,
        suggestions_checked: suggestionsChecked,
        changes_detected: changesDetected,
        verification_timestamp: proof.timestamp
      }
    };
    
    const response = await fetch(\`\${LEDGER_BASE_URL}/api/events\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${LEDGER_ADMIN_TOKEN}\`
      },
      body: JSON.stringify(ledgerPayload)
    });
    
    if (response.ok) {
      const ledgerResult = await response.json();
      proof.ledger_proof = {
        transaction_id: ledgerResult.transaction_id,
        block_height: ledgerResult.block_height,
        sealed_at: new Date().toISOString()
      };
      console.log('✅ Proof sealed to ledger:', ledgerResult.transaction_id);
    } else {
      console.warn('⚠️  Failed to seal to ledger:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('⚠️  Error sealing to ledger:', error.message);
  }
} else {
  console.log('ℹ️  Ledger sealing not configured (missing LEDGER_BASE_URL or LEDGER_ADMIN_TOKEN)');
}

// Write proof file
writeFileSync(PROOF_OUT, JSON.stringify(proof, null, 2));
console.log('✅ Proof written to', PROOF_OUT);

// Check if we should fail
if (overlapScore < MIN_SCORE) {
  console.log(\`❌ Overlap score \${overlapScore.toFixed(3)} is below minimum \${MIN_SCORE}\`);
  if (MIN_SCORE_FAIL) {
    console.log('💥 Failing build due to low overlap score');
    process.exit(1);
  } else {
    console.log('⚠️  Low overlap score detected but not failing build');
  }
} else {
  console.log('✅ Verification passed');
}
`;

writeFileSync('scripts/verifyCopilotDiff.mjs', verificationScript);
execSync('chmod +x scripts/verifyCopilotDiff.mjs');
console.log('✅ Created verification script');

// Create GitHub workflow
const workflowContent = `name: copilot-verify
on: [pull_request, push]
jobs:
  verify:
    uses: civic-protocol/core/.github/workflows/reusable-copilot-verify.yml@main
    secrets: inherit
    with:
      min_score: "${MIN_SCORE}"
      fail_on_low: "${FAIL_ON_LOW}"
`;

writeFileSync('.github/workflows/copilot-verify.yml', workflowContent);
console.log('✅ Created GitHub workflow');

// Create initial suggestions file
const initialSuggestions = {
  suggestions: [],
  app_name: APP_NAME,
  created_at: new Date().toISOString(),
  version: "1.0.0"
};

writeFileSync('.copilot/suggestions.json', JSON.stringify(initialSuggestions, null, 2));
console.log('✅ Created initial suggestions file');

// Create package.json if it doesn't exist
if (!existsSync('package.json')) {
  const packageJson = {
    name: `@civic-protocol/${APP_NAME}`,
    version: "1.0.0",
    type: "module",
    scripts: {
      "verify-copilot": "node scripts/verifyCopilotDiff.mjs"
    },
    engines: {
      node: ">=20.0.0"
    }
  };
  
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Created package.json');
}

// Create README for the app
const appReadme = `# ${APP_NAME}

This repository includes Copilot verification to ensure AI-generated code is properly tracked and sealed to the Civic Ledger.

## Copilot Verification

This app uses the Civic Protocol Copilot verification system to:
- Track AI-generated code suggestions
- Verify overlap between suggestions and actual changes
- Seal verification proofs to the Civic Ledger
- Maintain an immutable record of AI assistance

### Files Added

- \`.github/workflows/copilot-verify.yml\` - GitHub Actions workflow
- \`scripts/verifyCopilotDiff.mjs\` - Verification script
- \`.copilot/suggestions.json\` - Captured suggestions (auto-generated)

### Configuration

The verification is configured with:
- Minimum overlap score: ${MIN_SCORE}
- Fail on low score: ${FAIL_ON_LOW}

### Setup

1. Ensure GitHub secrets are configured:
   - \`LEDGER_BASE_URL\` (repository variable)
   - \`LEDGER_ADMIN_TOKEN\` (repository secret)

2. The verification runs automatically on:
   - Pull requests
   - Pushes to any branch

### Manual Verification

Run verification manually:
\`\`\`bash
npm run verify-copilot
\`\`\`

### Pre-commit Hook (Optional)

To automatically capture Copilot suggestions before each commit:

\`\`\`bash
# Install husky
npm install --save-dev husky

# Set up pre-commit hook
echo "node scripts/capture-suggestions.mjs" > .husky/pre-commit
chmod +x .husky/pre-commit
\`\`\`

For more information, see the [Civic Protocol Core documentation](https://github.com/civic-protocol/core).
`;

writeFileSync('COPILOT_VERIFICATION.md', appReadme);
console.log('✅ Created COPILOT_VERIFICATION.md');

console.log('\\n🎉 Setup complete!');
console.log('\\n📋 Next steps:');
console.log('1. Commit these files to your repository');
console.log('2. Configure GitHub secrets:');
console.log('   - LEDGER_BASE_URL (repository variable)');
console.log('   - LEDGER_ADMIN_TOKEN (repository secret)');
console.log('3. Test with a pull request');
console.log('\\n📚 For more information, see:');
console.log('   - COPILOT_VERIFICATION.md (this repo)');
console.log('   - civic-protocol/core/docs/copilot-verification.md');