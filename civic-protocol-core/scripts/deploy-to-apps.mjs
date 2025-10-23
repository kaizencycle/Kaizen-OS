#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

const APPS = [
  { name: 'oaa-api-library', min_score: '0.35', fail_on_low: 'false' },
  { name: 'lab7-proof', min_score: '0.35', fail_on_low: 'false' }
];

console.log('🚀 Deploying Copilot verification to app repositories...');

for (const app of APPS) {
  console.log(`\\n📦 Setting up ${app.name}...`);
  
  try {
    // Create app directory structure
    execSync(`mkdir -p ../${app.name}/.github/workflows`, { stdio: 'inherit' });
    execSync(`mkdir -p ../${app.name}/scripts`, { stdio: 'inherit' });
    execSync(`mkdir -p ../${app.name}/.copilot`, { stdio: 'inherit' });
    
    // Copy verification script
    const verificationScript = readFileSync('scripts/verifyCopilotDiff.mjs', 'utf8');
    writeFileSync(`../${app.name}/scripts/verifyCopilotDiff.mjs`, verificationScript);
    execSync(`chmod +x ../${app.name}/scripts/verifyCopilotDiff.mjs`);
    
    // Create GitHub workflow
    const workflowContent = `name: copilot-verify
on: [pull_request, push]
jobs:
  verify:
    uses: civic-protocol/core/.github/workflows/reusable-copilot-verify.yml@main
    secrets: inherit
    with:
      min_score: "${app.min_score}"
      fail_on_low: "${app.fail_on_low}"
`;
    writeFileSync(`../${app.name}/.github/workflows/copilot-verify.yml`, workflowContent);
    
    // Create initial suggestions file
    const initialSuggestions = {
      suggestions: [],
      app_name: app.name,
      created_at: new Date().toISOString(),
      version: "1.0.0"
    };
    writeFileSync(`../${app.name}/.copilot/suggestions.json`, JSON.stringify(initialSuggestions, null, 2));
    
    // Create app-specific README
    const appReadme = `# ${app.name}

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
- Minimum overlap score: ${app.min_score}
- Fail on low score: ${app.fail_on_low}

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
node scripts/verifyCopilotDiff.mjs
\`\`\`

For more information, see the [Civic Protocol Core documentation](https://github.com/civic-protocol/core).
`;
    writeFileSync(`../${app.name}/COPILOT_VERIFICATION.md`, appReadme);
    
    console.log(`✅ ${app.name} setup complete`);
    
  } catch (error) {
    console.error(`❌ Failed to setup ${app.name}:`, error.message);
  }
}

console.log('\\n🎉 Deployment complete!');
console.log('\\n📋 Next steps for each app repository:');
console.log('1. Commit the new files');
console.log('2. Configure GitHub secrets:');
console.log('   - LEDGER_BASE_URL (repository variable)');
console.log('   - LEDGER_ADMIN_TOKEN (repository secret)');
console.log('3. Test with a pull request');