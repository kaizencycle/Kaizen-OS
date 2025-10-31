import { deliberate, PanelVote } from "./consensus";

export async function submitAttestation(endpoint: string, mediaHash: string, votes: PanelVote[], flags:{
  c2pa:boolean, watermark:boolean, declared:boolean, creatorDid?:string
}) {
  const consensus = deliberate(votes);
  const payload = {
    media_hash: mediaHash,
    c2pa: flags.c2pa,
    watermark_ok: flags.watermark,
    declared_synthetic: flags.declared,
    creator_did: flags.creatorDid,
    delib_votes: [{
      agreement: consensus.agreement,
      votes: consensus.votes,
      label: consensus.label,
      rationale: consensus.rationale
    }]
  };
  const res = await fetch(`${endpoint}/attest`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`attest failed: ${res.status}`);
  return res.json();
}

