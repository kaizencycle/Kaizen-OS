import express from "express";
import bodyParser from "body-parser";
import { hmacMiddleware } from "./hmac";

const app = express();
// Preserve raw body for HMAC
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));

// HMAC gate for all agent-originated traffic
app.use("/agent", hmacMiddleware());

// Example routed endpoint controlled by agents (behind gateway)
app.post("/agent/status", (req, res) => {
  // Ensure this logic only touches allowed domains/paths per policy (enforced upstream in your agent)
  res.json({ ok: true, received: req.body, at: new Date().toISOString() });
});

const port = process.env.PORT || 7860;
app.listen(port, () => console.log(`[gateway] listening on :${port}`));
