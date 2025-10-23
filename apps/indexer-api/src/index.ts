// GIC Indexer API - Placeholder implementation
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'indexer-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Placeholder endpoints
app.get('/gic/balance/:address', (req, res) => {
  res.json({
    address: req.params.address,
    balance: 0,
    timestamp: new Date().toISOString()
  });
});

app.post('/gic/transactions', (req, res) => {
  res.json({
    id: `tx_${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/gic/transactions', (req, res) => {
  res.json([]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GIC Indexer API running on port ${PORT}`);
});

export default app;
