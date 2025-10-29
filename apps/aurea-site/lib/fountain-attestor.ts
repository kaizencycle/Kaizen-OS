/**
 * Fountain Attestor
 * Builds attestation records for the Civic GIC Fountain Wallet
 */

import { fetchNetworkGI, fetchControllersGI, avgGI } from './gi-oracle'
import crypto from 'crypto'

export interface FountainAttestation {
  wallet: string
  balance: number
  daily_spend: number
  gi_avg: number
  timestamp: string
  checksum: string
}

async function readOnChainBalance(address: string): Promise<number> {
  // TODO: Connect to blockchain RPC
  // Mock for now
  return 1_000_000
}

async function readDailySpend(): Promise<number> {
  // TODO: Query from contract events
  // Mock for now
  return 5_000
}

function sha3_512(data: string): string {
  return crypto.createHash('sha3-512').update(data).digest('hex')
}

export async function buildFountainAttestation(): Promise<FountainAttestation> {
  const balance = await readOnChainBalance('0xFountain')
  const dailySpend = await readDailySpend()
  const netGI = await fetchNetworkGI()
  const ctlGI = avgGI(await fetchControllersGI())

  const payload = {
    wallet: 'did:gic:civic.fountain',
    balance,
    daily_spend: dailySpend,
    gi_avg: Math.min(netGI, ctlGI),
    timestamp: new Date().toISOString(),
    checksum: '',
  }

  // Generate checksum
  const { checksum, ...data } = payload
  payload.checksum = sha3_512(JSON.stringify(data))

  return payload
}
