import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";
import { PARTNER_API_SCOPES } from "@shared/schema";

interface AuthenticatedRequest extends Request {
  franchise?: {
    id: string;
    franchiseId: string;
    name: string;
  };
  credential?: {
    id: string;
    scopes: string[];
  };
}

function generateApiKey(): string {
  return `bb_live_${crypto.randomBytes(24).toString("hex")}`;
}

function generateApiSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function partnerApiAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key", code: "MISSING_API_KEY" });
  }

  try {
    const credential = await storage.getPartnerApiCredentialByApiKey(apiKey);

    if (!credential) {
      return res.status(401).json({ error: "Invalid API key", code: "INVALID_API_KEY" });
    }

    if (!credential.isActive) {
      return res.status(403).json({ error: "API key is disabled", code: "KEY_DISABLED" });
    }

    if (credential.expiresAt && new Date(credential.expiresAt) < new Date()) {
      return res.status(403).json({ error: "API key has expired", code: "KEY_EXPIRED" });
    }

    const franchise = await storage.getFranchise(credential.franchiseId);
    if (!franchise || franchise.status !== "active") {
      return res.status(403).json({ error: "Franchise is not active", code: "FRANCHISE_INACTIVE" });
    }

    await storage.incrementPartnerApiRequestCount(credential.id);

    req.franchise = {
      id: franchise.id,
      franchiseId: franchise.franchiseId,
      name: franchise.territoryName,
    };
    req.credential = {
      id: credential.id,
      scopes: (credential.scopes as string[]) || [],
    };

    res.on("finish", async () => {
      await storage.createPartnerApiLog({
        credentialId: credential.id,
        franchiseId: franchise.id,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: Date.now() - startTime,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
      });
    });

    next();
  } catch (error: any) {
    return res.status(500).json({ error: "Authentication failed", code: "AUTH_ERROR" });
  }
}

function requireScope(scope: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.credential?.scopes.includes(scope)) {
      return res.status(403).json({
        error: `Missing required scope: ${scope}`,
        code: "INSUFFICIENT_SCOPE",
        required: scope,
        granted: req.credential?.scopes || [],
      });
    }
    next();
  };
}

