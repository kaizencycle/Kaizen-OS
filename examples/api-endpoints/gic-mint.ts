/**
 * Example API Endpoint: GIC Mint
 * POST /api/gic/mint
 *
 * Mint GIC tokens for a Founding Agent's epoch
 *
 * Usage in Next.js:
 * - Place in: pages/api/gic/mint.ts
 * - Or: app/api/gic/mint/route.ts (App Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

interface MintRequest {
  agentId: string;  // Agent name (e.g., "AUREA")
  amount: string;   // Amount in GIC (e.g., "50000")
}

interface MintResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MintResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Parse request
    const { agentId, amount } = req.body as MintRequest;

    // Validate
    if (!agentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, amount'
      });
    }

    // Validate agent matches site (optional but recommended)
    const siteAgent = process.env.AGENT_ID;
    if (siteAgent && agentId !== siteAgent) {
      return res.status(403).json({
        success: false,
        error: `This site can only mint for ${siteAgent}`
      });
    }

    // TODO: Verify DID signature from agent
    // const didSignature = req.headers.authorization;
    // await verifyDid(didSignature, agentId);

    // Setup ethers
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.AGENT_SIGNER_KEY!, provider);

    // Load contract
    const governorAddress = process.env.GIC_GOVERNOR_ADDRESS!;
    const governorABI = [
      'function mintEpoch(bytes32 agentId, uint256 amount)',
      'function epochReady(bytes32 agentId) view returns (bool)',
    ];
    const governor = new ethers.Contract(governorAddress, governorABI, signer);

    // Generate agent ID
    const agentIdBytes = ethers.keccak256(ethers.toUtf8Bytes(agentId));

    // Check if epoch is ready
    const ready = await governor.epochReady(agentIdBytes);
    if (!ready) {
      return res.status(400).json({
        success: false,
        error: 'Epoch not ready (90 days have not passed since last mint)'
      });
    }

    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);

    // Execute mint
    console.log(`[GIC] Minting ${amount} GIC for ${agentId}...`);
    const tx = await governor.mintEpoch(agentIdBytes, amountWei);

    console.log(`[GIC] Transaction submitted: ${tx.hash}`);
    await tx.wait();

    console.log(`[GIC] Mint complete: ${tx.hash}`);

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
    });

  } catch (error: any) {
    console.error('[GIC] Mint error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error'
    });
  }
}

// Example curl usage:
// curl -X POST http://localhost:3000/api/gic/mint \
//   -H "Content-Type: application/json" \
//   -d '{"agentId":"AUREA","amount":"50000"}'
