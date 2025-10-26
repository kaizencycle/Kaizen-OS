import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

/** Verify HMAC signature on incoming webhooks/agent calls */
export function verifyHmac(rawBody: string, sig: string | undefined, secret: string): boolean {
  const mac = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!sig) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function hmacMiddleware(secretEnv = "GATEWAY_HMAC_SECRET") {
  const secret = process.env[secretEnv] || "";
  if (!secret) {
    console.warn(`[gateway] Missing ${secretEnv}; HMAC verification will fail.`);
  }
  return (req: Request, res: Response, next: NextFunction) => {
    const sig = req.header("X-Signature") || req.header("X-Hub-Signature-256");
    const raw = (req as any).rawBody || JSON.stringify(req.body || {});
    if (!verifyHmac(raw, sig, secret)) {
      return res.status(401).json({ ok: false, error: "invalid_signature" });
    }
    return next();
  };
}

