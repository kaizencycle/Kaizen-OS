// Kaizen OS Gateway - Orchestrates all 6 APIs into unified operations
import { 
  Lab7Client, 
  Lab4Client, 
  Lab6Client, 
  OAAAPIClient, 
  CivicLedgerClient, 
  GICIndexerClient 
} from './clients';
import { LedgerEntry, GICTransaction, EOMMReflection, ServiceHealth } from './types';

export interface CitizenIdentity {
  username: string;
  gicDomain: string;
  gicBalance: number;
  giScore: number;
  attestations: LedgerEntry[];
  reflections: EOMMReflection[];
  createdAt: string;
}

export interface CitizenCreationResult {
  identity: CitizenIdentity;
  attestation: LedgerEntry;
  gicTransaction: GICTransaction;
  success: boolean;
  errors?: string[];
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  giScore: number;
  lastCheck: string;
}

export class CivicOSGateway {
  private lab7: Lab7Client;
  private lab4: Lab4Client;
  private lab6: Lab6Client;
  private oaa: OAAAPIClient;
  private ledger: CivicLedgerClient;
  private gic: GICIndexerClient;

  constructor(config?: {
    lab7Url?: string;
    lab4Url?: string;
    lab6Url?: string;
    oaaUrl?: string;
    ledgerUrl?: string;
    gicUrl?: string;
    apiKey?: string;
  }) {
    this.lab7 = new Lab7Client(config?.lab7Url, config?.apiKey);
    this.lab4 = new Lab4Client(config?.lab4Url, config?.apiKey);
    this.lab6 = new Lab6Client(config?.lab6Url, config?.apiKey);
    this.oaa = new OAAAPIClient(config?.oaaUrl, config?.apiKey);
    this.ledger = new CivicLedgerClient(config?.ledgerUrl, config?.apiKey);
    this.gic = new GICIndexerClient(config?.gicUrl, config?.apiKey);
  }

  /**
   * Create a new .gic citizen - the complete onboarding flow
   */
  async createCitizen(intent: string, username: string): Promise<CitizenCreationResult> {
    try {
      // 1. Get Lab7 status (OAA Hub)
      console.log('🔍 Checking Lab7 OAA Hub...');
      const lab7Status = await this.lab7.getStatus();
      console.log(`   Lab7 Status: ${lab7Status.ok ? '✅' : '❌'} ${lab7Status.service} v${lab7Status.version}`);
      
      // 2. Validate via Lab6 (Citizen Shield) - using mock for now
      console.log('🛡️ Validating via Lab6...');
      const shieldValidation = await this.lab6.validateRequest('citizen_creation', {
        username,
        intent
      });
      
      if (!shieldValidation.valid) {
        return {
          identity: {} as CitizenIdentity,
          attestation: {} as LedgerEntry,
          gicTransaction: {} as GICTransaction,
          success: false,
          errors: shieldValidation.errors
        };
      }

      // 3. Create .gic domain identity
      const gicDomain = `${username}.gic`;
      console.log(`🏠 Creating .gic domain: ${gicDomain}`);

      // 4. Log reflection via Lab4 (E.O.M.M.)
      console.log('📝 Logging reflection via Lab4...');
      const lab4Status = await this.lab4.getStatus();
      console.log(`   Lab4 Status: ${lab4Status.status} v${lab4Status.version}`);
      
      const reflection = await this.lab4.createReflection({
        note: `Citizen creation: ${intent}`,
        tag: 'onboarding',
        cycle: this.getCurrentCycle()
      });

      // 5. Calculate GI Score (simplified for now)
      const giScore = await this.calculateGIScore({ intent, lab7Status, lab4Status });

      // 6. Seal to Civic Ledger
      console.log('🔒 Sealing to Civic Ledger...');
      const attestation = await this.ledger.seal({
        action: 'citizen_created',
        data: {
          username,
          gicDomain,
          intent,
          giScore,
          lab7Status,
          lab4Status
        },
        service: 'civic-os-gateway',
        gi_score: giScore
      });

      // 7. Issue initial GIC (UBI)
      console.log('💰 Issuing initial GIC...');
      const gicTransaction = await this.gic.mint({
        citizen: username,
        amount: 100, // UBI base amount
        reason: 'welcome_ubi'
      });

      // 8. Create citizen identity
      const identity: CitizenIdentity = {
        username,
        gicDomain,
        gicBalance: 100,
        giScore,
        attestations: [attestation],
        reflections: [reflection],
        createdAt: new Date().toISOString()
      };

      console.log('✅ Citizen created successfully!');
      return {
        identity,
        attestation,
        gicTransaction,
        success: true
      };

    } catch (error) {
      console.error('❌ Error creating citizen:', error);
      return {
        identity: {} as CitizenIdentity,
        attestation: {} as LedgerEntry,
        gicTransaction: {} as GICTransaction,
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get system health across all 6 APIs
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const healthChecks = await Promise.allSettled([
        this.lab7.getHealth(),
        this.lab4.getHealth(),
        this.lab6.getHealth(),
        this.oaa.getHealth(),
        this.ledger.getHealth(),
        this.gic.getHealth()
      ]);

      const services: ServiceHealth[] = [];
      let healthyCount = 0;
      let totalGiScore = 0;

      healthChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          services.push(result.value);
          if (result.value.status === 'healthy') {
            healthyCount++;
            totalGiScore += result.value.integrity || 0.95;
          }
        } else {
          services.push({
            service: `service-${index}`,
            status: 'unhealthy',
            responseTime: 0,
            memoryUsage: 0,
            errorRate: 100,
            lastCheck: new Date().toISOString(),
            uptime: 0
          });
        }
      });

