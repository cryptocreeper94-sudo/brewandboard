import { db } from "./db";
import { 
  hallmarks, 
  hallmarkEvents, 
  userHallmarkProfiles,
  appVersions,
  type Hallmark,
  type InsertHallmark,
  type HallmarkEvent,
  type UserHallmarkProfile,
  type AppVersion,
  HALLMARK_LIMITS
} from "@shared/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { generateContentHash, anchorHashToBlockchain, verifyTransactionOnChain, isBlockchainConfigured } from "./solanaService";

// Company hallmark counter - starts at 1, goes to 10 billion
let companyHallmarkCounter: number | null = null;

// Generate company serial number: BB-0000000001 format (10 digits)
async function getNextCompanySerial(): Promise<string> {
  if (companyHallmarkCounter === null) {
    // Get the highest existing company hallmark number
    const existing = await db.select()
      .from(hallmarks)
      .where(eq(hallmarks.isCompanyHallmark, true))
      .orderBy(desc(hallmarks.issuedAt))
      .limit(1);
    
    if (existing.length > 0 && existing[0].serialNumber) {
      const match = existing[0].serialNumber.match(/BB-(\d+)/);
      companyHallmarkCounter = match ? parseInt(match[1]) : 0;
    } else {
      companyHallmarkCounter = 0;
    }
  }
  
  companyHallmarkCounter++;
  return `BB-${companyHallmarkCounter.toString().padStart(10, '0')}`;
}

// Generate user serial number: BB-USERNAME-000001 format (6 digits)
async function getNextUserSerial(prefix: string): Promise<string> {
  const existing = await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.prefix, prefix))
    .orderBy(desc(hallmarks.issuedAt))
    .limit(1);
  
  let counter = 0;
  if (existing.length > 0 && existing[0].serialNumber) {
    const match = existing[0].serialNumber.match(/-(\d+)$/);
    counter = match ? parseInt(match[1]) : 0;
  }
  
  counter++;
  return `${prefix}-${counter.toString().padStart(6, '0')}`;
}

// Generate username-based prefix from user name
export function generateUserPrefix(username: string): string {
  // Clean and uppercase the username
  const clean = username.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Take up to 15 characters to keep prefix reasonable
  const abbreviated = clean.slice(0, 15);
  return `BB-${abbreviated}`;
}

// Issue a new company hallmark (BB-0000000001)
export async function issueCompanyHallmark(data: {
  assetType: string;
  assetId?: string;
  assetName?: string;
  issuedBy?: string;
  metadata?: Record<string, any>;
}): Promise<{ hallmark: Hallmark; blockchainResult?: any }> {
  const serialNumber = await getNextCompanySerial();
  const issuedAt = new Date();
  
  const contentHash = generateContentHash({
    serialNumber,
    assetType: data.assetType,
    assetId: data.assetId,
    issuedAt: issuedAt.toISOString(),
    metadata: data.metadata,
  });
  
  const [hallmark] = await db.insert(hallmarks).values({
    serialNumber,
    prefix: 'BB',
    assetType: data.assetType,
    assetId: data.assetId,
    assetName: data.assetName,
    issuedBy: data.issuedBy || 'Brew & Board Coffee',
    isCompanyHallmark: true,
    contentHash,
    metadata: data.metadata,
    status: 'active',
  }).returning();
  
  // Log the issuance event
  await db.insert(hallmarkEvents).values({
    hallmarkId: hallmark.id,
    eventType: 'issued',
    eventData: { serialNumber, assetType: data.assetType, isCompany: true },
  });
  
  // Anchor to blockchain if configured
  let blockchainResult = null;
  if (isBlockchainConfigured()) {
    try {
      blockchainResult = await anchorHashToBlockchain(contentHash);
      if (blockchainResult) {
        await db.update(hallmarks)
          .set({
            solanaTxSignature: blockchainResult.signature,
            solanaConfirmedAt: blockchainResult.confirmedAt,
            solanaSlot: blockchainResult.slot,
            solanaNetwork: blockchainResult.network,
          })
          .where(eq(hallmarks.id, hallmark.id));
      }
    } catch (error) {
      console.error("Company hallmark blockchain anchoring failed:", error);
    }
  }
  
  return { hallmark, blockchainResult };
}

