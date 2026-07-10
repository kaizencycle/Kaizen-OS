#!/usr/bin/env node
/**
 * EPICON Guard — v0 (GitHub Action validator)
 *
 * Validates the EPICON Intent Publication block (```intent fenced block) in a
 * pull request body against the canonical Mobius Substrate specifications:
 *
 *   - docs/epicon/EPICON-02.md        (Intent Publication & Divergence Protocol v1.0.0)
 *   - docs/specs/EPICON_TIERING_SPEC_v0.1.md  (EP-1 / EP-2 / EP-3, Rules 5.1-5.3)
 *   - schemas/epicon_constitutional_v1.schema.json (MEC citation pattern)
 *   - docs/epicon/ej.schema.json      (anchor minimums)
 *   - .github/PULL_REQUEST_TEMPLATE.md (intent block field grammar)
 *
 * Invariant mapping (EPICON-02 §2):
 *   I1 Intent must precede authority      -> intent block required before merge
 *   I2 Intent immutable once published    -> justification_hash emitted (App enforces in Phase 1)
 *   I3 Authority scoped and time-bounded  -> scope enum + issued_at/expires_at required
 *   I4 Divergence observable, no blocking -> scope-vs-changed-paths flagged as warnings
 *   I5 Expiration is mandatory            -> expires_at required; expired intent fails
 *   I6 No narrative substitutes           -> structural validation only; prose never passes the gate
 *
 * Tiering (EPICON_TIERING_SPEC_v0.1):
 *   Rule 5.1 -> tier is computed here from the policy registry, never read from
 *               the PR's self-declared Risk Tier checkboxes.
 *   Rule 5.2 -> paths not matched by the registry classify EP-3 (deny-by-default).
 *   Rule 5.3 -> PR tier = max tier across all changed files (monotonic escalation).
 *   §8 failure matrix -> EP-1 fail-open (pass + backfill notice),
 *                        EP-2 quarantine (check fails, remediable),
 *                        EP-3 fail-closed (check fails).
 *
 * Zero runtime dependencies. Requires Node >= 20 (global fetch).
 * License: CC0-1.0 (Public Domain) — Mobius Substrate.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Canonical patterns — keep in sync with Mobius-Substrate sources noted below.
// ---------------------------------------------------------------------------

// packages/mec-parser (MEC_CONSTITUTIONAL_PATTERN) and
// schemas/epicon_constitutional_v1.schema.json -> properties.mec_citation.pattern
const MEC_CONSTITUTIONAL_REGEX =
  /^E(\d+)\.RB(\d+)\.C(\d+)\.S(\d+):Q(\d+):((?:AT|ZE|EV|JA|AU|HE|EC|DA|UR|ZN)(?:\+(?:AT|ZE|EV|JA|AU|HE|EC|DA|UR|ZN))*):GI(\d{3})$/;

// .github/PULL_REQUEST_TEMPLATE.md: EPICON_C-XXX_SCOPE_description_v1
// TEMPLATE_EPICON.md allows dotted tier tokens (e.g. DVA.LITE) in the third segment.
const EPICON_ID_REGEX = /^EPICON_C-\d+_[A-Za-z0-9.]+_[a-z0-9][a-z0-9-]*_v\d+$/;

// PR template scope enum (EPICON-02 §3.2 Scope Envelope, PR-level projection)
const VALID_SCOPES = ['docs', 'ci', 'core', 'infra', 'sentinels', 'labs', 'specs'];
const VALID_MODES = ['normal', 'emergency', 'standard']; // 'standard' accepted with warning

// Scope -> path-prefix envelope used for divergence detection (I4).
// Divergence is flagged, never blocked (EPICON-02 §3.2: "Actions outside the
// envelope are not blocked — they are flagged as divergent.")
const SCOPE_ENVELOPES = {
  docs: ['docs/', 'README', 'DOCS.md', 'CONTRIBUTING.md', 'LICENSE', 'FOR-'],
  ci: ['.github/'],
  core: ['apps/', 'packages/', 'src/', 'lib/'],
  infra: ['infra/', 'render.yaml', 'vercel.json', 'Dockerfile', 'docker-compose', 'netlify.toml'],
  sentinels: ['sentinels/', 'agents/'],
  labs: ['labs/', 'experiments/'],
  specs: ['docs/specs/', 'schemas/', 'docs/epicon/'],
};

// Default tier policy registry (Rule 5.1: declarative, independent of proposer).
// Consumers may override with .github/epicon-policy.json in their repo.
// First match wins within a tier list; unmatched paths -> EP-3 (Rule 5.2).
const DEFAULT_POLICY = {
  policy_id: 'epicon-guard-default-v0',
  'EP-1': [
    'docs/**', '*.md', '**/*.md', '.github/ISSUE_TEMPLATE/**', 'LICENSE', '.gitignore',
  ],
  'EP-2': [
    'apps/**', 'packages/**', 'src/**', 'lib/**', 'labs/**', 'experiments/**',
    'infra/**', 'test/**', 'tests/**', '**/*.test.*', 'package.json', 'package-lock.json',
    'tsconfig.json', 'render.yaml', 'vercel.json',
  ],
  'EP-3': [
    'schemas/**', 'docs/epicon/**', 'docs/specs/**', '.github/workflows/**',
    'CODEOWNERS', '.github/CODEOWNERS', 'SECURITY.md', 'ledger/**', 'canon/**',
    'journals/**', 'sentinels/**',
  ],
};

