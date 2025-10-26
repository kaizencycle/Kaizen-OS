// packages/civic-sdk/src/CivicOSHub.ts
// INTEGRATION HUB - Connects all 6 APIs + GIC Gateway + .gic Registry

/**
 * Kaizen OS Integration Hub
 * Single orchestration point for all Kaizen OS services
 * 
 * Services Connected:
 * 1. Lab7 (OAA Hub) - https://lab7-proof.onrender.com
 * 2. Lab4 (Reflections) - https://hive-api-2le8.onrender.com
 * 3. Lab6 (Citizen Shield) - https://lab6-proof-api.onrender.com
 * 4. OAA-API-Library - https://oaa-api-library.onrender.com
 * 5. Civic Ledger - https://civic-protocol-core-ledger.onrender.com
 * 6. GIC Indexer - https://gic-indexer.onrender.com
 * 7. GIC Gateway (local) - apps/gic-gateway
 * 8. .gic Registry (local) - apps/website-creator
 */

export interface CivicConfig {
  lab7Url: string;
  lab4Url: string;
  lab6Url: string;
  oaaUrl: string;
  ledgerUrl: string;
  gicIndexerUrl: string;
  gicGatewayUrl?: string;
  gicRegistryUrl?: string;
}

export interface GICIdentity {
  username: string;
  domain: string; // e.g., "michael.gic"
  publicKey: string;
  createdAt: string;
  gicBalance: number;
  giScore: number;
}

export interface Attestation {
  hash: string;
  agent: string;
  cycle: string;
  timestamp: string;
  data: any;
}

export class CivicOSHub {
  private config: CivicConfig;

  constructor(config: Partial<CivicConfig> = {}) {
    this.config = {
      lab7Url: config.lab7Url || 'https://lab7-proof.onrender.com',
      lab4Url: config.lab4Url || 'https://hive-api-2le8.onrender.com',
      lab6Url: config.lab6Url || 'https://lab6-proof-api.onrender.com',
      oaaUrl: config.oaaUrl || 'https://oaa-api-library.onrender.com',
      ledgerUrl: config.ledgerUrl || 'https://civic-protocol-core-ledger.onrender.com',
      gicIndexerUrl: config.gicIndexerUrl || 'https://gic-indexer.onrender.com',
      gicGatewayUrl: config.gicGatewayUrl || 'http://localhost:4006',
      gicRegistryUrl: config.gicRegistryUrl || 'http://localhost:3000',
    };
  }

  // ============================================
  // CORE FLOW: Create Citizen with .gic Identity
  // ============================================

  async createCitizen(username: string, intent: string): Promise<GICIdentity> {
    console.log(`🎯 Creating citizen: ${username}`);
    
    try {
      // Step 1: Parse intent via Lab7 (OAA Hub)
      console.log('  1/7 Parsing intent via Lab7...');
      const spec = await this.parseIntent(intent);
      
      // Step 2: Validate via Lab6 (Citizen Shield)
      console.log('  2/7 Validating via Citizen Shield...');
      await this.validateSecurity(spec);
      
      // Step 3: Register .gic domain
      console.log('  3/7 Registering .gic domain...');
      const domain = await this.registerGicDomain(username);
      
      // Step 4: Create identity attestation
      console.log('  4/7 Creating identity attestation...');
      const identity: GICIdentity = {
        username,
        domain: `${username}.gic`,
        publicKey: this.generatePublicKey(),
        createdAt: new Date().toISOString(),
        gicBalance: 0,
        giScore: 1.0, // Start at 1.0
      };
      
      // Step 5: Log reflection via Lab4
      console.log('  5/7 Logging reflection...');
      await this.logReflection({
        note: `Citizen created: ${username}`,
        tag: 'onboarding',
      });
      
      // Step 6: Mint initial GIC (100 UBI)
      console.log('  6/7 Minting initial GIC...');
      await this.mintGIC(username, 100, 'welcome_ubi');
      identity.gicBalance = 100;
      
      // Step 7: Seal to Civic Ledger
      console.log('  7/7 Sealing to Civic Ledger...');
      await this.sealToLedger({
        action: 'citizen_created',
        identity,
        gi_score: 1.0,
      });
      
      console.log(`✅ Citizen created: ${username}.gic`);
      return identity;
      
    } catch (error) {
      console.error(`❌ Failed to create citizen: ${error}`);
      throw error;
    }
  }

  // ============================================
  // SERVICE METHODS
  // ============================================

