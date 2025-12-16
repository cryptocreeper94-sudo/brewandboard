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
// CLIENTS (CRM Contacts) - Enhanced HubSpot-style
// ========================
export const clients = pgTable(
  "clients",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    // Basic Info
    name: varchar("name", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    
    // Enhanced CRM Fields
    jobTitle: varchar("job_title", { length: 100 }),
    company: varchar("company", { length: 255 }),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 100 }),
    
    // Social Links
    linkedIn: varchar("linkedin", { length: 255 }),
    twitter: varchar("twitter", { length: 100 }),
    instagram: varchar("instagram", { length: 100 }),
    
    // Address
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 10 }),
    country: varchar("country", { length: 100 }).default("USA"),
    
    // CRM Metadata
    tags: text("tags").array(),
    source: varchar("source", { length: 100 }), // how they were added: manual, scan, import
    notes: text("notes"),
    avatarUrl: text("avatar_url"),
    
    // Engagement tracking
    lastContactedAt: timestamp("last_contacted_at"),
    preferredChannel: varchar("preferred_channel", { length: 50 }), // email, phone, text
    birthday: date("birthday"),
    
    status: varchar("status", { length: 50 }).default("active"), // active, inactive, lead, customer
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_clients_user_id").on(table.userId),
    nameIdx: index("idx_clients_name").on(table.name),
    companyIdx: index("idx_clients_company").on(table.company),
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
// USER BUSINESS CARDS (Digital Card Designer)
// ========================
export const businessCards = pgTable(
  "business_cards",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    // Card Identity
    cardName: varchar("card_name", { length: 100 }).default("My Business Card"),
    isDefault: boolean("is_default").default(false),
    
    // Personal Info on Card
    fullName: varchar("full_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 100 }),
    company: varchar("company", { length: 255 }),
    tagline: varchar("tagline", { length: 255 }),
    
    // Contact Info
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    website: varchar("website", { length: 255 }),
    
    // Social Links
    linkedIn: varchar("linkedin", { length: 255 }),
    twitter: varchar("twitter", { length: 100 }),
    instagram: varchar("instagram", { length: 100 }),
    
    // Address
    addressLine1: varchar("address_line1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 10 }),
    
    // Design Config
    template: varchar("template", { length: 50 }).default("classic"), // classic, modern, minimal, luxury
    primaryColor: varchar("primary_color", { length: 20 }).default("#5c4033"),
    secondaryColor: varchar("secondary_color", { length: 20 }).default("#d4a574"),
    logoUrl: text("logo_url"),
    avatarUrl: text("avatar_url"),
    backgroundStyle: varchar("background_style", { length: 50 }).default("solid"), // solid, gradient, image
    
    // QR Code
    qrCodeData: text("qr_code_data"), // vCard data or URL
    
    // Export
    pdfUrl: text("pdf_url"),
    imageUrl: text("image_url"),
    
    // Sharing
    shareableLink: varchar("shareable_link", { length: 255 }),
    viewCount: integer("view_count").default(0),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_business_cards_user").on(table.userId),
  })
);

