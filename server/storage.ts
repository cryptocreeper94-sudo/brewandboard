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
  type Franchise,
  type InsertFranchise,
  type FranchiseCustodyTransfer,
  type InsertFranchiseCustodyTransfer,
  type FranchiseInquiry,
  type InsertFranchiseInquiry,
  type Region,
  type InsertRegion,
  type RegionalManager,
  type InsertRegionalManager,
  type TerritoryAssignment,
  type InsertTerritoryAssignment,
  type TeamChatMessage,
  type InsertTeamChatMessage,
  users,
  crmNotes,
  clients,
  crmActivities,
  crmMeetings,
  scheduledOrders,
  orderEvents,
  scannedDocuments,
  franchises,
  franchiseCustodyTransfers,
  franchiseInquiries,
  regions,
  regionalManagers,
  territoryAssignments,
  teamChatMessages
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
}

export const storage = new DatabaseStorage();
