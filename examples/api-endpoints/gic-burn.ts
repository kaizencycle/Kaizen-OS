/**
 * Example API Endpoint: GIC Burn
 * POST /api/gic/burn
 *
 * Burn GIC tokens for supply management
 *
 * Usage in Next.js:
 * - Place in: pages/api/gic/burn.ts
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

interface BurnRequest {
  agentId: string;
  amount: string;
}

interface BurnResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BurnResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { agentId, amount } = req.body as BurnRequest;

    if (!agentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, amount'
      });
    }

    // Validate agent
    const siteAgent = process.env.AGENT_ID;
    if (siteAgent && agentId !== siteAgent) {
      return res.status(403).json({
        success: false,
        error: `This site can only burn for ${siteAgent}`
      });
    }

    // Setup ethers
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.AGENT_SIGNER_KEY!, provider);

    // Load contract
    const governorAddress = process.env.GIC_GOVERNOR_ADDRESS!;
    const governorABI = ['function epochBurn(bytes32 agentId, uint256 amount)'];
    const governor = new ethers.Contract(governorAddress, governorABI, signer);

    // Generate agent ID
    const agentIdBytes = ethers.keccak256(ethers.toUtf8Bytes(agentId));

    // Convert amount
    const amountWei = ethers.parseEther(amount);

    // Execute burn
    console.log(`[GIC] Burning ${amount} GIC for ${agentId}...`);
    const tx = await governor.epochBurn(agentIdBytes, amountWei);

    console.log(`[GIC] Transaction submitted: ${tx.hash}`);
    await tx.wait();

    console.log(`[GIC] Burn complete: ${tx.hash}`);

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
    });

  } catch (error: any) {
    console.error('[GIC] Burn error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error'
    });
  }
}