export const insertBusinessCardSchema = createInsertSchema(businessCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});
export type InsertBusinessCard = z.infer<typeof insertBusinessCardSchema>;
export type BusinessCard = typeof businessCards.$inferSelect;


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
    // Internal gratuity: kept by Brew & Board (not passed to delivery partners like DoorDash/UberEats)
    internalGratuity: decimal("internal_gratuity", { precision: 10, scale: 2 }).default("0.00"),
    // Partner gratuity: passed to delivery partner if using DoorDash/UberEats
    partnerGratuity: decimal("partner_gratuity", { precision: 10, scale: 2 }).default("0.00"),
    // Attendee tip: additional tip from attendee when host already tipped
    attendeeTip: decimal("attendee_tip", { precision: 10, scale: 2 }).default("0.00"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    
    // Multi-site/multi-city coordinated order flag (incurs 18% minimum gratuity)
    isCoordinatedOrder: boolean("is_coordinated_order").default(false),
    
    // Order status
    status: varchar("status", { length: 30 }).default("scheduled").notNull(),
    // Status values: 'scheduled', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'
    
    // Region assignment for operations dashboard filtering
    regionId: varchar("region_id").references(() => regions.id),
    
    // Driver/delivery assignment
    assignedDriverId: varchar("assigned_driver_id"),
    assignedDriverName: varchar("assigned_driver_name", { length: 255 }),
    driverPhone: varchar("driver_phone", { length: 20 }),
    
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
    regionIdx: index("idx_scheduled_orders_region").on(table.regionId),
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
    changedByRole: varchar("changed_by_role", { length: 50 }), // admin, regional_manager, partner, driver
    
    // GPS tracking (for delivery events)
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    orderIdx: index("idx_order_events_order").on(table.orderId),
    statusIdx: index("idx_order_events_status").on(table.status),
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

// ========================
// MEETING PRESENTATIONS
// ========================
export const meetingPresentations = pgTable(
  "meeting_presentations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    
    templateType: varchar("template_type", { length: 50 }).notNull().default("executive"),
    
    documentIds: text("document_ids").array(),
    
    attendeeEmails: text("attendee_emails").array(),
    attendeeNames: text("attendee_names").array(),
    
    meetingDate: date("meeting_date"),
    meetingTime: varchar("meeting_time", { length: 10 }),
    
    shareableLink: varchar("shareable_link", { length: 255 }),
    
    status: varchar("status", { length: 30 }).default("draft").notNull(),
    
    sentAt: timestamp("sent_at"),
    viewCount: integer("view_count").default(0),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_meeting_presentations_user").on(table.userId),
    statusIdx: index("idx_meeting_presentations_status").on(table.status),
  })
);

export const insertMeetingPresentationSchema = createInsertSchema(meetingPresentations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  sentAt: true,
});
export type InsertMeetingPresentation = z.infer<typeof insertMeetingPresentationSchema>;
export type MeetingPresentation = typeof meetingPresentations.$inferSelect;

