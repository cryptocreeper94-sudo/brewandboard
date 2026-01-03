import type { Express, Request, Response } from 'express';
import { storage } from './storage';
import { checkRateLimit, resetRateLimit, verifyPin, verifyPinSync } from './security';
import logger from './logger';

function getAdminCredentials(): Map<string, { name: string; email: string; isDeveloper?: boolean; isAdmin?: boolean }> {
  const credentials = new Map();
  
  const devPin = process.env.ADMIN_DEV_PIN;
  if (devPin) {
    credentials.set(devPin, { 
      name: 'Developer', 
      email: 'dev@brewandboard.coffee', 
      isDeveloper: true 
    });
  }
  
  const adminPin = process.env.ADMIN_DAVID_PIN;
  if (adminPin) {
    credentials.set(adminPin, { 
      name: 'David', 
      email: 'david@brewandboard.coffee', 
      isAdmin: true 
    });
  }
  
  return credentials;
}

export function registerAuthRoutes(app: Express) {
  
  app.get('/api/auth/config', (req, res) => {
    res.json({
      replitAuth: true,
      providers: {
        google: true,
        apple: true,
        github: true,
        pin: true
      }
    });
  });

  app.post('/api/auth/pin', async (req: Request, res: Response) => {
    try {
      const { pin } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `auth:${clientIp}`;
      
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        logger.auth('warn', `Rate limited: ${clientIp}`, undefined, { retryAfter: rateCheck.retryAfter });
        return res.status(429).json({ 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateCheck.retryAfter 
        });
      }
      
      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }
      
      if (!/^\d{4,6}$/.test(pin)) {
        return res.status(400).json({ error: 'Invalid PIN format' });
      }
      
      const adminCredentials = getAdminCredentials();
      const adminCred = adminCredentials.get(pin);
      if (adminCred) {
        resetRateLimit(rateLimitKey);
        logger.auth('info', `Admin login: ${adminCred.name}`, `admin-secure`);
        
        return res.json({
          success: true,
          user: {
            id: adminCred.isDeveloper ? 'developer-secure' : 'admin-david-secure',
            name: adminCred.name,
            email: adminCred.email,
            company: 'Brew & Board Coffee',
            provider: 'pin',
            isDeveloper: adminCred.isDeveloper,
            isAdmin: adminCred.isAdmin
          }
        });
      }
      
      const user = await storage.getUserByPin(pin);
      
      if (!user) {
        logger.auth('warn', `Failed login attempt from ${clientIp}`);
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      
      let pinValid = false;
      
      if (user.pin?.startsWith('$2')) {
        pinValid = await verifyPin(pin, user.pin);
      } else {
        pinValid = user.pin === pin;
      }
      
      if (!pinValid) {
        logger.auth('warn', `Invalid PIN for user ${user.id}`);
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      
      resetRateLimit(rateLimitKey);
      logger.auth('info', `User login: ${user.name}`, user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          provider: 'pin'
        }
      });
    } catch (error: any) {
      logger.error('auth', 'PIN auth error', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  app.get('/api/auth/user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (userId === 'developer-secure' || userId.startsWith('developer-')) {
        return res.json({
          id: userId,
          name: 'Developer',
          email: 'dev@brewandboard.coffee',
          company: 'Brew & Board Coffee'
        });
      }

      if (userId === 'admin-david-secure' || userId.startsWith('admin-david-')) {
        return res.json({
          id: userId,
          name: 'David',
          email: 'david@brewandboard.coffee',
          company: 'Brew & Board Coffee'
        });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/orders/:orderId/cancel', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason, refundRequested = true } = req.body;
      const requestedBy = req.body.userId || 'customer';
      
      const { cancelOrder } = await import('./orderCancellation');
      
      const result = await cancelOrder({
        orderId,
        reason: reason || 'Customer requested cancellation',
        requestedBy,
        refundRequested,
      });
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('order', 'Order cancellation failed', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders/:orderId/cancellation-preview', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { getCancellationPreview } = await import('./orderCancellation');
      
      const preview = await getCancellationPreview(orderId);
      res.json(preview);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
