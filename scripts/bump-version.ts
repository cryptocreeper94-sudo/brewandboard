import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
    'client/src/components/Footer.tsx',
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
  
  if (autoHallmark) {
    const hallmarkEntry = {
      version: newVersion,
      hash: buildHash,
      timestamp,
      buildNumber: versionData.buildNumber
    };
    versionData.hallmarks.push(hallmarkEntry);
    console.log(`\n🏛️ Hallmark recorded: BB-${String(versionData.buildNumber).padStart(10, '0')}`);
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
    console.log('\n   Note: For Solana mainnet hallmarking, use the Developer Hub');
  }
}

main().catch(console.error);