export const PRESENTATION_TEMPLATES = [
  { id: 'executive', name: 'Executive Summary', description: 'Clean, minimal layout with company branding' },
  { id: 'board', name: 'Board Meeting', description: 'Formal structure with agenda and document sections' },
  { id: 'huddle', name: 'Team Huddle', description: 'Casual, friendly format for quick syncs' },
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
// VENDOR APPLICATIONS
// ========================
export const vendorApplications = pgTable(
  "vendor_applications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // BUSINESS INFO
    businessName: varchar("business_name", { length: 255 }).notNull(),
    businessType: varchar("business_type", { length: 100 }).notNull(),
    // "coffee_shop" | "bakery" | "juice_bar" | "breakfast" | "donut_shop" | "bubble_tea" | "other"
    
    // CONTACT INFO
    ownerName: varchar("owner_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 100 }),
    
    // LOCATION
    address: varchar("address", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
    neighborhood: varchar("neighborhood", { length: 100 }),
    
    // BUSINESS DETAILS
    yearsInBusiness: varchar("years_in_business", { length: 20 }),
    seatingCapacity: varchar("seating_capacity", { length: 50 }),
    averageOrderValue: varchar("average_order_value", { length: 50 }),
    peakHours: varchar("peak_hours", { length: 100 }),
    
    // MENU & CAPABILITIES
    menuHighlights: text("menu_highlights"),
    canHandleCatering: boolean("can_handle_catering").default(true),
    maxOrderSize: varchar("max_order_size", { length: 50 }),
    leadTimeNeeded: varchar("lead_time_needed", { length: 50 }),
    
    // WHY JOIN
    whyJoin: text("why_join"),
    additionalNotes: text("additional_notes"),
    
    // STATUS
    status: varchar("status", { length: 30 }).default("pending").notNull(),
    // "pending" | "reviewing" | "approved" | "onboarded" | "declined"
    reviewedBy: varchar("reviewed_by", { length: 100 }),
    reviewNotes: text("review_notes"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_vendor_applications_email").on(table.email),
    statusIdx: index("idx_vendor_applications_status").on(table.status),
    cityIdx: index("idx_vendor_applications_city").on(table.city),
  })
);

export const insertVendorApplicationSchema = createInsertSchema(vendorApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplication = typeof vendorApplications.$inferSelect;

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
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled'
] as const;

// Order status display labels and colors for Operations dashboard
export const ORDER_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-500', icon: 'Clock' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-500', icon: 'CheckCircle' },
  preparing: { label: 'Preparing', color: 'bg-amber-500', icon: 'ChefHat' },
  picked_up: { label: 'Picked Up', color: 'bg-purple-500', icon: 'Package' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', icon: 'Truck' },
  delivered: { label: 'Delivered', color: 'bg-green-600', icon: 'CheckCircle2' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: 'XCircle' },
} as const;
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
    hostEmail: varchar("host_email", { length: 255 }),
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
    
    // Multi-site/multi-city coordination
    isCoordinatedOrder: boolean("is_coordinated_order").default(false),
    // Auto-gratuity for coordinated orders (18% minimum for multi-site/multi-city)
    autoGratuityPercent: integer("auto_gratuity_percent").default(18),
    
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
    
    // Attendee additional tip (optional, since host is already tipping)
    attendeeTipCents: integer("attendee_tip_cents").default(0),
    
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

// ========================
// ERROR REPORTS (Bug/Issue Tracking for Partners)
// ========================
export const errorReports = pgTable(
  "error_reports",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Reporter info
    reporterName: varchar("reporter_name", { length: 255 }),
    reporterEmail: varchar("reporter_email", { length: 255 }),
    reporterPhone: varchar("reporter_phone", { length: 50 }),
    
    // Issue details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    errorMessage: text("error_message"),
    pageUrl: varchar("page_url", { length: 500 }),
    
    // Categorization
    severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
    category: varchar("category", { length: 50 }).default("general"), // general, payment, order, login, display
    
    // Status tracking
    status: varchar("status", { length: 20 }).default("open"), // open, in_progress, resolved, closed
    assignedTo: varchar("assigned_to", { length: 255 }),
    resolution: text("resolution"),
    
    // Metadata
    userAgent: text("user_agent"),
    screenshotUrl: text("screenshot_url"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    statusIdx: index("idx_error_reports_status").on(table.status),
    severityIdx: index("idx_error_reports_severity").on(table.severity),
  })
);

export const insertErrorReportSchema = createInsertSchema(errorReports).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});
export type InsertErrorReport = z.infer<typeof insertErrorReportSchema>;
export type ErrorReport = typeof errorReports.$inferSelect;

// ========================
// 1099 COMPLIANCE - PAYEES (Contractors, Partners, Referrals)
// ========================
export const payees = pgTable(
  "payees",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Basic Info
    displayName: varchar("display_name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull().default("contractor"),
    // Types: 'contractor', 'partner', 'referral', 'vendor', 'consultant'
    
    // Legal/Tax Info (SECURITY: Only store masked last 4 digits, require W-9 for full info)
    legalName: varchar("legal_name", { length: 255 }),
    taxIdLast4: varchar("tax_id_last4", { length: 4 }), // Only last 4 digits stored
    taxIdType: varchar("tax_id_type", { length: 10 }), // 'SSN' or 'EIN'
    w9DocumentUrl: text("w9_document_url"), // URL to uploaded W-9 form
    w9UploadedAt: timestamp("w9_uploaded_at"),
    
    // Contact Info
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    
    // Mailing Address (for 1099 delivery)
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 10 }),
    country: varchar("country", { length: 100 }).default("USA"),
    
    // Status
    status: varchar("status", { length: 30 }).default("active"),
    // Statuses: 'active', 'inactive', 'pending_w9', 'w9_expired'
    
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    typeIdx: index("idx_payees_type").on(table.type),
    statusIdx: index("idx_payees_status").on(table.status),
    nameIdx: index("idx_payees_name").on(table.displayName),
  })
);

