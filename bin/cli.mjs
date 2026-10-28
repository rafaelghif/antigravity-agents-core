#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = '6.0.0';
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

let cmd = 'help';
let targetDir = process.cwd();
let force = false;
let dryRun = false;
let withSidecar = false;
let projectId = process.env.AAC_PROJECT_ID || '';

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === 'init' || a === 'upgrade' || a === 'uninstall' || a === 'help') cmd = a;
  else if (a === '--force' || a === '-f') force = true;
  else if (a === '--dry-run') dryRun = true;
  else if (a === '--with-sidecar') withSidecar = true;
  else if (a === '--project-id' && args[i + 1]) projectId = args[++i];
  else if (a.startsWith('--project-id=')) projectId = a.slice('--project-id='.length);
  else if (a === '--target' && args[i + 1]) targetDir = path.resolve(args[++i]);
  else if (a.startsWith('-')) {
    console.error(`❌ Unknown flag: ${a}`);
    process.exit(1);
  }
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function atomicWrite(filePath, content) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

function listFilesRecursive(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listFilesRecursive(full, baseDir));
    else results.push(path.relative(baseDir, full).replace(/\\/g, '/'));
  }
  return results;
}

function backupFile(dstPath, relPath, backupRoot) {
  if (dryRun || !fs.existsSync(dstPath)) return;
  const bPath = path.join(backupRoot, relPath);
  fs.mkdirSync(path.dirname(bPath), { recursive: true });
  fs.copyFileSync(dstPath, bPath);
}

function mergeHooks(srcPath, dstPath, backupRoot) {
  const srcRaw = fs.readFileSync(srcPath, 'utf8');
  if (!fs.existsSync(dstPath)) {
    console.log(`${dryRun ? '[dry-run] ' : ''}✔ Installed .agents/hooks.json`);
    atomicWrite(dstPath, srcRaw);
    return;
  }
  let dst;
  try {
    dst = JSON.parse(fs.readFileSync(dstPath, 'utf8'));
    if (!dst || typeof dst !== 'object' || Array.isArray(dst)) throw new Error('Top-level JSON must be an object');
  } catch (err) {
    backupFile(dstPath, '.agents/hooks.json', backupRoot);
    console.error(`❌ Aborting: existing .agents/hooks.json is malformed (${err.message}). Backed up to ${backupRoot}.`);
    process.exit(1);
  }
  const src = JSON.parse(srcRaw);
  const merged = { ...dst };
  for (const [k, v] of Object.entries(src)) {
    merged[k] = merged[k] && typeof merged[k].enabled === 'boolean' ? { ...v, enabled: merged[k].enabled } : v;
  }
  backupFile(dstPath, '.agents/hooks.json', backupRoot);
  atomicWrite(dstPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`${dryRun ? '[dry-run] ' : ''}🔄 Merged .agents/hooks.json (preserved custom hooks & toggles)`);
}

