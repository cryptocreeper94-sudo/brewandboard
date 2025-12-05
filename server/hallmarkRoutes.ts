import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import * as hallmarkService from './hallmarkService';
import { getBlockchainStats, isBlockchainConfigured } from './solanaService';
import { HALLMARK_MINTING_FEE, HALLMARK_LIMITS } from '@shared/schema';
import { db } from './db';
import { subscriptions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function registerHallmarkRoutes(app: Express) {
  
  // ========================
  // BLOCKCHAIN STATUS
  // ========================
  
  app.get('/api/hallmark/blockchain/status', async (req: Request, res: Response) => {
    try {
      const stats = await getBlockchainStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // COMPANY HALLMARKS
  // ========================
  
  app.post('/api/hallmark/company/issue', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        assetType: z.string(),
        assetId: z.string().optional(),
        assetName: z.string().optional(),
        issuedBy: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      });
      
      const data = schema.parse(req.body);
      const result = await hallmarkService.issueCompanyHallmark(data);
      
      res.json({ 
        success: true, 
        hallmark: result.hallmark, 
        blockchain: result.blockchainResult 
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
  
  app.get('/api/hallmark/company', async (req: Request, res: Response) => {
    try {
      const hallmarks = await hallmarkService.getCompanyHallmarks();
      res.json(hallmarks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // APP VERSION HALLMARKS
  // ========================
  
  app.post('/api/hallmark/version/issue', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        version: z.string(),
        changelog: z.string(),
        releaseNotes: z.string().optional(),
        releasedBy: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const result = await hallmarkService.issueAppVersionHallmark(data);
      
      res.json({ 
        success: true, 
        version: result.version,
        hallmark: result.hallmark, 
        blockchain: result.blockchainResult 
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
  
  app.get('/api/hallmark/version/current', async (req: Request, res: Response) => {
    try {
      const version = await hallmarkService.getCurrentAppVersion();
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/hallmark/version/history', async (req: Request, res: Response) => {
    try {
      const versions = await hallmarkService.getAppVersionHistory();
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // USER HALLMARK PROFILE
  // ========================
  
  app.get('/api/hallmark/profile/:userId', async (req: Request, res: Response) => {
    try {
      const profile = await hallmarkService.getUserHallmarkProfile(req.params.userId);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/hallmark/profile/create', async (req: Request, res: Response) => {
    try {
      const { userId, username } = req.body;
      
      if (!userId || !username) {
        return res.status(400).json({ error: 'userId and username are required' });
      }
      
      // Check if profile already exists
      const existing = await hallmarkService.getUserHallmarkProfile(userId);
      if (existing) {
        return res.json({ profile: existing, isNew: false });
      }
      
      const profile = await hallmarkService.createUserHallmarkProfile(userId, username);
      res.json({ profile, isNew: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.post('/api/hallmark/profile/avatar', async (req: Request, res: Response) => {
    try {
      const { userId, avatarData } = req.body;
      
      if (!userId || !avatarData) {
        return res.status(400).json({ error: 'userId and avatarData are required' });
      }
      
      const profile = await hallmarkService.updateUserAvatar(userId, avatarData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // ========================
  // HALLMARK MINTING (Payment)
  // ========================
  
  app.post('/api/hallmark/mint/checkout', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }
      
      const { userId, successUrl, cancelUrl } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if already minted
      const profile = await hallmarkService.getUserHallmarkProfile(userId);
      if (profile?.isMinted) {
        return res.status(400).json({ error: 'Hallmark already minted' });
      }
      
      // Create profile if doesn't exist
      if (!profile) {
        await hallmarkService.createUserHallmarkProfile(userId, user.name);
      }
      
      // Create Stripe checkout for minting fee
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Brew & Board Personal Hallmark',
              description: 'One-time minting fee for your personal blockchain-verified hallmark badge'
            },
            unit_amount: HALLMARK_MINTING_FEE
          },
          quantity: 1
        }],
        automatic_tax: { enabled: true },
        success_url: successUrl || `${req.headers.origin}/hallmark-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/portfolio`,
        metadata: { userId, type: 'hallmark_mint' }
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Hallmark mint checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/hallmark/mint/complete', async (req: Request, res: Response) => {
    try {
      const { userId, txSignature } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const profile = await hallmarkService.mintUserHallmark(userId, txSignature);
      res.json({ success: true, profile });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // ========================
  // USER HALLMARKS
  // ========================
  
  app.post('/api/hallmark/user/issue', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string(),
        assetType: z.string(),
        assetId: z.string().optional(),
        assetName: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      });
      
      const data = schema.parse(req.body);
      
      // Check subscription tier for limits
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, data.userId));
      
      const tier = (subscription?.tier || 'starter') as 'starter' | 'professional' | 'enterprise';
      const canStamp = await hallmarkService.canUserStampDocument(data.userId, tier);
      
      if (!canStamp.allowed) {
        return res.status(403).json({ 
          error: `Monthly hallmark limit reached (${canStamp.limit}). Upgrade your plan for more.`,
          limit: canStamp.limit,
          remaining: canStamp.remaining
        });
      }
      
      const result = await hallmarkService.issueUserHallmark(data);
      
      if ('error' in result) {
        return res.status(400).json({ success: false, error: result.error });
      }
      
      res.json({ 
        success: true, 
        hallmark: result.hallmark, 
        blockchain: result.blockchainResult,
        remaining: canStamp.remaining - 1
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
  
  app.get('/api/hallmark/user/:userId', async (req: Request, res: Response) => {
    try {
      const hallmarks = await hallmarkService.getUserHallmarks(req.params.userId);
      res.json(hallmarks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/hallmark/user/:userId/limits', async (req: Request, res: Response) => {
    try {
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, req.params.userId));
      
      const tier = (subscription?.tier || 'starter') as 'starter' | 'professional' | 'enterprise';
      const limits = await hallmarkService.canUserStampDocument(req.params.userId, tier);
      
      res.json({
        tier,
        ...limits,
        tierLimits: HALLMARK_LIMITS
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // VERIFICATION (Public)
  // ========================
  
  app.get('/api/hallmark/verify/:code', async (req: Request, res: Response) => {
    try {
      const result = await hallmarkService.verifyHallmark(req.params.code, req);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ valid: false, message: error.message });
    }
  });
  
  app.get('/api/hallmark/:code', async (req: Request, res: Response) => {
    try {
      const hallmark = await hallmarkService.getHallmarkBySerial(req.params.code);
      if (!hallmark) {
        return res.status(404).json({ error: 'Hallmark not found' });
      }
      res.json(hallmark);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // REVOCATION (Admin)
  // ========================
  
  app.post('/api/hallmark/:code/revoke', async (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const success = await hallmarkService.revokeHallmark(req.params.code, reason);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // ========================
  // STATS
  // ========================
  
  app.get('/api/hallmark/stats', async (req: Request, res: Response) => {
    try {
      const stats = await hallmarkService.getHallmarkStats();
      const blockchainStats = await getBlockchainStats();
      
      res.json({
        ...stats,
        blockchain: blockchainStats
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // SEED INITIAL HALLMARKS
  // ========================
  
  app.post('/api/hallmark/seed', async (req: Request, res: Response) => {
    try {
      const results = {
        app: null as any,
        developer: null as any
      };
      
      // Check if app hallmark (BB-0000000001) already exists
      const existingApp = await hallmarkService.getHallmarkBySerial('BB-0000000001');
      if (!existingApp) {
        // Issue BB-0000000001 for the app itself
        results.app = await hallmarkService.issueCompanyHallmark({
          assetType: 'application',
          assetId: 'brew-and-board-v1',
          assetName: 'Brew & Board Coffee Platform',
          issuedBy: 'Darkwave Studios, LLC',
          metadata: {
            version: '1.0.0',
            domain: 'brewandboard.coffee',
            launchDate: '2024-12-01',
            description: 'B2B Coffee Delivery Platform for Nashville'
          }
        });
      } else {
        results.app = { hallmark: existingApp, existing: true };
      }
      
      // Check if developer hallmark (BB-0000000002) already exists
      const existingDev = await hallmarkService.getHallmarkBySerial('BB-0000000002');
      if (!existingDev) {
        // Issue BB-0000000002 for the developer
        results.developer = await hallmarkService.issueCompanyHallmark({
          assetType: 'founder',
          assetId: 'developer-01',
          assetName: 'Founder & Lead Developer',
          issuedBy: 'Brew & Board Coffee',
          metadata: {
            role: 'Founder & Lead Developer',
            company: 'Darkwave Studios, LLC',
            issueDate: new Date().toISOString()
          }
        });
      } else {
        results.developer = { hallmark: existingDev, existing: true };
      }
      
      res.json({
        success: true,
        ...results
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Get the primary app hallmark (BB-0000000001)
  app.get('/api/hallmark/app', async (req: Request, res: Response) => {
    try {
      const hallmark = await hallmarkService.getHallmarkBySerial('BB-0000000001');
      res.json(hallmark);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========================
  // ADMIN SEARCH (Cross-tenant)
  // ========================
  
  app.get('/api/hallmark/admin/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string | undefined;
      const type = (req.query.type as 'all' | 'company' | 'user') || 'all';
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await hallmarkService.searchAllHallmarks({
        query,
        type,
        status,
        limit,
        offset
      });
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all user profiles for admin
  app.get('/api/hallmark/admin/profiles', async (req: Request, res: Response) => {
    try {
      const profiles = await hallmarkService.getAllUserProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
