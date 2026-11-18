#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`scan-repo.mjs - Multi-language & monorepo reconnaissance for CONTEXT.md indexing.

Usage:
  node .agents/skills/index-project/scripts/scan-repo.mjs [--root <dir>] [--json]

Options:
  --root <dir>   Target workspace directory (defaults to current working directory)
  --json         Emit structured JSON instead of Markdown summary
  --help, -h     Show this help message`);
  process.exit(0);
}

let rootDir = process.cwd();
const asJson = args.includes('--json');
const rootIdx = args.indexOf('--root');
if (rootIdx !== -1 && args[rootIdx + 1]) rootDir = path.resolve(args[rootIdx + 1]);

if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
  console.error(`FAIL: Root directory not found: ${rootDir}`);
  process.exit(1);
}

const MAX_DEPTH = 5;
const MAX_WORKSPACES = 100;
const MAX_DIRS_VISITED = 5000;
const IGNORE_DIRS = new Set([
  '.git', 'node_modules', '.dart_tool', 'build', 'dist', '.next', '.nuxt',
  'target', 'vendor', '__pycache__', '.venv', 'venv', '.idea', '.scratch', 'coverage',
]);

const MANIFEST_CANDIDATES = [
  'package.json', 'tsconfig.json', 'pubspec.yaml', 'analysis_options.yaml',
  'go.mod', 'Cargo.toml', 'pyproject.toml', 'requirements.txt',
  'build.gradle', 'build.gradle.kts', 'pom.xml', 'Package.swift', 'mix.exs',
];

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function walkTree(dir, depth = 0, state = { dirs: [], fileCount: 0, truncated: false }) {
  if (depth > MAX_DEPTH || state.dirs.length >= MAX_DIRS_VISITED) {
    state.truncated = true;
    return state;
  }
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return state;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (state.dirs.length >= MAX_DIRS_VISITED) {
        state.truncated = true;
        break;
      }
      const full = path.join(dir, entry.name);
      const rel = path.relative(rootDir, full).replace(/\\/g, '/');
      state.dirs.push(rel);
      walkTree(full, depth + 1, state);
    } else {
      state.fileCount += 1;
    }
  }
  return state;
}

function detectManifests(dirPath) {
  return MANIFEST_CANDIDATES.filter((f) => fs.existsSync(path.join(dirPath, f)));
}

function detectNodePackageManager(dirPath) {
  for (const dir of [dirPath, rootDir]) {
    if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(dir, 'bun.lockb')) || fs.existsSync(path.join(dir, 'bun.lock'))) return 'bun';
  }
  return 'npm';
}

function extractCommandsAndStacks(manifests, dirPath) {
  const stacks = [];
  const commands = { test: [], analyze: [], lint: [], build: [] };
  const dependencies = [];

  if (manifests.includes('package.json')) {
    const raw = readSafe(path.join(dirPath, 'package.json'));
    try {
      const pkg = JSON.parse(raw || '{}');
      const pm = detectNodePackageManager(dirPath);
      stacks.push(`Node/JS (${pm})`);
      const s = pkg.scripts || {};
      const runPrefix = pm === 'npm' ? 'npm run' : pm;
      if (s.test && !s.test.includes('no test specified')) commands.test.push(`${pm} test`);
      if (s.typecheck) commands.analyze.push(`${runPrefix} typecheck`);
      if (s.lint) commands.lint.push(`${runPrefix} lint`);
      if (s.build) commands.build.push(`${runPrefix} build`);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const [k, v] of Object.entries(deps)) dependencies.push(`${k}@${v}`);
    } catch { /* ignore invalid json */ }
  }

  if (manifests.includes('pubspec.yaml')) {
    const pub = readSafe(path.join(dirPath, 'pubspec.yaml')) || '';
    const isFlutter = /\bflutter:\s*$/m.test(pub) || /sdk:\s*flutter/i.test(pub);
    stacks.push(isFlutter ? 'Dart / Flutter' : 'Dart');
    commands.test.push(isFlutter ? 'flutter test' : 'dart test');
    commands.analyze.push(isFlutter ? 'flutter analyze' : 'dart analyze');
    if (isFlutter) commands.build.push('flutter build <target>');
    for (const m of pub.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*([^\n#]+)/gm)) {
      if (!['sdk', 'flutter', 'flutter_test'].includes(m[1])) {
        dependencies.push(`${m[1]}:${m[2].trim()}`);
      }
    }
  }

  if (manifests.includes('go.mod')) {
    stacks.push('Go');
    commands.test.push('go test ./...');
    commands.analyze.push('go vet ./...');
    commands.build.push('go build ./...');
  }
  if (manifests.includes('Cargo.toml')) {
    stacks.push('Rust');
    commands.test.push('cargo test');
    commands.lint.push('cargo clippy');
    commands.build.push('cargo build');
  }
  if (manifests.includes('pyproject.toml') || manifests.includes('requirements.txt')) {
    stacks.push('Python');
    commands.test.push('pytest');
  }
  if (manifests.includes('Package.swift')) {
    stacks.push('Swift');
    commands.test.push('swift test');
    commands.build.push('swift build');
  }
  if (manifests.includes('build.gradle') || manifests.includes('build.gradle.kts')) {
    stacks.push('JVM / Gradle');
    commands.test.push('./gradlew test');
  }
  if (manifests.includes('mix.exs')) {
    stacks.push('Elixir');
    commands.test.push('mix test');
  }

  return { stacks, commands, dependencies: dependencies.slice(0, 40) };
}

function classifyDirs(dirs) {
  const buckets = { ui: [], shared: [], config: [], data: [], tests: [], features: [] };
  for (const d of dirs) {
    const lower = d.toLowerCase();
    if (/(?:^|\/)(?:components|widgets|ui|screens|pages|views|theme|styles|design[-_]system)(?:\/|$)/.test(lower)) buckets.ui.push(d);
    if (/(?:^|\/)(?:shared|common|core|lib|utils|helpers|hooks|providers|bloc|state)(?:\/|$)/.test(lower)) buckets.shared.push(d);
    if (/(?:^|\/)(?:config|env|settings|constants)(?:\/|$)/.test(lower)) buckets.config.push(d);
    if (/(?:^|\/)(?:api|services|repositories|models|schemas|dto|data|db|migrations|prisma|drizzle)(?:\/|$)/.test(lower)) buckets.data.push(d);
    if (/(?:^|\/)(?:test|tests|__tests__|integration_test|e2e|spec)(?:\/|$)/.test(lower)) buckets.tests.push(d);
    if (/(?:^|\/)(?:features|modules|domains|app)(?:\/|$)/.test(lower)) buckets.features.push(d);
  }
  return buckets;
}

const uniq = (arr) => [...new Set(arr)];
const tree = walkTree(rootDir);
const rootManifests = detectManifests(rootDir);
const rootInfo = extractCommandsAndStacks(rootManifests, rootDir);

const workspaces = [];
if (rootManifests.length) {
  workspaces.push({ path: '.', manifests: rootManifests, stacks: rootInfo.stacks, commands: rootInfo.commands });
}
for (const relDir of tree.dirs) {
  if (workspaces.length >= MAX_WORKSPACES) {
    tree.truncated = true;
    break;
  }
  const absDir = path.join(rootDir, relDir);
  const subManifests = detectManifests(absDir);
  if (!subManifests.length) continue;
  const subInfo = extractCommandsAndStacks(subManifests, absDir);
  workspaces.push({ path: relDir, manifests: subManifests, stacks: subInfo.stacks, commands: subInfo.commands });
}

const allStacks = uniq([...rootInfo.stacks, ...workspaces.flatMap((w) => w.stacks)]);
const allCommands = {
  test: uniq([...rootInfo.commands.test, ...workspaces.flatMap((w) => w.commands.test)]),
  analyze: uniq([...rootInfo.commands.analyze, ...workspaces.flatMap((w) => w.commands.analyze)]),
  lint: uniq([...rootInfo.commands.lint, ...workspaces.flatMap((w) => w.commands.lint)]),
  build: uniq([...rootInfo.commands.build, ...workspaces.flatMap((w) => w.commands.build)]),
};
const buckets = classifyDirs(tree.dirs);
const layoutMode = workspaces.length > 1 || tree.fileCount > 100 ? 'hub-and-spoke' : 'single-context';

const report = {
  rootDir,
  manifests: rootManifests,
  workspaces,
  layoutMode,
  truncated: tree.truncated,
  stacks: allStacks,
  commands: allCommands,
  dependencies: rootInfo.dependencies,
  directoryBuckets: buckets,
  topLevelDirs: tree.dirs.filter((d) => !d.includes('/')),
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`# Repo Scan Summary (${path.basename(rootDir)})`);
console.log(`- **Layout Mode**: ${layoutMode}`);
console.log(`- **Stacks**: ${allStacks.join(', ') || 'Unknown / inspect manually'}`);
console.log(`- **Root Manifests**: ${rootManifests.join(', ') || 'None detected at root'}`);
console.log(`- **Workspaces (${workspaces.length})**: ${workspaces.map((w) => w.path).join(', ') || 'None'}`);
console.log(`- **Test Commands**: ${allCommands.test.join(' | ') || 'None detected'}`);
console.log(`- **Analyze/Typecheck**: ${allCommands.analyze.join(' | ') || 'None detected'}`);
console.log(`- **Lint / Build**: ${[...allCommands.lint, ...allCommands.build].join(' | ') || 'None detected'}`);
console.log(`- **UI / Widget Dirs**: ${buckets.ui.join(', ') || 'None detected'}`);
console.log(`- **Shared / Utils / State Dirs**: ${buckets.shared.join(', ') || 'None detected'}`);
console.log(`- **Config / Data / API Dirs**: ${[...buckets.config, ...buckets.data].join(', ') || 'None detected'}`);
console.log(`- **Feature / Module Dirs**: ${buckets.features.join(', ') || 'None detected'}`);
console.log(`- **Test Dirs**: ${buckets.tests.join(', ') || 'None detected'}`);
if (rootInfo.dependencies.length) {
  console.log(`- **Key Dependencies (sample)**: ${rootInfo.dependencies.join(', ')}`);
}
