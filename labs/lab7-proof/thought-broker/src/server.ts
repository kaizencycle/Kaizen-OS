import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { startLoop, getLoop } from './loop.js';
import { healthHandler } from './health.js';
import { AuditLogger } from './audit.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger: pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' }) }));

const PORT = Number(process.env.PORT || 8080);

const policy = {
  maxLoops: Number(process.env.BROKER_MAX_LOOPS || 3),
  tau: Number(process.env.BROKER_SCORE_TAU || 0.92),
  maxSeconds: Number(process.env.BROKER_MAX_SECONDS || 60),
  allowDispatch: String(process.env.ALLOW_DISPATCH || 'false') === 'true'
};

const integration = {
  ledgerBase: process.env.LEDGER_BASE_URL || 'http://localhost:4000',
  ledgerToken: process.env.LEDGER_ADMIN_TOKEN || '',
  cursorUrl: process.env.CURSOR_API_URL || 'https://api.cursor.sh',
  cursorToken: process.env.CURSOR_API_TOKEN || ''
};

app.get('/v1/loop/health', healthHandler);

const StartSchema = z.object({
  cycle: z.string().min(1),
  proposalRef: z.string().min(1),
  specRef: z.string().optional(),
  testsRef: z.string().optional(),
  goal: z.string().min(1),
  models: z.array(z.object({ id: z.enum(['oaa-llm-a','oaa-llm-b','oaa-llm-c']) })).min(1)
});

app.post('/v1/loop/start', async (req, res) => {
  const parsed = StartSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'bad_request', details: parsed.error.issues });
  try {
    const state = await startLoop(parsed.data, policy, integration);
    return res.status(200).json({ ok: true, loopId: state.id, status: state.status, step: state.step });
  } catch (e:any) {
    req.log.error({ err: e }, 'loop_start_failed');
    return res.status(500).json({ ok: false, error: 'loop_start_failed', message: e?.message });
  }
});

app.get('/v1/loop/:id/status', (req, res) => {
  const state = getLoop(req.params.id);
  if (!state) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, status: state.status, step: state.step, score: state.consensus?.score ?? null });
});

app.get('/v1/loop/:id/consensus', (req, res) => {
  const state = getLoop(req.params.id);
  if (!state) return res.status(404).json({ ok: false, error: 'not_found' });
  if (state.status !== 'halted' || !state.consensus) return res.status(409).json({ ok: false, error: 'not_ready' });
  return res.json({
    ok: true,
    consensus: state.consensus,
    attestRef: state.attestRef || null
  });
});

app.get('/v1/loop/:id/audit', (req, res) => {
  const state = getLoop(req.params.id);
  if (!state) return res.status(404).json({ ok: false, error: 'not_found' });
  
  const auditTrail = AuditLogger.generateAuditTrail(state);
  return res.json({ ok: true, auditTrail });
});

app.post('/v1/actions/dispatch/cursor', async (req, res) => {
  // In this skeleton, dispatch happens automatically when allowed.
  // This endpoint is a placeholder to mirror the spec.
  return res.json({ ok: true, note: 'dispatch is auto-run when allowDispatch=true' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`thought-broker listening on :${PORT}`);
});