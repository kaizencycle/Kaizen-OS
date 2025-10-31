/**
 * ATLAS Sentinel - Anchor, Auditor & Learning Synthesizer
 * 
 * Agent: ATLAS
 * Role: Anchor / Auditor / Learning Synthesizer
 * Domain: Quality Assurance, Anti-Drift, Continuous Learning
 * 
 * Temperament:
 * - Rationality: 0.92
 * - Empathy: 0.82
 * - Morale Anchor: "Truth Through Verification"
 */

export interface AtlasConfig {
  giThreshold: number;
  qualityThreshold: number;
  driftThreshold: number;
  ledgerUrl?: string;
  ledgerToken?: string;
}

export interface QualityMetrics {
  lint: 'pass' | 'fail';
  types: 'pass' | 'fail';
  coverage: number;
  complexity: number;
  duplicates: number;
}

export interface DriftAnalysis {
  violations: number;
  patterns: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface CharterCompliance {
  virtueTagsCovered: boolean;
  attestationPresent: boolean;
  missingTags: string[];
  complianceScore: number;
}

export interface GIScore {
  memory: number;    // M: Test coverage, documentation
  human: number;     // H: Code review, human approval
  integrity: number; // I: No violations, security
  ethics: number;    // E: Charter compliance, virtue tags
  total: number;     // GI = α*M + β*H + γ*I + δ*E
  passed: boolean;
}

export interface AtlasAttestation {
  agent: 'ATLAS';
  cycle: string;
  timestamp: string;
  commit: string;
  giScore: GIScore;
  quality: QualityMetrics;
  drift: DriftAnalysis;
  charter: CharterCompliance;
  hash: string;
}

export class AtlasSentinel {
  private config: AtlasConfig;

  constructor(config: AtlasConfig) {
    this.config = config;
  }

  /**
   * Main audit orchestrator
   */
  async audit(codebase: string): Promise<AtlasAttestation> {
    console.log('🤖 ATLAS awakening...');
    
    const cycle = this.getCurrentCycle();
    const timestamp = new Date().toISOString();
    const commit = await this.getCommitHash();
    const codeSnapshot = await this.resolveCodebaseSnapshot(codebase);

    // Phase 1: Quality Analysis
    console.log('📊 Phase 1: Code Quality Analysis');
    const quality = await this.analyzeQuality(codeSnapshot);

    // Phase 2: Anti-Drift Detection
    console.log('🔒 Phase 2: Anti-Drift Detection');
    const drift = await this.detectDrift(codeSnapshot);

    // Phase 3: Charter Compliance
    console.log('📜 Phase 3: Charter Compliance Check');
    const charter = await this.checkCharterCompliance(codeSnapshot);

    // Phase 4: Calculate GI Score
    console.log('🎯 Phase 4: GI Score Calculation');
    const giScore = this.calculateGIScore(quality, drift, charter);

    // Phase 5: Generate Attestation
    console.log('🔐 Phase 5: Generate Attestation');
    const attestation: AtlasAttestation = {
      agent: 'ATLAS',
      cycle,
      timestamp,
      commit,
      giScore,
      quality,
      drift,
      charter,
      hash: ''
    };

    attestation.hash = await this.hashAttestation(attestation);

    // Phase 6: Seal to Ledger (if configured)
    if (this.config.ledgerUrl) {
      console.log('📝 Phase 6: Sealing to Civic Ledger');
      await this.sealToLedger(attestation);
    }

    console.log('🌙 ATLAS clock-out complete');
    return attestation;
  }

  /**
   * Analyze code quality metrics
   */
  private async analyzeQuality(codeSnapshot: string): Promise<QualityMetrics> {
    // This would integrate with actual linting/testing tools
    // For now, return mock structure
    return {
      lint: 'pass',
      types: 'pass',
      coverage: 85,
      complexity: 12,
      duplicates: 2
    };
  }

  /**
   * Detect drift from original intent
   */
  private async detectDrift(codeSnapshot: string): Promise<DriftAnalysis> {
    const prohibitedPatterns = [
      'eval(',
      'new Function(',
      'dangerouslySetInnerHTML',
      'localStorage.setItem',
      'sessionStorage'
    ];

    const violations: string[] = [];
    
    for (const pattern of prohibitedPatterns) {
      if (this.containsPatternOutsideStrings(codeSnapshot, pattern)) {
        violations.push(pattern);
      }
    }

    const severity = this.calculateSeverity(violations.length);

    return {
      violations: violations.length,
      patterns: violations,
      severity,
      recommendations: this.generateRecommendations(violations)
    };
  }

