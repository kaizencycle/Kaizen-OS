import { canonicalOaaKvSignPayload, signOaaKvPayload } from './oaa-signing';

export interface OaaKvWriteInput {
  key: string;
  value: unknown;
  agent: string;
  cycle: string;
  intent?: string;
  /** Chain tip; omit to let OAA resolve latest server-side if supported */
  previousHash?: string | null;
}

export interface OaaKvWriteResult {
  ok: boolean;
  hash?: string;
  previous_hash?: string | null;
  ts?: number;
  error?: string;
}

/**
 * Client for OAA-API-Library `POST /api/oaa/kv` (HMAC body contract).
 * Base URL should be origin only (e.g. `https://oaa.example.com`).
 */
export class OaaKvClient {
  constructor(
    private readonly baseUrl: string,
    private readonly hmacSecret: string
  ) {}

  async write(input: OaaKvWriteInput): Promise<OaaKvWriteResult> {
    const previousHash = input.previousHash ?? null;
    const signable = {
      key: input.key,
      value: input.value,
      agent: input.agent,
      cycle: input.cycle,
      intent: input.intent,
      previousHash,
    };
    const signature = signOaaKvPayload(signable, this.hmacSecret);
    const body = {
      ...signable,
      signature,
    };

    const url = this.baseUrl.replace(/\/$/, '') + '/api/oaa/kv';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as OaaKvWriteResult;
    if (!res.ok) {
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    }
    return json;
  }
}

export { canonicalOaaKvSignPayload };
