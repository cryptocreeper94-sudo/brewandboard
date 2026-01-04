import type { Express, Request, Response } from 'express';
import { storage } from './storage';
import { checkRateLimit, resetRateLimit, verifyPin, hashPin } from './security';
import { sendPasswordResetEmail } from './emailService';
import logger from './logger';
import crypto from 'crypto';

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
        pin: true,
        email: true
      }
    });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name, company } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `register:${clientIp}`;
      
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: rateCheck.retryAfter 
        });
      }
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      
      const passwordHash = await hashPin(password);
      
      const user = await storage.createUser({
        email,
        passwordHash,
        name: name || email.split('@')[0],
        company: company || 'New Customer'
      });
      
      resetRateLimit(rateLimitKey);
      logger.auth('info', `New user registered: ${email}`, user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          provider: 'email'
        }
      });
    } catch (error: any) {
      logger.error('auth', 'Registration error', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `login:${clientIp}`;
      
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateCheck.retryAfter 
        });
      }
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.passwordHash) {
        logger.auth('warn', `Failed login attempt for: ${email}`, undefined, { ip: clientIp });
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const passwordValid = await verifyPin(password, user.passwordHash);
      
      if (!passwordValid) {
        logger.auth('warn', `Invalid password for: ${email}`, user.id);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      resetRateLimit(rateLimitKey);
      logger.auth('info', `User login: ${email}`, user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          provider: 'email'
        }
      });
    } catch (error: any) {
      logger.error('auth', 'Login error', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `forgot:${clientIp}`;
      
      const rateCheck = checkRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateCheck.retryAfter 
        });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      res.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
      
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        
        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : 'http://localhost:5000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        
        try {
          await sendPasswordResetEmail(email, resetUrl, user.name || 'Customer');
          logger.auth('info', `Password reset email sent to: ${email}`, user.id);
        } catch (emailError: any) {
          logger.error('auth', 'Failed to send password reset email', emailError as Error);
        }
      }
    } catch (error: any) {
      logger.error('auth', 'Forgot password error', error);
      res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset link' });
      }
      
      if (resetToken.usedAt) {
        return res.status(400).json({ error: 'This reset link has already been used' });
      }
      
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: 'This reset link has expired' });
      }
      
      const passwordHash = await hashPin(password);
      
      await storage.updateUserPassword(resetToken.userId, passwordHash);
      await storage.markPasswordResetTokenUsed(token);
      
      logger.auth('info', `Password reset successful for user: ${resetToken.userId}`);
      
      res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error: any) {
      logger.error('auth', 'Reset password error', error);
      res.status(500).json({ error: 'Failed to reset password. Please try again.' });
    }
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