      const overallGiScore = healthyCount > 0 ? totalGiScore / healthyCount : 0;
      const overall = healthyCount >= 5 ? 'healthy' : healthyCount >= 3 ? 'degraded' : 'unhealthy';

      return {
        overall,
        services,
        giScore: overallGiScore,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        overall: 'unhealthy',
        services: [],
        giScore: 0,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Get citizen profile with all data
   */
  async getCitizenProfile(username: string): Promise<CitizenIdentity | null> {
    try {
      // Get GIC balance
      const gicBalance = await this.gic.getBalance(username);
      
      // Get attestations from ledger
      const attestations = await this.ledger.getEntries('civic-os-gateway', 100);
      const citizenAttestations = attestations.filter(a => 
        a.data?.username === username || a.data?.gicDomain === `${username}.gic`
      );

      // Get reflections
      const reflections = await this.lab4.getReflections(undefined, 100);
      const citizenReflections = reflections.filter(r => 
        r.tags?.includes('citizen') || r.content?.includes(username)
      );

      // Calculate current GI Score
      const giScore = await this.calculateCitizenGIScore(username);

      return {
        username,
        gicDomain: `${username}.gic`,
        gicBalance,
        giScore,
        attestations: citizenAttestations,
        reflections: citizenReflections,
        createdAt: citizenAttestations[0]?.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting citizen profile:', error);
      return null;
    }
  }

  /**
   * Cast a governance vote
   */
  async castVote(citizen: string, proposalId: string, choice: string): Promise<{
    success: boolean;
    attestation?: LedgerEntry;
    errors?: string[];
  }> {
    try {
      // Check GI Score (must be ≥ 0.92 to vote)
      const giScore = await this.calculateCitizenGIScore(citizen);
      if (giScore < 0.92) {
        return {
          success: false,
          errors: ['GI Score too low to vote (minimum 0.92)']
        };
      }

      // Get GIC balance for vote weight
      const balance = await this.gic.getBalance(citizen);

      // Seal vote to ledger
      const attestation = await this.ledger.seal({
        action: 'vote_cast',
        data: {
          citizen,
          proposal: proposalId,
          choice,
          weight: balance,
          gi_score: giScore
        },
        service: 'civic-os-gateway',
        gi_score: giScore
      });

      return {
        success: true,
        attestation
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Calculate GI Score for citizen creation
   */
  private async calculateGIScore(data: { intent: string; lab7Status: any; lab4Status: any }): Promise<number> {
    // Simplified GI Score calculation
    // In reality, this would be more complex
    let score = 0.95; // Base score

    // Add points for API health
    if (data.lab7Status?.ok) score += 0.02;
    if (data.lab4Status?.status === 'API is live') score += 0.02;
    
    // Add points for intent quality
    if (data.intent && data.intent.length > 10) score += 0.01;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate GI Score for citizen
   */
  private async calculateCitizenGIScore(username: string): Promise<number> {
    try {
      // Get recent attestations
      const attestations = await this.ledger.getEntries('civic-os-gateway', 50);
      const citizenAttestations = attestations.filter(a => 
        a.data?.username === username || a.data?.citizen === username
      );

      if (citizenAttestations.length === 0) return 0.95; // Default for new citizens

      // Calculate average GI Score from attestations
      const totalGi = citizenAttestations.reduce((sum, a) => sum + (a.integrity || 0.95), 0);
      return totalGi / citizenAttestations.length;
    } catch (error) {
      return 0.95; // Default fallback
    }
  }

  /**
   * Get current cycle identifier
   */
  private getCurrentCycle(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `C-${year}${month}`;
  }

  /**
   * Get all 6 API clients for direct access
   */
  getClients() {
    return {
      lab7: this.lab7,
      lab4: this.lab4,
      lab6: this.lab6,
      oaa: this.oaa,
      ledger: this.ledger,
      gic: this.gic
    };
  }
}


