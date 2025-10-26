import { ethers } from "ethers";

const ABI = ["function updateRecords(string name, string ipfsHash, bytes32 integrityProof)"];

export async function updateGicRecord({ label, cid, integrityHex }: { label: string, cid: string, integrityHex: string }) {
  const provider = new ethers.JsonRpcProvider(process.env.GIC_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.GIC_REGISTRAR_PRIVATE_KEY!, provider);
  const reg = new ethers.Contract(process.env.GIC_REGISTRY_ADDR!, ABI, wallet);

  const tx = await reg.updateRecords(label.toLowerCase(), cid, integrityHex);
  const receipt = await tx.wait();
  return receipt?.hash;
}


