#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`scan-repo.mjs - Multi-language repository reconnaissance for CONTEXT.md indexing.

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

const IGNORE_DIRS = new Set([
  '.git', 'node_modules', '.dart_tool', 'build', 'dist', '.next', '.nuxt',
  'target', 'vendor', '__pycache__', '.venv', 'venv', '.idea', '.scratch', 'coverage',
]);

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function walkDirs(dir, maxDepth = 3, depth = 0, out = []) {
  if (depth > maxDepth) return out;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(rootDir, full).replace(/\\/g, '/');
    out.push(rel);
    walkDirs(full, maxDepth, depth + 1, out);
  }
  return out;
}

function detectManifests() {
  const candidates = [
    'package.json', 'tsconfig.json', 'pubspec.yaml', 'analysis_options.yaml',
    'go.mod', 'Cargo.toml', 'pyproject.toml', 'requirements.txt',
    'build.gradle', 'build.gradle.kts', 'pom.xml', 'Package.swift', 'mix.exs',
  ];
  return candidates.filter((f) => fs.existsSync(path.join(rootDir, f)));
}

function extractCommandsAndStacks(manifests) {
  const stacks = [];
  const commands = { test: [], analyze: [], lint: [], build: [] };
  const dependencies = [];

  if (manifests.includes('package.json')) {
    const raw = readSafe(path.join(rootDir, 'package.json'));
    try {
      const pkg = JSON.parse(raw || '{}');
      const pm = fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml')) ? 'pnpm'
        : fs.existsSync(path.join(rootDir, 'yarn.lock')) ? 'yarn'
        : (fs.existsSync(path.join(rootDir, 'bun.lockb')) || fs.existsSync(path.join(rootDir, 'bun.lock'))) ? 'bun'
        : 'npm';
      stacks.push(`Node/JS (${pm})`);
      const s = pkg.scripts || {};
      if (s.test && !s.test.includes('no test specified')) commands.test.push(`${pm} test`);
      if (s.typecheck) commands.analyze.push(`${pm} run typecheck`);
      if (s.lint) commands.lint.push(`${pm} run lint`);
      if (s.build) commands.build.push(`${pm} run build`);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const [k, v] of Object.entries(deps)) dependencies.push(`${k}@${v}`);
    } catch { /* ignore invalid json */ }
  }

  if (manifests.includes('pubspec.yaml')) {
    const pub = readSafe(path.join(rootDir, 'pubspec.yaml')) || '';
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

const manifests = detectManifests();
const { stacks, commands, dependencies } = extractCommandsAndStacks(manifests);
const dirs = walkDirs(rootDir, 3);
const buckets = classifyDirs(dirs);

const report = {
  rootDir,
  manifests,
  stacks,
  commands,
  dependencies,
  directoryBuckets: buckets,
  topLevelDirs: dirs.filter((d) => !d.includes('/')),
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`# Repo Scan Summary (${path.basename(rootDir)})`);
console.log(`- **Stacks**: ${stacks.join(', ') || 'Unknown / inspect manually'}`);
console.log(`- **Manifests**: ${manifests.join(', ') || 'None detected at root'}`);
console.log(`- **Test Commands**: ${commands.test.join(' | ') || 'None detected'}`);
console.log(`- **Analyze/Typecheck**: ${commands.analyze.join(' | ') || 'None detected'}`);
console.log(`- **Lint / Build**: ${[...commands.lint, ...commands.build].join(' | ') || 'None detected'}`);
console.log(`- **UI / Widget Dirs**: ${buckets.ui.join(', ') || 'None detected'}`);
console.log(`- **Shared / Utils / State Dirs**: ${buckets.shared.join(', ') || 'None detected'}`);
console.log(`- **Config / Data / API Dirs**: ${[...buckets.config, ...buckets.data].join(', ') || 'None detected'}`);
console.log(`- **Feature / Module Dirs**: ${buckets.features.join(', ') || 'None detected'}`);
console.log(`- **Test Dirs**: ${buckets.tests.join(', ') || 'None detected'}`);
if (dependencies.length) {
  console.log(`- **Key Dependencies (sample)**: ${dependencies.join(', ')}`);
}
