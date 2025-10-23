import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LedgerEntry, GICTransaction, ServiceHealth, OAAIntent, DeliberationProof, ShieldPolicy, EOMMReflection, GICAttestation, IntegrityCheck } from './types';

// Base client class for all Civic OS services
export abstract class CivicClient {
  protected client: AxiosInstance;
  protected baseUrl: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
  }

  protected async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<ServiceHealth> {
    return this.request<ServiceHealth>('GET', '/healthz');
  }
}

// Ledger API Client
export class LedgerClient extends CivicClient {
  constructor(baseUrl: string, apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async createEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'proof'>): Promise<LedgerEntry> {
    return this.request<LedgerEntry>('POST', '/entries', entry);
  }

  async getEntry(id: string): Promise<LedgerEntry> {
    return this.request<LedgerEntry>('GET', `/entries/${id}`);
  }

  async listEntries(service?: string, limit = 100): Promise<LedgerEntry[]> {
    const params = new URLSearchParams();
    if (service) params.append('service', service);
    params.append('limit', limit.toString());
    return this.request<LedgerEntry[]>('GET', `/entries?${params}`);
  }

  async attestIntegrity(hash: string, service: string): Promise<{ success: boolean; proof: string }> {
    return this.request<{ success: boolean; proof: string }>('POST', '/attest', { hash, service });
  }
}

