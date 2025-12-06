# ORBIT Staffing ↔ Brew & Board Coffee Ecosystem Integration
## Agent Handoff Document

---

## OVERVIEW

Brew & Board Coffee has an **App Ecosystem Hub** that enables secure cross-app communication. This handoff document provides everything needed to connect ORBIT Staffing/Payroll to the Brew & Board ecosystem for:

- **Shared code snippets** - Push reusable utilities between apps
- **Data synchronization** - Sync workers, contractors, payment data
- **Activity logging** - Track all inter-app communication
- **1099 compliance** - Share contractor payment data for tax reporting

**Brew & Board Base URL:** `https://brewandboard.coffee` (or current Replit URL)

---

## STEP 1: GET API CREDENTIALS

The Brew & Board owner will register ORBIT in their App Ecosystem Hub:

1. Navigate to: `/developers` (Developer Dashboard)
2. Scroll to: **App Ecosystem Hub** section
3. Click: **"Connect App"**
4. Enter:
   - **Name:** `ORBIT Staffing`
   - **Base URL:** `https://orbit-staffing.replit.app` (your URL)
   - **Permissions:** Select all that apply:
     - `read:code` - Access shared code snippets
     - `write:code` - Push code snippets
     - `read:data` - Access general data
     - `write:data` - Push general data
     - `read:clients` - Access CRM/client data
     - `read:hallmarks` - Access blockchain verification data

5. **SAVE THE CREDENTIALS** - The API Secret is only shown once!

You will receive:
```
API Key:    bb_app_xxxxxxxxxxxxxxxxxxxx
API Secret: bb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## STEP 2: ADD ENVIRONMENT VARIABLES TO ORBIT

Add these secrets to ORBIT Staffing's environment:

```env
BREWBOARD_API_KEY=bb_app_xxxxxxxxxxxxxxxxxxxx
BREWBOARD_API_SECRET=bb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREWBOARD_BASE_URL=https://brewandboard.coffee
```

---

## STEP 3: ADD ECOSYSTEM CLIENT

Create this file in ORBIT Staffing:

### `server/brewboardEcosystem.ts`

```typescript
/**
 * Brew & Board Coffee Ecosystem Client
 * Enables cross-app communication between ORBIT and Brew & Board
 */

interface EcosystemConfig {
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

interface SyncLog {
  action: string;
  direction: 'inbound' | 'outbound';
  endpoint?: string;
  status: 'success' | 'failed';
  metadata?: Record<string, any>;
}

export class BrewBoardEcosystem {
  private config: EcosystemConfig;
  
  constructor() {
    this.config = {
      apiKey: process.env.BREWBOARD_API_KEY || '',
      apiSecret: process.env.BREWBOARD_API_SECRET || '',
      baseUrl: process.env.BREWBOARD_BASE_URL || 'https://brewandboard.coffee',
    };
    
    if (!this.config.apiKey || !this.config.apiSecret) {
      console.warn('[BrewBoard Ecosystem] API credentials not configured');
    }
  }
  
  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-API-Secret': this.config.apiSecret,
      'X-App-Name': 'ORBIT Staffing',
    };
    
    const response = await fetch(`${this.config.baseUrl}/api/ecosystem${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Request failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CODE SNIPPETS
  // ═══════════════════════════════════════════════════════════════
  
  async pushSnippet(snippet: CodeSnippet): Promise<{ id: string; name: string }> {
    return this.request('/snippets', 'POST', snippet);
  }
  
  async getSnippets(filters?: { category?: string; language?: string }): Promise<CodeSnippet[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.language) params.append('language', filters.language);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/snippets${query}`, 'GET');
  }
  
  async getSnippetByName(name: string): Promise<CodeSnippet | null> {
    try {
      return this.request(`/snippets/name/${encodeURIComponent(name)}`, 'GET');
    } catch {
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // DATA SYNC
  // ═══════════════════════════════════════════════════════════════
  
  async syncContractors(contractors: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
    totalPaid?: number;
  }>): Promise<{ synced: number; logged: boolean }> {
    return this.request('/sync/contractors', 'POST', { contractors });
  }
  
  async sync1099Data(year: number, payments: Array<{
    payeeId: string;
    payeeName: string;
    amount: number;
    category: string;
    date: string;
  }>): Promise<{ synced: number }> {
    return this.request('/sync/1099', 'POST', { year, payments });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CONNECTION STATUS
  // ═══════════════════════════════════════════════════════════════
  
  async checkConnection(): Promise<{
    connected: boolean;
    appName: string;
    permissions: string[];
    lastSync?: string;
  }> {
    try {
      return await this.request('/status', 'GET');
    } catch (error) {
      return {
        connected: false,
        appName: 'ORBIT Staffing',
        permissions: [],
      };
    }
  }
  
  async logActivity(log: SyncLog): Promise<void> {
    await this.request('/logs', 'POST', log);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ═══════════════════════════════════════════════════════════════
  
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }
}

// Singleton instance
export const brewboard = new BrewBoardEcosystem();
```

---

## STEP 4: ADD API ROUTES (Optional)

If you want ORBIT to receive data FROM Brew & Board, add these routes:

### `server/ecosystemRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

// Middleware to validate incoming requests from Brew & Board
const validateEcosystemRequest = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.ORBIT_ECOSYSTEM_KEY; // Set this in Brew & Board
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid ecosystem credentials' });
  }
  next();
};

// Receive code snippets from Brew & Board
router.post('/ecosystem/snippets', validateEcosystemRequest, async (req, res) => {
  const { name, code, language, category } = req.body;
  // Store snippet in your database or file system
  console.log(`[Ecosystem] Received snippet: ${name}`);
  res.json({ received: true, name });
});

