import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile } from "fs/promises";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import crypto from "crypto";
import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

// ============================
// AUTO RELEASE MANAGER
// Runs automatically on publish
// ============================

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function getWallet(): Keypair | null {
  const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
  if (!privateKey) return null;
  const trimmedKey = privateKey.trim();
  if (trimmedKey.startsWith('[')) {
    try { return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(trimmedKey))); } catch { return null; }
  }
  try { return Keypair.fromSecretKey(bs58.decode(trimmedKey)); } catch { return null; }
}

async function anchorToSolana(buildHash: string, version: string): Promise<{ signature: string; slot: number } | null> {
  const wallet = getWallet();
  if (!wallet) {
    console.log('   ⚠️ SOLANA_WALLET_PRIVATE_KEY not set - skipping blockchain');
    return null;
  }
  try {
    const rpcUrl = process.env.HELIUS_API_KEY 
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      : 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const memoData = `BB-VERSION:${version}:${buildHash}`;
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, 'utf-8'),
    });
    const transaction = new Transaction().add(memoInstruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    transaction.sign(wallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    return { signature, slot: confirmation.context?.slot || 0 };
  } catch (error: any) {
    console.log(`   ⚠️ Solana tx failed: ${error.message}`);
    return null;
  }
}

async function autoRelease() {
  console.log('\n🚀 AUTO RELEASE MANAGER\n');
  
  const versionPath = resolve(process.cwd(), 'version.json');
  if (!existsSync(versionPath)) {
    console.log('   ⚠️ version.json not found - skipping auto-release');
    return;
  }
  
  const versionData = JSON.parse(readFileSync(versionPath, 'utf-8'));
  const oldVersion = versionData.version;
  const [major, minor, patch] = oldVersion.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  const buildHash = crypto.createHash('sha256').update(Date.now().toString() + crypto.randomBytes(8).toString('hex')).digest('hex').slice(0, 16);
  const timestamp = new Date().toISOString();
  
  console.log(`📦 Version: v${oldVersion} → v${newVersion}`);
  console.log(`🔑 Hash: ${buildHash}`);
  
  // Stamp to Solana
  console.log('🔗 Anchoring to Solana mainnet...');
  const solanaTx = await anchorToSolana(buildHash, newVersion);
  
  // Update version.json
  versionData.version = newVersion;
  versionData.buildNumber = (versionData.buildNumber || 0) + 1;
  versionData.lastPublished = timestamp;
  
  const hallmarkEntry: any = { version: newVersion, hash: buildHash, timestamp, buildNumber: versionData.buildNumber };
  if (solanaTx) {
    hallmarkEntry.solanaTx = solanaTx.signature;
    hallmarkEntry.solanaSlot = solanaTx.slot;
    console.log(`   ✅ Solana TX: ${solanaTx.signature.slice(0, 30)}...`);
  }
  versionData.hallmarks = versionData.hallmarks || [];
  versionData.hallmarks.push(hallmarkEntry);
  
  writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  console.log(`🏛️ Hallmark: BB-${String(versionData.buildNumber).padStart(10, '0')}`);
  
  // Update file references
  const filesToUpdate = ['client/src/pages/login.tsx', 'replit.md'];
  for (const file of filesToUpdate) {
    const fullPath = resolve(process.cwd(), file);
    if (existsSync(fullPath)) {
      let content = readFileSync(fullPath, 'utf-8');
      content = content.replace(new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), `v${newVersion}`);
      writeFileSync(fullPath, content);
    }
  }
  
  console.log(`✅ Released v${newVersion}\n`);
}

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  // Run auto-release first (version bump + Solana stamp)
  await autoRelease();
  
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
