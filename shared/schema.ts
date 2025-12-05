import { pgTable, varchar, text, integer, decimal, boolean, timestamp, date, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================
// USERS (Business Account Holders)
// ========================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  pin: text("pin").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ========================
// CRM NOTES (Portfolio Entries)
// ========================
export const crmNotes = pgTable(
  "crm_notes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    title: varchar("title", { length: 255 }).notNull(),
    templateType: varchar("template_type", { length: 50 }).notNull(), // general, painter, construction, etc.
    
    // Structured data from templates
    structuredData: jsonb("structured_data").$type<Record<string, string>>(),
    
    // Freeform notes
    freeformNotes: text("freeform_notes"),
    
    // Metadata
    isPinned: boolean("is_pinned").default(false),
    color: varchar("color", { length: 20 }).default("default"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_crm_notes_user").on(table.userId),
    templateIdx: index("idx_crm_notes_template").on(table.templateType),
  })
);

export const insertCrmNoteSchema = createInsertSchema(crmNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCrmNote = z.infer<typeof insertCrmNoteSchema>;
export type CrmNote = typeof crmNotes.$inferSelect;

// ========================
// CLIENTS (CRM Contacts)
// ========================
export const clients = pgTable(
  "clients",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    name: varchar("name", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    industry: varchar("industry", { length: 100 }),

    addressLine1: varchar("address_line1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),

    status: varchar("status", { length: 50 }).default("active"), // active, inactive
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_clients_user_id").on(table.userId),
    nameIdx: index("idx_clients_name").on(table.name),
  })
);

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// ========================
// CRM ACTIVITIES (Timeline Events)
// ========================
export const crmActivities = pgTable(
  "crm_activities",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    entityType: varchar("entity_type", { length: 50 }).notNull(), // 'client', 'note'
    entityId: varchar("entity_id").notNull(),
    
    activityType: varchar("activity_type", { length: 50 }).notNull(),
    // Types: 'email', 'call', 'meeting', 'note', 'task'
    subject: varchar("subject", { length: 255 }),
    description: text("description"),
    
    // Meeting-specific fields
    meetingStartTime: timestamp("meeting_start_time"),
    meetingEndTime: timestamp("meeting_end_time"),
    meetingLocation: varchar("meeting_location", { length: 255 }),
    
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_crm_activities_user").on(table.userId),
    entityIdx: index("idx_crm_activities_entity").on(table.entityType, table.entityId),
  })
);

export const insertCrmActivitySchema = createInsertSchema(crmActivities).omit({
  id: true,
  createdAt: true,
});
export type InsertCrmActivity = z.infer<typeof insertCrmActivitySchema>;
export type CrmActivity = typeof crmActivities.$inferSelect;

// ========================
// CRM MEETINGS
// ========================
export const crmMeetings = pgTable(
  "crm_meetings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    
    locationType: varchar("location_type", { length: 20 }).default("virtual"), // 'virtual', 'in_person'
    location: varchar("location", { length: 500 }),
    
    // Associated portfolio note
    noteId: varchar("note_id").references(() => crmNotes.id),
    
    status: varchar("status", { length: 20 }).default("scheduled"), // 'scheduled', 'completed', 'cancelled'
    
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_crm_meetings_user").on(table.userId),
    startTimeIdx: index("idx_crm_meetings_start").on(table.startTime),
  })
);

