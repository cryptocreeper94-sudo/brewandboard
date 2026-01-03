import Stripe from 'stripe';
import { db } from './db';
import { scheduledOrders, orderEvents, payments, doordashDeliveries } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import logger from './logger';
import { sendOrderCancellation } from './emailService';
import * as doordash from './doordashEnhanced';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export interface CancellationRequest {
  orderId: string;
  reason: string;
  requestedBy: string;
  refundRequested: boolean;
}

export interface CancellationResult {
  success: boolean;
  orderId: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed' | 'not_applicable';
  doordashCancelled?: boolean;
  error?: string;
}

const CANCELLATION_POLICY = {
  freeWithin: 60,
  partialRefundWithin: 120,
  partialRefundPercent: 50,
  noRefundAfter: 120,
};

function getRefundPolicy(orderCreatedAt: Date, scheduledTime: Date): {
  refundPercent: number;
  reason: string;
} {
  const now = new Date();
  const minutesSinceOrder = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60);
  const minutesUntilDelivery = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
  
  if (minutesSinceOrder <= CANCELLATION_POLICY.freeWithin) {
    return { refundPercent: 100, reason: 'Cancelled within 1 hour of order' };
  }
  
  if (minutesUntilDelivery > 120) {
    return { refundPercent: 100, reason: 'Cancelled more than 2 hours before delivery' };
  }
  
  if (minutesUntilDelivery > 60) {
    return { refundPercent: 50, reason: 'Cancelled 1-2 hours before delivery - 50% refund' };
  }
  
  return { refundPercent: 0, reason: 'Cancelled less than 1 hour before delivery - no refund' };
}

export async function cancelOrder(request: CancellationRequest): Promise<CancellationResult> {
  logger.info('order', `Cancellation requested for order ${request.orderId}`, { 
    reason: request.reason, 
    requestedBy: request.requestedBy 
  });
  
  const [order] = await db.select().from(scheduledOrders).where(eq(scheduledOrders.id, request.orderId));
  
  if (!order) {
    return { success: false, orderId: request.orderId, error: 'Order not found' };
  }
  
  if (order.status === 'cancelled') {
    return { success: false, orderId: request.orderId, error: 'Order already cancelled' };
  }
  
  if (order.status === 'delivered') {
    return { success: false, orderId: request.orderId, error: 'Cannot cancel delivered order' };
  }
  
  if (order.status === 'out_for_delivery') {
    return { success: false, orderId: request.orderId, error: 'Cannot cancel order already out for delivery' };
  }
  
  let doordashCancelled = false;
  
  const [delivery] = await db.select()
    .from(doordashDeliveries)
    .where(eq(doordashDeliveries.scheduledOrderId, request.orderId));
  
  if (delivery && doordash.isConfigured()) {
    try {
      const cancelResult = await doordash.cancelDelivery(delivery.externalDeliveryId);
      doordashCancelled = cancelResult.success;
      
      if (cancelResult.success) {
        await db.update(doordashDeliveries)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(doordashDeliveries.externalDeliveryId, delivery.externalDeliveryId));
        
        logger.info('delivery', `DoorDash delivery cancelled: ${delivery.externalDeliveryId}`);
      } else {
        logger.warn('delivery', `Failed to cancel DoorDash delivery: ${cancelResult.error}`);
      }
    } catch (error: any) {
      logger.error('delivery', 'Error cancelling DoorDash delivery', error);
    }
  }
  
  let refundId: string | undefined;
  let refundAmount: number | undefined;
  let refundStatus: 'pending' | 'processed' | 'failed' | 'not_applicable' = 'not_applicable';
  
  if (request.refundRequested) {
    const [payment] = await db.select()
      .from(payments)
      .where(and(
        eq(payments.orderId, request.orderId),
        eq(payments.status, 'completed')
      ));
    
    if (payment && payment.providerPaymentId && stripe) {
      const scheduledDateTime = new Date(`${order.scheduledDate}T${order.scheduledTime}`);
      const policy = getRefundPolicy(order.createdAt || new Date(), scheduledDateTime);
      
      if (policy.refundPercent > 0) {
        const totalAmount = Math.round(parseFloat(payment.amount) * 100);
        const refundCents = Math.round(totalAmount * (policy.refundPercent / 100));
        
        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.providerPaymentId,
            amount: refundCents,
            reason: 'requested_by_customer',
            metadata: {
              orderId: request.orderId,
              reason: request.reason,
              policy: policy.reason,
            },
          });
          
          refundId = refund.id;
          refundAmount = refundCents / 100;
          refundStatus = refund.status === 'succeeded' ? 'processed' : 'pending';
          
          await db.update(payments)
            .set({ 
              status: 'refunded',
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));
          
          logger.payment('info', `Refund processed: $${refundAmount}`, {
            orderId: request.orderId,
            refundId,
            percent: policy.refundPercent,
          });
        } catch (error: any) {
          logger.error('payment', 'Refund failed', error, { orderId: request.orderId });
          refundStatus = 'failed';
        }
      } else {
        logger.info('payment', `No refund issued: ${policy.reason}`, { orderId: request.orderId });
      }
    }
  }
  
  await db.update(scheduledOrders)
    .set({ 
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(scheduledOrders.id, request.orderId));
  
  await db.insert(orderEvents).values({
    orderId: request.orderId,
    status: 'cancelled',
    note: `Cancelled by ${request.requestedBy}: ${request.reason}${refundAmount ? `. Refund: $${refundAmount}` : ''}`,
    changedBy: request.requestedBy,
  });
  
  if (order.contactName) {
    const [user] = await db.select().from(scheduledOrders).where(eq(scheduledOrders.id, request.orderId));
    
    if (user) {
      await sendOrderCancellation({
        orderId: request.orderId,
        customerName: order.contactName,
        customerEmail: '', 
        reason: request.reason,
        refundAmount: refundAmount?.toFixed(2),
        refundStatus: refundStatus === 'failed' ? 'pending' : refundStatus,
      });
    }
  }
  
  logger.info('order', `Order cancelled successfully: ${request.orderId}`, {
    doordashCancelled,
    refundAmount,
    refundStatus,
  });
  
  return {
    success: true,
    orderId: request.orderId,
    refundId,
    refundAmount,
    refundStatus,
    doordashCancelled,
  };
}

export async function getCancellationPreview(orderId: string): Promise<{
  canCancel: boolean;
  refundPercent: number;
  refundAmount: number;
  reason: string;
  orderStatus: string;
}> {
  const [order] = await db.select().from(scheduledOrders).where(eq(scheduledOrders.id, orderId));
  
  if (!order) {
    return {
      canCancel: false,
      refundPercent: 0,
      refundAmount: 0,
      reason: 'Order not found',
      orderStatus: 'unknown',
    };
  }
  
  if (['cancelled', 'delivered', 'out_for_delivery'].includes(order.status)) {
    return {
      canCancel: false,
      refundPercent: 0,
      refundAmount: 0,
      reason: `Cannot cancel order with status: ${order.status}`,
      orderStatus: order.status,
    };
  }
  
  const scheduledDateTime = new Date(`${order.scheduledDate}T${order.scheduledTime}`);
  const policy = getRefundPolicy(order.createdAt || new Date(), scheduledDateTime);
  const totalAmount = parseFloat(order.total);
  
  return {
    canCancel: true,
    refundPercent: policy.refundPercent,
    refundAmount: Math.round(totalAmount * (policy.refundPercent / 100) * 100) / 100,
    reason: policy.reason,
    orderStatus: order.status,
  };
}
