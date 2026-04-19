/**
 * Minimal LWW (last-write-wins) map for mesh ledger entries — Phase 2 stub.
 * Full libp2p GossipSub + DHT belongs in services/mesh-node when deps are added.
 */

export interface LedgerEntryPayload {
  id: string;
  /** ISO timestamp of last writer */
  updatedAt: string;
  /** Arbitrary JSON-serializable body */
  body: Record<string, unknown>;
}

export class CRDTLedger {
  private readonly map = new Map<string, LedgerEntryPayload>();

  merge(remote: LedgerEntryPayload): void {
    const cur = this.map.get(remote.id);
    if (!cur) {
      this.map.set(remote.id, remote);
      return;
    }
    const a = Date.parse(cur.updatedAt);
    const b = Date.parse(remote.updatedAt);
    if (b >= a) {
      this.map.set(remote.id, remote);
    }
  }

  get(id: string): LedgerEntryPayload | undefined {
    return this.map.get(id);
  }

  values(): LedgerEntryPayload[] {
    return [...this.map.values()];
  }

  snapshot(): Record<string, LedgerEntryPayload> {
    const out: Record<string, LedgerEntryPayload> = {};
    for (const [k, v] of this.map) {
      out[k] = v;
    }
    return out;
  }
}