export const insertCrmMeetingSchema = createInsertSchema(crmMeetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCrmMeeting = z.infer<typeof insertCrmMeetingSchema>;
export type CrmMeeting = typeof crmMeetings.$inferSelect;

// ========================
// VENDORS (Coffee Shops)
// ========================
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  imageUrl: text("image_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default("25.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// ========================
// MENU ITEMS
// ========================
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// ========================
// SCHEDULED ORDERS (Coffee Delivery Orders)
// ========================
export const scheduledOrders = pgTable(
  "scheduled_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    // Optional links to CRM
    clientId: varchar("client_id").references(() => clients.id),
    meetingId: varchar("meeting_id").references(() => crmMeetings.id),
    
    // Vendor selection
    vendorId: varchar("vendor_id").references(() => vendors.id),
    vendorName: varchar("vendor_name", { length: 255 }), // Denormalized for display
    
    // Delivery details
    deliveryAddress: text("delivery_address").notNull(),
    deliveryInstructions: text("delivery_instructions"),
    contactName: varchar("contact_name", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    
    // Scheduling
    scheduledDate: date("scheduled_date").notNull(),
    scheduledTime: varchar("scheduled_time", { length: 10 }).notNull(), // HH:MM format
    
    // Order items (JSON array: [{menuItemId, name, quantity, price, notes}])
    items: jsonb("items").$type<Array<{
      menuItemId?: string;
      name: string;
      quantity: number;
      price: string;
      notes?: string;
    }>>().notNull(),
    
    // Totals
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    salesTax: decimal("sales_tax", { precision: 10, scale: 2 }).default("0.00"),
    serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default("0.00"),
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0.00"),
    gratuity: decimal("gratuity", { precision: 10, scale: 2 }).default("0.00"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    
    // Order status
    status: varchar("status", { length: 30 }).default("scheduled").notNull(),
    // Status values: 'scheduled', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
    
    // Fulfillment tracking (for manual DoorDash/Uber Eats entry)
    fulfillmentChannel: varchar("fulfillment_channel", { length: 30 }).default("manual"),
    // Values: 'manual', 'doordash', 'ubereats', 'direct'
    fulfillmentRef: varchar("fulfillment_ref", { length: 255 }), // External order ID
    
    // Special notes
    specialInstructions: text("special_instructions"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_scheduled_orders_user").on(table.userId),
    dateIdx: index("idx_scheduled_orders_date").on(table.scheduledDate),
    statusIdx: index("idx_scheduled_orders_status").on(table.status),
  })
);

export const insertScheduledOrderSchema = createInsertSchema(scheduledOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScheduledOrder = z.infer<typeof insertScheduledOrderSchema>;
export type ScheduledOrder = typeof scheduledOrders.$inferSelect;

// ========================
// ORDER EVENTS (Status Timeline)
// ========================
export const orderEvents = pgTable(
  "order_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").notNull().references(() => scheduledOrders.id),
    
    status: varchar("status", { length: 30 }).notNull(),
    note: text("note"),
    
    // Who made the change
    changedBy: varchar("changed_by", { length: 100 }),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    orderIdx: index("idx_order_events_order").on(table.orderId),
  })
);

export const insertOrderEventSchema = createInsertSchema(orderEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertOrderEvent = z.infer<typeof insertOrderEventSchema>;
export type OrderEvent = typeof orderEvents.$inferSelect;

// ========================
// SCANNED DOCUMENTS
// ========================
export const scannedDocuments = pgTable(
  "scanned_documents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).default("general"),
    
    extractedText: text("extracted_text"),
    
    pageCount: integer("page_count").default(1),
    
    imageData: text("image_data"),
    thumbnailData: text("thumbnail_data"),
    
    clientId: varchar("client_id").references(() => clients.id),
    noteId: varchar("note_id").references(() => crmNotes.id),
    meetingId: varchar("meeting_id").references(() => crmMeetings.id),
    
    tags: text("tags").array(),
    
    language: varchar("language", { length: 10 }).default("eng"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_scanned_documents_user").on(table.userId),
    categoryIdx: index("idx_scanned_documents_category").on(table.category),
    clientIdx: index("idx_scanned_documents_client").on(table.clientId),
  })
);

export const insertScannedDocumentSchema = createInsertSchema(scannedDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScannedDocument = z.infer<typeof insertScannedDocumentSchema>;
export type ScannedDocument = typeof scannedDocuments.$inferSelect;

// Document categories
export const DOCUMENT_CATEGORIES = [
  'general',
  'receipt',
  'contract',
  'invoice',
  'business_card',
  'meeting_notes',
  'proposal',
  'other'
] as const;

// Supported OCR languages
export const OCR_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
] as const;

// ========================
// USER SUBSCRIPTIONS
// ========================
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    // Stripe subscription info
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    
    // Subscription details
    tier: varchar("tier", { length: 50 }).notNull(), // 'starter', 'professional', 'enterprise'
    status: varchar("status", { length: 50 }).default("active").notNull(),
    // Status: 'active', 'past_due', 'canceled', 'trialing'
    
    // Billing period
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    
    // Usage tracking
    ordersThisMonth: integer("orders_this_month").default(0),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_subscriptions_user").on(table.userId),
    stripeSubIdx: index("idx_subscriptions_stripe").on(table.stripeSubscriptionId),
  })
);

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// ========================
// PAYMENTS (Order Payment Records)
// ========================
export const payments = pgTable(
  "payments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    orderId: varchar("order_id").references(() => scheduledOrders.id),
    
    // Payment provider info
    provider: varchar("provider", { length: 50 }).notNull(), // 'stripe', 'coinbase'
    providerPaymentId: varchar("provider_payment_id", { length: 255 }),
    providerSessionId: varchar("provider_session_id", { length: 255 }),
    
    // Payment details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    // Status: 'pending', 'completed', 'failed', 'refunded'
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_payments_user").on(table.userId),
    orderIdx: index("idx_payments_order").on(table.orderId),
    providerIdx: index("idx_payments_provider").on(table.providerPaymentId),
  })
);

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ========================
// HALLMARKS (Blockchain Verification)
// ========================
export const hallmarks = pgTable(
  "hallmarks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // IDENTIFICATION
    serialNumber: varchar("serial_number", { length: 50 }).notNull().unique(),
    prefix: varchar("prefix", { length: 30 }).notNull(), // 'BB' for company, 'BB-USERNAME' for subscribers
    
    // WHAT IS BEING STAMPED
    assetType: varchar("asset_type", { length: 50 }).notNull(),
    // Types: 'app_version', 'company_document', 'user_document', 'portfolio_pdf', 'scanned_document'
    assetId: varchar("asset_id"), // Reference to the document/note/etc
    assetName: varchar("asset_name", { length: 255 }),
    
    // OWNERSHIP
    userId: varchar("user_id").references(() => users.id), // null for company hallmarks
    isCompanyHallmark: boolean("is_company_hallmark").default(false).notNull(),
    
    // ISSUANCE INFO
    issuedBy: varchar("issued_by", { length: 100 }),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    // Status: 'active', 'revoked', 'expired'
    
    // BLOCKCHAIN ANCHORING
    contentHash: varchar("content_hash", { length: 128 }),
    solanaTxSignature: varchar("solana_tx_signature", { length: 128 }),
    solanaConfirmedAt: timestamp("solana_confirmed_at"),
    solanaSlot: integer("solana_slot"),
    solanaNetwork: varchar("solana_network", { length: 20 }).default("mainnet"),
    
    // VERIFICATION TRACKING
    verificationCount: integer("verification_count").default(0),
    lastVerifiedAt: timestamp("last_verified_at"),
    
    // FLEXIBLE METADATA (version info, document details, etc)
    metadata: jsonb("metadata").$type<Record<string, any>>(),
  },
  (table) => ({
    serialIdx: index("idx_hallmarks_serial").on(table.serialNumber),
    userIdx: index("idx_hallmarks_user").on(table.userId),
    companyIdx: index("idx_hallmarks_company").on(table.isCompanyHallmark),
    assetIdx: index("idx_hallmarks_asset").on(table.assetType, table.assetId),
  })
);

