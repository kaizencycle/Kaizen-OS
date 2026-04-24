import express, { type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { giStatus, giIngest, giTwa } from "./routes/gi.js";
import { shardsToCreditsRoute, creditsToShardsRoute } from "./routes/convert.js";
import { mintAttestRoute, burnAttestRoute } from "./routes/attest.js";
import { ubiPreviewRoute } from "./routes/ubi.js";
import { ubiEligibilityRoute } from "./routes/eligibility.js";
import { attestEpochRoute } from "./routes/attest_epoch.js";
import { listEpochAttestations } from "./routes/attest_list.js";
import { startUbiRun, listUbiRuns, getUbiRun, settleUbiRun } from "./routes/ubi_run.js";
import { listOutbox, enqueueRun, dispatchNow } from "./routes/settlement.js";
import { getSystemHealth } from "./utils/health.js";
import { ingestSentiment, getSentimentSummary } from "./routes/sentiment.js";
import { listQuarantineRoute, reattestRoute, finalizeRoute } from "./routes/seal.js";

const app = express();

// Rate limiting for API endpoints
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(apiRateLimiter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "civic-ledger",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// System health (detailed)
app.get("/system/health", async (_req: Request, res: Response) => {
  try {
    const health = await getSystemHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GI endpoint
app.get("/gi", giStatus);
app.get("/gi/twa", giTwa);
app.post("/gi/ingest", giIngest);

// Conversion endpoints
app.post("/convert/shards-to-credits", shardsToCreditsRoute);
app.post("/convert/credits-to-shards", creditsToShardsRoute);

// Attestation endpoints (dual-signature required)
app.post("/attest/mint", mintAttestRoute);
app.post("/attest/burn", burnAttestRoute);
app.post("/attest/epoch", attestEpochRoute);
app.get("/attest/epoch/list", listEpochAttestations);

// UBI endpoints
app.get("/ubi/preview", ubiPreviewRoute);
app.post("/ubi/preview", ubiPreviewRoute);
app.get("/ubi/eligibility", ubiEligibilityRoute);
app.post("/ubi/eligibility", ubiEligibilityRoute);

// UBI worker routes
app.post("/ubi/run", startUbiRun);         // start/prepare a monthly run
app.get("/ubi/runs", listUbiRuns);         // list runs
app.get("/ubi/run/:id", getUbiRun);        // inspect a run + payouts
app.post("/ubi/run/:id/settle", settleUbiRun); // mark queued payouts as sent (or subset)

// Settlement routes
app.get("/settlement/outbox", listOutbox);
app.post("/settlement/enqueue", enqueueRun);
app.post("/settlement/dispatch", dispatchNow);

// Sentiment endpoints
app.post("/ingest/sentiment", ingestSentiment);
app.get("/sentiment/summary", getSentimentSummary);

// Seal reconciliation endpoints
app.get("/seal/quarantine", listQuarantineRoute);
app.post("/seal/reattest", reattestRoute);
app.post("/seal/finalize", finalizeRoute);

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    available_routes: [
      "GET /health",
      "GET /system/health",
      "GET /gi",
      "GET /gi/twa",
      "POST /gi/ingest",
      "POST /convert/shards-to-credits",
      "POST /convert/credits-to-shards",
      "POST /attest/mint",
      "POST /attest/burn",
      "POST /attest/epoch",
      "GET /attest/epoch/list",
      "GET /ubi/preview",
      "POST /ubi/preview",
      "GET /ubi/eligibility",
      "POST /ubi/eligibility",
      "POST /ubi/run",
      "GET /ubi/runs",
      "GET /ubi/run/:id",
      "POST /ubi/run/:id/settle",
      "GET /settlement/outbox",
      "POST /settlement/enqueue",
      "POST /settlement/dispatch",
      "POST /ingest/sentiment",
      "GET /sentiment/summary",
      "GET /seal/quarantine",
      "POST /seal/reattest",
      "POST /seal/finalize"
    ]
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;
