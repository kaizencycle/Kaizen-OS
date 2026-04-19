/**
 * Static bootstrap peers for future libp2p wiring.
 * Replace with DHT once @libp2p/* is adopted in this service.
 */

export interface MeshBootstrapPeer {
  id: string;
  /** multiaddr strings when libp2p is enabled */
  addrs: string[];
}

export function defaultBootstrapPeers(): MeshBootstrapPeer[] {
  return [];
}
