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
| Cycle pointer aligned | VERIFIED | https://github.com/kaizencycle/Mobius-Substrate/blob/main/cycle.json |
| Nav includes C-381 | VERIFIED | git rev-parse origin/main^{} |
`;

describe('witness-table I7', () => {
  it('passes a minimal valid table', () => {
    const r = checkWitnessTable(VALID);
    assert.equal(r.ok, true);
    assert.equal(r.allStale, false);
  });

  it('fails without exact header', () => {
    const r = checkWitnessTable('### Witness Table\n\n| Claim | Verdict | Evidence |\n|---|---|---|\n| x | VERIFIED | abc1234567 |');
    assert.equal(r.ok, false);
  });

  it('fails on invalid verdict', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| x | TRUE | https://example.com |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, false);
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
| x | VERIFIED | looks good to me |
`;
    const r = checkWitnessTable(body);
    assert.equal(r.ok, false);
  });

  it('accepts git command evidence', () => {
    const body = `
## Witness Table

| Claim | Verdict | Evidence |
|---|---|---|
| tests pass | VERIFIED | git rev-parse HEAD |
`;
    assert.equal(checkWitnessTable(body).ok, true);
  });

  it('parses quoted path scalars in nav helper', () => {
    assert.equal(looksLikeEvidence('deadbeef'), true);
    assert.equal(looksLikeEvidence('no ref here'), false);
  });

  it('extractTableAfterHeader stops at non-table lines', () => {
    const block = extractTableAfterHeader(VALID);
    assert.ok(block);
    const parsed = parseMarkdownTable(block);
    assert.ok(parsed);
    assert.equal(parsed.data.length, 2);
  });
});