export const insertHallmarkSchema = createInsertSchema(hallmarks).omit({
  id: true,
  issuedAt: true,
  verificationCount: true,
  lastVerifiedAt: true,
});
export type InsertHallmark = z.infer<typeof insertHallmarkSchema>;
export type Hallmark = typeof hallmarks.$inferSelect;

// ========================
// HALLMARK EVENTS (Audit Trail)
// ========================
export const hallmarkEvents = pgTable(
  "hallmark_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    
    eventType: varchar("event_type", { length: 30 }).notNull(),
    // Types: 'issued', 'verified', 'stamped', 'revoked', 'renewed'
    eventData: jsonb("event_data").$type<Record<string, any>>(),
    
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    hallmarkIdx: index("idx_hallmark_events_hallmark").on(table.hallmarkId),
    typeIdx: index("idx_hallmark_events_type").on(table.eventType),
  })
);

export const insertHallmarkEventSchema = createInsertSchema(hallmarkEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertHallmarkEvent = z.infer<typeof insertHallmarkEventSchema>;
export type HallmarkEvent = typeof hallmarkEvents.$inferSelect;

// ========================
// USER HALLMARK PROFILES (Subscriber Custom Hallmarks)
// ========================
export const userHallmarkProfiles = pgTable(
  "user_hallmark_profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id).unique(),
    
    // Custom prefix based on username (e.g., "BB-JOHNSMITH")
    hallmarkPrefix: varchar("hallmark_prefix", { length: 30 }).notNull().unique(),
    
    // Custom avatar for their hallmark badge
    avatarData: text("avatar_data"), // Base64 encoded image
    
    // Minting status
    isMinted: boolean("is_minted").default(false).notNull(),
    mintedAt: timestamp("minted_at"),
    mintTxSignature: varchar("mint_tx_signature", { length: 128 }),
    
    // Usage tracking
    documentsStampedThisMonth: integer("documents_stamped_this_month").default(0),
    totalDocumentsStamped: integer("total_documents_stamped").default(0),
    lastResetAt: timestamp("last_reset_at").defaultNow(),
    
    // Auto-stamp preference
    autoStampEnabled: boolean("auto_stamp_enabled").default(false),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_user_hallmark_profiles_user").on(table.userId),
    prefixIdx: index("idx_user_hallmark_profiles_prefix").on(table.hallmarkPrefix),
  })
);

export const insertUserHallmarkProfileSchema = createInsertSchema(userHallmarkProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserHallmarkProfile = z.infer<typeof insertUserHallmarkProfileSchema>;
export type UserHallmarkProfile = typeof userHallmarkProfiles.$inferSelect;

// ========================
// APP VERSION HISTORY (For Version Stamping)
// ========================
export const appVersions = pgTable(
  "app_versions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    version: varchar("version", { length: 20 }).notNull().unique(), // e.g., "1.0.0"
    hallmarkId: varchar("hallmark_id").references(() => hallmarks.id),
    
    // Changelog
    changelog: text("changelog").notNull(),
    releaseNotes: text("release_notes"),
    
    // Release info
    releasedAt: timestamp("released_at").defaultNow().notNull(),
    releasedBy: varchar("released_by", { length: 100 }),
    
    // Is current version
    isCurrent: boolean("is_current").default(false).notNull(),
  },
  (table) => ({
    versionIdx: index("idx_app_versions_version").on(table.version),
    currentIdx: index("idx_app_versions_current").on(table.isCurrent),
  })
);

export const insertAppVersionSchema = createInsertSchema(appVersions).omit({
  id: true,
  releasedAt: true,
});
export type InsertAppVersion = z.infer<typeof insertAppVersionSchema>;
export type AppVersion = typeof appVersions.$inferSelect;