export const insertPayeeSchema = createInsertSchema(payees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayee = z.infer<typeof insertPayeeSchema>;
export type Payee = typeof payees.$inferSelect;

// Payee type constants
export const PAYEE_TYPES = ['contractor', 'partner', 'referral', 'vendor', 'consultant'] as const;
export const PAYEE_STATUSES = ['active', 'inactive', 'pending_w9', 'w9_expired'] as const;

// ========================
// 1099 COMPLIANCE - PAYMENTS (Individual disbursements)
// ========================
export const payments1099 = pgTable(
  "payments_1099",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    payeeId: varchar("payee_id").notNull().references(() => payees.id),
    
    // Payment Details
    taxYear: integer("tax_year").notNull(),
    paymentDate: date("payment_date").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    
    // Categorization
    category: varchar("category", { length: 50 }).notNull().default("contractor"),
    // Categories: 'contractor', 'referral', 'commission', 'reimbursement', 'bonus'
    
    paymentMethod: varchar("payment_method", { length: 30 }).default("check"),
    // Methods: 'check', 'ach', 'wire', 'cash', 'crypto', 'venmo', 'paypal', 'zelle'
    
    memo: text("memo"),
    referenceNumber: varchar("reference_number", { length: 100 }), // Check #, transaction ID, etc.
    
    // Tax classification
    isTaxable: boolean("is_taxable").default(true),
    form1099Box: varchar("form_1099_box", { length: 10 }).default("7"), // Box 7 = Nonemployee compensation
    
    // Audit trail
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    payeeIdx: index("idx_payments_1099_payee").on(table.payeeId),
    yearIdx: index("idx_payments_1099_year").on(table.taxYear),
    dateIdx: index("idx_payments_1099_date").on(table.paymentDate),
    categoryIdx: index("idx_payments_1099_category").on(table.category),
  })
);

export const insertPayment1099Schema = createInsertSchema(payments1099).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment1099 = z.infer<typeof insertPayment1099Schema>;
export type Payment1099 = typeof payments1099.$inferSelect;

// Payment category constants
export const PAYMENT_1099_CATEGORIES = ['contractor', 'referral', 'commission', 'reimbursement', 'bonus'] as const;
export const PAYMENT_1099_METHODS = ['check', 'ach', 'wire', 'cash', 'crypto', 'venmo', 'paypal', 'zelle'] as const;

// ========================
// 1099 COMPLIANCE - ANNUAL FILINGS
// ========================
export const filings1099 = pgTable(
  "filings_1099",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    payeeId: varchar("payee_id").notNull().references(() => payees.id),
    taxYear: integer("tax_year").notNull(),
    
    // Calculated totals
    totalTaxablePaid: decimal("total_taxable_paid", { precision: 12, scale: 2 }).notNull().default("0"),
    thresholdMet: boolean("threshold_met").default(false), // True if >= $600
    
    // Filing status
    filingStatus: varchar("filing_status", { length: 30 }).default("draft"),
    // Statuses: 'draft', 'ready', 'generated', 'transmitted', 'accepted', 'corrected', 'rejected'
    
    // Form details
    pdfUrl: text("pdf_url"), // Generated 1099 PDF
    
    // Timestamps
    generatedAt: timestamp("generated_at"),
    mailedAt: timestamp("mailed_at"),
    transmittedAt: timestamp("transmitted_at"),
    
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    payeeYearIdx: index("idx_filings_1099_payee_year").on(table.payeeId, table.taxYear),
    statusIdx: index("idx_filings_1099_status").on(table.filingStatus),
    thresholdIdx: index("idx_filings_1099_threshold").on(table.thresholdMet),
  })
);

