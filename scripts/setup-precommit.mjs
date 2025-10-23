#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

console.log('🔧 Setting up pre-commit hook for Copilot suggestions...');

// Check if husky is installed
try {
  execSync('npx husky --version', { stdio: 'pipe' });
  console.log('✅ Husky is available');
} catch (error) {
  console.log('📦 Installing Husky...');
  try {
    execSync('npm install --save-dev husky', { stdio: 'inherit' });
    execSync('npx husky init', { stdio: 'inherit' });
  } catch (installError) {
    console.warn('⚠️  Could not install Husky:', installError.message);
    console.log('📝 Creating manual pre-commit hook...');
  }
}

// Create pre-commit hook
const preCommitHook = `#!/bin/sh
# Capture Copilot suggestions before commit
node scripts/capture-suggestions.mjs
`;

const hookPath = '.husky/pre-commit';
writeFileSync(hookPath, preCommitHook);

// Make it executable
try {
  execSync(`chmod +x ${hookPath}`, { stdio: 'inherit' });
  console.log('✅ Pre-commit hook created and made executable');
} catch (error) {
  console.warn('⚠️  Could not make hook executable:', error.message);
}

console.log('🎉 Pre-commit hook setup complete!');
console.log('📝 The hook will now capture Copilot suggestions before each commit');