// ========================
// FRANCHISES (Territory Ownership)
// ========================
export const franchises = pgTable(
  "franchises",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // FRANCHISE IDENTIFICATION
    franchiseId: varchar("franchise_id", { length: 50 }).notNull().unique(), // "BB-NASH-001", "BB-ATL-001"
    
    // OWNERSHIP
    ownerId: varchar("owner_id").references(() => users.id),
    ownerEmail: varchar("owner_email", { length: 255 }).notNull(),
    ownerName: varchar("owner_name", { length: 255 }).notNull(),
    ownerCompany: varchar("owner_company", { length: 255 }),
    ownerPhone: varchar("owner_phone", { length: 20 }),
    
    // OWNERSHIP MODE
    ownershipMode: varchar("ownership_mode", { length: 30 }).default("subscriber_managed").notNull(),
    // "subscriber_managed" = Brew & Board controls, customer uses platform
    // "franchise_owned" = Customer owns territory completely
    
    // TERRITORY
    territoryName: varchar("territory_name", { length: 100 }).notNull(), // "Nashville", "Atlanta Metro"
    territoryRegion: varchar("territory_region", { length: 255 }), // "Davidson County, TN"
    territoryExclusive: boolean("territory_exclusive").default(false).notNull(),
    territoryNotes: text("territory_notes"),
    
    // FRANCHISE TIER
    franchiseTier: varchar("franchise_tier", { length: 30 }).default("starter").notNull(),
    // "starter" | "professional" | "enterprise"
    
    // FINANCIAL TERMS
    franchiseFee: varchar("franchise_fee", { length: 20 }), // "$7,500"
    royaltyType: varchar("royalty_type", { length: 30 }).default("percentage"), // "percentage" | "per_order" | "flat"
    royaltyPercent: varchar("royalty_percent", { length: 10 }), // "5%"
    royaltyAmount: varchar("royalty_amount", { length: 20 }), // For per-order: "$2.00"
    platformFeeMonthly: varchar("platform_fee_monthly", { length: 20 }), // "$400"
    hallmarkRevenueShare: varchar("hallmark_revenue_share", { length: 10 }), // "70/30" (franchise keeps 70%)
    
    // SUPPORT TERMS
    supportTier: varchar("support_tier", { length: 30 }).default("standard"), // "standard" | "priority" | "enterprise"
    supportResponseHours: integer("support_response_hours").default(48),
    
    // STATUS
    status: varchar("status", { length: 30 }).default("pending").notNull(),
    // "pending" | "approved" | "active" | "suspended" | "terminated"
    
    // HALLMARK INTEGRATION
    hallmarkPrefix: varchar("hallmark_prefix", { length: 30 }), // "BB-NASH" for Nashville franchise
    canMintHallmarks: boolean("can_mint_hallmarks").default(false),
    hallmarksMintedTotal: integer("hallmarks_minted_total").default(0),
    
    // CUSTODY
    custodyOwner: varchar("custody_owner", { length: 100 }).default("brewandboard"), // "brewandboard" or owner email
    custodyTransferDate: timestamp("custody_transfer_date"),
    previousCustodyOwner: varchar("previous_custody_owner", { length: 100 }),
    
    // PERFORMANCE METRICS
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
    activeVendors: integer("active_vendors").default(0),
    
    // DATES
    franchiseStartDate: timestamp("franchise_start_date"),
    franchiseRenewalDate: timestamp("franchise_renewal_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    franchiseIdIdx: index("idx_franchises_franchise_id").on(table.franchiseId),
    ownerIdx: index("idx_franchises_owner").on(table.ownerId),
    territoryIdx: index("idx_franchises_territory").on(table.territoryName),
    statusIdx: index("idx_franchises_status").on(table.status),
  })
);

export const insertFranchiseSchema = createInsertSchema(franchises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  totalRevenue: true,
  hallmarksMintedTotal: true,
});
export type InsertFranchise = z.infer<typeof insertFranchiseSchema>;
export type Franchise = typeof franchises.$inferSelect;

// ========================
// FRANCHISE CUSTODY TRANSFERS
// ========================
export const franchiseCustodyTransfers = pgTable(
  "franchise_custody_transfers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // WHAT IS BEING TRANSFERRED
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    // TRANSFER TYPE
    transferType: varchar("transfer_type", { length: 50 }).notNull(),
    // "subscriber_to_franchise" | "franchise_upgrade" | "franchise_transfer"
    
    // FROM/TO
    fromMode: varchar("from_mode", { length: 30 }).notNull(), // "subscriber_managed"
    toMode: varchar("to_mode", { length: 30 }).notNull(), // "franchise_owned"
    fromOwner: varchar("from_owner", { length: 100 }).notNull(), // "brewandboard"
    toOwner: varchar("to_owner", { length: 100 }).notNull(), // New owner email
    
    // FINANCIAL TERMS
    transferFee: varchar("transfer_fee", { length: 20 }), // One-time fee
    franchiseFeeAgreed: varchar("franchise_fee_agreed", { length: 20 }),
    royaltyTerms: jsonb("royalty_terms").$type<{
      type: string;
      percent?: string;
      amount?: string;
    }>(),
    
    // ASSETS TRANSFERRED
    vendorRelationshipsTransferred: integer("vendor_relationships_transferred").default(0),
    ordersHistoryIncluded: boolean("orders_history_included").default(true),
    hallmarkSystemIncluded: boolean("hallmark_system_included").default(true),
    
    // APPROVAL CHAIN
    approvedBy: varchar("approved_by", { length: 100 }),
    approvedAt: timestamp("approved_at"),
    customerAccepted: boolean("customer_accepted").default(false),
    customerAcceptedAt: timestamp("customer_accepted_at"),
    legalAgreementSigned: boolean("legal_agreement_signed").default(false),
    legalAgreementUrl: text("legal_agreement_url"),
    
    // STATUS
    status: varchar("status", { length: 30 }).default("pending").notNull(),
    // "pending" | "approved" | "accepted" | "completed" | "cancelled"
    statusNotes: text("status_notes"),
    
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    franchiseIdx: index("idx_custody_transfers_franchise").on(table.franchiseId),
    statusIdx: index("idx_custody_transfers_status").on(table.status),
  })
);

