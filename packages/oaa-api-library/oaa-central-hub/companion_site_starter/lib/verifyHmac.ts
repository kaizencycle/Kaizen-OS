import crypto from 'crypto';

export function verifyHmac(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const h = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature));
  } catch { return false; }
}

