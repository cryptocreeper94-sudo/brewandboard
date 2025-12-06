/**
 * ORBIT Payroll → Brew & Board Coffee Ecosystem Client
 * 
 * Drop this into your Orbit Payroll app to enable cross-app communication.
 * Store your API credentials securely (environment variables recommended).
 * 
 * Usage:
 *   const client = new BrewBoardEcosystemClient({
 *     apiKey: process.env.BREWBOARD_API_KEY,
 *     apiSecret: process.env.BREWBOARD_API_SECRET,
 *     baseUrl: 'https://brewandboard.coffee'
 *   });
 *   
 *   // Push a code snippet
 *   await client.pushSnippet({
 *     name: 'calculateOvertimePay',
 *     code: '...',
 *     language: 'typescript',
 *     category: 'utility'
 *   });
 *   
 *   // Sync worker data
 *   await client.syncData('workers', workerList);
 */

interface EcosystemClientConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

interface CodeSnippet {
  name: string;
  description?: string;
  code: string;
  language: string;
  category: 'component' | 'utility' | 'hook' | 'api' | 'config' | 'style';
  isPublic?: boolean;
}

interface SyncPayload {
  dataType: string;
  data: any;
  metadata?: Record<string, any>;
}

export class BrewBoardEcosystemClient {
  private config: EcosystemClientConfig;
  
  constructor(config: EcosystemClientConfig) {
    this.config = config;
  }
  
  private async request(endpoint: string, method: string, body?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-API-Secret': this.config.apiSecret,
    };
    
    const response = await fetch(`${this.config.baseUrl}/api/ecosystem${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  async pushSnippet(snippet: CodeSnippet): Promise<{ id: string }> {
    return this.request('/snippets', 'POST', snippet);
  }
  
  async getSnippets(category?: string): Promise<CodeSnippet[]> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/snippets${query}`, 'GET');
  }
  
  async syncData(dataType: string, data: any, metadata?: Record<string, any>): Promise<{ logged: boolean }> {
    const payload: SyncPayload = { dataType, data, metadata };
    return this.request('/sync', 'POST', payload);
  }
  
  async checkConnection(): Promise<{ connected: boolean; permissions: string[] }> {
    return this.request('/status', 'GET');
  }
  
  async logActivity(action: string, details?: Record<string, any>): Promise<void> {
    await this.request('/logs', 'POST', { action, details });
  }
}

// Example: Pushing shared utility functions
export const SHARED_UTILITIES = {
  calculateOvertimePay: `
export function calculateOvertimePay(
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  overtimeMultiplier: number = 1.5
): { regular: number; overtime: number; total: number } {
  const regular = regularHours * hourlyRate;
  const overtime = overtimeHours * hourlyRate * overtimeMultiplier;
  return { regular, overtime, total: regular + overtime };
}`,
  
  formatCurrency: `
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}`,
  
  calculateTaxWithholding: `
export function calculateTaxWithholding(
  grossPay: number,
  filingStatus: 'single' | 'married' | 'hoh',
  allowances: number = 0
): number {
  const perAllowanceDeduction = 4300; // 2025
  const adjustedGross = Math.max(0, grossPay - (allowances * perAllowanceDeduction));
  // Simplified - use full brackets for production
  const effectiveRate = filingStatus === 'single' ? 0.22 : 0.12;
  return adjustedGross * effectiveRate;
}`,
};