export const insertFranchiseCustodyTransferSchema = createInsertSchema(franchiseCustodyTransfers).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
export type InsertFranchiseCustodyTransfer = z.infer<typeof insertFranchiseCustodyTransferSchema>;
export type FranchiseCustodyTransfer = typeof franchiseCustodyTransfers.$inferSelect;

// ========================
// FRANCHISE INQUIRIES (Leads)
// ========================
export const franchiseInquiries = pgTable(
  "franchise_inquiries",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // CONTACT INFO
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    company: varchar("company", { length: 255 }),
    
    // INQUIRY DETAILS
    interestedTier: varchar("interested_tier", { length: 30 }), // "starter" | "professional" | "enterprise"
    preferredTerritory: varchar("preferred_territory", { length: 255 }),
    investmentBudget: varchar("investment_budget", { length: 100 }),
    timelineToStart: varchar("timeline_to_start", { length: 100 }),
    
    // BACKGROUND
    hasBusinessExperience: boolean("has_business_experience").default(false),
    hasFoodServiceExperience: boolean("has_food_service_experience").default(false),
    currentOccupation: varchar("current_occupation", { length: 255 }),
    additionalNotes: text("additional_notes"),
    
    // STATUS
    status: varchar("status", { length: 30 }).default("new").notNull(),
    // "new" | "contacted" | "qualified" | "negotiating" | "converted" | "declined"
    assignedTo: varchar("assigned_to", { length: 100 }),
    followUpDate: timestamp("follow_up_date"),
    
    // CONVERSION
    convertedToFranchiseId: varchar("converted_to_franchise_id").references(() => franchises.id),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_franchise_inquiries_email").on(table.email),
    statusIdx: index("idx_franchise_inquiries_status").on(table.status),
    territoryIdx: index("idx_franchise_inquiries_territory").on(table.preferredTerritory),
  })
);

export const insertFranchiseInquirySchema = createInsertSchema(franchiseInquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFranchiseInquiry = z.infer<typeof insertFranchiseInquirySchema>;
export type FranchiseInquiry = typeof franchiseInquiries.$inferSelect;

// ========================
// CONSTANTS
// ========================
export const MINIMUM_ORDER_LEAD_TIME_HOURS = 2;

// Capacity Management Constants
// 2-person team can handle max 3-5 concurrent orders in a 2-hour window
export const MAX_CONCURRENT_ORDERS = 4; // Conservative middle ground
export const CAPACITY_WINDOW_HOURS = 2; // Check orders within 2-hour window

export const ORDER_STATUSES = [
  'scheduled',
  'confirmed', 
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
] as const;
export const FULFILLMENT_CHANNELS = ['manual', 'doordash', 'ubereats', 'direct'] as const;

// Hallmark constants
export const HALLMARK_ASSET_TYPES = [
  'app_version',
  'company_document', 
  'user_document',
  'portfolio_pdf',
  'scanned_document'
] as const;

export const HALLMARK_STATUSES = ['active', 'revoked', 'expired'] as const;

// Subscription tier hallmark limits (per month)
export const HALLMARK_LIMITS = {
  starter: 5,
  professional: 25,
  enterprise: Infinity, // Unlimited
} as const;

// Minting fee for subscriber hallmarks
export const HALLMARK_MINTING_FEE = 199; // $1.99 in cents

// ========================
// FRANCHISE CONSTANTS
// ========================
export const FRANCHISE_TIERS = {
  starter: {
    name: "Starter",
    fee: "$7,500",
    feeNumber: 7500,
    royaltyPercent: "5%",
    platformFee: "$400/month",
    platformFeeNumber: 400,
    territories: "Single city",
    exclusive: false,
    supportHours: 48,
    hallmarkShare: "70/30", // Franchise keeps 70%
    features: [
      "Single city territory",
      "5% royalty per order",
      "$400/month platform fee",
      "Non-exclusive territory",
      "48hr support response",
      "70/30 hallmark revenue share",
      "Full vendor network access",
      "Basic analytics dashboard"
    ]
  },
  professional: {
    name: "Professional",
    fee: "$15,000",
    feeNumber: 15000,
    royaltyPercent: "4%",
    platformFee: "$650/month",
    platformFeeNumber: 650,
    territories: "Up to 3 cities",
    exclusive: true,
    supportHours: 24,
    hallmarkShare: "80/20",
    popular: true,
    features: [
      "Regional territory (up to 3 cities)",
      "4% royalty per order",
      "$650/month platform fee",
      "Exclusive territory protection",
      "24hr priority support",
      "80/20 hallmark revenue share",
      "Dedicated account manager",
      "Advanced analytics + reporting",
      "Custom branding options"
    ]
  },
  enterprise: {
    name: "Enterprise",
    fee: "$35,000",
    feeNumber: 35000,
    royaltyPercent: "3%",
    platformFee: "$1,200/month",
    platformFeeNumber: 1200,
    territories: "State/Multi-state",
    exclusive: true,
    supportHours: 4,
    hallmarkShare: "90/10",
    features: [
      "State or multi-state exclusive territory",
      "3% royalty per order",
      "$1,200/month platform fee",
      "Exclusive territory with sub-franchise rights",
      "4hr enterprise support (24/7)",
      "90/10 hallmark revenue share",
      "Executive quarterly reviews",
      "Full white-label options",
      "API access for custom integrations",
      "Priority vendor onboarding"
    ]
  }
} as const;

export const FRANCHISE_STATUSES = ['pending', 'approved', 'active', 'suspended', 'terminated'] as const;
export const FRANCHISE_OWNERSHIP_MODES = ['subscriber_managed', 'franchise_owned'] as const;
export const FRANCHISE_INQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'negotiating', 'converted', 'declined'] as const;

