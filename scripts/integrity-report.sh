#!/bin/bash
# Governance Integrity consensus report (AUREA + ATLAS)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$REPO_ROOT}"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo "📊 Governance Integrity Report"
echo "=============================="
echo ""
echo "Root: $TARGET_DIR"
echo "Sentinels: AUREA (OpenAI) + ATLAS (Claude)"
echo ""

DIST_PATH="$REPO_ROOT/packages/atlas-sentinel/dist/index.js"
if [[ ! -f "$DIST_PATH" ]]; then
  echo "⚙️  Building atlas-sentinel package..."
  (cd "$REPO_ROOT" && npm run build --workspace=packages/atlas-sentinel >/dev/null)
fi

node - <<'NODE' "$TARGET_DIR" "$DIST_PATH"
const path = require('path');

const targetDir = process.argv[2] || process.cwd();
const atlasDist = process.argv[3];

const { AtlasSentinel } = require(atlasDist);

async function runConsensus() {
  const atlas = new AtlasSentinel({
    giThreshold: 0.95,
    qualityThreshold: 0.9,
    driftThreshold: 0.15
  });

  const attestation = await atlas.audit(targetDir);

  const coverageScore = attestation.quality.coverage / 100;
  const driftScore = attestation.drift.violations === 0 ? 1 : Math.max(0, 1 - (attestation.drift.violations / 10));
  const charterScore = attestation.charter.complianceScore;

  const aureaScore = Number((0.4 * coverageScore + 0.3 * driftScore + 0.3 * charterScore).toFixed(3));
  const atlasScore = attestation.giScore.total;
  const threshold = 0.95;
  const consensus = aureaScore >= threshold && atlasScore >= threshold;

  console.log('AUREA (OpenAI) GI Score:', aureaScore.toFixed(3));
  console.log('ATLAS (Claude) GI Score:', atlasScore.toFixed(3));
  console.log('');
  console.log('AUREA Components:');
  console.log(`  Coverage (Memory): ${(coverageScore * 100).toFixed(1)}%`);
  console.log(`  Drift (Integrity): ${(driftScore * 100).toFixed(1)}%`);
  console.log(`  Charter (Ethics): ${(charterScore * 100).toFixed(1)}%`);
  console.log('');
  console.log('ATLAS Components:');
  console.log(`  Memory: ${attestation.giScore.memory.toFixed(3)}`);
  console.log(`  Human: ${attestation.giScore.human.toFixed(3)}`);
  console.log(`  Integrity: ${attestation.giScore.integrity.toFixed(3)}`);
  console.log(`  Ethics: ${attestation.giScore.ethics.toFixed(3)}`);
  console.log('');
  console.log(`Consensus Status: ${consensus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Threshold: ${threshold}`);

  if (!consensus) {
    console.log('');
    console.log('Follow-up Actions:');
    if (aureaScore < threshold) {
      console.log('  - Improve coverage/documentation to raise AUREA score.');
    }
    if (atlasScore < threshold) {
      const gaps = attestation.charter.missingTags;
      if (gaps.length) {
        console.log(`  - ATLAS flagged charter gaps: ${gaps.join(', ')}`);
      }
      if (attestation.drift.violations > 0) {
        console.log(`  - Resolve drift violations detected: ${attestation.drift.patterns.join(', ')}`);
      }
    }
  }

  console.log('');
  console.log('Attestation Hash:', attestation.hash);
  console.log('Commit:', attestation.commit);
}

runConsensus().catch((error) => {
  console.error('Consensus evaluation failed:', error);
  process.exit(1);
});
NODE
