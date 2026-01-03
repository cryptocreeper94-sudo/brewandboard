import { z } from 'zod';

export const CreateOrderSchema = z.object({
  vendorId: z.string().optional(),
  vendorName: z.string().min(1),
  deliveryAddress: z.string().min(10),
  deliveryInstructions: z.string().optional(),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  items: z.array(z.object({
    menuItemId: z.string().optional(),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.string(),
    notes: z.string().optional(),
  })).min(1),
  subtotal: z.string(),
  salesTax: z.string().optional(),
  serviceFee: z.string().optional(),
  deliveryFee: z.string().optional(),
  gratuity: z.string().optional(),
  total: z.string(),
  notes: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'scheduled',
    'pending',
    'confirmed',
    'preparing',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
  notes: z.string().optional(),
});

export const CancelOrderSchema = z.object({
  reason: z.string().optional(),
  refundRequested: z.boolean().default(true),
  userId: z.string().optional(),
});

export const PaymentIntentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default('usd'),
  metadata: z.record(z.string()).optional(),
});

export const DeliveryQuoteSchema = z.object({
  pickupAddress: z.string().min(10),
  dropoffAddress: z.string().min(10),
  orderValue: z.number().optional(),
});

export const DispatchDeliverySchema = z.object({
  orderId: z.string().min(1),
  vendorName: z.string().min(1),
  vendorAddress: z.string().min(10),
  vendorPhone: z.string().min(10),
  customerName: z.string().min(2),
  customerAddress: z.string().min(10),
  customerPhone: z.string().min(10),
  dropoffInstructions: z.string().optional(),
  contactlessDropoff: z.boolean().default(true),
  scheduledPickupTime: z.string().optional(),
  scheduledDropoffTime: z.string().optional(),
  orderTotal: z.number().int().positive(),
  customerTip: z.number().int().nonnegative(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().optional(),
  })).optional(),
});

export const UserRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
});

export const PinLoginSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
});

export const WebhookPayloadSchema = z.object({
  event_type: z.string(),
  external_delivery_id: z.string(),
  delivery_id: z.string().optional(),
  delivery_status: z.string().optional(),
  dasher: z.object({
    first_name: z.string().optional(),
    phone_number: z.string().optional(),
    vehicle: z.string().optional(),
  }).optional(),
  tracking_url: z.string().optional(),
  estimated_pickup_time: z.string().optional(),
  estimated_dropoff_time: z.string().optional(),
  actual_pickup_time: z.string().optional(),
  actual_dropoff_time: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  error: string; 
  details: z.ZodIssue[]; 
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: 'Validation failed',
    details: result.error.issues,
  };
}
