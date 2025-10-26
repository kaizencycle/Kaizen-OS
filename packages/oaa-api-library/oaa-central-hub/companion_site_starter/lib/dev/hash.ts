export async function shaHex(text: string) {
  // Browser-safe sha256 helper (Node/Edge runtime supports SubtleCrypto)
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hex;
}
