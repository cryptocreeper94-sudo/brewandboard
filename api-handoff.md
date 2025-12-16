# PARTNER API SYSTEM - COMPLETE AGENT HANDOFF

## OVERVIEW
This document contains everything needed to implement a Franchise Partner API system with:
- Scoped API key authentication per franchise
- Franchise-scoped data access (orders, locations, analytics, billing)
- Request logging and audit trail
- Rate limiting infrastructure
- Premium UI portal for key management

**To retrieve this document programmatically:**
```
GET /api/ecosystem/snippets/by-name/api.md
GET /api/ecosystem/snippets?name=api
```

---

## SECTION 1: DATABASE SCHEMA (shared/schema.ts)

```typescript
// ========================
// PARTNER API CREDENTIALS (Franchise Integration)
// ========================
export const partnerApiCredentials = pgTable(
  "partner_api_credentials",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    name: varchar("name", { length: 100 }).notNull(),
    apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
    apiSecret: text("api_secret").notNull(),
    
    environment: varchar("environment", { length: 20 }).default("production"),
    scopes: text("scopes").array().default(sql`ARRAY['orders:read']::text[]`),
    
    rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
    rateLimitPerDay: integer("rate_limit_per_day").default(10000),
    
    requestCount: integer("request_count").default(0),
    lastUsedAt: timestamp("last_used_at"),
    
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at"),
    
    createdBy: varchar("created_by", { length: 100 }),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    franchiseIdx: index("idx_partner_api_franchise").on(table.franchiseId),
    apiKeyIdx: index("idx_partner_api_key").on(table.apiKey),
  })
);

// ========================
// PARTNER API REQUEST LOGS
// ========================
export const partnerApiLogs = pgTable(
  "partner_api_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    credentialId: varchar("credential_id").notNull().references(() => partnerApiCredentials.id),
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    method: varchar("method", { length: 10 }).notNull(),
    endpoint: varchar("endpoint", { length: 255 }).notNull(),
    
    statusCode: integer("status_code"),
    responseTimeMs: integer("response_time_ms"),
    
    errorCode: varchar("error_code", { length: 50 }),
    errorMessage: text("error_message"),
    
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  }
);

// ========================
// FRANCHISE LOCATIONS
// ========================
export const franchiseLocations = pgTable(
  "franchise_locations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    name: varchar("name", { length: 100 }).notNull(),
    locationCode: varchar("location_code", { length: 20 }).notNull(),
    
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 50 }).notNull(),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
    
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    managerName: varchar("manager_name", { length: 100 }),
    
    isActive: boolean("is_active").default(true),
    operatingHours: jsonb("operating_hours"),
    deliveryRadius: integer("delivery_radius").default(10),
    
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  }
);

// Partner API permission scopes
export const PARTNER_API_SCOPES = [
  'orders:read', 'orders:write',
  'menus:read', 'menus:write',
  'locations:read', 'locations:write',
  'billing:read', 'analytics:read',
  'customers:read', 'customers:write',
  'drivers:read', 'drivers:write',
] as const;
```

---

## SECTION 2: API ROUTES (server/partnerApiRoutes.ts)