function configureSidecar() {
  if (!projectId) {
    console.error('❌ --with-sidecar requires --project-id <id> (or AAC_PROJECT_ID) because Antigravity App sidecars need a projectId in ~/.gemini/config/config.json.');
    process.exit(1);
  }
  const home = process.env.HOME || os.homedir();
  const sidecarDst = path.join(home, '.gemini', 'config', 'sidecars', 'repo-health', 'sidecar.json');
  const configPath = path.join(home, '.gemini', 'config', 'config.json');
  const sidecarSrc = fs.readFileSync(path.join(packageRoot, '.agents', 'sidecars', 'repo-health', 'sidecar.json'), 'utf8');
  atomicWrite(sidecarDst, sidecarSrc);

  let cfg = {};
  if (fs.existsSync(configPath)) {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  cfg.sidecars = cfg.sidecars || {};
  cfg.sidecars['repo-health'] = { enabled: true, projectId };
  atomicWrite(configPath, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`${dryRun ? '[dry-run] ' : ''}✅ Installed & enabled sidecar (projectId: ${projectId}) in ${configPath}`);
}

function runInstallOrUpgrade() {
  if (!dryRun) fs.mkdirSync(targetDir, { recursive: true });
  if (path.resolve(targetDir) === packageRoot) {
    console.log('ℹ️ Target directory is the AAC source repository itself.');
    return;
  }
  if (withSidecar && !projectId) configureSidecar();

  const manifestPath = path.join(targetDir, '.agents', '.aac-manifest.json');
  const prevManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { version: VERSION, files: {} };
  const nextManifest = { version: VERSION, files: { ...prevManifest.files } };
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(targetDir, '.scratch', 'backups', stamp);

  const managedRelPaths = ['AGENTS.md'];
  for (const sub of ['rules', 'skills', 'agents', 'sidecars']) {
    const subDir = path.join(packageRoot, '.agents', sub);
    for (const rel of listFilesRecursive(subDir)) {
      managedRelPaths.push(`.agents/${sub}/${rel}`);
    }
  }

  for (const relPath of managedRelPaths) {
    const srcPath = path.join(packageRoot, relPath);
    const dstPath = path.join(targetDir, relPath);
    const srcBuf = fs.readFileSync(srcPath);
    const srcHash = sha256(srcBuf);

    if (!fs.existsSync(dstPath)) {
      atomicWrite(dstPath, srcBuf);
      nextManifest.files[relPath] = srcHash;
      console.log(`${dryRun ? '[dry-run] ' : ''}✔ Installed ${relPath}`);
      continue;
    }

    const dstBuf = fs.readFileSync(dstPath);
    const dstHash = sha256(dstBuf);
    if (dstHash === srcHash) {
      nextManifest.files[relPath] = srcHash;
      continue;
    }

    const wasUnmodifiedManaged = prevManifest.files[relPath] && prevManifest.files[relPath] === dstHash;
    if (wasUnmodifiedManaged || force) {
      backupFile(dstPath, relPath, backupRoot);
      atomicWrite(dstPath, srcBuf);
      nextManifest.files[relPath] = srcHash;
      console.log(`${dryRun ? '[dry-run] ' : ''}✔ Updated ${relPath}`);
    } else {
      backupFile(dstPath, relPath, backupRoot);
      atomicWrite(`${dstPath}.aac-new`, srcBuf);
      console.log(`${dryRun ? '[dry-run] ' : ''}⚠️ Preserved user-modified ${relPath} (wrote incoming update to ${relPath}.aac-new)`);
    }
  }

  mergeHooks(path.join(packageRoot, '.agents', 'hooks.json'), path.join(targetDir, '.agents', 'hooks.json'), backupRoot);

  const dstContext = path.join(targetDir, 'CONTEXT.md');
  if (!fs.existsSync(dstContext)) {
    atomicWrite(dstContext, fs.readFileSync(path.join(packageRoot, 'CONTEXT.md')));
    console.log(`${dryRun ? '[dry-run] ' : ''}✔ Created CONTEXT.md`);
  } else {
    console.log('🔒 Preserved user-defined CONTEXT.md');
  }

  const scratchKeep = path.join(targetDir, '.scratch', '.gitkeep');
  if (!fs.existsSync(scratchKeep)) atomicWrite(scratchKeep, '# Ephemeral scratchpad\n');

  const gitignore = path.join(targetDir, '.gitignore');
  const existingIgnore = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, 'utf8') : '';
  if (!existingIgnore.includes('.scratch/*')) {
    atomicWrite(gitignore, `${existingIgnore.trimEnd()}\n\n# Antigravity Ephemeral State & Secrets\n.scratch/*\n!.scratch/.gitkeep\n.agents/mcp_config.json\n`.trimStart());
  }

  atomicWrite(manifestPath, JSON.stringify(nextManifest, null, 2) + '\n');
  if (withSidecar) configureSidecar();
  console.log(`✅ AAC v${VERSION} ${cmd} complete.`);
}

function runUninstall() {
  const manifestPath = path.join(targetDir, '.agents', '.aac-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ No .agents/.aac-manifest.json found in target directory.');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const [relPath, recordedHash] of Object.entries(manifest.files || {})) {
    const dstPath = path.join(targetDir, relPath);
    if (!fs.existsSync(dstPath)) continue;
    const currentHash = sha256(fs.readFileSync(dstPath));
    if (currentHash === recordedHash || force) {
      if (!dryRun) fs.rmSync(dstPath, { force: true });
      console.log(`${dryRun ? '[dry-run] ' : ''}🗑️ Removed ${relPath}`);
    } else {
      console.log(`⚠️ Kept user-modified ${relPath} (use --force to remove)`);
    }
  }
  if (!dryRun) fs.rmSync(manifestPath, { force: true });
  console.log('✅ Uninstall complete (CONTEXT.md and user modifications preserved).');
}

if (cmd === 'init' || cmd === 'upgrade') runInstallOrUpgrade();
else if (cmd === 'uninstall') runUninstall();
else {
  console.log(`AAC (Antigravity Agent Core) CLI v${VERSION}
Usage:
  npx @rafaelghif/aac-core init [--force] [--dry-run] [--with-sidecar --project-id <id>]
  npx @rafaelghif/aac-core upgrade [--force] [--dry-run] [--with-sidecar --project-id <id>]
  npx @rafaelghif/aac-core uninstall [--force] [--dry-run]`);
}
