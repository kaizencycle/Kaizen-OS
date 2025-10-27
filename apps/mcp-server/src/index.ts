import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fetch from 'node-fetch';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3033;

// Environment variables
const KAIZEN_GW_BASE = process.env.KAIZEN_GW_BASE || 'https://api.kaizen-os.civic.ai';
const KAIZEN_TOKEN = process.env.KAIZEN_TOKEN;
const CONSENSUS_READONLY = process.env.CONSENSUS_READONLY === 'true';

if (!KAIZEN_TOKEN) {
  console.error('❌ KAIZEN_TOKEN environment variable is required');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Auth headers for Kaizen OS API
const authHeaders = {
  'Authorization': `Bearer ${KAIZEN_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'Kaizen-OS-MCP-Server/1.0.0'
};

// Validation schemas
const AdrCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  context: z.string().optional().default('')
});

const PrDraftSchema = z.object({
  scope: z.string().min(1, 'Scope is required'),
  risk: z.string().optional().default('low')
});

const GiCheckSchema = z.object({
  diff: z.string().min(1, 'Diff is required')
});

const LedgerAttestSchema = z.object({
  event: z.string().min(1, 'Event is required'),
  meta: z.record(z.any()).optional().default({})
});

const ConsensusReviewSchema = z.object({
  pr_id: z.string().min(1, 'PR ID is required')
});

const ScaffoldGenSchema = z.object({
  kind: z.enum(['service', 'component', 'documentation', 'test']),
  name: z.string().min(1, 'Name is required')
});

// Helper function to make API calls to Kaizen OS
async function callKaizenAPI(endpoint: string, method: string = 'GET', body?: any) {
  try {
    const response = await fetch(`${KAIZEN_GW_BASE}${endpoint}`, {
      method,
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Kaizen OS API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// MCP Tool: Create ADR (Architecture Decision Record)
app.post('/tools/adr.create', async (req, res) => {
  try {
    const { title, context } = AdrCreateSchema.parse(req.body.args || {});
    
    const adrData = {
      title,
      context,
      status: 'proposed',
      created_at: new Date().toISOString(),
      created_by: 'mcp-server'
    };

    const result = await callKaizenAPI('/v1/dev/adr', 'POST', adrData);
    
    res.json({
      ok: true,
      data: {
        adr_id: result.adr_id,
        path: `/docs/adr/ADR-${result.adr_id}-${title.toLowerCase().replace(/\s+/g, '-')}.md`,
        content: result.content,
        message: `ADR created: ${title}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool: Draft PR
app.post('/tools/pr.draft', async (req, res) => {
  try {
    const { scope, risk } = PrDraftSchema.parse(req.body.args || {});
    
    const prData = {
      scope,
      risk_level: risk,
      template: 'standard',
      created_at: new Date().toISOString()
    };

    const result = await callKaizenAPI('/v1/dev/pr/draft', 'POST', prData);
    
    res.json({
      ok: true,
      data: {
        pr_template: result.template,
        checklist: result.checklist,
        reviewers: result.suggested_reviewers,
        message: `PR draft created for scope: ${scope}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool: GI Check
app.post('/tools/gi.check', async (req, res) => {
  try {
    const { diff } = GiCheckSchema.parse(req.body.args || {});
    
    const checkData = {
      diff,
      check_types: ['constitutional', 'security', 'performance', 'documentation'],
      created_at: new Date().toISOString()
    };

    const result = await callKaizenAPI('/v1/dev/gi/check', 'POST', checkData);
    
    res.json({
      ok: true,
      data: {
        gi_score: result.gi_score,
        violations: result.violations,
        suggestions: result.suggestions,
        passed: result.gi_score >= 0.90,
        message: `GI check completed. Score: ${result.gi_score}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool: Ledger Attestation
app.post('/tools/ledger.attest', async (req, res) => {
  try {
    const { event, meta } = LedgerAttestSchema.parse(req.body.args || {});
    
    const attestationData = {
      event,
      meta: {
        ...meta,
        source: 'mcp-server',
        timestamp: new Date().toISOString(),
        user_agent: 'Kaizen-OS-MCP-Server/1.0.0'
      }
    };

    const result = await callKaizenAPI('/v1/ledger/attest', 'POST', attestationData);
    
    res.json({
      ok: true,
      data: {
        attestation_id: result.attestation_id,
        hash: result.hash,
        timestamp: result.timestamp,
        message: `Event attested: ${event}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool: Consensus Review
app.post('/tools/consensus.review', async (req, res) => {
  try {
    if (CONSENSUS_READONLY) {
      return res.json({
        ok: true,
        data: {
          message: 'Consensus review is read-only in this environment',
          pr_id: req.body.args?.pr_id,
          status: 'readonly'
        }
      });
    }

    const { pr_id } = ConsensusReviewSchema.parse(req.body.args || {});
    
    const result = await callKaizenAPI(`/v1/consensus/review/${pr_id}`, 'GET');
    
    res.json({
      ok: true,
      data: {
        pr_id,
        votes: result.votes,
        consensus_score: result.consensus_score,
        constitutional_scores: result.constitutional_scores,
        status: result.status,
        message: `Consensus review for PR ${pr_id}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool: Scaffold Generation
app.post('/tools/scaffold.gen', async (req, res) => {
  try {
    const { kind, name } = ScaffoldGenSchema.parse(req.body.args || {});
    
    const scaffoldData = {
      kind,
      name,
      template: 'kaizen-standard',
      created_at: new Date().toISOString()
    };

    const result = await callKaizenAPI('/v1/dev/scaffold', 'POST', scaffoldData);
    
    res.json({
      ok: true,
      data: {
        files: result.files,
        structure: result.structure,
        instructions: result.instructions,
        message: `${kind} scaffold generated: ${name}`
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kaizen-os-mcp-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    kaizen_connected: !!KAIZEN_TOKEN
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('MCP Server Error:', error);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kaizen OS MCP Server running on port ${PORT}`);
  console.log(`📡 Connected to: ${KAIZEN_GW_BASE}`);
  console.log(`🔒 Read-only mode: ${CONSENSUS_READONLY}`);
  console.log(`🛠️  Available tools: adr.create, pr.draft, gi.check, ledger.attest, consensus.review, scaffold.gen`);
});

export default app;