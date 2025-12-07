import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import bs58 from 'bs58';

interface VersionData {
  version: string;
  buildNumber: number;
  lastPublished: string | null;
  hallmarks: Array<{
    version: string;
    hash: string;
    timestamp: string;
    buildNumber: number;
  }>;
}

type BumpType = 'major' | 'minor' | 'patch' | 'build';

function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

function generateBuildHash(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(8).toString('hex');
  return crypto.createHash('sha256').update(timestamp + random).digest('hex').slice(0, 16);
}

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function getWallet(): Keypair | null {
  const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
  if (!privateKey) return null;
  
  const trimmedKey = privateKey.trim();
  
  if (trimmedKey.startsWith('[')) {
    try {
      const secretKey = Uint8Array.from(JSON.parse(trimmedKey));
      return Keypair.fromSecretKey(secretKey);
    } catch { return null; }
  }
  
  try {
    const secretKey = bs58.decode(trimmedKey);
    return Keypair.fromSecretKey(secretKey);
  } catch { return null; }
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
    
    const slot = confirmation.context?.slot || 0;
    
    return { signature, slot };
  } catch (error: any) {
    console.log(`   ⚠️ Solana tx failed: ${error.message}`);
    return null;
  }
}

function bumpVersion(current: string, type: BumpType): string {
  const { major, minor, patch } = parseVersion(current);
  
  switch (type) {
    case 'major':
      return formatVersion(major + 1, 0, 0);
    case 'minor':
      return formatVersion(major, minor + 1, 0);
    case 'patch':
    default:
      return formatVersion(major, minor, patch + 1);
  }
}

function updateVersionInFile(filePath: string, oldVersion: string, newVersion: string): boolean {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  Skipping ${filePath} (not found)`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf-8');
    const versionPattern = new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g');
    const newContent = content.replace(versionPattern, `v${newVersion}`);
    
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent);
      console.log(`  Updated ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`  Error updating ${filePath}:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const bumpType: BumpType = (args[0] as BumpType) || 'patch';
  const autoHallmark = args.includes('--hallmark') || args.includes('-h');
  
  console.log('\n🔄 Brew & Board Version Bump System\n');
  
  const versionFilePath = path.resolve(process.cwd(), 'version.json');
  
  if (!fs.existsSync(versionFilePath)) {
    console.error('❌ version.json not found');
    process.exit(1);
  }
  
  const versionData: VersionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf-8'));
  const oldVersion = versionData.version;
  const newVersion = bumpVersion(oldVersion, bumpType);
  const buildHash = generateBuildHash();
  const timestamp = new Date().toISOString();
  
  console.log(`📦 Current version: v${oldVersion}`);
  console.log(`🚀 New version: v${newVersion}`);
  console.log(`🔢 Build number: ${versionData.buildNumber + 1}`);
  console.log(`🔑 Build hash: ${buildHash}\n`);
  
  const filesToUpdate = [
    'client/src/pages/login.tsx',
    'replit.md'
  ];
  
  console.log('📝 Updating version references:');
  for (const file of filesToUpdate) {
    updateVersionInFile(file, oldVersion, newVersion);
  }
  
  versionData.version = newVersion;
  versionData.buildNumber += 1;
  versionData.lastPublished = timestamp;
  
  let solanaTx: { signature: string; slot: number } | null = null;
  
  if (autoHallmark) {
    console.log('\n🔗 Anchoring to Solana mainnet...');
    solanaTx = await anchorToSolana(buildHash, newVersion);
    
    const hallmarkEntry: any = {
      version: newVersion,
      hash: buildHash,
      timestamp,
      buildNumber: versionData.buildNumber
    };
    
    if (solanaTx) {
      hallmarkEntry.solanaTx = solanaTx.signature;
      hallmarkEntry.solanaSlot = solanaTx.slot;
      console.log(`   ✅ Solana tx: ${solanaTx.signature.slice(0, 20)}...`);
    }
    
    versionData.hallmarks.push(hallmarkEntry);
    console.log(`🏛️ Hallmark recorded: BB-${String(versionData.buildNumber).padStart(10, '0')}`);
  }
  
  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
  console.log('\n✅ version.json updated');
  
  const replitMdPath = path.resolve(process.cwd(), 'replit.md');
  if (fs.existsSync(replitMdPath)) {
    let replitMd = fs.readFileSync(replitMdPath, 'utf-8');
    
    const versionLinePattern = /\*\*v[\d.]+\*\* - \w+ \d{4} \|/;
    const newVersionLine = `**v${newVersion}** - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} |`;
    
    if (versionLinePattern.test(replitMd)) {
      replitMd = replitMd.replace(versionLinePattern, newVersionLine);
      fs.writeFileSync(replitMdPath, replitMd);
      console.log('📄 replit.md version header updated');
    }
  }
  
  console.log(`\n🎉 Version bumped to v${newVersion}\n`);
  
  if (autoHallmark) {
    console.log('📋 Hallmark Details:');
    console.log(`   Version: v${newVersion}`);
    console.log(`   Build: #${versionData.buildNumber}`);
    console.log(`   Hash: ${buildHash}`);
    console.log(`   Time: ${timestamp}`);
    if (solanaTx) {
      console.log(`   Solana TX: ${solanaTx.signature}`);
      console.log(`   Slot: ${solanaTx.slot}`);
      console.log('\n   ✅ Verified on Solana mainnet!');
    } else {
      console.log('\n   ⚠️ Local hallmark only (no Solana wallet configured)');
    }
  }
}

main().catch(console.error);