// Receive sync data from Brew & Board
router.post('/ecosystem/sync', validateEcosystemRequest, async (req, res) => {
  const { dataType, data } = req.body;
  console.log(`[Ecosystem] Received ${dataType} sync:`, data.length, 'records');
  res.json({ synced: data.length });
});

// Health check endpoint
router.get('/ecosystem/status', (req, res) => {
  res.json({
    app: 'ORBIT Staffing',
    version: '2.6.1',
    ecosystemEnabled: true,
  });
});

export default router;
```

---

## STEP 5: USAGE EXAMPLES

### Push Shared Utilities to Brew & Board

```typescript
import { brewboard } from './brewboardEcosystem';

// Push payroll calculation utilities
async function sharePayrollUtilities() {
  if (!brewboard.isConfigured()) {
    console.log('Brew & Board ecosystem not configured');
    return;
  }
  
  await brewboard.pushSnippet({
    name: 'calculateOvertimePay',
    description: 'Calculate regular and overtime pay with configurable multiplier',
    language: 'typescript',
    category: 'utility',
    code: `
export function calculateOvertimePay(
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  multiplier: number = 1.5
): { regular: number; overtime: number; total: number } {
  const regular = regularHours * hourlyRate;
  const overtime = overtimeHours * hourlyRate * multiplier;
  return { regular, overtime, total: regular + overtime };
}`,
  });
  
  await brewboard.pushSnippet({
    name: 'formatCurrency',
    description: 'Format number as USD currency string',
    language: 'typescript',
    category: 'utility',
    code: `
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}`,
  });
  
  console.log('Shared utilities pushed to Brew & Board');
}
```

### Sync Contractor Data for 1099 Compliance

```typescript
import { brewboard } from './brewboardEcosystem';

async function syncContractorsForTaxReporting() {
  // Get contractors from ORBIT database
  const contractors = await db.select().from(workers)
    .where(eq(workers.payType, 'contractor'));
  
  // Get their payments for the year
  const year = new Date().getFullYear();
  const payments = await db.select().from(payrollRecords)
    .where(and(
      inArray(payrollRecords.workerId, contractors.map(c => c.id)),
      gte(payrollRecords.periodStart, `${year}-01-01`),
      lte(payrollRecords.periodEnd, `${year}-12-31`)
    ));
  
  // Format for Brew & Board 1099 tracking
  const formattedPayments = payments.map(p => ({
    payeeId: p.workerId,
    payeeName: contractors.find(c => c.id === p.workerId)?.firstName + ' ' + 
               contractors.find(c => c.id === p.workerId)?.lastName,
    amount: Number(p.netPay),
    category: 'contractor_payment',
    date: p.periodEnd,
  }));
  
  await brewboard.sync1099Data(year, formattedPayments);
  console.log(`Synced ${formattedPayments.length} contractor payments`);
}
```

### Check Connection Status

```typescript
import { brewboard } from './brewboardEcosystem';

async function checkBrewBoardConnection() {
  const status = await brewboard.checkConnection();
  
  if (status.connected) {
    console.log('✓ Connected to Brew & Board');
    console.log('  Permissions:', status.permissions.join(', '));
    console.log('  Last sync:', status.lastSync || 'Never');
  } else {
    console.log('✗ Not connected to Brew & Board');
    console.log('  Check API credentials in environment variables');
  }
}
```

---

## API ENDPOINTS REFERENCE

### Brew & Board Ecosystem API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ecosystem/apps` | List all connected apps |
| `POST` | `/api/ecosystem/apps` | Register new app |
| `PUT` | `/api/ecosystem/apps/:id` | Update app (toggle active) |
| `DELETE` | `/api/ecosystem/apps/:id` | Remove connected app |
| `POST` | `/api/ecosystem/apps/:id/regenerate-key` | Get new API key |
| `GET` | `/api/ecosystem/snippets` | List shared code snippets |
| `POST` | `/api/ecosystem/snippets` | Push new snippet |
| `GET` | `/api/ecosystem/logs` | View sync activity logs |
| `POST` | `/api/ecosystem/logs` | Log sync activity |

### Request Headers (Required)

```
X-API-Key: bb_app_xxxxxxxxxxxxxxxxxxxx
X-API-Secret: bb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

---

## PERMISSIONS REFERENCE

| Permission | Description |
|------------|-------------|
| `read:code` | Access shared code snippets |
| `write:code` | Push code snippets to ecosystem |
| `read:data` | Access general synced data |
| `write:data` | Push data to ecosystem |
| `read:clients` | Access CRM/client data |
| `write:clients` | Sync client data |
| `read:hallmarks` | Access blockchain verification data |
| `sync:all` | Full access to all sync features |

---

## SECURITY NOTES

1. **API Secret is shown only once** - Save it immediately when registering
2. **Store credentials in environment variables** - Never commit to source control
3. **Regenerate keys if compromised** - Use the "New Key" button in App Ecosystem Hub
4. **Monitor activity logs** - Check for unexpected sync activity
5. **Use HTTPS only** - All ecosystem communication should be encrypted

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check API key/secret are correct in env vars |
| `403 Forbidden` | App may be disabled - check App Ecosystem Hub |
| `404 Not Found` | Endpoint may not exist - check API reference |
| Connection timeout | Verify base URL is correct and accessible |
| Empty snippets list | No snippets shared yet - push some first |

---

## CONTACT

For ecosystem support or to request additional permissions, contact the Brew & Board administrator through the platform.

**Integration Version:** 1.0.0
**Compatible with:** Brew & Board v1.2.2+, ORBIT Staffing v2.6.1+
