import type { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { scheduledOrders, payments, users } from '@shared/schema';
import { eq, and, gte, sql, count, sum } from 'drizzle-orm';
import logger from './logger';
import * as doordash from './doordashEnhanced';

function getAdminPins(): string[] {
  const pins: string[] = [];
  
  if (process.env.ADMIN_DEV_PIN) {
    pins.push(process.env.ADMIN_DEV_PIN);
  }
  
  if (process.env.ADMIN_DAVID_PIN) {
    pins.push(process.env.ADMIN_DAVID_PIN);
  }
  
  if (pins.length === 0) {
    logger.warn('system', 'No admin PINs configured in environment variables');
  }
  
  return pins;
}

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const adminPin = req.headers['x-admin-pin'] as string;
  
  const adminPins = getAdminPins();
  if (adminPin && adminPins.includes(adminPin)) {
    logger.auth('info', 'Admin access granted via PIN header');
    return next();
  }
  
  const session = (req as any).session;
  if (session?.user?.isAdmin === true || session?.user?.isDeveloper === true) {
    logger.auth('info', `Admin access granted via session for user ${session.user.id}`);
    return next();
  }
  
  logger.auth('warn', 'Admin access denied - no valid credentials');
  return res.status(403).json({ error: 'Admin access required' });
}

export function registerAdminRoutes(app: Express) {
  app.get('/api/admin/metrics', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const allOrders = await db.select().from(scheduledOrders);
      
      const todayOrders = allOrders.filter(o => o.scheduledDate === todayStr);
      const pendingOrders = allOrders.filter(o => o.status === 'scheduled' || o.status === 'pending');
      const inProgressOrders = allOrders.filter(o => 
        ['confirmed', 'preparing', 'picked_up', 'out_for_delivery'].includes(o.status)
      );
      const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
      const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');
      
      const revenueToday = todayOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total) * 100, 0);
      
      const weekOrders = allOrders.filter(o => {
        const orderDate = new Date(o.scheduledDate);
        return orderDate >= weekAgo;
      });
      const revenueWeek = weekOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total) * 100, 0);
      
      const monthOrders = allOrders.filter(o => {
        const orderDate = new Date(o.scheduledDate);
        return orderDate >= monthAgo;
      });
      const revenueMonth = monthOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total) * 100, 0);
      
      const doordashStatus = doordash.getStatus();
      
      const logStats = logger.getStats();
      
      res.json({
        orders: {
          today: todayOrders.length,
          pending: pendingOrders.length,
          inProgress: inProgressOrders.length,
          delivered: deliveredOrders.filter(o => o.scheduledDate === todayStr).length,
          cancelled: cancelledOrders.filter(o => o.scheduledDate === todayStr).length,
        },
        revenue: {
          today: revenueToday,
          thisWeek: revenueWeek,
          thisMonth: revenueMonth,
        },
        doordash: doordashStatus,
        logs: logStats,
      });
    } catch (error: any) {
      logger.error('system', 'Failed to fetch admin metrics', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/logs', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const level = req.query.level as string | undefined;
      const category = req.query.category as string | undefined;
      
      const logs = logger.getRecentLogs({ 
        limit, 
        level: level as any, 
        category: category as any 
      });
      
      res.json(logs);
    } catch (error: any) {
      logger.error('system', 'Failed to fetch logs', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/orders/stats', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const orders = await db.select().from(scheduledOrders);
      
      const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.scheduledDate);
        return orderDate >= startDate;
      });
      
      const byStatus: Record<string, number> = {};
      const byDay: Record<string, number> = {};
      const revenueByDay: Record<string, number> = {};
      
      for (const order of filteredOrders) {
        byStatus[order.status] = (byStatus[order.status] || 0) + 1;
        
        const dayKey = order.scheduledDate;
        byDay[dayKey] = (byDay[dayKey] || 0) + 1;
        
        if (order.status !== 'cancelled') {
          revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + parseFloat(order.total);
        }
      }
      
      res.json({
        total: filteredOrders.length,
        byStatus,
        byDay,
        revenueByDay,
        avgOrderValue: filteredOrders.length > 0 
          ? filteredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0) / filteredOrders.length 
          : 0,
      });
    } catch (error: any) {
      logger.error('system', 'Failed to fetch order stats', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/doordash/status', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const status = doordash.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/test-email', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { sendOrderConfirmation } = await import('./emailService');
      
      const testData = {
        orderId: 'test-order-123',
        customerName: 'Test User',
        customerEmail: req.body.email || 'test@example.com',
        vendorName: 'Test Coffee Shop',
        deliveryAddress: '123 Test Street, Nashville, TN 37201',
        scheduledDate: new Date().toLocaleDateString(),
        scheduledTime: '10:00 AM',
        items: [
          { name: 'Latte', quantity: 2, price: '4.50' },
          { name: 'Croissant', quantity: 1, price: '3.25' },
        ],
        subtotal: '12.25',
        serviceFee: '1.84',
        deliveryFee: '5.99',
        tax: '1.19',
        gratuity: '2.00',
        total: '23.27',
      };
      
      const result = await sendOrderConfirmation(testData);
      
      res.json({ success: result, message: result ? 'Test email sent' : 'Failed to send email' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/system-health', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const health: Record<string, any> = {
        api: 'healthy',
        database: 'checking',
        doordash: 'checking',
        email: 'checking',
        stripe: 'checking',
        timestamp: new Date().toISOString(),
      };
      
      try {
        await db.select({ count: count() }).from(users);
        health.database = 'healthy';
      } catch (e) {
        health.database = 'error';
      }
      
      const ddStatus = doordash.getStatus();
      health.doordash = ddStatus.configured 
        ? (ddStatus.circuitBreaker === 'open' ? 'degraded' : 'healthy')
        : 'not-configured';
      
      const { isConfigured: emailConfigured } = await import('./emailService');
      health.email = emailConfigured() ? 'healthy' : 'not-configured';
      
      health.stripe = process.env.STRIPE_SECRET_KEY ? 'healthy' : 'not-configured';
      
      const allHealthy = Object.values(health)
        .filter(v => typeof v === 'string' && v !== 'healthy' && v !== 'not-configured')
        .length === 0;
      
      res.json({
        status: allHealthy ? 'healthy' : 'degraded',
        services: health,
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error', 
        error: error.message,
        services: { api: 'error' }
      });
    }
  });
}