// Issue a subscriber hallmark (BB-USERNAME-000001)
export async function issueUserHallmark(data: {
  userId: string;
  assetType: string;
  assetId?: string;
  assetName?: string;
  metadata?: Record<string, any>;
  tier?: 'starter' | 'professional' | 'enterprise';
}): Promise<{ hallmark: Hallmark; blockchainResult?: any } | { error: string }> {
  // Get or create user hallmark profile
  let profile = await getUserHallmarkProfile(data.userId);
  
  if (!profile) {
    return { error: "User does not have a hallmark profile. Mint your hallmark first." };
  }
  
  if (!profile.isMinted) {
    return { error: "User hallmark not minted yet. Complete minting first." };
  }
  
  // Enforce tier limits
  const tier = data.tier || 'starter';
  const limitCheck = await canUserStampDocument(data.userId, tier);
  
  if (!limitCheck.allowed) {
    const limitMsg = tier === 'enterprise' 
      ? "Enterprise limit reached (contact support)"
      : `Monthly limit reached (${limitCheck.limit} hallmarks). Upgrade your plan for more.`;
    return { error: limitMsg };
  }
  
  const serialNumber = await getNextUserSerial(profile.hallmarkPrefix);
  const issuedAt = new Date();
  
  const contentHash = generateContentHash({
    serialNumber,
    assetType: data.assetType,
    assetId: data.assetId,
    userId: data.userId,
    issuedAt: issuedAt.toISOString(),
    metadata: data.metadata,
  });
  
  const [hallmark] = await db.insert(hallmarks).values({
    serialNumber,
    prefix: profile.hallmarkPrefix,
    assetType: data.assetType,
    assetId: data.assetId,
    assetName: data.assetName,
    userId: data.userId,
    issuedBy: profile.hallmarkPrefix,
    isCompanyHallmark: false,
    contentHash,
    metadata: data.metadata,
    status: 'active',
  }).returning();
  
  // Update usage tracking
  await db.update(userHallmarkProfiles)
    .set({
      documentsStampedThisMonth: (profile.documentsStampedThisMonth || 0) + 1,
      totalDocumentsStamped: (profile.totalDocumentsStamped || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(userHallmarkProfiles.userId, data.userId));
  
  // Log the issuance event
  await db.insert(hallmarkEvents).values({
    hallmarkId: hallmark.id,
    eventType: 'issued',
    eventData: { serialNumber, assetType: data.assetType, userId: data.userId },
  });
  
  // Anchor to blockchain if configured
  let blockchainResult = null;
  if (isBlockchainConfigured()) {
    try {
      blockchainResult = await anchorHashToBlockchain(contentHash);
      if (blockchainResult) {
        await db.update(hallmarks)
          .set({
            solanaTxSignature: blockchainResult.signature,
            solanaConfirmedAt: blockchainResult.confirmedAt,
            solanaSlot: blockchainResult.slot,
            solanaNetwork: blockchainResult.network,
          })
          .where(eq(hallmarks.id, hallmark.id));
      }
    } catch (error) {
      console.error("User hallmark blockchain anchoring failed:", error);
    }
  }
  
  return { hallmark, blockchainResult };
}

// Get hallmark by serial number
export async function getHallmarkBySerial(serialNumber: string): Promise<Hallmark | null> {
  const [hallmark] = await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.serialNumber, serialNumber));
  return hallmark || null;
}