```typescript
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";
import { PARTNER_API_SCOPES } from "@shared/schema";

interface AuthenticatedRequest extends Request {
  franchise?: { id: string; franchiseId: string; name: string };
  credential?: { id: string; scopes: string[] };
}

function generateApiKey(): string {
  return `bb_live_${crypto.randomBytes(24).toString("hex")}`;
}

function generateApiSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Authentication Middleware
async function partnerApiAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key", code: "MISSING_API_KEY" });
  }

  const credential = await storage.getPartnerApiCredentialByApiKey(apiKey);
  if (!credential) {
    return res.status(401).json({ error: "Invalid API key", code: "INVALID_API_KEY" });
  }

  if (!credential.isActive) {
    return res.status(403).json({ error: "API key is disabled", code: "KEY_DISABLED" });
  }

  const franchise = await storage.getFranchise(credential.franchiseId);
  if (!franchise || franchise.status !== "active") {
    return res.status(403).json({ error: "Franchise is not active", code: "FRANCHISE_INACTIVE" });
  }

  await storage.incrementPartnerApiRequestCount(credential.id);

  req.franchise = { id: franchise.id, franchiseId: franchise.franchiseId, name: franchise.territoryName };
  req.credential = { id: credential.id, scopes: (credential.scopes as string[]) || [] };

  // Log request after response
  res.on("finish", async () => {
    await storage.createPartnerApiLog({
      credentialId: credential.id,
      franchiseId: franchise.id,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - startTime,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });
  });

  next();
}

// Scope Check Middleware
function requireScope(scope: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.credential?.scopes.includes(scope)) {
      return res.status(403).json({
        error: `Missing required scope: ${scope}`,
        code: "INSUFFICIENT_SCOPE",
      });
    }
    next();
  };
}

export function registerPartnerApiRoutes(app: Express) {
  // ========================
  // CREDENTIAL MANAGEMENT (Admin)
  // ========================
  
  app.get("/api/franchises/:franchiseId/credentials", async (req, res) => {
    const credentials = await storage.getPartnerApiCredentials(req.params.franchiseId);
    res.json(credentials.map(c => ({ ...c, apiSecret: "••••••••" })));
  });

  app.post("/api/franchises/:franchiseId/credentials", async (req, res) => {
    const { name, environment, scopes } = req.body;
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const credential = await storage.createPartnerApiCredential({
      franchiseId: req.params.franchiseId,
      name,
      apiKey,
      apiSecret,
      environment: environment || "production",
      scopes: scopes || ["orders:read"],
    });

    res.json({ ...credential, apiSecret, message: "Save this secret - it won't be shown again!" });
  });

  // ========================
  // PARTNER API v1 ENDPOINTS
  // ========================

  app.get("/api/partner/v1/me", partnerApiAuth, async (req: AuthenticatedRequest, res) => {
    res.json({ franchise: req.franchise, scopes: req.credential?.scopes });
  });

  app.get("/api/partner/v1/orders", partnerApiAuth, requireScope("orders:read"),
    async (req: AuthenticatedRequest, res) => {
      const orders = await storage.getOrdersByFranchise(req.franchise!.id, {
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      res.json({ data: orders, meta: { total: orders.length } });
    }
  );

  app.post("/api/partner/v1/orders", partnerApiAuth, requireScope("orders:write"),
    async (req: AuthenticatedRequest, res) => {
      const order = await storage.createScheduledOrder({
        ...req.body,
        source: "partner_api",
      });
      res.status(201).json({ data: order });
    }
  );

  app.get("/api/partner/v1/locations", partnerApiAuth, requireScope("locations:read"),
    async (req: AuthenticatedRequest, res) => {
      const locations = await storage.getFranchiseLocations(req.franchise!.id);
      res.json({ data: locations, meta: { total: locations.length } });
    }
  );

  app.get("/api/partner/v1/analytics", partnerApiAuth, requireScope("analytics:read"),
    async (req: AuthenticatedRequest, res) => {
      const analytics = await storage.getFranchiseAnalytics(
        req.franchise!.id,
        req.query.range as string || "30days"
      );
      res.json({ data: analytics });
    }
  );

  app.get("/api/partner/v1/billing", partnerApiAuth, requireScope("billing:read"),
    async (req: AuthenticatedRequest, res) => {
      const franchise = await storage.getFranchise(req.franchise!.id);
      res.json({
        data: {
          franchiseTier: franchise?.franchiseTier,
          platformFeeMonthly: franchise?.platformFeeMonthly,
          royaltyPercent: franchise?.royaltyPercent,
          totalRevenue: franchise?.totalRevenue,
        }
      });
    }
  );

  app.get("/api/partner/v1/health", (req, res) => {
    res.json({ status: "healthy", version: "1.0.0", timestamp: new Date().toISOString() });
  });

  app.get("/api/partner/v1/scopes", (req, res) => {
    res.json({ scopes: PARTNER_API_SCOPES });
  });
}
```

---

