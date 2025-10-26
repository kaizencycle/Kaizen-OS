import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const ABI = [
  "function getDomain(string) view returns (tuple(address owner,string ipfsHash,bytes32 integrityProof,uint256 expiresAt))"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const label = (req.query.label as string || "").toLowerCase();
    if (!label) return res.status(400).json({ ok:false, error: "label_required" });

    const provider = new ethers.JsonRpcProvider(process.env.GIC_RPC_URL!);
    const reg = new ethers.Contract(process.env.GIC_REGISTRY_ADDR!, ABI, provider);
    const d = await reg.getDomain(label);
    if (!d.owner) return res.status(404).json({ ok:false, error:"not_found" });

    return res.status(200).json({
      ok: true,
      label,
      owner: d.owner,
      cid: d.ipfsHash,
      proof: d.integrityProof,
      expiresAt: Number(d.expiresAt)
    });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:e?.message || "resolve_failed" });
  }
}