// Verify a hallmark with full blockchain validation
export async function verifyHallmark(serialNumber: string, req?: any): Promise<{
  valid: boolean;
  hallmark?: Hallmark;
  blockchain?: any;
  message: string;
  integrityCheck?: 'passed' | 'failed' | 'pending';
}> {
  const hallmark = await getHallmarkBySerial(serialNumber);
  
  if (!hallmark) {
    return { valid: false, message: "Hallmark not found" };
  }
  
  if (hallmark.status === "revoked") {
    return { valid: false, hallmark, message: "This hallmark has been revoked" };
  }
  
  if (hallmark.expiresAt && new Date(hallmark.expiresAt) < new Date()) {
    return { valid: false, hallmark, message: "This hallmark has expired" };
  }
  
  // Verify on blockchain with hash matching if transaction exists
  let blockchain = null;
  let integrityCheck: 'passed' | 'failed' | 'pending' = 'pending';
  
  if (hallmark.solanaTxSignature && hallmark.contentHash) {
    blockchain = await verifyTransactionOnChain(hallmark.solanaTxSignature, hallmark.contentHash);
    
    if (blockchain.confirmed) {
      if (blockchain.hashMatches === true) {
        integrityCheck = 'passed';
      } else if (blockchain.hashMatches === false) {
        integrityCheck = 'failed';
      } else {
        // Hash not found in memo (older transactions or different format)
        integrityCheck = 'passed'; // Trust DB record if tx confirmed
      }
    }
  }
  
  // If integrity check failed, the hallmark is invalid
  if (integrityCheck === 'failed') {
    return { 
      valid: false, 
      hallmark, 
      blockchain,
      message: "Integrity check failed: on-chain hash does not match",
      integrityCheck,
    };
  }
  
  // Update verification count
  await db.update(hallmarks)
    .set({
      verificationCount: (hallmark.verificationCount || 0) + 1,
      lastVerifiedAt: new Date(),
    })
    .where(eq(hallmarks.id, hallmark.id));
  
  // Log verification event
  await db.insert(hallmarkEvents).values({
    hallmarkId: hallmark.id,
    eventType: 'verified',
    eventData: { 
      blockchain: blockchain?.confirmed || false,
      integrityCheck,
    },
    ipAddress: req?.ip,
    userAgent: req?.headers?.["user-agent"],
  });
  
  const message = blockchain?.confirmed 
    ? (integrityCheck === 'passed' 
      ? "Verified on Solana blockchain - integrity confirmed"
      : "Verified on Solana blockchain")
    : "Valid hallmark (blockchain verification pending)";
  
  return {
    valid: true,
    hallmark,
    blockchain,
    message,
    integrityCheck,
  };
}

// Revoke a hallmark
export async function revokeHallmark(serialNumber: string, reason?: string): Promise<boolean> {
  const hallmark = await getHallmarkBySerial(serialNumber);
  if (!hallmark) return false;
  
  await db.update(hallmarks)
    .set({ status: "revoked" })
    .where(eq(hallmarks.id, hallmark.id));
  
  await db.insert(hallmarkEvents).values({
    hallmarkId: hallmark.id,
    eventType: 'revoked',
    eventData: { reason },
  });
  
  return true;
}

// Get user's hallmarks
export async function getUserHallmarks(userId: string): Promise<Hallmark[]> {
  return await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.userId, userId))
    .orderBy(desc(hallmarks.issuedAt));
}

// Get company hallmarks
export async function getCompanyHallmarks(): Promise<Hallmark[]> {
  return await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.isCompanyHallmark, true))
    .orderBy(desc(hallmarks.issuedAt));
}

// Get user hallmark profile
export async function getUserHallmarkProfile(userId: string): Promise<UserHallmarkProfile | null> {
  const [profile] = await db.select()
    .from(userHallmarkProfiles)
    .where(eq(userHallmarkProfiles.userId, userId));
  return profile || null;
}

// Create user hallmark profile (before minting)
export async function createUserHallmarkProfile(userId: string, username: string): Promise<UserHallmarkProfile> {
  const prefix = generateUserPrefix(username);
  
  // Check if prefix already exists
  const existing = await db.select()
    .from(userHallmarkProfiles)
    .where(eq(userHallmarkProfiles.hallmarkPrefix, prefix));
  
  if (existing.length > 0) {
    // Add a number suffix to make unique
    const count = existing.length;
    const uniquePrefix = `${prefix}${count + 1}`;
    const [profile] = await db.insert(userHallmarkProfiles).values({
      userId,
      hallmarkPrefix: uniquePrefix,
    }).returning();
    return profile;
  }
  
  const [profile] = await db.insert(userHallmarkProfiles).values({
    userId,
    hallmarkPrefix: prefix,
  }).returning();
  return profile;
}

