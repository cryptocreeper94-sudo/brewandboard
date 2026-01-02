import crypto from 'crypto';

const DOORDASH_BASE_URL = process.env.DOORDASH_ENVIRONMENT === 'production' 
  ? 'https://openapi.doordash.com' 
  : 'https://openapi.doordash.com'; // Same URL, different credentials

interface DoordashConfig {
  developerId: string;
  keyId: string;
  signingSecret: string;
}

function getConfig(): DoordashConfig {
  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;

  if (!developerId || !keyId || !signingSecret) {
    throw new Error('DoorDash API credentials not configured. Set DOORDASH_DEVELOPER_ID, DOORDASH_KEY_ID, and DOORDASH_SIGNING_SECRET.');
  }

  return { developerId, keyId, signingSecret };
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
    exp: now + 300, // 5 minutes
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

async function doordashRequest(
  method: string,
  endpoint: string,
  body?: Record<string, any>
): Promise<any> {
  const config = getConfig();
  const jwt = generateJWT(config);

  const response = await fetch(`${DOORDASH_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `DoorDash API error: ${response.status}`);
  }

  return data;
}

// ========================
// BUSINESS & STORE APIs
// ========================

export async function createBusiness(data: {
  external_business_id: string;
  name: string;
  description?: string;
}): Promise<any> {
  return doordashRequest('POST', '/drive/v2/businesses', data);
}

export async function createStore(data: {
  external_business_id: string;
  external_store_id: string;
  name: string;
  phone_number: string;
  address: {
    street: string;
    subpremise?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}): Promise<any> {
  return doordashRequest('POST', '/drive/v2/stores', data);
}

export async function getStore(externalStoreId: string): Promise<any> {
  return doordashRequest('GET', `/drive/v2/stores/${externalStoreId}`);
}

// ========================
// DELIVERY QUOTE APIs
// ========================

export interface DeliveryQuoteRequest {
  external_delivery_id: string;
  pickup_address: string;
  pickup_business_name?: string;
  pickup_phone_number: string;
  dropoff_address: string;
  dropoff_phone_number: string;
  dropoff_contact_given_name: string;
  dropoff_contact_family_name?: string;
  order_value?: number;
}

export async function getDeliveryQuote(data: DeliveryQuoteRequest): Promise<any> {
  return doordashRequest('POST', '/drive/v2/quotes', data);
}

// ========================
// DELIVERY APIs
// ========================

export interface CreateDeliveryRequest {
  external_delivery_id: string;
  
  // Pickup (use store IDs OR address)
  pickup_external_business_id?: string;
  pickup_external_store_id?: string;
  pickup_address?: string;
  pickup_business_name?: string;
  pickup_phone_number?: string;
  pickup_instructions?: string;
  
  // Dropoff (required)
  dropoff_address: string;
  dropoff_address_components?: {
    street_address: string;
    subpremise?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  dropoff_phone_number: string;
  dropoff_contact_given_name: string;
  dropoff_contact_family_name?: string;
  dropoff_instructions?: string;
  contactless_dropoff?: boolean;
  
  // Timing
  pickup_time?: string; // ISO-8601
  dropoff_time?: string; // ISO-8601
  
  // Financials (in cents)
  tip?: number;
  order_value?: number;
  
  // Restricted items
  order_contains?: string[];
  action_if_undeliverable?: 'return_to_pickup' | 'dispose';
  
  // Items
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    external_id?: string;
    barcode?: string;
    price?: number;
  }>;
}

export async function createDelivery(data: CreateDeliveryRequest): Promise<any> {
  return doordashRequest('POST', '/drive/v2/deliveries', data);
}

export async function getDelivery(externalDeliveryId: string): Promise<any> {
  return doordashRequest('GET', `/drive/v2/deliveries/${externalDeliveryId}`);
}

export async function updateDelivery(
  externalDeliveryId: string, 
  data: Partial<CreateDeliveryRequest>
): Promise<any> {
  return doordashRequest('PATCH', `/drive/v2/deliveries/${externalDeliveryId}`, data);
}

export async function cancelDelivery(externalDeliveryId: string): Promise<any> {
  return doordashRequest('PUT', `/drive/v2/deliveries/${externalDeliveryId}/cancel`);
}

// ========================
// WEBHOOK SIGNATURE VERIFICATION
// ========================

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ========================
// DELIVERY SIMULATOR (Sandbox Testing)
// ========================

export async function advanceDelivery(
  externalDeliveryId: string,
  targetStatus: string
): Promise<any> {
  // This endpoint only works in sandbox environment
  return doordashRequest('POST', `/drive/v2/deliveries/${externalDeliveryId}/simulate`, {
    target_status: targetStatus
  });
}

// ========================
// HELPER FUNCTIONS
// ========================

export function generateExternalDeliveryId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `BB-${timestamp}-${random}`.toUpperCase();
}

export function isConfigured(): boolean {
  return !!(
    process.env.DOORDASH_DEVELOPER_ID &&
    process.env.DOORDASH_KEY_ID &&
    process.env.DOORDASH_SIGNING_SECRET
  );
}

export function getConfigStatus(): {
  configured: boolean;
  environment: string;
  developerId?: string;
} {
  return {
    configured: isConfigured(),
    environment: process.env.DOORDASH_ENVIRONMENT || 'sandbox',
    developerId: process.env.DOORDASH_DEVELOPER_ID?.substring(0, 8) + '...',
  };
}

// ========================
// GRATUITY SPLIT LOGIC
// ========================

export interface GratuitySplit {
  customerTip: number;      // Total tip from customer (in cents)
  driverTip: number;        // Amount passed to DoorDash driver (in cents)
  internalTip: number;      // Amount kept by Brew & Board (in cents)
  splitMethod: 'fixed' | 'percentage';
}

// Configuration for driver tip split
const DRIVER_TIP_CONFIG = {
  // Minimum tip to ensure fast pickup
  minimumDriverTip: 500, // $5.00 in cents
  
  // If customer tip is above this, give driver a percentage
  percentageThreshold: 1500, // $15.00 in cents
  
  // Percentage of customer tip to give driver (above threshold)
  driverPercentage: 0.25, // 25% to driver, 75% to Brew & Board
  
  // Maximum driver tip cap
  maxDriverTip: 1500, // $15.00 in cents
};

export function calculateGratuitySplit(customerTipCents: number): GratuitySplit {
  // If no tip or very small tip, no driver tip
  if (customerTipCents < 500) {
    return {
      customerTip: customerTipCents,
      driverTip: 0,
      internalTip: customerTipCents,
      splitMethod: 'fixed',
    };
  }
  
  let driverTip: number;
  let splitMethod: 'fixed' | 'percentage';
  
  if (customerTipCents <= DRIVER_TIP_CONFIG.percentageThreshold) {
    // Small tip: give driver fixed $5
    driverTip = DRIVER_TIP_CONFIG.minimumDriverTip;
    splitMethod = 'fixed';
  } else {
    // Larger tip: give driver 25% (capped at $15)
    const calculatedTip = Math.round(customerTipCents * DRIVER_TIP_CONFIG.driverPercentage);
    driverTip = Math.min(calculatedTip, DRIVER_TIP_CONFIG.maxDriverTip);
    splitMethod = 'percentage';
  }
  
  // Ensure driver tip doesn't exceed customer tip
  driverTip = Math.min(driverTip, customerTipCents);
  
  return {
    customerTip: customerTipCents,
    driverTip,
    internalTip: customerTipCents - driverTip,
    splitMethod,
  };
}

// ========================
// SMART DISPATCH (AUTO TIP SPLIT)
// ========================

export interface DispatchOrderRequest {
  orderId: string;
  
  // Pickup location
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  pickupInstructions?: string;
  
  // Dropoff location
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  dropoffInstructions?: string;
  contactlessDropoff?: boolean;
  
  // Timing
  scheduledPickupTime?: string; // ISO-8601
  scheduledDropoffTime?: string; // ISO-8601
  
  // Order details
  orderTotal: number;       // Order value in cents
  customerTip: number;      // Customer's total tip in cents
  
  // Items for driver
  items?: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
}

export interface DispatchResult {
  success: boolean;
  externalDeliveryId: string;
  gratuitySplit: GratuitySplit;
  doordashResponse?: any;
  error?: string;
}

export async function dispatchOrder(request: DispatchOrderRequest): Promise<DispatchResult> {
  const externalDeliveryId = generateExternalDeliveryId();
  
  // Calculate gratuity split
  const gratuitySplit = calculateGratuitySplit(request.customerTip);
  
  try {
    // Create the delivery with driver tip included
    const deliveryRequest: CreateDeliveryRequest = {
      external_delivery_id: externalDeliveryId,
      
      // Pickup
      pickup_address: request.vendorAddress,
      pickup_business_name: request.vendorName,
      pickup_phone_number: request.vendorPhone,
      pickup_instructions: request.pickupInstructions || 'Brew & Board order - please check all items before pickup',
      
      // Dropoff
      dropoff_address: request.customerAddress,
      dropoff_phone_number: request.customerPhone,
      dropoff_contact_given_name: request.customerName.split(' ')[0],
      dropoff_contact_family_name: request.customerName.split(' ').slice(1).join(' ') || undefined,
      dropoff_instructions: request.dropoffInstructions,
      contactless_dropoff: request.contactlessDropoff ?? true,
      
      // Timing
      pickup_time: request.scheduledPickupTime,
      dropoff_time: request.scheduledDropoffTime,
      
      // Financials
      order_value: request.orderTotal,
      tip: gratuitySplit.driverTip, // Only driver portion goes to DoorDash
      
      // Items
      items: request.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      
      // Return to vendor if undeliverable
      action_if_undeliverable: 'return_to_pickup',
    };
    
    const response = await createDelivery(deliveryRequest);
    
    return {
      success: true,
      externalDeliveryId,
      gratuitySplit,
      doordashResponse: response,
    };
  } catch (error: any) {
    return {
      success: false,
      externalDeliveryId,
      gratuitySplit,
      error: error.message,
    };
  }
}

// Helper to format gratuity split for display
export function formatGratuitySplit(split: GratuitySplit): string {
  const customerTotal = (split.customerTip / 100).toFixed(2);
  const driverAmount = (split.driverTip / 100).toFixed(2);
  const internalAmount = (split.internalTip / 100).toFixed(2);
  
  return `Customer tip: $${customerTotal} → Driver: $${driverAmount}, Brew & Board: $${internalAmount}`;
}