const TIER_ORDER = { 'EP-1': 1, 'EP-2': 2, 'EP-3': 3 };

// ---------------------------------------------------------------------------
// GitHub Actions plumbing
// ---------------------------------------------------------------------------

const errors = [];
const warnings = [];
const notices = [];

const annotate = (level, msg) => console.log(`::${level}::${msg}`);
const fail = (msg) => { errors.push(msg); annotate('error', msg); };
const warn = (msg) => { warnings.push(msg); annotate('warning', msg); };
const note = (msg) => { notices.push(msg); annotate('notice', msg); };

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

function writeSummary(md) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
  } else {
    console.log('\n' + md);
  }
}

// ---------------------------------------------------------------------------
// 1. Load PR event payload
// ---------------------------------------------------------------------------

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath || !existsSync(eventPath)) {
  console.error('No GITHUB_EVENT_PATH — EPICON Guard must run on pull_request events.');
  process.exit(1);
}
const event = JSON.parse(readFileSync(eventPath, 'utf8'));
const pr = event.pull_request;
if (!pr) {
  console.error('Event payload has no pull_request — check workflow trigger.');
  process.exit(1);
}

const prBody = pr.body || '';
const repoFull = process.env.GITHUB_REPOSITORY || '';
const mode = (process.env.INPUT_MODE || 'enforce').toLowerCase();

// ---------------------------------------------------------------------------
// 2. Extract the ```intent fenced block (I1)
// ---------------------------------------------------------------------------

function extractIntentBlocks(body) {
  const blocks = [];
  const re = /```intent\s*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(body)) !== null) blocks.push(m[1]);
  return blocks;
}

const blocks = extractIntentBlocks(prBody);

if (blocks.length === 0) {
  fail(
    'I1 VIOLATION — No EPICON Intent Publication found. Intent must precede authority ' +
    '(EPICON-02 §2.1). Add a ```intent fenced block per .github/PULL_REQUEST_TEMPLATE.md §3.'
  );
}
if (blocks.length > 1) {
  warn(`Multiple intent blocks found (${blocks.length}); validating the first. ` +
    'Intent evolution requires re-publication with a version bump, not parallel intents (EPICON-02 §7).');
}

const intentRaw = blocks[0] || '';

// I2 — immutability commitment: hash of the published intent block.
// Maps to EPICON-02 §4.1 justification_hash. The Phase-1 App compares this
// hash across `edited` events to detect post-publication mutation.
const justificationHash = intentRaw
  ? createHash('sha256').update(intentRaw.trim()).digest('hex')
  : '';

// ---------------------------------------------------------------------------
// 3. Tolerant line-based field parser
//    (Intent blocks in the wild carry extra fields; unknown keys are allowed.)
// ---------------------------------------------------------------------------