export const insertFiling1099Schema = createInsertSchema(filings1099).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFiling1099 = z.infer<typeof insertFiling1099Schema>;
export type Filing1099 = typeof filings1099.$inferSelect;

// 1099 Filing status constants
export const FILING_1099_STATUSES = ['draft', 'ready', 'generated', 'transmitted', 'accepted', 'corrected', 'rejected'] as const;
export const TAX_THRESHOLD_1099 = 600; // $600 threshold for 1099-NEC

// ========================
// SYSTEM SETTINGS (Admin Controls)
// ========================
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").default(sql`NOW()`),
  updatedBy: varchar("updated_by", { length: 100 }),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// ========================
// PARTNER ACCOUNTS (Sarah, Sid, etc.)
// ========================
export const partnerAccounts = pgTable(
  "partner_accounts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    name: varchar("name", { length: 100 }).notNull(), // Sarah, Sid, etc.
    initialPin: varchar("initial_pin", { length: 3 }).notNull(), // 777, 444
    personalPin: varchar("personal_pin", { length: 4 }), // Set after onboarding
    
    // Onboarding state
    hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
    welcomeModalDismissed: boolean("welcome_modal_dismissed").default(false),
    
    // Access control
    isActive: boolean("is_active").default(true),
    role: varchar("role", { length: 50 }).default("partner"), // partner, manager, admin
    
    // Timestamps
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    initialPinIdx: index("idx_partner_initial_pin").on(table.initialPin),
    personalPinIdx: index("idx_partner_personal_pin").on(table.personalPin),
  })
);

export const insertPartnerAccountSchema = createInsertSchema(partnerAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPartnerAccount = z.infer<typeof insertPartnerAccountSchema>;
export type PartnerAccount = typeof partnerAccounts.$inferSelect;

// ========================
// CONNECTED APPS (App Ecosystem Hub)
// ========================
export const connectedApps = pgTable(
  "connected_apps",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    baseUrl: text("base_url").notNull(),
    
    apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
    apiSecret: text("api_secret").notNull(),
    
    isActive: boolean("is_active").default(true),
    permissions: text("permissions").array().default(sql`ARRAY[]::text[]`),
    
    lastSyncAt: timestamp("last_sync_at"),
    requestCount: integer("request_count").default(0),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    apiKeyIdx: index("idx_connected_apps_api_key").on(table.apiKey),
    nameIdx: index("idx_connected_apps_name").on(table.name),
  })
);

export const insertConnectedAppSchema = createInsertSchema(connectedApps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestCount: true,
  lastSyncAt: true,
});
export type InsertConnectedApp = z.infer<typeof insertConnectedAppSchema>;
export type ConnectedApp = typeof connectedApps.$inferSelect;

// ========================
// APP SYNC LOGS (Track inter-app communication)
// ========================
export const appSyncLogs = pgTable(
  "app_sync_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    appId: varchar("app_id").notNull().references(() => connectedApps.id),
    
    action: varchar("action", { length: 50 }).notNull(),
    direction: varchar("direction", { length: 10 }).notNull(),
    endpoint: text("endpoint"),
    
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    
    status: varchar("status", { length: 20 }).default("success"),
    errorMessage: text("error_message"),
    
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    appIdIdx: index("idx_app_sync_logs_app").on(table.appId),
    actionIdx: index("idx_app_sync_logs_action").on(table.action),
    createdAtIdx: index("idx_app_sync_logs_created").on(table.createdAt),
  })
);

