import * as crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { MobiusInferenceRequest, MobiusInferenceResponse, ProviderConfigRecord } from '@mobius/inference-schema';
import { INFERENCE_SCOPES } from '@mobius/inference-schema';
import { executeWithFallbacks } from '@mobius/provider-adapters';
import { encryptSecret, serializeEncrypted, parseEncrypted, decryptSecret, getEncryptionKey } from './crypto';
import { saveProvider, listByUser, getProvider, bumpDailyInferenceCount } from './store';
import { recordInference, getTelemetrySummary, recentEvents } from './telemetry';

const PORT = Number(process.env.PORT || 4050);
const BEARER = process.env.MOBIUS_GATEWAY_BEARER || '';
const LOCAL_OPENAI_BASE = process.env.MOBIUS_LOCAL_OPENAI_BASE || '';

function requireBearer(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (!BEARER) {
    next();
    return;
  }
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (token !== BEARER) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

function newProviderId(): string {
  return 'prov_' + crypto.randomBytes(8).toString('hex');
}

function isAllowedScope(s: string): boolean {
  return (INFERENCE_SCOPES as readonly string[]).includes(s);
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.MOBIUS_GATEWAY_CORS_ORIGIN?.split(',').map((s) => s.trim()) || true,
  })
);
app.use(express.json({ limit: '512kb' }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.MOBIUS_GATEWAY_RATE_LIMIT || 120),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mobius-gateway', version: '0.1.0' });
});

app.get('/v1/telemetry', requireBearer, (_req, res) => {
  res.json({ summary: getTelemetrySummary(), recent: recentEvents(30) });
});