function parseIntent(raw) {
  const fields = {};
  const justification = {};
  const counterfactuals = [];
  let section = null; // null | 'justification' | 'counterfactuals' | 'anchors'

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (/^justification\s*:/i.test(trimmed)) { section = 'justification'; continue; }
    if (/^counterfactuals\s*:/i.test(trimmed)) { section = 'counterfactuals'; continue; }

    if (section === 'counterfactuals') {
      if (trimmed.startsWith('-')) { counterfactuals.push(trimmed.replace(/^-+\s*/, '')); continue; }
      section = null; // fell out of the list
    }

    if (section === 'justification' || section === 'anchors') {
      const jm = trimmed.match(/^([A-Z][A-Z ]+?)\s*:\s*(.*)$/);
      if (jm) {
        const key = jm[1].trim().toUpperCase();
        justification[key] = jm[2].trim();
        section = key === 'ANCHORS' ? 'anchors' : 'justification';
        continue;
      }
      if (section === 'anchors' && trimmed.startsWith('-')) {
        justification.ANCHORS_LIST = justification.ANCHORS_LIST || [];
        justification.ANCHORS_LIST.push(trimmed.replace(/^-+\s*/, ''));
        continue;
      }
      // top-level key encountered while inside justification -> fall through
      if (!/^[a-z_]+\s*:/.test(trimmed)) continue;
      section = null;
    }

    const km = trimmed.match(/^([a-z_]+)\s*:\s*(.*)$/);
    if (km) fields[km[1]] = km[2].trim();
  }

  return { fields, justification, counterfactuals };
}

const { fields, justification, counterfactuals } = intentRaw
  ? parseIntent(intentRaw)
  : { fields: {}, justification: {}, counterfactuals: [] };

// ---------------------------------------------------------------------------
// 4. Structural validation (I3, I5, I6)
// ---------------------------------------------------------------------------