  // Lab7: Parse Intent
  async parseIntent(intent: string): Promise<any> {
    const response = await fetch(`${this.config.lab7Url}/v1/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    });
    
    if (!response.ok) throw new Error('Lab7 parse failed');
    return response.json();
  }

  // Lab7: Create Attestation
  async createAttestation(data: any): Promise<Attestation> {
    const response = await fetch(`${this.config.lab7Url}/v1/attest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Lab7 attestation failed');
    const result = await response.json() as Attestation;
    return result;
  }

  // Lab4: Log Reflection
  async logReflection(reflection: { note: string; tag: string }): Promise<void> {
    const response = await fetch(`${this.config.lab4Url}/api/reflections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reflection),
    });
    
    if (!response.ok) throw new Error('Lab4 reflection failed');
  }

  // Lab6: Validate Security
  async validateSecurity(spec: any): Promise<boolean> {
    const response = await fetch(`${this.config.lab6Url}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spec),
    });
    
    if (!response.ok) throw new Error('Lab6 validation failed');
    const result = await response.json() as { valid: boolean };
    return result.valid;
  }

  // OAA-API-Library: Get Memory
  async getMemory(query?: string): Promise<any[]> {
    const url = query 
      ? `${this.config.oaaUrl}/api/oaa/memory?q=${encodeURIComponent(query)}`
      : `${this.config.oaaUrl}/api/oaa/memory`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('OAA memory fetch failed');
    const result = await response.json() as any[];
    return result;
  }

  // Civic Ledger: Seal Attestation
  async sealToLedger(data: any): Promise<Attestation> {
    const response = await fetch(`${this.config.ledgerUrl}/api/attestations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Ledger seal failed');
    const result = await response.json() as Attestation;
    return result;
  }

  // Civic Ledger: Verify Attestation
  async verifyAttestation(hash: string): Promise<any> {
    const response = await fetch(
      `${this.config.ledgerUrl}/api/attestations/verify?hash=${hash}`
    );
    
    if (!response.ok) throw new Error('Ledger verification failed');
    return response.json();
  }

  // GIC Indexer: Mint GIC
  async mintGIC(citizen: string, amount: number, reason: string): Promise<void> {
    const response = await fetch(`${this.config.gicIndexerUrl}/api/gic/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizen, amount, reason }),
    });
    
    if (!response.ok) throw new Error('GIC mint failed');
  }

  // GIC Indexer: Get Balance
  async getGICBalance(citizen: string): Promise<number> {
    const response = await fetch(
      `${this.config.gicIndexerUrl}/api/gic/balance/${citizen}`
    );
    
    if (!response.ok) throw new Error('GIC balance fetch failed');
    const result = await response.json() as { balance: number };
    return result.balance;
  }

  // GIC Gateway: Register Domain
  async registerGicDomain(username: string): Promise<string> {
    if (!this.config.gicGatewayUrl) {
      throw new Error('GIC Gateway not configured');
    }
    
    const response = await fetch(`${this.config.gicGatewayUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) throw new Error('GIC domain registration failed');
    const result = await response.json() as { domain: string };
    return result.domain;
  }

  // ============================================
  // HEALTH CHECK - All Services
  // ============================================

  async healthCheck(): Promise<Record<string, boolean>> {
    const services = [
      { name: 'Lab7', url: `${this.config.lab7Url}/healthz` },
      { name: 'Lab4', url: `${this.config.lab4Url}/healthz` },
      { name: 'Lab6', url: `${this.config.lab6Url}/healthz` },
      { name: 'OAA', url: `${this.config.oaaUrl}/healthz` },
      { name: 'Ledger', url: `${this.config.ledgerUrl}/healthz` },
      { name: 'GIC Indexer', url: `${this.config.gicIndexerUrl}/healthz` },
    ];

    const results: Record<string, boolean> = {};

    for (const service of services) {
      try {
        const response = await fetch(service.url, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) 
        });
        results[service.name] = response.ok;
      } catch {
        results[service.name] = false;
      }
    }

    return results;
  }

  // ============================================
  // GI SCORE CALCULATION
  // ============================================

  async calculateGIScore(citizen: string): Promise<number> {
    // Get contributions from Lab7
    // Get reflections from Lab4
    // Get violations from Lab6
    // Calculate: GI = α*M + β*H + γ*I + δ*E
    
    // Simplified for now
    return 0.95;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generatePublicKey(): string {
    // In production, use proper Ed25519 key generation
    return `pub_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// ============================================
// EXAMPLE USAGE
// ============================================

export async function example() {
  const hub = new CivicOSHub();

  // Check all services are healthy
  console.log('Checking service health...');
  const health = await hub.healthCheck();
  console.log('Health:', health);

  // Create a new citizen
  const identity = await hub.createCitizen(
    'michael',
    'I want to join Kaizen OS and contribute to the digital renaissance'
  );

  console.log('Created identity:', identity);

  // Check GIC balance
  const balance = await hub.getGICBalance('michael');
  console.log('GIC Balance:', balance);
}

export default CivicOSHub;


