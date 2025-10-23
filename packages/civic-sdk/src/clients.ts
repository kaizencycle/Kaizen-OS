import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LedgerEntry, GICTransaction, ServiceHealth, OAAIntent, DeliberationProof, ShieldPolicy, EOMMReflection } from './types';

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