if (intentRaw) {
  // epicon_id
  if (!fields.epicon_id) {
    fail('Missing epicon_id (EPICON-02 §4.1). Format: EPICON_C-XXX_SCOPE_slug_v1');
  } else if (!EPICON_ID_REGEX.test(fields.epicon_id)) {
    fail(`Malformed epicon_id "${fields.epicon_id}". Expected EPICON_C-<cycle>_<SCOPE>_<slug>_v<N>.`);
  }

  // ledger_id (actor binding). Grandfather `author` with a warning.
  if (!fields.ledger_id) {
    if (fields.author) {
      warn('Intent uses legacy `author` field; migrate to `ledger_id` per PULL_REQUEST_TEMPLATE §3.');
    } else {
      fail('Missing ledger_id — intent must bind to an actor (EPICON-02 §4.1).');
    }
  }

  // scope (I3 — authority must be scoped; comma-separated union per mobius_pr_bot)
  if (!fields.scope) {
    fail('I3 VIOLATION — Missing scope. Authority must be scoped (EPICON-02 §2.3).');
  } else {
    const scopeLabels = parseScopeLabels(fields.scope);
    if (scopeLabels.length === 0) {
      fail('I3 VIOLATION — Missing scope. Authority must be scoped (EPICON-02 §2.3).');
    } else {
      const unknown = scopeLabels.filter((label) => !VALID_SCOPES.includes(label));
      if (unknown.length > 0) {
        fail(
          `Invalid scope "${fields.scope}". Unknown label(s): ${unknown.join(', ')}. ` +
          `Allowed: ${VALID_SCOPES.join(' | ')}.`
        );
      }
    }
  }

  // mode
  if (fields.mode && !VALID_MODES.includes(fields.mode)) {
    warn(`Unrecognized mode "${fields.mode}" (expected normal | emergency).`);
  }
  if (fields.mode === 'standard') {
    warn('mode "standard" is legacy; use "normal".');
  }
  if (fields.mode === 'emergency') {
    note('EMERGENCY MODE declared — divergence tolerance does not increase; visibility does (EPICON-02 §5.3).');
  }

  // time bounds (I3 + I5)
  const issued = fields.issued_at ? Date.parse(fields.issued_at) : NaN;
  const expires = fields.expires_at ? Date.parse(fields.expires_at) : NaN;

  if (!fields.issued_at || Number.isNaN(issued)) {
    fail('I3 VIOLATION — Missing or unparseable issued_at (ISO 8601 required).');
  }
  if (!fields.expires_at || Number.isNaN(expires)) {
    fail('I5 VIOLATION — Missing or unparseable expires_at. Expiration is mandatory (EPICON-02 §2.5).');
  }
  if (!Number.isNaN(issued) && !Number.isNaN(expires)) {
    if (expires <= issued) {
      fail('I5 VIOLATION — expires_at must be after issued_at. Authority must be time-bounded.');
    }
    if (Date.now() > expires) {
      fail(
        'I5 VIOLATION — Intent has EXPIRED. Authority terminates at expires_at; ' +
        'no renewal without new Intent Publication (EPICON-02 §5.4). Re-publish with a version bump.'
      );
    }
    const days = (expires - issued) / 86400000;
    if (days > 120) {
      warn(`Authority window is ${Math.round(days)} days — long-lived intents weaken the Expiration Witness. Consider <= 90 days.`);
    }
  }

  // justification structure (I6 — structure, not narrative; ej.schema.json shapes)
  const requiredJ = ['VALUES INVOKED', 'REASONING', 'ANCHORS', 'BOUNDARIES', 'COUNTERFACTUAL'];
  for (const key of requiredJ) {
    const present = key in justification ||
      (key === 'ANCHORS' && (justification.ANCHORS_LIST?.length || justification.ANCHORS));
    if (!present) {
      fail(`I6 — justification missing "${key}". Narrative claims may not substitute structured justification (EPICON-02 §2.6).`);
    }
  }
  const anchorCount = justification.ANCHORS_LIST?.length ?? (justification.ANCHORS ? 1 : 0);
  if (anchorCount < 2) {
    warn(`Only ${anchorCount} anchor(s) found — ej.schema.json requires >= 2 independent epistemic anchors.`);
  }

  // counterfactuals list (EPICON-02 §4.1)
  if (counterfactuals.length === 0) {
    fail('Missing counterfactuals list — falsifiability conditions are required (EPICON-02 §4.1).');
  }

  // optional MEC citation
  if (fields.mec_citation) {
    if (MEC_CONSTITUTIONAL_REGEX.test(fields.mec_citation)) {
      note(`MEC citation valid: ${fields.mec_citation}`);
    } else {
      fail(`Malformed mec_citation "${fields.mec_citation}" — must match MEC_CONSTITUTIONAL_PATTERN (packages/mec-parser).`);
    }
  }

  // cycle coherence: epicon_id cycle should be plausible
  const cyc = fields.epicon_id?.match(/^EPICON_C-(\d+)_/);
  if (cyc && Number(cyc[1]) === 0) warn('epicon_id cycle is C-0 — fill in the real cycle number.');
}

// ---------------------------------------------------------------------------
// 5. Changed files (GitHub API, paginated) -> tier classification + divergence
// ---------------------------------------------------------------------------

async function fetchChangedFiles() {
  const token = process.env.INPUT_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) { warn('No token available — skipping changed-file analysis (tier + divergence).'); return null; }
  const files = [];
  let page = 1;
  while (page <= 10) { // 3000-file ceiling
    const res = await fetch(
      `https://api.github.com/repos/${repoFull}/pulls/${pr.number}/files?per_page=100&page=${page}`,
      { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) { warn(`GitHub API ${res.status} while listing PR files — skipping tier/divergence analysis.`); return null; }
    const batch = await res.json();
    files.push(...batch.map((f) => f.filename));
    if (batch.length < 100) break;
    page++;
  }
  return files;
}

// Minimal glob matcher for the policy registry (supports **, *, and prefixes).
function globMatch(pattern, path) {
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -2));
  const rx = new RegExp(
    '^' + pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '\u0001')
      .replace(/\*/g, '[^/]*')
      .replace(/\u0001/g, '.*') + '$'
  );
  return rx.test(path);
}

const DEFAULT_POLICY_PATH = '.github/epicon-policy.json';

function parsePolicyJson(raw, source) {
  try {
    return JSON.parse(raw);
  } catch {
    warn(`Unparseable policy JSON (${source}) — falling back to default registry.`);
    return null;
  }
}

