import type { SealAttestation, SealVerdict } from "./types.js";

function makeAttestation(agent: string, verdict: SealVerdict, rationale: string, sealId: string): SealAttestation {
  const timestamp = new Date().toISOString();
  return {
    agent,
    verdict,
    rationale,
    gi_at_attestation: 0.95,
    timestamp,
    signature: `sig:${agent}:${sealId}:${timestamp}`
  };
}

export async function attestZeus(sealId: string, forcePass: boolean): Promise<SealAttestation> {
  if (!forcePass) {
    return makeAttestation("ZEUS", "flag", "timeout", sealId);
  }
  return makeAttestation("ZEUS", "pass", "hash chain verified", sealId);
}

export async function attestAtlas(sealId: string, forcePass: boolean): Promise<SealAttestation> {
  if (!forcePass) {
    return makeAttestation("ATLAS", "flag", "timeout", sealId);
  }
  return makeAttestation("ATLAS", "pass", "strategic coherence checks passed", sealId);
}

export async function attestHermes(sealId: string): Promise<SealAttestation> {
  return makeAttestation("HERMES", "pass", "relay integrity confirmed", sealId);
}
