import type { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { APP_PERMISSIONS, CODE_CATEGORIES } from '@shared/schema';
import crypto from 'crypto';

function generateApiKey(): string {
  return 'bb_' + crypto.randomBytes(24).toString('hex');
}

function generateApiSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const app = await storage.getConnectedAppByApiKey(apiKey);
  
  if (!app) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!app.isActive) {
    return res.status(403).json({ error: 'App is disabled' });
  }

  (req as any).connectedApp = app;
  await storage.incrementAppRequestCount(app.id);
  next();
}

function hasPermission(app: any, permission: string): boolean {
  if (!app.permissions) return false;
  return app.permissions.includes(permission) || app.permissions.includes('sync:all');
}

export function registerAppEcosystemRoutes(app: Express) {
  
  // ========================
  // CONNECTED APPS MANAGEMENT (Dev Dashboard)
  // ========================
  
  app.get('/api/ecosystem/apps', async (req: Request, res: Response) => {
    try {
      const apps = await storage.getConnectedApps();
      const safeApps = apps.map(a => ({
        ...a,
        apiSecret: '••••••••' + a.apiSecret.slice(-4)
      }));
      res.json(safeApps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ecosystem/apps', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        baseUrl: z.string().url(),
        permissions: z.array(z.string()).optional(),
      });
      
      const data = schema.parse(req.body);
      const apiKey = generateApiKey();
      const apiSecret = generateApiSecret();
      
      const newApp = await storage.createConnectedApp({
        ...data,
        apiKey,
        apiSecret,
        permissions: data.permissions || [],
        isActive: true,
      });
      
      res.json({ 
        success: true, 
        app: newApp,
        credentials: {
          apiKey,
          apiSecret,
          note: 'Save these credentials! The secret will only be shown once.'
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.put('/api/ecosystem/apps/:id', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        baseUrl: z.string().url().optional(),
        permissions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      });
      
      const data = schema.parse(req.body);
      const updated = await storage.updateConnectedApp(req.params.id, data);
      res.json({ success: true, app: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/ecosystem/apps/:id', async (req: Request, res: Response) => {
    try {
      await storage.deleteConnectedApp(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.post('/api/ecosystem/apps/:id/regenerate-key', async (req: Request, res: Response) => {
    try {
      const newApiKey = generateApiKey();
      const updated = await storage.updateConnectedApp(req.params.id, { apiKey: newApiKey });
      res.json({ 
        success: true, 
        apiKey: newApiKey,
        note: 'Old API key is now invalid'
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // ========================
  // SYNC LOGS
  // ========================
  
  app.get('/api/ecosystem/logs', async (req: Request, res: Response) => {
    try {
      const appId = req.query.appId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getAppSyncLogs(appId, limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // SHARED CODE SNIPPETS MANAGEMENT
  // ========================
  
  app.get('/api/ecosystem/snippets', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const snippets = await storage.getSharedCodeSnippets(category);
      res.json(snippets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ecosystem/snippets/:id', async (req: Request, res: Response) => {
    try {
      const snippet = await storage.getSharedCodeSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }
      res.json(snippet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ecosystem/snippets', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        category: z.string(),
        language: z.string().optional(),
        code: z.string().min(1),
        isPublic: z.boolean().optional(),
        sharedWithApps: z.array(z.string()).optional(),
        version: z.string().optional(),
        createdBy: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const snippet = await storage.createSharedCodeSnippet(data);
      res.json({ success: true, snippet });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.put('/api/ecosystem/snippets/:id', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        language: z.string().optional(),
        code: z.string().min(1).optional(),
        isPublic: z.boolean().optional(),
        sharedWithApps: z.array(z.string()).optional(),
        version: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const updated = await storage.updateSharedCodeSnippet(req.params.id, data);
      res.json({ success: true, snippet: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/ecosystem/snippets/:id', async (req: Request, res: Response) => {
    try {
      await storage.deleteSharedCodeSnippet(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // ========================
  // EXTERNAL API ENDPOINTS (For connected apps)
  // ========================
  
  app.get('/api/ext/ping', validateApiKey, async (req: Request, res: Response) => {
    const connectedApp = (req as any).connectedApp;
    res.json({ 
      success: true, 
      message: 'Pong! Connection successful.',
      app: connectedApp.name,
      permissions: connectedApp.permissions
    });
  });

  app.get('/api/ext/code', validateApiKey, async (req: Request, res: Response) => {
    try {
      const connectedApp = (req as any).connectedApp;
      
      if (!hasPermission(connectedApp, 'read:code')) {
        return res.status(403).json({ error: 'Missing read:code permission' });
      }

      const category = req.query.category as string | undefined;
      const snippets = await storage.getSharedCodeSnippets(category);
      
      const accessibleSnippets = snippets.filter(s => 
        s.isPublic || 
        (s.sharedWithApps && s.sharedWithApps.includes(connectedApp.id))
      );

      await storage.createAppSyncLog({
        appId: connectedApp.id,
        action: 'read_code',
        direction: 'outbound',
        endpoint: '/api/ext/code',
        requestPayload: { category },
        responsePayload: { count: accessibleSnippets.length },
        status: 'success',
        durationMs: 0,
      });

      res.json({ 
        success: true, 
        snippets: accessibleSnippets,
        count: accessibleSnippets.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ext/code/:id', validateApiKey, async (req: Request, res: Response) => {
    try {
      const connectedApp = (req as any).connectedApp;
      
      if (!hasPermission(connectedApp, 'read:code')) {
        return res.status(403).json({ error: 'Missing read:code permission' });
      }

      const snippet = await storage.getSharedCodeSnippet(req.params.id);
      
      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      if (!snippet.isPublic && (!snippet.sharedWithApps || !snippet.sharedWithApps.includes(connectedApp.id))) {
        return res.status(403).json({ error: 'Access denied to this snippet' });
      }

      await storage.incrementSnippetUsageCount(req.params.id);

      await storage.createAppSyncLog({
        appId: connectedApp.id,
        action: 'fetch_code',
        direction: 'outbound',
        endpoint: `/api/ext/code/${req.params.id}`,
        requestPayload: { snippetId: req.params.id },
        responsePayload: { name: snippet.name, category: snippet.category },
        status: 'success',
        durationMs: 0,
      });

      res.json({ success: true, snippet });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ext/code', validateApiKey, async (req: Request, res: Response) => {
    try {
      const connectedApp = (req as any).connectedApp;
      
      if (!hasPermission(connectedApp, 'write:code')) {
        return res.status(403).json({ error: 'Missing write:code permission' });
      }

      const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        category: z.string(),
        language: z.string().optional(),
        code: z.string().min(1),
        version: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const snippet = await storage.createSharedCodeSnippet({
        ...data,
        createdBy: connectedApp.name,
        isPublic: false,
        sharedWithApps: [connectedApp.id],
      });

      await storage.createAppSyncLog({
        appId: connectedApp.id,
        action: 'push_code',
        direction: 'inbound',
        endpoint: '/api/ext/code',
        requestPayload: { name: data.name, category: data.category },
        responsePayload: { snippetId: snippet.id },
        status: 'success',
        durationMs: 0,
      });

      res.json({ success: true, snippet });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ext/clients', validateApiKey, async (req: Request, res: Response) => {
    try {
      const connectedApp = (req as any).connectedApp;
      
      if (!hasPermission(connectedApp, 'read:clients')) {
        return res.status(403).json({ error: 'Missing read:clients permission' });
      }

      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId parameter required' });
      }

      const clients = await storage.getClients(userId);

      await storage.createAppSyncLog({
        appId: connectedApp.id,
        action: 'read_clients',
        direction: 'outbound',
        endpoint: '/api/ext/clients',
        requestPayload: { userId },
        responsePayload: { count: clients.length },
        status: 'success',
        durationMs: 0,
      });

      res.json({ success: true, clients, count: clients.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ext/hallmarks', validateApiKey, async (req: Request, res: Response) => {
    try {
      const connectedApp = (req as any).connectedApp;
      
      if (!hasPermission(connectedApp, 'read:hallmarks')) {
        return res.status(403).json({ error: 'Missing read:hallmarks permission' });
      }

      const { getCompanyHallmarks } = await import('./hallmarkService');
      const hallmarks = await getCompanyHallmarks();

      await storage.createAppSyncLog({
        appId: connectedApp.id,
        action: 'read_hallmarks',
        direction: 'outbound',
        endpoint: '/api/ext/hallmarks',
        requestPayload: {},
        responsePayload: { count: hallmarks.length },
        status: 'success',
        durationMs: 0,
      });

      res.json({ success: true, hallmarks, count: hallmarks.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ecosystem/permissions', async (req: Request, res: Response) => {
    res.json({ 
      permissions: APP_PERMISSIONS,
      categories: CODE_CATEGORIES
    });
  });
}
