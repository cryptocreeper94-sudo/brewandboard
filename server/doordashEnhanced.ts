import crypto from 'crypto';

const DOORDASH_BASE_URL = 'https://openapi.doordash.com';

interface DoordashConfig {
  developerId: string;
  keyId: string;
  signingSecret: string;
  environment: 'sandbox' | 'production';
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  openUntil: number;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  state: 'closed',
  openUntil: 0,
};

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000,
  halfOpenMaxAttempts: 3,
};

function getConfig(): DoordashConfig | null {
  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;
  const environment = (process.env.DOORDASH_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';

  if (!developerId || !keyId || !signingSecret) {
    return null;
  }

  return { developerId, keyId, signingSecret, environment };
}

function generateJWT(config: DoordashConfig): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'doordash',
    iss: config.developerId,
    kid: config.keyId,
    exp: now + 300,
    iat: now
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signatureInput = `${base64Header}.${base64Payload}`;
  const signature = crypto
    .createHmac('sha256', Buffer.from(config.signingSecret, 'base64'))
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
}

function checkCircuitBreaker(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  if (circuitBreaker.state === 'open') {
    if (now >= circuitBreaker.openUntil) {
      circuitBreaker.state = 'half-open';
      circuitBreaker.failures = 0;
      console.log('[DoorDash] Circuit breaker: half-open, allowing test request');
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: `Circuit breaker open. Retry after ${Math.ceil((circuitBreaker.openUntil - now) / 1000)}s` 
    };
  }
  
  return { allowed: true };
}

function recordSuccess(): void {
  if (circuitBreaker.state === 'half-open') {
    circuitBreaker.state = 'closed';
    console.log('[DoorDash] Circuit breaker: closed (recovered)');
  }
  circuitBreaker.failures = 0;
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    circuitBreaker.state = 'open';
    circuitBreaker.openUntil = Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeout;
    console.log(`[DoorDash] Circuit breaker: open for ${CIRCUIT_BREAKER_CONFIG.resetTimeout}ms`);
  }
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doordashRequestWithRetry(
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
  const config = getConfig();
  
  if (!config) {
    return { 
      success: false, 
      error: 'DoorDash API not configured. Missing credentials.',
      statusCode: 503 
    };
  }
  
  const circuitCheck = checkCircuitBreaker();
  if (!circuitCheck.allowed) {
    return { 
      success: false, 
      error: circuitCheck.reason,
      statusCode: 503 
    };
  }
  
  let lastError: string = '';
  let lastStatusCode: number = 0;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const jwt = generateJWT(config);
      
      const response = await fetch(`${DOORDASH_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      lastStatusCode = response.status;
      
      if (response.ok) {
        const data = await response.json();
        recordSuccess();
        return { success: true, data, statusCode: response.status };
      }
      
      const errorData = await response.json().catch(() => ({}));
      lastError = errorData.message || errorData.error || `HTTP ${response.status}`;
      
      if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
        recordFailure();
        return { 
          success: false, 
          error: lastError,
          statusCode: response.status 
        };
      }
      
      if (attempt < retryConfig.maxRetries) {
        const delay = Math.min(
          retryConfig.baseDelayMs * Math.pow(2, attempt),
          retryConfig.maxDelayMs
        );
        console.log(`[DoorDash] Retry ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`);
        await sleep(delay);
      }
    } catch (error: any) {
      lastError = error.message || 'Network error';
      lastStatusCode = 0;
      
      if (attempt < retryConfig.maxRetries) {
        const delay = Math.min(
          retryConfig.baseDelayMs * Math.pow(2, attempt),
          retryConfig.maxDelayMs
        );
        console.log(`[DoorDash] Network error, retry ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  recordFailure();
  return { 
    success: false, 
    error: `Failed after ${retryConfig.maxRetries + 1} attempts: ${lastError}`,
    statusCode: lastStatusCode 
  };
}

export interface CreateDeliveryRequest {
  external_delivery_id: string;
  pickup_address: string;
  pickup_business_name?: string;
  pickup_phone_number: string;
  pickup_instructions?: string;
  dropoff_address: string;
  dropoff_phone_number: string;
  dropoff_contact_given_name: string;
  dropoff_contact_family_name?: string;
  dropoff_instructions?: string;
  contactless_dropoff?: boolean;
  pickup_time?: string;
  dropoff_time?: string;
  tip?: number;
  order_value?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
}

export interface DeliveryResult {
  success: boolean;
  externalDeliveryId: string;
  doordashDeliveryId?: string;
  estimatedPickupTime?: string;
  estimatedDropoffTime?: string;
  fee?: number;
  error?: string;
  fallbackTriggered?: boolean;
}

export async function createDelivery(data: CreateDeliveryRequest): Promise<DeliveryResult> {
  const result = await doordashRequestWithRetry('POST', '/drive/v2/deliveries', data);
  
  if (result.success && result.data) {
    return {
      success: true,
      externalDeliveryId: data.external_delivery_id,
      doordashDeliveryId: result.data.id,
      estimatedPickupTime: result.data.estimated_pickup_time,
      estimatedDropoffTime: result.data.estimated_dropoff_time,
      fee: result.data.fee,
    };
  }
  
  console.error(`[DoorDash] Delivery creation failed: ${result.error}`);
  
  return {
    success: false,
    externalDeliveryId: data.external_delivery_id,
    error: result.error,
    fallbackTriggered: true,
  };
}

export async function getDeliveryStatus(externalDeliveryId: string): Promise<{
  success: boolean;
  status?: string;
  dasherName?: string;
  dasherPhone?: string;
  trackingUrl?: string;
  error?: string;
}> {
  const result = await doordashRequestWithRetry('GET', `/drive/v2/deliveries/${externalDeliveryId}`);
  
  if (result.success && result.data) {
    return {
      success: true,
      status: result.data.delivery_status,
      dasherName: result.data.dasher?.first_name,
      dasherPhone: result.data.dasher?.phone_number,
      trackingUrl: result.data.tracking_url,
    };
  }
  
  return {
    success: false,
    error: result.error,
  };
}

export async function cancelDelivery(externalDeliveryId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const result = await doordashRequestWithRetry('PUT', `/drive/v2/deliveries/${externalDeliveryId}/cancel`);
  
  return {
    success: result.success,
    error: result.error,
  };
}

export function isConfigured(): boolean {
  return getConfig() !== null;
}

export function getStatus(): {
  configured: boolean;
  environment: string;
  circuitBreaker: 'closed' | 'open' | 'half-open';
  recentFailures: number;
} {
  const config = getConfig();
  return {
    configured: config !== null,
    environment: config?.environment || 'not-configured',
    circuitBreaker: circuitBreaker.state,
    recentFailures: circuitBreaker.failures,
  };
}

export function generateExternalDeliveryId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `BB-${timestamp}-${random}`.toUpperCase();
}