  /**
   * Check Custos Charter compliance
   */
  private async checkCharterCompliance(codeSnapshot: string): Promise<CharterCompliance> {
    const hasVirtueTags = /Doctrine-ID|Ethics|Policy|Governance/.test(codeSnapshot);
    const hasAttestation = /HMAC|SHA256|ledger/.test(codeSnapshot);
    
    const missingTags: string[] = [];
    if (!hasVirtueTags) missingTags.push('virtue-tags');
    if (!hasAttestation) missingTags.push('attestation');

    const complianceScore = 1 - (missingTags.length / 2);

    return {
      virtueTagsCovered: hasVirtueTags,
      attestationPresent: hasAttestation,
      missingTags,
      complianceScore
    };
  }

  /**
   * Calculate GI Score using the formula: GI = α*M + β*H + γ*I + δ*E
   */
  private calculateGIScore(
    quality: QualityMetrics,
    drift: DriftAnalysis,
    charter: CharterCompliance
  ): GIScore {
    // Normalize metrics to 0-1 scale
    const M = quality.coverage / 100; // Memory
    const H = 1.0; // Human (assumes human review in PR)
    const I = Math.max(0, 1 - (drift.violations / 10)); // Integrity
    const E = charter.complianceScore; // Ethics

    // Weights: α=0.25, β=0.20, γ=0.30, δ=0.25
    const total = 0.25 * M + 0.20 * H + 0.30 * I + 0.25 * E;

    return {
      memory: M,
      human: H,
      integrity: I,
      ethics: E,
      total: parseFloat(total.toFixed(3)),
      passed: total >= this.config.giThreshold
    };
  }

  /**
   * Generate SHA256 hash of attestation
   */
  private async hashAttestation(attestation: Omit<AtlasAttestation, 'hash'>): Promise<string> {
    const crypto = require('crypto');
    const data = JSON.stringify(attestation);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Seal attestation to Civic Ledger
   */
  private async sealToLedger(attestation: AtlasAttestation): Promise<void> {
    if (!this.config.ledgerUrl || !this.config.ledgerToken) {
      console.warn('⚠️ Ledger not configured, skipping seal');
      return;
    }

    try {
      const response = await fetch(`${this.config.ledgerUrl}/api/attestations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.ledgerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attestation)
      });

      if (response.ok) {
        const result = await response.json() as { id: string };
        console.log(`✅ Sealed to ledger: ${result.id}`);
      } else {
        console.error('❌ Failed to seal to ledger:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Ledger seal error:', error);
    }
  }

  /**
   * Get current cycle identifier
   */
  private getCurrentCycle(): string {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return `C-${dayOfYear}`;
  }

  /**
   * Get current commit hash
   */
  private async getCommitHash(): Promise<string> {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Calculate severity based on violation count
   */
  private calculateSeverity(violations: number): 'low' | 'medium' | 'high' | 'critical' {
    if (violations === 0) return 'low';
    if (violations <= 2) return 'medium';
    if (violations <= 5) return 'high';
    return 'critical';
  }

  /**
   * Generate recommendations based on violations
   */
  private generateRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];

    if (violations.includes('eval(')) {
      recommendations.push('Replace eval() with safer alternatives like JSON.parse()');
    }
    if (violations.includes('dangerouslySetInnerHTML')) {
      recommendations.push('Use DOMPurify or similar sanitization library');
    }
    if (violations.includes('localStorage')) {
      recommendations.push('Use in-memory state management (useState/useReducer)');
    }

    return recommendations;
  }

  /**
   * Resolve provided codebase reference into a merged textual snapshot.
   * Accepts raw code strings, file paths, or directory paths.
   */
  private async resolveCodebaseSnapshot(codebase: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');

    if (!codebase) {
      return '';
    }

    try {
      const stats = fs.statSync(codebase);

      if (stats.isFile()) {
        return fs.readFileSync(codebase, 'utf8');
      }

      if (stats.isDirectory()) {
        const collected: string[] = [];
        const maxFiles = 200;
        const maxFileSize = 200 * 1024; // 200 KB per file snapshot
        const stack: string[] = [codebase];

        while (stack.length && collected.length < maxFiles) {
          const current = stack.pop() as string;
          const entries = fs.readdirSync(current, { withFileTypes: true });

          for (const entry of entries) {
            const entryPath = path.join(current, entry.name);
            const relativePath = path.relative(codebase, entryPath);

            if (relativePath.startsWith('packages/atlas-sentinel') || relativePath.startsWith('sentinels/atlas')) {
              continue;
            }

            if (entry.isDirectory()) {
              if (this.shouldSkipDirectory(entry.name)) {
                continue;
              }
              stack.push(entryPath);
            } else if (entry.isFile()) {
              if (!this.isAllowedExtension(entry.name)) {
                continue;
              }

              const { size } = fs.statSync(entryPath);
              if (size > maxFileSize) {
                continue;
              }

              try {
                const content = fs.readFileSync(entryPath, 'utf8');
                collected.push(`\n/* ${relativePath} */\n${content}`);
              } catch (error) {
                // Ignore read errors to keep audit resilient
              }

              if (collected.length >= maxFiles) {
                break;
              }
            }
          }
        }

        return collected.join('\n');
      }
    } catch (error) {
      // Fall back to treating the provided value as raw code content
    }

    return codebase;
  }

  private shouldSkipDirectory(name: string): boolean {
    const lower = name.toLowerCase();
    return [
      'node_modules',
      '.git',
      '.turbo',
      'dist',
      'build',
      '.next',
      '.cache',
      '__pycache__'
    ].includes(lower) || lower.startsWith('.');
  }

  private isAllowedExtension(filename: string): boolean {
    const path = require('path');
    const ext = path.extname(filename).toLowerCase();
    const allowed = new Set([
      '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.yml', '.yaml', '.sh', '.mjs', '.cjs'
    ]);
    return allowed.has(ext);
  }

  private containsPatternOutsideStrings(source: string, pattern: string): boolean {
    if (!pattern) {
      return false;
    }

    let index = source.indexOf(pattern);

    while (index !== -1) {
      const charBefore = index > 0 ? source[index - 1] : '';

      if (charBefore !== '\'' && charBefore !== '"' && charBefore !== '`') {
        return true;
      }

      index = source.indexOf(pattern, index + pattern.length);
    }

    return false;
  }
}

/**
 * Learning Synthesizer - Extracts patterns from Eve's cycles
 */
export class LearningSynthesizer {
  async synthesizeCycles(cycles: any[]): Promise<any> {
    console.log('🧠 Synthesizing learning from cycles...');

    const wins = cycles.flatMap(c => c.wins || []);
    const blocks = cycles.flatMap(c => c.blocks || []);
    const intents = cycles.flatMap(c => c.tomorrowIntent || []);

    // Pattern detection
    const winPatterns = this.extractPatterns(wins);
    const blockPatterns = this.extractPatterns(blocks);
    const intentPatterns = this.extractPatterns(intents);

    return {
      cycleRange: {
        start: cycles[0]?.cycle,
        end: cycles[cycles.length - 1]?.cycle,
        count: cycles.length
      },
      insights: {
        topWins: winPatterns.slice(0, 5),
        recurringBlocks: blockPatterns.slice(0, 5),
        emergingIntents: intentPatterns.slice(0, 5)
      },
      recommendations: this.generateLearningRecommendations(winPatterns, blockPatterns)
    };
  }

