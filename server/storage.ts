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
  users,
  crmNotes,
  clients,
  crmActivities,
  crmMeetings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
    let query = db.select().from(crmActivities).where(eq(crmActivities.userId, userId));
    
    if (entityType && entityId) {
      query = query.where(
        and(
          eq(crmActivities.entityType, entityType),
          eq(crmActivities.entityId, entityId)
        )
      ) as any;
    }
    
    return await query.orderBy(desc(crmActivities.createdAt));
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
}

export const storage = new DatabaseStorage();
