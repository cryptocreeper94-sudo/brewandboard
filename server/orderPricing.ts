import { db } from './db';
import { menuItems, vendors, scheduledOrders } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export const SERVICE_FEE_PERCENT = 0.15;
export const SALES_TAX_PERCENT = 0.0975;

export interface DeliveryFeeConfig {
  baseFee: number;
  perMileFee: number;
  maxFee: number;
  freeDeliveryThreshold: number;
}

const DELIVERY_FEES: DeliveryFeeConfig = {
  baseFee: 5.99,
  perMileFee: 1.50,
  maxFee: 15.00,
  freeDeliveryThreshold: 150.00,
};

export interface OrderItem {
  menuItemId?: string;
  name: string;
  quantity: number;
  price?: string;
  notes?: string;
}

export interface ValidatedOrderItem extends OrderItem {
  verifiedPrice: number;
  lineTotal: number;
}

export interface OrderPricing {
  items: ValidatedOrderItem[];
  subtotal: number;
  salesTax: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  errors: string[];
}

export async function validateAndCalculateOrderPricing(
  vendorId: string,
  items: OrderItem[],
  deliveryDistanceMiles: number = 5,
  gratuityPercent: number = 0
): Promise<OrderPricing> {
  const errors: string[] = [];
  const validatedItems: ValidatedOrderItem[] = [];
  
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));
  if (!vendor) {
    errors.push(`Vendor not found: ${vendorId}`);
    return {
      items: [],
      subtotal: 0,
      salesTax: 0,
      serviceFee: 0,
      deliveryFee: 0,
      total: 0,
      errors,
    };
  }
  
  const vendorMenuItems = await db.select().from(menuItems).where(eq(menuItems.vendorId, vendorId));
  const menuItemMap = new Map(vendorMenuItems.map(item => [item.id, item]));
  
  for (const item of items) {
    if (item.menuItemId) {
      const menuItem = menuItemMap.get(item.menuItemId);
      
      if (!menuItem) {
        errors.push(`Menu item not found: ${item.name} (${item.menuItemId})`);
        continue;
      }
      
      if (!menuItem.isAvailable) {
        errors.push(`Menu item unavailable: ${menuItem.name}`);
        continue;
      }
      
      const verifiedPrice = parseFloat(menuItem.price);
      const lineTotal = verifiedPrice * item.quantity;
      
      validatedItems.push({
        ...item,
        name: menuItem.name,
        verifiedPrice,
        lineTotal,
      });
    } else {
      const verifiedPrice = parseFloat(item.price || '0');
      const lineTotal = verifiedPrice * item.quantity;
      
      validatedItems.push({
        ...item,
        verifiedPrice,
        lineTotal,
      });
    }
  }
  
  const subtotal = validatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  
  const minimumOrder = parseFloat(vendor.minimumOrder || '0');
  if (subtotal < minimumOrder) {
    errors.push(`Minimum order of $${minimumOrder.toFixed(2)} not met (current: $${subtotal.toFixed(2)})`);
  }
  
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENT * 100) / 100;
  
  const salesTax = Math.round(subtotal * SALES_TAX_PERCENT * 100) / 100;
  
  let deliveryFee = 0;
  if (subtotal < DELIVERY_FEES.freeDeliveryThreshold) {
    deliveryFee = Math.min(
      DELIVERY_FEES.baseFee + (deliveryDistanceMiles * DELIVERY_FEES.perMileFee),
      DELIVERY_FEES.maxFee
    );
    deliveryFee = Math.round(deliveryFee * 100) / 100;
  }
  
  const gratuity = Math.round(subtotal * (gratuityPercent / 100) * 100) / 100;
  
  const total = Math.round((subtotal + salesTax + serviceFee + deliveryFee + gratuity) * 100) / 100;
  
  return {
    items: validatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    salesTax,
    serviceFee,
    deliveryFee,
    total,
    errors,
  };
}

export async function verifyOrderTotal(orderId: string): Promise<{
  valid: boolean;
  calculatedTotal: number;
  storedTotal: number;
  difference: number;
}> {
  const [order] = await db.select().from(scheduledOrders).where(eq(scheduledOrders.id, orderId));
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  const storedTotal = parseFloat(order.total);
  
  const recalculated = await validateAndCalculateOrderPricing(
    order.vendorId || '',
    order.items || [],
    5,
    parseFloat(order.gratuity || '0') / parseFloat(order.subtotal) * 100
  );
  
  const difference = Math.abs(recalculated.total - storedTotal);
  
  return {
    valid: difference < 0.02,
    calculatedTotal: recalculated.total,
    storedTotal,
    difference,
  };
}

export function calculateGratuitySplit(totalGratuityCents: number): {
  driverTip: number;
  internalTip: number;
} {
  if (totalGratuityCents < 500) {
    return { driverTip: 0, internalTip: totalGratuityCents };
  }
  
  const driverTip = Math.min(
    Math.max(500, Math.round(totalGratuityCents * 0.25)),
    1500
  );
  
  return {
    driverTip,
    internalTip: totalGratuityCents - driverTip,
  };
}

export async function createSecureCheckout(
  vendorId: string,
  items: OrderItem[],
  gratuityPercent: number = 0
): Promise<{ 
  pricing: OrderPricing; 
  checkoutToken: string;
  expiresAt: Date;
}> {
  const pricing = await validateAndCalculateOrderPricing(vendorId, items, 5, gratuityPercent);
  
  if (pricing.errors.length > 0) {
    throw new Error(`Order validation failed: ${pricing.errors.join(', ')}`);
  }
  
  const crypto = await import('crypto');
  const checkoutToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  
  return { pricing, checkoutToken, expiresAt };
}
