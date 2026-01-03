import type { Express, Request, Response } from 'express';
import { db } from './db';
import { doordashDeliveries, scheduledOrders, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as doordash from './doordashEnhanced';
import logger from './logger';
import { sendOrderStatusUpdate } from './emailService';
import { z } from 'zod';

const DeliveryQuoteSchema = z.object({
  pickupAddress: z.string().min(10),
  dropoffAddress: z.string().min(10),
  orderValue: z.number().optional(),
});

const TrackDeliverySchema = z.object({
  externalDeliveryId: z.string().min(5),
});

export function registerDoordashRoutes(app: Express) {
  app.post('/api/doordash/quote', async (req: Request, res: Response) => {
    try {
      const validation = DeliveryQuoteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request', 
          details: validation.error.errors 
        });
      }

      const { pickupAddress, dropoffAddress, orderValue } = validation.data;
      
      if (!doordash.isConfigured()) {
        return res.status(503).json({ 
          error: 'DoorDash integration not configured',
          fallbackFee: 599,
        });
      }
      
      const quote = await doordash.getDeliveryQuote(pickupAddress, dropoffAddress, orderValue);
      
      if (quote.success) {
        logger.delivery('info', `Delivery quote: $${(quote.fee || 0) / 100}`, {
          pickup: pickupAddress,
          dropoff: dropoffAddress,
        });
        res.json(quote);
      } else {
        res.status(400).json({ 
          error: quote.error,
          fallbackFee: 599,
        });
      }
    } catch (error: any) {
      logger.error('delivery', 'Quote request failed', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/doordash/status', async (req: Request, res: Response) => {
    try {
      const status = doordash.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/doordash/delivery/:externalDeliveryId', async (req: Request, res: Response) => {
    try {
      const { externalDeliveryId } = req.params;
      
      const delivery = await db.select()
        .from(doordashDeliveries)
        .where(eq(doordashDeliveries.externalDeliveryId, externalDeliveryId))
        .limit(1);
      
      if (delivery.length === 0) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
      
      const liveStatus = await doordash.getDeliveryStatus(externalDeliveryId);
      
      res.json({
        ...delivery[0],
        liveStatus: liveStatus.success ? {
          status: liveStatus.status,
          dasherName: liveStatus.dasherName,
          dasherPhone: liveStatus.dasherPhone,
          trackingUrl: liveStatus.trackingUrl,
        } : null,
      });
    } catch (error: any) {
      logger.error('delivery', 'Get delivery failed', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/doordash/delivery/:externalDeliveryId/location', async (req: Request, res: Response) => {
    try {
      const { externalDeliveryId } = req.params;
      
      const location = await doordash.getDriverLocation(externalDeliveryId);
      
      if (location.success) {
        res.json(location);
      } else {
        res.status(400).json({ error: location.error });
      }
    } catch (error: any) {
      logger.error('delivery', 'Get driver location failed', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/doordash/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-doordash-signature'] as string;
      const timestamp = req.headers['x-doordash-timestamp'] as string;
      const rawBody = JSON.stringify(req.body);
      
      if (signature && timestamp) {
        const isValid = doordash.verifyWebhookSignature(rawBody, signature, timestamp);
        if (!isValid) {
          logger.webhook('warn', 'Invalid DoorDash webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
      
      const event = doordash.parseWebhookEvent(req.body);
      
      if (!event) {
        logger.webhook('warn', 'Invalid webhook payload', { body: req.body });
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }
      
      logger.webhook('info', `DoorDash event: ${event.event_type}`, {
        externalDeliveryId: event.external_delivery_id,
        status: event.delivery_status,
      });
      
      const delivery = await db.select()
        .from(doordashDeliveries)
        .where(eq(doordashDeliveries.externalDeliveryId, event.external_delivery_id))
        .limit(1);
      
      if (delivery.length === 0) {
        logger.webhook('warn', `Delivery not found: ${event.external_delivery_id}`);
        return res.status(200).json({ received: true, status: 'delivery_not_found' });
      }
      
      const updateData: Record<string, any> = {
        status: event.delivery_status || delivery[0].status,
      };
      
      if (event.dasher) {
        updateData.dasherName = event.dasher.first_name;
        updateData.dasherPhoneNumber = event.dasher.phone_number;
        updateData.dasherVehicle = event.dasher.vehicle;
      }
      
      if (event.tracking_url) {
        updateData.trackingUrl = event.tracking_url;
      }
      
      if (event.estimated_pickup_time) {
        updateData.pickupTime = new Date(event.estimated_pickup_time);
      }
      
      if (event.estimated_dropoff_time) {
        updateData.dropoffTime = new Date(event.estimated_dropoff_time);
      }
      
      if (event.actual_pickup_time) {
        updateData.actualPickupTime = new Date(event.actual_pickup_time);
      }
      
      if (event.actual_dropoff_time) {
        updateData.actualDropoffTime = new Date(event.actual_dropoff_time);
      }
      
      if (event.cancellation_reason) {
        updateData.cancellationReason = event.cancellation_reason;
      }
      
      await db.update(doordashDeliveries)
        .set(updateData)
        .where(eq(doordashDeliveries.externalDeliveryId, event.external_delivery_id));
      
      if (delivery[0].scheduledOrderId) {
        let orderStatus = 'confirmed';
        
        switch (event.delivery_status) {
          case 'enroute_to_pickup':
          case 'arrived_at_pickup':
            orderStatus = 'preparing';
            break;
          case 'picked_up':
            orderStatus = 'picked_up';
            break;
          case 'enroute_to_dropoff':
          case 'arrived_at_dropoff':
            orderStatus = 'out_for_delivery';
            break;
          case 'delivered':
            orderStatus = 'delivered';
            break;
          case 'cancelled':
          case 'returned':
            orderStatus = 'cancelled';
            break;
        }
        
        await db.update(scheduledOrders)
          .set({ status: orderStatus })
          .where(eq(scheduledOrders.id, delivery[0].scheduledOrderId));
        
        const order = await db.select()
          .from(scheduledOrders)
          .where(eq(scheduledOrders.id, delivery[0].scheduledOrderId))
          .limit(1);
        
        const user = await db.select()
          .from(users)
          .where(eq(users.id, order[0].userId))
          .limit(1);
        
        if (user.length > 0 && user[0].email) {
          try {
            const statusMessages: Record<string, string> = {
              confirmed: 'Your order has been confirmed!',
              preparing: 'Your order is being prepared.',
              picked_up: 'Your order has been picked up by the driver.',
              out_for_delivery: 'Your order is on its way!',
              delivered: 'Your order has been delivered!',
              cancelled: 'Your order has been cancelled.',
            };
            
            await sendOrderStatusUpdate({
              orderId: order[0].id,
              customerName: order[0].contactName || 'Customer',
              customerEmail: user[0].email,
              status: orderStatus,
              statusMessage: statusMessages[orderStatus] || 'Order status updated.',
              trackingUrl: event.tracking_url,
              estimatedArrival: event.estimated_dropoff_time,
              driverName: event.dasher?.first_name,
            });
          } catch (emailError: any) {
            logger.error('webhook', 'Failed to send status email', emailError as Error);
          }
        }
      }
      
      res.status(200).json({ received: true, status: 'processed' });
    } catch (error: any) {
      logger.error('webhook', 'DoorDash webhook processing failed', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  app.post('/api/doordash/test-dispatch', async (req: Request, res: Response) => {
    try {
      const adminPin = req.headers['x-admin-pin'] as string;
      const adminPins = [process.env.ADMIN_DEV_PIN, process.env.ADMIN_DAVID_PIN].filter(Boolean);
      
      if (!adminPin || !adminPins.includes(adminPin)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      if (!doordash.isConfigured()) {
        return res.status(503).json({ error: 'DoorDash not configured' });
      }
      
      const testRequest: doordash.DispatchOrderRequest = {
        orderId: `test-${Date.now()}`,
        vendorName: 'Barista Parlor',
        vendorAddress: '519 Gallatin Ave, Nashville, TN 37206',
        vendorPhone: '+16155551234',
        customerName: 'Test Customer',
        customerAddress: '1 Broadway, Nashville, TN 37201',
        customerPhone: '+16155555678',
        dropoffInstructions: 'Test delivery - please simulate',
        orderTotal: 2500,
        customerTip: 500,
        items: [
          { name: 'Latte', quantity: 2, price: 450 },
          { name: 'Croissant', quantity: 1, price: 350 },
        ],
      };
      
      const result = await doordash.dispatchOrder(testRequest);
      
      logger.delivery('info', 'Test dispatch completed', { result });
      
      res.json(result);
    } catch (error: any) {
      logger.error('delivery', 'Test dispatch failed', error);
      res.status(500).json({ error: error.message });
    }
  });
}
