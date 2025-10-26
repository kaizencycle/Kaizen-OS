// src/crypto.js
// Helpers for Civic HMAC signing in the browser using Web Crypto API

// base64 encode/decode helpers
function toBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromBase64(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

// Import a secret key for HMAC-SHA256
export async function importSecret(secretB64) {
  const raw = fromBase64(secretB64);
  return await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
}

// Generate a nonce (16 random bytes → base64)
export function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
}

// Sign a message (returns base64 string)
export async function signMessage(secretKey, msg) {
  const enc = new TextEncoder();
  const sigBuf = await crypto.subtle.sign("HMAC", secretKey, enc.encode(msg));
  return toBase64(sigBuf);
}

