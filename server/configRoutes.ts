import type { Express, Request, Response } from 'express';
import { db } from './db';
import { systemSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import logger from './logger';

interface SystemConfig {
  doordashEnvironment: 'sandbox' | 'production';
  systemLive: boolean;
  maintenanceMode: boolean;
  maxConcurrentOrders: number;
  minimumLeadTimeHours: number;
  autoDispatchEnabled: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  doordashEnvironment: 'sandbox',
  systemLive: false,
  maintenanceMode: false,
  maxConcurrentOrders: 4,
  minimumLeadTimeHours: 2,
  autoDispatchEnabled: true,
};

let cachedConfig: SystemConfig | null = null;

async function loadConfig(): Promise<SystemConfig> {
  if (cachedConfig) return cachedConfig;
  
  try {
    const settings = await db.select()
      .from(systemSettings)
      .where(eq(systemSettings.key, 'system_config'))
      .limit(1);
    
    if (settings.length > 0 && settings[0].value) {
      const parsed = JSON.parse(settings[0].value);
      cachedConfig = { ...DEFAULT_CONFIG, ...parsed };
      return cachedConfig as SystemConfig;
    }
  } catch (error) {
    logger.warn('system', 'Failed to load config from database, using defaults');
  }
  
  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

async function saveConfig(config: SystemConfig): Promise<boolean> {
  try {
    const existing = await db.select()
      .from(systemSettings)
      .where(eq(systemSettings.key, 'system_config'))
      .limit(1);
    
    const configJson = JSON.stringify(config);
    
    if (existing.length > 0) {
      await db.update(systemSettings)
        .set({ value: configJson, updatedAt: new Date() })
        .where(eq(systemSettings.key, 'system_config'));
    } else {
      await db.insert(systemSettings).values({
        key: 'system_config',
        value: configJson,
        description: 'System-wide configuration settings',
      });
    }
    
    cachedConfig = config;
    return true;
  } catch (error) {
    logger.error('system', 'Failed to save config', error as Error);
    return false;
  }
}

function getAdminPins(): string[] {
  const pins: string[] = [];
  if (process.env.ADMIN_DEV_PIN) pins.push(process.env.ADMIN_DEV_PIN);
  if (process.env.ADMIN_DAVID_PIN) pins.push(process.env.ADMIN_DAVID_PIN);
  return pins;
}

function adminAuthMiddleware(req: Request, res: Response, next: Function) {
  const adminPin = req.headers['x-admin-pin'] as string;
  const adminPins = getAdminPins();
  
  if (adminPin && adminPins.includes(adminPin)) {
    return next();
  }
  
  const session = (req as any).session;
  if (session?.user?.isAdmin === true || session?.user?.isDeveloper === true) {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required' });
}

export function registerConfigRoutes(app: Express) {
  app.get('/api/config/system', async (req: Request, res: Response) => {
    try {
      const config = await loadConfig();
      
      res.json({
        doordashEnvironment: config.doordashEnvironment,
        systemLive: config.systemLive,
        maintenanceMode: config.maintenanceMode,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/config/admin', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const config = await loadConfig();
      
      const envVars = {
        doordash: {
          developerId: !!process.env.DOORDASH_DEVELOPER_ID,
          keyId: !!process.env.DOORDASH_KEY_ID,
          signingSecret: !!process.env.DOORDASH_SIGNING_SECRET,
          environment: process.env.DOORDASH_ENVIRONMENT || 'sandbox',
        },
        stripe: {
          secretKey: !!process.env.STRIPE_SECRET_KEY,
          publishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
          webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        },
        email: {
          resendApiKey: !!process.env.RESEND_API_KEY,
        },
        database: {
          url: !!process.env.DATABASE_URL,
        },
        admin: {
          devPin: !!process.env.ADMIN_DEV_PIN,
          davidPin: !!process.env.ADMIN_DAVID_PIN,
        },
      };
      
      res.json({
        config,
        envVars,
        productionReady: checkProductionReadiness(config, envVars),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/config/admin', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const currentConfig = await loadConfig();
      const updates = req.body;
      
      const allowedUpdates = [
        'doordashEnvironment',
        'systemLive',
        'maintenanceMode',
        'maxConcurrentOrders',
        'minimumLeadTimeHours',
        'autoDispatchEnabled',
      ];
      
      const newConfig = { ...currentConfig };
      
      for (const key of allowedUpdates) {
        if (key in updates) {
          (newConfig as any)[key] = updates[key];
        }
      }
      
      if (updates.doordashEnvironment === 'production' && currentConfig.doordashEnvironment !== 'production') {
        const envCheck = {
          developerId: !!process.env.DOORDASH_DEVELOPER_ID,
          keyId: !!process.env.DOORDASH_KEY_ID,
          signingSecret: !!process.env.DOORDASH_SIGNING_SECRET,
        };
        
        if (!envCheck.developerId || !envCheck.keyId || !envCheck.signingSecret) {
          return res.status(400).json({
            error: 'Cannot switch to production without DoorDash credentials',
            missing: Object.entries(envCheck).filter(([_, v]) => !v).map(([k]) => k),
          });
        }
        
        logger.warn('system', 'Switching DoorDash to PRODUCTION mode');
      }
      
      const saved = await saveConfig(newConfig);
      
      if (saved) {
        logger.info('system', 'System configuration updated', { updates });
        res.json({ success: true, config: newConfig });
      } else {
        res.status(500).json({ error: 'Failed to save configuration' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/config/go-live', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const currentConfig = await loadConfig();
      
      const envCheck = {
        doordash: {
          developerId: !!process.env.DOORDASH_DEVELOPER_ID,
          keyId: !!process.env.DOORDASH_KEY_ID,
          signingSecret: !!process.env.DOORDASH_SIGNING_SECRET,
        },
        stripe: {
          secretKey: !!process.env.STRIPE_SECRET_KEY,
          publishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
        },
        email: {
          resendApiKey: !!process.env.RESEND_API_KEY,
        },
      };
      
      const missingVars: string[] = [];
      
      if (!envCheck.doordash.developerId) missingVars.push('DOORDASH_DEVELOPER_ID');
      if (!envCheck.doordash.keyId) missingVars.push('DOORDASH_KEY_ID');
      if (!envCheck.doordash.signingSecret) missingVars.push('DOORDASH_SIGNING_SECRET');
      if (!envCheck.stripe.secretKey) missingVars.push('STRIPE_SECRET_KEY');
      if (!envCheck.stripe.publishableKey) missingVars.push('STRIPE_PUBLISHABLE_KEY');
      
      if (missingVars.length > 0) {
        return res.status(400).json({
          error: 'Cannot go live without required environment variables',
          missing: missingVars,
        });
      }
      
      const newConfig: SystemConfig = {
        ...currentConfig,
        doordashEnvironment: 'production',
        systemLive: true,
        maintenanceMode: false,
      };
      
      const saved = await saveConfig(newConfig);
      
      if (saved) {
        logger.warn('system', 'SYSTEM IS NOW LIVE - Production mode enabled');
        res.json({ 
          success: true, 
          message: 'System is now live!',
          config: newConfig 
        });
      } else {
        res.status(500).json({ error: 'Failed to go live' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

function checkProductionReadiness(config: SystemConfig, envVars: any): {
  ready: boolean;
  checklist: Array<{ item: string; status: 'pass' | 'fail' | 'warning'; message: string }>;
} {
  const checklist: Array<{ item: string; status: 'pass' | 'fail' | 'warning'; message: string }> = [];
  
  checklist.push({
    item: 'DoorDash Developer ID',
    status: envVars.doordash.developerId ? 'pass' : 'fail',
    message: envVars.doordash.developerId ? 'Configured' : 'Missing DOORDASH_DEVELOPER_ID',
  });
  
  checklist.push({
    item: 'DoorDash Key ID',
    status: envVars.doordash.keyId ? 'pass' : 'fail',
    message: envVars.doordash.keyId ? 'Configured' : 'Missing DOORDASH_KEY_ID',
  });
  
  checklist.push({
    item: 'DoorDash Signing Secret',
    status: envVars.doordash.signingSecret ? 'pass' : 'fail',
    message: envVars.doordash.signingSecret ? 'Configured' : 'Missing DOORDASH_SIGNING_SECRET',
  });
  
  checklist.push({
    item: 'Stripe Secret Key',
    status: envVars.stripe.secretKey ? 'pass' : 'fail',
    message: envVars.stripe.secretKey ? 'Configured' : 'Missing STRIPE_SECRET_KEY',
  });
  
  checklist.push({
    item: 'Stripe Publishable Key',
    status: envVars.stripe.publishableKey ? 'pass' : 'fail',
    message: envVars.stripe.publishableKey ? 'Configured' : 'Missing STRIPE_PUBLISHABLE_KEY',
  });
  
  checklist.push({
    item: 'Email Service',
    status: envVars.email.resendApiKey ? 'pass' : 'warning',
    message: envVars.email.resendApiKey ? 'Configured' : 'Email notifications disabled',
  });
  
  checklist.push({
    item: 'Database',
    status: envVars.database.url ? 'pass' : 'fail',
    message: envVars.database.url ? 'Connected' : 'Missing DATABASE_URL',
  });
  
  checklist.push({
    item: 'Admin Credentials',
    status: envVars.admin.devPin && envVars.admin.davidPin ? 'pass' : 'warning',
    message: envVars.admin.devPin && envVars.admin.davidPin ? 'Configured' : 'Admin PINs not set',
  });
  
  const failCount = checklist.filter(c => c.status === 'fail').length;
  
  return {
    ready: failCount === 0,
    checklist,
  };
}

export { loadConfig };