export const insertAppSyncLogSchema = createInsertSchema(appSyncLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertAppSyncLog = z.infer<typeof insertAppSyncLogSchema>;
export type AppSyncLog = typeof appSyncLogs.$inferSelect;

// ========================
// SHARED CODE SNIPPETS (Code sharing between apps)
// ========================
export const sharedCodeSnippets = pgTable(
  "shared_code_snippets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(),
    
    language: varchar("language", { length: 30 }).default("typescript"),
    code: text("code").notNull(),
    
    isPublic: boolean("is_public").default(false),
    sharedWithApps: text("shared_with_apps").array().default(sql`ARRAY[]::text[]`),
    
    version: varchar("version", { length: 20 }).default("1.0.0"),
    usageCount: integer("usage_count").default(0),
    
    createdBy: varchar("created_by", { length: 100 }),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    categoryIdx: index("idx_shared_code_category").on(table.category),
    nameIdx: index("idx_shared_code_name").on(table.name),
  })
);

export const insertSharedCodeSnippetSchema = createInsertSchema(sharedCodeSnippets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});
export type InsertSharedCodeSnippet = z.infer<typeof insertSharedCodeSnippetSchema>;
export type SharedCodeSnippet = typeof sharedCodeSnippets.$inferSelect;

// App permission constants
export const APP_PERMISSIONS = [
  'read:code',
  'write:code',
  'read:data',
  'write:data',
  'read:hallmarks',
  'write:hallmarks',
  'read:orders',
  'write:orders',
  'read:clients',
  'write:clients',
  'sync:all',
] as const;

export const CODE_CATEGORIES = [
  'component',
  'utility',
  'hook',
  'api',
  'schema',
  'style',
  'config',
  'integration',
] as const;

// ========================
// USER ONBOARDING PROFILES (Phase 1: First-Time Experience)
// ========================
export const userOnboardingProfiles = pgTable(
  "user_onboarding_profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id).unique(),
    
    // Business Setup
    businessType: varchar("business_type", { length: 50 }), // corporate, startup, agency, nonprofit, other
    typicalMeetingSize: integer("typical_meeting_size"), // average attendees
    preferredDeliveryWindows: text("preferred_delivery_windows").array().default(sql`ARRAY[]::text[]`), // morning, lunch, afternoon
    preferredVendorCategories: text("preferred_vendor_categories").array().default(sql`ARRAY[]::text[]`), // coffee, donuts, juice, etc.
    
    // Onboarding Progress
    welcomeWizardCompleted: boolean("welcome_wizard_completed").default(false),
    guidedTourCompleted: boolean("guided_tour_completed").default(false),
    guidedTourStep: integer("guided_tour_step").default(0), // current step in tour
    tooltipHintsDismissed: boolean("tooltip_hints_dismissed").default(false),
    
    // Preferences learned over time
    frequentOrderDays: text("frequent_order_days").array().default(sql`ARRAY[]::text[]`), // monday, tuesday, etc.
    averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_onboarding_user").on(table.userId),
  })
);

export const insertUserOnboardingProfileSchema = createInsertSchema(userOnboardingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageOrderValue: true,
});
export type InsertUserOnboardingProfile = z.infer<typeof insertUserOnboardingProfileSchema>;
export type UserOnboardingProfile = typeof userOnboardingProfiles.$inferSelect;

// ========================
// USER FAVORITES (Phase 2: Convenience Features)
// ========================
export const userFavorites = pgTable(
  "user_favorites",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    favoriteType: varchar("favorite_type", { length: 20 }).notNull(), // vendor, item, template
    referenceId: varchar("reference_id", { length: 100 }).notNull(), // vendor slug or item id
    referenceName: varchar("reference_name", { length: 255 }).notNull(), // display name
    referenceData: jsonb("reference_data"), // additional data like image, price, etc.
    
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_favorites_user").on(table.userId),
    typeIdx: index("idx_favorites_type").on(table.favoriteType),
  })
);

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