// ========================
// REGIONS (Territory Management)
// ========================
export const regions = pgTable(
  "regions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 10 }).notNull().unique(), // e.g., "TN-NASH", "TX-DAL"
    
    // Geographic scope
    state: varchar("state", { length: 2 }).notNull(),
    cities: text("cities").array(), // List of cities in this region
    
    // Status
    status: varchar("status", { length: 20 }).default("active"), // active, pending, inactive
    
    // Business metrics
    targetRevenue: decimal("target_revenue", { precision: 12, scale: 2 }),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    codeIdx: index("idx_regions_code").on(table.code),
    stateIdx: index("idx_regions_state").on(table.state),
  })
);

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// ========================
// REGIONAL MANAGERS
// ========================
export const regionalManagers = pgTable(
  "regional_managers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Manager identity
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    pin: varchar("pin", { length: 10 }).unique(), // Login PIN
    
    // Role and region assignment
    role: varchar("role", { length: 30 }).default("regional_manager"), // regional_manager, super_manager, admin
    regionId: varchar("region_id").references(() => regions.id),
    
    // Professional info for business cards
    title: varchar("title", { length: 100 }).default("Regional Manager"),
    photoUrl: text("photo_url"),
    linkedinUrl: text("linkedin_url"),
    
    // Status
    isActive: boolean("is_active").default(true),
    mustChangePin: boolean("must_change_pin").default(true), // Force PIN change on first login
    hasSeenWelcome: boolean("has_seen_welcome").default(false), // Track if welcome modal shown
    hireDate: date("hire_date"),
    
    // Performance tracking
    salesTarget: decimal("sales_target", { precision: 12, scale: 2 }),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    emailIdx: index("idx_regional_managers_email").on(table.email),
    regionIdx: index("idx_regional_managers_region").on(table.regionId),
    pinIdx: index("idx_regional_managers_pin").on(table.pin),
  })
);

export const insertRegionalManagerSchema = createInsertSchema(regionalManagers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRegionalManager = z.infer<typeof insertRegionalManagerSchema>;
export type RegionalManager = typeof regionalManagers.$inferSelect;

// ========================
// TERRITORY ASSIGNMENTS (For managers covering multiple regions)
// ========================
export const territoryAssignments = pgTable(
  "territory_assignments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    managerId: varchar("manager_id").notNull().references(() => regionalManagers.id),
    regionId: varchar("region_id").notNull().references(() => regions.id),
    
    isPrimary: boolean("is_primary").default(false), // Primary territory vs coverage
    
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // Null = ongoing
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    managerIdx: index("idx_territory_assignments_manager").on(table.managerId),
    regionIdx: index("idx_territory_assignments_region").on(table.regionId),
  })
);

export const insertTerritoryAssignmentSchema = createInsertSchema(territoryAssignments).omit({
  id: true,
  createdAt: true,
});
export type InsertTerritoryAssignment = z.infer<typeof insertTerritoryAssignmentSchema>;
export type TerritoryAssignment = typeof territoryAssignments.$inferSelect;

// Regional Manager Role Types
export const MANAGER_ROLES = ['regional_manager', 'super_manager', 'admin'] as const;
export const REGION_STATUSES = ['active', 'pending', 'inactive'] as const;

// ========================
// TEAM CHAT MESSAGES (For Operators)
// ========================
export const teamChatMessages = pgTable(
  "team_chat_messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    senderId: varchar("sender_id").notNull(),
    senderName: varchar("sender_name", { length: 100 }).notNull(),
    senderRole: varchar("sender_role", { length: 50 }),
    
    message: text("message").notNull(),
    
    createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
  },
  (table) => ({
    createdAtIdx: index("idx_team_chat_created").on(table.createdAt),
  })
);

