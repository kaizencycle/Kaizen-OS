import crypto from "crypto";

export function hmacValid(raw: string, secret: string, provided?: string | null) {
  if (!secret) return false;
  if (!provided) return false;
  const sig = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  // timing-safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
