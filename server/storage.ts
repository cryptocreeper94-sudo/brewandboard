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
  users,
  crmNotes,
  clients,
  crmActivities,
  crmMeetings,
  scheduledOrders,
  orderEvents,
  scannedDocuments
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
}

export const storage = new DatabaseStorage();