export const insertTeamChatMessageSchema = createInsertSchema(teamChatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertTeamChatMessage = z.infer<typeof insertTeamChatMessageSchema>;
export type TeamChatMessage = typeof teamChatMessages.$inferSelect;

// ========================
// VIRTUAL MEETINGS (Multi-Location Host Orders)
// ========================
export const virtualMeetings = pgTable(
  "virtual_meetings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Host info
    hostUserId: varchar("host_user_id").references(() => users.id),
    hostName: varchar("host_name", { length: 255 }).notNull(),
    hostEmail: varchar("host_email", { length: 255 }).notNull(),
    hostCompany: varchar("host_company", { length: 255 }),
    
    // Meeting details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    
    // Scheduling (stored in UTC, display in timezone)
    meetingDate: date("meeting_date").notNull(),
    meetingTime: varchar("meeting_time", { length: 10 }).notNull(), // HH:MM format
    timezone: varchar("timezone", { length: 50 }).default("America/Chicago"),
    
    // Lead time (minimum hours before meeting for ordering)
    leadTimeHours: integer("lead_time_hours").default(4),
    
    // Budget settings
    budgetType: varchar("budget_type", { length: 20 }).default("per_person"), // 'per_person' | 'total'
    perPersonBudgetCents: integer("per_person_budget_cents").default(1500), // $15 default
    totalBudgetCents: integer("total_budget_cents"),
    
    // Delivery scope
    deliveryScope: varchar("delivery_scope", { length: 20 }).default("local"), // 'local' | 'nationwide'
    deliveryProvider: varchar("delivery_provider", { length: 30 }).default("manual"),
    // Values: 'manual', 'local', 'doordash', 'uber_eats'
    
    // Status workflow
    status: varchar("status", { length: 30 }).default("draft").notNull(),
    // Status: 'draft', 'collecting', 'ready_to_order', 'ordering', 'ordered', 'delivered', 'completed', 'cancelled'
    
    // Invite token for sharing
    inviteToken: varchar("invite_token", { length: 64 }).unique(),
    
    // Notes
    hostNotes: text("host_notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    hostIdx: index("idx_virtual_meetings_host").on(table.hostUserId),
    dateIdx: index("idx_virtual_meetings_date").on(table.meetingDate),
    statusIdx: index("idx_virtual_meetings_status").on(table.status),
    tokenIdx: index("idx_virtual_meetings_token").on(table.inviteToken),
  })
);

export const insertVirtualMeetingSchema = createInsertSchema(virtualMeetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVirtualMeeting = z.infer<typeof insertVirtualMeetingSchema>;
export type VirtualMeeting = typeof virtualMeetings.$inferSelect;

// ========================
// VIRTUAL ATTENDEES (People receiving orders)
// ========================
export const virtualAttendees = pgTable(
  "virtual_attendees",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    meetingId: varchar("meeting_id").notNull().references(() => virtualMeetings.id),
    
    // Attendee info
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    
    // Delivery address
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),
    
    // Location label (e.g., "Downtown Job Site", "Brentwood Office")
    locationLabel: varchar("location_label", { length: 255 }),
    
    // Delivery instructions
    deliveryInstructions: text("delivery_instructions"),
    
    // Individual invite token
    attendeeToken: varchar("attendee_token", { length: 64 }).unique(),
    
    // Status
    inviteStatus: varchar("invite_status", { length: 20 }).default("pending"),
    // Status: 'pending', 'invited', 'viewed', 'submitted', 'declined'
    
    submittedAt: timestamp("submitted_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    meetingIdx: index("idx_virtual_attendees_meeting").on(table.meetingId),
    tokenIdx: index("idx_virtual_attendees_token").on(table.attendeeToken),
    statusIdx: index("idx_virtual_attendees_status").on(table.inviteStatus),
  })
);

export const insertVirtualAttendeeSchema = createInsertSchema(virtualAttendees).omit({
  id: true,
  createdAt: true,
});
export type InsertVirtualAttendee = z.infer<typeof insertVirtualAttendeeSchema>;
export type VirtualAttendee = typeof virtualAttendees.$inferSelect;

// ========================
// VIRTUAL SELECTIONS (What each attendee ordered)
// ========================
export const virtualSelections = pgTable(
  "virtual_selections",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    attendeeId: varchar("attendee_id").notNull().references(() => virtualAttendees.id),
    
    // Selected items (JSON array)
    items: jsonb("items").$type<Array<{
      name: string;
      quantity: number;
      priceCents: number;
      category?: string; // coffee, pastry, etc.
      notes?: string;
      vendorName?: string;
    }>>().default([]),
    
    // Totals (in cents for precision)
    subtotalCents: integer("subtotal_cents").default(0),
    
    // Budget status
    budgetStatus: varchar("budget_status", { length: 20 }).default("under"),
    // Status: 'under', 'at', 'over'
    overageCents: integer("overage_cents").default(0),
    
    // Special requests
    specialRequests: text("special_requests"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    attendeeIdx: index("idx_virtual_selections_attendee").on(table.attendeeId),
  })
);

