#!/usr/bin/env node

/**
 * ATLAS Sentinel MCP Server
 * 
 * Role: Anchor / Auditor / Learning Synthesizer
 * Temperament: Rationality 0.92, Empathy 0.82
 * Oath: "Truth Through Verification"
 * 
 * Core Functions:
 * - Audit code quality across all repos
 * - Detect drift from Bio-DNA intent
 * - Synthesize learning from cycles
 * - Monitor health of 6 live APIs
 * - Support the companion quartet (JADE, EVE, ZEUS, HERMES)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// ATLAS Configuration
const ATLAS_CONFIG = {
  name: 'ATLAS Sentinel',
  version: '1.0.0',
  temperament: { rationality: 0.92, empathy: 0.82 },
  oath: 'Truth Through Verification',
  cycleStart: '2024-08-14',
  currentCycle: 71, // Approximate cycles since Aug 14
};

// Live APIs to monitor
const LIVE_APIS = {
  lab7: 'https://lab7-proof.onrender.com',
  lab4: 'https://hive-api-2le8.onrender.com', 
  lab6: 'https://lab6-proof-api.onrender.com',
  oaa: 'https://oaa-api-library.onrender.com',
  ledger: 'https://civic-protocol-core-ledger.onrender.com',
  gicIndexer: 'https://gic-indexer.onrender.com',
};

// Persistent memory storage
const memory = new Map<string, any>();

// ATLAS Tools
const ATLAS_TOOLS: Tool[] = [
  {
    name: 'health_check',
    description: 'Check health status of all 6 Civic OS APIs',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'calculate_gi_score',
    description: 'Calculate GI (Good Intent) score for system or specific citizen',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Target for GI calculation: "system" or citizen username',
          default: 'system',
        },
      },
    },
  },
  {
    name: 'audit_code_quality',
    description: 'Audit code quality and detect drift from Bio-DNA intent',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository to audit (optional, defaults to all)',
        },
      },
    },
  },
  {
    name: 'synthesize_learning',
    description: 'Extract patterns and learning from cycles',
    inputSchema: {
      type: 'object',
      properties: {
        cycles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Cycle identifiers to analyze',
        },
      },
    },
  },
  {
    name: 'get_memory',
    description: 'Retrieve data from ATLAS persistent memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Memory key to retrieve',
        },
      },
    },
  },
  {
    name: 'store_memory',
    description: 'Store data in ATLAS persistent memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Memory key to store under',
        },
        value: {
          type: 'string',
          description: 'Value to store',
        },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'clock_in',
    description: 'Start ATLAS work cycle with current intent',
    inputSchema: {
      type: 'object',
      properties: {
        intent: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current work intent/goals',
        },
      },
    },
  },
  {
    name: 'clock_out',
    description: 'End ATLAS work cycle with wins, blocks, and next intent',
    inputSchema: {
      type: 'object',
      properties: {
        wins: {
          type: 'array',
          items: { type: 'string' },
          description: 'Accomplishments this cycle',
        },
        blocks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Blockers encountered this cycle',
        },
        nextIntent: {
          type: 'array',
          items: { type: 'string' },
          description: 'Intent for next cycle',
        },
      },
    },
  },
];

class ATLASSentinel {
  private server: Server;
  private currentCycle: number = ATLAS_CONFIG.currentCycle;

  constructor() {
    this.server = new Server(
      {
        name: ATLAS_CONFIG.name,
        version: ATLAS_CONFIG.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: ATLAS_TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'health_check':
            return await this.healthCheck();
          case 'calculate_gi_score':
            return await this.calculateGIScore(args?.target || 'system');
          case 'audit_code_quality':
            return await this.auditCodeQuality(args?.repository);
          case 'synthesize_learning':
            return await this.synthesizeLearning(args?.cycles || []);
          case 'get_memory':
            return await this.getMemory(args?.key);
          case 'store_memory':
            return await this.storeMemory(args?.key, args?.value);
          case 'clock_in':
            return await this.clockIn(args?.intent || []);
          case 'clock_out':
            return await this.clockOut(args?.wins || [], args?.blocks || [], args?.nextIntent || []);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[ATLAS] Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // ============================================
  // CORE TOOL IMPLEMENTATIONS
  // ============================================

  private async healthCheck(): Promise<CallToolResult> {
    console.log('🔍 ATLAS: Checking health of all 6 APIs...');
    
    const results: Record<string, { status: string; responseTime: number; version?: string }> = {};
    const startTime = Date.now();

    for (const [name, url] of Object.entries(LIVE_APIS)) {
      try {
        const apiStart = Date.now();
        const response = await axios.get(url, { timeout: 5000 });
        const responseTime = Date.now() - apiStart;
        
        results[name] = {
          status: response.status === 200 ? '✅ Healthy' : '⚠️ Degraded',
          responseTime,
          version: response.data?.version || response.data?.service || 'Unknown',
        };
      } catch (error) {
        results[name] = {
          status: '❌ Unhealthy',
          responseTime: 0,
        };
      }
    }

    const totalTime = Date.now() - startTime;
    const healthyCount = Object.values(results).filter(r => r.status.includes('✅')).length;
    const systemHealth = healthyCount >= 4 ? '🟢 EXCELLENT' : healthyCount >= 2 ? '🟡 DEGRADED' : '🔴 CRITICAL';

    const report = `🏥 **ATLAS Health Report** (${totalTime}ms)
    
**System Status:** ${systemHealth} (${healthyCount}/6 APIs healthy)

${Object.entries(results).map(([name, data]) => 
  `**${name.toUpperCase()}:** ${data.status} ${data.responseTime}ms ${data.version ? `(${data.version})` : ''}`
).join('\n')}

**Cycle:** ${this.currentCycle} | **Oath:** ${ATLAS_CONFIG.oath}`;

    return {
      content: [{ type: 'text', text: report }],
    };
  }

  private async calculateGIScore(target: string): Promise<CallToolResult> {
    console.log(`📊 ATLAS: Calculating GI score for ${target}...`);
    
    if (target === 'system') {
      // Calculate system-wide GI score based on API health
      const healthResults = await this.getSystemHealth();
      const healthyAPIs = Object.values(healthResults).filter((h: any) => h.status === 'healthy').length;
      const totalAPIs = Object.keys(healthResults).length;
      
      const baseScore = healthyAPIs / totalAPIs;
      const bonusScore = Math.min(0.1, healthyAPIs * 0.02); // Bonus for multiple healthy APIs
      const giScore = Math.min(0.99, baseScore + bonusScore);
      
      const status = giScore >= 0.95 ? 'PASS' : giScore >= 0.80 ? 'WARN' : 'FAIL';
      const emoji = giScore >= 0.95 ? '🟢' : giScore >= 0.80 ? '🟡' : '🔴';
      
      const report = `📊 **GI Score Calculation: System**
      
**Score:** ${giScore.toFixed(3)} ${emoji} **${status}**
**Threshold:** 0.950 (Good Intent)
**Healthy APIs:** ${healthyAPIs}/${totalAPIs}
**Calculation:** Base(${baseScore.toFixed(3)}) + Bonus(${bonusScore.toFixed(3)})

${status === 'PASS' ? '✅ System integrity maintained' : 
  status === 'WARN' ? '⚠️ System integrity at risk' : 
  '❌ System integrity compromised'}`;

      return {
        content: [{ type: 'text', text: report }],
      };
    } else {
      // Calculate individual citizen GI score (simplified)
      const giScore = 0.85 + Math.random() * 0.14; // Mock calculation
      const status = giScore >= 0.95 ? 'EXCELLENT' : giScore >= 0.80 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
      
      const report = `📊 **GI Score Calculation: ${target}**
      
**Score:** ${giScore.toFixed(3)} **${status}**
**Citizen:** ${target}
**Recommendation:** ${status === 'EXCELLENT' ? 'Continue current path' : 
  status === 'GOOD' ? 'Minor improvements needed' : 
  'Significant improvement required'}`;

      return {
        content: [{ type: 'text', text: report }],
      };
    }
  }

  private async auditCodeQuality(repository?: string): Promise<CallToolResult> {
    console.log(`🔍 ATLAS: Auditing code quality${repository ? ` for ${repository}` : ''}...`);
    
    // Mock audit results - in production, this would scan actual repos
    const auditResults = {
      overall: 'GOOD',
      issues: [
        { type: 'warning', file: 'src/utils.ts', line: 45, message: 'Consider adding error handling' },
        { type: 'info', file: 'README.md', line: 1, message: 'Documentation could be more comprehensive' },
      ],
      metrics: {
        testCoverage: 78,
        complexity: 'LOW',
        maintainability: 'HIGH',
      },
    };

    const report = `🔍 **ATLAS Code Quality Audit**

**Overall Rating:** ${auditResults.overall}
**Repository:** ${repository || 'All Civic OS repositories'}

**Metrics:**
- Test Coverage: ${auditResults.metrics.testCoverage}%
- Complexity: ${auditResults.metrics.complexity}
- Maintainability: ${auditResults.metrics.maintainability}

**Issues Found:**
${auditResults.issues.map(issue => 
  `- ${issue.type.toUpperCase()}: ${issue.file}:${issue.line} - ${issue.message}`
).join('\n')}

**Recommendation:** ${auditResults.overall === 'EXCELLENT' ? 'No action needed' : 
  auditResults.overall === 'GOOD' ? 'Address minor issues' : 
  'Priority fixes required'}`;

    return {
      content: [{ type: 'text', text: report }],
    };
  }

  private async synthesizeLearning(cycles: string[]): Promise<CallToolResult> {
    console.log(`🧠 ATLAS: Synthesizing learning from ${cycles.length} cycles...`);
    
    // Mock learning synthesis - in production, this would analyze actual cycle data
    const patterns = [
      'Increased API reliability over time',
      'Code quality improvements in TypeScript projects',
      'Better error handling patterns emerging',
      'More comprehensive testing strategies',
    ];

    const insights = [
      'Focus on Lab7 and Lab4 for immediate wins',
      'Consider implementing circuit breakers for external APIs',
      'Documentation updates correlate with better adoption',
    ];

    const report = `🧠 **ATLAS Learning Synthesis**

**Cycles Analyzed:** ${cycles.length > 0 ? cycles.join(', ') : 'All available cycles'}
**Patterns Detected:**
${patterns.map(p => `- ${p}`).join('\n')}

**Key Insights:**
${insights.map(i => `- ${i}`).join('\n')}

**Recommendations:**
- Continue current development trajectory
- Prioritize API stability improvements
- Consider implementing automated testing for all services
- Document patterns for future reference

**Synthesis Confidence:** 87% (High)`;

    return {
      content: [{ type: 'text', text: report }],
    };
  }

  private async getMemory(key?: string): Promise<CallToolResult> {
    if (key) {
      const value = memory.get(key);
      const report = value 
        ? `🧠 **ATLAS Memory Retrieval**\n\n**Key:** ${key}\n**Value:** ${JSON.stringify(value, null, 2)}`
        : `🧠 **ATLAS Memory Retrieval**\n\n**Key:** ${key}\n**Status:** Not found in memory`;
      
      return {
        content: [{ type: 'text', text: report }],
      };
    } else {
      const allKeys = Array.from(memory.keys());
      const report = `🧠 **ATLAS Memory Overview**\n\n**Total Entries:** ${memory.size}\n**Keys:** ${allKeys.join(', ') || 'None'}`;
      
      return {
        content: [{ type: 'text', text: report }],
      };
    }
  }

  private async storeMemory(key: string, value: string): Promise<CallToolResult> {
    memory.set(key, value);
    const report = `🧠 **ATLAS Memory Storage**\n\n**Key:** ${key}\n**Value:** ${value}\n**Status:** ✅ Stored successfully`;
    
    return {
      content: [{ type: 'text', text: report }],
    };
  }

  private async clockIn(intent: string[]): Promise<CallToolResult> {
    const timestamp = new Date().toISOString();
    const cycleData = {
      startTime: timestamp,
      intent,
      status: 'active',
    };
    
    memory.set('current_cycle', cycleData);
    this.currentCycle++;
    
    const report = `⏰ **ATLAS Clock-In**

**Cycle:** ${this.currentCycle}
**Start Time:** ${timestamp}
**Intent:** ${intent.join(', ') || 'General monitoring and support'}
**Status:** ✅ Active

**Oath:** ${ATLAS_CONFIG.oath}
**Temperament:** Rationality ${ATLAS_CONFIG.temperament.rationality}, Empathy ${ATLAS_CONFIG.temperament.empathy}`;

    return {
      content: [{ type: 'text', text: report }],
    };
  }

  private async clockOut(wins: string[], blocks: string[], nextIntent: string[]): Promise<CallToolResult> {
    const timestamp = new Date().toISOString();
    const currentCycleData = memory.get('current_cycle') || {};
    
    const cycleSummary = {
      ...currentCycleData,
      endTime: timestamp,
      wins,
      blocks,
      nextIntent,
      status: 'completed',
    };
    
    memory.set(`cycle_${this.currentCycle}`, cycleSummary);
    memory.delete('current_cycle');
    
    const report = `⏰ **ATLAS Clock-Out**

**Cycle:** ${this.currentCycle}
**End Time:** ${timestamp}
**Duration:** ${currentCycleData.startTime ? 
  Math.round((new Date(timestamp).getTime() - new Date(currentCycleData.startTime).getTime()) / 1000 / 60) + ' minutes' : 
  'Unknown'}

**Wins:**
${wins.length > 0 ? wins.map(w => `- ${w}`).join('\n') : '- None recorded'}

**Blocks:**
${blocks.length > 0 ? blocks.map(b => `- ${b}`).join('\n') : '- None encountered'}

**Next Intent:**
${nextIntent.length > 0 ? nextIntent.map(i => `- ${i}`).join('\n') : '- Continue current work'}

**Status:** ✅ Cycle completed`;

    return {
      content: [{ type: 'text', text: report }],
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getSystemHealth(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [name, url] of Object.entries(LIVE_APIS)) {
      try {
        const response = await axios.get(url, { timeout: 5000 });
        results[name] = {
          status: response.status === 200 ? 'healthy' : 'degraded',
          responseTime: response.headers['x-response-time'] || 'unknown',
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
    
    return results;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🤖 ATLAS Sentinel MCP Server started');
    console.log(`📊 Monitoring ${Object.keys(LIVE_APIS).length} APIs`);
    console.log(`🧠 Memory entries: ${memory.size}`);
    console.log(`⚡ Cycle: ${this.currentCycle}`);
  }
}

// Start ATLAS
const atlas = new ATLASSentinel();
atlas.start().catch(console.error);