export interface GratuitySplit {
  customerTip: number;
  driverTip: number;
  internalTip: number;
}

export function calculateGratuitySplit(customerTipCents: number): GratuitySplit {
  if (customerTipCents < 500) {
    return {
      customerTip: customerTipCents,
      driverTip: 0,
      internalTip: customerTipCents,
    };
  }
  
  let driverTip: number;
  
  if (customerTipCents <= 1500) {
    driverTip = 500;
  } else {
    driverTip = Math.min(Math.round(customerTipCents * 0.25), 1500);
  }
  
  return {
    customerTip: customerTipCents,
    driverTip,
    internalTip: customerTipCents - driverTip,
  };
}

export interface DispatchOrderRequest {
  orderId: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  pickupInstructions?: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  dropoffInstructions?: string;
  contactlessDropoff?: boolean;
  scheduledPickupTime?: string;
  scheduledDropoffTime?: string;
  orderTotal: number;
  customerTip: number;
  items?: Array<{ name: string; quantity: number; price?: number }>;
}

export interface DispatchResult {
  success: boolean;
  externalDeliveryId: string;
  gratuitySplit: GratuitySplit;
  doordashResponse?: any;
  error?: string;
  fallbackTriggered?: boolean;
}

export async function dispatchOrder(request: DispatchOrderRequest): Promise<DispatchResult> {
  const externalDeliveryId = generateExternalDeliveryId();
  const gratuitySplit = calculateGratuitySplit(request.customerTip);
  
  const nameParts = request.customerName.split(' ');
  
  const deliveryRequest: CreateDeliveryRequest = {
    external_delivery_id: externalDeliveryId,
    pickup_address: request.vendorAddress,
    pickup_business_name: request.vendorName,
    pickup_phone_number: request.vendorPhone,
    pickup_instructions: request.pickupInstructions || 'Brew & Board order',
    dropoff_address: request.customerAddress,
    dropoff_phone_number: request.customerPhone,
    dropoff_contact_given_name: nameParts[0] || 'Customer',
    dropoff_contact_family_name: nameParts.slice(1).join(' ') || undefined,
    dropoff_instructions: request.dropoffInstructions,
    contactless_dropoff: request.contactlessDropoff ?? true,
    pickup_time: request.scheduledPickupTime,
    dropoff_time: request.scheduledDropoffTime,
    order_value: request.orderTotal,
    tip: gratuitySplit.driverTip,
    items: request.items,
  };
  
  const result = await createDelivery(deliveryRequest);
  
  if (result.success) {
    return {
      success: true,
      externalDeliveryId,
      gratuitySplit,
      doordashResponse: result,
    };
  }
  
  console.log(`[DoorDash] Dispatch failed for order ${request.orderId}, triggering fallback`);
  
  return {
    success: false,
    externalDeliveryId,
    gratuitySplit,
    error: result.error,
    fallbackTriggered: true,
  };
}
