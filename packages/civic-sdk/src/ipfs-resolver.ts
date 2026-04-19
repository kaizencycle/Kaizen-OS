/**
 * Kubo-compatible IPFS resolver over the HTTP API (no ipfshttpclient dependency).
 * Use for Phase 1 hybrid reads: Postgres remains authoritative until Civic-Protocol-Core pins.
 *
 * Kubo API: POST `{apiUrl}/api/v0/cat?arg={cid}` (empty body).
 */

export interface IpfsResolverOptions {
  /** Base URL of Kubo node, e.g. `http://127.0.0.1:5001` */
  apiUrl?: string;
  /** Optional gateway for `GET /ipfs/{cid}` reads (public gateways, Pinata, etc.) */
  gatewayUrl?: string;
  /** AbortSignal for fetches */
  signal?: AbortSignal;
}

function joinApi(base: string, path: string): string {
  return base.replace(/\/$/, '') + path;
}

export class IpfsResolver {
  private readonly apiUrl: string;
  private readonly gatewayUrl?: string;
  private readonly signal?: AbortSignal;

  constructor(opts: IpfsResolverOptions = {}) {
    this.apiUrl = opts.apiUrl || process.env.MOBIUS_IPFS_API_URL || 'http://127.0.0.1:5001';
    this.gatewayUrl = opts.gatewayUrl || process.env.MOBIUS_IPFS_GATEWAY_URL;
    this.signal = opts.signal;
  }

  /** Raw bytes from Kubo `cat` API. */
  async cat(cid: string): Promise<Uint8Array> {
    const url = joinApi(this.apiUrl, `/api/v0/cat?arg=${encodeURIComponent(cid)}`);
    const res = await fetch(url, { method: 'POST', signal: this.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`IPFS cat failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf;
  }

  async catJson<T = unknown>(cid: string): Promise<T> {
    const bytes = await this.cat(cid);
    const text = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(text) as T;
  }

  /**
   * Read via HTTP gateway (`/ipfs/CID`). Useful when API is not exposed but a read gateway is.
   */
  async catFromGateway(cid: string): Promise<Uint8Array> {
    const base = this.gatewayUrl;
    if (!base) throw new Error('gatewayUrl not configured');
    const url = base.replace(/\/$/, '') + `/ipfs/${encodeURIComponent(cid)}`;
    const res = await fetch(url, { signal: this.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`IPFS gateway read failed: ${res.status} ${text.slice(0, 200)}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  }
}