export const insertVirtualSelectionSchema = createInsertSchema(virtualSelections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVirtualSelection = z.infer<typeof insertVirtualSelectionSchema>;
export type VirtualSelection = typeof virtualSelections.$inferSelect;

// ========================
// VIRTUAL ORDERS (Actual delivery orders per attendee)
// ========================
export const virtualOrders = pgTable(
  "virtual_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    meetingId: varchar("meeting_id").notNull().references(() => virtualMeetings.id),
    attendeeId: varchar("attendee_id").notNull().references(() => virtualAttendees.id),
    
    // Provider info
    provider: varchar("provider", { length: 30 }).default("manual"),
    // Values: 'manual', 'local', 'doordash', 'uber_eats'
    providerOrderId: varchar("provider_order_id", { length: 255 }),
    
    // Order status
    status: varchar("status", { length: 30 }).default("pending"),
    // Status: 'pending', 'placing', 'placed', 'confirmed', 'preparing', 'en_route', 'delivered', 'failed', 'cancelled'
    
    // Tracking
    estimatedDelivery: timestamp("estimated_delivery"),
    trackingUrl: text("tracking_url"),
    
    // Cost breakdown (cents)
    subtotalCents: integer("subtotal_cents").default(0),
    deliveryFeeCents: integer("delivery_fee_cents").default(0),
    serviceFeeCents: integer("service_fee_cents").default(0),
    taxCents: integer("tax_cents").default(0),
    tipCents: integer("tip_cents").default(0),
    totalCents: integer("total_cents").default(0),
    
    // Delivery proof
    deliveredAt: timestamp("delivered_at"),
    deliveryPhotoUrl: text("delivery_photo_url"),
    
    // Webhook data (for future integrations)
    webhookPayload: jsonb("webhook_payload"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    meetingIdx: index("idx_virtual_orders_meeting").on(table.meetingId),
    attendeeIdx: index("idx_virtual_orders_attendee").on(table.attendeeId),
    statusIdx: index("idx_virtual_orders_status").on(table.status),
  })
);

export const insertVirtualOrderSchema = createInsertSchema(virtualOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVirtualOrder = z.infer<typeof insertVirtualOrderSchema>;
export type VirtualOrder = typeof virtualOrders.$inferSelect;

// ========================
// VIRTUAL MEETING EVENTS (Timeline/Audit Trail)
// ========================
export const virtualMeetingEvents = pgTable(
  "virtual_meeting_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    meetingId: varchar("meeting_id").notNull().references(() => virtualMeetings.id),
    attendeeId: varchar("attendee_id").references(() => virtualAttendees.id),
    
    eventType: varchar("event_type", { length: 50 }).notNull(),
    // Types: 'created', 'invite_sent', 'invite_viewed', 'selection_submitted', 
    // 'budget_exceeded', 'order_placed', 'order_confirmed', 'out_for_delivery', 
    // 'delivered', 'failed', 'cancelled', 'completed'
    
    message: text("message"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    meetingIdx: index("idx_virtual_meeting_events_meeting").on(table.meetingId),
    typeIdx: index("idx_virtual_meeting_events_type").on(table.eventType),
  })
);

export const insertVirtualMeetingEventSchema = createInsertSchema(virtualMeetingEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertVirtualMeetingEvent = z.infer<typeof insertVirtualMeetingEventSchema>;
export type VirtualMeetingEvent = typeof virtualMeetingEvents.$inferSelect;

// Virtual Meeting Constants
export const VIRTUAL_MEETING_STATUSES = ['draft', 'collecting', 'ready_to_order', 'ordering', 'ordered', 'delivered', 'completed', 'cancelled'] as const;
export const VIRTUAL_ATTENDEE_STATUSES = ['pending', 'invited', 'viewed', 'submitted', 'declined'] as const;
export const VIRTUAL_ORDER_STATUSES = ['pending', 'placing', 'placed', 'confirmed', 'preparing', 'en_route', 'delivered', 'failed', 'cancelled'] as const;
export const DELIVERY_PROVIDERS = ['manual', 'local', 'doordash', 'uber_eats'] as const;
export const BUDGET_TYPES = ['per_person', 'total'] as const;
export const DELIVERY_SCOPES = ['local', 'nationwide'] as const;

// Default menu items for quick selection (generic items that work anywhere)
export const QUICK_MENU_ITEMS = [
  { id: 'coffee-reg', name: 'Regular Coffee', priceCents: 350, category: 'coffee' },
  { id: 'coffee-latte', name: 'Latte', priceCents: 550, category: 'coffee' },
  { id: 'coffee-cappuccino', name: 'Cappuccino', priceCents: 525, category: 'coffee' },
  { id: 'coffee-cold-brew', name: 'Cold Brew', priceCents: 475, category: 'coffee' },
  { id: 'tea-hot', name: 'Hot Tea', priceCents: 300, category: 'tea' },
  { id: 'pastry-muffin', name: 'Muffin', priceCents: 375, category: 'pastry' },
  { id: 'pastry-croissant', name: 'Croissant', priceCents: 425, category: 'pastry' },
  { id: 'pastry-danish', name: 'Danish', priceCents: 400, category: 'pastry' },
  { id: 'donut-glazed', name: 'Glazed Donut', priceCents: 175, category: 'donut' },
  { id: 'donut-dozen', name: 'Dozen Donuts', priceCents: 1599, category: 'donut' },
  { id: 'bagel', name: 'Bagel with Cream Cheese', priceCents: 450, category: 'pastry' },
  { id: 'breakfast-sandwich', name: 'Breakfast Sandwich', priceCents: 695, category: 'food' },
] as const;
