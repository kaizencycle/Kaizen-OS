import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWitnessTable,
  extractTableAfterHeader,
  looksLikeEvidence,
  parseMarkdownTable,
} from '../.github/actions/epicon-guard/src/witness-table.mjs';

const VALID = `
## Summary

## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| Cycle pointer aligned | TRUE | https://github.com/kaizencycle/Mobius-Substrate/blob/main/cycle.json |
| Nav includes C-381 | TRUE | git rev-parse origin/main^{} |
`;

const PRODUCTION_STYLE_TABLE = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| I7 checks literal \`## Witness Table\` header | TRUE | git rev-parse HEAD:.github/actions/epicon-guard/src/witness-table.mjs |
| Tier EP-2+ gated; EP-1 exempt | TRUE | https://github.com/kaizencycle/Mobius-Substrate/blob/main/.github/actions/epicon-guard/src/validate.mjs |
| Default warn-only via \`i7-mode: warn\` | TRUE | git show HEAD:.github/workflows/epicon-guard.yml |
`;

describe('witness-table I7', () => {
  it('passes a minimal valid table', () => {
    const r = checkWitnessTable(VALID);
    assert.equal(r.ok, true);
    assert.equal(r.allStale, false);
  });

  it('passes unfenced witness table with canonical verdicts and ref evidence', () => {
    const r = checkWitnessTable(PRODUCTION_STYLE_TABLE);
    assert.equal(r.ok, true);
    assert.equal(r.allStale, false);
  });

  it('fails without exact header', () => {
    const r = checkWitnessTable('### Witness Table\n\n| Claim | Verdict | Evidence |\n|---|---|---|\n| x | TRUE | abc1234567 |');
    assert.equal(r.ok, false);
  });

  it('fenced-only example does not satisfy I7', () => {
    const body = [
      "Here's the required format:",
      '',
      '```markdown',
      '## Witness Table',
      '',
      '| Claim | Verdict | Evidence |',
      '|---|---|---|',
      '| example | TRUE | abc1234 |',
      '```',
    ].join('\n');
    const result = checkWitnessTable(body);
    assert.strictEqual(result.ok, false);
  });

  it('fails on invalid verdict', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| x | VERIFIED | https://example.com |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, false);
  });

  it('accepts canonical TRUE-gap verdict', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| partial rollout | TRUE-gap | https://handbook.mobius-substrate.com |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, true);
    assert.equal(r.allStale, false);
  });

  it('passes format with all STALE rows', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| old claim | STALE | https://handbook.mobius-substrate.com |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, true);
    assert.equal(r.allStale, true);
  });

  it('fails when evidence is prose only', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| x | TRUE | looks good to me |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, false);
  });

  it('accepts git command evidence', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| tests pass | TRUE | git rev-parse HEAD |
`;
    assert.equal(checkWitnessTable(body).ok, true);
  });

  it('prose containing a hex-like substring is rejected', () => {
    assert.strictEqual(looksLikeEvidence('feedback from the reviewer'), false);
  });

  it('standalone SHA fragment is accepted', () => {
    assert.strictEqual(looksLikeEvidence('abc1234'), true);
    assert.strictEqual(looksLikeEvidence('see commit abc1234 for details'), true);
  });

  it('git command is accepted', () => {
    assert.strictEqual(looksLikeEvidence('git rev-parse origin/main^{}'), true);
  });

  it('url is accepted', () => {
    assert.strictEqual(
      looksLikeEvidence('https://github.com/kaizencycle/Mobius-Substrate/pull/417'),
      true
    );
  });

  it('extractTableAfterHeader stops at non-table lines', () => {
    const block = extractTableAfterHeader(VALID);
    assert.ok(block);
    const parsed = parseMarkdownTable(block);
    assert.ok(parsed);
    assert.equal(parsed.data.length, 2);
  });
});