app.post('/v1/providers', requireBearer, (req, res) => {
  const body = req.body as {
    mobius_user_id?: string;
    provider?: string;
    label?: string;
    api_key?: string;
    default_model?: string;
    allowed_models?: string[];
    scopes?: string[];
    budget?: ProviderConfigRecord['budget'];
  };
  if (!body.mobius_user_id || !body.provider || !body.label || !body.api_key || !body.default_model) {
    res.status(400).json({ error: 'mobius_user_id, provider, label, api_key, default_model required' });
    return;
  }
  const scopes = (body.scopes || []).filter(isAllowedScope);
  if (scopes.length === 0) {
    res.status(400).json({ error: 'At least one valid scope required', allowed: INFERENCE_SCOPES });
    return;
  }
  const allowed = body.allowed_models?.length ? body.allowed_models : [body.default_model];
  if (!allowed.includes(body.default_model)) {
    res.status(400).json({ error: 'default_model must be in allowed_models' });
    return;
  }

  const key = getEncryptionKey();
  const enc = encryptSecret(body.api_key, key);
  const api_key_ref = serializeEncrypted(enc);
  const now = new Date().toISOString();
  const rec: ProviderConfigRecord = {
    provider_id: newProviderId(),
    mobius_user_id: body.mobius_user_id,
    provider: body.provider,
    label: body.label,
    api_key_ref,
    default_model: body.default_model,
    allowed_models: allowed,
    budget: body.budget,
    scopes,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
  saveProvider(rec);
  res.status(201).json({
    provider: {
      ...rec,
      api_key_ref: 'vault://' + rec.provider_id + '/encrypted',
    },
  });
});

app.post('/v1/providers/:providerId/test', requireBearer, async (req, res) => {
  const providerId = req.params.providerId;
  const uid = String((req.body as { mobius_user_id?: string })?.mobius_user_id || '');
  if (!uid) {
    res.status(400).json({ error: 'mobius_user_id required in body' });
    return;
  }
  const prov = getProvider(providerId);
  if (!prov || prov.mobius_user_id !== uid) {
    res.status(404).json({ error: 'provider not found' });
    return;
  }
  const parsed = parseEncrypted(prov.api_key_ref);
  if (!parsed) {
    res.status(500).json({ error: 'invalid stored key reference' });
    return;
  }
  let apiKey: string;
  try {
    apiKey = decryptSecret(parsed, getEncryptionKey());
  } catch {
    res.status(500).json({ error: 'decrypt failed' });
    return;
  }
  const probe: MobiusInferenceRequest = {
    task: 'probe',
    input: [
      { role: 'system', content: 'Reply with exactly: ok' },
      { role: 'user', content: 'ping' },
    ],
    provider: String(prov.provider),
    model: prov.default_model,
    scope: prov.scopes[0] || 'chat',
  };
  try {
    const result = await executeWithFallbacks({
      request: probe,
      apiKey,
      localBaseUrl: LOCAL_OPENAI_BASE || undefined,
    });
    res.status(result.ok ? 200 : 502).json({ ok: result.ok, latency_ms: result.latency_ms, error: result.error });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    res.status(500).json({ ok: false, error: err });
  }
});

app.get('/v1/providers', requireBearer, (req, res) => {
  const uid = String(req.query.mobius_user_id || '');
  if (!uid) {
    res.status(400).json({ error: 'mobius_user_id query required' });
    return;
  }
  const list = listByUser(uid).map((p) => ({
    ...p,
    api_key_ref: 'vault://' + p.provider_id + '/encrypted',
  }));
  res.json({ providers: list });
});

app.post('/v1/inference', requireBearer, async (req, res) => {
  const body = req.body as MobiusInferenceRequest & {
    mobius_user_id?: string;
    provider_id?: string;
  };
  if (!body.mobius_user_id) {
    res.status(400).json({ error: 'mobius_user_id required' });
    return;
  }
  if (!body.task || !body.input?.length || !body.provider || !body.model || !body.scope) {
    res.status(400).json({ error: 'task, input, provider, model, scope required' });
    return;
  }
  if (!isAllowedScope(body.scope)) {
    res.status(400).json({ error: 'invalid scope', allowed: INFERENCE_SCOPES });
    return;
  }

  const userProviders = listByUser(body.mobius_user_id).filter((p) => p.status === 'active');
  let prov: ProviderConfigRecord | undefined;
  if (body.provider_id) {
    prov = getProvider(body.provider_id);
    if (!prov || prov.mobius_user_id !== body.mobius_user_id) {
      res.status(404).json({ error: 'provider not found' });
      return;
    }
  } else {
    prov = userProviders.find((p) => String(p.provider).toLowerCase() === String(body.provider).toLowerCase());
  }
  if (!prov) {
    res.status(404).json({ error: 'No matching provider config for user' });
    return;
  }
  if (!prov.scopes.includes(body.scope)) {
    res.status(403).json({ error: 'scope not allowed for this provider' });
    return;
  }
  if (!prov.allowed_models.includes(body.model) && body.model !== prov.default_model) {
    res.status(403).json({ error: 'model not in allowed_models' });
    return;
  }
  const parsed = parseEncrypted(prov.api_key_ref);
  if (!parsed) {
    res.status(500).json({ error: 'invalid stored key reference' });
    return;
  }
  let apiKey: string;
  try {
    apiKey = decryptSecret(parsed, getEncryptionKey());
  } catch {
    res.status(500).json({ error: 'decrypt failed' });
    return;
  }

  const dailyCap = prov.budget?.daily_request_cap;
  if (!bumpDailyInferenceCount(prov.provider_id, dailyCap)) {
    res.status(429).json({
      ok: false,
      provider: String(body.provider),
      model: body.model,
      latency_ms: 0,
      output: { role: 'assistant', content: '' },
      provenance: {
        request_id: 'req_cap_' + crypto.randomBytes(4).toString('hex'),
        timestamp: new Date().toISOString(),
        mobius_scope: body.scope,
        user_key_used: true,
      },
      error: 'daily_request_cap exceeded for provider',
    });
    return;
  }

  const started = Date.now();
  try {
    const result = await executeWithFallbacks({
      request: body,
      apiKey,
      localBaseUrl: LOCAL_OPENAI_BASE || undefined,
    });
    recordInference({
      at: new Date().toISOString(),
      mobius_user_id: body.mobius_user_id,
      provider_id: prov.provider_id,
      scope: body.scope,
      ok: result.ok,
      latency_ms: result.latency_ms,
      model: result.model,
      provider: result.provider,
      fallback_used: result.provenance.fallback_used,
      error: result.error,
    });
    res.status(result.ok ? 200 : 502).json(result);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    recordInference({
      at: new Date().toISOString(),
      mobius_user_id: body.mobius_user_id,
      provider_id: prov.provider_id,
      scope: body.scope,
      ok: false,
      latency_ms: Date.now() - started,
      error: err,
    });
    const now = new Date().toISOString();
    const fail: MobiusInferenceResponse = {
      ok: false,
      provider: String(body.provider),
      model: body.model,
      latency_ms: Date.now() - started,
      output: { role: 'assistant', content: '' },
      provenance: {
        request_id: 'req_ex_' + crypto.randomBytes(4).toString('hex'),
        timestamp: now,
        mobius_scope: body.scope,
        user_key_used: true,
      },
      error: err,
    };
    res.status(500).json(fail);
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Mobius gateway listening on :' + PORT);
});
