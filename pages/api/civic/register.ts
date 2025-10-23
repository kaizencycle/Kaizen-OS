import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import crypto from "crypto";

// HMAC guard (Citizen Shield lite)
function verify(sig: string|undefined, payload: string, secret: string) {
  if (!sig) return false;
  const h = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig)); } catch { return false; }
}

const ABI = [
  "function basePriceWei() view returns (uint256)",
  "function register(string name, string ipfsHash, bytes32 integrityProof) payable"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  const raw = JSON.stringify(req.body || {});
  const ok = verify(req.headers["x-citizen-sig"] as string|undefined, raw, process.env.GATEWAY_HMAC_SECRET || "x");
  if (!ok) return res.status(401).json({ ok:false, error:"invalid_signature" });

  try {
    const { label, cid, integrityHex } = req.body as { label: string, cid: string, integrityHex: string };
    if (!label || !cid || !integrityHex) return res.status(400).json({ ok:false, error:"missing_params" });

    const provider = new ethers.JsonRpcProvider(process.env.GIC_RPC_URL!);
    const wallet = new ethers.Wallet(process.env.GIC_REGISTRAR_PRIVATE_KEY!, provider);
    const reg = new ethers.Contract(process.env.GIC_REGISTRY_ADDR!, ABI, wallet);

    const price: bigint = await reg.basePriceWei();
    const tx = await reg.register(label.toLowerCase(), cid, integrityHex, { value: price });
    const receipt = await tx.wait();
    return res.status(200).json({ ok:true, tx: receipt?.hash });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || "register_failed" });
  }
}