// ========================
// ORDER TEMPLATES (Phase 2: Saved Custom Orders)
// ========================
export const orderTemplates = pgTable(
  "order_templates",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    name: varchar("name", { length: 100 }).notNull(), // "Monday Morning Coffee Run"
    description: text("description"),
    
    vendorSlug: varchar("vendor_slug", { length: 100 }).notNull(),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    
    items: jsonb("items").$type<Array<{ name: string; quantity: number; price: number }>>().default([]),
    defaultAttendees: integer("default_attendees").default(1),
    defaultGratuityPercent: integer("default_gratuity_percent").default(15),
    
    useCount: integer("use_count").default(0),
    lastUsedAt: timestamp("last_used_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_order_templates_user").on(table.userId),
    vendorIdx: index("idx_order_templates_vendor").on(table.vendorSlug),
  })
);

export const insertOrderTemplateSchema = createInsertSchema(orderTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  useCount: true,
  lastUsedAt: true,
});
export type InsertOrderTemplate = z.infer<typeof insertOrderTemplateSchema>;
export type OrderTemplate = typeof orderTemplates.$inferSelect;

// ========================
// LOYALTY POINTS (Phase 6: Rewards)
// ========================
export const loyaltyAccounts = pgTable(
  "loyalty_accounts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id).unique(),
    
    currentPoints: integer("current_points").default(0),
    lifetimePoints: integer("lifetime_points").default(0),
    tier: varchar("tier", { length: 20 }).default("bronze"), // bronze, silver, gold, platinum
    
    referralCode: varchar("referral_code", { length: 20 }).unique(),
    referredByCode: varchar("referred_by_code", { length: 20 }),
    referralCount: integer("referral_count").default(0),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    userIdx: index("idx_loyalty_user").on(table.userId),
    tierIdx: index("idx_loyalty_tier").on(table.tier),
    referralCodeIdx: index("idx_loyalty_referral").on(table.referralCode),
  })
);

export const insertLoyaltyAccountSchema = createInsertSchema(loyaltyAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lifetimePoints: true,
  referralCount: true,
});
export type InsertLoyaltyAccount = z.infer<typeof insertLoyaltyAccountSchema>;
export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;

// ========================
// LOYALTY TRANSACTIONS (Points history)
// ========================
export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    loyaltyAccountId: varchar("loyalty_account_id").notNull().references(() => loyaltyAccounts.id),
    
    type: varchar("type", { length: 20 }).notNull(), // earn, redeem, bonus, referral
    points: integer("points").notNull(), // positive for earn, negative for redeem
    description: text("description"),
    
    relatedOrderId: varchar("related_order_id"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    accountIdx: index("idx_loyalty_tx_account").on(table.loyaltyAccountId),
    typeIdx: index("idx_loyalty_tx_type").on(table.type),
  })
);

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

// Business type options
export const BUSINESS_TYPES = [
  'corporate',
  'startup',
  'agency',
  'nonprofit',
  'government',
  'healthcare',
  'education',
  'hospitality',
  'other',
] as const;

// Loyalty tier thresholds
export const LOYALTY_TIERS = {
  bronze: { minPoints: 0, discount: 0, perks: ['Basic rewards'] },
  silver: { minPoints: 500, discount: 5, perks: ['5% discount', 'Priority support'] },
  gold: { minPoints: 2000, discount: 10, perks: ['10% discount', 'Priority support', 'Free delivery'] },
  platinum: { minPoints: 5000, discount: 15, perks: ['15% discount', 'Dedicated concierge', 'Free delivery', 'Exclusive events'] },
} as const;