// Indexer API Client
export class IndexerClient extends CivicClient {
  constructor(baseUrl: string, apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async getGICBalance(address: string): Promise<number> {
    return this.request<number>('GET', `/gic/balance/${address}`);
  }

  async createTransaction(transaction: Omit<GICTransaction, 'id' | 'timestamp'>): Promise<GICTransaction> {
    return this.request<GICTransaction>('POST', '/gic/transactions', transaction);
  }

  async listTransactions(address?: string, limit = 100): Promise<GICTransaction[]> {
    const params = new URLSearchParams();
    if (address) params.append('address', address);
    params.append('limit', limit.toString());
    return this.request<GICTransaction[]>('GET', `/gic/transactions?${params}`);
  }
}

// EOMM API Client
export class EOMMClient extends CivicClient {
  constructor(baseUrl: string, apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async createReflection(reflection: Omit<EOMMReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<EOMMReflection> {
    return this.request<EOMMReflection>('POST', '/reflections', reflection);
  }

  async getReflection(id: string): Promise<EOMMReflection> {
    return this.request<EOMMReflection>('GET', `/reflections/${id}`);
  }

  async listReflections(cycle?: string, limit = 100): Promise<EOMMReflection[]> {
    const params = new URLSearchParams();
    if (cycle) params.append('cycle', cycle);
    params.append('limit', limit.toString());
    return this.request<EOMMReflection[]>('GET', `/reflections?${params}`);
  }
}

// Shield API Client
export class ShieldClient extends CivicClient {
  constructor(baseUrl: string, apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async createPolicy(policy: Omit<ShieldPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShieldPolicy> {
    return this.request<ShieldPolicy>('POST', '/policies', policy);
  }

  async getPolicy(id: string): Promise<ShieldPolicy> {
    return this.request<ShieldPolicy>('GET', `/policies/${id}`);
  }

  async listPolicies(enabled?: boolean): Promise<ShieldPolicy[]> {
    const params = new URLSearchParams();
    if (enabled !== undefined) params.append('enabled', enabled.toString());
    return this.request<ShieldPolicy[]>('GET', `/policies?${params}`);
  }

  async validateRequest(service: string, request: any): Promise<{ valid: boolean; errors: string[] }> {
    return this.request<{ valid: boolean; errors: string[] }>('POST', '/validate', { service, request });
  }
}

// Broker API Client
export class BrokerClient extends CivicClient {
  constructor(baseUrl: string, apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async createIntent(intent: Omit<OAAIntent, 'id' | 'createdAt' | 'updatedAt'>): Promise<OAAIntent> {
    return this.request<OAAIntent>('POST', '/intents', intent);
  }

  async getIntent(id: string): Promise<OAAIntent> {
    return this.request<OAAIntent>('GET', `/intents/${id}`);
  }

  async processIntent(id: string): Promise<DeliberationProof> {
    return this.request<DeliberationProof>('POST', `/intents/${id}/process`);
  }

  async getDeliberationProof(id: string): Promise<DeliberationProof> {
    return this.request<DeliberationProof>('GET', `/deliberations/${id}`);
  }
}

// Lab7 (OAA Hub) Client - Parses human intent → JSON spec · tests · attestations
export class Lab7Client extends CivicClient {
  constructor(baseUrl: string = 'https://lab7-proof.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async getStatus(): Promise<{ ok: boolean; service: string; version: string; endpoints: any }> {
    return this.request<{ ok: boolean; service: string; version: string; endpoints: any }>('GET', '/');
  }

  async verifyOAA(data: any): Promise<any> {
    return this.request<any>('POST', '/oaa/verify', data);
  }

  async getStateSnapshot(): Promise<any> {
    return this.request<any>('GET', '/oaa/state/snapshot');
  }

  async anchorState(data: any): Promise<any> {
    return this.request<any>('POST', '/oaa/state/anchor', data);
  }

  async getHealth(): Promise<ServiceHealth> {
    try {
      const status = await this.getStatus();
      return {
        service: 'lab7-oaa-hub',
        status: status.ok ? 'healthy' : 'unhealthy',
        responseTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        lastCheck: new Date().toISOString(),
        uptime: 100,
        integrity: 0.95
      };
    } catch (error) {
      return {
        service: 'lab7-oaa-hub',
        status: 'unhealthy',
        responseTime: 0,
        memoryUsage: 0,
        errorRate: 100,
        lastCheck: new Date().toISOString(),
        uptime: 0,
        integrity: 0
      };
    }
  }
}

// Lab4 (E.O.M.M. Reflections) Client - Command Ledger reflections
export class Lab4Client extends CivicClient {
  constructor(baseUrl: string = 'https://hive-api-2le8.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async getStatus(): Promise<{ status: string; message: string; version: string }> {
    return this.request<{ status: string; message: string; version: string }>('GET', '/');
  }

  async createReflection(reflection: {
    note: string;
    tag: string;
    cycle?: string;
  }): Promise<EOMMReflection> {
    // Mock reflection creation for now since API only accepts GET
    return {
      id: `reflection-${Date.now()}`,
      cycle: reflection.cycle || this.getCurrentCycle(),
      title: reflection.note.substring(0, 50),
      content: reflection.note,
      insights: [`Reflection created for ${reflection.tag}`],
      actions: ['Citizen onboarding completed'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [reflection.tag]
    };
  }

  private getCurrentCycle(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `C-${year}${month}`;
  }

  async getReflections(cycle?: string, limit = 100): Promise<EOMMReflection[]> {
    const params = new URLSearchParams();
    if (cycle) params.append('cycle', cycle);
    params.append('limit', limit.toString());
    return this.request<EOMMReflection[]>('GET', `/reflections?${params}`);
  }

  async getHealth(): Promise<ServiceHealth> {
    try {
      const status = await this.getStatus();
      return {
        service: 'lab4-reflections',
        status: status.status === 'API is live' ? 'healthy' : 'unhealthy',
        responseTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        lastCheck: new Date().toISOString(),
        uptime: 100,
        integrity: 0.95
      };
    } catch (error) {
      return {
        service: 'lab4-reflections',
        status: 'unhealthy',
        responseTime: 0,
        memoryUsage: 0,
        errorRate: 100,
        lastCheck: new Date().toISOString(),
        uptime: 0,
        integrity: 0
      };
    }
  }
}

// Lab6 (Citizen Shield) Client - Security perimeter, policy enforcement
export class Lab6Client extends CivicClient {
  constructor(baseUrl: string = 'https://lab6-proof-api.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async validateRequest(service: string, request: any): Promise<{ valid: boolean; errors: string[] }> {
    // For now, return a mock validation since the API isn't responding
    return {
      valid: true,
      errors: []
    };
  }

  async createPolicy(policy: Omit<ShieldPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShieldPolicy> {
    // Mock policy creation for now
    return {
      ...policy,
      id: `policy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getPolicies(): Promise<ShieldPolicy[]> {
    // Return empty array for now
    return [];
  }

  async getHealth(): Promise<ServiceHealth> {
    return {
      service: 'lab6-citizen-shield',
      status: 'unhealthy',
      responseTime: 0,
      memoryUsage: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      integrity: 0
    };
  }
}

// OAA API Library Client - Eve's cycles, HMAC memory, companion logs
export class OAAAPIClient extends CivicClient {
  constructor(baseUrl: string = 'https://oaa-api-library.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async getEveCycles(limit = 100): Promise<any[]> {
    // Mock data for now
    return [];
  }

  async createEveCycle(cycle: any): Promise<any> {
    // Mock cycle creation
    return {
      id: `cycle-${Date.now()}`,
      ...cycle,
      createdAt: new Date().toISOString()
    };
  }

  async getHMACMemory(citizen: string): Promise<any[]> {
    // Mock memory data
    return [];
  }

  async createHMACMemory(memory: any): Promise<any> {
    // Mock memory creation
    return {
      id: `memory-${Date.now()}`,
      ...memory,
      createdAt: new Date().toISOString()
    };
  }

  async getCompanionLogs(companion: string, limit = 100): Promise<any[]> {
    // Mock companion logs
    return [];
  }

  async getHealth(): Promise<ServiceHealth> {
    return {
      service: 'oaa-api-library',
      status: 'unhealthy',
      responseTime: 0,
      memoryUsage: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      integrity: 0
    };
  }
}

// Civic Ledger Client - Proof-of-Integrity ledger, immutable record
export class CivicLedgerClient extends CivicClient {
  constructor(baseUrl: string = 'https://civic-protocol-core-ledger.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async seal(data: {
    action: string;
    data: any;
    service?: string;
    gi_score?: number;
  }): Promise<LedgerEntry> {
    // Mock ledger entry for now
    const hash = `hash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: `entry-${Date.now()}`,
      hash,
      timestamp: new Date().toISOString(),
      service: data.service || 'civic-os-gateway',
      action: data.action,
      data: data.data,
      integrity: data.gi_score || 0.95,
      proof: `proof-${hash}`
    };
  }

  async getEntry(hash: string): Promise<LedgerEntry> {
    // Mock entry retrieval
    return {
      id: `entry-${hash}`,
      hash,
      timestamp: new Date().toISOString(),
      service: 'civic-os-gateway',
      action: 'mock',
      data: {},
      integrity: 0.95,
      proof: `proof-${hash}`
    };
  }

  async getEntries(service?: string, limit = 100): Promise<LedgerEntry[]> {
    // Mock entries
    return [];
  }

  async attestIntegrity(hash: string, service: string): Promise<{ success: boolean; proof: string }> {
    // Mock attestation
    return {
      success: true,
      proof: `attestation-${hash}-${Date.now()}`
    };
  }

  async getHealth(): Promise<ServiceHealth> {
    return {
      service: 'civic-ledger',
      status: 'unhealthy',
      responseTime: 0,
      memoryUsage: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      integrity: 0
    };
  }
}

// GIC Indexer Client - GIC tracking, UBI distribution
export class GICIndexerClient extends CivicClient {
  constructor(baseUrl: string = 'https://gic-indexer.onrender.com', apiKey?: string) {
    super(baseUrl, apiKey);
  }

  async getBalance(citizen: string): Promise<number> {
    // Mock balance for now
    return 100; // Default UBI amount
  }

  async mint(data: {
    citizen: string;
    amount: number;
    reason: string;
  }): Promise<GICTransaction> {
    // Mock GIC minting
    return {
      id: `tx-${Date.now()}`,
      from: 'system',
      to: data.citizen,
      amount: data.amount,
      timestamp: new Date().toISOString(),
      type: 'credit',
      description: data.reason,
      integrity: 0.95
    };
  }

  async transfer(data: {
    from: string;
    to: string;
    amount: number;
    reason: string;
  }): Promise<GICTransaction> {
    // Mock GIC transfer
    return {
      id: `tx-${Date.now()}`,
      from: data.from,
      to: data.to,
      amount: data.amount,
      timestamp: new Date().toISOString(),
      type: 'transfer',
      description: data.reason,
      integrity: 0.95
    };
  }

  async getTransactions(citizen?: string, limit = 100): Promise<GICTransaction[]> {
    // Mock transactions
    return [];
  }

  async getHealth(): Promise<ServiceHealth> {
    return {
      service: 'gic-indexer',
      status: 'unhealthy',
      responseTime: 0,
      memoryUsage: 0,
      errorRate: 100,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      integrity: 0
    };
  }
}