/** @param {string} policyRefInput @param {{ base?: { sha?: string } } | null} pullRequest */
function resolvePolicyRef(policyRefInput, pullRequest) {
  const ref = (policyRefInput || '').trim().toLowerCase();
  if (ref === 'workspace' || ref === 'head') return 'workspace';
  if (ref === 'base') return pullRequest?.base?.sha ? `git:${pullRequest.base.sha}` : 'workspace';
  if (!ref) return pullRequest?.base?.sha ? `git:${pullRequest.base.sha}` : 'workspace';
  return `git:${policyRefInput.trim()}`;
}

function loadPolicyFromWorkspace(policyPath) {
  const override = join(process.env.GITHUB_WORKSPACE || '.', policyPath);
  if (!existsSync(override)) return DEFAULT_POLICY;
  const parsed = parsePolicyJson(readFileSync(override, 'utf8'), override);
  if (!parsed) return DEFAULT_POLICY;
  note(`Tier policy loaded from workspace ${policyPath} (${parsed.policy_id || 'unnamed'}).`);
  return parsed;
}

async function fetchPolicyFromGitHub(ref, policyPath) {
  const token = process.env.INPUT_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token || !repoFull) {
    warn('No token available — cannot load policy from Git ref.');
    return null;
  }
  const encodedPath = policyPath.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(
    `https://api.github.com/repos/${repoFull}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' } }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    warn(`GitHub API ${res.status} while loading policy at ref ${ref} — skipping remote policy.`);
    return null;
  }
  const data = await res.json();
  if (!data.content) return null;
  const raw = Buffer.from(data.content, 'base64').toString('utf8');
  return parsePolicyJson(raw, `${ref}:${policyPath}`);
}

async function loadPolicy() {
  const policyPath = process.env.INPUT_POLICY_PATH || DEFAULT_POLICY_PATH;
  const resolved = resolvePolicyRef(process.env.INPUT_POLICY_REF, pr);

  if (resolved === 'workspace') {
    return loadPolicyFromWorkspace(policyPath);
  }

  const gitRef = resolved.startsWith('git:') ? resolved.slice(4) : resolved;
  const fromApi = await fetchPolicyFromGitHub(gitRef, policyPath);
  if (fromApi) {
    note(`Tier policy loaded from ref ${gitRef} at ${policyPath} (${fromApi.policy_id || 'unnamed'}).`);
    return fromApi;
  }
  note(`No policy at ${policyPath} on ref ${gitRef}; using built-in deny-by-default registry.`);
  return DEFAULT_POLICY;
}

function classifyFile(policy, path) {
  // Highest tier wins when a path matches multiple tiers (Rule 5.3);
  // unmatched -> EP-3 (Rule 5.2 deny-by-default).
  for (const tier of ['EP-3', 'EP-2', 'EP-1']) {
    for (const pattern of policy[tier] || []) {
      if (globMatch(pattern, path)) return { tier, rule: `${policy.policy_id || 'default'}:${tier}:${pattern}` };
    }
  }
  return { tier: 'EP-3', rule: `${policy.policy_id || 'default'}:5.2-deny-by-default` };
}

function parseScopeLabels(scopeField) {
  return String(scopeField || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function inEnvelope(scopeField, path) {
  const labels = parseScopeLabels(scopeField);
  return labels.some((scope) => {
    const prefixes = SCOPE_ENVELOPES[scope] || [];
    return prefixes.some((p) => path.startsWith(p) || (p.includes('.') && path === p));
  });
}

const policy = await loadPolicy();
const changed = await fetchChangedFiles();

// Rule 5.2: unknown ≠ harmless. If changed files could not be analyzed, the
// PR is unclassifiable and MUST default to EP-3 (deny-by-default), never EP-1.
let prTier = changed === null ? 'EP-3' : 'EP-1';
let tierRule = changed === null
  ? '5.2-deny-by-default:unclassifiable'
  : 'no-consequential-paths';
const divergent = [];

if (changed && changed.length > 0) {
  for (const f of changed) {
    const { tier, rule } = classifyFile(policy, f);
    if (TIER_ORDER[tier] > TIER_ORDER[prTier]) { prTier = tier; tierRule = rule; }
    const scopeLabels = fields.scope ? parseScopeLabels(fields.scope) : [];
    const scopesValid = scopeLabels.length > 0 && scopeLabels.every((s) => VALID_SCOPES.includes(s));
    if (scopesValid && !inEnvelope(fields.scope, f)) {
      divergent.push(f);
    }
  }

  // I4 — divergence is observable, not blocking, and not an accusation.
  if (divergent.length > 0 && intentRaw) {
    warn(
      `I4 DIVERGENCE — ${divergent.length} changed file(s) outside the declared scope envelope ` +
      `"${fields.scope}": ${divergent.slice(0, 8).join(', ')}${divergent.length > 8 ? ', …' : ''}. ` +
      'Divergence is a state condition, not an accusation (EPICON-02 §3.3). ' +
      'Either widen the declared scope via intent re-publication, or split the PR.'
    );
  }
} else if (changed && changed.length === 0) {
  note('No changed files reported for this PR.');
}

// ---------------------------------------------------------------------------
// 6. Failure matrix (EPICON_TIERING_SPEC §8)
// ---------------------------------------------------------------------------

let status;
const hasErrors = errors.length > 0;

if (!hasErrors) {
  status = 'PASS';
} else if (prTier === 'EP-1') {
  // EP-1 fails open with honest backfill marking.
  status = 'PASS_WITH_BACKFILL';
  note(
    'EP-1 fail-open: intent is missing/invalid but all changes classify EP-1. ' +
    'Backfill the intent block before merge — this pass is marked, not silent (spec §8).'
  );
} else if (prTier === 'EP-2') {
  status = 'QUARANTINE';
} else {
  status = 'FAIL_CLOSED';
}

// ---------------------------------------------------------------------------
// 7. Outputs, summary, verdict
// ---------------------------------------------------------------------------

setOutput('tier', prTier);
setOutput('status', status);
setOutput('epicon_id', fields.epicon_id || '');
setOutput('justification_hash', justificationHash);
setOutput('divergence_count', String(divergent.length));

const icon = { PASS: '✅', PASS_WITH_BACKFILL: '🟡', QUARANTINE: '🟠', FAIL_CLOSED: '⛔' }[status];

writeSummary(
  [
    `## ${icon} EPICON Guard — ${status}`,
    '',
    '| Field | Value |',
    '|---|---|',
    `| **EPICON tier** | ${prTier} (policy-classified — Rule 5.1; rule: \`${tierRule}\`) |`,
    `| **Intent** | ${fields.epicon_id ? `\`${fields.epicon_id}\`` : '— none published —'} |`,
    `| **Actor** | ${fields.ledger_id || fields.author || '—'} |`,
    `| **Scope envelope** | ${fields.scope || '—'} |`,
    `| **Authority window** | ${fields.issued_at || '—'} → ${fields.expires_at || '—'} |`,
    `| **justification_hash** | \`${justificationHash ? justificationHash.slice(0, 16) + '…' : '—'}\` |`,
    `| **Divergent paths (I4)** | ${divergent.length} |`,
    `| **Errors / warnings** | ${errors.length} / ${warnings.length} |`,
    '',
    errors.length ? '### Violations\n' + errors.map((e) => `- ⛔ ${e}`).join('\n') : '',
    warnings.length ? '### Flags (non-blocking)\n' + warnings.map((w) => `- ⚠️ ${w}`).join('\n') : '',
    '',
    '> *No consequential action without recorded intent. Mobius is the witness, not the actor.*',
    `> Spec: \`docs/specs/EPICON_TIERING_SPEC_v0.1.md\` · \`docs/epicon/EPICON-02.md\` · mode: \`${mode}\``,
  ].filter(Boolean).join('\n')
);

console.log(`\nEPICON Guard verdict: ${status} (tier ${prTier}, ${errors.length} error(s), ${warnings.length} warning(s))`);

if ((status === 'QUARANTINE' || status === 'FAIL_CLOSED') && mode === 'enforce') {
  process.exit(1);
}
process.exit(0);