export function registerPartnerApiRoutes(app: Express) {
  // ========================
  // CREDENTIAL MANAGEMENT (Admin endpoints - not authenticated via API key)
  // ========================
  
  app.get("/api/franchises/:franchiseId/credentials", async (req, res) => {
    try {
      const credentials = await storage.getPartnerApiCredentials(req.params.franchiseId);
      const sanitized = credentials.map(c => ({
        ...c,
        apiSecret: "••••••••", // Never expose secrets
      }));
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/franchises/:franchiseId/credentials", async (req, res) => {
    try {
      const { name, environment, scopes } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const validScopes = (scopes || ["orders:read"]).filter((s: string) => 
        PARTNER_API_SCOPES.includes(s as any)
      );

      const apiKey = generateApiKey();
      const apiSecret = generateApiSecret();

      const credential = await storage.createPartnerApiCredential({
        franchiseId: req.params.franchiseId,
        name,
        apiKey,
        apiSecret,
        environment: environment || "production",
        scopes: validScopes,
        createdBy: req.body.createdBy || "admin",
      });

      res.json({
        ...credential,
        apiSecret, // Show secret ONLY on creation
        message: "Save this API secret now - it will not be shown again!",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/franchises/:franchiseId/credentials/:credentialId", async (req, res) => {
    try {
      const { name, scopes, isActive } = req.body;
      
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (scopes !== undefined) {
        updates.scopes = scopes.filter((s: string) => PARTNER_API_SCOPES.includes(s as any));
      }
      if (isActive !== undefined) updates.isActive = isActive;

      const credential = await storage.updatePartnerApiCredential(req.params.credentialId, updates);
      res.json({ ...credential, apiSecret: "••••••••" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/franchises/:franchiseId/credentials/:credentialId", async (req, res) => {
    try {
      await storage.deletePartnerApiCredential(req.params.credentialId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/franchises/:franchiseId/api-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getPartnerApiLogs(req.params.franchiseId, limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // FRANCHISE LOCATIONS (Admin endpoints)
  // ========================

  app.get("/api/franchises/:franchiseId/locations", async (req, res) => {
    try {
      const locations = await storage.getFranchiseLocations(req.params.franchiseId);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/franchises/:franchiseId/locations", async (req, res) => {
    try {
      const location = await storage.createFranchiseLocation({
        franchiseId: req.params.franchiseId,
        ...req.body,
      });
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/franchises/:franchiseId/locations/:locationId", async (req, res) => {
    try {
      const location = await storage.updateFranchiseLocation(req.params.locationId, req.body);
      res.json(location);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/franchises/:franchiseId/locations/:locationId", async (req, res) => {
    try {
      await storage.deleteFranchiseLocation(req.params.locationId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // PARTNER API v1 ENDPOINTS (Authenticated via API key)
  // ========================

  app.get("/api/partner/v1/me", partnerApiAuth, async (req: AuthenticatedRequest, res) => {
    res.json({
      franchise: req.franchise,
      scopes: req.credential?.scopes,
      rateLimit: {
        remaining: "unlimited", // TODO: implement rate limiting
      },
    });
  });

  // Orders
  app.get(
    "/api/partner/v1/orders",
    partnerApiAuth,
    requireScope("orders:read"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { status, startDate, endDate } = req.query;
        const orders = await storage.getOrdersByFranchise(req.franchise!.id, {
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
        });
        res.json({
          data: orders,
          meta: {
            total: orders.length,
            franchiseId: req.franchise!.franchiseId,
          },
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "ORDERS_FETCH_ERROR" });
      }
    }
  );

  app.get(
    "/api/partner/v1/orders/:orderId",
    partnerApiAuth,
    requireScope("orders:read"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const order = await storage.getScheduledOrder(req.params.orderId);
        if (!order) {
          return res.status(404).json({ error: "Order not found", code: "ORDER_NOT_FOUND" });
        }
        res.json({ data: order });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "ORDER_FETCH_ERROR" });
      }
    }
  );

  app.post(
    "/api/partner/v1/orders",
    partnerApiAuth,
    requireScope("orders:write"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const order = await storage.createScheduledOrder({
          ...req.body,
          source: "partner_api",
          franchiseId: req.franchise!.id,
        });
        res.status(201).json({ data: order });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "ORDER_CREATE_ERROR" });
      }
    }
  );

  app.put(
    "/api/partner/v1/orders/:orderId",
    partnerApiAuth,
    requireScope("orders:write"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const order = await storage.updateScheduledOrder(req.params.orderId, req.body);
        res.json({ data: order });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "ORDER_UPDATE_ERROR" });
      }
    }
  );

  // Locations (via API key)
  app.get(
    "/api/partner/v1/locations",
    partnerApiAuth,
    requireScope("locations:read"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const locations = await storage.getFranchiseLocations(req.franchise!.id);
        res.json({
          data: locations,
          meta: { total: locations.length },
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "LOCATIONS_FETCH_ERROR" });
      }
    }
  );

  app.post(
    "/api/partner/v1/locations",
    partnerApiAuth,
    requireScope("locations:write"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const location = await storage.createFranchiseLocation({
          ...req.body,
          franchiseId: req.franchise!.id,
        });
        res.status(201).json({ data: location });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "LOCATION_CREATE_ERROR" });
      }
    }
  );

  // Analytics
  app.get(
    "/api/partner/v1/analytics",
    partnerApiAuth,
    requireScope("analytics:read"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const range = (req.query.range as string) || "30days";
        const analytics = await storage.getFranchiseAnalytics(req.franchise!.id, range);
        res.json({
          data: analytics,
          meta: {
            range,
            franchiseId: req.franchise!.franchiseId,
          },
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "ANALYTICS_FETCH_ERROR" });
      }
    }
  );

  // Billing (read-only for now)
  app.get(
    "/api/partner/v1/billing",
    partnerApiAuth,
    requireScope("billing:read"),
    async (req: AuthenticatedRequest, res) => {
      try {
        const franchise = await storage.getFranchise(req.franchise!.id);
        if (!franchise) {
          return res.status(404).json({ error: "Franchise not found" });
        }
        res.json({
          data: {
            franchiseTier: franchise.franchiseTier,
            platformFeeMonthly: franchise.platformFeeMonthly,
            royaltyType: franchise.royaltyType,
            royaltyPercent: franchise.royaltyPercent,
            franchiseFee: franchise.franchiseFee,
            totalRevenue: franchise.totalRevenue,
            totalOrders: franchise.totalOrders,
          },
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message, code: "BILLING_FETCH_ERROR" });
      }
    }
  );

  // API Health Check
  app.get("/api/partner/v1/health", (req, res) => {
    res.json({
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Available scopes reference
  app.get("/api/partner/v1/scopes", (req, res) => {
    res.json({
      scopes: PARTNER_API_SCOPES,
      descriptions: {
        "orders:read": "View orders for your franchise",
        "orders:write": "Create and update orders",
        "menus:read": "View available menus and items",
        "menus:write": "Modify menus (coming soon)",
        "locations:read": "View your franchise locations",
        "locations:write": "Manage franchise locations",
        "billing:read": "View billing and subscription info",
        "analytics:read": "Access franchise analytics and reports",
        "customers:read": "View customer data",
        "customers:write": "Manage customer records",
        "drivers:read": "View driver assignments",
        "drivers:write": "Manage driver assignments",
      },
    });
  });
}
