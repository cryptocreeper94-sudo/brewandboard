import { 
  type User, 
  type InsertUser,
  type CrmNote,
  type InsertCrmNote,
  type Client,
  type InsertClient,
  type CrmActivity,
  type InsertCrmActivity,
  type CrmMeeting,
  type InsertCrmMeeting,
  type ScheduledOrder,
  type InsertScheduledOrder,
  type OrderEvent,
  type InsertOrderEvent,
  type ScannedDocument,
  type InsertScannedDocument,
  type BusinessCard,
  type InsertBusinessCard,
  type MeetingPresentation,
  type InsertMeetingPresentation,
  type Franchise,
  type InsertFranchise,
  type FranchiseCustodyTransfer,
  type InsertFranchiseCustodyTransfer,
  type FranchiseInquiry,
  type InsertFranchiseInquiry,
  type VendorApplication,
  type InsertVendorApplication,
  type Region,
  type InsertRegion,
  type RegionalManager,
  type InsertRegionalManager,
  type TerritoryAssignment,
  type InsertTerritoryAssignment,
  type TeamChatMessage,
  type InsertTeamChatMessage,
  type VirtualMeeting,
  type InsertVirtualMeeting,
  type VirtualAttendee,
  type InsertVirtualAttendee,
  type VirtualSelection,
  type InsertVirtualSelection,
  type VirtualOrder,
  type InsertVirtualOrder,
  type VirtualMeetingEvent,
  type InsertVirtualMeetingEvent,
  type ErrorReport,
  type InsertErrorReport,
  type Payee,
  type InsertPayee,
  type Payment1099,
  type InsertPayment1099,
  type Filing1099,
  type InsertFiling1099,
  users,
  crmNotes,
  clients,
  crmActivities,
  crmMeetings,
  scheduledOrders,
  orderEvents,
  scannedDocuments,
  businessCards,
  meetingPresentations,
  franchises,
  franchiseCustodyTransfers,
  franchiseInquiries,
  vendorApplications,
  regions,
  regionalManagers,
  territoryAssignments,
  teamChatMessages,
  virtualMeetings,
  virtualAttendees,
  virtualSelections,
  virtualOrders,
  virtualMeetingEvents,
  errorReports,
  payees,
  payments1099,
  filings1099,
  TAX_THRESHOLD_1099
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPin(pin: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CRM Notes (Portfolio)
  getNotes(userId: string): Promise<CrmNote[]>;
  getNote(id: string): Promise<CrmNote | undefined>;
  createNote(note: InsertCrmNote): Promise<CrmNote>;
  updateNote(id: string, note: Partial<InsertCrmNote>): Promise<CrmNote>;
  deleteNote(id: string): Promise<void>;
  
  // Clients
  getClients(userId: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Activities
  getActivities(userId: string, entityType?: string, entityId?: string): Promise<CrmActivity[]>;
  createActivity(activity: InsertCrmActivity): Promise<CrmActivity>;
  
  // Meetings
  getMeetings(userId: string): Promise<CrmMeeting[]>;
  getMeeting(id: string): Promise<CrmMeeting | undefined>;
  createMeeting(meeting: InsertCrmMeeting): Promise<CrmMeeting>;
  updateMeeting(id: string, meeting: Partial<InsertCrmMeeting>): Promise<CrmMeeting>;
  deleteMeeting(id: string): Promise<void>;
  
  // Scheduled Orders
  getScheduledOrders(userId: string, startDate?: string, endDate?: string): Promise<ScheduledOrder[]>;
  getScheduledOrder(id: string): Promise<ScheduledOrder | undefined>;
  createScheduledOrder(order: InsertScheduledOrder): Promise<ScheduledOrder>;
  updateScheduledOrder(id: string, order: Partial<InsertScheduledOrder>): Promise<ScheduledOrder>;
  deleteScheduledOrder(id: string): Promise<void>;
  getConcurrentOrdersCount(date: string, time: string, windowHours: number): Promise<number>;
  
  // Order Events
  getOrderEvents(orderId: string): Promise<OrderEvent[]>;
  createOrderEvent(event: InsertOrderEvent): Promise<OrderEvent>;
  
  // Scanned Documents
  getScannedDocuments(userId: string, options?: { category?: string; clientId?: string; search?: string; limit?: number }): Promise<ScannedDocument[]>;
  getScannedDocument(id: string): Promise<ScannedDocument | undefined>;
  createScannedDocument(doc: InsertScannedDocument): Promise<ScannedDocument>;
  updateScannedDocument(id: string, doc: Partial<InsertScannedDocument>): Promise<ScannedDocument>;
  deleteScannedDocument(id: string): Promise<void>;
  searchScannedDocuments(userId: string, query: string): Promise<ScannedDocument[]>;
  
  // Franchises
  getFranchises(options?: { status?: string; ownerId?: string }): Promise<Franchise[]>;
  getFranchise(id: string): Promise<Franchise | undefined>;
  getFranchiseByFranchiseId(franchiseId: string): Promise<Franchise | undefined>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;
  updateFranchise(id: string, franchise: Partial<InsertFranchise>): Promise<Franchise>;
  
  // Franchise Custody Transfers
  getCustodyTransfers(franchiseId: string): Promise<FranchiseCustodyTransfer[]>;
  getCustodyTransfer(id: string): Promise<FranchiseCustodyTransfer | undefined>;
  createCustodyTransfer(transfer: InsertFranchiseCustodyTransfer): Promise<FranchiseCustodyTransfer>;
  updateCustodyTransfer(id: string, transfer: Partial<InsertFranchiseCustodyTransfer>): Promise<FranchiseCustodyTransfer>;
  
  // Franchise Inquiries
  getFranchiseInquiries(options?: { status?: string }): Promise<FranchiseInquiry[]>;
  getFranchiseInquiry(id: string): Promise<FranchiseInquiry | undefined>;
  createFranchiseInquiry(inquiry: InsertFranchiseInquiry): Promise<FranchiseInquiry>;
  updateFranchiseInquiry(id: string, inquiry: Partial<InsertFranchiseInquiry>): Promise<FranchiseInquiry>;
  
  // Vendor Applications
  getVendorApplications(options?: { status?: string }): Promise<VendorApplication[]>;
  getVendorApplication(id: string): Promise<VendorApplication | undefined>;
  createVendorApplication(application: InsertVendorApplication): Promise<VendorApplication>;
  updateVendorApplication(id: string, application: Partial<InsertVendorApplication>): Promise<VendorApplication>;
  
  // Regions
  getRegions(): Promise<Region[]>;
  getRegion(id: string): Promise<Region | undefined>;
  getRegionByCode(code: string): Promise<Region | undefined>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: string, region: Partial<InsertRegion>): Promise<Region>;
  
  // Regional Managers
  getRegionalManagers(options?: { regionId?: string; isActive?: boolean }): Promise<RegionalManager[]>;
  getRegionalManager(id: string): Promise<RegionalManager | undefined>;
  getRegionalManagerByPin(pin: string): Promise<RegionalManager | undefined>;
  getRegionalManagerByEmail(email: string): Promise<RegionalManager | undefined>;
  createRegionalManager(manager: InsertRegionalManager): Promise<RegionalManager>;
  updateRegionalManager(id: string, manager: Partial<InsertRegionalManager>): Promise<RegionalManager>;
  
  // Territory Assignments
  getTerritoryAssignments(managerId: string): Promise<TerritoryAssignment[]>;
  createTerritoryAssignment(assignment: InsertTerritoryAssignment): Promise<TerritoryAssignment>;
  
  // Regional Dashboard Aggregates (tenant-scoped)
  getRegionStats(regionId: string): Promise<{
    totalClients: number;
    totalOrders: number;
    totalRevenue: string;
    activeManagers: number;
  }>;
  
  // Health Check
  checkDatabaseHealth(): Promise<boolean>;
  
  // Team Chat
  getTeamChatMessages(limit?: number): Promise<TeamChatMessage[]>;
  createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage>;
  
  // Virtual Meetings (Multi-Location Host Orders)
  getVirtualMeetings(hostUserId?: string): Promise<VirtualMeeting[]>;
  getVirtualMeeting(id: string): Promise<VirtualMeeting | undefined>;
  getVirtualMeetingByToken(inviteToken: string): Promise<VirtualMeeting | undefined>;
  createVirtualMeeting(meeting: InsertVirtualMeeting): Promise<VirtualMeeting>;
  updateVirtualMeeting(id: string, meeting: Partial<InsertVirtualMeeting>): Promise<VirtualMeeting>;
  deleteVirtualMeeting(id: string): Promise<void>;
  
  // Virtual Attendees
  getVirtualAttendees(meetingId: string): Promise<VirtualAttendee[]>;
  getVirtualAttendee(id: string): Promise<VirtualAttendee | undefined>;
  getVirtualAttendeeByToken(attendeeToken: string): Promise<VirtualAttendee | undefined>;
  createVirtualAttendee(attendee: InsertVirtualAttendee): Promise<VirtualAttendee>;
  updateVirtualAttendee(id: string, attendee: Partial<InsertVirtualAttendee>): Promise<VirtualAttendee>;
  deleteVirtualAttendee(id: string): Promise<void>;
  
  // Virtual Selections
  getVirtualSelection(attendeeId: string): Promise<VirtualSelection | undefined>;
  createVirtualSelection(selection: InsertVirtualSelection): Promise<VirtualSelection>;
  updateVirtualSelection(id: string, selection: Partial<InsertVirtualSelection>): Promise<VirtualSelection>;
  
  // Virtual Orders
  getVirtualOrders(meetingId: string): Promise<VirtualOrder[]>;
  getVirtualOrder(id: string): Promise<VirtualOrder | undefined>;
  createVirtualOrder(order: InsertVirtualOrder): Promise<VirtualOrder>;
  updateVirtualOrder(id: string, order: Partial<InsertVirtualOrder>): Promise<VirtualOrder>;
  
  // Virtual Meeting Events
  getVirtualMeetingEvents(meetingId: string): Promise<VirtualMeetingEvent[]>;
  createVirtualMeetingEvent(event: InsertVirtualMeetingEvent): Promise<VirtualMeetingEvent>;
  
  // Business Cards (Digital Card Designer)
  getBusinessCards(userId: string): Promise<BusinessCard[]>;
  getBusinessCard(id: string): Promise<BusinessCard | undefined>;
  getDefaultBusinessCard(userId: string): Promise<BusinessCard | undefined>;
  createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard>;
  updateBusinessCard(id: string, card: Partial<InsertBusinessCard>): Promise<BusinessCard>;
  deleteBusinessCard(id: string): Promise<void>;
  incrementBusinessCardViews(id: string): Promise<void>;
  
  // Meeting Presentations
  getMeetingPresentations(userId: string): Promise<MeetingPresentation[]>;
  getMeetingPresentation(id: string): Promise<MeetingPresentation | undefined>;
  getMeetingPresentationByLink(shareableLink: string): Promise<MeetingPresentation | undefined>;
  createMeetingPresentation(presentation: InsertMeetingPresentation): Promise<MeetingPresentation>;
  updateMeetingPresentation(id: string, presentation: Partial<InsertMeetingPresentation>): Promise<MeetingPresentation>;
  deleteMeetingPresentation(id: string): Promise<void>;
  incrementPresentationViews(id: string): Promise<void>;
  
  // Error Reports
  getErrorReports(status?: string): Promise<ErrorReport[]>;
  getErrorReport(id: string): Promise<ErrorReport | undefined>;
  createErrorReport(report: InsertErrorReport): Promise<ErrorReport>;
  updateErrorReport(id: string, report: Partial<InsertErrorReport>): Promise<ErrorReport>;
  
  // 1099 Compliance - Payees
  getPayees(options?: { type?: string; status?: string }): Promise<Payee[]>;
  getPayee(id: string): Promise<Payee | undefined>;
  createPayee(payee: InsertPayee): Promise<Payee>;
  updatePayee(id: string, payee: Partial<InsertPayee>): Promise<Payee>;
  deletePayee(id: string): Promise<void>;
  
  // 1099 Compliance - Payments
  getPayments1099(options?: { payeeId?: string; taxYear?: number; category?: string }): Promise<Payment1099[]>;
  getPayment1099(id: string): Promise<Payment1099 | undefined>;
  createPayment1099(payment: InsertPayment1099): Promise<Payment1099>;
  updatePayment1099(id: string, payment: Partial<InsertPayment1099>): Promise<Payment1099>;
  deletePayment1099(id: string): Promise<void>;
  
  // 1099 Compliance - Filings & Summaries
  getFilings1099(taxYear: number): Promise<Filing1099[]>;
  getFiling1099(id: string): Promise<Filing1099 | undefined>;
  getOrCreateFiling1099(payeeId: string, taxYear: number): Promise<Filing1099>;
  updateFiling1099(id: string, filing: Partial<InsertFiling1099>): Promise<Filing1099>;
  recalculatePayeeTotals(payeeId: string, taxYear: number): Promise<Filing1099>;
  get1099Summary(taxYear: number): Promise<{
    totalPayees: number;
    totalTaxablePaid: string;
    payeesOverThreshold: number;
    payeesUnderThreshold: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // ========================
  // USERS
  // ========================
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPin(pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.pin, pin));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ========================
  // CRM NOTES (Portfolio)
  // ========================
  async getNotes(userId: string): Promise<CrmNote[]> {
    return await db
      .select()
      .from(crmNotes)
      .where(eq(crmNotes.userId, userId))
      .orderBy(desc(crmNotes.createdAt));
  }

  async getNote(id: string): Promise<CrmNote | undefined> {
    const [note] = await db.select().from(crmNotes).where(eq(crmNotes.id, id));
    return note || undefined;
  }

  async createNote(note: InsertCrmNote): Promise<CrmNote> {
    const [newNote] = await db.insert(crmNotes).values(note).returning();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertCrmNote>): Promise<CrmNote> {
    const [updated] = await db
      .update(crmNotes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(crmNotes.id, id))
      .returning();
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(crmNotes).where(eq(crmNotes.id, id));
  }

  // ========================
  // CLIENTS
  // ========================
  async getClients(userId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // ========================
  // ACTIVITIES
  // ========================
  async getActivities(userId: string, entityType?: string, entityId?: string): Promise<CrmActivity[]> {
    if (entityType && entityId) {
      return await db
        .select()
        .from(crmActivities)
        .where(
          and(
            eq(crmActivities.userId, userId),
            eq(crmActivities.entityType, entityType),
            eq(crmActivities.entityId, entityId)
          )
        )
        .orderBy(desc(crmActivities.createdAt));
    }
    
    return await db
      .select()
      .from(crmActivities)
      .where(eq(crmActivities.userId, userId))
      .orderBy(desc(crmActivities.createdAt));
  }

  async createActivity(activity: InsertCrmActivity): Promise<CrmActivity> {
    const [newActivity] = await db.insert(crmActivities).values(activity).returning();
    return newActivity;
  }

  // ========================
  // MEETINGS
  // ========================
  async getMeetings(userId: string): Promise<CrmMeeting[]> {
    return await db
      .select()
      .from(crmMeetings)
      .where(eq(crmMeetings.userId, userId))
      .orderBy(desc(crmMeetings.startTime));
  }

  async getMeeting(id: string): Promise<CrmMeeting | undefined> {
    const [meeting] = await db.select().from(crmMeetings).where(eq(crmMeetings.id, id));
    return meeting || undefined;
  }

  async createMeeting(meeting: InsertCrmMeeting): Promise<CrmMeeting> {
    const [newMeeting] = await db.insert(crmMeetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: string, meeting: Partial<InsertCrmMeeting>): Promise<CrmMeeting> {
    const [updated] = await db
      .update(crmMeetings)
      .set({ ...meeting, updatedAt: new Date() })
      .where(eq(crmMeetings.id, id))
      .returning();
    return updated;
  }

  async deleteMeeting(id: string): Promise<void> {
    await db.delete(crmMeetings).where(eq(crmMeetings.id, id));
  }

  // ========================
  // SCHEDULED ORDERS
  // ========================
  async getScheduledOrders(userId: string, startDate?: string, endDate?: string): Promise<ScheduledOrder[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(scheduledOrders)
        .where(
          and(
            eq(scheduledOrders.userId, userId),
            gte(scheduledOrders.scheduledDate, startDate),
            lte(scheduledOrders.scheduledDate, endDate)
          )
        )
        .orderBy(scheduledOrders.scheduledDate, scheduledOrders.scheduledTime);
    }
    
    return await db
      .select()
      .from(scheduledOrders)
      .where(eq(scheduledOrders.userId, userId))
      .orderBy(scheduledOrders.scheduledDate, scheduledOrders.scheduledTime);
  }

  async getScheduledOrder(id: string): Promise<ScheduledOrder | undefined> {
    const [order] = await db.select().from(scheduledOrders).where(eq(scheduledOrders.id, id));
    return order || undefined;
  }

  async createScheduledOrder(order: InsertScheduledOrder): Promise<ScheduledOrder> {
    const [newOrder] = await db.insert(scheduledOrders).values(order as any).returning();
    return newOrder;
  }

  async updateScheduledOrder(id: string, order: Partial<InsertScheduledOrder>): Promise<ScheduledOrder> {
    const [updated] = await db
      .update(scheduledOrders)
      .set({ ...order, updatedAt: new Date() } as any)
      .where(eq(scheduledOrders.id, id))
      .returning();
    return updated;
  }

  async deleteScheduledOrder(id: string): Promise<void> {
    await db.delete(orderEvents).where(eq(orderEvents.orderId, id));
    await db.delete(scheduledOrders).where(eq(scheduledOrders.id, id));
  }

  async getConcurrentOrdersCount(date: string, time: string, windowHours: number): Promise<number> {
    const targetDateTime = new Date(`${date}T${time}`);
    const windowStart = new Date(targetDateTime.getTime() - (windowHours / 2) * 60 * 60 * 1000);
    const windowEnd = new Date(targetDateTime.getTime() + (windowHours / 2) * 60 * 60 * 1000);
    
    const windowStartDate = windowStart.toISOString().split('T')[0];
    const windowEndDate = windowEnd.toISOString().split('T')[0];
    const windowStartTime = windowStart.toTimeString().slice(0, 5);
    const windowEndTime = windowEnd.toTimeString().slice(0, 5);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(scheduledOrders)
      .where(
        and(
          or(
            eq(scheduledOrders.status, 'scheduled'),
            eq(scheduledOrders.status, 'confirmed'),
            eq(scheduledOrders.status, 'preparing'),
            eq(scheduledOrders.status, 'out_for_delivery')
          ),
          sql`(${scheduledOrders.scheduledDate} || 'T' || ${scheduledOrders.scheduledTime})::timestamp 
              BETWEEN ${windowStart.toISOString()}::timestamp 
              AND ${windowEnd.toISOString()}::timestamp`
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  // ========================
  // ORDER EVENTS
  // ========================
  async getOrderEvents(orderId: string): Promise<OrderEvent[]> {
    return await db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(desc(orderEvents.createdAt));
  }

  async createOrderEvent(event: InsertOrderEvent): Promise<OrderEvent> {
    const [newEvent] = await db.insert(orderEvents).values(event).returning();
    return newEvent;
  }

  // ========================
  // SCANNED DOCUMENTS
  // ========================
  async getScannedDocuments(
    userId: string, 
    options?: { category?: string; clientId?: string; search?: string; limit?: number }
  ): Promise<ScannedDocument[]> {
    let query = db.select().from(scannedDocuments).where(eq(scannedDocuments.userId, userId));
    
    const conditions = [eq(scannedDocuments.userId, userId)];
    
    if (options?.category) {
      conditions.push(eq(scannedDocuments.category, options.category));
    }
    
    if (options?.clientId) {
      conditions.push(eq(scannedDocuments.clientId, options.clientId));
    }
    
    if (options?.search) {
      conditions.push(
        or(
          ilike(scannedDocuments.title, `%${options.search}%`),
          ilike(scannedDocuments.extractedText, `%${options.search}%`)
        )!
      );
    }
    
    const results = await db
      .select()
      .from(scannedDocuments)
      .where(and(...conditions))
      .orderBy(desc(scannedDocuments.createdAt))
      .limit(options?.limit || 100);
    
    return results;
  }

  async getScannedDocument(id: string): Promise<ScannedDocument | undefined> {
    const [doc] = await db.select().from(scannedDocuments).where(eq(scannedDocuments.id, id));
    return doc || undefined;
  }

  async createScannedDocument(doc: InsertScannedDocument): Promise<ScannedDocument> {
    const [newDoc] = await db.insert(scannedDocuments).values(doc).returning();
    return newDoc;
  }

  async updateScannedDocument(id: string, doc: Partial<InsertScannedDocument>): Promise<ScannedDocument> {
    const [updated] = await db
      .update(scannedDocuments)
      .set({ ...doc, updatedAt: new Date() })
      .where(eq(scannedDocuments.id, id))
      .returning();
    return updated;
  }

  async deleteScannedDocument(id: string): Promise<void> {
    await db.delete(scannedDocuments).where(eq(scannedDocuments.id, id));
  }

  async searchScannedDocuments(userId: string, query: string): Promise<ScannedDocument[]> {
    return await db
      .select()
      .from(scannedDocuments)
      .where(
        and(
          eq(scannedDocuments.userId, userId),
          or(
            ilike(scannedDocuments.title, `%${query}%`),
            ilike(scannedDocuments.extractedText, `%${query}%`)
          )
        )
      )
      .orderBy(desc(scannedDocuments.createdAt))
      .limit(50);
  }
  
  // ========================
  // FRANCHISES
  // ========================
  async getFranchises(options?: { status?: string; ownerId?: string }): Promise<Franchise[]> {
    const conditions = [];
    
    if (options?.status) {
      conditions.push(eq(franchises.status, options.status));
    }
    if (options?.ownerId) {
      conditions.push(eq(franchises.ownerId, options.ownerId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(franchises).where(and(...conditions)).orderBy(desc(franchises.createdAt));
    }
    return await db.select().from(franchises).orderBy(desc(franchises.createdAt));
  }

  async getFranchise(id: string): Promise<Franchise | undefined> {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.id, id));
    return franchise || undefined;
  }

  async getFranchiseByFranchiseId(franchiseId: string): Promise<Franchise | undefined> {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.franchiseId, franchiseId));
    return franchise || undefined;
  }

  async createFranchise(franchise: InsertFranchise): Promise<Franchise> {
    const [newFranchise] = await db.insert(franchises).values(franchise).returning();
    return newFranchise;
  }

  async updateFranchise(id: string, franchise: Partial<InsertFranchise>): Promise<Franchise> {
    const [updated] = await db
      .update(franchises)
      .set({ ...franchise, updatedAt: new Date() })
      .where(eq(franchises.id, id))
      .returning();
    return updated;
  }

  // ========================
  // FRANCHISE CUSTODY TRANSFERS
  // ========================
  async getCustodyTransfers(franchiseId: string): Promise<FranchiseCustodyTransfer[]> {
    return await db
      .select()
      .from(franchiseCustodyTransfers)
      .where(eq(franchiseCustodyTransfers.franchiseId, franchiseId))
      .orderBy(desc(franchiseCustodyTransfers.createdAt));
  }

  async getCustodyTransfer(id: string): Promise<FranchiseCustodyTransfer | undefined> {
    const [transfer] = await db.select().from(franchiseCustodyTransfers).where(eq(franchiseCustodyTransfers.id, id));
    return transfer || undefined;
  }

  async createCustodyTransfer(transfer: InsertFranchiseCustodyTransfer): Promise<FranchiseCustodyTransfer> {
    const [newTransfer] = await db.insert(franchiseCustodyTransfers).values([transfer]).returning();
    return newTransfer;
  }

  async updateCustodyTransfer(id: string, transfer: Partial<Omit<InsertFranchiseCustodyTransfer, 'royaltyTerms'>> & { royaltyTerms?: { type: string; percent?: string; amount?: string } | null }): Promise<FranchiseCustodyTransfer> {
    const [updated] = await db
      .update(franchiseCustodyTransfers)
      .set(transfer as any)
      .where(eq(franchiseCustodyTransfers.id, id))
      .returning();
    return updated;
  }

  // ========================
  // FRANCHISE INQUIRIES
  // ========================
  async getFranchiseInquiries(options?: { status?: string }): Promise<FranchiseInquiry[]> {
    if (options?.status) {
      return await db
        .select()
        .from(franchiseInquiries)
        .where(eq(franchiseInquiries.status, options.status))
        .orderBy(desc(franchiseInquiries.createdAt));
    }
    return await db.select().from(franchiseInquiries).orderBy(desc(franchiseInquiries.createdAt));
  }

  async getFranchiseInquiry(id: string): Promise<FranchiseInquiry | undefined> {
    const [inquiry] = await db.select().from(franchiseInquiries).where(eq(franchiseInquiries.id, id));
    return inquiry || undefined;
  }

  async createFranchiseInquiry(inquiry: InsertFranchiseInquiry): Promise<FranchiseInquiry> {
    const [newInquiry] = await db.insert(franchiseInquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateFranchiseInquiry(id: string, inquiry: Partial<InsertFranchiseInquiry>): Promise<FranchiseInquiry> {
    const [updated] = await db
      .update(franchiseInquiries)
      .set({ ...inquiry, updatedAt: new Date() })
      .where(eq(franchiseInquiries.id, id))
      .returning();
    return updated;
  }

  // ========================
  // VENDOR APPLICATIONS
  // ========================
  async getVendorApplications(options?: { status?: string }): Promise<VendorApplication[]> {
    if (options?.status) {
      return await db
        .select()
        .from(vendorApplications)
        .where(eq(vendorApplications.status, options.status))
        .orderBy(desc(vendorApplications.createdAt));
    }
    return await db.select().from(vendorApplications).orderBy(desc(vendorApplications.createdAt));
  }

  async getVendorApplication(id: string): Promise<VendorApplication | undefined> {
    const [application] = await db.select().from(vendorApplications).where(eq(vendorApplications.id, id));
    return application || undefined;
  }

  async createVendorApplication(application: InsertVendorApplication): Promise<VendorApplication> {
    const [newApplication] = await db.insert(vendorApplications).values(application).returning();
    return newApplication;
  }

  async updateVendorApplication(id: string, application: Partial<InsertVendorApplication>): Promise<VendorApplication> {
    const [updated] = await db
      .update(vendorApplications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(vendorApplications.id, id))
      .returning();
    return updated;
  }

  // ========================
  // REGIONS
  // ========================
  async getRegions(): Promise<Region[]> {
    return await db.select().from(regions).orderBy(regions.name);
  }

  async getRegion(id: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region || undefined;
  }

  async getRegionByCode(code: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.code, code));
    return region || undefined;
  }

  async createRegion(region: InsertRegion): Promise<Region> {
    const [newRegion] = await db.insert(regions).values(region).returning();
    return newRegion;
  }

  async updateRegion(id: string, region: Partial<InsertRegion>): Promise<Region> {
    const [updated] = await db
      .update(regions)
      .set({ ...region, updatedAt: new Date() })
      .where(eq(regions.id, id))
      .returning();
    return updated;
  }

  // ========================
  // REGIONAL MANAGERS
  // ========================
  async getRegionalManagers(options?: { regionId?: string; isActive?: boolean }): Promise<RegionalManager[]> {
    let query = db.select().from(regionalManagers);
    
    if (options?.regionId && options?.isActive !== undefined) {
      return await db
        .select()
        .from(regionalManagers)
        .where(and(
          eq(regionalManagers.regionId, options.regionId),
          eq(regionalManagers.isActive, options.isActive)
        ))
        .orderBy(regionalManagers.name);
    } else if (options?.regionId) {
      return await db
        .select()
        .from(regionalManagers)
        .where(eq(regionalManagers.regionId, options.regionId))
        .orderBy(regionalManagers.name);
    } else if (options?.isActive !== undefined) {
      return await db
        .select()
        .from(regionalManagers)
        .where(eq(regionalManagers.isActive, options.isActive))
        .orderBy(regionalManagers.name);
    }
    
    return await db.select().from(regionalManagers).orderBy(regionalManagers.name);
  }

  async getRegionalManager(id: string): Promise<RegionalManager | undefined> {
    const [manager] = await db.select().from(regionalManagers).where(eq(regionalManagers.id, id));
    return manager || undefined;
  }

  async getRegionalManagerByPin(pin: string): Promise<RegionalManager | undefined> {
    const [manager] = await db.select().from(regionalManagers).where(eq(regionalManagers.pin, pin));
    return manager || undefined;
  }

  async getRegionalManagerByEmail(email: string): Promise<RegionalManager | undefined> {
    const [manager] = await db.select().from(regionalManagers).where(eq(regionalManagers.email, email));
    return manager || undefined;
  }

  async createRegionalManager(manager: InsertRegionalManager): Promise<RegionalManager> {
    const [newManager] = await db.insert(regionalManagers).values(manager).returning();
    return newManager;
  }

  async updateRegionalManager(id: string, manager: Partial<InsertRegionalManager>): Promise<RegionalManager> {
    const [updated] = await db
      .update(regionalManagers)
      .set({ ...manager, updatedAt: new Date() })
      .where(eq(regionalManagers.id, id))
      .returning();
    return updated;
  }

  // ========================
  // TERRITORY ASSIGNMENTS
  // ========================
  async getTerritoryAssignments(managerId: string): Promise<TerritoryAssignment[]> {
    return await db
      .select()
      .from(territoryAssignments)
      .where(eq(territoryAssignments.managerId, managerId));
  }

  async createTerritoryAssignment(assignment: InsertTerritoryAssignment): Promise<TerritoryAssignment> {
    const [newAssignment] = await db.insert(territoryAssignments).values(assignment).returning();
    return newAssignment;
  }

  // ========================
  // REGIONAL DASHBOARD AGGREGATES
  // ========================
  async getRegionStats(regionId: string): Promise<{
    totalClients: number;
    totalOrders: number;
    totalRevenue: string;
    activeManagers: number;
  }> {
    // Get active managers in this region
    const managers = await this.getRegionalManagers({ regionId, isActive: true });
    
    // For now, return placeholder stats - in production, this would aggregate from tenant data
    // Each manager has their own userId which provides tenant separation
    return {
      totalClients: 0,
      totalOrders: 0,
      totalRevenue: "0.00",
      activeManagers: managers.length
    };
  }

  // ========================
  // HEALTH CHECK
  // ========================
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  // ========================
  // TEAM CHAT
  // ========================
  async getTeamChatMessages(limit: number = 50): Promise<TeamChatMessage[]> {
    return await db
      .select()
      .from(teamChatMessages)
      .orderBy(desc(teamChatMessages.createdAt))
      .limit(limit);
  }

  async createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage> {
    const [newMessage] = await db.insert(teamChatMessages).values(message).returning();
    return newMessage;
  }

  // ========================
  // VIRTUAL MEETINGS
  // ========================
  async getVirtualMeetings(hostUserId?: string): Promise<VirtualMeeting[]> {
    if (hostUserId) {
      return await db
        .select()
        .from(virtualMeetings)
        .where(eq(virtualMeetings.hostUserId, hostUserId))
        .orderBy(desc(virtualMeetings.createdAt));
    }
    return await db.select().from(virtualMeetings).orderBy(desc(virtualMeetings.createdAt));
  }

  async getVirtualMeeting(id: string): Promise<VirtualMeeting | undefined> {
    const [meeting] = await db.select().from(virtualMeetings).where(eq(virtualMeetings.id, id));
    return meeting || undefined;
  }

  async getVirtualMeetingByToken(inviteToken: string): Promise<VirtualMeeting | undefined> {
    const [meeting] = await db.select().from(virtualMeetings).where(eq(virtualMeetings.inviteToken, inviteToken));
    return meeting || undefined;
  }

  async createVirtualMeeting(meeting: InsertVirtualMeeting): Promise<VirtualMeeting> {
    const [newMeeting] = await db.insert(virtualMeetings).values(meeting).returning();
    return newMeeting;
  }

  async updateVirtualMeeting(id: string, meeting: Partial<InsertVirtualMeeting>): Promise<VirtualMeeting> {
    const [updated] = await db
      .update(virtualMeetings)
      .set({ ...meeting, updatedAt: new Date() })
      .where(eq(virtualMeetings.id, id))
      .returning();
    return updated;
  }

  async deleteVirtualMeeting(id: string): Promise<void> {
    // Delete all related records first
    const attendees = await this.getVirtualAttendees(id);
    for (const attendee of attendees) {
      await db.delete(virtualSelections).where(eq(virtualSelections.attendeeId, attendee.id));
    }
    await db.delete(virtualOrders).where(eq(virtualOrders.meetingId, id));
    await db.delete(virtualMeetingEvents).where(eq(virtualMeetingEvents.meetingId, id));
    await db.delete(virtualAttendees).where(eq(virtualAttendees.meetingId, id));
    await db.delete(virtualMeetings).where(eq(virtualMeetings.id, id));
  }

  // ========================
  // VIRTUAL ATTENDEES
  // ========================
  async getVirtualAttendees(meetingId: string): Promise<VirtualAttendee[]> {
    return await db
      .select()
      .from(virtualAttendees)
      .where(eq(virtualAttendees.meetingId, meetingId))
      .orderBy(virtualAttendees.name);
  }

  async getVirtualAttendee(id: string): Promise<VirtualAttendee | undefined> {
    const [attendee] = await db.select().from(virtualAttendees).where(eq(virtualAttendees.id, id));
    return attendee || undefined;
  }

  async getVirtualAttendeeByToken(attendeeToken: string): Promise<VirtualAttendee | undefined> {
    const [attendee] = await db.select().from(virtualAttendees).where(eq(virtualAttendees.attendeeToken, attendeeToken));
    return attendee || undefined;
  }

  async createVirtualAttendee(attendee: InsertVirtualAttendee): Promise<VirtualAttendee> {
    const [newAttendee] = await db.insert(virtualAttendees).values(attendee).returning();
    return newAttendee;
  }

  async updateVirtualAttendee(id: string, attendee: Partial<InsertVirtualAttendee>): Promise<VirtualAttendee> {
    const [updated] = await db
      .update(virtualAttendees)
      .set(attendee)
      .where(eq(virtualAttendees.id, id))
      .returning();
    return updated;
  }

  async deleteVirtualAttendee(id: string): Promise<void> {
    await db.delete(virtualSelections).where(eq(virtualSelections.attendeeId, id));
    await db.delete(virtualOrders).where(eq(virtualOrders.attendeeId, id));
    await db.delete(virtualAttendees).where(eq(virtualAttendees.id, id));
  }

  // ========================
  // VIRTUAL SELECTIONS
  // ========================
  async getVirtualSelection(attendeeId: string): Promise<VirtualSelection | undefined> {
    const [selection] = await db.select().from(virtualSelections).where(eq(virtualSelections.attendeeId, attendeeId));
    return selection || undefined;
  }

  async createVirtualSelection(selection: InsertVirtualSelection): Promise<VirtualSelection> {
    const [newSelection] = await db.insert(virtualSelections).values(selection as any).returning();
    return newSelection;
  }

  async updateVirtualSelection(id: string, selection: Partial<InsertVirtualSelection>): Promise<VirtualSelection> {
    const [updated] = await db
      .update(virtualSelections)
      .set({ ...selection, updatedAt: new Date() } as any)
      .where(eq(virtualSelections.id, id))
      .returning();
    return updated;
  }

  // ========================
  // VIRTUAL ORDERS
  // ========================
  async getVirtualOrders(meetingId: string): Promise<VirtualOrder[]> {
    return await db
      .select()
      .from(virtualOrders)
      .where(eq(virtualOrders.meetingId, meetingId))
      .orderBy(virtualOrders.createdAt);
  }

  async getVirtualOrder(id: string): Promise<VirtualOrder | undefined> {
    const [order] = await db.select().from(virtualOrders).where(eq(virtualOrders.id, id));
    return order || undefined;
  }

  async createVirtualOrder(order: InsertVirtualOrder): Promise<VirtualOrder> {
    const [newOrder] = await db.insert(virtualOrders).values(order).returning();
    return newOrder;
  }

  async updateVirtualOrder(id: string, order: Partial<InsertVirtualOrder>): Promise<VirtualOrder> {
    const [updated] = await db
      .update(virtualOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(virtualOrders.id, id))
      .returning();
    return updated;
  }

  // ========================
  // VIRTUAL MEETING EVENTS
  // ========================
  async getVirtualMeetingEvents(meetingId: string): Promise<VirtualMeetingEvent[]> {
    return await db
      .select()
      .from(virtualMeetingEvents)
      .where(eq(virtualMeetingEvents.meetingId, meetingId))
      .orderBy(desc(virtualMeetingEvents.createdAt));
  }

  async createVirtualMeetingEvent(event: InsertVirtualMeetingEvent): Promise<VirtualMeetingEvent> {
    const [newEvent] = await db.insert(virtualMeetingEvents).values(event).returning();
    return newEvent;
  }

  // ========================
  // BUSINESS CARDS
  // ========================
  async getBusinessCards(userId: string): Promise<BusinessCard[]> {
    return await db
      .select()
      .from(businessCards)
      .where(eq(businessCards.userId, userId))
      .orderBy(desc(businessCards.createdAt));
  }

  async getBusinessCard(id: string): Promise<BusinessCard | undefined> {
    const [card] = await db.select().from(businessCards).where(eq(businessCards.id, id));
    return card || undefined;
  }

  async getDefaultBusinessCard(userId: string): Promise<BusinessCard | undefined> {
    const [card] = await db
      .select()
      .from(businessCards)
      .where(and(eq(businessCards.userId, userId), eq(businessCards.isDefault, true)));
    return card || undefined;
  }

  async createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard> {
    const [newCard] = await db.insert(businessCards).values(card).returning();
    return newCard;
  }

  async updateBusinessCard(id: string, card: Partial<InsertBusinessCard>): Promise<BusinessCard> {
    const [updated] = await db
      .update(businessCards)
      .set({ ...card, updatedAt: new Date() })
      .where(eq(businessCards.id, id))
      .returning();
    return updated;
  }

  async deleteBusinessCard(id: string): Promise<void> {
    await db.delete(businessCards).where(eq(businessCards.id, id));
  }

  async incrementBusinessCardViews(id: string): Promise<void> {
    await db
      .update(businessCards)
      .set({ viewCount: sql`${businessCards.viewCount} + 1` })
      .where(eq(businessCards.id, id));
  }

  // ========================
  // MEETING PRESENTATIONS
  // ========================
  async getMeetingPresentations(userId: string): Promise<MeetingPresentation[]> {
    return await db
      .select()
      .from(meetingPresentations)
      .where(eq(meetingPresentations.userId, userId))
      .orderBy(desc(meetingPresentations.createdAt));
  }

  async getMeetingPresentation(id: string): Promise<MeetingPresentation | undefined> {
    const [presentation] = await db.select().from(meetingPresentations).where(eq(meetingPresentations.id, id));
    return presentation || undefined;
  }

  async getMeetingPresentationByLink(shareableLink: string): Promise<MeetingPresentation | undefined> {
    const [presentation] = await db
      .select()
      .from(meetingPresentations)
      .where(eq(meetingPresentations.shareableLink, shareableLink));
    return presentation || undefined;
  }

  async createMeetingPresentation(presentation: InsertMeetingPresentation): Promise<MeetingPresentation> {
    const shareableLink = `pres-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const [newPresentation] = await db
      .insert(meetingPresentations)
      .values({ ...presentation, shareableLink })
      .returning();
    return newPresentation;
  }

  async updateMeetingPresentation(id: string, presentation: Partial<InsertMeetingPresentation>): Promise<MeetingPresentation> {
    const [updated] = await db
      .update(meetingPresentations)
      .set({ ...presentation, updatedAt: new Date() })
      .where(eq(meetingPresentations.id, id))
      .returning();
    return updated;
  }

  async deleteMeetingPresentation(id: string): Promise<void> {
    await db.delete(meetingPresentations).where(eq(meetingPresentations.id, id));
  }

  async incrementPresentationViews(id: string): Promise<void> {
    await db
      .update(meetingPresentations)
      .set({ viewCount: sql`${meetingPresentations.viewCount} + 1` })
      .where(eq(meetingPresentations.id, id));
  }

  // ========================
  // ERROR REPORTS
  // ========================
  async getErrorReports(status?: string): Promise<ErrorReport[]> {
    if (status) {
      return await db
        .select()
        .from(errorReports)
        .where(eq(errorReports.status, status))
        .orderBy(desc(errorReports.createdAt));
    }
    return await db
      .select()
      .from(errorReports)
      .orderBy(desc(errorReports.createdAt));
  }

  async getErrorReport(id: string): Promise<ErrorReport | undefined> {
    const [report] = await db.select().from(errorReports).where(eq(errorReports.id, id));
    return report || undefined;
  }

  async createErrorReport(report: InsertErrorReport): Promise<ErrorReport> {
    const [newReport] = await db.insert(errorReports).values(report).returning();
    return newReport;
  }

  async updateErrorReport(id: string, report: Partial<InsertErrorReport>): Promise<ErrorReport> {
    const updateData: any = { ...report };
    if (report.status === 'resolved' || report.status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    const [updated] = await db
      .update(errorReports)
      .set(updateData)
      .where(eq(errorReports.id, id))
      .returning();
    return updated;
  }

  // ========================
  // 1099 COMPLIANCE - PAYEES
  // ========================
  async getPayees(options?: { type?: string; status?: string }): Promise<Payee[]> {
    let conditions = [];
    if (options?.type) {
      conditions.push(eq(payees.type, options.type));
    }
    if (options?.status) {
      conditions.push(eq(payees.status, options.status));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(payees)
        .where(and(...conditions))
        .orderBy(desc(payees.createdAt));
    }
    return await db.select().from(payees).orderBy(desc(payees.createdAt));
  }

  async getPayee(id: string): Promise<Payee | undefined> {
    const [payee] = await db.select().from(payees).where(eq(payees.id, id));
    return payee || undefined;
  }

  async createPayee(payee: InsertPayee): Promise<Payee> {
    const [newPayee] = await db.insert(payees).values(payee).returning();
    return newPayee;
  }

  async updatePayee(id: string, payee: Partial<InsertPayee>): Promise<Payee> {
    const [updated] = await db
      .update(payees)
      .set({ ...payee, updatedAt: new Date() })
      .where(eq(payees.id, id))
      .returning();
    return updated;
  }

  async deletePayee(id: string): Promise<void> {
    await db.delete(payees).where(eq(payees.id, id));
  }

  // ========================
  // 1099 COMPLIANCE - PAYMENTS
  // ========================
  async getPayments1099(options?: { payeeId?: string; taxYear?: number; category?: string }): Promise<Payment1099[]> {
    let conditions = [];
    if (options?.payeeId) {
      conditions.push(eq(payments1099.payeeId, options.payeeId));
    }
    if (options?.taxYear) {
      conditions.push(eq(payments1099.taxYear, options.taxYear));
    }
    if (options?.category) {
      conditions.push(eq(payments1099.category, options.category));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(payments1099)
        .where(and(...conditions))
        .orderBy(desc(payments1099.paymentDate));
    }
    return await db.select().from(payments1099).orderBy(desc(payments1099.paymentDate));
  }

  async getPayment1099(id: string): Promise<Payment1099 | undefined> {
    const [payment] = await db.select().from(payments1099).where(eq(payments1099.id, id));
    return payment || undefined;
  }

  async createPayment1099(payment: InsertPayment1099): Promise<Payment1099> {
    const [newPayment] = await db.insert(payments1099).values(payment).returning();
    // Recalculate totals for the payee's filing
    await this.recalculatePayeeTotals(payment.payeeId, payment.taxYear);
    return newPayment;
  }

  async updatePayment1099(id: string, payment: Partial<InsertPayment1099>): Promise<Payment1099> {
    const [updated] = await db
      .update(payments1099)
      .set({ ...payment, updatedAt: new Date() })
      .where(eq(payments1099.id, id))
      .returning();
    // Recalculate if payee or year changed
    if (updated) {
      await this.recalculatePayeeTotals(updated.payeeId, updated.taxYear);
    }
    return updated;
  }

  async deletePayment1099(id: string): Promise<void> {
    const [payment] = await db.select().from(payments1099).where(eq(payments1099.id, id));
    if (payment) {
      await db.delete(payments1099).where(eq(payments1099.id, id));
      await this.recalculatePayeeTotals(payment.payeeId, payment.taxYear);
    }
  }

  // ========================
  // 1099 COMPLIANCE - FILINGS
  // ========================
  async getFilings1099(taxYear: number): Promise<Filing1099[]> {
    return await db
      .select()
      .from(filings1099)
      .where(eq(filings1099.taxYear, taxYear))
      .orderBy(desc(filings1099.totalTaxablePaid));
  }

  async getFiling1099(id: string): Promise<Filing1099 | undefined> {
    const [filing] = await db.select().from(filings1099).where(eq(filings1099.id, id));
    return filing || undefined;
  }

  async getOrCreateFiling1099(payeeId: string, taxYear: number): Promise<Filing1099> {
    const [existing] = await db
      .select()
      .from(filings1099)
      .where(and(eq(filings1099.payeeId, payeeId), eq(filings1099.taxYear, taxYear)));
    
    if (existing) return existing;
    
    const [newFiling] = await db
      .insert(filings1099)
      .values({
        payeeId,
        taxYear,
        totalTaxablePaid: "0",
        thresholdMet: false,
        filingStatus: "draft"
      })
      .returning();
    return newFiling;
  }

  async updateFiling1099(id: string, filing: Partial<InsertFiling1099>): Promise<Filing1099> {
    const [updated] = await db
      .update(filings1099)
      .set({ ...filing, updatedAt: new Date() })
      .where(eq(filings1099.id, id))
      .returning();
    return updated;
  }

  async recalculatePayeeTotals(payeeId: string, taxYear: number): Promise<Filing1099> {
    // Get or create filing record
    const filing = await this.getOrCreateFiling1099(payeeId, taxYear);
    
    // Sum all taxable payments for this payee/year
    const result = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(CASE WHEN ${payments1099.isTaxable} THEN ${payments1099.amount} ELSE 0 END), 0)` 
      })
      .from(payments1099)
      .where(and(
        eq(payments1099.payeeId, payeeId),
        eq(payments1099.taxYear, taxYear)
      ));
    
    const totalTaxablePaid = result[0]?.total || "0";
    const thresholdMet = parseFloat(totalTaxablePaid) >= TAX_THRESHOLD_1099;
    
    const [updated] = await db
      .update(filings1099)
      .set({ 
        totalTaxablePaid, 
        thresholdMet,
        updatedAt: new Date()
      })
      .where(eq(filings1099.id, filing.id))
      .returning();
    
    return updated;
  }

  async get1099Summary(taxYear: number): Promise<{
    totalPayees: number;
    totalTaxablePaid: string;
    payeesOverThreshold: number;
    payeesUnderThreshold: number;
  }> {
    const filings = await this.getFilings1099(taxYear);
    
    let totalTaxablePaid = 0;
    let payeesOverThreshold = 0;
    let payeesUnderThreshold = 0;
    
    for (const filing of filings) {
      const amount = parseFloat(filing.totalTaxablePaid || "0");
      totalTaxablePaid += amount;
      if (amount >= TAX_THRESHOLD_1099) {
        payeesOverThreshold++;
      } else if (amount > 0) {
        payeesUnderThreshold++;
      }
    }
    
    return {
      totalPayees: filings.length,
      totalTaxablePaid: totalTaxablePaid.toFixed(2),
      payeesOverThreshold,
      payeesUnderThreshold
    };
  }
}

export const storage = new DatabaseStorage();
