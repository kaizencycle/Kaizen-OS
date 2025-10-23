import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3001;
const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL || "https://ledger.example.com";

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "civic-proof-proxy"
  });
});

// Get proof by ID
app.get("/api/proof/:id", async (req, res) => {
  try {
    const proofId = req.params.id;
    
    // Validate proof ID format
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(proofId)) {
      return res.status(400).json({ 
        error: "Invalid proof ID format",
        code: "INVALID_PROOF_ID"
      });
    }

    // Fetch proof from ledger
    const response = await fetch(`${LEDGER_BASE_URL}/ledger/proofs/${encodeURIComponent(proofId)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Civic-Proof-Proxy/1.0.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: "Proof not found",
          code: "PROOF_NOT_FOUND"
        });
      }
      return res.status(response.status).json({ 
        error: "Ledger service error",
        code: "LEDGER_ERROR",
        status: response.status
      });
    }

    const proof = await response.json();
    
    // Validate proof structure
    if (!proof.id || !proof.timestamp || !proof.signature) {
      return res.status(500).json({ 
        error: "Invalid proof structure",
        code: "INVALID_PROOF_STRUCTURE"
      });
    }

    res.json({ 
      ok: true, 
      proof: proof,
      verified_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching proof:", error);
    res.status(500).json({ 
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
});

// Verify proof signature
app.post("/api/verify", async (req, res) => {
  try {
    const { proof, publicKey } = req.body;
    
    if (!proof || !publicKey) {
      return res.status(400).json({ 
        error: "Missing required fields",
        code: "MISSING_FIELDS"
      });
    }

    // Basic validation
    if (!proof.id || !proof.signature || !proof.timestamp) {
      return res.status(400).json({ 
        error: "Invalid proof structure",
        code: "INVALID_PROOF_STRUCTURE"
      });
    }

    // In a real implementation, you would verify the cryptographic signature here
    // For this example, we'll just return a mock verification result
    const isValid = true; // This would be actual signature verification
    
    res.json({ 
      ok: true, 
      verified: isValid,
      verification_timestamp: new Date().toISOString(),
      proof_id: proof.id
    });

  } catch (error) {
    console.error("Error verifying proof:", error);
    res.status(500).json({ 
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
});

// Get proof statistics
app.get("/api/stats", async (req, res) => {
  try {
    // In a real implementation, you would fetch actual statistics
    const stats = {
      total_proofs: 0,
      verified_proofs: 0,
      verification_rate: 0,
      last_updated: new Date().toISOString()
    };

    res.json({ 
      ok: true, 
      stats: stats
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ 
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    code: "INTERNAL_ERROR"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    code: "NOT_FOUND"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Civic Proof Proxy running on port ${PORT}`);
  console.log(`Ledger URL: ${LEDGER_BASE_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;