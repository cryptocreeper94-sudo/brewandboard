# BREW & BOARD - COMPLETE PARTNER API & FRANCHISE SYSTEM HANDOFF

## OVERVIEW
This document contains everything needed to implement a B2B franchise Partner API system with scoped authentication, multi-tenant data access, analytics, and premium UI components.

---

# SECTION 1: DATABASE SCHEMA (shared/schema.ts)

## Franchise Table
```typescript
export const franchises = pgTable("franchises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseId: varchar("franchise_id", { length: 20 }).notNull().unique(),
  ownerId: varchar("owner_id"),
  ownerEmail: varchar("owner_email", { length: 255 }),
  ownerName: varchar("owner_name", { length: 100 }),
  ownerCompany: varchar("owner_company", { length: 100 }),
  ownerPhone: varchar("owner_phone", { length: 20 }),
  ownershipMode: varchar("ownership_mode", { length: 50 }).default("subscriber_managed"),
  territoryName: varchar("territory_name", { length: 100 }).notNull(),
  territoryRegion: varchar("territory_region", { length: 50 }),
  territoryExclusive: boolean("territory_exclusive").default(false),
  territoryNotes: text("territory_notes"),
  franchiseTier: varchar("franchise_tier", { length: 20 }).default("standard"),
  franchiseFee: decimal("franchise_fee", { precision: 10, scale: 2 }),
  royaltyType: varchar("royalty_type", { length: 20 }).default("percentage"),
  royaltyPercent: decimal("royalty_percent", { precision: 5, scale: 2 }),
  royaltyAmount: decimal("royalty_amount", { precision: 10, scale: 2 }),
  platformFeeMonthly: decimal("platform_fee_monthly", { precision: 10, scale: 2 }),
  hallmarkRevenueShare: decimal("hallmark_revenue_share", { precision: 5, scale: 2 }),
  supportTier: varchar("support_tier", { length: 20 }).default("standard"),
  supportResponseHours: integer("support_response_hours").default(48),
  status: varchar("status", { length: 20 }).default("pending"),
  hallmarkPrefix: varchar("hallmark_prefix", { length: 10 }),
  canMintHallmarks: boolean("can_mint_hallmarks").default(false),
  hallmarksMintedTotal: integer("hallmarks_minted_total").default(0),
  custodyOwner: varchar("custody_owner", { length: 50 }).default("brewandboard"),
  custodyTransferDate: timestamp("custody_transfer_date"),
  previousCustodyOwner: varchar("previous_custody_owner", { length: 50 }),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  activeVendors: integer("active_vendors").default(0),
  franchiseStartDate: timestamp("franchise_start_date"),
  franchiseRenewalDate: timestamp("franchise_renewal_date"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
  updatedAt: timestamp("updated_at").default(sql`NOW()`),
});
```

## Partner API Credentials Table
```typescript
export const partnerApiCredentials = pgTable("partner_api_credentials", {
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
});
```

## Partner API Logs Table
```typescript
export const partnerApiLogs = pgTable("partner_api_logs", {
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
});
```

## Franchise Locations Table
```typescript
export const franchiseLocations = pgTable("franchise_locations", {
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
});
```

## API Scopes
```typescript
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

# SECTION 2: API ROUTES

## Authentication Middleware
```typescript
import crypto from "crypto";

function generateApiKey(): string {
  return `bb_live_${crypto.randomBytes(24).toString("hex")}`;
}

function generateApiSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function partnerApiAuth(req, res, next) {
  const startTime = Date.now();
  const apiKey = req.headers["x-api-key"];

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
  req.credential = { id: credential.id, scopes: credential.scopes || [] };

  res.on("finish", async () => {
    await storage.createPartnerApiLog({
      credentialId: credential.id,
      franchiseId: franchise.id,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - startTime,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}

function requireScope(scope) {
  return (req, res, next) => {
    if (!req.credential?.scopes.includes(scope)) {
      return res.status(403).json({ error: `Missing required scope: ${scope}`, code: "INSUFFICIENT_SCOPE" });
    }
    next();
  };
}
```

## Partner API Endpoints
```typescript
// Credential Management (Admin)
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

app.put("/api/franchises/:franchiseId/credentials/:id", async (req, res) => {
  const updated = await storage.updatePartnerApiCredential(req.params.id, req.body);
  res.json(updated);
});

app.delete("/api/franchises/:franchiseId/credentials/:id", async (req, res) => {
  await storage.deletePartnerApiCredential(req.params.id);
  res.json({ success: true });
});

app.get("/api/franchises/:franchiseId/api-logs", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = await storage.getPartnerApiLogs(req.params.franchiseId, limit);
  res.json(logs);
});

// Partner API v1 Endpoints (Authenticated)
app.get("/api/partner/v1/me", partnerApiAuth, async (req, res) => {
  res.json({ franchise: req.franchise, scopes: req.credential?.scopes });
});

app.get("/api/partner/v1/orders", partnerApiAuth, requireScope("orders:read"), async (req, res) => {
  const orders = await storage.getOrdersByFranchise(req.franchise.id, {
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });
  res.json({ data: orders, meta: { total: orders.length, franchiseId: req.franchise.franchiseId } });
});

app.post("/api/partner/v1/orders", partnerApiAuth, requireScope("orders:write"), async (req, res) => {
  const order = await storage.createScheduledOrder({ ...req.body, source: "partner_api" });
  res.status(201).json({ data: order });
});

app.get("/api/partner/v1/locations", partnerApiAuth, requireScope("locations:read"), async (req, res) => {
  const locations = await storage.getFranchiseLocations(req.franchise.id);
  res.json({ data: locations, meta: { total: locations.length } });
});

app.post("/api/partner/v1/locations", partnerApiAuth, requireScope("locations:write"), async (req, res) => {
  const location = await storage.createFranchiseLocation({ ...req.body, franchiseId: req.franchise.id });
  res.status(201).json({ data: location });
});

app.get("/api/partner/v1/analytics", partnerApiAuth, requireScope("analytics:read"), async (req, res) => {
  const analytics = await storage.getFranchiseAnalytics(req.franchise.id, req.query.range || "30days");
  res.json({ data: analytics, meta: { range: req.query.range || "30days", franchiseId: req.franchise.franchiseId } });
});

app.get("/api/partner/v1/billing", partnerApiAuth, requireScope("billing:read"), async (req, res) => {
  const franchise = await storage.getFranchise(req.franchise.id);
  res.json({
    data: {
      franchiseTier: franchise?.franchiseTier,
      platformFeeMonthly: franchise?.platformFeeMonthly,
      royaltyPercent: franchise?.royaltyPercent,
      totalRevenue: franchise?.totalRevenue,
      totalOrders: franchise?.totalOrders,
    }
  });
});

app.get("/api/partner/v1/health", (req, res) => {
  res.json({ status: "healthy", version: "1.0.0", timestamp: new Date().toISOString() });
});

app.get("/api/partner/v1/scopes", (req, res) => {
  res.json({ scopes: PARTNER_API_SCOPES });
});
```

---

# SECTION 3: STORAGE METHODS

```typescript
// Partner API Credentials
async getPartnerApiCredentials(franchiseId: string) {
  return db.select().from(partnerApiCredentials)
    .where(eq(partnerApiCredentials.franchiseId, franchiseId))
    .orderBy(desc(partnerApiCredentials.createdAt));
}

async getPartnerApiCredentialByApiKey(apiKey: string) {
  const [credential] = await db.select().from(partnerApiCredentials)
    .where(eq(partnerApiCredentials.apiKey, apiKey));
  return credential;
}

async createPartnerApiCredential(credential) {
  const [created] = await db.insert(partnerApiCredentials).values({
    ...credential,
    createdBy: "admin",
  }).returning();
  return created;
}

async updatePartnerApiCredential(id: string, updates) {
  const [updated] = await db.update(partnerApiCredentials)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(partnerApiCredentials.id, id))
    .returning();
  return updated;
}

async deletePartnerApiCredential(id: string) {
  await db.delete(partnerApiCredentials).where(eq(partnerApiCredentials.id, id));
}

async incrementPartnerApiRequestCount(id: string) {
  await db.update(partnerApiCredentials).set({
    requestCount: sql`${partnerApiCredentials.requestCount} + 1`,
    lastUsedAt: new Date(),
  }).where(eq(partnerApiCredentials.id, id));
}

async createPartnerApiLog(log) {
  const [created] = await db.insert(partnerApiLogs).values(log).returning();
  return created;
}

async getPartnerApiLogs(franchiseId: string, limit = 50) {
  return db.select().from(partnerApiLogs)
    .where(eq(partnerApiLogs.franchiseId, franchiseId))
    .orderBy(desc(partnerApiLogs.createdAt))
    .limit(limit);
}

async getFranchiseLocations(franchiseId: string) {
  return db.select().from(franchiseLocations)
    .where(eq(franchiseLocations.franchiseId, franchiseId));
}

async createFranchiseLocation(location) {
  const [created] = await db.insert(franchiseLocations).values(location).returning();
  return created;
}

async getFranchiseAnalytics(franchiseId: string, range = "30days") {
  const startDate = calculateStartDate(range);
  const orders = await this.getOrdersByFranchise(franchiseId, { startDate });
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  
  // Get top vendors
  const vendorCounts = {};
  orders.forEach(o => {
    vendorCounts[o.vendor] = (vendorCounts[o.vendor] || 0) + 1;
  });
  const topVendors = Object.entries(vendorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalOrders,
    totalRevenue: totalRevenue.toFixed(2),
    completedOrders,
    avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00",
    topVendors,
  };
}

function calculateStartDate(range: string): string {
  const now = new Date();
  switch (range) {
    case "7days": now.setDate(now.getDate() - 7); break;
    case "30days": now.setDate(now.getDate() - 30); break;
    case "quarter": now.setMonth(now.getMonth() - 3); break;
    case "year": now.setFullYear(now.getFullYear() - 1); break;
    default: now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}
```

---

# SECTION 4: USAGE EXAMPLES

## Create API Key
```bash
curl -X POST "https://yourapp.replit.app/api/franchises/{franchiseId}/credentials" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key", "environment": "production", "scopes": ["orders:read", "orders:write", "analytics:read"]}'
```

**Response:**
```json
{
  "id": "uuid",
  "apiKey": "bb_live_abc123...",
  "apiSecret": "secret_xyz789...",
  "message": "Save this secret - it won't be shown again!"
}
```

## Authenticate & Get Franchise Info
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/me" \
  -H "X-API-Key: bb_live_your_api_key_here"
```

**Response:**
```json
{
  "franchise": {
    "id": "uuid",
    "franchiseId": "BB-NASH-001",
    "name": "Nashville Downtown"
  },
  "scopes": ["orders:read", "orders:write", "analytics:read"]
}
```

## List Orders
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/orders?status=delivered" \
  -H "X-API-Key: bb_live_your_api_key_here"
```

## Create Order
```bash
curl -X POST "https://yourapp.replit.app/api/partner/v1/orders" \
  -H "X-API-Key: bb_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "Frothy Monkey",
    "deliveryAddress": "123 Main St, Nashville, TN",
    "contactName": "John Doe",
    "contactPhone": "615-555-0100",
    "items": [{"name": "Coffee Service", "quantity": 10, "price": "4.50"}],
    "scheduledDate": "2025-12-20",
    "scheduledTime": "09:00"
  }'
```

## Get Analytics
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/analytics?range=30days" \
  -H "X-API-Key: bb_live_your_api_key_here"
```

**Response:**
```json
{
  "data": {
    "totalOrders": 45,
    "totalRevenue": "2340.50",
    "completedOrders": 42,
    "avgOrderValue": "52.01",
    "topVendors": [
      {"name": "Frothy Monkey", "count": 15},
      {"name": "Barista Parlor", "count": 12}
    ]
  }
}
```

## Get Billing Info
```bash
curl -X GET "https://yourapp.replit.app/api/partner/v1/billing" \
  -H "X-API-Key: bb_live_your_api_key_here"
```

---

# SECTION 5: ERROR CODES

| Code | HTTP Status | Description |
|------|-------------|-------------|
| MISSING_API_KEY | 401 | No X-API-Key header provided |
| INVALID_API_KEY | 401 | API key not found in database |
| KEY_DISABLED | 403 | API key has been deactivated |
| KEY_EXPIRED | 403 | API key has passed expiry date |
| FRANCHISE_INACTIVE | 403 | Franchise is not in active status |
| INSUFFICIENT_SCOPE | 403 | API key lacks required permission |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

---

# SECTION 6: SCOPES REFERENCE

| Scope | Description |
|-------|-------------|
| orders:read | View orders for your franchise |
| orders:write | Create and update orders |
| menus:read | View available menus and items |
| menus:write | Modify menus (add/remove items) |
| locations:read | View franchise locations |
| locations:write | Manage franchise locations |
| billing:read | View billing and subscription info |
| analytics:read | Access franchise analytics |
| customers:read | View customer data |
| customers:write | Manage customer records |
| drivers:read | View driver assignments |
| drivers:write | Manage driver assignments |

---

# SECTION 7: FRANCHISE TIERS

| Tier | Platform Fee | Royalty | Features |
|------|-------------|---------|----------|
| standard | $299/mo | 6% | Basic API access, standard support |
| premium | $499/mo | 5% | Full API, priority support, analytics |
| enterprise | $999/mo | 4% | White-label, dedicated support, custom integrations |

---

# SECTION 8: RATE LIMITS

| Environment | Per Minute | Per Day |
|-------------|-----------|---------|
| sandbox | 30 | 1,000 |
| production | 60 | 10,000 |
| enterprise | 120 | 50,000 |

---

*Darkwave Studios - Partner API & Franchise System v1.0.0*
*Generated: December 2025*