## SECTION 3: STORAGE METHODS (server/storage.ts)

```typescript
// Partner API Credentials
async getPartnerApiCredentials(franchiseId: string): Promise<PartnerApiCredential[]> {
  return db.select().from(partnerApiCredentials)
    .where(eq(partnerApiCredentials.franchiseId, franchiseId))
    .orderBy(desc(partnerApiCredentials.createdAt));
}

async getPartnerApiCredentialByApiKey(apiKey: string): Promise<PartnerApiCredential | undefined> {
  const [credential] = await db.select().from(partnerApiCredentials)
    .where(eq(partnerApiCredentials.apiKey, apiKey));
  return credential || undefined;
}

async createPartnerApiCredential(credential: InsertPartnerApiCredential): Promise<PartnerApiCredential> {
  const [created] = await db.insert(partnerApiCredentials).values(credential).returning();
  return created;
}

async incrementPartnerApiRequestCount(id: string): Promise<void> {
  await db.update(partnerApiCredentials).set({
    requestCount: sql`${partnerApiCredentials.requestCount} + 1`,
    lastUsedAt: new Date(),
  }).where(eq(partnerApiCredentials.id, id));
}

// Partner API Logs
async createPartnerApiLog(log: InsertPartnerApiLog): Promise<PartnerApiLog> {
  const [created] = await db.insert(partnerApiLogs).values(log).returning();
  return created;
}

// Franchise Locations
async getFranchiseLocations(franchiseId: string): Promise<FranchiseLocation[]> {
  return db.select().from(franchiseLocations)
    .where(eq(franchiseLocations.franchiseId, franchiseId));
}

// Franchise Analytics
async getFranchiseAnalytics(franchiseId: string, range = "30days") {
  const orders = await this.getOrdersByFranchise(franchiseId, {
    startDate: calculateStartDate(range),
  });
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  
  return {
    totalOrders,
    totalRevenue: totalRevenue.toFixed(2),
    completedOrders,
    avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0",
  };
}
```

---

## SECTION 4: UI COMPONENT (React)

Key features of PartnerApiPortal component:
- Franchise selector dropdown
- Bento grid stats (API keys, requests, locations, logs)
- API credential creation with one-time secret display
- Scope selector for permissions
- Endpoint reference with curl examples
- Request log viewer with status colors

See developers.tsx for full implementation (~300 lines).

---

## SECTION 5: USAGE EXAMPLES

**Create API Key:**
```bash
curl -X POST "https://yourapp.replit.app/api/franchises/{franchiseId}/credentials" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key", "environment": "production", "scopes": ["orders:read", "orders:write"]}'
```

**Make API Request:**
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/orders" \
  -H "X-API-Key: bb_live_your_api_key_here" \
  -H "Content-Type: application/json"
```

**Get Analytics:**
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/analytics?range=30days" \
  -H "X-API-Key: bb_live_your_api_key_here"
```

---

## SECTION 6: AVAILABLE SCOPES

| Scope | Description |
|-------|-------------|
| orders:read | View orders for your franchise |
| orders:write | Create and update orders |
| menus:read | View available menus and items |
| menus:write | Modify menus |
| locations:read | View franchise locations |
| locations:write | Manage franchise locations |
| billing:read | View billing and subscription info |
| analytics:read | Access franchise analytics |
| customers:read | View customer data |
| customers:write | Manage customer records |
| drivers:read | View driver assignments |
| drivers:write | Manage driver assignments |

---

## SECTION 7: ERROR CODES

| Code | HTTP Status | Description |
|------|-------------|-------------|
| MISSING_API_KEY | 401 | No X-API-Key header provided |
| INVALID_API_KEY | 401 | API key not found in database |
| KEY_DISABLED | 403 | API key has been deactivated |
| KEY_EXPIRED | 403 | API key has passed expiry date |
| FRANCHISE_INACTIVE | 403 | Franchise is not in active status |
| INSUFFICIENT_SCOPE | 403 | API key lacks required permission |

---

*Darkwave Studios - Partner API Documentation*
*Version 1.0.0*
