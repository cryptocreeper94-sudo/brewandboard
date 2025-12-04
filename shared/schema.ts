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
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0.00"),
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
// CONSTANTS
// ========================
export const MINIMUM_ORDER_LEAD_TIME_HOURS = 2;
export const ORDER_STATUSES = [
  'scheduled',
  'confirmed', 
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
] as const;
export const FULFILLMENT_CHANNELS = ['manual', 'doordash', 'ubereats', 'direct'] as const;
