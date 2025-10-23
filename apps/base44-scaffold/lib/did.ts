export function makeDidFromPubkey(pubkey: string) {
  if (!pubkey) throw new Error('pubkey required');
  return 'did:gic:' + Buffer.from(pubkey).toString('base64url').slice(0, 24);
}
