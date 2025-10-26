import crypto from "crypto";

export async function pingGatewayNewPost({ label, cid, proof, sha256 }: { label: string, cid: string, proof: string, sha256: string }) {
  const body = { label, cid, proof, sha256, ts: Date.now() };
  const raw = JSON.stringify(body);
  const sig = crypto.createHmac("sha256", process.env.GATEWAY_HMAC_SECRET || "x").update(raw, "utf8").digest("hex");
  
  const res = await fetch(`${process.env.GIC_GATEWAY_BASE_URL}/events/new-post`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-citizen-sig": sig
    },
    body: raw
  });
  
  if (!res.ok) {
    throw new Error(`Gateway ping failed: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