// ========================
// PARTNER API CREDENTIALS (Franchise Integration)
// ========================
export const partnerApiCredentials = pgTable(
  "partner_api_credentials",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to franchise
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    // Credential info
    name: varchar("name", { length: 100 }).notNull(), // "Production Key", "Development Key"
    apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
    apiSecret: text("api_secret").notNull(), // Shown once on creation
    
    // Environment
    environment: varchar("environment", { length: 20 }).default("production"), // "production" | "sandbox"
    
    // Scoped permissions
    scopes: text("scopes").array().default(sql`ARRAY['orders:read']::text[]`),
    
    // Rate limiting
    rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
    rateLimitPerDay: integer("rate_limit_per_day").default(10000),
    
    // Usage tracking
    requestCount: integer("request_count").default(0),
    lastUsedAt: timestamp("last_used_at"),
    
    // Status
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at"),
    
    // Audit
    createdBy: varchar("created_by", { length: 100 }),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    franchiseIdx: index("idx_partner_api_franchise").on(table.franchiseId),
    apiKeyIdx: index("idx_partner_api_key").on(table.apiKey),
    environmentIdx: index("idx_partner_api_env").on(table.environment),
  })
);

export const insertPartnerApiCredentialSchema = createInsertSchema(partnerApiCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestCount: true,
  lastUsedAt: true,
});
export type InsertPartnerApiCredential = z.infer<typeof insertPartnerApiCredentialSchema>;
export type PartnerApiCredential = typeof partnerApiCredentials.$inferSelect;

// ========================
// PARTNER API REQUEST LOGS (Audit Trail)
// ========================
export const partnerApiLogs = pgTable(
  "partner_api_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    credentialId: varchar("credential_id").notNull().references(() => partnerApiCredentials.id),
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    // Request info
    method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE
    endpoint: varchar("endpoint", { length: 255 }).notNull(),
    
    // Response
    statusCode: integer("status_code"),
    responseTimeMs: integer("response_time_ms"),
    
    // Error tracking
    errorCode: varchar("error_code", { length: 50 }),
    errorMessage: text("error_message"),
    
    // Request metadata
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    credentialIdx: index("idx_api_logs_credential").on(table.credentialId),
    franchiseIdx: index("idx_api_logs_franchise").on(table.franchiseId),
    endpointIdx: index("idx_api_logs_endpoint").on(table.endpoint),
    createdAtIdx: index("idx_api_logs_created").on(table.createdAt),
  })
);

export const insertPartnerApiLogSchema = createInsertSchema(partnerApiLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertPartnerApiLog = z.infer<typeof insertPartnerApiLogSchema>;
export type PartnerApiLog = typeof partnerApiLogs.$inferSelect;

// ========================
// FRANCHISE LOCATIONS (Multi-location support)
// ========================
export const franchiseLocations = pgTable(
  "franchise_locations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    franchiseId: varchar("franchise_id").notNull().references(() => franchises.id),
    
    // Location info
    name: varchar("name", { length: 100 }).notNull(), // "Downtown Nashville", "Midtown"
    locationCode: varchar("location_code", { length: 20 }).notNull(), // "NASH-DT-01"
    
    // Address
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 50 }).notNull(),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
    
    // Contact
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    managerName: varchar("manager_name", { length: 100 }),
    
    // Operations
    isActive: boolean("is_active").default(true),
    operatingHours: jsonb("operating_hours").$type<Record<string, { open: string; close: string }>>(),
    deliveryRadius: integer("delivery_radius").default(10), // miles
    
    // Metrics
    totalOrders: integer("total_orders").default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    franchiseIdx: index("idx_locations_franchise").on(table.franchiseId),
    codeIdx: index("idx_locations_code").on(table.locationCode),
    cityIdx: index("idx_locations_city").on(table.city),
  })
);

export const insertFranchiseLocationSchema = createInsertSchema(franchiseLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  totalRevenue: true,
});
export type InsertFranchiseLocation = z.infer<typeof insertFranchiseLocationSchema>;
export type FranchiseLocation = typeof franchiseLocations.$inferSelect;

// Partner API permission scopes
export const PARTNER_API_SCOPES = [
  'orders:read',
  'orders:write',
  'menus:read',
  'menus:write',
  'locations:read',
  'locations:write',
  'billing:read',
  'analytics:read',
  'customers:read',
  'customers:write',
  'drivers:read',
  'drivers:write',
] as const;

export type PartnerApiScope = typeof PARTNER_API_SCOPES[number];
