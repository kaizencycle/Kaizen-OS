import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

export function getEncryptionKey(): Buffer {
  const raw = process.env.MOBIUS_GATEWAY_ENCRYPTION_KEY || '';
  if (raw.length >= 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  if (raw.length >= 44) {
    const b = Buffer.from(raw, 'base64');
    if (b.length === 32) return b;
  }
  const secret = process.env.MOBIUS_GATEWAY_SECRET || 'mobius-gateway-dev-secret-change-me';
  return crypto.scryptSync(secret, 'mobius-sdk-salt-v1', 32);
}

export function encryptSecret(plaintext: string, key: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: enc.toString('base64'),
  };
}

export function decryptSecret(payload: EncryptedPayload, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(payload.iv, 'base64'), {
    authTagLength: TAG_LEN,
  });
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString(
    'utf8'
  );
}

export function serializeEncrypted(p: EncryptedPayload): string {
  return `enc:v1:${p.iv}:${p.tag}:${p.data}`;
}

export function parseEncrypted(ref: string): EncryptedPayload | null {
  if (!ref.startsWith('enc:v1:')) return null;
  const parts = ref.split(':');
  if (parts.length !== 5) return null;
  return { iv: parts[2], tag: parts[3], data: parts[4] };
}