  private extractPatterns(items: string[]): Array<{pattern: string, count: number}> {
    const frequency: Record<string, number> = {};
    
    items.forEach(item => {
      const normalized = item.toLowerCase().trim();
      frequency[normalized] = (frequency[normalized] || 0) + 1;
    });

    return Object.entries(frequency)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }

  private generateLearningRecommendations(
    wins: any[],
    blocks: any[]
  ): string[] {
    const recommendations: string[] = [];

    // If certain wins appear frequently, reinforce them
    if (wins.length > 0 && wins[0].count > 3) {
      recommendations.push(`Continue practices that led to: "${wins[0].pattern}"`);
    }

    // If certain blocks persist, address them
    if (blocks.length > 0 && blocks[0].count > 2) {
      recommendations.push(`Persistent blocker needs attention: "${blocks[0].pattern}"`);
    }

    return recommendations;
  }
}

/**
 * Documentation Generator - Creates living docs from code
 */
export class DocumentationGenerator {
  async generateADR(decision: any): Promise<string> {
    const template = `# ADR-${decision.number}: ${decision.title}

## Status
${decision.status}

## Context
${decision.context}

## Decision
${decision.decision}

## Consequences
${decision.consequences}

## Compliance
- Custos Charter: ${decision.charterCompliant ? '✅' : '❌'}
- GI Score Impact: ${decision.giImpact}

---
*Generated by ATLAS Sentinel*
*Cycle: ${this.getCurrentCycle()}*
`;

    return template;
  }

  async generateCycleSummary(cycle: any): Promise<string> {
    return `# Cycle ${cycle.id} Summary

## Overview
- **Companions Active**: ${cycle.companions.join(', ')}
- **GI Score**: ${cycle.giScore}
- **Duration**: ${cycle.duration}

## Wins 🎉
${cycle.wins.map((w: string) => `- ${w}`).join('\n')}

## Blocks 🚧
${cycle.blocks.map((b: string) => `- ${b}`).join('\n')}

## Tomorrow's Intent 🎯
${cycle.tomorrowIntent.map((i: string) => `- ${i}`).join('\n')}

---
*ATLAS Sentinel - Truth Through Verification*
`;
  }

  private getCurrentCycle(): string {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return `C-${dayOfYear}`;
  }
}

// Default export for convenience
export default AtlasSentinel;


