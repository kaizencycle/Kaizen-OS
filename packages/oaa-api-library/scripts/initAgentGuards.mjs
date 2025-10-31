#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const GUARD_DEFAULT = {
  enabled: true,
  lastHash: '',
  noopCount: 0,
  maxNoop: 3,
};

const COOLDOWN_DEFAULT = {
  nextAllowedAt: 0,
  cooldownSec: 240,
};

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`⚠️  initAgentGuards: failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureGuardConfig() {
  const guardPath = path.join(projectRoot, 'dev', 'loop_guard.json');
  let guard = readJson(guardPath);
  let updated = false;

  if (!guard || typeof guard !== 'object') {
    guard = { ...GUARD_DEFAULT };
    updated = true;
  } else {
    if (typeof guard.enabled !== 'boolean') { guard.enabled = GUARD_DEFAULT.enabled; updated = true; }
    if (typeof guard.lastHash !== 'string') { guard.lastHash = GUARD_DEFAULT.lastHash; updated = true; }
    if (typeof guard.noopCount !== 'number') { guard.noopCount = GUARD_DEFAULT.noopCount; updated = true; }
    if (typeof guard.maxNoop !== 'number' || guard.maxNoop <= 0) {
      guard.maxNoop = GUARD_DEFAULT.maxNoop;
      updated = true;
    }
  }

  if (updated) {
    writeJson(guardPath, guard);
    console.log(`🛡️  initAgentGuards: wrote guard config → ${guardPath}`);
  }
}

function ensureCooldownConfig() {
  const cooldownPath = path.join(projectRoot, 'dev', 'agent_cooldown.json');
  let cooldown = readJson(cooldownPath);
  let updated = false;

  if (!cooldown || typeof cooldown !== 'object') {
    cooldown = { ...COOLDOWN_DEFAULT };
    updated = true;
  } else {
    if (typeof cooldown.nextAllowedAt !== 'number') { cooldown.nextAllowedAt = COOLDOWN_DEFAULT.nextAllowedAt; updated = true; }
    if (typeof cooldown.cooldownSec !== 'number' || cooldown.cooldownSec <= 0) {
      cooldown.cooldownSec = COOLDOWN_DEFAULT.cooldownSec;
      updated = true;
    }
  }

  if (updated) {
    writeJson(cooldownPath, cooldown);
    console.log(`⏱️  initAgentGuards: wrote cooldown config → ${cooldownPath}`);
  }
}

try {
  ensureGuardConfig();
  ensureCooldownConfig();
} catch (error) {
  console.error('initAgentGuards failed:', error);
  process.exit(1);
}