// Mint user hallmark (after payment)
export async function mintUserHallmark(userId: string, txSignature?: string): Promise<UserHallmarkProfile | null> {
  const [profile] = await db.update(userHallmarkProfiles)
    .set({
      isMinted: true,
      mintedAt: new Date(),
      mintTxSignature: txSignature,
      updatedAt: new Date(),
    })
    .where(eq(userHallmarkProfiles.userId, userId))
    .returning();
  return profile || null;
}

// Update user avatar
export async function updateUserAvatar(userId: string, avatarData: string): Promise<UserHallmarkProfile | null> {
  const [profile] = await db.update(userHallmarkProfiles)
    .set({
      avatarData,
      updatedAt: new Date(),
    })
    .where(eq(userHallmarkProfiles.userId, userId))
    .returning();
  return profile || null;
}

// Check if user can stamp more documents this month
export async function canUserStampDocument(userId: string, tier: 'starter' | 'professional' | 'enterprise'): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const profile = await getUserHallmarkProfile(userId);
  if (!profile || !profile.isMinted) {
    return { allowed: false, remaining: 0, limit: 0 };
  }
  
  const limit = HALLMARK_LIMITS[tier];
  const used = profile.documentsStampedThisMonth || 0;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}

// Reset monthly counters (call from cron job or at month start)
export async function resetMonthlyCounters(): Promise<void> {
  await db.update(userHallmarkProfiles)
    .set({
      documentsStampedThisMonth: 0,
      lastResetAt: new Date(),
    });
}

// Issue app version hallmark
export async function issueAppVersionHallmark(data: {
  version: string;
  changelog: string;
  releaseNotes?: string;
  releasedBy?: string;
}): Promise<{ version: AppVersion; hallmark: Hallmark; blockchainResult?: any }> {
  // Mark all other versions as not current
  await db.update(appVersions)
    .set({ isCurrent: false })
    .where(eq(appVersions.isCurrent, true));
  
  // Issue company hallmark for this version
  const { hallmark, blockchainResult } = await issueCompanyHallmark({
    assetType: 'app_version',
    assetName: `Brew & Board Coffee v${data.version}`,
    issuedBy: data.releasedBy || 'Brew & Board Development',
    metadata: {
      version: data.version,
      changelog: data.changelog,
      releaseNotes: data.releaseNotes,
    },
  });
  
  // Create version record
  const [version] = await db.insert(appVersions).values({
    version: data.version,
    hallmarkId: hallmark.id,
    changelog: data.changelog,
    releaseNotes: data.releaseNotes,
    releasedBy: data.releasedBy,
    isCurrent: true,
  }).returning();
  
  return { version, hallmark, blockchainResult };
}

// Get current app version
export async function getCurrentAppVersion(): Promise<AppVersion | null> {
  const [version] = await db.select()
    .from(appVersions)
    .where(eq(appVersions.isCurrent, true));
  return version || null;
}

// Get all app versions
export async function getAppVersionHistory(): Promise<AppVersion[]> {
  return await db.select()
    .from(appVersions)
    .orderBy(desc(appVersions.releasedAt));
}

// Get hallmark stats
export async function getHallmarkStats(): Promise<{
  totalCompanyHallmarks: number;
  totalUserHallmarks: number;
  totalVerifications: number;
  activeProfiles: number;
}> {
  const companyHallmarks = await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.isCompanyHallmark, true));
  
  const userHallmarks = await db.select()
    .from(hallmarks)
    .where(eq(hallmarks.isCompanyHallmark, false));
  
  const profiles = await db.select()
    .from(userHallmarkProfiles)
    .where(eq(userHallmarkProfiles.isMinted, true));
  
  const totalVerifications = companyHallmarks.reduce((sum, h) => sum + (h.verificationCount || 0), 0)
    + userHallmarks.reduce((sum, h) => sum + (h.verificationCount || 0), 0);
  
  return {
    totalCompanyHallmarks: companyHallmarks.length,
    totalUserHallmarks: userHallmarks.length,
    totalVerifications,
    activeProfiles: profiles.length,
  };
}
