import { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import crypto from "crypto";

// Solana Memo Program ID - used to embed arbitrary data in transactions
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// Configuration - Uses Helius RPC if available, falls back to public RPC
const SOLANA_RPC = process.env.HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : "https://api.mainnet-beta.solana.com";

let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(SOLANA_RPC, "confirmed");
  }
  return connection;
}

// Check if blockchain operations are available
export function isBlockchainConfigured(): boolean {
  return !!process.env.SOLANA_WALLET_PRIVATE_KEY;
}

// Load wallet from environment secret
function getWallet(): Keypair {
  const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SOLANA_WALLET_PRIVATE_KEY not configured. Add your Phantom wallet private key to secrets.");
  }
  try {
    const secretKey = Uint8Array.from(JSON.parse(privateKey));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error("Invalid SOLANA_WALLET_PRIVATE_KEY format. Must be JSON array [1,2,3,...64 numbers]");
  }
}

// Generate SHA-256 hash of content for blockchain anchoring
export function generateContentHash(payload: {
  serialNumber: string;
  assetType: string;
  assetId?: string;
  userId?: string;
  issuedAt: string;
  metadata?: any;
}): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

// Anchor a hash to the Solana blockchain using Memo program
export async function anchorHashToBlockchain(contentHash: string): Promise<{
  signature: string;
  slot: number;
  confirmedAt: Date;
  network: string;
  memoData: string;
} | null> {
  if (!isBlockchainConfigured()) {
    console.log("Blockchain not configured - skipping on-chain anchoring");
    return null;
  }

  try {
    const wallet = getWallet();
    const conn = getConnection();
    
    // Create memo data with prefix for easy identification
    // Format: "BB-HALLMARK:{hash}" - max 566 bytes allowed in memo
    const memoData = `BB-HALLMARK:${contentHash}`;
    
    // Create Memo instruction to embed the hash on-chain
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, "utf-8"),
    });
    
    // Build transaction with memo instruction
    const transaction = new Transaction().add(memoInstruction);
    
    const { blockhash } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    const signature = await sendAndConfirmTransaction(conn, transaction, [wallet]);
    const txInfo = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
    
    return {
      signature,
      slot: txInfo?.slot || 0,
      confirmedAt: new Date(),
      network: SOLANA_RPC.includes("mainnet") ? "mainnet" : "devnet",
      memoData,
    };
  } catch (error: any) {
    console.error("Blockchain anchoring failed:", error.message);
    throw error;
  }
}

// Verify a transaction exists on-chain and extract memo data
export async function verifyTransactionOnChain(signature: string, expectedHash?: string): Promise<{
  exists: boolean;
  confirmed: boolean;
  slot?: number;
  blockTime?: Date;
  memoData?: string;
  hashMatches?: boolean;
}> {
  try {
    const conn = getConnection();
    const tx = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
    
    if (!tx) {
      return { exists: false, confirmed: false };
    }
    
    // Extract memo data from transaction logs
    let memoData: string | undefined;
    if (tx.meta?.logMessages) {
      for (const log of tx.meta.logMessages) {
        // Memo program logs the data directly
        if (log.includes("BB-HALLMARK:")) {
          const match = log.match(/BB-HALLMARK:([a-f0-9]+)/);
          if (match) {
            memoData = match[0];
          }
        }
      }
    }
    
    // Check if hash matches if expected hash provided
    let hashMatches: boolean | undefined;
    if (expectedHash && memoData) {
      hashMatches = memoData === `BB-HALLMARK:${expectedHash}`;
    }
    
    return {
      exists: true,
      confirmed: true,
      slot: tx.slot,
      blockTime: tx.blockTime ? new Date(tx.blockTime * 1000) : undefined,
      memoData,
      hashMatches,
    };
  } catch (error) {
    console.error("Transaction verification failed:", error);
    return { exists: false, confirmed: false };
  }
}

// Get wallet balance in SOL
export async function getWalletBalance(): Promise<number> {
  if (!isBlockchainConfigured()) {
    return 0;
  }
  
  try {
    const wallet = getWallet();
    const conn = getConnection();
    const balance = await conn.getBalance(wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return 0;
  }
}

// Get blockchain stats for display
export async function getBlockchainStats(): Promise<{
  configured: boolean;
  network: string;
  currentSlot: number;
  walletBalance: number;
  walletAddress: string;
  rpcEndpoint: string;
}> {
  const configured = isBlockchainConfigured();
  
  if (!configured) {
    return {
      configured: false,
      network: "not_configured",
      currentSlot: 0,
      walletBalance: 0,
      walletAddress: "Add SOLANA_WALLET_PRIVATE_KEY to secrets",
      rpcEndpoint: SOLANA_RPC.includes("helius") ? "Helius (configured)" : "Public RPC",
    };
  }
  
  try {
    const wallet = getWallet();
    const conn = getConnection();
    const slot = await conn.getSlot();
    const balance = await getWalletBalance();
    
    return {
      configured: true,
      network: SOLANA_RPC.includes("mainnet") ? "mainnet" : "devnet",
      currentSlot: slot,
      walletBalance: balance,
      walletAddress: wallet.publicKey.toBase58(),
      rpcEndpoint: SOLANA_RPC.includes("helius") ? "Helius" : "Public RPC",
    };
  } catch (error: any) {
    return {
      configured: true,
      network: "error",
      currentSlot: 0,
      walletBalance: 0,
      walletAddress: error.message,
      rpcEndpoint: SOLANA_RPC.includes("helius") ? "Helius" : "Public RPC",
    };
  }
}

// Calculate estimated transaction cost
export function estimateTransactionCost(): number {
  // Solana transaction fee is approximately 5000 lamports = 0.000005 SOL
  // At ~$20/SOL, that's about $0.0001 per transaction
  return 0.000005;
}
