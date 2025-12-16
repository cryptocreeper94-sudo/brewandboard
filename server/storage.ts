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
  type SystemSetting,
  type InsertSystemSetting,
  type PartnerAccount,
  type InsertPartnerAccount,
  type ConnectedApp,
  type InsertConnectedApp,
  type AppSyncLog,
  type InsertAppSyncLog,
  type SharedCodeSnippet,
  type InsertSharedCodeSnippet,
  type Subscription,
  type InsertSubscription,
  type UserOnboardingProfile,
  type InsertUserOnboardingProfile,
  type UserFavorite,
  type InsertUserFavorite,
  type OrderTemplate,
  type InsertOrderTemplate,
  type LoyaltyAccount,
  type InsertLoyaltyAccount,
  type PartnerApiCredential,
  type InsertPartnerApiCredential,
  type PartnerApiLog,
  type InsertPartnerApiLog,
  type FranchiseLocation,
  type InsertFranchiseLocation,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type ServiceArea,
  type InsertServiceArea,
  type WhiteGlovePricingTier,
  type InsertWhiteGlovePricingTier,
  type OneOffOrder,
  type InsertOneOffOrder,
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
  systemSettings,
  partnerAccounts,
  connectedApps,
  appSyncLogs,
  sharedCodeSnippets,
  subscriptions,
  userOnboardingProfiles,
  userFavorites,
  orderTemplates,
  loyaltyAccounts,
  loyaltyTransactions,
  partnerApiCredentials,
  partnerApiLogs,
  franchiseLocations,
  serviceAreas,
  whiteGlovePricingTiers,
  oneOffOrders,
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
  getAllScheduledOrders(regionId?: string, status?: string): Promise<ScheduledOrder[]>;
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
  
  // System Settings (Admin Controls)
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string, updatedBy?: string): Promise<SystemSetting>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  
  // Partner Accounts
  getPartnerAccounts(): Promise<PartnerAccount[]>;
  getPartnerAccount(id: string): Promise<PartnerAccount | undefined>;
  getPartnerAccountByInitialPin(pin: string): Promise<PartnerAccount | undefined>;
  getPartnerAccountByPersonalPin(pin: string): Promise<PartnerAccount | undefined>;
  createPartnerAccount(account: InsertPartnerAccount): Promise<PartnerAccount>;
  updatePartnerAccount(id: string, account: Partial<InsertPartnerAccount>): Promise<PartnerAccount>;
  
  // Subscriptions
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  incrementOrdersThisMonth(subscriptionId: string): Promise<void>;
  resetMonthlyOrders(subscriptionId: string): Promise<void>;
  
  // Partner API Credentials
  getPartnerApiCredentials(franchiseId: string): Promise<PartnerApiCredential[]>;
  getPartnerApiCredential(id: string): Promise<PartnerApiCredential | undefined>;
  getPartnerApiCredentialByApiKey(apiKey: string): Promise<PartnerApiCredential | undefined>;
  createPartnerApiCredential(credential: InsertPartnerApiCredential): Promise<PartnerApiCredential>;
  updatePartnerApiCredential(id: string, credential: Partial<InsertPartnerApiCredential>): Promise<PartnerApiCredential>;
  deletePartnerApiCredential(id: string): Promise<void>;
  incrementPartnerApiRequestCount(id: string): Promise<void>;
  
  // Partner API Logs
  getPartnerApiLogs(franchiseId: string, limit?: number): Promise<PartnerApiLog[]>;
  createPartnerApiLog(log: InsertPartnerApiLog): Promise<PartnerApiLog>;
  
  // Franchise Locations
  getFranchiseLocations(franchiseId: string): Promise<FranchiseLocation[]>;
  getFranchiseLocation(id: string): Promise<FranchiseLocation | undefined>;
  getFranchiseLocationByCode(code: string): Promise<FranchiseLocation | undefined>;
  createFranchiseLocation(location: InsertFranchiseLocation): Promise<FranchiseLocation>;
  updateFranchiseLocation(id: string, location: Partial<InsertFranchiseLocation>): Promise<FranchiseLocation>;
  deleteFranchiseLocation(id: string): Promise<void>;
  
  // Franchise-scoped order queries
  getOrdersByFranchise(franchiseId: string, options?: { status?: string; startDate?: string; endDate?: string }): Promise<ScheduledOrder[]>;
  getFranchiseAnalytics(franchiseId: string, range?: string): Promise<{
    totalOrders: number;
    totalRevenue: string;
    completedOrders: number;
    avgOrderValue: string;
    topVendors: Array<{ name: string; orders: number; revenue: number }>;
  }>;
  
  // Service Areas
  getServiceAreas(ownerId?: string): Promise<ServiceArea[]>;
  getServiceArea(id: string): Promise<ServiceArea | undefined>;
  getServiceAreaByZip(zip: string): Promise<ServiceArea | undefined>;
  createServiceArea(area: InsertServiceArea): Promise<ServiceArea>;
  updateServiceArea(id: string, area: Partial<InsertServiceArea>): Promise<ServiceArea>;
  deleteServiceArea(id: string): Promise<void>;
  
  // White Glove Pricing Tiers
  getWhiteGlovePricingTiers(serviceAreaId?: string): Promise<WhiteGlovePricingTier[]>;
  getWhiteGlovePricingTier(id: string): Promise<WhiteGlovePricingTier | undefined>;
  getWhiteGlovePricingTierByHeadcount(serviceAreaId: string, headcount: number): Promise<WhiteGlovePricingTier | undefined>;
  createWhiteGlovePricingTier(tier: InsertWhiteGlovePricingTier): Promise<WhiteGlovePricingTier>;
  updateWhiteGlovePricingTier(id: string, tier: Partial<InsertWhiteGlovePricingTier>): Promise<WhiteGlovePricingTier>;
  deleteWhiteGlovePricingTier(id: string): Promise<void>;
  
  // One-Off Orders
  getOneOffOrders(options?: { userId?: string; status?: string; deliveryType?: string; startDate?: string; endDate?: string }): Promise<OneOffOrder[]>;
  getOneOffOrder(id: string): Promise<OneOffOrder | undefined>;
  createOneOffOrder(order: InsertOneOffOrder): Promise<OneOffOrder>;
  updateOneOffOrder(id: string, order: Partial<InsertOneOffOrder>): Promise<OneOffOrder>;
  deleteOneOffOrder(id: string): Promise<void>;
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

  async getAllScheduledOrders(regionId?: string, status?: string): Promise<ScheduledOrder[]> {
    const conditions = [];
    
    if (regionId) {
      conditions.push(eq(scheduledOrders.regionId, regionId));
    }
    if (status) {
      conditions.push(eq(scheduledOrders.status, status));
    }
    
    if (conditions.length === 1) {
      return await db
        .select()
        .from(scheduledOrders)
        .where(conditions[0])
        .orderBy(scheduledOrders.scheduledDate, scheduledOrders.scheduledTime);
    }
    
    if (conditions.length > 1) {
      return await db
        .select()
        .from(scheduledOrders)
        .where(and(...conditions))
        .orderBy(scheduledOrders.scheduledDate, scheduledOrders.scheduledTime);
    }
    
    return await db
      .select()
      .from(scheduledOrders)
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
    const [newTransfer] = await db.insert(franchiseCustodyTransfers).values(transfer as any).returning();
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

  // ========================
  // SYSTEM SETTINGS
  // ========================
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async setSystemSetting(key: string, value: string, updatedBy?: string): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value, updatedBy, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }
    
    const [created] = await db
      .insert(systemSettings)
      .values({ key, value, updatedBy })
      .returning();
    return created;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  // ========================
  // PARTNER ACCOUNTS
  // ========================
  async getPartnerAccounts(): Promise<PartnerAccount[]> {
    return await db.select().from(partnerAccounts);
  }

  async getPartnerAccount(id: string): Promise<PartnerAccount | undefined> {
    const [account] = await db
      .select()
      .from(partnerAccounts)
      .where(eq(partnerAccounts.id, id));
    return account || undefined;
  }

  async getPartnerAccountByInitialPin(pin: string): Promise<PartnerAccount | undefined> {
    const [account] = await db
      .select()
      .from(partnerAccounts)
      .where(eq(partnerAccounts.initialPin, pin));
    return account || undefined;
  }

  async getPartnerAccountByPersonalPin(pin: string): Promise<PartnerAccount | undefined> {
    const [account] = await db
      .select()
      .from(partnerAccounts)
      .where(eq(partnerAccounts.personalPin, pin));
    return account || undefined;
  }

  async createPartnerAccount(account: InsertPartnerAccount): Promise<PartnerAccount> {
    const [created] = await db
      .insert(partnerAccounts)
      .values(account)
      .returning();
    return created;
  }

  async updatePartnerAccount(id: string, account: Partial<InsertPartnerAccount>): Promise<PartnerAccount> {
    const [updated] = await db
      .update(partnerAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(partnerAccounts.id, id))
      .returning();
    return updated;
  }

  // ========================
  // CONNECTED APPS (App Ecosystem Hub)
  // ========================
  async getConnectedApps(): Promise<ConnectedApp[]> {
    return await db.select().from(connectedApps).orderBy(desc(connectedApps.createdAt));
  }

  async getConnectedApp(id: string): Promise<ConnectedApp | undefined> {
    const [app] = await db.select().from(connectedApps).where(eq(connectedApps.id, id));
    return app || undefined;
  }

  async getConnectedAppByApiKey(apiKey: string): Promise<ConnectedApp | undefined> {
    const [app] = await db.select().from(connectedApps).where(eq(connectedApps.apiKey, apiKey));
    return app || undefined;
  }

  async createConnectedApp(app: InsertConnectedApp): Promise<ConnectedApp> {
    const [created] = await db.insert(connectedApps).values(app).returning();
    return created;
  }

  async updateConnectedApp(id: string, app: Partial<InsertConnectedApp>): Promise<ConnectedApp> {
    const [updated] = await db
      .update(connectedApps)
      .set({ ...app, updatedAt: new Date() })
      .where(eq(connectedApps.id, id))
      .returning();
    return updated;
  }

  async deleteConnectedApp(id: string): Promise<void> {
    await db.delete(connectedApps).where(eq(connectedApps.id, id));
  }

  async incrementAppRequestCount(id: string): Promise<void> {
    await db
      .update(connectedApps)
      .set({ 
        requestCount: sql`${connectedApps.requestCount} + 1`,
        lastSyncAt: new Date()
      })
      .where(eq(connectedApps.id, id));
  }

  // ========================
  // APP SYNC LOGS
  // ========================
  async getAppSyncLogs(appId?: string, limit: number = 50): Promise<AppSyncLog[]> {
    if (appId) {
      return await db
        .select()
        .from(appSyncLogs)
        .where(eq(appSyncLogs.appId, appId))
        .orderBy(desc(appSyncLogs.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(appSyncLogs)
      .orderBy(desc(appSyncLogs.createdAt))
      .limit(limit);
  }

  async createAppSyncLog(log: InsertAppSyncLog): Promise<AppSyncLog> {
    const [created] = await db.insert(appSyncLogs).values(log).returning();
    return created;
  }

  // ========================
  // SHARED CODE SNIPPETS
  // ========================
  async getSharedCodeSnippets(category?: string, name?: string): Promise<SharedCodeSnippet[]> {
    if (name) {
      return await db
        .select()
        .from(sharedCodeSnippets)
        .where(ilike(sharedCodeSnippets.name, `%${name}%`))
        .orderBy(desc(sharedCodeSnippets.updatedAt));
    }
    if (category) {
      return await db
        .select()
        .from(sharedCodeSnippets)
        .where(eq(sharedCodeSnippets.category, category))
        .orderBy(desc(sharedCodeSnippets.updatedAt));
    }
    return await db.select().from(sharedCodeSnippets).orderBy(desc(sharedCodeSnippets.updatedAt));
  }

  async getSharedCodeSnippetByName(name: string): Promise<SharedCodeSnippet | undefined> {
    const [snippet] = await db
      .select()
      .from(sharedCodeSnippets)
      .where(eq(sharedCodeSnippets.name, name));
    return snippet || undefined;
  }

  async getSharedCodeSnippet(id: string): Promise<SharedCodeSnippet | undefined> {
    const [snippet] = await db.select().from(sharedCodeSnippets).where(eq(sharedCodeSnippets.id, id));
    return snippet || undefined;
  }

  async createSharedCodeSnippet(snippet: InsertSharedCodeSnippet): Promise<SharedCodeSnippet> {
    const [created] = await db.insert(sharedCodeSnippets).values(snippet).returning();
    return created;
  }

  async updateSharedCodeSnippet(id: string, snippet: Partial<InsertSharedCodeSnippet>): Promise<SharedCodeSnippet> {
    const [updated] = await db
      .update(sharedCodeSnippets)
      .set({ ...snippet, updatedAt: new Date() })
      .where(eq(sharedCodeSnippets.id, id))
      .returning();
    return updated;
  }

  async deleteSharedCodeSnippet(id: string): Promise<void> {
    await db.delete(sharedCodeSnippets).where(eq(sharedCodeSnippets.id, id));
  }

  async incrementSnippetUsageCount(id: string): Promise<void> {
    await db
      .update(sharedCodeSnippets)
      .set({ usageCount: sql`${sharedCodeSnippets.usageCount} + 1` })
      .where(eq(sharedCodeSnippets.id, id));
  }

  // ========================
  // SUBSCRIPTIONS
  // ========================
  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub || undefined;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return sub || undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(subscription).returning();
    return created;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async incrementOrdersThisMonth(subscriptionId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ 
        ordersThisMonth: sql`${subscriptions.ordersThisMonth} + 1`,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscriptionId));
  }

  async resetMonthlyOrders(subscriptionId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ ordersThisMonth: 0, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId));
  }

  // ========================
  // USER ONBOARDING PROFILES (Phase 1)
  // ========================
  async getOnboardingProfile(userId: string): Promise<UserOnboardingProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.userId, userId));
    return profile || undefined;
  }

  async upsertOnboardingProfile(userId: string, data: Partial<InsertUserOnboardingProfile>): Promise<UserOnboardingProfile> {
    const existing = await this.getOnboardingProfile(userId);
    if (existing) {
      const [updated] = await db
        .update(userOnboardingProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userOnboardingProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userOnboardingProfiles)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  async updateTourProgress(userId: string, step: number, completed: boolean): Promise<void> {
    await db
      .update(userOnboardingProfiles)
      .set({ 
        guidedTourStep: step, 
        guidedTourCompleted: completed,
        updatedAt: new Date() 
      })
      .where(eq(userOnboardingProfiles.userId, userId));
  }

  // ========================
  // USER FAVORITES (Phase 2)
  // ========================
  async getFavorites(userId: string, type?: string): Promise<UserFavorite[]> {
    if (type) {
      return db
        .select()
        .from(userFavorites)
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.favoriteType, type)))
        .orderBy(userFavorites.sortOrder);
    }
    return db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(userFavorites.sortOrder);
  }

  async addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const [created] = await db.insert(userFavorites).values(favorite).returning();
    return created;
  }

  async removeFavorite(userId: string, favoriteType: string, referenceId: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.favoriteType, favoriteType),
          eq(userFavorites.referenceId, referenceId)
        )
      );
  }

  async isFavorite(userId: string, favoriteType: string, referenceId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.favoriteType, favoriteType),
          eq(userFavorites.referenceId, referenceId)
        )
      );
    return !!result;
  }

  // ========================
  // ORDER TEMPLATES (Phase 2)
  // ========================
  async getOrderTemplates(userId: string): Promise<OrderTemplate[]> {
    return db
      .select()
      .from(orderTemplates)
      .where(eq(orderTemplates.userId, userId))
      .orderBy(desc(orderTemplates.useCount));
  }

  async getOrderTemplate(id: string): Promise<OrderTemplate | undefined> {
    const [template] = await db.select().from(orderTemplates).where(eq(orderTemplates.id, id));
    return template || undefined;
  }

  async createOrderTemplate(template: InsertOrderTemplate): Promise<OrderTemplate> {
    const [created] = await db.insert(orderTemplates).values(template as any).returning();
    return created;
  }

  async updateOrderTemplate(id: string, template: Partial<InsertOrderTemplate>): Promise<OrderTemplate> {
    const [updated] = await db
      .update(orderTemplates)
      .set({ ...template, updatedAt: new Date() } as any)
      .where(eq(orderTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteOrderTemplate(id: string): Promise<void> {
    await db.delete(orderTemplates).where(eq(orderTemplates.id, id));
  }

  async incrementTemplateUseCount(id: string): Promise<void> {
    await db
      .update(orderTemplates)
      .set({ 
        useCount: sql`${orderTemplates.useCount} + 1`,
        lastUsedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(orderTemplates.id, id));
  }

  // ========================
  // LOYALTY ACCOUNTS (Phase 6)
  // ========================
  async getLoyaltyAccount(userId: string): Promise<LoyaltyAccount | undefined> {
    const [account] = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.userId, userId));
    return account || undefined;
  }

  async createLoyaltyAccount(account: InsertLoyaltyAccount): Promise<LoyaltyAccount> {
    const [created] = await db.insert(loyaltyAccounts).values(account).returning();
    return created;
  }

  async addLoyaltyPoints(userId: string, points: number, type: string, description: string, orderId?: string): Promise<void> {
    const account = await this.getLoyaltyAccount(userId);
    if (!account) return;
    
    await db
      .update(loyaltyAccounts)
      .set({ 
        currentPoints: sql`${loyaltyAccounts.currentPoints} + ${points}`,
        lifetimePoints: points > 0 ? sql`${loyaltyAccounts.lifetimePoints} + ${points}` : loyaltyAccounts.lifetimePoints,
        updatedAt: new Date()
      })
      .where(eq(loyaltyAccounts.userId, userId));

    await db.insert(loyaltyTransactions).values({
      loyaltyAccountId: account.id,
      type,
      points,
      description,
      relatedOrderId: orderId,
    });
  }

  async getLoyaltyTransactions(accountId: string, limit = 50): Promise<LoyaltyTransaction[]> {
    return db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.loyaltyAccountId, accountId))
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(limit);
  }

  async updateLoyaltyTier(userId: string, tier: string): Promise<void> {
    await db
      .update(loyaltyAccounts)
      .set({ tier, updatedAt: new Date() })
      .where(eq(loyaltyAccounts.userId, userId));
  }

  // ========================
  // QUICK REORDER (Phase 2)
  // ========================
  async getRecentOrders(userId: string, limit = 5): Promise<ScheduledOrder[]> {
    return db
      .select()
      .from(scheduledOrders)
      .where(eq(scheduledOrders.userId, userId))
      .orderBy(desc(scheduledOrders.createdAt))
      .limit(limit);
  }

  // ========================
  // PARTNER API CREDENTIALS
  // ========================
  async getPartnerApiCredentials(franchiseId: string): Promise<PartnerApiCredential[]> {
    return db
      .select()
      .from(partnerApiCredentials)
      .where(eq(partnerApiCredentials.franchiseId, franchiseId))
      .orderBy(desc(partnerApiCredentials.createdAt));
  }

  async getPartnerApiCredential(id: string): Promise<PartnerApiCredential | undefined> {
    const [credential] = await db
      .select()
      .from(partnerApiCredentials)
      .where(eq(partnerApiCredentials.id, id));
    return credential || undefined;
  }

  async getPartnerApiCredentialByApiKey(apiKey: string): Promise<PartnerApiCredential | undefined> {
    const [credential] = await db
      .select()
      .from(partnerApiCredentials)
      .where(eq(partnerApiCredentials.apiKey, apiKey));
    return credential || undefined;
  }

  async createPartnerApiCredential(credential: InsertPartnerApiCredential): Promise<PartnerApiCredential> {
    const [created] = await db.insert(partnerApiCredentials).values(credential).returning();
    return created;
  }

  async updatePartnerApiCredential(id: string, credential: Partial<InsertPartnerApiCredential>): Promise<PartnerApiCredential> {
    const [updated] = await db
      .update(partnerApiCredentials)
      .set({ ...credential, updatedAt: new Date() })
      .where(eq(partnerApiCredentials.id, id))
      .returning();
    return updated;
  }

  async deletePartnerApiCredential(id: string): Promise<void> {
    await db.delete(partnerApiCredentials).where(eq(partnerApiCredentials.id, id));
  }

  async incrementPartnerApiRequestCount(id: string): Promise<void> {
    await db
      .update(partnerApiCredentials)
      .set({
        requestCount: sql`${partnerApiCredentials.requestCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(partnerApiCredentials.id, id));
  }

  // ========================
  // PARTNER API LOGS
  // ========================
  async getPartnerApiLogs(franchiseId: string, limit = 100): Promise<PartnerApiLog[]> {
    return db
      .select()
      .from(partnerApiLogs)
      .where(eq(partnerApiLogs.franchiseId, franchiseId))
      .orderBy(desc(partnerApiLogs.createdAt))
      .limit(limit);
  }

  async createPartnerApiLog(log: InsertPartnerApiLog): Promise<PartnerApiLog> {
    const [created] = await db.insert(partnerApiLogs).values(log).returning();
    return created;
  }

  // ========================
  // FRANCHISE LOCATIONS
  // ========================
  async getFranchiseLocations(franchiseId: string): Promise<FranchiseLocation[]> {
    return db
      .select()
      .from(franchiseLocations)
      .where(eq(franchiseLocations.franchiseId, franchiseId))
      .orderBy(franchiseLocations.name);
  }

  async getFranchiseLocation(id: string): Promise<FranchiseLocation | undefined> {
    const [location] = await db
      .select()
      .from(franchiseLocations)
      .where(eq(franchiseLocations.id, id));
    return location || undefined;
  }

  async getFranchiseLocationByCode(code: string): Promise<FranchiseLocation | undefined> {
    const [location] = await db
      .select()
      .from(franchiseLocations)
      .where(eq(franchiseLocations.locationCode, code));
    return location || undefined;
  }

  async createFranchiseLocation(location: InsertFranchiseLocation): Promise<FranchiseLocation> {
    const [created] = await db.insert(franchiseLocations).values(location).returning();
    return created;
  }

  async updateFranchiseLocation(id: string, location: Partial<InsertFranchiseLocation>): Promise<FranchiseLocation> {
    const [updated] = await db
      .update(franchiseLocations)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(franchiseLocations.id, id))
      .returning();
    return updated;
  }

  async deleteFranchiseLocation(id: string): Promise<void> {
    await db.delete(franchiseLocations).where(eq(franchiseLocations.id, id));
  }

  // ========================
  // FRANCHISE-SCOPED QUERIES
  // ========================
  async getOrdersByFranchise(
    franchiseId: string,
    options?: { status?: string; startDate?: string; endDate?: string }
  ): Promise<ScheduledOrder[]> {
    const franchise = await this.getFranchise(franchiseId);
    if (!franchise) return [];

    let query = db.select().from(scheduledOrders).$dynamic();
    
    const conditions: any[] = [];
    if (options?.status) {
      conditions.push(eq(scheduledOrders.status, options.status));
    }
    if (options?.startDate) {
      conditions.push(gte(scheduledOrders.scheduledDate, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(scheduledOrders.scheduledDate, options.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(scheduledOrders.createdAt));
  }

  async getFranchiseAnalytics(
    franchiseId: string,
    range = "30days"
  ): Promise<{
    totalOrders: number;
    totalRevenue: string;
    completedOrders: number;
    avgOrderValue: string;
    topVendors: Array<{ name: string; orders: number; revenue: number }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const orders = await this.getOrdersByFranchise(franchiseId, {
      startDate: startDate.toISOString().split("T")[0],
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
    const completedOrders = orders.filter((o) => o.status === "delivered").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const byVendor = orders.reduce((acc, o) => {
      const vendor = o.vendorName || "Unknown";
      if (!acc[vendor]) acc[vendor] = { orders: 0, revenue: 0 };
      acc[vendor].orders++;
      acc[vendor].revenue += parseFloat(o.total || "0");
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    const topVendors = Object.entries(byVendor)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      completedOrders,
      avgOrderValue: avgOrderValue.toFixed(2),
      topVendors,
    };
  }

  // ========================
  // SERVICE AREAS
  // ========================
  async getServiceAreas(ownerId?: string): Promise<ServiceArea[]> {
    if (ownerId) {
      return db.select().from(serviceAreas)
        .where(eq(serviceAreas.ownerId, ownerId))
        .orderBy(desc(serviceAreas.createdAt));
    }
    return db.select().from(serviceAreas).orderBy(desc(serviceAreas.createdAt));
  }

  async getServiceArea(id: string): Promise<ServiceArea | undefined> {
    const [area] = await db.select().from(serviceAreas).where(eq(serviceAreas.id, id));
    return area || undefined;
  }

  async getServiceAreaByZip(zip: string): Promise<ServiceArea | undefined> {
    const allAreas = await db.select().from(serviceAreas).where(eq(serviceAreas.isActive, true));
    for (const area of allAreas) {
      if (area.zipCodes && area.zipCodes.includes(zip)) {
        return area;
      }
    }
    return undefined;
  }

  async createServiceArea(area: InsertServiceArea): Promise<ServiceArea> {
    const [newArea] = await db.insert(serviceAreas).values(area).returning();
    return newArea;
  }

  async updateServiceArea(id: string, area: Partial<InsertServiceArea>): Promise<ServiceArea> {
    const [updated] = await db.update(serviceAreas)
      .set({ ...area, updatedAt: new Date() })
      .where(eq(serviceAreas.id, id))
      .returning();
    return updated;
  }

  async deleteServiceArea(id: string): Promise<void> {
    await db.delete(serviceAreas).where(eq(serviceAreas.id, id));
  }

  // ========================
  // WHITE GLOVE PRICING TIERS
  // ========================
  async getWhiteGlovePricingTiers(serviceAreaId?: string): Promise<WhiteGlovePricingTier[]> {
    if (serviceAreaId) {
      return db.select().from(whiteGlovePricingTiers)
        .where(eq(whiteGlovePricingTiers.serviceAreaId, serviceAreaId))
        .orderBy(whiteGlovePricingTiers.sortOrder);
    }
    return db.select().from(whiteGlovePricingTiers).orderBy(whiteGlovePricingTiers.sortOrder);
  }

  async getWhiteGlovePricingTier(id: string): Promise<WhiteGlovePricingTier | undefined> {
    const [tier] = await db.select().from(whiteGlovePricingTiers).where(eq(whiteGlovePricingTiers.id, id));
    return tier || undefined;
  }

  async getWhiteGlovePricingTierByHeadcount(serviceAreaId: string, headcount: number): Promise<WhiteGlovePricingTier | undefined> {
    const tiers = await db.select().from(whiteGlovePricingTiers)
      .where(and(
        eq(whiteGlovePricingTiers.serviceAreaId, serviceAreaId),
        eq(whiteGlovePricingTiers.isActive, true)
      ))
      .orderBy(whiteGlovePricingTiers.sortOrder);
    
    for (const tier of tiers) {
      const min = tier.minHeadcount || 0;
      const max = tier.maxHeadcount || 999;
      if (headcount >= min && headcount <= max) {
        return tier;
      }
    }
    return tiers[0]; // Return first tier as fallback
  }

  async createWhiteGlovePricingTier(tier: InsertWhiteGlovePricingTier): Promise<WhiteGlovePricingTier> {
    const [newTier] = await db.insert(whiteGlovePricingTiers).values(tier).returning();
    return newTier;
  }

  async updateWhiteGlovePricingTier(id: string, tier: Partial<InsertWhiteGlovePricingTier>): Promise<WhiteGlovePricingTier> {
    const [updated] = await db.update(whiteGlovePricingTiers)
      .set(tier)
      .where(eq(whiteGlovePricingTiers.id, id))
      .returning();
    return updated;
  }

  async deleteWhiteGlovePricingTier(id: string): Promise<void> {
    await db.delete(whiteGlovePricingTiers).where(eq(whiteGlovePricingTiers.id, id));
  }

  // ========================
  // ONE-OFF ORDERS
  // ========================
  async getOneOffOrders(options?: { 
    userId?: string; 
    status?: string; 
    deliveryType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OneOffOrder[]> {
    const conditions: any[] = [];
    
    if (options?.userId) {
      conditions.push(eq(oneOffOrders.userId, options.userId));
    }
    if (options?.status) {
      conditions.push(eq(oneOffOrders.status, options.status));
    }
    if (options?.deliveryType) {
      conditions.push(eq(oneOffOrders.deliveryType, options.deliveryType));
    }
    if (options?.startDate) {
      conditions.push(gte(oneOffOrders.requestedDate, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(oneOffOrders.requestedDate, options.endDate));
    }

    if (conditions.length > 0) {
      return db.select().from(oneOffOrders)
        .where(and(...conditions))
        .orderBy(desc(oneOffOrders.createdAt));
    }
    return db.select().from(oneOffOrders).orderBy(desc(oneOffOrders.createdAt));
  }

  async getOneOffOrder(id: string): Promise<OneOffOrder | undefined> {
    const [order] = await db.select().from(oneOffOrders).where(eq(oneOffOrders.id, id));
    return order || undefined;
  }

  async createOneOffOrder(order: InsertOneOffOrder): Promise<OneOffOrder> {
    const [newOrder] = await db.insert(oneOffOrders).values(order).returning();
    return newOrder;
  }

  async updateOneOffOrder(id: string, order: Partial<InsertOneOffOrder>): Promise<OneOffOrder> {
    const [updated] = await db.update(oneOffOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(oneOffOrders.id, id))
      .returning();
    return updated;
  }

  async deleteOneOffOrder(id: string): Promise<void> {
    await db.delete(oneOffOrders).where(eq(oneOffOrders.id, id));
  }
}

export const storage = new DatabaseStorage();
