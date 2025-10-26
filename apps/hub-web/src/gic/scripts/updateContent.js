import { ethers } from "ethers";
import fs from "fs";
const [,, name, cid, proofHex] = process.argv;
if (!name || !cid || !proofHex) { console.error("Usage: node scripts/updateContent.js <name> <cid> <integrityHex>"); process.exit(1); }
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const abi = JSON.parse(fs.readFileSync("artifacts/GICRegistry.abi.json","utf8"));
const reg = new ethers.Contract(process.env.REGISTRY_ADDR, abi, wallet);
const tx = await reg.updateRecords(name, cid, proofHex);
console.log("tx:", tx.hash); await tx.wait(); console.log("updated", name);


