#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';

console.log('📝 Capturing Copilot suggestions...');

// Ensure .copilot directory exists
execSync('mkdir -p .copilot', { stdio: 'inherit' });

// Get staged files
let stagedFiles = [];
try {
  const gitStatus = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = gitStatus.trim().split('\n').filter(file => file.length > 0);
} catch (error) {
  console.warn('⚠️  Could not get staged files:', error.message);
}

console.log(`📁 Found ${stagedFiles.length} staged files`);

// For now, create a placeholder suggestions file
// In a real implementation, this would capture actual Copilot suggestions
const suggestions = {
  suggestions: stagedFiles.map(file => ({
    file: file,
    text: `// Copilot suggestion for ${file}\n// This would contain the actual suggestion text\n// Generated at ${new Date().toISOString()}`,
    timestamp: new Date().toISOString(),
    confidence: 0.8
  })),
  captured_at: new Date().toISOString(),
  total_files: stagedFiles.length
};

// Write suggestions file
const suggestionsPath = '.copilot/suggestions.json';
writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

console.log(`✅ Captured ${suggestions.suggestions.length} suggestions`);
console.log(`📄 Saved to ${suggestionsPath}`);

// Add to git
try {
  execSync(`git add ${suggestionsPath}`, { stdio: 'inherit' });
  console.log('✅ Added suggestions to git staging');
} catch (error) {
  console.warn('⚠️  Could not add suggestions to git:', error.message);
}