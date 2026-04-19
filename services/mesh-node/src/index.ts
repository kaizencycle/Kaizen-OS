import express from 'express';
import { defaultBootstrapPeers } from './discovery.js';

const PORT = Number(process.env.PORT || 4060);

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'mobius-mesh-node',
    phase: '2-stub',
    bootstrap_peers: defaultBootstrapPeers().length,
  });
});

app.get('/v1/discovery', (_req, res) => {
  res.json({
    schema: 'MESH_DISCOVERY_V0',
    peers: defaultBootstrapPeers(),
    note: 'libp2p Kademlia/GossipSub not wired in this stub build.',
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`mesh-node listening on :${PORT}`);
});
